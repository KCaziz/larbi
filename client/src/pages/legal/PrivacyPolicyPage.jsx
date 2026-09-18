import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import '../Pages.css';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader icon="🛡️" title={t('privacy.title')} subtitle={t('privacy.subtitle')} />

      <Section>
        <div className="legal-card">
          <Notice variant="action-needed">{t('privacy.notice')}</Notice>

          <h2>{t('privacy.dataTitle')}</h2>
          <p>{t('privacy.dataBody')}</p>

          <h2>{t('privacy.securityTitle')}</h2>
          <p>{t('privacy.securityBody')}</p>

          <h2>{t('privacy.rightsTitle')}</h2>
          <dl>
            <dt>{t('privacy.rightsContact')}</dt>
            <dd className="todo">{t('privacy.toComplete')}</dd>
          </dl>
        </div>
      </Section>
    </>
  );
}
