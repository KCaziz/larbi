import { useTranslation } from 'react-i18next';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function LegalNoticePage() {
  const { t } = useTranslation();

  return (
    <section className="page-section legal-page">
      <h1>{t('legal.title')}</h1>
      <Notice variant="action-needed">{t('legal.notice')}</Notice>

      <h2>{t('legal.editorTitle')}</h2>
      <dl>
        <dt>{t('legal.fields.companyName')}</dt>
        <dd>{t('legal.toComplete')}</dd>
        <dt>{t('legal.fields.legalForm')}</dt>
        <dd>{t('legal.toCompleteShort')}</dd>
        <dt>{t('legal.fields.siret')}</dt>
        <dd>{t('legal.toCompleteShort')}</dd>
        <dt>{t('legal.fields.address')}</dt>
        <dd>{t('legal.toCompleteShort')}</dd>
        <dt>{t('legal.fields.publisher')}</dt>
        <dd>{t('legal.toCompleteShort')}</dd>
        <dt>{t('legal.fields.contact')}</dt>
        <dd>{t('legal.toCompleteShort')}</dd>
      </dl>

      <h2>{t('legal.hostingTitle')}</h2>
      <dl>
        <dt>{t('legal.hostingField')}</dt>
        <dd>{t('legal.toCompleteHosting')}</dd>
      </dl>
    </section>
  );
}
