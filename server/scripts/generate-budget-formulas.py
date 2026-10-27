# -*- coding: utf-8 -*-
# Génère server/src/constants/finBudgetFormulas.js depuis l'onglet
# `13_Formules` de FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx
# (P8-01 point 1, P8-04).
#
# Même méthode que les catégories, les parcours, le postal et le crédit :
# extrait, jamais retapé. Le client appelle cet onglet les « règles de calcul
# définitives » de la gestion budgétaire ; là où elles diffèrent d'une F, la
# PB-F prime (P8-01 point 1).
#
# CE QUI EST GÉNÉRÉ : identifiant, indicateur, règle et condition, mot pour mot.
#
# CE QUI EST DE NOUS : l'unité de chaque résultat (UNITS ci-dessous), parce que
# le contrat de réponse (P4-09) l'exige et que le classeur ne la donne pas en
# colonne. Elle se lit dans la règle elle-même (« × 100 » est un taux,
# « ceil(…) » un nombre de mois) ; ce n'est pas une règle métier.
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BOOK = os.path.join(ROOT, 'FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx')
OUT = os.path.join(ROOT, 'server', 'src', 'constants', 'finBudgetFormulas.js')

import importlib.util
spec = importlib.util.spec_from_file_location('read_xlsx', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'read-xlsx.py'))
read_xlsx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(read_xlsx)

# Les formules d'analyse AN-F001 à AN-F016 (P8-07, P8-10) viennent de
# l'onglet `24_Formules` du cahier consolidé, même méthode.
CONSOLIDATED = os.path.join(ROOT, 'FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx')

# `ratio` : un décimal affiché × 100 (convention du moteur, voir contract.js).
UNITS = {
    'AN-F003': 'ratio', 'AN-F004': 'ratio', 'AN-F005': 'ratio', 'AN-F006': 'ratio', 'AN-F007': 'ratio',
    'AN-F008': 'ratio', 'AN-F011': 'ratio', 'AN-F014': 'ratio', 'AN-F015': 'ratio', 'AN-F016': 'ratio',
    'AN-F012': 'composite',
    'PB-F010': 'ratio', 'PB-F014': 'ratio', 'PB-F020': 'ratio', 'PB-F023': 'ratio',
    'PB-F016': 'months', 'PB-F018': 'months',
    'PB-F021': 'date',
    'PB-F026': 'count',
}

rows = read_xlsx.read_workbook(BOOK)['13_Formules']
header_index = next(i for i, row in enumerate(rows) if row and row[0] == 'ID')

formulas = []
for row in rows[header_index + 1:]:
    if not row or not row[0].startswith('PB-F'):
        continue
    cells = [(cell or '').strip() for cell in row] + [''] * 4
    formulas.append({
        'id': cells[0],
        'unit': UNITS.get(cells[0], 'money'),
        'version': 1,
        'label': cells[1],
        'rule': cells[2],
        'condition': cells[3] or '—',
    })

assert len(formulas) == 27, '%d formules lues, 27 attendues' % len(formulas)

rows = read_xlsx.read_workbook(CONSOLIDATED)['24_Formules']
analysis = []
for row in rows:
    if not row or not (row[0] or '').startswith('AN-F'):
        continue
    cells = [(cell or '').strip() for cell in row] + [''] * 4
    analysis.append({'id': cells[0], 'unit': UNITS.get(cells[0], 'money'), 'version': 1, 'label': cells[1], 'rule': cells[2], 'condition': cells[3] or '—'})
assert len(analysis) == 16, "%d formules d'analyse lues, 16 attendues" % len(analysis)
formulas += analysis

content = '''// Formules de la gestion budgétaire personnelle (P8-01 point 1) et formules
// d'analyse AN-F001 à AN-F016 (onglet `24_Formules` du consolidé) — GÉNÉRÉ par
// scripts/generate-budget-formulas.py depuis l'onglet `13_Formules` de
// FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx.
// Ne pas modifier à la main : relancer le script.
//
// Les « règles de calcul définitives » du client. Là où une PB-F recouvre une
// F du premier cahier, la PB-F prime. Seule l'unité est de nous : le contrat
// de réponse l'exige et le classeur ne la donne pas en colonne.

export const BUDGET_FORMULAS = %s;

export const budgetFormulaById = (id) => BUDGET_FORMULAS.find((formula) => formula.id === id) ?? null;
''' % json.dumps(formulas, ensure_ascii=False, indent=2)

io.open(OUT, 'w', encoding='utf-8', newline='\n').write(content)
print('%s : %d formules (PB-F et AN-F)' % (os.path.relpath(OUT, ROOT), len(formulas)))
