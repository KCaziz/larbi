import { randomBytes } from 'node:crypto';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { applyTestEnv, assertTestDatabase } from './env.js';

// Boots the real Express app inside the test process (ephemeral port, test
// database, temporary storage) and returns everything a test needs.
//   const t = await boot();                       // dev-like mode
//   const t = await boot({ production: true });   // production behaviour
//   const t = await boot({ extra: { MEDIA_DENIED_LIMIT: '3' } });
export async function boot({ production = false, extra = {} } = {}) {
  applyTestEnv({ production, extra });
  assertTestDatabase(process.env.DATABASE_URL);

  const { createApp } = await import('../../src/app.js');
  const { prisma } = await import('../../src/config/prisma.js');
  const { signSession } = await import('../../src/services/token.service.js');

  const app = createApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const storageDir = process.env.STORAGE_DIR;

  // ---- HTTP client ---------------------------------------------------------
  // `user` = a database user (a valid session cookie is forged for it, exactly
  // what login would set); `token` = a raw session value; `json` / `form` = body.
  async function request(method, urlPath, { user, token, json, form, body, headers = {}, raw = false } = {}) {
    const h = { ...headers };
    const session = token ?? (user ? signSession(user.id) : null);
    if (session) h.Cookie = `session=${session}${h.Cookie ? `; ${h.Cookie}` : ''}`;
    let payload = body;
    if (json !== undefined) {
      h['Content-Type'] = 'application/json';
      payload = JSON.stringify(json);
    } else if (form) {
      payload = form;
    }
    const response = await fetch(`${baseUrl}${raw ? '' : '/api'}${urlPath}`, { method, headers: h, body: payload });
    const buffer = Buffer.from(await response.arrayBuffer());
    const text = buffer.toString('utf8');
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* not JSON (file bytes, HTML...) */
    }
    return { status: response.status, headers: response.headers, body: parsed, text, buffer };
  }

  // ---- database ------------------------------------------------------------
  async function reset() {
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
    if (tables.length) {
      await prisma.$executeRawUnsafe(`TRUNCATE ${tables.map((r) => `"${r.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`);
    }
  }

  let counter = 0;
  const unique = (prefix) => `${prefix}-${Date.now().toString(36)}-${(counter += 1)}-${randomBytes(2).toString('hex')}`;

  const user = (data = {}) =>
    prisma.user.create({
      data: {
        email: `${unique('user')}@test.local`,
        name: 'Test User',
        passwordHash: 'not-a-real-hash',
        accountType: 'pme',
        ...data,
      },
    });
  const admin = (data = {}) => user({ name: 'Test Admin', role: 'admin', ...data });

  // A formation with real courses. `courses`: [{ title, isRequired, body }].
  async function formation({ title = 'Formation', status = 'published', courses = [{ title: 'Cours 1' }], ...data } = {}) {
    return prisma.formation.create({
      data: {
        slug: unique('formation'),
        title,
        description: 'Description',
        status,
        publishedAt: status === 'published' ? new Date() : null,
        certificationEnabled: true,
        certificationTitle: `Certificat ${title}`,
        courses: {
          create: courses.map((c, index) => ({
            title: c.title ?? `Cours ${index + 1}`,
            body: c.body ?? '<p>Contenu</p>',
            position: index,
            isRequired: c.isRequired ?? true,
          })),
        },
        ...data,
      },
      include: { courses: { orderBy: { position: 'asc' } } },
    });
  }

  // A blog article straight in the database (already sanitised content).
  async function article({ title = 'Article', status = 'published', body = '<p>Contenu de larticle</p>', tags = [], category, author, ...data } = {}) {
    const bodyText = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const created = await prisma.article.create({
      data: {
        slug: unique('article'),
        title,
        excerpt: `Résumé de ${title}`,
        body,
        bodyText,
        status,
        publishedAt: status === 'published' ? new Date() : null,
        authorId: author?.id ?? null,
        categoryId: category?.id ?? null,
        ...data,
      },
    });
    for (const name of tags) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { slug, name } });
      await prisma.articleTag.create({ data: { articleId: created.id, tagId: tag.id } });
    }
    return created;
  }

  // ---- storage -------------------------------------------------------------
  const storedFiles = (dir = 'private') => {
    const full = path.join(storageDir, dir);
    return existsSync(full) ? readdirSync(full) : [];
  };

  async function close() {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
    rmSync(storageDir, { recursive: true, force: true });
  }

  return { baseUrl, prisma, request, reset, user, admin, formation, article, unique, storedFiles, storageDir, signSession, close };
}
