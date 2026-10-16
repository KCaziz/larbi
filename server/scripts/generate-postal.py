# -*- coding: utf-8 -*-
# Génère server/src/constants/finPostal.js depuis le classeur client
# `FINCLUDIA_ALGERIE_POSTE_CCP_REFERENTIEL_COMPARATEUR.xlsx` (P4-17).
#
# Même méthode que les 91 catégories de P6-02 et les 78 écrans de P6-17 :
# extrait par script, jamais retapé. Une ligne que personne n'a tapée est une
# ligne que personne n'a pu déformer — et ici ce sont des tarifs.
#
# CE QUI EST GÉNÉRÉ, et rien d'autre :
#   - l'onglet `12_Import_FINCLUDIA` (32 colonnes, déjà normalisé par le client)
#   - l'onglet `11_Controle_Validation` (les 16 contrôles avant publication)
#   - l'onglet `10_Matrice_FINCLUDIA` (couverture par rubrique du comparateur)
#   - l'onglet `09_Bareme_PINPAD` (les tranches, telles quelles, calcul bloqué)
#
# CE QUI N'EST PAS DÉDUIT : rien. Aucun tarif n'est complété, aucun taux
# converti, aucune ligne rendue publiable. Le classeur pose `publishable` et
# `auto_compute` à FALSE partout faute de pièce officielle datée, et ce fichier
# le transporte tel quel.
import html
import io
import json
import os
import re
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BOOK = os.path.join(ROOT, 'FINCLUDIA_ALGERIE_POSTE_CCP_REFERENTIEL_COMPARATEUR.xlsx')
OUT = os.path.join(ROOT, 'server', 'src', 'constants', 'finPostal.js')


def sheets(path):
    """Chaque onglet du classeur, sous forme de listes de cellules texte."""
    z = zipfile.ZipFile(path)
    shared = []
    if 'xl/sharedStrings.xml' in z.namelist():
        raw = z.read('xl/sharedStrings.xml').decode('utf-8')
        for si in re.findall(r'<si>(.*?)</si>', raw, re.S):
            shared.append(html.unescape(''.join(re.findall(r'<t[^>]*>(.*?)</t>', si, re.S))))

    book = z.read('xl/workbook.xml').decode('utf-8')
    names = re.findall(r'<sheet[^>]*name="([^"]*)"[^>]*r:id="(rId\d+)"', book)
    rels = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]*)"',
                           z.read('xl/_rels/workbook.xml.rels').decode('utf-8')))

    def colnum(ref):
        letters = re.match(r'([A-Z]+)', ref).group(1)
        n = 0
        for ch in letters:
            n = n * 26 + ord(ch) - 64
        return n

    out = {}
    for name, rid in names:
        target = rels[rid].lstrip('/')
        path_in_zip = target if target.startswith('xl/') else 'xl/' + target
        xml = z.read(path_in_zip).decode('utf-8')
        rows = []
        for row in re.findall(r'<row[^>]*>(.*?)</row>', xml, re.S):
            cells = {}
            for m in re.finditer(r'<c ([^>]*?)(?:/>|>(.*?)</c>)', row, re.S):
                attrs, body = m.group(1), m.group(2) or ''
                ref = re.search(r'r="([A-Z]+\d+)"', attrs)
                if not ref:
                    continue
                kind = re.search(r't="(\w+)"', attrs)
                v = re.search(r'<v>(.*?)</v>', body, re.S)
                if kind and kind.group(1) == 's' and v:
                    value = shared[int(v.group(1))]
                elif kind and kind.group(1) == 'inlineStr':
                    value = html.unescape(''.join(re.findall(r'<t[^>]*>(.*?)</t>', body, re.S)))
                else:
                    value = html.unescape(v.group(1)) if v else ''
                value = value.strip()
                if value:
                    cells[colnum(ref.group(1))] = value
            width = max(cells) if cells else 0
            rows.append([cells.get(i, '') for i in range(1, width + 1)])
        out[html.unescape(name)] = rows
    return out


def table(rows, header_row):
    """Les lignes d'un onglet sous forme de dicts, à partir de sa ligne d'en-tête."""
    header = rows[header_row]
    body = []
    for row in rows[header_row + 1:]:
        if not any(row):
            continue
        item = {}
        for i, key in enumerate(header):
            if not key:
                continue
            item[key] = row[i] if i < len(row) else ''
        body.append(item)
    return body


def find_header(rows, first_column):
    for i, row in enumerate(rows):
        if row and row[0] == first_column:
            return i
    raise SystemExit('en-tête introuvable : ' + first_column)


def number(text):
    """Un nombre, ou None. Jamais 0 par défaut : « non renseigné » n'est pas « gratuit »."""
    if text in ('', None):
        return None
    try:
        value = float(str(text).replace(',', '.'))
    except ValueError:
        return None
    return int(value) if value == int(value) else value


def boolean(text):
    return str(text).strip().upper() in ('TRUE', 'VRAI', '1', 'OUI')


data = sheets(BOOK)

# ---- 12_Import_FINCLUDIA : les 75 fiches, schéma du client ------------------
imp = data['12_Import_FINCLUDIA']
rows = table(imp, find_header(imp, 'provider_id'))

TEXT_FIELDS = [
    'provider_id', 'provider_name', 'country_code', 'service_id', 'service_family', 'subfamily',
    'customer_segment', 'service_name', 'operation_channel', 'entry_kind', 'fee_mode',
    'price_period', 'limit_period', 'calculation_rule_id', 'parent_fee_id', 'raw_tariff_text',
    'raw_conditions', 'source_section', 'source_proof_url', 'valid_from', 'checked_at',
    'verification_status', 'review_notes',
]
NUMBER_FIELDS = [
    'fee_amount_dzd', 'fee_amount_max_dzd', 'fee_rate_max', 'limit_min_dzd', 'limit_max_dzd',
    'complaint_delay_days', 'complaint_delay_months',
]

services = []
for row in rows:
    if not row.get('service_id'):
        continue
    item = {}
    for field in TEXT_FIELDS:
        value = row.get(field, '')
        item[field] = value if value else None
    for field in NUMBER_FIELDS:
        item[field] = number(row.get(field, ''))
    # Les deux drapeaux qui décident de tout : le classeur les pose à FALSE
    # partout, et ils sont lus comme des booléens plutôt que comme du texte.
    item['publishable'] = boolean(row.get('publishable', ''))
    item['auto_compute'] = boolean(row.get('auto_compute', ''))
    services.append(item)

# ---- 11_Controle_Validation : les 16 contrôles avant publication ------------
ctl = data['11_Controle_Validation']
controls = [
    {
        'code': r['ID contrôle'],
        'services': r['Service / ID'],
        'limite': r['Limite ou anomalie'],
        'preuve': r['Preuve attendue'],
        'impact': r['Impact produit'],
    }
    for r in table(ctl, find_header(ctl, 'ID contrôle'))
    if r.get('ID contrôle')
]

# ---- 10_Matrice_FINCLUDIA : la couverture par rubrique ---------------------
mat = data['10_Matrice_FINCLUDIA']
coverage = [
    {
        'famille': r['Famille FINCLUDIA'],
        'public': r['Public cible'],
        'couverture': r['Couverture dans texte'],
        'synthese': r['Synthèse / type de donnée'],
        'references': [s.strip() for s in re.split(r'[;,]', r['Références catalogue']) if s.strip() and s.strip() != '—'],
        'precaution': r["Précaution d'intégration"],
    }
    for r in table(mat, find_header(mat, 'Famille FINCLUDIA'))
    if r.get('Famille FINCLUDIA')
]

# ---- 09_Bareme_PINPAD : les tranches, telles quelles ------------------------
pin = data['09_Bareme_PINPAD']
pinpad = [
    {
        'code': r['Code barème'],
        'composant': r['Composant'],
        'debut': number(r['Seuil début DA']),
        'fin': number(r['Seuil fin DA']),
        'valeur': number(r['Valeur']),
        'unite': r['Unité'] or None,
        'regle': r['Texte de la règle'],
        'statutCalcul': r['Statut calcul'],
    }
    for r in table(pin, find_header(pin, 'Code barème'))
    if r.get('Code barème')
]

js = json.dumps
HEADER = '''// Référentiel Algérie Poste / CCP (P4-17) — GÉNÉRÉ par
// scripts/generate-postal.py depuis le classeur client
// `FINCLUDIA_ALGERIE_POSTE_CCP_REFERENTIEL_COMPARATEUR.xlsx`.
// Ne pas modifier à la main : relancer le script.
//
// Le classeur est déjà normalisé par le client (onglet `12_Import_FINCLUDIA`,
// 32 colonnes, dictionnaire de champs en `14_Dictionnaire_API`). Ce fichier le
// transporte sans rien y ajouter.
//
// LA RÈGLE QUI COMMANDE TOUT LE RESTE : aucune ligne n'est publiable.
// `publishable` et `auto_compute` valent FALSE sur les %d fiches, parce que la
// source est un texte transmis et non une brochure officielle datée
// (`verification_status: UNVERIFIED_USER_SUPPLIED`, `source_proof_url` et
// `valid_from` volontairement vides). Un tarif qu'on ne peut pas dater n'est
// pas un tarif qu'on affiche.
//
// Et la distinction que le client répète : TARIF, PLAFOND, DÉLAI, PROCÉDURE et
// INFORMATION ne sont pas la même chose. Un plafond de retrait n'est pas un
// prix ; un délai de réclamation non plus.
''' % len(services)

body = [HEADER]
body.append('\n// Les %d fiches du référentiel, dans l\'ordre du client.\nexport const POSTAL_SERVICES = %s;\n'
            % (len(services), js(services, ensure_ascii=False, indent=2)))
body.append('''
// Les %d contrôles que le client demande AVANT toute publication (onglet
// `11_Controle_Validation`). Ils sont publiés plutôt que rangés dans un
// fichier : ce sont les questions à poser à Algérie Poste, et une liste que
// personne ne rouvre ne fait avancer aucune d'elles.
export const POSTAL_CONTROLS = %s;
''' % (len(controls), js(controls, ensure_ascii=False, indent=2)))
body.append('''
// La couverture rubrique par rubrique (onglet `10_Matrice_FINCLUDIA`), avec la
// précaution d'intégration que le client attache à chacune. « Non documenté »
// n'y signifie pas « inexistant » — le classeur le dit lui-même — et c'est
// exactement pourquoi ces rubriques existent ici au lieu d'être omises.
export const POSTAL_COVERAGE = %s;
''' % js(coverage, ensure_ascii=False, indent=2))
body.append('''
// Le barème du retrait PIN PAD (onglet `09_Bareme_PINPAD`), transcrit sans
// être interprété. Le classeur pose la question qui empêche tout calcul :
// progressif marginal ou taux appliqué à tout le montant ? Et l'arrondi aux
// 1 000 DA n'est pas documenté. Deux lectures donnent deux prix différents,
// donc aucun prix n'est calculé — voir `POSTAL_BLOCKED_CALCULATIONS`.
export const POSTAL_PINPAD_SCALE = %s;
''' % js(pinpad, ensure_ascii=False, indent=2))

body.append('''
// Les trois calculs que le classeur bloque explicitement, avec le contrôle qui
// les débloquera. Déclarés ici pour que l'interface dise « non calculable, et
// voilà ce qui manque » au lieu de se taire.
export const POSTAL_BLOCKED_CALCULATIONS = [
  { code: 'PINPAD-01', control: 'P03', label: 'Retrait sur PIN PAD', reason: 'Barème progressif : base de calcul, arrondi des fractions de 1 000 DA et plafond non documentés.' },
  { code: 'BARIDIMOB-VIR', control: 'P05', label: 'Virement BaridiMob', reason: 'Fourchette « 12 à 24 DA » sans les tranches qui la déterminent.' },
  { code: 'TPE-COMMISSION', control: 'P07', label: 'Commission TPE commerçant', reason: '« Jusqu’à 1,50 % » est un plafond, pas un taux appliqué : aucune grille par segment ou par montant.' },
];

// Les familles que le classeur interdit d'alimenter, et la raison : l'absence
// de donnée n'est pas l'absence de produit (contrôle `P16`). Afficher « aucune
// offre » ici dirait au lecteur quelque chose que personne n'a vérifié.
export const POSTAL_UNDOCUMENTED_FAMILIES = POSTAL_COVERAGE
  .filter((row) => row.couverture === 'Non documenté')
  .map((row) => row.famille);

// Un service par identifiant.
export const postalService = (id) => POSTAL_SERVICES.find((row) => row.service_id === id) ?? null;

// Ce qu'une rubrique du comparateur peut MONTRER : les fiches documentées.
// Publiables ou non, elles restent affichables en interne ; c'est le tarif qui
// ne se publie pas, pas la connaissance de son existence.
export const postalServicesOfFamily = (family) =>
  POSTAL_SERVICES.filter((row) => row.service_family === family);

// Les composantes d'un forfait (ici les trois lignes de l'abonnement TPE).
// Le piège qu'elles posent : 800 DA HT et 300 + 300 + 200 sont la MÊME
// dépense. Tout total doit écarter les lignes qui ont un parent.
export const postalBillableServices = () => POSTAL_SERVICES.filter((row) => row.parent_fee_id === null);
''')

io.open(OUT, 'w', encoding='utf-8', newline='\n').write(''.join(body))
print('%s : %d fiches, %d contrôles, %d rubriques, %d lignes de barème'
      % (os.path.relpath(OUT, ROOT), len(services), len(controls), len(coverage), len(pinpad)))
publishable = [s['service_id'] for s in services if s['publishable']]
print('publiables :', publishable or 'aucune (conforme au classeur)')
