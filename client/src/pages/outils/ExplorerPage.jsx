import { Fragment, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { api, ApiError, errorKey } from '../../lib/api.js';
import { formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import { fieldLabel } from '../../lib/comparator.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import './Comparator.css';

const THEME_KEYS = ['comptes', 'versements-retraits', 'carte-locale', 'epargne', 'coffres-forts', 'credits', 'virements', 'carte-internationale', 'devises', 'operations-diverses', 'cheques'];

// "Explorer" (P4-13, écran C20) : recherche littérale sur les offres déjà
// publiques du comparateur (P4-06), réservée aux 18 ans et plus (P3-18). Pas
// de classement, pas de compatibilité calculée, pas d'affirmation
// d'éligibilité — seulement des résultats filtrés, avec leur source (banque,
// rubrique) et la fraîcheur réelle des données.
export default function ExplorerPage() {
  const { t, i18n } = useTranslation();
  useDocumentMeta(t('explorer.title'), t('explorer.intro'));

  const [q, setQ] = useState('');
  const [theme, setTheme] = useState('');
  const [state, setState] = useState({ status: 'idle', data: null, error: null });
  const timer = useRef(null);

  function run(nextQ, nextTheme) {
    clearTimeout(timer.current);
    if (nextQ.trim().length < 2 && !nextTheme) {
      setState({ status: 'idle', data: null, error: null });
      return;
    }
    timer.current = setTimeout(async () => {
      setState((s) => ({ ...s, status: 'loading' }));
      try {
        const params = new URLSearchParams();
        if (nextQ.trim()) params.set('q', nextQ.trim());
        if (nextTheme) params.set('themes', nextTheme);
        const data = await api.get(`/tools/explorateur?${params.toString()}`);
        setState({ status: 'ready', data, error: null });
      } catch (err) {
        setState({ status: 'error', data: null, error: err instanceof ApiError ? err : new ApiError(0, 'Network error') });
      }
    }, 250);
  }

  const onQ = (value) => {
    setQ(value);
    run(value, theme);
  };
  const onTheme = (value) => {
    setTheme(value);
    run(q, value);
  };

  const results = state.data?.results ?? [];

  return (
    <>
      <PageHeader icon={Compass} title={t('explorer.title')} subtitle={t('explorer.intro')} />

      <Section>
        <div className="narrow">
          <Notice variant="info">{t('explorer.disclaimer')}</Notice>
        </div>

        {state.status === 'error' && state.error.status === 403 ? (
          <div className="narrow mt-lg">
            <Notice variant="action-needed">{t('explorer.reservedToAdults')}</Notice>
          </div>
        ) : (
          <>
            <div className="comparator-controls">
              <input
                type="search"
                value={q}
                onChange={(e) => onQ(e.target.value)}
                placeholder={t('explorer.searchPlaceholder')}
                aria-label={t('explorer.searchPlaceholder')}
              />
              <select value={theme} onChange={(e) => onTheme(e.target.value)} aria-label={t('comparator.allBanks')}>
                <option value="">{t('explorer.allThemes')}</option>
                {THEME_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {t(`comparator.themes.${key}`)}
                  </option>
                ))}
              </select>
            </div>

            {state.status === 'loading' && <p className="comparator-result-count" role="status">{t('explorer.searching')}</p>}

            {state.status === 'error' && <p className="comparator-disclaimer" role="alert">{t(errorKey(state.error))}</p>}

            {state.status === 'ready' && (
              <>
                <p className="comparator-result-count" role="status">
                  {t('explorer.resultCount', { count: results.length })}
                  {state.data.updatedAt && ` — ${t('comparator.updatedAt', { date: formatDate(i18n.language, state.data.updatedAt) })}`}
                </p>

                {results.length === 0 ? (
                  <div className="narrow">
                    <p className="comparator-disclaimer" role="status">{t('explorer.noResults', { query: q })}</p>
                    <p className="fin-hint">{t('explorer.noResultsHint')}</p>
                  </div>
                ) : (
                  <div className="comparator-cards">
                    {results.map((row) => (
                      <article key={row.id} className="condition-card">
                        <div className="condition-card-head">
                          <div>
                            <h3>{row.label}</h3>
                            <span className="bank-name">{row.bank.name}</span>
                          </div>
                        </div>
                        <p className="comparator-footnote">{t(`comparator.themes.${row.theme}`)}</p>
                        <dl className="condition-card-values">
                          {row.category && (
                            <>
                              <dt>{t('comparator.category')}</dt>
                              <dd>{row.category}</dd>
                            </>
                          )}
                          {Object.entries(row.values).map(([field, value]) => (
                            <Fragment key={field}>
                              <dt>{fieldLabel(t, row.theme, field)}</dt>
                              <dd>{value}</dd>
                            </Fragment>
                          ))}
                        </dl>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {state.status === 'idle' && <p className="comparator-disclaimer">{t('explorer.typeToSearch')}</p>}
          </>
        )}

        <p className="comparator-disclaimer">{t('explorer.neverEligibility')}</p>
      </Section>
    </>
  );
}
