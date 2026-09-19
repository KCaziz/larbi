import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from './ConfirmDialog.jsx';

// Warns before losing unsaved work: closing/reloading the tab (browser prompt)
// and leaving the page through a link (our own dialog, in the author's language).
export default function UnsavedChangesGuard({ dirty }) {
  const { t } = useTranslation();
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      title={t('admin.unsaved.title')}
      confirmLabel={t('admin.unsaved.leave')}
      cancelLabel={t('admin.unsaved.stay')}
      danger
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    >
      <p>{t('admin.unsaved.body')}</p>
    </ConfirmDialog>
  );
}
