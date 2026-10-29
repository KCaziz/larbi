import '../helpers/setup-env.js';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SERVER_DIR } from '../helpers/env.js';
import { EXCLUDED_CALCULATORS, TOOL_FAMILIES, TOOLS_CATALOGUE, toolsCatalogue } from '../../src/constants/finToolsCatalogue.js';
import { SIMULATOR_KEYS } from '../../src/constants/simulators.js';

// P8-15: the single catalogue of the Tools holds every calculator the client
// lists, and each one opens somewhere real.

const ROOT = path.resolve(SERVER_DIR, '..');

// The codes of tab 23_Calculateurs (consolidated cahier) and of tab
// 12_Calculateurs (last file), copied from the client's workbooks.
const CLIENT_CODES = [
  ...Array.from({ length: 19 }, (_, i) => `CAL-${String(i + 1).padStart(2, '0')}`),
  'CAL-21', 'CAL-24', 'CAL-25', 'CAL-26', 'CAL-27', 'CAL-28', 'CAL-29', 'CAL-30',
  ...Array.from({ length: 5 }, (_, i) => `CAL-V7-0${i + 1}`),
  ...Array.from({ length: 17 }, (_, i) => `CAL-P${String(i + 1).padStart(2, '0')}`),
];

describe('the tools catalogue (P8-15)', () => {
  test('every calculator of the client is listed, or excluded with its reason', () => {
    const listed = new Set(TOOLS_CATALOGUE.map((tool) => tool.code));
    const missing = CLIENT_CODES.filter((code) => !listed.has(code) && !EXCLUDED_CALCULATORS[code]);
    assert.deepEqual(missing, []);
    assert.deepEqual(Object.keys(EXCLUDED_CALCULATORS).filter((code) => listed.has(code)), [], 'excluded yet listed');
  });

  test('codes are unique and families are declared', () => {
    const codes = TOOLS_CATALOGUE.map((tool) => tool.code);
    assert.equal(new Set(codes).size, codes.length);
    assert.deepEqual(TOOLS_CATALOGUE.filter((tool) => !TOOL_FAMILIES.includes(tool.family)).map((tool) => tool.code), []);
  });

  test('every entry opens a real simulator or a real screen of the application, or names its open task', () => {
    const router = readFileSync(path.join(ROOT, 'client/src/router/index.jsx'), 'utf8');
    const appRoutes = new Set([...router.matchAll(/path: '([^']+)'/g)].map((m) => `/${m[1]}`));
    const tasks = readFileSync(path.join(ROOT, 'TASKS.md'), 'utf8');
    const bad = [];
    for (const tool of TOOLS_CATALOGUE) {
      if (tool.simulator && !SIMULATOR_KEYS.includes(tool.simulator)) bad.push(`${tool.code}: unknown simulator ${tool.simulator}`);
      if (tool.to && !appRoutes.has(tool.to)) bad.push(`${tool.code}: no route ${tool.to}`);
      if (!tool.to && !tool.simulator && !tool.pending) bad.push(`${tool.code}: opens nothing`);
      if (tool.pending) {
        const status = tasks.match(new RegExp(`### ${tool.pending} [^\\n]*\\n- Statut : \`([^\`]+)\``))?.[1];
        if (!status || status.includes('done')) bad.push(`${tool.code}: pending on ${tool.pending}, which is not open`);
      }
    }
    assert.deepEqual(bad, []);
  });

  test('every simulator of the application is in the catalogue', () => {
    const inCatalogue = new Set(TOOLS_CATALOGUE.map((tool) => tool.simulator).filter(Boolean));
    assert.deepEqual(SIMULATOR_KEYS.filter((key) => !inCatalogue.has(key)), []);
  });

  test('the served catalogue keeps the shape the screen reads', () => {
    const { familles, outils } = toolsCatalogue();
    assert.deepEqual(familles, TOOL_FAMILIES);
    assert.equal(outils.length, TOOLS_CATALOGUE.length);
    const credit = outils.find((tool) => tool.code === 'CAL-25');
    assert.equal(credit.label, 'Comparer un financement', 'JA09, named so in the catalogue');
    assert.equal(outils.find((tool) => tool.code === 'CAL-01').simulator, '/outils/simulateurs/budget-mensuel');
  });
});
