import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Calculator, CreditCard, Scale } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { formatAmount } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import { toMinorUnits } from '../../lib/money.js';
import '../../components/fincludia/Fincludia.css';
import './CreditSimulator.css';

// Simulateur de crédit (P4-02) et comparaison de financements (P4-15).
//
// Cette page calcule sur les chiffres que la personne saisit, et n'affirme
// jamais ce qu'une banque fera. Le client le dit en une phrase, reprise telle
// quelle par le serveur : « l'établissement prêteur reste décisionnaire ».
//
// Ce qu'elle ne propose PAS, et ce n'est pas un oubli : un menu déroulant de
// taux par banque. Aucune des 25 offres du référentiel n'est publiable tant
// que les brochures officielles n'ont pas été contrôlées, et proposer un taux
// dans une liste reviendrait à le publier. Le taux est donc saisi, et la liste
// des offres dit ce qui existe et ce qui manque.
export default function CreditSimulatorPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({ principal: '', annualRate: '', months: '60', income: '', existingInstalments: '', fees: '', insurance: '', kind: 'Consommation' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const rules = useApi('/tools/credit/regles');
  const offers = useApi('/tools/credit/offres');
  useDocumentMeta(t('creditSim.title'), t('creditSim.intro'));

  const currency = user?.finCurrency ?? 'DZD';
  const set = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError(null);
    try {
      const body = {
        principal: toMinorUnits(form.principal, currency),
        // Le taux est saisi en pourcentage et envoyé en décimal : le moteur
        // ne manipule que des décimaux, et l'interface ne montre que des
        // pourcentages. La conversion se fait ici, une fois.
        annualRate: Number(form.annualRate) / 100,
        months: Number(form.months),
        kind: form.kind,
        ...(form.income ? { income: toMinorUnits(form.income, currency) } : {}),
        ...(form.existingInstalments ? { existingInstalments: toMinorUnits(form.existingInstalments, currency, { allowZero: true }) } : {}),
        ...(form.fees ? { fees: toMinorUnits(form.fees, currency, { allowZero: true }) } : {}),
        ...(form.insurance ? { insurance: toMinorUnits(form.insurance, currency, { allowZero: true }) } : {}),
      };
      setResult(await api.post('/tools/credit/simuler', body));
    } catch (err) {
      setError(t(errorKey(err, { 400: 'creditSim.errors.input' })));
    }
  }

  if (rules.status === 'loading' && !rules.data) return <LoadingState />;
  if (rules.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={rules.reload} />;

  return (
    <>
      <PageHeader icon={Calculator} title={t('creditSim.title')} subtitle={t('creditSim.intro')} />

      <Section>
        {/* La phrase du client, au-dessus du formulaire et non sous le
            résultat : elle cadre ce qu'on s'apprête à lire. */}
        <Notice variant="info">{rules.data.messages.simulation}</Notice>

        <form className="credit-form" onSubmit={submit}>
          <div className="credit-form-row">
            <label>
              {t('creditSim.kind')}
              <select value={form.kind} onChange={set('kind')}>
                <option value="Consommation">{t('creditSim.kinds.consumer')}</option>
                <option value="Automobile">{t('creditSim.kinds.auto')}</option>
                <option value="Immobilier">{t('creditSim.kinds.housing')}</option>
              </select>
            </label>
            <AmountField
              id="credit-principal"
              label={t('creditSim.principal')}
              currency={currency}
              value={form.principal}
              onChange={(value) => setForm((previous) => ({ ...previous, principal: value }))}
              required
            />
            <label>
              {t('creditSim.rate')}
              <input type="number" step="0.01" min="0" max="100" value={form.annualRate} onChange={set('annualRate')} required />
            </label>
            <label>
              {t('creditSim.months')}
              <input type="number" min="1" max="600" value={form.months} onChange={set('months')} required />
            </label>
          </div>

          <div className="credit-form-row">
            <AmountField
              id="credit-income"
              label={t('creditSim.income')}
              currency={currency}
              value={form.income}
              onChange={(value) => setForm((previous) => ({ ...previous, income: value }))}
              hint={t('creditSim.incomeHint')}
            />
            <AmountField
              id="credit-existing"
              label={t('creditSim.existing')}
              currency={currency}
              value={form.existingInstalments}
              onChange={(value) => setForm((previous) => ({ ...previous, existingInstalments: value }))}
            />
            <AmountField
              id="credit-fees"
              label={t('creditSim.fees')}
              currency={currency}
              value={form.fees}
              onChange={(value) => setForm((previous) => ({ ...previous, fees: value }))}
            />
            <AmountField
              id="credit-insurance"
              label={t('creditSim.insurance')}
              currency={currency}
              value={form.insurance}
              onChange={(value) => setForm((previous) => ({ ...previous, insurance: value }))}
            />
          </div>

          <Button type="submit" variant="primary">
            <Calculator size={16} aria-hidden="true" />
            {t('creditSim.compute')}
          </Button>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </Section>

      {result && (
        <Section title={t('creditSim.resultTitle')}>
          {/* Le blocage légal passe AVANT les chiffres : un plafond dépassé
              n'est pas une note de bas de page sur une mensualité. */}
          {result.bloquants.map((message) => (
            <Notice key={message} variant="action-needed">
              <AlertTriangle size={16} aria-hidden="true" /> {message}
            </Notice>
          ))}

          <div className="fin-figure-grid">
            <FigureCard label={t('creditSim.instalment')} answer={result.mensualite} />
            <FigureCard label={t('creditSim.totalCost')} answer={result.coutTotal} />
          </div>

          <dl className="credit-ratios">
            <div>
              <dt>{t('creditSim.dsrBefore')}</dt>
              <dd>{ratio(result.tauxEffortAvant, t)}</dd>
            </div>
            <div>
              <dt>{t('creditSim.dsrAfter')}</dt>
              <dd>{ratio(result.tauxEffortApres, t)}</dd>
            </div>
            <div>
              <dt>{t('creditSim.cap')}</dt>
              <dd>
                {result.plafondMensualite.cap === null
                  ? t('creditSim.capUnknown')
                  : formatAmount(i18n.language, result.plafondMensualite.cap, currency)}
              </dd>
            </div>
          </dl>

          {/* Pourquoi il n'y a pas de plafond, quand il n'y en a pas. Sans
              cette phrase, l'absence se lirait comme « pas de limite ». */}
          {result.plafondMensualite.message && <Notice variant="info">{result.plafondMensualite.message}</Notice>}
          {result.plafondMensualite.source && (
            <p className="credit-source">
              {t('creditSim.capSource')} {result.plafondMensualite.source}
            </p>
          )}
        </Section>
      )}

      <Section title={t('creditSim.offersTitle')} subtitle={t('creditSim.offersIntro')}>
        {offers.status === 'loading' && !offers.data ? (
          <LoadingState />
        ) : (
          <>
            {/* Shown at the client's request (P8-28), each with its source. */}
            <Notice variant="info">{offers.data?.affichage?.notice ?? t('creditSim.offersSource')}</Notice>
            <ul className="credit-offers">
              {(offers.data?.offres ?? []).map((offer) => (
                <li key={offer.ref} className="credit-offer">
                  <div className="credit-offer-head">
                    <strong>{offer.banque}</strong>
                    <span>{offer.produit}</span>
                    <span className={offer.islamique ? 'credit-badge credit-badge-islamic' : 'credit-badge'}>
                      {offer.islamique ? t('creditSim.islamic') : t('creditSim.conventional')}
                    </span>
                  </div>
                  {offer.criteres && (
                    <dl className="credit-offer-criteria">
                      {['taux', 'duree', 'effort', 'apport', 'age', 'revenu'].map((key) => (
                        <div key={key}>
                          <dt>{t(`creditSim.criteria.${key}`)}</dt>
                          <dd>{offer.criteres[key]}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="credit-offer-reason">{t('creditSim.declaredStatus', { status: offer.statutDeclare, source: offer.source })}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      <Section title={t('creditSim.rulesTitle')}>
        <ul className="credit-rules">
          {rules.data.regles.map((rule) => (
            <li key={rule.key}>
              <Scale size={15} aria-hidden="true" />
              <span>
                <strong>{rule.label}</strong> — {rule.rule}
              </span>
            </li>
          ))}
        </ul>
        <p className="credit-source">
          <CreditCard size={15} aria-hidden="true" /> {rules.data.messages.verifiedProduct.replace('{{date}}', '—')}
        </p>
      </Section>
    </>
  );
}

// Un taux d'effort inconnu n'est pas 0 % : sans revenu saisi, on ne sait rien.
function ratio(value, t) {
  if (value === null || value === undefined) return t('fincludia.notComputed');
  return `${(value * 100).toFixed(1)} %`;
}
