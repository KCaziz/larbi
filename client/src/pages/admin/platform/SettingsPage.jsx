import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';
import { api, errorKey } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import Field from '../../../components/cms/Field.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import Notice from '../../../components/ui/Notice.jsx';
import './Platform.css';

// The four settings the rest of the application actually reads (P3-16): a fixed
// form, not a free-form key/value store — a setting nothing reads is not worth
// having, so a new one needs a real field here, not just a row in a table.
function CoreSettings({ settings, onSaved }) {
  const { t } = useTranslation();
  const byKey = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  const [form, setForm] = useState({
    maintenanceMode: byKey.maintenanceMode === 'true',
    contactEmail: byKey.contactEmail ?? '',
    contactPhone: byKey.contactPhone ?? '',
    contactAddress: byKey.contactAddress ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await Promise.all([
        api.post('/admin/settings', { key: 'maintenanceMode', value: String(form.maintenanceMode) }),
        api.post('/admin/settings', { key: 'contactEmail', value: form.contactEmail.trim() }),
        api.post('/admin/settings', { key: 'contactPhone', value: form.contactPhone.trim() }),
        api.post('/admin/settings', { key: 'contactAddress', value: form.contactAddress.trim() }),
      ]);
      setSaved(true);
      onSaved();
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-settings-grid" onSubmit={save}>
      <div className="admin-toggle-row">
        <label className="cms-check">
          <input
            type="checkbox"
            checked={form.maintenanceMode}
            onChange={(e) => setForm((f) => ({ ...f, maintenanceMode: e.target.checked }))}
          />
          {t('admin.settings.maintenanceMode')}
        </label>
      </div>
      <p className="cms-muted">{t('admin.settings.maintenanceModeHint')}</p>
      {form.maintenanceMode && <Notice variant="action-needed">{t('admin.settings.maintenanceModeActive')}</Notice>}

      <Field label={t('admin.settings.contactEmail')} htmlFor="s-email">
        <input id="s-email" type="email" maxLength={254} value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} />
      </Field>
      <Field label={t('admin.settings.contactPhone')} htmlFor="s-phone">
        <input id="s-phone" type="tel" maxLength={40} value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} />
      </Field>
      <Field label={t('admin.settings.contactAddress')} htmlFor="s-address">
        <textarea id="s-address" rows={2} maxLength={300} value={form.contactAddress} onChange={(e) => setForm((f) => ({ ...f, contactAddress: e.target.value }))} />
      </Field>

      {error && (
        <p className="cms-inline-message error" role="alert">
          {error}
        </p>
      )}
      {saved && !error && <p className="cms-inline-message">{t('admin.settings.saved')}</p>}
      <Button type="submit" disabled={saving}>
        <Save size={16} strokeWidth={1.9} aria-hidden="true" />
        {saving ? t('state.sending') : t('admin.settings.save')}
      </Button>
    </form>
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const list = useApi('/admin/settings');

  return (
    <>
      <PageToolbar title={t('admin.settings.title')} subtitle={t('admin.settings.subtitle')} />
      <div className="admin-panel">
        {list.status === 'loading' && <LoadingState />}
        {list.status === 'error' && <ErrorState message={t('admin.settings.loadError')} onRetry={list.reload} />}
        {list.status === 'ready' && <CoreSettings settings={list.data.settings} onSaved={list.reload} />}
      </div>
    </>
  );
}
