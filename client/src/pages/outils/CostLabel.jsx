// Estimated yearly cost of a condition, as computed by the server (null when the
// published fee cannot be turned into one without guessing).
export default function CostLabel({ cost, t }) {
  if (cost === null || cost === undefined) return <span className="cost-null">{t('comparator.noCost')}</span>;
  if (cost === 0) return <span className="cost-free">{t('comparator.free')}</span>;
  return <span>{t('comparator.perYear', { amount: cost.toLocaleString('fr-DZ') })}</span>;
}
