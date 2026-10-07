import { z } from 'zod';
import { BLOCK_TYPES } from '../services/blocks.service.js';

// The `data` of a block is validated per type by services/blocks.service.js; here only its
// envelope is checked (and bounded).
export const createBlockSchema = z
  .object({
    type: z.enum(BLOCK_TYPES),
    data: z.record(z.string(), z.unknown()).default({}),
    afterId: z.string().uuid().optional(),
  })
  .strict();

export const updateBlockSchema = z.object({ data: z.record(z.string(), z.unknown()) }).strict();

export const reorderBlocksSchema = z.object({ blockIds: z.array(z.string().uuid()).max(200) }).strict();

export const createRevisionSchema = z.object({ label: z.string().trim().min(1).max(100).optional() }).strict();
