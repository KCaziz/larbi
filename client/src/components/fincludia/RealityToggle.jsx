import { useTranslation } from 'react-i18next';
import { FlaskConical, Wallet } from 'lucide-react';
import { REALITIES } from '../../lib/finControls.js';
import './Fincludia.css';

// The client's « sélecteur Réel / Fictif » (P1-12), with the strong visual
// separation and the permanent SIMULATION badge.
//
// This is the rule the client repeats most often, and the only one with a
// consequence in the engine: real and fictional amounts are NEVER added
// together. The selector exists so that a screen shows one world at a time;
// it is not a filter you can half-apply, which is why there is no "both".
//
// The badge is part of the control, not a decoration on the figures: when
// fictional is selected it is on screen permanently, next to the choice that
// caused it, so the state is readable without scrolling to a card. The
// fictional side also carries its own icon and its own border — a reader who
// does not perceive the colour difference still sees which world they are in.
export default function RealityToggle({ value, onChange, name = 'fin-reality' }) {
  const { t } = useTranslation();
  const fictional = value === 'fictif';

  return (
    <fieldset className={fictional ? 'fin-reality fin-reality-fictional' : 'fin-reality'}>
      <legend>{t('fincludia.reality.legend')}</legend>
      <div className="fin-reality-options">
        {REALITIES.map((reality) => {
          const Icon = reality === 'fictif' ? FlaskConical : Wallet;
          return (
            <label
              key={reality}
              className={value === reality ? 'fin-reality-option checked' : 'fin-reality-option'}
            >
              <input
                type="radio"
                name={name}
                value={reality}
                checked={value === reality}
                onChange={() => onChange(reality)}
              />
              <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
              <span>{t(`fincludia.reality.${reality}`)}</span>
            </label>
          );
        })}
      </div>
      {fictional && (
        <p className="fin-reality-badge">
          <span className="fin-badge-simulation">{t('fincludia.simulationBadge')}</span>
          {t('fincludia.reality.warning')}
        </p>
      )}
    </fieldset>
  );
}
