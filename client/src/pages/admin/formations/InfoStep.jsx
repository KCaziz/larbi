import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import { accountTypeLabel, useAccountTypes } from '../../../lib/accountTypes.js';
import Button from '../../../components/ui/Button.jsx';
import Field from '../../../components/cms/Field.jsx';
import ImageField from '../../../components/cms/ImageField.jsx';
import LinesInput from '../../../components/cms/LinesInput.jsx';

// The client's six educational profiles (P8-17), in his order.
const EDUCATION_PROFILES = ['LYC', 'ETU', 'JAC', 'SAL', 'EPG', 'AUT'];

export default function InfoStep({ draft, setField, titleError, formation, categories, onCategoryCreated, onChanged }) {
  const { t } = useTranslation();
  const profileLabel = (code) => (t('account.fin.publics', { returnObjects: true }).find((row) => row.code === code)?.label ?? code);
  const accountTypes = useAccountTypes();
  const [newCategory, setNewCategory] = useState(null); // null = closed, string = name being typed
  const [categoryError, setCategoryError] = useState(null);
  const [coverError, setCoverError] = useState(null);

  const addCategory = async () => {
    if (!newCategory?.trim()) return;
    setCategoryError(null);
    try {
      const { category } = await api.post('/admin/categories', { name: newCategory });
      onCategoryCreated(category);
      setNewCategory(null);
    } catch (err) {
      setCategoryError(t(errorKey(err)));
    }
  };

  const removeCover = async () => {
    setCoverError(null);
    try {
      await api.delete(`/admin/media/${formation.cover.id}`);
      await onChanged();
    } catch (err) {
      setCoverError(t(errorKey(err)));
    }
  };

  return (
    <div className="cms-form">
      <Field label={t('admin.info.title')} htmlFor="f-title" hint={t('admin.info.titleHint')} error={titleError}>
        <input
          id="f-title"
          type="text"
          maxLength={150}
          value={draft.title}
          onChange={(e) => setField('title', e.target.value)}
          aria-describedby="f-title-hint"
        />
      </Field>

      <Field label={t('admin.info.subtitle')} htmlFor="f-subtitle" hint={t('admin.info.subtitleHint')}>
        <input
          id="f-subtitle"
          type="text"
          maxLength={160}
          value={draft.subtitle}
          onChange={(e) => setField('subtitle', e.target.value)}
          aria-describedby="f-subtitle-hint"
        />
      </Field>

      <Field label={t('admin.info.description')} htmlFor="f-description" hint={t('admin.info.descriptionHint')}>
        <textarea
          id="f-description"
          rows={5}
          maxLength={2000}
          value={draft.description}
          onChange={(e) => setField('description', e.target.value)}
          aria-describedby="f-description-hint"
        />
      </Field>

      <fieldset className="cms-fieldset">
        <legend>{t('admin.info.pedagogyTitle')}</legend>
        <Field label={t('admin.info.level')} htmlFor="f-level" hint={t('admin.info.levelHint')}>
          <select id="f-level" value={draft.level} onChange={(e) => setField('level', e.target.value)} aria-describedby="f-level-hint">
            <option value="">{t('admin.info.levelNone')}</option>
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <option key={level} value={level}>
                {t(`learn.level.${level}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('admin.info.objectives')} htmlFor="f-objectives" hint={t('admin.info.objectivesHint')}>
          <LinesInput id="f-objectives" value={draft.objectives} onChange={(v) => setField('objectives', v)} placeholder={t('admin.info.objectivesPlaceholder')} describedBy="f-objectives-hint" />
        </Field>
        <Field label={t('admin.info.prerequisites')} htmlFor="f-prerequisites" hint={t('admin.info.prerequisitesHint')}>
          <LinesInput id="f-prerequisites" value={draft.prerequisites} onChange={(v) => setField('prerequisites', v)} placeholder={t('admin.info.prerequisitesPlaceholder')} describedBy="f-prerequisites-hint" />
        </Field>
        <p className="cms-muted">{t('admin.info.duration', { count: formation.totalMinutes })}</p>
      </fieldset>

      <Field label={t('admin.info.category')} htmlFor="f-category">
        <select id="f-category" value={draft.categoryId} onChange={(e) => setField('categoryId', e.target.value)}>
          <option value="">{t('admin.info.categoryNone')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {newCategory === null ? (
          <Button variant="ghost" onClick={() => setNewCategory('')}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            {t('admin.info.categoryNew')}
          </Button>
        ) : (
          <div className="cms-inline-add">
            <input
              type="text"
              maxLength={80}
              aria-label={t('admin.info.categoryNewLabel')}
              placeholder={t('admin.info.categoryNewLabel')}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCategory();
                }
              }}
            />
            <Button onClick={addCategory}>{t('admin.info.categoryAdd')}</Button>
            <Button variant="secondary" onClick={() => setNewCategory(null)}>
              {t('admin.confirm.cancel')}
            </Button>
          </div>
        )}
        {categoryError && (
          <small className="form-hint form-hint-error" role="alert">
            {categoryError}
          </small>
        )}
      </Field>

      <Field label={t('admin.info.access')} htmlFor="f-access">
        <select id="f-access" value={draft.requiredAccessLevel} onChange={(e) => setField('requiredAccessLevel', e.target.value)}>
          <option value="standard">{t('admin.info.accessStandard')}</option>
          <option value="premium">{t('admin.info.accessPremium')}</option>
        </select>
      </Field>

      {/* P8-17: the client's educational profiles it is recommended to.
          None ticked = recommended to everyone. */}
      <fieldset className="cms-fieldset">
        <legend>{t('admin.info.educationProfiles')}</legend>
        <small className="form-hint">{t('admin.info.educationProfilesHint')}</small>
        {EDUCATION_PROFILES.map((code) => (
          <label key={code} className="cms-check">
            <input
              type="checkbox"
              checked={draft.educationProfiles.includes(code)}
              onChange={(e) =>
                setField('educationProfiles', e.target.checked ? [...draft.educationProfiles, code] : draft.educationProfiles.filter((v) => v !== code))
              }
            />
            {profileLabel(code)}
          </label>
        ))}
      </fieldset>

      <fieldset className="cms-fieldset">
        <legend>{t('admin.info.audience')}</legend>
        <small className="form-hint">{t('admin.info.audienceHint')}</small>
        {accountTypes.types.map((type) => (
          <label key={type.value} className="cms-check">
            <input
              type="checkbox"
              checked={draft.targetAccountTypes.includes(type.value)}
              onChange={(e) =>
                setField(
                  'targetAccountTypes',
                  e.target.checked ? [...draft.targetAccountTypes, type.value] : draft.targetAccountTypes.filter((v) => v !== type.value),
                )
              }
            />
            {accountTypeLabel(type)}
          </label>
        ))}
      </fieldset>

      <div className="form-field cms-field">
        <span className="cms-label" id="f-cover-label">
          {t('admin.info.cover')}
        </span>
        <small className="form-hint">{t('admin.info.coverHint')}</small>
        <ImageField
          media={formation.cover}
          alt={t('admin.info.cover')}
          addLabel={t('admin.info.coverAdd')}
          replaceLabel={t('admin.info.coverReplace')}
          removeLabel={t('admin.info.coverRemove')}
          onUpload={async (file) => {
            await api.upload(`/admin/formations/${formation.id}/cover`, file);
            await onChanged();
          }}
          onRemove={removeCover}
        />
        {coverError && (
          <small className="form-hint form-hint-error" role="alert">
            {coverError}
          </small>
        )}
      </div>
    </div>
  );
}
