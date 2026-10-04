import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Landmark } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import './Comparator.css';

export default function ComparatorSegmentPage() {
  const { segment } = useParams();
  const { t } = useTranslation();
  const data = useApi(`/tools/comparator/segments/${segment}`);

  const segmentLabel = t(`comparator.segments.${segment}`, segment);
  useDocumentMeta(
    `${segmentLabel} - ${t('comparator.segmentComparison')}`,
    t('comparator.segmentSubtitle', { segment: segmentLabel }),
  );

  if (data.status === 'loading') return <LoadingState />;
  if (data.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={data.reload} />;

  const { groups, updatedAt } = data.data;

  return (
    <>
      <PageHeader
        icon={Landmark}
        title={`${t('comparator.segmentComparison')} — ${segmentLabel}`}
        subtitle={t('comparator.segmentSubtitle', { segment: segmentLabel })}
      />

      <div className="comparator-page">
        <nav className="comparator-breadcrumb">
          <Link to="/outils/comparateur">{t('comparator.backToComparator')}</Link>
          <span className="sep" aria-hidden="true"><ChevronRight size={14} /></span>
          <span>{segmentLabel}</span>
        </nav>

        {updatedAt && <p className="comparator-meta">{t('comparator.updatedAt', { date: new Date(updatedAt).toLocaleDateString() })}</p>}

        {groups.length === 0 ? (
          <p className="comparator-disclaimer">{t('comparator.noResults')}</p>
        ) : (
          groups.map((group) => (
            <div key={group.theme.key} className="segment-group">
              <h2>
                <Link to={`/outils/comparateur/${group.theme.key}`}>
                  {t(`comparator.themes.${group.theme.key}`)}
                </Link>
              </h2>

              {/* Desktop table */}
              <table className="comparator-table">
                <thead>
                  <tr>
                    <th>{t('comparator.allBanks')}</th>
                    <th>Label</th>
                    {group.theme.fields.map((f) => <th key={f}>{t(`comparator.fields.${f}`)}</th>)}
                    {group.theme.hasMetric && <th>{t('comparator.estimatedCost')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {group.conditions.map((c) => (
                    <tr key={c.id}>
                      <td className="bank-name">{c.bank.name}</td>
                      <td>{c.label}</td>
                      {group.theme.fields.map((f) => <td key={f}>{c.values[f] ?? ''}</td>)}
                      {group.theme.hasMetric && (
                        <td className="cost-cell">
                          {c.annualCost === null
                            ? <span className="cost-null">{t('comparator.noCost')}</span>
                            : c.annualCost === 0
                              ? <span className="cost-free">{t('comparator.free')}</span>
                              : t('comparator.perYear', { amount: c.annualCost.toLocaleString('fr-DZ') })}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="comparator-cards">
                {group.conditions.map((c) => (
                  <div key={c.id} className="condition-card">
                    <div className="condition-card-head">
                      <div>
                        <h3>{c.label}</h3>
                        <span className="bank-name">{c.bank.name}</span>
                      </div>
                    </div>
                    <dl className="condition-card-values">
                      {group.theme.fields.map((f) => c.values[f] ? (
                        <Fragment key={f}>
                          <dt>{t(`comparator.fields.${f}`)}</dt>
                          <dd>{c.values[f]}</dd>
                        </Fragment>
                      ) : null)}
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
