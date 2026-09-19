import { richTextToPlain } from './sanitize.service.js';

// "Is this content ready to be published?" — a list of plain requirements, each
// ok / not ok. The keys are translated by the CMS ("Add a title", "Add at least
// one course", ...). The server uses the same function to REFUSE publication,
// so the checklist can never be bypassed from the browser.
// Formations use it now; articles will add their own list on the same shape.

const hasText = (value) => Boolean(value && String(value).trim());

export function courseHasContent(course) {
  return Boolean(richTextToPlain(course.body)) || (course.media?.length ?? 0) > 0;
}

export function formationReadiness(formation) {
  const courses = formation.courses ?? [];
  const items = [
    { key: 'title', ok: hasText(formation.title) },
    { key: 'description', ok: hasText(formation.description) },
    { key: 'cover', ok: Boolean(formation.coverImageId) },
    { key: 'courses', ok: courses.length > 0 },
    { key: 'coursesContent', ok: courses.length > 0 && courses.every(courseHasContent) },
    { key: 'certification', ok: !formation.certificationEnabled || hasText(formation.certificationTitle) },
  ];
  return { ready: items.every((i) => i.ok), items };
}
