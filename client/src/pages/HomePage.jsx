import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BookOpenText,
  Briefcase,
  Calculator,
  CircleCheck,
  GraduationCap,
  Languages,
  Layers,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import Section from '../components/ui/Section.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import desktopFr from '../assets/showcase/app-desktop-fr.webp';
import desktopEn from '../assets/showcase/app-desktop-en.webp';
import desktopAr from '../assets/showcase/app-desktop-ar.webp';
import phoneFr from '../assets/showcase/app-phone-fr.webp';
import phoneEn from '../assets/showcase/app-phone-en.webp';
import phoneAr from '../assets/showcase/app-phone-ar.webp';
import './Pages.css';
import { useDocumentMeta } from '../lib/useDocumentMeta.js';

// Screens of the application for the hero, captured on a demonstration account
// (fictional figures); a language without its own capture shows the French one.
const SCREENS = {
  fr: { desktop: desktopFr, phone: phoneFr },
  en: { desktop: desktopEn, phone: phoneEn },
  ar: { desktop: desktopAr, phone: phoneAr },
};

const stats = [
  { key: 'multilingual', icon: Languages },
  { key: 'themes', icon: Layers },
  { key: 'security', icon: ShieldCheck },
  { key: 'certification', icon: GraduationCap },
];

// « Nos grands univers » (refonte 2026-11-16, after the client's model): every
// card leads to something the platform really offers today.
const universes = [
  { key: 'budget', icon: Wallet, to: '/fonctionnalites' },
  { key: 'shared', icon: UsersRound, to: '/fonctionnalites' },
  { key: 'business', icon: Briefcase, to: '/fonctionnalites' },
  { key: 'paper', icon: TrendingUp, to: '/fonctionnalites' },
  { key: 'compare', icon: Scale, to: '/outils/comparateur' },
  { key: 'simulate', icon: Calculator, to: '/outils/simulateurs' },
  { key: 'learn', icon: GraduationCap, to: '/formations' },
  { key: 'glossary', icon: BookOpenText, to: '/apprendre' },
];

// Two FINCLUDIA solutions (client positioning, 2026-10): FINCLUDIA Particulier
// (the 8 personal journeys, P3-18) and FINCLUDIA Entreprise (the pre-existing
// auto-entrepreneur / PME / PMI categories). The 8 journey labels are read
// from `account.fin.publics` — the exact list the profile form already uses
// — rather than re-typed here, so the two can never drift apart.
const businessTypes = ['autoEntrepreneur', 'pme', 'pmi'];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  // Same title and description as the server sends (P12-06).
  useDocumentMeta(t('seo.pages.home.title'), t('seo.pages.home.description'), { suffix: false });
  const screens = SCREENS[i18n.language?.slice(0, 2)] ?? SCREENS.fr;
  const steps = t('home.steps.items', { returnObjects: true });
  const publics = t('account.fin.publics', { returnObjects: true });

  return (
    <>
      <section className="hero hero-band">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-badge">{t('home.hero.badge')}</span>
            {/* Le titre est la signature officielle de la charte (P1-13), et
                le paragraphe son positionnement, mot pour mot. Ni l'un ni
                l'autre n'est une formule rédigée ici : ce sont des éléments de
                marque, et les réécrire reviendrait à changer le discours du
                client. */}
            <h1>{t('home.hero.title')}</h1>
            <p className="hero-signature">{t('home.hero.signature')}</p>
            <p>{t('home.hero.body')}</p>
            <div className="hero-actions">
              <Button to="/formations" variant="mint" className="btn-lg" arrow>
                {t('home.hero.ctaFormations')}
              </Button>
              <Button to="/outils" variant="outline-light" className="btn-lg">
                {t('home.hero.ctaTools')}
              </Button>
            </div>
            <ul className="hero-trust">
              {stats.map((stat) => (
                <li key={stat.key} title={t(`home.stats.${stat.key}.text`)}>
                  <stat.icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  {t(`home.stats.${stat.key}.title`)}
                </li>
              ))}
            </ul>
          </div>

          {/* The application itself, on a computer and a phone, as in the
              client's model: real screens of a demonstration account, in the
              visitor's language. */}
          <figure className="hero-devices">
            <div className="device-laptop">
              <div className="device-laptop-screen">
                <img src={screens.desktop} alt={t('home.devices.desktop')} width="1440" height="900" />
              </div>
              <div className="device-laptop-base" aria-hidden="true" />
            </div>
            <div className="device-phone">
              <img src={screens.phone} alt={t('home.devices.phone')} width="390" height="844" />
            </div>
            <figcaption className="sr-only">{t('home.devices.caption')}</figcaption>
          </figure>
        </div>
      </section>

      {/* « Pour qui ? », from the client's own model: the real profiles of the
          platform, personal and business, and the way in. */}
      <section className="audience-strip" aria-labelledby="audience-title">
        <div className="audience-inner">
          <p id="audience-title" className="audience-title">
            {t('home.audience.title')}
          </p>
          <ul className="audience-list">
            {publics
              .filter((p) => p.code !== 'AUT')
              .map((p) => (
                <li key={p.code}>
                  <CircleCheck size={16} aria-hidden="true" />
                  {p.label.split(' — ')[0]}
                </li>
              ))}
            {businessTypes.map((key) => (
              <li key={key} className="audience-business">
                <Briefcase size={16} aria-hidden="true" />
                {t(`accountTypes.${key}`)}
              </li>
            ))}
          </ul>
          <Link to="/inscription" className="audience-cta">
            {t('home.audience.cta')} <ArrowRight size={16} aria-hidden="true" className="icon-dir" />
          </Link>
        </div>
      </section>

      <Section title={t('home.universes.title')} subtitle={t('home.universes.subtitle')}>
        <div className="universe-grid">
          {universes.map((universe, index) => (
            <Reveal as="div" key={universe.key} delay={index * 40}>
              <Link to={universe.to} className="universe-card">
                <span className="universe-icon" aria-hidden="true">
                  <universe.icon size={22} strokeWidth={1.75} />
                </span>
                <span className="universe-text">
                  <strong>{t(`home.universes.items.${universe.key}.title`)}</strong>
                  <span>{t(`home.universes.items.${universe.key}.body`)}</span>
                </span>
                <ArrowRight className="universe-arrow icon-dir" size={18} aria-hidden="true" />
              </Link>
            </Reveal>
          ))}
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

      <section className="cta-band cta-band-gradient">
        <div className="cta-band-inner">
          <h2>{t('home.cta.title')}</h2>
          <p>{t('home.cta.body')}</p>
          <div className="cta-actions">
            <Button to="/inscription" variant="mint" className="btn-lg" arrow>
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
