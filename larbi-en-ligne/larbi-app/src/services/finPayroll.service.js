import {
  IRG_BONUS_RULE,
  IRG_BRACKETS,
  IRG_MONTHLY_REGIMES,
  IRG_SOURCE,
  PAYROLL_DISCLAIMERS,
  PAYSLIP_LINE_KINDS,
  SNMG,
  SOCIAL_BRANCHES,
  SOCIAL_TOTALS,
  payslipLineKind,
} from '../constants/finPayroll.js';
import { computed } from './finance/contract.js';

/**
 * Décodeur de fiche de paie (P4-14, écran C15).
 *
 * La personne saisit les lignes de SA fiche. Le décodeur les explique, vérifie
 * l'arithmétique de ce qu'elle a saisi, et signale les écarts avec le
 * référentiel légal — sans jamais recalculer son salaire.
 *
 * TROIS RÈGLES, et la troisième est celle qui protège :
 *
 * 1. `net = brut + éléments positifs − retenues`, **uniquement d'après la
 *    structure saisie**. Aucune déduction légale n'est ajoutée.
 * 2. Une ligne que le décodeur ne reconnaît pas reste « à confirmer » : elle
 *    est comptée dans le net si la personne lui a donné un sens, jamais
 *    devinée.
 * 3. Un écart est un POINT À VÉRIFIER, pas une erreur établie. Le document du
 *    client prévient que sa grille ne fait pas un moteur de paie ; afficher
 *    « votre employeur s'est trompé » sur cette base serait faux et grave.
 *
 * Fonctions pures : rien n'est lu en base.
 */

const sum = (lines, predicate) => lines.filter(predicate).reduce((total, line) => total + line.value, 0);

/**
 * Décode une fiche saisie.
 *
 * `lines` : [{ kind, label, value }] — `value` en centimes, toujours positive.
 * Le SENS vient de `kind` (une retenue est saisie en positif et soustraite),
 * parce qu'une personne lit « IRG 4 500 » sur sa fiche, pas « −4 500 ».
 */
export function decodePayslip({ lines = [], declaredNet = null, period = null } = {}, { now = new Date() } = {}) {
  const decoded = lines.map((line) => {
    const kind = payslipLineKind(line.kind) ?? payslipLineKind('unknown');
    return {
      kind: kind.key,
      label: line.label ?? kind.label,
      value: line.value,
      sign: kind.sign,
      group: kind.group,
      // Ce que cette ligne veut dire, en une phrase. C'est le cœur du
      // « décodeur » : la personne sait enfin ce qu'elle paie.
      explication: explain(kind),
    };
  });

  const gross = sum(decoded, (line) => line.group === 'brut');
  const deductions = sum(decoded, (line) => line.group === 'retenue');
  const unknown = decoded.filter((line) => line.group === 'inconnu');

  // L'arithmétique de la structure saisie, et rien d'autre.
  const net = gross - deductions;

  const checks = [];

  // ---- cohérence avec le net déclaré --------------------------------------
  if (declaredNet !== null) {
    const gap = net - declaredNet;
    if (gap !== 0) {
      checks.push({
        key: 'net_mismatch',
        level: 'attention',
        gap,
        message:
          'Le net calculé à partir des lignes saisies ne correspond pas au net inscrit sur la fiche. Une ligne manque peut-être, ou elle a été classée dans le mauvais sens.',
      });
    }
  }

  // ---- cotisation salarié --------------------------------------------------
  // Le seul contrôle légal que le document permet sans ambiguïté : 9 % de
  // l'assiette, avec son décret et sa date.
  const socialLine = decoded.find((line) => line.kind === 'social_employee');
  if (socialLine && gross > 0) {
    const expected = Math.round(gross * SOCIAL_TOTALS.employee);
    const gap = socialLine.value - expected;
    // Une tolérance d'un dinar : les arrondis d'un logiciel de paie ne sont
    // pas forcément les nôtres, et signaler un écart d'un centime ferait du
    // bruit sans information.
    if (Math.abs(gap) > 100) {
      checks.push({
        key: 'social_rate',
        level: 'attention',
        gap,
        expected,
        message: `La cotisation salarié saisie s’écarte des ${(SOCIAL_TOTALS.employee * 100).toFixed(0)} % du brut prévus par le ${SOCIAL_TOTALS.source}. L’assiette de cotisation n’est pas toujours le brut total : à vérifier avec votre employeur.`,
      });
    }
  }

  // ---- SNMG ---------------------------------------------------------------
  if (gross > 0 && gross < SNMG.monthly) {
    checks.push({
      key: 'below_snmg',
      level: 'attention',
      message: `Le brut saisi est inférieur au SNMG (${SNMG.monthly / 100} DA/mois, ${SNMG.source}). Un temps partiel l’explique ; sinon, c’est un point à vérifier.`,
    });
  }

  // ---- IRG ----------------------------------------------------------------
  const irgLine = decoded.find((line) => line.kind === 'irg');
  const regime = IRG_MONTHLY_REGIMES.find(
    (row) => (row.from === undefined || gross >= row.from) && (row.upTo === undefined || gross <= row.upTo),
  );
  if (regime && irgLine) {
    // Le seul régime calculable sans ambiguïté : sous le seuil, l'IRG est nul.
    // Au-dessus, le décodeur NOMME la règle et s'arrête là.
    if (regime.computable && regime.key === 'exempt' && irgLine.value > 0) {
      checks.push({
        key: 'irg_exempt',
        level: 'attention',
        message: `À ce niveau de revenu, la DGI prévoit une exonération totale d’IRG (${regime.rule}). Une retenue d’IRG figure pourtant sur la fiche : à vérifier.`,
      });
    }
  }

  const bonuses = decoded.filter((line) => line.kind === 'bonus');

  return {
    periode: period,
    lignes: decoded,
    brut: computed('F002', gross, { inputs: { lignes_brut: decoded.filter((l) => l.group === 'brut').length }, currency: 'DZD', now }),
    retenues: computed('F003', deductions, { inputs: { lignes_retenue: decoded.filter((l) => l.group === 'retenue').length }, currency: 'DZD', now }),
    // Le net vient de la structure saisie. L'avertissement est porté par la
    // réponse elle-même, pas seulement par la page.
    net: computed('F004', net, {
      inputs: { brut: gross, retenues: deductions },
      currency: 'DZD',
      warnings: ['Net calculé à partir des lignes saisies. Aucune déduction légale n’est ajoutée.'],
      now,
    }),
    netDeclare: declaredNet,
    controles: checks,
    aConfirmer: unknown.map((line) => ({ label: line.label, value: line.value })),
    // Les règles qui s'appliquent à cette fiche, nommées, avec leur source —
    // y compris celles que le décodeur ne peut pas appliquer et pourquoi.
    regimeIrg: regime ? { ...regime, source: IRG_SOURCE } : null,
    primes: bonuses.length > 0 ? IRG_BONUS_RULE : null,
    avertissements: PAYROLL_DISCLAIMERS,
  };
}

/** Ce qu'une ligne veut dire, avec sa source quand elle en a une. */
function explain(kind) {
  if (kind.key === 'social_employee') {
    const parts = SOCIAL_BRANCHES.filter((branch) => branch.employee !== null)
      .map((branch) => `${branch.label} ${(branch.employee * 100).toFixed(2).replace(/\.?0+$/, '')} %`)
      .join(', ');
    return `Part salariale des cotisations sociales : ${parts} — soit ${(SOCIAL_TOTALS.employee * 100).toFixed(0)} % au total (${SOCIAL_TOTALS.source}).`;
  }
  if (kind.key === 'irg') {
    return `Impôt sur le revenu global retenu à la source. Barème annuel ${IRG_BRACKETS.map((b) => `${b.rate * 100} %`).join(' / ')} (${IRG_SOURCE.institution}).`;
  }
  if (kind.key === 'bonus') return IRG_BONUS_RULE.rule;
  if (kind.key === 'unknown') return 'Ligne non reconnue : elle n’est comptée que si vous lui donnez un sens.';
  return kind.label;
}

/** Le référentiel publié tel quel, pour que l'écran montre ses sources. */
export function payrollReference() {
  return {
    snmg: SNMG,
    // The kinds of line a person can type, so the screen offers exactly these.
    lignes: PAYSLIP_LINE_KINDS.map(({ key, label, sign, group }) => ({ key, label, sign, group })),
    cotisations: { branches: SOCIAL_BRANCHES, totaux: SOCIAL_TOTALS },
    irg: { bareme: IRG_BRACKETS, regimes: IRG_MONTHLY_REGIMES, primes: IRG_BONUS_RULE, source: IRG_SOURCE },
    avertissements: PAYROLL_DISCLAIMERS,
    // Dit une fois, en tête : ce n'est pas un moteur de paie, et c'est le
    // client qui le dit en premier.
    limite:
      'Ce référentiel ne constitue pas un moteur de paie : les abattements, les régimes particuliers et les dates d’application restent à confirmer auprès des sources citées.',
  };
}

// ---- the history of payslips (P8-15, the client's answer D5) -----------------
// Kept only when the person asks, with their consent; read and deleted by them
// only. What is kept is what they typed and what the decoder made of it.
const PAYSLIP_SELECT = { id: true, period: true, lines: true, gross: true, value: true, declaredNet: true, currency: true, createdAt: true };

export async function keepPayslip(prisma, userId, { lines, declaredNet = null, period = null }) {
  const decoded = decodePayslip({ lines, declaredNet, period });
  return prisma.finPayslip.create({
    data: {
      userId,
      period,
      lines,
      gross: decoded.brut.resultat ?? 0,
      value: decoded.net.resultat ?? 0,
      declaredNet,
      source: 'manual',
      status: 'declared',
    },
    select: PAYSLIP_SELECT,
  });
}

export const listPayslips = (prisma, userId) =>
  prisma.finPayslip.findMany({ where: { userId, deletedAt: null }, select: PAYSLIP_SELECT, orderBy: { createdAt: 'desc' } });

// Deleted for real: a payslip kept by choice leaves when its owner says so.
export async function deletePayslip(prisma, userId, id) {
  const { count } = await prisma.finPayslip.deleteMany({ where: { id, userId } });
  return count > 0;
}
