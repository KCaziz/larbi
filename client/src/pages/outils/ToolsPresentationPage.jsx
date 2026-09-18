import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import '../Pages.css';

const tools = [
  { key: 'credit', icon: '💳', tone: 'tone-amber' },
  { key: 'invoice', icon: '🧾', tone: 'tone-blue' },
];

export default function ToolsPresentationPage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        icon="🛠️"
        title={t('toolsPresentation.title')}
        subtitle={t('toolsPresentation.intro')}
      />

      <Section>
        <div className="feature-grid feature-grid-2">
          {tools.map((tool) => (
            <article className={`feature-card ${tool.tone}`} key={tool.key}>
              <span className="icon-badge" aria-hidden="true">
                {tool.icon}
              </span>
              <h3>{t(`toolsPresentation.${tool.key}.title`)}</h3>
              <p>{t(`toolsPresentation.${tool.key}.body`)}</p>
            </article>
          ))}
        </div>
        <p className="center mt-lg">{t('toolsPresentation.accessNote')}</p>
        <div className="narrow">
          <Notice variant="info">{t('toolsPresentation.notice')}</Notice>
        </div>
      </Section>
    </>
  );
}
