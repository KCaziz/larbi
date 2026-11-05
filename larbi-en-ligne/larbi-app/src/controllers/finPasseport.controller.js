import { prisma } from '../config/prisma.js';
import { KNOWLEDGE_DIMENSIONS, KNOWLEDGE_INDEX_BLOCKED, passeportTitleKey } from '../constants/finPasseport.js';
import { buildKnowledgeDimensions, buildNextSteps, listCompletedFormations, listPassedQuizzes } from '../services/finPasseport.service.js';
import { describeFormula } from '../services/finance/describe.js';
import { educationView } from '../services/finEducation.service.js';

// Passeport de connaissances financières (P2-09), écrans LY11/LY12/ET09.
// Jamais un score bancaire, jamais une mesure de solvabilité — la mention du
// client, répétée par le contrôleur et par l'interface.

export function getPasseportReferences(req, res) {
  res.json({ formulas: ['F052'].map(describeFormula), dimensions: KNOWLEDGE_DIMENSIONS });
}

export async function getPasseport(req, res) {
  const userId = req.user.id;
  const [dimensions, formations, nextSteps, quizzes] = await Promise.all([
    buildKnowledgeDimensions(prisma, userId),
    listCompletedFormations(prisma, userId),
    buildNextSteps(prisma, userId),
    listPassedQuizzes(prisma, userId),
  ]);
  res.json({
    titre: passeportTitleKey(req.user.finPublic),
    dimensions,
    // Dit à l'écran, pas seulement ici : jamais un jugement sur la personne.
    indiceConnaissances: KNOWLEDGE_INDEX_BLOCKED,
    formationsTerminees: formations,
    etapesSuivantes: nextSteps,
    quizReussis: quizzes,
    calculeLe: new Date().toISOString(),
  });
}

// The educational layer of this person (P8-17): their profile, their parcours
// and where they stand in it, the formations recommended to them.
export async function getEducation(req, res) {
  res.json(await educationView(prisma, req.user));
}
