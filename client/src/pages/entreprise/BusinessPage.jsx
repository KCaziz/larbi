import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, TrendingUp } from 'lucide-react';
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
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import { adultRefusalReason, isAdultRefusal } from '../../lib/adultRefusal.js';
import { useOrganisation } from '../../lib/organisation.js';
import { CreateOrganisation, JournalSection, MembersSection, OrganisationBar } from './Organisation.jsx';
import { AgingSection, InvoicingSection, invoicingError } from './Invoicing.jsx';
import { BudgetSection, CashPlanSection, SpecialisedHome, SteeringSection, StockSection } from './Pilot.jsx';
import { TradeSection } from './Trade.jsx';
import { PatrimonySection, ProjectsSection } from './Diaspora.jsx';
import { ToolsSection } from './Tools.jsx';
import { CampaignsSection, HrSection, PartnersSection } from './LotG.jsx';
import { PassportSection, ReceivablesFinancingSection } from './Financing.jsx';
import { PayrollSection } from './Payroll.jsx';
import { StaffSection } from './Staff.jsx';
import { LedgerSection } from './Ledger.jsx';
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
//
// P13-05, lot A (2026-11-23): the organisations of the client's référentiel.
// The bar on top chooses the organisation (and shows the invitations
// received); everything under it is that organisation, read again from
// scratch when the choice changes, and shown according to the person's role.
export default function BusinessPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [organisationId, setOrganisationId] = useOrganisation();
  const [creating, setCreating] = useState(false);
  const mine = useApi('/fin/entreprise/organisations');
  const organisations = mine.data?.organisations ?? [];
  const invitations = mine.data?.invitations ?? [];
  // A choice kept from another session that is no longer one of mine: the
  // server would answer « not found »; fall back to my own organisation.
  const known = organisations.some((org) => org.id === organisationId);
  if (mine.data && organisationId && !known) setOrganisationId(null);
  const current = known ? organisationId : (organisations.find((org) => org.role === 'owner') ?? organisations[0])?.id ?? null;
  const currentRole = organisations.find((org) => org.id === current)?.role ?? null;
  useDocumentMeta(t('business.title'), t('business.intro'));

  if (isAdultRefusal(mine.error)) {
    return (
      <>
        <PageHeader icon={Building2} title={t('business.title')} subtitle={t('business.intro')} maxWidth={1100} />
        <div className="business-page">
          <AdultOnly reason={adultRefusalReason(mine.error)} />
        </div>
      </>
    );
  }
  if (mine.status === 'loading' && !mine.data) return <LoadingState />;
  if (mine.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={mine.reload} />;

  const chosen = (id) => {
    setOrganisationId(id);
    setCreating(false);
    mine.reload();
  };

  return (
    <>
      <PageHeader icon={Building2} title={t('business.title')} subtitle={t('business.intro')} maxWidth={1100} />
      <div className="business-page">
        <OrganisationBar
          organisations={organisations}
          invitations={invitations}
          current={current}
          role={currentRole}
          onSwitch={chosen}
          onNew={() => setCreating(true)}
          onAnswered={(id) => (id ? chosen(id) : mine.reload())}
        />
        {creating || organisations.length === 0 ? (
          <CreateOrganisation currency={user?.finCurrency ?? 'DZD'} onCreated={chosen} onCancel={organisations.length > 0 ? () => setCreating(false) : null} />
        ) : (
          <BusinessSpace key={current} />
        )}
      </div>
    </>
  );
}

// One organisation: what the person's role lets them see and do.
function BusinessSpace() {
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState(null);
  const [tab, setTab] = useState(null);
  const business = useApi('/fin/entreprise');
  const can = (action) => (business.data?.permissions ?? []).includes(action);
  // Only once the organisation is known, and only what the role may read
  // (P13-05): a refused request would only show an error.
  const hasBusiness = Boolean(business.data?.entreprise);
  const readsFinance = hasBusiness && can('finance.read');
  const dashboard = useApi(readsFinance ? '/fin/entreprise/tableau-de-bord' : null);
  const documents = useApi(readsFinance ? '/fin/entreprise/documents' : null);

  if (business.status === 'loading' && !business.data) return <LoadingState />;
  if (business.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={business.reload} />;

  const entreprise = business.data?.entreprise ?? null;

  async function run(action, okKey) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(okKey) });
      business.reload();
      if (readsFinance) {
        dashboard.reload();
        documents.reload();
      }
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: invoicingError(t, err) });
      return false;
    }
  }

  // P13-05, lot C: one tab per part of the organisation, each shown only when
  // the role reaches it (the server checks again on every request).
  const tabs = [
    readsFinance && 'home',
    readsFinance && 'sales',
    can('stock.read') && 'stock',
    readsFinance && 'trade',
    // Lot E: every member reaches the projects shared with them (CNV-14).
    can('org.read') && 'projects',
    // Lot G: partners and crowdfunding; human resources without payroll.
    can('org.read') && 'funding',
    can('hr.read') && 'hr',
    // Lot G, second part: payroll and accounting, on default rules until confirmed.
    can('payroll.read') && 'payroll',
    can('ledger.read') && 'accounting',
    // Lot F: copilot, search, simulators and comparators.
    can('org.read') && 'tools',
    readsFinance && 'steer',
    (can('members.manage') || can('journal.read')) && 'team',
  ].filter(Boolean);
  const current = tabs.includes(tab) ? tab : tabs[0];

  return (
    <>
      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
          {message.text}
        </p>
      )}

      {entreprise && (
        <>
          {!readsFinance && <Notice variant="info">{t('business.org.noFigures')}</Notice>}
          {tabs.length > 1 && (
            <div className="business-tabs" role="tablist" aria-label={t('business.pilot.tabsLabel')}>
              {tabs.map((key) => (
                <button
                  key={key}
                  id={`business-tab-${key}`}
                  type="button"
                  role="tab"
                  aria-selected={current === key}
                  className={current === key ? 'business-tab is-on' : 'business-tab'}
                  onClick={() => setTab(key)}
                >
                  {t(`business.pilot.tabs.${key}`)}
                </button>
              ))}
            </div>
          )}

          {current === 'home' && (
            <>
              {/* La phrase qui cadre tout le reste, au-dessus des chiffres et
                  non en dessous. */}
              {dashboard.data && <Notice variant="info">{dashboard.data.avertissement}</Notice>}
              {dashboard.status === 'loading' && !dashboard.data ? (
                <LoadingState />
              ) : (
                <>
                  <SpecialisedHome publicKey={entreprise.publicKey} dashboard={dashboard.data} />

                  <section aria-labelledby="business-cash">
                    <h2 id="business-cash">{t('business.cashTitle')}</h2>
                    <div className="fin-figure-grid">
                      <FigureCard label={t('business.cashIn')} answer={dashboard.data?.encaissements} />
                      <FigureCard label={t('business.cashOut')} answer={dashboard.data?.decaissements} />
                      <FigureCard label={t('business.balance')} answer={dashboard.data?.tresorerie} />
                      <FigureCard label={t('business.receivables')} answer={dashboard.data?.creances} />
                      <FigureCard label={t('business.payables')} answer={dashboard.data?.dettes} />
                      <FigureCard label={t('business.overdue')} answer={dashboard.data?.echu} />
                    </div>
                  </section>

                  {/* P13-05, lot B: what was sold and what is promised, excluding tax. */}
                  {dashboard.data && (
                    <section aria-labelledby="business-sales">
                      <h2 id="business-sales">
                        <TrendingUp size={18} aria-hidden="true" /> {t('business.inv.salesTitle')}
                      </h2>
                      <div className="fin-figure-grid">
                        <FigureCard label={t('business.inv.invoiced')} answer={dashboard.data.caFacture} />
                        <FigureCard label={t('business.inv.margin')} answer={dashboard.data.marge} />
                        <FigureCard label={t('business.inv.openQuotes')} answer={dashboard.data.devisEnCours} />
                        {dashboard.data.aRembourser?.resultat > 0 && <FigureCard label={t('business.inv.refundDue')} answer={dashboard.data.aRembourser} />}
                      </div>
                    </section>
                  )}

                  <AgingSection aging={dashboard.data?.balanceAgee} currency={entreprise.currency} />

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
                            <span className="business-late-amount">{formatAmount(i18n.language, row.resteDu, entreprise.currency)}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </>
              )}
            </>
          )}

          {/* P13-05, lot B (19_CYCLE_FACTURE): clients, quotes, invoices,
              credit notes, reminders, export. */}
          {current === 'sales' && <InvoicingSection business={entreprise} documents={documents.data?.documents ?? []} can={can} run={run} />}

          {/* P13-05, lot D: micro-import and international trade. */}
          {current === 'trade' && <TradeSection business={entreprise} can={can} run={run} />}

          {/* P13-05, lot E: projects followed from abroad, and the patrimony. */}
          {current === 'projects' && (
            <>
              <ProjectsSection business={entreprise} can={can} run={run} />
              {can('patrimony.read') && <PatrimonySection business={entreprise} canWrite={can('patrimony.write')} run={run} />}
            </>
          )}

          {current === 'funding' && (
            <>
              <PartnersSection business={entreprise} can={can} run={run} />
              {/* Lot F bis: the financial passport (FAC-010) and the receivables to finance (FAC-011). */}
              {can('finance.read') && <PassportSection can={can} run={run} />}
              {can('finance.read') && <ReceivablesFinancingSection business={entreprise} can={can} run={run} />}
              {can('finance.read') && <CampaignsSection business={entreprise} can={can} run={run} />}
            </>
          )}
          {current === 'hr' && (
            <>
              <HrSection can={can} run={run} />
              <StaffSection business={entreprise} can={can} run={run} />
            </>
          )}
          {current === 'payroll' && <PayrollSection business={entreprise} can={can} run={run} />}
          {current === 'accounting' && <LedgerSection business={entreprise} can={can} run={run} />}

          {current === 'tools' && <ToolsSection business={entreprise} can={can} onOpen={(key) => key && setTab(key)} />}

          {current === 'stock' && <StockSection currency={entreprise.currency} canWrite={can('stock.write')} showValues={readsFinance} run={run} />}

          {current === 'steer' && (
            <>
              <SteeringSection dashboard={dashboard.data} currency={entreprise.currency} />
              <CashPlanSection currency={entreprise.currency} canWrite={can('cash.write')} run={run} />
              <BudgetSection currency={entreprise.currency} canWrite={can('budget.write')} run={run} />

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
            </>
          )}

          {/* P13-05, lot A: who works here, with which rights, and what was done. */}
          {current === 'team' && (
            <>
              {can('members.manage') && <MembersSection />}
              {can('journal.read') && <JournalSection />}
            </>
          )}
        </>
      )}
    </>
  );
}
