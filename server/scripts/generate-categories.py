# -*- coding: utf-8 -*-
# Génère, depuis l'onglet `09_Categories` du cahier consolidé (identique à
# l'onglet `07_Categories` du dernier classeur du client) (P8-08) :
#   - server/src/constants/finCategoryReference.js : les 125 catégories ;
#   - la migration 20261027130000_fin_categories_125 : les colonnes nouvelles,
#     la fusion des anciennes catégories qui recouvrent une nouvelle, l'ajout
#     des autres.
#
# Extrait, jamais retapé : libellé, catégorie (groupe), icône, couleur,
# « Essentielle ? », récurrence typique et « Suggéré pour » viennent du
# classeur mot pour mot.
#
# CE QUI EST DE NOUS, et seulement cela :
#   - MERGES : quelle ancienne catégorie (P6-02) recouvre quelle nouvelle.
#     Décision P8-01 point 6 : une ancienne qui recouvre une nouvelle y est
#     fusionnée ; les autres restent. Seules les correspondances nettes sont
#     listées : dans le doute, l'ancienne reste, rien n'est perdu. Une
#     ancienne fusionnée GARDE sa clé et son identifiant : ses mouvements ne
#     bougent pas, elle prend seulement la définition du client.
#   - la famille d'une nouvelle dépense (fixed / variable / seasonal), lue
#     mécaniquement dans sa « récurrence typique » : « Mensuel… » = fixe,
#     « Annuel… » = saisonnière, le reste = variable. Elle ne sert qu'à
#     proposer un type d'enveloppe ; elle ne restreint rien.
import io
import json
import os
import re
import unicodedata
import uuid

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BOOK = os.path.join(ROOT, 'FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx')
OUT = os.path.join(ROOT, 'server', 'src', 'constants', 'finCategoryReference.js')
MIGRATION = os.path.join(ROOT, 'server', 'prisma', 'migrations', '20261027130000_fin_categories_125', 'migration.sql')
SOURCE_REF = 'FINCLUDIA_Cahier_des_Charges_Consolide_Moteur_Budgetaire_Unique_.xlsx#09_Categories'

import importlib.util
spec = importlib.util.spec_from_file_location('read_xlsx', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'read-xlsx.py'))
read_xlsx = importlib.util.module_from_spec(spec)
spec.loader.exec_module(read_xlsx)

# New sub-category label -> old standard key it absorbs.
MERGES = {
    'Salaire net': 'income.salaire_net',
    'Prime / bonus': 'income.prime',
    'Bourse': 'income.bourse',
    'Aide familiale': 'income.aide_familiale',
    'Allocation / aide publique': 'income.allocation_aide',
    'Job étudiant': 'income.job_etudiant',
    'Stage rémunéré': 'income.stage_remunere',
    'Freelance / mission': 'income.freelance_mission',
    'Loyer reçu': 'income.revenu_locatif',
    'Retraite / pension': 'income.pension',
    'Dividendes': 'income.dividende_revenu_de_placement_declare',
    'Autre revenu': 'income.autre_revenu',
    'Loyer': 'fixed.loyer',
    'Crédit immobilier': 'fixed.credit_immobilier',
    'Mensualité crédit consommation': 'fixed.credit_consommation',
    'Charges / copropriété': 'fixed.copropriete_charges',
    'Électricité': 'fixed.electricite',
    'Gaz': 'fixed.gaz',
    'Eau': 'fixed.eau',
    'Téléphone mobile': 'fixed.telephone',
    'Internet': 'fixed.internet',
    'Frais de scolarité / université': 'fixed.scolarite_etudes',
    'Pension / engagement': 'fixed.pension_engagement',
    'Courses alimentaires': 'variable.alimentation_boissons',
    'Vêtements': 'variable.habillement',
    'Fournitures': 'variable.etudes_fournitures',
    'Autre dépense': 'variable.autre_depense_variable',
}

# The old categories that stay as they are, and which of them were treated as
# essential expenses until now (the onboarding's « dépenses essentielles »):
# they keep that reading, as a flag the person may now change.
OLD_ESSENTIAL_KEYS = {'fixed.autre_charge_fixe', 'fixed.transport_recurrent'}


def slug(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii').lower()
    return re.sub(r'[^a-z0-9]+', '_', text).strip('_')


def family_of(kind, recurrence):
    if kind == 'Revenus':
        return 'income'
    if recurrence.startswith('Mensuel'):
        return 'fixed'
    if recurrence.startswith('Annuel'):
        return 'seasonal'
    return 'variable'


def sql(value):
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    return "'" + str(value).replace('\\', '\\\\').replace("'", "''") + "'"


rows = read_xlsx.read_workbook(BOOK)['09_Categories']
header_index = next(i for i, row in enumerate(rows) if row and row[0] == 'Type')

existing_keys = set(re.findall(r"key: '([^']+)'", io.open(os.path.join(ROOT, 'server', 'src', 'constants', 'finCategories.js'), encoding='utf-8').read()))

categories = []
for row in rows[header_index + 1:]:
    if not row or not row[0]:
        continue
    cells = [(cell or '').strip() for cell in row] + [''] * 9
    kind, group, label, icon, color, essential, recurrence, suggested = cells[:8]
    merged = MERGES.get(label)
    family = merged.split('.')[0] if merged else family_of(kind, recurrence)
    key = merged or '%s.%s' % (family, slug(label))
    categories.append({
        'key': key,
        'family': family,
        'group': group,
        'label': label,
        'icon': icon,
        'color': color,
        'essential': essential.lower().startswith('oui'),
        'recurrence': recurrence,
        'suggestedFor': [part.strip() for part in suggested.split(',') if part.strip()],
        'mergedFrom': merged,
    })

assert len(categories) == 125, '%d catégories lues, 125 attendues' % len(categories)
labels = [c['label'] for c in categories]
assert len(set(labels)) == len(labels), 'libellé en double'
keys = [c['key'] for c in categories]
assert len(set(keys)) == len(keys), 'clé en double'
assert set(MERGES) <= set(labels), 'fusion vers un libellé absent : %s' % (set(MERGES) - set(labels))
assert set(MERGES.values()) <= existing_keys, 'fusion depuis une clé inconnue : %s' % (set(MERGES.values()) - existing_keys)
collisions = [c['key'] for c in categories if not c['mergedFrom'] and c['key'] in existing_keys]
assert not collisions, 'clé nouvelle déjà prise : %s' % collisions

content = '''// Référentiel universel des catégories (P8-08) — GÉNÉRÉ par
// scripts/generate-categories.py depuis l'onglet `09_Categories` du cahier
// consolidé. Ne pas modifier à la main : relancer le script.
//
// Les 125 catégories du client, mot pour mot. `mergedFrom` nomme l'ancienne
// catégorie (P6-02) que la nouvelle a absorbée : elle en garde la clé et
// l'identifiant, donc ses mouvements. `family` est une lecture mécanique de la
// récurrence typique (voir le script) : elle propose un type d'enveloppe, elle
// ne restreint rien. « Suggéré pour » ne fixe qu'un ordre d'affichage.

export const REFERENCE_CATEGORIES = %s;

// The old standard categories (P6-02) that stay as they are, and were already
// read as essential expenses: they keep that reading.
export const OLD_ESSENTIAL_KEYS = %s;
''' % (json.dumps(categories, ensure_ascii=False, indent=2), json.dumps(sorted(OLD_ESSENTIAL_KEYS)))
io.open(OUT, 'w', encoding='utf-8', newline='\n').write(content)

statements = ['''-- P8-08 — Les 125 catégories universelles du cahier consolidé. GÉNÉRÉ par
-- server/scripts/generate-categories.py : ne pas modifier à la main.
--
-- Les anciennes catégories qui recouvrent une nouvelle y sont fusionnées EN
-- PLACE : même clé, même identifiant, donc aucun mouvement ne bouge. Les
-- autres restent, et toutes les catégories des utilisateurs aussi.

ALTER TABLE `fin_categories` ADD COLUMN `group` VARCHAR(60) NULL,
    ADD COLUMN `icon` VARCHAR(16) NULL,
    ADD COLUMN `color` VARCHAR(9) NULL,
    ADD COLUMN `essential` BOOLEAN NULL,
    ADD COLUMN `recurrence` VARCHAR(40) NULL,
    ADD COLUMN `suggestedFor` JSON NULL;

UPDATE `fin_categories` SET `suggestedFor` = '[]';
ALTER TABLE `fin_categories` MODIFY `suggestedFor` JSON NOT NULL DEFAULT '[]';

-- The old standard categories keep their essential reading (false unless they
-- were among the onboarding's essential expenses).
UPDATE `fin_categories` SET `essential` = (`key` IN (%s)) WHERE `userId` IS NULL;
''' % ', '.join(sql(k) for k in sorted(OLD_ESSENTIAL_KEYS))]

for c in categories:
    fields = {
        'group': c['group'], 'label': c['label'], 'icon': c['icon'], 'color': c['color'],
        'essential': c['essential'], 'recurrence': c['recurrence'],
    }
    suggested = sql(json.dumps(c['suggestedFor'], ensure_ascii=False))
    if c['mergedFrom']:
        sets = ', '.join('`%s` = %s' % (name, sql(value)) for name, value in fields.items())
        statements.append("UPDATE `fin_categories` SET %s, `suggestedFor` = %s, `source` = 'document', `sourceRef` = %s, `version` = `version` + 1 WHERE `key` = %s AND `userId` IS NULL;"
                          % (sets, suggested, sql(SOURCE_REF), sql(c['key'])))
    else:
        identifier = str(uuid.uuid5(uuid.NAMESPACE_URL, 'fincludia:category:' + c['key']))
        statements.append(
            "INSERT INTO `fin_categories` (`id`, `userId`, `family`, `key`, `baseKey`, `label`, `group`, `icon`, `color`, `essential`, `recurrence`, `suggestedFor`, `scope`, `source`, `sourceRef`, `status`, `consentUses`, `version`, `createdAt`, `updatedAt`) VALUES (%s, NULL, %s, %s, NULL, %s, %s, %s, %s, %s, %s, %s, 'personal', 'document', %s, 'official', '[]', 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));"
            % (sql(identifier), sql(c['family']), sql(c['key']), sql(c['label']), sql(c['group']), sql(c['icon']), sql(c['color']), sql(c['essential']), sql(c['recurrence']), suggested, sql(SOURCE_REF)))

os.makedirs(os.path.dirname(MIGRATION), exist_ok=True)
io.open(MIGRATION, 'w', encoding='utf-8', newline='\n').write('\n'.join(statements) + '\n')

merged = sum(1 for c in categories if c['mergedFrom'])
print('%s : %d catégories (%d fusionnées, %d nouvelles)' % (os.path.relpath(OUT, ROOT), len(categories), merged, len(categories) - merged))
print(os.path.relpath(MIGRATION, ROOT))
