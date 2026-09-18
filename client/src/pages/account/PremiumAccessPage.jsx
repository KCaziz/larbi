import { useTranslation } from 'react-i18next';
import LockedContent from '../../components/ui/LockedContent.jsx';
import '../Pages.css';

export default function PremiumAccessPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('account.premium.title')}</h1>
      <p>{t('account.premium.intro')}</p>
      <LockedContent title={t('account.premium.lockedTitle')}>
        {t('account.premium.lockedBody')}
      </LockedContent>
      <p>{t('account.premium.footNote')}</p>
    </div>
  );
}
