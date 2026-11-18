import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Archive, ArchiveRestore, Pencil, Trash2, TriangleAlert, Wallet } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import AccountsBalanceChart from './AccountsBalanceChart.jsx';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import { BalanceHistory } from './accountParts.jsx';
import '../../components/fincludia/Fincludia.css';
import './Accounts.css';
import '../accueil/Home.css';
import CounterValue from '../../components/fincludia/CounterValue.jsx';
import { askConfirm } from '../../components/ui/ConfirmDialog.jsx';

// COM-03, « Détail compte », at its own address (P8-25): `/app/comptes/:id`.
// The balance (PB-F001, the server's), the alerts in words, the balance month
// by month, and what can be done with the account: see its movements, correct
// it, archive or restore it.
// Recette R10-09 / R10-10: what came in and went out of THIS account this
// month, transfers included (for an account, a transfer moves its balance like
// any movement), the net flow written as its calculation, and the planned
// payments apart (not counted until they happen).
function FlowFigures({ flow, t }) {
  const answer = (value) => ({ resultat: value, unite: flow.account.currency, formule_id: null });
  return (
    <>
      <FigureCard label={t('accounts.monthIn')} answer={answer(flow.entrees.total)} />
      <FigureCard label={t('accounts.monthOut')} answer={answer(flow.sorties.total)} />
      <FigureCard label={t('accounts.monthFlow')} answer={answer(flow.fluxNet)} />
    </>
  );
}

function FlowExplained({ flow, t, language }) {
  const money = (value) => formatAmount(language, value, flow.account.currency);
  return (
    <div className="accounts-explain">
      {/* R16: the opening balance is the « revenu initial » of the account's first month. */}
      {flow.entrees.soldeInitial !== 0 && <p className="accounts-initial">{t('accounts.initialIncome', { amount: money(flow.entrees.soldeInitial) })}</p>}
      <p>
        {t('accounts.flowHow', {
          inTotal: money(flow.entrees.total),
          initial: money(flow.entrees.soldeInitial ?? 0),
          income: money(flow.entrees.revenus),
          transfersIn: money(flow.entrees.virementsRecus),
          outTotal: money(flow.sorties.total),
          spent: money(flow.sorties.depenses),
          transfersOut: money(flow.sorties.virementsEnvoyes),
          net: money(flow.fluxNet),
        })}
      </p>
      {flow.sortiesPrevues > 0 && <p className="fin-hint">{t('accounts.flowPlanned', { amount: money(flow.sortiesPrevues) })}</p>}
    </div>
  );
}

function LastMovements({ flow, t, language }) {
  if (flow.derniers.length === 0) return <p className="fin-hint">{t('accounts.noMovementThisMonth')}</p>;
  const sign = (kind) => (kind === 'income' || kind === 'transfer_in' ? '+' : '−');
  return (
    <ul className="accounts-last">
      {flow.derniers.map((row) => (
        <li key={row.id} className={row.planned ? 'accounts-last-planned' : undefined}>
          <span>{formatDate(language, row.occurredAt)}</span>
          <span>
            {t(`accounts.kinds.${row.kind}`)}
            {row.planned ? ` · ${t('accounts.plannedTag')}` : ''}
          </span>
          <span className="accounts-last-note">
            {row.note ?? ''}
            {/* R16: the envelope the expense is counted in, or « hors budget ». */}
            {row.rapprochement && (
              <span className={`accounts-match accounts-match-${row.rapprochement.statut}`}>
                {row.rapprochement.statut === 'envelope'
                  ? t('accounts.matchEnvelope', { budget: row.rapprochement.budget, envelope: row.rapprochement.enveloppe ?? t('budget.noCategory') })
                  : t(`accounts.match.${row.rapprochement.statut}`, { budget: row.rapprochement.budget })}
              </span>
            )}
          </span>
          <strong>
            {sign(row.kind)} {formatAmount(language, row.value, flow.account.currency)}
          </strong>
        </li>
      ))}
    </ul>
  );
}

// R16 (2026-11-17): « les budgets liés à ce compte ne s'affichent même pas ».
// The current budgets that follow this account — tied to it, or on the total
// balance it is part of — with each envelope it pays: planned, spent, rate.
function AccountBudgets({ flow, t, language, accountId }) {
  const money = (value) => formatAmount(language, value, flow.account.currency);
  return (
    <section aria-labelledby="account-budgets">
      <h2 id="account-budgets" className="accounts-section-title">
        {t('accounts.budgetsTitle')}
      </h2>
      {flow.budgets.length === 0 ? (
        <p className="fin-hint">
          {t('accounts.noBudget')} <Link to="/app/budgets/nouveau">{t('accounts.createBudget')}</Link>
        </p>
      ) : (
        flow.budgets.map((budget) => (
          <div key={budget.id} className="accounts-budget">
            <p className="accounts-budget-head">
              <Link to={`/app/budgets/${budget.id}`}>{budget.label}</Link>
              <span className="fin-hint">{budget.accountId === accountId ? t('accounts.budgetTied') : t('accounts.budgetOnTotal')}</span>
              {budget.totalPrevu.resultat !== null && (
                <span className="accounts-budget-total">
                  {money(budget.totalReel.resultat ?? 0)} / {money(budget.totalPrevu.resultat)}
                </span>
              )}
            </p>
            {budget.enveloppes.length === 0 ? (
              <p className="fin-hint">{t('accounts.noEnvelope')}</p>
            ) : (
              <ul className="home-budget-lines">
                {budget.enveloppes.map((line) => (
                  <li key={line.id}>
                    <span>{line.label ?? t('budget.noCategory')}</span>
                    <span className="home-meter" aria-hidden="true">
                      <span style={{ inlineSize: `${Math.min(100, Math.round((line.taux.resultat ?? 0) * 100))}%` }} className={line.alerte === 'exceeded' ? 'over' : ''} />
                    </span>
                    <span className="home-budget-rate">
                      {money(line.reel ?? 0)} / {money(line.prevu)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}
    </section>
  );
}

export default function AccountDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState(location.state?.message ? { kind: 'ok', text: location.state.message } : null);
  const data = useApi('/fin/comptes?includeArchived=true');
  const account = data.data?.accounts.find((row) => row.id === id);
  // Recette R10-09: in and out of this account this month, transfers included.
  const flow = useApi(`/fin/comptes/${id}/flux`);
  useDocumentMeta(account?.label ?? t('accounts.detailTitle'));

  if (data.status === 'loading' && !data.data) return <LoadingState />;
  if (data.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={data.reload} />;
  if (!account) return <ErrorState message={t('accounts.notFound')} />;
  const typeLabel = data.data.types.find((type) => type.id === account.type)?.label ?? account.type;

  async function toggleArchive() {
    setMessage(null);
    try {
      await api.put(`/fin/comptes/${id}/archive`, { archived: !account.archivedAt });
      setMessage({ kind: 'ok', text: account.archivedAt ? 'accounts.restored' : 'accounts.archived' });
      data.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: errorKey(err, { 422: 'accounts.errors.refused' }) });
    }
  }

  // Recette R10-08: delete for good, then back to the list with a message.
  async function remove() {
    if (!await askConfirm(t('accounts.deleteConfirm', { label: account.label }))) return;
    setMessage(null);
    try {
      // R17-03: the confirmation goes in the BODY (`{ body }`); passed as a bare
      // option it was never sent, and the server refused every deletion.
      await api.delete(`/fin/comptes/${id}`, { body: { confirm: true } });
      navigate('/app/comptes', { state: { message: 'accounts.deleted' } });
    } catch (err) {
      setMessage({ kind: 'error', text: errorKey(err, { 422: 'accounts.errors.refused' }) });
    }
  }

  return (
    <>
      <PageHeader back={{ to: '/app/comptes', label: t('accounts.backToList') }} icon={Wallet} title={account.label} subtitle={typeLabel} maxWidth={1040} />
      <div className="accounts-page accounts-screen" style={{ '--account-color': account.color }}>
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {t(message.text)}
          </p>
        )}

        <div className="fin-figure-grid">
          <FigureCard label={account.liability ? t('accounts.owed') : t('accounts.balance')} answer={account.solde} />
          {flow.data && <FlowFigures flow={flow.data} t={t} />}
        </div>
        {flow.data && <FlowExplained flow={flow.data} t={t} language={i18n.language} />}
        {account.currency !== 'DZD' && account.solde.resultat !== null && <CounterValue value={account.contreValeur} />}
        <p className="accounts-meta">
          {!account.includeInTotal && t('accounts.notInTotal')}
          {account.archivedAt && ` ${t('accounts.archivedTag')}`}
        </p>

        {/* AL-P02 / AL-P03: an icon AND a sentence, never the colour alone. */}
        {account.alertes.length > 0 && (
          <ul className="accounts-alerts">
            {account.alertes.map((alert) => (
              <li key={alert}>
                <TriangleAlert size={14} aria-hidden="true" /> {t(`accounts.alerts.${alert}`)}
              </li>
            ))}
          </ul>
        )}

        {!account.liability && <AccountsBalanceChart accounts={[account]} days={30} />}

        {/* R16: the budgets this account pays, with their envelopes. */}
        {flow.data && <AccountBudgets flow={flow.data} t={t} language={i18n.language} accountId={account.id} />}

        <h2 className="accounts-section-title">{t('accounts.lastMovements')}</h2>
        {flow.data && <LastMovements flow={flow.data} t={t} language={i18n.language} />}

        <div className="accounts-card-actions">
          <Link to={`/app/mouvements?compte=${account.id}`}>{t('accounts.history')}</Link>
          <Link to={`/app/comptes/${account.id}/modifier`}>
            <Pencil size={14} aria-hidden="true" /> {t('accounts.edit')}
          </Link>
          <button type="button" className="accounts-link-button" onClick={toggleArchive}>
            {account.archivedAt ? <ArchiveRestore size={14} aria-hidden="true" /> : <Archive size={14} aria-hidden="true" />}{' '}
            {t(account.archivedAt ? 'accounts.restore' : 'accounts.archive')}
          </button>
          <button type="button" className="accounts-link-button accounts-danger" onClick={remove}>
            <Trash2 size={14} aria-hidden="true" /> {t('accounts.delete')}
          </button>
        </div>

        <h2 className="accounts-section-title">{t('accounts.balanceCurve')}</h2>
        <BalanceHistory account={account} />
        {account.note && <p className="fin-hint">{account.note}</p>}
      </div>
    </>
  );
}
