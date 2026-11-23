import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import './RegulatoryConfirm.css';

// P13-05 (2026-11-23): the regulatory values of the client's référentiel
// (taxes, social contributions, micro-importing, customs) are never applied
// from the workbook alone. The administration asks the client, in this window,
// to confirm each one — or correct it — with the date it applies from. It
// comes back at the next visit while a value is left; « Plus tard » hides it
// for this visit only.
const LATER = 'fincludia.regulatory.later';
const today = () => new Date().toISOString().slice(0, 10);

const readLater = () => {
  try {
    return sessionStorage.getItem(LATER) === '1';
  } catch {
    return false;
  }
};

// The value as the person types it: a rate in percent (0,5 → 0.005).
const shown = (param, i18n) => {
  if (param.candidate === null) return '';
  if (param.kind === 'rate') return new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 4 }).format(Number(param.candidate) * 100);
  return param.candidate;
};
const toSend = (param, text) => {
  if (param.kind !== 'rate') return text.trim();
  const number = Number(text.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(number) ? String(number / 100) : text.trim();
};

export default function RegulatoryConfirm() {
  const { t, i18n } = useTranslation();
  const list = useApi('/admin/regulatory-params');
  const [later, setLater] = useState(readLater);
  const [drafts, setDrafts] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(null);
  const dialog = useRef(null);

  const pending = (list.data?.params ?? []).filter((param) => param.status === 'pending');
  const open = !later && pending.length > 0;

  useEffect(() => {
    const node = dialog.current;
    if (open && node && !node.open) node.showModal?.();
    if (!open && node?.open) node.close?.();
  }, [open]);

  const draft = (param) => drafts[param.key] ?? { value: shown(param, i18n), from: today() };
  const edit = (param, change) => setDrafts((all) => ({ ...all, [param.key]: { ...draft(param), ...change } }));

  const postpone = () => {
    try {
      sessionStorage.setItem(LATER, '1');
    } catch {
      // A private window: the window simply comes back on the next page.
    }
    setLater(true);
  };

  const confirm = async (param) => {
    const { value, from } = draft(param);
    if (!value.trim() || !from) {
      setErrors((all) => ({ ...all, [param.key]: t('admin.regulatory.missing') }));
      return;
    }
    setBusy(param.key);
    setErrors((all) => ({ ...all, [param.key]: null }));
    try {
      await api.put(`/admin/regulatory-params/${param.key}`, { value: toSend(param, value), effectiveFrom: from });
      list.reload();
    } catch {
      setErrors((all) => ({ ...all, [param.key]: t(`admin.regulatory.invalid.${param.kind}`) }));
    } finally {
      setBusy(null);
    }
  };

  if (!open) return null;
  return (
    <dialog
      ref={dialog}
      className="regulatory-dialog"
      aria-labelledby="regulatory-title"
      onCancel={(event) => {
        event.preventDefault();
        postpone();
      }}
    >
      <header className="regulatory-head">
        <span className="regulatory-icon" aria-hidden="true">
          <ShieldCheck size={24} />
        </span>
        <div>
          <h2 id="regulatory-title">{t('admin.regulatory.title')}</h2>
          <p>{t('admin.regulatory.intro', { count: pending.length })}</p>
        </div>
      </header>

      <ul className="regulatory-list">
        {pending.map((param) => {
          const current = draft(param);
          const id = `regulatory-${param.key}`;
          return (
            <li key={param.key} className="regulatory-item">
              <div className="regulatory-item-head">
                <strong>{t(`admin.regulatory.params.${param.key}.name`)}</strong>
                <span className="regulatory-group">{t(`admin.regulatory.groups.${param.group}`)}</span>
              </div>
              <p className="regulatory-proposed">
                {param.candidate === null ? t('admin.regulatory.noCandidate') : t('admin.regulatory.proposed', { value: param.kind === 'rate' ? `${shown(param, i18n)} %` : `${new Intl.NumberFormat(i18n.language).format(Number(param.candidate))} DZD` })}{' '}
                <a href={param.source} target="_blank" rel="noreferrer">
                  {t('admin.regulatory.source')} <ExternalLink size={12} aria-hidden="true" />
                </a>
              </p>
              <div className="regulatory-fields">
                <label htmlFor={`${id}-value`}>
                  {t(`admin.regulatory.value.${param.kind}`)}
                  {param.kind === 'text' ? (
                    <textarea id={`${id}-value`} rows={2} value={current.value} placeholder={t('admin.regulatory.textPlaceholder')} onChange={(event) => edit(param, { value: event.target.value })} />
                  ) : (
                    <input id={`${id}-value`} inputMode="decimal" value={current.value} onChange={(event) => edit(param, { value: event.target.value })} />
                  )}
                </label>
                <label htmlFor={`${id}-from`}>
                  {t('admin.regulatory.from')}
                  <input id={`${id}-from`} type="date" value={current.from} onChange={(event) => edit(param, { from: event.target.value })} />
                </label>
                <button type="button" className="regulatory-confirm" disabled={busy === param.key} onClick={() => confirm(param)}>
                  {t('admin.regulatory.confirm')}
                </button>
              </div>
              {errors[param.key] && (
                <p className="regulatory-error" role="alert">
                  {errors[param.key]}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <footer className="regulatory-foot">
        <p>{t('admin.regulatory.footnote')}</p>
        <button type="button" className="regulatory-later" onClick={postpone}>
          {t('admin.regulatory.later')}
        </button>
      </footer>
    </dialog>
  );
}
