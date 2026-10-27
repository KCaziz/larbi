import { useTranslation } from 'react-i18next';

// The categories as <optgroup>s, by the client's own category (« Logement »,
// « Alimentation »… — P8-08), income first. A category of the old reference
// that belongs to no client category stays under its family. A flat list would
// repeat the group in every option, and a <select> is as wide as its widest
// option — which is what pushed the page past the viewport.
export default function CategoryOptions({ groups }) {
  const { t } = useTranslation();
  const buckets = new Map();
  for (const family of groups) {
    for (const category of family.categories) {
      const income = family.code === 'income';
      const id = category.group ? `${income ? 'income' : 'expense'}:${category.group}` : `family:${family.code}`;
      const label = category.group ? (income ? t('myMoney.incomeGroup', { group: category.group }) : category.group) : family.label;
      if (!buckets.has(id)) buckets.set(id, { id, label, categories: [] });
      buckets.get(id).categories.push(category);
    }
  }
  return [...buckets.values()].map((bucket) => (
    <optgroup key={bucket.id} label={bucket.label}>
      {bucket.categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.icon ? `${category.icon} ${category.label}` : category.label}
        </option>
      ))}
    </optgroup>
  ));
}
