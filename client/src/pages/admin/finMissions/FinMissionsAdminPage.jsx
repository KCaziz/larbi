import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';

// The pedagogical missions (P8-17), entered from the client's contents (his
// answer E). A mission is one JSON document — its steps, their choices with
// their effects and explanations, its badges — which the SERVER checks against
// the structure before anything is stored; the errors it finds are shown as
// they are. The scoring rule is the same for every mission and is not edited here.
const EXAMPLE = {
  slug: 'mon-premier-salaire',
  title: 'Mon premier salaire',
  summary: 'Quelques choix sur une somme fictive.',
  profiles: ['LYC'],
  startingAmount: 5000000,
  currency: 'DZD',
  steps: [
    {
      key: 'loyer',
      prompt: 'Le loyer arrive. Que fais-tu ?',
      choices: [
        { key: 'payer', label: 'Je le paie tout de suite', cash: -2000000, savings: 0, resilience: 20, explanation: 'Une charge fixe payée à temps évite les pénalités.' },
        { key: 'attendre', label: 'J’attends la fin du mois', cash: 0, savings: 0, resilience: -10, explanation: 'Un retard coûte plus qu’il ne rapporte.' },
      ],
    },
  ],
  badges: [{ key: 'en-route', label: 'En route', minResilience: 20 }],
};

export default function FinMissionsAdminPage() {
  const { t } = useTranslation();
  const list = useApi('/admin/fin-missions');
  const [editing, setEditing] = useState(null); // { id | null, text }
  const [message, setMessage] = useState(null);
  const [confirming, setConfirming] = useState(null);

  if (list.status === 'loading' && !list.data) return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  const show = (kind, text) => setMessage({ kind, text });
  const failure = (err) => {
    // The server's own words, as they are: a field path and what is wrong.
    const details = err?.details?.issues ?? err?.details ?? null;
    show('error', `${err?.message ?? t('state.loadError')}${details ? ` — ${JSON.stringify(details)}` : ''}`);
  };

  async function save(event) {
    event.preventDefault();
    let body;
    try {
      body = JSON.parse(editing.text);
    } catch {
      show('error', t('admin.missions.notJson'));
      return;
    }
    try {
      if (editing.id) await api.patch(`/admin/fin-missions/${editing.id}`, body);
      else await api.post('/admin/fin-missions', body);
      show('ok', t('admin.missions.saved'));
      setEditing(null);
      list.reload();
    } catch (err) {
      failure(err);
    }
  }

  async function act(call, okKey) {
    try {
      await call();
      show('ok', t(okKey));
      list.reload();
    } catch (err) {
      failure(err);
    }
  }

  return (
    <>
      <PageToolbar title={t('admin.missions.title')} subtitle={t('admin.missions.subtitle')}>
        <Button type="button" onClick={() => setEditing({ id: null, text: JSON.stringify(EXAMPLE, null, 2) })}>
          <Plus size={16} aria-hidden="true" /> {t('admin.missions.create')}
        </Button>
      </PageToolbar>

      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role={message.kind === 'ok' ? 'status' : 'alert'}>
          {message.text}
        </p>
      )}

      {editing && (
        <form onSubmit={save} className="fa-admin-form">
          <label htmlFor="mission-json">{t('admin.missions.json')}</label>
          <textarea id="mission-json" rows={22} spellCheck={false} value={editing.text} onChange={(event) => setEditing({ ...editing, text: event.target.value })} style={{ fontFamily: 'monospace', inlineSize: '100%' }} />
          <p className="form-hint">{t('admin.missions.rule')}</p>
          <div className="fa-admin-actions">
            <Button type="submit">{t('admin.missions.save')}</Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              {t('admin.missions.cancel')}
            </Button>
          </div>
        </form>
      )}

      {list.data.missions.length === 0 ? (
        <p className="form-hint">{t('admin.missions.none')}</p>
      ) : (
        <ul className="fa-admin-list">
          {list.data.missions.map((mission) => (
            <li key={mission.id}>
              <span>
                <strong>{mission.title}</strong> <code>{mission.slug}</code> <StatusBadge status={mission.status} />
                <span className="form-hint"> {t('admin.missions.counts', { steps: mission.steps.length, profiles: mission.profiles.length === 0 ? t('admin.missions.everybody') : mission.profiles.join(', ') })}</span>
              </span>
              <span className="fa-admin-actions">
                <button type="button" onClick={() => setEditing({ id: mission.id, text: JSON.stringify({ slug: mission.slug, title: mission.title, summary: mission.summary, profiles: mission.profiles, startingAmount: mission.startingAmount, currency: mission.currency, steps: mission.steps, badges: mission.badges, position: mission.position }, null, 2) })} aria-label={t('admin.missions.edit')}>
                  <Pencil size={15} aria-hidden="true" />
                </button>
                {mission.status === 'published' ? (
                  <button type="button" onClick={() => act(() => api.post(`/admin/fin-missions/${mission.id}/unpublish`, {}), 'admin.missions.unpublished')} aria-label={t('admin.missions.unpublish')}>
                    <EyeOff size={15} aria-hidden="true" />
                  </button>
                ) : (
                  <button type="button" onClick={() => act(() => api.post(`/admin/fin-missions/${mission.id}/publish`, {}), 'admin.missions.published')} aria-label={t('admin.missions.publish')}>
                    <Eye size={15} aria-hidden="true" />
                  </button>
                )}
                <button type="button" onClick={() => setConfirming(mission)} aria-label={t('admin.missions.delete')}>
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title={t('admin.missions.delete')}
        confirmLabel={t('admin.missions.delete')}
        danger
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          const id = confirming.id;
          setConfirming(null);
          act(() => api.delete(`/admin/fin-missions/${id}`), 'admin.missions.deleted');
        }}
      >
        {confirming && t('admin.missions.deleteConfirm', { title: confirming.title })}
      </ConfirmDialog>
    </>
  );
}
