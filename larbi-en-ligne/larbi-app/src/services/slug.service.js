import { randomBytes } from 'node:crypto';

export function slugify(text, fallback = 'item') {
  const base = String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return base || fallback;
}

// `exists(slug)` -> Promise<boolean>. Produces a readable unique slug
// (title, title-2, title-3, ...) and falls back to a random suffix.
export async function uniqueSlug(text, exists, fallback = 'item') {
  const base = slugify(text, fallback);
  if (!(await exists(base))) return base;
  for (let i = 2; i < 20; i += 1) {
    const candidate = `${base}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${base}-${randomBytes(4).toString('hex')}`;
}
