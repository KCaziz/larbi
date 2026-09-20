import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ACCOUNT_TYPES } from '../constants/accountTypes.js';
import { bodyToText } from './article.service.js';
import { CERTIFICATE_NUMBER_PATTERN } from './certificate.service.js';
import { sanitizeRichText } from './sanitize.service.js';

// Global consistency check: rules that must hold across the WHOLE data set (database
// AND stored files), whatever code path wrote it. The database constraints already
// forbid many inconsistencies (CHECK, foreign keys); these are the rules SQL cannot
// express, plus the link between database rows and files on disk.
//
// Read-only. Returns a list of violations ({ rule, detail }): empty = consistent.
// Used by the automated tests and by `npm run check:consistency` on a real database.

const violation = (rule, detail) => ({ rule, detail });

export async function checkConsistency(prisma, { privateDir }) {
  const problems = [];
  const add = (rule, rows, describe) => rows.forEach((row) => problems.push(violation(rule, describe(row))));

  // ---- files <-> rows ------------------------------------------------------
  const media = await prisma.media.findMany({
    select: { id: true, storageKey: true, courseId: true, articleId: true, coverOf: { select: { id: true } }, articleCoverOf: { select: { id: true } } },
  });

  add('every file has an owner', media.filter((m) => !m.courseId && !m.articleId && !m.coverOf && !m.articleCoverOf), (m) => `media ${m.id} belongs to nothing`);

  const onDisk = new Set(existsSync(privateDir) ? readdirSync(privateDir) : []);
  const inDb = new Set(media.map((m) => m.storageKey));
  add('every media row has its file on disk', media.filter((m) => !onDisk.has(m.storageKey)), (m) => `media ${m.id}: file ${m.storageKey} is missing`);
  add('every stored file is referenced by a media row', [...onDisk].filter((f) => !inDb.has(f)), (f) => `orphan file ${f}`);

  // ---- learning -------------------------------------------------------------
  // A completed enrolment has all its required courses done — except courses added AFTER it was
  // completed (the learner keeps what they earned, see TASKS.md P2-04).
  const incomplete = await prisma.$queryRaw`
    SELECT e.id AS "enrollmentId", c.id AS "courseId"
    FROM enrollments e
    JOIN courses c ON c."formationId" = e."formationId" AND c."isRequired"
    WHERE e.status = 'completed'
      AND c."createdAt" <= e."completedAt"
      AND NOT EXISTS (
        SELECT 1 FROM course_progress p
        WHERE p."enrollmentId" = e.id AND p."courseId" = c.id AND p.status = 'completed')`;
  add('a completed enrolment has every required course completed', incomplete, (r) => `enrolment ${r.enrollmentId} lacks required course ${r.courseId}`);

  const uncertified = await prisma.$queryRaw`
    SELECT ce.id, ce."certificateNumber" FROM certifications ce
    JOIN enrollments e ON e.id = ce."enrollmentId" WHERE e.status <> 'completed'`;
  add('a certificate exists only for a completed enrolment', uncertified, (r) => `certificate ${r.certificateNumber}`);

  const certificates = await prisma.certification.findMany({ select: { certificateNumber: true, holderName: true, formationTitle: true } });
  add('certificate numbers are well formed', certificates.filter((c) => !CERTIFICATE_NUMBER_PATTERN.test(c.certificateNumber)), (c) => `bad number ${c.certificateNumber}`);
  add('a certificate carries its holder and formation names', certificates.filter((c) => !c.holderName.trim() || !c.formationTitle.trim()), (c) => `certificate ${c.certificateNumber} has an empty name`);

  const gaps = await prisma.$queryRaw`
    SELECT "formationId", count(*)::int AS n, max(position)::int AS max, count(DISTINCT position)::int AS distinct_positions
    FROM courses GROUP BY "formationId"
    HAVING max(position) <> count(*) - 1 OR count(DISTINCT position) <> count(*)`;
  add('the courses of a formation are numbered 0..n-1 without gap or duplicate', gaps, (r) => `formation ${r.formationId}: ${r.n} courses, positions up to ${r.max}`);

  // ---- publication ----------------------------------------------------------
  for (const [table, label] of [['formations', 'formation'], ['articles', 'article']]) {
    const rows = await prisma.$queryRawUnsafe(`SELECT id FROM ${table} WHERE "publishedAt" IS NOT NULL AND ("publishedAt" < "createdAt" OR "publishedAt" > now() + interval '1 minute')`);
    add(`a published ${label} has a publication date between its creation and now`, rows, (r) => `${label} ${r.id}`);
    const later = await prisma.$queryRawUnsafe(`SELECT id FROM ${table} WHERE "updatedAt" < "createdAt"`);
    add(`a ${label} is never updated before it was created`, later, (r) => `${label} ${r.id}`);
  }

  // ---- stored text ----------------------------------------------------------
  // What is stored must already be clean (sanitising it again changes nothing), and the plain-text
  // copy of an article must match its body: a mismatch means some code path wrote one without the other.
  const articles = await prisma.article.findMany({ select: { id: true, body: true, bodyText: true, excerpt: true, targetAccountTypes: true } });
  const knownTypes = new Set(ACCOUNT_TYPES.map((t) => t.value));
  for (const a of articles) {
    if ((a.targetAccountTypes ?? []).some((type) => !knownTypes.has(type))) problems.push(violation('article target account types are known account types', `article ${a.id}`));
    if (a.body !== null && sanitizeRichText(a.body) !== a.body) problems.push(violation('stored article HTML is already sanitised', `article ${a.id}`));
    if ((a.body ? bodyToText(a.body) : '') !== a.bodyText) problems.push(violation('article plain text matches its body', `article ${a.id}`));
  }
  const courses = await prisma.course.findMany({ select: { id: true, body: true } });
  for (const c of courses) {
    if (c.body !== null && sanitizeRichText(c.body) !== c.body) problems.push(violation('stored lesson HTML is already sanitised', `course ${c.id}`));
  }

  // ---- accounts -------------------------------------------------------------
  const emails = await prisma.$queryRaw`SELECT id FROM users WHERE email <> lower(btrim(email))`;
  add('e-mail addresses are stored lower-case and trimmed', emails, (r) => `user ${r.id}`);

  return problems;
}

export const privateDirOf = (storageDir) => path.join(storageDir, 'private');
