import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { CreateDebtForm, LoanForm } from './DebtsPage.jsx';
import '../../components/fincludia/Fincludia.css';
import './Debts.css';

// Three screens of the client at their own addresses (P8-25):
// - DET-02 « J'ai prêté »          `/app/dettes/pret`
// - DET-03 « On m'a prêté »        `/app/dettes/emprunt`
// - DET-04 « Dette bancaire / carte » `/app/dettes/nouvelle`
// Saved, each goes back to « Mes dettes », which says so. The server keeps
// these routes to adults (`requireAdult`); the menu does not offer them to a
// declared minor.
const SCREENS = {
  pret: { title: 'debts.loans.lent', direction: 'lent' },
  emprunt: { title: 'debts.loans.borrowed', direction: 'borrowed' },
  nouvelle: { title: 'debts.createTitle', direction: null },
};

export default function DebtFormPage({ screen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const { title, direction } = SCREENS[screen];
  const accounts = useApi(direction ? '/fin/comptes' : null);
  useDocumentMeta(t(title));

  const back = (key) => navigate('/app/dettes', { state: { message: key } });

  async function run(action, key) {
    setError(null);
    try {
      await action();
      back(key);
      return { ok: true };
    } catch (err) {
      setError(t(errorKey(err, { 422: 'debts.errors.refused' })));
      return { ok: false };
    }
  }

  if (direction && accounts.status === 'loading' && !accounts.data) return <LoadingState />;

  return (
    <>
      <PageHeader icon={Landmark} title={t(title)} subtitle={t('debts.intro')} maxWidth={720} />
      <div className="debts-page">
        <BackLink to="/app/dettes">{t('debts.backToList')}</BackLink>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {direction ? (
          <LoanForm direction={direction} accounts={accounts.data?.accounts ?? []} run={run} />
        ) : (
          <CreateDebtForm defaultCurrency={user?.finCurrency ?? 'DZD'} onDone={() => back('debts.created')} onCancel={() => navigate('/app/dettes')} />
        )}
      </div>
    </>
  );
}
