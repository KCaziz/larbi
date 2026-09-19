import { useTranslation } from 'react-i18next';
import { Scale } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import '../Pages.css';

export default function LegalNoticePage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader icon={Scale} title={t('legal.title')} subtitle={t('legal.subtitle')} />

      <Section>
        <div className="legal-card">
          <Notice variant="action-needed">{t('legal.notice')}</Notice>

          <h2>{t('legal.editorTitle')}</h2>
          <dl>
            <dt>{t('legal.fields.companyName')}</dt>
            <dd className="todo">{t('legal.toComplete')}</dd>
            <dt>{t('legal.fields.legalForm')}</dt>
            <dd className="todo">{t('legal.toCompleteShort')}</dd>
            <dt>{t('legal.fields.siret')}</dt>
            <dd className="todo">{t('legal.toCompleteShort')}</dd>
            <dt>{t('legal.fields.address')}</dt>
            <dd className="todo">{t('legal.toCompleteShort')}</dd>
            <dt>{t('legal.fields.publisher')}</dt>
            <dd className="todo">{t('legal.toCompleteShort')}</dd>
            <dt>{t('legal.fields.contact')}</dt>
            <dd className="todo">{t('legal.toCompleteShort')}</dd>
          </dl>

          <h2>{t('legal.hostingTitle')}</h2>
          <dl>
            <dt>{t('legal.hostingField')}</dt>
            <dd className="todo">{t('legal.toCompleteHosting')}</dd>
          </dl>
        </div>
      </Section>
    </>
  );
}
