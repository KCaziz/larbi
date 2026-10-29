import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Search, Star, Wrench } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Section from '../../components/ui/Section.jsx';
import './ToolsCatalogue.css';

// Le catalogue unique des Outils dans l'application (P8-15, OUT-01, OUT-02) :
// tous les calculateurs du client, cherchables et rangés par famille. Chacun
// ouvre l'écran qui l'applique aux données de la personne (« Sur mes
// données »), un simulateur sur des chiffres saisis (« Simuler »), ou les deux.
// Un calculateur pas encore construit est montré comme tel, jamais caché.
//
// La liste vient du serveur (`server/src/constants/finToolsCatalogue.js`), où
// un test vérifie que chaque calculateur du client y est et mène quelque part.
// Les favoris (OUT-01) sont ceux de la personne : une étoile sur chaque outil,
// « Mes favoris » en tête du catalogue, et un filtre pour ne voir qu'eux.
const ALL = 'all';
const FAVORITES = 'favorites';

const normalise = (text) =>
  String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export default function ToolsCataloguePage() {
  const { t } = useTranslation();
  const catalogue = useApi('/fin/outils/catalogue');
  const saved = useApi('/fin/outils/favoris');
  const [favorites, setFavorites] = useState(null);
  const [favoriteError, setFavoriteError] = useState(false);
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState(ALL);
  useDocumentMeta(t('toolsCatalogue.title'), t('toolsCatalogue.intro'));

  const label = (tool) => t(`toolsCatalogue.items.${tool.code}`, { defaultValue: tool.label });
  const tools = catalogue.data?.outils;
  const favoriteCodes = favorites ?? saved.data?.favoris ?? [];
  const isFavorite = (code) => favoriteCodes.includes(code);
  async function toggleFavorite(code) {
    setFavoriteError(false);
    try {
      const path = `/fin/outils/favoris/${encodeURIComponent(code)}`;
      const answer = isFavorite(code) ? await api.delete(path) : await api.put(path);
      setFavorites(answer.favoris);
    } catch {
      setFavoriteError(true);
    }
  }

  const shown = useMemo(() => {
    if (!tools) return [];
    const words = normalise(query).split(/\s+/).filter(Boolean);
    return tools.filter((tool) => {
      if (family === FAVORITES && !favoriteCodes.includes(tool.code)) return false;
      if (family !== ALL && family !== FAVORITES && tool.family !== family) return false;
      const haystack = normalise(`${label(tool)} ${tool.label} ${tool.code}`);
      return words.every((word) => haystack.includes(word));
    });
    // `label` only depends on the language, which re-renders the page anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tools, query, family, favoriteCodes]);

  if (catalogue.status === 'loading' && !catalogue.data) return <LoadingState />;
  if (catalogue.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={catalogue.reload} />;
  const families = catalogue.data.familles.filter((key) => family === ALL || family === FAVORITES || key === family);
  // « Mes favoris » in head of the whole catalogue, when there are some and no
  // search narrows the list.
  const favoriteTools = family === ALL && !query.trim() ? tools.filter((tool) => favoriteCodes.includes(tool.code)) : [];
  const card = (tool) => <ToolCard key={tool.code} tool={tool} label={label(tool)} favorite={isFavorite(tool.code)} onToggle={() => toggleFavorite(tool.code)} />;

  return (
    <>
      <PageHeader icon={Wrench} title={t('toolsCatalogue.title')} subtitle={t('toolsCatalogue.intro')} />

      <Section>
        <div className="tools-filters">
          <label className="tools-search">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">{t('toolsCatalogue.search')}</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('toolsCatalogue.search')} />
          </label>
          <div className="tools-families" role="group" aria-label={t('toolsCatalogue.families')}>
            {[ALL, FAVORITES, ...catalogue.data.familles].map((key) => (
              <button key={key} type="button" className="tools-family" aria-pressed={family === key} onClick={() => setFamily(key)}>
                {t(`toolsCatalogue.family.${key}`)}
              </button>
            ))}
          </div>
        </div>

        {favoriteError && (
          <p className="form-error" role="alert">
            {t('toolsCatalogue.favoriteError')}
          </p>
        )}

        {favoriteTools.length > 0 && (
          <section className="tools-group tools-favorites" aria-labelledby="tools-favorites">
            <h2 id="tools-favorites">
              <Star size={18} aria-hidden="true" /> {t('toolsCatalogue.myFavorites')}
            </h2>
            <ul className="tools-list">{favoriteTools.map(card)}</ul>
          </section>
        )}

        <p className="tools-count" aria-live="polite">
          {t('toolsCatalogue.count', { count: shown.length })}
        </p>

        {families.map((key) => {
          const inFamily = shown.filter((tool) => tool.family === key);
          if (inFamily.length === 0) return null;
          return (
            <section key={key} className="tools-group" aria-labelledby={`tools-family-${key}`}>
              <h2 id={`tools-family-${key}`}>{t(`toolsCatalogue.family.${key}`)}</h2>
              <ul className="tools-list">
                {inFamily.map(card)}
              </ul>
            </section>
          );
        })}
        {shown.length === 0 && <p className="tools-empty">{t(family === FAVORITES && favoriteCodes.length === 0 ? 'toolsCatalogue.noFavorite' : 'toolsCatalogue.empty')}</p>}
      </Section>
    </>
  );
}

// One tool: its name, its code and formulas, where it opens, and its star.
function ToolCard({ tool, label, favorite, onToggle }) {
  const { t } = useTranslation();
  return (
    <li className="tools-item">
      <div className="tools-item-head">
        <Calculator size={16} aria-hidden="true" />
        <strong>{label}</strong>
        <button
          type="button"
          className={favorite ? 'tools-star tools-star-on' : 'tools-star'}
          aria-pressed={favorite}
          aria-label={t(favorite ? 'toolsCatalogue.unfavorite' : 'toolsCatalogue.favorite', { name: label })}
          title={t(favorite ? 'toolsCatalogue.unfavorite' : 'toolsCatalogue.favorite', { name: label })}
          onClick={onToggle}
        >
          <Star size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="tools-item-meta">
        <span>{tool.code}</span>
        {tool.formulas && <span>{t('toolsCatalogue.formulas', { formulas: tool.formulas })}</span>}
      </p>
      {tool.pending ? (
        <p className="tools-item-pending">{t('toolsCatalogue.pending')}</p>
      ) : (
        <div className="tools-item-actions">
          {tool.to && (
            <Button to={`/app${tool.to}`} variant="ghost" arrow>
              {tool.to.startsWith('/outils') ? t('toolsCatalogue.open') : t('toolsCatalogue.onMyData')}
            </Button>
          )}
          {tool.simulator && (
            <Button to={`/app${tool.simulator}`} variant="ghost" arrow>
              {t('toolsCatalogue.simulate')}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
