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

export default function GuidePage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const guide = useApi(withLang(`/apprendre/guides/${slug}`, i18n.language));
  useDocumentMeta(guide.status === 'ready' ? guide.data.guide.title : t('apprendre.title'));

  if (guide.status === 'loading') return <LoadingState />;
  if (guide.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={guide.reload} />;

  const { guide: g } = guide.data;
  return (
    <>
      <PageHeader icon={BookOpen} title={g.title} />
      <div className="apprendre-page apprendre-term-page">
        <Link to="/apprendre" className="apprendre-back">
          <ArrowLeft className="icon-dir" size={16} aria-hidden="true" />
          {t('apprendre.back')}
        </Link>
        <RichContent html={g.body} />
        {/* "Simuler" (C21): shown only when an administrator attached a
            calculator to this guide. */}
        {g.simulator && (
          <Link className="apprendre-simulate" to={`/outils/simulateurs/${g.simulator}`}>
            <Calculator size={15} aria-hidden="true" /> {t('apprendre.simulate')}
          </Link>
        )}
      </div>
    </>
  );
}
