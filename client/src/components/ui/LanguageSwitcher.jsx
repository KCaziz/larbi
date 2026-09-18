import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n/index.js';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? i18n.language;

  return (
    <select
      className="language-switcher"
      aria-label={t('language.label')}
      value={SUPPORTED_LANGUAGES.some((lang) => lang.code === current) ? current : 'fr'}
      onChange={(event) => i18n.changeLanguage(event.target.value)}
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
