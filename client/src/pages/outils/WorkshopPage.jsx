import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';
import { api, ApiError } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import { formatAmount, formatNumber, formatRatio } from '../../lib/format.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import SimulatorRunner from '../../components/outils/SimulatorRunner.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import './Simulators.css';

// The simulation workshop (P4-16), screen C18: one entry point for every
// calculator. Search a type of simulation, run it, keep the scenario with its
// hypotheses, and compare two or three of them.
//
// The empty state is the catalogue itself plus the client's "exemples", which
// each simulator carries: the person sees what a simulator does before typing.
const MAX_COMPARED = 3;

export default function WorkshopPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  useDocumentMeta(t('workshop.title'));

  const catalogue = useApi('/tools/simulations');
  // Scenarios are per account: asked for only when there is a session.
  const mine = useApi(user ? '/tools/scenarios' : null);

  const [search, setSearch] = useState('');
  const [chosen, setChosen] = useState(null);
  const [selected, setSelected] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState(null);

  // Memoised because the search filters it: `?? []` would be a new array on
  // every render and would refilter the catalogue each time.
  const simulators = useMemo(() => catalogue.data?.simulators ?? [], [catalogue.data]);
  const scenarios = mine.data?.scenarios ?? [];

  // Searching by what the person reads (the translated title and body), not by
  // the technical key.
  const found = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (needle === '') return simulators;
    return simulators.filter((simulator) => {
      const title = t(`simulators.list.${simulator.key}.title`).toLowerCase();
      const body = t(`simulators.list.${simulator.key}.body`).toLowerCase();
      return title.includes(needle) || body.includes(needle) || simulator.calculator.toLowerCase().includes(needle);
    });
  }, [search, simulators, t]);

  if (catalogue.status === 'loading') return <LoadingState />;
  if (catalogue.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={catalogue.reload} />;

  const toggle = (id) =>
    setSelected((previous) =>
      previous.includes(id) ? previous.filter((other) => other !== id) : previous.length >= MAX_COMPARED ? previous : [...previous, id],
    );

  async function compare() {
    setError(null);
    setComparison(null);
    try {
      setComparison(await api.post('/tools/scenarios/comparaison', { ids: selected }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('state.loadError'));
    }
  }

  async function remove(id) {
    setError(null);
    try {
      await api.delete(`/tools/scenarios/${id}`);
      setSelected((previous) => previous.filter((other) => other !== id));
      setComparison(null);
      mine.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('state.loadError'));
    }
  }

  // A compared figure is shown in its own unit, which travels with the row.
  const cell = (row, value) => {
    if (value === null || value === undefined) return t('simulators.notComputed');
    if (typeof value !== 'number') return t('simulators.composite');
    if (row.unite === 'ratio') return formatRatio(i18n.language, value);
    if (row.unite === 'mois') return t('simulators.months', { count: Math.round(value) });
    if (row.unite === 'jours') return t('simulators.days', { count: Math.round(value) });
    if (row.unite === 'points') return formatNumber(i18n.language, value);
    return formatAmount(i18n.language, value, row.unite);
  };

  return (
    <>
      <PageHeader icon={FlaskConical} title={t('workshop.title')} subtitle={t('workshop.intro')} />

      <Section>
        <div className="form-field workshop-search">
          <label htmlFor="workshop-search">{t('workshop.searchLabel')}</label>
          <input id="workshop-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {found.length === 0 ? (
          <Notice variant="info">{t('workshop.noMatch', { search: search.trim() })}</Notice>
        ) : (
          <div className="feature-grid feature-grid-2">
            {found.map((simulator) => (
              <article className="feature-card" key={simulator.key}>
                <h3>{t(`simulators.list.${simulator.key}.title`)}</h3>
                <p>{t(`simulators.list.${simulator.key}.body`)}</p>
                <Button
                  type="button"
                  variant={chosen?.key === simulator.key ? 'primary' : 'ghost'}
                  onClick={() => setChosen(chosen?.key === simulator.key ? null : simulator)}
                >
                  {chosen?.key === simulator.key ? t('workshop.close') : t('workshop.open')}
                </Button>
              </article>
            ))}
          </div>
        )}
      </Section>

      {chosen && (
        <Section>
          <h2>{t(`simulators.list.${chosen.key}.title`)}</h2>
          {/* The same runner as the simulator's own page: one form, one place. */}
          <SimulatorRunner simulator={chosen} onSaved={() => mine.reload()} />
        </Section>
      )}

      <Section>
        <h2>{t('workshop.myScenarios')}</h2>

        {!user ? (
          <Notice variant="info">{t('simulators.saveNeedsAccount')}</Notice>
        ) : scenarios.length === 0 ? (
          <Notice variant="info">{t('workshop.noScenario')}</Notice>
        ) : (
          <>
            <ul className="scenario-list">
              {scenarios.map((scenario) => (
                <li className="scenario" key={scenario.id}>
                  <label className="comparison-toggle" htmlFor={`scenario-${scenario.id}`}>
                    <input
                      id={`scenario-${scenario.id}`}
                      type="checkbox"
                      checked={selected.includes(scenario.id)}
                      onChange={() => toggle(scenario.id)}
                    />
                    {scenario.title}
                  </label>
                  <p className="comparison-note">
                    {t(`simulators.list.${scenario.simulator}.title`)} · {scenario.currency} ·{' '}
                    {t('workshop.savedOn', { date: new Date(scenario.createdAt).toLocaleDateString(i18n.language) })}
                  </p>

                  {/* The hypotheses are part of what was saved, so they are shown
                      with the scenario and not recomputed. */}
                  {scenario.hypotheses && (
                    <p className="simulator-hypotheses">
                      {t('simulators.hypotheses')}{' '}
                      {Object.entries(scenario.hypotheses)
                        .map(([name, value]) => `${t(`simulators.hypothesisNames.${name}`)} : ${value}`)
                        .join(' · ')}
                    </p>
                  )}

                  {/* A formula that moved since: the figure is still computed,
                      and the change is said rather than hidden. */}
                  {scenario.versionsChanged && (
                    <ul className="simulator-warnings">
                      {scenario.versionsChanged.map((change) => (
                        <li key={change.formule_id}>
                          {t('workshop.versionChanged', { formula: change.formule_id, saved: change.saved, current: change.current })}
                        </li>
                      ))}
                    </ul>
                  )}

                  {scenario.stale && (
                    <ul className="simulator-warnings">
                      <li>{t('workshop.stale')}</li>
                    </ul>
                  )}

                  <Button type="button" variant="ghost" onClick={() => remove(scenario.id)}>
                    {t('workshop.deleteScenario')}
                  </Button>
                </li>
              ))}
            </ul>

            <div className="simulator-actions">
              <Button type="button" onClick={compare} disabled={selected.length < 2}>
                {t('workshop.compareSelected', { count: selected.length })}
              </Button>
              <p className="comparison-note">{t('workshop.compareHint', { max: MAX_COMPARED })}</p>
            </div>
          </>
        )}

        {error && (
          <div className="narrow mt-lg">
            <Notice variant="error">{error}</Notice>
          </div>
        )}

        {comparison && (
          <div className="simulator-results mt-lg">
            <h3>{t('workshop.comparisonTitle')}</h3>
            {/* No synthetic score here: weighing a living allowance against a
                number of months has no defensible normalisation, so the figures
                are shown side by side (see the server's own comment). */}
            <p className="comparison-note">{t('workshop.noScoreNote')}</p>
            <div className="comparison-table-wrap">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th scope="col">{t('workshop.figure')}</th>
                    {comparison.scenarios.map((scenario) => (
                      <th scope="col" key={scenario.id}>
                        {scenario.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.results.map((row) => (
                    <tr key={row.result}>
                      <th scope="row">
                        {t(`simulators.results.${row.result}`)}
                        <span className="simulator-unit"> — {row.formule_id}</span>
                      </th>
                      {comparison.scenarios.map((scenario) => (
                        <td key={scenario.id}>{cell(row, row.values[scenario.id])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
