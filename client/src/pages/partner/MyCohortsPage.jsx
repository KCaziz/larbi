import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';
import { api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import '../entreprise/Business.css';

// P13-05, lot I (2026-11-25): the learner's side of an institution's cohort
// (ECR-0291). Accepting is the consent; the institution then sees aggregates
// only, never this person's own activity.

export default function MyCohortsPage() {
  const { t, i18n } = useTranslation();
  const cohorts = useApi('/fin/mes-cohortes');
  const [message, setMessage] = useState(null);
  useDocumentMeta(t('myCohorts.title'), t('myCohorts.intro'));
  const answer = async (id, step) => {
    setMessage(null);
    try {
      await api.post(`/fin/mes-cohortes/${id}/${step === 'accepter' ? 'accepter' : 'refuser'}`, {});
      setMessage({ kind: 'ok', text: t(step === 'accepter' ? 'myCohorts.accepted' : 'myCohorts.declined') });
      cohorts.reload();
    } catch (err) {
      const reason = err?.details?.reason;
      setMessage({ kind: 'error', text: reason === 'noLicenceLeft' ? t('myCohorts.noLicence') : t(errorKey(err)) });
    }
  };
  const list = cohorts.data?.cohortes ?? [];
  return (
    <>
      <PageHeader icon={GraduationCap} title={t('myCohorts.title')} subtitle={t('myCohorts.intro')} maxWidth={1000} />
      <div className="business-page">
        {message && (
          <p className={message.kind === 'ok' ? 'form-status' : 'form-error'} role="status">
            {message.text}
          </p>
        )}
        {cohorts.status === 'loading' && !cohorts.data ? (
          <LoadingState />
        ) : list.length === 0 ? (
          <p className="business-empty">{t('myCohorts.none')}</p>
        ) : (
          <ul className="business-documents">
            {list.map((c) => (
              <li key={c.id} className="business-document">
                <div className="business-document-head">
                  <strong>{c.institution}</strong>
                  <span>
                    {c.programme} · {c.cohorte}
                  </span>
                  <span className="business-document-state">{t(`myCohorts.statuses.${c.status}`)}</span>
                </div>
                <ul className="trade-pieces">
                  {c.formations.map((f) => (
                    <li key={f.slug}>
                      <span>
                        {c.status === 'active' ? <Link to={`/app/formation/${f.slug}`}>{f.title}</Link> : f.title}
                        {f.dueAt ? ` · ${t('myCohorts.dueOn', { date: formatDate(i18n.language, f.dueAt) })}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
                {c.status === 'invited' ? (
                  <>
                    <p className="inv-muted inv-note">{t('myCohorts.consent')}</p>
                    <div className="inv-actions">
                      <Button type="button" variant="secondary" onClick={() => answer(c.id, 'accepter')}>
                        {t('myCohorts.accept')}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => answer(c.id, 'refuser')}>
                        {t('myCohorts.decline')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button type="button" variant="ghost" onClick={() => answer(c.id, 'refuser')}>
                    {t('myCohorts.leave')}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
