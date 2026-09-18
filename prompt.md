# 7. Prompt maître pour Claude Code

Utiliser ce prompt au début d'une session :

> Tu travailles sur une plateforme React + Express + PostgreSQL.
>
> Le fichier `TASKS.md` est la source de vérité du projet.
>
> Avant toute modification :
> 1. Lis entièrement la structure de `TASKS.md`.
> 2. Identifie la phase actuelle.
> 3. Identifie les tâches `todo` dont toutes les dépendances sont `done`.
> 4. Choisis uniquement la prochaine tâche autorisée selon l'ordre des phases et les priorités.
> 5. Ne commence pas une phase suivante tant que la phase actuelle n'est pas validée.
>
> Pour la tâche choisie :
> - analyse le code existant avant de modifier ;
> - implémente réellement la fonctionnalité ;
> - respecte la stack existante ;
> - ne réécris pas inutilement du code fonctionnel ;
> - respecte les règles de sécurité du fichier ;
> - vérifie le fonctionnement ;
> - corrige les erreurs rencontrées.
>
> Une fois la tâche terminée :
> - passe son statut à `✅ done` uniquement si elle est réellement terminée et vérifiée ;
> - ajoute une note courte si une décision technique importante a été prise ;
> - ne marque pas une tâche terminée si elle contient encore un TODO important ou une implémentation fictive.
>
> Si une tâche est bloquée :
> - passe-la à `⛔ blocked` ;
> - explique précisément le blocage dans une note ;
> - ne contourne pas arbitrairement une dépendance.
>
> Contraintes du projet :
> - délai maximum : 8 semaines ;
> - MVP prioritaire ;
> - priorité initiale aux pages frontend ;
> - E-Learning ensuite ;
> - Blog et outils ensuite ;
> - sécurité des contenus propriétaires obligatoire ;
> - aucune restriction frontend ne doit être considérée comme une vraie protection backend.
>
> À la fin de chaque session, donne :
> 1. les tâches terminées ;
> 2. les tâches encore bloquées ;
> 3. les tests effectués ;
> 4. la prochaine tâche recommandée selon `TASKS.md`.
>
> Ne développe pas une fonctionnalité hors périmètre simplement parce qu'elle semble intéressante.

---

# 8. Prompt de reprise de session

> Reprends le projet à partir de `TASKS.md`.
>
> Ne me demande pas quelle tâche faire si le fichier permet de la déterminer.
>
> Lis les statuts et les dépendances, identifie la prochaine tâche réalisable, puis :
> - inspecte le code concerné ;
> - implémente la tâche ;
> - teste-la ;
> - mets à jour `TASKS.md`.
>
> Ne passe pas à la phase suivante prématurément.

---

# 9. Prompt audit avant livraison

> Effectue un audit final du projet en utilisant `TASKS.md` comme référence.
>
> Vérifie :
> - les tâches déclarées `done` ;
> - les fonctionnalités réellement présentes ;
> - les dépendances ;
> - les parcours utilisateur principaux ;
> - l'authentification et les permissions ;
> - les contenus premium ;
> - la protection des médias ;
> - les uploads ;
> - les endpoints Express ;
> - les données PostgreSQL ;
> - les erreurs ;
> - la disponibilité ;
> - les sauvegardes ;
> - la génération PDF/Excel.
>
> Ne modifie pas massivement le projet pendant l'audit.
> Signale chaque écart entre `TASKS.md` et le code.
> Corrige uniquement les problèmes critiques nécessaires à la livraison dans le délai de 8 semaines.
> À la fin, mets à jour `TASKS.md` avec les résultats de l'audit.

---
