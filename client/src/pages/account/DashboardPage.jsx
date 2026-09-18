import { useTranslation } from 'react-i18next';
import '../Pages.css';

const widgets = [
  { key: 'coursesInProgress', icon: '📚', tone: 'tone-violet' },
  { key: 'certificates', icon: '🎓', tone: 'tone-amber' },
  { key: 'recentArticles', icon: '📰', tone: 'tone-blue' },
];

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="account-heading">{t('account.dashboard.title')}</h2>
      <p>{t('account.dashboard.intro')}</p>
      <div className="skeleton-grid">
        {widgets.map((widget) => (
          <div className={`skeleton-item ${widget.tone}`} key={widget.key}>
            <span className="icon-badge" aria-hidden="true">
              {widget.icon}
            </span>
            <div>
              <div className="label">{t(`account.dashboard.widgets.${widget.key}`)}</div>
              <div className="value">—</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
