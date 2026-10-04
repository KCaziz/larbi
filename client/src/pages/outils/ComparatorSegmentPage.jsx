import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Landmark } from 'lucide-react';
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

// The client's tab 12 "Comparatif — Particuliers / Professionnels / Entreprises":
// only the rows whose segment is stated in the source file, rubric by rubric.
export default function ComparatorSegmentPage() {
  const { segment } = useParams();
  const { t, i18n } = useTranslation();
  const { status, data, error, reload } = useApi(`/tools/comparator/segments/${segment}`);

  const segmentLabel = t(`comparator.segments.${segment}`, { defaultValue: t('comparator.segmentComparison') });
  const subtitle = t('comparator.segmentSubtitle', { segment: segmentLabel });
  useDocumentMeta(`${segmentLabel} - ${t('comparator.segmentComparison')}`, subtitle);

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') {
    if (isNotFound(error)) return <NotFoundPage />;
    return <ErrorState message={t('state.loadError')} onRetry={reload} />;
  }

  const { groups, updatedAt } = data;

  return (
    <>
      <PageHeader icon={Landmark} title={`${t('comparator.segmentComparison')} — ${segmentLabel}`} subtitle={subtitle} />

      <div className="comparator-page">
        <nav className="comparator-breadcrumb" aria-label={t('comparator.title')}>
          <Link to="/outils/comparateur">{t('comparator.title')}</Link>
          <span className="sep" aria-hidden="true">
            <ChevronRight className="icon-dir" size={14} />
          </span>
          <span aria-current="page">{segmentLabel}</span>
        </nav>

        {updatedAt && (
          <p className="comparator-meta">
            <span>{t('comparator.updatedAt', { date: formatDate(i18n.language, updatedAt) })}</span>
          </p>
        )}

        <p className="comparator-disclaimer">{t('comparator.segmentNote')}</p>

        {groups.length === 0 ? (
          <p className="comparator-disclaimer">{t('comparator.noSegmentRows')}</p>
        ) : (
          groups.map((group) => (
            <section key={group.theme.key} className="segment-group">
              <h2>
                <Link to={`/outils/comparateur/${group.theme.key}`}>{t(`comparator.themes.${group.theme.key}`)}</Link>
              </h2>

              <div className="comparator-table-wrap">
                <table className="comparator-table">
                  <thead>
                    <tr>
                      <th scope="col">{t('comparator.bank')}</th>
                      <th scope="col">{labelHeader(t, group.theme.key)}</th>
                      {group.theme.category && <th scope="col">{t('comparator.category')}</th>}
                      {group.theme.fields.map((f) => (
                        <th scope="col" key={f}>
                          {fieldLabel(t, group.theme.key, f)}
                        </th>
                      ))}
                      {group.theme.hasMetric && <th scope="col">{t('comparator.estimatedCost')}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {group.conditions.map((c) => (
                      <tr key={c.id}>
                        <td className="bank-name">{c.bank.name}</td>
                        <td>{c.label}</td>
                        {group.theme.category && <td>{c.category ?? ''}</td>}
                        {group.theme.fields.map((f) => (
                          <td key={f}>{c.values[f] ?? ''}</td>
                        ))}
                        {group.theme.hasMetric && (
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
                {group.conditions.map((c) => (
                  <article key={c.id} className="condition-card">
                    <div className="condition-card-head">
                      <div>
                        <h3>{c.label}</h3>
                        <span className="bank-name">{c.bank.name}</span>
                      </div>
                      {group.theme.hasMetric && <CostLabel cost={c.annualCost} t={t} />}
                    </div>
                    <dl className="condition-card-values">
                      {group.theme.category && c.category && (
                        <>
                          <dt>{t('comparator.category')}</dt>
                          <dd>{c.category}</dd>
                        </>
                      )}
                      {group.theme.fields.map((f) =>
                        c.values[f] ? (
                          <Fragment key={f}>
                            <dt>{fieldLabel(t, group.theme.key, f)}</dt>
                            <dd>{c.values[f]}</dd>
                          </Fragment>
                        ) : null,
                      )}
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}

        <p className="comparator-disclaimer">{t('comparator.disclaimer')}</p>
      </div>
    </>
  );
}
