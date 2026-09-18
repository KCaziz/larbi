import { useTranslation } from 'react-i18next';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function BlogListPage() {
  const { t } = useTranslation();

  return (
    <section className="page-section">
      <h1>{t('blogList.title')}</h1>
      <p>{t('blogList.intro')}</p>
      <Notice variant="info">{t('blogList.notice')}</Notice>
    </section>
  );
}
