import { useState } from 'react';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';

const TYPES = ['bills', 'tasks', 'settlements', 'goals'];

// The unified calendar of a space (P9-07): bills, tasks, settlements and common
// goals on one timeline, filterable. A read — nothing here creates anything. A
// planned bill reads « prévue » until it is confirmed.
export default function SpaceCalendar({ t, language, spaceId, members }) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [shown, setShown] = useState(TYPES);
  const calendar = useApi(`/fin/espaces/${spaceId}/calendrier?mois=${month}&types=${shown.length > 0 ? shown.join(',') : TYPES.join(',')}`);
  const nameOf = (id) => members.find((member) => member.id === id)?.name ?? '—';

  const toggle = (type) => setShown(shown.includes(type) ? shown.filter((item) => item !== type) : [...shown, type]);

  let body;
  if (calendar.status === 'loading' && !calendar.data) body = <LoadingState />;
  else if (calendar.status === 'error') body = <ErrorState message={t('state.loadError')} onRetry={calendar.reload} />;
  else if (shown.length === 0 || calendar.data.calendrier.events.length === 0) body = <p className="spaces-empty">{t('spaces.calendar.none')}</p>;
  else {
    const { events, currency } = calendar.data.calendrier;
    body = (
      <ul className="spaces-list">
        {events.map((event) => (
          <li key={`${event.type}-${event.id}`} className="spaces-row">
            <div className="spaces-open" style={{ cursor: 'default' }}>
              <span className="spaces-row-date">{formatDate(language, event.date)}</span>
              <span className="spaces-tag">{t(`spaces.calendar.types.${event.type}`)}</span>
              <span className="spaces-row-label">
                {event.type === 'settlements' ? t('spaces.calendar.settlement', { from: nameOf(event.fromId), to: nameOf(event.toId) }) : event.title}
              </span>
              {event.amount !== undefined && <span className="spaces-tag">{formatAmount(language, event.amount, event.currency ?? currency)}</span>}
              <span className="spaces-tag">{t(`spaces.calendar.status.${event.type}.${event.status}`, { defaultValue: event.status })}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <h2>{t('spaces.calendar.title')}</h2>
      <p className="spaces-help">{t('spaces.calendar.intro')}</p>
      <label htmlFor="space-calendar-month">
        {t('spaces.budgets.month')}
        <input id="space-calendar-month" type="month" value={month} onChange={(event) => event.target.value && setMonth(event.target.value)} />
      </label>
      <fieldset>
        <legend>{t('spaces.calendar.filter')}</legend>
        {TYPES.map((type) => (
          <label key={type} htmlFor={`calendar-type-${type}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginInlineEnd: '16px' }}>
            <input id={`calendar-type-${type}`} type="checkbox" checked={shown.includes(type)} onChange={() => toggle(type)} />
            {t(`spaces.calendar.types.${type}`)}
          </label>
        ))}
      </fieldset>
      {body}
    </>
  );
}
