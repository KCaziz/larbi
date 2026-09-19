import { CircleCheck, CircleDashed } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CONFIG = {
  draft: { icon: CircleDashed, tone: 'draft' },
  published: { icon: CircleCheck, tone: 'published' },
};

// "Brouillon" / "Publié" — same wording for every kind of content.
// "labelKey" lets a kind of content use its own wording (e.g. "Publié" for an article).
export default function StatusBadge({ status, labelKey }) {
  const { t } = useTranslation();
  const { icon: Icon, tone } = CONFIG[status] ?? CONFIG.draft;
  return (
    <span className={`cms-badge cms-badge-${tone}`}>
      <Icon size={14} strokeWidth={2} aria-hidden="true" />
      {t(labelKey ?? `admin.status.${status}`)}
    </span>
  );
}
