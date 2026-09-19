import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button.jsx';

// Modal confirmation built on the native <dialog> (focus trap, Esc to close,
// screen-reader friendly). Every destructive action in the CMS goes through it.
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel,
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  const { t } = useTranslation();
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="cms-dialog" onCancel={(event) => { event.preventDefault(); onCancel(); }}>
      <form
        method="dialog"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm();
        }}
      >
        <h2>{title}</h2>
        <div className="cms-dialog-body">{children}</div>
        <div className="cms-dialog-actions">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel ?? t('admin.confirm.cancel')}
          </Button>
          <Button type="submit" className={danger ? 'btn-danger' : ''} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
