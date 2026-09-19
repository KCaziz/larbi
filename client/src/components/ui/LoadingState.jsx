import { useTranslation } from 'react-i18next';
import { LoaderCircle } from 'lucide-react';
import './LoadingState.css';

export default function LoadingState({ label }) {
  const { t } = useTranslation();
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="loading-spinner" size={20} strokeWidth={1.75} aria-hidden="true" />
      <span>{label ?? t('state.loading')}</span>
    </div>
  );
}
