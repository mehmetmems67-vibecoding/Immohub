---
name: zaymmo-blueprint-planning
description: Copilot de planning pour toute nouvelle fonctionnalité Zaymmo. Lire AVANT de coder toute fonctionnalité non-triviale (nouveau skill majeur, refonte de section, Phase 2 drone). Source adaptée de imbue-ai/blueprint. Pose les bonnes questions avant d'écrire du code plutôt que de foncer ou deviner le plan.
---

# Zaymmo Blueprint Planning

## PRINCIPE

La plupart des agents codent trop vite ou devinent le plan.
Blueprint ralentit juste assez pour poser les bonnes questions
AVANT d'écrire le code — puis produit un plan markdown exécutable en une fois.

```
Idée initiale (Mem's) → Questions structurées (Claude) → Décisions (Mem's)
                       → Plan markdown exécutable → Implémentation en un shot
```

Blueprint partage le planning entre les deux : l'idée initiale vient de Mem's,
l'énumération des considérations et choix vient de Claude, les décisions
reviennent à Mem's. Mem's évite les parties fastidieuses du planning
tout en restant aux commandes.

---

## QUAND UTILISER CE SKILL

```
OBLIGATOIRE pour :
✓ Toute nouvelle Phase (Phase 2 drone, Phase 3 SaaS)
✓ Refonte complète d'une section majeure de l'app
✓ Ajout d'un système complexe (ex: vrai backend, multi-utilisateurs)
✓ Toute fonctionnalité touchant plus de 3 fichiers/sections à la fois

PAS NÉCESSAIRE pour :
✗ Correction de bug simple (→ utiliser Systematic Debugging, skill 58)
✗ Ajout d'un seul champ meta (→ suivre directement skill 24-maintenance)
✗ Modification de couleur/texte mineure
```

---

## LE PROCESSUS EN 4 ÉTAPES

### Étape 1 — Description courte de la tâche
```
Mem's décrit l'idée en une phrase, comme on l'a toujours fait :
"On va lancer la refonte complète de Zaymmo en lisant tous les skills"
"On ajoute le mode drone Phase 2"
```

### Étape 2 — Exploration + questions
```
Claude explore le contexte disponible (skills existants, App.jsx actuel)
et pose des questions À CHOIX MULTIPLE faciles à répondre.

Exemple pour la refonte Zaymmo :
"Pour la nouvelle architecture, tu préfères :
 A) Garder un fichier unique App.jsx (simple à déployer)
 B) Séparer en plusieurs composants (plus propre, plus complexe à déployer)
 C) Hybride — composants logiques mais un seul fichier de build"

Mem's répond ce qui compte, ignore le reste.
```

### Étape 3 — Itération
```
Les questions suivantes s'enchaînent naturellement selon les réponses.
Si Mem's choisit "fichier unique" → pas de question sur la structure de dossiers
Si Mem's choisit "drone Phase 2" → questions sur le protocole de communication drone
```

### Étape 4 — Génération du plan
```
Quand assez de terrain est couvert, Claude génère le plan complet.
Le plan est écrit en markdown, structuré, exécutable en une session.
```

---

## STRUCTURE DU PLAN GÉNÉRÉ (template Zaymmo)

```markdown
# Plan : [Nom de la fonctionnalité]

## Statut
🔵 Planifié | 🟡 En cours | 🟢 Terminé | 🔴 En pause

## Contexte
[Pourquoi cette fonctionnalité, lien avec les skills existants concernés]

## Décisions prises
- [Décision 1 — pourquoi]
- [Décision 2 — pourquoi]

## Skills concernés
- [Liste des skills à lire avant de coder]

## Étapes d'implémentation
1. [Étape précise et actionnable]
2. [Étape précise et actionnable]
3. [...]

## Tests requis (lien Agent QA)
- [ ] Test fonctionnel 1
- [ ] Test fonctionnel 2

## Questions ouvertes
- [Ce qui reste à clarifier, s'il y en a]

## Critères de succès
- [Comment on sait que c'est terminé et que ça marche]
```

---

## EXEMPLE APPLIQUÉ — PLAN REFONTE ZAYMMO

```markdown
# Plan : Refonte complète Zaymmo avec architecture skills

## Statut
🔵 Planifié

## Contexte
64 skills créés couvrant Design, Architecture, Pipeline, Intelligence IA,
Sécurité. La refonte doit produire un App.jsx propre qui respecte TOUS
ces skills dès le premier jet, plutôt que d'empiler des patchs comme
les versions précédentes.

## Décisions prises
- Fichier unique App.jsx conservé (skill 02-architecture) — simplicité déploiement
- Pipeline Photos→Analyse→Fiche→Notes→Annonce→Aperçu→Fiche interne (skill 03)
- Couleurs cuivre/cyan/sombre (skill 01)
- Auto-apprentissage actif dès le départ (skill 15)

## Skills concernés (lecture obligatoire avant code)
- 01-design-system, 02-architecture, 03-ux-flow, 04-navigation-fluidite
- 05-qa-agent (validation après écriture)
- 06 à 57 (logique métier et fonctionnalités)
- 58-64 (skills techniques récupérés GitHub)

## Étapes d'implémentation
1. Structure de base (imports, constantes, I18N) — skills 02, 07
2. Composants UI réutilisables (Card, ST, MF, Steps) — skill 01
3. Login + page d'accueil — skills 01, 03
4. Pipeline complet step par step — skills 03, 04, 09, 10
5. Fonctions IA (callClaude, urlToB64, runAnalysis) — skills 09, 10
6. ZayZay bot intégré — skill 11
7. Historique + sauvegarde — skill 08
8. Toutes les fonctionnalités business (CRM, agenda, scoring...) — skills 13, 33-57
9. Sécurité et RGPD appliqués partout — skills 25, 59, 63, 64

## Tests requis
- [ ] QA Agent syntaxe 100%
- [ ] QA Agent fonctionnel 100%
- [ ] Test manuel pipeline complet (skill 62)
- [ ] Test sur Xiaomi 14T réel

## Questions ouvertes
- Volume de code estimé — possible besoin de multiple sessions

## Critères de succès
- Déploiement Vercel sans erreur
- Pipeline complet fonctionnel de bout en bout
- Pré-remplissage IA fonctionne (bug historique résolu définitivement)
- Bouton Sauvegarder visible (bug historique résolu définitivement)
```

---

## RÈGLE D'OR — NE PAS SAUTER LES QUESTIONS

```
Même sous pression de temps (session limitée), TOUJOURS :
1. Poser au moins les questions structurantes critiques
2. Ne jamais deviner une décision d'architecture majeure
3. Documenter les décisions prises pour les sessions futures

Un plan de 5 minutes de questions évite des heures de refonte
si la direction choisie s'avère mauvaise après coup.
```

---

## INTÉGRATION AVEC LES AUTRES SKILLS

```
Blueprint Planning précède :
→ Skill 24 (Maintenance & Evolution) pour les détails d'implémentation
→ Skill 58 (Systematic Debugging) si quelque chose casse en cours de route
→ Skill 05 (QA Agent) pour valider après chaque étape du plan

Workflow complet :
Idée → Blueprint (ce skill) → Plan validé → Code étape par étape
→ QA Agent après chaque étape → Webapp Testing (skill 62) → Livraison
```

---

*Source originale : imbue-ai/blueprint — adapté pour le contexte Zaymmo (pas de fichiers persistants séparés, intégré au workflow conversationnel existant)*
