import { prisma } from '../config/prisma.js';

export async function createContactMessage(req, res, next) {
  try {
    const { name, email, message } = req.body;
    await prisma.contactMessage.create({ data: { name, email, message } });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}
