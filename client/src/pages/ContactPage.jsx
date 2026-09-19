import { useState } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, errorKey } from '../lib/api.js';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Notice from '../components/ui/Notice.jsx';
import Section from '../components/ui/Section.jsx';
import './Pages.css';

const initialForm = { name: '', email: '', message: '' };

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email || !form.message.trim()) {
      setStatus({ type: 'error', text: t('contact.errors.required') });
      return;
    }

    setStatus(null);
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      setForm(initialForm);
      setStatus({ type: 'success', text: t('contact.status.sent') });
    } catch (err) {
      setStatus({ type: 'error', text: t(errorKey(err)) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader icon={Mail} title={t('contact.title')} subtitle={t('contact.intro')} />

      <Section>
        <div className="contact-layout">
          <article className="feature-card tone-blue">
            <span className="icon-badge" aria-hidden="true">
              <MessageSquare size={22} strokeWidth={1.6} />
            </span>
            <h3>{t('contact.asideTitle')}</h3>
            <Notice variant="action-needed">{t('contact.notice')}</Notice>
          </article>

          <div className="form-card">
            <h2>{t('contact.formTitle')}</h2>
            <form className="form-stack" onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="name">{t('contact.form.name')}</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                />
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
                <p
                  className={`form-status ${status.type === 'error' ? 'form-status-error' : ''}`}
                  role={status.type === 'error' ? 'alert' : 'status'}
                >
                  {status.text}
                </p>
              )}
              <Button type="submit" disabled={submitting}>
                {submitting ? t('state.sending') : t('contact.form.submit')}
              </Button>
            </form>
          </div>
        </div>
      </Section>
    </>
  );
}
