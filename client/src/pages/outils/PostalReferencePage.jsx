import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark, Search } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import './PostalReference.css';

// Algérie Poste / CCP services (P4-17), rebuilt around what a person comes to
// look for (recette R5-03): find a service by its name or by its family, and
// read what it is, who it is for, where it is done, its conditions and its
// rate as published. The internal counters and the lists of what remains to
// be checked are the team's business, not the reader's.
export default function PostalReferencePage() {
  const { t } = useTranslation();
  const [family, setFamily] = useState('');
  const [query, setQuery] = useState('');
  const catalogue = useApi('/tools/postal/services');
  useDocumentMeta(t('postal.title'), t('postal.intro'));

  const services = useMemo(() => catalogue.data?.services ?? [], [catalogue.data]);
  const families = useMemo(() => {
    const counts = new Map();
    for (const row of services) counts.set(row.service_family, (counts.get(row.service_family) ?? 0) + 1);
    return [...counts];
  }, [services]);

  const familyLabel = (key) => t(`postal.families.${key}`, { defaultValue: key.replace(/_/g, ' ') });
  const kindLabel = (kind) => t(`postal.kinds.${kind.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()}`, { defaultValue: kind });

  const needle = query.trim().toLowerCase();
  const shown = services.filter(
    (row) =>
      (!family || row.service_family === family) &&
      (!needle || [row.service_name, row.raw_conditions, row.subfamily].some((text) => text?.toLowerCase().includes(needle))),
  );
  const groups = families.map(([key]) => [key, shown.filter((row) => row.service_family === key)]).filter(([, rows]) => rows.length > 0);

  return (
    <>
      <PageHeader icon={Landmark} title={t('postal.title')} subtitle={t('postal.intro')} />
      <div className="postal-page">
        <Notice variant="info">{t('postal.indicativeNote')}</Notice>

        {catalogue.status === 'error' && <ErrorState message={t('state.loadError')} onRetry={catalogue.reload} />}
        {catalogue.status === 'loading' && !catalogue.data && <LoadingState />}

        {catalogue.data && (
          <>
            <div className="postal-tools">
              <label className="postal-search">
                <Search size={16} aria-hidden="true" />
                <span className="sr-only">{t('postal.searchLabel')}</span>
                <input type="search" value={query} placeholder={t('postal.searchPlaceholder')} onChange={(event) => setQuery(event.target.value)} />
              </label>
              <div className="postal-chips" role="group" aria-label={t('postal.familyLabel')}>
                <button type="button" className="postal-chip" aria-pressed={family === ''} onClick={() => setFamily('')}>
                  {t('postal.allFamilies')} <span>{services.length}</span>
                </button>
                {families.map(([key, count]) => (
                  <button key={key} type="button" className="postal-chip" aria-pressed={family === key} onClick={() => setFamily(key)}>
                    {familyLabel(key)} <span>{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {groups.length === 0 && <p className="postal-empty">{t('postal.noResult')}</p>}

            {groups.map(([key, rows]) => (
              <section key={key} className="postal-group">
                <h2>{familyLabel(key)}</h2>
                <ul className="postal-list">
                  {rows.map((service) => (
                    <li key={service.service_id} className="postal-card">
                      <div className="postal-card-head">
                        <h3>{service.service_name}</h3>
                        <span className={`postal-badge postal-badge-${service.entry_kind.toLowerCase().replace(/[^a-z]/g, '')}`}>{kindLabel(service.entry_kind)}</span>
                      </div>
                      <p className="postal-meta">
                        {service.customer_segment} · {service.operation_channel}
                      </p>
                      {service.raw_conditions && <p className="postal-conditions">{service.raw_conditions}</p>}
                      <p className="postal-tariff">
                        <strong>{t('postal.tariffLabel')}</strong> {service.raw_tariff_text ?? t('postal.tariffWithheld')}
                      </p>
                      {/* Where the rate comes from (P8-28), under it. */}
                      {service.tarifRaison && <p className="postal-source">{service.tarifRaison}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </>
  );
}
