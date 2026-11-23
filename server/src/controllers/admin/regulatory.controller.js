import { REGULATORY_KEYS } from '../../constants/regulatoryParams.js';
import { confirmRegulatoryParam, listRegulatoryParams } from '../../services/regulatoryParams.service.js';
import { checkRegulatoryValue } from '../../validation/regulatoryParams.schemas.js';
import { HttpError } from '../../utils/httpError.js';

// P13-05: the regulatory values the client is asked to confirm.
export async function listRegulatory(req, res) {
  res.json(await listRegulatoryParams());
}

export async function confirmRegulatory(req, res) {
  const { key } = req.params;
  if (!REGULATORY_KEYS.includes(key)) throw new HttpError(404, 'Unknown parameter');
  const value = checkRegulatoryValue(key, req.body.value);
  if (value === null) throw new HttpError(422, 'Invalid value', { reason: 'invalidValue' });
  const decision = await confirmRegulatoryParam(key, { value, effectiveFrom: req.body.effectiveFrom }, req.user.id);
  res.json({ key, status: 'confirmed', value: decision.value, effectiveFrom: decision.effectiveFrom, confirmedAt: decision.confirmedAt });
}
