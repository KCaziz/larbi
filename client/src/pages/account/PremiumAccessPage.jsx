import { useTranslation } from 'react-i18next';
import LockedContent from '../../components/ui/LockedContent.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function PremiumAccessPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="account-heading">{t('account.premium.title')}</h2>
      <p>{t('account.premium.intro')}</p>
      <LockedContent title={t('account.premium.lockedTitle')}>
        {t('account.premium.lockedBody')}
      </LockedContent>
      <Notice variant="info">{t('account.premium.footNote')}</Notice>
    </div>
  );
}
