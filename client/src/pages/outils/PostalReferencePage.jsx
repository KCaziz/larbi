import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, FileSearch, Landmark, ShieldQuestion } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { useDocumentMeta } from '../../lib/useDocumentMeta.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import Notice from '../../components/ui/Notice.jsx';
import Section from '../../components/ui/Section.jsx';
import './PostalReference.css';

// Référentiel Algérie Poste / CCP (P4-17).
//
// Cette page montre ce que le classeur du client documente — 75 services, leur
// canal, leurs conditions — et, à la même hauteur, ce qu'il ne documente PAS.
//
// Elle n'affiche aucun montant, et ce n'est pas un oubli : le classeur pose
// `publishable = FALSE` sur ses 75 lignes, parce que la source est un texte
// transmis et non une grille officielle datée. Afficher ces tarifs ferait de
// nous la source d'une information financière que personne n'a vérifiée.
//
// Ce qui est affiché à la place a plus de valeur qu'un prix faux : la liste
// exacte de ce qu'il faut obtenir d'Algérie Poste pour pouvoir les publier.
export default function PostalReferencePage() {
  const { t } = useTranslation();
  const [family, setFamily] = useState('');
  const summary = useApi('/tools/postal');
  const catalogue = useApi(`/tools/postal/services?${family ? `famille=${family}` : ''}`);
  const controls = useApi('/tools/postal/controles');
  useDocumentMeta(t('postal.title'), t('postal.intro'));

  if (summary.status === 'loading' && !summary.data) return <LoadingState />;
  if (summary.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={summary.reload} />;

  const info = summary.data;
  const families = [...new Set((catalogue.data?.services ?? []).map((row) => row.service_family))];

  return (
    <>
      <PageHeader icon={Landmark} title={t('postal.title')} subtitle={t('postal.intro')} />

      <Section>
        {/* La règle, dite avant les données plutôt qu'en note de bas de page :
            quelqu'un qui parcourt la liste doit savoir dès la première ligne
            pourquoi il n'y a pas de prix. */}
        <Notice variant="action-needed">
          <strong>{t('postal.noTariffTitle')}</strong> {info.raisonNonPublie}
        </Notice>

        <dl className="postal-counts">
          <div>
            <dt>{t('postal.counts.records')}</dt>
            <dd>{info.fiches}</dd>
          </div>
          <div>
            <dt>{t('postal.counts.publishable')}</dt>
            <dd>{info.publiables}</dd>
          </div>
          <div>
            <dt>{t('postal.counts.computable')}</dt>
            <dd>{info.calculables}</dd>
          </div>
          <div>
            <dt>{t('postal.counts.controls')}</dt>
            <dd>{info.controlesOuverts}</dd>
          </div>
        </dl>

        {/* « tarif ≠ plafond ≠ délai ≠ procédure » : la distinction que le
            client répète, montrée telle quelle plutôt que fondue dans un total
            unique qui la perdrait. */}
        <ul className="postal-kinds">
          {Object.entries(info.parNature).map(([kind, count]) => (
            <li key={kind}>
              <span className="postal-kind">{kind}</span> {count}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('postal.catalogueTitle')} subtitle={t('postal.catalogueIntro')}>
        <div className="postal-filters">
          <label htmlFor="postal-family">{t('postal.familyLabel')}</label>
          <select id="postal-family" value={family} onChange={(event) => setFamily(event.target.value)}>
            <option value="">{t('postal.allFamilies')}</option>
            {families.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        {catalogue.status === 'loading' && !catalogue.data ? (
          <LoadingState />
        ) : (
          <ul className="postal-list">
            {(catalogue.data?.services ?? []).map((service) => (
              <li key={service.service_id} className="postal-card">
                <div className="postal-card-head">
                  <h3>{service.service_name}</h3>
                  <span className={`postal-badge postal-badge-${service.entry_kind.toLowerCase().replace(/[^a-z]/g, '')}`}>
                    {service.entry_kind}
                  </span>
                </div>
                <p className="postal-meta">
                  {service.customer_segment} · {service.operation_channel}
                </p>
                {service.raw_conditions && <p className="postal-conditions">{service.raw_conditions}</p>}
                {/* « Non publié » et « gratuit » ne doivent jamais se
                    ressembler : l'état est écrit, pas suggéré par un vide. */}
                <p className="postal-tariff">{t('postal.tariffWithheld')}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={t('postal.undocumentedTitle')}>
        <Notice variant="info">{info.avertissementNonDocumente}</Notice>
        <ul className="postal-undocumented">
          {info.famillesNonDocumentees.map((name) => (
            <li key={name}>
              <AlertTriangle size={15} aria-hidden="true" />
              {name}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('postal.blockedTitle')} subtitle={t('postal.blockedIntro')}>
        <ul className="postal-blocked">
          {info.calculsBloques.map((row) => (
            <li key={row.code}>
              <ShieldQuestion size={15} aria-hidden="true" />
              <span>
                <strong>{row.label}</strong> — {row.reason} <em>({row.control})</em>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('postal.controlsTitle')} subtitle={t('postal.controlsIntro')}>
        {controls.status === 'loading' && !controls.data ? (
          <LoadingState />
        ) : (
          <ol className="postal-controls">
            {(controls.data?.controles ?? []).map((control) => (
              <li key={control.code}>
                <p className="postal-control-head">
                  <FileSearch size={15} aria-hidden="true" />
                  <strong>{control.code}</strong> · {control.services}
                </p>
                <p className="postal-control-limit">{control.limite}</p>
                <p className="postal-control-proof">
                  <strong>{t('postal.proofExpected')}</strong> {control.preuve}
                </p>
                <p className="postal-control-impact">
                  <strong>{t('postal.productImpact')}</strong> {control.impact}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </>
  );
}
