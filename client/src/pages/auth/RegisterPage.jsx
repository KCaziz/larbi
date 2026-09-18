import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthAside from '../../components/layout/AuthAside.jsx';
import Button from '../../components/ui/Button.jsx';
import Notice from '../../components/ui/Notice.jsx';
import '../Pages.css';

const initialForm = { name: '', email: '', password: '', accountType: 'auto-entrepreneur' };

export default function RegisterPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setStatus({ type: 'error', text: t('auth.register.errorRequired') });
      return;
    }

    // No auth backend exists yet (P1-06). We never fake account creation.
    setStatus({ type: 'info', text: t('auth.register.notWired') });
  };

  return (
    <section className="auth-page">
      <div className="auth-split">
        <AuthAside icon="✨" />

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
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="accountType">{t('auth.register.accountTypeLabel')}</label>
              <select
                id="accountType"
                name="accountType"
                value={form.accountType}
                onChange={handleChange}
              >
                <option value="auto-entrepreneur">{t('accountTypes.autoEntrepreneur')}</option>
                <option value="pme">{t('accountTypes.pme')}</option>
                <option value="pmi">{t('accountTypes.pmi')}</option>
              </select>
            </div>

            {status && (
              <p className="form-status" role="status">
                {status.text}
              </p>
            )}

            <Button type="submit" className="btn-lg">
              {t('auth.register.submit')}
            </Button>

            <div className="form-links">
              <span>{t('auth.register.alreadyAccount')}</span>
              <Link to="/connexion">{t('auth.register.login')}</Link>
            </div>
          </form>

          <Notice variant="info">{t('auth.register.notice')}</Notice>
        </div>
      </div>
    </section>
  );
}
