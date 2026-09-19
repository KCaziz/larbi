import { useTranslation } from 'react-i18next';
import Field from '../../../components/cms/Field.jsx';
import RichTextEditor from '../../../components/cms/RichTextEditor.jsx';

// Step 1: what the article says.
export default function ContentStep({ draft, setField, titleError, resetKey }) {
  const { t } = useTranslation();

  return (
    <div className="cms-form">
      <Field label={t('admin.articles.content.title')} htmlFor="a-title" hint={t('admin.articles.content.titleHint')} error={titleError}>
        <input
          id="a-title"
          type="text"
          maxLength={150}
          value={draft.title}
          onChange={(e) => setField('title', e.target.value)}
          aria-describedby="a-title-hint"
        />
      </Field>

      <Field label={t('admin.articles.content.excerpt')} htmlFor="a-excerpt" hint={t('admin.articles.content.excerptHint')}>
        <textarea
          id="a-excerpt"
          rows={3}
          maxLength={300}
          value={draft.excerpt}
          onChange={(e) => setField('excerpt', e.target.value)}
          aria-describedby="a-excerpt-hint"
        />
      </Field>

      <div className="form-field cms-field">
        <label htmlFor="a-body">{t('admin.articles.content.body')}</label>
        <small id="a-body-hint" className="form-hint">
          {t('admin.articles.content.bodyHint')}
        </small>
        <RichTextEditor id="a-body" describedBy="a-body-hint" value={draft.body} resetKey={resetKey} onChange={(html) => setField('body', html)} />
      </div>
    </div>
  );
}
