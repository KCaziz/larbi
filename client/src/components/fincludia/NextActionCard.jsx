import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Fincludia.css';

// The client's « Prochaine action » card (P1-12): a title, the reason, the
// impact, one main button, and « Pourquoi ? ».
//
// The card is told what to show; it decides nothing. The server picks the
// actions, caps them at three and orders them by the client's own priority
// (sécurité > échéance > budget > apprentissage), so the "next" action is
// simply the first one it sent.
//
// On the four parts, and which of them is data:
//   title    the action, from its key.
//   reason   WHY NOW, interpolated from the server's `contexte` — three
//            movements to classify, two days to an instalment. A count the
//            server computed, never an estimate.
//   impact   what becomes computable once it is done. This describes OUR
//            software, not the user's money: "your spending per category
//            becomes computable" is a fact about the product. No figure is
//            promised, because no figure is known — a card that said "you
//            would save 4 000 DZD" would be inventing one.
//   why      the rule behind the card: which priority put it first, and that
//            it follows a declared order rather than a prediction.
export default function NextActionCard({ action, titleKey = 'fincludia.nextAction.title' }) {
  const { t } = useTranslation();
  if (!action) return null;

  const context = action.contexte ?? {};

  return (
    <article className={`fin-next-action fin-next-action-${action.priority}`}>
      <p className="fin-next-action-kicker">{t(titleKey)}</p>
      <h3 className="fin-next-action-title">{t(`today.actions.${action.key}`, context)}</h3>

      <dl className="fin-next-action-body">
        <dt>{t('fincludia.nextAction.reason')}</dt>
        <dd>{t(`fincludia.nextAction.reasons.${action.key}`, context)}</dd>
        <dt>{t('fincludia.nextAction.impact')}</dt>
        <dd>{t(`fincludia.nextAction.impacts.${action.key}`, context)}</dd>
      </dl>

      <Link to={action.to} className="fin-next-action-cta">
        {t('fincludia.nextAction.go')}
        <ArrowRight size={16} aria-hidden="true" className="icon-dir" />
      </Link>

      <details className="fin-next-action-why">
        <summary>{t('fincludia.why')}</summary>
        <dl>
          <dt>{t('fincludia.nextAction.whyPriority')}</dt>
          <dd>{t(`fincludia.nextAction.priorities.${action.priority}`)}</dd>
          <dt>{t('fincludia.nextAction.whyRule')}</dt>
          <dd>{t('fincludia.nextAction.whyRuleBody')}</dd>
        </dl>
      </details>
    </article>
  );
}
