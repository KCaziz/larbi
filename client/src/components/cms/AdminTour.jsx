import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/useAuth.js';
import { adminNavItems } from '../../config/adminNav.js';
import Button from '../ui/Button.jsx';

const STORAGE_PREFIX = 'admin-tour-seen:';

// One slide per entry of the real admin menu (config/adminNav.js): if a section
// is added there, it appears here automatically. Only the one-line explanation
// is written by hand, keyed by the same `to` path.
const STEP_BODY_KEY = {
  '/admin': 'dashboard',
  '/admin/formations': 'formations',
  '/admin/articles': 'articles',
  '/admin/newsletter': 'newsletter',
  '/admin/media': 'media',
  '/admin/certificates': 'certificates',
  '/admin/users': 'users',
  '/admin/settings': 'settings',
};

// First-connection guided tour of the admin: a short walkthrough of the real
// menu entries, shown once per administrator (kept in localStorage, scoped to
// their account, so it comes back for a second admin on the same browser, and
// again if they clear their browser data — a per-viewer convenience, not a
// record the server needs to keep). Reachable again from "?" in the CMS menu.
export default function AdminTour() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const key = user ? STORAGE_PREFIX + user.id : null;
  // Read once, at mount, whether this admin already dismissed the tour: RequireRole
  // already waited for `user` before mounting this component, so `key` is settled
  // by the first render — no effect needed just to seed the initial state.
  // It only opens itself on the dashboard (`/admin`): an admin who lands straight
  // on a sub-page (a bookmark, a deep link) is never interrupted by a modal
  // sitting on top of the page they actually came for — "?" opens it any time.
  const [open, setOpen] = useState(() => {
    if (!key || pathname !== '/admin') return false;
    try {
      return localStorage.getItem(key) !== 'true';
    } catch {
      // Private browsing / blocked storage: no tour rather than a crash: it is
      // only a convenience, never something the page depends on.
      return false;
    }
  });
  const [step, setStep] = useState(0);
  const ref = useRef(null);
  const steps = adminNavItems.filter((item) => STEP_BODY_KEY[item.to]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setStep(0);
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const finish = () => {
    setOpen(false);
    try {
      if (key) localStorage.setItem(key, 'true');
    } catch {
      // Same as above: nothing to do if storage is unavailable.
    }
  };

  if (!key) return null;
  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <>
      <button type="button" className="cms-tour-reopen" onClick={() => setOpen(true)} aria-label={t('admin.tour.reopen')} title={t('admin.tour.reopen')}>
        ?
      </button>
      <dialog ref={ref} className="cms-dialog cms-tour" onCancel={(event) => { event.preventDefault(); finish(); }}>
        {current && (
          <>
            <p className="cms-tour-progress">{t('admin.tour.progress', { step: step + 1, total: steps.length })}</p>
            <h2>
              <current.icon size={22} strokeWidth={1.7} aria-hidden="true" />
              {t(current.labelKey)}
            </h2>
            <p className="cms-tour-body">{t(`admin.tour.steps.${STEP_BODY_KEY[current.to]}`)}</p>
            <div className="cms-dialog-actions">
              <Button variant="secondary" onClick={finish}>
                {t('admin.tour.skip')}
              </Button>
              <div className="cms-row-actions">
                {step > 0 && (
                  <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                    {t('admin.tour.previous')}
                  </Button>
                )}
                <Button onClick={() => (last ? finish() : setStep((s) => s + 1))}>
                  {last ? t('admin.tour.finish') : t('admin.tour.next')}
                </Button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
