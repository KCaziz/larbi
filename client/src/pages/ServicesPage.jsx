import { useTranslation } from 'react-i18next';
import { BookOpenText, Calculator, LayoutGrid, Newspaper } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Section from '../components/ui/Section.jsx';
import './Pages.css';

const services = [
  { key: 'formations', icon: BookOpenText, tone: 'tone-primary', to: '/formations' },
  { key: 'blog', icon: Newspaper, tone: 'tone-blue', to: '/blog' },
  { key: 'tools', icon: Calculator, tone: 'tone-brass', to: '/outils' },
];

export default function ServicesPage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader icon={LayoutGrid} title={t('services.title')} subtitle={t('services.intro')} />

      <Section>
        <div className="feature-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
            <article className={`feature-card ${service.tone}`} key={service.key}>
              <span className="icon-badge" aria-hidden="true">
                <Icon size={22} strokeWidth={1.6} />
              </span>
              <h3>{t(`services.${service.key}.title`)}</h3>
              <p>{t(`services.${service.key}.body`)}</p>
              <Button to={service.to} variant="ghost" arrow>
                {t(`services.${service.key}.cta`)}
              </Button>
            </article>
            );
          })}
        </div>
      </Section>

      <Section alt title={t('services.compareTitle')} subtitle={t('services.compareBody')}>
        <div className="center">
          <Button to="/fonctionnalites" variant="primary" className="btn-lg" arrow>
            {t('services.detailCta')}
          </Button>
        </div>
      </Section>
    </>
  );
}
