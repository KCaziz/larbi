import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button.jsx';
import FileUpload from './FileUpload.jsx';

// Single image with preview, replace and remove.
// `media` = { url, originalName } from the API; the URL is an authorised admin
// route, the storage path itself is never exposed.
export default function ImageField({ media, onUpload, onRemove, addLabel, replaceLabel, removeLabel, alt }) {
  const { t } = useTranslation();

  return (
    <div className="cms-image-field">
      {media && (
        <div className="cms-image-preview">
          <img src={media.url} alt={alt ?? media.originalName} />
        </div>
      )}
      <div className="cms-image-actions">
        <FileUpload
          label={media ? replaceLabel : addLabel}
          accept="image/png,image/jpeg,image/webp"
          onUpload={onUpload}
        />
        {media && (
          <Button variant="ghost" onClick={onRemove}>
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
            {removeLabel ?? t('admin.info.coverRemove')}
          </Button>
        )}
      </div>
    </div>
  );
}
