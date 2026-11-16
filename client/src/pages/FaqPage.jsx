import { useTranslation } from 'react-i18next';
import { useApi } from '../lib/useApi.js';
import { contentLanguage } from '../lib/contentLanguage.js';
import RichContent from '../components/ui/RichContent.jsx';
import { ChevronDown, CircleHelp } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Section from '../components/ui/Section.jsx';
import './Pages.css';
import { useDocumentMeta } from '../lib/useDocumentMeta.js';

export default function FaqPage() {
  const { t, i18n } = useTranslation();
  // Same title and description as the server sends (P12-06).
  useDocumentMeta(t('seo.pages.faq.title'), t('seo.pages.faq.description'));
  // P11-02: the site's questions written in the administration come after
  // the fixed ones (the application's have their own help).
  const written = useApi(`/chatbot/entries?lang=${contentLanguage(i18n.language) ?? 'fr'}&audience=site`);
  const items = [
    ...t('faq.items', { returnObjects: true }),
    ...(written.data?.entries ?? []).map((entry) => ({ question: entry.question, html: entry.answer })),
  ];

  return (
    <>
      <PageHeader icon={CircleHelp} title={t('faq.title')} subtitle={t('faq.subtitle')} />

      <Section>
        <div className="faq-list">
          {items.map((item, index) => (
            <details key={item.question}>
              <summary>
                <span className="faq-number">{String(index + 1).padStart(2, '0')}</span>
                {item.question}
                <ChevronDown className="faq-chevron" size={20} strokeWidth={1.75} aria-hidden="true" />
              </summary>
              {item.html ? <RichContent html={item.html} className="faq-answer" /> : <p>{item.answer}</p>}
            </details>
          ))}
        </div>
      </Section>

      <Section alt title={t('faq.cta.title')} subtitle={t('faq.cta.body')}>
        <div className="center">
          <Button to="/contact" variant="primary" className="btn-lg" arrow>
            {t('faq.cta.button')}
          </Button>
        </div>
      </Section>
    </>
  );
}
