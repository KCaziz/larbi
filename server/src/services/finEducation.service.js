// The educational layer of a person (P8-17): their profile, their parcours,
// what to learn next. Everything here only READS what the e-learning already
// writes (Enrollment, CourseProgress, Certification) — no table of its own.
import { EDUCATION_PROFILES, EDUCATION_SOURCE, educationProfileByCode } from '../constants/finEducation.js';
import { EDUCATION_PROFILE_CODES, finPublicByCode, isCollectivePublic } from '../constants/finPublics.js';

// How many formations the « recommandées » list shows.
const RECOMMENDED_MAX = 12;

const withLabel = (profile) => ({ ...profile, label: finPublicByCode(profile.code)?.label ?? profile.code });

/** Where a person stands in one formation: done courses over its courses, and its certificate. */
async function standing(prisma, userId, formationId) {
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, formationId },
    select: { id: true, completedAt: true, certification: { select: { certificateNumber: true, issuedAt: true, revokedAt: true } } },
  });
  const total = await prisma.course.count({ where: { formationId } });
  if (!enrollment) return { inscrit: false, termine: false, cours: { faits: 0, total }, certificat: null };
  const done = await prisma.courseProgress.count({ where: { enrollmentId: enrollment.id, status: 'completed' } });
  const certificate = enrollment.certification && !enrollment.certification.revokedAt ? enrollment.certification : null;
  return {
    inscrit: true,
    termine: Boolean(enrollment.completedAt),
    cours: { faits: done, total },
    certificat: certificate ? { numero: certificate.certificateNumber, delivreLe: certificate.issuedAt } : null,
  };
}

export async function educationView(prisma, user) {
  // A profile of the former collective publics, or none yet: the person
  // chooses one of the six (P8-17); until then, the complete library.
  const mustChoose = !user.finPublic || isCollectivePublic(user.finPublic);
  const profile = mustChoose ? educationProfileByCode('AUT') : (educationProfileByCode(user.finPublic) ?? educationProfileByCode('AUT'));

  let parcours = null;
  if (profile.parcours) {
    const formation = await prisma.formation.findFirst({
      where: { slug: profile.parcours.slug, status: 'published' },
      select: { id: true, slug: true, title: true, certificationTitle: true },
    });
    parcours = {
      ...profile.parcours,
      certificat: profile.certificate,
      // Being written by the client (his answer E): said, not hidden.
      formation: formation ? { slug: formation.slug, title: formation.title, ...(await standing(prisma, user.id, formation.id)) } : null,
      statut: formation ? 'publie' : 'en_preparation',
    };
  }

  const formations = await prisma.formation.findMany({
    where: { status: 'published' },
    select: { id: true, slug: true, title: true, subtitle: true, level: true, educationProfiles: true },
    orderBy: { publishedAt: 'desc' },
  });
  // Recommended to this profile first, then to everyone; « autre / libre »
  // is offered the complete library.
  const forProfile = (row) => (row.educationProfiles ?? []).includes(profile.code);
  const forEveryone = (row) => (row.educationProfiles ?? []).length === 0;
  const ordered = profile.code === 'AUT' ? formations : [...formations.filter(forProfile), ...formations.filter((row) => !forProfile(row) && forEveryone(row))];
  const recommended = [];
  for (const row of ordered.filter((item) => item.slug !== parcours?.formation?.slug).slice(0, RECOMMENDED_MAX)) {
    recommended.push({ slug: row.slug, title: row.title, subtitle: row.subtitle, level: row.level, pourVous: forProfile(row), ...(await standing(prisma, user.id, row.id)) });
  }

  return {
    profil: withLabel(profile),
    aChoisir: mustChoose,
    profils: EDUCATION_PROFILES.filter((row) => EDUCATION_PROFILE_CODES.includes(row.code)).map(withLabel),
    parcours,
    recommandees: recommended,
    // Missions (P2-10, taken up again): their scenarios are the client's to
    // write (answer E). Until then the screen says so.
    missions: { statut: 'en_preparation', source: 'client' },
    source: EDUCATION_SOURCE,
  };
}
