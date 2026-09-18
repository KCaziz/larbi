import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import './Pages.css';

export default function ErrorPage() {
  const error = useRouteError();
  const { t } = useTranslation();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <section className="status-hero">
      <div className="status-emoji" aria-hidden="true">
        ⚠️
      </div>
      <span className="status-label">{t('errorPage.code')}</span>
      <h1>{t('errorPage.title')}</h1>
      <p>{t('errorPage.body')}</p>
      <Button to="/" className="btn-lg">
        {t('notFound.back')}
      </Button>
    </section>
  );
}
