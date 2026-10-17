# -*- coding: utf-8 -*-
# Génère server/src/constants/finCreditOffers.js depuis l'onglet
# `03_Offres_Credit` du référentiel maître du client (P4-02 / P4-15).
#
# Même méthode que les catégories (P6-02), les parcours (P6-17) et le
# référentiel postal (P4-17) : extrait, jamais retapé. Ici ce sont des taux
# bancaires, c'est-à-dire exactement le genre de donnée qu'une faute de frappe
# transforme en information fausse présentée avec aplomb.
#
# CE QUI EST GÉNÉRÉ : les 25 fiches produits, telles quelles, avec leur statut
# déclaré ET le statut que le client propose pour FINCLUDIA.
#
# CE QUI NE L'EST PAS : rien n'est déduit, aucun taux n'est normalisé en
# décimal, aucune durée n'est convertie en mois. Les colonnes du client sont du
# TEXTE — « 8,00% épargnant / 8,25% non-épargnant », « Jusqu'à 40 ans », « Non
# publié » — et les convertir en nombres obligerait à choisir lequel des deux
# taux retenir, ce qui est une décision commerciale, pas une transformation.
#
# LA RÈGLE QUI COMMANDE : aucune offre n'est publiable. Le client écrit en tête
# de son onglet « publication désactivée avant contrôle des brochures/pages
# officielles », et la colonne « Statut FINCLUDIA proposé » porte « audit
# primaire requis » ou « données incomplètes » sur les 25 lignes.
import html
import io
import json
import os
import re
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BOOK = os.path.join(ROOT, 'FINCLUDIA_REFERENTIEL_MAITRE_EXCEL_BLOCAGES_AZIZ.xlsx')
OUT = os.path.join(ROOT, 'server', 'src', 'constants', 'finCreditOffers.js')

import importlib.util
spec = importlib.util.spec_from_file_location('read_xlsx', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'read-xlsx.py'))
read_xlsx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(read_xlsx)

sheets = read_xlsx.read_workbook(BOOK)
rows = sheets['03_Offres_Credit']

header_index = next(i for i, row in enumerate(rows) if row and row[0] == 'Réf. interne')
header = rows[header_index]

FIELDS = {
    'Réf. interne': 'ref',
    'Banque': 'bank',
    'Produit': 'product',
    'Type': 'kind',
    'Taux / marge (texte)': 'rateText',
    'Durée (texte)': 'durationText',
    'Effort / DSR (texte)': 'dsrText',
    'Apport / quotité (texte)': 'downPaymentText',
    'Âge (texte)': 'ageText',
    'Revenu / emploi (texte)': 'incomeText',
    'Statut déclaré ODT': 'declaredStatus',
    'Statut FINCLUDIA proposé': 'proposedStatus',
    'Source ODT': 'source',
}

offers = []
for row in rows[header_index + 1:]:
    if not row or not row[0].startswith('ODT-CR-'):
        continue
    offer = {}
    for i, name in enumerate(header):
        key = FIELDS.get(name)
        if not key:
            continue
        value = row[i].strip() if i < len(row) else ''
        offer[key] = value or None
    # Publiable seulement si le client l'AUTORISE explicitement.
    #
    # La première version de cette règle disait « publiable sauf si le statut
    # mentionne un audit ». Elle laissait passer `ODT-CR-015`, dont la case
    # « Statut FINCLUDIA proposé » est VIDE — alors que son statut déclaré dit
    # « Conflit officiel – bloquer production tant que banque non confirmée ».
    #
    # Une absence de statut lue comme une autorisation, c'est exactement ce que
    # le client interdit ailleurs : « ne jamais importer une offre à partir
    # d'une absence de données ». Le défaut se serait vu le jour où une offre
    # en conflit officiel serait apparue sur une page publique.
    status = (offer.get('proposedStatus') or '').strip().lower()
    declared = (offer.get('declaredStatus') or '').strip().lower()
    allowed = status in ('publiable', 'publication autorisée', 'vérifié indépendamment')
    blocked = 'bloquer' in declared or 'conflit' in declared
    offer['publishable'] = allowed and not blocked
    # La raison du blocage, quand le client en donne une : elle est affichée
    # plutôt que résumée en « non publiable ».
    offer['blockedReason'] = offer.get('proposedStatus') or offer.get('declaredStatus') or 'Statut de publication non renseigné.'
    # Islamique ou conventionnel : le client le dit dans le TYPE du produit, et
    # P4-15 interdit d'assimiler une marge à un taux d'intérêt.
    offer['islamic'] = 'islamique' in (offer.get('kind') or '').lower()
    offers.append(offer)

banks = sorted({o['bank'] for o in offers if o['bank']})
kinds = sorted({o['kind'] for o in offers if o['kind']})

js = json.dumps(offers, ensure_ascii=False, indent=2)
content = '''// Offres de crédit du référentiel maître (P4-02 et P4-15) — GÉNÉRÉ par
// scripts/generate-credit.py depuis l'onglet `03_Offres_Credit`.
// Ne pas modifier à la main : relancer le script.
//
// %d fiches produits, %d banques. Les colonnes sont du TEXTE, telles que le
// client les a écrites : « 8,00%% épargnant / 8,25%% non-épargnant », « Jusqu'à
// 40 ans », « Non publié ». Rien n'est converti en nombre, parce que convertir
// obligerait à choisir lequel des deux taux retenir — une décision
// commerciale, pas une transformation.
//
// LA RÈGLE QUI COMMANDE TOUT : aucune offre n'est publiable. Le client écrit
// « publication désactivée avant contrôle des brochures/pages officielles », et
// la colonne « Statut FINCLUDIA proposé » porte « audit primaire requis » ou
// « données incomplètes » sur les %d lignes. Le drapeau `publishable` en découle
// mécaniquement ; il n'est pas une appréciation de notre part.
//
// Et « Vérifié public » dans la colonne du client est, ses mots, « le statut
// déclaré dans la source, NON une vérification indépendante ».

export const CREDIT_OFFERS = %s;

export const CREDIT_BANKS = %s;
export const CREDIT_KINDS = %s;

export const creditOffer = (ref) => CREDIT_OFFERS.find((row) => row.ref === ref) ?? null;

// Les offres qu'on pourrait publier. Vide aujourd'hui, et c'est le but : la
// fonction existe pour que l'écran demande la liste au lieu de supposer.
export const publishableOffers = () => CREDIT_OFFERS.filter((row) => row.publishable);

// Les offres de financement islamique, que P4-15 ne doit jamais mélanger aux
// conventionnelles : une marge bénéficiaire n'est pas un taux d'intérêt, et
// les comparer dans la même colonne serait les assimiler.
export const islamicOffers = () => CREDIT_OFFERS.filter((row) => row.islamic);
export const conventionalOffers = () => CREDIT_OFFERS.filter((row) => !row.islamic);
''' % (len(offers), len(banks), len(offers), js, json.dumps(banks, ensure_ascii=False, indent=2), json.dumps(kinds, ensure_ascii=False, indent=2))

io.open(OUT, 'w', encoding='utf-8', newline='\n').write(content)
print('%s : %d offres, %d banques, %d types' % (os.path.relpath(OUT, ROOT), len(offers), len(banks), len(kinds)))
print('publiables :', [o['ref'] for o in offers if o['publishable']] or 'aucune (conforme au classeur)')
print('islamiques :', sum(1 for o in offers if o['islamic']))
