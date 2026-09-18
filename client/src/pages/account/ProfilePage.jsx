import { useTranslation } from 'react-i18next';
import '../Pages.css';

const fields = [
  { key: 'name', icon: '👤', tone: 'tone-violet' },
  { key: 'email', icon: '✉️', tone: 'tone-blue' },
  { key: 'accountType', icon: '🏷️', tone: 'tone-amber' },
  { key: 'accessLevel', icon: '🎚️', tone: 'tone-green' },
];

export default function ProfilePage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="account-heading">{t('account.profile.title')}</h2>
      <p>{t('account.profile.intro')}</p>
      <div className="skeleton-grid">
        {fields.map((field) => (
          <div className={`skeleton-item ${field.tone}`} key={field.key}>
            <span className="icon-badge" aria-hidden="true">
              {field.icon}
            </span>
            <div>
              <div className="label">{t(`account.profile.fields.${field.key}`)}</div>
              <div className="value">—</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
