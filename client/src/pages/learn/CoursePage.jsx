import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, CircleCheck, Circle, Clock, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiError, api, errorKey } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import ProgressBar from '../../components/learn/ProgressBar.jsx';
import RichContent from '../../components/ui/RichContent.jsx';
import './Learn.css';

function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function CoursePage() {
  const { slug, courseId } = useParams();
  const { t } = useTranslation();
  const lesson = useApi(`/learn/formations/${slug}/courses/${courseId}`);
  const outline = useApi(`/learn/formations/${slug}`);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  // The server decides (completion needs access + an opened course); the page
  // only shows its answer: the lesson state and the refreshed progress.
  async function changeCompletion(done) {
    setSaving(true);
    setActionError('');
    try {
      const path = `/learn/formations/${slug}/courses/${courseId}/completion`;
      const res = done ? await api.put(path) : await api.delete(path);
      lesson.setData({ ...lesson.data, completed: res.completed });
      outline.setData({ formation: { ...outline.data.formation, enrollment: res.enrollment } });
    } catch (err) {
      const why = err instanceof ApiError ? err.details?.reason : null;
      const specific = { not_enrolled: 'learn.course.notEnrolled', premium_required: 'learn.course.premiumRequired' }[why];
      setActionError(t(specific ?? errorKey(err)));
    } finally {
      setSaving(false);
    }
  }

  if (lesson.status === 'loading' || outline.status === 'loading') return <LoadingState />;

  if (lesson.status === 'error') {
    const err = lesson.error;
    const reason = err instanceof ApiError ? err.details?.reason : null;
    const backToFormation = (
      <Button to={`/catalogue/${slug}`} variant="secondary">
        {t('learn.course.goToFormation')}
      </Button>
    );
    if (err instanceof ApiError && err.status === 403) {
      return (
        <div className="learn-page">
          <ErrorState message={reason === 'premium_required' ? t('learn.course.premiumRequired') : t('learn.course.notEnrolled')} />
          <p className="center">{backToFormation}</p>
        </div>
      );
    }
    if (err instanceof ApiError && err.status === 404) {
      return (
        <div className="learn-page">
          <ErrorState message={t('learn.course.notFound')} />
          <p className="center">{backToFormation}</p>
        </div>
      );
    }
    return <ErrorState message={t('learn.course.loadError')} onRetry={lesson.reload} />;
  }
  if (outline.status === 'error') return <ErrorState message={t('learn.course.loadError')} onRetry={outline.reload} />;

  const { course, formation, completed } = lesson.data;
  const f = outline.data.formation;
  const completedIds = new Set(f.enrollment?.progress.completedCourseIds ?? []);
  const hasContent = Boolean(course.body) || course.media.length > 0;

  return (
    <div className="learn-page">
      <nav className="learn-breadcrumb" aria-label={t('learn.course.breadcrumb')}>
        <Link to="/catalogue">{t('learn.catalog.title')}</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/catalogue/${slug}`}>{formation.title}</Link>
      </nav>

      <div className="learn-reader">
        <nav className="learn-outline" aria-label={t('learn.course.listTitle')}>
          <h2>{t('learn.course.listTitle')}</h2>
          <ol>
            {f.courses.map((c, index) => (
              <li key={c.id}>
                <Link
                  to={`/catalogue/${slug}/cours/${c.id}`}
                  className={c.id === course.id ? 'active' : undefined}
                  aria-current={c.id === course.id ? 'page' : undefined}
                >
                  <span className="learn-lesson-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="learn-outline-title">{c.title}</span>
                  {completedIds.has(c.id) ? (
                    <CircleCheck className="done" size={16} strokeWidth={1.9} aria-label={t('learn.detail.lessonDone')} />
                  ) : (
                    <Circle size={16} strokeWidth={1.6} aria-label={t('learn.detail.lessonTodo')} />
                  )}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <article className="learn-lesson-page">
          <div className="learn-chips">
            <span className={`learn-chip ${course.isRequired ? '' : 'learn-chip-bonus'}`}>
              {course.isRequired ? t('learn.detail.required') : t('learn.detail.bonus')}
            </span>
            <span className={`learn-chip ${completed ? 'learn-chip-done' : ''}`}>
              {completed ? <CircleCheck size={13} strokeWidth={2} aria-hidden="true" /> : <Circle size={13} strokeWidth={2} aria-hidden="true" />}
              {completed ? t('learn.detail.lessonDone') : t('learn.detail.lessonTodo')}
            </span>
            {course.estimatedMinutes ? (
              <span className="learn-minutes">
                <Clock size={13} strokeWidth={1.8} aria-hidden="true" />
                {t('learn.detail.minutes', { count: course.estimatedMinutes })}
              </span>
            ) : null}
          </div>
          <h1>{course.title}</h1>
          {course.summary && <p className="lead">{course.summary}</p>}

          {course.body && <RichContent html={course.body} />}

          {course.media.length > 0 && (
            <section className="learn-files" aria-labelledby="files-title">
              <h2 id="files-title">{t('learn.course.files')}</h2>
              {course.media.map((m) => (
                <div key={m.id} className="learn-file">
                  {m.kind === 'video' && (
                    // "nodownload" only hides the browser's download button: a convenience, NOT a protection.
                    // The real protection is that this URL needs an enrolled, authorised session.
                    <video controls preload="metadata" controlsList="nodownload" aria-label={t('learn.course.videoLabel', { name: m.originalName })} src={m.url} />
                  )}
                  {m.kind === 'image' && <img src={m.url} alt={m.originalName} />}
                  {m.kind === 'document' && (
                    <a className="learn-doc" href={m.url} download>
                      <FileText size={22} strokeWidth={1.6} aria-hidden="true" />
                      <span>
                        <strong>{m.originalName}</strong>
                        <small>{formatSize(m.sizeBytes)}</small>
                      </span>
                      <Download size={18} strokeWidth={1.8} aria-label={t('learn.course.download')} />
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}

          {!hasContent && <Notice variant="info">{t('learn.course.noContent')}</Notice>}

          <section className="learn-complete" aria-labelledby="complete-title">
            <h2 id="complete-title">{t('learn.course.progressTitle')}</h2>
            <ProgressBar progress={f.enrollment?.progress} />
            {actionError && (
              <p className="cms-inline-message error" role="alert">
                {actionError}
              </p>
            )}
            {f.enrollment?.status === 'completed' && (
              <p className="cms-inline-message ok" role="status">
                <CircleCheck size={16} strokeWidth={1.9} aria-hidden="true" /> {t('learn.course.formationDone')}
              </p>
            )}
            {f.enrollment?.certification && (
              <div className="learn-complete-row">
                <p className="cms-inline-message ok" role="status">
                  <Award size={16} strokeWidth={1.9} aria-hidden="true" /> {t('learn.course.certificateReady')}
                </p>
                <Button to={`/catalogue/${slug}/certificat`} variant="secondary">
                  {t('learn.certification.view')}
                </Button>
              </div>
            )}
            {completed ? (
              <div className="learn-complete-row">
                <span className="learn-chip learn-chip-done">
                  <CircleCheck size={13} strokeWidth={2} aria-hidden="true" />
                  {t('learn.detail.lessonDone')}
                </span>
                {f.enrollment?.certification ? (
                  <p className="cms-muted">{t('learn.course.lockedByCertificate')}</p>
                ) : (
                  <Button variant="secondary" onClick={() => changeCompletion(false)} disabled={saving}>
                    {t('learn.course.undo')}
                  </Button>
                )}
              </div>
            ) : (
              <Button onClick={() => changeCompletion(true)} disabled={saving}>
                <CircleCheck size={16} strokeWidth={1.9} aria-hidden="true" />
                {t('learn.course.markDone')}
              </Button>
            )}
          </section>

          <div className="learn-pager">
            {course.previousId ? (
              <Button to={`/catalogue/${slug}/cours/${course.previousId}`} variant="secondary">
                <ArrowLeft className="icon-dir" size={16} strokeWidth={1.9} aria-hidden="true" />
                {t('learn.course.previous')}
              </Button>
            ) : (
              <span />
            )}
            {course.nextId ? (
              <Button to={`/catalogue/${slug}/cours/${course.nextId}`}>
                {t('learn.course.next')}
                <ArrowRight className="icon-dir" size={16} strokeWidth={1.9} aria-hidden="true" />
              </Button>
            ) : (
              <Button to={`/catalogue/${slug}`}>{t('learn.course.finish')}</Button>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
