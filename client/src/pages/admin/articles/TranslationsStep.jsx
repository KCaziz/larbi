import { useState } from 'react';
import { Check, Languages, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import { CONTENT_LANGUAGES, textDirection } from '../../../lib/contentLanguage.js';
import Button from '../../../components/ui/Button.jsx';
import ConfirmDialog from '../../../components/cms/ConfirmDialog.jsx';
import Field from '../../../components/cms/Field.jsx';
import RichTextEditor from '../../../components/cms/RichTextEditor.jsx';
import Notice from '../../../components/ui/Notice.jsx';

const BLANK = { title: '', excerpt: '', body: '', metaTitle: '', metaDescription: '' };

const fromServer = (translation) => ({
  title: translation.title,
  excerpt: translation.excerpt,
  body: translation.body ?? '',
  metaTitle: translation.metaTitle ?? '',
  metaDescription: translation.metaDescription ?? '',
});

// One language: written from scratch (or edited) here, saved on its own. Nothing
// but the text depends on the language: cover, files, tags, category, status and
// access level are the article's and shared.
function TranslationCard({ article, language, existing, onChanged }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [resetKey, setResetKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const base = `/admin/articles/${article.id}/translations/${language}`;
  const id = `tr-${language}`;
  const set = (name, value) => {
    setMessage(null);
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toggle = async () => {
    if (open) return setOpen(false);
    setOpen(true);
    setMessage(null);
    if (!existing) {
      setForm(BLANK);
      setResetKey((k) => k + 1);
      return undefined;
    }
    setLoading(true);
    try {
      const { translation } = await api.get(`/admin/articles/${article.id}/translations/${language}`);
      setForm(fromServer(translation));
      setResetKey((k) => k + 1);
    } catch (err) {
      setMessage({ type: 'error', text: t(errorKey(err)) });
    } finally {
      setLoading(false);
    }
    return undefined;
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.body) return setMessage({ type: 'error', text: t('admin.articles.translations.required') });
    setSaving(true);
    setMessage(null);
    try {
      const { translation } = await api.put(base, form);
      setForm(fromServer(translation));
      setResetKey((k) => k + 1); // show the text as cleaned by the server
      setMessage({ type: 'success', text: t('admin.articles.translations.saved') });
      await onChanged();
    } catch (err) {
      setMessage({ type: 'error', text: t(err?.status === 400 ? 'admin.articles.translations.required' : errorKey(err)) });
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  const remove = async () => {
    setSaving(true);
    try {
      await api.delete(base);
      setAskDelete(false);
      setOpen(false);
      await onChanged();
    } catch (err) {
      setMessage({ type: 'error', text: t(errorKey(err)) });
      setAskDelete(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="cms-card cms-translation" aria-labelledby={`${id}-title`}>
      <div className="cms-translation-head">
        <h2 id={`${id}-title`}>{t(`contentLanguage.names.${language}`)}</h2>
        <span className={`cms-badge ${existing ? 'cms-badge-published' : 'cms-badge-draft'}`}>
          {existing ? <Check size={13} strokeWidth={2.4} aria-hidden="true" /> : null}
          {existing ? t('admin.articles.translations.done') : t('admin.articles.translations.missing')}
        </span>
        <Button variant="secondary" onClick={toggle} aria-expanded={open} aria-controls={`${id}-form`}>
          <Pencil size={15} strokeWidth={1.9} aria-hidden="true" />
          {existing ? t('admin.articles.translations.edit') : t('admin.articles.translations.add')}
        </Button>
      </div>

      {open && (
        <form id={`${id}-form`} className="cms-form" onSubmit={save} noValidate dir={textDirection(language)} lang={language}>
          {loading ? (
            <p className="cms-muted">{t('state.loading')}</p>
          ) : (
            <>
              <Field label={t('admin.articles.content.title')} htmlFor={`${id}-t`}>
                <input id={`${id}-t`} type="text" maxLength={150} value={form.title} onChange={(e) => set('title', e.target.value)} />
              </Field>
              <Field label={t('admin.articles.content.excerpt')} htmlFor={`${id}-e`} hint={t('admin.articles.content.excerptHint')}>
                <textarea id={`${id}-e`} rows={3} maxLength={300} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} aria-describedby={`${id}-e-hint`} />
              </Field>
              <div className="form-field cms-field">
                <label htmlFor={`${id}-b`}>{t('admin.articles.content.body')}</label>
                <RichTextEditor id={`${id}-b`} value={form.body} resetKey={resetKey} onChange={(html) => set('body', html)} />
              </div>
              <Field label={t('admin.articles.organize.metaTitle')} htmlFor={`${id}-mt`}>
                <input id={`${id}-mt`} type="text" maxLength={70} value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} />
              </Field>
              <Field label={t('admin.articles.organize.metaDescription')} htmlFor={`${id}-md`}>
                <textarea id={`${id}-md`} rows={2} maxLength={170} value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
              </Field>
              {message && (
                <p className={`cms-inline-message ${message.type === 'error' ? 'error' : 'ok'}`} role={message.type === 'error' ? 'alert' : 'status'} dir="auto">
                  {message.text}
                </p>
              )}
              <div className="cms-row-actions">
                <Button type="submit" disabled={saving}>
                  {saving ? t('state.sending') : t('admin.articles.translations.save')}
                </Button>
                {existing && (
                  <Button variant="secondary" onClick={() => setAskDelete(true)} disabled={saving}>
                    <Trash2 size={15} strokeWidth={1.9} aria-hidden="true" />
                    {t('admin.articles.translations.delete')}
                  </Button>
                )}
              </div>
            </>
          )}
        </form>
      )}

      <ConfirmDialog
        open={askDelete}
        title={t('admin.articles.translations.deleteTitle')}
        confirmLabel={t('admin.articles.translations.delete')}
        danger
        busy={saving}
        onConfirm={remove}
        onCancel={() => !saving && setAskDelete(false)}
      >
        <p>{t('admin.articles.translations.deleteBody', { language: t(`contentLanguage.names.${language}`) })}</p>
      </ConfirmDialog>
    </section>
  );
}

// Step "Traductions": the article is written in one language; the author can
// translate it into the others when there is time. A visitor gets the translation
// in the language they browse in, and the written language when there is none.
export default function TranslationsStep({ article, languageUnsaved, onChanged }) {
  const { t } = useTranslation();
  const others = CONTENT_LANGUAGES.filter((code) => code !== article.language);
  const translated = new Set(article.translations.map((tr) => tr.language));

  return (
    <div className="cms-form">
      <p className="cms-intro">
        <Languages size={16} strokeWidth={1.9} aria-hidden="true" />{' '}
        {t('admin.articles.translations.intro', { language: t(`contentLanguage.names.${article.language}`) })}
      </p>
      {languageUnsaved && <Notice variant="info">{t('admin.articles.translations.languageUnsaved')}</Notice>}
      {others.map((code) => (
        <TranslationCard key={code} article={article} language={code} existing={translated.has(code)} onChanged={onChanged} />
      ))}
    </div>
  );
}
