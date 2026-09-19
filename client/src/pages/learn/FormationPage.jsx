import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, CircleCheck, Circle, Clock, ImageOff, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, ApiError, errorKey } from '../../lib/api.js';
import { formatDate } from '../../lib/format.js';
import { useApi } from '../../lib/useApi.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import ProgressBar from '../../components/learn/ProgressBar.jsx';
import './Learn.css';

export default function FormationPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { status, data, error, reload, setData } = useApi(`/learn/formations/${slug}`);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') {
    const missing = error instanceof ApiError && error.status === 404;
    return (
      <ErrorState
        message={missing ? t('learn.detail.notFound') : t('learn.detail.loadError')}
        onRetry={missing ? undefined : reload}
      />
    );
  }

  const f = data.formation;
  const enrollment = f.enrollment;
  const canOpen = Boolean(enrollment) && f.accessible;
  const completedIds = new Set(enrollment?.progress.completedCourseIds ?? []);
  const nextLesson = f.courses.find((c) => !completedIds.has(c.id)) ?? f.courses[0];

  const enroll = async () => {
    setEnrolling(true);
    setEnrollError(null);
    try {
      const res = await api.post(`/learn/formations/${slug}/enroll`);
      setData(res);
    } catch (err) {
      setEnrollError(t(errorKey(err, { 403: 'learn.detail.premiumBody' })));
    } finally {
      setEnrolling(false);
    }
  };

  // Normally the certificate arrives by itself with the last required course; this
  // covers a learner who finished before the certification was switched on.
  const canClaim =
    enrollment?.status === 'completed' &&
    enrollment.progress.requiredRemaining === 0 &&
    f.accessible &&
    !enrollment.certification;

  const claim = async () => {
    setClaiming(true);
    setClaimError('');
    try {
      await api.post(`/learn/formations/${slug}/certificate`);
      setData(await api.get(`/learn/formations/${slug}`));
    } catch {
      setClaimError(t('learn.certification.claimError'));
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="learn-page">
      <Link to="/catalogue" className="cms-back">
        <ArrowLeft className="icon-dir" size={16} strokeWidth={1.75} aria-hidden="true" />
        {t('learn.detail.back')}
      </Link>

      <div className="learn-detail">
        <div className="learn-detail-main">
          <div className="learn-chips">
            {f.category && <span className="learn-chip">{f.category.name}</span>}
            {f.requiredAccessLevel === 'premium' && (
              <span className="learn-chip learn-chip-premium">
                <Lock size={13} strokeWidth={2} aria-hidden="true" />
                {t('learn.card.premium')}
              </span>
            )}
          </div>
          <h1>{f.title}</h1>
          {f.description && <p className="lead">{f.description}</p>}

          {f.coverUrl ? (
            <img className="learn-detail-cover" src={f.coverUrl} alt="" />
          ) : (
            <div className="learn-detail-cover placeholder" aria-hidden="true">
              <ImageOff size={32} strokeWidth={1.3} />
            </div>
          )}

          {!f.published && enrollment && <Notice variant="info">{t('learn.detail.unpublishedNote')}</Notice>}

          <h2>{t('learn.detail.lessonsTitle')}</h2>
          {!canOpen && !enrollment && f.canEnroll && <p className="cms-muted">{t('learn.detail.lockedLessons')}</p>}
          <ol className="learn-lessons">
            {f.courses.map((course, index) => {
              const done = completedIds.has(course.id);
              const body = (
                <>
                  <span className="learn-lesson-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="learn-lesson-text">
                    <strong>{course.title}</strong>
                    {course.summary && <small>{course.summary}</small>}
                    <span className="learn-lesson-meta">
                      <span className={`learn-chip ${course.isRequired ? '' : 'learn-chip-bonus'}`}>
                        {course.isRequired ? t('learn.detail.required') : t('learn.detail.bonus')}
                      </span>
                      {course.estimatedMinutes ? (
                        <span className="learn-minutes">
                          <Clock size={13} strokeWidth={1.8} aria-hidden="true" />
                          {t('learn.detail.minutes', { count: course.estimatedMinutes })}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  {enrollment && (
                    <span className={`learn-lesson-state ${done ? 'done' : ''}`}>
                      {done ? <CircleCheck size={18} strokeWidth={1.9} aria-hidden="true" /> : <Circle size={18} strokeWidth={1.7} aria-hidden="true" />}
                      {done ? t('learn.detail.lessonDone') : t('learn.detail.lessonTodo')}
                    </span>
                  )}
                </>
              );
              return (
                <li key={course.id}>
                  {canOpen ? (
                    <Link to={`/catalogue/${slug}/cours/${course.id}`} className="learn-lesson is-link">
                      {body}
                    </Link>
                  ) : (
                    <div className="learn-lesson">{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="learn-detail-side">
          <section className="learn-panel" aria-labelledby="enroll-title">
            {enrollment ? (
              <>
                <h2 id="enroll-title">{t('learn.detail.enrolled')}</h2>
                <ProgressBar progress={enrollment.progress} />
                {f.accessible ? (
                  nextLesson && (
                    <Button to={`/catalogue/${slug}/cours/${nextLesson.id}`} className="btn-lg" arrow>
                      {enrollment.progress.completed > 0 ? t('learn.detail.continue') : t('learn.detail.start')}
                    </Button>
                  )
                ) : (
                  <Notice variant="action-needed">{t('learn.detail.premiumBody')}</Notice>
                )}
              </>
            ) : f.canEnroll ? (
              <>
                <h2 id="enroll-title">{t('learn.detail.enrollTitle')}</h2>
                <p>{t('learn.detail.enrollBody', { count: f.courseCount })}</p>
                {enrollError && (
                  <p className="form-status form-status-error" role="alert">
                    {enrollError}
                  </p>
                )}
                <Button onClick={enroll} disabled={enrolling} className="btn-lg">
                  {enrolling ? t('learn.detail.enrolling') : t('learn.detail.enroll')}
                </Button>
              </>
            ) : (
              <>
                <h2 id="enroll-title">{t('learn.detail.premiumTitle')}</h2>
                <p>{t('learn.detail.premiumBody')}</p>
                <Button to="/fonctionnalites" variant="secondary">
                  {t('learn.detail.premiumLink')}
                </Button>
              </>
            )}
          </section>

          <section className="learn-panel" aria-labelledby="cert-title">
            <h2 id="cert-title">
              <Award size={18} strokeWidth={1.8} aria-hidden="true" /> {t('learn.certification.title')}
            </h2>
            {f.certification.enabled ? (
              <>
                {f.certification.title && <p className="learn-cert-name">{f.certification.title}</p>}
                {f.certification.description && <p>{f.certification.description}</p>}
                <p className="cms-muted">{t('learn.certification.rule')}</p>
                {enrollment?.certification ? (
                  <>
                    <p className="cms-inline-message ok">
                      {t('learn.certification.earned', {
                        number: enrollment.certification.certificateNumber,
                        date: formatDate(i18n.language, enrollment.certification.issuedAt),
                      })}
                    </p>
                    <Button to={`/catalogue/${slug}/certificat`} variant="secondary">
                      <Award size={16} strokeWidth={1.9} aria-hidden="true" />
                      {t('learn.certification.view')}
                    </Button>
                  </>
                ) : canClaim ? (
                  <>
                    <p className="cms-inline-message ok">{t('learn.certification.claimReady')}</p>
                    {claimError && (
                      <p className="cms-inline-message error" role="alert">
                        {claimError}
                      </p>
                    )}
                    <Button onClick={claim} disabled={claiming}>
                      {claiming ? t('learn.certification.claiming') : t('learn.certification.claim')}
                    </Button>
                  </>
                ) : (
                  enrollment && (
                    <p className="cms-muted">
                      {t('learn.certification.remaining', { count: enrollment.progress.requiredRemaining })}
                    </p>
                  )
                )}
              </>
            ) : (
              <p className="cms-muted">{t('learn.certification.disabled')}</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
