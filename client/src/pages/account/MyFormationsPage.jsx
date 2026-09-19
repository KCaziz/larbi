import { GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import EmptyState from '../../components/cms/EmptyState.jsx';
import FormationCard from '../../components/learn/FormationCard.jsx';
import '../learn/Learn.css';
import '../Pages.css';

export default function MyFormationsPage() {
  const { t } = useTranslation();
  const { status, data, reload } = useApi('/learn/enrollments');

  return (
    <div>
      <h2 className="account-heading">{t('learn.mine.title')}</h2>
      <p>{t('learn.mine.intro')}</p>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState message={t('learn.mine.loadError')} onRetry={reload} />}
      {status === 'ready' && data.formations.length === 0 && (
        <EmptyState icon={GraduationCap} title={t('learn.mine.empty')}>
          <Button to="/catalogue" arrow>
            {t('learn.mine.browse')}
          </Button>
        </EmptyState>
      )}
      {status === 'ready' && data.formations.length > 0 && (
        <div className="learn-grid">
          {data.formations.map((item) => (
            <FormationCard key={item.slug} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
