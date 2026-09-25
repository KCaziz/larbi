import { listActiveAccountTypes } from '../services/accountTypes.service.js';

// Public, read-only: the categories offered at registration and on the
// "my account type" page. Same shape as before P3-15 ({ value, label }) so
// the existing client code did not have to change.
export async function getAccountTypes(req, res) {
  const types = await listActiveAccountTypes();
  res.json(types.map((t) => ({ value: t.slug, label: t.label })));
}
