# -*- coding: utf-8 -*-
# Génère server/src/constants/finBudgetMethods.js depuis les onglets
# `12_Methodes_Budget` et `12B_Mapping_Methodes` du cahier consolidé (P8-09).
#
# Extrait, jamais retapé : méthodes, poches, cibles et rattachement des
# catégories, mot pour mot.
#
# CE QUI EST DE NOUS : la poche PAR DÉFAUT des lignes que le client marque
# « Configurable » ou ne cite pas, lue ainsi et toujours modifiable par
# l'utilisateur (« le mapping est éditable et doit être visible ») :
#   - « Besoins essentiels ou investissement personnel » → besoins (la
#     première poche nommée) ;
#   - « Besoins ou envies selon sous-catégorie » → selon le drapeau
#     « Essentielle ? » de la sous-catégorie ;
#   - « Envies / projets » → envies ; « Besoins minimum … » → besoins ;
#   - « Personnalisé », « À classer » → à classer ;
#   - un groupe que l'onglet ne cite pas → selon le drapeau « Essentielle ? ».
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BOOK = os.path.join(ROOT, 'FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx')
OUT = os.path.join(ROOT, 'server', 'src', 'constants', 'finBudgetMethods.js')

import importlib.util
spec = importlib.util.spec_from_file_location('read_xlsx', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'read-xlsx.py'))
read_xlsx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(read_xlsx)

sheets = read_xlsx.read_workbook(BOOK)

methods = []
for row in sheets['12_Methodes_Budget']:
    if not row or not (row[0] or '').startswith('M-'):
        continue
    cells = [(cell or '').strip() for cell in row] + [''] * 7
    methods.append({'id': cells[0], 'label': cells[1], 'mainPocket': cells[2], 'target': cells[3], 'otherPockets': cells[4], 'rule': cells[5], 'status': cells[6]})
assert len(methods) == 5, '%d méthodes lues' % len(methods)


def default_pocket(text):
    lower = text.lower()
    if 'selon sous-catégorie' in lower:
        return 'byEssential'
    if lower.startswith('besoins'):
        return 'needs'
    if lower.startswith('envies'):
        return 'wants'
    if lower.startswith('épargne'):
        return 'savings'
    return 'unclassified'


mapping = []
for row in sheets['12B_Mapping_Methodes']:
    if not row or not row[0] or row[0] in ('Catégorie', 'Mapping catégories ↔ méthodes') or len(row) < 3 or not row[1]:
        continue
    cells = [(cell or '').strip() for cell in row] + [''] * 3
    mapping.append({'group': cells[0], 'pocketText': cells[1], 'rule': cells[2], 'pocket': default_pocket(cells[1])})
assert len(mapping) == 12, '%d lignes de rattachement lues' % len(mapping)

content = '''// Méthodes budgétaires facultatives (P8-09) — GÉNÉRÉ par
// scripts/generate-budget-methods.py depuis les onglets `12_Methodes_Budget` et
// `12B_Mapping_Methodes` du cahier consolidé. Ne pas modifier à la main.
//
// « Cadres facultatifs. Ils analysent le mois mais n'imposent pas
// automatiquement de dépenses ou d'épargne. » `pocket` est la poche par défaut,
// lue dans le texte du client (voir le script) et modifiable par l'utilisateur.

export const BUDGET_METHODS = %s;

export const METHOD_MAPPING = %s;

// The pockets an expense can fall in. `byEssential` reads the sub-category's
// « Essentielle ? » flag (needs when essential, wants otherwise).
export const POCKETS = ['needs', 'wants', 'savings', 'unclassified'];
export const POCKET_RULES = [...POCKETS, 'byEssential'];
''' % (json.dumps(methods, ensure_ascii=False, indent=2), json.dumps(mapping, ensure_ascii=False, indent=2))

io.open(OUT, 'w', encoding='utf-8', newline='\n').write(content)
print('%s : %d méthodes, %d rattachements' % (os.path.relpath(OUT, ROOT), len(methods), len(mapping)))
