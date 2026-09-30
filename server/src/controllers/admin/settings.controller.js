import { getAllSettings, upsertSetting } from '../../services/settings.service.js';

export async function listSettings(req, res) {
  const rows = await getAllSettings();
  res.json({ settings: rows.map((r) => ({ key: r.key, value: r.value, updatedAt: r.updatedAt })) });
}

// Changes the value of one of the four known settings (see CORE_KEYS).
export async function upsertSettingRoute(req, res) {
  const setting = await upsertSetting(req.body.key, req.body.value);
  res.json({ setting: { key: setting.key, value: setting.value, updatedAt: setting.updatedAt } });
}
