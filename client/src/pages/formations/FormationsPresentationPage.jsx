import { useTranslation } from 'react-i18next';
import { BookOpenText } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import '../Pages.css';


export default function FormationsPresentationPage() {
  const { t } = useTranslation();
  const flow = t('formationsPresentation.flow.items', { returnObjects: true });

  return (
    <>
      <PageHeader
        icon={BookOpenText}
        title={t('formationsPresentation.title')}
        subtitle={t('formationsPresentation.subtitle')}
      />

      <Section>
        <div className="narrow center">
          <p className="lead">{t('formationsPresentation.body')}</p>
          <p>{t('formationsPresentation.accessNote')}</p>
          <Button to="/catalogue" className="btn-lg" arrow>
            {t('formationsPresentation.cta')}
          </Button>
        </div>
      </Section>

      <Section alt title={t('formationsPresentation.flow.title')}>
        <div className="steps">
          {flow.map((step, index) => (
            <div className="step" key={step.title}>
              <div className="step-number">{String(index + 1).padStart(2, '0')}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="narrow">
          <Notice variant="info">{t('formationsPresentation.notice')}</Notice>
        </div>
      </Section>
    </>
  );
}
