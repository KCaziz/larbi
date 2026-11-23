import { CORE_KEYS, getAllSettings, upsertSetting } from '../../services/settings.service.js';

export async function listSettings(req, res) {
  // Only the settings of the form (P13-05: the regulatory answers have their own route).
  const rows = (await getAllSettings()).filter((r) => CORE_KEYS.includes(r.key));
  res.json({ settings: rows.map((r) => ({ key: r.key, value: r.value, updatedAt: r.updatedAt })) });
}

// Changes the value of one of the known settings (see CORE_KEYS).
export async function upsertSettingRoute(req, res) {
  const setting = await upsertSetting(req.body.key, req.body.value);
  res.json({ setting: { key: setting.key, value: setting.value, updatedAt: setting.updatedAt } });
}
