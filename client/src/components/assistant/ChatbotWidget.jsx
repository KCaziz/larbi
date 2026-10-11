import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronRight, MessageCircleQuestion, X } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { contentLanguage, textDirection } from '../../lib/contentLanguage.js';
import RichContent from '../ui/RichContent.jsx';
import './ChatbotWidget.css';

// Guided assistant (P3-07): a floating button that opens a panel listing the
// questions an administrator published, each with its prepared answer. No free
// text, no AI. Nothing is shown when no question is published in the visitor's
// language (Tamazight reads the French entries), nor inside the administration.
export default function ChatbotWidget() {
  const { pathname } = useLocation();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null;
  return <Assistant />;
}

function Assistant() {
  const { t, i18n } = useTranslation();
  const lang = contentLanguage(i18n.language) ?? 'fr';
  const entries = useApi(`/chatbot/entries?lang=${lang}`);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const toggleRef = useRef(null);
  const headingRef = useRef(null);
  const panelId = useId();
  const titleId = useId();

  const list = entries.status === 'ready' ? entries.data.entries : [];
  const selected = list.find((e) => e.id === selectedId) ?? null;

  // Focus follows what the panel shows: its heading on open and on every
  // change of view, so a screen reader announces the new content.
  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open, selectedId]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function close() {
    setOpen(false);
    setSelectedId(null);
    toggleRef.current?.focus();
  }

  if (list.length === 0) return null;

  return (
    <div className="chatbot" dir={textDirection(lang)}>
      {open && (
        <section id={panelId} className="chatbot-panel" role="dialog" aria-labelledby={titleId}>
          <header className="chatbot-header">
            <span className="chatbot-header-icon" aria-hidden="true">
              <MessageCircleQuestion size={18} strokeWidth={1.8} />
            </span>
            <h2 id={titleId}>{t('chatbot.title')}</h2>
            <button type="button" className="chatbot-close" onClick={close} aria-label={t('chatbot.close')} title={t('chatbot.close')}>
              <X size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </header>

          <div className="chatbot-body">
            {selected ? (
              <>
                <button type="button" className="chatbot-back" onClick={() => setSelectedId(null)}>
                  <ArrowLeft className="icon-dir" size={16} strokeWidth={2} aria-hidden="true" />
                  {t('chatbot.back')}
                </button>
                <h3 ref={headingRef} tabIndex={-1} className="chatbot-question">
                  {selected.question}
                </h3>
                <RichContent html={selected.answer} className="chatbot-answer" />
              </>
            ) : (
              <>
                <p ref={headingRef} tabIndex={-1} className="chatbot-intro">
                  {t('chatbot.intro')}
                </p>
                <ul className="chatbot-list">
                  {list.map((entry) => (
                    <li key={entry.id}>
                      <button type="button" onClick={() => setSelectedId(entry.id)}>
                        <span>{entry.question}</span>
                        <ChevronRight className="icon-dir" size={16} strokeWidth={2} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <footer className="chatbot-footer">
            <span>{t('chatbot.notFound')}</span>
            <Link to="/contact" onClick={close}>
              {t('chatbot.contact')}
            </Link>
          </footer>
        </section>
      )}

      <button
        ref={toggleRef}
        type="button"
        className="chatbot-toggle"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? <X size={20} strokeWidth={2} aria-hidden="true" /> : <MessageCircleQuestion size={20} strokeWidth={1.9} aria-hidden="true" />}
        <span>{open ? t('chatbot.close') : t('chatbot.open')}</span>
      </button>
    </div>
  );
}
