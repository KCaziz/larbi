import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

// Route template for /blog/:slug. No article data exists before the CMS
// (P3-01/P3-02) is built, so every slug currently resolves to this honest
// "not available yet" state instead of fabricated article content.
export default function ArticlePage() {
  const { slug } = useParams();
  const { t } = useTranslation();

  return (
    <section className="page-section page-status">
      <p className="code">{t('article.label')}</p>
      <h1>{t('article.notFoundTitle', { slug })}</h1>
      <Notice variant="info">{t('article.notice')}</Notice>
      <Button to="/blog">{t('article.back')}</Button>
    </section>
  );
}
