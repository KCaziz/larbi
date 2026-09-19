import { CircleCheck, CircleDashed } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CONFIG = {
  draft: { icon: CircleDashed, tone: 'draft' },
  published: { icon: CircleCheck, tone: 'published' },
};

// "Brouillon" / "Publié" — same wording for every kind of content.
export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const { icon: Icon, tone } = CONFIG[status] ?? CONFIG.draft;
  return (
    <span className={`cms-badge cms-badge-${tone}`}>
      <Icon size={14} strokeWidth={2} aria-hidden="true" />
      {t(`admin.status.${status}`)}
    </span>
  );
}
