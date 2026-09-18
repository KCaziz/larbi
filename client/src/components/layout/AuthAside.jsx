import { useTranslation } from 'react-i18next';

// Coloured side panel shared by the login / register / forgot-password pages.
// The styles live in pages/Pages.css (auth-aside, check-list).
export default function AuthAside({ icon }) {
  const { t } = useTranslation();
  const points = t('auth.panel.points', { returnObjects: true });

  return (
    <aside className="auth-aside">
      <span className="aside-icon" aria-hidden="true">
        {icon}
      </span>
      <h2>{t('auth.panel.title')}</h2>
      <ul className="check-list">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </aside>
  );
}
