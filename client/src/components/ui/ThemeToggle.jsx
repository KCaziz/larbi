import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/useTheme.js';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.toggleToLight') : t('theme.toggleToDark')}
      title={isDark ? t('theme.toggleToLight') : t('theme.toggleToDark')}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
