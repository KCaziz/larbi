import { useTranslation } from 'react-i18next';
import { Mail, SlidersHorizontal, Tag, UserRound } from 'lucide-react';
import { useAuth } from '../../auth/useAuth.js';
import { accountTypeLabel } from '../../lib/accountTypes.js';
import '../Pages.css';

const fields = [
  { key: 'name', icon: UserRound, tone: 'tone-primary' },
  { key: 'email', icon: Mail, tone: 'tone-blue' },
  { key: 'accountType', icon: Tag, tone: 'tone-brass' },
  { key: 'accessLevel', icon: SlidersHorizontal, tone: 'tone-green' },
];

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const values = {
    name: user.name,
    email: user.email,
    accountType: accountTypeLabel(t, user.accountType),
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
    </div>
  );
}
