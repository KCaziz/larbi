import { Award, BookOpenText, GraduationCap, Newspaper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/useAuth.js';
import { accountTypeLabel, useAccountTypes } from '../../lib/accountTypes.js';
import { withLang } from '../../lib/contentLanguage.js';
import { useApi } from '../../lib/useApi.js';
import Button from '../../components/ui/Button.jsx';
import FormationCard from '../../components/learn/FormationCard.jsx';
import ArticleCard from '../../components/blog/ArticleCard.jsx';
import '../learn/Learn.css';
import '../learn/Certificate.css';
import '../../components/blog/Blog.css';
import '../Pages.css';

// Dashboard personalised by profile (P2-03 / P3-16): the user's own information,
// their formations and progress, their certificates (never a revoked one), and
// articles chosen for their account type (P3-04) — everything real, nothing
// invented; a widget with no data yet simply does not show its section.
export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const accountTypes = useAccountTypes();
  const enrollments = useApi('/learn/enrollments');
  const certificates = useApi('/learn/certificates');
  const recommended = useApi(withLang('/blog/recommendations', i18n.language));

  const formations = enrollments.status === 'ready' ? enrollments.data.formations : [];
  const inProgress = formations.filter((f) => f.enrollment?.status === 'active');
  const activeCertificates = certificates.status === 'ready' ? certificates.data.certificates.filter((c) => !c.revoked) : [];
  const myType = accountTypes.types.find((x) => x.value === user.accountType);

  const widgets = [
    { key: 'coursesInProgress', icon: BookOpenText, tone: 'tone-primary', value: enrollments.status === 'ready' ? inProgress.length : '—' },
    { key: 'certificates', icon: GraduationCap, tone: 'tone-brass', value: certificates.status === 'ready' ? activeCertificates.length : '—' },
    { key: 'recentArticles', icon: Newspaper, tone: 'tone-blue', value: recommended.status === 'ready' ? recommended.data.articles.length : '—' },
  ];

  return (
    <div>
      <h2 className="account-heading">{t('account.dashboard.title')}</h2>
      <p>{t('account.dashboard.intro')}</p>

      <div className="dashboard-profile">
        <div>
          <p className="dashboard-profile-name">{user.name}</p>
          <p className="dashboard-profile-email">{user.email}</p>
        </div>
        <div className="dashboard-profile-tags">
          <span className="cms-badge cms-badge-published">{myType ? accountTypeLabel(myType) : user.accountType}</span>
          <span className={`cms-badge ${user.accessLevel === 'premium' ? 'cms-badge-review' : 'cms-badge-archived'}`}>
            {t(user.accessLevel === 'premium' ? 'account.premium.activeTitle' : 'account.premium.lockedTitle')}
          </span>
        </div>
        <Button to="/compte/profil" variant="secondary">
          {t('account.dashboard.editProfile')}
        </Button>
      </div>

      <div className="skeleton-grid">
        {widgets.map(({ key, icon: Icon, tone, value }) => (
          <div className={`skeleton-item ${tone}`} key={key}>
            <span className="icon-badge" aria-hidden="true">
              <Icon size={22} strokeWidth={1.6} />
            </span>
            <div>
              <div className="label">{t(`account.dashboard.widgets.${key}`)}</div>
              <div className="value">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {formations.length > 0 && (
        <section className="dashboard-section">
          <div className="dashboard-section-head">
            <h3>{t('account.dashboard.myFormations')}</h3>
            <Button to="/compte/formations" variant="secondary">
              {t('account.dashboard.seeAll')}
            </Button>
          </div>
          <div className="learn-grid">
            {formations.slice(0, 3).map((item) => (
              <FormationCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      )}

      {activeCertificates.length > 0 && (
        <section className="dashboard-section">
          <div className="dashboard-section-head">
            <h3>{t('account.dashboard.myCertificates')}</h3>
            <Button to="/compte/certificats" variant="secondary">
              {t('account.dashboard.seeAll')}
            </Button>
          </div>
          <div className="certificate-list">
            {activeCertificates.slice(0, 3).map((c) => (
              <article className="certificate-card" key={c.certificateNumber}>
                <Award size={22} strokeWidth={1.6} aria-hidden="true" />
                <h3>{c.certificationTitle}</h3>
                <p>{c.formationTitle}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {recommended.status === 'ready' && recommended.data.articles.length > 0 && (
        <section className="dashboard-section">
          <div className="dashboard-section-head">
            <h3>{t(recommended.data.personalised ? 'account.dashboard.forYourProfile' : 'account.dashboard.latestArticles')}</h3>
            <Button to="/blog" variant="secondary">
              {t('account.dashboard.seeAll')}
            </Button>
          </div>
          <div className="blog-grid">
            {recommended.data.articles.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-section">
        <div className="dashboard-section-head">
          <h3>{t('account.dashboard.tools')}</h3>
        </div>
        <p>{t('account.dashboard.toolsIntro')}</p>
        <Button to="/outils" variant="secondary" arrow>
          {t('account.dashboard.toolsLink')}
        </Button>
      </section>
    </div>
  );
}
