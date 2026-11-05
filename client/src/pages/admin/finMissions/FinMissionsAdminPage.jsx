import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api, errorKey } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';
import './FinMissionsAdmin.css';

// The pedagogical missions (P8-17), entered as a form (recette R8-11): a
// mission used to be typed as a raw JSON document. The form builds the same
// document — the SERVER still checks it against the structure before anything
// is stored — and the scoring rule, the same for every mission, is said in
// words, not edited. Amounts are typed in dinars; the document keeps centimes.

const PROFILES = ['LYC', 'ETU', 'JAC', 'SAL', 'EPG', 'AUT'];
const CHOICES_MIN = 2;
const CHOICES_MAX = 5;
const STEPS_MAX = 12;
const BADGES_MAX = 5;

const emptyChoice = () => ({ label: '', explanation: '', cash: '0', savings: '0', resilience: '0' });
const emptyStep = () => ({ prompt: '', choices: [emptyChoice(), emptyChoice()] });
const emptyMission = () => ({ id: null, slug: null, title: '', summary: '', profiles: [], startingAmount: '0', steps: [emptyStep()], badges: [], position: 0 });

const toDinars = (centimes) => String((centimes ?? 0) / 100);
const toCentimes = (text) => {
  const value = Number(String(text ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(value) ? Math.round(value * 100) : null;
};
// A key the server accepts: lower-case words joined by hyphens.
const slugify = (text) =>
  String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'mission';

const fromMission = (mission) => ({
  id: mission.id,
  slug: mission.slug,
  title: mission.title,
  summary: mission.summary,
  profiles: mission.profiles,
  startingAmount: toDinars(mission.startingAmount),
  position: mission.position ?? 0,
  // The keys are kept: attempts already played refer to them.
  steps: mission.steps.map((step) => ({
    key: step.key,
    prompt: step.prompt,
    choices: step.choices.map((choice) => ({ key: choice.key, label: choice.label, explanation: choice.explanation, cash: toDinars(choice.cash), savings: toDinars(choice.savings), resilience: String(choice.resilience) })),
  })),
  badges: mission.badges.map((badge) => ({ key: badge.key, label: badge.label, minResilience: String(badge.minResilience) })),
});

export default function FinMissionsAdminPage() {
  const { t } = useTranslation();
  const list = useApi('/admin/fin-missions');
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState(null);
  const [confirming, setConfirming] = useState(null);

  if (list.status === 'loading' && !list.data) return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  const show = (kind, text) => setMessage({ kind, text });

  async function act(call, okKey) {
    try {
      await call();
      show('ok', t(okKey));
      list.reload();
      return true;
    } catch (err) {
      show('error', t(errorKey(err, { 400: 'admin.missions.invalid', 409: 'admin.missions.slugTaken' })));
      return false;
    }
  }

  async function save(mission) {
    const body = toBody(mission);
    if (typeof body === 'string') {
      show('error', t(body));
      return;
    }
    const ok = await act(() => (mission.id ? api.patch(`/admin/fin-missions/${mission.id}`, body) : api.post('/admin/fin-missions', body)), 'admin.missions.saved');
    if (ok) setEditing(null);
  }

  return (
    <>
      <PageToolbar title={t('admin.missions.title')} subtitle={t('admin.missions.subtitle')}>
        {!editing && (
          <Button type="button" onClick={() => setEditing(emptyMission())}>
            <Plus size={16} aria-hidden="true" /> {t('admin.missions.create')}
          </Button>
        )}
      </PageToolbar>

      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role={message.kind === 'ok' ? 'status' : 'alert'}>
          {message.text}
        </p>
      )}

      {editing ? (
        <MissionForm mission={editing} onChange={setEditing} onSave={save} onCancel={() => setEditing(null)} />
      ) : list.data.missions.length === 0 ? (
        <p className="form-hint">{t('admin.missions.none')}</p>
      ) : (
        <ul className="missions-admin-list">
          {list.data.missions.map((mission) => (
            <li key={mission.id} className="missions-admin-row">
              <div className="missions-admin-main">
                <strong>{mission.title}</strong> <StatusBadge status={mission.status} />
                <p className="form-hint">
                  {t('admin.missions.counts', {
                    steps: mission.steps.length,
                    profiles: mission.profiles.length === 0 ? t('admin.missions.everybody') : mission.profiles.map((code) => t(`admin.missions.profiles.${code}`)).join(', '),
                  })}
                </p>
              </div>
              <div className="missions-admin-actions">
                <Button type="button" variant="secondary" onClick={() => setEditing(fromMission(mission))}>
                  <Pencil size={15} aria-hidden="true" /> {t('admin.missions.edit')}
                </Button>
                {mission.status === 'published' ? (
                  <Button type="button" variant="secondary" onClick={() => act(() => api.post(`/admin/fin-missions/${mission.id}/unpublish`, {}), 'admin.missions.unpublished')}>
                    <EyeOff size={15} aria-hidden="true" /> {t('admin.missions.unpublish')}
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" onClick={() => act(() => api.post(`/admin/fin-missions/${mission.id}/publish`, {}), 'admin.missions.published')}>
                    <Eye size={15} aria-hidden="true" /> {t('admin.missions.publish')}
                  </Button>
                )}
                <Button type="button" variant="secondary" className="missions-admin-danger" onClick={() => setConfirming(mission)}>
                  <Trash2 size={15} aria-hidden="true" /> {t('admin.missions.delete')}
                </Button>
              </div>
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

// The document the server expects, or the key of what is missing.
function toBody(mission) {
  if (!mission.title.trim() || !mission.summary.trim()) return 'admin.missions.errors.titleSummary';
  const startingAmount = toCentimes(mission.startingAmount);
  if (startingAmount === null || startingAmount < 0) return 'admin.missions.errors.amount';
  const steps = [];
  for (const [index, step] of mission.steps.entries()) {
    if (!step.prompt.trim()) return 'admin.missions.errors.prompt';
    const choices = [];
    for (const [rank, choice] of step.choices.entries()) {
      if (!choice.label.trim() || !choice.explanation.trim()) return 'admin.missions.errors.choice';
      const cash = toCentimes(choice.cash);
      const savings = toCentimes(choice.savings);
      const resilience = Number(choice.resilience);
      if (cash === null || savings === null || !Number.isInteger(resilience) || Math.abs(resilience) > 100) return 'admin.missions.errors.effects';
      choices.push({ key: choice.key ?? `choix-${rank + 1}`, label: choice.label.trim(), explanation: choice.explanation.trim(), cash, savings, resilience });
    }
    steps.push({ key: step.key ?? `etape-${index + 1}`, prompt: step.prompt.trim(), choices });
  }
  const badges = [];
  for (const [index, badge] of mission.badges.entries()) {
    const minResilience = Number(badge.minResilience);
    if (!badge.label.trim() || !Number.isInteger(minResilience)) return 'admin.missions.errors.badge';
    badges.push({ key: badge.key ?? `badge-${index + 1}`, label: badge.label.trim(), minResilience });
  }
  return {
    slug: mission.slug ?? slugify(mission.title),
    title: mission.title.trim(),
    summary: mission.summary.trim(),
    profiles: mission.profiles,
    startingAmount,
    currency: 'DZD',
    steps,
    badges,
    position: mission.position ?? 0,
  };
}

function MissionForm({ mission, onChange, onSave, onCancel }) {
  const { t } = useTranslation();
  const set = (patch) => onChange({ ...mission, ...patch });
  const setStep = (index, patch) => set({ steps: mission.steps.map((step, i) => (i === index ? { ...step, ...patch } : step)) });
  const setChoice = (stepIndex, choiceIndex, patch) =>
    setStep(stepIndex, { choices: mission.steps[stepIndex].choices.map((choice, i) => (i === choiceIndex ? { ...choice, ...patch } : choice)) });
  const setBadge = (index, patch) => set({ badges: mission.badges.map((badge, i) => (i === index ? { ...badge, ...patch } : badge)) });

  return (
    <form
      className="missions-admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(mission);
      }}
    >
      <p className="missions-admin-intro">{t('admin.missions.howItWorks')}</p>

      <fieldset>
        <legend>{t('admin.missions.sections.general')}</legend>
        <div className="form-field">
          <label htmlFor="mission-title">{t('admin.missions.fields.title')}</label>
          <input id="mission-title" value={mission.title} maxLength={120} required onChange={(event) => set({ title: event.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="mission-summary">{t('admin.missions.fields.summary')}</label>
          <textarea id="mission-summary" rows={2} value={mission.summary} maxLength={500} required onChange={(event) => set({ summary: event.target.value })} />
        </div>
        <div className="form-field">
          <span className="missions-admin-label">{t('admin.missions.fields.profiles')}</span>
          <div className="missions-admin-checks">
            {PROFILES.map((code) => (
              <label key={code}>
                <input
                  type="checkbox"
                  checked={mission.profiles.includes(code)}
                  onChange={(event) => set({ profiles: event.target.checked ? [...mission.profiles, code] : mission.profiles.filter((row) => row !== code) })}
                />
                {t(`admin.missions.profiles.${code}`)}
              </label>
            ))}
          </div>
          <small className="form-hint">{t('admin.missions.fields.profilesHint')}</small>
        </div>
        <div className="form-field">
          <label htmlFor="mission-amount">{t('admin.missions.fields.startingAmount')}</label>
          <input id="mission-amount" type="number" step="0.01" min="0" value={mission.startingAmount} onChange={(event) => set({ startingAmount: event.target.value })} />
          <small className="form-hint">{t('admin.missions.fields.startingAmountHint')}</small>
        </div>
      </fieldset>

      {mission.steps.map((step, stepIndex) => (
        <fieldset key={stepIndex} className="missions-admin-step">
          <legend>{t('admin.missions.sections.step', { number: stepIndex + 1 })}</legend>
          {mission.steps.length > 1 && (
            <button type="button" className="missions-admin-remove" onClick={() => set({ steps: mission.steps.filter((_, i) => i !== stepIndex) })}>
              <X size={14} aria-hidden="true" /> {t('admin.missions.removeStep')}
            </button>
          )}
          <div className="form-field">
            <label htmlFor={`step-${stepIndex}`}>{t('admin.missions.fields.prompt')}</label>
            <textarea id={`step-${stepIndex}`} rows={2} value={step.prompt} maxLength={400} onChange={(event) => setStep(stepIndex, { prompt: event.target.value })} />
          </div>
          {step.choices.map((choice, choiceIndex) => (
            <div key={choiceIndex} className="missions-admin-choice">
              <div className="missions-admin-choice-head">
                <strong>{t('admin.missions.sections.choice', { number: choiceIndex + 1 })}</strong>
                {step.choices.length > CHOICES_MIN && (
                  <button type="button" className="missions-admin-remove" onClick={() => setStep(stepIndex, { choices: step.choices.filter((_, i) => i !== choiceIndex) })}>
                    <X size={14} aria-hidden="true" /> {t('admin.missions.removeChoice')}
                  </button>
                )}
              </div>
              <div className="missions-admin-grid">
                <div className="form-field missions-admin-wide">
                  <label htmlFor={`choice-${stepIndex}-${choiceIndex}`}>{t('admin.missions.fields.choiceLabel')}</label>
                  <input id={`choice-${stepIndex}-${choiceIndex}`} value={choice.label} maxLength={160} onChange={(event) => setChoice(stepIndex, choiceIndex, { label: event.target.value })} />
                </div>
                <div className="form-field">
                  <label htmlFor={`cash-${stepIndex}-${choiceIndex}`}>{t('admin.missions.fields.cash')}</label>
                  <input id={`cash-${stepIndex}-${choiceIndex}`} type="number" step="0.01" value={choice.cash} onChange={(event) => setChoice(stepIndex, choiceIndex, { cash: event.target.value })} />
                </div>
                <div className="form-field">
                  <label htmlFor={`savings-${stepIndex}-${choiceIndex}`}>{t('admin.missions.fields.savings')}</label>
                  <input id={`savings-${stepIndex}-${choiceIndex}`} type="number" step="0.01" value={choice.savings} onChange={(event) => setChoice(stepIndex, choiceIndex, { savings: event.target.value })} />
                </div>
                <div className="form-field">
                  <label htmlFor={`resilience-${stepIndex}-${choiceIndex}`}>{t('admin.missions.fields.resilience')}</label>
                  <input id={`resilience-${stepIndex}-${choiceIndex}`} type="number" step="1" min="-100" max="100" value={choice.resilience} onChange={(event) => setChoice(stepIndex, choiceIndex, { resilience: event.target.value })} />
                </div>
                <div className="form-field missions-admin-wide">
                  <label htmlFor={`explanation-${stepIndex}-${choiceIndex}`}>{t('admin.missions.fields.explanation')}</label>
                  <textarea id={`explanation-${stepIndex}-${choiceIndex}`} rows={2} value={choice.explanation} maxLength={400} onChange={(event) => setChoice(stepIndex, choiceIndex, { explanation: event.target.value })} />
                </div>
              </div>
            </div>
          ))}
          {step.choices.length < CHOICES_MAX && (
            <Button type="button" variant="secondary" onClick={() => setStep(stepIndex, { choices: [...step.choices, emptyChoice()] })}>
              <Plus size={15} aria-hidden="true" /> {t('admin.missions.addChoice')}
            </Button>
          )}
        </fieldset>
      ))}
      {mission.steps.length < STEPS_MAX && (
        <Button type="button" variant="secondary" onClick={() => set({ steps: [...mission.steps, emptyStep()] })}>
          <Plus size={15} aria-hidden="true" /> {t('admin.missions.addStep')}
        </Button>
      )}

      <fieldset>
        <legend>{t('admin.missions.sections.badges')}</legend>
        <p className="form-hint">{t('admin.missions.badgesHint')}</p>
        {mission.badges.map((badge, index) => (
          <div key={index} className="missions-admin-grid">
            <div className="form-field missions-admin-wide">
              <label htmlFor={`badge-${index}`}>{t('admin.missions.fields.badgeLabel')}</label>
              <input id={`badge-${index}`} value={badge.label} maxLength={60} onChange={(event) => setBadge(index, { label: event.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor={`badge-min-${index}`}>{t('admin.missions.fields.minResilience')}</label>
              <input id={`badge-min-${index}`} type="number" step="1" value={badge.minResilience} onChange={(event) => setBadge(index, { minResilience: event.target.value })} />
            </div>
            <button type="button" className="missions-admin-remove" onClick={() => set({ badges: mission.badges.filter((_, i) => i !== index) })}>
              <X size={14} aria-hidden="true" /> {t('admin.missions.removeBadge')}
            </button>
          </div>
        ))}
        {mission.badges.length < BADGES_MAX && (
          <Button type="button" variant="secondary" onClick={() => set({ badges: [...mission.badges, { label: '', minResilience: '0' }] })}>
            <Plus size={15} aria-hidden="true" /> {t('admin.missions.addBadge')}
          </Button>
        )}
      </fieldset>

      <p className="form-hint">{t('admin.missions.rule')}</p>
      <div className="missions-admin-actions">
        <Button type="submit">{t('admin.missions.save')}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('admin.missions.cancel')}
        </Button>
      </div>
    </form>
  );
}
