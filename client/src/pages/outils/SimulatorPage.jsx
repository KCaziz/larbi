import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calculator } from 'lucide-react';
import { ApiError } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import SimulatorRunner from '../../components/outils/SimulatorRunner.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import NotFoundPage from '../NotFoundPage.jsx';
import Section from '../../components/ui/Section.jsx';

// One simulator on its own page (P4-10). The form, the results and the
// "Pourquoi ?" live in SimulatorRunner, which the workshop (P4-16) uses too.
export default function SimulatorPage() {
  const { key } = useParams();
  const { t } = useTranslation();
  const detail = useApi(`/tools/simulations/${key}`);
  const simulator = detail.data?.simulator ?? null;

  useDocumentMeta(simulator ? t(`simulators.list.${simulator.key}.title`) : t('simulators.title'));

  if (detail.status === 'loading') return <LoadingState />;
  if (detail.status === 'error') {
    if (detail.error instanceof ApiError && detail.error.status === 404) return <NotFoundPage />;
    return <ErrorState message={t('state.loadError')} onRetry={detail.reload} />;
  }

  return (
    <>
      <PageHeader
        icon={Calculator}
        title={t(`simulators.list.${simulator.key}.title`)}
        subtitle={t(`simulators.list.${simulator.key}.body`)}
      />
      <Section>
        {/* A scenario can be kept from here too: the workshop is the catalogue,
            not the only place a simulation deserves to be saved. */}
        <SimulatorRunner simulator={simulator} onSaved={() => {}} />
      </Section>
    </>
  );
}
