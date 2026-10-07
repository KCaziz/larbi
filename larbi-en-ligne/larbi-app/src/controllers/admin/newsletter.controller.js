import { prisma } from '../../config/prisma.js';
import { SUBSCRIBER_STATUS, prepareDigest } from '../../services/newsletter.service.js';

// Administration of the newsletter (P3-05): subscribers and the preparation of a mailing.

const toRow = (s) => ({
  id: s.id,
  email: s.email,
  status: s.status,
  locale: s.locale,
  createdAt: s.createdAt,
  confirmedAt: s.confirmedAt,
  unsubscribedAt: s.unsubscribedAt,
});

// "%" and "_" typed by an admin are ordinary characters (see the blog search).
const escapeLike = (text) => text.replace(/[\\%_]/g, '\\$&');

function where({ status, query }) {
  return {
    ...(status && status !== 'all' ? { status } : {}),
    ...(query ? { email: { contains: escapeLike(query.toLowerCase()) } } : {}),
  };
}

export async function listSubscribers(req, res) {
  const { page, limit } = req.query;
  const filter = where(req.query);
  const [total, rows, grouped] = await prisma.$transaction([
    prisma.newsletterSubscriber.count({ where: filter }),
    prisma.newsletterSubscriber.findMany({
      where: filter,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.newsletterSubscriber.groupBy({ by: ['status'], orderBy: { status: 'asc' }, _count: { _all: true } }),
  ]);
  const counts = { pending: 0, confirmed: 0, unsubscribed: 0 };
  grouped.forEach((g) => {
    counts[g.status] = g._count._all;
  });
  res.json({
    subscribers: rows.map(toRow),
    counts: { ...counts, total: counts.pending + counts.confirmed + counts.unsubscribed },
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  });
}

// Right to erasure: the row is removed, nothing is kept.
export async function deleteSubscriber(req, res) {
  await prisma.newsletterSubscriber.delete({ where: { id: req.params.id } });
  res.status(204).end();
}

// A cell that starts with = + - @ (or a tab / CR) is executed as a formula by
// spreadsheets: e-mail addresses may legally start with those characters.
const csvCell = (value) => {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// Export of the subscribers that consented (confirmed) unless another status is asked,
// or of everyone (pending, confirmed, unsubscribed alike) when `status=all` is passed.
export async function exportSubscribers(req, res) {
  const status = req.query.status ?? SUBSCRIBER_STATUS.CONFIRMED;
  const rows = await prisma.newsletterSubscriber.findMany({
    where: status === 'all' ? {} : { status },
    orderBy: { createdAt: 'asc' },
  });
  const lines = [['email', 'status', 'locale', 'confirmedAt'].join(',')];
  rows.forEach((s) =>
    lines.push([s.email, s.status, s.locale, s.confirmedAt?.toISOString() ?? ''].map(csvCell).join(',')),
  );
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="newsletter-${status}.csv"`,
    'Cache-Control': 'no-store',
  });
  res.send(`﻿${lines.join('\r\n')}\r\n`);
}

// Prepares (never sends) the next mailing from the latest published articles.
export async function previewDigest(req, res) {
  res.json({ digest: await prepareDigest(req.query) });
}
