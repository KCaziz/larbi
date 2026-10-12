import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, FileText, GraduationCap, Lock, Search, SearchX, Star, Calculator } from 'lucide-react';
import { api, ApiError } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import { withLang } from '../../lib/contentLanguage.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import './Apprendre.css';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

// The four kinds of content the client's C21 groups, in the order it lists them.
// `to` is where a card leads; the server already told us what is locked.
const GROUPS = [
  { kind: 'course', key: 'courses', icon: GraduationCap, to: (c) => `/catalogue/${c.slug}` },
  { kind: 'term', key: 'terms', icon: BookOpen, to: (c) => `/apprendre/termes/${c.slug}` },
  { kind: 'guide', key: 'guides', icon: BookOpen, to: (c) => `/apprendre/guides/${c.slug}` },
  { kind: 'article', key: 'articles', icon: FileText, to: (c) => `/blog/${c.slug}` },
];

// "Apprendre" (P2-08): one lexical search across courses, glossary, mini-guides
// and articles, grouped by kind, filtered on level and theme. No session needed
// to search — a session only adds favourites and puts the content of your own
// FINCLUDIA public first.
export default function ApprendrePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const level = params.get('level') ?? '';
  const theme = params.get('theme') ?? '';
  const [text, setText] = useState(query);
  const [error, setError] = useState(null);
  useDocumentMeta(t('apprendre.title'), t('apprendre.intro'));

  const apiParams = new URLSearchParams();
  if (query) apiParams.set('query', query);
  if (level) apiParams.set('level', level);
  if (theme) apiParams.set('theme', theme);
  const list = useApi(withLang(`/apprendre${apiParams.toString() ? `?${apiParams}` : ''}`, i18n.language));
  const favorites = useApi(user ? '/apprendre/favoris' : null);

  const data = list.data ?? null;
  const groups = useMemo(() => GROUPS.map((group) => ({ ...group, items: data?.[group.key] ?? [] })), [data]);

  // The themes actually present in the results: the vocabulary is free-form
  // (administrators choose it), so offering a fixed list would either miss
  // themes or offer ones nothing carries.
  const themes = useMemo(() => {
    const found = new Set();
    for (const group of groups) for (const item of group.items) if (item.theme) found.add(item.theme);
    if (theme) found.add(theme);
    return [...found].sort((a, b) => a.localeCompare(b));
  }, [groups, theme]);

  const kept = useMemo(() => new Set((favorites.data?.favorites ?? []).map((f) => `${f.kind}:${f.id}`)), [favorites.data]);

  const setParam = (name, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next);
  };

  const submit = (event) => {
    event.preventDefault();
    setParam('q', text.trim());
  };

  const clear = () => {
    setText('');
    setParams(new URLSearchParams());
  };

  async function toggleFavorite(card) {
    setError(null);
    const id = `${card.kind}:${card.id}`;
    try {
      if (kept.has(id)) await api.delete(`/apprendre/favoris/${card.kind}/${card.id}`);
      else await api.post('/apprendre/favoris', { kind: card.kind, refId: card.id });
      favorites.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('state.loadError'));
    }
  }

  const empty = list.status === 'ready' && groups.every((group) => group.items.length === 0);

  const card = (group, item) => {
    const Icon = group.icon;
    const id = `${item.kind}:${item.id}`;
    return (
      <li className="apprendre-card" key={item.id}>
        <Link to={group.to(item)} className="apprendre-card-main">
          <Icon size={18} aria-hidden="true" />
          <span className="apprendre-card-title">{item.title}</span>
        </Link>

        <p className="apprendre-card-meta">
          {item.level && <span className="apprendre-tag">{t(`apprendre.levels.${item.level}`)}</span>}
          {item.theme && <span className="apprendre-tag">{item.theme}</span>}
          {/* The server said what is locked and why: the card repeats it rather
              than letting someone click into a refusal. */}
          {item.lock && (
            <span className="apprendre-tag apprendre-tag-lock">
              <Lock size={13} aria-hidden="true" /> {t(`apprendre.${item.lock === 'premium_required' ? 'lockPremium' : 'lockLogin'}`)}
            </span>
          )}
          {item.kind === 'course' && <span className="apprendre-tag">{t('apprendre.requiresAccount')}</span>}
          {item.kind === 'course' && item.quizCount > 0 && (
            <span className="apprendre-tag">{t('apprendre.quizCount', { count: item.quizCount })}</span>
          )}
        </p>

        <div className="apprendre-card-actions">
          {/* "Simuler": only when an administrator attached a calculator to this
              entry. Nothing is guessed from the wording. */}
          {item.simulator && (
            <Link className="apprendre-simulate" to={`/outils/simulateurs/${item.simulator}`}>
              <Calculator size={15} aria-hidden="true" /> {t('apprendre.simulate')}
            </Link>
          )}
          {user && (
            <button type="button" className={kept.has(id) ? 'apprendre-fav active' : 'apprendre-fav'} onClick={() => toggleFavorite(item)}>
              <Star size={15} aria-hidden="true" /> {t(kept.has(id) ? 'apprendre.favorites.remove' : 'apprendre.favorites.add')}
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <>
      <PageHeader icon={GraduationCap} title={t('apprendre.title')} subtitle={t('apprendre.intro')} />
      <div className="apprendre-page">
        {/* Imposed by the client's specification on every screen of "Apprendre". */}
        <div className="narrow">
          <Notice variant="info">{t('apprendre.disclaimer')}</Notice>
        </div>

        <form className="apprendre-search" onSubmit={submit} role="search">
          <label className="sr-only" htmlFor="apprendre-q">
            {t('apprendre.searchLabel')}
          </label>
          <div className="apprendre-search-input">
            <Search size={18} aria-hidden="true" />
            <input
              id="apprendre-q"
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('apprendre.searchPlaceholder')}
            />
          </div>
          <Button type="submit">{t('apprendre.search')}</Button>
        </form>

        <div className="apprendre-filters">
          <button type="button" className={level === '' ? 'active' : ''} onClick={() => setParam('level', '')}>
            {t('apprendre.allLevels')}
          </button>
          {LEVELS.map((lv) => (
            <button key={lv} type="button" className={level === lv ? 'active' : ''} onClick={() => setParam('level', lv)}>
              {t(`apprendre.levels.${lv}`)}
            </button>
          ))}
          {(query || level || theme) && (
            <button type="button" className="apprendre-clear" onClick={clear}>
              {t('apprendre.clear')}
            </button>
          )}
        </div>

        {themes.length > 0 && (
          <div className="apprendre-filters">
            <button type="button" className={theme === '' ? 'active' : ''} onClick={() => setParam('theme', '')}>
              {t('apprendre.allThemes')}
            </button>
            {themes.map((value) => (
              <button key={value} type="button" className={theme === value ? 'active' : ''} onClick={() => setParam('theme', value)}>
                {value}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="narrow">
            <Notice variant="error">{error}</Notice>
          </div>
        )}

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

        {list.status === 'ready' &&
          !empty &&
          groups
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <section className="apprendre-group" key={group.key}>
                <h2>{t(`apprendre.${group.key}Title`)}</h2>
                <ul className="apprendre-card-list">{group.items.map((item) => card(group, item))}</ul>
              </section>
            ))}

        <section className="apprendre-group">
          <h2>{t('apprendre.favorites.title')}</h2>
          {!user ? (
            <Notice variant="info">{t('apprendre.favorites.needsAccount')}</Notice>
          ) : (favorites.data?.favorites ?? []).length === 0 ? (
            <Notice variant="info">{t('apprendre.favorites.empty')}</Notice>
          ) : (
            <ul className="apprendre-card-list">
              {favorites.data.favorites.map((item) => {
                const group = GROUPS.find((g) => g.kind === item.kind);
                return group ? card(group, item) : null;
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
