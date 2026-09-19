import { FileText, Film, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ICONS = { video: Film, document: FileText, image: ImageIcon };

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Files attached to a content item, with in-place preview for videos/images.
export default function MediaList({ items, onRemove, busyId }) {
  const { t } = useTranslation();
  if (!items.length) return <p className="cms-muted">{t('admin.course.noFiles')}</p>;

  return (
    <ul className="cms-media-list">
      {items.map((media) => {
        const Icon = ICONS[media.kind] ?? FileText;
        return (
          <li key={media.id}>
            <div className="cms-media-row">
              <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
              <span className="cms-media-name">
                <strong>{media.originalName}</strong>
                <small>
                  {t(`admin.course.kind.${media.kind}`)} · {formatSize(media.sizeBytes)}
                </small>
              </span>
              <button
                type="button"
                className="cms-icon-button danger"
                onClick={() => onRemove(media)}
                disabled={busyId === media.id}
                aria-label={`${t('admin.course.removeFile')} : ${media.originalName}`}
                title={t('admin.course.removeFile')}
              >
                <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
            {media.kind === 'video' && <video className="cms-media-preview" src={media.url} controls preload="metadata" />}
            {media.kind === 'image' && <img className="cms-media-preview" src={media.url} alt={media.originalName} />}
          </li>
        );
      })}
    </ul>
  );
}
