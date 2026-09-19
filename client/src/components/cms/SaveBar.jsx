import { CircleAlert, CircleCheck, LoaderCircle, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button.jsx';

// Sticky "save" strip. Always tells the author where they stand:
// unsaved changes / saving / saved / could not save.
export default function SaveBar({ dirty, saving, saved, error, onSave, onDiscard, saveLabel }) {
  const { t } = useTranslation();

  let message = null;
  if (error) message = { icon: CircleAlert, tone: 'error', text: error };
  else if (saving) message = { icon: LoaderCircle, tone: 'busy', text: t('admin.save.saving') };
  else if (dirty) message = { icon: CircleAlert, tone: 'warn', text: t('admin.save.dirty') };
  else if (saved) message = { icon: CircleCheck, tone: 'ok', text: t('admin.save.saved') };

  return (
    <div className="cms-savebar" role="region" aria-label={t('admin.save.button')}>
      <p className={`cms-savebar-message ${message ? `is-${message.tone}` : ''}`} role="status">
        {message && (
          <>
            <message.icon size={16} strokeWidth={2} className={message.tone === 'busy' ? 'loading-spinner' : undefined} aria-hidden="true" />
            {message.text}
          </>
        )}
      </p>
      <div className="cms-savebar-actions">
        {onDiscard && (
          <Button variant="secondary" onClick={onDiscard} disabled={!dirty || saving}>
            {t('admin.save.discard')}
          </Button>
        )}
        <Button onClick={onSave} disabled={!dirty || saving}>
          <Save size={16} strokeWidth={1.9} aria-hidden="true" />
          {saveLabel ?? t('admin.save.button')}
        </Button>
      </div>
    </div>
  );
}
