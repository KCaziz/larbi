import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, ArchiveRestore, Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import IncomeDeclarationForm from '../../components/fincludia/IncomeDeclarationForm.jsx';
import BarList from '../../components/fincludia/charts/BarList.jsx';
import '../../components/fincludia/Fincludia.css';
import '../comptes/Accounts.css';
import { askConfirm } from '../../components/ui/ConfirmDialog.jsx';

// « Revenus prévus » (P8-24): the incomes the person declared, the base of the
// budget's « reste à allouer » (PB-F009). They were only created by « Premiers
// pas » and by the payslip, and nothing listed, corrected or archived them.
// A declared income is what is EXPECTED: it never changes a balance (only a
// confirmed occurrence does, from the calendar).

export default function IncomesPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const currency = user?.finCurrency ?? 'DZD';
  useDocumentMeta(t('incomes.title'), t('incomes.intro'));
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState(null); // an income, or 'new'
  const [message, setMessage] = useState(null);
  const list = useApi(`/fin/revenus${showArchived ? '?includeArchived=true' : ''}`);
  // Recette R10-05: the account each income comes in on.
  const accounts = useApi('/fin/comptes');
  const ownAccounts = (accounts.data?.accounts ?? []).filter((account) => !account.archivedAt && !account.liability);
  // R11-13: the same declaration as « Premiers pas », category included.
  const categories = useApi('/fin/categories');
  const incomeCategories = ((categories.data?.groups ?? []).find((group) => group.code === 'income')?.categories ?? []).map((category) => ({ id: category.id, label: category.label }));
  // Recette R18: the same picker as for a movement (search, then category → sub-category).
  const incomeGroups = (categories.data?.groups ?? []).filter((group) => group.code === 'income');

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      setEditing(null);
      list.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'incomes.errors.refused' })) });
    }
  }

  if (list.status === 'loading' && !list.data) return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;
  const incomes = list.data.incomes;

  return (
    <>
      <PageHeader back={{ to: '/app/budgets', label: t('budget.backToList') }} icon={Wallet} title={t('incomes.title')} subtitle={t('incomes.intro')} maxWidth={760} />
      <div className="fin-page-narrow">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}
        <Notice variant="info">{t('incomes.expectedNote')}</Notice>

        <div className="accounts-actions">
          <Button onClick={() => setEditing(editing === 'new' ? null : 'new')} aria-expanded={editing === 'new'}>
            <Plus size={16} aria-hidden="true" /> {t('incomes.add')}
          </Button>
          <label className="accounts-toggle">
            <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} />
            {t('accounts.showArchived')}
          </label>
        </div>

        {editing === 'new' && <IncomeDeclarationForm currency={currency} accounts={ownAccounts} categories={incomeCategories} categoryGroups={incomeGroups} newAccountLink="/app/comptes/nouveau?retour=/app/budgets/revenus" onSubmit={(body) => run(() => api.post('/fin/revenus', body), 'incomes.added')} />}

        {/* The expected income per month by source, one scale for all (F001). */}
        {incomes.filter((income) => !income.archivedAt && income.currency === currency && income.monthlyValue !== null).length >= 2 && (
          <BarList
            caption={t('incomes.sourcesChart')}
            rows={incomes
              .filter((income) => !income.archivedAt && income.currency === currency && income.monthlyValue !== null)
              .map((income) => ({ key: income.id, label: income.label, value: income.monthlyValue }))}
            format={(value) => formatAmount(i18n.language, value, currency)}
          />
        )}
        {incomes.length === 0 ? (
          <p className="fin-hint">{t('incomes.none')}</p>
        ) : (
          <ul className="fin-health-dimensions">
            {incomes.map((income) => (
              <li key={income.id}>
                <span>
                  <strong>{income.label}</strong>
                  <span className="fin-hint">
                    {' '}
                    — {t(`calendar.frequencies.${income.frequency}`, income.frequency)}
                    {income.archivedAt && ` · ${t('accounts.archivedTag')}`}
                  </span>
                  {/* Recette R10-05: where and when it comes in, or that it is not linked yet. */}
                  <span className="fin-hint incomes-versement">
                    {income.versement
                      ? t('incomes.comesIn', {
                          account: ownAccounts.find((account) => account.id === income.versement.accountId)?.label ?? t('movements.defaultAccount'),
                          date: formatDate(i18n.language, income.versement.nextDate),
                        })
                      : t('incomes.notLinked')}
                    {/* R11-13: and what happens on each payment. */}
                    {income.versement && ` · ${t(income.versement.creationMode === 'auto_real' ? 'incomeForm.listAuto' : 'incomeForm.listConfirm')}`}
                  </span>
                </span>
                <span>
                  <strong>{formatAmount(i18n.language, income.value, income.currency)}</strong>{' '}
                  <button type="button" className="accounts-link-button" onClick={() => setEditing(editing?.id === income.id ? null : income)} aria-expanded={editing?.id === income.id}>
                    <Pencil size={14} aria-hidden="true" /> {t('accounts.edit')}
                  </button>{' '}
                  <button
                    type="button"
                    className="accounts-link-button"
                    onClick={() => run(() => api.put(`/fin/revenus/${income.id}/archive`, { archived: !income.archivedAt }), income.archivedAt ? 'accounts.restored' : 'accounts.archived')}
                  >
                    {income.archivedAt ? <ArchiveRestore size={14} aria-hidden="true" /> : <Archive size={14} aria-hidden="true" />} {t(income.archivedAt ? 'accounts.restore' : 'accounts.archive')}
                  </button>{' '}
                  <button
                    type="button"
                    className="accounts-link-button accounts-danger"
                    onClick={async () => {
                      if (await askConfirm(t('incomes.deleteConfirm', { label: income.label }))) run(() => api.delete(`/fin/revenus/${income.id}`, {}), 'incomes.deleted');
                    }}
                  >
                    <Trash2 size={14} aria-hidden="true" /> {t('accounts.delete')}
                  </button>
                </span>
                {editing?.id === income.id && (
                  <IncomeDeclarationForm key={income.id} currency={income.currency} income={income} accounts={ownAccounts} categories={incomeCategories} categoryGroups={incomeGroups} onSubmit={({ received, ...body }) => run(() => api.patch(`/fin/revenus/${income.id}`, body), 'incomes.saved')} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
