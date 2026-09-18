import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import Section from '../components/ui/Section.jsx';
import './Pages.css';

const stats = [
  { key: 'multilingual', icon: '🌍', tone: 'tone-violet' },
  { key: 'themes', icon: '🌓', tone: 'tone-blue' },
  { key: 'security', icon: '🔒', tone: 'tone-green' },
  { key: 'certification', icon: '🎓', tone: 'tone-amber' },
];

const features = [
  { key: 'elearning', icon: '📚', tone: 'tone-violet', to: '/formations' },
  { key: 'blog', icon: '📝', tone: 'tone-blue', to: '/blog' },
  { key: 'tools', icon: '🧮', tone: 'tone-amber', to: '/outils' },
];

const accountPills = [
  { key: 'autoEntrepreneur', icon: '🧑‍💼', tone: 'tone-violet' },
  { key: 'pme', icon: '🏢', tone: 'tone-blue' },
  { key: 'pmi', icon: '🏭', tone: 'tone-amber' },
  { key: 'standard', icon: '🌱', tone: 'tone-green' },
  { key: 'premium', icon: '⭐', tone: 'tone-pink' },
];

export default function HomePage() {
  const { t } = useTranslation();
  const steps = t('home.steps.items', { returnObjects: true });

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-badge">✨ {t('home.hero.badge')}</span>
          <h1 className="gradient-text">{t('home.hero.title')}</h1>
          <p>{t('home.hero.body')}</p>
          <div className="hero-actions">
            <Button to="/formations" variant="primary" className="btn-lg">
              {t('home.hero.ctaFormations')}
            </Button>
            <Button to="/outils" variant="secondary" className="btn-lg">
              {t('home.hero.ctaTools')}
            </Button>
          </div>
        </div>
      </section>

      <div className="stats">
        <div className="stats-grid">
          {stats.map((stat) => (
            <div className={`stat ${stat.tone}`} key={stat.key}>
              <span className="stat-icon" aria-hidden="true">
                {stat.icon}
              </span>
              <div>
                <strong>{t(`home.stats.${stat.key}.title`)}</strong>
                <span className="stat-text">{t(`home.stats.${stat.key}.text`)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Section
        title={t('home.featuresSectionTitle')}
        subtitle={t('home.featuresSectionSubtitle')}
      >
        <div className="feature-grid">
          {features.map((feature) => (
            <article className={`feature-card ${feature.tone}`} key={feature.key}>
              <span className="icon-badge" aria-hidden="true">
                {feature.icon}
              </span>
              <h3>{t(`home.features.${feature.key}.title`)}</h3>
              <p>{t(`home.features.${feature.key}.body`)}</p>
              <Button to={feature.to} variant="ghost">
                {t(`home.features.${feature.key}.cta`)}
              </Button>
            </article>
          ))}
        </div>
      </Section>

      <Section alt title={t('home.steps.title')} subtitle={t('home.steps.subtitle')}>
        <div className="steps">
          {steps.map((step, index) => (
            <div className="step" key={step.title}>
              <div className="step-number">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('home.accounts.title')} subtitle={t('home.accounts.body')}>
        <div className="pill-grid">
          {accountPills.map((pill) => (
            <div className={`pill ${pill.tone}`} key={pill.key}>
              <span className="pill-icon" aria-hidden="true">
                {pill.icon}
              </span>
              {t(`accountTypes.${pill.key}`)}
            </div>
          ))}
        </div>
        <div className="center">
          <Button to="/fonctionnalites" variant="secondary">
            {t('home.accounts.cta')}
          </Button>
        </div>
      </Section>

      <section className="cta-band">
        <div className="cta-band-inner">
          <h2>{t('home.cta.title')}</h2>
          <p>{t('home.cta.body')}</p>
          <div className="cta-actions">
            <Button to="/inscription" variant="light" className="btn-lg">
              {t('nav.register')}
            </Button>
            <Button to="/connexion" variant="outline-light" className="btn-lg">
              {t('nav.login')}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
