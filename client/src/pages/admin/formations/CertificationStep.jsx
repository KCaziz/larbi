import { useTranslation } from 'react-i18next';
import Field from '../../../components/cms/Field.jsx';

export default function CertificationStep({ draft, setField }) {
  const { t } = useTranslation();

  return (
    <div className="cms-form">
      <p className="cms-intro">{t('admin.certification.intro')}</p>

      <label className="cms-check">
        <input
          type="checkbox"
          checked={draft.certificationEnabled}
          onChange={(e) => setField('certificationEnabled', e.target.checked)}
        />
        <span>{t('admin.certification.enabled')}</span>
      </label>

      {draft.certificationEnabled ? (
        <>
          <Field label={t('admin.certification.name')} htmlFor="c-name" hint={t('admin.certification.nameHint')}>
            <input
              id="c-name"
              type="text"
              maxLength={150}
              value={draft.certificationTitle}
              onChange={(e) => setField('certificationTitle', e.target.value)}
              aria-describedby="c-name-hint"
            />
          </Field>
          <Field
            label={t('admin.certification.description')}
            htmlFor="c-description"
            hint={t('admin.certification.descriptionHint')}
          >
            <textarea
              id="c-description"
              rows={4}
              maxLength={1000}
              value={draft.certificationDescription}
              onChange={(e) => setField('certificationDescription', e.target.value)}
              aria-describedby="c-description-hint"
            />
          </Field>
        </>
      ) : (
        <p className="cms-muted">{t('admin.certification.disabledNote')}</p>
      )}
    </div>
  );
}
