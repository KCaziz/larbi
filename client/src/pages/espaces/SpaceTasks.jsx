import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate, formatRatio } from '../../lib/format.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';

// The tasks of one space (P9-06): a module apart from the finances. Nothing here
// creates a movement, and the two figures (COL-F11, COL-F12) are read from the
// server and worded as findings, never as a mark given to anyone.
export default function SpaceTasks({ t, language, spaceId, members, run, feedback }) {
  const [month] = useState(() => new Date().toISOString().slice(0, 7));
  const tasks = useApi(`/fin/espaces/${spaceId}/taches`);
  const stats = useApi(`/fin/espaces/${spaceId}/taches-synthese?mois=${month}`);
  const references = useApi('/fin/espaces/references-taches');
  const [form, setForm] = useState({ title: '', category: 'household', assigneeId: members.find((m) => m.isMe)?.id ?? members[0]?.id ?? '', dueDate: '', priority: 'normal', weight: '1', recurrence: 'none' });

  if (tasks.status === 'loading' && !tasks.data) return <LoadingState />;
  if (tasks.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={tasks.reload} />;
  const nameOf = (id) => members.find((m) => m.id === id)?.name ?? '—';
  const reload = () => {
    tasks.reload();
    stats.reload();
  };
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    const outcome = await run(
      () =>
        api.post(`/fin/espaces/${spaceId}/taches`, {
          title: form.title.trim(),
          category: form.category,
          assigneeId: form.assigneeId,
          priority: form.priority,
          weight: Number(form.weight),
          recurrence: form.recurrence,
          ...(form.dueDate ? { dueDate: new Date(form.dueDate).toISOString() } : {}),
        }),
      'spaces.tasks.created',
    );
    if (outcome.ok) {
      setForm({ ...form, title: '', dueDate: '' });
      reload();
    }
  }

  const open = tasks.data.tasks.filter((task) => task.status === 'todo' || task.status === 'doing');
  const closed = tasks.data.tasks.filter((task) => task.status === 'done' || task.status === 'cancelled');
  const finished = stats.data?.synthese.tauxTerminees;

  const row = (task) => (
    <li key={task.id} className="spaces-row">
      <div className="spaces-open" style={{ cursor: 'default' }}>
        <span className="spaces-row-label">{task.title}</span>
        <span className="spaces-tag">{t(`spaces.tasks.categories.${task.category}`)}</span>
        <span className="spaces-tag">{nameOf(task.assigneeId)}</span>
        {task.dueDate && <span className="spaces-row-date">{formatDate(language, task.dueDate)}</span>}
        {task.priority !== 'normal' && <span className="spaces-tag">{t(`spaces.tasks.priorities.${task.priority}`)}</span>}
        <span className="spaces-tag">{t(`spaces.tasks.statuses.${task.status}`)}</span>
        {(task.status === 'todo' || task.status === 'doing') && (
          <button
            type="button"
            className="spaces-icon"
            onClick={async () => {
              const outcome = await run(() => api.post(`/fin/espaces/${spaceId}/taches/${task.id}/terminer`, {}), 'spaces.tasks.finished');
              if (outcome.ok) reload();
            }}
            aria-label={t('spaces.tasks.finish')}
          >
            <Check size={15} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className="spaces-icon"
          onClick={async () => {
            if (!window.confirm(t('spaces.tasks.deleteConfirm'))) return;
            const outcome = await run(() => api.delete(`/fin/espaces/${spaceId}/taches/${task.id}`), 'spaces.tasks.deleted');
            if (outcome.ok) reload();
          }}
          aria-label={t('spaces.tasks.delete')}
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>
    </li>
  );

  return (
    <>
      {feedback}
      <h2>{t('spaces.tasks.title')}</h2>
      <p className="spaces-help">{t('spaces.tasks.intro')}</p>

      {/* A finding, not a mark: what the group has done and how the load is spread. */}
      {stats.data && (
        <section aria-labelledby="tasks-stats">
          <h3 id="tasks-stats">{t('spaces.tasks.statsTitle')}</h3>
          <p className="spaces-help">
            {finished?.resultat === null || finished === undefined ? t('spaces.tasks.noStats') : t('spaces.tasks.finishedRate', { rate: formatRatio(language, finished.resultat) })}
          </p>
          {stats.data.synthese.charge.some((row) => row.charge.resultat !== null) && (
            <ul className="spaces-members">
              {stats.data.synthese.charge.map((row) => (
                <li key={row.memberId} className="spaces-member">
                  <span className="spaces-member-name">{row.name}</span>
                  <span>{row.charge.resultat === null ? t('fincludia.notComputed') : t('spaces.tasks.load', { share: formatRatio(language, row.charge.resultat), count: row.tasks })}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <form className="spaces-form" onSubmit={submit}>
        <div className="spaces-form-grid">
          <label htmlFor="task-title">
            {t('spaces.tasks.fields.title')}
            <input id="task-title" type="text" value={form.title} onChange={set('title')} required maxLength={120} />
          </label>
          <label htmlFor="task-category">
            {t('spaces.tasks.fields.category')}
            <select id="task-category" value={form.category} onChange={set('category')}>
              {(references.data?.categories ?? ['household']).map((key) => (
                <option key={key} value={key}>
                  {t(`spaces.tasks.categories.${key}`)}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="task-assignee">
            {t('spaces.tasks.fields.assignee')}
            <select id="task-assignee" value={form.assigneeId} onChange={set('assigneeId')}>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="task-due">
            {t('spaces.tasks.fields.dueDate')}
            <input id="task-due" type="date" value={form.dueDate} onChange={set('dueDate')} />
          </label>
          <label htmlFor="task-priority">
            {t('spaces.tasks.fields.priority')}
            <select id="task-priority" value={form.priority} onChange={set('priority')}>
              {(references.data?.priorities ?? ['normal']).map((key) => (
                <option key={key} value={key}>
                  {t(`spaces.tasks.priorities.${key}`)}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="task-weight">
            {t('spaces.tasks.fields.weight')}
            <select id="task-weight" value={form.weight} onChange={set('weight')}>
              {[1, 2, 3].map((weight) => (
                <option key={weight} value={weight}>
                  {weight}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="task-recurrence">
            {t('spaces.tasks.fields.recurrence')}
            <select id="task-recurrence" value={form.recurrence} onChange={set('recurrence')}>
              {(references.data?.recurrences ?? ['none']).map((key) => (
                <option key={key} value={key}>
                  {t(`spaces.tasks.recurrences.${key}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="spaces-actions">
          <Button type="submit" disabled={form.recurrence !== 'none' && !form.dueDate}>
            {t('spaces.tasks.add')}
          </Button>
        </div>
        {form.recurrence !== 'none' && !form.dueDate && <p className="spaces-help">{t('spaces.tasks.recurrenceNeedsDate')}</p>}
      </form>

      {open.length === 0 ? <p className="spaces-empty">{t('spaces.tasks.none')}</p> : <ul className="spaces-list">{open.map(row)}</ul>}
      {closed.length > 0 && (
        <details>
          <summary>{t('spaces.tasks.closed', { count: closed.length })}</summary>
          <ul className="spaces-list">{closed.map(row)}</ul>
        </details>
      )}
    </>
  );
}
