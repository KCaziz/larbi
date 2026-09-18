import { useTranslation } from 'react-i18next';
import '../Pages.css';

export default function ProfilePage() {
  const { t } = useTranslation();
  const fields = [
    t('account.profile.fields.name'),
    t('account.profile.fields.email'),
    t('account.profile.fields.accountType'),
    t('account.profile.fields.accessLevel'),
  ];

  return (
    <div>
      <h1>{t('account.profile.title')}</h1>
      <p>{t('account.profile.intro')}</p>
      <div className="skeleton-grid">
        {fields.map((label) => (
          <div className="skeleton-item" key={label}>
            <div className="label">{label}</div>
            <div className="value">—</div>
          </div>
        ))}
      </div>
    </div>
  );
}
