import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BookOpenText,
  Building2,
  Calculator,
  Factory,
  GraduationCap,
  Languages,
  Layers,
  Newspaper,
  ShieldCheck,
  Sprout,
  Star,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Section from '../components/ui/Section.jsx';
import './Pages.css';

const stats = [
  { key: 'multilingual', icon: Languages, tone: 'tone-primary' },
  { key: 'themes', icon: Layers, tone: 'tone-blue' },
  { key: 'security', icon: ShieldCheck, tone: 'tone-green' },
  { key: 'certification', icon: GraduationCap, tone: 'tone-brass' },
];

const features = [
  { key: 'elearning', icon: BookOpenText, tone: 'tone-primary', to: '/formations' },
  { key: 'blog', icon: Newspaper, tone: 'tone-blue', to: '/blog' },
  { key: 'tools', icon: Calculator, tone: 'tone-brass', to: '/outils' },
];

const accountPills = [
  { key: 'autoEntrepreneur', icon: UserRound, tone: 'tone-primary' },
  { key: 'pme', icon: Building2, tone: 'tone-blue' },
  { key: 'pmi', icon: Factory, tone: 'tone-brass' },
  { key: 'standard', icon: Sprout, tone: 'tone-green' },
  { key: 'premium', icon: Star, tone: 'tone-clay' },
];

export default function HomePage() {
  const { t } = useTranslation();
  const steps = t('home.steps.items', { returnObjects: true });

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">{t('home.hero.badge')}</span>
            <h1>{t('home.hero.title')}</h1>
            <p>{t('home.hero.body')}</p>
            <div className="hero-actions">
              <Button to="/formations" variant="primary" className="btn-lg" arrow>
                {t('home.hero.ctaFormations')}
              </Button>
              <Button to="/outils" variant="secondary" className="btn-lg">
                {t('home.hero.ctaTools')}
              </Button>
            </div>
          </div>

          <ul className="hero-index">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.key} className={feature.tone}>
                  <Link to={feature.to}>
                    <span className="icon-badge" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <span className="hero-index-title">{t(`home.features.${feature.key}.title`)}</span>
                    <ArrowRight className="arrow icon-dir" size={18} strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="stats">
        <div className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div className={`stat ${stat.tone}`} key={stat.key}>
                <Icon className="stat-icon" size={22} strokeWidth={1.6} aria-hidden="true" />
                <div>
                  <strong>{t(`home.stats.${stat.key}.title`)}</strong>
                  <span className="stat-text">{t(`home.stats.${stat.key}.text`)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Section
        title={t('home.featuresSectionTitle')}
        subtitle={t('home.featuresSectionSubtitle')}
      >
        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className={`feature-card ${feature.tone}`} key={feature.key}>
                <span className="icon-badge" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.6} />
                </span>
                <h3>{t(`home.features.${feature.key}.title`)}</h3>
                <p>{t(`home.features.${feature.key}.body`)}</p>
                <Button to={feature.to} variant="ghost" arrow>
                  {t(`home.features.${feature.key}.cta`)}
                </Button>
              </article>
            );
          })}
        </div>
      </Section>

      <Section alt title={t('home.steps.title')} subtitle={t('home.steps.subtitle')}>
        <div className="steps">
          {steps.map((step, index) => (
            <div className="step" key={step.title}>
              <div className="step-number">{String(index + 1).padStart(2, '0')}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('home.accounts.title')} subtitle={t('home.accounts.body')}>
        <div className="pill-grid">
          {accountPills.map((pill) => {
            const Icon = pill.icon;
            return (
              <div className={`pill ${pill.tone}`} key={pill.key}>
                <Icon className="pill-icon" size={20} strokeWidth={1.6} aria-hidden="true" />
                {t(`accountTypes.${pill.key}`)}
              </div>
            );
          })}
        </div>
        <Button to="/fonctionnalites" variant="ghost" arrow>
          {t('home.accounts.cta')}
        </Button>
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
