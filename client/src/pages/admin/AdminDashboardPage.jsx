import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Newspaper, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../lib/format.js';
import { useApi } from '../../lib/useApi.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import PageToolbar from '../../components/cms/PageToolbar.jsx';
import StatusBadge from '../../components/cms/StatusBadge.jsx';
import './AdminDashboard.css';

// Home of the administration: what exists, what waits for a review, and what still misses
// something before it can be published. The numbers come from the server.
function Stat({ icon: Icon, label, value, to }) {
  const inner = (
    <>
      <span className="dash-stat-icon" aria-hidden="true">
        <Icon size={20} strokeWidth={1.7} />
      </span>
      <span className="dash-stat-value">{value}</span>
      <span className="dash-stat-label">{label}</span>
    </>
  );
  return to ? (
    <Link to={to} className="dash-stat">
      {inner}
    </Link>
  ) : (
    <div className="dash-stat">{inner}</div>
  );
}

function RecentList({ title, items, editPath, readinessPrefix, statusLabel }) {
  const { t, i18n } = useTranslation();
  return (
    <section className="cms-card" aria-labelledby={`recent-${readinessPrefix}`}>
      <h2 id={`recent-${readinessPrefix}`}>{title}</h2>
      {items.length === 0 ? (
        <p className="cms-muted">{t('admin.dashboard.nothing')}</p>
      ) : (
        <ul className="dash-list">
          {items.map((item) => (
            <li key={item.id}>
              <Link to={editPath(item)} className="dash-list-title">
                {item.title}
              </Link>
              <StatusBadge status={item.status} labelKey={statusLabel?.(item.status)} />
              <span className="cms-muted">{formatDate(i18n.language, item.updatedAt)}</span>
              {item.missing.length > 0 && item.status !== 'published' && (
                <span className="dash-missing">
                  {t('admin.dashboard.toComplete', { count: item.missing.length })}
                  <span className="sr-only">{item.missing.map((key) => t(`${readinessPrefix}.${key}`)).join(', ')}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { status, data, reload } = useApi('/admin/dashboard');

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') return <ErrorState message={t('admin.dashboard.loadError')} onRetry={reload} />;

  const f = data.formations.byStatus;
  const a = data.articles.byStatus;
  const inReview = data.recentFormations.filter((item) => item.status === 'in_review');

  return (
    <>
      <PageToolbar title={t('admin.dashboard.title')} subtitle={t('admin.dashboard.subtitle')}>
        <Button to="/admin/formations" variant="secondary">{t('admin.dashboard.newFormation')}</Button>
        <Button to="/admin/articles" variant="secondary">
          {t('admin.dashboard.newArticle')}
        </Button>
      </PageToolbar>

      <div className="dash-stats">
        <Stat icon={GraduationCap} label={t('admin.dashboard.formationsPublished')} value={f.published} to="/admin/formations" />
        <Stat icon={GraduationCap} label={t('admin.status.in_review')} value={f.in_review} to="/admin/formations" />
        <Stat icon={GraduationCap} label={t('admin.status.draft')} value={f.draft} to="/admin/formations" />
        <Stat icon={GraduationCap} label={t('admin.status.archived')} value={f.archived} to="/admin/formations" />
        <Stat icon={Newspaper} label={t('admin.dashboard.articlesPublished')} value={a.published} to="/admin/articles" />
        <Stat icon={Newspaper} label={t('admin.dashboard.articlesDraft')} value={a.draft} to="/admin/articles" />
        <Stat icon={Users} label={t('admin.dashboard.enrollments')} value={data.learning.enrollments} />
        <Stat icon={Users} label={t('admin.dashboard.completed')} value={data.learning.completed} />
        <Stat icon={Mail} label={t('admin.dashboard.subscribers')} value={data.newsletter.confirmed} to="/admin/newsletter" />
      </div>

      <section className="cms-card" aria-labelledby="review-title">
        <h2 id="review-title">{t('admin.dashboard.review')}</h2>
        {inReview.length === 0 ? (
          <p className="cms-muted">{t('admin.dashboard.reviewEmpty')}</p>
        ) : (
          <ul className="dash-list">
            {inReview.map((item) => (
              <li key={item.id}>
                <Link to={`/admin/formations/${item.id}`} className="dash-list-title">
                  {item.title}
                </Link>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="dash-columns">
        <RecentList
          title={t('admin.dashboard.recentFormations')}
          items={data.recentFormations}
          editPath={(item) => `/admin/formations/${item.id}`}
          readinessPrefix="admin.readiness"
        />
        <RecentList
          title={t('admin.dashboard.recentArticles')}
          items={data.recentArticles}
          editPath={(item) => `/admin/articles/${item.id}`}
          readinessPrefix="admin.articles.readiness"
          statusLabel={(s) => `admin.articles.status.${s}`}
        />
      </div>
    </>
  );
}
