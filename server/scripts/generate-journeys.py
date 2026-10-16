# -*- coding: utf-8 -*-
# Generates server/src/constants/finJourneys.js from the client's own tab
# `19_Cartes_Parcours`, the way P6-02 generated the category reference from
# `03_Categories`: extracted by script rather than retyped, so a line nobody
# typed cannot be a line nobody checked.
#
# What is GENERATED: per public, the main dashboard name, the visible
# navigation (the client's own labels, in the client's own order) and the list
# of enabled screen codes.
#
# What is DECLARED BY HAND below: the map from a client screen code to the route
# we actually serve. That is a judgement — "C07 Ajouter une dépense" is a panel
# of /mon-argent, not a page of its own — and it cannot be derived from the
# workbook. It doubles as the provenance matrix of P6-21 (tab `18_Provenance`):
# every delivered screen attached to its source line.
import html
import io
import os
import re
import zipfile

ROOT = os.path.join('C:', os.sep, 'Users', 'AZIZ', 'Desktop', 'ayrep', 'Larbi')
XLSX = os.path.join(ROOT, 'FINCLUDIA_Cahier_des_Charges_Complet.xlsx')
OUT = os.path.join(ROOT, 'server', 'src', 'constants', 'finJourneys.js')

# The client's public labels -> our codes (constants/finPublics.js).
PUBLIC_CODE = {
    'Lycéen': 'LYC',
    'Étudiant': 'ETU',
    'Jeune actif': 'JAC',
    'Salarié': 'SAL',
    'Colocataire': 'COL',
    'Couple': 'COU',
    'Famille': 'FAM',
    'Épargnant débutant': 'EPG',
}

# A client screen code -> what we serve for it.
#
#   to          the route, or None when nothing is served yet
#   waitingOn   the task that would deliver it, when `to` is None
#   adultsOnly  reserved to 18+ (the client's rule for a lycéen: never debt,
#               never real patrimony, never a credit offer)
#   note        why a mapping is not one-to-one, where that is not obvious
SCREENS = {
    # ---- common socle --------------------------------------------------
    'C04': {'to': '/aujourdhui', 'task': 'P6-06'},
    'C05': {'to': '/mon-argent', 'task': 'P6-04'},
    'C06': {'to': '/budget', 'task': 'P6-05'},
    'C07': {'to': '/mon-argent', 'task': 'P6-04', 'note': 'panneau de saisie rapide de la page « Mon argent »'},
    'C08': {'to': '/mon-argent', 'task': 'P6-04', 'note': 'historique et filtres de la page « Mon argent »'},
    'C09': {'to': '/objectifs', 'task': 'P6-08'},
    'C10': {'to': '/objectifs', 'task': 'P6-08', 'note': 'formulaire de création sur la page des objectifs'},
    'C11': {'to': '/objectifs', 'task': 'P6-08', 'note': 'détail déplié sur la page des objectifs'},
    'C12': {'to': '/reserve', 'task': 'P6-09'},
    'C13': {'to': '/dettes', 'task': 'P6-10', 'adultsOnly': True},
    'C14': {'to': '/dettes', 'task': 'P6-10', 'adultsOnly': True, 'note': 'détail et comparaison ALG-01 sur la page des dettes'},
    'C15': {'to': None, 'waitingOn': 'P4-14', 'adultsOnly': True, 'note': 'barèmes de paie à fournir par le client'},
    'C16': {'to': '/patrimoine', 'task': 'P6-11', 'adultsOnly': True},
    'C17': {'to': '/portefeuille', 'task': 'P6-12'},
    'C18': {'to': '/outils/atelier', 'task': 'P4-16'},
    'C19': {'to': '/outils/comparateur', 'task': 'P4-12'},
    'C20': {'to': '/outils/explorateur', 'task': 'P4-13', 'adultsOnly': True},
    'C21': {'to': '/apprendre', 'task': 'P2-08'},
    'C22': {'to': None, 'task': 'P6-20', 'note': "barre de recherche de l'en-tête, présente sur toutes les pages : pas une route"},
    'C23': {'to': '/calendrier', 'task': 'P6-07'},
    'C24': {'to': '/notifications', 'task': 'P6-18'},
    'C25': {'to': '/confiance', 'task': 'P6-19'},
    # Served, but not as a route: the deterministic assistant is a floating
    # panel present on every screen (P3-07 / P3-19). `/assistant-fincludia`
    # exists only under `/admin`, so pointing the screen at it made a dead
    # link in the provenance matrix. Same shape as C22 for the same reason.
    'C26': {'to': None, 'task': 'P3-19', 'note': "bulle d'assistant présente sur toutes les pages, ouverte aussi depuis la barre supérieure : pas une route"},
    # ---- lycéen ---------------------------------------------------------
    'LY01': {'to': '/compte/premiers-pas', 'task': 'P6-03'},
    'LY02': {'to': '/aujourdhui', 'task': 'P6-06', 'note': 'tableau de bord « Ma semaine »'},
    'LY03': {'to': None, 'waitingOn': 'P2-10', 'note': 'défis et missions : tâche abandonnée par le client le 2026-10-11'},
    'LY09': {'to': '/outils/simulateurs/budget-etudiant', 'task': 'P4-10'},
    'LY10': {'to': '/outils/simulateurs/premier-salaire', 'task': 'P4-10'},
    'LY11': {'to': None, 'waitingOn': 'P2-08', 'note': 'sécurité numérique : contenu pédagogique, pas encore rédigé'},
    'LY12': {'to': '/passeport', 'task': 'P2-09'},
    # ---- étudiant -------------------------------------------------------
    'ET01': {'to': '/compte/premiers-pas', 'task': 'P6-03'},
    'ET02': {'to': '/aujourdhui', 'task': 'P6-06'},
    'ET03': {'to': '/aujourdhui', 'task': 'P6-06', 'note': 'autonomie financière F047, carte du tableau de bord étudiant'},
    'ET04': {'to': '/calendrier', 'task': 'P6-07', 'note': 'provisions de dépenses d’études'},
    'ET06': {'to': '/outils/comparateur/comptes', 'task': 'P4-07'},
    'ET07': {'to': None, 'waitingOn': 'P4-14', 'adultsOnly': True},
    'ET08': {'to': '/outils/offres-emploi', 'task': 'P4-12'},
    'ET09': {'to': '/passeport', 'task': 'P2-09'},
    # ---- jeune actif ----------------------------------------------------
    'JA01': {'to': '/aujourdhui', 'task': 'P6-06', 'note': 'tableau de bord « Premier revenu »'},
    'JA02': {'to': '/aujourdhui', 'task': 'P6-06'},
    'JA03': {'to': '/budget', 'task': 'P6-05', 'note': 'plan de répartition du premier salaire'},
    'JA04': {'to': '/budget', 'task': 'P6-05', 'note': 'même plan de répartition, vu depuis le budget'},
    'JA07': {'to': '/patrimoine', 'task': 'P6-11', 'adultsOnly': True},
    'JA08': {'to': '/financement', 'task': 'P6-16', 'adultsOnly': True},
    'JA09': {'to': None, 'waitingOn': 'P4-15', 'adultsOnly': True, 'note': 'offres de financement à fournir par le client'},
    # ---- salarié --------------------------------------------------------
    'SA01': {'to': '/compte/premiers-pas', 'task': 'P6-03'},
    'SA02': {'to': '/aujourdhui', 'task': 'P6-06'},
    'SA03': {'to': '/calendrier', 'task': 'P6-07', 'note': 'plan du mois : copie des paiements planifiés du mois précédent'},
    'SA04': {'to': '/calendrier', 'task': 'P6-07', 'note': 'abonnements et récurrences détectées (ALG-04)'},
    'SA05': {'to': '/financement', 'task': 'P6-16', 'adultsOnly': True},
    # ---- épargnant ------------------------------------------------------
    'EP01': {'to': '/compte/premiers-pas', 'task': 'P6-03', 'note': 'diagnostic épargne : les questions EP01 de l’onboarding'},
    'EP02': {'to': '/aujourdhui', 'task': 'P6-06'},
    'EP03': {'to': '/portefeuille', 'task': 'P6-12', 'note': 'profil de risque pédagogique F057'},
    'EP04': {'to': '/portefeuille', 'task': 'P6-12', 'note': '« Suis-je prêt à commencer ? » : répond, ne bloque jamais'},
    'EP05': {'to': '/apprendre', 'task': 'P2-08'},
    'EP06': {'to': None, 'waitingOn': 'P6-01', 'note': 'marché pédagogique : instruments et prix de référence à fournir par le client'},
    'EP07': {'to': '/portefeuille', 'task': 'P6-12', 'note': 'journal de décisions et son export'},
    # ---- shared spaces --------------------------------------------------
    'P01': {'to': '/espaces', 'task': 'P6-13'},
    'P02': {'to': '/espaces', 'task': 'P6-14'},
    'P03': {'to': '/espaces', 'task': 'P6-14', 'note': 'règlements et plan ALG-02, dans l’espace'},
    'P04': {'to': '/espaces', 'task': 'P6-13', 'note': 'matrice de permissions, dans l’espace'},
    'P05': {'to': '/espaces', 'task': 'P6-15'},
    'CO01': {'to': '/espaces', 'task': 'P6-13'},
    'CO02': {'to': '/espaces', 'task': 'P6-15'},
    'CO03': {'to': '/espaces', 'task': 'P6-15'},
    'CO04': {'to': '/espaces', 'task': 'P6-15'},
    'CO05': {'to': '/espaces', 'task': 'P6-15'},
    'CO06': {'to': '/espaces', 'task': 'P6-15'},
    'CP01': {'to': '/espaces', 'task': 'P6-13'},
    'CP02': {'to': '/espaces', 'task': 'P6-15'},
    'CP03': {'to': '/espaces', 'task': 'P6-15'},
    'CP04': {'to': '/espaces', 'task': 'P6-15'},
    'FA01': {'to': '/espaces', 'task': 'P6-13'},
    'FA02': {'to': '/espaces', 'task': 'P6-15'},
    'FA03': {'to': '/espaces', 'task': 'P6-15'},
    'FA04': {'to': '/espaces', 'task': 'P6-15'},
    'FA05': {'to': '/espaces', 'task': 'P6-15'},
    'FA06': {'to': '/espaces', 'task': 'P6-15'},
}


def read_tab():
    z = zipfile.ZipFile(XLSX)
    sst = z.read('xl/sharedStrings.xml').decode('utf-8')
    ss = [''.join(re.findall(r'<t[^>]*>(.*?)</t>', m.group(1), re.S)) for m in re.finditer(r'<si>(.*?)</si>', sst, re.S)]
    data = z.read('xl/worksheets/sheet20.xml').decode('utf-8')

    def cells(row):
        out = []
        for m in re.finditer(r'<c\b([^>]*)>(.*?)</c>|<c\b([^>]*)/>', row, re.S):
            attrs = m.group(1) or m.group(3) or ''
            body = m.group(2) or ''
            v = re.search(r'<v>(.*?)</v>', body, re.S)
            if v is None:
                out.append('')
            elif 't="s"' in attrs:
                i = int(v.group(1))
                out.append(html.unescape(ss[i]) if i < len(ss) else v.group(1))
            else:
                out.append(v.group(1))
        return out

    return [cells(r) for r in re.findall(r'<row[^>]*>(.*?)</row>', data, re.S)]


rows = read_tab()
journeys = {}
labels = {}

for row in rows:
    if len(row) < 4:
        continue
    public, kind, code, text = row[0], row[1], row[2], row[3]
    cd = PUBLIC_CODE.get(public)
    if not cd:
        continue
    entry = journeys.setdefault(cd, {'dashboard': None, 'nav': [], 'screens': []})
    if kind == 'Architecture du parcours':
        if code == 'Tableau de bord principal':
            entry['dashboard'] = text.strip()
        elif code == 'Navigation visible':
            # The client writes the navigation as one line of labels separated
            # by a bullet, sometimes prefixed with "Accueil :". Kept as the
            # client's own labels, in the client's own order: this IS the
            # per-public vocabulary the task asks for.
            raw = text.split(':', 1)[1] if text.startswith('Accueil :') else text
            entry['nav'] = [part.strip() for part in raw.split('•') if part.strip()]
    elif kind == 'Écran activé' and code:
        entry['screens'].append(code)
        labels.setdefault(code, text.strip())

missing = sorted(code for codes in journeys.values() for code in codes['screens'] if code not in SCREENS)
if missing:
    raise SystemExit('screen codes with no mapping: %s' % ', '.join(sorted(set(missing))))

order = ['LYC', 'ETU', 'JAC', 'SAL', 'COL', 'COU', 'FAM', 'EPG']


def js(value):
    if value is None:
        return 'null'
    if value is True:
        return 'true'
    return "'" + value.replace('\\', '\\\\').replace("'", "\\'") + "'"


out = []
w = out.append
w("// The journey map of the 8 publics (P6-17), generated from the client's own")
w("// tab `19_Cartes_Parcours` by scripts/generate-journeys.py — extracted, never")
w('// retyped, exactly as the category reference of P6-02 was.')
w('//')
w("// It answers three questions per public, in the client's own words: which")
w('// dashboard is the main one, what the visible navigation says, and which')
w('// screens are enabled. The spec is explicit that common screens are reused')
w('// BY CONFIGURATION and never copied — so this file is configuration, and')
w('// there is no second implementation of a screen anywhere.')
w('//')
w('// `SCREEN_ROUTES` doubles as the provenance matrix P6-21 asks for (tab')
w('// `18_Provenance`): every screen the client specified, attached either to the')
w('// route we serve or to the task that still owes it.')
w('')
w('// A client screen code -> what we actually serve.')
w('//   to          the route, or null when nothing is served yet')
w('//   task        the task that delivered it')
w('//   waitingOn   what it waits for, when nothing is served')
w('//   adultsOnly  reserved to 18+ (the client: a lycéen is never shown a debt,')
w('//               a real patrimony or a credit offer)')
w('//   note        why a mapping is not one-to-one, where that is not obvious')
w('export const SCREEN_ROUTES = {')
for code in sorted(SCREENS, key=lambda c: (c[0].isdigit(), c)):
    spec = SCREENS[code]
    parts = ["label: %s" % js(labels.get(code, code)), "to: %s" % js(spec.get('to'))]
    if spec.get('task'):
        parts.append("task: %s" % js(spec['task']))
    if spec.get('waitingOn'):
        parts.append("waitingOn: %s" % js(spec['waitingOn']))
    if spec.get('adultsOnly'):
        parts.append('adultsOnly: true')
    if spec.get('note'):
        parts.append("note: %s" % js(spec['note']))
    w("  %s: { %s }," % (code, ', '.join(parts)))
w('};')
w('')
w('export const SCREEN_CODES = Object.keys(SCREEN_ROUTES);')
w('export const screenByCode = (code) => SCREEN_ROUTES[code] ?? null;')
w('')
w('// Screens reserved to adults, as a set: the one list the route guard reads.')
w('export const ADULT_ONLY_SCREENS = SCREEN_CODES.filter((code) => SCREEN_ROUTES[code].adultsOnly);')
w('// And the routes they sit on, deduplicated — what `requireAdult` protects.')
w('export const ADULT_ONLY_ROUTES = [')
w('  ...new Set(ADULT_ONLY_SCREENS.map((code) => SCREEN_ROUTES[code].to).filter(Boolean)),')
w('];')
w('')
w('// Per public: the main dashboard, the visible navigation and the enabled')
w("// screens — the client's own words, in the client's own order.")
w('export const JOURNEYS = {')
for code in order:
    entry = journeys[code]
    w('  %s: {' % code)
    w('    dashboard: %s,' % js(entry['dashboard']))
    w('    nav: [%s],' % ', '.join(js(label) for label in entry['nav']))
    w('    screens: [%s],' % ', '.join(js(s) for s in entry['screens']))
    w('  },')
w('};')
w('')
w('export const JOURNEY_CODES = Object.keys(JOURNEYS);')
w('export const journeyFor = (publicCode) => JOURNEYS[publicCode] ?? null;')
w('')
w('/**')
w(' * Whether a public may open a screen.')
w(' *')
w(' * A screen absent from a public’s journey is NOT theirs: that is the whole')
w(' * point of the map. Somebody with no public yet is not refused — they have not')
w(' * chosen a journey, and refusing them would lock a new account out of its own')
w(' * money — but the adults-only rule still applies to them, because it protects')
w(' * minors rather than shaping a journey.')
w(' */')
w('export function screenEnabledFor(publicCode, code) {')
w('  const journey = journeyFor(publicCode);')
w('  if (!journey) return true;')
w('  return journey.screens.includes(code);')
w('}')

io.open(OUT, 'w', encoding='utf-8', newline='\n').write('\n'.join(out) + '\n')
print('écrit %s : %d écrans, %d parcours' % (OUT, len(SCREENS), len(journeys)))
for code in order:
    print('  %s : tableau « %s », %d entrées de nav, %d écrans' % (code, journeys[code]['dashboard'], len(journeys[code]['nav']), len(journeys[code]['screens'])))
