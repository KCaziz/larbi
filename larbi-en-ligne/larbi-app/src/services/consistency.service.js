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
import { FREQUENCIES } from '../constants/finance.js';
import { TRANSACTION_KINDS } from '../constants/finMoney.js';
import { ENVELOPE_KINDS } from '../constants/finBudget.js';
import { ASSET_KINDS, ASSET_LIQUIDITY, FORBIDDEN_WEALTH_STATUS } from '../constants/finWealth.js';
import { SHARING_LEVELS, SHAREABLE_KINDS, SPACE_KINDS, SPACE_ROLES, SPLIT_RULES } from '../constants/finSpace.js';
import { PAPER_STATUS, PAPER_TRADE_KINDS } from '../constants/finPaper.js';
import { isBudgetableFamily } from './finBudgetProposal.service.js';
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
    select: {
      id: true,
      storageKey: true,
      courseId: true,
      articleId: true,
      coverOf: { select: { id: true } },
      articleCoverOf: { select: { id: true } },
      // A receipt of a movement (P6-04) is an owner too, like a lesson or an
      // article: without this, every receipt would be reported as an orphan.
      // Who uploaded it, so a receipt can be checked against the account whose
      // movement it documents.
      uploadedById: true,
      finTransactionId: true,
      finTransaction: { select: { id: true, userId: true } },
    },
  });

  add(
    'every file has an owner',
    media.filter((m) => !m.courseId && !m.articleId && !m.coverOf && !m.articleCoverOf && !m.finTransactionId),
    (m) => `media ${m.id} belongs to nothing`,
  );
  // Was a PostgreSQL CHECK (media_owner_check); MariaDB refuses a CHECK that references a
  // FOREIGN KEY column, which courseId and articleId both are (see the integrity_checks migration).
  add('a file belongs to at most one lesson OR one article, never both', media.filter((m) => m.courseId && m.articleId), (m) => `media ${m.id}`);
  // Same rule for a receipt: a private financial document must not also be a
  // lesson attachment or an article cover, which are served under other rules.
  add(
    'a receipt is not also a lesson file, an article file or a cover',
    media.filter((m) => m.finTransactionId && (m.courseId || m.articleId || m.coverOf || m.articleCoverOf)),
    (m) => `media ${m.id}`,
  );

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
  for (const { model, label, amounts, currency } of FINANCIAL_TABLES) {
    const rows = await prisma[model].findMany();
    for (const row of rows) {
      for (const problem of checkFinancialRow(row, { amounts, currency })) {
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

  // ---- "Mon argent" (P6-04) -------------------------------------------------
  // A resource must be normalisable to the month, or every total built on it is
  // wrong: F001 needs a frequency the engine knows. (A SQL CHECK covers the
  // list; this catches a frequency the engine later stops supporting.)
  const incomes = await prisma.finIncome.findMany({
    select: { id: true, userId: true, value: true, currency: true, frequency: true, startDate: true, endDate: true, categoryId: true, deletedAt: true },
  });
  add('a resource carries a frequency the engine can normalise', incomes.filter((row) => !FREQUENCIES.includes(row.frequency)), (row) => `income ${row.id}: ${row.frequency}`);
  add('a resource never ends before it starts', incomes.filter((row) => row.endDate && row.endDate < row.startDate), (row) => `income ${row.id}`);

  const transactions = await prisma.finTransaction.findMany({
    select: { id: true, userId: true, kind: true, value: true, currency: true, occurredAt: true, categoryId: true, planned: true, status: true, deletedAt: true },
  });
  add('a movement is money in or money out', transactions.filter((row) => !TRANSACTION_KINDS.includes(row.kind)), (row) => `transaction ${row.id}: ${row.kind}`);
  // The client's rule, and the one thing SQL cannot check on its own because it
  // needs to know what "now" is: only a PLANNED EXPENSE may be dated ahead.
  add(
    'only a planned expense is dated in the future',
    transactions.filter((row) => !row.deletedAt && row.occurredAt > new Date() && !(row.planned && row.kind === 'expense')),
    (row) => `transaction ${row.id}`,
  );
  // A planned movement has not happened: calling it "real" would put it in a
  // realised total (F004's own condition is "dépenses réalisées de la période").
  // This is also P6-07's own rule — « un événement planifié n'est pas une
  // transaction avant confirmation » — and it is checked here, once: the
  // calendar reads the same rows rather than keeping planned events of its own.
  add('a planned movement is never recorded as real', transactions.filter((row) => row.planned && row.status === 'real'), (row) => `transaction ${row.id}`);

  // A row may only point at the client's reference or at its OWN account's
  // category. Pointing at someone else's would leak that it exists, and would
  // break the moment that account is erased.
  const categoryOwner = new Map(
    (await prisma.finCategory.findMany({ select: { id: true, userId: true } })).map((row) => [row.id, row.userId]),
  );
  for (const [label, rows] of [
    ['income', incomes],
    ['transaction', transactions],
  ]) {
    add(
      'a financial row only uses the reference categories or its own',
      rows.filter((row) => row.categoryId !== null && categoryOwner.get(row.categoryId) !== null && categoryOwner.get(row.categoryId) !== row.userId),
      (row) => `${label} ${row.id}`,
    );
  }

  // A receipt belongs to the account whose movement it documents: a private
  // financial document must never hang off somebody else's row.
  const receiptsOfOthers = media.filter((m) => m.finTransaction && m.uploadedById && m.finTransaction.userId !== m.uploadedById);
  add('a receipt was uploaded by the account that owns its movement', receiptsOfOthers, (m) => `media ${m.id}`);

  // ---- budgets and envelopes (P6-05) ----------------------------------------
  const budgets = await prisma.finBudget.findMany({
    select: { id: true, userId: true, label: true, periodStart: true, periodEnd: true, currency: true, archivedAt: true, deletedAt: true },
  });
  const envelopes = await prisma.finEnvelope.findMany({
    select: { id: true, userId: true, budgetId: true, categoryId: true, kind: true, value: true, currency: true, cap: true, deletedAt: true },
  });
  const budgetById = new Map(budgets.map((row) => [row.id, row]));

  add('a budget envelope is a fixed or a variable one', envelopes.filter((row) => !ENVELOPE_KINDS.includes(row.kind)), (row) => `envelope ${row.id}: ${row.kind}`);

  // The envelope carries its owner denormalised (every read is "the envelopes
  // of MY budget"), so the two must agree: a mismatch would let one account's
  // planning be read through the other's.
  add(
    'an envelope belongs to the account that owns its budget',
    envelopes.filter((row) => budgetById.has(row.budgetId) && budgetById.get(row.budgetId).userId !== row.userId),
    (row) => `envelope ${row.id}`,
  );

  // The budget totals its envelopes, so they are all in its currency. Cannot be
  // a SQL CHECK: it reads `budgetId`, a FOREIGN KEY column (MariaDB refuses
  // that), which is the same reason the overlap rule below lives here.
  add(
    'an envelope is in the currency of its budget',
    envelopes.filter((row) => budgetById.has(row.budgetId) && budgetById.get(row.budgetId).currency !== row.currency),
    (row) => `envelope ${row.id}`,
  );

  // Two envelopes on one category would split the same money in two and make
  // every consumption rate wrong.
  const envelopeSlots = new Map();
  for (const row of envelopes) {
    if (row.deletedAt || !row.categoryId) continue;
    const slot = `${row.budgetId}:${row.categoryId}`;
    if (envelopeSlots.has(slot)) {
      problems.push(violation('one budget has at most one envelope per category', `envelope ${row.id}`));
    }
    envelopeSlots.set(slot, row.id);
  }

  // A live envelope hanging off a deleted budget would be counted by nothing
  // and kept by nobody.
  add(
    'an envelope of a deleted budget is deleted too',
    envelopes.filter((row) => !row.deletedAt && budgetById.get(row.budgetId)?.deletedAt),
    (row) => `envelope ${row.id}`,
  );

  // A budget plans what goes out or what is set aside: an envelope pointing at
  // an income category would be budgeting an expense against a salary.
  const categoryFamily = new Map(categories.map((row) => [row.id, row.family]));
  add(
    'an envelope never budgets an income category',
    envelopes.filter((row) => row.categoryId && categoryFamily.has(row.categoryId) && !isBudgetableFamily(categoryFamily.get(row.categoryId))),
    (row) => `envelope ${row.id}: ${categoryFamily.get(row.categoryId)}`,
  );

  // Same rule as for a movement: an envelope may only point at the client's
  // reference or at its OWN account's category.
  add(
    'a financial row only uses the reference categories or its own',
    envelopes.filter((row) => row.categoryId !== null && categoryOwner.get(row.categoryId) !== null && categoryOwner.get(row.categoryId) !== row.userId),
    (row) => `envelope ${row.id}`,
  );

  // « Chevauchement de périodes refusé » (the client's own rule). Checked over
  // the LIVE budgets of each account: archiving is how someone withdraws a
  // budget, and a withdrawn period must not forbid planning that month again.
  const byOwner = new Map();
  for (const row of budgets) {
    if (row.deletedAt || row.archivedAt) continue;
    if (!byOwner.has(row.userId)) byOwner.set(row.userId, []);
    byOwner.get(row.userId).push(row);
  }
  for (const own of byOwner.values()) {
    const sorted = [...own].sort((a, b) => a.periodStart - b.periodStart);
    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i].periodStart <= sorted[i - 1].periodEnd) {
        problems.push(violation('two live budgets of one account never overlap', `budget ${sorted[i].id} overlaps ${sorted[i - 1].id}`));
      }
    }
  }

  // ---- calendar, recurrences and provisions (P6-07) -------------------------
  const recurrences = await prisma.finRecurrence.findMany({
    select: { id: true, userId: true, label: true, kind: true, value: true, currency: true, frequency: true, nextDate: true, endDate: true, categoryId: true, detected: true, sourceRef: true, deletedAt: true },
  });
  const provisions = await prisma.finProvision.findMany({
    select: { id: true, userId: true, label: true, value: true, provisioned: true, currency: true, targetDate: true, categoryId: true, deletedAt: true },
  });

  add('a recurrence is money in or money out', recurrences.filter((row) => !TRANSACTION_KINDS.includes(row.kind)), (row) => `recurrence ${row.id}: ${row.kind}`);
  // Same rule as a resource (P6-04): without a frequency the engine can
  // normalise, F049 cannot bring the subscription back to the month and every
  // total built on it is wrong.
  add(
    'a recurrence carries a frequency the engine can normalise',
    recurrences.filter((row) => !FREQUENCIES.includes(row.frequency)),
    (row) => `recurrence ${row.id}: ${row.frequency}`,
  );
  add('a recurrence never ends before its next date', recurrences.filter((row) => row.endDate && row.endDate < row.nextDate), (row) => `recurrence ${row.id}`);
  // The trace of where a row came from: a detected recurrence was confirmed
  // from ALG-04, and says so. Without this the client's « proposée puis
  // confirmée » leaves nothing behind to check.
  add(
    'a detected recurrence says which detection it was confirmed from',
    recurrences.filter((row) => row.detected && row.sourceRef !== 'detection:ALG-04'),
    (row) => `recurrence ${row.id}`,
  );
  // A provision is money set aside, not money spent: it can never have more set
  // aside than the expense it is for (the CHECK covers the column; this catches
  // a row written around it).
  add(
    'a provision never has more set aside than the expense it is for',
    provisions.filter((row) => row.provisioned > row.value || row.provisioned < 0),
    (row) => `provision ${row.id}`,
  );
  for (const [label, rows] of [
    ['recurrence', recurrences],
    ['provision', provisions],
  ]) {
    add(
      'a financial row only uses the reference categories or its own',
      rows.filter((row) => row.categoryId !== null && categoryOwner.get(row.categoryId) !== null && categoryOwner.get(row.categoryId) !== row.userId),
      (row) => `${label} ${row.id}`,
    );
  }

  // ---- real patrimony (P6-11) -----------------------------------------------
  const assets = await prisma.finAsset.findMany({
    select: { id: true, userId: true, label: true, kind: true, value: true, currency: true, valuedAt: true, liquidity: true, status: true, categoryId: true, deletedAt: true },
  });

  // THE rule of P6-11, in the client's own words: « le fictif est interdit
  // ici ». A CHECK already refuses it, and zod refuses it earlier; this catches
  // a row written around both, because one fictional line inside F035 makes net
  // worth a lie rather than a figure.
  add('real patrimony never holds a fictional value', assets.filter((row) => row.status === FORBIDDEN_WEALTH_STATUS), (row) => `asset ${row.id}`);

  add('an asset is one of the declared kinds', assets.filter((row) => !ASSET_KINDS.includes(row.kind)), (row) => `asset ${row.id}: ${row.kind}`);
  // Liquidity is not cosmetic: F014 requires the illiquid to be excluded, and a
  // value the engine cannot read would silently fall out of that exclusion.
  add('an asset declares a liquidity the engine can read', assets.filter((row) => !ASSET_LIQUIDITY.includes(row.liquidity)), (row) => `asset ${row.id}: ${row.liquidity}`);
  // « Valeur datée »: a valuation dated ahead of now would make a figure look
  // established that nobody has established yet. Cannot be a CHECK — it needs
  // to know what "now" is.
  add('a valuation is never dated in the future', assets.filter((row) => !row.deletedAt && row.valuedAt > new Date()), (row) => `asset ${row.id}`);

  add(
    'a financial row only uses the reference categories or its own',
    assets.filter((row) => row.categoryId !== null && categoryOwner.get(row.categoryId) !== null && categoryOwner.get(row.categoryId) !== row.userId),
    (row) => `asset ${row.id}`,
  );

  // ---- shared spaces (P6-13) ------------------------------------------------
  // These three tables are NOT in FINANCIAL_TABLES, and that is deliberate:
  // they hold no amount and no metadata socle (a space is not a financial
  // datum, it is who may see one). Their rules are therefore written out here
  // rather than walked by `checkFinancialRow`.
  const spaces = await prisma.finSpace.findMany({ select: { id: true, kind: true, currency: true, splitRule: true, deletedAt: true } });
  const memberships = await prisma.finSpaceMember.findMany({
    select: { id: true, spaceId: true, userId: true, role: true, sharing: true, leftAt: true },
  });
  const invites = await prisma.finSpaceInvite.findMany({
    select: { id: true, spaceId: true, role: true, status: true, expiresAt: true, acceptedAt: true, acceptedById: true },
  });

  add('a space is one of the declared kinds', spaces.filter((row) => !SPACE_KINDS.includes(row.kind)), (row) => `space ${row.id}: ${row.kind}`);
  add('a space declares a split rule the engine knows', spaces.filter((row) => !SPLIT_RULES.includes(row.splitRule)), (row) => `space ${row.id}: ${row.splitRule}`);
  add('a membership has one of the declared roles', memberships.filter((row) => !SPACE_ROLES.includes(row.role)), (row) => `membership ${row.id}`);

  // THE rule of P6-13. A sharing level the application cannot read would fall
  // through `normaliseSharing` as `private` — the safe direction — but a row
  // holding one means something wrote a value nobody declared, and that is
  // worth knowing before it is a level that reveals more rather than less.
  for (const row of memberships) {
    const sharing = row.sharing && typeof row.sharing === 'object' && !Array.isArray(row.sharing) ? row.sharing : null;
    if (!sharing) {
      problems.push(violation('a membership stores its sharing matrix as an object', `membership ${row.id}`));
      continue;
    }
    for (const [kind, level] of Object.entries(sharing)) {
      if (!SHAREABLE_KINDS.includes(kind)) {
        problems.push(violation('a sharing matrix only names the declared data kinds', `membership ${row.id}: ${kind}`));
      } else if (!SHARING_LEVELS.includes(level)) {
        problems.push(violation('a sharing level is one of the declared levels', `membership ${row.id}: ${kind} = ${JSON.stringify(level)}`));
      }
    }
  }

  // A space has exactly one owner while it lives: nobody could delete it
  // otherwise, and two owners would make "who may hand it over" unanswerable.
  for (const space of spaces) {
    if (space.deletedAt) continue;
    const owners = memberships.filter((row) => row.spaceId === space.id && row.leftAt === null && row.role === 'owner');
    if (owners.length !== 1) {
      problems.push(violation('a live space has exactly one owner', `space ${space.id}: ${owners.length} owner(s)`));
    }
  }

  // An invitation can never grant ownership — not by validation alone.
  add('an invitation never grants ownership', invites.filter((row) => row.role === 'owner'), (row) => `invite ${row.id}`);
  // An accepted invitation says who accepted it and when; anything else says
  // neither. Half a trail is not a trail.
  add(
    'an accepted invitation records who accepted it and when',
    invites.filter((row) => (row.status === 'accepted') !== (row.acceptedAt !== null)),
    (row) => `invite ${row.id}`,
  );
  // A pending invitation on a deleted space would still be a usable key.
  add(
    'a deleted space has no pending invitation left',
    invites.filter((row) => row.status === 'pending' && spaces.find((space) => space.id === row.spaceId)?.deletedAt),
    (row) => `invite ${row.id}`,
  );

  // ---- paper portfolio (P6-12) ----------------------------------------------
  // Not in FINANCIAL_TABLES either, and for the opposite reason to the spaces:
  // these rows carry no metadata socle because they are ENTIRELY fictional, and
  // the socle exists to describe real data. Their rules are written out here.
  const portfolios = await prisma.finPaperPortfolio.findMany({
    select: { id: true, userId: true, capital: true, cash: true, currency: true, feeRate: true, status: true },
  });
  const paperInstruments = await prisma.finPaperInstrument.findMany({
    select: { id: true, portfolioId: true, label: true, markPrice: true, markedAt: true },
  });
  const paperTrades = await prisma.finPaperTrade.findMany({
    select: { id: true, portfolioId: true, instrumentId: true, kind: true, quantity: true, unitPrice: true, fee: true, currency: true, decidedAt: true, status: true },
  });

  // THE rule of P6-12, and the other half of P6-11's: everything in the paper
  // portfolio is fictional, so that no query can ever pull one of these rows
  // into a real total. A CHECK pins it; this catches a row written around it.
  add('everything in the paper portfolio is fictional', portfolios.filter((row) => row.status !== PAPER_STATUS), (row) => `portfolio ${row.id}`);
  add('every paper trade is fictional', paperTrades.filter((row) => row.status !== PAPER_STATUS), (row) => `paper trade ${row.id}`);
  add('a paper trade is a buy or a sell', paperTrades.filter((row) => !PAPER_TRADE_KINDS.includes(row.kind)), (row) => `paper trade ${row.id}: ${row.kind}`);

  // « Aucune exécution », and no leverage: fictional cash never goes negative,
  // and the trades of a portfolio are all in its own currency — otherwise F038
  // would be adding prices that cannot be added.
  add('fictional cash is never negative', portfolios.filter((row) => row.cash < 0), (row) => `portfolio ${row.id}`);
  const portfolioById = new Map(portfolios.map((row) => [row.id, row]));
  add(
    'a paper trade is in the currency of its portfolio',
    paperTrades.filter((row) => portfolioById.has(row.portfolioId) && portfolioById.get(row.portfolioId).currency !== row.currency),
    (row) => `paper trade ${row.id}`,
  );
  // A trade whose instrument belongs to another portfolio would mix two
  // people's simulations.
  const instrumentPortfolio = new Map(paperInstruments.map((row) => [row.id, row.portfolioId]));
  add(
    'a paper trade points at an instrument of its own portfolio',
    paperTrades.filter((row) => instrumentPortfolio.get(row.instrumentId) !== row.portfolioId),
    (row) => `paper trade ${row.id}`,
  );
  // A simulated price of zero is not a price, and a price dated ahead of now
  // would be a quote nobody could have stated.
  add('a simulated price is positive and not dated in the future', paperInstruments.filter((row) => row.markPrice <= 0 || row.markedAt > new Date()), (row) => `paper instrument ${row.id}`);
  // A position cannot be short: the sells of an instrument never exceed its
  // buys. Checked over the whole journal, which is the only place it can be.
  for (const instrument of paperInstruments) {
    const trades = paperTrades.filter((row) => row.instrumentId === instrument.id);
    const bought = trades.filter((row) => row.kind === 'buy').reduce((sum, row) => sum + row.quantity, 0);
    const sold = trades.filter((row) => row.kind === 'sell').reduce((sum, row) => sum + row.quantity, 0);
    if (sold > bought) {
      problems.push(violation('a paper position is never short', `paper instrument ${instrument.id}: sold ${sold} of ${bought}`));
    }
  }

  // A logically deleted row keeps the journal entry that says it was deleted:
  // that is what makes the deletion traceable rather than silent.
  const changes = await prisma.finChange.findMany({ select: { id: true, entity: true, entityId: true, action: true, userId: true } });
  add('a change journal entry has a declared action', changes.filter((c) => !CHANGE_ACTIONS.includes(c.action)), (c) => `change ${c.id}: ${c.action}`);
  const deletedRows = new Set(changes.filter((c) => c.action === 'delete').map((c) => c.entityId));
  for (const [label, rows] of [
    ['category', categories.filter((row) => row.userId)],
    ['income', incomes],
    ['transaction', transactions],
    ['budget', budgets],
    ['envelope', envelopes],
    ['recurrence', recurrences],
    ['provision', provisions],
    ['asset', assets],
  ]) {
    add(
      'a logically deleted financial row says in the journal that it was deleted',
      rows.filter((row) => row.deletedAt && !deletedRows.has(row.id)),
      (row) => `${label} ${row.id}`,
    );
  }
  // A journal entry about a row of another account would be that account's
  // history leaking into this one.
  const ownerOf = new Map(
    [...categories, ...incomes, ...transactions, ...budgets, ...envelopes, ...recurrences, ...provisions, ...assets].map((row) => [row.id, row.userId]),
  );
  add(
    'a change journal entry belongs to the account that owns the row',
    changes.filter((c) => ownerOf.has(c.entityId) && ownerOf.get(c.entityId) !== c.userId),
    (c) => `change ${c.id}`,
  );

  return problems;
}

export const privateDirOf = (storageDir) => path.join(storageDir, 'private');
