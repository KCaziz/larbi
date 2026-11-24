import '../helpers/setup-env.js';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { monthlyIrg } from '../../src/services/finPayrollEngine.js';
import { IRG_MONTHLY_SCALE, IRG_RULES } from '../../src/constants/finEmployerRules.js';

// P13-05, lot G, second part (2026-11-24): payroll and accounting on default
// rules — the rules that matter most. Amounts in centimes.

let t;
before(async () => {
  t = await boot();
});
beforeEach(() => t.reset());
after(() => t.close());

const DA = (n) => n * 100;

async function setUp() {
  const owner = await t.adult();
  const created = await t.request('POST', '/fin/entreprise', { user: owner, json: { name: 'Atelier', currency: 'DZD', publicKey: 'PUB-06' } });
  const as = { 'X-Organisation': created.body.entreprise.id };
  const call = (method, path, json, user = owner) => t.request(method, `/fin/entreprise${path}`, { user, headers: as, json });
  const hr = await t.adult();
  const invited = await call('POST', '/membres', { email: hr.email, role: 'hr_manager' });
  await t.request('POST', `/fin/entreprise/invitations/${invited.body.membre.id}/accepter`, { user: hr });
  return { owner, hr, call };
}

describe('payroll and accounting on default rules', () => {
  test('the default IRG scale is continuous at its two thresholds', () => {
    const irg = { scale: IRG_MONTHLY_SCALE, ...IRG_RULES };
    assert.equal(monthlyIrg(DA(30000), irg), 0);
    assert.equal(monthlyIrg(DA(40000), irg), DA(3100));
    assert.ok(Math.abs(monthlyIrg(DA(35000), irg) - monthlyIrg(DA(35010), irg)) < DA(5), 'no jump at 35 000 DA');
  });

  test('a run is validated by another person, then proposes its entry; the entry balances and the balance closes', async () => {
    const { hr, call } = await setUp();
    const employee = (await call('POST', '/personnel', { fullName: 'Nadia B.', position: 'Comptable', contract: 'cdi', startedAt: '2020-01-01T00:00:00.000Z' })).body.salarie;
    const set = await call('PUT', `/paie/salaries/${employee.id}`, { baseSalary: DA(50000) }, undefined);
    assert.equal(set.status, 200, JSON.stringify(set.body));

    const run = (await call('POST', '/paie/lots', { period: '2026-10' })).body.lot;
    const view = (await call('GET', `/paie/lots/${run.id}`)).body.lot;
    assert.equal(view.provisional, true, 'default rules: provisional');
    assert.equal(view.slips[0].gross, DA(50000));
    assert.equal(view.slips[0].employeeContrib, DA(4500));
    assert.equal((await call('POST', `/paie/lots/${run.id}/valider`)).body.error.details.reason, 'secondPersonRequired');
    assert.equal((await call('POST', `/paie/lots/${run.id}/valider`, {}, hr)).status, 200);

    assert.equal((await call('POST', '/compta/propositions')).body.creees, 1);
    assert.equal((await call('POST', '/compta/propositions')).body.creees, 0, 'one event, one entry');
    const [entry] = (await call('GET', '/compta/ecritures')).body.ecritures;
    assert.equal(entry.journal, 'PA');
    assert.equal(entry.balanced, true);
    assert.equal((await call('POST', `/compta/ecritures/${entry.id}/valider`)).status, 200);

    const ledger = (await call('GET', '/compta')).body;
    assert.equal(ledger.balance.totaux.ecart, 0);
    assert.equal(ledger.etats.resultat.charges, view.slips[0].employerCost);
    assert.equal((await call('POST', '/compta/periodes/2026-10/cloturer', {})).status, 200);
    const late = await call('POST', '/compta/ecritures', { journal: 'OD', date: '2026-10-15', label: 'Tard', lines: [{ account: '512', debit: 100 }, { account: '530', credit: 100 }] });
    assert.equal(late.body.error.details.reason, 'periodClosed');
  });

  test('an import is checked line by line before anything is written', async () => {
    const { call } = await setUp();
    const bad = 'journal;piece;date;compte;libelle;debit;credit\nVT;F1;2026-11-02;411;Facture;119;\nVT;F1;2026-11-02;999;Facture;;100\n';
    const report = (await call('POST', '/compta/import', { content: bad })).body.rapport;
    assert.equal(report.valide, false);
    assert.deepEqual(
      report.rejets.map((r) => r.reason),
      ['account', 'unbalanced'],
    );
    assert.equal((await call('GET', '/compta/ecritures')).body.ecritures.length, 0, 'nothing written');
    const good = 'journal;piece;date;compte;libelle;debit;credit\nVT;F1;02/11/2026;411;Facture;119;\nVT;F1;02/11/2026;700;Facture;;100\nVT;F1;02/11/2026;4457;Facture;;19\n';
    const done = (await call('POST', '/compta/import', { content: good, apply: true })).body.rapport;
    assert.equal(done.creees, 1);
    assert.equal((await call('POST', '/compta/import', { content: good, apply: true })).body.rapport.creees, 0, 'not twice');
  });

  test('lot H: depreciation, bank matching and the fiscal year closing carry the balances forward', async () => {
    const { call } = await setUp();
    const asset = (await call('POST', '/compta/immobilisations', { label: 'Machine', category: 'equipment', acquiredAt: '2025-07-01', cost: DA(600000) })).body.immobilisation;
    assert.equal(asset.durationMonths, 60);
    // Capital in the bank, the machine paid by bank, both validated.
    const capital = (await call('POST', '/compta/ecritures', { journal: 'BQ', date: '2025-07-01', label: 'Apport', lines: [{ account: '512', debit: DA(1000000) }, { account: '101', credit: DA(1000000) }] })).body.ecriture;
    const machine = (await call('POST', '/compta/ecritures', { journal: 'BQ', date: '2025-07-02', label: 'Machine', lines: [{ account: '215', debit: DA(600000) }, { account: '512', credit: DA(600000) }] })).body.ecriture;
    for (const e of [capital, machine]) assert.equal((await call('POST', `/compta/ecritures/${e.id}/valider`)).status, 200);
    // 6 months of 2025 out of 60: 60 000 DA.
    assert.equal((await call('POST', '/compta/dotations/2025')).body.creees, 1);
    const [dep] = (await call('GET', '/compta/ecritures?status=draft')).body.ecritures;
    assert.equal(dep.debit, DA(60000));
    await call('POST', `/compta/ecritures/${dep.id}/valider`);

    const statement = 'date;libelle;montant\n2025-07-01;Versement;1000000\n2025-07-03;Cheque 12;-600000\n2025-07-05;Frais;-500\n';
    const imported = (await call('POST', '/compta/banque/releve', { account: '512', content: statement })).body;
    assert.equal(imported.importees, 3);
    assert.equal(imported.pointees, 2, 'the bank fees have no entry');

    const closed = await call('POST', '/compta/exercices/2025/cloturer');
    assert.equal(closed.status, 200, JSON.stringify(closed.body));
    assert.equal(closed.body.exercice.result, -DA(60000));
    const next = (await call('GET', '/compta?from=2026-01-01&to=2026-12-31')).body;
    assert.equal(next.balance.totaux.ecart, 0);
    assert.equal(next.etats.bilan.ecart, 0, 'the balance sheet balances');
    assert.equal(next.etats.bilan.actif.immoCorporelles, DA(540000));
    assert.equal(next.etats.resultat.resultat, 0, 'a new year starts at zero');
    const late = await call('POST', '/compta/ecritures', { journal: 'OD', date: '2025-12-31', label: 'Tard', lines: [{ account: '512', debit: 100 }, { account: '530', credit: 100 }] });
    assert.equal(late.body.error.details.reason, 'periodClosed');
  });

  test('lot H: a non-monthly bonus is taxed apart at 10 %; approved overtime enters the payroll', async () => {
    const { hr, call } = await setUp();
    const employee = (await call('POST', '/personnel', { fullName: 'Karim A.', position: 'Technicien', contract: 'cdi', startedAt: '2020-01-01T00:00:00.000Z' })).body.salarie;
    await call('PUT', `/paie/salaries/${employee.id}`, { baseSalary: DA(51999) });
    const sheet = (await call('POST', `/rh/salaries/${employee.id}/temps`, { workedOn: '2026-09-10', hours: 10, overtimeHours: 2 })).body.temps;
    assert.equal((await call('POST', `/rh/salaries/${employee.id}/temps/${sheet.id}/approuver`)).body.error.details.reason, 'secondPersonRequired');
    await call('POST', `/rh/salaries/${employee.id}/temps/${sheet.id}/approuver`, {}, hr);
    const run = (await call('POST', '/paie/lots', { period: '2026-09' })).body.lot;
    const slip = (await call('GET', `/paie/lots/${run.id}`)).body.lot.slips[0];
    // 51 999 / 173.33 × 1.5 × 2 h
    assert.equal(slip.overtime, Math.round((DA(51999) / 173.33) * 1.5 * 2));
    const updated = (await call('PUT', `/paie/lots/${run.id}/bulletins/${slip.id}`, { irregularBonuses: DA(10000) })).body.bulletin;
    assert.equal(updated.irgIrregular, DA(910), '(10 000 - 9 %) × 10 %');
  });
});
