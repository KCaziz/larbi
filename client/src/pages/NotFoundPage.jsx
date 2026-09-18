import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import './Pages.css';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="page-status">
      <p className="code">{t('notFound.code')}</p>
      <h1>{t('notFound.title')}</h1>
      <p>{t('notFound.body')}</p>
      <Button to="/">{t('notFound.back')}</Button>
    </section>
  );
}
