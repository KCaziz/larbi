import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleHelp, TriangleAlert } from 'lucide-react';
import './ConfirmDialog.css';

// The application's own confirmation window (recette R18, 2026-11-18: « les
// alertes de confirmation sont celles par défaut du navigateur, crée des
// alertes plus belles »). Built on the browser's <dialog>: the focus stays
// inside, Échap cancels, the page behind cannot be clicked — and it wears the
// colours of the site in both themes, in every language, right to left too.
//
// Anywhere in the code:  if (await askConfirm(t('…'), { danger: true })) …
const EVENT = 'fincludia:confirm';
let mounted = false;

export function askConfirm(message, { title, confirmLabel, danger = true } = {}) {
  // No window on the page (should not happen): the browser's own question.
  if (!mounted) return Promise.resolve(window.confirm(message));
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, title, confirmLabel, danger, resolve } }));
  });
}

export default function ConfirmHost() {
  const { t } = useTranslation();
  const [request, setRequest] = useState(null);
  const dialog = useRef(null);

  useEffect(() => {
    mounted = true;
    const open = (event) => setRequest((current) => {
      // One question at a time: a second one answers « non » to the first.
      current?.resolve(false);
      return event.detail;
    });
    window.addEventListener(EVENT, open);
    return () => {
      mounted = false;
      window.removeEventListener(EVENT, open);
    };
  }, []);

  useEffect(() => {
    const node = dialog.current;
    if (request && node && !node.open) node.showModal?.();
  }, [request]);

  const answer = (value) => {
    request?.resolve(value);
    dialog.current?.close?.();
    setRequest(null);
  };

  if (!request) return null;
  const Icon = request.danger ? TriangleAlert : CircleHelp;
  return (
    <dialog
      ref={dialog}
      className={`confirm-dialog${request.danger ? ' confirm-danger' : ''}`}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-text"
      onCancel={(event) => {
        event.preventDefault();
        answer(false);
      }}
      onClick={(event) => {
        // A click on the dimmed backdrop (the <dialog> itself) cancels.
        if (event.target === dialog.current) answer(false);
      }}
    >
      <div className="confirm-dialog-body">
        <span className="confirm-dialog-icon" aria-hidden="true">
          <Icon size={24} />
        </span>
        <h2 id="confirm-dialog-title">{request.title ?? t('confirm.title')}</h2>
        <p id="confirm-dialog-text">{request.message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-cancel" onClick={() => answer(false)} autoFocus>
            {t('confirm.cancel')}
          </button>
          <button type="button" className="confirm-dialog-ok" onClick={() => answer(true)}>
            {request.confirmLabel ?? t('confirm.yes')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
