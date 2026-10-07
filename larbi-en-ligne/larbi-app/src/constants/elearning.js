// Allowed values for the E-Learning string columns. Kept in sync with the
// CHECK constraints in prisma/migrations/*_elearning_model (single source for
// application-level validation; the DB is the last line of defence).
// draft -> in_review -> published -> archived. Only "published" is in the catalogue; a
// formation in any other status stays readable by the learners already enrolled.
export const FORMATION_STATUS = { DRAFT: 'draft', IN_REVIEW: 'in_review', PUBLISHED: 'published', ARCHIVED: 'archived' };
export const FORMATION_LEVEL = { BEGINNER: 'beginner', INTERMEDIATE: 'intermediate', ADVANCED: 'advanced' };
export const ENROLLMENT_STATUS = { ACTIVE: 'active', COMPLETED: 'completed' };
export const PROGRESS_STATUS = { IN_PROGRESS: 'in_progress', COMPLETED: 'completed' };
export const MEDIA_KIND = { VIDEO: 'video', IMAGE: 'image', DOCUMENT: 'document' };
