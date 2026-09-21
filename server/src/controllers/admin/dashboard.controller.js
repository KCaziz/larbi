import { prisma } from '../../config/prisma.js';
import { articleReadiness, formationReadiness } from '../../services/readiness.service.js';

// Numbers and shortcuts for the administration home page (P3-11): what exists, what is
// waiting for a review, and what still misses something before it can be published.

const missing = (readiness) => readiness.items.filter((i) => !i.ok).map((i) => i.key);
const countBy = (groups, key = 'status') => Object.fromEntries(groups.map((g) => [g[key], g._count._all]));

export async function getDashboard(req, res) {
  const [formationGroups, articleGroups, enrollments, completed, subscribers, formations, articles] = await Promise.all([
    prisma.formation.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.article.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: 'completed' } }),
    prisma.newsletterSubscriber.count({ where: { status: 'confirmed' } }),
    prisma.formation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 6,
      include: { courses: { include: { media: { select: { id: true } } } }, _count: { select: { enrollments: true } } },
    }),
    prisma.article.findMany({ orderBy: { updatedAt: 'desc' }, take: 6 }),
  ]);

  res.json({
    formations: { byStatus: { draft: 0, in_review: 0, published: 0, archived: 0, ...countBy(formationGroups) } },
    articles: { byStatus: { draft: 0, published: 0, ...countBy(articleGroups) } },
    learning: { enrollments, completed },
    newsletter: { confirmed: subscribers },
    recentFormations: formations.map((f) => ({
      id: f.id,
      title: f.title,
      status: f.status,
      enrollmentCount: f._count.enrollments,
      missing: missing(formationReadiness(f)),
      updatedAt: f.updatedAt,
    })),
    recentArticles: articles.map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
      missing: missing(articleReadiness(a)),
      updatedAt: a.updatedAt,
    })),
  });
}
