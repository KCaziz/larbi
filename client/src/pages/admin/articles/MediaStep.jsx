import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../../../lib/api.js';
import FileUpload from '../../../components/cms/FileUpload.jsx';
import ImageField from '../../../components/cms/ImageField.jsx';
import MediaList from '../../../components/cms/MediaList.jsx';

// Step 2: the cover image and the files shown under the text. Both are saved
// immediately (like the files of a course), independently of the text.
export default function MediaStep({ article, onChanged }) {
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const remove = async (media) => {
    setError(null);
    setRemovingId(media.id);
    try {
      await api.delete(`/admin/media/${media.id}`);
      await onChanged();
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="cms-form">
      <div className="form-field cms-field">
        <span className="cms-label">{t('admin.articles.media.cover')}</span>
        <small className="form-hint">{t('admin.articles.media.coverHint')}</small>
        <ImageField
          media={article.cover}
          alt={t('admin.articles.media.cover')}
          addLabel={t('admin.info.coverAdd')}
          replaceLabel={t('admin.info.coverReplace')}
          removeLabel={t('admin.info.coverRemove')}
          onUpload={async (file) => {
            await api.upload(`/admin/articles/${article.id}/cover`, file);
            await onChanged();
          }}
          onRemove={() => remove(article.cover)}
        />
      </div>

      <div className="form-field cms-field">
        <span className="cms-label">{t('admin.articles.media.files')}</span>
        <small className="form-hint">{t('admin.articles.media.filesHint')}</small>
        <MediaList items={article.media} onRemove={remove} busyId={removingId} />
        <FileUpload
          label={t('admin.course.upload')}
          accept="video/mp4,video/webm,application/pdf,image/png,image/jpeg,image/webp"
          onUpload={async (file) => {
            await api.upload(`/admin/articles/${article.id}/media`, file);
            await onChanged();
          }}
        />
      </div>

      {error && (
        <p className="form-status form-status-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
