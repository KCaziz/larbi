import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, CalendarCheck, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import Button from '../../components/ui/Button.jsx';
import FigureCard from '../../components/fincludia/FigureCard.jsx';

// P13-05, lot I bis (2026-11-25): an institution's own courses and sessions
// (ECR-0294). A course written here is never in the public catalogue: only the
// learners of the cohorts it is assigned to open it, and it delivers an
// « attestation pédagogique », no regulatory qualification (PRT-020). Learning
// figures stay aggregates, above the anonymity threshold.

const today = () => new Date().toISOString().slice(0, 10);
const iso = (date, time = '09:00') => new Date(`${date}T${time}:00.000Z`).toISOString();
const emptyQuestion = () => ({ prompt: '', choices: ['', ''], correct: 0, explanation: '' });

export function OwnFormations({ spaceId, run, onChange }) {
  const { t } = useTranslation();
  const base = `/fin/partenaire/espaces/${spaceId}/formations`;
  const list = useApi(base);
  const [form, setForm] = useState({ title: '', description: '' });
  const [open, setOpen] = useState(null);
  const act = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) {
      list.reload();
      onChange?.();
    }
    return done;
  };
  const formations = list.data?.formations ?? [];
  return (
    <section aria-labelledby="own-formations">
      <h2 id="own-formations">
        <BookOpen size={18} aria-hidden="true" /> {t('institution.formationsTitle')}
      </h2>
      <p className="business-blocked-intro">{t('institution.formationsIntro')}</p>
      <form
        className="business-form"
        onSubmit={async (event) => {
          event.preventDefault();
          if (await act(() => api.post(base, { title: form.title.trim(), description: form.description.trim() }), 'institution.formationCreated')) setForm({ title: '', description: '' });
        }}
      >
        <div className="business-form-row">
          <label>
            {t('institution.formationTitle')}
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} maxLength={150} required />
          </label>
          <label>
            {t('institution.formationDescription')}
            <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} maxLength={3000} required />
          </label>
        </div>
        <Button type="submit" variant="secondary">
          <Plus size={16} aria-hidden="true" />
          {t('institution.createFormation')}
        </Button>
      </form>
      {formations.length === 0 ? (
        <p className="business-empty">{t('institution.noFormation')}</p>
      ) : (
        <ul className="business-documents">
          {formations.map((f) => (
            <li key={f.id} className="business-document">
              <div className="business-document-head">
                <strong>{f.title}</strong>
                <span className="inv-muted">{t('institution.formationLine', { lessons: f.lessons.length, questions: f.quiz?.questions ?? 0 })}</span>
                <span className="business-document-state">{t(`institution.statuses.${f.status}`)}</span>
              </div>
              <div className="inv-actions">
                <Button type="button" variant="ghost" aria-expanded={open === f.id} onClick={() => setOpen(open === f.id ? null : f.id)}>
                  {open === f.id ? t('partnerPortal.hide') : t('institution.edit')}
                </Button>
                <Button type="button" variant="secondary" onClick={() => act(() => api.put(`${base}/${f.id}/publication`, { publish: f.status !== 'published' }), f.status === 'published' ? 'institution.unpublished' : 'institution.published')}>
                  {f.status === 'published' ? t('institution.unpublish') : t('institution.publish')}
                </Button>
              </div>
              {open === f.id && <FormationEditor formation={f} base={`${base}/${f.id}`} act={act} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FormationEditor({ formation, base, act }) {
  const { t } = useTranslation();
  const locked = formation.status === 'published';
  const [lesson, setLesson] = useState({ title: '', text: '', minutes: '15' });
  const [passingScore, setPassingScore] = useState(String(formation.quiz?.passingScore ?? 70));
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const setQ = (i, patch) => setQuestions((all) => all.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  return (
    <div className="trade-details">
      {locked && <p className="inv-muted inv-note">{t('institution.lockedNote')}</p>}
      <h3 className="pilot-subtitle">{t('institution.lessonsTitle')}</h3>
      {formation.lessons.length === 0 ? (
        <p className="business-empty">{t('institution.noLesson')}</p>
      ) : (
        <ol className="trade-pieces">
          {formation.lessons.map((l) => (
            <li key={l.id}>
              <span>{l.title}</span>
              <span className="inv-muted">{t('institution.minutes', { n: l.estimatedMinutes ?? 0 })}</span>
              {!locked && (
                <Button type="button" variant="ghost" aria-label={t('institution.removeLesson')} onClick={() => act(() => api.delete(`${base}/lecons/${l.id}`), 'institution.lessonRemoved')}>
                  <Trash2 size={16} aria-hidden="true" />
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}
      {!locked && (
        <form
          className="business-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (await act(() => api.post(`${base}/lecons`, { title: lesson.title.trim(), text: lesson.text, minutes: Number(lesson.minutes) || 15 }), 'institution.lessonAdded')) setLesson({ title: '', text: '', minutes: '15' });
          }}
        >
          <div className="business-form-row">
            <label>
              {t('institution.lessonTitle')}
              <input value={lesson.title} onChange={(e) => setLesson((p) => ({ ...p, title: e.target.value }))} maxLength={190} required />
            </label>
            <label>
              {t('institution.lessonMinutes')}
              <input type="number" min="1" max="600" value={lesson.minutes} onChange={(e) => setLesson((p) => ({ ...p, minutes: e.target.value }))} />
            </label>
          </div>
          <label className="academy-field">
            <span>{t('institution.lessonText')}</span>
            <textarea rows={6} maxLength={20000} value={lesson.text} onChange={(e) => setLesson((p) => ({ ...p, text: e.target.value }))} required />
          </label>
          <Button type="submit" variant="ghost">
            <Plus size={16} aria-hidden="true" />
            {t('institution.addLesson')}
          </Button>
        </form>
      )}

      <h3 className="pilot-subtitle">{t('institution.quizTitle')}</h3>
      <p className="inv-muted inv-note">{formation.quiz ? t('institution.quizLine', { n: formation.quiz.questions, score: formation.quiz.passingScore }) : t('institution.noQuiz')}</p>
      {!locked && (
        <form
          className="business-form"
          onSubmit={(event) => {
            event.preventDefault();
            act(
              () => api.put(`${base}/quiz`, { passingScore: Number(passingScore), questions: questions.map((q) => ({ ...q, prompt: q.prompt.trim(), choices: q.choices.map((c) => c.trim()), explanation: q.explanation.trim() || null })) }),
              'institution.quizSaved',
            );
          }}
        >
          <label>
            {t('institution.passingScore')}
            <input type="number" min="1" max="100" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} required />
          </label>
          {questions.map((q, i) => (
            <fieldset key={i} className="academy-pretest-question">
              <legend>{t('institution.question', { n: i + 1 })}</legend>
              <input value={q.prompt} onChange={(e) => setQ(i, { prompt: e.target.value })} maxLength={1000} placeholder={t('institution.questionPrompt')} required />
              {q.choices.map((c, j) => (
                <label key={j} className="academy-step">
                  <input type="radio" name={`correct-${i}`} checked={q.correct === j} onChange={() => setQ(i, { correct: j })} aria-label={t('institution.rightAnswer')} />
                  <input value={c} onChange={(e) => setQ(i, { choices: q.choices.map((x, k) => (k === j ? e.target.value : x)) })} maxLength={300} placeholder={t('institution.choice', { n: j + 1 })} required />
                </label>
              ))}
              {q.choices.length < 6 && (
                <Button type="button" variant="ghost" onClick={() => setQ(i, { choices: [...q.choices, ''] })}>
                  {t('institution.addChoice')}
                </Button>
              )}
              <input value={q.explanation} onChange={(e) => setQ(i, { explanation: e.target.value })} maxLength={1000} placeholder={t('institution.explanation')} />
            </fieldset>
          ))}
          <div className="inv-actions">
            <Button type="button" variant="ghost" onClick={() => setQuestions((all) => [...all, emptyQuestion()])}>
              <Plus size={16} aria-hidden="true" />
              {t('institution.addQuestion')}
            </Button>
            <Button type="submit" variant="secondary">
              {t('institution.saveQuiz')}
            </Button>
          </div>
          <p className="inv-muted inv-note">{t('institution.quizReplaces')}</p>
        </form>
      )}
    </div>
  );
}

export function Sessions({ spaceId, cohorts, run }) {
  const { t, i18n } = useTranslation();
  const base = `/fin/partenaire/espaces/${spaceId}/sessions`;
  const list = useApi(base);
  const [form, setForm] = useState({ cohortId: cohorts[0]?.id ?? '', formationId: '', title: '', trainerName: '', date: today(), from: '09:00', to: '12:00', location: '' });
  const [open, setOpen] = useState(null);
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const act = async (action, okKey) => {
    const done = await run(action, okKey);
    if (done) list.reload();
    return done;
  };
  const cohort = cohorts.find((c) => c.id === form.cohortId);
  const sessions = list.data?.sessions ?? [];
  return (
    <section aria-labelledby="own-sessions">
      <h2 id="own-sessions">
        <CalendarCheck size={18} aria-hidden="true" /> {t('institution.sessionsTitle')}
      </h2>
      <p className="business-blocked-intro">{t('institution.sessionsIntro')}</p>
      {cohorts.length === 0 ? (
        <p className="business-empty">{t('institution.noCohort')}</p>
      ) : (
        <form
          className="business-form"
          onSubmit={async (event) => {
            event.preventDefault();
            const body = { cohortId: form.cohortId, title: form.title.trim(), trainerName: form.trainerName.trim(), startsAt: iso(form.date, form.from), endsAt: iso(form.date, form.to), ...(form.formationId ? { formationId: form.formationId } : {}), ...(form.location.trim() ? { location: form.location.trim() } : {}) };
            if (await act(() => api.post(base, body), 'institution.sessionCreated')) setForm((p) => ({ ...p, title: '', location: '' }));
          }}
        >
          <div className="business-form-row">
            <label>
              {t('institution.cohort')}
              <select value={form.cohortId} onChange={(e) => setForm((p) => ({ ...p, cohortId: e.target.value, formationId: '' }))}>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('institution.sessionFormation')}
              <select value={form.formationId} onChange={set('formationId')}>
                <option value="">{t('institution.noSessionFormation')}</option>
                {(cohort?.formations ?? []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('institution.sessionTitle')}
              <input value={form.title} onChange={set('title')} maxLength={160} required />
            </label>
            <label>
              {t('institution.trainer')}
              <input value={form.trainerName} onChange={set('trainerName')} maxLength={160} required />
            </label>
          </div>
          <div className="business-form-row">
            <label>
              {t('institution.date')}
              <input type="date" value={form.date} onChange={set('date')} required />
            </label>
            <label>
              {t('institution.from')}
              <input type="time" value={form.from} onChange={set('from')} required />
            </label>
            <label>
              {t('institution.to')}
              <input type="time" value={form.to} onChange={set('to')} required />
            </label>
            <label>
              {t('institution.location')}
              <input value={form.location} onChange={set('location')} maxLength={200} />
            </label>
          </div>
          <Button type="submit" variant="secondary">
            <Plus size={16} aria-hidden="true" />
            {t('institution.createSession')}
          </Button>
        </form>
      )}
      {sessions.length === 0 ? (
        <p className="business-empty">{t('institution.noSession')}</p>
      ) : (
        <ul className="business-documents">
          {sessions.map((s) => (
            <li key={s.id} className="business-document">
              <div className="business-document-head">
                <strong>{s.title}</strong>
                <span className="inv-muted">
                  {formatDate(i18n.language, s.startsAt)} · {s.trainerName} · {s.cohort.name}
                  {s.location ? ` · ${s.location}` : ''}
                </span>
                <span className="business-document-state">{t(`institution.sessionStatuses.${s.status}`)}</span>
              </div>
              <div className="fin-figure-grid">
                <FigureCard label={t('institution.attendance')} answer={s.presence} />
                <FigureCard label={t('institution.completion')} answer={s.completion} />
                <FigureCard label={t('institution.score')} answer={s.score} />
              </div>
              {s.masque && <p className="inv-muted inv-note">{t('partnerPortal.masked', { n: s.seuil })}</p>}
              <div className="inv-actions">
                <Button type="button" variant="ghost" aria-expanded={open === s.id} onClick={() => setOpen(open === s.id ? null : s.id)}>
                  {open === s.id ? t('partnerPortal.hide') : t('institution.sheet')}
                </Button>
                {s.status === 'planned' && (
                  <>
                    <Button type="button" variant="ghost" onClick={() => act(() => api.put(`${base}/${s.id}`, { status: 'done' }), 'institution.sessionUpdated')}>
                      {t('institution.markDone')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => act(() => api.put(`${base}/${s.id}`, { status: 'cancelled' }), 'institution.sessionUpdated')}>
                      {t('institution.cancelSession')}
                    </Button>
                  </>
                )}
              </div>
              {open === s.id && (
                <ul className="trade-pieces">
                  {s.feuille.length === 0 && <li className="business-empty">{t('institution.noParticipant')}</li>}
                  {s.feuille.map((p) => (
                    <li key={p.memberId}>
                      <span>{p.email}</span>
                      <label className="pilot-check">
                        <input type="checkbox" checked={p.present === true} disabled={s.status === 'cancelled'} onChange={(e) => act(() => api.put(`${base}/${s.id}/presence`, { memberId: p.memberId, present: e.target.checked }), 'institution.attendanceSaved')} />
                        {t('institution.present')}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
