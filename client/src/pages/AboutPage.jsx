import { useTranslation } from 'react-i18next';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/ui/Section.jsx';
import './Pages.css';

const valueVisuals = [
  { icon: '🛡️', tone: 'tone-violet' },
  { icon: '🔐', tone: 'tone-blue' },
  { icon: '📈', tone: 'tone-green' },
  { icon: '🏅', tone: 'tone-amber' },
];

export default function AboutPage() {
  const { t } = useTranslation();
  const values = t('about.values.items', { returnObjects: true });

  return (
    <>
      <PageHeader icon="🏛️" title={t('about.title')} subtitle={t('about.intro')} />

      <Section>
        <div className="feature-grid feature-grid-2">
          <article className="feature-card tone-violet">
            <span className="icon-badge" aria-hidden="true">
              🎯
            </span>
            <h3>{t('about.approachTitle')}</h3>
            <p>{t('about.approachBody')}</p>
          </article>
          <article className="feature-card tone-blue">
            <span className="icon-badge" aria-hidden="true">
              🔐
            </span>
            <h3>{t('about.securityTitle')}</h3>
            <p>{t('about.securityBody')}</p>
          </article>
        </div>
      </Section>

      <Section alt title={t('about.values.title')}>
        <div className="feature-grid feature-grid-4">
          {values.map((value, index) => (
            <article className={`feature-card ${valueVisuals[index].tone}`} key={value.title}>
              <span className="icon-badge" aria-hidden="true">
                {valueVisuals[index].icon}
              </span>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
