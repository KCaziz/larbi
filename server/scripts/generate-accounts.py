# -*- coding: utf-8 -*-
# Génère server/src/constants/finAccounts.js depuis l'onglet `04_Comptes` de
# FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx (P8-03).
#
# Extrait, jamais retapé. Les colonnes du client sont gardées telles quelles
# (type, nature, icône, couleur, règle) ; seules deux lectures sont de nous,
# et elles sont mécaniques :
#   - `nature` → une clé (liquid, savings, investment, liability, receivable,
#     configurable), pour que le code ne compare pas des phrases ;
#   - « Inclure total / patrimoine » → un booléen par défaut : « Oui… » vaut
#     vrai, « Non… » et « Configurable » valent faux (l'utilisateur choisit).
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BOOK = os.path.join(ROOT, 'FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx')
OUT = os.path.join(ROOT, 'server', 'src', 'constants', 'finAccounts.js')

import importlib.util
spec = importlib.util.spec_from_file_location('read_xlsx', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'read-xlsx.py'))
read_xlsx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(read_xlsx)

NATURES = {
    'Actif liquide': 'liquid',
    'Actif liquide/épargne': 'savings',
    'Actif financier': 'investment',
    'Passif / dette': 'liability',
    'Actif créance': 'receivable',
    'Configurable': 'configurable',
}

rows = read_xlsx.read_workbook(BOOK)['04_Comptes']
header_index = next(i for i, row in enumerate(rows) if row and row[0] == 'ID')

types = []
for row in rows[header_index + 1:]:
    if not row or not row[0].startswith('AC-'):
        continue
    cells = [(cell or '').strip() for cell in row] + [''] * 8
    nature = NATURES[cells[2]]
    types.append({
        'id': cells[0],
        'label': cells[1],
        'natureText': cells[2],
        'nature': nature,
        'icon': cells[3],
        'color': cells[4],
        'includeInTotalText': cells[5],
        'includeInNetWorthText': cells[6],
        'includeInTotal': cells[5].lower().startswith('oui'),
        'includeInNetWorth': cells[6].lower().startswith('oui'),
        'rule': cells[7],
    })

assert len(types) == 10, '%d types lus, 10 attendus' % len(types)

# Moyens de paiement (onglet `05B_Moyens_Paiement`) : « un moyen de paiement
# ne doit pas être confondu avec un compte ».
rows = read_xlsx.read_workbook(BOOK)['05B_Moyens_Paiement']
methods = []
for row in rows:
    if not row or not (row[0] or '').startswith('PM-'):
        continue
    cells = [(cell or '').strip() for cell in row] + [''] * 5
    methods.append({'id': cells[0], 'label': cells[1], 'icon': cells[2], 'color': cells[3], 'rule': cells[4]})
assert len(methods) == 10, '%d moyens lus, 10 attendus' % len(methods)

content = '''// Types de comptes (P8-03) — GÉNÉRÉ par scripts/generate-accounts.py depuis
// l'onglet `04_Comptes` de FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx.
// Ne pas modifier à la main : relancer le script.
//
// « Les comptes sont la source de vérité des soldes » (ARC-04). Les colonnes
// du client sont gardées en texte ; `nature` et les deux booléens par défaut
// en sont une lecture mécanique (voir le script).

export const ACCOUNT_TYPES = %s;

export const ACCOUNT_TYPE_IDS = ACCOUNT_TYPES.map((type) => type.id);
export const accountType = (id) => ACCOUNT_TYPES.find((type) => type.id === id) ?? null;

// The account created when someone records a movement without having any
// (PB-PR-04), and the one savings move into.
export const CASH_ACCOUNT_TYPE = 'AC-01';
export const SAVINGS_ACCOUNT_TYPE = 'AC-04';

// A liability is never added to the cash available (PB-F002) and counts
// negatively in the net position (PB-F003).
export const isLiability = (typeId) => accountType(typeId)?.nature === 'liability';

// Moyens de paiement PM-01 à PM-10 (onglet `05B_Moyens_Paiement`), distincts
// des comptes (P8-07).
export const PAYMENT_METHODS_REFERENCE = %s;
export const PAYMENT_METHOD_IDS = PAYMENT_METHODS_REFERENCE.map((method) => method.id);
''' % (json.dumps(types, ensure_ascii=False, indent=2), json.dumps(methods, ensure_ascii=False, indent=2))

io.open(OUT, 'w', encoding='utf-8', newline='\n').write(content)
print('%s : %d types' % (os.path.relpath(OUT, ROOT), len(types)))
