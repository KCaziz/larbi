import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../lib/useApi.js';
import { formatDate, formatRatio } from '../../lib/format.js';
import { useCatalogueBase } from '../../lib/useToolsBase.js';
import './ModuleValidation.css';

// P13-02 — the Skills Passport of the pedagogical referential (section 3): one
// line per FINCLUDIA Academy module started, with the scores that prove it,
// the proof declared, and the date it was validated (and, for a module that
// depends on a rule that changes, the date it is to be refreshed).
export default function SkillsPassport() {
  const { t, i18n } = useTranslation();
  const catalogue = useCatalogueBase();
  const { status, data } = useApi('/learn/passeport-competences');
  if (status !== 'ready' || !data) return null;
  const score = (value) => (value === null ? '—' : `${value} %`);
  return (
    <>
      <h2>{t('academy.passportTitle')}</h2>
      <p className="passport-global-note">{t('academy.passportIntro')}</p>
      {data.lines.length === 0 ? (
        <p className="passport-empty">{t('academy.passportEmpty')}</p>
      ) : (
        <>
          <p>{Object.entries(data.totals).map(([state, n]) => `${t(`academy.state.${state}`)} : ${n}`).join(' · ')}</p>
          {data.paths.length > 0 && (
            <ul className="passport-list">
              {data.paths.map((p) => (
                <li key={p.formation.id}>
                  <Link to={`${catalogue}/${p.formation.slug}`}>{p.formation.title}</Link>
                  <span className="passport-date">
                    {t('academy.pathAcquired', { acquired: p.acquired, total: p.total })}
                    {p.reached ? ` · ${t('academy.pathReached', { level: p.reached })}` : ''}
                    {p.validated ? ` · ${t('academy.pathValidatedShort')}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="skills-scroll">
            <table className="skills-table">
              <thead>
                <tr>
                  <th scope="col">{t('academy.col.module')}</th>
                  <th scope="col">{t('academy.col.level')}</th>
                  <th scope="col">{t('academy.col.qcm')}</th>
                  <th scope="col">{t('academy.col.exercise')}</th>
                  <th scope="col">{t('academy.col.mission')}</th>
                  <th scope="col">{t('academy.col.mastery')}</th>
                  <th scope="col">{t('academy.col.state')}</th>
                </tr>
              </thead>
              <tbody>
                {data.lines.map((line) => (
                  <tr key={line.moduleId}>
                    <td>
                      <Link to={`${catalogue}/${line.formation.slug}/cours/${line.courseId}`}>
                        {line.code} — {line.title}
                      </Link>
                      {line.evidenceRef && <div className="academy-muted">{t('academy.evidenceShort', { text: line.evidenceRef })}</div>}
                    </td>
                    <td>{line.level || '—'}</td>
                    <td>
                      {score(line.qcmScore)}
                      {line.criticalErrors > 0 && <div className="academy-muted">{t('academy.criticalShort', { count: line.criticalErrors })}</div>}
                    </td>
                    <td>{score(line.exerciseScore)}</td>
                    <td>{line.missionStatus === 'done' ? t('academy.missionDoneShort') : t('academy.missionTodoShort')}</td>
                    <td>{line.mastery.resultat === null ? t('fincludia.notComputed') : formatRatio(i18n.language, line.mastery.resultat)}</td>
                    <td>
                      <span className={`academy-badge academy-badge-${line.state}`}>{t(`academy.state.${line.state}`)}</span>
                      {line.validatedAt && <div className="academy-muted">{formatDate(i18n.language, line.validatedAt)}</div>}
                      {line.refreshDue && <div className="academy-muted">{t('academy.refreshDueShort', { date: formatDate(i18n.language, line.refreshDue) })}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
