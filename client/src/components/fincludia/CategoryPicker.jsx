import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import CategoryIcon from './CategoryIcon.jsx';
import './CategoryPicker.css';

// One way to choose a category, wherever a category is asked (SUIVI_RECETTE R3-07):
// a search box over every category and sub-category, and, without a search, a
// walk from the categories to the sub-categories with a way back. It works with
// the keyboard (Tab, Enter, Escape) and on a phone (large targets).
//
// `groups` is the answer of GET /fin/categories: families, each with its
// categories; a category carries the client's category it belongs to in `group`.
// `value` is a category id or '' ; `emptyLabel` is the text of the « none » choice
// (without it, the person cannot clear the choice).
const normalise = (text) => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function CategoryPicker({ id, value, onChange, groups, emptyLabel = null, label, className = '' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState(null);
  const panelId = useId();
  const root = useRef(null);
  const search = useRef(null);

  // The categories by the client's category (« Logement », « Alimentation »…); a category
  // that belongs to none stays under its family. Income comes first, as everywhere.
  const buckets = useMemo(() => {
    const map = new Map();
    for (const family of groups ?? []) {
      for (const category of family.categories) {
        const income = family.code === 'income';
        const key = category.group ? `${income ? 'income' : 'expense'}:${category.group}` : `family:${family.code}`;
        const name = category.group ? (income ? t('myMoney.incomeGroup', { group: category.group }) : category.group) : family.label;
        if (!map.has(key)) map.set(key, { key, name, icon: category.icon, categories: [] });
        map.get(key).categories.push(category);
      }
    }
    return [...map.values()];
  }, [groups, t]);

  const everyCategory = useMemo(() => buckets.flatMap((bucket) => bucket.categories.map((category) => ({ ...category, bucketName: bucket.name }))), [buckets]);
  const selected = everyCategory.find((category) => category.id === value) ?? null;

  const close = () => {
    setOpen(false);
    setQuery('');
    setGroup(null);
  };
  const pick = (next) => {
    onChange(next);
    close();
  };

  useEffect(() => {
    if (!open) return undefined;
    search.current?.focus();
    const onPointer = (event) => {
      if (root.current && !root.current.contains(event.target)) close();
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  const needle = normalise(query);
  const found = needle ? everyCategory.filter((category) => normalise(category.label).includes(needle) || normalise(category.bucketName).includes(needle)) : [];
  const current = group ? buckets.find((bucket) => bucket.key === group) : null;

  return (
    <div className={`category-picker ${className}`} ref={root} onKeyDown={(event) => event.key === 'Escape' && open && (event.stopPropagation(), close())}>
      <button type="button" id={id} className="category-picker-button" aria-haspopup="dialog" aria-expanded={open} aria-controls={panelId} aria-label={label} onClick={() => setOpen((v) => !v)}>
        {selected ? (
          <>
            <CategoryIcon emoji={selected.icon} size={16} />
            <span className="category-picker-value">{selected.label}</span>
          </>
        ) : (
          <span className="category-picker-value category-picker-placeholder">{emptyLabel ?? t('categoryPicker.choose')}</span>
        )}
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className="category-picker-panel" id={panelId} role="dialog" aria-label={label ?? t('categoryPicker.choose')}>
          <div className="category-picker-search">
            <Search size={16} aria-hidden="true" />
            <input ref={search} type="search" value={query} placeholder={t('categoryPicker.search')} aria-label={t('categoryPicker.search')} onChange={(event) => setQuery(event.target.value)} />
            {query && (
              <button type="button" className="category-picker-clear" aria-label={t('categoryPicker.clearSearch')} onClick={() => setQuery('')}>
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <ul className="category-picker-list">
            {emptyLabel && !needle && !current && (
              <li>
                <button type="button" className="category-picker-row" onClick={() => pick('')}>
                  {emptyLabel}
                </button>
              </li>
            )}

            {needle ? (
              found.length === 0 ? (
                <li className="category-picker-none">{t('categoryPicker.noResult')}</li>
              ) : (
                found.map((category) => (
                  <li key={category.id}>
                    {/* Two lines (recette R8-01): the sub-category, then the
                        category it belongs to — side by side, the second was
                        squeezed under the first in a narrow list. */}
                    <button type="button" className="category-picker-row category-picker-result" aria-current={category.id === value ? 'true' : undefined} onClick={() => pick(category.id)}>
                      <CategoryIcon emoji={category.icon} size={18} />
                      <span className="category-picker-text">
                        <span className="category-picker-name">{category.label}</span>
                        <span className="category-picker-group">{t('categoryPicker.inGroup', { group: category.bucketName })}</span>
                      </span>
                    </button>
                  </li>
                ))
              )
            ) : current ? (
              <>
                <li>
                  <button type="button" className="category-picker-row category-picker-back" onClick={() => setGroup(null)}>
                    <ArrowLeft className="icon-dir" size={16} aria-hidden="true" />
                    <span>{t('categoryPicker.back')}</span>
                    <strong className="category-picker-group">{current.name}</strong>
                  </button>
                </li>
                {current.categories.map((category) => (
                  <li key={category.id}>
                    <button type="button" className="category-picker-row" aria-current={category.id === value ? 'true' : undefined} onClick={() => pick(category.id)}>
                      <CategoryIcon emoji={category.icon} size={18} />
                      <span className="category-picker-name">{category.label}</span>
                    </button>
                  </li>
                ))}
              </>
            ) : (
              buckets.map((bucket) =>
                bucket.categories.length === 1 ? (
                  <li key={bucket.key}>
                    <button type="button" className="category-picker-row" aria-current={bucket.categories[0].id === value ? 'true' : undefined} onClick={() => pick(bucket.categories[0].id)}>
                      <CategoryIcon emoji={bucket.categories[0].icon ?? bucket.icon} size={18} />
                      <span className="category-picker-name">{bucket.categories[0].label}</span>
                    </button>
                  </li>
                ) : (
                  <li key={bucket.key}>
                    <button type="button" className="category-picker-row" onClick={() => setGroup(bucket.key)}>
                      <CategoryIcon emoji={bucket.icon} size={18} />
                      <span className="category-picker-name">{bucket.name}</span>
                      <span className="category-picker-count">{bucket.categories.length}</span>
                      <ChevronRight className="icon-dir" size={16} aria-hidden="true" />
                    </button>
                  </li>
                ),
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
