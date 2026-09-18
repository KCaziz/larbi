import { useTranslation } from 'react-i18next';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <section className="page-section legal-page">
      <h1>{t('privacy.title')}</h1>
      <Notice variant="action-needed">{t('privacy.notice')}</Notice>

      <h2>{t('privacy.dataTitle')}</h2>
      <p>{t('privacy.dataBody')}</p>

      <h2>{t('privacy.securityTitle')}</h2>
      <p>{t('privacy.securityBody')}</p>

      <h2>{t('privacy.rightsTitle')}</h2>
      <dl>
        <dt>{t('privacy.rightsContact')}</dt>
        <dd>{t('privacy.toComplete')}</dd>
      </dl>
    </section>
  );
}
