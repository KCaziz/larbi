import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/useAuth.js';
import { errorKey } from '../../lib/api.js';
import { accountTypeLabel, useAccountTypes } from '../../lib/accountTypes.js';
import AuthAside from '../../components/layout/AuthAside.jsx';
import Button from '../../components/ui/Button.jsx';
import '../Pages.css';

const initialForm = { name: '', email: '', password: '', accountType: '' };

export default function RegisterPage() {
  const { t } = useTranslation();
  const { status, register } = useAuth();
  const navigate = useNavigate();
  const accountTypes = useAccountTypes();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated' && !submitting) {
    return <Navigate to="/compte" replace />;
  }

  // Until the user picks one, default to the first type the API returned.
  const accountType = form.accountType || accountTypes.types[0]?.value || '';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email || !form.password || !accountType) {
      setError(t('auth.register.errorRequired'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('auth.register.errorPasswordShort'));
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        accountType,
      });
      navigate('/compte', { replace: true });
    } catch (err) {
      setError(t(errorKey(err, { 409: 'auth.register.emailTaken' })));
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-split">
        <AuthAside icon={UserPlus} />

        <div className="auth-main">
          <h1>{t('auth.register.title')}</h1>
          <p>{t('auth.register.intro')}</p>

          <form className="form-stack" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="name">{t('auth.register.nameLabel')}</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="email">{t('auth.register.emailLabel')}</label>
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
              <label htmlFor="password">{t('auth.register.passwordLabel')}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                aria-describedby="password-hint"
                value={form.password}
                onChange={handleChange}
              />
              <small id="password-hint" className="form-hint">
                {t('auth.register.passwordHint')}
              </small>
            </div>
            <div className="form-field">
              <label htmlFor="accountType">{t('auth.register.accountTypeLabel')}</label>
              <select
                id="accountType"
                name="accountType"
                value={accountType}
                onChange={handleChange}
                disabled={accountTypes.status !== 'ready'}
              >
                {accountTypes.status === 'loading' && <option>{t('state.loading')}</option>}
                {accountTypes.types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {accountTypeLabel(t, type)}
                  </option>
                ))}
              </select>
              {accountTypes.status === 'error' && (
                <small className="form-hint form-hint-error" role="alert">
                  {t('auth.register.accountTypesError')}
                </small>
              )}
            </div>

            {error && (
              <p className="form-status form-status-error" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="btn-lg"
              disabled={submitting || accountTypes.status !== 'ready'}
            >
              {submitting ? t('state.sending') : t('auth.register.submit')}
            </Button>

            <div className="form-links">
              <span>{t('auth.register.alreadyAccount')}</span>
              <Link to="/connexion">{t('auth.register.login')}</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
