import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, ApiError, errorKey } from '../../../lib/api.js';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import LoadingState from '../../../components/ui/LoadingState.jsx';
import PageToolbar from '../../../components/cms/PageToolbar.jsx';
import SaveBar from '../../../components/cms/SaveBar.jsx';
import StatusBadge from '../../../components/cms/StatusBadge.jsx';
import StepTabs from '../../../components/cms/StepTabs.jsx';
import UnsavedChangesGuard from '../../../components/cms/UnsavedChangesGuard.jsx';
import InfoStep from './InfoStep.jsx';
import CoursesStep from './CoursesStep.jsx';
import CertificationStep from './CertificationStep.jsx';
import PublishStep from './PublishStep.jsx';

// Fields edited on the "Informations" and "Certification" steps and saved
// together with the save bar. Courses and files are saved on their own.
const toDraft = (f) => ({
  title: f.title,
  description: f.description,
  categoryId: f.category?.id ?? '',
  requiredAccessLevel: f.requiredAccessLevel,
  certificationEnabled: f.certification.enabled,
  certificationTitle: f.certification.title ?? '',
  certificationDescription: f.certification.description ?? '',
});

// Which step lets the author fix each checklist item.
const STEP_FOR_ITEM = {
  title: 'info',
  description: 'info',
  cover: 'info',
  courses: 'courses',
  coursesContent: 'courses',
  certification: 'certification',
};

const okOf = (formation, keys) => keys.every((k) => formation.readiness.items.find((i) => i.key === k)?.ok);

export default function FormationEditorPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [load, setLoad] = useState({ status: 'loading' }); // loading | ready | notFound | error
  const [formation, setFormation] = useState(null);
  const [draft, setDraft] = useState(null);
  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState('info');
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [titleError, setTitleError] = useState(null);
  const [dirtyCourses, setDirtyCourses] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.get(`/admin/formations/${id}`, { signal: controller.signal }),
      api.get('/admin/categories', { signal: controller.signal }),
    ])
      .then(([f, c]) => {
        setFormation(f.formation);
        setDraft(toDraft(f.formation));
        setCategories(c.categories);
        setLoad({ status: 'ready' });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setLoad({ status: err instanceof ApiError && err.status === 404 ? 'notFound' : 'error' });
      });
    return () => controller.abort();
  }, [id, attempt]);

  // Re-reads the formation after an immediate action (cover, courses, files,
  // publish) WITHOUT touching what the author is typing in the draft.
  const refresh = useCallback(async () => {
    const { formation: fresh } = await api.get(`/admin/formations/${id}`);
    setFormation(fresh);
    return fresh;
  }, [id]);

  const dirty = useMemo(
    () => Boolean(formation && draft && JSON.stringify(draft) !== JSON.stringify(toDraft(formation))),
    [formation, draft],
  );
  const anyDirty = dirty || Object.values(dirtyCourses).some(Boolean);

  const setField = (name, value) => {
    setSaved(false);
    setSaveError(null);
    if (name === 'title') setTitleError(null);
    setDraft((d) => ({ ...d, [name]: value }));
  };

  const save = async () => {
    if (!draft.title.trim()) {
      setStep('info');
      setTitleError(t('admin.info.titleRequired'));
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const { formation: updated } = await api.patch(`/admin/formations/${id}`, {
        ...draft,
        categoryId: draft.categoryId || null,
      });
      setFormation(updated);
      setDraft(toDraft(updated));
      setSaved(true);
    } catch (err) {
      setSaveError(t(errorKey(err)));
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setDraft(toDraft(formation));
    setSaveError(null);
    setTitleError(null);
  };

  const markCourseDirty = useCallback((courseId, isDirty) => {
    setDirtyCourses((prev) => (prev[courseId] === isDirty ? prev : { ...prev, [courseId]: isDirty }));
  }, []);

  if (load.status === 'loading') return <LoadingState />;
  if (load.status === 'notFound') return <ErrorState message={t('admin.editor.notFound')} />;
  if (load.status === 'error') {
    return (
      <ErrorState
        message={t('admin.editor.loadError')}
        onRetry={() => {
          setLoad({ status: 'loading' });
          setAttempt((n) => n + 1);
        }}
      />
    );
  }

  const steps = [
    { id: 'info', label: t('admin.steps.info'), done: okOf(formation, ['title', 'description', 'cover']) },
    { id: 'courses', label: t('admin.steps.courses'), done: okOf(formation, ['courses', 'coursesContent']) },
    { id: 'certification', label: t('admin.steps.certification'), done: okOf(formation, ['certification']) },
    { id: 'publish', label: t('admin.steps.publish'), done: formation.status === 'published' },
  ];
  const panelProps = (name) => ({
    role: 'tabpanel',
    id: `step-panel-${name}`,
    'aria-labelledby': `step-tab-${name}`,
    hidden: step !== name,
    className: 'cms-panel',
  });

  return (
    <>
      <UnsavedChangesGuard dirty={anyDirty} />
      <PageToolbar
        title={formation.title || t('admin.editor.untitled')}
        backTo="/admin/formations"
        backLabel={t('admin.editor.back')}
        badge={<StatusBadge status={formation.status} />}
      />

      <StepTabs steps={steps} active={step} onChange={setStep} label={t('admin.steps.label')} />

      <div {...panelProps('info')}>
        <InfoStep
          draft={draft}
          setField={setField}
          titleError={titleError}
          formation={formation}
          categories={categories}
          onCategoryCreated={(category) => {
            setCategories((list) => [...list, category].sort((a, b) => a.name.localeCompare(b.name)));
            setField('categoryId', category.id);
          }}
          onChanged={refresh}
        />
      </div>
      <div {...panelProps('courses')}>
        <CoursesStep formation={formation} onChanged={refresh} onDirtyChange={markCourseDirty} />
      </div>
      <div {...panelProps('certification')}>
        <CertificationStep draft={draft} setField={setField} />
      </div>
      <div {...panelProps('publish')}>
        <PublishStep
          formation={formation}
          hasUnsaved={anyDirty}
          onChanged={refresh}
          onGo={(key) => setStep(STEP_FOR_ITEM[key] ?? 'info')}
        />
      </div>

      {(step === 'info' || step === 'certification') && (
        <SaveBar dirty={dirty} saving={saving} saved={saved && !dirty} error={saveError} onSave={save} onDiscard={discard} />
      )}
    </>
  );
}
