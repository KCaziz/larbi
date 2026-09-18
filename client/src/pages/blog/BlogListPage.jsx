import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function BlogListPage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader icon="📝" title={t('blogList.title')} subtitle={t('blogList.intro')} />

      <section className="status-hero">
        <div className="status-emoji" aria-hidden="true">
          📭
        </div>
        <h2>{t('blogList.emptyTitle')}</h2>
        <Notice variant="info">{t('blogList.notice')}</Notice>
      </section>
    </>
  );
}
