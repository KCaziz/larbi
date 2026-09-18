import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import './Pages.css';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="status-hero">
      <p className="status-code gradient-text" aria-hidden="true">
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
