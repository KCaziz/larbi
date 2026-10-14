import { prisma } from '../config/prisma.js';
import { createChild, deleteChild, listChildren, updateChild } from '../services/finChild.service.js';

// A household's children (P6-15, famille): minimal data.

export async function getChildren(req, res) {
  res.json({ children: await listChildren(prisma, req.user.id, req.params.id) });
}

export async function postChild(req, res) {
  res.status(201).json({ child: await createChild(prisma, req.user.id, req.params.id, req.body) });
}

export async function patchChild(req, res) {
  res.json({ child: await updateChild(prisma, req.user.id, req.params.id, req.params.childId, req.body) });
}

export async function removeChild(req, res) {
  res.json(await deleteChild(prisma, req.user.id, req.params.id, req.params.childId));
}
