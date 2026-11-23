import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, History, Plus, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { api, ApiError, errorKey, WRITE_DONE_EVENT } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import { newIdempotencyKey } from '../../lib/organisation.js';
import Button from '../../components/ui/Button.jsx';
import { askConfirm } from '../../components/ui/ConfirmDialog.jsx';

// P13-05, lot A (2026-11-23): the organisations of the client's référentiel —
// which one I work in, the invitations I received, the members and their
// roles, the mandates, the journal. Every right is checked by the server; this
// page only hides what the person's role would be refused anyway.

export const PUBLICS = ['PUB-01', 'PUB-02', 'PUB-03', 'PUB-04', 'PUB-05', 'PUB-06', 'PUB-07', 'PUB-08', 'PUB-09', 'PUB-10'];
export const ROLES = ['owner', 'finance_manager', 'accountant_internal', 'accountant_external', 'collaborator', 'project_manager', 'storekeeper', 'hr_manager', 'reader'];
const REASONS = ['roleForbidden', 'mandateRequired', 'lastOwner', 'alreadyMember', 'versionMismatch', 'memberRevoked', 'organisationNotFound'];

// The words of a refusal: the reason the server gave when we know it.
export function organisationError(t, err) {
  const reason = err instanceof ApiError ? err.details?.reason : null;
  if (REASONS.includes(reason)) return t(`business.org.errors.${reason}`);
  return t(errorKey(err, { 422: 'business.errors.refused', 409: 'business.errors.conflict' }));
}

/** Which organisation, my role there, a new one; the invitations waiting for me. */
export function OrganisationBar({ organisations, invitations, current, role, onSwitch, onNew, onAnswered }) {
  const { t } = useTranslation();
  const [message, setMessage] = useState(null);

  const answer = async (invitation, accept) => {
    setMessage(null);
    try {
      const res = await api.post(`/fin/entreprise/invitations/${invitation.id}/${accept ? 'accepter' : 'refuser'}`, {});
      setMessage({ kind: 'ok', text: t(accept ? 'business.org.accepted' : 'business.org.declined') });
      onAnswered(accept ? res.invitation.organisationId : null);
    } catch (err) {
      setMessage({ kind: 'error', text: organisationError(t, err) });
    }
  };

  // Nothing to choose and nothing waiting: no empty frame.
  if (organisations.length === 0 && invitations.length === 0 && !message) return null;
  return (
    <section className="org-bar" aria-label={t('business.org.switch')}>
      {organisations.length > 0 && (
        <div className="org-bar-row">
          <Building2 size={18} aria-hidden="true" />
          <label htmlFor="org-switch" className="org-bar-label">
            {t('business.org.switch')}
          </label>
          <select id="org-switch" value={current ?? ''} onChange={(event) => onSwitch(event.target.value)}>
            {organisations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.tradeName || org.name}
              </option>
            ))}
          </select>
          {role && <span className="org-role">{t('business.org.yourRole', { role: t(`business.org.roles.${role}`) })}</span>}
          <Button type="button" variant="ghost" onClick={onNew}>
            <Plus size={16} aria-hidden="true" /> {t('business.org.new')}
          </Button>
        </div>
      )}
      {invitations.length > 0 && (
        <div className="org-invitations">
          <h2>{t('business.org.invitationsTitle')}</h2>
          <ul>
            {invitations.map((invitation) => (
              <li key={invitation.id}>
                <span>{t('business.org.invitationLine', { name: invitation.organisation.tradeName || invitation.organisation.name, role: t(`business.org.roles.${invitation.role}`) })}</span>
                <span className="org-actions">
                  <Button type="button" variant="primary" onClick={() => answer(invitation, true)}>
                    {t('business.org.accept')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => answer(invitation, false)}>
                    {t('business.org.decline')}
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}

/** A new organisation (ECR-0162, ECR-0163): name, trade name, professional profile, wilaya. */
export function CreateOrganisation({ currency, onCreated, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', tradeName: '', publicKey: '', wilaya: '' });
  const [key] = useState(newIdempotencyKey);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post(
        '/fin/entreprise',
        {
          name: form.name.trim(),
          currency,
          ...(form.tradeName.trim() ? { tradeName: form.tradeName.trim() } : {}),
          ...(form.publicKey ? { publicKey: form.publicKey } : {}),
          ...(form.wilaya.trim() ? { wilaya: form.wilaya.trim() } : {}),
        },
        { idempotencyKey: key },
      );
      onCreated(res.entreprise.id);
    } catch (err) {
      setError(organisationError(t, err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="business-form business-create" onSubmit={submit}>
      <h2>{t('business.createTitle')}</h2>
      <p>{t('business.createIntro')}</p>
      <label htmlFor="business-name">{t('business.nameLabel')}</label>
      <input id="business-name" value={form.name} onChange={set('name')} maxLength={160} required />
      <label htmlFor="business-trade">{t('business.org.tradeName')}</label>
      <input id="business-trade" value={form.tradeName} onChange={set('tradeName')} maxLength={160} />
      <label htmlFor="business-public">{t('business.org.public')}</label>
      <select id="business-public" value={form.publicKey} onChange={set('publicKey')}>
        <option value="">{t('business.org.publicNone')}</option>
        {PUBLICS.map((key) => (
          <option key={key} value={key}>
            {t(`business.org.publics.${key}`)}
          </option>
        ))}
      </select>
      <p className="fin-hint">{t('business.org.publicHint')}</p>
      <label htmlFor="business-wilaya">{t('business.org.wilaya')}</label>
      <input id="business-wilaya" value={form.wilaya} onChange={set('wilaya')} maxLength={60} />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="org-actions">
        <Button type="submit" variant="primary" disabled={busy}>
          <Plus size={16} aria-hidden="true" />
          {t('business.create')}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('business.org.cancel')}
          </Button>
        )}
      </div>
    </form>
  );
}

/** Members and roles (ECR-0003), with the mandates of the roles that need one. */
export function MembersSection() {
  const { t, i18n } = useTranslation();
  const members = useApi('/fin/entreprise/membres');
  const [message, setMessage] = useState(null);
  const [invite, setInvite] = useState({ email: '', role: 'collaborator', expiresAt: '' });
  const [inviteKey, setInviteKey] = useState(newIdempotencyKey);

  const run = async (action, okKey) => {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      members.reload();
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: organisationError(t, err) });
      return false;
    }
  };

  const sendInvite = async (event) => {
    event.preventDefault();
    const body = { email: invite.email.trim(), role: invite.role, ...(invite.expiresAt ? { expiresAt: new Date(`${invite.expiresAt}T23:59:59`).toISOString() } : {}) };
    if (await run(() => api.post('/fin/entreprise/membres', body, { idempotencyKey: inviteKey }), 'business.org.invited')) {
      setInvite({ email: '', role: 'collaborator', expiresAt: '' });
      setInviteKey(newIdempotencyKey());
    }
  };

  const rows = members.data?.membres ?? [];
  return (
    <section aria-labelledby="org-members" className="org-members">
      <h2 id="org-members">
        <Users size={18} aria-hidden="true" /> {t('business.org.membersTitle')}
      </h2>
      <p className="fin-hint">{t('business.org.membersIntro')}</p>
      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
          {message.text}
        </p>
      )}
      <ul className="org-member-list">
        {rows.map((member) => (
          <li key={member.id} className={`org-member org-member-${member.status}`}>
            <div className="org-member-head">
              <strong>{member.name ?? member.email}</strong>
              {member.name && <span className="org-member-email">{member.email}</span>}
              <span className={`org-status org-status-${member.status}`}>{t(`business.org.status.${member.status}`)}</span>
              {member.expiresAt && member.status !== 'revoked' && <span className="org-member-until">{t('business.org.until', { date: formatDate(i18n.language, member.expiresAt) })}</span>}
            </div>
            {member.status !== 'revoked' && (
              <div className="org-member-actions">
                <label className="sr-only" htmlFor={`role-${member.id}`}>
                  {t('business.org.role')}
                </label>
                <select
                  id={`role-${member.id}`}
                  value={member.role}
                  onChange={(event) => run(() => api.put(`/fin/entreprise/membres/${member.id}`, { role: event.target.value }, { ifMatch: member.version }), 'business.org.changed')}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {t(`business.org.roles.${role}`)}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    if (await askConfirm(t('business.org.revokeConfirm', { email: member.email }))) run(() => api.delete(`/fin/entreprise/membres/${member.id}`), 'business.org.revoked');
                  }}
                >
                  {t('business.org.revoke')}
                </Button>
              </div>
            )}
            {member.role === 'accountant_external' && member.status !== 'revoked' && <Mandates member={member} run={run} />}
          </li>
        ))}
      </ul>

      <form className="business-form org-invite" onSubmit={sendInvite}>
        <h3>
          <UserPlus size={16} aria-hidden="true" /> {t('business.org.inviteTitle')}
        </h3>
        <div className="business-form-row">
          <label>
            {t('business.org.email')}
            <input type="email" value={invite.email} onChange={(event) => setInvite({ ...invite, email: event.target.value })} maxLength={254} required />
          </label>
          <label>
            {t('business.org.role')}
            <select value={invite.role} onChange={(event) => setInvite({ ...invite, role: event.target.value })}>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {t(`business.org.roles.${role}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('business.org.expires')}
            <input type="date" value={invite.expiresAt} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setInvite({ ...invite, expiresAt: event.target.value })} />
          </label>
        </div>
        {invite.role === 'accountant_external' && <p className="fin-hint">{t('business.org.mandateNeeded')}</p>}
        <Button type="submit" variant="secondary">
          <UserPlus size={16} aria-hidden="true" /> {t('business.org.invite')}
        </Button>
      </form>
    </section>
  );
}

function Mandates({ member, run }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ scope: 'finance', purpose: '', endsAt: '' });
  const [key, setKey] = useState(newIdempotencyKey);
  const active = member.mandates.filter((mandate) => !mandate.revokedAt && (!mandate.endsAt || new Date(mandate.endsAt) > new Date()));

  const grant = async (event) => {
    event.preventDefault();
    const body = { memberId: member.id, scope: form.scope, purpose: form.purpose.trim(), ...(form.endsAt ? { endsAt: new Date(`${form.endsAt}T23:59:59`).toISOString() } : {}) };
    if (await run(() => api.post('/fin/entreprise/mandats', body, { idempotencyKey: key }), 'business.org.granted')) {
      setForm({ scope: 'finance', purpose: '', endsAt: '' });
      setKey(newIdempotencyKey());
    }
  };

  return (
    <div className="org-mandates">
      <h4>
        <ShieldCheck size={15} aria-hidden="true" /> {t('business.org.mandatesTitle')}
      </h4>
      {active.length === 0 ? (
        <p className="org-mandate-none">{t('business.org.mandateNone')}</p>
      ) : (
        <ul>
          {active.map((mandate) => (
            <li key={mandate.id}>
              <span>
                {t(`business.org.scopes.${mandate.scope}`)} · {mandate.purpose} · {t('business.org.since', { date: formatDate(i18n.language, mandate.startsAt) })}
                {mandate.endsAt ? ` · ${t('business.org.until', { date: formatDate(i18n.language, mandate.endsAt) })}` : ''}
              </span>
              <Button type="button" variant="ghost" onClick={() => run(() => api.delete(`/fin/entreprise/mandats/${mandate.id}`), 'business.org.mandateRevoked')}>
                {t('business.org.mandateRevoke')}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form className="business-form-row org-mandate-form" onSubmit={grant}>
        <label>
          {t('business.org.scope')}
          <select value={form.scope} onChange={(event) => setForm({ ...form, scope: event.target.value })}>
            <option value="finance">{t('business.org.scopes.finance')}</option>
            <option value="documents">{t('business.org.scopes.documents')}</option>
          </select>
        </label>
        <label>
          {t('business.org.purpose')}
          <input value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} maxLength={200} required />
        </label>
        <label>
          {t('business.org.endsAt')}
          <input type="date" value={form.endsAt} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} />
        </label>
        <Button type="submit" variant="secondary">
          {t('business.org.grant')}
        </Button>
      </form>
    </div>
  );
}

/** The journal of operations (ECR-0008). */
export function JournalSection() {
  const { t, i18n } = useTranslation();
  const journal = useApi('/fin/entreprise/journal');
  // Read again after every save on the page: the journal shows it at once.
  const { reload } = journal;
  useEffect(() => {
    window.addEventListener(WRITE_DONE_EVENT, reload);
    return () => window.removeEventListener(WRITE_DONE_EVENT, reload);
  }, [reload]);
  const rows = journal.data?.journal ?? [];
  return (
    <section aria-labelledby="org-journal" className="org-journal">
      <h2 id="org-journal">
        <History size={18} aria-hidden="true" /> {t('business.org.journalTitle')}
      </h2>
      <p className="fin-hint">{t('business.org.journalIntro')}</p>
      {rows.length === 0 ? (
        <p className="business-empty">{t('business.org.journalEmpty')}</p>
      ) : (
        <ol className="org-journal-list">
          {rows.map((row) => (
            <li key={row.id}>
              <time dateTime={row.at}>{new Date(row.at).toLocaleString(i18n.language === 'tzm' ? 'fr' : i18n.language, { dateStyle: 'short', timeStyle: 'short' })}</time>
              <span>
                <strong>{row.actor ?? t('business.org.someone')}</strong> {t(`business.org.actions.${row.action}`, { defaultValue: t('business.org.actions.other') })}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
