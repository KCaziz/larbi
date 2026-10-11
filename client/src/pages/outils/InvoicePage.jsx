import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, FileSpreadsheet, Plus, Printer, Receipt, RotateCcw, Trash2 } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { contentLanguage } from '../../lib/contentLanguage.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Section from '../../components/ui/Section.jsx';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import InvoiceSheet from './InvoiceSheet.jsx';
import './Invoice.css';

// Invoice generator (P4-03). The person fills in the invoice; the SERVER checks
// it and computes every amount (integers, no floating point). The PDF is the
// printed sheet (browser "save as PDF", like the certificate); the Excel file is
// built by the server. Nothing is stored on the server: the form is kept as a
// draft in this browser only, for convenience.

const DRAFT_KEY = 'invoice-draft';
const MAX_LINES = 100;
const today = () => new Date().toISOString().slice(0, 10);
const emptyLine = () => ({ description: '', quantity: '1', unitPrice: '', vatRate: '0' });
const emptyForm = () => ({
  number: '',
  issueDate: today(),
  dueDate: '',
  currency: 'DZD',
  seller: { name: '', details: '' },
  buyer: { name: '', details: '' },
  lines: [emptyLine()],
  notes: '',
});

function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null');
    if (saved && Array.isArray(saved.lines) && saved.lines.length) return { ...emptyForm(), ...saved };
  } catch {
    /* storage unavailable or damaged: start from an empty invoice */
  }
  return emptyForm();
}

// Which message to show next to a field the server refused.
function fieldError(path) {
  if (path === 'dueDate') return 'invoice.errors.dueDate';
  if (path === 'total') return 'invoice.errors.total';
  if (path.endsWith('.quantity')) return 'invoice.errors.quantity';
  if (path.endsWith('.unitPrice')) return 'invoice.errors.unitPrice';
  if (path.endsWith('.vatRate')) return 'invoice.errors.vatRate';
  if (path === 'currency') return 'invoice.errors.currency';
  if (path === 'issueDate') return 'invoice.errors.date';
  return 'invoice.errors.required';
}

export default function InvoicePage() {
  const { t, i18n } = useTranslation();
  useDocumentMeta(t('invoice.title'), t('invoice.subtitle'));
  const [form, setForm] = useState(loadDraft);
  const [result, setResult] = useState(null); // the invoice as computed by the server
  const [errors, setErrors] = useState({}); // path -> i18n key
  const [status, setStatus] = useState(null); // { kind, text }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      /* storage unavailable: the draft is simply not kept */
    }
  }, [form]);

  // Any change makes the computed invoice out of date: it must be checked again.
  const update = (change) => {
    setForm((f) => change(f));
    setResult(null);
  };
  const set = (key, value) => update((f) => ({ ...f, [key]: value }));
  const setParty = (who, key, value) => update((f) => ({ ...f, [who]: { ...f[who], [key]: value } }));
  const setLine = (i, key, value) => update((f) => ({ ...f, lines: f.lines.map((l, j) => (j === i ? { ...l, [key]: value } : l)) }));

  const payload = () => ({ ...form, language: contentLanguage(i18n.language) ?? 'fr' });

  const calculate = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const { invoice } = await api.post('/tools/factures/calcul', payload());
      setResult(invoice);
      setErrors({});
    } catch (err) {
      const fields = err.details?.fields ?? [];
      setErrors(Object.fromEntries(fields.map((p) => [p, fieldError(p)])));
      setStatus({ kind: 'error', text: fields.length ? t('invoice.errors.summary') : t(errorKey(err)) });
    } finally {
      setBusy(false);
    }
  };

  const downloadExcel = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const blob = await api.download('/tools/factures/excel', payload());
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${(form.number || 'facture').replace(/[^A-Za-z0-9_-]+/g, '-')}.xlsx`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setStatus({ kind: 'error', text: t(errorKey(err)) });
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setForm(emptyForm());
    setResult(null);
    setErrors({});
    setStatus(null);
  };

  const err = (path) =>
    errors[path] ? (
      <small className="form-hint form-hint-error" role="alert">
        {t(errors[path])}
      </small>
    ) : null;

  return (
    <div className="invoice-page">
      <PageHeader icon={Receipt} title={t('invoice.title')} subtitle={t('invoice.subtitle')} />
      <Section>
        <form className="invoice-form" onSubmit={calculate} noValidate>
          <Notice variant="info">{t('invoice.privacy')}</Notice>

          <fieldset className="invoice-block">
            <legend>{t('invoice.document')}</legend>
            <div className="invoice-grid">
              <label>
                {t('invoice.number')}
                <input value={form.number} maxLength={40} onChange={(e) => set('number', e.target.value)} aria-invalid={Boolean(errors.number)} />
                {err('number')}
              </label>
              <label>
                {t('invoice.issueDate')}
                <input type="date" value={form.issueDate} onChange={(e) => set('issueDate', e.target.value)} aria-invalid={Boolean(errors.issueDate)} />
                {err('issueDate')}
              </label>
              <label>
                {t('invoice.dueDate')}
                <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} aria-invalid={Boolean(errors.dueDate)} />
                {err('dueDate')}
              </label>
              <label>
                {t('invoice.currency')}
                <input value={form.currency} maxLength={3} onChange={(e) => set('currency', e.target.value.toUpperCase())} aria-invalid={Boolean(errors.currency)} />
                <small className="form-hint">{t('invoice.currencyHint')}</small>
                {err('currency')}
              </label>
            </div>
          </fieldset>

          <div className="invoice-parties">
            {['seller', 'buyer'].map((who) => (
              <fieldset className="invoice-block" key={who}>
                <legend>{t(`invoice.${who}`)}</legend>
                <label>
                  {t('invoice.partyName')}
                  <input value={form[who].name} maxLength={120} onChange={(e) => setParty(who, 'name', e.target.value)} aria-invalid={Boolean(errors[`${who}.name`])} />
                  {err(`${who}.name`)}
                </label>
                <label>
                  {t('invoice.partyDetails')}
                  <textarea rows={4} maxLength={1000} value={form[who].details} onChange={(e) => setParty(who, 'details', e.target.value)} />
                  <small className="form-hint">{t('invoice.partyDetailsHint')}</small>
                </label>
              </fieldset>
            ))}
          </div>

          <fieldset className="invoice-block">
            <legend>{t('invoice.lines')}</legend>
            <p className="form-hint">{t('invoice.vatHint')}</p>
            <ol className="invoice-lines">
              {form.lines.map((line, i) => (
                <li key={i} className="invoice-line">
                  <label className="invoice-line-description">
                    {t('invoice.description')}
                    <input value={line.description} maxLength={300} onChange={(e) => setLine(i, 'description', e.target.value)} aria-invalid={Boolean(errors[`lines.${i}.description`])} />
                    {err(`lines.${i}.description`)}
                  </label>
                  <label>
                    {t('invoice.quantity')}
                    <input inputMode="decimal" value={line.quantity} onChange={(e) => setLine(i, 'quantity', e.target.value)} aria-invalid={Boolean(errors[`lines.${i}.quantity`])} />
                    {err(`lines.${i}.quantity`)}
                  </label>
                  <label>
                    {t('invoice.unitPrice')}
                    <input inputMode="decimal" value={line.unitPrice} onChange={(e) => setLine(i, 'unitPrice', e.target.value)} aria-invalid={Boolean(errors[`lines.${i}.unitPrice`])} />
                    {err(`lines.${i}.unitPrice`)}
                  </label>
                  <label>
                    {t('invoice.vatRate')}
                    <input inputMode="decimal" value={line.vatRate} onChange={(e) => setLine(i, 'vatRate', e.target.value)} aria-invalid={Boolean(errors[`lines.${i}.vatRate`])} />
                    {err(`lines.${i}.vatRate`)}
                  </label>
                  <button
                    type="button"
                    className="cms-icon-button danger invoice-line-remove"
                    title={t('invoice.removeLine')}
                    aria-label={`${t('invoice.removeLine')} ${i + 1}`}
                    disabled={form.lines.length === 1}
                    onClick={() => update((f) => ({ ...f, lines: f.lines.filter((_, j) => j !== i) }))}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
            <Button variant="secondary" onClick={() => update((f) => ({ ...f, lines: [...f.lines, emptyLine()] }))} disabled={form.lines.length >= MAX_LINES}>
              <Plus size={16} aria-hidden="true" />
              {t('invoice.addLine')}
            </Button>
          </fieldset>

          <fieldset className="invoice-block">
            <legend>{t('invoice.notes')}</legend>
            <label>
              <span className="sr-only">{t('invoice.notes')}</span>
              <textarea rows={3} maxLength={2000} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
              <small className="form-hint">{t('invoice.notesHint')}</small>
            </label>
          </fieldset>

          {status && (
            <p className={`form-status form-status-${status.kind}`} role="alert">
              {status.text}
              {errors.total && ` ${t('invoice.errors.total')}`}
            </p>
          )}

          <div className="invoice-actions">
            <Button type="submit" disabled={busy}>
              <Calculator size={16} aria-hidden="true" />
              {t('invoice.calculate')}
            </Button>
            <Button variant="secondary" onClick={reset} disabled={busy}>
              <RotateCcw size={16} aria-hidden="true" />
              {t('invoice.reset')}
            </Button>
          </div>
        </form>

        {result && (
          <div className="invoice-result">
            <div className="invoice-actions invoice-export">
              <h2>{t('invoice.preview')}</h2>
              <Button onClick={() => window.print()}>
                <Printer size={16} aria-hidden="true" />
                {t('invoice.print')}
              </Button>
              <Button variant="secondary" onClick={downloadExcel} disabled={busy}>
                <FileSpreadsheet size={16} aria-hidden="true" />
                {t('invoice.excel')}
              </Button>
              <p className="form-hint">{t('invoice.printHint')}</p>
            </div>
            <InvoiceSheet invoice={result} />
          </div>
        )}
      </Section>
    </div>
  );
}
