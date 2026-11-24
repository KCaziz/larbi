import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import { useApi } from '../../../lib/useApi.js';
import { formatDate } from '../../../lib/format.js';
import Button from '../../../components/ui/Button.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import '../../entreprise/Business.css';

// P13-05, lot G (2026-11-24): the partners' offers the organisations can
// consult (ECR-0159, 0160), and the follow-up of the requests they send
// (ECR-0161, 0288). Commercial information, dated and sourced; never a
// recommendation.

const TYPES = ['accountant', 'bank', 'leasing', 'insurance', 'microfinance', 'crowdfunding', 'support', 'training', 'institution', 'other'];
const PUBLICS = ['PUB-01', 'PUB-02', 'PUB-03', 'PUB-04', 'PUB-05', 'PUB-06', 'PUB-07', 'PUB-08', 'PUB-09', 'PUB-10'];
const STATUSES = ['sent', 'received', 'in_review', 'answered', 'closed'];
const empty = { partnerName: '', partnerType: 'bank', title: '', description: '', authorization: '', verifiedAt: '', wilayas: '', publics: [], conditions: '', fees: '', sourceUrl: '', contactEmail: '', validUntil: '' };
const iso = (date) => new Date(`${date}T00:00:00.000Z`).toISOString();

export default function PartnersAdminPage() {
  const { t, i18n } = useTranslation();
  const offers = useApi('/admin/partenaires/offres');
  const requests = useApi('/admin/partenaires/demandes');
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState(null);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  if (offers.status === 'loading' && !offers.data) return <LoadingState />;
  if (offers.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={offers.reload} />;

  const run = async (action, okKey, reload) => {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      reload();
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err)) });
      return false;
    }
  };

  return (
    <>
      <PageToolbar title={t('adminPartners.title')} subtitle={t('adminPartners.intro')} />
      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
          {message.text}
        </p>
      )}

      <form
        className="business-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const opt = (v) => (v.trim() ? v.trim() : undefined);
          const body = {
            partnerName: form.partnerName.trim(),
            partnerType: form.partnerType,
            title: form.title.trim(),
            description: form.description.trim(),
            wilayas: form.wilayas.split(',').map((w) => w.trim()).filter(Boolean),
            publics: form.publics,
            ...(opt(form.authorization) ? { authorization: opt(form.authorization) } : {}),
            ...(form.verifiedAt ? { verifiedAt: iso(form.verifiedAt) } : {}),
            ...(opt(form.conditions) ? { conditions: opt(form.conditions) } : {}),
            ...(opt(form.fees) ? { fees: opt(form.fees) } : {}),
            ...(opt(form.sourceUrl) ? { sourceUrl: opt(form.sourceUrl) } : {}),
            ...(opt(form.contactEmail) ? { contactEmail: opt(form.contactEmail) } : {}),
            ...(form.validUntil ? { validUntil: iso(form.validUntil) } : {}),
          };
          if (await run(() => api.post('/admin/partenaires/offres', body), 'adminPartners.created', offers.reload)) setForm(empty);
        }}
      >
        <div className="business-form-row">
          <label>
            {t('adminPartners.partner')}
            <input value={form.partnerName} onChange={set('partnerName')} maxLength={160} required />
          </label>
          <label>
            {t('business.g.partnerType')}
            <select value={form.partnerType} onChange={set('partnerType')}>
              {TYPES.map((k) => (
                <option key={k} value={k}>
                  {t(`business.g.types.${k}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('adminPartners.offerTitle')}
            <input value={form.title} onChange={set('title')} maxLength={200} required />
          </label>
        </div>
        <label>
          {t('adminPartners.description')}
          <textarea className="inv-preview" rows={3} value={form.description} onChange={set('description')} maxLength={5000} required />
        </label>
        <div className="business-form-row">
          <label>
            {t('adminPartners.authorization')}
            <input value={form.authorization} onChange={set('authorization')} maxLength={160} />
          </label>
          <label>
            {t('adminPartners.verifiedAt')}
            <input type="date" value={form.verifiedAt} onChange={set('verifiedAt')} />
          </label>
          <label>
            {t('adminPartners.validUntil')}
            <input type="date" value={form.validUntil} onChange={set('validUntil')} />
          </label>
          <label>
            {t('adminPartners.wilayas')}
            <input value={form.wilayas} onChange={set('wilayas')} placeholder={t('adminPartners.wilayasHint')} />
          </label>
        </div>
        <div className="business-form-row">
          <label>
            {t('adminPartners.conditions')}
            <input value={form.conditions} onChange={set('conditions')} maxLength={5000} />
          </label>
          <label>
            {t('adminPartners.fees')}
            <input value={form.fees} onChange={set('fees')} maxLength={300} />
          </label>
          <label>
            {t('adminPartners.source')}
            <input type="url" value={form.sourceUrl} onChange={set('sourceUrl')} maxLength={300} />
          </label>
          <label>
            {t('adminPartners.contact')}
            <input type="email" value={form.contactEmail} onChange={set('contactEmail')} maxLength={254} />
          </label>
        </div>
        <fieldset className="inv-lines">
          <legend>{t('adminPartners.publics')}</legend>
          {PUBLICS.map((p) => (
            <label key={p} className="pilot-check">
              <input type="checkbox" checked={form.publics.includes(p)} onChange={() => setForm((f) => ({ ...f, publics: f.publics.includes(p) ? f.publics.filter((x) => x !== p) : [...f.publics, p] }))} />
              {t(`business.org.publics.${p}`)}
            </label>
          ))}
        </fieldset>
        <Button type="submit" variant="secondary">
          {t('adminPartners.add')}
        </Button>
      </form>

      <table className="cms-table">
        <caption className="sr-only">{t('adminPartners.title')}</caption>
        <thead>
          <tr>
            <th scope="col">{t('adminPartners.partner')}</th>
            <th scope="col">{t('adminPartners.offerTitle')}</th>
            <th scope="col">{t('adminPartners.requests')}</th>
            <th scope="col">{t('adminPartners.state')}</th>
          </tr>
        </thead>
        <tbody>
          {(offers.data?.offres ?? []).map((o) => (
            <tr key={o.id}>
              <td>
                {o.partnerName} <span className="inv-muted">· {t(`business.g.types.${o.partnerType}`)}</span>
              </td>
              <td>{o.title}</td>
              <td>{o._count.requests}</td>
              <td>
                <Button type="button" variant="ghost" onClick={() => run(() => api.patch(`/admin/partenaires/offres/${o.id}`, { active: !o.active }), 'adminPartners.saved', offers.reload)}>
                  {o.active ? t('adminPartners.deactivate') : t('adminPartners.activate')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{t('adminPartners.requestsTitle')}</h2>
      {(requests.data?.demandes ?? []).length === 0 ? (
        <p className="business-empty">{t('adminPartners.noRequest')}</p>
      ) : (
        <ul className="trade-pieces">
          {requests.data.demandes.map((r) => (
            <li key={r.id}>
              <span>
                <strong>{r.business.name}</strong> → {r.offer.partnerName} · {r.motive}
                <span className="inv-muted">
                  {' '}
                  · {formatDate(i18n.language, r.createdAt)} · {t('adminPartners.shared', { items: r.sharedItems.map((i) => t(`business.g.shareable.${i}`)).join(', ') || '—' })}
                </span>
              </span>
              <span className="dia-actions">
                {r.status === 'withdrawn' ? (
                  <span className="business-document-state">{t('business.g.requestStatuses.withdrawn')}</span>
                ) : (
                  <select
                    aria-label={t('adminPartners.state')}
                    value={r.status}
                    onChange={(e) => {
                      const note = window.prompt(t('adminPartners.note')) ?? undefined;
                      run(() => api.patch(`/admin/partenaires/demandes/${r.id}`, { status: e.target.value, ...(note ? { note } : {}) }), 'adminPartners.saved', requests.reload);
                    }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`business.g.requestStatuses.${s}`)}
                      </option>
                    ))}
                  </select>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
