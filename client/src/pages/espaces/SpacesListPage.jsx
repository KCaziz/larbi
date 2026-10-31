import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Plus, Users } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import '../../components/fincludia/Fincludia.css';
import './Spaces.css';
import { JoinForm, SpaceForm, useSpaceRun } from './parts.jsx';

// Gestion commune, home (P9-02): the list of the person's spaces, and the two
// ways to get one — create it, or join with an invitation. Joining shares
// NOTHING (P6-13): the promise stays the first thing on the page. Each space
// opens on its own pages, under `/partage/:id`.
export default function SpacesListPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  useDocumentMeta(t('spaces.title'), t('spaces.intro'));

  const spaces = useApi('/fin/espaces');
  const references = useApi('/fin/espaces/references');
  const [message, run] = useSpaceRun(spaces.reload);

  if (spaces.status === 'loading' && !spaces.data) return <LoadingState />;
  if (spaces.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={spaces.reload} />;
  const list = spaces.data.spaces;

  return (
    <>
      <PageHeader icon={Users} title={t('spaces.title')} subtitle={t('spaces.intro')} maxWidth={1040} />
      <div className="spaces-page">
        <p className="spaces-rule">
          <Lock size={15} aria-hidden="true" /> {t('spaces.privateByDefault')}
        </p>
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}
        <section aria-labelledby="spaces-mine">
          <h2 id="spaces-mine">{t('spaces.mineTitle')}</h2>
          {list.length === 0 ? (
            <p className="spaces-empty">{t('spaces.none')}</p>
          ) : (
            <ul className="spaces-list">
              {list.map((space) => (
                <li key={space.id} className="spaces-row">
                  <Link to={`/partage/${space.id}`} className="spaces-open">
                    <span className="spaces-row-label">{space.label}</span>
                    <span className="spaces-tag">{t(`spaces.kinds.${space.kind}`)}</span>
                    <span className="spaces-tag">{t(`spaces.roles.${space.role}`)}</span>
                    <span className="spaces-tag">{t('spaces.memberCount', { count: space.membres })}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="spaces-actions">
            <Button type="button" variant="secondary" onClick={() => setCreating((value) => !value)}>
              <Plus size={16} aria-hidden="true" /> {t('spaces.create')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setJoining((value) => !value)}>
              {t('spaces.join')}
            </Button>
          </div>
          {creating && <SpaceForm t={t} currency={user?.finCurrency ?? 'DZD'} references={references.data} run={run} onDone={() => setCreating(false)} />}
          {joining && <JoinForm t={t} run={run} onDone={() => setJoining(false)} />}
        </section>
      </div>
    </>
  );
}
