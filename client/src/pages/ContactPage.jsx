import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button.jsx';
import Notice from '../components/ui/Notice.jsx';
import './Pages.css';

const initialForm = { name: '', email: '', message: '' };

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setStatus({ type: 'error', text: t('contact.errors.required') });
      return;
    }

    // No backend endpoint exists yet for this form: real submission is
    // wired up during P1-07 (intégration frontend/backend). We deliberately
    // do not fake a "message sent" confirmation here.
    setStatus({ type: 'info', text: t('contact.status.notWired') });
  };

  return (
    <section className="page-section contact-layout">
      <div className="contact-details">
        <h1>{t('contact.title')}</h1>
        <p>{t('contact.intro')}</p>
        <Notice variant="action-needed">{t('contact.notice')}</Notice>
      </div>

      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="name">{t('contact.form.name')}</label>
          <input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="email">{t('contact.form.email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label htmlFor="message">{t('contact.form.message')}</label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={form.message}
            onChange={handleChange}
          />
        </div>
        {status && (
          <p className="form-status" role="status">
            {status.text}
          </p>
        )}
        <Button type="submit">{t('contact.form.submit')}</Button>
      </form>
    </section>
  );
}
