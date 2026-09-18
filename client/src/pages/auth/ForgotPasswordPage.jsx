import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email) {
      setStatus({ type: 'error', text: t('auth.forgot.errorRequired') });
      return;
    }

    // No auth/email backend exists yet (P1-06). We never fake a "reset link sent" message.
    setStatus({ type: 'info', text: t('auth.forgot.notWired') });
  };

  return (
    <section className="auth-page">
      <h1>{t('auth.forgot.title')}</h1>
      <p>{t('auth.forgot.intro')}</p>

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="email">{t('auth.forgot.emailLabel')}</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {status && (
          <p className="form-status" role="status">
            {status.text}
          </p>
        )}

        <Button type="submit">{t('auth.forgot.submit')}</Button>

        <div className="form-links">
          <Link to="/connexion">{t('auth.forgot.backToLogin')}</Link>
        </div>
      </form>

      <Notice variant="info">{t('auth.forgot.notice')}</Notice>
    </section>
  );
}
