import { useTranslation } from 'react-i18next';
import './Pages.css';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <section className="page-section">
      <h1>{t('about.title')}</h1>
      <p>{t('about.intro')}</p>
      <h2>{t('about.approachTitle')}</h2>
      <p>{t('about.approachBody')}</p>
      <h2>{t('about.securityTitle')}</h2>
      <p>{t('about.securityBody')}</p>
    </section>
  );
}
