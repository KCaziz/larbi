import { ACCOUNT_TYPES } from '../constants/accountTypes.js';

export function getAccountTypes(req, res) {
  res.json(ACCOUNT_TYPES);
}
