import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button.jsx';

// A short list typed line by line (learning objectives, prerequisites). Each line is one
// sentence; Enter adds it, the cross removes it. Plain text only.
export default function LinesInput({ id, value, onChange, max = 12, maxLength = 200, placeholder, describedBy }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const add = () => {
    const line = text.trim();
    if (!line || value.length >= max || value.includes(line)) return;
    onChange([...value, line]);
    setText('');
  };

  return (
    <div className="cms-lines">
      {value.length > 0 && (
        <ul className="cms-lines-list">
          {value.map((line, index) => (
            <li key={`${index}-${line}`}>
              <span>{line}</span>
              <button
                type="button"
                className="cms-icon-button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label={`${t('admin.lines.remove')} : ${line}`}
                title={t('admin.lines.remove')}
              >
                <X size={16} strokeWidth={1.9} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {value.length < max ? (
        <div className="cms-add-row">
          <input
            id={id}
            type="text"
            maxLength={maxLength}
            value={text}
            placeholder={placeholder}
            aria-describedby={describedBy}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                add();
              }
            }}
          />
          <Button variant="secondary" onClick={add} disabled={!text.trim()}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            {t('admin.lines.add')}
          </Button>
        </div>
      ) : (
        <small className="form-hint">{t('admin.lines.full', { max })}</small>
      )}
    </div>
  );
}
