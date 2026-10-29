import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { CreateGoalForm } from './GoalsPage.jsx';
import '../../components/fincludia/Fincludia.css';
import './Goals.css';

// OBJ-02 « Créer objectif », at its own address (P8-25):
// `/app/objectifs/nouveau`. The new goal opens on its own screen.
export default function GoalFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const references = useApi('/fin/goals/references');
  useDocumentMeta(t('goals.createTitle'));

  if (references.status === 'loading' && !references.data) return <LoadingState />;
  const templates = references.data?.catalogue ?? references.data?.templates ?? [];

  return (
    <>
      <PageHeader icon={Plus} title={t('goals.createTitle')} subtitle={t('goals.intro')} maxWidth={1040} />
      <div className="goals-page">
        <BackLink to="/app/objectifs">{t('goals.backToList')}</BackLink>
        <CreateGoalForm
          templates={templates}
          defaultCurrency={user?.finCurrency ?? 'DZD'}
          onDone={(goal) => navigate(`/app/objectifs/${goal.id}`, { state: { message: 'goals.created' } })}
          onCancel={() => navigate('/app/objectifs')}
        />
      </div>
    </>
  );
}
