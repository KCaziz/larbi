import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Download, Eye, EyeOff, FileBadge, Plus, Share2, Trash2, Undo2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { currentOrganisation, newIdempotencyKey } from '../../lib/organisation.js';
import Button from '../../components/ui/Button.jsx';
import { askConfirm } from '../../components/ui/ConfirmDialog.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';

// P13-05, lot F bis (2026-11-25): the financial passport of the organisation
// (FAC-010, ECR-0107) and the receivables to finance (FAC-011, ECR-0104).
// A passport is a dated snapshot, never a rating; a batch lists invoices the
// server found eligible, with the reason for each one left out. Both are shared
// with a financer only with consent, until a date, revocable. FINCLUDIA grants,
// assigns and transfers nothing.

const today = () => new Date().toISOString().slice(0, 10);
const iso = (date) => new Date(`${date}T00:00:00.000Z`).toISOString();
const ITEMS = ['activity', 'receivables', 'clients', 'books', 'quality'];
const inDays = (n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);

/** What a passport holds, as its reader sees it (organisation or financer). */
export function PassportContent({ passport }) {
  const { t, i18n } = useTranslation();
  const c = passport.content;
  const id = c.identite;
  return (
    <div className="passport-content">
      <p className="inv-muted inv-note">
        {t('business.passport.header', { number: passport.number, from: formatDate(i18n.language, passport.periodFrom), to: formatDate(i18n.language, passport.periodTo) })}
        {passport.publishedAt ? ` · ${t('business.passport.publishedOn', { date: formatDate(i18n.language, passport.publishedAt) })}` : ''}
      </p>
      {passport.provisional && <p className="business-document-warning">{t('business.passport.provisional')}</p>}
      <p>
        <strong>{id.nomCommercial || id.nom}</strong>
        {[id.formeJuridique, id.secteur, id.wilaya].filter(Boolean).length > 0 && ` · ${[id.formeJuridique, id.secteur, id.wilaya].filter(Boolean).join(' · ')}`}
        {id.nif ? ` · ${t('business.passport.nif', { value: id.nif })}` : ''}
        {id.registreCommerce ? ` · ${t('business.passport.rc', { value: id.registreCommerce })}` : ''}
      </p>
      {c.activite && (
        <>
          <h4>{t('business.passport.items.activity')}</h4>
          <div className="fin-figure-grid">
            <FigureCard label={t('business.passport.f.revenue')} answer={c.activite.chiffreAffaires} />
            <FigureCard label={t('business.passport.f.margin')} answer={c.activite.marge} />
            <FigureCard label={t('business.passport.f.cashIn')} answer={c.activite.encaissements} />
            <FigureCard label={t('business.passport.f.cashOut')} answer={c.activite.decaissements} />
          </div>
        </>
      )}
      {c.creances && (
        <>
          <h4>{t('business.passport.items.receivables')}</h4>
          <div className="fin-figure-grid">
            <FigureCard label={t('business.passport.f.receivables')} answer={c.creances.creances} />
            <FigureCard label={t('business.passport.f.payables')} answer={c.creances.dettes} />
            <FigureCard label={t('business.passport.f.overdue')} answer={c.creances.echu} />
            <FigureCard label={t('business.passport.f.delay')} answer={c.creances.delaiMoyen} />
          </div>
        </>
      )}
      {c.clients && (
        <>
          <h4>{t('business.passport.items.clients')}</h4>
          <div className="fin-figure-grid">
            <FigureCard label={t('business.passport.f.topClient')} answer={c.clients.partPremierClient} />
            <FigureCard label={t('business.passport.f.topFive')} answer={c.clients.partCinqPremiers} />
          </div>
          <p className="inv-muted inv-note">{t('business.passport.clientsNote', { n: c.clients.nombre })}</p>
        </>
      )}
      {'comptes' in c && (
        <>
          <h4>{t('business.passport.items.books')}</h4>
          {c.comptes ? (
            <div className="fin-figure-grid">
              <FigureCard label={t('business.passport.f.netIncome')} answer={c.comptes.resultatNet} />
              <FigureCard label={t('business.passport.f.workingCapital')} answer={c.comptes.bfr} />
            </div>
          ) : (
            <p className="business-empty">{t('business.passport.noBooks')}</p>
          )}
        </>
      )}
      {c.qualite && (
        <>
          <h4>{t('business.passport.items.quality')}</h4>
          <p className="inv-muted inv-note">
            {t('business.passport.qualityLine', { documents: c.qualite.documents, entries: c.qualite.ecrituresValidees, checks: c.qualite.rapprochementsBancaires })}
            {Object.entries(c.qualite.parOrigine ?? {}).map(([source, n]) => ` · ${t(`business.passport.sources.${source}`, { defaultValue: source })} : ${n}`)}
          </p>
        </>
      )}
      <h4>{t('business.passport.completenessTitle')}</h4>
      <div className="fin-figure-grid">
        <FigureCard label={t('business.passport.completeness')} answer={passport.completeness.index} />
      </div>
      <ul className="passport-checks">
        {passport.completeness.checks.map((check) => (
          <li key={check.key} className={check.ok ? 'ok' : ''}>
            {check.ok ? '✓ ' : '○ '}
            {t(`business.passport.checks.${check.key}`)}
          </li>
        ))}
      </ul>
      <ul className="inv-muted inv-note">
        {c.limites.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

function ShareForm({ kind, id, financers, run, onDone }) {
  const { t } = useTranslation();
  const [spaceId, setSpaceId] = useState(financers[0]?.id ?? '');
  const [expiresAt, setExpiresAt] = useState(inDays(30));
  const [consent, setConsent] = useState(false);
  if (financers.length === 0) return <p className="business-empty">{t('business.passport.noFinancer')}</p>;
  return (
    <form
      className="business-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (await run(() => api.post('/fin/entreprise/partages-financeur', { kind, id, spaceId, expiresAt: iso(expiresAt), consent: true }, { idempotencyKey: newIdempotencyKey() }), 'business.passport.shared')) onDone?.();
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.passport.financer')}
          <select value={spaceId} onChange={(e) => setSpaceId(e.target.value)}>
            {financers.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('business.passport.until')}
          <input type="date" value={expiresAt} min={inDays(1)} max={inDays(180)} onChange={(e) => setExpiresAt(e.target.value)} required />
        </label>
      </div>
      <label className="pilot-check">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        {t(kind === 'batch' ? 'business.passport.consentBatch' : 'business.passport.consentPassport')}
      </label>
      <Button type="submit" variant="secondary" disabled={!consent}>
        <Share2 size={16} aria-hidden="true" />
        {t('business.passport.share')}
      </Button>
    </form>
  );
}

function Shares({ shares, write, run }) {
  const { t, i18n } = useTranslation();
  if (!shares.length) return null;
  return (
    <ul className="trade-pieces">
      {shares.map((s) => (
        <li key={s.id}>
          <span>{s.espace}</span>
          <span className="inv-muted">
            {s.actif ? t('business.passport.shareUntil', { date: formatDate(i18n.language, s.expiresAt) }) : s.revokedAt ? t('business.passport.shareRevoked') : t('business.passport.shareExpired')}
            {` · ${t('business.passport.openings', { n: s.ouvertures })}`}
          </span>
          {write && s.actif && (
            <Button type="button" variant="ghost" onClick={() => run(() => api.delete(`/fin/entreprise/partages-financeur/${s.id}`), 'business.passport.shareStopped')}>
              <Undo2 size={16} aria-hidden="true" />
              {t('business.passport.stopShare')}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function PassportSection({ can, run }) {
  const { t } = useTranslation();
  const state = useApi('/fin/entreprise/passeports');
  const write = can('partners.request');
  const [form, setForm] = useState({ from: inDays(-365), to: today(), items: [...ITEMS] });
  const [open, setOpen] = useState(null);
  const [sharing, setSharing] = useState(null);
  const reload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) state.reload();
    return done;
  };
  const data = state.data;
  return (
    <section aria-labelledby="business-passport">
      <h2 id="business-passport">
        <FileBadge size={18} aria-hidden="true" /> {t('business.passport.title')}
      </h2>
      <p className="business-blocked-intro">{t('business.passport.intro')}</p>
      <p className="fin-hint">{t('business.passport.identityWhere')}</p>
      {write && (
        <form
          className="business-form"
          onSubmit={(event) => {
            event.preventDefault();
            reload(() => api.post('/fin/entreprise/passeports', { from: iso(form.from), to: iso(form.to), items: form.items }, { idempotencyKey: newIdempotencyKey() }), 'business.passport.prepared');
          }}
        >
          <div className="business-form-row">
            <label>
              {t('business.passport.from')}
              <input type="date" value={form.from} onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))} required />
            </label>
            <label>
              {t('business.passport.to')}
              <input type="date" value={form.to} min={form.from} onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))} required />
            </label>
          </div>
          <fieldset className="business-form-row">
            <legend>{t('business.passport.itemsLegend')}</legend>
            {ITEMS.map((item) => (
              <label key={item} className="pilot-check">
                <input
                  type="checkbox"
                  checked={form.items.includes(item)}
                  onChange={(e) => setForm((p) => ({ ...p, items: e.target.checked ? [...p.items, item] : p.items.filter((x) => x !== item) }))}
                />
                {t(`business.passport.items.${item}`)}
              </label>
            ))}
          </fieldset>
          <Button type="submit" variant="secondary">
            <Plus size={16} aria-hidden="true" />
            {t('business.passport.prepare')}
          </Button>
        </form>
      )}
      {state.status === 'loading' && !data ? (
        <LoadingState />
      ) : !data || data.passeports.length === 0 ? (
        <p className="business-empty">{t('business.passport.none')}</p>
      ) : (
        <ul className="business-documents">
          {data.passeports.map((p) => (
            <li key={p.id} className={`business-document passport-${p.status}`}>
              <div className="business-document-head">
                <span className="inv-badge">{t('business.passport.number', { n: p.number })}</span>
                <span className="inv-muted">{t(`business.passport.statuses.${p.status}`)}</span>
                {p.provisional && <span className="inv-badge">{t('business.passport.provisionalShort')}</span>}
              </div>
              <div className="inv-actions">
                <Button type="button" variant="secondary" aria-expanded={open === p.id} onClick={() => setOpen(open === p.id ? null : p.id)}>
                  {open === p.id ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  {open === p.id ? t('business.trade.hide') : t('business.passport.preview')}
                </Button>
                {write && p.status === 'draft' && (
                  <>
                    <Button type="button" variant="primary" onClick={() => reload(() => api.post(`/fin/entreprise/passeports/${p.id}/publier`, { consent: true }, { idempotencyKey: newIdempotencyKey() }), 'business.passport.published')}>
                      <BadgeCheck size={16} aria-hidden="true" />
                      {t('business.passport.publish')}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="inv-danger"
                      onClick={async () => {
                        if (await askConfirm(t('business.passport.discardConfirm', { n: p.number }))) reload(() => api.delete(`/fin/entreprise/passeports/${p.id}`), 'business.passport.discarded');
                      }}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      {t('business.passport.discard')}
                    </Button>
                  </>
                )}
                {write && p.status === 'published' && (
                  <>
                    <Button type="button" variant="secondary" onClick={() => setSharing(sharing === p.id ? null : p.id)}>
                      <Share2 size={16} aria-hidden="true" />
                      {t('business.passport.share')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => reload(() => api.post(`/fin/entreprise/passeports/${p.id}/revoquer`, {}, { idempotencyKey: newIdempotencyKey() }), 'business.passport.revoked')}>
                      {t('business.passport.revoke')}
                    </Button>
                  </>
                )}
              </div>
              {write && p.status === 'draft' && <p className="inv-muted inv-note">{t('business.passport.publishNote')}</p>}
              {sharing === p.id && <ShareForm kind="passport" id={p.id} financers={data.financeurs} run={reload} onDone={() => setSharing(null)} />}
              <Shares shares={p.partages} write={write} run={reload} />
              {open === p.id && <PassportContent passport={p} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ReceivablesFinancingSection({ business, can, run }) {
  const { t, i18n } = useTranslation();
  const write = can('partners.request');
  const [rates, setRates] = useState({ advance: '80', fee: '1' });
  const advanceRate = Number(rates.advance.replace(',', '.')) / 100;
  const feeRate = Number(rates.fee.replace(',', '.')) / 100;
  const valid = advanceRate > 0 && advanceRate <= 1 && feeRate >= 0 && feeRate < 1;
  const candidates = useApi(valid ? `/fin/entreprise/financement-factures?advanceRate=${advanceRate}&feeRate=${feeRate}` : null);
  const batches = useApi('/fin/entreprise/lots-factures');
  const passports = useApi('/fin/entreprise/passeports');
  const [chosen, setChosen] = useState([]);
  const [label, setLabel] = useState('');
  const [sharing, setSharing] = useState(null);
  const money = (v) => formatAmount(i18n.language, v, business.currency);
  const reload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) {
      candidates.reload();
      batches.reload();
    }
    return done;
  };
  const c = candidates.data;
  const download = async (id) => {
    const organisation = currentOrganisation();
    const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/fin/entreprise/lots-factures/${id}/export`, { credentials: 'include', cache: 'no-store', headers: organisation ? { 'X-Organisation': organisation } : {} });
    if (!res.ok) return;
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lot-factures.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <section aria-labelledby="business-financing">
      <h2 id="business-financing">{t('business.financing.title')}</h2>
      <p className="business-blocked-intro">{t('business.financing.intro')}</p>
      <div className="business-form-row">
        <label>
          {t('business.financing.advanceRate')}
          <input type="number" min="1" max="100" step="any" value={rates.advance} onChange={(e) => setRates((p) => ({ ...p, advance: e.target.value }))} />
        </label>
        <label>
          {t('business.financing.feeRate')}
          <input type="number" min="0" max="99" step="any" value={rates.fee} onChange={(e) => setRates((p) => ({ ...p, fee: e.target.value }))} />
        </label>
      </div>
      <p className="inv-muted inv-note">{t('business.financing.hypothesis')}</p>
      {c && (
        <>
          <div className="fin-figure-grid">
            <FigureCard label={t('business.financing.eligible')} answer={c.montantEligible} />
            <FigureCard label={t('business.financing.net')} answer={c.netTheorique} />
          </div>
          <h3 className="pilot-subtitle">{t('business.financing.candidates', { n: c.eligibles.length })}</h3>
          {c.eligibles.length === 0 ? (
            <p className="business-empty">{t('business.financing.noCandidate')}</p>
          ) : (
            <form
              className="business-form"
              onSubmit={async (event) => {
                event.preventDefault();
                if (await reload(() => api.post('/fin/entreprise/lots-factures', { label: label.trim(), documentIds: chosen, advanceRate, feeRate }, { idempotencyKey: newIdempotencyKey() }), 'business.financing.batchCreated')) {
                  setChosen([]);
                  setLabel('');
                }
              }}
            >
              <ul className="trade-pieces">
                {c.eligibles.map((l) => (
                  <li key={l.id}>
                    {write && (
                      <input type="checkbox" aria-label={l.number} checked={chosen.includes(l.id)} onChange={(e) => setChosen((p) => (e.target.checked ? [...p, l.id] : p.filter((x) => x !== l.id)))} />
                    )}
                    <span>
                      {l.number} · {l.client}
                    </span>
                    <span className="inv-muted">{t('business.financing.dueLine', { date: formatDate(i18n.language, l.dueAt) })}</span>
                    <span>{money(l.outstanding)}</span>
                  </li>
                ))}
              </ul>
              {write && (
                <div className="business-form-row">
                  <label>
                    {t('business.financing.batchLabel')}
                    <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={160} required />
                  </label>
                  <Button type="submit" variant="secondary" disabled={chosen.length === 0 || !valid}>
                    <Plus size={16} aria-hidden="true" />
                    {t('business.financing.createBatch', { n: chosen.length })}
                  </Button>
                </div>
              )}
            </form>
          )}
          {c.exclues.length > 0 && (
            <>
              <h3 className="pilot-subtitle">{t('business.financing.excluded', { n: c.exclues.length })}</h3>
              <ul className="trade-pieces">
                {c.exclues.map((l) => (
                  <li key={l.id}>
                    <span>
                      {l.number}
                      {l.client ? ` · ${l.client}` : ''}
                    </span>
                    <span className="inv-muted">{l.reasons.map((r) => t(`business.financing.reasons.${r}`)).join(' ; ')}</span>
                    <span>{money(l.outstanding)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      <h3 className="pilot-subtitle">{t('business.financing.batches')}</h3>
      {!batches.data || batches.data.lots.length === 0 ? (
        <p className="business-empty">{t('business.financing.noBatch')}</p>
      ) : (
        <ul className="business-documents">
          {batches.data.lots.map((b) => (
            <li key={b.id} className="business-document">
              <div className="business-document-head">
                <strong>{b.label}</strong>
                <span className="inv-muted">{t('business.financing.batchLine', { n: b.items.length, total: money(b.total), net: money(b.net) })}</span>
                <span className="business-document-state">{t(`business.financing.statuses.${b.status}`)}</span>
              </div>
              <div className="inv-actions">
                <Button type="button" variant="ghost" onClick={() => download(b.id)}>
                  <Download size={16} aria-hidden="true" />
                  {t('business.financing.export')}
                </Button>
                {write && ['draft', 'shared'].includes(b.status) && (
                  <>
                    <Button type="button" variant="secondary" onClick={() => setSharing(sharing === b.id ? null : b.id)}>
                      <Share2 size={16} aria-hidden="true" />
                      {t('business.passport.share')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => reload(() => api.post(`/fin/entreprise/lots-factures/${b.id}/cloturer`, {}, { idempotencyKey: newIdempotencyKey() }), 'business.financing.closed')}>
                      {t('business.financing.close')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => reload(() => api.post(`/fin/entreprise/lots-factures/${b.id}/annuler`, {}, { idempotencyKey: newIdempotencyKey() }), 'business.financing.cancelled')}>
                      {t('business.financing.cancel')}
                    </Button>
                  </>
                )}
              </div>
              {sharing === b.id && <ShareForm kind="batch" id={b.id} financers={passports.data?.financeurs ?? []} run={reload} onDone={() => setSharing(null)} />}
              <Shares shares={b.partages} write={write} run={reload} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** The financer's side: passports and batches shared with this space, opened on demand (each opening is recorded). */
export function FinancerShares({ spaceId }) {
  const { t, i18n } = useTranslation();
  const list = useApi(`/fin/partenaire/espaces/${spaceId}/partages`);
  const [open, setOpen] = useState(null);
  const shares = list.data?.partages ?? [];
  return (
    <section aria-labelledby="partner-shares">
      <h2 id="partner-shares">{t('business.passport.sharedTitle')}</h2>
      <p className="business-blocked-intro">{t('business.passport.sharedIntro')}</p>
      {shares.length === 0 ? (
        <p className="business-empty">{t('business.passport.sharedNone')}</p>
      ) : (
        <ul className="business-documents">
          {shares.map((s) => (
            <li key={s.id} className="business-document">
              <div className="business-document-head">
                <span className="inv-badge">{t(s.kind === 'batch' ? 'business.passport.kindBatch' : 'business.passport.kindPassport')}</span>
                <strong>{s.organisation}</strong>
                {s.wilaya && <span className="inv-muted">{s.wilaya}</span>}
                <span className="inv-muted">{t('business.passport.shareUntil', { date: formatDate(i18n.language, s.expiresAt) })}</span>
              </div>
              <Button type="button" variant="ghost" aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? null : s.id)}>
                {open === s.id ? t('business.trade.hide') : t('business.passport.openShare')}
              </Button>
              {open === s.id && <SharedItem spaceId={spaceId} id={s.id} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SharedItem({ spaceId, id }) {
  const { t, i18n } = useTranslation();
  const item = useApi(`/fin/partenaire/espaces/${spaceId}/partages/${id}`);
  const s = item.data?.partage;
  if (!s) return item.status === 'error' ? <p className="business-empty">{t('business.passport.shareGone')}</p> : <LoadingState />;
  if (s.kind === 'passport') return <PassportContent passport={s.passeport} />;
  const money = (v) => formatAmount(i18n.language, v, s.organisation.devise);
  return (
    <div>
      <p className="inv-muted inv-note">{t('business.financing.batchLine', { n: s.lot.items.length, total: money(s.lot.total), net: money(s.lot.net) })}</p>
      <ul className="trade-pieces">
        {s.lot.items.map((i) => (
          <li key={i.id}>
            <span>
              {i.document.number} · {i.document.contact?.name}
              {i.document.contact?.taxId ? ` (${i.document.contact.taxId})` : ''}
            </span>
            <span className="inv-muted">{t('business.financing.dueLine', { date: formatDate(i18n.language, i.document.dueAt) })}</span>
            <span>{money(i.amount)}</span>
          </li>
        ))}
      </ul>
      <p className="inv-muted inv-note">{t('business.financing.noDecision')}</p>
    </div>
  );
}
