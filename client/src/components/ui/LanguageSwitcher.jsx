import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { SUPPORTED_LANGUAGES } from '../../i18n/index.js';
import { isApplicationPath, localizePath, stripLanguage } from '../../i18n/localePath.js';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const current = i18n.resolvedLanguage ?? i18n.language;

  // On the public site the language is part of the address (P12-06): changing
  // it opens the same page in the other language. The applications keep their
  // address.
  const change = async (lng) => {
    await i18n.changeLanguage(lng);
    if (isApplicationPath(location.pathname)) return;
    const target = localizePath(stripLanguage(location.pathname), lng);
    if (target !== location.pathname) navigate(`${target}${location.search}${location.hash}`, { replace: true });
  };

  return (
    <span className="language-switcher">
      <Globe className="language-icon" size={16} strokeWidth={1.75} aria-hidden="true" />
      <select
        aria-label={t('language.label')}
        value={SUPPORTED_LANGUAGES.some((lang) => lang.code === current) ? current : 'fr'}
        onChange={(event) => change(event.target.value)}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </span>
  );
}
