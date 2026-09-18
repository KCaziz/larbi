import { useTranslation } from 'react-i18next';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function ToolsPresentationPage() {
  const { t } = useTranslation();

  return (
    <section className="page-section">
      <h1>{t('toolsPresentation.title')}</h1>
      <p>{t('toolsPresentation.intro')}</p>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>{t('toolsPresentation.credit.title')}</h3>
          <p>{t('toolsPresentation.credit.body')}</p>
        </div>
        <div className="feature-card">
          <h3>{t('toolsPresentation.invoice.title')}</h3>
          <p>{t('toolsPresentation.invoice.body')}</p>
        </div>
      </div>
      <p>{t('toolsPresentation.accessNote')}</p>
      <Notice variant="info">{t('toolsPresentation.notice')}</Notice>
    </section>
  );
}
