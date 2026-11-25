import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Plus, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { newIdempotencyKey } from '../../lib/organisation.js';
import Button from '../../components/ui/Button.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';

// P13-05, lot D bis (2026-11-25): the register of the risks of international
// trade (ECR-0370). Level = probability × impact on the server's versioned
// scale; a rating without proof is a provisional index; each reassessment is
// kept. FINCLUDIA rates nothing by itself: the person rates, the server computes.

const today = () => new Date().toISOString().slice(0, 10);
const iso = (date) => new Date(`${date}T00:00:00.000Z`).toISOString();
const CATEGORIES = ['country', 'counterparty', 'transport', 'payment', 'currency', 'other'];
const SCALE = [1, 2, 3, 4, 5];

export function RiskRegister({ business, operations = [], write, run }) {
  const { t } = useTranslation();
  const risks = useApi('/fin/entreprise/risques');
  const reload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) risks.reload();
    return done;
  };
  const data = risks.data;
  return (
    <section aria-labelledby="business-risks">
      <h2 id="business-risks">
        <ShieldAlert size={18} aria-hidden="true" /> {t('business.risk.title')}
      </h2>
      <p className="business-blocked-intro">{t('business.risk.intro')}</p>
      {data && (
        <p className="inv-muted inv-note">
          {t('business.risk.summary', { open: data.synthese.ouverts, critical: data.synthese.critiques, high: data.synthese.eleves, provisional: data.synthese.provisoires, late: data.synthese.revuesEnRetard })}
        </p>
      )}
      {write && <NewRisk business={business} operations={operations} run={reload} />}
      {risks.status === 'loading' && !data ? (
        <LoadingState />
      ) : !data || data.risques.length === 0 ? (
        <p className="business-empty">{t('business.risk.none')}</p>
      ) : (
        <ul className="business-documents">
          {data.risques.map((r) => (
            <RiskCard key={r.id} risk={r} business={business} write={write} run={reload} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ScaleSelect({ id, label, value, onChange }) {
  const { t } = useTranslation();
  return (
    <label>
      {label}
      <select id={id} value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {SCALE.map((n) => (
          <option key={n} value={n}>
            {n} — {t(`business.risk.scale.${n}`)}
          </option>
        ))}
      </select>
    </label>
  );
}

function NewRisk({ business, operations, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ category: 'counterparty', operationId: '', country: '', counterparty: '', probability: 3, impact: 3, exposure: '', guaranteedAmount: '', guarantee: '', evidenceRef: '', reviewAt: today() });
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const currency = business.currency;
  return (
    <form
      className="business-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = {
          category: form.category,
          counterparty: form.counterparty.trim(),
          probability: form.probability,
          impact: form.impact,
          reviewAt: iso(form.reviewAt),
          ...(form.operationId ? { operationId: form.operationId } : {}),
          ...(form.country.trim() ? { country: form.country.trim() } : {}),
          ...(form.exposure ? { exposure: toMinorUnits(form.exposure, currency, { allowZero: true }), currency } : {}),
          ...(form.guaranteedAmount ? { guaranteedAmount: toMinorUnits(form.guaranteedAmount, currency, { allowZero: true }) } : {}),
          ...(form.guarantee.trim() ? { guarantee: form.guarantee.trim() } : {}),
          ...(form.evidenceRef.trim() ? { evidenceRef: form.evidenceRef.trim() } : {}),
        };
        if (await run(() => api.post('/fin/entreprise/risques', body, { idempotencyKey: key }), 'business.risk.created')) {
          setKey(newIdempotencyKey());
          setForm((p) => ({ ...p, country: '', counterparty: '', exposure: '', guaranteedAmount: '', guarantee: '', evidenceRef: '' }));
        }
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.risk.category')}
          <select id="risk-category" value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`business.risk.categories.${c}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('business.risk.counterparty')}
          <input id="risk-counterparty" value={form.counterparty} onChange={set('counterparty')} maxLength={255} required />
        </label>
        <label>
          {t('business.risk.country')}
          <input value={form.country} onChange={set('country')} maxLength={80} />
        </label>
        {operations.length > 0 && (
          <label>
            {t('business.trade.linkOperation')}
            <select value={form.operationId} onChange={set('operationId')}>
              <option value="">{t('business.trade.noOperation')}</option>
              {operations.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.reference} · {op.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="business-form-row">
        <ScaleSelect id="risk-probability" label={t('business.risk.probability')} value={form.probability} onChange={(v) => setForm((p) => ({ ...p, probability: v }))} />
        <ScaleSelect id="risk-impact" label={t('business.risk.impact')} value={form.impact} onChange={(v) => setForm((p) => ({ ...p, impact: v }))} />
        <label>
          {t('business.risk.reviewAt')}
          <input type="date" value={form.reviewAt} onChange={set('reviewAt')} required />
        </label>
      </div>
      <div className="business-form-row">
        <AmountField id="risk-exposure" label={t('business.risk.exposure')} currency={currency} value={form.exposure} onChange={(v) => setForm((p) => ({ ...p, exposure: v }))} />
        <AmountField id="risk-guaranteed" label={t('business.risk.guaranteedAmount')} currency={currency} value={form.guaranteedAmount} onChange={(v) => setForm((p) => ({ ...p, guaranteedAmount: v }))} />
        <label>
          {t('business.risk.guarantee')}
          <input value={form.guarantee} onChange={set('guarantee')} maxLength={255} placeholder={t('business.risk.guaranteeHint')} />
        </label>
      </div>
      <div className="business-form-row">
        <label>
          {t('business.risk.evidence')}
          <input value={form.evidenceRef} onChange={set('evidenceRef')} maxLength={255} placeholder={t('business.risk.evidenceHint')} />
        </label>
      </div>
      <p className="inv-muted inv-note">{t('business.risk.levelPreview', { level: form.probability * form.impact })}</p>
      <Button type="submit" variant="secondary">
        <Plus size={16} aria-hidden="true" />
        {t('business.risk.create')}
      </Button>
    </form>
  );
}

function RiskCard({ risk, business, write, run }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState({ probability: risk.probability, impact: risk.impact, evidenceRef: risk.evidenceRef ?? '', reviewAt: String(risk.reviewAt).slice(0, 10), note: '' });
  const [action, setAction] = useState({ label: '', ownerName: '', dueAt: '' });
  const money = (value) => formatAmount(i18n.language, value, risk.currency ?? business.currency);
  const base = `/fin/entreprise/risques/${risk.id}`;
  const reassess = (close = false) =>
    run(
      () =>
        api.put(
          base,
          {
            probability: rating.probability,
            impact: rating.impact,
            reviewAt: iso(rating.reviewAt),
            ...(rating.evidenceRef.trim() ? { evidenceRef: rating.evidenceRef.trim() } : {}),
            ...(rating.note.trim() ? { note: rating.note.trim() } : {}),
            ...(close ? { close: true } : {}),
          },
          { ifMatch: risk.version },
        ),
      close ? 'business.risk.closed' : 'business.risk.reassessed',
    );

  return (
    <li className={`business-document risk-${risk.bande} ${risk.status === 'closed' ? 'risk-closed' : ''}`}>
      <div className="business-document-head">
        <span className="inv-badge">{t(`business.risk.categories.${risk.category}`)}</span>
        <strong>{risk.counterparty}</strong>
        {risk.country && <span className="inv-muted">{risk.country}</span>}
        <span className="business-document-state">
          {risk.status === 'closed' ? t('business.risk.statusClosed') : t('business.risk.levelLine', { level: risk.niveau, band: t(`business.risk.bands.${risk.bande}`) })}
        </span>
      </div>
      <p className="inv-muted inv-note">
        {t('business.risk.ratingLine', { p: risk.probability, i: risk.impact })}
        {risk.provisoire && ` · ${t('business.risk.provisional')}`}
        {` · ${t('business.risk.reviewLine', { date: formatDate(i18n.language, risk.reviewAt) })}`}
        {risk.revueEnRetard && ` · ${t('business.risk.reviewLate')}`}
        {risk.actionsOuvertes > 0 && ` · ${t('business.risk.openActions', { n: risk.actionsOuvertes })}`}
      </p>
      {(risk.exposure !== null || risk.guarantee) && (
        <div className="fin-figure-grid trade-figures">
          {risk.exposure !== null && (
            <FigureCard label={t('business.risk.coverage')} answer={risk.couverture}>
              <p className="inv-muted">{t('business.risk.coverageLine', { guaranteed: risk.guaranteedAmount === null ? '—' : money(risk.guaranteedAmount), exposure: money(risk.exposure) })}</p>
            </FigureCard>
          )}
          {risk.guarantee && <p className="inv-muted inv-note">{t('business.risk.guaranteeLine', { text: risk.guarantee })}</p>}
        </div>
      )}
      <div className="inv-actions">
        <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? t('business.trade.hide') : t('business.dia.details')}
        </Button>
      </div>
      {open && (
        <div className="trade-details">
          <h3 className="pilot-subtitle">{t('business.risk.actionsTitle')}</h3>
          {risk.actions.length === 0 ? (
            <p className="business-empty">{t('business.risk.noAction')}</p>
          ) : (
            <ul className="trade-pieces">
              {risk.actions.map((a) => (
                <li key={a.id}>
                  <span>{a.label}</span>
                  <span className="inv-muted">
                    {a.ownerName}
                    {a.dueAt ? ` · ${formatDate(i18n.language, a.dueAt)}` : ''}
                  </span>
                  {a.doneAt ? (
                    <span className="inv-muted">{t('business.risk.actionDone', { date: formatDate(i18n.language, a.doneAt) })}</span>
                  ) : (
                    write && (
                      <Button type="button" variant="ghost" onClick={() => run(() => api.post(`${base}/actions/${a.id}/faite`, {}, { idempotencyKey: newIdempotencyKey() }), 'business.risk.actionMarked')}>
                        <Check size={16} aria-hidden="true" />
                        {t('business.risk.markDone')}
                      </Button>
                    )
                  )}
                </li>
              ))}
            </ul>
          )}
          {write && risk.status === 'open' && (
            <form
              className="business-form"
              onSubmit={async (event) => {
                event.preventDefault();
                const body = { label: action.label.trim(), ownerName: action.ownerName.trim(), ...(action.dueAt ? { dueAt: iso(action.dueAt) } : {}) };
                if (await run(() => api.post(`${base}/actions`, body, { idempotencyKey: newIdempotencyKey() }), 'business.risk.actionAdded')) setAction({ label: '', ownerName: '', dueAt: '' });
              }}
            >
              <div className="business-form-row">
                <label>
                  {t('business.risk.actionLabel')}
                  <input value={action.label} onChange={(e) => setAction((p) => ({ ...p, label: e.target.value }))} maxLength={255} required />
                </label>
                <label>
                  {t('business.risk.owner')}
                  <input value={action.ownerName} onChange={(e) => setAction((p) => ({ ...p, ownerName: e.target.value }))} maxLength={160} required />
                </label>
                <label>
                  {t('business.risk.dueAt')}
                  <input type="date" value={action.dueAt} onChange={(e) => setAction((p) => ({ ...p, dueAt: e.target.value }))} />
                </label>
              </div>
              <Button type="submit" variant="ghost">
                <Plus size={16} aria-hidden="true" />
                {t('business.risk.addAction')}
              </Button>
            </form>
          )}

          {write && risk.status === 'open' && (
            <>
              <h3 className="pilot-subtitle">{t('business.risk.reassessTitle')}</h3>
              <div className="business-form">
                <div className="business-form-row">
                  <ScaleSelect id={`risk-p-${risk.id}`} label={t('business.risk.probability')} value={rating.probability} onChange={(v) => setRating((p) => ({ ...p, probability: v }))} />
                  <ScaleSelect id={`risk-i-${risk.id}`} label={t('business.risk.impact')} value={rating.impact} onChange={(v) => setRating((p) => ({ ...p, impact: v }))} />
                  <label>
                    {t('business.risk.reviewAt')}
                    <input type="date" value={rating.reviewAt} onChange={(e) => setRating((p) => ({ ...p, reviewAt: e.target.value }))} required />
                  </label>
                </div>
                <div className="business-form-row">
                  <label>
                    {t('business.risk.evidence')}
                    <input value={rating.evidenceRef} onChange={(e) => setRating((p) => ({ ...p, evidenceRef: e.target.value }))} maxLength={255} />
                  </label>
                  <label>
                    {t('business.risk.note')}
                    <input value={rating.note} onChange={(e) => setRating((p) => ({ ...p, note: e.target.value }))} maxLength={300} />
                  </label>
                </div>
                <div className="inv-actions">
                  <Button type="button" variant="secondary" onClick={() => reassess(false)}>
                    {t('business.risk.reassess')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => reassess(true)}>
                    {t('business.risk.close')}
                  </Button>
                </div>
              </div>
            </>
          )}

          <h3 className="pilot-subtitle">{t('business.risk.historyTitle')}</h3>
          <ul className="trade-pieces">
            {risk.reviews.map((rv) => (
              <li key={rv.id}>
                <span>{formatDate(i18n.language, rv.reviewedAt)}</span>
                <span>{t('business.risk.historyLine', { p: rv.probability, i: rv.impact, level: rv.level })}</span>
                {rv.note && <span className="inv-muted">{rv.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
