import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { BellRing, Check, Download, FileText, Plus, Printer, Receipt, Send, Trash2, Undo2, UserPlus, X } from 'lucide-react';
import { api, ApiError } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { currentOrganisation, newIdempotencyKey } from '../../lib/organisation.js';
import { useOfficialRate } from '../../lib/officialRate.js';
import Button from '../../components/ui/Button.jsx';
import { askConfirm } from '../../components/ui/ConfirmDialog.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import { organisationError } from './Organisation.jsx';
import { EXPENSE_CATEGORIES } from './Pilot.jsx';
import { CurrencySelect, RateSourceSelect, RuledInput } from '../../components/fincludia/BusinessFields.jsx';

// P13-05, lot B (2026-11-23): selling and collecting, as the client's tab
// 19_CYCLE_FACTURE describes it. Quote → invoice (drafted, then issued with
// its number) → payment or credit note; reminders; export for the accountant.
// Every rule is the server's: this page offers only the steps the document
// can take now, and the person's role allows.

const REASONS = [
  'clientRequired',
  'linesRequired',
  'supplierNumberRequired',
  'purchaseIsReceived',
  'documentIsFinal',
  'invalidTransition',
  'quoteExpired',
  'stateChanged',
  'notIssued',
  'creditExceedsInvoice',
  'creditBeforeInvoice',
  'nothingDue',
  'overpayment',
  'duplicateNumber',
  'datesOutOfOrder',
  'contactKindMismatch',
  'paymentBeforeIssue',
  'categoryForPurchases',
  'notEnoughStock',
  'lotRequired',
  'lotCostRequired',
  'lotNotFound',
  'itemNotFound',
  'duplicateItem',
  'moveBeforeLot',
  'futureBalance',
  'operationNotFound',
  'operationClosed',
  'rateRequired',
  'rateNotNeeded',
  'foreignInvoiceOnly',
  'foreignPaidSeparately',
  'rateAfterIssue',
  'rateNotApplicable',
  'exposureRequired',
  'consentRequired',
  'invalidExpiry',
  'notPublished',
  'notEligible',
  'passportNotFound',
  'batchNotFound',
  'shareNotFound',
  'riskClosed',
  'riskNotFound',
  'sameCurrency',
  'namedPlaceRequired',
  'receiveByReception',
  'exportNotReceived',
  'alreadyReceived',
  'itemRequired',
  'netQuantityZero',
  'noCost',
  'duplicateReference',
  'projectNotFound',
  'projectAccessForbidden',
  'milestoneNotFound',
  'expenseNotFound',
  'proofRequired',
  'secondPersonRequired',
  'projectCancelled',
  'memberNotFound',
  'shareNotFound',
  'holdingNotFound',
  'simulatorNotFound',
  // Lot G, second part: payroll and accounting.
  'reportNotFound',
  'spaceNotFound',
  'messageNotFound',
  'accountNotFound',
  'overtimeAboveHours',
  'timesheetDecided',
  'timesheetNotFound',
  'skillNotFound',
  'trainingNotFound',
  'vacancyNotFound',
  'vacancyClosed',
  'candidateNotFound',
  'notAssetAccount',
  'assetNotFound',
  'yearClosed',
  'bankLineNotFound',
  'alreadyMatched',
  'invalidYear',
  'runExists',
  'noEmployee',
  'runNotFound',
  'runLocked',
  'slipNotFound',
  'negativeSlip',
  'unbalanced',
  'periodClosed',
  'draftsRemain',
  'unknownAccount',
  'debitOrCredit',
  'entryLocked',
  'entryNotFound',
  'alreadyReversed',
  'importInvalid',
  'emptyFile',
  'invalidAccount',
  'accountExists',
  'notCashAccount',
  'reasonRequired',
  'periodNotClosed',
  'mappingNotFound',
];

export function invoicingError(t, err) {
  const reason = err instanceof ApiError ? err.details?.reason : null;
  if (REASONS.includes(reason)) return t(`business.inv.errors.${reason}`);
  return organisationError(t, err);
}

const today = () => new Date().toISOString().slice(0, 10);
const iso = (date) => new Date(`${date}T00:00:00.000Z`).toISOString();
const CHANNELS = ['email', 'telephone', 'sms', 'courrier', 'visite', 'autre'];

/** The business space's sales and purchases: contacts, documents, export. */
export function InvoicingSection({ business, documents, can, run }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const contacts = useApi('/fin/entreprise/tiers');
  const list = contacts.data?.tiers ?? [];
  // Lot D: a sale or a purchase may belong to an international operation.
  const operations = useApi('/fin/entreprise/operations');
  const openOperations = (operations.data?.operations ?? []).filter((op) => op.status !== 'cancelled');
  const runAndReload = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) contacts.reload();
    return done;
  };

  const shown = documents.filter((doc) => {
    if (doc.docType === 'credit_note') return false;
    if (filter === 'quote') return doc.docType === 'quote';
    if (filter === 'draft') return doc.docType === 'invoice' && doc.state === 'draft';
    if (filter === 'sale') return doc.docType === 'invoice' && doc.state === 'issued' && doc.kind === 'sale';
    if (filter === 'purchase') return doc.kind === 'purchase';
    return true;
  });

  return (
    <>
      <section aria-labelledby="business-contacts">
        <h2 id="business-contacts">
          <UserPlus size={18} aria-hidden="true" /> {t('business.inv.contactsTitle')}
        </h2>
        <Contacts contacts={list} canWrite={can('contacts.write')} run={runAndReload} />
      </section>

      <section aria-labelledby="business-documents">
        <div className="inv-heading">
          <h2 id="business-documents">
            <FileText size={18} aria-hidden="true" /> {t('business.documentsTitle')}
          </h2>
          <Button type="button" variant="ghost" onClick={() => exportCsv(t)}>
            <Download size={16} aria-hidden="true" />
            {t('business.inv.export')}
          </Button>
        </div>
        <p className="business-blocked-intro">{t('business.inv.intro')}</p>
        {can('documents.write') && <NewDocument business={business} contacts={list} operations={openOperations} run={run} />}

        <div className="inv-filters" role="group" aria-label={t('business.inv.filter')}>
          {['all', 'quote', 'draft', 'sale', 'purchase'].map((key) => (
            <button key={key} type="button" className={filter === key ? 'inv-filter is-on' : 'inv-filter'} aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {t(`business.inv.filters.${key}`)}
            </button>
          ))}
        </div>

        {shown.length > 0 ? (
          <ul className="business-documents">
            {shown.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} business={business} can={can} run={run} />
            ))}
          </ul>
        ) : (
          <p className="business-empty">{t('business.noDocuments')}</p>
        )}
      </section>
    </>
  );
}

// The export is a file: fetched with the organisation of the page, then saved.
async function exportCsv(t) {
  try {
    const organisation = currentOrganisation();
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/fin/entreprise/documents/export`, {
      credentials: 'include',
      cache: 'no-store',
      headers: organisation ? { 'X-Organisation': organisation } : {},
    });
    if (!response.ok) throw new Error(String(response.status));
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = `fincludia-pieces-${today()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    window.alert(t('business.inv.exportFailed'));
  }
}

// ---- clients and suppliers --------------------------------------------------

function Contacts({ contacts, canWrite, run }) {
  const { t } = useTranslation();
  const blank = (kind) => ({ kind, name: '', email: '', phone: '', taxId: '', tradeRegister: '' });
  const [form, setForm] = useState(() => blank('client'));
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));

  return (
    <>
      {contacts.length > 0 ? (
        <ul className="inv-contacts">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <span className="inv-badge">{t(`business.inv.contactKinds.${contact.kind}`)}</span>
              <strong>{contact.name}</strong>
              {contact.taxId && <span className="inv-muted">{t('business.inv.print.taxId')} {contact.taxId}</span>}
              {contact.tradeRegister && <span className="inv-muted">{t('business.inv.print.tradeRegister')} {contact.tradeRegister}</span>}
              {contact.email && <span className="inv-muted">{contact.email}</span>}
              {contact.phone && <span className="inv-muted">{contact.phone}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="business-empty">{t('business.inv.noContacts')}</p>
      )}
      {canWrite && (
        <form
          className="business-form inv-contact-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const optional = ['email', 'phone', 'taxId', 'tradeRegister'].filter((field) => form[field].trim());
            const body = { kind: form.kind, name: form.name.trim(), ...Object.fromEntries(optional.map((field) => [field, form[field].trim()])) };
            if (await run(() => api.post('/fin/entreprise/tiers', body, { idempotencyKey: key }), 'business.inv.contactCreated')) {
              setKey(newIdempotencyKey());
              setForm(blank(form.kind));
            }
          }}
        >
          <div className="business-form-row">
            <label>
              {t('business.kind')}
              <select value={form.kind} onChange={set('kind')}>
                <option value="client">{t('business.inv.contactKinds.client')}</option>
                <option value="supplier">{t('business.inv.contactKinds.supplier')}</option>
              </select>
            </label>
            <label>
              {t('business.inv.contactName')}
              <input id="contact-name" value={form.name} onChange={set('name')} maxLength={160} required />
            </label>
            <label>
              {t('business.org.email')}
              <input type="email" value={form.email} onChange={set('email')} maxLength={254} />
            </label>
            <label>
              {t('business.inv.phone')}
              <RuledInput kind="phone" value={form.phone} onChange={(phone) => setForm((p) => ({ ...p, phone }))} placeholder="0550 12 34 56" />
            </label>
          </div>
          <div className="business-form-row">
            <label>
              {t('business.org.identity.taxId')}
              <RuledInput kind="nif" value={form.taxId} onChange={(taxId) => setForm((p) => ({ ...p, taxId }))} placeholder="000216001234567" />
              <span className="fin-hint">{t('fields.rules.nif')}</span>
            </label>
            <label>
              {t('business.org.identity.tradeRegister')}
              <RuledInput kind="rc" value={form.tradeRegister} onChange={(tradeRegister) => setForm((p) => ({ ...p, tradeRegister }))} placeholder="16/00-0123456 B 12" />
              <span className="fin-hint">{t('fields.rules.rc')}</span>
            </label>
          </div>
          <Button type="submit" variant="secondary">
            <Plus size={16} aria-hidden="true" />
            {t('business.inv.addContact')}
          </Button>
        </form>
      )}
    </>
  );
}

// ---- a new quote or invoice -------------------------------------------------

const emptyLine = () => ({ label: '', quantity: '1', unitPrice: '' });

function NewDocument({ business, contacts, operations = [], run }) {
  const { t, i18n } = useTranslation();
  const [type, setType] = useState('invoice');
  const [form, setForm] = useState({ contactId: '', number: '', label: '', issuedAt: today(), dueAt: '', validUntil: '', taxAmount: '', costExcl: '', amountExcl: '', category: '', costNature: '', paidNow: false, method: 'especes', operationId: '', currency: business.currency, rate: '', rateDate: today(), rateSource: '' });
  // Lot D bis (FAC-013, FAC-014): an invoice in another currency, with its dated
  // rate; the official rate of the Banque d'Algérie is proposed when it is empty.
  const currency = type === 'quote' ? business.currency : form.currency.trim().toUpperCase() || business.currency;
  const foreign = type !== 'quote' && currency !== business.currency;
  const proposed = useOfficialRate(foreign ? currency : '', business.currency, form.rate, (official) => setForm((p) => (p.rate === '' ? { ...p, ...official } : p)));
  const rateValue = Number(String(form.rate).replace(',', '.'));
  const [lines, setLines] = useState([emptyLine()]);
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));
  const purchase = type === 'purchase';
  const quote = type === 'quote';
  const wanted = purchase ? 'supplier' : 'client';
  const choices = contacts.filter((c) => c.kind === wanted);

  // What the lines add up to, as typed: shown, never sent (the server sums).
  const lineAmounts = lines.map((line) => {
    const price = toMinorUnits(line.unitPrice, currency, { allowZero: true });
    const quantity = Number(String(line.quantity).replace(',', '.'));
    return price === null || !(quantity > 0) ? null : Math.round(price * quantity);
  });
  const excl = purchase ? toMinorUnits(form.amountExcl, currency, { allowZero: true }) : lineAmounts.every((a) => a !== null) ? lineAmounts.reduce((s, a) => s + a, 0) : null;
  const tax = form.taxAmount ? toMinorUnits(form.taxAmount, currency, { allowZero: true }) : 0;

  const submit = async (draft) => {
    const body = {
      ...(quote ? { docType: 'quote' } : {}),
      kind: purchase ? 'purchase' : 'sale',
      label: form.label.trim(),
      issuedAt: iso(form.issuedAt),
      ...(form.contactId ? { contactId: form.contactId } : {}),
      ...(purchase ? { number: form.number.trim() } : {}),
      ...(!quote && form.dueAt ? { dueAt: iso(form.dueAt) } : {}),
      ...(quote && form.validUntil ? { validUntil: iso(form.validUntil) } : {}),
      ...(purchase
        ? { amountExcl: excl }
        : {
            lines: lines.map((line) => ({
              label: line.label.trim(),
              quantity: Number(String(line.quantity).replace(',', '.')),
              unitPrice: toMinorUnits(line.unitPrice, currency, { allowZero: true }),
            })),
          }),
      taxAmount: tax ?? 0,
      ...(!purchase && form.costExcl ? { costExcl: toMinorUnits(form.costExcl, business.currency, { allowZero: true }) } : {}),
      ...(draft ? { draft: true } : {}),
      // Lot C: the family and nature of a purchase; paid in full right away.
      ...(!quote && form.operationId ? { operationId: form.operationId } : {}),
      ...(purchase && form.category ? { category: form.category } : {}),
      ...(purchase && form.costNature ? { costNature: form.costNature } : {}),
      ...(!quote && !draft && !foreign && form.paidNow ? { reglement: { receivedAt: iso(form.issuedAt), method: form.method } } : {}),
      ...(foreign ? { exchange: { rate: rateValue, rateDate: iso(form.rateDate), ...(form.rateSource.trim() ? { rateSource: form.rateSource.trim() } : {}) } } : {}),
      currency,
    };
    const okKey = quote ? 'business.inv.quoteCreated' : draft ? 'business.inv.draftCreated' : 'business.documentCreated';
    if (await run(() => api.post('/fin/entreprise/documents', body, { idempotencyKey: key }), okKey)) {
      setKey(newIdempotencyKey());
      setForm((previous) => ({ ...previous, number: '', label: '', dueAt: '', validUntil: '', taxAmount: '', costExcl: '', amountExcl: '', paidNow: false, rate: '', rateSource: '' }));
      setLines([emptyLine()]);
    }
  };

  return (
    <form
      className="business-form inv-new"
      onSubmit={(event) => {
        event.preventDefault();
        submit(false);
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.inv.type')}
          <select id="document-type" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="invoice">{t('business.inv.types.saleInvoice')}</option>
            <option value="quote">{t('business.inv.types.quote')}</option>
            <option value="purchase">{t('business.inv.types.purchaseInvoice')}</option>
          </select>
        </label>
        <label>
          {t(purchase ? 'business.inv.supplier' : 'business.inv.client')}
          <select id="document-contact" value={form.contactId} onChange={set('contactId')} required={quote}>
            <option value="">{t('business.inv.noContact')}</option>
            {choices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {purchase && (
          <label>
            {t('business.inv.supplierNumber')}
            <input value={form.number} onChange={set('number')} maxLength={40} required />
          </label>
        )}
        <label>
          {t('business.label')}
          <input id="document-label" value={form.label} onChange={set('label')} maxLength={200} required />
        </label>
      </div>
      {quote && choices.length === 0 && <p className="business-document-warning">{t('business.inv.addClientFirst')}</p>}

      {!quote && (
        <div className="business-form-row">
          <label>
            {t('business.inv.fx.currency')}
            <CurrencySelect id="document-currency" value={form.currency} onChange={(v) => setForm((p) => ({ ...p, currency: v }))} />
          </label>
          {foreign && (
            <>
              <label>
                {t('business.trade.rateField', { from: currency, to: business.currency })}
                <input id="document-rate" type="number" min="0.000001" step="any" value={form.rate} onChange={set('rate')} required />
              </label>
              <label>
                {t('business.trade.rateDate')}
                <input type="date" value={form.rateDate} max={form.issuedAt} onChange={set('rateDate')} required />
              </label>
              <label>
                {t('business.trade.rateSource')}
                <RateSourceSelect value={form.rateSource} onChange={(v) => setForm((p) => ({ ...p, rateSource: v }))} />
              </label>
            </>
          )}
        </div>
      )}
      {foreign && <p className="inv-muted inv-note">{t(purchase ? 'business.inv.fx.importNote' : 'business.inv.fx.exportNote', { currency, base: business.currency })}</p>}
      {foreign && proposed && <p className="inv-muted inv-note">{t('business.trade.officialProposed')}</p>}

      <div className="business-form-row">
        <label>
          {t('business.issuedAt')}
          <input type="date" value={form.issuedAt} onChange={set('issuedAt')} required />
        </label>
        {quote ? (
          <label>
            {t('business.inv.validUntil')}
            <input type="date" value={form.validUntil} onChange={set('validUntil')} min={form.issuedAt} />
          </label>
        ) : (
          <label>
            {t('business.dueAt')}
            <input type="date" value={form.dueAt} onChange={set('dueAt')} min={form.issuedAt} />
          </label>
        )}
      </div>

      {purchase ? (
        <div className="business-form-row">
          <AmountField id="business-amount" label={t('business.amountExcl')} currency={currency} value={form.amountExcl} onChange={(value) => setForm((p) => ({ ...p, amountExcl: value }))} required />
          <label>
            {t('business.pilot.family')}
            <select id="document-category" value={form.category} onChange={set('category')}>
              <option value="">{t('business.pilot.categories.unclassified')}</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`business.pilot.categories.${c}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('business.pilot.nature')}
            <select id="document-nature" value={form.costNature} onChange={set('costNature')}>
              <option value="">{t('business.pilot.natureDefault')}</option>
              <option value="fixed">{t('business.pilot.natures.fixed')}</option>
              <option value="variable">{t('business.pilot.natures.variable')}</option>
            </select>
          </label>
        </div>
      ) : (
        <fieldset className="inv-lines">
          <legend>{t('business.inv.lines')}</legend>
          {lines.map((line, index) => (
            <div className="inv-line" key={index}>
              <label>
                {t('business.inv.lineLabel')}
                <input value={line.label} onChange={(e) => setLines((all) => all.map((l, i) => (i === index ? { ...l, label: e.target.value } : l)))} maxLength={200} required />
              </label>
              <label>
                {t('business.inv.quantity')}
                <input type="number" min="0.001" step="0.001" value={line.quantity} onChange={(e) => setLines((all) => all.map((l, i) => (i === index ? { ...l, quantity: e.target.value } : l)))} required />
              </label>
              <AmountField
                id={`line-price-${index}`}
                label={t('business.inv.unitPrice')}
                currency={currency}
                value={line.unitPrice}
                onChange={(value) => setLines((all) => all.map((l, i) => (i === index ? { ...l, unitPrice: value } : l)))}
                required
              />
              <span className="inv-line-amount">{lineAmounts[index] === null ? '—' : formatAmount(i18n.language, lineAmounts[index], currency)}</span>
              {lines.length > 1 && (
                <button type="button" className="inv-icon" aria-label={t('business.inv.removeLine')} onClick={() => setLines((all) => all.filter((_, i) => i !== index))}>
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
          <Button type="button" variant="ghost" onClick={() => setLines((all) => [...all, emptyLine()])}>
            <Plus size={16} aria-hidden="true" />
            {t('business.inv.addLine')}
          </Button>
        </fieldset>
      )}

      <div className="business-form-row">
        <AmountField id="business-tax" label={t('business.taxAmount')} currency={currency} value={form.taxAmount} onChange={(value) => setForm((p) => ({ ...p, taxAmount: value }))} hint={t('business.inv.taxHint')} />
        {!purchase && (
          <AmountField id="business-cost" label={t('business.inv.cost')} currency={business.currency} value={form.costExcl} onChange={(value) => setForm((p) => ({ ...p, costExcl: value }))} hint={t('business.inv.costHint')} />
        )}
      </div>

      {!quote && operations.length > 0 && (
        <div className="business-form-row">
          <label>
            {t('business.trade.linkOperation')}
            <select id="document-operation" value={form.operationId} onChange={set('operationId')}>
              <option value="">{t('business.trade.noOperation')}</option>
              {operations.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.reference} · {op.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {!quote && !foreign && (
        <div className="business-form-row">
          <label className="pilot-check">
            <input id="document-paid-now" type="checkbox" checked={form.paidNow} onChange={(e) => setForm((p) => ({ ...p, paidNow: e.target.checked }))} />
            {t(purchase ? 'business.pilot.paidNowPurchase' : 'business.pilot.paidNowSale')}
          </label>
          {form.paidNow && (
            <label>
              {t('business.pilot.method')}
              <select value={form.method} onChange={set('method')}>
                {['especes', 'cheque', 'virement', 'carte', 'ccp', 'effet', 'autre'].map((m) => (
                  <option key={m} value={m}>
                    {t(`business.pilot.methods.${m}`)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      <p className="inv-total">
        {t('business.inv.totalExcl')} <strong>{excl === null ? '—' : formatAmount(i18n.language, excl, currency)}</strong>
        {' · '}
        {t('business.inv.total')} <strong>{excl === null || tax === null ? '—' : formatAmount(i18n.language, excl + tax, currency)}</strong>
        {foreign && excl !== null && tax !== null && rateValue > 0 && (
          <>
            {' · '}
            {t('business.inv.fx.counterValue')} <strong>{formatAmount(i18n.language, Math.round(excl * rateValue) + Math.round(tax * rateValue), business.currency)}</strong>
          </>
        )}
      </p>

      <div className="inv-actions">
        <Button type="submit" variant="secondary">
          <Plus size={16} aria-hidden="true" />
          {t(quote ? 'business.inv.createQuote' : purchase ? 'business.addDocument' : 'business.inv.issueInvoice')}
        </Button>
        {type === 'invoice' && !foreign && (
          <Button
            type="button"
            variant="ghost"
            onClick={(event) => {
              const formEl = event.currentTarget.form;
              if (formEl.reportValidity()) submit(true);
            }}
          >
            {t('business.inv.saveDraft')}
          </Button>
        )}
      </div>
    </form>
  );
}

// ---- one document -----------------------------------------------------------

function DocumentCard({ doc, business, can, run }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(null); // 'credit' | 'reminder' | null
  const [printing, setPrinting] = useState(false);
  const money = (value) => formatAmount(i18n.language, value, doc.currency);
  const issued = doc.docType === 'invoice' && doc.state === 'issued';
  const settlement = doc.reglement;
  const write = can('documents.write');

  // No If-Match on a step: the server already moves a document only from the
  // state it expects, so a quick second click cannot act twice, and a list
  // still reloading would only turn a valid click into a refusal.
  const once = () => ({ idempotencyKey: newIdempotencyKey() });
  // Written out one by one: every address the page calls is one the server serves.
  const STEPS = {
    envoyer: () => api.post(`/fin/entreprise/documents/${doc.id}/envoyer`, {}, once()),
    accepter: () => api.post(`/fin/entreprise/documents/${doc.id}/accepter`, {}, once()),
    refuser: () => api.post(`/fin/entreprise/documents/${doc.id}/refuser`, {}, once()),
    facturer: () => api.post(`/fin/entreprise/documents/${doc.id}/facturer`, {}, once()),
    emettre: () => api.post(`/fin/entreprise/documents/${doc.id}/emettre`, {}, once()),
  };
  const step = (name, okKey) => run(STEPS[name], okKey);
  const discard = async () => {
    if (!(await askConfirm(t('business.inv.discardConfirm')))) return;
    run(() => api.delete(`/fin/entreprise/documents/${doc.id}`), 'business.inv.discarded');
  };

  let stateLabel;
  let tone;
  if (doc.docType === 'quote') {
    stateLabel = doc.expire ? t('business.inv.expired') : t(`business.inv.quoteStates.${doc.state}`);
    tone = doc.expire || doc.state === 'refused' ? 'overpaid' : doc.state === 'accepted' || doc.state === 'invoiced' ? 'paid' : 'partial';
  } else if (!issued) {
    stateLabel = t('business.inv.draft');
    tone = 'draft';
  } else {
    stateLabel = t(`business.states.${settlement.state}`);
    tone = settlement.state;
  }
  const typeLabel = doc.docType === 'quote' ? t('business.inv.types.quote') : t(doc.kind === 'sale' ? 'business.inv.types.saleInvoice' : 'business.inv.types.purchaseInvoice');

  return (
    <li className={`business-document business-document-${tone}`}>
      <div className="business-document-head">
        <span className="inv-badge">{typeLabel}</span>
        <strong>{doc.number ?? t('business.inv.noNumberYet')}</strong>
        <span>{doc.label}</span>
        {doc.contact && <span className="inv-muted">{doc.contact.name}</span>}
        <span className="business-document-state">{stateLabel}</span>
      </div>

      {doc.foreignCurrency && <ForeignSummary doc={doc} />}
      <div className="business-document-amounts">
        <span>{money(doc.total)}</span>
        <span className="inv-muted">{formatDate(i18n.language, doc.issuedAt)}</span>
        {doc.dueAt && (
          <span className="inv-muted">
            {t('business.dueAt')} : {formatDate(i18n.language, doc.dueAt)}
          </span>
        )}
        {doc.docType === 'quote' && doc.validUntil && (
          <span className="inv-muted">
            {t('business.inv.validUntil')} : {formatDate(i18n.language, doc.validUntil)}
          </span>
        )}
        {issued && settlement.credited > 0 && (
          <span className="business-document-outstanding">
            {t('business.inv.credited')} {money(settlement.credited)}
          </span>
        )}
        {issued && settlement.outstanding >= 0 && (
          <span className="business-document-outstanding">
            {t('business.outstanding')} {money(settlement.outstanding)}
          </span>
        )}
        {issued && settlement.outstanding < 0 && <span className="business-document-warning">{t('business.inv.toRefund', { amount: money(-settlement.outstanding) })}</span>}
      </div>

      {doc.lines?.length > 0 && (
        <ul className="inv-line-list">
          {doc.lines.map((line) => (
            <li key={line.id}>
              <span>{line.label}</span>
              <span className="inv-muted">
                {line.quantity} × {money(line.unitPrice)}
              </span>
              <span>{money(line.amount)}</span>
            </li>
          ))}
        </ul>
      )}

      {doc.related && <p className="inv-muted inv-note">{t(doc.related.docType === 'quote' ? 'business.inv.fromQuote' : 'business.inv.fromInvoice', { number: doc.related.number ?? '' })}</p>}
      {doc.avoirs?.length > 0 && (
        <p className="inv-muted inv-note">
          {t('business.inv.creditNotes')} {doc.avoirs.map((c) => `${c.number} (${money(c.total)})`).join(', ')}
        </p>
      )}
      {doc.relances?.length > 0 && (
        <p className="inv-muted inv-note">
          {t('business.inv.lastReminder', {
            count: doc.relances.length,
            date: formatDate(i18n.language, doc.relances[0].sentAt),
            channel: t(`business.inv.channels.${doc.relances[0].channel}`),
          })}
          {doc.relances[0].nextActionAt && ` ${t('business.inv.nextAction', { date: formatDate(i18n.language, doc.relances[0].nextActionAt) })}`}
        </p>
      )}
      {settlement?.devisesIgnorees?.length > 0 && <p className="business-document-warning">{t('business.foreignPayments')}</p>}

      <div className="inv-actions">
        <Button type="button" variant="ghost" onClick={() => setPrinting(true)}>
          <Printer size={16} aria-hidden="true" />
          {t('business.inv.print.action')}
        </Button>
      </div>
      {printing && <PrintSheet doc={doc} business={business} onDone={() => setPrinting(false)} />}

      {write && doc.docType === 'quote' && doc.state === 'draft' && <p className="fin-hint inv-note">{t('business.inv.sendHint')}</p>}
      {write && (
        <div className="inv-actions">
          {doc.docType === 'quote' && doc.state === 'draft' && (
            <Button type="button" variant="ghost" onClick={() => step('envoyer', 'business.inv.sent')}>
              <Send size={16} aria-hidden="true" />
              {t('business.inv.send')}
            </Button>
          )}
          {doc.docType === 'quote' && ['draft', 'sent'].includes(doc.state) && !doc.expire && (
            <Button type="button" variant="ghost" onClick={() => step('accepter', 'business.inv.acceptedOk')}>
              <Check size={16} aria-hidden="true" />
              {t('business.inv.accept')}
            </Button>
          )}
          {doc.docType === 'quote' && ['draft', 'sent'].includes(doc.state) && (
            <Button type="button" variant="ghost" onClick={() => step('refuser', 'business.inv.refusedOk')}>
              <X size={16} aria-hidden="true" />
              {t('business.inv.refuse')}
            </Button>
          )}
          {doc.docType === 'quote' && doc.state === 'accepted' && (
            <Button type="button" variant="secondary" onClick={() => step('facturer', 'business.inv.invoicedOk')}>
              <FileText size={16} aria-hidden="true" />
              {t('business.inv.toInvoice')}
            </Button>
          )}
          {doc.docType === 'invoice' && doc.state === 'draft' && (
            <Button type="button" variant="secondary" onClick={() => step('emettre', 'business.inv.issuedOk')}>
              <Send size={16} aria-hidden="true" />
              {t('business.inv.issue')}
            </Button>
          )}
          {doc.state === 'draft' && (
            <Button type="button" variant="ghost" onClick={discard}>
              <Trash2 size={16} aria-hidden="true" />
              {t('business.inv.discard')}
            </Button>
          )}
          {issued && settlement.net > 0 && (
            <Button type="button" variant="ghost" aria-expanded={open === 'credit'} onClick={() => setOpen(open === 'credit' ? null : 'credit')}>
              <Undo2 size={16} aria-hidden="true" />
              {t('business.inv.creditNote')}
            </Button>
          )}
          {issued && doc.kind === 'sale' && settlement.outstanding > 0 && (
            <Button type="button" variant="ghost" aria-expanded={open === 'reminder'} onClick={() => setOpen(open === 'reminder' ? null : 'reminder')}>
              <BellRing size={16} aria-hidden="true" />
              {t('business.inv.remind')}
            </Button>
          )}
          {/* Lot F bis (FAC-011): a disputed invoice is never offered for financing. */}
          {issued && doc.kind === 'sale' && settlement.outstanding > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                run(() => api.post(`/fin/entreprise/documents/${doc.id}/litige`, { disputed: !doc.disputedAt }), doc.disputedAt ? 'business.inv.disputeCleared' : 'business.inv.disputeMarked')
              }
            >
              {doc.disputedAt ? t('business.inv.clearDispute') : t('business.inv.markDispute')}
            </Button>
          )}
        </div>
      )}
      {doc.disputedAt && <p className="business-document-warning">{t('business.inv.disputed', { date: formatDate(i18n.language, doc.disputedAt) })}</p>}

      {issued && settlement.outstanding > 0 && can('payments.write') && (
        <NewPayment doc={doc} run={run} />
      )}
      {open === 'credit' && <CreditNoteForm doc={doc} run={run} onDone={() => setOpen(null)} />}
      {open === 'reminder' && <ReminderForm doc={doc} business={business} run={run} onDone={() => setOpen(null)} />}
    </li>
  );
}

// The quote or invoice as a sheet to print or save as PDF (the browser's own
// « Save as PDF »). Only this sheet is printed; the page stays as it was.
function PrintSheet({ doc, business, onDone }) {
  const { t, i18n } = useTranslation();
  // Once per opening: the parent's callback changes at every render, and
  // following it would print again and again.
  const [finish] = useState(() => onDone);
  useEffect(() => {
    document.body.classList.add('printing-document');
    const done = () => finish();
    window.addEventListener('afterprint', done);
    const timer = window.setTimeout(() => window.print(), 80);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', done);
      document.body.classList.remove('printing-document');
    };
  }, [finish]);

  // An invoice in another currency is printed in that currency (amounts back at
  // its rate), with its counter-value in the organisation's currency.
  const fx = doc.foreignCurrency ? { currency: doc.foreignCurrency, rate: doc.bookingRate } : null;
  const money = (value) => (fx ? formatAmount(i18n.language, Math.round(value / fx.rate), fx.currency) : formatAmount(i18n.language, value, doc.currency));
  // A total the invoice carries in its own currency is printed as it is, not converted back.
  const exact = (base, inCurrency) => (fx ? formatAmount(i18n.language, inCurrency ?? 0, fx.currency) : formatAmount(i18n.language, base, doc.currency));
  const date = (value) => formatDate(i18n.language, value);
  const title = doc.docType === 'quote' ? t('business.inv.print.quote') : doc.kind === 'purchase' ? t('business.inv.types.purchaseInvoice') : t('business.inv.print.invoice');
  const draft = doc.state === 'draft' && doc.docType === 'invoice';
  const lines = doc.lines?.length > 0 ? doc.lines : [{ id: 'one', label: doc.label, quantity: 1, unitPrice: doc.amountExcl, amount: doc.amountExcl }];
  const settlement = doc.reglement;
  // What is due in the invoice's own currency (FAC-015), else in the organisation's.
  const due = settlement?.devise ?? settlement ?? { credited: 0, settled: 0, outstanding: 0 };
  const ids = [
    business.taxId && `${t('business.inv.print.taxId')} ${business.taxId}`,
    business.tradeRegister && `${t('business.inv.print.tradeRegister')} ${business.tradeRegister}`,
    business.statisticalId && `${t('business.inv.print.statisticalId')} ${business.statisticalId}`,
  ].filter(Boolean);

  return createPortal(
    <div className="print-sheet-root">
      <article className="print-sheet" dir={i18n.dir?.() ?? 'ltr'}>
        <header className="print-head">
          <div>
            <strong className="print-org">{business.tradeName || business.name}</strong>
            {business.tradeName && <div>{business.name}</div>}
            {business.activity && <div>{business.activity}</div>}
            {business.wilaya && <div>{business.wilaya}</div>}
            {ids.map((line) => (
              <div key={line} className="print-small">
                {line}
              </div>
            ))}
          </div>
          <div className="print-title">
            <h1>{title}</h1>
            <div>{doc.number ?? t('business.inv.noNumberYet')}</div>
            <div>
              {t('business.inv.print.date')} {date(doc.issuedAt)}
            </div>
            {doc.dueAt && (
              <div>
                {t('business.dueAt')} : {date(doc.dueAt)}
              </div>
            )}
            {doc.docType === 'quote' && doc.validUntil && (
              <div>
                {t('business.inv.validUntil')} : {date(doc.validUntil)}
              </div>
            )}
          </div>
        </header>
        {draft && <p className="print-draft">{t('business.inv.print.draft')}</p>}

        {doc.contact && (
          <section className="print-to">
            <div className="print-small">{t(doc.kind === 'sale' ? 'business.inv.print.to' : 'business.inv.print.from')}</div>
            <strong>{doc.contact.name}</strong>
            {doc.contact.address && <div>{doc.contact.address}</div>}
            {doc.contact.taxId && (
              <div className="print-small">
                {t('business.inv.print.taxId')} {doc.contact.taxId}
              </div>
            )}
          </section>
        )}

        <p className="print-object">{doc.label}</p>
        <table className="print-lines">
          <thead>
            <tr>
              <th scope="col">{t('business.inv.lineLabel')}</th>
              <th scope="col">{t('business.inv.quantity')}</th>
              <th scope="col">{t('business.inv.unitPrice')}</th>
              <th scope="col">{t('business.inv.print.amountExcl')}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id}>
                <td>{line.label}</td>
                <td>{line.quantity}</td>
                <td>{money(line.unitPrice)}</td>
                <td>{money(line.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="print-totals">
          <tbody>
            <tr>
              <th scope="row">{t('business.inv.totalExcl')}</th>
              <td>{exact(doc.amountExcl, doc.foreignAmountExcl)}</td>
            </tr>
            <tr>
              <th scope="row">{t('business.taxAmount')}</th>
              <td>{exact(doc.taxAmount, doc.foreignTaxAmount)}</td>
            </tr>
            <tr className="print-grand">
              <th scope="row">{t('business.inv.total')}</th>
              <td>{exact(doc.total, (doc.foreignAmountExcl ?? 0) + (doc.foreignTaxAmount ?? 0))}</td>
            </tr>
            {due.credited > 0 && (
              <tr>
                <th scope="row">{t('business.inv.credited')}</th>
                <td>{exact(settlement.credited, due.credited)}</td>
              </tr>
            )}
            {due.settled > 0 && (
              <tr>
                <th scope="row">{t('business.inv.print.paid')}</th>
                <td>{exact(settlement.settled, due.settled)}</td>
              </tr>
            )}
            {settlement && (due.credited > 0 || due.settled > 0) && (
              <tr className="print-grand">
                <th scope="row">{t('business.inv.print.left')}</th>
                <td>{exact(Math.max(0, settlement.outstanding), Math.max(0, due.outstanding))}</td>
              </tr>
            )}
          </tbody>
        </table>
        {fx && (
          <p className="print-small">
            {t('business.inv.fx.printRate', {
              amount: formatAmount(i18n.language, doc.total, doc.currency),
              rate: doc.bookingRate,
              currency: fx.currency,
              base: doc.currency,
              date: date(doc.rateDate),
              source: doc.rateSource || '—',
            })}
          </p>
        )}

        {doc.related?.number && <p className="print-small">{t('business.inv.fromQuote', { number: doc.related.number })}</p>}
        {doc.note && <p className="print-small">{doc.note}</p>}
      </article>
    </div>,
    document.body,
  );
}

// FAC-014 / FAC-015: an invoice in another currency, followed in that currency.
// The counter-value stays at the rate of the invoice; what was collected is at
// the rate of each payment; the difference is the exchange gain or loss.
function ForeignSummary({ doc }) {
  const { t, i18n } = useTranslation();
  const fx = doc.reglement?.devise;
  const inCurrency = (value) => formatAmount(i18n.language, value, doc.foreignCurrency);
  const base = (value) => formatAmount(i18n.language, value, doc.currency);
  const total = (doc.foreignAmountExcl ?? 0) + (doc.foreignTaxAmount ?? 0);
  return (
    <div className="business-document-amounts inv-fx">
      <span>
        <strong>{inCurrency(total)}</strong>
      </span>
      <span className="inv-muted">{t('business.inv.fx.rateLine', { rate: doc.bookingRate, currency: doc.foreignCurrency, base: doc.currency, date: formatDate(i18n.language, doc.rateDate), source: doc.rateSource || '—' })}</span>
      {fx && fx.settled > 0 && <span className="business-document-outstanding">{t('business.inv.fx.settled', { amount: inCurrency(fx.settled) })}</span>}
      {fx && fx.outstanding > 0 && <span className="business-document-outstanding">{t('business.inv.fx.outstanding', { amount: inCurrency(fx.outstanding) })}</span>}
      {fx && fx.exchangeDifference !== 0 && (
        <span className="inv-muted">{t(fx.exchangeDifference > 0 ? 'business.inv.fx.gain' : 'business.inv.fx.loss', { amount: base(Math.abs(fx.exchangeDifference)) })}</span>
      )}
    </div>
  );
}

function NewPayment({ doc, run }) {
  if (doc.foreignCurrency) return <NewForeignPayment doc={doc} run={run} />;
  return <NewLocalPayment doc={doc} run={run} />;
}

// FAC-015: paid in the invoice's currency, converted at the dated rate of the day.
function NewForeignPayment({ doc, run }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ value: '', receivedAt: today(), rate: '', rateDate: today(), rateSource: '' });
  const [key, setKey] = useState(newIdempotencyKey);
  const set = (field) => (event) => setForm((p) => ({ ...p, [field]: event.target.value }));
  const proposed = useOfficialRate(doc.foreignCurrency, doc.currency, form.rate, (official) => setForm((p) => (p.rate === '' ? { ...p, ...official } : p)));
  return (
    <form
      className="business-form business-payment"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = {
          value: toMinorUnits(form.value, doc.foreignCurrency),
          currency: doc.foreignCurrency,
          receivedAt: iso(form.receivedAt),
          rate: Number(String(form.rate).replace(',', '.')),
          rateDate: iso(form.rateDate),
        };
        if (await run(() => api.post(`/fin/entreprise/documents/${doc.id}/reglements`, body, { idempotencyKey: key }), 'business.paymentCreated')) {
          setKey(newIdempotencyKey());
          setForm((p) => ({ ...p, value: '', rate: '' }));
        }
      }}
    >
      <AmountField id={`payment-${doc.id}`} label={t('business.paymentAmount')} currency={doc.foreignCurrency} value={form.value} onChange={(v) => setForm((p) => ({ ...p, value: v }))} required />
      <label>
        {t('business.paymentDate')}
        <input type="date" value={form.receivedAt} min={doc.issuedAt.slice(0, 10)} onChange={set('receivedAt')} required />
      </label>
      <label>
        {t('business.trade.rateField', { from: doc.foreignCurrency, to: doc.currency })}
        <input type="number" min="0.000001" step="any" value={form.rate} onChange={set('rate')} required />
      </label>
      <label>
        {t('business.trade.rateDate')}
        <input type="date" value={form.rateDate} max={form.receivedAt} onChange={set('rateDate')} required />
      </label>
      {proposed && <p className="inv-muted inv-note">{t('business.trade.officialProposed')}</p>}
      <Button type="submit" variant="secondary">
        <Receipt size={16} aria-hidden="true" />
        {t('business.addPayment')}
      </Button>
    </form>
  );
}

function NewLocalPayment({ doc, run }) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [receivedAt, setReceivedAt] = useState(today());
  const [key, setKey] = useState(newIdempotencyKey);

  return (
    <form
      className="business-form business-payment"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = { value: toMinorUnits(value, doc.currency), currency: doc.currency, receivedAt: iso(receivedAt) };
        if (await run(() => api.post(`/fin/entreprise/documents/${doc.id}/reglements`, body, { idempotencyKey: key }), 'business.paymentCreated')) {
          setKey(newIdempotencyKey());
          setValue('');
        }
      }}
    >
      <AmountField id={`payment-${doc.id}`} label={t('business.paymentAmount')} currency={doc.currency} value={value} onChange={setValue} required />
      <label>
        {t('business.paymentDate')}
        <input type="date" value={receivedAt} min={doc.issuedAt.slice(0, 10)} onChange={(event) => setReceivedAt(event.target.value)} required />
      </label>
      <Button type="submit" variant="secondary">
        <Receipt size={16} aria-hidden="true" />
        {t('business.addPayment')}
      </Button>
    </form>
  );
}

function CreditNoteForm({ doc, run, onDone }) {
  const { t, i18n } = useTranslation();
  const [amountExcl, setAmountExcl] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [issuedAt, setIssuedAt] = useState(today());
  const [number, setNumber] = useState('');
  const [label, setLabel] = useState('');
  const [key] = useState(newIdempotencyKey);
  const purchase = doc.kind === 'purchase';
  // FAC-016: the credit note of a foreign-currency invoice is in that currency, at its rate.
  const cur = doc.foreignCurrency ?? doc.currency;
  const net = doc.foreignCurrency ? doc.reglement.devise.total - doc.reglement.devise.credited : doc.reglement.net;

  return (
    <form
      className="business-form business-payment inv-credit"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = {
          issuedAt: iso(issuedAt),
          amountExcl: toMinorUnits(amountExcl, cur, { allowZero: true }),
          ...(taxAmount ? { taxAmount: toMinorUnits(taxAmount, cur, { allowZero: true }) } : {}),
          ...(label.trim() ? { label: label.trim() } : {}),
          ...(purchase ? { number: number.trim() } : {}),
        };
        if (await run(() => api.post(`/fin/entreprise/documents/${doc.id}/avoirs`, body, { idempotencyKey: key }), 'business.inv.creditCreated')) onDone();
      }}
    >
      <p className="inv-note">{t('business.inv.creditIntro', { amount: formatAmount(i18n.language, net, cur) })}</p>
      {purchase && (
        <label>
          {t('business.inv.supplierNumber')}
          <input value={number} onChange={(e) => setNumber(e.target.value)} maxLength={40} required />
        </label>
      )}
      <label>
        {t('business.inv.reason')}
        <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={200} placeholder={doc.label} />
      </label>
      <AmountField id={`credit-${doc.id}`} label={t('business.amountExcl')} currency={cur} value={amountExcl} onChange={setAmountExcl} required />
      <AmountField id={`credit-tax-${doc.id}`} label={t('business.taxAmount')} currency={cur} value={taxAmount} onChange={setTaxAmount} />
      <label>
        {t('business.issuedAt')}
        <input type="date" value={issuedAt} min={doc.issuedAt.slice(0, 10)} onChange={(e) => setIssuedAt(e.target.value)} required />
      </label>
      <Button type="submit" variant="secondary">
        <Undo2 size={16} aria-hidden="true" />
        {t('business.inv.issueCredit')}
      </Button>
    </form>
  );
}

// FAC-008: the reminder is PREPARED here and sent by the person, through
// their own channel; FINCLUDIA records it and changes no balance.
function ReminderForm({ doc, business, run, onDone }) {
  const { t, i18n } = useTranslation();
  const [channel, setChannel] = useState(doc.contact?.email ? 'email' : 'telephone');
  const [note, setNote] = useState('');
  const [nextActionAt, setNextActionAt] = useState('');
  const [copied, setCopied] = useState(false);
  const [key] = useState(newIdempotencyKey);
  const amount = formatAmount(i18n.language, doc.reglement.outstanding, doc.currency);
  const text = t(doc.dueAt ? 'business.inv.reminderText' : 'business.inv.reminderTextNoDue', {
    client: doc.contact?.name ?? t('business.inv.dearClient'),
    number: doc.number,
    date: formatDate(i18n.language, doc.issuedAt),
    due: formatDate(i18n.language, doc.dueAt),
    amount,
    organisation: business.tradeName || business.name,
  });
  const subject = t('business.inv.reminderSubject', { number: doc.number });

  return (
    <form
      className="business-form inv-reminder"
      onSubmit={async (event) => {
        event.preventDefault();
        const body = { channel, ...(note.trim() ? { note: note.trim() } : {}), ...(nextActionAt ? { nextActionAt: iso(nextActionAt) } : {}) };
        if (await run(() => api.post(`/fin/entreprise/documents/${doc.id}/relances`, body, { idempotencyKey: key }), 'business.inv.reminderRecorded')) onDone();
      }}
    >
      <p className="inv-note">{t('business.inv.reminderIntro')}</p>
      <textarea className="inv-preview" readOnly value={text} rows={6} aria-label={t('business.inv.preview')} />
      <div className="inv-actions">
        <Button
          type="button"
          variant="ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? t('business.inv.copied') : t('business.inv.copy')}
        </Button>
        {doc.contact?.email && (
          <a className="inv-link" href={`mailto:${doc.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`}>
            {t('business.inv.openMail')}
          </a>
        )}
      </div>
      <div className="business-form-row">
        <label>
          {t('business.inv.channel')}
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {t(`business.inv.channels.${c}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('business.inv.reminderNote')}
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
        </label>
        <label>
          {t('business.inv.nextActionAt')}
          <input type="date" value={nextActionAt} min={today()} onChange={(e) => setNextActionAt(e.target.value)} />
        </label>
      </div>
      <Button type="submit" variant="secondary">
        <BellRing size={16} aria-hidden="true" />
        {t('business.inv.recordReminder')}
      </Button>
    </form>
  );
}

/** FAC-006: what clients still owe, by how late it is. */
export function AgingSection({ aging, currency }) {
  const { t, i18n } = useTranslation();
  if (!aging) return null;
  const rows = ['notDue', 'd30', 'd60', 'd90', 'over90', 'noDueDate'].filter((key) => aging[key] > 0);
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="business-aging">
      <h2 id="business-aging">{t('business.inv.agingTitle')}</h2>
      <ul className="business-late inv-aging">
        {rows.map((key) => (
          <li key={key} className={`inv-aging-${key}`}>
            <span className="business-late-label">{t(`business.inv.aging.${key}`)}</span>
            <span className="business-late-amount">{formatAmount(i18n.language, aging[key], currency)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
