import { Fragment, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, ChevronRight, Landmark } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import { formatDate } from '../../lib/format.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import NotFoundPage from '../NotFoundPage.jsx';
import { fieldLabel, isNotFound, labelHeader } from '../../lib/comparator.js';
import CostLabel from './CostLabel.jsx';
import './Comparator.css';

const NO_ROWS = [];
const SEGMENT_ORDER = ['particulier', 'professionnel', 'entreprise', 'non_precise'];
const byName = (a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' });

// Rows without an estimated cost go last, whatever the direction: they are not
// "the cheapest", they are simply not comparable on that criterion.
const byCost = (a, b) => {
  if (a.annualCost === null && b.annualCost === null) return 0;
  if (a.annualCost === null) return 1;
  if (b.annualCost === null) return -1;
  return a.annualCost - b.annualCost;
};

export default function ComparatorThemePage() {
  const { theme: themeKey } = useParams();
  const { t, i18n } = useTranslation();
  const { status, data, error, reload } = useApi(`/tools/comparator/themes/${themeKey}`);

  const [bankFilter, setBankFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'cost'

  const theme = data?.theme ?? null;
  const conditions = data?.conditions ?? NO_ROWS;
  const themeLabel = t(`comparator.themes.${themeKey}`, { defaultValue: t('comparator.title') });
  useDocumentMeta(`${themeLabel} - ${t('comparator.title')}`, t('comparator.subtitle', { count: '' }));

  // Hooks stay above the early returns below (same order on every render).
  const banks = useMemo(() => [...new Set(conditions.map((c) => c.bank.name))].sort(byName), [conditions]);
  const segments = useMemo(() => SEGMENT_ORDER.filter((s) => conditions.some((c) => c.segment === s)), [conditions]);
  const hasSegments = segments.some((s) => s !== 'non_precise');

  const filtered = useMemo(() => {
    let rows = conditions;
    if (bankFilter) rows = rows.filter((c) => c.bank.name === bankFilter);
    if (segmentFilter) rows = rows.filter((c) => c.segment === segmentFilter);
    const q = search.trim().toLocaleLowerCase('fr');
    if (q) {
      const has = (text) => typeof text === 'string' && text.toLocaleLowerCase('fr').includes(q);
      rows = rows.filter((c) => has(c.label) || has(c.bank.name) || has(c.category) || Object.values(c.values).some(has));
    }
    if (sortBy === 'cost' && theme?.hasMetric) rows = [...rows].sort(byCost);
    return rows;
  }, [conditions, bankFilter, segmentFilter, search, sortBy, theme]);

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') {
    if (isNotFound(error)) return <NotFoundPage />;
    return <ErrorState message={t('state.loadError')} onRetry={reload} />;
  }

  const { updatedAt } = data;
  const filtering = Boolean(bankFilter || segmentFilter || search.trim());

  return (
    <>
      <PageHeader icon={Landmark} title={themeLabel} subtitle={t(`comparator.themeNotes.${theme.key}`)} />

      <div className="comparator-page">
        <nav className="comparator-breadcrumb" aria-label={t('comparator.title')}>
          <Link to="/outils/comparateur">{t('comparator.title')}</Link>
          <span className="sep" aria-hidden="true">
            <ChevronRight className="icon-dir" size={14} />
          </span>
          <span aria-current="page">{themeLabel}</span>
        </nav>

        <p className="comparator-meta">
          <span>{t('comparator.conditionCount', { count: conditions.length })}</span>
          {updatedAt && <span>{t('comparator.updatedAt', { date: formatDate(i18n.language, updatedAt) })}</span>}
        </p>

        {conditions.length === 0 ? (
          <p className="comparator-disclaimer">{t('comparator.notDocumentedBody')}</p>
        ) : (
          <>
            <div className="comparator-controls">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('comparator.search')}
                aria-label={t('comparator.search')}
              />

              <select value={bankFilter} onChange={(e) => setBankFilter(e.target.value)} aria-label={t('comparator.bank')}>
                <option value="">{t('comparator.allBanks')}</option>
                {banks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {hasSegments && (
                <select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)} aria-label={t('comparator.segment')}>
                  <option value="">{t('comparator.allSegments')}</option>
                  {segments.map((s) => (
                    <option key={s} value={s}>
                      {t(`comparator.segments.${s}`)}
                    </option>
                  ))}
                </select>
              )}

              {theme.hasMetric && (
                <div className="comparator-sort" role="group" aria-label={t('comparator.sortLabel')}>
                  <button type="button" className={`comparator-sort-btn${sortBy === 'name' ? ' active' : ''}`} aria-pressed={sortBy === 'name'} onClick={() => setSortBy('name')}>
                    <ArrowUpDown size={14} aria-hidden="true" />
                    {t('comparator.sortByName')}
                  </button>
                  <button type="button" className={`comparator-sort-btn${sortBy === 'cost' ? ' active' : ''}`} aria-pressed={sortBy === 'cost'} onClick={() => setSortBy('cost')}>
                    <ArrowUpDown size={14} aria-hidden="true" />
                    {t('comparator.sortByCost')}
                  </button>
                </div>
              )}
            </div>

            {filtering && filtered.length > 0 && (
              <p className="comparator-result-count" role="status">
                {t('comparator.resultCount', { count: filtered.length })}
              </p>
            )}

            {filtered.length === 0 ? (
              <p className="comparator-disclaimer" role="status">
                {t('comparator.noResults')}
              </p>
            ) : (
              <>
                <div className="comparator-table-wrap">
                  <table className="comparator-table">
                    <thead>
                      <tr>
                        <th scope="col">{t('comparator.bank')}</th>
                        <th scope="col">{labelHeader(t, theme.key)}</th>
                        {theme.category && <th scope="col">{t('comparator.category')}</th>}
                        {hasSegments && <th scope="col">{t('comparator.segment')}</th>}
                        {theme.fields.map((f) => (
                          <th scope="col" key={f}>
                            {fieldLabel(t, theme.key, f)}
                          </th>
                        ))}
                        {theme.hasMetric && <th scope="col">{t('comparator.estimatedCost')}</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => (
                        <tr key={c.id}>
                          <td className="bank-name">{c.bank.name}</td>
                          <td>{c.label}</td>
                          {theme.category && <td>{c.category ?? ''}</td>}
                          {hasSegments && <td>{c.segment !== 'non_precise' && <span className="segment-badge">{t(`comparator.segments.${c.segment}`)}</span>}</td>}
                          {theme.fields.map((f) => (
                            <td key={f}>{c.values[f] ?? ''}</td>
                          ))}
                          {theme.hasMetric && (
                            <td className="cost-cell">
                              <CostLabel cost={c.annualCost} t={t} />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="comparator-cards">
                  {filtered.map((c) => (
                    <article key={c.id} className="condition-card">
                      <div className="condition-card-head">
                        <div>
                          <h3>{c.label}</h3>
                          <span className="bank-name">{c.bank.name}</span>
                        </div>
                        {theme.hasMetric && <CostLabel cost={c.annualCost} t={t} />}
                      </div>
                      <dl className="condition-card-values">
                        {theme.category && c.category && (
                          <>
                            <dt>{t('comparator.category')}</dt>
                            <dd>{c.category}</dd>
                          </>
                        )}
                        {c.segment !== 'non_precise' && (
                          <>
                            <dt>{t('comparator.segment')}</dt>
                            <dd>
                              <span className="segment-badge">{t(`comparator.segments.${c.segment}`)}</span>
                            </dd>
                          </>
                        )}
                        {theme.fields.map((f) =>
                          c.values[f] ? (
                            <Fragment key={f}>
                              <dt>{fieldLabel(t, theme.key, f)}</dt>
                              <dd>{c.values[f]}</dd>
                            </Fragment>
                          ) : null,
                        )}
                      </dl>
                    </article>
                  ))}
                </div>
              </>
            )}

            {theme.hasMetric && <p className="comparator-footnote">{t('comparator.costNote')}</p>}
          </>
        )}

        <p className="comparator-disclaimer">{t('comparator.disclaimer')}</p>
      </div>
    </>
  );
}
