import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { useAuth } from '../../auth/useAuth.js';
import LockedContent from '../../components/ui/LockedContent.jsx';
import Notice from '../../components/ui/Notice.jsx';
import OffersList from '../../components/payments/OffersList.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import '../Pages.css';

export default function PremiumAccessPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <>
      <PageHeader icon={Star} title={t('account.premium.title')} subtitle={t('account.premium.intro')} />
      <div className="settings-page">
      {user.accessLevel === 'premium' ? (
        <Notice variant="info">
          <strong>{t('account.premium.activeTitle')}</strong> {t('account.premium.activeBody')}
        </Notice>
      ) : (
        <>
          <LockedContent title={t('account.premium.lockedTitle')}>
            {t('account.premium.lockedBody')}
          </LockedContent>
          {/* Offers to become premium (P3-09). */}
          <OffersList />
        </>
      )}
      <Notice variant="info">{t('account.premium.footNote')}</Notice>
    </div>
    </>
  );
}
