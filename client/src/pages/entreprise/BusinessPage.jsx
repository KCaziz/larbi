import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, FileText, Plus, Receipt } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import AdultOnly from '../../components/fincludia/AdultOnly.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import { adultRefusalReason, isAdultRefusal } from '../../lib/adultRefusal.js';
import { toMinorUnits } from '../../lib/money.js';
import '../../components/fincludia/Fincludia.css';
import './Business.css';

// Espace entreprise (P7-02), le socle de l'ERP annoncé par l'annexe 1 du
// contrat.
//
// Cette page montre des FAITS DE TRÉSORERIE : ce qui est entré, ce qui est
// sorti, ce qui reste dû. Elle ne montre ni bilan, ni compte de résultat, ni
// TVA — et elle le dit à hauteur des chiffres plutôt qu'en note de bas de
// page, parce que la confusion entre « ma trésorerie » et « mon résultat » est
// exactement ce qui coûte cher à une entreprise.
//
// Chaque chiffre arrive enveloppé dans le contrat du moteur : rien n'est
// recalculé ici, et « non calculé » reste visiblement différent de zéro.
export default function BusinessPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [message, setMessage] = useState(null);
  const business = useApi('/fin/entreprise');
  const dashboard = useApi('/fin/entreprise/tableau-de-bord');
  const documents = useApi('/fin/entreprise/documents');
  useDocumentMeta(t('business.title'), t('business.intro'));

  if (isAdultRefusal(business.error)) {
    return (
      <>
        <PageHeader icon={Building2} title={t('business.title')} subtitle={t('business.intro')} maxWidth={1100} />
        <div className="business-page">
          <AdultOnly reason={adultRefusalReason(business.error)} />
        </div>
      </>
    );
  }

  if (business.status === 'loading' && !business.data) return <LoadingState />;
  if (business.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={business.reload} />;

  const entreprise = business.data?.entreprise ?? null;

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      business.reload();
      dashboard.reload();
      documents.reload();
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'business.errors.refused', 409: 'business.errors.conflict' })) });
    }
  }

  return (
    <>
      <PageHeader icon={Building2} title={t('business.title')} subtitle={t('business.intro')} maxWidth={1100} />
      <div className="business-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}

        {!entreprise ? (
          <CreateBusiness currency={user?.finCurrency ?? 'DZD'} onCreate={(body) => run(() => api.post('/fin/entreprise', body), 'business.created')} />
        ) : (
          <>
            {/* La phrase qui cadre tout le reste, au-dessus des chiffres et
                non en dessous. */}
            {dashboard.data && <Notice variant="info">{dashboard.data.avertissement}</Notice>}

            <section aria-labelledby="business-cash">
              <h2 id="business-cash">{t('business.cashTitle')}</h2>
              {dashboard.status === 'loading' && !dashboard.data ? (
                <LoadingState />
              ) : (
                <div className="fin-figure-grid">
                  <FigureCard label={t('business.cashIn')} answer={dashboard.data?.encaissements} />
                  <FigureCard label={t('business.cashOut')} answer={dashboard.data?.decaissements} />
                  <FigureCard label={t('business.balance')} answer={dashboard.data?.tresorerie} />
                  <FigureCard label={t('business.receivables')} answer={dashboard.data?.creances} />
                  <FigureCard label={t('business.payables')} answer={dashboard.data?.dettes} />
                  <FigureCard label={t('business.overdue')} answer={dashboard.data?.echu} />
                </div>
              )}
            </section>

            {dashboard.data?.enRetard?.length > 0 && (
              <section aria-labelledby="business-late">
                <h2 id="business-late">{t('business.lateTitle')}</h2>
                <ul className="business-late">
                  {dashboard.data.enRetard.map((row) => (
                    <li key={row.id}>
                      <span className="business-late-label">
                        {row.numero} · {row.libelle}
                      </span>
                      <span className="business-late-due">{formatDate(i18n.language, row.echeance)}</span>
                      <span className="business-late-amount">
                        {formatAmount(i18n.language, row.resteDu, entreprise.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Les états que le contrat annonce et que nous ne produisons pas,
                avec ce qui leur manque. Les taire les ferait passer pour
                oubliés ; les annoncer « bientôt » serait une promesse que rien
                ne permet de tenir. */}
            <section aria-labelledby="business-blocked">
              <h2 id="business-blocked">{t('business.blockedTitle')}</h2>
              <p className="business-blocked-intro">{t('business.blockedIntro')}</p>
              <ul className="business-blocked">
                {(dashboard.data?.etatsNonProduits ?? []).map((row) => (
                  <li key={row.key}>
                    <strong>{row.label}</strong>
                    <span>{row.needs}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="business-documents">
              <h2 id="business-documents">
                <FileText size={18} aria-hidden="true" /> {t('business.documentsTitle')}
              </h2>
              <NewDocument
                currency={entreprise.currency}
                onCreate={(body) => run(() => api.post('/fin/entreprise/documents', body), 'business.documentCreated')}
              />
              {documents.data?.documents?.length > 0 ? (
                <ul className="business-documents">
                  {documents.data.documents.map((document) => (
                    <li key={document.id} className={`business-document business-document-${document.reglement.state}`}>
                      <div className="business-document-head">
                        <strong>{document.number}</strong>
                        <span>{document.label}</span>
                        <span className="business-document-state">{t(`business.states.${document.reglement.state}`)}</span>
                      </div>
                      <div className="business-document-amounts">
                        <span>{formatAmount(i18n.language, document.total, document.currency)}</span>
                        <span className="business-document-outstanding">
                          {t('business.outstanding')} {formatAmount(i18n.language, document.reglement.outstanding, document.currency)}
                        </span>
                      </div>
                      {document.reglement.outstanding > 0 && (
                        <NewPayment
                          currency={document.currency}
                          max={document.reglement.outstanding}
                          onCreate={(body) =>
                            run(() => api.post(`/fin/entreprise/documents/${document.id}/reglements`, body), 'business.paymentCreated')
                          }
                        />
                      )}
                      {/* Un règlement dans une autre devise n'est pas absorbé
                          en silence : il est dit, parce que le document a
                          l'air impayé sans cela. */}
                      {document.reglement.devisesIgnorees.length > 0 && (
                        <p className="business-document-warning">{t('business.foreignPayments')}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="business-empty">{t('business.noDocuments')}</p>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}

function CreateBusiness({ currency, onCreate }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  return (
    <form
      className="business-form business-create"
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim()) onCreate({ name: name.trim(), currency });
      }}
    >
      <h2>{t('business.createTitle')}</h2>
      <p>{t('business.createIntro')}</p>
      <label htmlFor="business-name">{t('business.nameLabel')}</label>
      <input id="business-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={160} required />
      <Button type="submit" variant="primary">
        <Plus size={16} aria-hidden="true" />
        {t('business.create')}
      </Button>
    </form>
  );
}

function NewDocument({ currency, onCreate }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ kind: 'sale', number: '', label: '', issuedAt: '', dueAt: '', amountExcl: '', taxAmount: '' });
  const set = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));

  return (
    <form
      className="business-form"
      onSubmit={(event) => {
        event.preventDefault();
        onCreate({
          kind: form.kind,
          number: form.number.trim(),
          label: form.label.trim(),
          issuedAt: new Date(form.issuedAt).toISOString(),
          ...(form.dueAt ? { dueAt: new Date(form.dueAt).toISOString() } : {}),
          // `allowZero` : un document à zéro est une réponse (un geste
          // gratuit facturé pour mémoire), pas une saisie manquante.
          amountExcl: toMinorUnits(form.amountExcl, currency, { allowZero: true }),
          // Le montant de taxe est SAISI, jamais calculé depuis un taux : le
          // taux appartient au document réel, et ce projet n'invente aucune
          // règle fiscale (voir P7-01).
          taxAmount: form.taxAmount ? toMinorUnits(form.taxAmount, currency, { allowZero: true }) : 0,
          currency,
        });
      }}
    >
      <div className="business-form-row">
        <label>
          {t('business.kind')}
          <select value={form.kind} onChange={set('kind')}>
            <option value="sale">{t('business.kinds.sale')}</option>
            <option value="purchase">{t('business.kinds.purchase')}</option>
          </select>
        </label>
        <label>
          {t('business.number')}
          <input value={form.number} onChange={set('number')} maxLength={40} required />
        </label>
        <label>
          {t('business.label')}
          <input value={form.label} onChange={set('label')} maxLength={200} required />
        </label>
      </div>
      <div className="business-form-row">
        <label>
          {t('business.issuedAt')}
          <input type="date" value={form.issuedAt} onChange={set('issuedAt')} required />
        </label>
        <label>
          {t('business.dueAt')}
          <input type="date" value={form.dueAt} onChange={set('dueAt')} />
        </label>
        <AmountField
          id="business-amount"
          label={t('business.amountExcl')}
          currency={currency}
          value={form.amountExcl}
          onChange={(value) => setForm((previous) => ({ ...previous, amountExcl: value }))}
          required
        />
        <AmountField
          id="business-tax"
          label={t('business.taxAmount')}
          currency={currency}
          value={form.taxAmount}
          onChange={(value) => setForm((previous) => ({ ...previous, taxAmount: value }))}
        />
      </div>
      <Button type="submit" variant="secondary">
        <Plus size={16} aria-hidden="true" />
        {t('business.addDocument')}
      </Button>
    </form>
  );
}

function NewPayment({ currency, max, onCreate }) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [receivedAt, setReceivedAt] = useState('');

  return (
    <form
      className="business-form business-payment"
      onSubmit={(event) => {
        event.preventDefault();
        onCreate({ value: toMinorUnits(value, currency), currency, receivedAt: new Date(receivedAt).toISOString() });
        setValue('');
      }}
    >
      <AmountField
        id={`payment-${max}`}
        label={t('business.paymentAmount')}
        currency={currency}
        value={value}
        onChange={setValue}
        required
      />
      <label>
        {t('business.paymentDate')}
        <input type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} required />
      </label>
      <Button type="submit" variant="secondary">
        <Receipt size={16} aria-hidden="true" />
        {t('business.addPayment')}
      </Button>
    </form>
  );
}
