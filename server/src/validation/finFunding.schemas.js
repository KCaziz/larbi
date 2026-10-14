import { z } from 'zod';

// "Export (avec consentement)": the consent is given explicitly, on each
// export, rather than assumed from having opened the screen.
export const exportConsentSchema = z.object({ consent: z.literal(true) }).strict();
