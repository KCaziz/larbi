import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Dark side panel shared by the login / register / forgot-password pages.
// The styles live in pages/Pages.css (auth-aside, check-list). `icon` is a
// lucide-react component.
export default function AuthAside({ icon: Icon }) {
  const { t } = useTranslation();
  const points = t('auth.panel.points', { returnObjects: true });

  return (
    <aside className="auth-aside">
      <span className="aside-icon" aria-hidden="true">
        <Icon size={24} strokeWidth={1.6} />
      </span>
      <h2>{t('auth.panel.title')}</h2>
      <ul className="check-list">
        {points.map((point) => (
          <li key={point}>
            <Check size={16} strokeWidth={2.25} aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
