import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, GraduationCap, Route } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import Notice from '../ui/Notice.jsx';
import './EducationPanel.css';

// The educational layer of the person (P8-17) — « la seule couche
// véritablement différente selon le profil ». The server sends the profile,
// its parcours and where the person stands, and the recommendations; this
// panel computes nothing. `mode`: 'formation' (the whole layer), 'progress'
// (the parcours and the missions) or 'certificates' (the parcours
// certificate).
export default function EducationPanel({ mode = 'formation' }) {
  const { t } = useTranslation();
  const view = useApi('/fin/formation/parcours');
  if (!view.data) return null;
  const { profil, aChoisir, parcours, recommandees, missions } = view.data;

  return (
    <section className="education-panel" aria-labelledby="education-title">
      <h2 id="education-title">
        <Route size={18} aria-hidden="true" /> {parcours ? t('education.yourParcours', { name: parcours.name }) : t('education.freeTitle')}
      </h2>
      {aChoisir && (
        <Notice variant="action-needed">
          {t('education.chooseProfile')} <Link to="/app/parametres/fincludia">{t('education.chooseLink')}</Link>
        </Notice>
      )}
      <p className="education-profile">
        {t('education.profile', { label: profil.label })} — {profil.progression}
      </p>
      {mode === 'formation' && (
        <ul className="education-contents" aria-label={t('education.contents')}>
          {profil.contents.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {parcours && mode !== 'certificates' && (
        <div className="education-parcours">
          {parcours.statut === 'en_preparation' ? (
            <p className="fin-hint">{t('education.parcoursPreparing', { name: parcours.name })}</p>
          ) : (
            <>
              <p>
                <strong>{parcours.formation.title}</strong> —{' '}
                {t('education.coursesDone', { done: parcours.formation.cours.faits, total: parcours.formation.cours.total })}
              </p>
              <Link to={`/app/formation/${parcours.formation.slug}`} className="education-link">
                {parcours.formation.inscrit ? t('education.continue') : t('education.start')} <ArrowRight size={14} aria-hidden="true" className="icon-dir" />
              </Link>
            </>
          )}
        </div>
      )}

      {parcours?.certificat && mode !== 'formation' && (
        <div className="education-certificate">
          <Award size={18} aria-hidden="true" />
          <span>
            <strong>{parcours.certificat}</strong> —{' '}
            {parcours.formation?.certificat
              ? t('education.certificateObtained', { number: parcours.formation.certificat.numero })
              : t('education.certificateHow', { name: parcours.name })}
          </span>
        </div>
      )}

      {mode === 'progress' && missions.statut === 'en_preparation' && <p className="fin-hint">{t('education.missionsPreparing')}</p>}

      {mode === 'formation' && recommandees.length > 0 && (
        <>
          <h3>
            <GraduationCap size={16} aria-hidden="true" /> {t('education.recommended')}
          </h3>
          <ul className="education-recommended">
            {recommandees.map((row) => (
              <li key={row.slug}>
                <Link to={`/app/formation/${row.slug}`}>
                  <span>{row.title}</span>
                  {row.pourVous && <span className="education-tag">{t('education.forYou')}</span>}
                  {row.termine && <span className="education-tag education-tag-done">{t('education.done')}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
