# -*- coding: utf-8 -*-
# Génère server/src/constants/finCollectiveCategories.js depuis l'onglet
# `12_Categories` de FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx
# (P9-05) : les 19 catégories proposées pour les dépenses et budgets partagés.
#
# Extrait, jamais retapé. L'identifiant COLC-nn est de nous (l'ordre du
# classeur, qui est aussi l'ordre d'affichage « en premier » demandé par le
# client, B4).
import importlib.util
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BOOK = os.path.join(ROOT, 'FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx')
OUT = os.path.join(ROOT, 'server', 'src', 'constants', 'finCollectiveCategories.js')

spec = importlib.util.spec_from_file_location('read_xlsx', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'read-xlsx.py'))
read_xlsx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(read_xlsx)

rows = read_xlsx.read_workbook(BOOK)['12_Categories']
start = next(i for i, row in enumerate(rows) if row and row[0] == 'Catégorie')
categories = []
for row in rows[start + 1:]:
    if not row or not (row[0] or '').strip():
        continue
    cells = [(cell or '').strip() for cell in row] + ['', '']
    categories.append({'key': 'COLC-%02d' % (len(categories) + 1), 'label': cells[0], 'icon': cells[1], 'color': cells[2]})

assert len(categories) == 19, '%d catégories lues, 19 attendues' % len(categories)

content = '''// Les 19 catégories collectives du client (P9-05) — GÉNÉRÉ par
// scripts/generate-collective-categories.py depuis l'onglet `12_Categories` de
// FINCLUDIA_Partage_Gestion_Collective_Depenses_Taches.xlsx.
// Ne pas modifier à la main : relancer le script.
//
// Affichées en premier dans un espace (règle du client B4, « collective_default »).
// Leur correspondance avec les 125 catégories du référentiel personnel n'est
// pas écrite ici : le classeur ne la donne pas, et elle est une question au
// client plutôt qu'une décision de notre part.

export const COLLECTIVE_CATEGORIES = %s;

export const COLLECTIVE_CATEGORY_KEYS = COLLECTIVE_CATEGORIES.map((category) => category.key);
''' % json.dumps(categories, ensure_ascii=False, indent=2)
io.open(OUT, 'w', encoding='utf-8', newline='\n').write(content)
print('%s : %d catégories' % (os.path.relpath(OUT, ROOT), len(categories)))
