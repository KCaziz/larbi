import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { SEARCH_SCREENS } from '../../config/searchScreens.js';
import './GlobalSearch.css';

// Global search (P6-20), screen C22, onglet « 12_Recherche ». One bar:
// screens (local, instant), then this account's own data and goals (the
// server, strictly cloistered by owner), then "Apprendre" (public content,
// its own existing search). No generative interpretation anywhere — every
// match is a literal substring, on the query or one of its configured
// synonyms.
export default function GlobalSearch() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  function onChange(value) {
    setQuery(value);
    setOpen(true);
    clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults(null);
      return;
    }
    timer.current = setTimeout(() => runSearch(value), 250);
  }

  async function runSearch(value) {
    setLoading(true);
    try {
      const [fin, apprendre] = await Promise.all([
        api.get(`/fin/recherche?q=${encodeURIComponent(value)}`),
        api.get(`/apprendre?query=${encodeURIComponent(value)}`).catch(() => null),
      ]);
      setResults({ ...fin, apprendre: apprendre ?? { terms: [], guides: [] } });
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  const normalisedQuery = query.trim().toLowerCase();
  const screenMatches =
    normalisedQuery.length < 2
      ? []
      : SEARCH_SCREENS.filter((screen) => t(screen.labelKey).toLowerCase().includes(normalisedQuery) || screen.keywords.some((k) => k.includes(normalisedQuery)));

  const hasAnyResult =
    screenMatches.length > 0 ||
    (results &&
      (results.mesDonnees?.transactions?.length > 0 ||
        results.mesDonnees?.budgets?.length > 0 ||
        results.mesDonnees?.debts?.length > 0 ||
        results.objectifs?.length > 0 ||
        results.apprendre?.terms?.length > 0 ||
        results.apprendre?.guides?.length > 0));

  function close() {
    setOpen(false);
    setQuery('');
    setResults(null);
  }

  return (
    <div className="global-search">
      <div className="global-search-box">
        <Search size={16} aria-hidden="true" />
        <label className="sr-only" htmlFor="global-search-input">
          {t('search.label')}
        </label>
        <input
          id="global-search-input"
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={t('search.placeholder')}
        />
        {query && (
          <button type="button" className="global-search-clear" onClick={close} aria-label={t('search.clear')}>
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && normalisedQuery.length >= 2 && (
        <div className="global-search-panel">
          {loading && <p className="global-search-loading">{t('search.loading')}</p>}

          {!loading && !hasAnyResult && (
            <div className="global-search-empty">
              <p>{t('search.noResults', { query })}</p>
              <p className="fin-hint">{t('search.noResultsHint')}</p>
            </div>
          )}

          {screenMatches.length > 0 && (
            <SearchGroup title={t('search.groups.actions')}>
              {screenMatches.map((screen) => (
                <Link key={screen.to} to={screen.to} className="global-search-item" onClick={close}>
                  {t(screen.labelKey)}
                </Link>
              ))}
            </SearchGroup>
          )}

          {results?.mesDonnees && (results.mesDonnees.transactions.length > 0 || results.mesDonnees.budgets.length > 0 || results.mesDonnees.debts.length > 0) && (
            <SearchGroup title={t('search.groups.mesDonnees')}>
              {results.mesDonnees.transactions.map((row) => (
                <Link key={`tx-${row.id}`} to="/app/mouvements" className="global-search-item" onClick={close}>
                  {row.note || t('search.noLabel')} — {formatAmount(i18n.language, row.value, row.currency)} ({formatDate(i18n.language, row.occurredAt)})
                </Link>
              ))}
              {results.mesDonnees.budgets.map((row) => (
                <Link key={`bg-${row.id}`} to={`/app/budgets/${row.id}`} className="global-search-item" onClick={close}>
                  {row.label}
                </Link>
              ))}
              {results.mesDonnees.debts.map((row) => (
                <Link key={`dt-${row.id}`} to="/app/dettes" className="global-search-item" onClick={close}>
                  {row.label}
                </Link>
              ))}
            </SearchGroup>
          )}

          {results?.objectifs?.length > 0 && (
            <SearchGroup title={t('search.groups.objectifs')}>
              {results.objectifs.map((row) => (
                <Link key={row.id} to="/app/objectifs" className="global-search-item" onClick={close}>
                  {row.label}
                </Link>
              ))}
            </SearchGroup>
          )}

          {results?.apprendre && (results.apprendre.terms?.length > 0 || results.apprendre.guides?.length > 0) && (
            <SearchGroup title={t('search.groups.apprendre')}>
              {(results.apprendre.terms ?? []).map((term) => (
                <Link key={`term-${term.slug}`} to={`/apprendre/termes/${term.slug}`} className="global-search-item" onClick={close}>
                  {term.title}
                </Link>
              ))}
              {(results.apprendre.guides ?? []).map((guide) => (
                <Link key={`guide-${guide.slug}`} to={`/apprendre/guides/${guide.slug}`} className="global-search-item" onClick={close}>
                  {guide.title}
                </Link>
              ))}
            </SearchGroup>
          )}

          <SearchGroup title={t('search.groups.explorer')}>
            <p className="fin-hint">{t('search.explorerHint')}</p>
          </SearchGroup>
        </div>
      )}
    </div>
  );
}

function SearchGroup({ title, children }) {
  return (
    <div className="global-search-group">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
