import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Eye, Lock, Plus, Trash2, UserMinus, Users } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import '../../components/fincludia/Fincludia.css';
import './Spaces.css';

// Shared spaces (P6-13), the « À plusieurs » hub: screens P01, P04, CO01, CP01,
// FA01.
//
// The page is built around one sentence the client wrote and this screen has to
// make obvious: joining a space shares NOTHING. Every member starts fully
// private, and the only sharing control on this page writes the viewer's own
// row — there is no way to set somebody else's, by design.
export default function SpacesPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [message, setMessage] = useState(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [openId, setOpenId] = useState(null);
  useDocumentMeta(t('spaces.title'), t('spaces.intro'));

  const spaces = useApi('/fin/espaces');
  const references = useApi('/fin/espaces/references');

  async function run(action, okKey) {
    setMessage(null);
    try {
      const result = await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      spaces.reload();
      return { ok: true, result };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'spaces.errors.refused', 403: 'spaces.errors.role' })) });
      return { ok: false };
    }
  }

  if (spaces.status === 'loading' && !spaces.data) return <LoadingState />;
  if (spaces.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={spaces.reload} />;

  const list = spaces.data.spaces;

  return (
    <>
      <PageHeader icon={Users} title={t('spaces.title')} subtitle={t('spaces.intro')} />
      <div className="spaces-page">
        {/* The promise, first thing on the page. */}
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
                  <button type="button" className="spaces-open" onClick={() => setOpenId(openId === space.id ? null : space.id)} aria-expanded={openId === space.id}>
                    <span className="spaces-row-label">{space.label}</span>
                    <span className="spaces-tag">{t(`spaces.kinds.${space.kind}`)}</span>
                    <span className="spaces-tag">{t(`spaces.roles.${space.role}`)}</span>
                    <span className="spaces-tag">{t('spaces.memberCount', { count: space.membres })}</span>
                  </button>
                  {openId === space.id && <SpaceDetail t={t} language={i18n.language} spaceId={space.id} references={references.data} run={run} />}
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

function SpaceForm({ t, currency, references, run, onDone }) {
  const [kind, setKind] = useState('flatshare');
  const [label, setLabel] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    if (label.trim().length === 0) {
      setError(t('spaces.errors.label'));
      return;
    }
    const outcome = await run(
      () => api.post('/fin/espaces', { kind, label: label.trim(), currency, ...(displayName.trim() ? { displayName: displayName.trim() } : {}) }),
      'spaces.created',
    );
    if (outcome.ok) onDone();
  }

  return (
    <form className="spaces-form" onSubmit={submit}>
      <div className="spaces-form-grid">
        <label htmlFor="space-kind">
          {t('spaces.fields.kind')}
          <select id="space-kind" value={kind} onChange={(event) => setKind(event.target.value)}>
            {(references?.kinds ?? ['flatshare']).map((option) => (
              <option key={option} value={option}>
                {t(`spaces.kinds.${option}`)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="space-label">
          {t('spaces.fields.label')}
          <input id="space-label" type="text" value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={80} />
        </label>
        <label htmlFor="space-display">
          {t('spaces.fields.displayName')}
          <input id="space-display" type="text" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={60} />
        </label>
      </div>
      {/* Why the display name exists at all. */}
      <p className="spaces-help">{t('spaces.displayNameHelp')}</p>
      {error && <p className="form-error">{error}</p>}
      <div className="spaces-actions">
        <Button type="submit">{t('spaces.save')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('spaces.cancel')}
        </Button>
      </div>
    </form>
  );
}

function JoinForm({ t, run, onDone }) {
  const [token, setToken] = useState('');

  async function submit(event) {
    event.preventDefault();
    const outcome = await run(() => api.post('/fin/espaces/rejoindre', { token: token.trim() }), 'spaces.joined');
    if (outcome.ok) onDone();
  }

  return (
    <form className="spaces-form" onSubmit={submit}>
      <label htmlFor="space-token">
        {t('spaces.fields.token')}
        <input id="space-token" type="text" value={token} onChange={(event) => setToken(event.target.value)} required minLength={16} maxLength={200} />
      </label>
      <p className="spaces-help">{t('spaces.joinHelp')}</p>
      <div className="spaces-actions">
        <Button type="submit">{t('spaces.joinAction')}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>
          {t('spaces.cancel')}
        </Button>
      </div>
    </form>
  );
}

function SpaceDetail({ t, language, spaceId, references, run }) {
  const detail = useApi(`/fin/espaces/${spaceId}`);
  const shared = useApi(`/fin/espaces/${spaceId}/partage`);
  const [token, setToken] = useState(null);

  function reload() {
    detail.reload();
    shared.reload();
  }

  if (detail.status === 'loading' && !detail.data) return <LoadingState />;
  if (detail.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={detail.reload} />;

  const data = detail.data;
  const canAdmin = ['owner', 'admin'].includes(data.monRole);

  return (
    <div className="spaces-detail">
      {/* MY matrix. The only sharing control here, and it writes my own row. */}
      <h3>{t('spaces.mySharingTitle')}</h3>
      <p className="spaces-help">{t('spaces.mySharingHelp')}</p>
      <ul className="spaces-matrix">
        {(references?.shareableKinds ?? []).map((kind) => (
          <li key={kind}>
            <label htmlFor={`sharing-${spaceId}-${kind}`}>{t(`spaces.dataKinds.${kind}`)}</label>
            <select
              id={`sharing-${spaceId}-${kind}`}
              value={data.monPartage[kind] ?? 'private'}
              onChange={async (event) => {
                const outcome = await run(() => api.put(`/fin/espaces/${spaceId}/mon-partage`, { [kind]: event.target.value }), 'spaces.sharingSaved');
                if (outcome.ok) reload();
              }}
            >
              {(references?.sharingLevels ?? []).map((level) => (
                <option key={level} value={level}>
                  {t(`spaces.levels.${level}`)}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <h3>{t('spaces.membersTitle')}</h3>
      <ul className="spaces-members">
        {data.membres.map((member) => (
          <li key={member.id} className="spaces-member">
            <span className="spaces-member-name">
              {member.name}
              {member.isMe && <span className="spaces-tag">{t('spaces.me')}</span>}
            </span>
            <span className="spaces-tag">{t(`spaces.roles.${member.role}`)}</span>
            {/* What THEY share with ME, kind by kind. Never what they share in
                general: the answer is computed per reader. */}
            {!member.isMe && (
              <span className="spaces-member-shares">
                <Eye size={13} aria-hidden="true" />
                {(references?.shareableKinds ?? [])
                  .filter((kind) => member.sharing[kind] !== 'private')
                  .map((kind) => t(`spaces.dataKinds.${kind}`))
                  .join(', ') || t('spaces.sharesNothing')}
              </span>
            )}
            {canAdmin && !member.isMe && member.role !== 'owner' && (
              <button
                type="button"
                className="spaces-icon"
                onClick={async () => {
                  if (!window.confirm(t('spaces.removeConfirm', { name: member.name }))) return;
                  const outcome = await run(() => api.delete(`/fin/espaces/${spaceId}/membres/${member.id}`), 'spaces.removed');
                  if (outcome.ok) reload();
                }}
                aria-label={t('spaces.remove', { name: member.name })}
              >
                <UserMinus size={15} aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {shared.data && <SharedFigures t={t} partage={shared.data.partage} references={references} />}

      {canAdmin && (
        <>
          <h3>{t('spaces.inviteTitle')}</h3>
          <div className="spaces-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                const outcome = await run(() => api.post(`/fin/espaces/${spaceId}/invitations`, { role: 'member' }), 'spaces.invited');
                if (outcome.ok) setToken(outcome.result.token);
                reload();
              }}
            >
              <Plus size={16} aria-hidden="true" /> {t('spaces.invite')}
            </Button>
          </div>
          {/* Shown once. The server stores only a hash and cannot show it
              again, which the text says rather than leaving to be discovered. */}
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
                  <button
                    type="button"
                    className="spaces-icon"
                    onClick={async () => {
                      const outcome = await run(() => api.delete(`/fin/espaces/${spaceId}/invitations/${invite.id}`), 'spaces.revoked');
                      if (outcome.ok) reload();
                    }}
                    aria-label={t('spaces.revoke')}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="spaces-actions">
        {data.monRole === 'owner' ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (window.confirm(t('spaces.deleteConfirm'))) run(() => api.delete(`/fin/espaces/${spaceId}`), 'spaces.deleted');
            }}
          >
            <Trash2 size={16} aria-hidden="true" /> {t('spaces.delete')}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (window.confirm(t('spaces.leaveConfirm'))) run(() => api.post(`/fin/espaces/${spaceId}/quitter`, {}), 'spaces.left');
            }}
          >
            {t('spaces.leave')}
          </Button>
        )}
      </div>
    </div>
  );
}

// What the others actually shared. A member who shared nothing has no block at
// all here — the server does not send one, and neither does this show one.
function SharedFigures({ t, partage, references }) {
  const others = partage.filter((row) => !row.isMe && Object.keys(row.donnees).length > 0);
  if (others.length === 0) return <p className="spaces-help">{t('spaces.nobodyShares')}</p>;

  return (
    <>
      <h3>{t('spaces.sharedTitle')}</h3>
      <ul className="spaces-shared">
        {others.map((row) => (
          <li key={row.userId}>
            <span className="spaces-member-name">{row.name}</span>
            <div className="fin-cards">
              {(references?.shareableKinds ?? []).map((kind) => {
                const block = row.donnees[kind];
                if (!block) return null;
                return (
                  <div key={kind} className="spaces-shared-card">
                    <FigureCard label={t(`spaces.dataKinds.${kind}`)} answer={block.total} />
                    {/* At "totals" the rows are not in the payload at all, and
                        the text says so instead of showing an empty list. */}
                    {block.lignes === null ? (
                      <p className="spaces-help">{t('spaces.totalsOnly')}</p>
                    ) : (
                      <p className="spaces-help">{t('spaces.rowCount', { count: block.lignes.length })}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
