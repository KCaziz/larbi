import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertTriangle, Calculator, FileText, History, Plus, Save, Trash2, Wallet, X } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import '../../components/fincludia/Fincludia.css';
import './CreditSimulator.css';
import './Payslip.css';

// Décodeur de fiche de paie (P8-15, ancien écran C15, réponse du client D5).
//
// La personne saisit les lignes de SA fiche ; le serveur les explique, vérifie
// l'arithmétique et signale les écarts avec le référentiel légal, sans jamais
// recalculer le salaire. Rien n'est conservé sans son accord : l'historique ne
// reçoit une fiche que si elle coche le consentement, et elle l'en retire
// quand elle veut. L'ajout au revenu mensuel passe par une confirmation, puis
// par le module revenus (`POST /fin/revenus`), comme n'importe quel revenu.
//
// Le référentiel de paie est algérien : tout est en dinars.
const CURRENCY = 'DZD';
const STARTING_LINES = ['base_salary', 'social_employee', 'irg'];

let nextId = 0;
const newLine = (kind = 'base_salary') => ({ id: (nextId += 1), kind, label: '', value: '' });
const fromMinor = (minor) => (minor === null || minor === undefined ? '' : String(minor / 100));

export default function PayslipPage() {
  const { t, i18n } = useTranslation();
  const reference = useApi('/fin/paie/reference');
  const history = useApi('/fin/paie/fiches');
  const [period, setPeriod] = useState('');
  const [declaredNet, setDeclaredNet] = useState('');
  const [lines, setLines] = useState(() => STARTING_LINES.map(newLine));
  const [result, setResult] = useState(null);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState(null);
  const [consent, setConsent] = useState(false);
  const [kept, setKept] = useState(null);
  const [confirmIncome, setConfirmIncome] = useState(false);
  const [incomeAdded, setIncomeAdded] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  useDocumentMeta(t('payslip.title'), t('payslip.intro'));

  const money = (minor) => formatAmount(i18n.language, minor, CURRENCY);
  const kindLabel = (kind) => t(`payslip.kinds.${kind.key}`, { defaultValue: kind.label });
  const setLine = (id, patch) => setLines((previous) => previous.map((line) => (line.id === id ? { ...line, ...patch } : line)));

  async function submit(event) {
    event.preventDefault();
    setError(null);
    setKept(null);
    setConfirmIncome(false);
    setIncomeAdded(false);
    const typed = lines.filter((line) => line.value !== '');
    const values = typed.map((line) => toMinorUnits(line.value, CURRENCY, { allowZero: true }));
    const net = declaredNet ? toMinorUnits(declaredNet, CURRENCY, { allowZero: true }) : null;
    if (typed.length === 0 || values.some((value) => value === null) || (net === null && declaredNet)) {
      setError(t('payslip.errors.input'));
      return;
    }
    const body = {
      lines: typed.map((line, index) => ({ kind: line.kind, ...(line.label.trim() ? { label: line.label.trim() } : {}), value: values[index] })),
      ...(net !== null ? { declaredNet: net } : {}),
      ...(period ? { period } : {}),
    };
    try {
      setResult(await api.post('/fin/paie/decoder', body));
      setSent(body);
    } catch (err) {
      setError(t(errorKey(err, { 400: 'payslip.errors.input' })));
    }
  }

  async function keep() {
    setError(null);
    try {
      setKept((await api.post('/fin/paie/fiches', { ...sent, consent: true })).fiche);
      history.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    }
  }

  async function addIncome() {
    setError(null);
    try {
      await api.post('/fin/revenus', {
        label: sent.period ? t('payslip.incomeLabelPeriod', { period: sent.period }) : t('payslip.incomeLabel'),
        value: result.net.resultat,
        currency: CURRENCY,
        frequency: 'mensuel',
        startDate: new Date().toISOString(),
      });
      setIncomeAdded(true);
      setConfirmIncome(false);
    } catch (err) {
      setError(t(errorKey(err)));
    }
  }

  async function remove(id) {
    setError(null);
    try {
      await api.delete(`/fin/paie/fiches/${id}`);
      setToDelete(null);
      if (kept?.id === id) setKept(null);
      history.reload();
    } catch (err) {
      setError(t(errorKey(err)));
    }
  }

  // Revoir une fiche conservée : elle revient dans le formulaire, telle
  // qu'elle avait été saisie.
  function reopen(fiche) {
    setPeriod(fiche.period ?? '');
    setDeclaredNet(fromMinor(fiche.declaredNet));
    setLines(fiche.lines.map((line) => ({ ...newLine(line.kind), label: line.label ?? '', value: fromMinor(line.value) })));
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (reference.status === 'loading' && !reference.data) return <LoadingState />;
  if (reference.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={reference.reload} />;
  const kinds = reference.data.lignes;
  const groupOf = (key) => kinds.find((kind) => kind.key === key)?.group;
  const fiches = history.data?.fiches ?? [];

  return (
    <>
      <PageHeader icon={FileText} title={t('payslip.title')} subtitle={t('payslip.intro')} />

      <Section>
        <Notice variant="info">{reference.data.limite}</Notice>

        <form className="credit-form payslip-form" onSubmit={submit}>
          <div className="credit-form-row">
            <label>
              {t('payslip.period')}
              <input type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
            </label>
            <AmountField id="payslip-declared-net" label={t('payslip.declaredNet')} currency={CURRENCY} value={declaredNet} onChange={setDeclaredNet} hint={t('payslip.declaredNetHint')} />
          </div>

          <fieldset className="payslip-lines">
            <legend>{t('payslip.lines')}</legend>
            <p className="payslip-hint">{t('payslip.linesHint')}</p>
            {lines.map((line, index) => (
              <div className={`payslip-line payslip-line-${groupOf(line.kind)}`} key={line.id}>
                <label>
                  {t('payslip.kind')}
                  <select value={line.kind} onChange={(event) => setLine(line.id, { kind: event.target.value })}>
                    {kinds.map((kind) => (
                      <option key={kind.key} value={kind.key}>
                        {kindLabel(kind)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('payslip.label')}
                  <input type="text" maxLength={80} value={line.label} onChange={(event) => setLine(line.id, { label: event.target.value })} />
                </label>
                <AmountField id={`payslip-line-${line.id}`} label={t('payslip.value')} currency={CURRENCY} value={line.value} onChange={(value) => setLine(line.id, { value })} required />
                <button
                  type="button"
                  className="payslip-remove"
                  onClick={() => setLines((previous) => previous.filter((other) => other.id !== line.id))}
                  aria-label={t('payslip.removeLine', { n: index + 1 })}
                  disabled={lines.length === 1}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            ))}
            <Button type="button" variant="ghost" onClick={() => setLines((previous) => [...previous, newLine('allowance')])} disabled={lines.length >= 60}>
              <Plus size={16} aria-hidden="true" />
              {t('payslip.addLine')}
            </Button>
          </fieldset>

          <Button type="submit" variant="primary">
            <Calculator size={16} aria-hidden="true" />
            {t('payslip.decode')}
          </Button>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </Section>

      {result && (
        <Section title={t('payslip.resultTitle')}>
          {result.controles.map((check) => (
            <Notice key={check.key} variant="action-needed">
              <AlertTriangle size={16} aria-hidden="true" /> {check.message}
              {check.gap !== undefined && <> ({t('payslip.gap', { gap: money(check.gap) })})</>}
            </Notice>
          ))}

          <div className="fin-figure-grid">
            <FigureCard label={t('payslip.gross')} answer={result.brut} />
            <FigureCard label={t('payslip.deductions')} answer={result.retenues} />
            <FigureCard label={t('payslip.net')} answer={result.net} />
          </div>

          {/* Le rapprochement avec la fiche réelle, dit en une ligne. */}
          {result.netDeclare !== null && (
            <p className={result.net.resultat === result.netDeclare ? 'payslip-match' : 'payslip-mismatch'}>
              {result.net.resultat === result.netDeclare
                ? t('payslip.matches', { net: money(result.netDeclare) })
                : t('payslip.differs', { net: money(result.netDeclare), gap: money(result.net.resultat - result.netDeclare) })}
            </p>
          )}

          <h3 className="payslip-subtitle">{t('payslip.explained')}</h3>
          <ul className="payslip-explained">
            {result.lignes.map((line, index) => (
              <li key={`${line.kind}-${index}`} className={`payslip-line-${line.group}`}>
                <div className="payslip-explained-head">
                  <strong>{line.label}</strong>
                  <span>
                    {line.sign < 0 ? '−' : ''}
                    {money(line.value)}
                  </span>
                </div>
                {line.explication !== line.label && <p>{line.explication}</p>}
              </li>
            ))}
          </ul>

          {result.aConfirmer.length > 0 && <Notice variant="info">{t('payslip.toConfirm', { count: result.aConfirmer.length })}</Notice>}
          {result.regimeIrg && (
            <p className="credit-source">
              {t('payslip.irgRegime')} {result.regimeIrg.rule}
            </p>
          )}
          {result.primes && <p className="credit-source">{result.primes.rule}</p>}
          <ul className="payslip-disclaimers">
            {result.avertissements.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
            {result.net.warnings?.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>

          <div className="payslip-actions">
            {kept ? (
              <Notice variant="info">{t('payslip.kept')}</Notice>
            ) : (
              <div className="payslip-keep">
                <label className="payslip-consent">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  {t('payslip.consent')}
                </label>
                <Button type="button" variant="ghost" onClick={keep} disabled={!consent}>
                  <Save size={16} aria-hidden="true" />
                  {t('payslip.keep')}
                </Button>
              </div>
            )}

            {incomeAdded ? (
              <Notice variant="info">
                {t('payslip.incomeAdded')} <Link to="/app/synthese">{t('payslip.seeIncomes')}</Link>
              </Notice>
            ) : confirmIncome ? (
              <div className="payslip-confirm" role="group" aria-label={t('payslip.addIncome')}>
                <p>{t('payslip.confirmIncome', { net: money(result.net.resultat) })}</p>
                <Button type="button" variant="primary" onClick={addIncome}>
                  {t('payslip.confirm')}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setConfirmIncome(false)}>
                  {t('payslip.cancel')}
                </Button>
              </div>
            ) : (
              <Button type="button" variant="ghost" onClick={() => setConfirmIncome(true)} disabled={!(result.net.resultat > 0)}>
                <Wallet size={16} aria-hidden="true" />
                {t('payslip.addIncome')}
              </Button>
            )}
          </div>
        </Section>
      )}

      <Section title={t('payslip.historyTitle')} subtitle={t('payslip.historyIntro')}>
        {history.status === 'loading' && !history.data ? (
          <LoadingState />
        ) : fiches.length === 0 ? (
          <p className="payslip-empty">
            <History size={16} aria-hidden="true" /> {t('payslip.historyEmpty')}
          </p>
        ) : (
          <ul className="payslip-history">
            {fiches.map((fiche) => (
              <li key={fiche.id}>
                <div>
                  <strong>{fiche.period ?? new Date(fiche.createdAt).toLocaleDateString(i18n.language)}</strong>
                  <span>
                    {t('payslip.gross')} {money(fiche.gross)} · {t('payslip.net')} {money(fiche.value)}
                  </span>
                </div>
                <div className="payslip-history-actions">
                  <Button type="button" variant="ghost" onClick={() => reopen(fiche)}>
                    {t('payslip.reopen')}
                  </Button>
                  {toDelete === fiche.id ? (
                    <>
                      <Button type="button" variant="primary" onClick={() => remove(fiche.id)}>
                        {t('payslip.confirmDelete')}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setToDelete(null)}>
                        {t('payslip.cancel')}
                      </Button>
                    </>
                  ) : (
                    <Button type="button" variant="ghost" onClick={() => setToDelete(fiche.id)} aria-label={t('payslip.deleteOne', { period: fiche.period ?? '' })}>
                      <Trash2 size={16} aria-hidden="true" />
                      {t('payslip.delete')}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
