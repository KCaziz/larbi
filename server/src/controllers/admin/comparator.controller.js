import { prisma } from '../../config/prisma.js';
import { themeByKey } from '../../constants/comparator.js';
import { sortConditions, toAdminCondition, toThemeInfo } from '../../serializers/comparator.js';
import { cleanValues } from '../../services/comparator.service.js';
import { HttpError } from '../../utils/httpError.js';

// Administration of the bank comparator (P4-08): banks and their conditions,
// rubric by rubric. Every write moves the public "données mises à jour le" date
// in the same transaction, deletions included.

const BANK = { bank: { select: { id: true, name: true } } };
const touch = (tx) =>
  tx.comparatorMeta.upsert({ where: { id: 1 }, create: { id: 1, dataUpdatedAt: new Date() }, update: { dataUpdatedAt: new Date() } });

const byName = (a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });

// Two banks whose names only differ by case would look like a duplicate to a visitor.
async function assertNameFree(name, exceptId = null) {
  const clash = await prisma.comparatorBank.findFirst({
    // No `mode: 'insensitive'` (PostgreSQL only): MySQL/MariaDB's default
    // collation (utf8mb4_unicode_ci) already compares case-insensitively.
    where: { name: { equals: name }, ...(exceptId ? { id: { not: exceptId } } : {}) },
    select: { id: true },
  });
  if (clash) throw new HttpError(409, 'A bank with this name already exists');
}

export async function listBanks(req, res) {
  const banks = await prisma.comparatorBank.findMany({ include: { _count: { select: { conditions: true } } } });
  res.json({ banks: banks.sort(byName).map((b) => ({ id: b.id, name: b.name, conditionCount: b._count.conditions })) });
}

export async function createBank(req, res) {
  await assertNameFree(req.body.name);
  const bank = await prisma.$transaction(async (tx) => {
    const created = await tx.comparatorBank.create({ data: { name: req.body.name } });
    await touch(tx);
    return created;
  });
  res.status(201).json({ bank: { id: bank.id, name: bank.name, conditionCount: 0 } });
}

export async function renameBank(req, res) {
  await assertNameFree(req.body.name, req.params.id);
  const bank = await prisma.$transaction(async (tx) => {
    const updated = await tx.comparatorBank.update({ where: { id: req.params.id }, data: { name: req.body.name }, include: { _count: { select: { conditions: true } } } });
    await touch(tx);
    return updated;
  });
  res.json({ bank: { id: bank.id, name: bank.name, conditionCount: bank._count.conditions } });
}

// Removes the bank and all its conditions (the interface asks for confirmation first).
export async function deleteBank(req, res) {
  await prisma.$transaction(async (tx) => {
    await tx.comparatorBank.delete({ where: { id: req.params.id } });
    await touch(tx);
  });
  res.status(204).end();
}

export async function listConditions(req, res) {
  const theme = themeByKey(req.query.theme);
  const [rows, banks] = await Promise.all([
    prisma.comparatorCondition.findMany({ where: { theme: theme.key }, include: BANK }),
    prisma.comparatorBank.findMany({ select: { id: true, name: true } }),
  ]);
  res.json({ theme: toThemeInfo(theme), conditions: sortConditions(rows).map(toAdminCondition), banks: banks.sort(byName) });
}

// What the rubric allows: its own columns only, a category only where it has one,
// an existing bank. Returns the data to write.
async function checkedData(theme, body) {
  const data = {};
  if (body.bankId !== undefined) {
    const bank = await prisma.comparatorBank.findUnique({ where: { id: body.bankId }, select: { id: true } });
    if (!bank) throw new HttpError(400, 'Unknown bank');
    data.bankId = body.bankId;
  }
  if (body.segment !== undefined) data.segment = body.segment;
  if (body.label !== undefined) data.label = body.label;
  if (body.category !== undefined) {
    if (body.category !== null && !theme.category) throw new HttpError(400, 'This rubric has no category');
    data.category = body.category;
  }
  if (body.values !== undefined) {
    const { values, unknown } = cleanValues(theme.key, body.values);
    if (unknown.length) throw new HttpError(400, 'Unknown field for this rubric', { fields: unknown });
    data.values = values;
  }
  return data;
}

export async function createCondition(req, res) {
  const theme = themeByKey(req.body.theme);
  const data = await checkedData(theme, req.body);
  const created = await prisma.$transaction(async (tx) => {
    const last = await tx.comparatorCondition.aggregate({ where: { theme: theme.key }, _max: { position: true } });
    const row = await tx.comparatorCondition.create({
      data: { theme: theme.key, segment: 'non_precise', values: {}, ...data, position: (last._max.position ?? -1) + 1 },
      include: BANK,
    });
    await touch(tx);
    return row;
  });
  res.status(201).json({ condition: toAdminCondition(created) });
}

export async function updateCondition(req, res) {
  const existing = await prisma.comparatorCondition.findUnique({ where: { id: req.params.id }, select: { theme: true } });
  if (!existing) throw new HttpError(404, 'Not found');
  const data = await checkedData(themeByKey(existing.theme), req.body);
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.comparatorCondition.update({ where: { id: req.params.id }, data, include: BANK });
    await touch(tx);
    return row;
  });
  res.json({ condition: toAdminCondition(updated) });
}

export async function deleteCondition(req, res) {
  await prisma.$transaction(async (tx) => {
    await tx.comparatorCondition.delete({ where: { id: req.params.id } });
    await touch(tx);
  });
  res.status(204).end();
}
