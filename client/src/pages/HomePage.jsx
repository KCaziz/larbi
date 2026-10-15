import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BookOpenText,
  Briefcase,
  Calculator,
  GraduationCap,
  Languages,
  Layers,
  Newspaper,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Section from '../components/ui/Section.jsx';
import Reveal from '../components/ui/Reveal.jsx';
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

// Two FINCLUDIA solutions (client positioning, 2026-10): FINCLUDIA Particulier
// (the 8 personal journeys, P3-18) and FINCLUDIA Entreprise (the pre-existing
// auto-entrepreneur / PME / PMI categories). The 8 journey labels are read
// from `account.fin.publics` — the exact list the profile form already uses
// — rather than re-typed here, so the two can never drift apart.
const businessTypes = ['autoEntrepreneur', 'pme', 'pmi'];

export default function HomePage() {
  const { t } = useTranslation();
  const steps = t('home.steps.items', { returnObjects: true });
  const publics = t('account.fin.publics', { returnObjects: true });

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
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Reveal as="li" key={feature.key} className={feature.tone} delay={index * 80}>
                  <Link to={feature.to}>
                    <span className="icon-badge" aria-hidden="true">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <span className="hero-index-title">{t(`home.features.${feature.key}.title`)}</span>
                    <ArrowRight className="arrow icon-dir" size={18} strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="stats">
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Reveal as="div" className={`stat ${stat.tone}`} key={stat.key} delay={index * 60}>
                <Icon className="stat-icon" size={22} strokeWidth={1.6} aria-hidden="true" />
                <div>
                  <strong>{t(`home.stats.${stat.key}.title`)}</strong>
                  <span className="stat-text">{t(`home.stats.${stat.key}.text`)}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <Section
        title={t('home.featuresSectionTitle')}
        subtitle={t('home.featuresSectionSubtitle')}
      >
        <div className="feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal as="article" className={`feature-card ${feature.tone}`} key={feature.key} delay={index * 80}>
                <span className="icon-badge" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.6} />
                </span>
                <h3>{t(`home.features.${feature.key}.title`)}</h3>
                <p>{t(`home.features.${feature.key}.body`)}</p>
                <Button to={feature.to} variant="ghost" arrow>
                  {t(`home.features.${feature.key}.cta`)}
                </Button>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section alt title={t('home.steps.title')} subtitle={t('home.steps.subtitle')}>
        <div className="steps">
          {steps.map((step, index) => (
            <Reveal as="div" className="step" key={step.title} delay={index * 100}>
              <div className="step-number">{String(index + 1).padStart(2, '0')}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section title={t('home.accounts.title')} subtitle={t('home.accounts.body')}>
        <div className="offers-grid">
          <Reveal as="article" className="offer-card">
            <span className="icon-badge tone-primary" aria-hidden="true">
              <Users size={22} strokeWidth={1.6} />
            </span>
            <h3>{t('home.accounts.individual.title')}</h3>
            <p>{t('home.accounts.individual.body')}</p>
            <div className="offer-chips">
              {publics.map((p) => (
                <span className="offer-chip" key={p.code}>
                  {p.label}
                </span>
              ))}
            </div>
            <Button to="/compte/fincludia" variant="ghost" arrow>
              {t('home.accounts.individual.cta')}
            </Button>
          </Reveal>

          <Reveal as="article" className="offer-card" delay={100}>
            <span className="icon-badge tone-brass" aria-hidden="true">
              <Briefcase size={22} strokeWidth={1.6} />
            </span>
            <h3>{t('home.accounts.business.title')}</h3>
            <p>{t('home.accounts.business.body')}</p>
            <div className="offer-chips">
              {businessTypes.map((key) => (
                <span className="offer-chip" key={key}>
                  {t(`accountTypes.${key}`)}
                </span>
              ))}
            </div>
            <Button to="/compte/type" variant="ghost" arrow>
              {t('home.accounts.business.cta')}
            </Button>
          </Reveal>
        </div>
        <Button to="/fonctionnalites" variant="ghost" arrow className="mt-lg">
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
