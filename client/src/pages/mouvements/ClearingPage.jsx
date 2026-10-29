import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCheck } from 'lucide-react';
import { errorKey } from '../../lib/api.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { ClearingPanel, useMovementLookups } from './MovementsPage.jsx';
import '../argent/MyMoney.css';
import './Movements.css';

// TRX-04 « Pointage des achats et transactions », at its own address
// (P8-25): `/app/mouvements/pointage`. The clearing rate (AN-F004) and what is
// left to check, one click per movement.
export default function ClearingPage() {
  const { t } = useTranslation();
  const { lookups } = useMovementLookups();
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('movements.tabs.clearing'));

  async function run(action, key) {
    setMessage(null);
    try {
      await action();
      setMessage({ kind: 'ok', text: t(key) });
      return { ok: true };
    } catch (err) {
      setMessage({ kind: 'error', text: t(errorKey(err, { 422: 'myMoney.errors.refused' })) });
      return { ok: false };
    }
  }

  return (
    <>
      <PageHeader icon={CheckCheck} title={t('movements.tabs.clearing')} subtitle={t('movements.clearingIntro')} maxWidth={1040} />
      <div className="money-page">
        <BackLink to="/app/mouvements">{t('movements.backToList')}</BackLink>
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}
        <ClearingPanel lookups={lookups} run={run} />
      </div>
    </>
  );
}
