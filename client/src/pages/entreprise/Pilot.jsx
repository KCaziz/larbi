import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Boxes, CalendarRange, Gauge, LayoutDashboard, Plus, Wallet } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { newIdempotencyKey } from '../../lib/organisation.js';
import Button from '../../components/ui/Button.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';

// P13-05, lot C (2026-11-23): steering the organisation — the home of its
// public (01_PUBLICS « accueil spécialisé »), stock by lot (CNV-16), budgets,
// the 13-week cash plan. Every figure is the server's; this page only lays
// them out.

const today = () => new Date().toISOString().slice(0, 10);
const iso = (date) => new Date(`${date}T00:00:00.000Z`).toISOString();
export const EXPENSE_CATEGORIES = ['marchandises', 'matieres', 'sous_traitance', 'loyer', 'salaires', 'charges_sociales', 'energie', 'telecom', 'transport', 'honoraires', 'assurance', 'entretien', 'marketing', 'banque', 'impots_taxes', 'equipement', 'autre'];

// What each public sees first (01_PUBLICS, « KPI prioritaires »), among the
// figures that exist so far.
const HOME_FIGURES = {
  'PUB-01': ['caFacture', 'encaissements', 'creances', 'marge', 'tresorerieDisponible'],
  'PUB-02': ['caFacture', 'encaissements', 'creances', 'echu', 'tresorerieDisponible'],
  'PUB-03': ['budget', 'tresorerieDisponible', 'autonomie', 'decaissements'],
  'PUB-04': ['tresorerieDisponible', 'autonomie', 'caFacture', 'budget'],
  'PUB-05': ['tresorerieDisponible', 'encaissements', 'stock', 'creances', 'marge', 'seuil'],
  'PUB-06': ['caFacture', 'marge', 'bfr', 'delaiClients', 'delaiFournisseurs', 'tresorerieDisponible'],
  'PUB-07': ['stock', 'marge', 'bfr', 'seuil', 'delaiFournisseurs', 'tresorerieDisponible'],
};
const DEFAULT_HOME = ['caFacture', 'encaissements', 'creances', 'tresorerieDisponible'];
const figureOf = (dashboard, key) => dashboard?.[key] ?? dashboard?.pilotage?.[key] ?? null;

/** The home of the organisation's public. */
export function SpecialisedHome({ publicKey, dashboard }) {
  const { t } = useTranslation();
  const keys = HOME_FIGURES[publicKey] ?? DEFAULT_HOME;
  return (
    <section aria-labelledby="business-home">
      <h2 id="business-home">
        <LayoutDashboard size={18} aria-hidden="true" /> {publicKey ? t(`business.pilot.homes.${publicKey}`) : t('business.pilot.homeDefault')}
      </h2>
      <div className="fin-figure-grid">
        {keys.map((key) => (
          <FigureCard key={key} label={t(`business.pilot.figures.${key}`)} answer={figureOf(dashboard, key)} />
        ))}
      </div>
    </section>
  );
}

/** The steering figures and where the expenses go. */
export function SteeringSection({ dashboard, currency }) {
  const { t, i18n } = useTranslation();
  const pilot = dashboard?.pilotage;
  if (!pilot) return null;
  return (
    <section aria-labelledby="business-steering">
      <h2 id="business-steering">
        <Gauge size={18} aria-hidden="true" /> {t('business.pilot.steeringTitle')}
      </h2>
      <div className="fin-figure-grid">
        {['bfr', 'delaiClients', 'delaiFournisseurs', 'seuil', 'concentration', 'stock'].map((key) => (
          <FigureCard key={key} label={t(`business.pilot.figures.${key}`)} answer={pilot[key]} />
        ))}
      </div>
      {pilot.chargesParFamille.length > 0 && (
        <>
          <h3 className="pilot-subtitle">{t('business.pilot.chargesTitle')}</h3>
          <ul className="business-late">
            {pilot.chargesParFamille.map((row) => (
              <li key={row.category}>
                <span className="business-late-label">{t(`business.pilot.categories.${row.category}`)}</span>
                <span className="business-late-amount">{formatAmount(i18n.language, row.amount, currency)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

// ---- budget of the month ------------------------------------------------------

export function BudgetSection({ currency, canWrite, run }) {
  const { t, i18n } = useTranslation();
  const [month, setMonth] = useState(today().slice(0, 7));
  const board = useApi(`/fin/entreprise/tableau-de-bord?to=${encodeURIComponent(new Date(`${month}-28T00:00:00.000Z`).toISOString())}`);
  const [form, setForm] = useState({ category: 'loyer', amount: '' });
  const rows = board.data?.pilotage?.budgetMois?.lignes ?? [];
  const money = (value) => formatAmount(i18n.language, value, currency);

  return (
    <section aria-labelledby="business-budget">
      <h2 id="business-budget">
        <CalendarRange size={18} aria-hidden="true" /> {t('business.pilot.budgetTitle')}
      </h2>
      <label className="pilot-inline">
        {t('business.pilot.month')}
        <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
      </label>
      {board.status === 'loading' && !board.data ? (
        <LoadingState />
      ) : rows.length > 0 ? (
        <table className="pilot-table">
          <thead>
            <tr>
              <th scope="col">{t('business.pilot.family')}</th>
              <th scope="col">{t('business.pilot.budget')}</th>
              <th scope="col">{t('business.pilot.real')}</th>
              <th scope="col">{t('business.pilot.gap')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.category} className={row.gap > 0 ? 'is-over' : ''}>
                <th scope="row">{t(`business.pilot.categories.${row.category}`)}</th>
                <td>{money(row.budget)}</td>
                <td>{money(row.real)}</td>
                <td>
                  {row.gap > 0 ? '+' : ''}
                  {money(row.gap)}
                  {row.gap > 0 && <span className="pilot-flag"> {t('business.pilot.over')}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="business-empty">{t('business.pilot.noBudget')}</p>
      )}
      {canWrite && (
        <form
          className="business-form business-payment"
          onSubmit={async (event) => {
            event.preventDefault();
            const amount = toMinorUnits(form.amount, currency, { allowZero: true });
            if (await run(() => api.put('/fin/entreprise/budgets', { category: form.category, month, amount }), 'business.pilot.budgetSaved')) {
              setForm((p) => ({ ...p, amount: '' }));
              board.reload();
            }
          }}
        >
          <label>
            {t('business.pilot.family')}
            <select id="budget-category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`business.pilot.categories.${c}`)}
                </option>
              ))}
            </select>
          </label>
          <AmountField id="budget-amount" label={t('business.pilot.budgetAmount')} currency={currency} value={form.amount} onChange={(v) => setForm((p) => ({ ...p, amount: v }))} required />
          <Button type="submit" variant="secondary">
            <Plus size={16} aria-hidden="true" />
            {t('business.pilot.setBudget')}
          </Button>
        </form>
      )}
    </section>
  );
}

// ---- 13-week cash plan ----------------------------------------------------------

export function CashPlanSection({ currency, canWrite, run }) {
  const { t, i18n } = useTranslation();
  const [delay, setDelay] = useState(0);
  const plan = useApi(`/fin/entreprise/tresorerie?retardClients=${delay}`);
  const [balance, setBalance] = useState({ amount: '', observedAt: today(), negative: false });
  const [key, setKey] = useState(newIdempotencyKey);
  const money = (value) => formatAmount(i18n.language, value, currency);
  const data = plan.data;

  return (
    <section aria-labelledby="business-cashplan">
      <h2 id="business-cashplan">
        <Wallet size={18} aria-hidden="true" /> {t('business.pilot.planTitle')}
      </h2>
      <p className="business-blocked-intro">{t('business.pilot.planIntro')}</p>

      {canWrite && (
        <form
          className="business-form business-payment"
          onSubmit={async (event) => {
            event.preventDefault();
            const minor = toMinorUnits(balance.amount, currency, { allowZero: true });
            const body = { observedAt: iso(balance.observedAt), amount: balance.negative ? -minor : minor };
            if (await run(() => api.post('/fin/entreprise/tresorerie/soldes', body, { idempotencyKey: key }), 'business.pilot.balanceSaved')) {
              setKey(newIdempotencyKey());
              setBalance((p) => ({ ...p, amount: '' }));
              plan.reload();
            }
          }}
        >
          <AmountField id="cash-balance" label={t('business.pilot.balance')} currency={currency} value={balance.amount} onChange={(v) => setBalance((p) => ({ ...p, amount: v }))} required />
          <label className="pilot-check">
            <input type="checkbox" checked={balance.negative} onChange={(e) => setBalance((p) => ({ ...p, negative: e.target.checked }))} />
            {t('business.pilot.overdraft')}
          </label>
          <label>
            {t('business.pilot.observedAt')}
            <input type="date" value={balance.observedAt} max={today()} onChange={(e) => setBalance((p) => ({ ...p, observedAt: e.target.value }))} required />
          </label>
          <Button type="submit" variant="secondary">
            {t('business.pilot.saveBalance')}
          </Button>
        </form>
      )}

      {plan.status === 'loading' && !data ? (
        <LoadingState />
      ) : !data?.depart ? (
        <p className="business-empty">{t('business.pilot.noBalance')}</p>
      ) : (
        <>
          <div className="pilot-plan-head">
            <p>
              {t('business.pilot.startsFrom', { amount: money(data.depart.montant), date: formatDate(i18n.language, data.depart.constateLe) })}
            </p>
            <label className="pilot-inline">
              {t('business.pilot.scenario')}
              <select id="cash-scenario" value={delay} onChange={(e) => setDelay(Number(e.target.value))}>
                {[0, 15, 30, 60].map((d) => (
                  <option key={d} value={d}>
                    {d === 0 ? t('business.pilot.scenarioNone') : t('business.pilot.scenarioDelay', { n: d })}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="fin-figure-grid">
            <FigureCard label={t('business.pilot.figures.besoin')} answer={data.besoin} />
          </div>
          <p className={data.premiereTension ? 'business-document-warning pilot-verdict' : 'pilot-verdict'}>
            {data.premiereTension ? t('business.pilot.tensionAt', { week: data.premiereTension, amount: money(data.plusBas) }) : t('business.pilot.noTension', { amount: money(data.plusBas) })}
          </p>
          <div className="pilot-table-wrap">
            <table className="pilot-table pilot-plan">
              <thead>
                <tr>
                  <th scope="col">{t('business.pilot.week')}</th>
                  <th scope="col">{t('business.pilot.in')}</th>
                  <th scope="col">{t('business.pilot.out')}</th>
                  <th scope="col">{t('business.pilot.closing')}</th>
                </tr>
              </thead>
              <tbody>
                {data.semaines.map((week) => (
                  <tr key={week.semaine} className={week.tension ? 'is-over' : ''}>
                    <th scope="row">
                      {t('business.pilot.weekLabel', { n: week.semaine })} <span className="inv-muted">{formatDate(i18n.language, week.debut)}</span>
                    </th>
                    <td>{money(week.encaissements)}</td>
                    <td>{money(week.decaissements)}</td>
                    <td>
                      {money(week.solde)}
                      {week.tension && <span className="pilot-flag"> {t('business.pilot.tension')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(data.enRetard.encaissements > 0 || data.sansEcheance.encaissements > 0 || data.sansEcheance.decaissements > 0) && (
            <ul className="pilot-notes">
              {data.enRetard.encaissements > 0 && <li>{t('business.pilot.lateIncluded', { amount: money(data.enRetard.encaissements) })}</li>}
              {data.sansEcheance.encaissements > 0 && <li>{t('business.pilot.noDueIn', { amount: money(data.sansEcheance.encaissements) })}</li>}
              {data.sansEcheance.decaissements > 0 && <li>{t('business.pilot.noDueOut', { amount: money(data.sansEcheance.decaissements) })}</li>}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

// ---- stock by lot (CNV-16) --------------------------------------------------------

export function StockSection({ currency, canWrite, showValues, run }) {
  const { t, i18n } = useTranslation();
  const stock = useApi('/fin/entreprise/stock');
  const items = stock.data?.articles ?? [];
  const [item, setItem] = useState({ name: '', unit: '' });
  const [move, setMove] = useState({ itemId: '', kind: 'in', quantity: '', totalCost: '', lotRef: '', lotId: '', movedAt: today() });
  const [keys, setKeys] = useState({ item: newIdempotencyKey(), move: newIdempotencyKey() });
  const money = (value) => (value === null || value === undefined ? t('fincludia.notComputed') : formatAmount(i18n.language, value, currency));
  const chosen = items.find((i) => i.id === move.itemId);
  const openLots = (chosen?.lots ?? []).filter((lot) => lot.remaining > 0);
  const after = async (action, okKey, which) => {
    if (await run(action, okKey)) {
      setKeys((k) => ({ ...k, [which]: newIdempotencyKey() }));
      stock.reload();
      return true;
    }
    return false;
  };

  return (
    <section aria-labelledby="business-stock">
      <h2 id="business-stock">
        <Boxes size={18} aria-hidden="true" /> {t('business.pilot.stockTitle')}
      </h2>
      <p className="business-blocked-intro">{t('business.pilot.stockIntro')}</p>
      {stock.status === 'loading' && !stock.data ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <p className="business-empty">{t('business.pilot.noItems')}</p>
      ) : (
        <ul className="business-documents">
          {items.map((row) => (
            <li key={row.id} className="business-document pilot-item">
              <div className="business-document-head">
                <strong>{row.name}</strong>
                <span className="inv-muted">{t('business.pilot.quantityOf', { n: row.quantite, unit: row.unit })}</span>
                {showValues && <span className="business-document-state">{money(row.valeur)}</span>}
              </div>
              {row.lots.length > 0 && (
                <ul className="inv-line-list">
                  {row.lots.map((lot) => (
                    <li key={lot.id}>
                      <span>
                        {lot.lotRef || t('business.pilot.lot')} · {formatDate(i18n.language, lot.movedAt)}
                      </span>
                      <span className="inv-muted">
                        {t('business.pilot.lotState', { received: lot.received, losses: lot.losses, outs: lot.outs, remaining: lot.remaining })}
                      </span>
                      <span>{showValues ? `${money(lot.unitCost)} / ${row.unit}` : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {canWrite && (
        <>
          <form
            className="business-form business-payment"
            onSubmit={async (event) => {
              event.preventDefault();
              if (await after(() => api.post('/fin/entreprise/stock/articles', { name: item.name.trim(), unit: item.unit.trim() }, { idempotencyKey: keys.item }), 'business.pilot.itemCreated', 'item')) setItem({ name: '', unit: '' });
            }}
          >
            <label>
              {t('business.pilot.itemName')}
              <input id="item-name" value={item.name} onChange={(e) => setItem((p) => ({ ...p, name: e.target.value }))} maxLength={160} required />
            </label>
            <label>
              {t('business.pilot.unit')}
              <input id="item-unit" value={item.unit} onChange={(e) => setItem((p) => ({ ...p, unit: e.target.value }))} maxLength={20} placeholder={t('business.pilot.unitHint')} required />
            </label>
            <Button type="submit" variant="secondary">
              <Plus size={16} aria-hidden="true" />
              {t('business.pilot.addItem')}
            </Button>
          </form>

          {items.length > 0 && (
            <form
              className="business-form pilot-move"
              onSubmit={async (event) => {
                event.preventDefault();
                const body = {
                  itemId: move.itemId,
                  kind: move.kind,
                  quantity: Number(String(move.quantity).replace(',', '.')),
                  movedAt: iso(move.movedAt),
                  ...(move.kind === 'in'
                    ? { totalCost: toMinorUnits(move.totalCost, currency, { allowZero: true }), ...(move.lotRef.trim() ? { lotRef: move.lotRef.trim() } : {}) }
                    : { lotId: move.lotId }),
                };
                if (await after(() => api.post('/fin/entreprise/stock/mouvements', body, { idempotencyKey: keys.move }), 'business.pilot.moveSaved', 'move')) {
                  setMove((p) => ({ ...p, quantity: '', totalCost: '', lotRef: '', lotId: '' }));
                }
              }}
            >
              <div className="business-form-row">
                <label>
                  {t('business.pilot.item')}
                  <select id="move-item" value={move.itemId} onChange={(e) => setMove((p) => ({ ...p, itemId: e.target.value, lotId: '' }))} required>
                    <option value="">{t('business.inv.noContact')}</option>
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('business.pilot.moveKind')}
                  <select id="move-kind" value={move.kind} onChange={(e) => setMove((p) => ({ ...p, kind: e.target.value }))}>
                    {['in', 'out', 'loss'].map((k) => (
                      <option key={k} value={k}>
                        {t(`business.pilot.moveKinds.${k}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('business.inv.quantity')}
                  <input id="move-quantity" type="number" min="0.001" step="0.001" value={move.quantity} onChange={(e) => setMove((p) => ({ ...p, quantity: e.target.value }))} required />
                </label>
                <label>
                  {t('business.pilot.date')}
                  <input type="date" value={move.movedAt} onChange={(e) => setMove((p) => ({ ...p, movedAt: e.target.value }))} required />
                </label>
              </div>
              <div className="business-form-row">
                {move.kind === 'in' ? (
                  <>
                    <AmountField id="move-cost" label={t('business.pilot.lotCost')} currency={currency} value={move.totalCost} onChange={(v) => setMove((p) => ({ ...p, totalCost: v }))} hint={t('business.pilot.lotCostHint')} required />
                    <label>
                      {t('business.pilot.lotRef')}
                      <input value={move.lotRef} onChange={(e) => setMove((p) => ({ ...p, lotRef: e.target.value }))} maxLength={60} />
                    </label>
                  </>
                ) : (
                  <label>
                    {t('business.pilot.fromLot')}
                    <select id="move-lot" value={move.lotId} onChange={(e) => setMove((p) => ({ ...p, lotId: e.target.value }))} required>
                      <option value="">{t('business.inv.noContact')}</option>
                      {openLots.map((lot) => (
                        <option key={lot.id} value={lot.id}>
                          {(lot.lotRef || t('business.pilot.lot')) + ' · ' + formatDate(i18n.language, lot.movedAt) + ' · ' + t('business.pilot.left', { n: lot.remaining })}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <Button type="submit" variant="secondary">
                <Plus size={16} aria-hidden="true" />
                {t('business.pilot.saveMove')}
              </Button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
