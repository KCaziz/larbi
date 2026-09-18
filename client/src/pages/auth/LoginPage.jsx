import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

const initialForm = { email: '', password: '' };

export default function LoginPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setStatus({ type: 'error', text: t('auth.login.errorRequired') });
      return;
    }

    // No auth backend exists yet (P1-06). We never fake a successful login.
    setStatus({ type: 'info', text: t('auth.login.notWired') });
  };

  return (
    <section className="auth-page">
      <h1>{t('auth.login.title')}</h1>
      <p>{t('auth.login.intro')}</p>

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="email">{t('auth.login.emailLabel')}</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">{t('auth.login.passwordLabel')}</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {status && (
          <p className="form-status" role="status">
            {status.text}
          </p>
        )}

        <Button type="submit">{t('auth.login.submit')}</Button>

        <div className="form-links">
          <Link to="/mot-de-passe-oublie">{t('auth.login.forgot')}</Link>
          <Link to="/inscription">{t('auth.login.createAccount')}</Link>
        </div>
      </form>

      <Notice variant="info">{t('auth.login.notice')}</Notice>
    </section>
  );
}
