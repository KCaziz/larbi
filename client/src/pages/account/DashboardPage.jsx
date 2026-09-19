import { BookOpenText, GraduationCap, Newspaper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import '../Pages.css';

// Real numbers come from the server. Articles have no reading history yet, so
// that widget stays empty ("—") until the blog module exists.
const widgets = [
  { key: 'coursesInProgress', icon: BookOpenText, tone: 'tone-primary' },
  { key: 'certificates', icon: GraduationCap, tone: 'tone-brass' },
  { key: 'recentArticles', icon: Newspaper, tone: 'tone-blue' },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { status, data } = useApi('/learn/enrollments');

  const values = {
    coursesInProgress: status === 'ready' ? data.formations.filter((f) => f.enrollment?.status === 'active').length : '—',
    certificates: status === 'ready' ? data.formations.filter((f) => f.enrollment?.certification).length : '—',
    recentArticles: '—',
  };

  return (
    <div>
      <h2 className="account-heading">{t('account.dashboard.title')}</h2>
      <p>{t('account.dashboard.intro')}</p>
      <div className="skeleton-grid">
        {widgets.map(({ key, icon: Icon, tone }) => (
          <div className={`skeleton-item ${tone}`} key={key}>
            <span className="icon-badge" aria-hidden="true">
              <Icon size={22} strokeWidth={1.6} />
            </span>
            <div>
              <div className="label">{t(`account.dashboard.widgets.${key}`)}</div>
              <div className="value">{values[key]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
