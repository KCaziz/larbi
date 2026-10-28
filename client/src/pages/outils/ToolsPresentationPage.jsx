import { useTranslation } from 'react-i18next';
import { Briefcase, Calculator, Compass, CreditCard, FlaskConical, Landmark, Receipt, Wrench, ClipboardCheck } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import '../Pages.css';

const tools = [
  { key: 'comparator', icon: Landmark, tone: 'tone-green', to: '/outils/comparateur', available: true },
  { key: 'workshop', icon: FlaskConical, tone: 'tone-blue', to: '/outils/atelier', available: true },
  { key: 'simulators', icon: Calculator, tone: 'tone-blue', to: '/outils/simulateurs', available: true },
  { key: 'jobOffers', icon: Briefcase, tone: 'tone-brass', to: '/outils/offres-emploi', available: true },
  { key: 'explorer', icon: Compass, tone: 'tone-green', to: '/outils/explorateur', available: true },
  { key: 'postal', icon: Landmark, tone: 'tone-green', to: '/outils/postal', available: true },
  { key: 'credit', icon: CreditCard, tone: 'tone-brass', to: '/outils/credit', available: true },
  // « Préparation au financement » (JA08, in red in the annotated cahier: it
  // existed but nothing led to it). Inside the application only: it reads the
  // person's own figures.
  { key: 'funding', icon: ClipboardCheck, tone: 'tone-brass', to: '/financement', available: true, appOnly: true },
  { key: 'invoice', icon: Receipt, tone: 'tone-clay', to: '/outils/facture', available: true },
];

// The same catalogue serves the showcase (`/outils`) and the application
// (`/app/outils`, P8-02): inside the application, `base` keeps every link in
// it. P8-15 turns it into the single catalogue of the application.
export default function ToolsPresentationPage({ base = '' }) {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        icon={Wrench}
        title={t('toolsPresentation.title')}
        subtitle={t('toolsPresentation.intro')}
      />

      <Section>
        <div className="feature-grid feature-grid-2">
          {tools.filter((tool) => !tool.appOnly || base).map((tool) => {
            const Icon = tool.icon;
            return (
            <article className={`feature-card ${tool.tone}`} key={tool.key}>
              <span className="icon-badge" aria-hidden="true">
                <Icon size={22} strokeWidth={1.6} />
              </span>
              <h3>{t(`toolsPresentation.${tool.key}.title`)}</h3>
              <p>{t(`toolsPresentation.${tool.key}.body`)}</p>
              {tool.available && (
                <Button to={`${base}${tool.to}`} variant="ghost" arrow>
                  {t('comparator.browseTheme')}
                </Button>
              )}
            </article>
            );
          })}
        </div>
        <p className="center mt-lg">{t('toolsPresentation.accessNote')}</p>
        <div className="narrow">
          <Notice variant="info">{t('toolsPresentation.notice')}</Notice>
        </div>
      </Section>
    </>
  );
}
