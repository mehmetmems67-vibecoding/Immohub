---
name: zaymmo-systematic-debugging
description: Méthodologie de débogage systématique adaptée pour Zaymmo. À utiliser OBLIGATOIREMENT avant toute correction de bug sur App.jsx, échec de build Vercel, ou comportement inattendu. Source adaptée de ChrisWiles/claude-code-showcase. Garantit ~95% de réussite au premier essai vs ~40% en correction au hasard.
---

# Zaymmo Systematic Debugging

## PRINCIPE FONDAMENTAL

**AUCUNE CORRECTION SANS INVESTIGATION DE LA CAUSE RACINE D'ABORD.**

Ne jamais appliquer de correctif symptomatique qui masque le problème réel.
Comprendre POURQUOI ça échoue avant de tenter de corriger.

Sur Zaymmo, ce principe s'applique particulièrement aux :
- Erreurs de build Vercel (strings cassées, fragments React)
- Bugs de pipeline (step qui ne s'affiche pas, données qui se perdent)
- Erreurs API (analyse qui échoue, annonce mal générée)

---

## LE FRAMEWORK EN 4 PHASES

### Phase 1 — Investigation de la cause racine

Avant de toucher au code :

```
1. Lire le message d'erreur en entier — chaque mot compte
   (ex: "Unterminated string literal ligne 1212" → chercher EXACTEMENT ligne 1212)
2. Reproduire le problème de façon constante
   (relancer le QA Agent, vérifier que l'erreur persiste)
3. Examiner les changements récents — qu'est-ce qui a changé avant que ça casse ?
4. Rassembler les preuves diagnostiques — logs Vercel, sortie QA Agent
5. Tracer le flux de données — suivre la chaîne jusqu'à l'origine du problème
```

**Technique de traçage de la cause racine (adaptée Zaymmo) :**
```
1. Observer le symptôme — où l'erreur apparaît-elle ? (ligne Vercel, comportement UI)
2. Trouver la cause immédiate — quel code produit directement l'erreur ?
3. Demander "Qu'est-ce qui a appelé ça ?" — remonter la chaîne d'appels
   (ex: un step ne s'affiche pas → quelle condition contrôle son affichage ?)
4. Continuer à remonter — suivre les données invalides en arrière
5. Trouver le déclencheur original — où le problème a-t-il vraiment commencé ?
```

**Principe clé :** Ne jamais corriger uniquement là où l'erreur apparaît —
toujours remonter jusqu'au déclencheur original.

---

### Phase 2 — Analyse de pattern

```
1. Localiser des exemples qui fonctionnent — un step similaire qui marche
2. Comparer les implémentations complètement — pas juste survoler
3. Identifier les différences — qu'est-ce qui diffère entre ce qui marche et ce qui casse ?
4. Comprendre les dépendances — de quoi ce code dépend-il ?
```

Exemple Zaymmo : si le step "notes" ne s'affiche pas mais "fiche" fonctionne,
comparer EXACTEMENT leurs conditions `{step==="X"&&(...)}`.

---

### Phase 3 — Hypothèse et test

```
1. Formuler UNE hypothèse claire — "L'erreur survient parce que X"
2. Concevoir un test minimal — changer UNE seule variable à la fois
3. Prédire le résultat — que devrait-il se passer si l'hypothèse est correcte ?
4. Exécuter le test — lancer le QA Agent ou tester sur Vercel
5. Vérifier les résultats — le comportement correspond-il à la prédiction ?
6. Itérer ou avancer — affiner l'hypothèse si fausse, implémenter si juste
```

---

### Phase 4 — Implémentation

```
1. Créer un cas de test qui échoue — capture le comportement du bug
   (ex: ajouter le test correspondant dans qa_syntax_agent.py)
2. Implémenter UNE seule correction — adresser la cause racine, pas le symptôme
3. Vérifier que le test passe — confirme que la correction fonctionne
4. Lancer la suite complète QA Agent — s'assurer qu'il n'y a pas de régression
5. Si la correction échoue, STOP — réévaluer l'hypothèse
```

**Règle critique :** Si TROIS corrections ou plus échouent consécutivement, STOP.
Cela signale un problème d'architecture nécessitant une refonte de section,
pas plus de correctifs.

---

## DRAPEAUX ROUGES — VIOLATIONS DU PROCESSUS

Arrêter immédiatement si on se surprend à penser :

```
❌ "Correction rapide pour l'instant, j'investiguerai plus tard"
❌ "Encore un essai" (après plusieurs échecs)
❌ "Ça devrait marcher" (sans comprendre pourquoi)
❌ "Laisse-moi juste essayer..." (sans hypothèse)
❌ "Ça marche en local" (sans investiguer la différence avec Vercel)
```

---

## SCÉNARIOS DE DÉBOGAGE COURANTS ZAYMMO

### Erreur de build Vercel
```
1. Lire le message COMPLET et le numéro de ligne exact
2. Identifier quel type d'erreur (string cassée, fragment, accolade)
3. Vérifier le contexte autour de la ligne (±10 lignes)
4. Lancer qa_syntax_agent.py pour confirmer l'équilibrage
5. Corriger à LA source, pas en ajoutant des patchs autour
```

### Step qui ne s'affiche pas
```
1. Vérifier la condition exacte : {step==="X"&&(...)}
2. Vérifier que setStep("X") est bien appelé quelque part
3. Vérifier qu'aucune autre condition ne bloque l'affichage
4. Tracer depuis le bouton qui devrait déclencher la navigation
5. Ajouter un console.log temporaire pour voir la vraie valeur de step
```

### Analyse IA qui échoue
```
1. Capturer l'erreur API complète (status code, message)
2. Vérifier la clé API (présente, valide, non expirée)
3. Vérifier le format des données envoyées (base64 valide ?)
4. Tracer en arrière : photo → conversion → appel API
5. Tester avec UNE seule photo simple pour isoler le problème
```

### "Ça marchait avant"
```
1. Comparer avec la dernière version qui fonctionnait (App_v6 vs App_v7)
2. Identifier précisément ce qui a changé entre les deux
3. Identifier quelle hypothèse implicite a été violée
4. Corriger à la source de la violation
```

### Données qui se perdent entre steps
```
1. Vérifier que setMeta/setSynth/setAnnonce sont appelés au bon moment
2. Vérifier que resetAll() ne réinitialise pas par erreur
3. Tracer le state à chaque transition de step
4. Vérifier mountedRef.current avant chaque setState async
```

---

## CHECKLIST AVANT DE DÉCLARER UN BUG CORRIGÉ

```
☐ Cause racine identifiée et documentée
☐ Hypothèse formulée et testée
☐ La correction adresse la cause racine, pas le symptôme
☐ QA Agent relancé et passe à 100%
☐ Testé sur Vercel après déploiement (pas que en théorie)
☐ Pas de rationalisation "correction rapide" utilisée
☐ La correction est minimale et ciblée
```

---

## INTÉGRATION AVEC L'AGENT QA ZAYMMO

```
Le Systematic Debugging précède toujours l'Agent QA :

1. Bug détecté (par l'utilisateur ou Vercel)
2. Systematic Debugging — Phase 1 à 4 — trouver et corriger la cause racine
3. Agent QA Syntaxe — vérifier l'équilibrage du code
4. Agent QA Fonctionnel — vérifier qu'aucune fonctionnalité n'est cassée
5. Si tout est vert → livraison
6. Si rouge → retour à Phase 1 du Systematic Debugging
```

---

## MÉTRIQUES DE SUCCÈS

```
Débogage systématique : ~95% de réussite au premier essai
Débogage au hasard     : ~40% de réussite au premier essai

Signes que c'est bien fait :
✓ Les corrections ne créent pas de nouveaux bugs
✓ On peut expliquer POURQUOI le bug est survenu
✓ Des bugs similaires ne se reproduisent pas
✓ Le code est meilleur après la correction, pas juste "qui marche"
```

---

*Source originale : ChrisWiles/claude-code-showcase — adapté pour le contexte Zaymmo*
