import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './Button.jsx';

export default function ErrorState({ message, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="status-hero" role="alert">
      <div className="status-icon" aria-hidden="true">
        <TriangleAlert size={26} strokeWidth={1.6} />
      </div>
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {t('state.retry')}
        </Button>
      )}
    </div>
  );
}
