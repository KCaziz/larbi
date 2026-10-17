import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  IRG_BRACKETS,
  IRG_MONTHLY_REGIMES,
  SNMG,
  SOCIAL_BRANCHES,
  SOCIAL_TOTALS,
} from '../../src/constants/finPayroll.js';
import { decodePayslip, payrollReference } from '../../src/services/finPayroll.service.js';

// Décodeur de fiche de paie (P4-14).
//
// Ce que ces tests gardent : le décodeur EXPLIQUE une fiche, il ne la
// recalcule pas. La frontière est fine et coûteuse à franchir — recalculer un
// IRG sur un barème dont la date d'effet n'est pas confirmée, puis l'afficher
// à côté du chiffre de l'employeur, ferait croire à une erreur de paie là où
// il n'y a qu'une incertitude de notre côté.

const line = (kind, value, label = undefined) => ({ kind, value, label });

describe('P4-14 — le référentiel de paie porte ses sources', () => {
  test('chaque valeur légale cite son texte et sa date', () => {
    // Un taux sans texte ni date n'est pas vérifiable, et un taux qu'on ne
    // peut pas vérifier n'a rien à faire sur une fiche de paie.
    assert.match(SNMG.source, /Décret/);
    assert.equal(SNMG.effectiveFrom, '2026-01-01');
    assert.match(SOCIAL_TOTALS.source, /Décret exécutif 15-236/);
    assert.ok(SOCIAL_TOTALS.url.startsWith('https://'));
  });

  test('la part salariale est la somme de ses branches', () => {
    // 1,5 + 6,75 + 0,5 + 0,25 = 9 %. Si la transcription des branches était
    // fausse, le total du document ne tomberait pas juste.
    const fromBranches = SOCIAL_BRANCHES.reduce((total, branch) => total + (branch.employee ?? 0), 0);
    assert.ok(Math.abs(fromBranches - SOCIAL_TOTALS.employee) < 1e-9, `${fromBranches} ≠ ${SOCIAL_TOTALS.employee}`);
  });

  test('la part employeur et les œuvres sociales tombent sur le total du document', () => {
    const employer = SOCIAL_BRANCHES.reduce((total, branch) => total + (branch.employer ?? 0), 0);
    const works = SOCIAL_BRANCHES.reduce((total, branch) => total + (branch.socialWorks ?? 0), 0);
    assert.ok(Math.abs(employer - SOCIAL_TOTALS.employer) < 1e-9, `employeur ${employer}`);
    assert.ok(Math.abs(works - SOCIAL_TOTALS.socialWorks) < 1e-9, `œuvres sociales ${works}`);
    assert.ok(Math.abs(employer + works + SOCIAL_TOTALS.employee - SOCIAL_TOTALS.overall) < 1e-9);
  });

  test('le barème IRG est continu et croissant', () => {
    // Une borne mal transcrite laisserait un trou ou un chevauchement, et une
    // tranche manquante ne se verrait pas à la lecture.
    for (let i = 1; i < IRG_BRACKETS.length; i += 1) {
      assert.equal(IRG_BRACKETS[i].from, IRG_BRACKETS[i - 1].to + 1, `trou avant la tranche ${i}`);
      assert.ok(IRG_BRACKETS[i].rate > IRG_BRACKETS[i - 1].rate, `taux non croissant en ${i}`);
    }
    assert.equal(IRG_BRACKETS[0].rate, 0);
    assert.equal(IRG_BRACKETS.at(-1).to, null, 'la dernière tranche doit être ouverte');
  });

  test('deux régimes sur trois sont déclarés NON calculables, avec leur raison', () => {
    // C'est l'aveu qui compte : le document donne la règle sans donner de quoi
    // l'appliquer sûrement. Le dire vaut mieux que de calculer quand même.
    const blocked = IRG_MONTHLY_REGIMES.filter((row) => !row.computable);
    assert.equal(blocked.length, 2);
    for (const row of blocked) assert.ok(row.why && row.why.length > 20, row.key);
  });

  test('le référentiel publié dit lui-même qu’il n’est pas un moteur de paie', () => {
    assert.match(payrollReference().limite, /ne constitue pas un moteur de paie/);
    assert.ok(payrollReference().avertissements.length >= 3);
  });
});

describe('P4-14 — le net vient des lignes saisies, et de rien d’autre', () => {
  test('brut moins retenues, exactement', () => {
    const result = decodePayslip({
      lines: [line('base_salary', 8000000), line('seniority', 500000), line('social_employee', 765000), line('irg', 400000)],
    });
    assert.equal(result.brut.resultat, 8500000);
    assert.equal(result.retenues.resultat, 1165000);
    assert.equal(result.net.resultat, 7335000);
  });

  test('aucune déduction légale n’est ajoutée', () => {
    // Une fiche sans cotisation saisie donne un net égal au brut. Le décodeur
    // ne « complète » pas la fiche : il la lit.
    const result = decodePayslip({ lines: [line('base_salary', 5000000)] });
    assert.equal(result.net.resultat, 5000000);
    assert.match(result.net.avertissements.join(' '), /Aucune déduction légale/);
  });

  test('une retenue saisie en positif est bien soustraite', () => {
    // Le sens vient du TYPE de ligne, jamais du signe : quelqu'un qui saisit
    // « IRG 4 500 » ne doit pas voir son net augmenter.
    const result = decodePayslip({ lines: [line('base_salary', 5000000), line('irg', 450000)] });
    assert.equal(result.net.resultat, 4550000);
  });

  test('une ligne inconnue est listée à confirmer, pas devinée', () => {
    const result = decodePayslip({ lines: [line('base_salary', 5000000), line('unknown', 120000, 'Ligne mystère')] });
    assert.equal(result.aConfirmer.length, 1);
    assert.equal(result.aConfirmer[0].label, 'Ligne mystère');
    // Et elle n'entre pas dans le net tant que personne ne lui a donné un sens.
    assert.equal(result.net.resultat, 5000000);
  });

  test('chaque ligne reçoit son explication', () => {
    const result = decodePayslip({ lines: [line('social_employee', 765000), line('irg', 400000)] });
    const social = result.lignes.find((row) => row.kind === 'social_employee');
    assert.match(social.explication, /Retraite 6.75 %/);
    assert.match(social.explication, /15-236/);
    const irg = result.lignes.find((row) => row.kind === 'irg');
    assert.match(irg.explication, /DGI/);
  });
});

describe('P4-14 — ce que le décodeur signale, et comment il le dit', () => {
  test('un écart entre le net calculé et le net inscrit est signalé', () => {
    const result = decodePayslip({
      lines: [line('base_salary', 8000000), line('social_employee', 720000)],
      declaredNet: 7000000,
    });
    const check = result.controles.find((row) => row.key === 'net_mismatch');
    assert.ok(check);
    assert.equal(check.gap, 280000);
  });

  test('un net qui tombe juste ne déclenche rien', () => {
    const result = decodePayslip({
      lines: [line('base_salary', 8000000), line('social_employee', 720000)],
      declaredNet: 7280000,
    });
    assert.equal(result.controles.find((row) => row.key === 'net_mismatch'), undefined);
  });

  test('une cotisation salarié éloignée des 9 % est signalée comme un point à vérifier', () => {
    const result = decodePayslip({ lines: [line('base_salary', 10000000), line('social_employee', 300000)] });
    const check = result.controles.find((row) => row.key === 'social_rate');
    assert.ok(check);
    assert.equal(check.expected, 900000);
    // Le ton compte : « à vérifier », jamais « votre employeur s'est trompé ».
    assert.match(check.message, /à vérifier avec votre employeur/);
    assert.match(check.message, /L’assiette de cotisation n’est pas toujours le brut total/);
  });

  test('un écart d’arrondi d’un dinar ne fait pas de bruit', () => {
    // Les arrondis d'un logiciel de paie ne sont pas forcément les nôtres.
    const result = decodePayslip({ lines: [line('base_salary', 10000000), line('social_employee', 900050)] });
    assert.equal(result.controles.find((row) => row.key === 'social_rate'), undefined);
  });

  test('un brut sous le SNMG est signalé, avec son explication possible', () => {
    const result = decodePayslip({ lines: [line('base_salary', 1800000)] });
    const check = result.controles.find((row) => row.key === 'below_snmg');
    assert.ok(check);
    assert.match(check.message, /temps partiel/);
  });

  test('un IRG retenu sous le seuil d’exonération est signalé', () => {
    // Le seul régime que le document rend applicable sans ambiguïté.
    const result = decodePayslip({ lines: [line('base_salary', 2800000), line('irg', 50000)] });
    const check = result.controles.find((row) => row.key === 'irg_exempt');
    assert.ok(check);
    assert.match(check.message, /exonération totale/);
  });

  test('au-dessus du seuil, le décodeur nomme le régime mais ne calcule aucun IRG', () => {
    // La ligne de partage de toute la tâche : il explique, il ne recalcule pas.
    const result = decodePayslip({ lines: [line('base_salary', 12000000), line('irg', 1500000)] });
    assert.equal(result.regimeIrg.computable, false);
    assert.ok(result.regimeIrg.why);
    assert.equal(result.controles.find((row) => row.key === 'irg_exempt'), undefined);
    // Et aucun contrôle ne prétend connaître le bon montant.
    assert.ok(!result.controles.some((row) => row.key?.startsWith('irg_amount')));
  });

  test('une prime rappelle sa règle sans l’appliquer', () => {
    const result = decodePayslip({ lines: [line('base_salary', 8000000), line('bonus', 2000000)] });
    assert.equal(result.primes.rate, 0.1);
    assert.equal(result.primes.computable, false);
    assert.match(result.primes.reserve, /exemptions/);
  });

  test('chaque réponse porte les avertissements du décodeur', () => {
    const result = decodePayslip({ lines: [line('base_salary', 5000000)] });
    assert.match(result.avertissements.join(' '), /ne la recalcule pas et ne la certifie pas/);
  });
});
