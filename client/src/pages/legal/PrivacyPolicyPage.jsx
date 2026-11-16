import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import '../Pages.css';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  // Same title and description as the server sends (P12-06).
  useDocumentMeta(t('seo.pages.privacy.title'), t('seo.pages.privacy.description'));

  return (
    <>
      <PageHeader icon={ShieldCheck} title={t('privacy.title')} subtitle={t('privacy.subtitle')} />

      <Section>
        <div className="legal-card">
          <Notice variant="action-needed">{t('privacy.notice')}</Notice>

          <h2>{t('privacy.dataTitle')}</h2>
          <p>{t('privacy.dataBody')}</p>

          {/* Audience measurement (P12-06): what it is, and that it needs consent. */}
          <h2>{t('privacy.analyticsTitle')}</h2>
          <p>{t('privacy.analyticsBody')}</p>

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
