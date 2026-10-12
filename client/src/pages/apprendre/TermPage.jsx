import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, Calculator } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import { withLang } from '../../lib/contentLanguage.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import RichContent from '../../components/ui/RichContent.jsx';
import './Apprendre.css';

export default function TermPage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const term = useApi(withLang(`/apprendre/termes/${slug}`, i18n.language));
  useDocumentMeta(term.status === 'ready' ? term.data.term.term : t('apprendre.title'));

  if (term.status === 'loading') return <LoadingState />;
  if (term.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={term.reload} />;

  const { term: t1 } = term.data;
  return (
    <>
      <PageHeader icon={BookOpen} title={t1.term} />
      <div className="apprendre-page apprendre-term-page">
        <Link to="/apprendre" className="apprendre-back">
          <ArrowLeft className="icon-dir" size={16} aria-hidden="true" />
          {t('apprendre.back')}
        </Link>
        <RichContent html={t1.definition} />
        {/* "Simuler" (C21): shown only when an administrator attached a
            calculator to this entry. */}
        {t1.simulator && (
          <Link className="apprendre-simulate" to={`/outils/simulateurs/${t1.simulator}`}>
            <Calculator size={15} aria-hidden="true" /> {t('apprendre.simulate')}
          </Link>
        )}
        {t1.example && (
          <div className="apprendre-example">
            <h2>{t('apprendre.exampleTitle')}</h2>
            <RichContent html={t1.example} />
          </div>
        )}
        {t1.related.length > 0 && (
          <div className="apprendre-related">
            <h2>{t('apprendre.relatedTitle')}</h2>
            <ul>
              {t1.related.map((r) => (
                <li key={r.id}>
                  <Link to={`/apprendre/termes/${r.slug}`}>{r.term}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
