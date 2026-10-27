import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import { SETTINGS_LINKS, visibleEntries } from '../../config/appNavigation.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import '../../components/fincludia/Fincludia.css';

// « Mon espace » (tab 03B): profile, preferences, currency, privacy and
// notifications, gathered in one place instead of the old account sidebar.
export default function SettingsPage() {
  const { t } = useTranslation();
  useDocumentMeta(t('appNav.mySpace'));
  const journey = useApi('/fin/parcours');
  const links = visibleEntries(SETTINGS_LINKS, { declaredMinor: journey.data?.mineurDeclare === true });

  return (
    <>
      <PageHeader icon={Settings} title={t('appNav.mySpace')} maxWidth={760} />
      <div className="fin-page-narrow">
        <ul className="fin-health-dimensions">
          {links.map((link) => (
            <li key={link.to}>
              <Link to={link.to}>
                <link.icon size={16} aria-hidden="true" /> {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
