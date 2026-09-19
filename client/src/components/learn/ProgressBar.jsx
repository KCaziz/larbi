import { useTranslation } from 'react-i18next';

// Progress of a learner in a formation. `progress` = { completed, total, percent }
// as computed by the server (the browser never computes or decides progress).
export default function ProgressBar({ progress }) {
  const { t } = useTranslation();
  return (
    <div className="learn-progress">
      <div
        className="learn-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        aria-label={t('learn.progress.aria', { percent: progress.percent })}
      >
        <span style={{ width: `${progress.percent}%` }} />
      </div>
      <p className="learn-progress-text">
        <strong>{progress.percent}%</strong> · {t('learn.progress.text', { completed: progress.completed, total: progress.total })}
      </p>
    </div>
  );
}
