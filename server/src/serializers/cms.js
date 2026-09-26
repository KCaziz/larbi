import { readingMinutes } from '../services/article.service.js';
import { questionProblems, quizProblems } from '../services/quiz.service.js';
import { articleReadiness, formationReadiness } from '../services/readiness.service.js';

// Explicit allow-lists. In particular Media.storageKey (the internal storage
// name) is NEVER returned: clients only get an authorised URL.
export const ADMIN_MEDIA_URL = (id) => `/api/admin/media/${id}/file`;

export function toMedia(media) {
  if (!media) return null;
  return {
    id: media.id,
    kind: media.kind,
    originalName: media.originalName,
    mimeType: media.mimeType,
    sizeBytes: media.sizeBytes,
    url: ADMIN_MEDIA_URL(media.id),
  };
}

export function toAdminQuestion(question) {
  return {
    id: question.id,
    type: question.type,
    position: question.position,
    prompt: question.prompt,
    explanation: question.explanation,
    points: question.points,
    acceptedAnswers: question.acceptedAnswers ?? [],
    choices: (question.choices ?? []).map((c) => ({ id: c.id, text: c.text, isCorrect: c.isCorrect, position: c.position })),
    problems: questionProblems(question),
  };
}

const quizTotals = (quiz) => ({
  questionCount: (quiz.questions ?? []).length,
  totalPoints: (quiz.questions ?? []).reduce((sum, q) => sum + q.points, 0),
});

// Row of the list of quizzes of a formation.
export function toAdminQuizRow(quiz) {
  return {
    id: quiz.id,
    scope: quiz.scope,
    courseId: quiz.courseId,
    sectionId: quiz.sectionId,
    title: quiz.title,
    isRequired: quiz.isRequired,
    isComplete: quiz.isComplete,
    ...quizTotals(quiz),
  };
}

// The whole quiz, WITH the right answers (administrators only).
export function toAdminQuiz(quiz) {
  return {
    ...toAdminQuizRow(quiz),
    instructions: quiz.instructions,
    passingScore: quiz.passingScore,
    maxAttempts: quiz.maxAttempts,
    shuffleQuestions: quiz.shuffleQuestions,
    showCorrection: quiz.showCorrection,
    problems: quizProblems(quiz),
    questions: (quiz.questions ?? []).map(toAdminQuestion),
  };
}

export function toAdminBlock(block) {
  return {
    id: block.id,
    type: block.type,
    position: block.position,
    data: block.data,
    media: toMedia(block.media),
  };
}

export function toAdminSection(section) {
  return { id: section.id, title: section.title, description: section.description, position: section.position };
}

export function toAdminCourse(course) {
  return {
    id: course.id,
    sectionId: course.sectionId,
    title: course.title,
    summary: course.summary,
    body: course.body,
    position: course.position,
    isRequired: course.isRequired,
    estimatedMinutes: course.estimatedMinutes,
    media: (course.media ?? []).map(toMedia),
    blocks: (course.blocks ?? []).map(toAdminBlock),
  };
}

export function toAdminFormation(formation) {
  return {
    id: formation.id,
    title: formation.title,
    subtitle: formation.subtitle,
    description: formation.description,
    level: formation.level,
    objectives: formation.objectives ?? [],
    prerequisites: formation.prerequisites ?? [],
    // Sum of the lessons' estimated minutes: never stored, so never out of date.
    totalMinutes: (formation.courses ?? []).reduce((sum, c) => sum + (c.estimatedMinutes ?? 0), 0),
    status: formation.status,
    requiredAccessLevel: formation.requiredAccessLevel,
    category: formation.category ? { id: formation.category.id, name: formation.category.name } : null,
    cover: toMedia(formation.coverImage),
    certification: {
      enabled: formation.certificationEnabled,
      title: formation.certificationTitle,
      description: formation.certificationDescription,
    },
    publishedAt: formation.publishedAt,
    updatedAt: formation.updatedAt,
    sections: (formation.sections ?? []).map(toAdminSection),
    quizzes: (formation.quizzes ?? []).map(toAdminQuizRow),
    courses: (formation.courses ?? []).map(toAdminCourse),
    readiness: formationReadiness(formation),
  };
}

// Admin view of an article (the editor needs the body, the SEO fields and the
// checklist). The slug is not exposed: editors never need to see or type it.
export function toAdminArticle(article) {
  return {
    id: article.id,
    language: article.language,
    translations: (article.translations ?? []).map((t) => ({ language: t.language, title: t.title, updatedAt: t.updatedAt })),
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    status: article.status,
    category: article.category ? { id: article.category.id, name: article.category.name } : null,
    tags: (article.tags ?? []).map((link) => link.tag.name).sort((a, b) => a.localeCompare(b)),
    cover: toMedia(article.coverImage),
    media: (article.media ?? []).map(toMedia),
    requiredAccessLevel: article.requiredAccessLevel,
    targetAccountTypes: article.targetAccountTypes ?? [],
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    author: article.author ? { name: article.author.name } : null,
    readingMinutes: readingMinutes(article.bodyText),
    // Public address, only once published (for the "view on the blog" link).
    publicPath: article.status === 'published' ? `/blog/${article.slug}` : null,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    readiness: articleReadiness(article),
  };
}

// Row of the admin list.
export function toAdminArticleRow(article) {
  return {
    id: article.id,
    title: article.title,
    language: article.language,
    translationLanguages: (article.translations ?? []).map((t) => t.language).sort(),
    status: article.status,
    requiredAccessLevel: article.requiredAccessLevel,
    category: article.category ? { id: article.category.id, name: article.category.name } : null,
    cover: toMedia(article.coverImage),
    author: article.author ? { name: article.author.name } : null,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
  };
}

// One translation, as the editor needs it.
export function toAdminTranslation(row) {
  return {
    language: row.language,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    updatedAt: row.updatedAt,
  };
}
