import { useMemo, useState } from 'react';
import { GraduationCap, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/ui/Section.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import EmptyState from '../../components/cms/EmptyState.jsx';
import FormationCard from '../../components/learn/FormationCard.jsx';
import './Learn.css';

export default function CatalogPage() {
  const { t } = useTranslation();
  const { status, data, reload } = useApi('/learn/formations');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const formations = useMemo(() => data?.formations ?? [], [data]);
  const categories = useMemo(() => {
    const map = new Map();
    formations.forEach((f) => f.category && map.set(f.category.id, f.category.name));
    return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [formations]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return formations.filter(
      (f) =>
        (!category || f.category?.id === category) &&
        (!q || f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)),
    );
  }, [formations, query, category]);

  return (
    <>
      <PageHeader icon={GraduationCap} title={t('learn.catalog.title')} subtitle={t('learn.catalog.subtitle')} />
      <Section>
        {status === 'loading' && <LoadingState />}
        {status === 'error' && <ErrorState message={t('learn.catalog.loadError')} onRetry={reload} />}

        {status === 'ready' && formations.length === 0 && (
          <EmptyState icon={GraduationCap} title={t('learn.catalog.emptyTitle')}>
            <p>{t('learn.catalog.emptyBody')}</p>
          </EmptyState>
        )}

        {status === 'ready' && formations.length > 0 && (
          <>
            <div className="learn-filters">
              <div className="form-field">
                <label htmlFor="catalog-search">{t('learn.catalog.search')}</label>
                <input
                  id="catalog-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('learn.catalog.searchPlaceholder')}
                />
              </div>
              {categories.length > 0 && (
                <div className="form-field">
                  <label htmlFor="catalog-category">{t('learn.catalog.category')}</label>
                  <select id="catalog-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">{t('learn.catalog.allCategories')}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {visible.length === 0 ? (
              <EmptyState icon={SearchX} title={t('learn.catalog.noResults')} />
            ) : (
              <div className="learn-grid">
                {visible.map((item) => (
                  <FormationCard key={item.slug} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}
