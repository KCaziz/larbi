# -*- coding: utf-8 -*-
# Génère server/src/constants/finCollectiveFormulas.js depuis les onglets
# `13_Formules_Algo` et `13B_Algorithmes` de
# FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx (P9-11).
#
# Même méthode que les autres catalogues : extrait, jamais retapé.
#
# CE QUI EST GÉNÉRÉ : identifiant, indicateur, règle et condition, mot pour mot.
#
# CE QUI EST DE NOUS : l'unité de chaque résultat (UNITS) et la table des
# correspondances avec les formules du premier cahier (EQUIVALENTS). Les
# correspondances sont celles que la tâche P9-11 publie : une formule déjà
# écrite n'est pas écrite deux fois.
import importlib.util
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BOOK = os.path.join(ROOT, 'FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx')
OUT = os.path.join(ROOT, 'server', 'src', 'constants', 'finCollectiveFormulas.js')

spec = importlib.util.spec_from_file_location('read_xlsx', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'read-xlsx.py'))
read_xlsx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(read_xlsx)

# `ratio` : un décimal affiché × 100 (convention du moteur, voir contract.js).
UNITS = {'COL-F07': 'ratio', 'COL-F10': 'ratio', 'COL-F11': 'ratio', 'COL-F12': 'ratio', 'COL-F13': 'composite'}

# Formule collective -> formule déjà écrite qui fait le même calcul.
EQUIVALENTS = {
    'COL-F01': 'F041',
    'COL-F04': 'F042',
    'COL-F05': 'F043',
    'COL-F09': 'F045',
    'COL-F10': 'F025 / F026',
    'ALG-C01': 'ALG-02',
    'ALG-C03': 'P6-14 (arrondi au plus grand reste)',
}

book = read_xlsx.read_workbook(BOOK)


def read(sheet, prefix, expected, with_condition):
    out = []
    for row in book[sheet]:
        if not row or not (row[0] or '').startswith(prefix):
            continue
        cells = [(cell or '').strip() for cell in row] + [''] * 4
        item = {'id': cells[0], 'version': 1, 'label': cells[1], 'rule': cells[2]}
        if with_condition:
            item['unit'] = UNITS.get(cells[0], 'money')
            item['condition'] = cells[3] or '—'
        if cells[0] in EQUIVALENTS:
            item['equivalent'] = EQUIVALENTS[cells[0]]
        out.append(item)
    assert len(out) == expected, '%s : %d lues, %d attendues' % (sheet, len(out), expected)
    return out


formulas = read('13_Formules_Algo', 'COL-F', 13, True)
algorithms = read('13B_Algorithmes', 'ALG-C', 4, False)

content = '''// Formules et algorithmes de la gestion commune (P9-11) — GÉNÉRÉ par
// scripts/generate-collective-formulas.py depuis les onglets `13_Formules_Algo`
// et `13B_Algorithmes` de FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx.
// Ne pas modifier à la main : relancer le script.
//
// `equivalent` : la formule déjà écrite qui fait le même calcul (F041 à F045,
// ALG-02, P6-14). Elle n'est pas écrite deux fois : le moteur sait répondre
// sous les deux identifiants, et l'identifiant collectif est celui que la
// gestion commune expose.

export const COLLECTIVE_FORMULAS = %s;

export const COLLECTIVE_ALGORITHMS = %s;

export const collectiveFormulaById = (id) => COLLECTIVE_FORMULAS.find((formula) => formula.id === id) ?? null;
export const collectiveAlgorithmById = (id) => COLLECTIVE_ALGORITHMS.find((algorithm) => algorithm.id === id) ?? null;
''' % (json.dumps(formulas, ensure_ascii=False, indent=2), json.dumps(algorithms, ensure_ascii=False, indent=2))

io.open(OUT, 'w', encoding='utf-8', newline='\n').write(content)
print('%s : %d formules, %d algorithmes' % (os.path.relpath(OUT, ROOT), len(formulas), len(algorithms)))
