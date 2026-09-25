import { prisma } from '../../config/prisma.js';
import { CORE_KEYS, getAllSettings, upsertSetting } from '../../services/settings.service.js';
import { HttpError } from '../../utils/httpError.js';

export async function listSettings(req, res) {
  const rows = await getAllSettings();
  res.json({ settings: rows.map((r) => ({ key: r.key, value: r.value, core: CORE_KEYS.includes(r.key), updatedAt: r.updatedAt })) });
}

// Creates the key if it does not exist yet, otherwise changes its value: this
// single endpoint is what makes the store extensible (a brand new key needs no
// migration and no new route).
export async function upsertSettingRoute(req, res) {
  const setting = await upsertSetting(req.body.key, req.body.value);
  res.json({ setting: { key: setting.key, value: setting.value, core: CORE_KEYS.includes(setting.key), updatedAt: setting.updatedAt } });
}

// A core key stays available for the toggle / fields the admin UI always shows;
// only a key an admin added themselves can be removed.
export async function deleteSetting(req, res) {
  if (CORE_KEYS.includes(req.params.key)) throw new HttpError(409, 'This setting cannot be deleted');
  await prisma.platformSetting.delete({ where: { key: req.params.key } });
  res.status(204).end();
}
