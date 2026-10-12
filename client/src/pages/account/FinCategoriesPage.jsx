import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, History, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';
import './FinCategories.css';

// "Mes catégories" (P6-02): the client's own category reference (onglet
// "03_Categories", 91 standard categories in 8 families), what this account
// renamed or hid in it, and the categories it added. Every family keeps its
// "Autre", so nothing has to be forced into a category that does not fit.
//
// The reference itself is never modified: renaming a standard category records
// this account's own label for it, and the client's wording stays shown next to
// it. Nothing is deleted outright either — a category leaves the list and stays
// readable by whatever already used it.
export default function FinCategoriesPage() {
  const { t } = useTranslation();
  const [includeArchived, setIncludeArchived] = useState(false);
  const groups = useApi(`/fin/categories?${includeArchived ? 'includeArchived=true' : ''}`);
  const [message, setMessage] = useState(null);
  const [openHistory, setOpenHistory] = useState(null);

  // Runs one write, then reloads. The message lives on the PAGE, not inside a
  // row: reloading replaces the rows, and a confirmation held by one would be
  // unmounted before anyone could read it.
  async function run(action, okKey) {
    setMessage(null);
    try {
      const data = await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      groups.reload();
      return { ok: true, data };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 409: 'finCategories.errors.labelTaken', 422: 'finCategories.errors.tooMany' })) });
      return { ok: false };
    }
  }

  // Only the first load replaces the page: a reload after a write keeps what is
  // on screen instead of flashing it away.
  if (groups.status === 'loading' && !groups.data) return <LoadingState />;
  if (groups.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={groups.reload} />;

  return (
    <div>
      <h2 className="account-heading">{t('finCategories.title')}</h2>
      <p>{t('finCategories.intro')}</p>
      <Notice variant="info">{t('finCategories.referenceNote')}</Notice>

      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
          {message.text}
        </p>
      )}

      <label className="fincat-archived">
        <input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} />
        {t('finCategories.showArchived')}
      </label>

      {groups.data.groups.map((group) => (
        <FamilySection
          key={group.code}
          group={group}
          openHistory={openHistory}
          onToggleHistory={(id) => setOpenHistory((current) => (current === id ? null : id))}
          run={run}
        />
      ))}
    </div>
  );
}

function FamilySection({ group, openHistory, onToggleHistory, run }) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');

  const add = async (event) => {
    event.preventDefault();
    const res = await run(() => api.post('/fin/categories', { family: group.code, label: label.trim() }), 'finCategories.created');
    if (res.ok) {
      setLabel('');
      setAdding(false);
    }
  };

  return (
    <section className="fincat-family">
      <h3>
        {/* The family name is the client's own wording, like the category
            labels: reference data, not interface text, so it is not translated. */}
        {group.label} <span className="fincat-count">{t('finCategories.count', { count: group.categories.length })}</span>
      </h3>

      <ul className="fincat-list">
        {group.categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            historyOpen={openHistory === category.id}
            onToggleHistory={() => onToggleHistory(category.id)}
            run={run}
          />
        ))}
      </ul>

      {adding ? (
        <form className="fincat-add" onSubmit={add}>
          <label className="sr-only" htmlFor={`fincat-new-${group.code}`}>
            {t('finCategories.newLabel')}
          </label>
          <input
            id={`fincat-new-${group.code}`}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            maxLength={80}
            placeholder={t('finCategories.newPlaceholder')}
            required
          />
          <Button type="submit">{t('finCategories.save')}</Button>
          <button type="button" className="fincat-plain" onClick={() => setAdding(false)}>
            {t('finCategories.cancel')}
          </button>
        </form>
      ) : (
        <button type="button" className="fincat-plain fincat-add-open" onClick={() => setAdding(true)}>
          <Plus size={15} aria-hidden="true" /> {t('finCategories.add')}
        </button>
      )}
    </section>
  );
}

function CategoryRow({ category, historyOpen, onToggleHistory, run }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(category.label);
  const standard = category.origin === 'standard';
  // A standard category is customised by key (this account's own label for it);
  // one the person created is changed by its id.
  const path = standard ? `/fin/categories/standard/${category.key}` : `/fin/categories/${category.id}`;

  const save = async (event) => {
    event.preventDefault();
    const res = await run(() => api.patch(path, { label: label.trim() }), 'finCategories.saved');
    if (res.ok) setEditing(false);
  };

  const setArchived = (archived) =>
    run(
      () => (standard ? api.patch(path, { hidden: archived }) : api.put(`${path}/archive`, { archived })),
      archived ? 'finCategories.archived' : 'finCategories.restored',
    );

  return (
    <li className={category.archived ? 'fincat-row fincat-archived-row' : 'fincat-row'}>
      {editing ? (
        <form className="fincat-edit" onSubmit={save}>
          <label className="sr-only" htmlFor={`fincat-edit-${category.id}`}>
            {t('finCategories.renameLabel')}
          </label>
          <input id={`fincat-edit-${category.id}`} value={label} onChange={(event) => setLabel(event.target.value)} maxLength={80} required />
          <button type="submit" className="fincat-icon" title={t('finCategories.save')}>
            <Check size={16} aria-hidden="true" />
            <span className="sr-only">{t('finCategories.save')}</span>
          </button>
          <button
            type="button"
            className="fincat-icon"
            title={t('finCategories.cancel')}
            onClick={() => {
              setLabel(category.label);
              setEditing(false);
            }}
          >
            <X size={16} aria-hidden="true" />
            <span className="sr-only">{t('finCategories.cancel')}</span>
          </button>
        </form>
      ) : (
        <>
          <span className="fincat-label">{category.label}</span>
          <span className="fincat-tags">
            <span className="fincat-tag">{t(`finCategories.origin.${category.origin}`)}</span>
            {/* The client's own wording, kept visible under the person's label:
                a standard category must stay findable under its reference name. */}
            {category.reference && <span className="fincat-tag">{t('finCategories.wasCalled', { label: category.reference })}</span>}
            {category.scope !== 'personal' && <span className="fincat-tag">{t(`finCategories.scopes.${category.scope}`)}</span>}
            {category.archived && <span className="fincat-tag fincat-tag-archived">{t('finCategories.archivedTag')}</span>}
          </span>

          <span className="fincat-actions">
            <button type="button" className="fincat-icon" title={t('finCategories.rename')} onClick={() => setEditing(true)}>
              <Pencil size={15} aria-hidden="true" />
              <span className="sr-only">{t('finCategories.rename')}</span>
            </button>

            {category.archived ? (
              <button type="button" className="fincat-plain" onClick={() => setArchived(false)}>
                {t('finCategories.restore')}
              </button>
            ) : (
              <button type="button" className="fincat-plain" onClick={() => setArchived(true)}>
                {t(standard ? 'finCategories.hide' : 'finCategories.archive')}
              </button>
            )}

            {/* Back to the client's reference: the account's customisation goes,
                the standard label and visibility come back. */}
            {standard && category.customised && (
              <button type="button" className="fincat-icon" title={t('finCategories.reset')} onClick={() => run(() => api.delete(path), 'finCategories.resetDone')}>
                <RotateCcw size={15} aria-hidden="true" />
                <span className="sr-only">{t('finCategories.reset')}</span>
              </button>
            )}

            {!standard && (
              <button type="button" className="fincat-icon" title={t('finCategories.delete')} onClick={() => run(() => api.delete(path), 'finCategories.deleted')}>
                <Trash2 size={15} aria-hidden="true" />
                <span className="sr-only">{t('finCategories.delete')}</span>
              </button>
            )}

            {/* Only a row this account owns has a trail to read: a standard
                category nobody touched has no history of its own. */}
            {(!standard || category.customised) && (
              <button type="button" className="fincat-icon" title={t('finCategories.history')} onClick={onToggleHistory} aria-expanded={historyOpen}>
                <History size={15} aria-hidden="true" />
                <span className="sr-only">{t('finCategories.history')}</span>
              </button>
            )}
          </span>
        </>
      )}

      {historyOpen && <CategoryHistory id={category.id} />}
    </li>
  );
}

// The correction trail of one category: what changed, when, and the reason if
// the person wrote one down.
function CategoryHistory({ id }) {
  const { t, i18n } = useTranslation();
  const history = useApi(`/fin/categories/${id}/historique`);

  if (history.status === 'loading') return <p className="fincat-history">{t('state.loading')}</p>;
  if (history.status === 'error') return <p className="fincat-history">{t('state.loadError')}</p>;

  const changes = history.data.changes;
  if (changes.length === 0) return <p className="fincat-history">{t('finCategories.noHistory')}</p>;

  const shown = (value) => {
    if (value === null || value === undefined) return t('finCategories.nothing');
    if (Array.isArray(value)) return value.length === 0 ? t('finCategories.nothing') : value.map((use) => t(`finCategories.uses.${use}`)).join(', ');
    if (typeof value === 'object') return t('finCategories.created');
    return String(value);
  };

  return (
    <ol className="fincat-history">
      {changes.map((change) => (
        <li key={change.id}>
          <span className="fincat-history-when">{formatDate(i18n.language, change.createdAt)}</span>{' '}
          {change.field
            ? t('finCategories.historyField', { field: t(`finCategories.fields.${change.field}`, { defaultValue: change.field }), before: shown(change.before), after: shown(change.after) })
            : t(`finCategories.actions.${change.action}`)}
          {change.reason && <span className="fincat-history-reason"> — {change.reason}</span>}
        </li>
      ))}
    </ol>
  );
}
