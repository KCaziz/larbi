import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button.jsx';
import '../Pages.css';

export default function AccountTypePage() {
  const { t } = useTranslation();
  const [accountType, setAccountType] = useState('auto-entrepreneur');
  const [status, setStatus] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    // No backend endpoint exists yet to persist this change (see P1-06 / P2-01+).
    setStatus(t('account.type.status'));
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
              value={accountType}
              onChange={(event) => setAccountType(event.target.value)}
            >
              <option value="auto-entrepreneur">{t('accountTypes.autoEntrepreneur')}</option>
              <option value="pme">{t('accountTypes.pme')}</option>
              <option value="pmi">{t('accountTypes.pmi')}</option>
            </select>
          </div>
          {status && (
            <p className="form-status" role="status">
              {status}
            </p>
          )}
          <Button type="submit">{t('account.type.save')}</Button>
        </form>
      </div>
    </div>
  );
}
