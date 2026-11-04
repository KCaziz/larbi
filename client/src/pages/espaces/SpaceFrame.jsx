import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import '../../components/fincludia/Fincludia.css';
import './Spaces.css';

// What every page of ONE space shares (P9-02): its title, the way back to the
// list, and the compartments of that space — a page per compartment, each with
// its own address (`/partage/:id/...`). The vocabulary follows the kind of
// space: the household has its extra compartment, a couple does not.
export const SPACE_SECTIONS = [
  { to: '', key: 'dashboard', end: true },
  { to: 'depenses', key: 'expenses' },
  { to: 'budgets', key: 'budgets' },
  { to: 'ressources', key: 'pot' },
  { to: 'taches', key: 'tasks' },
  { to: 'calendrier', key: 'calendar' },
  { to: 'objectifs', key: 'goals' },
  { to: 'foyer', key: 'household', kinds: ['household'] },
  { to: 'rapport', key: 'report' },
  { to: 'membres', key: 'members' },
];

export default function SpaceFrame({ spaceId, children }) {
  const { t, i18n } = useTranslation();
  const detail = useApi(`/fin/espaces/${spaceId}`);

  if (detail.status === 'loading' && !detail.data) return <LoadingState />;
  if (detail.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={detail.reload} />;
  const data = detail.data;

  return (
    <>
      <PageHeader back={{ to: '/partage', label: t('shared.backToSpaces') }} icon={Users} title={data.space.label} subtitle={t(`spaces.kinds.${data.space.kind}`)} maxWidth={1040} />
      <div className="spaces-page">
        {/* A closed space is read-only (P9-03): said first, so no form fails by surprise. */}
        {data.space.closedAt && (
          <p className="spaces-rule" role="status">
            {t('shared.closedBanner', { date: formatDate(i18n.language, data.space.closedAt) })}
          </p>
        )}
        <nav className="space-nav" aria-label={t('shared.spaceMenu')}>
          {SPACE_SECTIONS.filter((section) => !section.kinds || section.kinds.includes(data.space.kind)).map((section) => (
            <NavLink key={section.key} to={`/partage/${spaceId}${section.to ? `/${section.to}` : ''}`} end={section.end} className="space-nav-link">
              {t(`shared.sections.${section.key}`)}
            </NavLink>
          ))}
        </nav>
        {children(data, detail.reload)}
      </div>
    </>
  );
}
