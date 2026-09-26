import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, SlidersHorizontal, Tag, UserRound } from 'lucide-react';
import { useAuth } from '../../auth/useAuth.js';
import { ApiError, errorKey } from '../../lib/api.js';
import { accountTypeLabel, useAccountTypes } from '../../lib/accountTypes.js';
import Button from '../../components/ui/Button.jsx';
import '../Pages.css';

const fields = [
  { key: 'name', icon: UserRound, tone: 'tone-primary' },
  { key: 'email', icon: Mail, tone: 'tone-blue' },
  { key: 'accountType', icon: Tag, tone: 'tone-brass' },
  { key: 'accessLevel', icon: SlidersHorizontal, tone: 'tone-green' },
];

function Status({ status }) {
  if (!status) return null;
  return (
    <p className={`form-status ${status.type === 'error' ? 'form-status-error' : ''}`} role={status.type === 'error' ? 'alert' : 'status'}>
      {status.text}
    </p>
  );
}

const failureKey = (err) => {
  if (err instanceof ApiError && err.status === 409) return 'account.profile.edit.emailTaken';
  if (err instanceof ApiError && err.status === 403) return 'account.profile.edit.wrongPassword';
  return errorKey(err);
};

// Name, e-mail (which asks for the current password) and account type. The
// server checks everything again; nothing here is a protection.
function EditProfile() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const accountTypes = useAccountTypes();
  const [form, setForm] = useState({ name: user.name, email: user.email, accountType: user.accountType, currentPassword: '' });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const emailChanged = form.email.trim().toLowerCase() !== user.email;
  const changed = form.name.trim() !== user.name || emailChanged || form.accountType !== user.accountType;
  const set = (event) => setForm((f) => ({ ...f, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return setStatus({ type: 'error', text: t('account.profile.edit.required') });
    if (emailChanged && !form.currentPassword) return setStatus({ type: 'error', text: t('account.profile.edit.passwordNeeded') });
    setStatus(null);
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), accountType: form.accountType };
      if (emailChanged) Object.assign(payload, { email: form.email.trim(), currentPassword: form.currentPassword });
      await updateProfile(payload);
      setForm((f) => ({ ...f, currentPassword: '' }));
      setStatus({ type: 'success', text: t('account.profile.edit.saved') });
    } catch (err) {
      setStatus({ type: 'error', text: t(failureKey(err)) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-card form-card-sm account-edit">
      <h3>{t('account.profile.edit.title')}</h3>
      <form className="form-stack" onSubmit={submit} noValidate>
        <div className="form-field">
          <label htmlFor="p-name">{t('account.profile.fields.name')}</label>
          <input id="p-name" name="name" maxLength={100} value={form.name} onChange={set} autoComplete="name" />
        </div>
        <div className="form-field">
          <label htmlFor="p-email">{t('account.profile.fields.email')}</label>
          <input id="p-email" name="email" type="email" maxLength={254} value={form.email} onChange={set} autoComplete="email" />
        </div>
        {emailChanged && (
          <div className="form-field">
            <label htmlFor="p-current">{t('account.profile.edit.currentPassword')}</label>
            <input id="p-current" name="currentPassword" type="password" maxLength={72} value={form.currentPassword} onChange={set} autoComplete="current-password" />
            <small className="form-hint">{t('account.profile.edit.emailHint')}</small>
          </div>
        )}
        <div className="form-field">
          <label htmlFor="p-type">{t('account.profile.fields.accountType')}</label>
          <select id="p-type" name="accountType" value={form.accountType} onChange={set} disabled={accountTypes.status !== 'ready'}>
            {accountTypes.status !== 'ready' && <option value={user.accountType}>{accountTypeLabel(user.accountType)}</option>}
            {accountTypes.types.map((type) => (
              <option key={type.value} value={type.value}>
                {accountTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
        <Status status={status} />
        <Button type="submit" disabled={saving || !changed}>
          {saving ? t('state.sending') : t('account.profile.edit.save')}
        </Button>
      </form>
    </div>
  );
}

function ChangePassword() {
  const { t } = useTranslation();
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (event) => setForm((f) => ({ ...f, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.currentPassword || !form.newPassword) return setStatus({ type: 'error', text: t('account.profile.edit.required') });
    if (form.newPassword.length < 8) return setStatus({ type: 'error', text: t('account.profile.password.tooShort') });
    if (form.newPassword !== form.confirm) return setStatus({ type: 'error', text: t('account.profile.password.mismatch') });
    setStatus(null);
    setSaving(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
      setStatus({ type: 'success', text: t('account.profile.password.saved') });
    } catch (err) {
      setStatus({ type: 'error', text: t(failureKey(err)) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-card form-card-sm account-edit">
      <h3>{t('account.profile.password.title')}</h3>
      <form className="form-stack" onSubmit={submit} noValidate>
        <div className="form-field">
          <label htmlFor="pw-current">{t('account.profile.edit.currentPassword')}</label>
          <input id="pw-current" name="currentPassword" type="password" maxLength={72} value={form.currentPassword} onChange={set} autoComplete="current-password" />
        </div>
        <div className="form-field">
          <label htmlFor="pw-new">{t('account.profile.password.new')}</label>
          <input id="pw-new" name="newPassword" type="password" maxLength={72} value={form.newPassword} onChange={set} autoComplete="new-password" />
          <small className="form-hint">{t('account.profile.password.hint')}</small>
        </div>
        <div className="form-field">
          <label htmlFor="pw-confirm">{t('account.profile.password.confirm')}</label>
          <input id="pw-confirm" name="confirm" type="password" maxLength={72} value={form.confirm} onChange={set} autoComplete="new-password" />
        </div>
        <Status status={status} />
        <Button type="submit" disabled={saving}>
          {saving ? t('state.sending') : t('account.profile.password.save')}
        </Button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const values = {
    name: user.name,
    email: user.email,
    accountType: accountTypeLabel(user.accountType),
    accessLevel: t(`accountTypes.${user.accessLevel}`),
  };

  return (
    <div>
      <h2 className="account-heading">{t('account.profile.title')}</h2>
      <p>{t('account.profile.intro')}</p>
      <div className="skeleton-grid">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div className={`skeleton-item ${field.tone}`} key={field.key}>
              <span className="icon-badge" aria-hidden="true">
                <Icon size={22} strokeWidth={1.6} />
              </span>
              <div>
                <div className="label">{t(`account.profile.fields.${field.key}`)}</div>
                <div className="value">{values[field.key]}</div>
              </div>
            </div>
          );
        })}
      </div>
      <EditProfile />
      <ChangePassword />
    </div>
  );
}
