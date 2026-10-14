// Passeport de connaissances financières (P2-09). Compose des données déjà
// réelles de l'e-learning (P2-01 à P2-05) — aucune nouvelle table, aucune
// nouvelle notion de progression : juste la lecture, du point de vue d'un
// apprenant, de ce qui existe déjà.
import { ENROLLMENT_STATUS, FORMATION_STATUS, PROGRESS_STATUS } from '../constants/elearning.js';
import { SECURITY_MODULE_BLOCKED, SECURITY_MODULE_SLUG } from '../constants/finPasseport.js';

const MAX_LIST = 20;

export async function listCompletedFormations(prisma, userId) {
  const rows = await prisma.enrollment.findMany({
    where: { userId, status: ENROLLMENT_STATUS.COMPLETED },
    orderBy: { completedAt: 'desc' },
    take: MAX_LIST,
    select: {
      id: true,
      completedAt: true,
      formation: { select: { title: true, slug: true } },
      certification: { select: { certificateNumber: true } },
    },
  });
  return rows.map((row) => ({
    formation: row.formation,
    completedAt: row.completedAt,
    // Une vraie attestation existe déjà (P2-05) ou non — jamais devinée ici.
    certified: row.certification !== null,
  }));
}

// Pour chaque formation en cours, les cours obligatoires qui restent à
// terminer : ce que le client appelle « étapes suivantes ». Aucune
// recommandation inventée — seulement ce qui bloque réellement la formation.
export async function buildNextSteps(prisma, userId) {
  const rows = await prisma.enrollment.findMany({
    where: { userId, status: ENROLLMENT_STATUS.ACTIVE },
    take: MAX_LIST,
    select: {
      id: true,
      formation: { select: { title: true, slug: true, courses: { where: { isRequired: true }, select: { id: true, title: true } } } },
      courseProgress: { where: { status: PROGRESS_STATUS.COMPLETED }, select: { courseId: true } },
    },
  });
  return rows
    .map((row) => {
      const done = new Set(row.courseProgress.map((p) => p.courseId));
      const remaining = row.formation.courses.filter((c) => !done.has(c.id)).map((c) => c.title);
      return { formation: { title: row.formation.title, slug: row.formation.slug }, remaining };
    })
    .filter((entry) => entry.remaining.length > 0);
}

// Tous les quiz réussis de cette personne, toutes formations confondues — le
// dernier essai réussi par quiz (un apprenant peut repasser un quiz complet).
export async function listPassedQuizzes(prisma, userId) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { passed: true, enrollment: { userId } },
    orderBy: { submittedAt: 'desc' },
    take: MAX_LIST * 3,
    select: { quizId: true, score: true, submittedAt: true, quiz: { select: { title: true, formation: { select: { title: true } } } } },
  });
  const seen = new Set();
  const latest = [];
  for (const attempt of attempts) {
    if (seen.has(attempt.quizId)) continue;
    seen.add(attempt.quizId);
    latest.push({ quizTitle: attempt.quiz.title, formationTitle: attempt.quiz.formation.title, score: attempt.score, passedAt: attempt.submittedAt });
    if (latest.length >= MAX_LIST) break;
  }
  return latest;
}

async function formationsCompletionDimension(prisma, userId) {
  const [total, completed] = await Promise.all([
    prisma.enrollment.count({ where: { userId } }),
    prisma.enrollment.count({ where: { userId, status: ENROLLMENT_STATUS.COMPLETED } }),
  ]);
  return total === 0 ? null : completed / total;
}

async function quizzesAverageDimension(prisma, userId) {
  const attempts = await prisma.quizAttempt.findMany({
    where: { passed: true, enrollment: { userId } },
    select: { score: true },
  });
  if (attempts.length === 0) return null;
  const scores = attempts.filter((a) => a.score !== null).map((a) => a.score);
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length / 100;
}

// La dimension « Sécurité numérique » n'existe que si l'administrateur a
// publié la formation réservée à ce slug (constants/finPasseport.js). Pas de
// contenu publié : la dimension est déclarée indisponible, jamais mesurée à
// zéro (ce serait lire une absence de contenu comme un échec de l'apprenant).
async function securityModuleDimension(prisma, userId) {
  const formation = await prisma.formation.findFirst({
    where: { slug: SECURITY_MODULE_SLUG, status: FORMATION_STATUS.PUBLISHED },
    select: { id: true },
  });
  if (!formation) return SECURITY_MODULE_BLOCKED;
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_formationId: { userId, formationId: formation.id } },
    select: { status: true },
  });
  if (!enrollment) return null; // pas encore commencée, jamais un zéro
  return enrollment.status === ENROLLMENT_STATUS.COMPLETED ? 1 : 0;
}

export async function buildKnowledgeDimensions(prisma, userId) {
  const [formationsCompletion, quizzesAverage, securityModule] = await Promise.all([
    formationsCompletionDimension(prisma, userId),
    quizzesAverageDimension(prisma, userId),
    securityModuleDimension(prisma, userId),
  ]);
  return { formationsCompletion, quizzesAverage, securityModule };
}
