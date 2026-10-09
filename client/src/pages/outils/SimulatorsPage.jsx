import { useTranslation } from 'react-i18next';
import { Calculator } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import './Simulators.css';

// Catalogue of the FINCLUDIA simulators (P4-10). The list comes from the server,
// which is the single place that knows which calculators exist: adding one is a
// line in the server registry, nothing here.
export default function SimulatorsPage() {
  const { t } = useTranslation();
  const list = useApi('/tools/simulations');

  useDocumentMeta(t('simulators.title'), t('simulators.intro'));

  if (list.status === 'loading') return <LoadingState />;
  if (list.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={list.reload} />;

  return (
    <>
      <PageHeader icon={Calculator} title={t('simulators.title')} subtitle={t('simulators.intro')} />

      <Section>
        <div className="narrow">
          <Notice variant="info">{t('simulators.disclaimer')}</Notice>
        </div>

        <div className="feature-grid feature-grid-2 mt-lg">
          {list.data.simulators.map((simulator) => (
            <article className="feature-card tone-blue" key={simulator.key}>
              <h3>{t(`simulators.list.${simulator.key}.title`)}</h3>
              <p>{t(`simulators.list.${simulator.key}.body`)}</p>
              <p className="simulator-formulas">
                {t('simulators.formulaCount', { count: simulator.formulas.length })}
              </p>
              <Button to={`/outils/simulateurs/${simulator.key}`} variant="ghost" arrow>
                {t('simulators.open')}
              </Button>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
