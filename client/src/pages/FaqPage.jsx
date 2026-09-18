import { useTranslation } from 'react-i18next';
import './Pages.css';

export default function FaqPage() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true });

  return (
    <section className="page-section">
      <h1>{t('faq.title')}</h1>
      <div className="faq-list">
        {items.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
