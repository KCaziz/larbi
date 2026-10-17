# -*- coding: utf-8 -*-
# Lit un classeur du client et en sort le texte, onglet par onglet.
#
# Outil de lecture, pas de génération : les scripts qui produisent du code
# (generate-journeys.py, generate-postal.py) extraient un onglet précis vers un
# fichier de constantes. Celui-ci sert à REGARDER un classeur avant de décider
# quoi en extraire — étape qui a été faite à la main jusqu'ici, et refaite à
# chaque nouveau classeur.
#
#   python scripts/read-xlsx.py <classeur.xlsx> [onglet ...]
#
# Sans nom d'onglet : la liste des onglets et leurs dimensions.
import html
import io
import os
import re
import sys
import zipfile


def read_workbook(path):
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


def main():
    if len(sys.argv) < 2:
        print(__doc__ or 'usage: read-xlsx.py <classeur.xlsx> [onglet ...]')
        return 1
    path = sys.argv[1]
    wanted = sys.argv[2:]
    sheets = read_workbook(path)

    stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace', newline='\n')
    if not wanted:
        stdout.write('%s — %d onglets\n\n' % (os.path.basename(path), len(sheets)))
        for name, rows in sheets.items():
            filled = [r for r in rows if any(r)]
            width = max((len(r) for r in filled), default=0)
            stdout.write('%-28s %4d lignes x %2d colonnes\n' % (name, len(filled), width))
        stdout.flush()
        return 0

    for name in wanted:
        matches = [k for k in sheets if k == name or k.lower().startswith(name.lower())]
        if not matches:
            stdout.write('onglet introuvable : %s\n' % name)
            continue
        for key in matches:
            stdout.write('===== %s =====\n' % key)
            for row in sheets[key]:
                if any(row):
                    stdout.write(' | '.join(row) + '\n')
            stdout.write('\n')
    stdout.flush()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
