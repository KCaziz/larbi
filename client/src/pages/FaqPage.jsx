import { useTranslation } from 'react-i18next';
import { ChevronDown, CircleHelp } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Section from '../components/ui/Section.jsx';
import './Pages.css';

export default function FaqPage() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true });

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
              <p>{item.answer}</p>
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
