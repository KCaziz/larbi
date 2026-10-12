import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { isQuizComplete } from './quiz.service.js';
import { MEDIA_BLOCK_KIND, isMediaBlock, validateBlockData } from './blocks.service.js';
import { bodyToText } from './article.service.js';
import { CERTIFICATE_NUMBER_PATTERN } from './certificate.service.js';
import { sanitizeRichText } from './sanitize.service.js';
import { themeByKey } from '../constants/comparator.js';
import { CATEGORY_FAMILY_CODES, STANDARD_CATEGORIES } from '../constants/finCategories.js';
import { CHANGE_ACTIONS, FINANCIAL_TABLES } from '../constants/finData.js';
import { checkFinancialRow } from './finance/dataModel.js';

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
  // Was a PostgreSQL CHECK (media_owner_check); MariaDB refuses a CHECK that references a
  // FOREIGN KEY column, which courseId and articleId both are (see the integrity_checks migration).
  add('a file belongs to at most one lesson OR one article, never both', media.filter((m) => m.courseId && m.articleId), (m) => `media ${m.id}`);

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
    SELECT "formationId", count(*) AS n, max(position) AS maxPosition, count(DISTINCT position) AS distinctPositions
    FROM courses GROUP BY "formationId"
    HAVING max(position) <> count(*) - 1 OR count(DISTINCT position) <> count(*)`;
  add('the courses of a formation are numbered 0..n-1 without gap or duplicate', gaps, (r) => `formation ${r.formationId}: ${r.n} courses, positions up to ${r.maxPosition}`);

  // ---- publication ----------------------------------------------------------
  for (const [table, label] of [['formations', 'formation'], ['articles', 'article']]) {
    const rows = await prisma.$queryRawUnsafe(`SELECT id FROM ${table} WHERE "publishedAt" IS NOT NULL AND ("publishedAt" < "createdAt" OR "publishedAt" > now() + interval 1 minute)`);
    add(`a published ${label} has a publication date between its creation and now`, rows, (r) => `${label} ${r.id}`);
    const later = await prisma.$queryRawUnsafe(`SELECT id FROM ${table} WHERE "updatedAt" < "createdAt"`);
    add(`a ${label} is never updated before it was created`, later, (r) => `${label} ${r.id}`);
  }

  // ---- stored text ----------------------------------------------------------
  // What is stored must already be clean (sanitising it again changes nothing), and the plain-text
  // copy of an article must match its body: a mismatch means some code path wrote one without the other.
  const articles = await prisma.article.findMany({ select: { id: true, language: true, body: true, bodyText: true, excerpt: true, targetAccountTypes: true, translations: { select: { language: true, body: true, bodyText: true } } } });
  // Account categories (P3-15) are an admin-managed table now, not a fixed list:
  // "known" means it exists at all (active or not — deactivating one must not
  // retroactively make an article that targets it "inconsistent").
  const knownTypes = new Set((await prisma.accountType.findMany({ select: { slug: true } })).map((t) => t.slug));
  for (const a of articles) {
    if ((a.targetAccountTypes ?? []).some((type) => !knownTypes.has(type))) problems.push(violation('article target account types are known account types', `article ${a.id}`));
    if (a.body !== null && sanitizeRichText(a.body) !== a.body) problems.push(violation('stored article HTML is already sanitised', `article ${a.id}`));
    if ((a.body ? bodyToText(a.body) : '') !== a.bodyText) problems.push(violation('article plain text matches its body', `article ${a.id}`));
    for (const tr of a.translations) {
      if (tr.language === a.language) problems.push(violation('an article is never translated into its own language', `article ${a.id}: ${tr.language}`));
      if (tr.body === null || sanitizeRichText(tr.body) !== tr.body || bodyToText(tr.body) !== tr.bodyText) problems.push(violation('a translation is sanitised HTML whose plain text matches', `article ${a.id}: ${tr.language}`));
    }
  }

  const usersAccountTypes = await prisma.user.findMany({ select: { id: true, accountType: true } });
  add('a user account type is a known account type', usersAccountTypes.filter((u) => !knownTypes.has(u.accountType)), (u) => `user ${u.id}: ${u.accountType}`);
  const courses = await prisma.course.findMany({ select: { id: true, body: true } });
  for (const c of courses) {
    if (c.body !== null && sanitizeRichText(c.body) !== c.body) problems.push(violation('stored lesson HTML is already sanitised', `course ${c.id}`));
  }

  // ---- chapters ---------------------------------------------------------------
  // Every lesson sits in a chapter, and the global order of the lessons follows the order of
  // the chapters (the learner pages read that global order).
  const lonely = await prisma.$queryRaw`SELECT c.id FROM courses c WHERE c."sectionId" IS NULL`;
  add('every lesson belongs to a chapter', lonely, (r) => `course ${r.id} has no chapter`);
  const interleaved = await prisma.$queryRaw`
    SELECT a.id FROM courses a
    JOIN sections sa ON sa.id = a."sectionId"
    JOIN courses b ON b."formationId" = a."formationId" AND b.id <> a.id
    JOIN sections sb ON sb.id = b."sectionId"
    WHERE sa.position < sb.position AND a.position > b.position`;
  add('lessons are ordered chapter by chapter', interleaved, (r) => `course ${r.id} is out of order`);

  // ---- lesson blocks --------------------------------------------------------------
  // Positions are 0..n-1 without gap; the content of every block is valid for its type and
  // already clean (what the server would store); a file block shows a file of the right kind.
  const blockGaps = await prisma.$queryRaw`
    SELECT "courseId" FROM lesson_blocks GROUP BY "courseId"
    HAVING min("position") <> 0 OR max("position") <> count(*) - 1 OR count(DISTINCT "position") <> count(*)`;
  add('blocks are numbered 0..n-1 in each lesson', blockGaps, (r) => `course ${r.courseId}`);
  const blocks = await prisma.lessonBlock.findMany({ include: { media: { select: { kind: true, courseId: true } } } });
  for (const block of blocks) {
    let clean;
    try {
      clean = validateBlockData(block.type, block.data);
    } catch {
      clean = null;
    }
    // (The database may reorder JSON object keys: compare the content, not the order.)
    if (!isDeepStrictEqual(clean, block.data)) problems.push(violation('block content is valid and already clean', `block ${block.id} (${block.type})`));
    if (block.media && block.media.kind !== MEDIA_BLOCK_KIND[block.type]) problems.push(violation('a file block shows a file of the right kind', `block ${block.id}`));
    // Was a PostgreSQL CHECK (lesson_blocks_media_check); MariaDB refuses a CHECK that
    // references a FOREIGN KEY column, which mediaId is (see the integrity_checks migration).
    if (isMediaBlock(block.type) !== Boolean(block.media)) problems.push(violation('an image/video/file block shows a file, and no other block does', `block ${block.id} (${block.type})`));
  }

  // ---- quizzes --------------------------------------------------------------------
  // `isComplete` is denormalised: it must always say what the questions say (a complete quiz is
  // served to learners and a complete REQUIRED one blocks the end of the formation).
  const quizzes = await prisma.quiz.findMany({ include: { questions: { include: { choices: true } } } });
  add('a quiz says whether it is complete (isComplete)', quizzes.filter((q) => q.isComplete !== isQuizComplete(q)), (q) => `quiz ${q.id}`);
  // Was a PostgreSQL CHECK (quizzes_target_check); MariaDB refuses a CHECK that references a
  // FOREIGN KEY column, which courseId, sectionId, finalFormationId and formationId all are
  // (see the integrity_checks migration). The target must match the scope: a lesson, a
  // chapter, or (final quiz) the formation itself.
  const wrongTarget = quizzes.filter((q) => {
    if (q.scope === 'course') return !(q.courseId && !q.sectionId && !q.finalFormationId);
    if (q.scope === 'section') return !(!q.courseId && q.sectionId && !q.finalFormationId);
    return !(!q.courseId && !q.sectionId && q.finalFormationId && q.finalFormationId === q.formationId);
  });
  add('a quiz targets a lesson, a chapter, or (final quiz) the formation itself, matching its scope', wrongTarget, (q) => `quiz ${q.id}`);
  // Question positions are 0..n-1, and a graded attempt has one answer per question it was graded on.
  for (const quiz of quizzes) {
    const positions = quiz.questions.map((q) => q.position).sort((a, b) => a - b);
    if (positions.some((position, index) => position !== index)) problems.push(violation('questions are numbered 0..n-1 in each quiz', `quiz ${quiz.id}`));
  }

  // ---- accounts -------------------------------------------------------------
  // BINARY forces a byte-wise (case-sensitive) comparison: the default collation is
  // case-insensitive, under which 'User@x.com' and 'user@x.com' compare equal.
  const emails = await prisma.$queryRaw`SELECT id FROM users WHERE BINARY email <> BINARY lower(trim(email))`;
  add('e-mail addresses are stored lower-case and trimmed', emails, (r) => `user ${r.id}`);

  // ---- bank comparator (P4-06) ----------------------------------------------------
  // The values of a condition are texts, and only the columns of its own rubric; a
  // category only where the rubric has one (CHECK already covers rubric and segment).
  const conditions = await prisma.comparatorCondition.findMany({ select: { id: true, theme: true, category: true, values: true } });
  for (const c of conditions) {
    const theme = themeByKey(c.theme);
    const values = c.values && typeof c.values === 'object' && !Array.isArray(c.values) ? c.values : null;
    if (!values || Object.entries(values).some(([key, value]) => !theme?.fields.includes(key) || typeof value !== 'string' || value.trim() === '')) {
      problems.push(violation("a comparator condition only holds non-empty texts for its rubric's own columns", `condition ${c.id}`));
    }
    if (c.category !== null && !theme?.category) problems.push(violation('a comparator condition has a category only in a rubric that has one', `condition ${c.id}`));
  }
  const banksWithLookalike = await prisma.$queryRaw`SELECT a.id FROM comparator_banks a JOIN comparator_banks b ON a.id <> b.id AND lower(a.name) = lower(b.name)`;
  add('two comparator banks never share a name (whatever the case)', banksWithLookalike, (r) => `bank ${r.id}`);

  // ---- payment (P3-09) ------------------------------------------------------------
  // An order is paid only by an authentic provider notification, and a paid order
  // grants its access. (A paid order whose access an administrator removed by hand
  // shows up here on purpose: someone paid for something they no longer have.)
  const unpaidPaid = await prisma.$queryRaw`
    SELECT o.id FROM payment_orders o
    WHERE o.status IN ('paid', 'refunded')
      AND NOT EXISTS (SELECT 1 FROM payment_events e WHERE e.orderId = o.id AND e.type = 'payment.succeeded' AND e.outcome = 'applied')`;
  add('a paid order has the provider notification that paid it', unpaidPaid, (r) => `order ${r.id}`);
  const paidWithoutAccess = await prisma.$queryRaw`
    SELECT o.id FROM payment_orders o JOIN users u ON u.id = o.userId
    WHERE o.status = 'paid' AND u.accessLevel <> o.accessLevel`;
  add('a paid order grants its access', paidWithoutAccess, (r) => `order ${r.id}`);

  // ---- FINCLUDIA financial data model (P6-02) -------------------------------
  // The extended control the task asks for: a currency on every amount, a known
  // status, whole-number amounts, and no fictional line inside a real total.
  // It walks the SOCLE, table by table, so a financial table added by a later
  // task is checked the day it declares itself in FINANCIAL_TABLES.
  for (const { model, label, amounts } of FINANCIAL_TABLES) {
    const rows = await prisma[model].findMany();
    for (const row of rows) {
      for (const problem of checkFinancialRow(row, { amounts })) {
        problems.push(violation('every financial row carries a valid metadata socle', `${label} ${row.id}: ${problem}`));
      }
    }
  }

  // A category is standard (the client's reference, belonging to no account),
  // the user's own, or the user's customisation of a standard one - and nothing
  // else. This cannot be a SQL CHECK: it reads `userId`, a FOREIGN KEY column,
  // which MariaDB refuses in a CHECK (same reason as the media and quiz rules
  // above).
  const categories = await prisma.finCategory.findMany({
    select: { id: true, userId: true, family: true, key: true, baseKey: true, label: true, archivedAt: true, deletedAt: true, status: true },
  });
  const standardByKey = new Map(categories.filter((c) => !c.userId).map((c) => [c.key, c]));
  for (const row of categories) {
    const shape = row.userId === null ? (row.key && !row.baseKey ? 'standard' : null) : row.key === null ? 'user' : null;
    if (!shape) {
      problems.push(violation('a category is a standard row, a user row, or a user customisation of a standard row', `category ${row.id}`));
      continue;
    }
    if (shape === 'standard' && row.status !== 'official') {
      problems.push(violation("the client's category reference is stored as official", `category ${row.id}`));
    }
    if (row.baseKey && !standardByKey.has(row.baseKey)) {
      problems.push(violation('a category customisation points at a standard category that exists', `category ${row.id}: ${row.baseKey}`));
    } else if (row.baseKey && standardByKey.get(row.baseKey).family !== row.family) {
      problems.push(violation('a category customisation stays in the family of the category it customises', `category ${row.id}`));
    }
    if (!CATEGORY_FAMILY_CODES.includes(row.family)) {
      problems.push(violation('a category belongs to one of the declared families', `category ${row.id}: ${row.family}`));
    }
  }

  // The reference in the database says exactly what constants/finCategories.js
  // says: the migration generated one from the other, and a divergence would
  // mean the application and the data disagree on what the client wrote.
  const expectedCategories = new Map(STANDARD_CATEGORIES.map((c) => [c.key, c]));
  const REFERENCE_RULE = 'the standard category reference matches constants/finCategories.js';
  for (const [key, row] of standardByKey) {
    const reference = expectedCategories.get(key);
    if (!reference) problems.push(violation(REFERENCE_RULE, `unknown standard category ${key}`));
    else if (reference.label !== row.label || reference.family !== row.family) {
      problems.push(violation(REFERENCE_RULE, `standard category ${key} differs`));
    }
  }
  for (const key of expectedCategories.keys()) {
    if (!standardByKey.has(key)) problems.push(violation(REFERENCE_RULE, `missing standard category ${key}`));
  }

  // Two active categories a person could not tell apart in a picker. Compared
  // lower-case, which is how someone reads a list.
  const seenLabels = new Map();
  for (const row of categories) {
    if (row.deletedAt || !row.userId) continue;
    const slot = `${row.userId}:${row.family}:${row.label.toLocaleLowerCase('fr')}`;
    if (seenLabels.has(slot)) problems.push(violation('one account never has two categories with the same name in a family', `category ${row.id}`));
    seenLabels.set(slot, row.id);
  }

  // A logically deleted row keeps the journal entry that says it was deleted:
  // that is what makes the deletion traceable rather than silent.
  const changes = await prisma.finChange.findMany({ select: { id: true, entity: true, entityId: true, action: true, userId: true } });
  add('a change journal entry has a declared action', changes.filter((c) => !CHANGE_ACTIONS.includes(c.action)), (c) => `change ${c.id}: ${c.action}`);
  const deletedRows = new Set(changes.filter((c) => c.action === 'delete').map((c) => c.entityId));
  add(
    'a logically deleted financial row says in the journal that it was deleted',
    categories.filter((row) => row.deletedAt && row.userId && !deletedRows.has(row.id)),
    (row) => `category ${row.id}`,
  );
  // A journal entry about a row of another account would be that account's
  // history leaking into this one.
  const ownerOf = new Map(categories.map((row) => [row.id, row.userId]));
  add(
    'a change journal entry belongs to the account that owns the row',
    changes.filter((c) => c.entity === 'category' && ownerOf.has(c.entityId) && ownerOf.get(c.entityId) !== c.userId),
    (c) => `change ${c.id}`,
  );

  return problems;
}

export const privateDirOf = (storageDir) => path.join(storageDir, 'private');
