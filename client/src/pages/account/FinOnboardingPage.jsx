import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleHelp, Sparkles } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { fromMinorUnits, toMinorUnits } from '../../lib/money.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';
import '../Pages.css';
import './FinOnboarding.css';

// Progressive financial onboarding (P6-03, screens C03, LY01, ET01, SA01,
// EP01). The client's shape, kept literally: the fewest questions that give a
// useful first result, each one skippable, each one able to say why it is
// asked, and the whole thing leavable half-done.
//
// Which questions appear is decided by the SERVER from the account's FINCLUDIA
// public — a lycéen is never asked about debt, and that is enforced there, not
// by hiding a field here.
export default function FinOnboardingPage() {
  const { t } = useTranslation();
  const state = useApi('/fin/onboarding');
  const [message, setMessage] = useState(null);

  // Only the first load replaces the page, so saving never flashes it away.
  if (state.status === 'loading' && !state.data) return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={state.reload} />;

  const { completeness, confirmations, result, currency, fictional, fictionalOffer, formulas, completedAt } = state.data;
  const byId = new Map((formulas ?? []).map((formula) => [formula.id, formula]));

  async function save(extra = {}, okKey = 'finOnboarding.saved') {
    setMessage(null);
    try {
      await api.put('/fin/onboarding', extra);
      setMessage({ kind: 'ok', text: t(okKey) });
      state.reload();
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'finOnboarding.errors.invalid' })) });
      return false;
    }
  }

  return (
    <div>
      <h2 className="account-heading">{t('finOnboarding.title')}</h2>
      <p>{t('finOnboarding.intro')}</p>

      {/* Never a dead end: every question can be skipped, and the whole thing
          can be left and resumed. Saying so up front is the client's own
          wording of the three buttons. */}
      <Notice variant="info">{t('finOnboarding.skipNote')}</Notice>

      {fictional && <Notice variant="action-needed">{t('finOnboarding.fictionalActive')}</Notice>}

      {/* The confirmation lives HERE, not in the form: saving reloads the
          state, which re-seeds the form, and a message held by the form would
          be unmounted before anyone could read it. */}
      {message && (
        <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
          {message.text}
        </p>
      )}

      <p className="fin-onboarding-progress">
        <progress value={completeness.answered} max={Math.max(1, completeness.applicable)} />
        {t('finOnboarding.completeness', { answered: completeness.answered, total: completeness.applicable, skipped: completeness.skipped })}
      </p>

      {/* An answer far out of scale ASKS, it never blocks: the client's rule is
          « demande de confirmation, jamais de blocage silencieux ». */}
      {confirmations.length > 0 && (
        <Notice variant="action-needed">
          {t('finOnboarding.confirmNeeded', {
            questions: confirmations.map((item) => t(`finOnboarding.questions.${item.question}`, { defaultValue: item.question })).join(', '),
          })}
        </Notice>
      )}

      {/* Keyed on the loaded state: a fresh local copy of the answers is seeded
          once per load, with no effect needed to sync it afterwards. */}
      <AnswersForm
        key={completeness.answered + ':' + completeness.skipped + ':' + String(fictional)}
        questions={state.data.questions}
        confirmations={confirmations}
        currency={currency}
        onSave={save}
        onFinish={async () => {
          await api.post('/fin/onboarding/terminer', {});
          state.reload();
        }}
        showFinish={!completedAt}
      />

      {/* The client offers the fictional starter budget to a lycéen, it does
          not impose it — and a figure computed from it is badged everywhere. */}
      {fictionalOffer && (
        <section className="fin-onboarding-offer">
          <h3>
            <Sparkles size={17} aria-hidden="true" /> {t('finOnboarding.fictionalTitle')}
          </h3>
          <p>
            {t('finOnboarding.fictionalOffer', {
              amount: fromMinorUnits(fictionalOffer.amount, fictionalOffer.currency),
              currency: fictionalOffer.currency,
            })}
          </p>
          <Button onClick={() => save({ fictional: true }, 'finOnboarding.fictionalStarted')}>{t('finOnboarding.fictionalAccept')}</Button>
        </section>
      )}

      <section>
        <h3 className="account-heading">{t('finOnboarding.resultTitle')}</h3>
        <p>{t('finOnboarding.resultIntro')}</p>
        <div className="fin-figure-grid">
          <FigureCard label={t('finOnboarding.result.revenus')} answer={result.revenus} formula={byId.get('F002')} simulation={fictional} />
          <FigureCard label={t('finOnboarding.result.depenses')} answer={result.depenses} formula={byId.get('F003')} simulation={fictional} />
          <FigureCard label={t('finOnboarding.result.fluxNet')} answer={result.fluxNet} formula={byId.get('F004')} simulation={fictional} />
          {/* Shown only when a debt instalment was actually declared: a 0 %
              effort rate would read as "no debt", which is an answer we do not
              have — the question may simply have been skipped. */}
          {result.tauxEffortDette && (
            <FigureCard
              label={t('finOnboarding.result.tauxEffortDette')}
              answer={result.tauxEffortDette}
              formula={byId.get('F018')}
              simulation={fictional}
            />
          )}
        </div>
        {result.objectif && (
          <p className="fin-onboarding-goal">
            {t('finOnboarding.goalLine', {
              label: result.objectif.libelle ?? result.objectif.categorie,
              amount:
                result.objectif.montant === null
                  ? t('finOnboarding.noTarget')
                  : `${fromMinorUnits(result.objectif.montant, currency)} ${currency}`,
            })}
          </p>
        )}
        <p>
          <Link to="/mon-argent">{t('finOnboarding.toMoney')}</Link>
        </p>
      </section>
    </div>
  );
}

function AnswersForm({ questions, confirmations, currency, onSave, onFinish, showFinish }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(() => seed(questions, currency));
  const [saving, setSaving] = useState(false);
  const [openWhy, setOpenWhy] = useState(null);
  const needsConfirmation = new Set(confirmations.map((item) => item.question));

  const change = (key, next) => setDraft((current) => ({ ...current, [key]: { ...current[key], ...next } }));

  const submit = async (then) => {
    setSaving(true);
    const answers = collect(questions, draft, currency);
    const ok = await onSave(Object.keys(answers).length > 0 ? { answers } : {});
    setSaving(false);
    if (ok && then) await then();
  };

  return (
    <form
      className="fin-onboarding-form"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {questions.map((question) => (
        <fieldset className="fin-onboarding-question" key={question.key}>
          <legend>
            {t(`finOnboarding.questions.${question.key}`, { defaultValue: question.key })}
            <button
              type="button"
              className="fin-onboarding-why"
              aria-expanded={openWhy === question.key}
              onClick={() => setOpenWhy((current) => (current === question.key ? null : question.key))}
            >
              <CircleHelp size={15} aria-hidden="true" /> {t('finOnboarding.whyAsked')}
            </button>
          </legend>

          {/* The client's own « Pourquoi cette question ? ». The text comes
              from the server, next to the question it explains. */}
          {openWhy === question.key && <p className="fin-onboarding-why-text">{question.why}</p>}

          <QuestionFields
            question={question}
            value={draft[question.key] ?? {}}
            currency={currency}
            onChange={(next) => change(question.key, next)}
            needsConfirmation={needsConfirmation.has(question.key)}
          />

          <label className="fin-onboarding-skip">
            <input type="checkbox" checked={Boolean(draft[question.key]?.skipped)} onChange={(event) => change(question.key, { skipped: event.target.checked })} />
            {t('finOnboarding.skip')}
          </label>
        </fieldset>
      ))}

      <div className="fin-onboarding-actions">
        <Button type="submit" disabled={saving}>
          {t('finOnboarding.saveAndQuit')}
        </Button>
        {showFinish && (
          <button type="button" className="fin-onboarding-plain" disabled={saving} onClick={() => submit(onFinish)}>
            {t('finOnboarding.finish')}
          </button>
        )}
      </div>
    </form>
  );
}

// The local copy of the answers already stored, as the form fields want them.
function seed(questions, currency) {
  const draft = {};
  for (const question of questions) {
    const answer = question.answer;
    if (!answer) continue;
    draft[question.key] = {
      skipped: Boolean(answer.skipped),
      amount: answer.amount === undefined || answer.amount === null ? '' : fromMinorUnits(answer.amount, currency),
      frequency: answer.frequency ?? '',
      choice: answer.choice ?? '',
      text: answer.text ?? '',
      confirmed: Boolean(answer.confirmed),
    };
  }
  return draft;
}

// What the form sends: only the questions actually filled in. A partial batch is
// the normal case — « Enregistrer et quitter » must work at any point.
function collect(questions, draft, currency) {
  const answers = {};
  for (const question of questions) {
    const value = draft[question.key];
    if (!value) continue;
    if (value.skipped) {
      answers[question.key] = { skipped: true };
      continue;
    }
    const confirmed = value.confirmed ? { confirmed: true } : {};
    // 0 is a real answer here ("I have no savings"), so it must not be read as
    // an empty field.
    const amount = toMinorUnits(value.amount, currency, { allowZero: true });
    if (question.kind === 'resource' || question.kind === 'expense') {
      if (amount === null) continue;
      answers[question.key] = { amount, ...(value.frequency ? { frequency: value.frequency } : {}), ...confirmed };
    } else if (question.kind === 'amount') {
      if (amount === null) continue;
      answers[question.key] = { amount, ...confirmed };
    } else if (question.kind === 'choice') {
      if (value.choice) answers[question.key] = { choice: value.choice };
    } else if (value.text?.trim()) {
      answers[question.key] = { text: value.text.trim() };
    }
  }
  return answers;
}

function QuestionFields({ question, value, currency, onChange, needsConfirmation }) {
  const { t } = useTranslation();
  const disabled = Boolean(value.skipped);

  if (question.kind === 'choice') {
    return (
      <div className="fin-field">
        <label htmlFor={`q-${question.key}`}>{t('finOnboarding.chooseOne')}</label>
        <select id={`q-${question.key}`} value={value.choice ?? ''} onChange={(event) => onChange({ choice: event.target.value })} disabled={disabled}>
          <option value="">{t('finOnboarding.noChoice')}</option>
          {question.options.map((option) => (
            <option key={option} value={option}>
              {t(`finOnboarding.options.${option}`, { defaultValue: option })}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (question.kind === 'text') {
    return (
      <div className="fin-field">
        <label htmlFor={`q-${question.key}`}>{t('finOnboarding.yourAnswer')}</label>
        <input id={`q-${question.key}`} value={value.text ?? ''} maxLength={80} onChange={(event) => onChange({ text: event.target.value })} disabled={disabled} />
      </div>
    );
  }

  return (
    <>
      <AmountField
        id={`q-${question.key}`}
        label={t('finOnboarding.amount')}
        value={value.amount ?? ''}
        currency={currency}
        onChange={(amount) => onChange({ amount })}
        disabled={disabled}
      />
      {/* A frequency is required for anything periodic: a weekly amount and the
          same amount per month are not the same resource (F001), and guessing
          would turn a yearly grant into twelve times itself. */}
      {question.needsFrequency && (
        <div className="fin-field">
          <label htmlFor={`f-${question.key}`}>{t('finOnboarding.frequency')}</label>
          <select id={`f-${question.key}`} value={value.frequency ?? ''} onChange={(event) => onChange({ frequency: event.target.value })} disabled={disabled}>
            <option value="">{question.kind === 'expense' ? t('finOnboarding.monthlyDefault') : t('finOnboarding.pickFrequency')}</option>
            {['hebdomadaire', 'mensuel', 'trimestriel', 'semestriel', 'annuel'].map((frequency) => (
              <option key={frequency} value={frequency}>
                {t(`finOnboarding.frequencies.${frequency}`)}
              </option>
            ))}
          </select>
        </div>
      )}
      {needsConfirmation && (
        <label className="fin-onboarding-confirm">
          <input type="checkbox" checked={Boolean(value.confirmed)} onChange={(event) => onChange({ confirmed: event.target.checked })} />
          {t('finOnboarding.confirmAnyway')}
        </label>
      )}
    </>
  );
}
