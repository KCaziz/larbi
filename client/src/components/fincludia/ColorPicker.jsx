import { useTranslation } from 'react-i18next';

// P10-02 — the person's own colour for a category, a budget or an account.
// A short palette of contrasted colours, each with its NAME (a colour never
// carries a meaning on its own), plus « Par défaut », which gives the choice
// back to the reference (its family, its type). Radio buttons: usable with the
// keyboard and read out by a screen reader.
export const COLOR_PALETTE = [
  { key: 'blue', value: '#2563A6' },
  { key: 'teal', value: '#0F766E' },
  { key: 'green', value: '#2E7D32' },
  { key: 'olive', value: '#6B7A1E' },
  { key: 'amber', value: '#B45309' },
  { key: 'red', value: '#B91C1C' },
  { key: 'pink', value: '#BE185D' },
  { key: 'violet', value: '#7E57C2' },
  { key: 'indigo', value: '#4338CA' },
  { key: 'slate', value: '#475569' },
];

export default function ColorPicker({ name, value, onChange, legend }) {
  const { t } = useTranslation();
  const current = value ? value.toUpperCase() : '';
  return (
    <fieldset className="fin-color-picker">
      <legend>{legend ?? t('colorPicker.legend')}</legend>
      <div className="fin-color-options">
        <label className={`fin-color-option fin-color-default${current === '' ? ' fin-color-chosen' : ''}`}>
          <input type="radio" name={name} value="" checked={current === ''} onChange={() => onChange(null)} />
          <span>{t('colorPicker.default')}</span>
        </label>
        {COLOR_PALETTE.map((color) => (
          <label key={color.key} className={`fin-color-option${current === color.value ? ' fin-color-chosen' : ''}`} title={t(`colorPicker.colors.${color.key}`)}>
            <input type="radio" name={name} value={color.value} checked={current === color.value} onChange={() => onChange(color.value)} />
            <span className="fin-color-swatch" style={{ background: color.value }} aria-hidden="true" />
            <span className="sr-only">{t(`colorPicker.colors.${color.key}`)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
