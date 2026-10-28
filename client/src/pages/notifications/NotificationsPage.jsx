import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bell, BellOff, Check } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatDate } from '../../lib/format.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import './Notifications.css';

// The client's families of notifications (answer D7), in his order.
const FAMILIES = ['budgets', 'revenus', 'echeances', 'dettes', 'objectifs', 'formation', 'securite'];

// Notifications and alerts (P6-18), screen C24. In-app only for now (« canal
// in-app d'abord ; e-mail / push selon P6-01 »).
export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  useDocumentMeta(t('notifications.title'), t('notifications.intro'));

  const query = new URLSearchParams();
  if (category) query.set('category', category);
  if (readFilter) query.set('read', readFilter);
  const notifications = useApi(`/fin/notifications?${query.toString()}`);

  async function markRead(id, read) {
    await api.put(`/fin/notifications/${id}/lu`, { read });
    notifications.reload();
  }

  async function markAllRead() {
    await api.post('/fin/notifications/tout-lire', {});
    notifications.reload();
  }

  if (notifications.status === 'loading' && !notifications.data) return <LoadingState />;
  if (notifications.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={notifications.reload} />;

  const list = notifications.data.notifications;

  return (
    <>
      <PageHeader icon={Bell} title={t('notifications.title')} subtitle={t('notifications.intro')} maxWidth={760} />
      <div className="notifications-page">
        <div className="notifications-toolbar">
          <label className="sr-only" htmlFor="notif-category">
            {t('notifications.filterCategory')}
          </label>
          <select id="notif-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">{t('notifications.allCategories')}</option>
            <option value="action">{t('notifications.categories.action')}</option>
            <option value="information">{t('notifications.categories.information')}</option>
            <option value="securite">{t('notifications.categories.securite')}</option>
          </select>

          <label className="sr-only" htmlFor="notif-read">
            {t('notifications.filterRead')}
          </label>
          <select id="notif-read" value={readFilter} onChange={(event) => setReadFilter(event.target.value)}>
            <option value="">{t('notifications.allStatuses')}</option>
            <option value="false">{t('notifications.unread')}</option>
            <option value="true">{t('notifications.read')}</option>
          </select>

          <Button variant="secondary" onClick={markAllRead} disabled={notifications.data.nonLues === 0}>
            <Check size={15} aria-hidden="true" /> {t('notifications.markAllRead')}
          </Button>
          <button type="button" className="notifications-plain" onClick={() => setShowSettings((v) => !v)}>
            <BellOff size={15} aria-hidden="true" /> {t('notifications.settings')}
          </button>
        </div>

        {showSettings && <NotificationSettings t={t} onDone={() => setShowSettings(false)} />}

        {list.length === 0 ? (
          <Notice variant="info">{t('notifications.none')}</Notice>
        ) : (
          <ul className="notifications-list">
            {list.map((n) => (
              <li key={n.id} className={n.read ? 'notifications-row' : 'notifications-row notifications-row-unread'}>
                <span className={`notifications-dot notifications-dot-${n.category}`} aria-hidden="true" />
                <div className="notifications-body">
                  <p className="notifications-text">
                    <NotificationText t={t} language={i18n.language} notification={n} />
                  </p>
                  <span className="notifications-date">{formatDate(i18n.language, n.createdAt)}</span>
                </div>
                {n.link && (
                  <Link to={n.link} className="notifications-link">
                    {t('notifications.open')}
                  </Link>
                )}
                <button type="button" className="notifications-icon" onClick={() => markRead(n.id, !n.read)}>
                  {n.read ? t('notifications.markUnread') : t('notifications.markRead')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function NotificationText({ t, language, notification: n }) {
  switch (n.type) {
    case 'budget_alert':
      return t(`notifications.messages.budgetAlert.${n.params.niveau}`, { label: n.params.label ?? t('notifications.noCategory') });
    case 'goal_overdue':
      return t('notifications.messages.goalOverdue', { label: n.params.label });
    case 'goal_milestone':
      return t('notifications.messages.goalMilestone', { label: n.params.label, percent: Math.round(Number(n.params.niveau ?? 0) * 100) });
    case 'sharing_changed':
      return t('notifications.messages.sharingChanged', { kinds: (n.params.kinds ?? []).map((kind) => t(`spaces.dataKinds.${kind}`)).join(', ') });
    case 'reminder_upcoming':
      return t(`notifications.messages.reminder.${n.params.kind}`, { label: n.params.label ?? '', date: formatDate(language, n.params.date) });
    // P8-18: the client's alerts AL-P01 to AL-P12.
    case 'account_alert':
      return t(`notifications.messages.accountAlert.${n.params.niveau}`, { label: n.params.label });
    case 'income_to_confirm':
      return t('notifications.messages.incomeToConfirm', { label: n.params.label ?? '', date: formatDate(language, n.params.date) });
    case 'payment_to_confirm':
      return t('notifications.messages.paymentToConfirm', { label: n.params.label ?? '', date: formatDate(language, n.params.date) });
    case 'debt_due':
      return t(`notifications.messages.debtDue.${n.params.niveau}`, { label: n.params.label, date: formatDate(language, n.params.date) });
    case 'debt_ratio':
      return t(`notifications.messages.debtRatio.${n.params.niveau}`);
    case 'goal_contribution_missed':
      return t('notifications.messages.goalContributionMissed', { label: n.params.label });
    case 'emergency_fund':
      return t(`notifications.messages.emergencyFund.${n.params.niveau}`);
    case 'learning_to_continue':
      return t('notifications.messages.learningToContinue', { label: n.params.label });
    default:
      return n.type;
  }
}

function NotificationSettings({ t, onDone }) {
  const settings = useApi('/fin/notifications/parametres');
  const [message, setMessage] = useState(null);

  async function toggle(type, field, value) {
    setMessage(null);
    try {
      await api.put('/fin/notifications/parametres', { [type]: { [field]: value } });
      settings.reload();
    } catch {
      setMessage({ text: t('notifications.errors.refused') });
    }
  }

  // A whole family at once: every one of its types in one change.
  async function toggleFamily(rows, enabled) {
    setMessage(null);
    try {
      await api.put('/fin/notifications/parametres', Object.fromEntries(rows.map((setting) => [setting.type, { enabled }])));
      settings.reload();
    } catch {
      setMessage({ text: t('notifications.errors.refused') });
    }
  }

  if (!settings.data) return null;

  return (
    <div className="notifications-settings">
      {message && (
        <p className="form-error" role="status">
          {message.text}
        </p>
      )}
      {/* By family (the client's answer D7): budgets, revenus, échéances,
          dettes, objectifs, formation, sécurité — each one on or off, and
          its alerts one by one. */}
      {FAMILIES.map((family) => {
        const rows = settings.data.parametres.filter((setting) => setting.family === family);
        if (rows.length === 0) return null;
        const on = rows.some((setting) => setting.enabled);
        return (
          <fieldset key={family} className="notifications-family">
            <legend>
              <label className="notifications-check notifications-family-toggle">
                <input type="checkbox" checked={on} onChange={(event) => toggleFamily(rows, event.target.checked)} />
                {t(`notifications.families.${family}`)}
              </label>
            </legend>
      <ul className="notifications-settings-list">
        {rows.map((setting) => (
          <li key={setting.type}>
            <span className="notifications-settings-label">{t(`notifications.typeLabels.${setting.type}`)}</span>
            <label className="notifications-check">
              <input type="checkbox" checked={setting.enabled} onChange={(event) => toggle(setting.type, 'enabled', event.target.checked)} />
              {t('notifications.enabled')}
            </label>
            {setting.requiresOptIn && (
              <label className="notifications-check">
                <input type="checkbox" checked={setting.optedIn} onChange={(event) => toggle(setting.type, 'optedIn', event.target.checked)} />
                {t('notifications.optedIn')}
              </label>
            )}
          </li>
        ))}
      </ul>
          </fieldset>
        );
      })}
      <button type="button" className="notifications-plain" onClick={onDone}>
        {t('notifications.close')}
      </button>
    </div>
  );
}
