import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import './NotificationBell.css';

// The notifications of the top bar (P1-12, wired to P6-18).
//
// It reads `GET /fin/notifications/non-lues`, a single `count`, and not the
// notification listing: the listing also GENERATES the due reminders, four
// queries and some writes, and paying that on every page of the connected
// space to keep a badge fresh would be the wrong trade. The documented
// consequence is that the badge can lag until something generates a reminder —
// it never over-reports.
//
// The count is in the accessible name, not only in the badge: a screen reader
// says "Notifications, 3 non lues", because a small coloured disc beside an
// icon is exactly the kind of meaning the client forbids carrying by sight
// alone.
export default function NotificationBell() {
  const { t } = useTranslation();
  const unread = useApi('/fin/notifications/non-lues');
  const count = unread.data?.nonLues ?? 0;

  return (
    <Link
      to="/notifications"
      className="notif-bell"
      aria-label={count > 0 ? t('nav.notificationsUnread', { count }) : t('nav.notifications')}
    >
      <Bell size={18} strokeWidth={1.75} aria-hidden="true" />
      {count > 0 && (
        <span className="notif-bell-count" aria-hidden="true">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
