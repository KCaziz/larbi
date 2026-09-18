import { useTranslation } from 'react-i18next';
import '../Pages.css';

export default function DashboardPage() {
  const { t } = useTranslation();
  const widgets = [
    t('account.dashboard.widgets.coursesInProgress'),
    t('account.dashboard.widgets.certificates'),
    t('account.dashboard.widgets.recentArticles'),
  ];

  return (
    <div>
      <h1>{t('account.dashboard.title')}</h1>
      <p>{t('account.dashboard.intro')}</p>
      <div className="skeleton-grid">
        {widgets.map((label) => (
          <div className="skeleton-item" key={label}>
            <div className="label">{label}</div>
            <div className="value">—</div>
          </div>
        ))}
      </div>
    </div>
  );
}
