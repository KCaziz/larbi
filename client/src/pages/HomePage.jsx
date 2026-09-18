import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import './Pages.css';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <section className="hero">
        <h1>{t('home.hero.title')}</h1>
        <p>{t('home.hero.body')}</p>
        <div className="hero-actions">
          <Button to="/formations" variant="primary">
            {t('home.hero.ctaFormations')}
          </Button>
          <Button to="/outils" variant="secondary">
            {t('home.hero.ctaTools')}
          </Button>
        </div>
      </section>

      <section className="page-section">
        <h2>{t('home.featuresSectionTitle')}</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>{t('home.features.elearning.title')}</h3>
            <p>{t('home.features.elearning.body')}</p>
            <Button to="/formations" variant="ghost">
              {t('home.features.elearning.cta')}
            </Button>
          </div>
          <div className="feature-card">
            <h3>{t('home.features.blog.title')}</h3>
            <p>{t('home.features.blog.body')}</p>
            <Button to="/blog" variant="ghost">
              {t('home.features.blog.cta')}
            </Button>
          </div>
          <div className="feature-card">
            <h3>{t('home.features.tools.title')}</h3>
            <p>{t('home.features.tools.body')}</p>
            <Button to="/outils" variant="ghost">
              {t('home.features.tools.cta')}
            </Button>
          </div>
        </div>
      </section>

      <section className="page-section">
        <h2>{t('home.accounts.title')}</h2>
        <p>{t('home.accounts.body')}</p>
        <ul className="account-types">
          <li>{t('accountTypes.autoEntrepreneur')}</li>
          <li>{t('accountTypes.pme')}</li>
          <li>{t('accountTypes.pmi')}</li>
          <li>{t('accountTypes.standard')}</li>
          <li>{t('accountTypes.premium')}</li>
        </ul>
        <Button to="/fonctionnalites" variant="ghost">
          {t('home.accounts.cta')}
        </Button>
      </section>
    </>
  );
}
