import { useTranslation } from 'react-i18next';
import { Award, Landmark, LockKeyhole, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader.jsx';
import Section from '../components/ui/Section.jsx';
import './Pages.css';

const valueVisuals = [
  { icon: ShieldCheck, tone: 'tone-primary' },
  { icon: LockKeyhole, tone: 'tone-blue' },
  { icon: TrendingUp, tone: 'tone-green' },
  { icon: Award, tone: 'tone-brass' },
];

export default function AboutPage() {
  const { t } = useTranslation();
  const values = t('about.values.items', { returnObjects: true });

  return (
    <>
      <PageHeader icon={Landmark} title={t('about.title')} subtitle={t('about.intro')} />

      <Section>
        <div className="feature-grid feature-grid-2">
          <article className="feature-card tone-primary">
            <span className="icon-badge" aria-hidden="true">
              <Target size={22} strokeWidth={1.6} />
            </span>
            <h3>{t('about.approachTitle')}</h3>
            <p>{t('about.approachBody')}</p>
          </article>
          <article className="feature-card tone-blue">
            <span className="icon-badge" aria-hidden="true">
              <LockKeyhole size={22} strokeWidth={1.6} />
            </span>
            <h3>{t('about.securityTitle')}</h3>
            <p>{t('about.securityBody')}</p>
          </article>
        </div>
      </Section>

      <Section alt title={t('about.values.title')}>
        <div className="feature-grid feature-grid-4">
          {values.map((value, index) => {
            const ValueIcon = valueVisuals[index].icon;
            return (
            <article className={`feature-card ${valueVisuals[index].tone}`} key={value.title}>
              <span className="icon-badge" aria-hidden="true">
                <ValueIcon size={22} strokeWidth={1.6} />
              </span>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </article>
            );
          })}
        </div>
      </Section>
    </>
  );
}
