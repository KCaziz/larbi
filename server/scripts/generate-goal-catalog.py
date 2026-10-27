# -*- coding: utf-8 -*-
# Génère server/src/constants/finGoalCatalog.js depuis l'onglet
# `10_Objectifs_Urgence` de FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx
# (P8-12) : les 11 objectifs GO-01 à GO-11, avec icône, couleur, calcul
# principal, cible / public et règle, mot pour mot.
#
# Le catalogue complet (17 modèles, décision P8-01 point 2) les complète par
# six modèles du référentiel maître que rien ne recouvre (G09, G10, G13, G16,
# G17, G19) : cette composition est faite dans constants/finGoal.js, pas ici.
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BOOK = os.path.join(ROOT, 'FINCLUDIA_Gestion_Budgetaire_Personnelle_Centralisee.xlsx')
OUT = os.path.join(ROOT, 'server', 'src', 'constants', 'finGoalCatalog.js')

import importlib.util
spec = importlib.util.spec_from_file_location('read_xlsx', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'read-xlsx.py'))
read_xlsx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(read_xlsx)

rows = read_xlsx.read_workbook(BOOK)['10_Objectifs_Urgence']
goals = []
for row in rows:
    if not row or not (row[0] or '').startswith('GO-'):
        continue
    cells = [(cell or '').strip() for cell in row] + [''] * 7
    goals.append({'code': cells[0], 'label': cells[1], 'icon': cells[2], 'color': cells[3], 'calculation': cells[4], 'target': cells[5], 'rule': cells[6]})
assert len(goals) == 11, '%d objectifs lus, 11 attendus' % len(goals)

content = '''// Objectifs GO-01 à GO-11 (P8-12) — GÉNÉRÉ par scripts/generate-goal-catalog.py
// depuis l'onglet `10_Objectifs_Urgence`. Ne pas modifier à la main.
//
// « Le fonds d'urgence est un type d'objectif. Une contribution réelle est une
// transaction ou un transfert ; elle ne doit jamais être déduite deux fois. »

export const GOAL_CATALOG_GO = %s;
''' % json.dumps(goals, ensure_ascii=False, indent=2)
io.open(OUT, 'w', encoding='utf-8', newline='\n').write(content)
print('%s : %d objectifs' % (os.path.relpath(OUT, ROOT), len(goals)))
