import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe2, PackageCheck, Plus, Ship } from 'lucide-react';
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
import { RiskRegister } from './Risks.jsx';
import { CurrencySelect, RateSourceSelect } from '../../components/fincludia/BusinessFields.jsx';

// P13-05, lot D (2026-11-24): micro-import and international trade — the
// client's screens ECR-0350 to ECR-0371. FINCLUDIA prepares, computes and
// keeps the proof; it files nothing with customs and moves no money. Every
// figure is the server's.

const today = () => new Date().toISOString().slice(0, 10);
const iso = (date) => new Date(`${date}T00:00:00.000Z`).toISOString();
const KINDS = ['micro_import', 'import', 'export'];
const COST_KINDS = ['goods', 'transport', 'insurance', 'travel', 'duties', 'customs_fees', 'bank', 'local_transport', 'other'];
const STATUSES = ['draft', 'ordered', 'shipped', 'closed', 'cancelled'];
const PIECE_STATUSES = ['missing', 'submitted', 'accepted', 'rejected'];
const VARIATIONS = [-0.1, -0.05, 0.05, 0.1, 0.2];

export function TradeSection({ business, can, run }) {
  const { t } = useTranslation();
  const refs = useApi('/fin/entreprise/commerce/references');
  const operations = useApi('/fin/entreprise/operations');
  const contacts = useApi('/fin/entreprise/tiers');
  const stock = useApi('/fin/entreprise/stock');
  const write = can('trade.write');
  const reload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) {
      operations.reload();
      stock.reload();
    }
    return done;
  };
  const list = operations.data?.operations ?? [];
  const hasMicro = business.publicKey === 'PUB-08' || list.some((op) => op.kind === 'micro_import');

  return (
    <>
      <section aria-labelledby="business-trade">
        <h2 id="business-trade">
          <Globe2 size={18} aria-hidden="true" /> {t('business.trade.title')}
        </h2>
        <p className="business-blocked-intro">{t('business.trade.intro')}</p>

        {hasMicro && refs.data && <MicroImportRules rules={refs.data.reglesMicroImport} />}

        {write && <NewOperation business={business} contacts={contacts.data?.tiers ?? []} items={stock.data?.articles ?? []} incoterms={refs.data?.incoterms ?? []} run={reload} />}

        {operations.status === 'loading' && !operations.data ? (
          <LoadingState />
        ) : list.length === 0 ? (
          <p className="business-empty">{t('business.trade.none')}</p>
        ) : (
          <ul className="business-documents">
            {list.map((op) => (
              <OperationCard key={op.id} op={op} business={business} write={write} items={stock.data?.articles ?? []} incoterms={refs.data?.incoterms ?? []} run={reload} />
            ))}
          </ul>
        )}
      </section>

      {/* Lot D bis: the register of country, counterparty and transport risks (ECR-0370). */}
      <RiskRegister business={business} operations={list} write={write} run={run} />

      {refs.data && <IncotermsMatrix incoterms={refs.data.incoterms} version={refs.data.versionIncoterms} />}
    </>
  );
}

// DEC-013: each micro-import rule is confirmed, or « not published ».
function MicroImportRules({ rules }) {
  const { t } = useTranslation();
  return (
    <div className="trade-rules">
      <h3 className="pilot-subtitle">{t('business.trade.rulesTitle')}</h3>
      <ul className="business-blocked">
        {rules.map((rule) => (
          <li key={rule.key}>
            <strong>{t(`admin.regulatory.params.${rule.key}.name`)}</strong>
            <span>{rule.confirmed ? String(rule.value) : t('business.trade.ruleNotPublished')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewOperation({ business, contacts, items, incoterms, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ kind: 'import', label: '', country: '', counterpartyId: '', currency: 'EUR', incoterm: '', namedPlace: '', itemId: '', quantityOrdered: '', plannedAt: '' });
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (field) => (event) => setForm((p) => ({ ...p, [field]: event.target.value }));

  return (
    <form
      className="business-form trade-new"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = {
          kind: form.kind,
          label: form.label.trim(),
          country: form.country.trim().toUpperCase(),
          currency: form.currency.trim().toUpperCase(),
          ...(form.counterpartyId ? { counterpartyId: form.counterpartyId } : {}),
          ...(form.incoterm ? { incoterm: form.incoterm, namedPlace: form.namedPlace.trim() } : {}),
          ...(form.itemId ? { itemId: form.itemId } : {}),
          ...(form.quantityOrdered ? { quantityOrdered: Number(String(form.quantityOrdered).replace(',', '.')) } : {}),
          ...(form.plannedAt ? { plannedAt: iso(form.plannedAt) } : {}),
        };
        if (await run(() => api.post('/fin/entreprise/operations', body, { idempotencyKey: key }), 'business.trade.created')) {
          setKey(newIdempotencyKey());
          setForm((p) => ({ ...p, label: '', namedPlace: '', quantityOrdered: '' }));
        }
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.trade.kind')}
          <select id="operation-kind" value={form.kind} onChange={set('kind')}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`business.trade.kinds.${k}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('business.label')}
          <input id="operation-label" value={form.label} onChange={set('label')} maxLength={200} required />
        </label>
        <label>
          {t('business.trade.country')}
          <input id="operation-country" value={form.country} onChange={set('country')} maxLength={2} minLength={2} pattern="[A-Za-z]{2}" placeholder="FR, CN, TR…" required />
        </label>
        <label>
          {t('business.trade.currency')}
          <CurrencySelect id="operation-currency" value={form.currency} onChange={(v) => setForm((p) => ({ ...p, currency: v }))} />
        </label>
      </div>
      <div className="business-form-row">
        <label>
          {t(form.kind === 'export' ? 'business.inv.client' : 'business.inv.supplier')}
          <select value={form.counterpartyId} onChange={set('counterpartyId')}>
            <option value="">{t('business.inv.noContact')}</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('business.trade.incoterm')}
          <select id="operation-incoterm" value={form.incoterm} onChange={set('incoterm')}>
            <option value="">{t('business.trade.noIncoterm')}</option>
            {incoterms.map((row) => (
              <option key={row.code} value={row.code}>
                {row.code} — {t(`business.trade.incoterms.${row.code}`)}
              </option>
            ))}
          </select>
        </label>
        {form.incoterm && (
          <label>
            {t('business.trade.namedPlace')}
            <input id="operation-place" value={form.namedPlace} onChange={set('namedPlace')} maxLength={120} required />
          </label>
        )}
      </div>
      {form.kind !== 'export' && (
        <div className="business-form-row">
          <label>
            {t('business.pilot.item')}
            <select id="operation-item" value={form.itemId} onChange={set('itemId')}>
              <option value="">{t('business.inv.noContact')}</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('business.trade.quantity')}
            <input type="number" min="0.001" step="0.001" value={form.quantityOrdered} onChange={set('quantityOrdered')} />
          </label>
          <label>
            {t('business.trade.plannedAt')}
            <input type="date" value={form.plannedAt} onChange={set('plannedAt')} />
          </label>
        </div>
      )}
      <p className="inv-muted">{t('business.trade.currencyHint', { base: business.currency })}</p>
      <Button type="submit" variant="secondary">
        <Plus size={16} aria-hidden="true" />
        {t('business.trade.create')}
      </Button>
    </form>
  );
}

function OperationCard({ op, business, write, items, incoterms, run }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const view = op.calcul;
  const open_ = !['closed', 'cancelled'].includes(op.status);
  const money = (value, currency = business.currency) => formatAmount(i18n.language, value, currency);
  const rule = incoterms.find((row) => row.code === op.incoterm);

  return (
    <li className={`business-document trade-op trade-op-${op.status}`}>
      <div className="business-document-head">
        <span className="inv-badge">{t(`business.trade.kinds.${op.kind}`)}</span>
        <strong>{op.reference}</strong>
        <span>{op.label}</span>
        <span className="inv-muted">
          {op.country} · {op.currency}
          {op.counterparty ? ` · ${op.counterparty.name}` : ''}
        </span>
        <span className="business-document-state">{t(`business.trade.statuses.${op.status}`)}</span>
      </div>
      {op.incoterm && (
        <p className="inv-muted inv-note">
          {t('business.trade.incotermLine', { code: op.incoterm, version: op.incotermVersion, place: op.namedPlace })}
          {rule && ` — ${t(`business.trade.risk.${rule.risk}`)}`}
        </p>
      )}

      <div className="fin-figure-grid trade-figures">
        <FigureCard label={t('business.trade.landed')} answer={view.coutRendu} />
        <FigureCard label={t('business.trade.unit')} answer={view.coutUnitaire} />
        <FigureCard label={t('business.trade.margin')} answer={view.marge} />
      </div>
      {!view.droitsDeclares && view.coutRendu.resultat !== null && op.kind !== 'export' && <p className="business-document-warning">{t('business.trade.excludingDuties')}</p>}
      <p className="inv-muted inv-note">
        {t('business.trade.fileState', { accepted: view.dossier.accepted, required: view.dossier.required, ratio: formatRatio(i18n.language, view.dossier.ratio ?? 0) })}
        {view.dossier.ready ? ` ${t('business.trade.ready')}` : ''}
      </p>

      <div className="inv-actions">
        <Button type="button" variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? t('business.trade.hide') : t('business.trade.details')}
        </Button>
        {write && (
          <label className="pilot-inline">
            {t('business.trade.status')}
            <select
              value={op.status === 'received' ? 'received' : op.status}
              onChange={(e) => run(() => api.put(`/fin/entreprise/operations/${op.id}`, { status: e.target.value }, { ifMatch: op.version }), 'business.trade.updated')}
              disabled={!open_}
            >
              {op.status === 'received' && <option value="received">{t('business.trade.statuses.received')}</option>}
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`business.trade.statuses.${s}`)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {open && (
        <div className="trade-details">
          <h3 className="pilot-subtitle">{t('business.trade.costsTitle')}</h3>
          {view.lignes.length === 0 ? (
            <p className="business-empty">{t('business.trade.noCost')}</p>
          ) : (
            <div className="pilot-table-wrap">
              <table className="pilot-table">
                <thead>
                  <tr>
                    <th scope="col">{t('business.trade.costKind')}</th>
                    <th scope="col">{t('business.trade.amount')}</th>
                    <th scope="col">{t('business.trade.rate')}</th>
                    <th scope="col">{t('business.trade.converted', { currency: business.currency })}</th>
                  </tr>
                </thead>
                <tbody>
                  {view.lignes.map((line) => (
                    <tr key={line.id}>
                      <th scope="row">
                        {t(`business.trade.costKinds.${line.kind}`)}
                        {line.label ? <span className="inv-muted"> · {line.label}</span> : null}
                        {line.paidAt ? <span className="inv-muted"> · {t('business.trade.paid')}</span> : null}
                      </th>
                      <td>{money(line.amount, line.currency)}</td>
                      <td>{line.rate ? t('business.trade.rateLine', { rate: line.rate, date: formatDate(i18n.language, line.rateDate), source: line.rateSource }) : '—'}</td>
                      <td>{line.converted === null ? t('fincludia.notComputed') : money(line.converted)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {write && open_ && op.status !== 'received' && <NewCost op={op} business={business} run={run} />}

          <h3 className="pilot-subtitle">{t('business.trade.fileTitle')}</h3>
          <ul className="trade-pieces">
            {op.pieces.map((piece) => (
              <li key={piece.id} className={`trade-piece-${piece.status}`}>
                <span>{t(`business.trade.pieces.${piece.kind}`)}</span>
                {write ? (
                  <select
                    aria-label={t(`business.trade.pieces.${piece.kind}`)}
                    value={piece.status}
                    onChange={(e) => run(() => api.put(`/fin/entreprise/operations/${op.id}/pieces`, { kind: piece.kind, status: e.target.value }), 'business.trade.pieceSaved')}
                  >
                    {PIECE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`business.trade.pieceStatuses.${s}`)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="business-document-state">{t(`business.trade.pieceStatuses.${piece.status}`)}</span>
                )}
              </li>
            ))}
          </ul>

          {write && op.kind !== 'export' && ['draft', 'ordered', 'shipped'].includes(op.status) && <Reception op={op} items={items} run={run} />}
          <Scenario op={op} business={business} />
        </div>
      )}
    </li>
  );
}

function NewCost({ op, business, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ kind: 'goods', label: '', amount: '', currency: op.currency, rate: '', rateDate: today(), rateSource: '', paid: false });
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (field) => (event) => setForm((p) => ({ ...p, [field]: event.target.value }));
  const foreign = form.currency.trim().toUpperCase() !== business.currency;
  // The official rate of the Banque d'Algérie, proposed when the rate is empty.
  const proposed = useOfficialRate(form.currency, business.currency, form.rate, (official) => setForm((p) => (p.rate === '' ? { ...p, ...official } : p)));

  return (
    <form
      className="business-form trade-cost"
      onSubmit={async (event) => {
        event.preventDefault();
        const currency = form.currency.trim().toUpperCase();
        const body = {
          kind: form.kind,
          amount: toMinorUnits(form.amount, currency, { allowZero: true }),
          currency,
          ...(form.label.trim() ? { label: form.label.trim() } : {}),
          ...(foreign ? { rate: Number(String(form.rate).replace(',', '.')), rateDate: iso(form.rateDate), rateSource: form.rateSource.trim() } : {}),
          ...(form.paid ? { paidAt: new Date().toISOString() } : {}),
        };
        if (await run(() => api.post(`/fin/entreprise/operations/${op.id}/couts`, body, { idempotencyKey: key }), 'business.trade.costAdded')) {
          setKey(newIdempotencyKey());
          setForm((p) => ({ ...p, label: '', amount: '' }));
        }
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.trade.costKind')}
          <select id={`cost-kind-${op.id}`} value={form.kind} onChange={set('kind')}>
            {COST_KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`business.trade.costKinds.${k}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('business.trade.currency')}
          <CurrencySelect id={`cost-currency-${op.id}`} value={form.currency} onChange={(v) => setForm((p) => ({ ...p, currency: v }))} />
        </label>
        <AmountField id={`cost-amount-${op.id}`} label={t('business.trade.amount')} currency={form.currency.toUpperCase() || business.currency} value={form.amount} onChange={(v) => setForm((p) => ({ ...p, amount: v }))} required />
        <label>
          {t('business.trade.costLabel')}
          <input value={form.label} onChange={set('label')} maxLength={200} />
        </label>
      </div>
      {foreign && proposed && <p className="inv-muted inv-note">{t('business.trade.officialProposed')}</p>}
      {foreign && (
        <div className="business-form-row">
          <label>
            {t('business.trade.rateField', { from: form.currency.toUpperCase(), to: business.currency })}
            <input id={`cost-rate-${op.id}`} type="number" min="0.000001" step="any" value={form.rate} onChange={set('rate')} required />
          </label>
          <label>
            {t('business.trade.rateDate')}
            <input type="date" value={form.rateDate} max={today()} onChange={set('rateDate')} required />
          </label>
          <label>
            {t('business.trade.rateSource')}
            <RateSourceSelect id={`cost-source-${op.id}`} value={form.rateSource} onChange={(v) => setForm((p) => ({ ...p, rateSource: v }))} required />
          </label>
        </div>
      )}
      <label className="pilot-check">
        <input type="checkbox" checked={form.paid} onChange={(e) => setForm((p) => ({ ...p, paid: e.target.checked }))} />
        {t('business.trade.paidNow')}
      </label>
      <Button type="submit" variant="secondary">
        <Plus size={16} aria-hidden="true" />
        {t('business.trade.addCost')}
      </Button>
    </form>
  );
}

function Reception({ op, items, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ receivedAt: today(), quantityReceived: op.quantityOrdered ? String(op.quantityOrdered) : '', quantityDamaged: '', itemId: op.itemId ?? '' });
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (field) => (event) => setForm((p) => ({ ...p, [field]: event.target.value }));
  const num = (v) => Number(String(v).replace(',', '.'));

  return (
    <form
      className="business-form trade-reception"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = {
          receivedAt: iso(form.receivedAt),
          quantityReceived: num(form.quantityReceived),
          ...(form.quantityDamaged ? { quantityDamaged: num(form.quantityDamaged) } : {}),
          ...(form.itemId ? { itemId: form.itemId } : {}),
        };
        if (await run(() => api.post(`/fin/entreprise/operations/${op.id}/reception`, body, { idempotencyKey: key }), 'business.trade.receivedOk')) setKey(newIdempotencyKey());
      }}
    >
      <h3 className="pilot-subtitle">
        <PackageCheck size={16} aria-hidden="true" /> {t('business.trade.receptionTitle')}
      </h3>
      <p className="inv-muted">{t('business.trade.receptionIntro')}</p>
      <div className="business-form-row">
        <label>
          {t('business.pilot.item')}
          <select id={`reception-item-${op.id}`} value={form.itemId} onChange={set('itemId')} required>
            <option value="">{t('business.inv.noContact')}</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('business.trade.received')}
          <input id={`reception-qty-${op.id}`} type="number" min="0.001" step="0.001" value={form.quantityReceived} onChange={set('quantityReceived')} required />
        </label>
        <label>
          {t('business.trade.damaged')}
          <input type="number" min="0" step="0.001" value={form.quantityDamaged} onChange={set('quantityDamaged')} />
        </label>
        <label>
          {t('business.pilot.date')}
          <input type="date" value={form.receivedAt} onChange={set('receivedAt')} required />
        </label>
      </div>
      <Button type="submit" variant="secondary">
        <Ship size={16} aria-hidden="true" />
        {t('business.trade.receive')}
      </Button>
    </form>
  );
}

// ECR-0365: what a change of the rates would do. It creates nothing (CNV-12).
function Scenario({ op, business }) {
  const { t, i18n } = useTranslation();
  const [variation, setVariation] = useState(0.1);
  const [price, setPrice] = useState('');
  const minor = price ? toMinorUnits(price, business.currency, { allowZero: true }) : null;
  const scenario = useApi(`/fin/entreprise/operations/${op.id}/scenario?variation=${variation}${minor !== null ? `&prixVente=${minor}` : ''}`);
  const money = (value) => (value === null || value === undefined ? t('fincludia.notComputed') : formatAmount(i18n.language, value, business.currency));
  const data = scenario.data;

  return (
    <div className="trade-scenario">
      <h3 className="pilot-subtitle">{t('business.trade.scenarioTitle')}</h3>
      <div className="business-form-row">
        <label className="pilot-inline">
          {t('business.trade.variation')}
          <select id={`fx-variation-${op.id}`} value={variation} onChange={(e) => setVariation(Number(e.target.value))}>
            {VARIATIONS.map((v) => (
              <option key={v} value={v}>
                {v > 0 ? '+' : ''}
                {formatRatio(i18n.language, v)}
              </option>
            ))}
          </select>
        </label>
        <AmountField id={`fx-price-${op.id}`} label={t('business.trade.unitPrice')} currency={business.currency} value={price} onChange={setPrice} />
      </div>
      {data && (
        <table className="pilot-table">
          <thead>
            <tr>
              <th scope="col"> </th>
              <th scope="col">{t('business.trade.today')}</th>
              <th scope="col">{t('business.trade.withVariation')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{t('business.trade.landed')}</th>
              <td>{money(data.reference.total)}</td>
              <td>{money(data.scenario.total)}</td>
            </tr>
            <tr>
              <th scope="row">{t('business.trade.unit')}</th>
              <td>{money(data.reference.unitaire)}</td>
              <td>{money(data.scenario.unitaire)}</td>
            </tr>
            {minor !== null && (
              <tr>
                <th scope="row">{t('business.trade.unitMargin')}</th>
                <td>{money(data.reference.margeUnitaire)}</td>
                <td>{money(data.scenario.margeUnitaire)}</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {data && <p className="inv-muted">{t('business.trade.scenarioNote')}</p>}
    </div>
  );
}

// DEC-017, CNV-15: an indicative matrix, with its version; the contract governs.
function IncotermsMatrix({ incoterms, version }) {
  const { t } = useTranslation();
  const who = (value) => t(`business.trade.parties.${value}`);
  return (
    <section aria-labelledby="business-incoterms">
      <details className="trade-incoterms">
        <summary>
          <h2 id="business-incoterms">{t('business.trade.matrixTitle', { version })}</h2>
        </summary>
        <p className="business-blocked-intro">{t('business.trade.matrixIntro')}</p>
        <div className="pilot-table-wrap">
          <table className="pilot-table trade-matrix">
            <thead>
              <tr>
                <th scope="col">{t('business.trade.incoterm')}</th>
                <th scope="col">{t('business.trade.columns.exportClearance')}</th>
                <th scope="col">{t('business.trade.columns.mainCarriage')}</th>
                <th scope="col">{t('business.trade.columns.insurance')}</th>
                <th scope="col">{t('business.trade.columns.importClearance')}</th>
                <th scope="col">{t('business.trade.columns.risk')}</th>
              </tr>
            </thead>
            <tbody>
              {incoterms.map((row) => (
                <tr key={row.code}>
                  <th scope="row">
                    <strong>{row.code}</strong> <span className="inv-muted">{t(`business.trade.incoterms.${row.code}`)}</span>
                    {row.mode === 'sea' && <span className="inv-muted"> · {t('business.trade.seaOnly')}</span>}
                  </th>
                  <td>{who(row.exportClearance)}</td>
                  <td>{who(row.mainCarriage)}</td>
                  <td>{row.insurance === 'none' ? t('business.trade.parties.none') : who(row.insurance)}</td>
                  <td>{who(row.importClearance)}</td>
                  <td>{t(`business.trade.risk.${row.risk}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
