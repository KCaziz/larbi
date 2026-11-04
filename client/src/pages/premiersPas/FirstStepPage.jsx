import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import '../../components/fincludia/Fincludia.css';
import './FirstSteps.css';
import { IncomeStep, ProfileStep } from './FirstStepsPage.jsx';

// ONB-01 « Profil éducatif » (`/app/parametres/premiers-pas/profil`) and ONB-02
// « Premier revenu » (`/app/parametres/premiers-pas/premier-revenu`), each at its
// own address (P8-24). The forms are those of « Premiers pas » — one form per
// thing — and a saved step goes back to the list, which says so.
export default function FirstStepPage({ screen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const state = useApi('/fin/premiers-pas');
  const [message, setMessage] = useState(null);
  const key = screen === 'profil' ? 'P0' : 'P1';
  useDocumentMeta(t(`firstSteps.steps.${key}.title`), t(`firstSteps.steps.${key}.hint`));

  if (state.status === 'loading' && !state.data) return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={state.reload} />;
  const step = state.data.steps.find((row) => row.key === key);

  async function run(action) {
    setMessage(null);
    try {
      await action();
      navigate('/app/parametres/premiers-pas', { state: { message: t('firstSteps.stepSaved') } });
      return true;
    } catch (err) {
      setMessage(t(errorKey(err, { 422: 'firstSteps.errors.refused', 403: 'account.fin.consentRequired' })));
      return false;
    }
  }

  return (
    <>
      <PageHeader back={{ to: '/app/parametres/premiers-pas', label: t('firstSteps.backToSteps') }} icon={Rocket} title={t(`firstSteps.steps.${key}.title`)} subtitle={t(`firstSteps.steps.${key}.hint`)} maxWidth={760} />
      <div className="fin-page-narrow">
        {message && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}
        {key === 'P0' ? <ProfileStep done={step.done} run={run} /> : step.done ? <p className="steps-value">{t('firstSteps.done')}</p> : <IncomeStep currency={state.data.currency} run={run} />}
      </div>
    </>
  );
}
