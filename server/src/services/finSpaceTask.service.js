// Tasks of a space (P9-06, tab 08, COL-F11 / F12, ALG-C04, QC-07).
//
// A module apart from the finances. A task may point at a shared expense, for
// information, and doing so — or finishing the task — never creates a financial
// movement (QC-07): paying a bill is a shared expense somebody records.
//
// The two indicators are worded as findings, never as judgements: a share of
// the load is what the group has put on a person, not a mark.
import { SPACE_TASK_CATEGORIES, SPACE_TASK_PRIORITIES, SPACE_TASK_RECURRENCES, SPACE_TASK_STATUSES, SPACE_TASKS_MAX } from '../constants/finSpaceTask.js';
import { roleAtLeast } from '../constants/finSpace.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange, recordCorrection } from './finChange.service.js';
import { ownMembership, requireRole } from './finSpace.service.js';
import { liveMembers } from './finShared.service.js';
import { computed } from './finance/contract.js';
import { memberTaskLoad, taskCompletionRate } from './finance/collective.js';

export const SPACE_TASK_ENTITY = 'spaceTask';

const TASK_SELECT = {
  id: true,
  spaceId: true,
  title: true,
  description: true,
  category: true,
  assigneeId: true,
  participants: true,
  dueDate: true,
  priority: true,
  recurrence: true,
  checklist: true,
  weight: true,
  status: true,
  completedAt: true,
  reminderDays: true,
  linkedExpenseId: true,
  createdById: true,
  version: true,
};

const DAY = 24 * 3600 * 1000;

const monthBounds = (month) => {
  const [year, number] = month.split('-').map(Number);
  return { from: new Date(Date.UTC(year, number - 1, 1)), to: new Date(Date.UTC(year, number, 1)) };
};

/**
 * ALG-C04 — the next occurrence of a recurring task: the same task, one period
 * later, to do again. Monthly keeps the day of the month, clamped to the month's
 * last day (a task due on the 31st falls on the 28th of February).
 */
export function nextOccurrence(dueDate, recurrence) {
  if (!dueDate || recurrence === 'none') return null;
  if (recurrence === 'daily') return new Date(dueDate.getTime() + DAY);
  if (recurrence === 'weekly') return new Date(dueDate.getTime() + 7 * DAY);
  const year = dueDate.getUTCFullYear();
  const month = dueDate.getUTCMonth() + 1;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(dueDate.getUTCDate(), lastDay), dueDate.getUTCHours(), dueDate.getUTCMinutes()));
}

export async function listSpaceTasks(prisma, userId, spaceId, { status, month } = {}) {
  await ownMembership(prisma, userId, spaceId);
  const range = month ? monthBounds(month) : null;
  const tasks = await prisma.finSpaceTask.findMany({
    where: {
      spaceId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(range ? { dueDate: { gte: range.from, lt: range.to } } : {}),
    },
    select: TASK_SELECT,
    // Open tasks first, then by due date: what is left to do comes before what is done.
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    take: SPACE_TASKS_MAX,
  });
  return tasks;
}

async function checkPeople(prisma, spaceId, { assigneeId, participants = [], linkedExpenseId }) {
  const members = await liveMembers(prisma, spaceId);
  const ids = new Set(members.map((member) => member.id));
  if (assigneeId !== undefined && !ids.has(assigneeId)) {
    throw new HttpError(422, 'The person in charge is not a member of this space', { reason: 'unknownAssignee' });
  }
  if (participants.some((id) => !ids.has(id))) {
    throw new HttpError(422, 'A participant is not a member of this space', { reason: 'unknownParticipant' });
  }
  if (linkedExpenseId) {
    const expense = await prisma.finSharedExpense.findFirst({ where: { id: linkedExpenseId, spaceId, deletedAt: null }, select: { id: true } });
    if (!expense) throw new HttpError(422, 'The linked expense is not in this space', { reason: 'unknownExpense' });
  }
}

export async function createSpaceTask(prisma, userId, spaceId, body) {
  const me = await requireRole(prisma, userId, spaceId, 'member');
  await checkPeople(prisma, spaceId, body);
  return prisma.$transaction(async (tx) => {
    const task = await tx.finSpaceTask.create({
      data: {
        spaceId,
        title: body.title,
        description: body.description ?? null,
        category: body.category,
        assigneeId: body.assigneeId,
        participants: body.participants ?? [],
        dueDate: body.dueDate ?? null,
        priority: body.priority ?? 'normal',
        recurrence: body.recurrence ?? 'none',
        checklist: body.checklist ?? [],
        weight: body.weight ?? 1,
        reminderDays: body.reminderDays ?? null,
        linkedExpenseId: body.linkedExpenseId ?? null,
        createdById: me.id,
      },
      select: TASK_SELECT,
    });
    await recordChange(tx, { userId, entity: SPACE_TASK_ENTITY, entityId: task.id, action: 'create', after: { spaceId, title: task.title, assigneeId: task.assigneeId } });
    return task;
  });
}

async function editableTask(prisma, userId, spaceId, id) {
  const me = await requireRole(prisma, userId, spaceId, 'member');
  const task = await prisma.finSpaceTask.findFirst({ where: { id, spaceId, deletedAt: null }, select: TASK_SELECT });
  if (!task) throw new HttpError(404, 'Task not found');
  // Whoever it is on, whoever created it, or an admin: a task on somebody else
  // is not rewritten by a third member.
  const allowed = task.assigneeId === me.id || task.createdById === me.id || (task.participants ?? []).includes(me.id) || roleAtLeast(me.role, 'admin');
  if (!allowed) throw new HttpError(403, 'Only the person in charge, a participant, whoever created it, or an admin may change this task', { reason: 'notYours' });
  return task;
}

export async function updateSpaceTask(prisma, userId, spaceId, id, body) {
  const task = await editableTask(prisma, userId, spaceId, id);
  await checkPeople(prisma, spaceId, body);
  const { reason, ...fields } = body;
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finSpaceTask.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: TASK_SELECT });
    await recordCorrection(tx, { userId, entity: SPACE_TASK_ENTITY, entityId: id, before: task, after: updated, reason: reason ?? null });
    return updated;
  });
}

/**
 * Finishes a task. A recurring one comes back as its next occurrence (ALG-C04),
 * checklist unticked — a new task, so what was done stays done.
 */
export async function completeSpaceTask(prisma, userId, spaceId, id) {
  const task = await editableTask(prisma, userId, spaceId, id);
  if (task.status === 'done') throw new HttpError(409, 'This task is already done', { reason: 'alreadyDone' });
  if (task.status === 'cancelled') throw new HttpError(409, 'A cancelled task cannot be finished', { reason: 'cancelled' });
  const next = nextOccurrence(task.dueDate, task.recurrence);
  return prisma.$transaction(async (tx) => {
    const done = await tx.finSpaceTask.update({ where: { id }, data: { status: 'done', completedAt: new Date(), version: { increment: 1 } }, select: TASK_SELECT });
    await recordChange(tx, { userId, entity: SPACE_TASK_ENTITY, entityId: id, action: 'correct', field: 'status', before: task.status, after: 'done' });
    let following = null;
    if (next) {
      following = await tx.finSpaceTask.create({
        data: {
          spaceId,
          title: task.title,
          description: task.description,
          category: task.category,
          assigneeId: task.assigneeId,
          participants: task.participants ?? [],
          dueDate: next,
          priority: task.priority,
          recurrence: task.recurrence,
          checklist: (task.checklist ?? []).map((item) => ({ ...item, done: false })),
          weight: task.weight,
          reminderDays: task.reminderDays,
          linkedExpenseId: null,
          createdById: task.createdById,
        },
        select: TASK_SELECT,
      });
      await recordChange(tx, { userId, entity: SPACE_TASK_ENTITY, entityId: following.id, action: 'create', after: { spaceId, title: following.title, from: id } });
    }
    return { task: done, next: following };
  });
}

export async function deleteSpaceTask(prisma, userId, spaceId, id, { reason } = {}) {
  await editableTask(prisma, userId, spaceId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finSpaceTask.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: SPACE_TASK_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

/**
 * COL-F11 and COL-F12 over the tasks due in a month. Cancelled tasks are left
 * out of both: a task nobody does any more is neither done nor owed.
 */
export async function spaceTaskStats(prisma, userId, spaceId, month) {
  await ownMembership(prisma, userId, spaceId);
  const range = monthBounds(month);
  const [members, tasks] = await Promise.all([
    liveMembers(prisma, spaceId),
    prisma.finSpaceTask.findMany({
      where: { spaceId, deletedAt: null, status: { not: 'cancelled' }, dueDate: { gte: range.from, lt: range.to } },
      select: { assigneeId: true, weight: true, status: true },
    }),
  ]);
  const now = new Date();
  const done = tasks.filter((task) => task.status === 'done').length;
  const allWeights = tasks.map((task) => task.weight);
  return {
    month,
    tauxTerminees: computed('COL-F11', taskCompletionRate(done, tasks.length), { inputs: { terminees: done, echues_ou_planifiees: tasks.length, periode: month }, now }),
    charge: members.map((member) => {
      const own = tasks.filter((task) => task.assigneeId === member.id);
      return {
        memberId: member.id,
        name: member.displayName ?? member.user?.name ?? null,
        tasks: own.length,
        weight: own.reduce((sum, task) => sum + task.weight, 0),
        charge: computed('COL-F12', memberTaskLoad(own.map((task) => task.weight), allWeights), {
          inputs: { poids_membre: own.reduce((sum, task) => sum + task.weight, 0), poids_total: allWeights.reduce((sum, weight) => sum + weight, 0), periode: month },
          now,
        }),
      };
    }),
  };
}

export const TASK_VOCABULARY = {
  categories: SPACE_TASK_CATEGORIES,
  priorities: SPACE_TASK_PRIORITIES,
  recurrences: SPACE_TASK_RECURRENCES,
  statuses: SPACE_TASK_STATUSES,
};
