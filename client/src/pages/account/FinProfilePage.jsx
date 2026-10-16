import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import Button from '../../components/ui/Button.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';
import './FinProfile.css';

// FINCLUDIA onboarding and profile (P3-18, screen C02): "Profil principal;
// tranche d'âge; situation; intention principale; horizon", "Continuer / Je ne
// sais pas / Modifier plus tard" — every field stays optional, nothing is asked
// before the person accepts the two FINCLUDIA texts (confidentialité, pas de
// conseil réglementé). The public picked here only decides which FINCLUDIA
// experience is proposed: no financial data is involved.
export default function FinProfilePage() {
  const { t } = useTranslation();
  const profile = useApi('/profile/fin');
  const transitions = useApi('/profile/fin/transitions');
  // The confirmation lives HERE, not in the form: saving reloads the profile,
  // and the first save also changes the form's key (finOnboardedAt stops being
  // null), so a message held by the form was destroyed before anyone read it.
  const [saved, setSaved] = useState(false);

  // Only the FIRST load replaces the page: a refresh after saving keeps what is
  // on screen instead of flashing it away.
  if (profile.status === 'loading' && !profile.data) return <LoadingState />;
  if (profile.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={profile.reload} />;

  return (
    <div className="fin-profile-page">
      <h2 className="account-heading">{t('account.fin.title')}</h2>
      <p>{t('account.fin.intro')}</p>
      {/* Keyed on the loaded profile: a fresh local copy is seeded once per
          load/reload, with no effect needed to sync it afterwards. */}
      {saved && (
        <p className="form-status" role="status">
          {t('account.fin.saved')}
        </p>
      )}
      <FinProfileForm
        key={profile.data.profile.finOnboardedAt ?? 'new'}
        initial={profile.data.profile}
        onSaved={() => {
          setSaved(true);
          profile.reload();
          transitions.reload();
        }}
      />
      {transitions.status === 'ready' && transitions.data.transitions.length > 0 && (
        <FinTransitions transitions={transitions.data.transitions} />
      )}
      <Notice variant="info">{t('account.fin.footNote')}</Notice>
    </div>
  );
}

function FinProfileForm({ initial, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => ({
    finPublic: initial.finPublic ?? '',
    finSecondaryPublics: initial.finSecondaryPublics ?? [],
    finAgeRange: initial.finAgeRange ?? '',
    finCountry: initial.finCountry ?? '',
    finSituation: initial.finSituation ?? '',
    finMainIntention: initial.finMainIntention ?? '',
    finHorizon: initial.finHorizon ?? '',
  }));
  const [acceptConsents, setAcceptConsents] = useState(false);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const consented = initial.consented;
  const toggleSecondary = (code) =>
    setForm((f) => ({
      ...f,
      finSecondaryPublics: f.finSecondaryPublics.includes(code) ? f.finSecondaryPublics.filter((c) => c !== code) : [...f.finSecondaryPublics, code],
    }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      const body = {
        finPublic: form.finPublic || null,
        finSecondaryPublics: form.finSecondaryPublics,
        finAgeRange: form.finAgeRange || null,
        finCountry: form.finCountry || null,
        finSituation: form.finSituation.trim() || null,
        finMainIntention: form.finMainIntention.trim() || null,
        finHorizon: form.finHorizon.trim() || null,
      };
      if (!consented) body.acceptConsents = true;
      await api.put('/profile/fin', body);
      // Announced by the page, which survives the reload this triggers.
      onSaved();
    } catch (err) {
      setStatus({ kind: 'error', text: t(errorKey(err, { 403: 'account.fin.consentRequired' })) });
    } finally {
      setSaving(false);
    }
  };

  const publics = t('account.fin.publics', { returnObjects: true });
  const ageRanges = t('account.fin.ageRanges', { returnObjects: true });

  return (
    <form className="fin-profile-form form-card" onSubmit={submit}>
      <div className="form-field">
        <label htmlFor="fin-public">{t('account.fin.publicLabel')}</label>
        <select id="fin-public" value={form.finPublic} onChange={(e) => setForm((f) => ({ ...f, finPublic: e.target.value }))}>
          <option value="">{t('account.fin.notSure')}</option>
          {publics.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
        <small className="form-hint">{t('account.fin.publicHint')}</small>
      </div>

      {form.finPublic && (
        <fieldset className="fin-secondary-field">
          <legend>{t('account.fin.secondaryLabel')}</legend>
          <div className="fin-secondary-options">
            {publics
              .filter(({ code }) => code !== form.finPublic)
              .map(({ code, label }) => (
                <label key={code} className="fin-secondary-option">
                  <input type="checkbox" checked={form.finSecondaryPublics.includes(code)} onChange={() => toggleSecondary(code)} />
                  {label}
                </label>
              ))}
          </div>
        </fieldset>
      )}

      <div className="form-field">
        <label htmlFor="fin-age">{t('account.fin.ageLabel')}</label>
        <select id="fin-age" value={form.finAgeRange} onChange={(e) => setForm((f) => ({ ...f, finAgeRange: e.target.value }))}>
          <option value="">{t('account.fin.notSure')}</option>
          {ageRanges.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="fin-grid">
        <div className="form-field">
          <label htmlFor="fin-situation">{t('account.fin.situationLabel')}</label>
          <input id="fin-situation" maxLength={120} value={form.finSituation} onChange={(e) => setForm((f) => ({ ...f, finSituation: e.target.value }))} />
        </div>
        <div className="form-field">
          <label htmlFor="fin-intention">{t('account.fin.intentionLabel')}</label>
          <input id="fin-intention" maxLength={120} value={form.finMainIntention} onChange={(e) => setForm((f) => ({ ...f, finMainIntention: e.target.value }))} />
        </div>
        <div className="form-field">
          <label htmlFor="fin-horizon">{t('account.fin.horizonLabel')}</label>
          <input id="fin-horizon" maxLength={60} value={form.finHorizon} onChange={(e) => setForm((f) => ({ ...f, finHorizon: e.target.value }))} />
        </div>
      </div>

      {!consented && (
        <div className="fin-consents">
          <p>{t('account.fin.consentIntro')}</p>
          <ul>
            <li>{t('account.fin.consentPrivacy')}</li>
            <li>{t('account.fin.consentNoAdvice')}</li>
          </ul>
          <label className="fin-consent-checkbox">
            <input type="checkbox" checked={acceptConsents} onChange={(e) => setAcceptConsents(e.target.checked)} required />
            {t('account.fin.consentAccept')}
          </label>
        </div>
      )}

      {status && (
        <p className={`form-status ${status.kind === 'error' ? 'form-status-error' : ''}`} role={status.kind === 'error' ? 'alert' : 'status'}>
          {status.text}
        </p>
      )}

      <Button type="submit" disabled={saving || (!consented && !acceptConsents)}>
        {saving ? t('state.sending') : t('account.fin.save')}
      </Button>
    </form>
  );
}

function FinTransitions({ transitions }) {
  const { t, i18n } = useTranslation();
  const publics = t('account.fin.publics', { returnObjects: true });
  const labelOf = (code) => publics.find((p) => p.code === code)?.label ?? code;
  return (
    <section className="fin-transitions">
      <h3>{t('account.fin.transitionsTitle')}</h3>
      <ul>
        {transitions.map((tr) => (
          <li key={tr.id}>{t('account.fin.transitionLine', { from: labelOf(tr.fromPublic), to: labelOf(tr.toPublic), date: formatDate(i18n.language, tr.createdAt) })}</li>
        ))}
      </ul>
    </section>
  );
}
