import { useTranslation } from 'react-i18next';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function FormationsPresentationPage() {
  const { t } = useTranslation();

  return (
    <section className="page-section">
      <h1>{t('formationsPresentation.title')}</h1>
      <p>{t('formationsPresentation.body')}</p>
      <p>{t('formationsPresentation.accessNote')}</p>
      <Notice variant="info">{t('formationsPresentation.notice')}</Notice>
    </section>
  );
}
