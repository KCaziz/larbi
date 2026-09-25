import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/useAuth.js';
import { errorKey } from '../../lib/api.js';
import { accountTypeLabel, useAccountTypes } from '../../lib/accountTypes.js';
import Button from '../../components/ui/Button.jsx';
import '../Pages.css';

export default function AccountTypePage() {
  const { t } = useTranslation();
  const { user, updateAccountType } = useAuth();
  const accountTypes = useAccountTypes();
  const [selected, setSelected] = useState(user.accountType);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      await updateAccountType(selected);
      setStatus({ type: 'success', text: t('account.type.saved') });
    } catch (err) {
      setStatus({ type: 'error', text: t(errorKey(err)) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="account-heading">{t('account.type.title')}</h2>
      <p>{t('account.type.intro')}</p>
      <div className="form-card form-card-sm">
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="accountType">{t('account.type.categoryLabel')}</label>
            <select
              id="accountType"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              disabled={accountTypes.status !== 'ready'}
            >
              {accountTypes.status !== 'ready' && (
                <option value={user.accountType}>{accountTypeLabel(user.accountType)}</option>
              )}
              {accountTypes.types.map((type) => (
                <option key={type.value} value={type.value}>
                  {accountTypeLabel(type)}
                </option>
              ))}
            </select>
            {accountTypes.status === 'error' && (
              <small className="form-hint form-hint-error" role="alert">
                {t('auth.register.accountTypesError')}
              </small>
            )}
          </div>
          {status && (
            <p
              className={`form-status ${status.type === 'error' ? 'form-status-error' : ''}`}
              role={status.type === 'error' ? 'alert' : 'status'}
            >
              {status.text}
            </p>
          )}
          <Button
            type="submit"
            disabled={saving || accountTypes.status !== 'ready' || selected === user.accountType}
          >
            {saving ? t('state.sending') : t('account.type.save')}
          </Button>
        </form>
      </div>
    </div>
  );
}
