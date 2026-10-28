// The four flows of the engine (P8-27: « les différencier entre les
// différents flux »): income, expense, transfer and savings, each with its own
// colour (`--flow-*` in index.css), the same on every screen. Setting money
// aside for a goal is savings, not spending (PB-F004/PB-F005): a movement on a
// `goal` category, or a transfer to a goal's account, is shown as savings.
export const FLOWS = ['income', 'expense', 'transfer', 'savings'];

export function flowOf(movement, category = null) {
  if (category?.family === 'goal') return 'savings';
  if (movement.transferId || movement.kind === 'transfer_in' || movement.kind === 'transfer_out') return 'transfer';
  if (movement.kind === 'income' || movement.inflow === true) return 'income';
  return 'expense';
}

// The class that sets `--flow` for an element and its children.
export const flowClass = (flow) => `flow flow-${flow}`;
