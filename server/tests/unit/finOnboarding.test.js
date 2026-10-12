import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { STANDARD_CATEGORY_KEYS } from '../../src/constants/finCategories.js';
import { FIN_PUBLIC_CODES } from '../../src/constants/finPublics.js';
import {
  FICTIONAL_START,
  INCONSISTENCY_RATIO,
  ONBOARDING_QUESTIONS,
  ONBOARDING_QUESTION_KINDS,
  onboardingQuestionByKey,
  questionsForPublic,
} from '../../src/constants/finOnboarding.js';
import { completeness, firstResult, inconsistencies } from '../../src/services/finOnboarding.service.js';

// Progressive onboarding (P6-03): the question registry taken from the client's
// own screens, and the pure logic built on it.

const askedTo = (code) => questionsForPublic(code);

describe("the question registry follows the client's screens", () => {
  test('every question declares a known kind, a role and a screen of the client', () => {
    for (const question of ONBOARDING_QUESTIONS) {
      assert.equal(typeof question.role, 'string', `${question.key} has no role`);
      assert.ok(ONBOARDING_QUESTION_KINDS.includes(question.kind), `${question.key}: ${question.kind}`);
      assert.ok(['C03', 'LY01', 'ET01', 'SA01', 'EP01'].includes(question.screen), `${question.key}: ${question.screen}`);
      // The "Pourquoi cette question ?" the client requires on every question.
      assert.ok(question.why.length > 20, `${question.key} has no explanation`);
    }
  });

  test('a question points at a STANDARD category, never at an invented one', () => {
    const known = new Set(STANDARD_CATEGORY_KEYS);
    for (const question of ONBOARDING_QUESTIONS) {
      if (question.category) assert.ok(known.has(question.category), `${question.key} -> ${question.category}`);
      for (const option of question.options ?? []) {
        if (option.includes('.')) assert.ok(known.has(option), `${question.key} option ${option}`);
      }
    }
  });

  test('keys are unique and resolvable', () => {
    const keys = ONBOARDING_QUESTIONS.map((q) => q.key);
    assert.equal(new Set(keys).size, keys.length);
    assert.equal(onboardingQuestionByKey('resources').screen, 'C03');
    assert.equal(onboardingQuestionByKey('nope'), null);
  });

  test('every public is asked about everything the C03 socle covers', () => {
    // By ROLE, not by key: a dedicated screen REPLACES the socle question for
    // that public (SA01's "charges fixes" instead of C03's estimate), so the
    // subject is always covered but not always by the same question.
    const socleRoles = ONBOARDING_QUESTIONS.filter((q) => q.publics === null).map((q) => q.role);
    for (const code of FIN_PUBLIC_CODES) {
      const roles = new Set(askedTo(code).map((q) => q.role));
      for (const role of socleRoles) {
        // Debt and real patrimony are deliberately not covered for a lycéen.
        if (['debt', 'savings'].includes(role) && code === 'LYC') continue;
        assert.ok(roles.has(role), `${code} is asked nothing about ${role}`);
      }
    }
  });

  test('the same subject is never asked twice to the same public', () => {
    for (const code of [...FIN_PUBLIC_CODES, null]) {
      const roles = askedTo(code)
        .map((q) => q.role)
        // Several resources or several expense lines are legitimate: the client
        // itemises them. What must not repeat is a SOCLE role answered by both
        // the socle and a dedicated screen.
        .filter((role) => ['savings', 'debt', 'goal', 'goalAmount'].includes(role));
      assert.equal(new Set(roles).size, roles.length, `${code} is asked the same subject twice`);
    }
  });

  test("a salarié is asked SA01's fixed charges INSTEAD of C03's estimate", () => {
    const asked = askedTo('SAL').map((q) => q.key);
    assert.ok(asked.includes('fixedCharges'));
    assert.ok(!asked.includes('essentialExpenses'), 'the same money would be counted twice');
    assert.ok(asked.includes('liquidSavings'));
    assert.ok(!asked.includes('savings'));
  });

  test('an épargnant is asked about essential AND flexible spending — two different pots', () => {
    const asked = askedTo('EPG').map((q) => q.key);
    assert.ok(asked.includes('essentialExpenses'));
    assert.ok(asked.includes('flexibleExpenses'));
  });

  test('a lycéen is NEVER asked about debt NOR about real patrimony', () => {
    // The client's rule: « jamais de dette, de patrimoine réel ni d'offre de
    // crédit ». Available savings IS real patrimony.
    const asked = askedTo('LYC').map((q) => q.key);
    assert.ok(!asked.includes('debtPayment'));
    assert.ok(!asked.includes('savings'));
    assert.ok(!asked.includes('liquidSavings'));
    // ...and every other public is asked about debt.
    for (const code of FIN_PUBLIC_CODES.filter((c) => c !== 'LYC')) {
      assert.ok(askedTo(code).includes(onboardingQuestionByKey('debtPayment')), `${code} should be asked about debt`);
    }
  });

  test('an under-18 age bracket spares those questions whichever public was picked', () => {
    // A minor who chose "salarié" is still a minor: the gate is not only the
    // lycéen experience.
    const asMinor = questionsForPublic('SAL', { minor: true }).map((q) => q.key);
    assert.ok(!asMinor.includes('debtPayment'));
    assert.ok(!asMinor.includes('liquidSavings'));
    // And the rest of the screen is still asked: nothing else is taken away.
    assert.ok(asMinor.includes('netSalary'));
    assert.ok(asMinor.includes('fixedCharges'));
  });

  test('the dedicated screens only reach their own public', () => {
    for (const [screen, code] of [
      ['LY01', 'LYC'],
      ['ET01', 'ETU'],
      ['EP01', 'EPG'],
    ]) {
      const own = ONBOARDING_QUESTIONS.filter((q) => q.screen === screen);
      assert.ok(own.length > 0, screen);
      for (const question of own) assert.deepEqual(question.publics, [code]);
    }
  });

  test('someone with no public yet is still asked the socle, and nothing else', () => {
    const asked = askedTo(null);
    assert.ok(asked.length > 0);
    assert.ok(asked.every((question) => question.publics === null));
  });

  test("the fictional starter budget is the client's own figure, in centimes", () => {
    assert.deepEqual(FICTIONAL_START, { amount: 500000, currency: 'DZD' });
  });
});

describe('completeness', () => {
  const questions = askedTo('SAL');

  test('nothing answered is a ratio of 0, not null', () => {
    const level = completeness(questions, {});
    assert.equal(level.answered, 0);
    assert.equal(level.ratio, 0);
    assert.equal(level.remaining, questions.length);
  });

  test('a skipped question counts as dealt with but NOT as answered', () => {
    const level = completeness(questions, { netSalary: { amount: 100, frequency: 'mensuel' }, liquidSavings: { skipped: true } });
    assert.equal(level.answered, 1);
    assert.equal(level.skipped, 1);
    assert.equal(level.remaining, questions.length - 2);
  });

  test('no applicable question gives null rather than dividing by zero', () => {
    assert.equal(completeness([], {}).ratio, null);
  });
});

describe('an answer out of scale asks, it never blocks', () => {
  const questions = askedTo('SAL');

  test('a resource a hundred times the declared expenses is flagged', () => {
    const answers = {
      netSalary: { amount: 10000000000, frequency: 'mensuel' },
      fixedCharges: { amount: 1000, frequency: 'mensuel' },
    };
    const found = inconsistencies(questions, answers).map((item) => item.question);
    assert.ok(found.includes('netSalary'));
    assert.ok(found.includes('fixedCharges'));
  });

  test('a confirmed answer stops being asked about', () => {
    const answers = {
      netSalary: { amount: 10000000000, frequency: 'mensuel', confirmed: true },
      fixedCharges: { amount: 1000, frequency: 'mensuel', confirmed: true },
    };
    assert.deepEqual(inconsistencies(questions, answers), []);
  });

  test('ordinary answers are not flagged', () => {
    const answers = {
      netSalary: { amount: 6000000, frequency: 'mensuel' },
      fixedCharges: { amount: 2500000, frequency: 'mensuel' },
    };
    assert.deepEqual(inconsistencies(questions, answers), []);
  });

  test('the threshold is a ratio, and just under it passes', () => {
    const answers = {
      netSalary: { amount: 1000 * (INCONSISTENCY_RATIO - 1), frequency: 'mensuel' },
      fixedCharges: { amount: 1000, frequency: 'mensuel' },
    };
    assert.deepEqual(inconsistencies(questions, answers), []);
  });

  test('a skipped or zero answer is never flagged', () => {
    const answers = { netSalary: { skipped: true }, fixedCharges: { amount: 0, frequency: 'mensuel' } };
    assert.deepEqual(inconsistencies(questions, answers), []);
  });
});

describe('the first result', () => {
  const questions = askedTo('SAL');
  const now = new Date('2026-10-12T10:00:00Z');
  const build = (answers, fictional = false) => firstResult({ questions, answers, currency: 'DZD', fictional, now });

  test('resources are normalised to the month (F001) before being totalled', () => {
    // 1 200 000 centimes per quarter = 400 000 per month.
    const result = build({ netSalary: { amount: 1200000, frequency: 'trimestriel' } });
    assert.equal(result.revenus.resultat, 400000);
    assert.equal(result.revenus.formule_id, 'F002');
    assert.equal(result.revenus.unite, 'DZD');
  });

  test('nothing declared is "not computed", never zero', () => {
    const result = build({});
    assert.equal(result.revenus.resultat, null);
    assert.equal(result.depenses.resultat, null);
    assert.equal(result.fluxNet.resultat, null);
    // And the formula's own condition explains why, in the client's wording.
    assert.ok(result.revenus.avertissements.length > 0);
  });

  test('the first budget is resources minus essential expenses (F004)', () => {
    const result = build({
      netSalary: { amount: 6000000, frequency: 'mensuel' },
      fixedCharges: { amount: 2500000, frequency: 'mensuel' },
    });
    assert.equal(result.fluxNet.resultat, 3500000);
    assert.equal(result.fluxNet.formule_id, 'F004');
  });

  test('a skipped resource is simply not counted', () => {
    const result = build({ netSalary: { amount: 6000000, frequency: 'mensuel' }, otherIncome: { skipped: true } });
    assert.equal(result.revenus.resultat, 6000000);
  });

  test('the debt effort rate appears ONLY when an instalment was declared', () => {
    assert.equal(build({ netSalary: { amount: 6000000, frequency: 'mensuel' } }).tauxEffortDette, null);
    const result = build({ netSalary: { amount: 6000000, frequency: 'mensuel' }, debtPayment: { amount: 1200000 } });
    assert.equal(result.tauxEffortDette.formule_id, 'F018');
    // A DECIMAL rate, shown as a percentage by the interface (engine rule).
    assert.equal(result.tauxEffortDette.resultat, 0.2);
  });

  test('a declared instalment of zero is an answer, and is computed as one', () => {
    const result = build({ netSalary: { amount: 6000000, frequency: 'mensuel' }, debtPayment: { amount: 0 } });
    assert.equal(result.tauxEffortDette.resultat, 0);
  });

  test('a fictional onboarding says so on every figure it produces', () => {
    const result = build({ pocketMoney: { amount: 100000, frequency: 'mensuel' } }, true);
    for (const figure of [result.revenus, result.depenses, result.fluxNet]) {
      assert.ok(
        figure.avertissements.some((warning) => warning.includes('SIMULATION')),
        'every figure carries the badge',
      );
    }
    assert.equal(result.revenus.entrees_snapshot.fictif, true);
  });

  test('the main goal comes back with the client\'s own label', () => {
    const result = build({ mainGoal: { choice: 'goal.permis' }, goalAmount: { amount: 5000000 } });
    assert.deepEqual(result.objectif, { categorie: 'goal.permis', libelle: 'Permis', montant: 5000000 });
  });

  test('a goal with no target amount is not a goal with a target of zero', () => {
    const result = build({ mainGoal: { choice: 'goal.voyage' } });
    assert.equal(result.objectif.montant, null);
  });

  test('every figure carries its formula, its version and its date', () => {
    const result = build({ netSalary: { amount: 100000, frequency: 'mensuel' } });
    for (const figure of [result.revenus, result.depenses, result.fluxNet]) {
      assert.equal(typeof figure.formule_id, 'string');
      assert.equal(figure.formule_version, 1);
      assert.equal(figure.calcule_le, now.toISOString());
      assert.ok(figure.entrees_snapshot);
    }
  });
});
