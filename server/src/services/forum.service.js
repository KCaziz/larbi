import { HttpError } from '../utils/httpError.js';

/**
 * The forum of mutual help (P13-05, lot G, 2026-11-24; ECR-0156 to 0158).
 *
 * - Every message is « unverified content », and says so on screen.
 * - A message where personal data seems to appear (an e-mail, a phone number,
 *   a long account number) is HELD for a moderator instead of being
 *   published: deterministic rules, no AI (ECR-0157).
 * - A report is decided by a person, and the decision is kept (ECR-0158).
 * - Authors appear by first name and initial only.
 */

export const FORUM_CATEGORIES = ['gestion', 'facturation', 'tresorerie', 'financement', 'import_export', 'diaspora', 'rh', 'creation', 'autre'];
export const REPORT_REASONS = ['personal_data', 'abuse', 'spam', 'wrong_advice', 'other'];

const PERSONAL_DATA = [
  ['email', /[^\s@]+@[^\s@]+\.[a-z]{2,}/i],
  ['phone', /(?:\+|00)?213[\s.-]?\d|(?<!\d)0[5-7](?:[\s.-]?\d){8}(?!\d)/],
  ['account', /(?<!\d)(?:\d[\s-]?){12,}(?!\d)/],
];

/** The kind of personal data a text seems to hold, or null. */
export function personalData(text) {
  for (const [kind, pattern] of PERSONAL_DATA) if (pattern.test(text)) return kind;
  return null;
}

const display = (user) => {
  const [first, ...rest] = String(user?.name ?? '').trim().split(/\s+/);
  const last = rest.join(' ');
  return first ? `${first}${last ? ` ${last[0].toUpperCase()}.` : ''}` : null;
};
const authorSelect = { select: { id: true, name: true } };
const shape = (row, me) => {
  const { author, ...rest } = row;
  return { ...rest, auteur: display(author), deMoi: row.authorId === me };
};

export async function listThreads(prisma, user, { category, q } = {}) {
  const threads = await prisma.forumThread.findMany({
    where: {
      AND: [
        // Published ones, and my own held ones (I see what waits for moderation).
        { OR: [{ status: 'published' }, { status: 'held', authorId: user.id }] },
        ...(q ? [{ OR: [{ title: { contains: q } }, { body: { contains: q } }] }] : []),
      ],
      ...(category ? { category } : {}),
    },
    orderBy: { lastActivityAt: 'desc' },
    take: 100,
    include: { author: authorSelect },
  });
  return threads.map((t) => shape(t, user.id));
}

export async function getThread(prisma, user, id) {
  const thread = await prisma.forumThread.findFirst({
    where: { id, OR: [{ status: 'published' }, { status: 'held', authorId: user.id }] },
    include: {
      author: authorSelect,
      posts: { where: { OR: [{ status: 'published' }, { status: 'held', authorId: user.id }] }, orderBy: { createdAt: 'asc' }, include: { author: authorSelect } },
    },
  });
  if (!thread) throw new HttpError(404, 'Discussion not found', { reason: 'threadNotFound' });
  return { ...shape(thread, user.id), posts: thread.posts.map((p) => shape(p, user.id)) };
}

export async function createThread(prisma, user, body) {
  if (body.consent !== true) throw new HttpError(422, 'Publishing needs your consent', { reason: 'consentRequired' });
  const held = personalData(`${body.title}\n${body.body}`);
  return prisma.forumThread.create({
    data: { authorId: user.id, category: body.category, title: body.title, body: body.body, status: held ? 'held' : 'published', heldReason: held },
  });
}

export async function reply(prisma, user, threadId, body) {
  const thread = await prisma.forumThread.findFirst({ where: { id: threadId, status: 'published' } });
  if (!thread) throw new HttpError(404, 'Discussion not found', { reason: 'threadNotFound' });
  const held = personalData(body.body);
  return prisma.$transaction(async (tx) => {
    const post = await tx.forumPost.create({ data: { threadId, authorId: user.id, body: body.body, status: held ? 'held' : 'published', heldReason: held } });
    if (!held) await tx.forumThread.update({ where: { id: threadId }, data: { replyCount: { increment: 1 }, lastActivityAt: new Date() } });
    return post;
  });
}

export async function report(prisma, user, body) {
  if (!body.threadId === !body.postId) throw new HttpError(422, 'Report one discussion or one message', { reason: 'reportTarget' });
  const target = body.threadId
    ? await prisma.forumThread.findFirst({ where: { id: body.threadId, status: 'published' } })
    : await prisma.forumPost.findFirst({ where: { id: body.postId, status: 'published' } });
  if (!target) throw new HttpError(404, 'Not found', { reason: 'threadNotFound' });
  const already = await prisma.forumReport.findFirst({ where: { reporterId: user.id, status: 'open', threadId: body.threadId ?? null, postId: body.postId ?? null } });
  if (already) return already;
  return prisma.forumReport.create({ data: { reporterId: user.id, threadId: body.threadId ?? null, postId: body.postId ?? null, reason: body.reason, note: body.note ?? null } });
}

// ---- moderation (administration) ----------------------------------------------------------

export async function moderationQueue(prisma) {
  const [reports, heldThreads, heldPosts] = await Promise.all([
    prisma.forumReport.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'asc' },
      include: { thread: { select: { id: true, title: true, body: true, status: true } }, post: { select: { id: true, body: true, status: true, threadId: true } } },
    }),
    prisma.forumThread.findMany({ where: { status: 'held' }, orderBy: { createdAt: 'asc' }, include: { author: authorSelect } }),
    prisma.forumPost.findMany({ where: { status: 'held' }, orderBy: { createdAt: 'asc' }, include: { author: authorSelect, thread: { select: { title: true } } } }),
  ]);
  const history = await prisma.forumReport.findMany({ where: { status: 'decided' }, orderBy: { decidedAt: 'desc' }, take: 50 });
  return { signalements: reports, discussionsRetenues: heldThreads.map((t) => shape(t, null)), messagesRetenus: heldPosts.map((p) => shape(p, null)), historique: history };
}

/** A human decision on a report: the content is kept, or removed — and the decision stays. */
export async function decideReport(prisma, adminId, id, { decision, note }) {
  const found = await prisma.forumReport.findUnique({ where: { id } });
  if (!found || found.status !== 'open') throw new HttpError(404, 'Report not found', { reason: 'reportNotFound' });
  return prisma.$transaction(async (tx) => {
    if (decision === 'removed') {
      if (found.threadId) await tx.forumThread.update({ where: { id: found.threadId }, data: { status: 'removed' } });
      if (found.postId) await tx.forumPost.update({ where: { id: found.postId }, data: { status: 'removed' } });
    }
    // Every open report on the same content gets the same decision.
    await tx.forumReport.updateMany({
      where: { status: 'open', threadId: found.threadId, postId: found.postId },
      data: { status: 'decided', decision, decisionNote: note ?? null, decidedById: adminId, decidedAt: new Date() },
    });
    return tx.forumReport.findUnique({ where: { id } });
  });
}

/** A held message: published after a moderator's reading, or removed. */
export async function decideHeld(prisma, kind, id, publish) {
  if (kind === 'thread') {
    const thread = await prisma.forumThread.findFirst({ where: { id, status: 'held' } });
    if (!thread) throw new HttpError(404, 'Not found', { reason: 'threadNotFound' });
    return prisma.forumThread.update({ where: { id }, data: { status: publish ? 'published' : 'removed', lastActivityAt: new Date() } });
  }
  const post = await prisma.forumPost.findFirst({ where: { id, status: 'held' } });
  if (!post) throw new HttpError(404, 'Not found', { reason: 'threadNotFound' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.forumPost.update({ where: { id }, data: { status: publish ? 'published' : 'removed' } });
    if (publish) await tx.forumThread.update({ where: { id: post.threadId }, data: { replyCount: { increment: 1 }, lastActivityAt: new Date() } });
    return updated;
  });
}
