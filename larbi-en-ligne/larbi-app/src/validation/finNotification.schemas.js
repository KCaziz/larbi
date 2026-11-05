import { z } from 'zod';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPE_KEYS } from '../constants/finNotification.js';

export const readSchema = z.object({ read: z.boolean().optional() }).strict();

export const listQuerySchema = z
  .object({ category: z.enum(NOTIFICATION_CATEGORIES).optional(), read: z.enum(['true', 'false']).optional() })
  .strict();

const typeSettingSchema = z.object({ enabled: z.boolean().optional(), optedIn: z.boolean().optional() }).strict();

// A partial map { [type]: { enabled?, optedIn? } }, keys restricted to the
// closed catalogue — settings for a type that does not exist would be dead
// data nobody could ever read back.
//
// Built as an explicit object with every key OPTIONAL, rather than
// `z.record(z.enum(KEYS), ...)`: zod mirrors TypeScript's `Record<K, V>` for a
// finite key enum, which makes every key REQUIRED unless declared optional —
// a request naming only the one type someone actually changed would then be
// refused for "missing" all the others.
export const settingsSchema = z
  .object(Object.fromEntries(NOTIFICATION_TYPE_KEYS.map((key) => [key, typeSettingSchema.optional()])))
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to change' });

// Une action sans corps. `.strict()` sur un objet vide : la route n'attend
// rien, et un champ envoyé quand même est refusé plutôt qu'ignoré.
//
// Ce n'est pas du zèle. Une route sans schéma est précisément celle où
// quelqu'un ajoutera un champ dans six mois sans penser à en écrire un —
// l'audit P5-02 l'a trouvée en balayant toutes les routes d'écriture.
export const emptyBodySchema = z.object({}).strict();
