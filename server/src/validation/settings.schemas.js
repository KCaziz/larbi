import { z } from 'zod';

// The key becomes part of nothing structural (no column, no file name): a
// conservative charset keeps it easy to display and to read back safely.
const key = z.string().trim().min(1).max(60).regex(/^[a-zA-Z][a-zA-Z0-9_.-]*$/);

export const upsertSettingSchema = z.object({ key, value: z.string().max(2000) }).strict();
