import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import './Pages.css';

export default function ErrorPage() {
  const error = useRouteError();
  const { t } = useTranslation();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <section className="page-status">
        <p className="code">{t('notFound.code')}</p>
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.body')}</p>
        <Button to="/">{t('notFound.back')}</Button>
      </section>
    );
  }

  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <section className="page-status">
      <p className="code">{t('errorPage.code')}</p>
      <h1>{t('errorPage.title')}</h1>
      <p>{t('errorPage.body')}</p>
      <Button to="/">{t('notFound.back')}</Button>
    </section>
  );
}
