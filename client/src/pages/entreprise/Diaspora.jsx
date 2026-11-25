import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Check, FolderKanban, Landmark, Plus, Printer, Share2, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate, formatRatio } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { newIdempotencyKey } from '../../lib/organisation.js';
import { useOfficialRate } from '../../lib/officialRate.js';
import Button from '../../components/ui/Button.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import { ProjectFx } from './ProjectFx.jsx';

// P13-05, lot E (2026-11-24): the diaspora — projects in Algeria followed from
// abroad (ECR-0374 to ECR-0381) and the patrimony across countries (ECR-0372,
// ECR-0373). Declared, validated and paid stay apart; whoever declares an
// expense does not validate it; a project is shared, never the patrimony.
// FINCLUDIA moves no money.

const today = () => new Date().toISOString().slice(0, 10);
const iso = (date) => new Date(`${date}T00:00:00.000Z`).toISOString();
const NATURES = ['construction', 'immobilier', 'agriculture', 'commerce', 'industrie', 'services', 'autre'];
const PROJECT_STATUSES = ['planned', 'active', 'done', 'cancelled'];
const CATEGORIES = ['immobilier', 'terrain', 'compte', 'placement', 'entreprise', 'vehicule', 'pret', 'autre'];
const MODES = ['declared', 'estimated', 'verified'];

// A rate with its date and source, asked only when the currency differs.
function RateFields({ id, from, to, value, onChange }) {
  const { t } = useTranslation();
  // The official rate of the Banque d'Algérie, proposed when the rate is empty.
  const proposed = useOfficialRate(from, to, value.rate, (official) => value.rate === '' && onChange({ ...value, ...official }));
  if (!from || from.toUpperCase() === to) return null;
  return (
    <div className="business-form-row">
      {proposed && <p className="inv-muted inv-note">{t('business.trade.officialProposed')}</p>}
      <label>
        {t('business.trade.rateField', { from: from.toUpperCase(), to })}
        <input id={`${id}-rate`} type="number" min="0.000001" step="any" value={value.rate} onChange={(e) => onChange({ ...value, rate: e.target.value })} required />
      </label>
      <label>
        {t('business.trade.rateDate')}
        <input type="date" value={value.rateDate} max={today()} onChange={(e) => onChange({ ...value, rateDate: e.target.value })} required />
      </label>
      <label>
        {t('business.trade.rateSource')}
        <input id={`${id}-source`} value={value.rateSource} onChange={(e) => onChange({ ...value, rateSource: e.target.value })} maxLength={120} placeholder={t('business.trade.rateSourceHint')} required />
      </label>
    </div>
  );
}
const rateBody = (rate, from, to) =>
  from.toUpperCase() === to ? {} : { rate: Number(String(rate.rate).replace(',', '.')), rateDate: iso(rate.rateDate), rateSource: rate.rateSource.trim() };
const emptyRate = () => ({ rate: '', rateDate: today(), rateSource: '' });

export function ProjectsSection({ business, can, run }) {
  const { t } = useTranslation();
  const projects = useApi('/fin/entreprise/projets');
  const members = useApi(can('members.manage') ? '/fin/entreprise/membres' : null);
  const reload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) projects.reload();
    return done;
  };
  const list = projects.data?.projets ?? [];

  return (
    <section aria-labelledby="business-projects">
      <h2 id="business-projects">
        <FolderKanban size={18} aria-hidden="true" /> {t('business.dia.projectsTitle')}
      </h2>
      <p className="business-blocked-intro">{t('business.dia.projectsIntro')}</p>
      {can('project.manage') && <NewProject business={business} run={reload} />}
      {projects.status === 'loading' && !projects.data ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <p className="business-empty">{t('business.dia.noProject')}</p>
      ) : (
        <ul className="business-documents">
          {list.map((project) => (
            <ProjectCard key={project.id} project={project} business={business} members={(members.data?.membres ?? []).filter((m) => m.status === 'active')} run={reload} />
          ))}
        </ul>
      )}
    </section>
  );
}

function NewProject({ business, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', nature: 'construction', location: '', managerName: '', budget: '', currency: 'DZD', fundsConfirmed: '', targetAt: '' });
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const currency = form.currency.trim().toUpperCase() || business.currency;

  return (
    <form
      className="business-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = {
          name: form.name.trim(),
          nature: form.nature,
          budget: toMinorUnits(form.budget, currency, { allowZero: true }),
          currency,
          ...(form.location.trim() ? { location: form.location.trim() } : {}),
          ...(form.managerName.trim() ? { managerName: form.managerName.trim() } : {}),
          ...(form.fundsConfirmed ? { fundsConfirmed: toMinorUnits(form.fundsConfirmed, currency, { allowZero: true }) } : {}),
          ...(form.targetAt ? { targetAt: iso(form.targetAt) } : {}),
        };
        if (await run(() => api.post('/fin/entreprise/projets', body, { idempotencyKey: key }), 'business.dia.projectCreated')) {
          setKey(newIdempotencyKey());
          setForm((p) => ({ ...p, name: '', location: '', managerName: '', budget: '', fundsConfirmed: '' }));
        }
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.dia.name')}
          <input id="project-name" value={form.name} onChange={set('name')} maxLength={160} required />
        </label>
        <label>
          {t('business.dia.nature')}
          <select value={form.nature} onChange={set('nature')}>
            {NATURES.map((n) => (
              <option key={n} value={n}>
                {t(`business.dia.natures.${n}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('business.dia.location')}
          <input value={form.location} onChange={set('location')} maxLength={160} placeholder={t('business.dia.locationHint')} />
        </label>
        <label>
          {t('business.dia.manager')}
          <input value={form.managerName} onChange={set('managerName')} maxLength={160} />
        </label>
      </div>
      <div className="business-form-row">
        <label>
          {t('business.trade.currency')}
          <input id="project-currency" value={form.currency} onChange={set('currency')} maxLength={3} minLength={3} required />
        </label>
        <AmountField id="project-budget" label={t('business.dia.budget')} currency={currency} value={form.budget} onChange={(v) => setForm((p) => ({ ...p, budget: v }))} required />
        <AmountField id="project-funds" label={t('business.dia.funds')} currency={currency} value={form.fundsConfirmed} onChange={(v) => setForm((p) => ({ ...p, fundsConfirmed: v }))} hint={t('business.dia.fundsHint')} />
        <label>
          {t('business.dia.target')}
          <input type="date" value={form.targetAt} onChange={set('targetAt')} />
        </label>
      </div>
      <Button type="submit" variant="secondary">
        <Plus size={16} aria-hidden="true" />
        {t('business.dia.createProject')}
      </Button>
    </form>
  );
}

function ProjectCard({ project, business, members, run }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const view = project.calcul;
  const manage = project.acces === 'manage';
  const contribute = manage || project.acces === 'contribute';
  const money = (value, currency = project.currency) => formatAmount(i18n.language, value, currency);
  const base = `/fin/entreprise/projets/${project.id}`;
  const step = (path, body, okKey) => run(() => api.post(path, body, { idempotencyKey: newIdempotencyKey() }), okKey);

  return (
    <li className={`business-document dia-project dia-project-${project.status}`}>
      <div className="business-document-head">
        <span className="inv-badge">{t(`business.dia.natures.${project.nature}`)}</span>
        <strong>{project.name}</strong>
        {project.location && <span className="inv-muted">{project.location}</span>}
        {project.managerName && <span className="inv-muted">· {project.managerName}</span>}
        <span className="business-document-state">{t(`business.dia.statuses.${project.status}`)}</span>
      </div>
      <p className="inv-muted inv-note">
        {t('business.dia.budgetLine', { budget: money(project.budget), funds: money(project.fundsConfirmed) })}
        {project.targetAt ? ` · ${t('business.dia.targetLine', { date: formatDate(i18n.language, project.targetAt) })}` : ''}
        {!manage ? ` · ${t(`business.dia.access.${project.acces}`)}` : ''}
      </p>

      <div className="fin-figure-grid trade-figures">
        <FigureCard label={t('business.dia.realised')} answer={view.realise} />
        <FigureCard label={t('business.dia.remaining')} answer={view.reste} />
        <FigureCard label={t('business.dia.progress')} answer={view.avancement} />
        <FigureCard label={t('business.dia.toFinance')} answer={view.aFinancer} />
      </div>
      <p className="inv-muted inv-note">
        {t('business.dia.threeStates', { declared: view.declare === null ? '—' : money(view.declare), paid: view.paye === null ? '—' : money(view.paye) })}
        {view.aJustifier > 0 && ` · ${t('business.dia.toJustifyCount', { n: view.aJustifier })}`}
        {view.enAttente > 0 && ` · ${t('business.dia.waitingCount', { n: view.enAttente })}`}
        {view.jalonsEnRetard > 0 && ` · ${t('business.dia.lateMilestones', { n: view.jalonsEnRetard })}`}
      </p>

      <div className="inv-actions">
        <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? t('business.trade.hide') : t('business.dia.details')}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setPrinting(true)}>
          <Printer size={16} aria-hidden="true" />
          {t('business.dia.report')}
        </Button>
        {manage && (
          <label className="pilot-inline">
            {t('business.trade.status')}
            <select value={project.status} onChange={(e) => run(() => api.put(base, { status: e.target.value }, { ifMatch: project.version }), 'business.dia.updated')}>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`business.dia.statuses.${s}`)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {printing && <ProjectReport project={project} business={business} onDone={() => setPrinting(false)} />}

      {open && (
        <div className="trade-details">
          <h3 className="pilot-subtitle">{t('business.dia.milestonesTitle')}</h3>
          {project.milestones.length === 0 ? (
            <p className="business-empty">{t('business.dia.noMilestone')}</p>
          ) : (
            <ul className="trade-pieces">
              {project.milestones.map((m) => (
                <Milestone key={m.id} m={m} manage={manage} contribute={contribute} onStep={(name, body, okKey) => step(`${base}/jalons/${m.id}/${name}`, body, okKey)} />
              ))}
            </ul>
          )}
          {manage && <NewMilestone base={base} run={run} />}

          <h3 className="pilot-subtitle">{t('business.dia.expensesTitle')}</h3>
          {project.expenses.length === 0 ? (
            <p className="business-empty">{t('business.dia.noExpense')}</p>
          ) : (
            <ul className="trade-pieces">
              {project.expenses.map((e) => (
                <Expense key={e.id} e={e} project={project} manage={manage} contribute={contribute} onStep={(name, body, okKey) => step(`${base}/depenses/${e.id}/${name}`, body, okKey)} />
              ))}
            </ul>
          )}
          {contribute && project.status !== 'cancelled' && <NewExpense project={project} base={base} run={run} />}

          {/* Lot D bis: the exchange effect on the project (ECR-0378). */}
          <ProjectFx project={project} base={base} contribute={contribute} run={run} />

          {manage && <Shares project={project} members={members} base={base} run={run} />}
        </div>
      )}
    </li>
  );
}

function Milestone({ m, manage, contribute, onStep }) {
  const { t, i18n } = useTranslation();
  const [proof, setProof] = useState('');
  const late = m.dueAt && new Date(m.dueAt) < new Date(today()) && m.status !== 'accepted';
  return (
    <li className={`dia-status-${m.status}`}>
      <span>
        <strong>{m.label}</strong> <span className="inv-muted">· {t('business.dia.weight', { n: m.weight })}</span>
        {m.dueAt && <span className={late ? 'business-document-warning' : 'inv-muted'}> · {formatDate(i18n.language, m.dueAt)}</span>}
        {m.proofRef && <span className="inv-muted"> · {t('business.dia.proof', { ref: m.proofRef })}</span>}
      </span>
      <span className="dia-actions">
        <span className="business-document-state">{t(`business.dia.milestoneStatuses.${m.status}`)}</span>
        {contribute && ['planned', 'rejected'].includes(m.status) && (
          <>
            <input aria-label={t('business.dia.proofRef')} placeholder={t('business.dia.proofRef')} value={proof} onChange={(e) => setProof(e.target.value)} maxLength={160} />
            <Button type="button" variant="ghost" onClick={() => proof.trim() && onStep('declarer', { proofRef: proof.trim() }, 'business.dia.declared')}>
              {t('business.dia.declareDone')}
            </Button>
          </>
        )}
        {manage && m.status === 'declared' && (
          <>
            <Button type="button" variant="ghost" onClick={() => onStep('accepter', {}, 'business.dia.accepted')}>
              <Check size={16} aria-hidden="true" />
              {t('business.dia.accept')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => onStep('refuser', {}, 'business.dia.refused')}>
              <X size={16} aria-hidden="true" />
              {t('business.dia.refuse')}
            </Button>
          </>
        )}
      </span>
    </li>
  );
}

function NewMilestone({ base, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ label: '', weight: '1', dueAt: '' });
  const [key, setKey] = useState(newIdempotencyKey);
  return (
    <form
      className="business-form business-payment"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = { label: form.label.trim(), weight: Number(form.weight), ...(form.dueAt ? { dueAt: iso(form.dueAt) } : {}) };
        if (await run(() => api.post(`${base}/jalons`, body, { idempotencyKey: key }), 'business.dia.milestoneCreated')) {
          setKey(newIdempotencyKey());
          setForm({ label: '', weight: '1', dueAt: '' });
        }
      }}
    >
      <label>
        {t('business.dia.milestone')}
        <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} maxLength={200} required />
      </label>
      <label>
        {t('business.dia.weightField')}
        <input type="number" min="1" max="100" step="1" value={form.weight} onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))} required />
      </label>
      <label>
        {t('business.dia.dueAt')}
        <input type="date" value={form.dueAt} onChange={(e) => setForm((p) => ({ ...p, dueAt: e.target.value }))} />
      </label>
      <Button type="submit" variant="secondary">
        <Plus size={16} aria-hidden="true" />
        {t('business.dia.addMilestone')}
      </Button>
    </form>
  );
}

function Expense({ e, project, manage, contribute, onStep }) {
  const { t, i18n } = useTranslation();
  const [proof, setProof] = useState('');
  const money = (value, currency) => formatAmount(i18n.language, value, currency);
  return (
    <li className={`dia-status-${e.status}`}>
      <span>
        <strong>{e.label}</strong>
        {e.supplier && <span className="inv-muted"> · {e.supplier}</span>}
        <span className="inv-muted"> · {formatDate(i18n.language, e.spentAt)}</span>
        <span> · {money(e.amount, e.currency)}</span>
        {e.currency !== project.currency && <span className="inv-muted"> ({e.converted === null ? t('fincludia.notComputed') : money(e.converted, project.currency)})</span>}
        {e.proofRef && <span className="inv-muted"> · {t('business.dia.proof', { ref: e.proofRef })}</span>}
        {e.rejectionNote && <span className="business-document-warning"> · {e.rejectionNote}</span>}
        {e.paidAt && <span className="inv-muted"> · {t('business.dia.paidOn', { date: formatDate(i18n.language, e.paidAt) })}</span>}
      </span>
      <span className="dia-actions">
        <span className="business-document-state">{t(`business.dia.expenseStatuses.${e.status}`)}</span>
        {contribute && ['to_justify', 'rejected'].includes(e.status) && (
          <>
            <input aria-label={t('business.dia.proofRef')} placeholder={t('business.dia.proofRef')} value={proof} onChange={(ev) => setProof(ev.target.value)} maxLength={160} />
            <Button type="button" variant="ghost" onClick={() => proof.trim() && onStep('justifier', { proofRef: proof.trim() }, 'business.dia.justified')}>
              {t('business.dia.justify')}
            </Button>
          </>
        )}
        {e.peutValider && (
          <>
            <Button type="button" variant="ghost" onClick={() => onStep('valider', {}, 'business.dia.validated')}>
              <Check size={16} aria-hidden="true" />
              {t('business.dia.validate')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => onStep('refuser', {}, 'business.dia.rejected')}>
              <X size={16} aria-hidden="true" />
              {t('business.dia.reject')}
            </Button>
          </>
        )}
        {manage && e.status === 'submitted' && e.declareParMoi && <span className="inv-muted">{t('business.dia.secondPerson')}</span>}
        {manage && e.status === 'validated' && !e.paidAt && (
          <Button type="button" variant="ghost" onClick={() => onStep('payer', {}, 'business.dia.markedPaid')}>
            {t('business.dia.markPaid')}
          </Button>
        )}
      </span>
    </li>
  );
}

function NewExpense({ project, base, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ label: '', supplier: '', amount: '', currency: project.currency, spentAt: today(), proofRef: '' });
  const [rate, setRate] = useState(emptyRate);
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const currency = form.currency.trim().toUpperCase() || project.currency;
  return (
    <form
      className="business-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = {
          label: form.label.trim(),
          amount: toMinorUnits(form.amount, currency, { allowZero: true }),
          currency,
          spentAt: iso(form.spentAt),
          ...(form.supplier.trim() ? { supplier: form.supplier.trim() } : {}),
          ...(form.proofRef.trim() ? { proofRef: form.proofRef.trim() } : {}),
          ...rateBody(rate, currency, project.currency),
        };
        if (await run(() => api.post(`${base}/depenses`, body, { idempotencyKey: key }), 'business.dia.expenseDeclared')) {
          setKey(newIdempotencyKey());
          setForm((p) => ({ ...p, label: '', supplier: '', amount: '', proofRef: '' }));
        }
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.label')}
          <input id={`expense-label-${project.id}`} value={form.label} onChange={set('label')} maxLength={200} required />
        </label>
        <label>
          {t('business.inv.supplier')}
          <input value={form.supplier} onChange={set('supplier')} maxLength={160} />
        </label>
        <label>
          {t('business.trade.currency')}
          <input value={form.currency} onChange={set('currency')} maxLength={3} minLength={3} required />
        </label>
        <AmountField id={`expense-amount-${project.id}`} label={t('business.trade.amount')} currency={currency} value={form.amount} onChange={(v) => setForm((p) => ({ ...p, amount: v }))} required />
      </div>
      <div className="business-form-row">
        <label>
          {t('business.pilot.date')}
          <input type="date" value={form.spentAt} onChange={set('spentAt')} required />
        </label>
        <label>
          {t('business.dia.proofRef')}
          <input value={form.proofRef} onChange={set('proofRef')} maxLength={160} placeholder={t('business.dia.proofHint')} />
        </label>
      </div>
      <RateFields id={`expense-${project.id}`} from={currency} to={project.currency} value={rate} onChange={setRate} />
      <Button type="submit" variant="secondary">
        <Plus size={16} aria-hidden="true" />
        {t('business.dia.declareExpense')}
      </Button>
    </form>
  );
}

// CNV-14: one project, one member, a purpose, an end date; revocable.
function Shares({ project, members, base, run }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ memberId: '', access: 'contribute', purpose: '', endsAt: '' });
  const [key, setKey] = useState(newIdempotencyKey);
  const candidates = members.filter((m) => !['owner', 'finance_manager', 'accountant_internal'].includes(m.role));
  return (
    <div className="dia-shares">
      <h3 className="pilot-subtitle">
        <Share2 size={16} aria-hidden="true" /> {t('business.dia.sharesTitle')}
      </h3>
      {(project.shares ?? []).length === 0 ? (
        <p className="business-empty">{t('business.dia.noShare')}</p>
      ) : (
        <ul className="trade-pieces">
          {project.shares.map((s) => (
            <li key={s.id}>
              <span>
                <strong>{s.member.email}</strong> · {t(`business.dia.access.${s.access}`)} · {s.purpose}
                {s.endsAt && <span className="inv-muted"> · {t('business.org.until', { date: formatDate(i18n.language, s.endsAt) })}</span>}
              </span>
              <Button type="button" variant="ghost" onClick={() => run(() => api.delete(`${base}/partages/${s.id}`), 'business.dia.unshared')}>
                {t('business.org.revoke')}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {candidates.length === 0 ? (
        <p className="inv-muted">{t('business.dia.inviteFirst')}</p>
      ) : (
        <form
          className="business-form business-payment"
          onSubmit={async (event) => {
            event.preventDefault();
            const body = { memberId: form.memberId, access: form.access, purpose: form.purpose.trim(), ...(form.endsAt ? { endsAt: iso(form.endsAt) } : {}) };
            if (await run(() => api.post(`${base}/partages`, body, { idempotencyKey: key }), 'business.dia.shared')) {
              setKey(newIdempotencyKey());
              setForm((p) => ({ ...p, purpose: '', endsAt: '' }));
            }
          }}
        >
          <label>
            {t('business.dia.member')}
            <select value={form.memberId} onChange={(e) => setForm((p) => ({ ...p, memberId: e.target.value }))} required>
              <option value="">{t('business.inv.noContact')}</option>
              {candidates.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('business.dia.accessField')}
            <select value={form.access} onChange={(e) => setForm((p) => ({ ...p, access: e.target.value }))}>
              <option value="contribute">{t('business.dia.access.contribute')}</option>
              <option value="read">{t('business.dia.access.read')}</option>
            </select>
          </label>
          <label>
            {t('business.org.purpose')}
            <input value={form.purpose} onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))} maxLength={200} required />
          </label>
          <label>
            {t('business.org.endsAt')}
            <input type="date" value={form.endsAt} min={today()} onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))} />
          </label>
          <Button type="submit" variant="secondary">
            {t('business.dia.share')}
          </Button>
        </form>
      )}
    </div>
  );
}

// ECR-0381: a frozen report of the project, to print or save as PDF and send.
function ProjectReport({ project, business, onDone }) {
  const { t, i18n } = useTranslation();
  const [finish] = useState(() => onDone);
  useEffect(() => {
    document.body.classList.add('printing-document');
    const done = () => finish();
    window.addEventListener('afterprint', done);
    const timer = window.setTimeout(() => window.print(), 80);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', done);
      document.body.classList.remove('printing-document');
    };
  }, [finish]);
  const money = (value, currency = project.currency) => (value === null || value === undefined ? t('fincludia.notComputed') : formatAmount(i18n.language, value, currency));
  const view = project.calcul;
  const ratio = (answer) => (answer.resultat === null ? t('fincludia.notComputed') : formatRatio(i18n.language, answer.resultat));

  return createPortal(
    <div className="print-sheet-root">
      <article className="print-sheet" dir={i18n.dir?.() ?? 'ltr'}>
        <header className="print-head">
          <div>
            <strong className="print-org">{business.tradeName || business.name}</strong>
            <div>{project.name}</div>
            {project.location && <div>{project.location}</div>}
          </div>
          <div className="print-title">
            <h1>{t('business.dia.reportTitle')}</h1>
            <div>{t('business.dia.reportDate', { date: formatDate(i18n.language, new Date().toISOString()) })}</div>
          </div>
        </header>
        <table className="print-totals">
          <tbody>
            <tr>
              <th scope="row">{t('business.dia.budget')}</th>
              <td>{money(project.budget)}</td>
            </tr>
            <tr>
              <th scope="row">{t('business.dia.realised')}</th>
              <td>{money(view.realise.resultat)}</td>
            </tr>
            <tr>
              <th scope="row">{t('business.dia.remaining')}</th>
              <td>{money(view.reste.resultat)}</td>
            </tr>
            <tr>
              <th scope="row">{t('business.dia.progress')}</th>
              <td>{ratio(view.avancement)}</td>
            </tr>
            <tr>
              <th scope="row">{t('business.dia.justifiedShare')}</th>
              <td>{ratio(view.justifie)}</td>
            </tr>
            <tr className="print-grand">
              <th scope="row">{t('business.dia.toFinance')}</th>
              <td>{money(view.aFinancer.resultat)}</td>
            </tr>
          </tbody>
        </table>
        <h2>{t('business.dia.milestonesTitle')}</h2>
        <table className="print-lines">
          <tbody>
            {project.milestones.map((m) => (
              <tr key={m.id}>
                <td>{m.label}</td>
                <td>{t('business.dia.weight', { n: m.weight })}</td>
                <td>{t(`business.dia.milestoneStatuses.${m.status}`)}</td>
                <td>{m.proofRef ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>{t('business.dia.expensesTitle')}</h2>
        <table className="print-lines">
          <tbody>
            {project.expenses.map((e) => (
              <tr key={e.id}>
                <td>{formatDate(i18n.language, e.spentAt)}</td>
                <td>{e.label}</td>
                <td>{money(e.amount, e.currency)}</td>
                <td>{t(`business.dia.expenseStatuses.${e.status}`)}</td>
                <td>{e.proofRef ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="print-small">{t('business.dia.reportNote')}</p>
      </article>
    </div>,
    document.body,
  );
}

// ---- patrimony ------------------------------------------------------------------

export function PatrimonySection({ business, canWrite, run }) {
  const { t, i18n } = useTranslation();
  const patrimony = useApi('/fin/entreprise/patrimoine');
  const reload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) patrimony.reload();
    return done;
  };
  const data = patrimony.data;
  const money = (value, currency) => formatAmount(i18n.language, value, currency);

  return (
    <section aria-labelledby="business-patrimony">
      <h2 id="business-patrimony">
        <Landmark size={18} aria-hidden="true" /> {t('business.dia.patrimonyTitle')}
      </h2>
      <p className="business-blocked-intro">{t('business.dia.patrimonyIntro', { base: business.currency })}</p>
      {patrimony.status === 'loading' && !data ? (
        <LoadingState />
      ) : (
        <>
          {data && (
            <div className="fin-figure-grid">
              <FigureCard label={t('business.dia.netWorth')} answer={data.net} />
            </div>
          )}
          {data?.parPays?.length > 0 && (
            <div className="pilot-table-wrap">
              <table className="pilot-table">
                <thead>
                  <tr>
                    <th scope="col">{t('business.dia.countryCurrency')}</th>
                    <th scope="col">{t('business.dia.assets')}</th>
                    <th scope="col">{t('business.dia.debts')}</th>
                    <th scope="col">{t('business.dia.net')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.parPays.map((g) => (
                    <tr key={`${g.country}-${g.currency}`}>
                      <th scope="row">
                        {g.country} · {g.currency}
                      </th>
                      <td>{money(g.assets, g.currency)}</td>
                      <td>{money(g.debts, g.currency)}</td>
                      <td>{money(g.net, g.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data?.lignes?.length > 0 && (
            <ul className="trade-pieces">
              {data.lignes.map((h) => (
                <Holding key={h.id} h={h} business={business} canWrite={canWrite} run={reload} />
              ))}
            </ul>
          )}
          {canWrite && <NewHolding business={business} run={reload} />}
        </>
      )}
    </section>
  );
}

function Holding({ h, business, canWrite, run }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const latest = h.latest;
  return (
    <li className={`dia-status-${latest?.mode ?? 'declared'}`}>
      <span>
        <span className="inv-badge">{t(`business.dia.kinds.${h.kind}`)}</span> <strong>{h.label}</strong>
        <span className="inv-muted">
          {' '}
          · {t(`business.dia.categories.${h.category}`)} · {h.country}
        </span>
        {latest && (
          <span>
            {' '}
            · {formatAmount(i18n.language, latest.value, h.currency)}{' '}
            <span className="inv-muted">
              ({t(`business.dia.modes.${latest.mode}`)}, {formatDate(i18n.language, latest.valuedAt)})
            </span>
          </span>
        )}
        {h.currency !== business.currency && h.converted === null && <span className="business-document-warning"> · {t('business.dia.noRate')}</span>}
        {h.values.length > 1 && <span className="inv-muted"> · {t('business.dia.history', { n: h.values.length })}</span>}
      </span>
      {canWrite && (
        <span className="dia-actions">
          <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)}>
            {t('business.dia.revalue')}
          </Button>
        </span>
      )}
      {open && <ValueForm holding={h} business={business} run={run} onDone={() => setOpen(false)} />}
    </li>
  );
}

function ValueForm({ holding, business, run, onDone }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ value: '', valuedAt: today(), mode: 'estimated', proofRef: '' });
  const [rate, setRate] = useState(emptyRate);
  const [key] = useState(newIdempotencyKey);
  return (
    <form
      className="business-form dia-value"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = {
          value: toMinorUnits(form.value, holding.currency, { allowZero: true }),
          valuedAt: iso(form.valuedAt),
          mode: form.mode,
          ...(form.proofRef.trim() ? { proofRef: form.proofRef.trim() } : {}),
          ...rateBody(rate, holding.currency, business.currency),
        };
        if (await run(() => api.post(`/fin/entreprise/patrimoine/${holding.id}/valeurs`, body, { idempotencyKey: key }), 'business.dia.valued')) onDone();
      }}
    >
      <div className="business-form-row">
        <AmountField id={`value-${holding.id}`} label={t('business.dia.value')} currency={holding.currency} value={form.value} onChange={(v) => setForm((p) => ({ ...p, value: v }))} required />
        <label>
          {t('business.dia.valuedAt')}
          <input type="date" value={form.valuedAt} onChange={(e) => setForm((p) => ({ ...p, valuedAt: e.target.value }))} required />
        </label>
        <label>
          {t('business.dia.mode')}
          <select value={form.mode} onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {t(`business.dia.modes.${m}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('business.dia.proofRef')}
          <input value={form.proofRef} onChange={(e) => setForm((p) => ({ ...p, proofRef: e.target.value }))} maxLength={160} />
        </label>
      </div>
      <RateFields id={`value-${holding.id}`} from={holding.currency} to={business.currency} value={rate} onChange={setRate} />
      <Button type="submit" variant="secondary">
        {t('business.dia.saveValue')}
      </Button>
    </form>
  );
}

function NewHolding({ business, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ kind: 'asset', category: 'immobilier', label: '', country: 'DZ', currency: 'DZD', value: '', valuedAt: today(), mode: 'estimated', proofRef: '' });
  const [rate, setRate] = useState(emptyRate);
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const currency = form.currency.trim().toUpperCase() || business.currency;
  return (
    <form
      className="business-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = {
          kind: form.kind,
          category: form.category,
          label: form.label.trim(),
          country: form.country.trim().toUpperCase(),
          currency,
          value: toMinorUnits(form.value, currency, { allowZero: true }),
          valuedAt: iso(form.valuedAt),
          mode: form.mode,
          ...(form.proofRef.trim() ? { proofRef: form.proofRef.trim() } : {}),
          ...(rate.rate ? rateBody(rate, currency, business.currency) : {}),
        };
        if (await run(() => api.post('/fin/entreprise/patrimoine', body, { idempotencyKey: key }), 'business.dia.holdingCreated')) {
          setKey(newIdempotencyKey());
          setForm((p) => ({ ...p, label: '', value: '', proofRef: '' }));
          setRate(emptyRate());
        }
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.dia.kind')}
          <select value={form.kind} onChange={set('kind')}>
            <option value="asset">{t('business.dia.kinds.asset')}</option>
            <option value="debt">{t('business.dia.kinds.debt')}</option>
          </select>
        </label>
        <label>
          {t('business.dia.category')}
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`business.dia.categories.${c}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('business.label')}
          <input id="holding-label" value={form.label} onChange={set('label')} maxLength={160} required />
        </label>
        <label>
          {t('business.trade.country')}
          <input value={form.country} onChange={set('country')} maxLength={2} minLength={2} required />
        </label>
      </div>
      <div className="business-form-row">
        <label>
          {t('business.trade.currency')}
          <input value={form.currency} onChange={set('currency')} maxLength={3} minLength={3} required />
        </label>
        <AmountField id="holding-value" label={t('business.dia.value')} currency={currency} value={form.value} onChange={(v) => setForm((p) => ({ ...p, value: v }))} required />
        <label>
          {t('business.dia.valuedAt')}
          <input type="date" value={form.valuedAt} onChange={set('valuedAt')} required />
        </label>
        <label>
          {t('business.dia.mode')}
          <select value={form.mode} onChange={set('mode')}>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {t(`business.dia.modes.${m}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {currency !== business.currency && <p className="inv-muted">{t('business.dia.rateOptional')}</p>}
      {currency !== business.currency && (
        <div className="business-form-row">
          <label>
            {t('business.trade.rateField', { from: currency, to: business.currency })}
            <input type="number" min="0.000001" step="any" value={rate.rate} onChange={(e) => setRate((r) => ({ ...r, rate: e.target.value }))} />
          </label>
          <label>
            {t('business.trade.rateDate')}
            <input type="date" value={rate.rateDate} max={today()} onChange={(e) => setRate((r) => ({ ...r, rateDate: e.target.value }))} required={Boolean(rate.rate)} />
          </label>
          <label>
            {t('business.trade.rateSource')}
            <input value={rate.rateSource} onChange={(e) => setRate((r) => ({ ...r, rateSource: e.target.value }))} maxLength={120} required={Boolean(rate.rate)} />
          </label>
        </div>
      )}
      <Button type="submit" variant="secondary">
        <Plus size={16} aria-hidden="true" />
        {t('business.dia.addHolding')}
      </Button>
    </form>
  );
}
