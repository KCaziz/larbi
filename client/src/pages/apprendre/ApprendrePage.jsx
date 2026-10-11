import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, GraduationCap, Search, SearchX } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import { withLang } from '../../lib/contentLanguage.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import './Apprendre.css';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

// "Apprendre" (P2-08): a lexical search across the glossary and the mini-guides,
// results grouped by kind, with a level filter. No session needed.
export default function ApprendrePage() {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const level = params.get('level') ?? '';
  const [text, setText] = useState(query);
  useDocumentMeta(t('apprendre.title'), t('apprendre.intro'));

  const apiParams = new URLSearchParams();
  if (query) apiParams.set('query', query);
  if (level) apiParams.set('level', level);
  const list = useApi(withLang(`/apprendre${apiParams.toString() ? `?${apiParams}` : ''}`, i18n.language));

  const submit = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(params);
    if (text.trim()) next.set('q', text.trim());
    else next.delete('q');
    setParams(next);
  };
  const setLevel = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set('level', value);
    else next.delete('level');
    setParams(next);
  };
  const clear = () => {
    setText('');
    setParams(new URLSearchParams());
  };

  const empty = list.status === 'ready' && list.data.terms.length === 0 && list.data.guides.length === 0;

  return (
    <>
      <PageHeader icon={GraduationCap} title={t('apprendre.title')} subtitle={t('apprendre.intro')} />
      <div className="apprendre-page">
        <form className="apprendre-search" onSubmit={submit} role="search">
          <label className="sr-only" htmlFor="apprendre-q">
            {t('apprendre.searchLabel')}
          </label>
          <div className="apprendre-search-input">
            <Search size={18} aria-hidden="true" />
            <input id="apprendre-q" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('apprendre.searchPlaceholder')} />
          </div>
          <Button type="submit">{t('apprendre.search')}</Button>
        </form>

        <div className="apprendre-filters">
          <button type="button" className={level === '' ? 'active' : ''} onClick={() => setLevel('')}>
            {t('apprendre.allLevels')}
          </button>
          {LEVELS.map((lv) => (
            <button key={lv} type="button" className={level === lv ? 'active' : ''} onClick={() => setLevel(lv)}>
              {t(`apprendre.levels.${lv}`)}
            </button>
          ))}
          {(query || level) && (
            <button type="button" className="apprendre-clear" onClick={clear}>
              {t('apprendre.clear')}
            </button>
          )}
        </div>

        {list.status === 'loading' && <LoadingState />}
        {list.status === 'error' && <ErrorState message={t('state.loadError')} onRetry={list.reload} />}
        {empty && (
          <div className="status-hero">
            <div className="status-icon" aria-hidden="true">
              <SearchX size={26} strokeWidth={1.6} />
            </div>
            <p>{t('apprendre.noResult')}</p>
          </div>
        )}

        {list.status === 'ready' && !empty && (
          <>
            {list.data.terms.length > 0 && (
              <section className="apprendre-group">
                <h2>{t('apprendre.glossaryTitle')}</h2>
                <ul className="apprendre-term-list">
                  {list.data.terms.map((term) => (
                    <li key={term.id}>
                      <Link to={`/apprendre/termes/${term.slug}`}>{term.term}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {list.data.guides.length > 0 && (
              <section className="apprendre-group">
                <h2>{t('apprendre.guidesTitle')}</h2>
                <div className="apprendre-guide-cards">
                  {list.data.guides.map((guide) => (
                    <Link key={guide.id} to={`/apprendre/guides/${guide.slug}`} className="apprendre-guide-card">
                      <BookOpen size={18} aria-hidden="true" />
                      <span>{guide.title}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
