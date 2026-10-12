import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Progressive onboarding (P6-03) through the real API and database: the
// questions of the account's public, skipping, the first result, the fictional
// budget of a lycéen, and the inconsistency that asks instead of blocking.

let t;

before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

// A user with a FINCLUDIA public, reloaded so the session carries it.
async function withPublic(finPublic) {
  const created = await t.user();
  await t.prisma.user.update({ where: { id: created.id }, data: { finPublic, finCurrency: 'DZD' } });
  return t.prisma.user.findUnique({ where: { id: created.id } });
}

const state = (user) => t.request('GET', '/fin/onboarding', { user });
const save = (user, json) => t.request('PUT', '/fin/onboarding', { user, json });
const keysOf = (body) => body.questions.map((question) => question.key);

describe('the questions asked', () => {
  test('a session is required: nothing financial is asked of nobody', async () => {
    assert.equal((await t.request('GET', '/fin/onboarding')).status, 401);
    assert.equal((await t.request('PUT', '/fin/onboarding', { json: { answers: {} } })).status, 401);
  });

  test('each question comes with its own "Pourquoi cette question ?"', async () => {
    const res = await state(await withPublic('SAL'));
    assert.equal(res.status, 200);
    assert.ok(res.body.questions.length > 0);
    for (const question of res.body.questions) {
      assert.ok(question.why.length > 20, `${question.key} has no explanation`);
      assert.equal(question.answer, null, 'nothing answered yet');
    }
  });

  test('a lycéen is never asked about debt, and an étudiant gets its own screen', async () => {
    assert.ok(!keysOf((await state(await withPublic('LYC'))).body).includes('debtPayment'));
    const student = keysOf((await state(await withPublic('ETU'))).body);
    assert.ok(student.includes('grant'), 'ET01 bourse');
    assert.ok(student.includes('debtPayment'));
  });

  test('someone with no public yet still gets the common socle', async () => {
    const res = await state(await t.user());
    assert.ok(keysOf(res.body).includes('resources'));
    assert.ok(!keysOf(res.body).includes('grant'), 'no dedicated screen without a public');
  });

  test('an under-18 bracket is spared debt and patrimony, whichever public was picked', async () => {
    const created = await t.user();
    await t.prisma.user.update({ where: { id: created.id }, data: { finPublic: 'SAL', finAgeRange: 'under18', finCurrency: 'DZD' } });
    const minor = await t.prisma.user.findUnique({ where: { id: created.id } });

    const asked = keysOf((await state(minor)).body);
    assert.ok(!asked.includes('debtPayment'));
    assert.ok(!asked.includes('liquidSavings'), 'available savings is real patrimony');
    assert.ok(asked.includes('netSalary'), 'the rest of the screen is untouched');

    // And the server REFUSES the answer, it does not merely hide the field.
    const res = await save(minor, { answers: { debtPayment: { amount: 100000 } } });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.error.details, { reason: 'notAsked', question: 'debtPayment' });
  });

  test('a question this public is NOT asked is refused by the server, not just hidden', async () => {
    const minor = await withPublic('LYC');
    const res = await save(minor, { answers: { debtPayment: { amount: 100000 } } });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.error.details, { reason: 'notAsked', question: 'debtPayment' });
    assert.equal(await t.prisma.finOnboarding.count(), 0, 'nothing was written');
  });

  test('a question nobody declared is refused', async () => {
    const user = await withPublic('SAL');
    assert.equal((await save(user, { answers: { inventedQuestion: { amount: 1 } } })).status, 400);
  });
});

describe('answering', () => {
  test('a partial batch is saved and answered with the whole new state', async () => {
    const user = await withPublic('SAL');
    const res = await save(user, { answers: { netSalary: { amount: 6000000, frequency: 'mensuel' } } });
    assert.equal(res.status, 200);
    assert.equal(res.body.completeness.answered, 1);
    assert.equal(res.body.result.revenus.resultat, 6000000);
    // The question now carries its own answer, so the form can be re-seeded.
    assert.deepEqual(
      res.body.questions.find((question) => question.key === 'netSalary').answer,
      { amount: 6000000, frequency: 'mensuel' },
    );
  });

  test('a resource becomes a real row of the resources table, corrected not duplicated', async () => {
    const user = await withPublic('ETU');
    await save(user, { answers: { grant: { amount: 1200000, frequency: 'trimestriel' } } });
    const rows = await t.prisma.finIncome.findMany({ where: { userId: user.id } });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].label, 'Bourse', "the client's own category label");
    assert.equal(rows[0].frequency, 'trimestriel');
    assert.equal(rows[0].sourceRef, 'onboarding:grant', 'traceable to the question it came from');
    assert.ok(rows[0].categoryId, 'attached to the standard category');

    await save(user, { answers: { grant: { amount: 1500000, frequency: 'trimestriel' } } });
    const after = await t.prisma.finIncome.findMany({ where: { userId: user.id } });
    assert.equal(after.length, 1, 'corrected, not duplicated');
    assert.equal(after[0].value, 1500000);
    assert.equal(after[0].version, 2);
  });

  test('a resource with no frequency is refused — the client\'s own error case', async () => {
    const user = await withPublic('ETU');
    const res = await save(user, { answers: { grant: { amount: 1200000 } } });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.error.details, { reason: 'frequency', question: 'grant' });
  });

  test('an estimated expense defaults to monthly, which is how the question is worded', async () => {
    const user = await withPublic('SAL');
    const res = await save(user, { answers: { fixedCharges: { amount: 2500000 } } });
    assert.equal(res.status, 200);
    assert.equal(res.body.result.depenses.resultat, 2500000);
  });

  test('« Passer » is recorded AS skipped, not as a question nobody reached', async () => {
    const user = await withPublic('SAL');
    // A salarié is asked SA01's « épargne liquide », not C03's estimate.
    const res = await save(user, { answers: { liquidSavings: { skipped: true } } });
    assert.equal(res.body.completeness.skipped, 1);
    assert.equal(res.body.completeness.answered, 0);
    assert.deepEqual(res.body.questions.find((question) => question.key === 'liquidSavings').answer, { skipped: true });
  });

  test('zero is an answer, not an empty field', async () => {
    const user = await withPublic('SAL');
    const res = await save(user, { answers: { liquidSavings: { amount: 0 } } });
    assert.equal(res.body.completeness.answered, 1);
    assert.equal(res.body.result.epargneDisponible, 0);
  });

  test('a float amount and a negative one are refused', async () => {
    const user = await withPublic('SAL');
    assert.equal((await save(user, { answers: { liquidSavings: { amount: 1500.5 } } })).status, 400);
    assert.equal((await save(user, { answers: { liquidSavings: { amount: -100 } } })).status, 400);
  });

  test('a choice must be one of the options the server offered', async () => {
    const user = await withPublic('SAL');
    assert.equal((await save(user, { answers: { mainGoal: { choice: 'goal.permis' } } })).status, 200);
    const refused = await save(user, { answers: { mainGoal: { choice: 'goal.licorne' } } });
    assert.equal(refused.status, 422);
    assert.deepEqual(refused.body.error.details, { reason: 'choice', question: 'mainGoal' });
  });

  test('an empty body is refused rather than written', async () => {
    const user = await withPublic('SAL');
    assert.equal((await save(user, {})).status, 400);
  });

  test('every change leaves a journal entry', async () => {
    const user = await withPublic('SAL');
    await save(user, { answers: { netSalary: { amount: 6000000, frequency: 'mensuel' } } });
    await save(user, { answers: { fixedCharges: { amount: 2000000 } } });
    const trail = await t.prisma.finChange.findMany({ where: { userId: user.id, entity: 'onboarding' }, orderBy: { createdAt: 'asc' } });
    assert.deepEqual(
      trail.map((change) => change.action),
      ['create', 'correct'],
    );
  });
});

describe('the first result', () => {
  test('the first budget is resources minus essential expenses, through the engine', async () => {
    const user = await withPublic('SAL');
    const res = await save(user, {
      answers: { netSalary: { amount: 6000000, frequency: 'mensuel' }, fixedCharges: { amount: 2500000, frequency: 'mensuel' } },
    });
    const result = res.body.result;
    assert.equal(result.fluxNet.resultat, 3500000);
    assert.equal(result.fluxNet.formule_id, 'F004');
    assert.equal(result.fluxNet.formule_version, 1);
    assert.equal(result.fluxNet.unite, 'DZD');
    assert.ok(result.fluxNet.calcule_le);
  });

  test('nothing answered is "not computed", never zero', async () => {
    const res = await state(await withPublic('SAL'));
    assert.equal(res.body.result.revenus.resultat, null);
    assert.equal(res.body.result.fluxNet.resultat, null);
  });

  test('the debt effort rate appears only once an instalment is declared', async () => {
    const user = await withPublic('SAL');
    const without = await save(user, { answers: { netSalary: { amount: 6000000, frequency: 'mensuel' } } });
    assert.equal(without.body.result.tauxEffortDette, null);
    const with_ = await save(user, { answers: { debtPayment: { amount: 1200000 } } });
    assert.equal(with_.body.result.tauxEffortDette.resultat, 0.2);
    assert.equal(with_.body.result.tauxEffortDette.formule_id, 'F018');
  });

  test('the state publishes the formulas, in the client\'s wording', async () => {
    const res = await state(await withPublic('SAL'));
    assert.deepEqual(
      res.body.formulas.map((formula) => formula.id),
      ['F002', 'F003', 'F004', 'F018'],
    );
    assert.equal(res.body.formulas[0].label, 'Total revenus');
  });
});

describe('an inconsistency asks, it never blocks', () => {
  test('an answer out of scale is SAVED and flagged for confirmation', async () => {
    const user = await withPublic('SAL');
    const res = await save(user, {
      answers: { netSalary: { amount: 10000000000, frequency: 'mensuel' }, fixedCharges: { amount: 1000, frequency: 'mensuel' } },
    });
    assert.equal(res.status, 200, 'never refused');
    assert.ok(res.body.confirmations.some((item) => item.question === 'netSalary'));
    assert.equal(res.body.result.revenus.resultat, 10000000000, 'the answer was kept');
  });

  test('confirming it clears the question', async () => {
    const user = await withPublic('SAL');
    await save(user, { answers: { netSalary: { amount: 10000000000, frequency: 'mensuel' }, fixedCharges: { amount: 1000, frequency: 'mensuel' } } });
    const res = await save(user, {
      answers: { netSalary: { amount: 10000000000, frequency: 'mensuel', confirmed: true }, fixedCharges: { amount: 1000, frequency: 'mensuel', confirmed: true } },
    });
    assert.deepEqual(res.body.confirmations, []);
  });
});

describe('the fictional budget of a lycéen', () => {
  test('it is OFFERED to a lycéen, and to nobody else', async () => {
    const minor = await state(await withPublic('LYC'));
    assert.deepEqual(minor.body.fictionalOffer, { amount: 500000, currency: 'DZD' });
    assert.equal((await state(await withPublic('SAL'))).body.fictionalOffer, null);
  });

  test('accepting it makes every figure fictional and adds the starting balance', async () => {
    const user = await withPublic('LYC');
    const res = await save(user, { fictional: true });
    assert.equal(res.status, 200);
    assert.equal(res.body.fictional, true);
    assert.equal(res.body.fictionalOffer, null, 'no longer offered once taken');
    for (const figure of [res.body.result.revenus, res.body.result.depenses, res.body.result.fluxNet]) {
      assert.ok(figure.avertissements.some((warning) => warning.includes('SIMULATION')));
    }
    const movements = await t.prisma.finTransaction.findMany({ where: { userId: user.id } });
    assert.equal(movements.length, 1);
    assert.equal(movements[0].value, 500000);
    assert.equal(movements[0].status, 'fictional', 'never added to a real total');
  });

  test('the starting balance is added once, not on every save', async () => {
    const user = await withPublic('LYC');
    await save(user, { fictional: true });
    await save(user, { answers: { pocketMoney: { amount: 100000, frequency: 'mensuel' } } });
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: user.id } }), 1);
  });

  test('a resource declared in fictional mode is fictional too', async () => {
    const user = await withPublic('LYC');
    await save(user, { fictional: true, answers: { pocketMoney: { amount: 100000, frequency: 'mensuel' } } });
    const rows = await t.prisma.finIncome.findMany({ where: { userId: user.id } });
    assert.equal(rows[0].status, 'fictional');
  });

  test('another public cannot take it: it is not a way of keeping two sets of books', async () => {
    const user = await withPublic('SAL');
    const res = await save(user, { fictional: true });
    assert.equal(res.status, 422);
    assert.deepEqual(res.body.error.details, { reason: 'fictionalNotOffered' });
  });

  test('the fictional onboarding row carries the fictional status', async () => {
    const user = await withPublic('LYC');
    await save(user, { fictional: true });
    const row = await t.prisma.finOnboarding.findFirst({ where: { userId: user.id } });
    assert.equal(row.status, 'fictional');
  });
});

describe('finishing', () => {
  test('it can be finished at ANY completeness: the client lets someone leave it half-done', async () => {
    const user = await withPublic('SAL');
    await save(user, { answers: { netSalary: { amount: 100000, frequency: 'mensuel' } } });
    const res = await t.request('POST', '/fin/onboarding/terminer', { user, json: {} });
    assert.equal(res.status, 200);
    assert.ok(res.body.completedAt);
    assert.ok(res.body.completeness.remaining > 0, 'and questions are still open');
  });

  test('finishing twice keeps the first date', async () => {
    const user = await withPublic('SAL');
    await save(user, { answers: { netSalary: { amount: 100000, frequency: 'mensuel' } } });
    const first = (await t.request('POST', '/fin/onboarding/terminer', { user, json: {} })).body.completedAt;
    const second = (await t.request('POST', '/fin/onboarding/terminer', { user, json: {} })).body.completedAt;
    assert.equal(first, second);
  });

  test('finishing before starting is a 404, not a silent success', async () => {
    const user = await withPublic('SAL');
    assert.equal((await t.request('POST', '/fin/onboarding/terminer', { user, json: {} })).status, 404);
  });

  test('answering again after finishing still works', async () => {
    const user = await withPublic('SAL');
    await save(user, { answers: { netSalary: { amount: 100000, frequency: 'mensuel' } } });
    await t.request('POST', '/fin/onboarding/terminer', { user, json: {} });
    const res = await save(user, { answers: { liquidSavings: { amount: 500000 } } });
    assert.equal(res.status, 200);
    assert.ok(res.body.completedAt, 'still finished');
    assert.equal(res.body.completeness.answered, 2);
  });
});
