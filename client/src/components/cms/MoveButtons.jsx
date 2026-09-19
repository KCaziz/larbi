import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Up / down buttons to reorder a list (simpler and more accessible than
// drag-and-drop for non-technical users).
export default function MoveButtons({ index, count, onMove, upLabel, downLabel, disabled }) {
  const { t } = useTranslation();
  return (
    <span className="cms-move">
      <button
        type="button"
        className="cms-icon-button"
        onClick={() => onMove(index, index - 1)}
        disabled={disabled || index === 0}
        aria-label={upLabel ?? t('admin.courses.moveUp')}
        title={upLabel ?? t('admin.courses.moveUp')}
      >
        <ChevronUp size={18} strokeWidth={1.9} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="cms-icon-button"
        onClick={() => onMove(index, index + 1)}
        disabled={disabled || index === count - 1}
        aria-label={downLabel ?? t('admin.courses.moveDown')}
        title={downLabel ?? t('admin.courses.moveDown')}
      >
        <ChevronDown size={18} strokeWidth={1.9} aria-hidden="true" />
      </button>
    </span>
  );
}
