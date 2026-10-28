// A category as the client wants it seen everywhere (P8-27): its icon on its
// own colour, its label, and — for a sub-category of the 125 — its group in a
// smaller line. The colour is never the only signal: the label is always
// written. `category` is a row of GET /fin/categories (its `color` is never
// null since P8-27).
export default function CategoryChip({ category, fallback = null, compact = false }) {
  if (!category) return fallback ? <span className="category-chip category-chip-none">{fallback}</span> : null;
  return (
    <span className="category-chip" style={{ '--category-color': category.color ?? 'var(--border-strong)' }}>
      <span className="category-chip-icon" aria-hidden="true">
        {category.icon ?? '•'}
      </span>
      <span className="category-chip-text">
        <span className="category-chip-label">{category.label}</span>
        {!compact && category.group && (
          <span className="category-chip-group" style={{ '--group-color': category.groupColor ?? category.color }}>
            {category.group}
          </span>
        )}
      </span>
    </span>
  );
}
