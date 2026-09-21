// Demo data for local development. NEVER for production.
//
//   npm run db:seed            creates (or recreates) the demo data
//   npm run db:seed -- --clean removes the demo data only
//
// Everything created here is recognisable and removable without touching real
// data: accounts end with "@demo.larbi.test", other records have a slug that
// starts with "demo-" (newsletter subscribers: same @demo.larbi.test domain). Running it twice gives the same result.
//
// Accounts (password in the table printed at the end):
//   admin@demo.larbi.test     admin     -> the CMS (/admin)
//   standard@demo.larbi.test  learner   -> standard access, formation in progress
//   premium@demo.larbi.test   learner   -> premium access, formation completed + certificate
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';
import { generateCertificateNumber } from '../src/services/certificate.service.js';
import { bodyToText } from '../src/services/article.service.js';
import { sanitizeRichText } from '../src/services/sanitize.service.js';

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed: NODE_ENV=production.');
  process.exit(1);
}

const DEMO_DOMAIN = '@demo.larbi.test';
const ADMIN_PASSWORD = 'Admin-Demo-2026';
const LEARNER_PASSWORD = 'Learner-Demo-2026';
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function clean() {
  const users = { email: { endsWith: DEMO_DOMAIN } };
  // Enrolments (and their progress / certificates) go with the users; formations
  // that still have enrolments from real accounts are kept by RESTRICT.
  await prisma.user.deleteMany({ where: users });
  await prisma.newsletterSubscriber.deleteMany({ where: users });
  await prisma.article.deleteMany({ where: { slug: { startsWith: 'demo-' } } });
  await prisma.formation.deleteMany({ where: { slug: { startsWith: 'demo-' } } });
  await prisma.articleCategory.deleteMany({ where: { slug: { startsWith: 'demo-' } } });
  await prisma.tag.deleteMany({ where: { slug: { startsWith: 'demo-' } } });
  await prisma.formationCategory.deleteMany({ where: { slug: { startsWith: 'demo-' } } });
}

const html = (value) => sanitizeRichText(value);

// `chapters`: [{ title, courses: [lesson...] }]. Lessons get their global position (chapters
// first, then the order inside the chapter), exactly as the CMS writes them.
async function createFormation({ slug, title, subtitle, description, level, pedagogy, status, categoryId, authorId, certification, chapters }) {
  const formation = await prisma.formation.create({
    data: {
      slug,
      title,
      subtitle: subtitle ?? null,
      description,
      level: pedagogy?.level ?? null,
      objectives: pedagogy?.objectives ?? [],
      prerequisites: pedagogy?.prerequisites ?? [],
      status,
      requiredAccessLevel: level,
      categoryId,
      createdById: authorId,
      certificationEnabled: certification !== null,
      certificationTitle: certification?.title ?? null,
      certificationDescription: certification?.description ?? null,
      createdAt: daysAgo(21),
      publishedAt: status === 'published' ? daysAgo(20) : null,
    },
  });
  let position = 0;
  for (const [chapterIndex, chapter] of chapters.entries()) {
    const section = await prisma.section.create({
      data: { formationId: formation.id, title: chapter.title, description: chapter.description ?? null, position: chapterIndex },
    });
    for (const c of chapter.courses) {
      const course = await prisma.course.create({
        data: {
          formationId: formation.id,
          sectionId: section.id,
          position: position++,
          title: c.title,
          summary: c.summary,
          body: html(c.body),
          isRequired: c.required !== false,
          estimatedMinutes: c.minutes,
        },
      });
      // The lesson is written with blocks (P3-12): its text first, then the extra blocks.
      const blocks = [{ type: 'text', data: { html: html(c.body) } }, ...(c.blocks ?? [])];
      await prisma.lessonBlock.createMany({
        data: blocks.map((block, blockPosition) => ({ courseId: course.id, position: blockPosition, type: block.type, data: block.data })),
      });
    }
  }
  return prisma.formation.findUnique({
    where: { id: formation.id },
    include: { courses: { orderBy: { position: 'asc' } } },
  });
}

async function main() {
  await clean();
  if (process.argv.includes('--clean')) {
    console.log('Demo data removed.');
    return;
  }

  // ------------------------------------------------------------------ users
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const learnerHash = await bcrypt.hash(LEARNER_PASSWORD, 10);
  const admin = await prisma.user.create({
    data: { email: `admin${DEMO_DOMAIN}`, passwordHash: adminHash, name: 'Admin Démo', accountType: 'pme', accessLevel: 'premium', role: 'admin' },
  });
  const standard = await prisma.user.create({
    data: { email: `standard${DEMO_DOMAIN}`, passwordHash: learnerHash, name: 'Sofia Standard', accountType: 'pmi', accessLevel: 'standard' },
  });
  const premium = await prisma.user.create({
    data: { email: `premium${DEMO_DOMAIN}`, passwordHash: learnerHash, name: 'Karim Premium', accountType: 'pme', accessLevel: 'premium' },
  });

  // ------------------------------------------------------------- formations
  const finance = await prisma.formationCategory.create({ data: { slug: 'demo-finance', name: 'Finance' } });
  const gestion = await prisma.formationCategory.create({ data: { slug: 'demo-gestion', name: 'Gestion' } });

  const compta = await createFormation({
    slug: 'demo-comptabilite-de-base',
    title: 'Comptabilité de base',
    subtitle: 'Tenir les comptes d’une petite entreprise, pas à pas',
    description: 'Comprendre les bases de la comptabilité d’une petite entreprise : journal, bilan et compte de résultat.',
    pedagogy: {
      level: 'beginner',
      objectives: ['Comprendre à quoi sert la comptabilité', 'Enregistrer une opération au journal', 'Lire un bilan et un compte de résultat'],
      prerequisites: ['Aucun : cette formation s’adresse aux débutants'],
    },
    level: 'standard',
    status: 'published',
    categoryId: finance.id,
    authorId: admin.id,
    certification: { title: 'Certificat en comptabilité de base', description: 'Atteste que le titulaire a suivi tous les cours obligatoires.' },
    chapters: [
      {
        title: 'Les fondations',
        description: 'À quoi sert la comptabilité et comment on enregistre une opération.',
        courses: [
          { title: 'Introduction à la comptabilité', summary: 'À quoi sert la comptabilité ?', minutes: 15, body: '<h2>Pourquoi tenir une comptabilité ?</h2><p>La comptabilité donne une <strong>image fidèle</strong> de la situation de votre entreprise.</p><ul><li>Suivre les recettes et les dépenses</li><li>Respecter les obligations légales</li><li>Prendre de meilleures décisions</li></ul>' },
          { title: 'Le journal et le grand livre', summary: 'Enregistrer chaque opération.', minutes: 25,
            blocks: [
              { type: 'callout', data: { variant: 'tip', title: 'À retenir', html: '<p>Chaque écriture a <strong>autant de débit que de crédit</strong>.</p>' } },
              { type: 'table', data: { headers: ['Compte', 'Débit', 'Crédit'], rows: [['512 Banque', '1 200,00', ''], ['706 Prestations', '', '1 200,00']], caption: 'Exemple : encaissement d’une facture' } },
              { type: 'code', data: { language: 'sql', code: "SELECT compte, SUM(debit) - SUM(credit) AS solde\nFROM ecritures\nGROUP BY compte;", caption: 'Calculer le solde de chaque compte' } },
              { type: 'quote', data: { text: 'La comptabilité est le langage des affaires.', author: 'Proverbe' } },
              { type: 'resources', data: { title: 'Pour aller plus loin', items: [{ label: 'Plan comptable', url: 'https://example.org/plan-comptable', description: 'Liste des comptes' }] } },
            ],
            body: '<h2>Le journal</h2><p>Chaque opération est enregistrée <em>chronologiquement</em> avec un débit et un crédit.</p><p>Le grand livre regroupe ensuite ces écritures par compte.</p>' },
        ],
      },
      {
        title: 'Lire les documents de synthèse',
        description: 'Le bilan, le compte de résultat et pour aller plus loin.',
        courses: [
          { title: 'Le bilan et le compte de résultat', summary: 'Lire les deux documents de synthèse.', minutes: 30, body: '<h2>Le bilan</h2><p>Photographie du patrimoine à une date donnée : ce que possède l’entreprise et ce qu’elle doit.</p><h2>Le compte de résultat</h2><p>Il mesure le bénéfice ou la perte sur une période.</p>' },
          { title: 'Aller plus loin : lectures conseillées', summary: 'Cours bonus, non obligatoire.', minutes: 10, required: false, body: '<p>Quelques pistes pour approfondir : plan comptable, TVA, amortissements.</p>' },
        ],
      },
    ],
  });
  await createFormation({
    slug: 'demo-fiscalite-avancee',
    title: 'Fiscalité avancée pour PME',
    subtitle: 'Optimiser légalement la fiscalité de son entreprise',
    description: 'Optimiser légalement la fiscalité de son entreprise. Formation réservée aux comptes premium.',
    pedagogy: {
      level: 'advanced',
      objectives: ['Comparer les régimes d’imposition', 'Identifier les charges déductibles', 'Préparer un contrôle fiscal'],
      prerequisites: ['Connaître les bases de la comptabilité', 'Avoir une entreprise ou un projet de création'],
    },
    level: 'premium',
    status: 'published',
    categoryId: finance.id,
    authorId: admin.id,
    certification: { title: 'Certificat en fiscalité avancée', description: 'Valide la maîtrise des régimes fiscaux courants.' },
    chapters: [
      {
        title: 'Régimes et charges',
        courses: [
          { title: 'Les régimes d’imposition', summary: 'Comparer les régimes.', minutes: 30, body: '<h2>Choisir son régime</h2><p>Le régime dépend de la forme juridique et du chiffre d’affaires.</p>' },
          { title: 'Charges déductibles', summary: 'Ce que l’on peut déduire.', minutes: 25, body: '<p>Toute dépense engagée dans l’intérêt de l’entreprise et justifiée peut, en principe, être déduite.</p>' },
        ],
      },
      {
        title: 'Contrôle fiscal',
        courses: [{ title: 'Préparer un contrôle', summary: 'Bons réflexes.', minutes: 20, body: '<ol><li>Classer les justificatifs</li><li>Garder les contrats</li><li>Répondre dans les délais</li></ol>' }],
      },
    ],
  });
  await createFormation({
    slug: 'demo-brouillon-tresorerie',
    title: 'Gestion de trésorerie (en révision)',
    subtitle: 'Prévoir ses encaissements et ses décaissements',
    description: 'Formation en préparation : en attente de relecture, pas encore dans le catalogue.',
    pedagogy: { level: 'intermediate', objectives: ['Construire un plan de trésorerie'], prerequisites: [] },
    level: 'standard',
    status: 'in_review',
    categoryId: gestion.id,
    authorId: admin.id,
    certification: null,
    chapters: [{ title: 'Le plan de trésorerie', courses: [{ title: 'Prévoir ses encaissements', summary: 'Plan de trésorerie.', minutes: 20, body: '<p>Contenu en cours de rédaction.</p>' }] }],
  });
  await createFormation({
    slug: 'demo-ancienne-formation',
    title: 'Ancienne formation (archivée)',
    description: 'Retirée du catalogue : les inscrits gardent leur accès.',
    level: 'standard',
    status: 'archived',
    categoryId: gestion.id,
    authorId: admin.id,
    certification: null,
    chapters: [{ title: 'Contenu', courses: [{ title: 'Leçon d’archive', summary: 'Ancien contenu.', minutes: 5, body: '<p>Contenu conservé.</p>' }] }],
  });

  // ------------------------------------------------------------ enrolments
  const [c1, c2, c3] = compta.courses;

  // Sofia: enrolled, first lesson done, second one opened.
  const sofia = await prisma.enrollment.create({ data: { userId: standard.id, formationId: compta.id, enrolledAt: daysAgo(5) } });
  await prisma.courseProgress.createMany({
    data: [
      { enrollmentId: sofia.id, courseId: c1.id, formationId: compta.id, status: 'completed', openedAt: daysAgo(5), completedAt: daysAgo(4) },
      { enrollmentId: sofia.id, courseId: c2.id, formationId: compta.id, status: 'in_progress', openedAt: daysAgo(2) },
    ],
  });

  // Karim: finished every required lesson and holds a certificate.
  const karim = await prisma.enrollment.create({
    data: { userId: premium.id, formationId: compta.id, enrolledAt: daysAgo(15), status: 'completed', completedAt: daysAgo(8) },
  });
  await prisma.courseProgress.createMany({
    data: [c1, c2, c3].map((c, i) => ({
      enrollmentId: karim.id, courseId: c.id, formationId: compta.id, status: 'completed', openedAt: daysAgo(14 - i), completedAt: daysAgo(14 - i),
    })),
  });
  const certificate = await prisma.certification.create({
    data: {
      certificateNumber: generateCertificateNumber(),
      enrollmentId: karim.id,
      holderName: premium.name,
      formationTitle: compta.title,
      certificationTitle: 'Certificat en comptabilité de base',
      issuedAt: daysAgo(8),
    },
  });

  // ------------------------------------------------------------------- blog
  const blogCat = await prisma.articleCategory.create({ data: { slug: 'demo-conseils', name: 'Conseils' } });
  const blogCat2 = await prisma.articleCategory.create({ data: { slug: 'demo-actualites', name: 'Actualités' } });
  const tagGestion = await prisma.tag.create({ data: { slug: 'demo-gestion', name: 'gestion' } });
  const tagFiscalite = await prisma.tag.create({ data: { slug: 'demo-fiscalite', name: 'fiscalité' } });

  const articles = [
    { slug: 'demo-5-erreurs-de-tresorerie', title: '5 erreurs de trésorerie à éviter', excerpt: 'Les pièges les plus fréquents des petites entreprises.', cat: blogCat.id, tags: [tagGestion.id], status: 'published', age: 12, target: ['pme'], body: '<p>La trésorerie est le nerf de la guerre. Voici les <strong>cinq erreurs</strong> les plus courantes.</p><ol><li>Confondre bénéfice et trésorerie</li><li>Ne pas relancer les factures</li><li>Ignorer les échéances fiscales</li><li>Mélanger comptes personnels et professionnels</li><li>Ne pas prévoir de marge de sécurité</li></ol>' },
    { slug: 'demo-calendrier-fiscal', title: 'Le calendrier fiscal de l’année', excerpt: 'Toutes les dates à retenir pour ne rien oublier.', cat: blogCat2.id, tags: [tagFiscalite.id], status: 'published', age: 6, level: 'premium', target: ['pmi', 'pme'], body: '<h2>Les grandes échéances</h2><p>Déclarations, acomptes, régularisations : notez-les dès le début de l’année.</p><blockquote>Une échéance manquée coûte souvent plus cher que la préparer à l’avance.</blockquote>' },
    { slug: 'demo-choisir-un-outil-de-facturation', title: 'Bien choisir son outil de facturation', excerpt: 'Les critères qui comptent vraiment.', cat: blogCat.id, tags: [tagGestion.id, tagFiscalite.id], status: 'published', age: 2, target: ['pmi', 'auto-entrepreneur'], body: '<p>Facturation conforme, export comptable, simplicité : trois critères pour comparer les solutions.</p>' },
    { slug: 'demo-article-brouillon', title: 'Article en cours de rédaction', excerpt: 'Brouillon visible seulement dans le CMS.', cat: blogCat.id, tags: [], status: 'draft', age: 0, body: '<p>Ce texte n’est pas encore publié.</p>' },
  ];
  for (const a of articles) {
    const body = html(a.body);
    await prisma.article.create({
      data: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        body,
        bodyText: bodyToText(body),
        status: a.status,
        // createdAt is backdated too: a publication date can never precede creation.
        createdAt: daysAgo(a.age + 1),
        publishedAt: a.status === 'published' ? daysAgo(a.age) : null,
        // Visibility by profile (P3-04): the premium article is a teaser for standard accounts.
        requiredAccessLevel: a.level ?? 'standard',
        targetAccountTypes: a.target ?? [],
        categoryId: a.cat,
        authorId: admin.id,
        tags: { create: a.tags.map((tagId) => ({ tagId })) },
      },
    });
  }

  // ------------------------------------------------------------- newsletter
  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: `abonne1${DEMO_DOMAIN}`, status: 'confirmed', confirmedAt: daysAgo(10), locale: 'fr' },
      { email: `abonne2${DEMO_DOMAIN}`, status: 'confirmed', confirmedAt: daysAgo(3), locale: 'en' },
      { email: `attente${DEMO_DOMAIN}`, status: 'pending' },
      { email: `parti${DEMO_DOMAIN}`, status: 'unsubscribed', confirmedAt: daysAgo(20), unsubscribedAt: daysAgo(2) },
    ],
  });

  console.log('\nDemo data created.\n');
  console.table([
    { compte: `admin${DEMO_DOMAIN}`, mot_de_passe: ADMIN_PASSWORD, role: 'admin (CMS /admin)', niveau: 'premium' },
    { compte: `standard${DEMO_DOMAIN}`, mot_de_passe: LEARNER_PASSWORD, role: 'apprenant', niveau: 'standard' },
    { compte: `premium${DEMO_DOMAIN}`, mot_de_passe: LEARNER_PASSWORD, role: 'apprenant', niveau: 'premium' },
  ]);
  console.log(`Numéro de certificat de démonstration : ${certificate.certificateNumber}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
