import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Download, ShieldCheck, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import './Trust.css';

// Trust and data centre (P6-19), screen C25. Lifts the "droit à l'effacement"
// point: account deletion is complete and immediate (decided 2026-10-11,
// P6-01 point 9) — there is no retention period to explain here because none
// exists in this platform.
export default function TrustCenterPage() {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('trust.title'), t('trust.intro'));

  const inventory = useApi('/fin/confiance/inventaire');
  const completeness = useApi('/fin/confiance/completude');
  const consents = useApi('/fin/confiance/consentements');
  const devices = useApi('/fin/confiance/appareils');

  function announce(kind, text) {
    setMessage({ kind, text });
  }

  async function withdrawSharing(spaceId, kind, currentPassword) {
    try {
      await api.post('/fin/confiance/consentements/retirer-partage', { spaceId, kind, currentPassword });
      announce('ok', t('trust.consents.withdrawn'));
      consents.reload();
      return true;
    } catch (err) {
      announce('error', t(errorKey(err, { 403: 'trust.errors.wrongPassword' })));
      return false;
    }
  }

  if (inventory.status === 'loading' && !inventory.data) return <LoadingState />;
  if (inventory.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={inventory.reload} />;

  return (
    <>
      <PageHeader icon={ShieldCheck} title={t('trust.title')} subtitle={t('trust.intro')} />
      <div className="trust-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        <h2>{t('trust.inventoryTitle')}</h2>
        <ul className="trust-inventory">
          {inventory.data.tables.filter((table) => table.count > 0).map((table) => (
            <li key={table.label}>
              <span className="trust-inventory-label">{t(`trust.tables.${table.label}`)}</span>
              <span className="trust-inventory-count">{table.count}</span>
              <span className="trust-inventory-detail">
                {t('trust.inventoryDetail', {
                  from: formatDate(i18n.language, table.premiereCollecte),
                  to: formatDate(i18n.language, table.derniereCollecte),
                })}
              </span>
            </li>
          ))}
          {inventory.data.tables.every((table) => table.count === 0) && <Notice variant="info">{t('trust.noData')}</Notice>}
        </ul>

        {completeness.data && (
          <>
            <h2>{t('trust.completenessTitle')}</h2>
            <p className="fin-hint">{t('trust.completenessDisclaimer')}</p>
            <p className="trust-completeness-value">{Math.round(completeness.data.ratio * 100)} %</p>
            <ul className="trust-completeness-list">
              {completeness.data.checks.map((check) => (
                <li key={check.key} className={check.done ? 'trust-check-done' : 'trust-check-missing'}>
                  {t(`trust.completenessChecks.${check.key}`)}
                </li>
              ))}
            </ul>
          </>
        )}

        {consents.data && (
          <>
            <h2>{t('trust.consents.title')}</h2>
            <ul className="trust-consent-list">
              {consents.data.textes.map((text) => (
                <li key={text.textKey}>
                  {t(`trust.consents.texts.${text.textKey}`)} — {formatDate(i18n.language, text.acceptedAt)}
                  {!text.current && <span className="trust-tag">{t('trust.consents.outdated')}</span>}
                </li>
              ))}
            </ul>

            {consents.data.partages.length > 0 ? (
              <ul className="trust-consent-list">
                {consents.data.partages.map((p) => (
                  <ShareConsentRow key={`${p.spaceId}-${p.kind}`} partage={p} t={t} onWithdraw={withdrawSharing} />
                ))}
              </ul>
            ) : (
              <p className="fin-hint">{t('trust.consents.noSharing')}</p>
            )}
          </>
        )}

        <h2>{t('trust.devicesTitle')}</h2>
        {devices.data && !devices.data.disponible && <Notice variant="info">{t('trust.devicesUnavailable')}</Notice>}

        <h2>{t('trust.exportTitle')}</h2>
        <p className="fin-hint">{t('trust.exportHint')}</p>
        <ExportForm t={t} onDone={(text) => announce('ok', text)} onError={(text) => announce('error', text)} />

        <h2 className="trust-danger-title">{t('trust.deleteTitle')}</h2>
        <Notice variant="action-needed">{t('trust.deletePolicy')}</Notice>
        <DeleteAccountForm
          t={t}
          userEmail={auth.user?.email}
          onError={(text) => announce('error', text)}
          onDone={async () => {
            await auth.logout();
            navigate('/');
          }}
        />
      </div>
    </>
  );
}

function ShareConsentRow({ partage, t, onWithdraw }) {
  const [asking, setAsking] = useState(false);
  const [password, setPassword] = useState('');

  return (
    <li>
      <span>
        {t(`spaces.dataKinds.${partage.kind}`)} → {partage.spaceLabel} ({t(`trust.consents.levels.${partage.level}`)})
      </span>
      {!asking ? (
        <button type="button" className="trust-plain" onClick={() => setAsking(true)}>
          {t('trust.consents.withdraw')}
        </button>
      ) : (
        <form
          className="trust-inline-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const ok = await onWithdraw(partage.spaceId, partage.kind, password);
            if (ok) setAsking(false);
            setPassword('');
          }}
        >
          <label className="sr-only" htmlFor={`withdraw-pwd-${partage.spaceId}-${partage.kind}`}>
            {t('trust.currentPassword')}
          </label>
          <input
            id={`withdraw-pwd-${partage.spaceId}-${partage.kind}`}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('trust.currentPassword')}
            required
          />
          <Button type="submit" variant="secondary">
            {t('trust.confirm')}
          </Button>
        </form>
      )}
    </li>
  );
}

function ExportForm({ t, onDone, onError }) {
  const [asking, setAsking] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await api.post('/fin/confiance/export', { consent: true, currentPassword: password });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mes-donnees-fincludia.json';
      link.click();
      URL.revokeObjectURL(url);
      onDone(t('trust.exported'));
      setAsking(false);
      setPassword('');
    } catch (err) {
      onError(t(errorKey(err, { 403: 'trust.errors.wrongPassword' })));
    } finally {
      setBusy(false);
    }
  }

  if (!asking) {
    return (
      <Button onClick={() => setAsking(true)}>
        <Download size={16} aria-hidden="true" /> {t('trust.export')}
      </Button>
    );
  }

  return (
    <form className="trust-inline-form" onSubmit={submit}>
      <label className="sr-only" htmlFor="export-password">
        {t('trust.currentPassword')}
      </label>
      <input id="export-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('trust.currentPassword')} required />
      <Button type="submit" disabled={busy}>
        {t('trust.confirm')}
      </Button>
      <button type="button" className="trust-plain" onClick={() => setAsking(false)}>
        {t('trust.cancel')}
      </button>
    </form>
  );
}

function DeleteAccountForm({ t, userEmail, onDone, onError }) {
  const [asking, setAsking] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!window.confirm(t('trust.deleteConfirm'))) return;
    setBusy(true);
    try {
      await api.post('/fin/confiance/suppression', { consent: true, currentPassword: password, email });
      await onDone();
    } catch (err) {
      onError(t(errorKey(err, { 403: 'trust.errors.wrongPassword', 422: 'trust.errors.emailMismatch' })));
      setBusy(false);
    }
  }

  if (!asking) {
    return (
      <Button variant="secondary" onClick={() => setAsking(true)}>
        <Trash2 size={16} aria-hidden="true" /> {t('trust.delete')}
      </Button>
    );
  }

  return (
    <form className="trust-delete-form" onSubmit={submit}>
      <div className="fin-field">
        <label htmlFor="delete-email">{t('trust.typeEmail', { email: userEmail })}</label>
        <input id="delete-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </div>
      <div className="fin-field">
        <label htmlFor="delete-password">{t('trust.currentPassword')}</label>
        <input id="delete-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </div>
      <div className="trust-inline-form">
        <Button type="submit" variant="secondary" disabled={busy}>
          {t('trust.confirm')}
        </Button>
        <button type="button" className="trust-plain" onClick={() => setAsking(false)}>
          {t('trust.cancel')}
        </button>
      </div>
    </form>
  );
}
