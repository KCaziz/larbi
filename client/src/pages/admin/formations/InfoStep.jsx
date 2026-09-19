import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import Button from '../../../components/ui/Button.jsx';
import Field from '../../../components/cms/Field.jsx';
import ImageField from '../../../components/cms/ImageField.jsx';

export default function InfoStep({ draft, setField, titleError, formation, categories, onCategoryCreated, onChanged }) {
  const { t } = useTranslation();
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
