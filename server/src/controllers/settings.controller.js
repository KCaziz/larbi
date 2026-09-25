import { getPublicSettings } from '../services/settings.service.js';

// Public, read-only: what the frontend needs before knowing who is asking
// (maintenance banner, contact details in the footer / contact page).
export async function getPublicSettingsRoute(req, res) {
  res.set('Cache-Control', 'no-store');
  res.json(await getPublicSettings());
}
