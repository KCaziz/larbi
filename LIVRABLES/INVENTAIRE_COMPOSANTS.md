# Inventaire des composants tiers et de leurs licences

> Généré le 2026-10-26 par `node server/scripts/generate-deliverables.js`. Ne pas modifier à la main.

Livrable de l'**article 14** du contrat : « Le Prestataire communique au Client la liste des bibliothèques, frameworks, plugins, API et composants tiers intégrés […]. Les composants tiers restent soumis à leurs licences respectives. »

**40 composants**, 8 licences distinctes.

Les versions indiquées sont celles **réellement installées**, pas les intervalles demandés : c'est le code installé qui est livré.

Tous les composants déclarent une licence.

## Licences à signaler au Client

L'article 14 demande que les obligations significatives soient portées à la connaissance du Client. Ces composants portent une licence à obligations de redistribution. Ils sont utilisés **tels quels, sans modification**, ce qui est le cas d'usage que ces licences prévoient — mais la décision d'accepter l'obligation appartient au Client, pas au Prestataire.

- `mariadb` 3.5.4 (serveur, développement) — **LGPL-2.1-or-later**
- `dompurify` 3.4.15 (client, production) — **(MPL-2.0 OR Apache-2.0)** — licence double : la branche permissive peut être retenue, et aucune obligation de redistribution ne joue alors.

## Répartition par licence

| Licence | Composants |
| --- | --- |
| (MPL-2.0 OR Apache-2.0) | 1 |
| Apache-2.0 | 3 |
| BSD-2-Clause | 1 |
| BSD-3-Clause | 1 |
| ISC | 1 |
| LGPL-2.1-or-later | 1 |
| MIT | 29 |
| OFL-1.1 | 3 |

## Détail

| Paquet | Nature | Composant | Version installée | Intervalle demandé | Licence |
| --- | --- | --- | --- | --- | --- |
| serveur | production | `@prisma/adapter-mariadb` | 7.10.0 | `7.10.0` | Apache-2.0 |
| serveur | production | `@prisma/client` | 7.10.0 | `^7.10.0` | Apache-2.0 |
| serveur | production | `bcryptjs` | 3.0.3 | `^3.0.3` | BSD-3-Clause |
| serveur | production | `cookie-parser` | 1.4.7 | `^1.4.7` | MIT |
| serveur | production | `cors` | 2.8.6 | `^2.8.5` | MIT |
| serveur | production | `dotenv` | 16.6.1 | `^16.4.5` | BSD-2-Clause |
| serveur | production | `exceljs` | 4.4.0 | `^4.4.0` | MIT |
| serveur | production | `express` | 4.22.3 | `^4.21.0` | MIT |
| serveur | production | `express-rate-limit` | 8.7.0 | `^8.7.0` | MIT |
| serveur | production | `file-type` | 22.1.1 | `^22.1.1` | MIT |
| serveur | production | `helmet` | 7.2.0 | `^7.1.0` | MIT |
| serveur | production | `jsonwebtoken` | 9.0.3 | `^9.0.3` | MIT |
| serveur | développement | `mariadb` | 3.5.4 | `^3.5.4` | LGPL-2.1-or-later |
| serveur | production | `morgan` | 1.12.1 | `^1.10.0` | MIT |
| serveur | production | `multer` | 2.4.0 | `^2.4.0` | MIT |
| serveur | développement | `prisma` | 7.10.0 | `^7.10.0` | Apache-2.0 |
| serveur | production | `sanitize-html` | 2.17.7 | `^2.17.7` | MIT |
| serveur | production | `zod` | 4.6.5 | `^4.6.5` | MIT |
| client | production | `@dnd-kit/core` | 6.3.1 | `^6.3.1` | MIT |
| client | production | `@dnd-kit/sortable` | 10.0.0 | `^10.0.0` | MIT |
| client | production | `@dnd-kit/utilities` | 3.2.2 | `^3.2.2` | MIT |
| client | production | `@fontsource-variable/inter` | 5.3.0 | `^5.3.0` | OFL-1.1 |
| client | production | `@fontsource-variable/sora` | 5.3.0 | `^5.3.0` | OFL-1.1 |
| client | production | `@fontsource/ibm-plex-sans-arabic` | 5.3.0 | `^5.3.0` | OFL-1.1 |
| client | production | `@tiptap/pm` | 3.31.3 | `^3.31.3` | MIT |
| client | production | `@tiptap/react` | 3.31.3 | `^3.31.3` | MIT |
| client | production | `@tiptap/starter-kit` | 3.31.3 | `^3.31.3` | MIT |
| client | développement | `@types/react` | 19.3.0 | `^19.2.18` | MIT |
| client | développement | `@types/react-dom` | 19.3.0 | `^19.2.7` | MIT |
| client | développement | `@vitejs/plugin-react` | 6.1.1 | `^6.1.1` | MIT |
| client | production | `dompurify` | 3.4.15 | `^3.4.15` | (MPL-2.0 OR Apache-2.0) |
| client | production | `i18next` | 26.4.2 | `^26.4.2` | MIT |
| client | production | `i18next-browser-languagedetector` | 8.2.1 | `^8.2.1` | MIT |
| client | production | `lucide-react` | 1.47.0 | `^1.47.0` | ISC |
| client | développement | `oxlint` | 1.83.0 | `^1.81.0` | MIT |
| client | production | `react` | 19.3.0 | `^19.2.8` | MIT |
| client | production | `react-dom` | 19.3.0 | `^19.2.8` | MIT |
| client | production | `react-i18next` | 17.0.14 | `^17.0.14` | MIT |
| client | production | `react-router-dom` | 7.18.4 | `^7.18.4` | MIT |
| client | développement | `vite` | 8.3.0 | `^8.3.0` | MIT |

