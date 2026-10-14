import { prisma } from '../config/prisma.js';
import { BANK_USAGE_CRITERIA } from '../constants/bankUsage.js';
import { annualCost, parseAmount } from './comparator.service.js';
import { compareOptions } from './finance/comparison.js';

// "Adéquation à l'usage" bancaire (P4-13, écran ET06): Σ(correspondance
// critère × poids utilisateur) / Σ poids, jamais un « meilleur » absolu — la
// même mécanique que le comparateur multicritère (P4-12, compareOptions),
// appliquée aux offres déjà publiques du comparateur bancaire (P4-06), sans
// toucher à leurs données.
//
// Chaque option comparée est un compte précis (une ligne de la rubrique
// "comptes") choisi par la personne. Ses frais de carte et de virement
// viennent du MÊME établissement, mais seulement quand une seule ligne existe
// pour cette rubrique chez cette banque : plusieurs lignes (plusieurs types de
// carte, par exemple) sont une ambiguïté que cette fonction refuse de
// trancher à la place de la personne, pas une valeur qu'elle invente.
async function usageCriteriaForBank(bankId, accountValues) {
  const [cards, transfers] = await Promise.all([
    prisma.comparatorCondition.findMany({ where: { bankId, theme: 'carte-locale' } }),
    prisma.comparatorCondition.findMany({ where: { bankId, theme: 'virements' } }),
  ]);
  const card = cards.length === 1 ? cards[0] : null;
  return {
    accountFee: annualCost('comptes', accountValues),
    cardFee: card ? annualCost('carte-locale', card.values) : null,
    transferFee: transfers.length === 1 ? parseAmount(transfers[0].values?.fee) : null,
    atmFee: card ? parseAmount(card.values?.atmWithdrawal) : null,
  };
}

/**
 * @param {object} input
 * @param {string[]} input.conditionIds  2 ou 3 identifiants de conditions de la rubrique "comptes"
 * @param {object|null} input.weights  poids par critère de BANK_USAGE_CRITERIA
 */
export async function buildUsageFit({ conditionIds, weights = null, now = new Date() }) {
  const accounts = await prisma.comparatorCondition.findMany({
    where: { id: { in: conditionIds }, theme: 'comptes' },
    include: { bank: { select: { id: true, name: true } } },
  });
  // Un identifiant inconnu, ou qui ne désigne pas un compte : refusé, pas ignoré.
  if (accounts.length !== conditionIds.length) return null;

  const byId = new Map(accounts.map((row) => [row.id, row]));
  const options = await Promise.all(
    conditionIds.map(async (id) => {
      const row = byId.get(id);
      return { key: row.id, label: `${row.bank.name} — ${row.label}`, criteria: await usageCriteriaForBank(row.bankId, row.values) };
    }),
  );

  return compareOptions({ options, criteria: BANK_USAGE_CRITERIA, weights, now });
}
