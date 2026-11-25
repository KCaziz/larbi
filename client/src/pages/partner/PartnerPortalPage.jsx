import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, Check, Download, Handshake, Plus, Trash2, X } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import { FinancerShares } from '../entreprise/Financing.jsx';
import { OwnFormations, Sessions } from './InstitutionTraining.jsx';
import '../entreprise/Business.css';

// P13-05, lot I (2026-11-25): the partners' and institutions' own space
// (ECR-0287 to 0294, ECR-0307). Nothing is shown without a consent given
// elsewhere; an institution sees aggregates only, above its threshold.

const STATUSES = ['received', 'in_review', 'answered', 'closed'];

async function download(path, name, t) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}${path}`, { credentials: 'include', cache: 'no-store' });
    if (!response.ok) throw new Error(String(response.status));
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    window.alert(t('partnerPortal.downloadFailed'));
  }
}

export default function PartnerPortalPage() {
  const { t } = useTranslation();
  const spaces = useApi('/fin/partenaire/espaces');
  const [chosen, setChosen] = useState(null);
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('partnerPortal.title'), t('partnerPortal.intro'));
  const list = spaces.data?.espaces ?? [];
  const current = list.find((s) => s.id === chosen) ?? list[0] ?? null;

  const run = async (action, okKey) => {
    setMessage(null);
    try {
      const result = await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      return result ?? true;
    } catch (err) {
      const reason = err?.details?.reason;
      setMessage({ kind: 'error', text: reason ? t(`partnerPortal.errors.${reason}`, { defaultValue: t(errorKey(err)) }) : t(errorKey(err)) });
      return false;
    }
  };

  return (
    <>
      <PageHeader icon={Handshake} title={t('partnerPortal.title')} subtitle={t('partnerPortal.intro')} maxWidth={1100} />
      <div className="business-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}
        {spaces.status === 'loading' && !spaces.data ? (
          <LoadingState />
        ) : list.length === 0 ? (
          <p className="business-empty">{t('partnerPortal.none')}</p>
        ) : (
          <>
            {list.length > 1 && (
              <div className="business-tabs" role="tablist" aria-label={t('partnerPortal.spaces')}>
                {list.map((s) => (
                  <button key={s.id} type="button" role="tab" aria-selected={current?.id === s.id} className={current?.id === s.id ? 'business-tab is-on' : 'business-tab'} onClick={() => setChosen(s.id)}>
                    {s.name}
                  </button>
                ))}
              </div>
            )}
            {current && <p className="inv-muted inv-note">{t(`partnerPortal.kinds.${current.kind}`)}</p>}
            {current?.kind === 'financer' && <Financer key={current.id} spaceId={current.id} run={run} />}
            {current?.kind === 'financer' && <FinancerShares key={`shares-${current.id}`} spaceId={current.id} />}
            {current?.kind === 'institution' && <Institution key={current.id} spaceId={current.id} run={run} />}
            {current?.kind === 'cip' && <Platform key={current.id} spaceId={current.id} />}
          </>
        )}
      </div>
    </>
  );
}

// ---- financer (ECR-0287, 0288) -----------------------------------------------------------

function Financer({ spaceId, run }) {
  const { t, i18n } = useTranslation();
  const files = useApi(`/fin/partenaire/espaces/${spaceId}/dossiers`);
  const [open, setOpen] = useState(null);
  const data = files.data;
  if (files.status === 'loading' && !data) return <LoadingState />;
  if (!data) return null;
  return (
    <section aria-labelledby="partner-files">
      <h2 id="partner-files">{t('partnerPortal.filesTitle')}</h2>
      <p className="business-blocked-intro">{t('partnerPortal.filesIntro')}</p>
      <div className="fin-figure-grid">
        <FigureCard label={t('partnerPortal.responseTime')} answer={data.delaiReponse} />
      </div>
      {data.dossiers.length === 0 ? (
        <p className="business-empty">{t('partnerPortal.noFile')}</p>
      ) : (
        <ul className="business-documents">
          {data.dossiers.map((d) => (
            <li key={d.id} className="business-document">
              <div className="business-document-head">
                <strong>{d.business.tradeName || d.business.name}</strong>
                <span>{d.offer.title}</span>
                <span className="inv-muted">{formatDate(i18n.language, d.createdAt)}</span>
                <span className="business-document-state">{t(`partnerPortal.statuses.${d.status}`)}</span>
                {d.demandesOuvertes > 0 && <span className="inv-badge">{t('partnerPortal.openRequests', { n: d.demandesOuvertes })}</span>}
              </div>
              <Button type="button" variant="ghost" aria-expanded={open === d.id} onClick={() => setOpen(open === d.id ? null : d.id)}>
                {open === d.id ? t('partnerPortal.hide') : t('partnerPortal.open')}
              </Button>
              {open === d.id && <File spaceId={spaceId} id={d.id} run={run} onChange={files.reload} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function File({ spaceId, id, run, onChange }) {
  const { t, i18n } = useTranslation();
  const file = useApi(`/fin/partenaire/espaces/${spaceId}/dossiers/${id}`);
  const [form, setForm] = useState({ kind: 'piece', body: '', dueAt: '' });
  const base = `/fin/partenaire/espaces/${spaceId}/dossiers/${id}`;
  const act = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) {
      file.reload();
      onChange();
    }
    return done;
  };
  const d = file.data?.dossier;
  if (file.status === 'loading' && !d) return <LoadingState />;
  if (!d) return null;
  const shared = d.partage;
  const currency = shared.profile?.currency ?? 'DZD';
  return (
    <div className="trade-details">
      <p className="inv-muted inv-note">{t('partnerPortal.motive', { motive: d.motive })}</p>
      {d.amount !== null && <p className="inv-muted inv-note">{t('partnerPortal.amount', { amount: formatAmount(i18n.language, d.amount, d.currency ?? currency) })}</p>}
      {d.message && <p className="forum-body">{d.message}</p>}
      <h3 className="pilot-subtitle">{t('partnerPortal.sharedTitle')}</h3>
      {(d.sharedItems ?? []).length === 0 ? (
        <p className="inv-muted inv-note">{t('partnerPortal.nothingShared')}</p>
      ) : (
        <ul className="trade-pieces">
          {shared.profile && (
            <li>
              <span>
                {t('partnerPortal.items.profile')} : {[shared.profile.name, shared.profile.legalForm, shared.profile.sector, shared.profile.wilaya].filter(Boolean).join(' · ')}
              </span>
            </li>
          )}
          {shared.dashboard && (
            <li>
              <span>{t('partnerPortal.items.dashboard')}</span>
              <span className="fin-figure-grid trade-figures">
                {['tresorerie', 'encaissements', 'creances', 'dettes', 'echu']
                  .filter((k) => shared.dashboard[k] && typeof shared.dashboard[k] === 'object' && 'resultat' in shared.dashboard[k])
                  .map((k) => (
                    <FigureCard key={k} label={t(`partnerPortal.figures.${k}`)} answer={shared.dashboard[k]} />
                  ))}
              </span>
            </li>
          )}
          {shared.cashPlan && (
            <li>
              <span>{t('partnerPortal.items.cashPlan')}</span>
              <span className="inv-muted">{t('partnerPortal.cashWeeks', { n: (shared.cashPlan.semaines ?? []).length })}</span>
            </li>
          )}
          {shared.documents && (
            <li>
              <span>{t('partnerPortal.items.documents')}</span>
              <span className="inv-muted">{t('partnerPortal.documentsCount', { n: shared.documents.length })}</span>
            </li>
          )}
          {shared.projects && (
            <li>
              <span>{t('partnerPortal.items.projects')}</span>
              <span className="inv-muted">{shared.projects.map((p) => p.name).join(' · ') || '-'}</span>
            </li>
          )}
        </ul>
      )}

      <div className="inv-actions">
        <label className="pilot-inline">
          {t('partnerPortal.status')}
          <select value={d.status} onChange={(e) => act(() => api.put(base, { status: e.target.value }), 'partnerPortal.saved')} disabled={d.status === 'closed'}>
            {[d.status, ...STATUSES.filter((s) => s !== d.status)].map((s) => (
              <option key={s} value={s}>
                {t(`partnerPortal.statuses.${s}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h3 className="pilot-subtitle">{t('partnerPortal.messagesTitle')}</h3>
      {d.messages.length === 0 ? (
        <p className="inv-muted inv-note">{t('partnerPortal.noMessage')}</p>
      ) : (
        <ul className="trade-pieces">
          {d.messages.map((m) => (
            <li key={m.id} className={m.side === 'partner' ? 'dia-status-submitted' : 'dia-status-validated'}>
              <span>
                <strong>{t(`partnerPortal.kindsOfMessage.${m.kind}`)}</strong> · {formatDate(i18n.language, m.createdAt)}
                {m.dueAt ? ` · ${t('partnerPortal.dueOn', { date: formatDate(i18n.language, m.dueAt) })}` : ''}
                <br />
                {m.body}
              </span>
              {m.side === 'partner' && m.kind === 'piece' && !m.closedAt && (
                <Button type="button" variant="ghost" onClick={() => act(() => api.post(`${base}/messages/${m.id}/clore`, {}), 'partnerPortal.saved')}>
                  <Check size={16} aria-hidden="true" />
                  {t('partnerPortal.closeRequest')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {d.status !== 'closed' && (
        <form
          className="business-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await act(() => api.post(`${base}/messages`, { kind: form.kind, body: form.body.trim(), ...(form.dueAt ? { dueAt: form.dueAt } : {}) }), 'partnerPortal.sent')) setForm((p) => ({ ...p, body: '' }));
          }}
        >
          <div className="business-form-row">
            <label>
              {t('partnerPortal.messageKind')}
              <select value={form.kind} onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value }))}>
                <option value="piece">{t('partnerPortal.kindsOfMessage.piece')}</option>
                <option value="comment">{t('partnerPortal.kindsOfMessage.comment')}</option>
              </select>
            </label>
            {form.kind === 'piece' && (
              <label>
                {t('partnerPortal.dueAt')}
                <input type="date" value={form.dueAt} onChange={(e) => setForm((p) => ({ ...p, dueAt: e.target.value }))} />
              </label>
            )}
          </div>
          <label>
            {t('partnerPortal.messageBody')}
            <textarea className="inv-preview" rows={3} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} maxLength={3000} required />
          </label>
          <Button type="submit" variant="secondary">
            {t('partnerPortal.send')}
          </Button>
        </form>
      )}
    </div>
  );
}

// ---- institution (ECR-0289 to 0294) -----------------------------------------------------------

function Institution({ spaceId, run }) {
  const { t, i18n } = useTranslation();
  const view = useApi(`/fin/partenaire/espaces/${spaceId}/institution`);
  const [form, setForm] = useState({ name: '', audience: '', startsAt: new Date().toISOString().slice(0, 10), milestones: '' });
  const base = `/fin/partenaire/espaces/${spaceId}`;
  const act = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) view.reload();
    return done;
  };
  const data = view.data;
  if (view.status === 'loading' && !data) return <LoadingState />;
  if (!data) return null;
  return (
    <>
    <section aria-labelledby="partner-institution">
      <h2 id="partner-institution">
        <Building size={18} aria-hidden="true" /> {t('partnerPortal.institutionTitle')}
      </h2>
      <Notice variant="info">{t('partnerPortal.aggregatesOnly', { n: data.espace.seuil })}</Notice>
      <div className="fin-figure-grid">
        <FigureCard label={t('partnerPortal.licenceUse')} answer={data.licences.utilisation} />
      </div>
      <p className="inv-muted inv-note">{t('partnerPortal.licences', { used: data.licences.activees, total: data.licences.disponibles || t('partnerPortal.unlimited') })}</p>
      <Button type="button" variant="ghost" onClick={() => download(`${base}/institution/export`, 'fincludia-institution.csv', t)}>
        <Download size={16} aria-hidden="true" />
        {t('partnerPortal.export')}
      </Button>

      <form
        className="business-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const milestones = form.milestones
            .split('\n')
            .map((m) => m.trim())
            .filter(Boolean);
          if (await act(() => api.post(`${base}/programmes`, { name: form.name.trim(), startsAt: form.startsAt, ...(form.audience.trim() ? { audience: form.audience.trim() } : {}), milestones }), 'partnerPortal.programCreated')) {
            setForm((p) => ({ ...p, name: '', audience: '', milestones: '' }));
          }
        }}
      >
        <h3 className="pilot-subtitle">{t('partnerPortal.newProgram')}</h3>
        <div className="business-form-row">
          <label>
            {t('partnerPortal.programName')}
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} maxLength={160} required />
          </label>
          <label>
            {t('partnerPortal.audience')}
            <input value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))} maxLength={160} />
          </label>
          <label>
            {t('partnerPortal.startsAt')}
            <input type="date" value={form.startsAt} onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))} required />
          </label>
        </div>
        <label>
          {t('partnerPortal.milestones')}
          <textarea className="inv-preview" rows={3} value={form.milestones} onChange={(e) => setForm((p) => ({ ...p, milestones: e.target.value }))} />
        </label>
        <Button type="submit" variant="secondary">
          <Plus size={16} aria-hidden="true" />
          {t('partnerPortal.createProgram')}
        </Button>
      </form>

      {data.programmes.length === 0 ? (
        <p className="business-empty">{t('partnerPortal.noProgram')}</p>
      ) : (
        <ul className="business-documents">
          {data.programmes.map((p) => (
            <li key={p.id} className="business-document">
              <div className="business-document-head">
                <strong>{p.name}</strong>
                {p.audience && <span className="inv-muted">{p.audience}</span>}
                <span className="inv-muted">{formatDate(i18n.language, p.startsAt)}</span>
              </div>
              <div className="fin-figure-grid trade-figures">
                <FigureCard label={t('partnerPortal.progress')} answer={p.avancement} />
              </div>
              {(p.milestones ?? []).length > 0 && (
                <ul className="trade-pieces">
                  {p.milestones.map((m, index) => (
                    <li key={`${m.label}-${index}`} className={m.done ? 'dia-status-validated' : 'dia-status-planned'}>
                      <label className="pilot-check">
                        <input type="checkbox" checked={m.done} onChange={(e) => act(() => api.put(`${base}/programmes/${p.id}`, { milestone: { index, done: e.target.checked } }), 'partnerPortal.saved')} />
                        {m.label}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              {p.cohorts.map((c) => (
                <Cohort key={c.id} cohort={c} formations={data.formations} base={base} act={act} />
              ))}
              <form
                className="business-form business-payment"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const name = new FormData(e.currentTarget).get('name');
                  if (await act(() => api.post(`${base}/programmes/${p.id}/cohortes`, { name: String(name).trim() }), 'partnerPortal.cohortCreated')) e.currentTarget?.reset?.();
                }}
              >
                <label>
                  {t('partnerPortal.cohortName')}
                  <input name="name" maxLength={160} required />
                </label>
                <Button type="submit" variant="secondary">
                  <Plus size={16} aria-hidden="true" />
                  {t('partnerPortal.addCohort')}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
    {/* Lot I bis (ECR-0294): the institution's own courses and sessions. */}
    <OwnFormations spaceId={spaceId} run={run} onChange={view.reload} />
    <Sessions key={data.programmes.length} spaceId={spaceId} cohorts={data.programmes.flatMap((p) => p.cohorts)} run={run} />
    </>
  );
}

function Cohort({ cohort, formations, base, act }) {
  const { t } = useTranslation();
  const [emails, setEmails] = useState('');
  const [formationId, setFormationId] = useState('');
  const s = cohort.stats;
  return (
    <div className="trade-details">
      <h3 className="pilot-subtitle">{cohort.name}</h3>
      <div className="fin-figure-grid trade-figures">
        <FigureCard label={t('partnerPortal.activation')} answer={s.activation} />
        <FigureCard label={t('partnerPortal.completion')} answer={s.completion} />
        <FigureCard label={t('partnerPortal.impact')} answer={s.impact} />
      </div>
      <p className="inv-muted inv-note">
        {s.masque ? t('partnerPortal.masked', { n: s.seuil }) : t('partnerPortal.cohortCounts', { invited: s.invites, active: s.actifs, started: s.demarres ?? 0, done: s.termines ?? 0, certificates: s.attestations ?? 0 })}
      </p>
      <ul className="trade-pieces">
        {cohort.formations.map((f) => (
          <li key={f.id}>
            <span>{f.title}</span>
            <Button type="button" variant="ghost" aria-label={t('partnerPortal.unassign', { title: f.title })} onClick={() => act(() => api.delete(`${base}/cohortes/${cohort.id}/formations/${f.id}`), 'partnerPortal.saved')}>
              <X size={16} aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="inv-actions">
        <label className="pilot-inline">
          {t('partnerPortal.assign')}
          <select value={formationId} onChange={(e) => setFormationId(e.target.value)}>
            <option value="">{t('partnerPortal.chooseCourse')}</option>
            {formations.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" variant="secondary" disabled={!formationId} onClick={() => act(() => api.post(`${base}/cohortes/${cohort.id}/formations`, { formationId }), 'partnerPortal.assigned').then(() => setFormationId(''))}>
          {t('partnerPortal.assignButton')}
        </Button>
      </div>
      <form
        className="business-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const list = emails
            .split(/[\s,;]+/)
            .map((x) => x.trim())
            .filter(Boolean);
          if (list.length && (await act(() => api.post(`${base}/cohortes/${cohort.id}/invitations`, { emails: list }), 'partnerPortal.invited'))) setEmails('');
        }}
      >
        <label>
          {t('partnerPortal.inviteEmails')}
          <textarea className="inv-preview" rows={2} value={emails} onChange={(e) => setEmails(e.target.value)} />
        </label>
        <Button type="submit" variant="secondary">
          {t('partnerPortal.invite')}
        </Button>
      </form>
      {cohort.membres.length > 0 && (
        <ul className="trade-pieces">
          {cohort.membres.map((m) => (
            <li key={m.id}>
              <span>
                {m.email} · {t(`partnerPortal.memberStatuses.${m.status}`)}
              </span>
              <Button type="button" variant="ghost" aria-label={t('partnerPortal.removeLearner', { email: m.email })} onClick={() => act(() => api.delete(`${base}/cohortes/${cohort.id}/membres/${m.id}`), 'partnerPortal.saved')}>
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---- crowdfunding platform (ECR-0307) -------------------------------------------------------------

function Platform({ spaceId }) {
  const { t, i18n } = useTranslation();
  const reports = useApi(`/fin/partenaire/espaces/${spaceId}/rapports`);
  const list = reports.data?.rapports ?? [];
  if (reports.status === 'loading' && !reports.data) return <LoadingState />;
  return (
    <section aria-labelledby="partner-reports">
      <h2 id="partner-reports">{t('partnerPortal.reportsTitle')}</h2>
      <p className="business-blocked-intro">{t('partnerPortal.reportsIntro')}</p>
      {list.length === 0 ? (
        <p className="business-empty">{t('partnerPortal.noReport')}</p>
      ) : (
        <ul className="business-documents">
          {list.map((r) => (
            <li key={r.id} className="business-document">
              <div className="business-document-head">
                <strong>{r.campaign.name}</strong>
                <span>{r.campaign.business.tradeName || r.campaign.business.name}</span>
                <span className="inv-muted">{t('partnerPortal.period', { from: formatDate(i18n.language, r.periodFrom), to: formatDate(i18n.language, r.periodTo) })}</span>
              </div>
              <Button type="button" variant="ghost" onClick={() => download(`/fin/partenaire/espaces/${spaceId}/rapports/${r.id}/export`, 'fincludia-rapport-campagne.csv', t)}>
                <Download size={16} aria-hidden="true" />
                {t('partnerPortal.export')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
