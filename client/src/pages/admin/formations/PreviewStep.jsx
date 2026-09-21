import { Clock, Eye, Layers, ListChecks, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BlockRenderer from '../../../components/blocks/BlockRenderer.jsx';
import RichContent from '../../../components/ui/RichContent.jsx';
import Notice from '../../../components/ui/Notice.jsx';
import '../../learn/Learn.css';

// "What the student sees" for the whole formation, built from what is saved: the presentation,
// the plan by chapters, every lesson opened block by block (the same component as the reader)
// and where the quizzes are. Nothing here is a copy of the content: it is the content itself.
export default function PreviewStep({ formation, hasUnsaved }) {
  const { t } = useTranslation();
  const chapters = formation.sections.length > 1 ? formation.sections : [{ id: 'all', title: null, description: null }];
  const lessonsOf = (chapter) => formation.courses.filter((c) => (chapter.id === 'all' ? true : c.sectionId === chapter.id));
  const quizzesOf = (predicate) => formation.quizzes.filter(predicate);

  const quizRow = (quiz) => (
    <p key={quiz.id} className="cms-preview-quiz">
      <ListChecks size={16} strokeWidth={1.8} aria-hidden="true" />
      <strong>{quiz.title}</strong>
      <span className="cms-muted">{t('admin.quiz.rowInfo', { questions: quiz.questionCount, points: quiz.totalPoints })}</span>
      {quiz.isRequired && <span className="learn-chip">{t('quiz.required')}</span>}
      {!quiz.isComplete && <span className="dash-missing">{t('admin.quiz.question.incomplete')}</span>}
    </p>
  );

  return (
    <div className="cms-form">
      <p className="cms-intro">
        <Eye size={16} strokeWidth={1.9} aria-hidden="true" /> {t('admin.preview.intro')}
      </p>
      {hasUnsaved && <Notice variant="info">{t('admin.preview.unsaved')}</Notice>}

      <div className="cms-preview learn-page-preview">
        <div className="learn-chips">
          {formation.category && <span className="learn-chip">{formation.category.name}</span>}
          {formation.level && <span className="learn-chip">{t(`learn.level.${formation.level}`)}</span>}
          {formation.totalMinutes > 0 && (
            <span className="learn-chip">
              <Clock size={13} strokeWidth={2} aria-hidden="true" />
              {t('learn.detail.totalDuration', { count: formation.totalMinutes })}
            </span>
          )}
        </div>
        <h1>{formation.title || t('admin.editor.untitled')}</h1>
        {formation.subtitle && <p className="learn-subtitle">{formation.subtitle}</p>}
        {formation.description && <p className="lead">{formation.description}</p>}
        {formation.cover && <img className="learn-detail-cover" src={formation.cover.url} alt="" />}

        {(formation.objectives.length > 0 || formation.prerequisites.length > 0) && (
          <div className="learn-pedagogy">
            {formation.objectives.length > 0 && (
              <section>
                <h2>
                  <Target size={20} strokeWidth={1.8} aria-hidden="true" />
                  {t('learn.detail.objectives')}
                </h2>
                <ul>
                  {formation.objectives.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            )}
            {formation.prerequisites.length > 0 && (
              <section>
                <h2>
                  <Layers size={20} strokeWidth={1.8} aria-hidden="true" />
                  {t('learn.detail.prerequisites')}
                </h2>
                <ul>
                  {formation.prerequisites.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <h2>{t('learn.detail.lessonsTitle')}</h2>
        {chapters.map((chapter) => (
          <section key={chapter.id} className="learn-chapter">
            {chapter.title && (
              <h3 className="learn-chapter-title">
                {chapter.title}
                {chapter.description && <small>{chapter.description}</small>}
              </h3>
            )}
            {lessonsOf(chapter).length === 0 && <p className="cms-muted">{t('admin.outline.chapterEmpty')}</p>}
            {lessonsOf(chapter).map((lesson) => (
              <details key={lesson.id} className="cms-preview-lesson">
                <summary>
                  <strong>{lesson.title}</strong>
                  {lesson.estimatedMinutes ? <span className="cms-muted"> · {t('learn.detail.minutes', { count: lesson.estimatedMinutes })}</span> : null}
                  {!lesson.isRequired && <span className="learn-chip learn-chip-bonus">{t('learn.detail.bonus')}</span>}
                </summary>
                {lesson.summary && <p className="lead">{lesson.summary}</p>}
                {lesson.blocks.length > 0 ? <BlockRenderer blocks={lesson.blocks} /> : lesson.body ? <RichContent html={lesson.body} /> : <p className="cms-muted">{t('admin.blocks.empty')}</p>}
                {quizzesOf((q) => q.scope === 'course' && q.courseId === lesson.id).map(quizRow)}
              </details>
            ))}
            {chapter.id !== 'all' && quizzesOf((q) => q.scope === 'section' && q.sectionId === chapter.id).map(quizRow)}
          </section>
        ))}
        {quizzesOf((q) => q.scope === 'formation').map(quizRow)}
      </div>
    </div>
  );
}
