import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Small tag: the languages an article exists in. The one being shown is marked.
// `languages` = codes from the API (`availableLanguages`), `shown` = article.language.
export default function LanguageBadges({ languages, shown }) {
  const { t } = useTranslation();
  if (!languages?.length) return null;
  return (
    <span className="blog-langs" role="group" aria-label={t('blogList.availableIn')}>
      <Languages size={13} strokeWidth={1.9} aria-hidden="true" />
      {languages.map((code) => (
        <abbr key={code} title={t(`contentLanguage.names.${code}`)} className={code === shown ? 'blog-lang blog-lang-current' : 'blog-lang'} aria-current={code === shown ? 'true' : undefined}>
          {code.toUpperCase()}
        </abbr>
      ))}
    </span>
  );
}
