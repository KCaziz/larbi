import { useState } from 'react';
import { CircleCheck, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, ApiError } from '../../lib/api.js';
import Button from '../ui/Button.jsx';
import './Newsletter.css';

// Newsletter sign-up (double opt-in): the server sends a confirmation link and
// nothing is subscribed until it is clicked. The page never learns whether the
// address was already known: the answer is the same in every case.
export default function NewsletterForm() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', error: null }); // idle | sending | done

  const submit = async (event) => {
    event.preventDefault();
    setState({ status: 'sending', error: null });
    try {
      await api.post('/newsletter/subscribe', { email, locale: i18n.language });
      setState({ status: 'done', error: null });
    } catch (err) {
      const status = err instanceof ApiError ? err.status : -1;
      const key = { 400: 'newsletter.invalid', 429: 'newsletter.tooMany', 503: 'newsletter.unavailable' }[status] ?? 'newsletter.error';
      setState({ status: 'idle', error: t(key) });
    }
  };

  return (
    <section className="newsletter" aria-labelledby="newsletter-title">
      <div className="newsletter-text">
        <h2 id="newsletter-title">
          <Mail size={20} strokeWidth={1.8} aria-hidden="true" />
          {t('newsletter.title')}
        </h2>
        <p>{t('newsletter.intro')}</p>
      </div>

      {state.status === 'done' ? (
        <p className="newsletter-done" role="status">
          <CircleCheck size={20} strokeWidth={1.9} aria-hidden="true" />
          <span>
            <strong>{t('newsletter.doneTitle')}</strong> {t('newsletter.doneBody')}
          </span>
        </p>
      ) : (
        <form className="newsletter-form" onSubmit={submit} noValidate>
          <label htmlFor="newsletter-email" className="sr-only">
            {t('newsletter.emailLabel')}
          </label>
          <input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={email}
            placeholder={t('newsletter.placeholder')}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby="newsletter-hint"
            aria-invalid={state.error ? 'true' : undefined}
          />
          <Button type="submit" disabled={state.status === 'sending'}>
            {state.status === 'sending' ? t('state.sending') : t('newsletter.submit')}
          </Button>
          <small id="newsletter-hint" className="newsletter-hint">
            {t('newsletter.hint')}
          </small>
          {state.error && (
            <small className="newsletter-error" role="alert">
              {state.error}
            </small>
          )}
        </form>
      )}
    </section>
  );
}
