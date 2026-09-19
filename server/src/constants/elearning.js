// Allowed values for the E-Learning string columns. Kept in sync with the
// CHECK constraints in prisma/migrations/*_elearning_model (single source for
// application-level validation; the DB is the last line of defence).
export const FORMATION_STATUS = { DRAFT: 'draft', PUBLISHED: 'published' };
export const ENROLLMENT_STATUS = { ACTIVE: 'active', COMPLETED: 'completed' };
export const PROGRESS_STATUS = { IN_PROGRESS: 'in_progress', COMPLETED: 'completed' };
export const MEDIA_KIND = { VIDEO: 'video', IMAGE: 'image', DOCUMENT: 'document' };
