import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Repeat } from 'lucide-react';
import { errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { useAuth } from '../../auth/useAuth.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import BackLink from '../../components/fincludia/BackLink.jsx';
import { RecurrenceForm } from './CalendarPage.jsx';
import '../../components/fincludia/Fincludia.css';
import '../mouvements/Movements.css';
import './Calendar.css';

// CAL-02 « Paiement / revenu régulier », at its own address (P8-25):
// `/app/calendrier/regulier`. Saved, it goes back to the calendar, where the
// new recurrence already shows on its days.
export default function RecurringPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const references = useApi('/fin/calendrier/references');
  const accounts = useApi('/fin/comptes');
  useDocumentMeta(t('calendar.addRecurrence'));

  if (references.status === 'loading' && !references.data) return <LoadingState />;

  async function run(action, okKey) {
    setError(null);
    try {
      await action();
      navigate('/app/calendrier', { state: { message: okKey } });
      return { ok: true };
    } catch (err) {
      setError(t(errorKey(err, { 422: 'calendar.errors.refused' })));
      return { ok: false };
    }
  }

  return (
    <>
      <PageHeader icon={Repeat} title={t('calendar.addRecurrence')} subtitle={t('calendar.intro')} maxWidth={1040} />
      <div className="calendar-page">
        <BackLink to="/app/calendrier">{t('calendar.backToCalendar')}</BackLink>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <RecurrenceForm t={t} currency={user?.finCurrency ?? 'DZD'} references={references.data} accounts={accounts.data?.accounts ?? []} run={run} onDone={() => {}} />
      </div>
    </>
  );
}
