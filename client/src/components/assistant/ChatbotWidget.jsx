import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronRight, MessageCircleQuestion, Search, X } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { contentLanguage, textDirection } from '../../lib/contentLanguage.js';
import RichContent from '../ui/RichContent.jsx';
import './ChatbotWidget.css';

// Guided assistant (P3-07) and FINCLUDIA deterministic assistant (P3-19): a
// floating button that opens a panel. Below the questions an administrator
// published (P3-07, click to read), a free-text field tries the FINCLUDIA
// resolver — still no AI: a closed list of intentions matched by keyword, pre-
// written answers, never a generated one. Nothing is shown when neither has
// any published content, nor inside the administration.
export default function ChatbotWidget() {
  const { pathname } = useLocation();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return null;
  return <Assistant />;
}

function Assistant() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = contentLanguage(i18n.language) ?? 'fr';
  const entries = useApi(`/chatbot/entries?lang=${lang}`);
  // The deterministic resolver (P3-19) is content of its own: the panel must
  // be reachable when an administrator published intents but no predefined
  // question yet. Without this, the free-text field could never be used.
  const intents = useApi('/fin-assistant/intents');
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(null); // { type: 'intent' | 'fallback', ... }
  const toggleRef = useRef(null);
  const headingRef = useRef(null);
  const panelId = useId();
  const titleId = useId();

  const list = entries.status === 'ready' ? entries.data.entries : [];
  const hasResolver = intents.status === 'ready' && intents.data.intents.length > 0;
  const selected = list.find((e) => e.id === selectedId) ?? null;

  // Focus follows what the panel shows: its heading on open and on every
  // change of view, so a screen reader announces the new content.
  useEffect(() => {
    if (open) headingRef.current?.focus();
  }, [open, selectedId, resolved]);

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
    setResolved(null);
    setQuery('');
    toggleRef.current?.focus();
  }

  function backToList() {
    setSelectedId(null);
    setResolved(null);
  }

  async function submitSearch(event) {
    event.preventDefault();
    if (!query.trim() || resolving) return;
    setResolving(true);
    try {
      const data = await api.post('/fin-assistant/resolve', { query: query.trim() });
      setResolved(data);
    } catch {
      // A network or server hiccup is the same as "not understood": the
      // client never invents an answer either way.
      setResolved({ type: 'fallback', categories: [] });
    } finally {
      setResolving(false);
    }
  }

  function openDeepLink(path) {
    close();
    navigate(path);
  }

  // Nothing published on either side: no button at all, as the comment above
  // says. One of the two is enough to make the assistant useful.
  if (list.length === 0 && !hasResolver) return null;

  const showingResolvedIntent = resolved?.type === 'intent';
  const showingFallback = resolved?.type === 'fallback';

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
                <button type="button" className="chatbot-back" onClick={backToList}>
                  <ArrowLeft className="icon-dir" size={16} strokeWidth={2} aria-hidden="true" />
                  {t('chatbot.back')}
                </button>
                <h3 ref={headingRef} tabIndex={-1} className="chatbot-question">
                  {selected.question}
                </h3>
                <RichContent html={selected.answer} className="chatbot-answer" />
              </>
            ) : showingResolvedIntent ? (
              <>
                <button type="button" className="chatbot-back" onClick={backToList}>
                  <ArrowLeft className="icon-dir" size={16} strokeWidth={2} aria-hidden="true" />
                  {t('chatbot.back')}
                </button>
                <h3 ref={headingRef} tabIndex={-1} className="chatbot-question">
                  {resolved.intent.label}
                </h3>
                <RichContent html={resolved.intent.responseTemplate} className="chatbot-answer" />
                {resolved.intent.deepLinkPath && (
                  <button type="button" className="chatbot-open-link" onClick={() => openDeepLink(resolved.intent.deepLinkPath)}>
                    {t('chatbot.openScreen')}
                    <ChevronRight className="icon-dir" size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </>
            ) : showingFallback ? (
              <>
                <button type="button" className="chatbot-back" onClick={backToList}>
                  <ArrowLeft className="icon-dir" size={16} strokeWidth={2} aria-hidden="true" />
                  {t('chatbot.back')}
                </button>
                {/* Client's own wording (screen C26): "Je n'ai pas compris. Choisissez une option…" */}
                <p ref={headingRef} tabIndex={-1} className="chatbot-fallback-intro">
                  {t('chatbot.notUnderstood')}
                </p>
                {resolved.categories.length > 0 ? (
                  <ul className="chatbot-list">
                    {resolved.categories.map((cat) => (
                      <li key={cat.code}>
                        <button type="button" onClick={() => setResolved({ type: 'intent', intent: cat })}>
                          <span>{cat.label}</span>
                          <ChevronRight className="icon-dir" size={16} strokeWidth={2} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="chatbot-intro">{t('chatbot.notFound')}</p>
                )}
              </>
            ) : (
              <>
                <p ref={headingRef} tabIndex={-1} className="chatbot-intro">
                  {t('chatbot.intro')}
                </p>
                {hasResolver && (
                <form className="chatbot-search" onSubmit={submitSearch}>
                  <Search size={16} strokeWidth={2} aria-hidden="true" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('chatbot.searchPlaceholder')}
                    aria-label={t('chatbot.searchPlaceholder')}
                    maxLength={200}
                  />
                  <button type="submit" disabled={!query.trim() || resolving}>
                    {t('chatbot.searchGo')}
                  </button>
                </form>
                )}
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
