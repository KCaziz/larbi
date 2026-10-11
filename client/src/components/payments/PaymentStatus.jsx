import { useTranslation } from 'react-i18next';
import { CircleCheck, CircleX, Clock, Undo2 } from 'lucide-react';
import './Payments.css';

const ICONS = { paid: CircleCheck, pending: Clock, failed: CircleX, cancelled: CircleX, refunded: Undo2 };

// Status of an order, in words and colour (never colour alone).
export default function PaymentStatus({ status }) {
  const { t } = useTranslation();
  const Icon = ICONS[status] ?? Clock;
  return (
    <span className={`payment-status payment-status-${status}`}>
      <Icon size={14} strokeWidth={2} aria-hidden="true" />
      {t(`payments.status.${status}`)}
    </span>
  );
}
