import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../utils/httpError.js';

// Payment administration (P3-09): offers (prices come from the client, typed in
// here) and a READ-ONLY list of orders. No action on an order from here: its
// status only ever changes through authentic provider notifications.

const offerRow = (o) => ({
  id: o.id,
  name: o.name,
  description: o.description,
  amount: o.amount,
  currency: o.currency,
  accessLevel: o.accessLevel,
  isActive: o.isActive,
  position: o.position,
  orderCount: o._count?.orders ?? 0,
});

export async function listOffersAdmin(req, res) {
  const offers = await prisma.paymentOffer.findMany({ orderBy: [{ position: 'asc' }, { createdAt: 'asc' }], include: { _count: { select: { orders: true } } } });
  res.json({ offers: offers.map(offerRow) });
}

export async function createOffer(req, res) {
  const last = await prisma.paymentOffer.aggregate({ _max: { position: true } });
  const created = await prisma.paymentOffer.create({ data: { ...req.body, position: (last._max.position ?? -1) + 1 } });
  res.status(201).json({ offer: offerRow(created) });
}

// Changing a price only affects orders created afterwards: existing orders keep
// the amount they were created with.
export async function updateOffer(req, res) {
  const offer = await prisma.paymentOffer.findUnique({ where: { id: req.params.id } });
  if (!offer) throw new HttpError(404, 'Not found');
  const updated = await prisma.paymentOffer.update({ where: { id: offer.id }, data: req.body, include: { _count: { select: { orders: true } } } });
  res.json({ offer: offerRow(updated) });
}

// An offer that was ever ordered is kept for accounting: deactivate it instead.
export async function deleteOffer(req, res) {
  const offer = await prisma.paymentOffer.findUnique({ where: { id: req.params.id }, include: { _count: { select: { orders: true } } } });
  if (!offer) throw new HttpError(404, 'Not found');
  if (offer._count.orders > 0) throw new HttpError(409, 'Offer has orders', { orders: offer._count.orders });
  await prisma.paymentOffer.delete({ where: { id: offer.id } });
  res.status(204).end();
}

export async function listOrdersAdmin(req, res) {
  const orders = await prisma.paymentOrder.findMany({
    where: req.query.status ? { status: req.query.status } : {},
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { user: { select: { id: true, email: true, name: true } }, offer: { select: { id: true, name: true } } },
  });
  res.json({
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      amount: o.amount,
      currency: o.currency,
      accessLevel: o.accessLevel,
      provider: o.provider,
      user: o.user,
      offer: o.offer,
      createdAt: o.createdAt,
      paidAt: o.paidAt,
      refundedAt: o.refundedAt,
    })),
  });
}
