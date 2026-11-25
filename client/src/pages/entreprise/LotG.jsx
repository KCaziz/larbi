import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Handshake, Plus, Rocket, Send, Users, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate, formatRatio } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { currentOrganisation, newIdempotencyKey } from '../../lib/organisation.js';
import Button from '../../components/ui/Button.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';

// P13-05, lot G (2026-11-24): partners (ECR-0159 to 0161), crowdfunding
// preparation (ECR-0301 to 0306), human resources without payroll
// (ECR-0272, 0273, 0278). FINCLUDIA neither lends, nor collects, nor pays.

const today = () => new Date().toISOString().slice(0, 10);
const iso = (date) => new Date(`${date}T00:00:00.000Z`).toISOString();
const PARTNER_TYPES = ['accountant', 'bank', 'leasing', 'insurance', 'microfinance', 'crowdfunding', 'support', 'training', 'institution', 'other'];
const SHAREABLE = ['profile', 'dashboard', 'receivables', 'cashPlan', 'documents', 'projects'];

// ---- partners ------------------------------------------------------------------

export function PartnersSection({ business, can, run }) {
  const { t, i18n } = useTranslation();
  const [type, setType] = useState('');
  const [chosen, setChosen] = useState(null);
  const query = type ? new URLSearchParams({ type }).toString() : '';
  const offers = useApi(`/fin/entreprise/partenaires?${query}`);
  const requests = useApi(can('partners.request') ? '/fin/entreprise/partenaires/demandes' : null);
  const reload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) requests.reload();
    return done;
  };
  const list = offers.data?.offres ?? [];

  return (
    <section aria-labelledby="business-partners">
      <h2 id="business-partners">
        <Handshake size={18} aria-hidden="true" /> {t('business.g.partnersTitle')}
      </h2>
      <p className="business-blocked-intro">{t('business.g.partnersIntro')}</p>
      <label className="pilot-inline">
        {t('business.g.partnerType')}
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">{t('business.g.allTypes')}</option>
          {PARTNER_TYPES.map((k) => (
            <option key={k} value={k}>
              {t(`business.g.types.${k}`)}
            </option>
          ))}
        </select>
      </label>
      {offers.status === 'loading' && !offers.data ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <p className="business-empty">{t('business.g.noOffer')}</p>
      ) : (
        <ul className="business-documents">
          {list.map((o) => (
            <li key={o.id} className="business-document">
              <div className="business-document-head">
                <span className="inv-badge">{t(`business.g.types.${o.partnerType}`)}</span>
                <strong>{o.partnerName}</strong>
                <span>{o.title}</span>
              </div>
              <p className="inv-note">{o.description}</p>
              {o.conditions && <p className="inv-muted inv-note">{t('business.g.conditions', { text: o.conditions })}</p>}
              {o.fees && <p className="inv-muted inv-note">{t('business.g.fees', { text: o.fees })}</p>}
              <p className="inv-muted inv-note">
                {o.authorization ? t('business.g.authorization', { ref: o.authorization }) : t('business.g.noAuthorization')}
                {o.verifiedAt ? ` · ${t('business.g.verifiedAt', { date: formatDate(i18n.language, o.verifiedAt) })}` : ''}
                {o.validUntil ? ` · ${t('business.g.validUntil', { date: formatDate(i18n.language, o.validUntil) })}` : ''}
                {o.sourceUrl && (
                  <>
                    {' · '}
                    <a href={o.sourceUrl} target="_blank" rel="noreferrer noopener">
                      {t('business.g.source')}
                    </a>
                  </>
                )}
              </p>
              {can('partners.request') && (
                <div className="inv-actions">
                  <Button type="button" variant="ghost" aria-expanded={chosen === o.id} onClick={() => setChosen(chosen === o.id ? null : o.id)}>
                    <Send size={16} aria-hidden="true" />
                    {t('business.g.prepareRequest')}
                  </Button>
                </div>
              )}
              {chosen === o.id && <RequestForm offer={o} business={business} run={reload} onDone={() => setChosen(null)} />}
            </li>
          ))}
        </ul>
      )}
      <p className="inv-muted">{t('business.g.notRecommendation')}</p>

      {can('partners.request') && (requests.data?.demandes ?? []).length > 0 && (
        <>
          <h3 className="pilot-subtitle">{t('business.g.myRequests')}</h3>
          <ul className="trade-pieces">
            {requests.data.demandes.map((r) => (
              <li key={r.id}>
                <span>
                  <strong>{r.offer.partnerName}</strong> · {r.motive}
                  <span className="inv-muted"> · {formatDate(i18n.language, r.createdAt)}</span>
                  {r.history.at(-1)?.note && <span className="inv-muted"> · {r.history.at(-1).note}</span>}
                </span>
                <span className="dia-actions">
                  <span className="business-document-state">{t(`business.g.requestStatuses.${r.status}`)}</span>
                  {!['closed', 'withdrawn'].includes(r.status) && (
                    <Button type="button" variant="ghost" onClick={() => reload(() => api.delete(`/fin/entreprise/partenaires/demandes/${r.id}`), 'business.g.withdrawn')}>
                      {t('business.g.withdraw')}
                    </Button>
                  )}
                </span>
                <RequestMessages request={r} run={run} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function RequestForm({ offer, business, run, onDone }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ motive: '', amount: '', message: '', shared: ['profile'], consent: false });
  const [key] = useState(newIdempotencyKey);
  const toggle = (item) => setForm((p) => ({ ...p, shared: p.shared.includes(item) ? p.shared.filter((x) => x !== item) : [...p.shared, item] }));
  return (
    <form
      className="business-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const body = {
          offerId: offer.id,
          motive: form.motive.trim(),
          sharedItems: form.shared,
          consent: true,
          ...(form.amount ? { amount: toMinorUnits(form.amount, business.currency, { allowZero: true }) } : {}),
          ...(form.message.trim() ? { message: form.message.trim() } : {}),
        };
        if (await run(() => api.post('/fin/entreprise/partenaires/demandes', body, { idempotencyKey: key }), 'business.g.requestSent')) onDone();
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.g.motive')}
          <input value={form.motive} onChange={(e) => setForm((p) => ({ ...p, motive: e.target.value }))} maxLength={300} required />
        </label>
        <AmountField id={`request-amount-${offer.id}`} label={t('business.g.amount')} currency={business.currency} value={form.amount} onChange={(v) => setForm((p) => ({ ...p, amount: v }))} />
      </div>
      <label>
        {t('business.g.message')}
        <textarea className="inv-preview" rows={3} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} maxLength={3000} />
      </label>
      <fieldset className="inv-lines">
        <legend>{t('business.g.shared')}</legend>
        {SHAREABLE.map((item) => (
          <label key={item} className="pilot-check">
            <input type="checkbox" checked={form.shared.includes(item)} onChange={() => toggle(item)} />
            {t(`business.g.shareable.${item}`)}
          </label>
        ))}
      </fieldset>
      <label className="pilot-check">
        <input type="checkbox" checked={form.consent} onChange={(e) => setForm((p) => ({ ...p, consent: e.target.checked }))} required />
        {t('business.g.consent', { partner: offer.partnerName })}
      </label>
      <Button type="submit" variant="secondary" disabled={!form.consent}>
        <Send size={16} aria-hidden="true" />
        {t('business.g.send')}
      </Button>
    </form>
  );
}

// ---- crowdfunding ----------------------------------------------------------------------

const INSTRUMENTS = ['don', 'pret', 'capital', 'recompense'];

export function CampaignsSection({ business, can, run }) {
  const { t, i18n } = useTranslation();
  const campaigns = useApi('/fin/entreprise/campagnes');
  const manage = can('crowdfunding.manage');
  const reload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) campaigns.reload();
    return done;
  };
  const list = campaigns.data?.campagnes ?? [];
  const money = (v, c) => formatAmount(i18n.language, v, c);

  return (
    <section aria-labelledby="business-campaigns">
      <h2 id="business-campaigns">
        <Rocket size={18} aria-hidden="true" /> {t('business.g.campaignsTitle')}
      </h2>
      <p className="business-blocked-intro">{t('business.g.campaignsIntro')}</p>
      {manage && <NewCampaign business={business} run={reload} />}
      {campaigns.status === 'loading' && !campaigns.data ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <p className="business-empty">{t('business.g.noCampaign')}</p>
      ) : (
        <ul className="business-documents">
          {list.map((c) => (
            <li key={c.id} className="business-document">
              <div className="business-document-head">
                <span className="inv-badge">{t(`business.g.instruments.${c.instrument}`)}</span>
                <strong>{c.name}</strong>
                <span className="inv-muted">{t('business.g.target', { amount: money(c.target, c.currency) })}</span>
                <span className="business-document-state">{t(`business.g.campaignStatuses.${c.status}`)}</span>
              </div>
              <div className="fin-figure-grid trade-figures">
                <FigureCard label={t('business.g.remaining')} answer={c.calcul.reste} />
                <FigureCard label={t('business.g.funded')} answer={c.calcul.finance} />
              </div>
              <p className="inv-muted inv-note">
                {t('business.g.declaredConfirmed', { declared: money(c.calcul.declare, c.currency), confirmed: money(c.calcul.confirme, c.currency) })}
                {c.calcul.dilution !== null && ` · ${t('business.g.dilution', { ratio: formatRatio(i18n.language, c.calcul.dilution) })}`}
              </p>
              <p className={c.calcul.plateformeVerifiee ? 'inv-muted inv-note' : 'business-document-warning'}>
                {c.calcul.plateformeVerifiee
                  ? t('business.g.platformChecked', { name: c.platformName ?? '', ref: c.platformAuthorization, date: formatDate(i18n.language, c.platformCheckedAt) })
                  : t('business.g.platformNotChecked')}
              </p>

              <h3 className="pilot-subtitle">{t('business.g.checksTitle', { done: c.calcul.controles.faits, total: c.calcul.controles.attendus })}</h3>
              <ul className="trade-pieces">
                {c.checklist.map((check) => (
                  <li key={check.key} className={check.done ? 'dia-status-validated' : 'dia-status-planned'}>
                    <span>{t(`business.g.checks.${check.key}`)}</span>
                    {manage ? (
                      <label className="pilot-check">
                        <input type="checkbox" checked={check.done} onChange={(e) => reload(() => api.put(`/fin/entreprise/campagnes/${c.id}`, { check: { key: check.key, done: e.target.checked } }), 'business.g.saved')} />
                        {t('business.g.done')}
                      </label>
                    ) : (
                      <span className="business-document-state">{check.done ? t('business.g.done') : t('business.g.todo')}</span>
                    )}
                  </li>
                ))}
              </ul>
              {manage && <CampaignActions campaign={c} business={business} run={reload} />}
              <CampaignReports campaign={c} manage={manage} run={reload} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function NewCampaign({ business, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', instrument: 'don', target: '', preMoney: '', platformName: '', endsAt: '' });
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  return (
    <form
      className="business-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const body = {
          name: form.name.trim(),
          instrument: form.instrument,
          target: toMinorUnits(form.target, business.currency),
          currency: business.currency,
          ...(form.instrument === 'capital' && form.preMoney ? { preMoney: toMinorUnits(form.preMoney, business.currency, { allowZero: true }) } : {}),
          ...(form.platformName.trim() ? { platformName: form.platformName.trim() } : {}),
          ...(form.endsAt ? { endsAt: iso(form.endsAt) } : {}),
        };
        if (await run(() => api.post('/fin/entreprise/campagnes', body, { idempotencyKey: key }), 'business.g.campaignCreated')) {
          setKey(newIdempotencyKey());
          setForm((p) => ({ ...p, name: '', target: '', preMoney: '' }));
        }
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.g.campaignName')}
          <input value={form.name} onChange={set('name')} maxLength={160} required />
        </label>
        <label>
          {t('business.g.instrument')}
          <select value={form.instrument} onChange={set('instrument')}>
            {INSTRUMENTS.map((k) => (
              <option key={k} value={k}>
                {t(`business.g.instruments.${k}`)}
              </option>
            ))}
          </select>
        </label>
        <AmountField id="campaign-target" label={t('business.g.targetField')} currency={business.currency} value={form.target} onChange={(v) => setForm((p) => ({ ...p, target: v }))} required />
        {form.instrument === 'capital' && <AmountField id="campaign-premoney" label={t('business.g.preMoney')} currency={business.currency} value={form.preMoney} onChange={(v) => setForm((p) => ({ ...p, preMoney: v }))} />}
      </div>
      <div className="business-form-row">
        <label>
          {t('business.g.platform')}
          <input value={form.platformName} onChange={set('platformName')} maxLength={160} />
        </label>
        <label>
          {t('business.g.endsAt')}
          <input type="date" value={form.endsAt} onChange={set('endsAt')} />
        </label>
      </div>
      <Button type="submit" variant="secondary">
        <Plus size={16} aria-hidden="true" />
        {t('business.g.createCampaign')}
      </Button>
    </form>
  );
}

function CampaignActions({ campaign, business, run }) {
  const { t, i18n } = useTranslation();
  const [auth, setAuth] = useState(campaign.platformAuthorization ?? '');
  const [commit, setCommit] = useState({ amount: '', source: campaign.platformName ?? '', declaredAt: today() });
  const [key, setKey] = useState(newIdempotencyKey);
  const base = `/fin/entreprise/campagnes/${campaign.id}`;
  return (
    <div className="trade-details">
      <div className="business-form business-payment">
        <label>
          {t('business.g.authorizationField')}
          <input value={auth} onChange={(e) => setAuth(e.target.value)} maxLength={160} />
        </label>
        <Button type="button" variant="ghost" onClick={() => run(() => api.put(base, { platformAuthorization: auth.trim(), platformChecked: true }), 'business.g.saved')} disabled={!auth.trim()}>
          <Check size={16} aria-hidden="true" />
          {t('business.g.markChecked')}
        </Button>
        {campaign.status === 'preparing' && (
          <Button type="button" variant="secondary" onClick={() => run(() => api.put(base, { status: 'open' }), 'business.g.opened')}>
            {t('business.g.open')}
          </Button>
        )}
        {campaign.status === 'open' && (
          <Button type="button" variant="ghost" onClick={() => run(() => api.put(base, { status: 'closed' }), 'business.g.saved')}>
            {t('business.g.close')}
          </Button>
        )}
      </div>
      {campaign.commitments.length > 0 && (
        <ul className="trade-pieces">
          {campaign.commitments.map((c) => (
            <li key={c.id} className={c.cancelledAt ? 'dia-status-rejected' : c.confirmedAt ? 'dia-status-validated' : 'dia-status-submitted'}>
              <span>
                {formatAmount(i18n.language, c.amount, campaign.currency)} · {c.source} <span className="inv-muted">· {formatDate(i18n.language, c.declaredAt)}</span>
              </span>
              <span className="dia-actions">
                <span className="business-document-state">{c.cancelledAt ? t('business.g.cancelled') : c.confirmedAt ? t('business.g.confirmed') : t('business.g.declared')}</span>
                {!c.cancelledAt && !c.confirmedAt && (
                  <Button type="button" variant="ghost" onClick={() => run(() => api.post(`${base}/engagements/${c.id}/confirmer`, {}), 'business.g.saved')}>
                    <Check size={16} aria-hidden="true" />
                    {t('business.g.confirm')}
                  </Button>
                )}
                {!c.cancelledAt && (
                  <Button type="button" variant="ghost" onClick={() => run(() => api.post(`${base}/engagements/${c.id}/annuler`, {}), 'business.g.saved')}>
                    <X size={16} aria-hidden="true" />
                    {t('business.g.cancel')}
                  </Button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!['closed', 'cancelled'].includes(campaign.status) && (
        <form
          className="business-form business-payment"
          onSubmit={async (e) => {
            e.preventDefault();
            const body = { amount: toMinorUnits(commit.amount, business.currency), source: commit.source.trim(), declaredAt: iso(commit.declaredAt) };
            if (await run(() => api.post(`${base}/engagements`, body, { idempotencyKey: key }), 'business.g.commitmentAdded')) {
              setKey(newIdempotencyKey());
              setCommit((p) => ({ ...p, amount: '' }));
            }
          }}
        >
          <AmountField id={`commit-${campaign.id}`} label={t('business.g.commitment')} currency={business.currency} value={commit.amount} onChange={(v) => setCommit((p) => ({ ...p, amount: v }))} required />
          <label>
            {t('business.g.declaredBy')}
            <input value={commit.source} onChange={(e) => setCommit((p) => ({ ...p, source: e.target.value }))} maxLength={160} required />
          </label>
          <label>
            {t('business.pilot.date')}
            <input type="date" value={commit.declaredAt} onChange={(e) => setCommit((p) => ({ ...p, declaredAt: e.target.value }))} required />
          </label>
          <Button type="submit" variant="secondary">
            <Plus size={16} aria-hidden="true" />
            {t('business.g.addCommitment')}
          </Button>
        </form>
      )}
    </div>
  );
}

// ---- human resources, without payroll -------------------------------------------------------

const CONTRACTS = ['cdi', 'cdd', 'stage', 'apprenti', 'interim', 'autre'];
const ABSENCE_KINDS = ['conge', 'maladie', 'formation', 'sans_solde', 'autre'];

export function HrSection({ can, run }) {
  const { t, i18n } = useTranslation();
  const staff = useApi('/fin/entreprise/personnel');
  const manage = can('hr.manage');
  const reload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) staff.reload();
    return done;
  };
  const data = staff.data;

  return (
    <section aria-labelledby="business-hr">
      <h2 id="business-hr">
        <Users size={18} aria-hidden="true" /> {t('business.g.hrTitle')}
      </h2>
      <p className="business-blocked-intro">{t('business.g.hrIntro')}</p>
      {staff.status === 'loading' && !data ? (
        <LoadingState />
      ) : (
        <>
          {data && (
            <div className="fin-figure-grid">
              <FigureCard label={t('business.g.headcount')} answer={data.indicateurs.effectif} />
              <FigureCard label={t('business.g.turnover')} answer={data.indicateurs.rotation} />
              <FigureCard label={t('business.g.absenteeism')} answer={data.indicateurs.absenteisme} />
            </div>
          )}
          {data && <p className="inv-muted inv-note">{t('business.g.movements', { entries: data.indicateurs.entrees, exits: data.indicateurs.sorties })}</p>}
          {manage && <NewEmployee run={reload} />}
          {(data?.salaries ?? []).length === 0 ? (
            <p className="business-empty">{t('business.g.noEmployee')}</p>
          ) : (
            <ul className="business-documents">
              {data.salaries.map((e) => (
                <Employee key={e.id} e={e} manage={manage} run={reload} lang={i18n.language} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function NewEmployee({ run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ fullName: '', position: '', department: '', contract: 'cdi', managerName: '', startedAt: today(), leaveRightsPerYear: '30' });
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  return (
    <form
      className="business-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const body = {
          fullName: form.fullName.trim(),
          position: form.position.trim(),
          contract: form.contract,
          startedAt: iso(form.startedAt),
          leaveRightsPerYear: Number(form.leaveRightsPerYear || 0),
          ...(form.department.trim() ? { department: form.department.trim() } : {}),
          ...(form.managerName.trim() ? { managerName: form.managerName.trim() } : {}),
        };
        if (await run(() => api.post('/fin/entreprise/personnel', body, { idempotencyKey: key }), 'business.g.employeeCreated')) {
          setKey(newIdempotencyKey());
          setForm((p) => ({ ...p, fullName: '', position: '', department: '', managerName: '' }));
        }
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.g.fullName')}
          <input id="employee-name" value={form.fullName} onChange={set('fullName')} maxLength={160} required />
        </label>
        <label>
          {t('business.g.position')}
          <input value={form.position} onChange={set('position')} maxLength={120} required />
        </label>
        <label>
          {t('business.g.department')}
          <input value={form.department} onChange={set('department')} maxLength={120} />
        </label>
        <label>
          {t('business.g.contract')}
          <select value={form.contract} onChange={set('contract')}>
            {CONTRACTS.map((c) => (
              <option key={c} value={c}>
                {t(`business.g.contracts.${c}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="business-form-row">
        <label>
          {t('business.g.manager')}
          <input value={form.managerName} onChange={set('managerName')} maxLength={160} />
        </label>
        <label>
          {t('business.g.startedAt')}
          <input type="date" value={form.startedAt} onChange={set('startedAt')} required />
        </label>
        <label>
          {t('business.g.leaveRights')}
          <input type="number" min="0" max="366" step="0.5" value={form.leaveRightsPerYear} onChange={set('leaveRightsPerYear')} />
        </label>
      </div>
      <Button type="submit" variant="secondary">
        <Plus size={16} aria-hidden="true" />
        {t('business.g.addEmployee')}
      </Button>
    </form>
  );
}

function Employee({ e, manage, run, lang }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kind: 'conge', startsAt: today(), endsAt: today(), days: '1' });
  const [key, setKey] = useState(newIdempotencyKey);
  const base = `/fin/entreprise/personnel/${e.id}`;
  const left = Boolean(e.endedAt);
  return (
    <li className={`business-document ${left ? 'dia-project-cancelled' : ''}`}>
      <div className="business-document-head">
        <strong>{e.fullName}</strong>
        <span>{e.position}</span>
        {e.department && <span className="inv-muted">{e.department}</span>}
        <span className="inv-badge">{t(`business.g.contracts.${e.contract}`)}</span>
        <span className="business-document-state">{left ? t('business.g.leftOn', { date: formatDate(lang, e.endedAt) }) : t('business.g.since', { date: formatDate(lang, e.startedAt) })}</span>
      </div>
      <p className="inv-muted inv-note">{t('business.g.leave', { acquired: e.conges.acquired, carry: e.conges.carryOver, taken: e.conges.taken, balance: e.conges.balance })}</p>
      <div className="inv-actions">
        <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)}>
          {t('business.g.absences', { n: e.absences.length })}
        </Button>
        {manage && !left && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const date = window.prompt(t('business.g.exitDate'), today());
              if (date) run(() => api.put(base, { endedAt: iso(date) }, { ifMatch: e.version }), 'business.g.exitRecorded');
            }}
          >
            {t('business.g.recordExit')}
          </Button>
        )}
      </div>
      {open && (
        <div className="trade-details">
          <ul className="trade-pieces">
            {e.absences.map((a) => (
              <li key={a.id} className={`dia-status-${a.status === 'approved' ? 'validated' : a.status === 'requested' ? 'submitted' : 'rejected'}`}>
                <span>
                  {t(`business.g.absenceKinds.${a.kind}`)} · {formatDate(lang, a.startsAt)} → {formatDate(lang, a.endsAt)} · {t('business.g.days', { n: a.days })}
                </span>
                <span className="dia-actions">
                  <span className="business-document-state">{t(`business.g.absenceStatuses.${a.status}`)}</span>
                  {a.peutDecider && (
                    <>
                      <Button type="button" variant="ghost" onClick={() => run(() => api.post(`${base}/absences/${a.id}/approuver`, {}), 'business.g.saved')}>
                        <Check size={16} aria-hidden="true" />
                        {t('business.g.approve')}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => run(() => api.post(`${base}/absences/${a.id}/refuser`, {}), 'business.g.saved')}>
                        <X size={16} aria-hidden="true" />
                        {t('business.g.refuse')}
                      </Button>
                    </>
                  )}
                  {manage && a.status === 'requested' && !a.peutDecider && <span className="inv-muted">{t('business.g.otherDecides')}</span>}
                </span>
              </li>
            ))}
          </ul>
          {manage && !left && (
            <form
              className="business-form business-payment"
              onSubmit={async (ev) => {
                ev.preventDefault();
                const body = { kind: form.kind, startsAt: iso(form.startsAt), endsAt: iso(form.endsAt), days: Number(form.days) };
                if (await run(() => api.post(`${base}/absences`, body, { idempotencyKey: key }), 'business.g.absenceRequested')) setKey(newIdempotencyKey());
              }}
            >
              <label>
                {t('business.g.absenceKind')}
                <select value={form.kind} onChange={(ev) => setForm((p) => ({ ...p, kind: ev.target.value }))}>
                  {ABSENCE_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {t(`business.g.absenceKinds.${k}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('business.g.from')}
                <input type="date" value={form.startsAt} onChange={(ev) => setForm((p) => ({ ...p, startsAt: ev.target.value }))} required />
              </label>
              <label>
                {t('business.g.to')}
                <input type="date" value={form.endsAt} min={form.startsAt} onChange={(ev) => setForm((p) => ({ ...p, endsAt: ev.target.value }))} required />
              </label>
              <label>
                {t('business.g.daysField')}
                <input type="number" min="0.5" step="0.5" value={form.days} onChange={(ev) => setForm((p) => ({ ...p, days: ev.target.value }))} required />
              </label>
              <Button type="submit" variant="secondary">
                <Plus size={16} aria-hidden="true" />
                {t('business.g.addAbsence')}
              </Button>
            </form>
          )}
        </div>
      )}
    </li>
  );
}

// Lot I (2026-11-25): the requests for documents and comments of the partner,
// and the organisation's answers (ECR-0288).
function RequestMessages({ request, run }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const messages = useApi(open ? `/fin/entreprise/partenaires/demandes/${request.id}/messages` : null);
  const [answer, setAnswer] = useState({ body: '', replyToId: '' });
  const list = messages.data?.messages ?? [];
  const closed = ['closed', 'withdrawn'].includes(request.status);
  return (
    <div className="trade-details">
      <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? t('business.g.hideMessages') : t('business.g.showMessages')}
      </Button>
      {open && (
        <>
          {list.length === 0 ? (
            <p className="inv-muted inv-note">{t('business.g.noMessage')}</p>
          ) : (
            <ul className="trade-pieces">
              {list.map((m) => (
                <li key={m.id} className={m.side === 'partner' ? 'dia-status-submitted' : 'dia-status-validated'}>
                  <span>
                    <strong>{t(`business.g.messageKinds.${m.kind}`)}</strong> · {formatDate(i18n.language, m.createdAt)}
                    {m.dueAt ? ` · ${t('business.g.dueOn', { date: formatDate(i18n.language, m.dueAt) })}` : ''}
                    <br />
                    {m.body}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {!closed && (
            <form
              className="business-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const body = { body: answer.body.trim(), ...(answer.replyToId ? { replyToId: answer.replyToId } : {}) };
                if (await run(() => api.post(`/fin/entreprise/partenaires/demandes/${request.id}/messages`, body), 'business.g.answered')) {
                  setAnswer({ body: '', replyToId: '' });
                  messages.reload();
                }
              }}
            >
              <label>
                {t('business.g.answerTo')}
                <select value={answer.replyToId} onChange={(e) => setAnswer((p) => ({ ...p, replyToId: e.target.value }))}>
                  <option value="">{t('business.g.generalAnswer')}</option>
                  {list
                    .filter((m) => m.side === 'partner')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.body.slice(0, 60)}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                {t('business.g.answer')}
                <textarea className="inv-preview" rows={3} value={answer.body} onChange={(e) => setAnswer((p) => ({ ...p, body: e.target.value }))} maxLength={3000} required />
              </label>
              <Button type="submit" variant="secondary">
                {t('business.g.sendAnswer')}
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

// Lot I (2026-11-25): the regulatory report of a campaign (ECR-0307), prepared,
// validated by another person, exported; read by the linked platform once validated.
function CampaignReports({ campaign, manage, run }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const reports = useApi(open ? `/fin/entreprise/campagnes/${campaign.id}/rapports` : null);
  const platforms = useApi(open && manage ? '/fin/entreprise/plateformes' : null);
  const [period, setPeriod] = useState({ from: today().slice(0, 8) + '01', to: today() });
  const act = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) reports.reload();
    return done;
  };
  const base = `/fin/entreprise/campagnes/${campaign.id}`;
  const exportCsv = async (reportId) => {
    try {
      const organisation = currentOrganisation();
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}${base}/rapports/${reportId}/export`, { credentials: 'include', cache: 'no-store', headers: organisation ? { 'X-Organisation': organisation } : {} });
      if (!response.ok) throw new Error(String(response.status));
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fincludia-rapport-campagne.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert(t('business.g.exportFailed'));
    }
  };
  return (
    <div className="trade-details">
      <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? t('business.g.hideReports') : t('business.g.showReports')}
      </Button>
      {open && (
        <>
          <p className="inv-muted inv-note">{t('business.g.reportsIntro')}</p>
          {manage && (
            <div className="inv-actions">
              <label className="pilot-inline">
                {t('business.g.platformSpace')}
                <select value={campaign.platformSpaceId ?? ''} onChange={(e) => run(() => api.put(`${base}/plateforme`, { spaceId: e.target.value || null }), 'business.g.saved')}>
                  <option value="">{t('business.g.noPlatformSpace')}</option>
                  {(platforms.data?.plateformes ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {manage && (
            <form
              className="business-form business-payment"
              onSubmit={(e) => {
                e.preventDefault();
                act(() => api.post(`${base}/rapports`, period), 'business.g.reportPrepared');
              }}
            >
              <label>
                {t('business.g.from')}
                <input type="date" value={period.from} onChange={(e) => setPeriod((p) => ({ ...p, from: e.target.value }))} required />
              </label>
              <label>
                {t('business.g.to')}
                <input type="date" value={period.to} min={period.from} onChange={(e) => setPeriod((p) => ({ ...p, to: e.target.value }))} required />
              </label>
              <Button type="submit" variant="secondary">
                {t('business.g.prepareReport')}
              </Button>
            </form>
          )}
          {(reports.data?.rapports ?? []).length === 0 ? (
            <p className="inv-muted inv-note">{t('business.g.noReport')}</p>
          ) : (
            <ul className="trade-pieces">
              {reports.data.rapports.map((r) => (
                <li key={r.id} className={r.status === 'validated' ? 'dia-status-validated' : 'dia-status-submitted'}>
                  <span>
                    {formatDate(i18n.language, r.periodFrom)} → {formatDate(i18n.language, r.periodTo)} · {t('business.g.reportOps', { declared: r.content.operations.declares.nombre, confirmed: r.content.operations.confirmes.nombre })}
                  </span>
                  <span className="dia-actions">
                    <span className="business-document-state">{t(`business.g.reportStatuses.${r.status}`)}</span>
                    {manage && r.peutValider && (
                      <Button type="button" variant="ghost" onClick={() => act(() => api.post(`${base}/rapports/${r.id}/valider`, {}), 'business.g.reportValidated')}>
                        <Check size={16} aria-hidden="true" />
                        {t('business.g.validateReport')}
                      </Button>
                    )}
                    {manage && r.status === 'draft' && !r.peutValider && <span className="inv-muted">{t('business.g.otherValidates')}</span>}
                    <Button type="button" variant="ghost" onClick={() => exportCsv(r.id)}>
                      {t('business.g.exportReport')}
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
