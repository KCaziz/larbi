import { useId, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const clean = (raw) => raw.replace(/\s+/g, ' ').trim().slice(0, 40);

// Keywords ("tags") typed one by one: Enter or comma adds one, a chip removes it.
// `suggestions` = names already used elsewhere, offered while typing so that
// "TVA" and "tva" do not drift apart. Generic: used for articles, reusable elsewhere.
export default function TagInput({ id, value, onChange, suggestions = [], max = 10, describedBy }) {
  const { t } = useTranslation();
  const listId = useId();
  const [text, setText] = useState('');
  const atLimit = value.length >= max;

  // Adds several names at once (a pasted "a, b, c") in ONE change, ignoring
  // blanks, duplicates (case-insensitive) and anything beyond the limit.
  const addMany = (names) => {
    let list = value;
    for (const raw of names) {
      const name = clean(raw);
      if (!name || list.length >= max || list.some((v) => v.toLowerCase() === name.toLowerCase())) continue;
      list = [...list, name];
    }
    if (list !== value) onChange(list);
  };

  const commit = () => {
    addMany([text]);
    setText('');
  };

  return (
    <div className="cms-taginput">
      {value.length > 0 && (
        <ul className="cms-tag-list">
          {value.map((tag) => (
            <li key={tag} className="cms-tag">
              <span>{tag}</span>
              <button
                type="button"
                className="cms-tag-remove"
                onClick={() => onChange(value.filter((v) => v !== tag))}
                aria-label={t('admin.tagInput.remove', { tag })}
              >
                <X size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        type="text"
        list={listId}
        maxLength={200}
        value={text}
        disabled={atLimit}
        placeholder={atLimit ? t('admin.tagInput.limit', { count: max }) : t('admin.tagInput.placeholder')}
        aria-describedby={describedBy}
        onChange={(event) => {
          const next = event.target.value;
          if (next.includes(',')) {
            // A comma ends the current tag (typing it, or pasting "a, b").
            const parts = next.split(',');
            addMany(parts.slice(0, -1));
            setText(parts[parts.length - 1]);
          } else {
            setText(next);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          } else if (event.key === 'Backspace' && !text && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commit}
      />
      <datalist id={listId}>
        {suggestions
          .filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()))
          .map((s) => (
            <option key={s} value={s} />
          ))}
      </datalist>
    </div>
  );
}
