import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Copy, Crown, Eye, Plus, Trash2, UserMinus } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import Button from '../../components/ui/Button.jsx';
import SpaceFrame from './SpaceFrame.jsx';
import SpaceBudgets from './SpaceBudgets.jsx';
import SpaceTasks from './SpaceTasks.jsx';
import SpaceCalendar from './SpaceCalendar.jsx';
import SpaceActivity from './SpaceActivity.jsx';
import SpacePot from './SpacePot.jsx';
import SpaceReport from './SpaceReport.jsx';
import SpaceOverview from './SpaceOverview.jsx';
import { CommonGoals, CoupleReview, FinancialAgreement, HouseholdExtras, HouseholdReview, SharedExpenses, SharedFigures, useSpaceRun } from './parts.jsx';

// One page per compartment of a space (P9-02). The components are those of the
// former single page, unchanged; what changes is that each lives at its own
// address and the page keeps its own message and reload.
export default function SpaceSection({ section }) {
  const { id } = useParams();
  const { t } = useTranslation();
  useDocumentMeta(t(`shared.sections.${section}`), t('spaces.intro'));
  return <SpaceFrame spaceId={id}>{(data, reload) => <Section section={section} spaceId={id} data={data} reload={reload} />}</SpaceFrame>;
}

function Section({ section, spaceId, data, reload }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [message, run] = useSpaceRun(reload);
  const space = data.space;
  const canAdmin = ['owner', 'admin'].includes(data.monRole);
  const feedback = message && (
    <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
      {message.text}
    </p>
  );

  if (section === 'expenses') {
    return <SharedExpenses t={t} language={language} spaceId={spaceId} space={space} members={data.membres} />;
  }
  if (section === 'report') {
    return <SpaceReport t={t} language={language} spaceId={spaceId} />;
  }
  if (section === 'pot') {
    return <SpacePot t={t} language={language} spaceId={spaceId} space={space} members={data.membres} canAdmin={canAdmin} run={run} feedback={feedback} />;
  }
  if (section === 'calendar') {
    return <SpaceCalendar t={t} language={language} spaceId={spaceId} members={data.membres} />;
  }
  if (section === 'tasks') {
    return <SpaceTasks t={t} language={language} spaceId={spaceId} members={data.membres} run={run} feedback={feedback} />;
  }
  if (section === 'budgets') {
    return <SpaceBudgets t={t} language={language} spaceId={spaceId} space={space} canEdit={canAdmin} run={run} feedback={feedback} />;
  }
  if (section === 'goals') {
    return <CommonGoals t={t} language={language} spaceId={spaceId} currency={space.currency} />;
  }
  if (section === 'household') {
    return <HouseholdExtras t={t} language={language} spaceId={spaceId} currency={space.currency} />;
  }
  if (section === 'members') {
    return <MembersSection t={t} language={language} spaceId={spaceId} data={data} canAdmin={canAdmin} run={run} feedback={feedback} />;
  }
  return <DashboardSection t={t} language={language} spaceId={spaceId} data={data} canAdmin={canAdmin} run={run} reload={reload} feedback={feedback} />;
}

// What the space says at a glance: what the members chose to share, the
// agreement, and the reading of the month for its kind. Nothing personal.
function DashboardSection({ t, language, spaceId, data, canAdmin, run, reload, feedback }) {
  const shared = useApi(`/fin/espaces/${spaceId}/partage`);
  const references = useApi('/fin/espaces/references');
  const space = data.space;
  const compartments = ['expenses', 'budgets', 'pot', 'tasks', 'calendar', 'goals', ...(space.kind === 'household' ? ['household'] : []), 'members'];
  const paths = { expenses: 'depenses', budgets: 'budgets', pot: 'ressources', tasks: 'taches', calendar: 'calendrier', goals: 'objectifs', household: 'foyer', members: 'membres' };
  return (
    <>
      {feedback}
      <SpaceOverview t={t} language={language} spaceId={spaceId} space={space} members={data.membres} />
      {shared.data && <SharedFigures t={t} partage={shared.data.partage} references={references.data} />}
      <FinancialAgreement t={t} spaceId={spaceId} note={space.note} canEdit={canAdmin} run={run} reload={reload} />
      {space.kind === 'couple' && <CoupleReview t={t} spaceId={spaceId} />}
      {space.kind === 'household' && <HouseholdReview t={t} language={language} spaceId={spaceId} currency={space.currency} />}
      <SpaceActivity t={t} language={language} spaceId={spaceId} />
      <section className="space-compartments" aria-label={t('shared.spaceMenu')}>
        {compartments.map((key) => (
          <Link key={key} to={`/partage/${spaceId}/${paths[key]}`} className="space-compartment">
            <h3>{t(`shared.sections.${key}`)}</h3>
          </Link>
        ))}
      </section>
    </>
  );
}

// MY matrix (the only sharing control, writing my own row), the members, the
// invitations — the token shown once — and leaving or deleting the space.
function MembersSection({ t, language, spaceId, data, canAdmin, run, feedback }) {
  const navigate = useNavigate();
  const references = useApi('/fin/espaces/references');
  const [token, setToken] = useState(null);
  const kinds = references.data?.shareableKinds ?? [];
  const levels = references.data?.sharingLevels ?? [];

  return (
    <>
      {feedback}
      <h2>{t('spaces.mySharingTitle')}</h2>
      <p className="spaces-help">{t('spaces.mySharingHelp')}</p>
      <ul className="spaces-matrix">
        {kinds.map((kind) => (
          <li key={kind}>
            <label htmlFor={`sharing-${spaceId}-${kind}`}>{t(`spaces.dataKinds.${kind}`)}</label>
            <select
              id={`sharing-${spaceId}-${kind}`}
              value={data.monPartage[kind] ?? 'private'}
              onChange={(event) => run(() => api.put(`/fin/espaces/${spaceId}/mon-partage`, { [kind]: event.target.value }), 'spaces.sharingSaved')}
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {t(`spaces.levels.${level}`)}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <h2>{t('spaces.membersTitle')}</h2>
      <ul className="spaces-members">
        {data.membres.map((member) => (
          <li key={member.id} className="spaces-member">
            <span className="spaces-member-name">
              {member.name}
              {member.isMe && <span className="spaces-tag">{t('spaces.me')}</span>}
            </span>
            <span className="spaces-tag">{t(`spaces.roles.${member.role}`)}</span>
            {/* What THEY share with ME, kind by kind — computed per reader. */}
            {!member.isMe && (
              <span className="spaces-member-shares">
                <Eye size={13} aria-hidden="true" />
                {kinds
                  .filter((kind) => member.sharing[kind] !== 'private')
                  .map((kind) => t(`spaces.dataKinds.${kind}`))
                  .join(', ') || t('spaces.sharesNothing')}
              </span>
            )}
            {/* Handing the space over (recette R2-02): only the owner, to a
                member still in the space. */}
            {data.monRole === 'owner' && !member.isMe && (
              <button
                type="button"
                className="spaces-plain spaces-transfer"
                onClick={() => {
                  if (window.confirm(t('spaces.transferConfirm', { name: member.name }))) run(() => api.post(`/fin/espaces/${spaceId}/membres/${member.id}/proprietaire`, {}), 'spaces.transferred');
                }}
              >
                <Crown size={14} aria-hidden="true" /> {t('spaces.transfer')}
              </button>
            )}
            {canAdmin && !member.isMe && member.role !== 'owner' && (
              <button
                type="button"
                className="spaces-icon"
                onClick={() => {
                  if (window.confirm(t('spaces.removeConfirm', { name: member.name }))) run(() => api.delete(`/fin/espaces/${spaceId}/membres/${member.id}`), 'spaces.removed');
                }}
                aria-label={t('spaces.remove', { name: member.name })}
              >
                <UserMinus size={15} aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {canAdmin && (
        <>
          <h2>{t('spaces.inviteTitle')}</h2>
          <div className="spaces-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                const outcome = await run(() => api.post(`/fin/espaces/${spaceId}/invitations`, { role: 'member' }), 'spaces.invited');
                if (outcome.ok) setToken(outcome.result.token);
              }}
            >
              <Plus size={16} aria-hidden="true" /> {t('spaces.invite')}
            </Button>
          </div>
          {/* Shown once: the server keeps only a hash and cannot show it again. */}
          {token && (
            <div className="spaces-token">
              <p>{t('spaces.tokenOnce')}</p>
              <code>{token}</code>
              <button type="button" className="spaces-plain" onClick={() => navigator.clipboard?.writeText(token)}>
                <Copy size={14} aria-hidden="true" /> {t('spaces.copy')}
              </button>
            </div>
          )}
          {data.invitations && data.invitations.length > 0 && (
            <ul className="spaces-list">
              {data.invitations.map((invite) => (
                <li key={invite.id} className="spaces-row">
                  <span className="spaces-tag">{t(`spaces.roles.${invite.role}`)}</span>
                  <span className="spaces-row-date">{t('spaces.expires', { date: formatDate(language, invite.expiresAt) })}</span>
                  <button type="button" className="spaces-icon" onClick={() => run(() => api.delete(`/fin/espaces/${spaceId}/invitations/${invite.id}`), 'spaces.revoked')} aria-label={t('spaces.revoke')}>
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {data.monRole === 'owner' && <p className="spaces-help">{t('spaces.ownerNote')}</p>}
      <div className="spaces-actions">
        {data.monRole === 'owner' && !data.space.closedAt && data.space.kind === 'group' && (
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              if (!window.confirm(t('shared.closeConfirm'))) return;
              const outcome = await run(() => api.post(`/fin/espaces/${spaceId}/cloturer`, {}), 'shared.closed');
              if (outcome.ok) navigate(`/partage/${spaceId}`);
            }}
          >
            {t('shared.close')}
          </Button>
        )}
        {data.monRole === 'owner' ? (
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              if (!window.confirm(t('spaces.deleteConfirm'))) return;
              const outcome = await run(() => api.delete(`/fin/espaces/${spaceId}`), 'spaces.deleted');
              if (outcome.ok) navigate('/partage');
            }}
          >
            <Trash2 size={16} aria-hidden="true" /> {t('spaces.delete')}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={async () => {
              if (!window.confirm(t('spaces.leaveConfirm'))) return;
              const outcome = await run(() => api.post(`/fin/espaces/${spaceId}/quitter`, {}), 'spaces.left');
              if (outcome.ok) navigate('/partage');
            }}
          >
            {t('spaces.leave')}
          </Button>
        )}
      </div>
    </>
  );
}
