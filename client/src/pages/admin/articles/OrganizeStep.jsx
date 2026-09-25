import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import { accountTypeLabel, useAccountTypes } from '../../../lib/accountTypes.js';
import Button from '../../../components/ui/Button.jsx';
import Field from '../../../components/cms/Field.jsx';
import TagInput from '../../../components/cms/TagInput.jsx';

// Step 3: where the article is filed (category, keywords) and how search engines
// present it (optional: without them the title and summary are used).
export default function OrganizeStep({ draft, setField, categories, suggestions, onCategoryCreated }) {
  const { t } = useTranslation();
  const accountTypes = useAccountTypes();
  const [newCategory, setNewCategory] = useState(null); // null = closed, string = name being typed
  const [categoryError, setCategoryError] = useState(null);

  const addCategory = async () => {
    if (!newCategory?.trim()) return;
    setCategoryError(null);
    try {
      const { category } = await api.post('/admin/article-categories', { name: newCategory });
      onCategoryCreated(category);
      setNewCategory(null);
    } catch (err) {
      setCategoryError(t(errorKey(err)));
    }
  };

  return (
    <div className="cms-form">
      <Field label={t('admin.info.category')} htmlFor="a-category">
        <select id="a-category" value={draft.categoryId} onChange={(e) => setField('categoryId', e.target.value)}>
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

      <Field label={t('admin.articles.organize.tags')} htmlFor="a-tags" hint={t('admin.articles.organize.tagsHint')}>
        <TagInput id="a-tags" value={draft.tags} onChange={(tags) => setField('tags', tags)} suggestions={suggestions} describedBy="a-tags-hint" />
      </Field>

      <fieldset className="cms-fieldset">
        <legend>{t('admin.articles.organize.accessTitle')}</legend>
        <p className="cms-muted">{t('admin.articles.organize.accessIntro')}</p>
        <Field label={t('admin.articles.organize.level')} htmlFor="a-level" hint={t('admin.articles.organize.levelHint')}>
          <select id="a-level" value={draft.requiredAccessLevel} onChange={(e) => setField('requiredAccessLevel', e.target.value)} aria-describedby="a-level-hint">
            <option value="standard">{t('admin.articles.organize.levelStandard')}</option>
            <option value="premium">{t('admin.articles.organize.levelPremium')}</option>
          </select>
        </Field>
        <fieldset className="cms-checks">
          <legend>{t('admin.articles.organize.audience')}</legend>
          <small className="form-hint">{t('admin.articles.organize.audienceHint')}</small>
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
      </fieldset>

      <fieldset className="cms-fieldset">
        <legend>{t('admin.articles.organize.seoTitle')}</legend>
        <p className="cms-muted">{t('admin.articles.organize.seoIntro')}</p>
        <Field label={t('admin.articles.organize.metaTitle')} htmlFor="a-meta-title" hint={t('admin.articles.organize.metaTitleHint')}>
          <input
            id="a-meta-title"
            type="text"
            maxLength={70}
            value={draft.metaTitle}
            onChange={(e) => setField('metaTitle', e.target.value)}
            aria-describedby="a-meta-title-hint"
          />
        </Field>
        <Field label={t('admin.articles.organize.metaDescription')} htmlFor="a-meta-desc" hint={t('admin.articles.organize.metaDescriptionHint')}>
          <textarea
            id="a-meta-desc"
            rows={3}
            maxLength={170}
            value={draft.metaDescription}
            onChange={(e) => setField('metaDescription', e.target.value)}
            aria-describedby="a-meta-desc-hint"
          />
        </Field>
      </fieldset>
    </div>
  );
}
