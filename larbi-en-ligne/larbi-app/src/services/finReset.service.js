// P11-01 — start again: erase ALL one's financial data, or only some parts of
// it (debts, budgets…). The profile, the settings, the learning and the shared
// spaces stay. The erasure is real (like the account deletion it is a part
// of), so the journal lines of what is erased go with it. A transfer touched by
// the erasure is removed on both sides, so the balance of an account that is
// kept stays right.

export const RESET_PARTS = ['movements', 'accounts', 'incomes', 'calendar', 'budgets', 'goals', 'debts', 'wealth', 'paper', 'categories'];

// The journal entities each part erases.
const ENTITIES = {
  movements: ['transaction', 'occurrence'],
  accounts: ['account', 'transaction'],
  incomes: ['income', 'recurrence'],
  calendar: ['recurrence', 'provision'],
  budgets: ['budget', 'envelope'],
  goals: ['goal'],
  debts: ['debt', 'account', 'transaction'],
  wealth: ['asset'],
  paper: [],
  categories: ['category'],
};

// How many rows each part would erase: shown before anything is done.
export async function resetPreview(prisma, userId) {
  const loanAccounts = await prisma.finDebt.findMany({ where: { userId, accountId: { not: null } }, select: { accountId: true } });
  const [movements, accounts, incomes, calendar, provisions, budgets, goals, debts, wealth, paper, categories] = await Promise.all([
    prisma.finTransaction.count({ where: { userId, deletedAt: null } }),
    prisma.finAccount.count({ where: { userId, deletedAt: null } }),
    prisma.finIncome.count({ where: { userId, deletedAt: null } }),
    prisma.finRecurrence.count({ where: { userId, deletedAt: null, kind: { not: 'income' } } }),
    prisma.finProvision.count({ where: { userId, deletedAt: null } }),
    prisma.finBudget.count({ where: { userId, deletedAt: null } }),
    prisma.finGoal.count({ where: { userId, deletedAt: null } }),
    prisma.finDebt.count({ where: { userId, deletedAt: null } }),
    prisma.finAsset.count({ where: { userId, deletedAt: null } }),
    prisma.finPaperTrade.count({ where: { portfolio: { userId } } }),
    prisma.finCategory.count({ where: { userId, deletedAt: null } }),
  ]);
  return {
    parts: { movements, accounts, incomes, calendar: calendar + provisions, budgets, goals, debts, wealth, paper, categories },
    loanAccounts: loanAccounts.length,
  };
}

// Deletes the movements of some accounts, with the other side of each of their transfers.
async function deleteMovementsOf(tx, userId, where) {
  const rows = await tx.finTransaction.findMany({ where: { userId, ...where }, select: { id: true, transferId: true } });
  const transferIds = [...new Set(rows.map((row) => row.transferId).filter(Boolean))];
  const { count } = await tx.finTransaction.deleteMany({ where: { userId, OR: [{ id: { in: rows.map((row) => row.id) } }, ...(transferIds.length ? [{ transferId: { in: transferIds } }] : [])] } });
  return count;
}

export async function resetData(prisma, userId, parts) {
  const wanted = new Set(parts.includes('all') ? RESET_PARTS : parts);
  const done = {};
  await prisma.$transaction(async (tx) => {
    if (wanted.has('debts')) {
      // A loan's own account (P8-13) goes with it, and so do its transfers.
      const loans = await tx.finDebt.findMany({ where: { userId }, select: { accountId: true } });
      const accountIds = loans.map((row) => row.accountId).filter(Boolean);
      if (accountIds.length) await deleteMovementsOf(tx, userId, { accountId: { in: accountIds } });
      done.debts = (await tx.finDebt.deleteMany({ where: { userId } })).count;
      if (accountIds.length) await tx.finAccount.deleteMany({ where: { userId, id: { in: accountIds } } });
    }
    if (wanted.has('movements') || wanted.has('accounts')) {
      await tx.finOccurrence.deleteMany({ where: { userId } });
      done.movements = await deleteMovementsOf(tx, userId, {});
    }
    if (wanted.has('accounts')) {
      // Goals, debts and recurrences keep existing: they only lose their account.
      done.accounts = (await tx.finAccount.deleteMany({ where: { userId } })).count;
    }
    if (wanted.has('incomes')) {
      await tx.finRecurrence.deleteMany({ where: { userId, kind: 'income' } });
      done.incomes = (await tx.finIncome.deleteMany({ where: { userId } })).count;
    }
    if (wanted.has('calendar')) {
      done.calendar = (await tx.finRecurrence.deleteMany({ where: { userId, kind: { not: 'income' } } })).count + (await tx.finProvision.deleteMany({ where: { userId } })).count;
    }
    if (wanted.has('budgets')) {
      await tx.finEnvelope.deleteMany({ where: { userId } });
      done.budgets = (await tx.finBudget.deleteMany({ where: { userId } })).count;
    }
    if (wanted.has('goals')) done.goals = (await tx.finGoal.deleteMany({ where: { userId } })).count;
    if (wanted.has('wealth')) done.wealth = (await tx.finAsset.deleteMany({ where: { userId } })).count;
    if (wanted.has('paper')) done.paper = (await tx.finPaperPortfolio.deleteMany({ where: { userId } })).count;
    if (wanted.has('categories')) done.categories = (await tx.finCategory.deleteMany({ where: { userId } })).count;
    const entities = [...new Set([...wanted].flatMap((part) => ENTITIES[part] ?? []))];
    if (entities.length) await tx.finChange.deleteMany({ where: { userId, entity: { in: entities } } });
  });
  return done;
}
