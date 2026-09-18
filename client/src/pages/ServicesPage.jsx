import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import './Pages.css';

export default function ServicesPage() {
  const { t } = useTranslation();

  return (
    <section className="page-section">
      <h1>{t('services.title')}</h1>
      <p>{t('services.intro')}</p>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>{t('services.formations.title')}</h3>
          <p>{t('services.formations.body')}</p>
          <Button to="/formations" variant="ghost">
            {t('services.formations.cta')}
          </Button>
        </div>
        <div className="feature-card">
          <h3>{t('services.blog.title')}</h3>
          <p>{t('services.blog.body')}</p>
          <Button to="/blog" variant="ghost">
            {t('services.blog.cta')}
          </Button>
        </div>
        <div className="feature-card">
          <h3>{t('services.tools.title')}</h3>
          <p>{t('services.tools.body')}</p>
          <Button to="/outils" variant="ghost">
            {t('services.tools.cta')}
          </Button>
        </div>
      </div>
      <p>
        <Button to="/fonctionnalites" variant="ghost">
          {t('services.detailCta')}
        </Button>
      </p>
    </section>
  );
}
