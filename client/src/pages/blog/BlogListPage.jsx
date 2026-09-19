import { useTranslation } from 'react-i18next';
import { Inbox, Newspaper } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function BlogListPage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader icon={Newspaper} title={t('blogList.title')} subtitle={t('blogList.intro')} />

      <section className="status-hero">
        <div className="status-icon" aria-hidden="true">
          <Inbox size={26} strokeWidth={1.6} />
        </div>
        <h2>{t('blogList.emptyTitle')}</h2>
        <Notice variant="info">{t('blogList.notice')}</Notice>
      </section>
    </>
  );
}
