import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useApi } from '../../lib/useApi.js';
import { formatAmount, formatDate } from '../../lib/format.js';
import { toMinorUnits } from '../../lib/money.js';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import LoadingState from '../../components/ui/LoadingState.jsx';
import AmountField from '../../components/fincludia/AmountField.jsx';

// The common pot of a space (P9-09, the client's rule A1): what came in, what
// went out, what is left — and, as a PROPOSAL, what a collective need would ask
// of each member. A planned contribution is said apart: it is a promise, and is
// not counted until it is confirmed.
export default function SpacePot({ t, language, spaceId, space, members, canAdmin, run, feedback }) {
  const pot = useApi(`/fin/espaces/${spaceId}/ressources`);
  const [form, setForm] = useState({ kind: 'contribution', memberId: members.find((m) => m.isMe)?.id ?? '', value: '', date: new Date().toISOString().slice(0, 10), planned: false });
  const [need, setNeed] = useState('');
  const [proposal, setProposal] = useState(null);
  const [proposalError, setProposalError] = useState(null);

  if (pot.status === 'loading' && !pot.data) return <LoadingState />;
  if (pot.status === 'error') return <ErrorState message={t('state.loadError')} onRetry={pot.reload} />;
  const data = pot.data.ressources;
  const money = (amount) => formatAmount(language, amount, space.currency);
  const nameOf = (id) => members.find((m) => m.id === id)?.name ?? '—';
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });

  async function add(event) {
    event.preventDefault();
    const amount = toMinorUnits(form.value, space.currency);
    if (amount === null) return;
    const outcome = await run(
      () =>
        api.post(`/fin/espaces/${spaceId}/ressources`, {
          kind: form.kind,
          value: amount,
          occurredAt: new Date(form.date).toISOString(),
          ...(form.kind === 'contribution' ? { memberId: form.memberId } : {}),
          ...(form.planned ? { planned: true } : {}),
        }),
      'spaces.pot.added',
    );
    if (outcome.ok) {
      setForm({ ...form, value: '' });
      pot.reload();
    }
  }

  async function propose(event) {
    event.preventDefault();
    setProposalError(null);
    const amount = toMinorUnits(need, space.currency, { allowZero: true });
    if (amount === null) return;
    try {
      const res = await api.get(`/fin/espaces/${spaceId}/contribution-requise?besoin=${amount}`);
      setProposal(res.contribution);
    } catch {
      setProposal(null);
      setProposalError(t('spaces.pot.proposalRefused'));
    }
  }

  return (
    <>
      {feedback}
      <h2>{t('spaces.pot.title')}</h2>
      <p className="spaces-help">{t('spaces.pot.intro')}</p>
      <ul className="spaces-members">
        <li className="spaces-member">
          <span className="spaces-member-name">{t('spaces.pot.resources')}</span>
          <span>{money(data.resources.montant)}</span>
        </li>
        <li className="spaces-member">
          <span className="spaces-member-name">{t('spaces.pot.spent')}</span>
          <span>{money(data.depensesRealisees)}</span>
        </li>
        <li className="spaces-member">
          <strong className="spaces-member-name">{t('spaces.pot.balance')}</strong>
          <strong>{money(data.soldeGroupe.resultat)}</strong>
        </li>
      </ul>
      {data.contributionsPrevues > 0 && <p className="spaces-help">{t('spaces.pot.planned', { amount: money(data.contributionsPrevues) })}</p>}

      {data.inflows.length > 0 && (
        <ul className="spaces-list">
          {data.inflows.map((row) => (
            <li key={row.id} className="spaces-row">
              <div className="spaces-open" style={{ cursor: 'default' }}>
                <span className="spaces-row-label">{t(`spaces.pot.kinds.${row.kind}`)}</span>
                {row.memberId && <span className="spaces-tag">{nameOf(row.memberId)}</span>}
                <span className="spaces-tag">{money(row.value)}</span>
                <span className="spaces-row-date">{formatDate(language, row.occurredAt)}</span>
                {row.status === 'planned' && <span className="spaces-tag">{t('spaces.pot.plannedTag')}</span>}
                {row.status === 'planned' && (
                  <button
                    type="button"
                    className="spaces-icon"
                    onClick={async () => {
                      const outcome = await run(() => api.post(`/fin/espaces/${spaceId}/ressources/${row.id}/confirmer`, {}), 'spaces.pot.confirmed');
                      if (outcome.ok) pot.reload();
                    }}
                    aria-label={t('spaces.pot.confirm')}
                  >
                    <Check size={15} aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  className="spaces-icon"
                  onClick={async () => {
                    if (!window.confirm(t('spaces.pot.deleteConfirm'))) return;
                    const outcome = await run(() => api.delete(`/fin/espaces/${spaceId}/ressources/${row.id}`), 'spaces.pot.deleted');
                    if (outcome.ok) pot.reload();
                  }}
                  aria-label={t('spaces.pot.delete')}
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="spaces-form" onSubmit={add}>
        <div className="spaces-form-grid">
          <label htmlFor="pot-kind">
            {t('spaces.pot.fields.kind')}
            <select id="pot-kind" value={form.kind} onChange={set('kind')}>
              {['contribution', 'other', ...(canAdmin ? ['opening'] : [])].map((kind) => (
                <option key={kind} value={kind}>
                  {t(`spaces.pot.kinds.${kind}`)}
                </option>
              ))}
            </select>
          </label>
          {form.kind === 'contribution' && (
            <label htmlFor="pot-member">
              {t('spaces.pot.fields.member')}
              <select id="pot-member" value={form.memberId} onChange={set('memberId')}>
                {members
                  .filter((member) => canAdmin || member.isMe)
                  .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
              </select>
            </label>
          )}
          <AmountField id="pot-value" label={t('spaces.pot.fields.amount')} value={form.value} currency={space.currency} onChange={(value) => setForm({ ...form, value })} required />
          <label htmlFor="pot-date">
            {t('spaces.pot.fields.date')}
            <input id="pot-date" type="date" value={form.date} onChange={set('date')} required />
          </label>
        </div>
        <label htmlFor="pot-planned" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input id="pot-planned" type="checkbox" checked={form.planned} onChange={set('planned')} />
          {t('spaces.pot.fields.planned')}
        </label>
        <div className="spaces-actions">
          <Button type="submit">{t('spaces.pot.add')}</Button>
        </div>
      </form>

      <h3>{t('spaces.pot.proposalTitle')}</h3>
      <p className="spaces-help">{t('spaces.pot.proposalHelp')}</p>
      <form className="spaces-form" onSubmit={propose}>
        <AmountField id="pot-need" label={t('spaces.pot.need')} value={need} currency={space.currency} onChange={setNeed} required />
        <div className="spaces-actions">
          <Button type="submit" variant="secondary">
            {t('spaces.pot.propose')}
          </Button>
        </div>
      </form>
      {proposalError && <p className="form-error">{proposalError}</p>}
      {proposal && (
        <section aria-live="polite">
          <p>{(proposal.contributionRequise.resultat ?? 0) > 0 ? t('spaces.pot.proposalResult', { amount: money(proposal.contributionRequise.resultat) }) : t('spaces.pot.proposalCovered')}</p>
          {(proposal.contributionRequise.resultat ?? 0) > 0 && <p className="spaces-help">{t('spaces.pot.proposalShares')}</p>}
          <ul className="spaces-members">
            {proposal.parts.map((part) => (
              <li key={part.memberId} className="spaces-member">
                <span className="spaces-member-name">{part.name}</span>
                <span>{money(part.part)}</span>
              </li>
            ))}
          </ul>
          <p className="spaces-help">{t('spaces.pot.proposalNote')}</p>
        </section>
      )}
    </>
  );
}
