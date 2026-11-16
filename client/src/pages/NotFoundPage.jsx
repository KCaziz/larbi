import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import './Pages.css';
import { useDocumentMeta } from '../lib/useDocumentMeta.js';

export default function NotFoundPage() {
  const { t } = useTranslation();
  // Same title and description as the server sends (P12-06).
  useDocumentMeta(t('seo.pages.notFound.title'), t('seo.pages.notFound.description'));

  return (
    <section className="status-hero">
      <p className="status-code" aria-hidden="true">
        404
      </p>
      <span className="status-label">{t('notFound.code')}</span>
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.body')}</p>
      <Button to="/" className="btn-lg">
        {t('notFound.back')}
      </Button>
    </section>
  );
}
