import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button.jsx';
import LockedContent from '../ui/LockedContent.jsx';

// What a reader sees instead of the text of a premium article they cannot read.
// It only DISPLAYS the server's decision (`reason` comes from the API): the text and
// files were never sent, so removing this component in the browser reveals nothing.
export default function ArticleLock({ reason }) {
  const { t } = useTranslation();
  const location = useLocation();
  const anonymous = reason === 'login_required';

  return (
    <div className="blog-lock">
      <LockedContent title={t('article.lock.title')}>
        {anonymous ? t('article.lock.loginBody') : t('article.lock.premiumBody')}
      </LockedContent>
      <div className="blog-lock-actions">
        {anonymous ? (
          <>
            <Button to="/connexion" state={{ from: location.pathname }}>
              {t('article.lock.login')}
            </Button>
            <Button to="/inscription" variant="secondary">
              {t('article.lock.register')}
            </Button>
          </>
        ) : (
          <Button to="/compte/premium">{t('article.lock.upgrade')}</Button>
        )}
      </div>
    </div>
  );
}
