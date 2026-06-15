---
name: zaymmo-deploiement
description: Procédure de déploiement de Zaymmo. Suivre OBLIGATOIREMENT avant chaque push GitHub. Checklist complète pour garantir zéro crash sur Vercel.
---

# Zaymmo Déploiement

## STACK DE DÉPLOIEMENT

```
Repo      : mehmetmems67-vibecoding/Immohub (branche main)
Build     : npm run build (Vite)
Deploy    : Vercel (auto sur push main)
URL prod  : immohub-black.vercel.app
Node      : 18+
Fichier   : src/App.jsx (fichier unique)
Env var   : VITE_ANTHROPIC_KEY (dans Vercel Dashboard)
```

---

## CHECKLIST PRÉ-DÉPLOIEMENT

### Niveau 1 — Syntaxe (bloquant)
```
✓ Backticks équilibrés (pairs)
✓ Accolades équilibrées { }
✓ Parenthèses équilibrées ( )
✓ Fragments React équilibrés <> </>
✓ Pas de string cassée sur plusieurs lignes
✓ Pas de <- dans JSX
✓ export default function App présent
✓ import { useState } présent
```

### Niveau 2 — Fonctionnel (bloquant)
```
✓ MDP imoimoimoiaia présent
✓ VITE_ANTHROPIC_KEY utilisé (pas hardcodé)
✓ claude-haiku-4-5 comme modèle
✓ try/finally sur runAnalysis (// B06)
✓ mountedRef.current vérifié
✓ sleep défini avant runAnalysis
✓ URL.revokeObjectURL présent
```

### Niveau 3 — Qualité (recommandé)
```
✓ Pas de console.log() excessifs
✓ Taille fichier < 500KB
✓ Pas de TODO/FIXME critiques restants
✓ QA Agent lancé et validé (0 erreur)
```

---

## PROCÉDURE GITHUB (depuis téléphone)

### Option A — github.dev (recommandé)
```
1. Aller sur github.dev/mehmetmems67-vibecoding/Immohub
2. Ouvrir src/App.jsx
3. Ctrl+A → Supprimer
4. Coller le nouveau App.jsx
5. Ctrl+S
6. Icône Git (gauche) → Message "Update App.jsx" → Commit & Push
```

### Option B — Upload direct
```
1. github.com/mehmetmems67-vibecoding/Immohub
2. src/ → App.jsx → icône crayon ou ...
3. "Upload files" → glisser App.jsx
4. Commit changes
```

---

## ERREURS VERCEL FRÉQUENTES ET SOLUTIONS

```
ERREUR: Unterminated string literal (ligne X)
CAUSE:  String avec saut de ligne réel dans le code
FIX:    Remplacer le saut de ligne par \n dans la string

ERREUR: Unexpected closing fragment tag </>
CAUSE:  Fragment React non équilibré
FIX:    Compter les <> et </> — ajouter le manquant

ERREUR: Expected identifier but found "/"
CAUSE:  Fragment </> en trop
FIX:    Supprimer le </> en excès

ERREUR: Transform failed with N errors
CAUSE:  Plusieurs erreurs syntaxe
FIX:    Lancer QA Agent — corriger TOUTES les erreurs avant push

ERREUR: Cannot find module
CAUSE:  Import manquant ou incorrect
FIX:    Vérifier que tous les imports sont dans le même fichier App.jsx

ERREUR: Build timeout
CAUSE:  Fichier trop lourd ou dépendances manquantes
FIX:    Vérifier taille App.jsx < 500KB
```

---

## VARIABLES D'ENVIRONNEMENT VERCEL

```
Aller sur : vercel.com → Project → Settings → Environment Variables

Variable  : VITE_ANTHROPIC_KEY
Value     : sk-ant-api... (votre clé)
Env       : Production + Preview + Development

IMPORTANT : Après modification d'une env var
→ Faire un nouveau déploiement (Redeploy)
→ Les changements ne s'appliquent pas immédiatement
```

---

## VÉRIFICATION APRÈS DÉPLOIEMENT

```
1. Attendre 1-2 minutes que Vercel build
2. Ouvrir immohub-black.vercel.app
3. Tester login avec imoimoimoiaia
4. Tester ajout photo
5. Tester analyse (1 photo minimum)
6. Vérifier que la fiche est pré-remplie
7. Tester génération annonce
8. Tester sauvegarde

Si crash → Vérifier les logs Vercel Dashboard
Si erreur blanche → Ouvrir DevTools Console → copier l'erreur → corriger
```

---

## ROLLBACK SI CRASH

```
Si déploiement crash et version précédente fonctionnait :
1. Vercel Dashboard → Deployments
2. Trouver le dernier déploiement réussi
3. Cliquer "..." → "Promote to Production"
4. L'ancienne version est restaurée en 30 secondes
```

---

## LOGS VERCEL

```
Pour voir les erreurs de build :
1. vercel.com → Project → Deployments
2. Cliquer sur le déploiement en erreur
3. "Build Logs" → chercher les lignes en rouge
4. Les erreurs indiquent toujours le fichier et la ligne

Format erreur : /vercel/path0/src/App.jsx:1212:11: ERROR: ...
                                                  ^^^^ ligne 1212, colonne 11
```
