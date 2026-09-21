import { Link } from 'react-router-dom';
import { Award, CircleCheck, ImageOff, Lock, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProgressBar from './ProgressBar.jsx';

// Card used by the catalogue and "my formations". `item` = catalogue item from the API.
export default function FormationCard({ item }) {
  const { t } = useTranslation();
  const { enrollment } = item;
  const finished = enrollment?.status === 'completed';
  const premium = item.requiredAccessLevel === 'premium';

  return (
    <article className={`learn-card ${item.accessible ? '' : 'is-locked'}`}>
      <Link to={`/catalogue/${item.slug}`} className="learn-card-cover" tabIndex={-1} aria-hidden="true">
        {item.coverUrl ? <img src={item.coverUrl} alt="" loading="lazy" /> : <ImageOff size={28} strokeWidth={1.4} />}
      </Link>
      <div className="learn-card-body">
        <div className="learn-chips">
          {item.category && <span className="learn-chip">{item.category.name}</span>}
          {premium && (
            <span className="learn-chip learn-chip-premium">
              {item.accessible ? <Star size={13} strokeWidth={2} aria-hidden="true" /> : <Lock size={13} strokeWidth={2} aria-hidden="true" />}
              {t('learn.card.premium')}
            </span>
          )}
          {finished && (
            <span className="learn-chip learn-chip-done">
              <CircleCheck size={13} strokeWidth={2} aria-hidden="true" />
              {t('learn.card.completed')}
            </span>
          )}
          {enrollment?.certification && (
            <span className="learn-chip learn-chip-done">
              <Award size={13} strokeWidth={2} aria-hidden="true" />
              {t('learn.card.certified')}
            </span>
          )}
        </div>
        <h3>
          <Link to={`/catalogue/${item.slug}`}>{item.title}</Link>
        </h3>
        {item.subtitle && <p className="learn-card-subtitle">{item.subtitle}</p>}
        {item.description && <p className="learn-card-text">{item.description}</p>}
        <p className="learn-card-meta">
          {[
            item.level ? t(`learn.level.${item.level}`) : null,
            t('learn.lessonCount', { count: item.courseCount }),
            item.totalMinutes > 0 ? t('learn.detail.totalDuration', { count: item.totalMinutes }) : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {enrollment ? (
          <ProgressBar progress={enrollment.progress} />
        ) : (
          !item.accessible && <p className="learn-card-lock">{t('learn.card.locked')}</p>
        )}
      </div>
    </article>
  );
}
