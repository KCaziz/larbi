// Where the budget's money is planned to go, at a glance (P6-23): one
// stacked bar, one segment per envelope, width proportional to its planned
// amount. Purely decorative (`aria-hidden`): the real numbers already exist,
// readable, right below it as the envelope list itself — this bar never
// introduces a fact that text doesn't already carry.
//
// Four tones only, the brand's own (deep blue / teal / ocean / mint, already
// tokens in `index.css`) — never an arbitrary hue disconnected from the
// palette, and few enough tones that a repeat at the fifth envelope reads as
// the same family rather than a random colour.
const PALETTE_SIZE = 4;

export default function BudgetDistribution({ envelopes }) {
  const total = envelopes.reduce((sum, line) => sum + line.prevu, 0);
  if (total <= 0) return null;

  return (
    <div className="budget-distribution" aria-hidden="true">
      {envelopes.map((line, index) => {
        const share = (line.prevu / total) * 100;
        if (share <= 0) return null;
        return (
          <span
            key={line.id}
            className={`budget-distribution-segment budget-distribution-tone-${index % PALETTE_SIZE}`}
            style={{ '--share': `${share}%` }}
            title={line.label}
          />
        );
      })}
    </div>
  );
}
