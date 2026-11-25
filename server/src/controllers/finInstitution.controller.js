import { prisma } from '../config/prisma.js';
import {
  addOwnLesson,
  createOwnFormation,
  createSession,
  listOwnFormations,
  listSessions,
  markAttendance,
  publishOwnFormation,
  removeOwnLesson,
  setOwnQuiz,
  updateSession,
} from '../services/finInstitutionTraining.service.js';

// P13-05, lot I bis: an institution's own courses and sessions (ECR-0294). Every
// route checks, in the service, that the person is a member of that space.

export async function getOwnFormations(req, res) {
  res.json({ formations: await listOwnFormations(prisma, req.user, req.params.id) });
}

export async function postOwnFormation(req, res) {
  res.status(201).json({ formation: await createOwnFormation(prisma, req.user, req.params.id, req.body) });
}

export async function postOwnLesson(req, res) {
  res.status(201).json({ formation: await addOwnLesson(prisma, req.user, req.params.id, req.params.sub, req.body) });
}

export async function deleteOwnLesson(req, res) {
  res.json({ formation: await removeOwnLesson(prisma, req.user, req.params.id, req.params.sub, req.params.lesson) });
}

export async function putOwnQuiz(req, res) {
  res.json({ formation: await setOwnQuiz(prisma, req.user, req.params.id, req.params.sub, req.body) });
}

export async function putOwnPublish(req, res) {
  res.json({ formation: await publishOwnFormation(prisma, req.user, req.params.id, req.params.sub, req.body.publish) });
}

export async function getSessions(req, res) {
  res.json({ sessions: await listSessions(prisma, req.user, req.params.id) });
}

export async function postSession(req, res) {
  res.status(201).json({ sessions: await createSession(prisma, req.user, req.params.id, req.body) });
}

export async function putSession(req, res) {
  res.json({ sessions: await updateSession(prisma, req.user, req.params.id, req.params.sub, req.body) });
}

export async function putAttendance(req, res) {
  res.json({ sessions: await markAttendance(prisma, req.user, req.params.id, req.params.sub, req.body) });
}
