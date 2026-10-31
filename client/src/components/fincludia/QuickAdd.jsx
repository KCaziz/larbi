import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { errorKey } from '../../lib/api.js';
import { useAuth } from '../../auth/useAuth.js';
import { Entry, useMovementLookups } from '../../pages/mouvements/MovementsPage.jsx';
import './QuickAdd.css';

// « Ajout rapide » (P8-24): on a phone, adding an expense or an income opens a
// SHEET that slides up over the page the person is on — the Accueil stays
// behind it, and is refreshed when the entry is saved — instead of taking them
// to the Mouvements page. On a computer the same buttons go to the page, which
// has room for the whole form.
//
// The sheet is decoupled from its openers by one window event, so a button
// anywhere (the top bar's +, the Accueil's shortcut) opens it without sharing
// state. Every opener is a REAL link to `/app/mouvements/nouveau`: with no
// script, with a middle-click, or on a computer, it simply navigates.
const OPEN_EVENT = 'fin:quick-add';
export const DATA_CHANGED_EVENT = 'fin:data-changed';
const PHONE = '(max-width: 767px)';

export const isPhone = () => typeof window !== 'undefined' && window.matchMedia?.(PHONE).matches === true;

/** A link to the full entry page that opens the sheet instead, on a phone. */
export function QuickAddLink({ children, ...props }) {
  return (
    <Link
      to="/app/mouvements/nouveau"
      {...props}
      onClick={(event) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        if (isPhone()) {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { opener: event.currentTarget } }));
        }
      }}
    >
      {children}
    </Link>
  );
}

/** Mounted once, in the application's layout. */
export default function QuickAdd() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const opener = useRef(null);

  useEffect(() => {
    const show = (event) => {
      // The button that asked: focus returns to it when the sheet closes.
      opener.current = event.detail?.opener ?? document.activeElement;
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const close = () => {
    setOpen(false);
    // Focus goes back to the button that opened the sheet.
    opener.current?.focus?.();
  };

  return (
    <>
      {notice && (
        <p className="quick-add-notice" role="status">
          {notice}
        </p>
      )}
      {open && <Sheet onClose={close} onSaved={(message) => { setNotice(message); window.dispatchEvent(new Event(DATA_CHANGED_EVENT)); setOpen(false); opener.current?.focus?.(); }} t={t} />}
    </>
  );
}

function Sheet({ onClose, onSaved, t }) {
  const { user } = useAuth();
  const { lookups } = useMovementLookups();
  const [message, setMessage] = useState(null);
  const sheet = useRef(null);
  const okKey = useRef(null);

  useEffect(() => {
    // Focus moves into the sheet; Escape closes it; the page behind does not scroll.
    sheet.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab' && sheet.current) {
        // A small focus trap: Tab cycles inside the sheet while it is open.
        const items = [...sheet.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  async function run(action, key) {
    setMessage(null);
    try {
      const data = await action();
      okKey.current = key;
      return { ok: true, data };
    } catch (err) {
      setMessage(t(errorKey(err, { 422: 'myMoney.errors.refused' })));
      return { ok: false };
    }
  }

  return (
    <div className="quick-add-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={sheet} className="quick-add-sheet" role="dialog" aria-modal="true" aria-labelledby="quick-add-title" tabIndex={-1}>
        <div className="quick-add-head">
          <h2 id="quick-add-title">{t('myMoney.addTitle')}</h2>
          <button type="button" className="quick-add-close" onClick={onClose} aria-label={t('appHome.quickAddClose')}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {message && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}
        <Entry currency={user?.finCurrency ?? 'DZD'} lookups={lookups} draft={null} run={run} onDone={() => onSaved(t(okKey.current ?? 'myMoney.added'))} />
        <Link to="/app/mouvements/nouveau" className="quick-add-full" onClick={onClose}>
          {t('appHome.quickAddFull')}
        </Link>
      </div>
    </div>
  );
}

