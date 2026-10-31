import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';

// The recent activity of a space (P9-09): what the space holds in common, newest
// first. The same for every member; it never shows a personal account.
export default function SpaceActivity({ t, language, spaceId }) {
  const activity = useApi(`/fin/espaces/${spaceId}/activite?limite=10`);
  if (!activity.data) return null;
  const rows = activity.data.activity;
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="space-activity">
      <h3 id="space-activity">{t('spaces.activity.title')}</h3>
      <ul className="spaces-list">
        {rows.map((row) => (
          <li key={`${row.type}-${row.id}`} className="spaces-row">
            <div className="spaces-open" style={{ cursor: 'default' }}>
              <span className="spaces-row-date">{formatDate(language, row.at)}</span>
              <span className="spaces-row-label">
                {t(`spaces.activity.${row.type}`, { actor: row.actor ?? '—', label: row.label ?? '', from: row.from ?? '', to: row.to ?? '', kind: row.kind ? t(`spaces.pot.kinds.${row.kind}`) : '' })}
              </span>
              {row.amount !== undefined && <span className="spaces-tag">{formatAmount(language, row.amount, row.currency)}</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
