# -*- coding: utf-8 -*-
# Génère deux catalogues depuis le référentiel maître du client (P6-22,
# chantier 6) :
#
#   src/constants/finIntents.js  — les 25 intentions CB01-CB25 de l'assistant
#                                  déterministe (onglet `20_Assistant_25`)
#   src/constants/finGoalModels.js — les 20 modèles d'objectifs G01-G20
#                                  (onglet `22_Objectifs_20`)
#
# Même méthode que les catégories, les parcours, le postal et les offres de
# crédit : extrait, jamais retapé.
#
# Ce que ces deux catalogues remplacent : 8 intentions brouillon et 11 modèles
# génériques écrits par l'équipe faute de mieux. Le contenu du client est plus
# riche ET porte ses garde-fous — « ne jamais demander un code PIN/OTP »,
# « ne jamais deviner un taux », « aucune réponse libre ». Ces phrases-là sont
# la moitié de la valeur du catalogue : elles disent ce que l'assistant n'a pas
# le droit de faire.
import importlib.util
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BOOK = os.path.join(ROOT, 'FINCLUDIA_REFERENTIEL_MAITRE_EXCEL_BLOCAGES_AZIZ.xlsx')
HERE = os.path.dirname(os.path.abspath(__file__))

spec = importlib.util.spec_from_file_location('read_xlsx', os.path.join(HERE, 'read-xlsx.py'))
read_xlsx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(read_xlsx)
sheets = read_xlsx.read_workbook(BOOK)


def table(name, first_column):
    rows = sheets[name]
    start = next(i for i, row in enumerate(rows) if row and row[0] == first_column)
    header = rows[start]
    out = []
    for row in rows[start + 1:]:
        if not row or not row[0]:
            continue
        item = {}
        for i, key in enumerate(header):
            if key:
                item[key] = (row[i].strip() if i < len(row) else '') or None
        out.append(item)
    return out


def split_triggers(text):
    """Les déclencheurs sont une liste séparée par des virgules dans le document."""
    if not text:
        return []
    return [part.strip() for part in text.split(',') if part.strip()]


def split_steps(text):
    """Les étapes sont séparées par une flèche dans le document du client."""
    if not text:
        return []
    return [part.strip(' .') for part in text.split('→') if part.strip(' .')]


# ---- intentions -----------------------------------------------------------
rows = table('20_Assistant_25', 'ID')
intents = []
for row in rows:
    code = row.get('ID')
    if not code:
        continue
    intents.append({
        'code': code,
        'label': row.get('Intention'),
        'triggers': split_triggers(row.get('Déclencheurs')),
        'steps': split_steps(row.get('Questions / étapes')),
        'answer': row.get('Réponse / CTA'),
        # Le garde-fou n'est pas une note : c'est ce que l'assistant n'a pas le
        # droit de faire, et il est transporté tel quel.
        'guardrail': row.get('Garde-fou'),
        'source': row.get('Source'),
        # `CB99` est le repli, pas une intention comme les autres.
        'fallback': code == 'CB99',
    })

js_intents = json.dumps(intents, ensure_ascii=False, indent=2)
without_guardrail = [i['code'] for i in intents if not i['guardrail']]

intents_js = '''// Les %d intentions de l'assistant déterministe (P3-19, contenu de P6-22) —
// GÉNÉRÉ par scripts/generate-assistant-goals.py depuis l'onglet
// `20_Assistant_25`. Ne pas modifier à la main : relancer le script.
//
// Elles remplacent les 8 intentions brouillon que l'équipe avait écrites faute
// de contenu. Le catalogue du client est plus riche sur trois points, et le
// troisième est le plus important :
//
//   `triggers`   les mots qui déclenchent l'intention, tels que le client les
//                a listés — c'est ce qui rend la reconnaissance DÉTERMINISTE.
//   `steps`      les questions à poser, dans l'ordre : une machine à états,
//                pas une conversation libre.
//   `guardrail`  ce que l'assistant N'A PAS LE DROIT de faire. « Ne jamais
//                demander un code PIN/OTP/mot de passe » (CB22), « ne jamais
//                deviner un taux » (CB24), « aucune réponse libre » (CB99).
//                Ces phrases sont la moitié de la valeur du catalogue.
//
// Aucune réponse n'est générée : l'assistant choisit parmi ces %d entrées ou
// retombe sur CB99, qui propose des thèmes au lieu d'improviser.
export const FIN_INTENT_CATALOGUE = %s;

export const FIN_INTENT_CODES = FIN_INTENT_CATALOGUE.map((row) => row.code);
export const finIntent = (code) => FIN_INTENT_CATALOGUE.find((row) => row.code === code) ?? null;

// Le repli, isolé : c'est la seule entrée que le résolveur a le droit de
// choisir sans avoir reconnu quoi que ce soit.
export const FIN_INTENT_FALLBACK = FIN_INTENT_CATALOGUE.find((row) => row.fallback) ?? null;

// Tous les garde-fous, à plat. Publiés ensemble pour qu'un écran puisse les
// montrer : ce que l'assistant refuse de faire mérite d'être lisible sans
// ouvrir 25 fiches.
export const FIN_INTENT_GUARDRAILS = FIN_INTENT_CATALOGUE
  .filter((row) => row.guardrail)
  .map((row) => ({ code: row.code, label: row.label, guardrail: row.guardrail }));
''' % (len(intents), len(intents), js_intents)

out_intents = os.path.join(ROOT, 'server', 'src', 'constants', 'finIntents.js')
io.open(out_intents, 'w', encoding='utf-8', newline='\n').write(intents_js)

# ---- modèles d'objectifs --------------------------------------------------
rows = table('22_Objectifs_20', 'ID')
goals = []
for row in rows:
    code = row.get('ID')
    if not code:
        continue
    goals.append({
        'code': code,
        'label': row.get('Modèle'),
        'defaultTarget': row.get('Cible par défaut'),
        'horizon': row.get('Horizon'),
        'rule': row.get('Règle / condition'),
        'source': row.get('Source'),
    })

js_goals = json.dumps(goals, ensure_ascii=False, indent=2)
goals_js = '''// Les %d modèles d'objectifs financiers (P6-08, contenu de P6-22) — GÉNÉRÉ
// par scripts/generate-assistant-goals.py depuis l'onglet `22_Objectifs_20`.
// Ne pas modifier à la main : relancer le script.
//
// Ils remplacent les 11 modèles génériques que l'équipe avait écrits.
//
// `defaultTarget` et `horizon` sont du TEXTE, tels que le client les a
// écrits : « 3 mois dépenses essentielles; 6 si revenu variable », « 10-30%% du
// prix cible, paramétrable », « 6-36 mois ». Les convertir en nombres
// obligerait à choisir entre les deux valeurs d'une condition, ce qui est
// exactement ce que la condition demande de NE PAS faire.
//
// `rule` porte les conditions du client, et plusieurs sont des interdits :
// « ne pas présumer exigence bancaire » (G06), « jamais proposé sans
// intention » (G08), « utiliser banque uniquement si règle vérifiée » (G07).
export const GOAL_MODELS = %s;

export const GOAL_MODEL_CODES = GOAL_MODELS.map((row) => row.code);
export const goalModel = (code) => GOAL_MODELS.find((row) => row.code === code) ?? null;

// Le modèle libre, toujours disponible : le client le dit explicitement, et
// c'est ce qui évite qu'une personne doive faire entrer son projet dans une
// case qui ne lui va pas.
export const GOAL_MODEL_FREE = GOAL_MODELS.find((row) => /libre/i.test(row.label ?? '')) ?? null;
''' % (len(goals), js_goals)

out_goals = os.path.join(ROOT, 'server', 'src', 'constants', 'finGoalModels.js')
io.open(out_goals, 'w', encoding='utf-8', newline='\n').write(goals_js)

print('%s : %d intentions (%d avec garde-fou)' % (os.path.relpath(out_intents, ROOT), len(intents), len(intents) - len(without_guardrail)))
if without_guardrail:
    print('  sans garde-fou :', ', '.join(without_guardrail))
print('%s : %d modèles' % (os.path.relpath(out_goals, ROOT), len(goals)))
