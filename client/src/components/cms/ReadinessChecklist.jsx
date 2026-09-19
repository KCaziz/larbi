import { CircleCheck, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button.jsx';

// "What is left to do before publishing", in plain words. `items` comes from
// the server ([{ key, ok }]); the same rules make the server refuse a premature
// publication. `onGo(key)` lets the author jump to the step that fixes an item.
// `prefix`: where the wording of each item lives (each kind of content has its own).
export default function ReadinessChecklist({ items, onGo, prefix = 'admin.readiness' }) {
  const { t } = useTranslation();

  return (
    <ul className="cms-checklist">
      {items.map((item) => (
        <li key={item.key} className={item.ok ? 'ok' : 'todo'}>
          {item.ok ? (
            <CircleCheck size={20} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Circle size={20} strokeWidth={1.75} aria-hidden="true" />
          )}
          <span>
            {t(`${prefix}.${item.key}`)}
            <span className="sr-only">{item.ok ? ` (${t('admin.readiness.done')})` : ` (${t('admin.readiness.todo')})`}</span>
          </span>
          {!item.ok && onGo && (
            <Button variant="ghost" onClick={() => onGo(item.key)}>
              {t('admin.publish.goTo')}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
