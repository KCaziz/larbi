import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MailCheck, MailX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api.js';
import Button from '../../components/ui/Button.jsx';
import '../../components/newsletter/Newsletter.css';
import '../Pages.css';

// Page opened from the link of a newsletter e-mail. `mode`: "confirm" | "unsubscribe".
// The action is a BUTTON, not something that happens when the page opens: mail
// scanners and link previews open every link, and must not confirm (or cancel)
// anything on the person's behalf.
export default function NewsletterLinkPage({ mode }) {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState('idle'); // idle | sending | done | invalid | error
  const Icon = mode === 'confirm' ? MailCheck : MailX;

  const run = async () => {
    setState('sending');
    try {
      await (mode === 'confirm' ? api.post('/newsletter/confirm', { token }) : api.post('/newsletter/unsubscribe', { token }));
      setState('done');
    } catch (err) {
      setState(err?.status === 400 ? 'invalid' : 'error');
    }
  };

  const text = (key) => t(`newsletter.link.${mode}.${key}`);

  return (
    <section className="newsletter-link-page status-hero">
      <div className="status-icon" aria-hidden="true">
        <Icon size={26} strokeWidth={1.6} />
      </div>
      <h1>{state === 'done' ? text('doneTitle') : text('title')}</h1>
      <p role={state === 'done' || state === 'invalid' || state === 'error' ? 'status' : undefined}>
        {state === 'idle' || state === 'sending' ? text('body') : null}
        {state === 'done' ? text('doneBody') : null}
        {state === 'invalid' ? t('newsletter.link.invalid') : null}
        {state === 'error' ? t('newsletter.error') : null}
      </p>
      {(state === 'idle' || state === 'sending' || state === 'error') && token && (
        <Button onClick={run} disabled={state === 'sending'}>
          {state === 'sending' ? t('state.sending') : text('button')}
        </Button>
      )}
      {!token && <p>{t('newsletter.link.invalid')}</p>}
      {(state === 'done' || state === 'invalid' || !token) && <Button to="/blog" variant="secondary">{t('newsletter.link.toBlog')}</Button>}
    </section>
  );
}
