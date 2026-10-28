#!/usr/bin/env node
// Writes the migration that retires the old income and expense categories the
// client's 125 replace (answer D4, 2026-10-28), from RETIRED_CATEGORIES in
// src/constants/finCategories.js — generated, never retyped, like the other
// category migrations.
//
// For each retired category: the rows that point at it move to its
// replacement, each move of a movement, a resource or an envelope is
// journalled (« historique conservé mais remappé »), then the old category is
// archived — still readable, never offered again.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RETIRED_CATEGORIES } from '../src/constants/finCategories.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '..', 'prisma', 'migrations', '20261028130000_fin_categories_retired');
const REASON = 'Référentiel des 125 catégories du client (réponse D4 du 2026-10-28)';

const id = (key) => `(SELECT \`id\` FROM \`fin_categories\` WHERE \`key\` = '${key}' AND \`userId\` IS NULL)`;
// The rows whose move is journalled, with the entity name the journal uses.
const JOURNALLED = [
  ['fin_transactions', 'transaction'],
  ['fin_incomes', 'income'],
];
// A budget never has two envelopes on one category (the service refuses it):
// an envelope moves only if its budget has none on the replacement yet;
// otherwise it stays on the archived category, still readable.
const envelopeFree = (to) =>
  `NOT EXISTS (SELECT 1 FROM (SELECT \`budgetId\` FROM \`fin_envelopes\` WHERE \`categoryId\` = ${id(to)} AND \`deletedAt\` IS NULL) AS \`taken\` WHERE \`taken\`.\`budgetId\` = \`e\`.\`budgetId\`)`;
const MOVED = [
  ['fin_transactions', 'categoryId'],
  ['fin_incomes', 'categoryId'],
  ['fin_recurrences', 'categoryId'],
  ['fin_provisions', 'categoryId'],
  ['fin_assets', 'categoryId'],
  ['fin_shared_expenses', 'categoryId'],
  ['fin_tags', 'autoCategoryId'],
];

const lines = [
  '-- GÉNÉRÉ par scripts/generate-retired-categories.js depuis RETIRED_CATEGORIES',
  '-- (src/constants/finCategories.js). Ne pas modifier à la main.',
  '--',
  "-- The client's answer D4 (2026-10-28): the 125 categories replace the 91. The",
  '-- old income and expense categories none of them absorbed are retired: their',
  '-- rows move to their replacement (journalled), then they are archived.',
  '',
];
for (const [from, to] of Object.entries(RETIRED_CATEGORIES)) {
  lines.push(`-- ${from} -> ${to}`);
  for (const [table, entity] of JOURNALLED) {
    lines.push(
      `INSERT INTO \`fin_changes\` (\`id\`, \`userId\`, \`entity\`, \`entityId\`, \`action\`, \`field\`, \`before\`, \`after\`, \`reason\`, \`createdAt\`) SELECT UUID(), \`userId\`, '${entity}', \`id\`, 'correct', 'categoryId', JSON_QUOTE(\`categoryId\`), JSON_QUOTE(${id(to)}), '${REASON}', NOW(3) FROM \`${table}\` WHERE \`categoryId\` = ${id(from)};`,
    );
  }
  lines.push(
    `INSERT INTO \`fin_changes\` (\`id\`, \`userId\`, \`entity\`, \`entityId\`, \`action\`, \`field\`, \`before\`, \`after\`, \`reason\`, \`createdAt\`) SELECT UUID(), \`e\`.\`userId\`, 'envelope', \`e\`.\`id\`, 'correct', 'categoryId', JSON_QUOTE(\`e\`.\`categoryId\`), JSON_QUOTE(${id(to)}), '${REASON}', NOW(3) FROM \`fin_envelopes\` AS \`e\` WHERE \`e\`.\`categoryId\` = ${id(from)} AND ${envelopeFree(to)};`,
  );
  lines.push(`UPDATE \`fin_envelopes\` AS \`e\` SET \`e\`.\`categoryId\` = ${id(to)} WHERE \`e\`.\`categoryId\` = ${id(from)} AND ${envelopeFree(to)};`);
  for (const [table, column] of MOVED) {
    lines.push(`UPDATE \`${table}\` SET \`${column}\` = ${id(to)} WHERE \`${column}\` = ${id(from)};`);
  }
  lines.push('');
}
// One statement, replayable on its own: tests/helpers/server.js puts the
// reference back after each reset by replaying the category statements.
const keys = Object.keys(RETIRED_CATEGORIES).map((key) => `'${key}'`).join(', ');
lines.push(`UPDATE \`fin_categories\` SET \`archivedAt\` = NOW(3) WHERE \`userId\` IS NULL AND \`key\` IN (${keys});`);

mkdirSync(DIR, { recursive: true });
writeFileSync(path.join(DIR, 'migration.sql'), `${lines.join('\n')}\n`, 'utf8');
console.log(`${Object.keys(RETIRED_CATEGORIES).length} catégories retirées -> ${path.relative(process.cwd(), DIR)}`);
