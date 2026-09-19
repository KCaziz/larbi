import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/useAuth.js';
import { errorKey } from '../../lib/api.js';
import AuthAside from '../../components/layout/AuthAside.jsx';
import Button from '../../components/ui/Button.jsx';
import '../Pages.css';

const initialForm = { email: '', password: '' };

export default function LoginPage() {
  const { t } = useTranslation();
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Where the user was headed before being sent here by the route guard.
  const destination = location.state?.from ?? '/compte';

  if (status === 'authenticated' && !submitting) {
    return <Navigate to={destination} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError(t('auth.login.errorRequired'));
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate(destination, { replace: true });
    } catch (err) {
      setError(t(errorKey(err, { 401: 'auth.login.invalidCredentials' })));
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-split">
        <AuthAside icon={KeyRound} />

        <div className="auth-main">
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

            {error && (
              <p className="form-status form-status-error" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="btn-lg" disabled={submitting}>
              {submitting ? t('state.sending') : t('auth.login.submit')}
            </Button>

            <div className="form-links">
              <Link to="/mot-de-passe-oublie">{t('auth.login.forgot')}</Link>
              <Link to="/inscription">{t('auth.login.createAccount')}</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
