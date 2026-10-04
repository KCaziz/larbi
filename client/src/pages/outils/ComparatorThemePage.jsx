import { Fragment, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown, ChevronRight, Landmark } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import './Comparator.css';

function formatCost(cost, t) {
  if (cost === null) return { text: t('comparator.noCost'), className: 'cost-null' };
  if (cost === 0) return { text: t('comparator.free'), className: 'cost-free' };
  return { text: t('comparator.perYear', { amount: cost.toLocaleString('fr-DZ') }), className: '' };
}

export default function ComparatorThemePage() {
  const { theme: themeKey } = useParams();
  const { t } = useTranslation();
  const data = useApi(`/tools/comparator/themes/${themeKey}`);

  const [bankFilter, setBankFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'cost'

  const themeLabel = t(`comparator.themes.${themeKey}`, themeKey);
  useDocumentMeta(`${themeLabel} - ${t('comparator.title')}`, '');

  if (data.status === 'loading') return <LoadingState />;
  if (data.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={data.reload} />;

  const { theme, conditions, updatedAt } = data.data;

  // Derive unique banks and segments for the filters.
  const banks = useMemo(() => [...new Set(conditions.map((c) => c.bank.name))].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })), [conditions]);
  const segments = useMemo(() => [...new Set(conditions.map((c) => c.segment))], [conditions]);
  const hasSegments = segments.length > 1 || (segments.length === 1 && segments[0] !== 'non_precise');

  // Filter and sort.
  const filtered = useMemo(() => {
    let rows = conditions;
    if (bankFilter) rows = rows.filter((c) => c.bank.name === bankFilter);
    if (segmentFilter) rows = rows.filter((c) => c.segment === segmentFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((c) => c.label.toLowerCase().includes(q) || c.bank.name.toLowerCase().includes(q) || Object.values(c.values).some((v) => v.toLowerCase().includes(q)));
    }
    if (sortBy === 'cost' && theme.hasMetric) {
      rows = [...rows].sort((a, b) => {
        if (a.annualCost === null && b.annualCost === null) return 0;
        if (a.annualCost === null) return 1;
        if (b.annualCost === null) return -1;
        return a.annualCost - b.annualCost;
      });
    }
    return rows;
  }, [conditions, bankFilter, segmentFilter, search, sortBy, theme.hasMetric]);

  return (
    <>
      <PageHeader icon={Landmark} title={themeLabel} subtitle={t('comparator.conditionCount', { count: conditions.length })} />

      <div className="comparator-page">
        <nav className="comparator-breadcrumb">
          <Link to="/outils/comparateur">{t('comparator.backToComparator')}</Link>
          <span className="sep" aria-hidden="true"><ChevronRight size={14} /></span>
          <span>{themeLabel}</span>
        </nav>

        {updatedAt && <p className="comparator-meta">{t('comparator.updatedAt', { date: new Date(updatedAt).toLocaleDateString() })}</p>}

        {conditions.length === 0 ? (
          <p className="comparator-disclaimer">{t('comparator.notDocumented')}</p>
        ) : (
          <>
            <div className="comparator-controls">
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('comparator.search')} />

              <select value={bankFilter} onChange={(e) => setBankFilter(e.target.value)}>
                <option value="">{t('comparator.allBanks')}</option>
                {banks.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>

              {hasSegments && (
                <select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)}>
                  <option value="">{t('comparator.allSegments')}</option>
                  {segments.map((s) => <option key={s} value={s}>{t(`comparator.segments.${s}`)}</option>)}
                </select>
              )}

              {theme.hasMetric && (
                <>
                  <button type="button" className={`comparator-sort-btn${sortBy === 'name' ? ' active' : ''}`} onClick={() => setSortBy('name')}>
                    <ArrowUpDown size={14} aria-hidden="true" />
                    {t('comparator.sortByName')}
                  </button>
                  <button type="button" className={`comparator-sort-btn${sortBy === 'cost' ? ' active' : ''}`} onClick={() => setSortBy('cost')}>
                    <ArrowUpDown size={14} aria-hidden="true" />
                    {t('comparator.sortByCost')}
                  </button>
                </>
              )}
            </div>

            {filtered.length === 0 ? (
              <p className="comparator-disclaimer">{t('comparator.noResults')}</p>
            ) : (
              <>
                {/* Desktop table */}
                <table className="comparator-table">
                  <thead>
                    <tr>
                      <th>{t('comparator.allBanks')}</th>
                      <th>Label</th>
                      {theme.category && <th>Cat.</th>}
                      {hasSegments && <th>Segment</th>}
                      {theme.fields.map((f) => <th key={f}>{t(`comparator.fields.${f}`)}</th>)}
                      {theme.hasMetric && <th>{t('comparator.estimatedCost')}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id}>
                        <td className="bank-name">{c.bank.name}</td>
                        <td>{c.label}</td>
                        {theme.category && <td>{c.category ?? ''}</td>}
                        {hasSegments && (
                          <td>
                            {c.segment !== 'non_precise' && <span className="segment-badge">{t(`comparator.segments.${c.segment}`)}</span>}
                          </td>
                        )}
                        {theme.fields.map((f) => <td key={f}>{c.values[f] ?? ''}</td>)}
                        {theme.hasMetric && (
                          <td className="cost-cell">
                            <CostLabel cost={c.annualCost} t={t} />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile cards */}
                <div className="comparator-cards">
                  {filtered.map((c) => (
                    <div key={c.id} className="condition-card">
                      <div className="condition-card-head">
                        <div>
                          <h3>{c.label}</h3>
                          <span className="bank-name">{c.bank.name}</span>
                        </div>
                        {theme.hasMetric && <CostLabel cost={c.annualCost} t={t} />}
                      </div>
                      <dl className="condition-card-values">
                        {theme.fields.map((f) => c.values[f] ? (
                          <Fragment key={f}>
                            <dt>{t(`comparator.fields.${f}`)}</dt>
                            <dd>{c.values[f]}</dd>
                          </Fragment>
                        ) : null)}
                        {hasSegments && c.segment !== 'non_precise' && (
                          <>
                            <dt>Segment</dt>
                            <dd><span className="segment-badge">{t(`comparator.segments.${c.segment}`)}</span></dd>
                          </>
                        )}
                      </dl>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

function CostLabel({ cost, t }) {
  const { text, className } = formatCost(cost, t);
  return <span className={className}>{text}</span>;
}

