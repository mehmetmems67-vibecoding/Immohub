---
name: zaymmo-maintenance-evolution
description: Guide de maintenance et évolution de Zaymmo. Lire avant toute modification pour savoir exactement où intervenir sans casser l'existant. Contient la carte du code, les procédures de modification et les règles d'évolution.
---

# Zaymmo Maintenance & Evolution

## CARTE DU CODE APP.JSX

```
Lignes 1-50       : Imports + Constantes storage
Lignes 51-200     : Données statiques (I18N, PLATFORMS, CURRENCIES)
Lignes 201-400    : LANG_INSTRUCTIONS + aPrompt + sPrompt
Lignes 401-600    : Composants UI (Card, ST, MF, Steps, etc.)
Lignes 601-800    : Fonction App (Login)
Lignes 801-1000   : Fonction Zaymmo — States + Effets
Lignes 1001-1200  : Fonctions storage (getHistory, saveHistory, etc.)
Lignes 1201-1400  : Fonctions IA (callClaude, urlToB64, runAnalysis)
Lignes 1401-1600  : Fonctions annonce (genAnnonce, applyRev, etc.)
Lignes 1601-1800  : Fonctions impression (printPro, printClient)
Lignes 1801-2000  : Fonctions export (exportToPlatform, etc.)
Lignes 2001-2200  : Render — Login + Homepage + Panneaux
Lignes 2201-2400  : Render — Steps + Fiche bien + Photos
Lignes 2401-2600  : Render — Notes + Annonce + Aperçu + Fiche interne
Lignes 2601-2800  : Render — Barre basse + Admin
```

---

## AJOUTER UN NOUVEAU CHAMP META

```
1. Ajouter dans defaultMeta : nouveauChamp: ""  ou false
2. Ajouter dans le reset (resetAll) : nouveauChamp: ""
3. Ajouter l'UI dans la fiche bien (step "fiche")
4. Ajouter dans le prompt aPrompt() si nécessaire
5. Ajouter dans la sauvegarde (saveAnnonce) — automatique via {...meta}
6. Ajouter test QA dans 05-qa-agent.md
7. Lancer QA Agent — vérifier 0 erreur
```

---

## AJOUTER UNE NOUVELLE LANGUE

```
1. Ajouter dans I18N : { steps, typeBien, surface, ... equip }
2. Ajouter dans LANG_INSTRUCTIONS : instructions de rédaction
3. Ajouter dans PLATFORM_LANG : pays → langue
4. Ajouter dans configureSpeechRecognition : langue → code BCP47
5. Ajouter bouton langue dans le sélecteur d'annonce
6. Tester génération dans la nouvelle langue
```

---

## AJOUTER UNE NOUVELLE PLATEFORME

```
1. Ajouter dans PLATFORMS[pays] : { id, name, color, logo }
2. Vérifier que le pays existe déjà (sinon l'ajouter)
3. Tester l'export et la copie
4. Vérifier que la timeline enregistre l'export
```

---

## AJOUTER UN NOUVEAU STEP PIPELINE

```
1. Ajouter le step dans Steps.all array
2. Ajouter le label dans I18N[lang].steps
3. Créer la section JSX : {step==="nouveau"&&(<div>...</div>)}
4. Ajouter les boutons de navigation vers/depuis ce step
5. Mettre à jour resetAll() pour inclure le nouveau step initial si nécessaire
6. Mettre à jour reopenFromHistory() si le step doit être restauré
```

---

## MODIFIER UN PROMPT IA

```
1. Lire d'abord 09-prompts-ia.md
2. Tester le nouveau prompt sur 3 biens différents
3. Vérifier que le JSON retourné est toujours valide
4. Vérifier que le pré-remplissage fonctionne toujours
5. Documenter le changement dans ce fichier
```

---

## POINTS FRAGILES — NE PAS TOUCHER SANS PRÉCAUTION

```
⚠️  try/finally runAnalysis (// B06) — garantit setLoading(false)
⚠️  mountedRef.current — évite setState après unmount
⚠️  sleep(300) entre photos — évite rate limiting API
⚠️  URL.revokeObjectURL — évite fuites mémoire
⚠️  Fragments React <> </> — équilibre critique pour Vite
⚠️  VITE_ANTHROPIC_KEY — jamais hardcoder
⚠️  prefillFromSynth — ne jamais écraser les valeurs agent
```

---

## PROCÉDURE MODIFICATION STANDARD

```
1. Lire les skills concernés
2. Modifier App.jsx
3. Lancer QA Agent (python3 qa_syntax_agent.py src/App.jsx)
4. Si erreurs → corriger → relancer QA
5. Si 0 erreur → push GitHub
6. Attendre build Vercel (1-2 min)
7. Tester sur immohub-black.vercel.app
8. Si OK → noter la modification ici
9. Si KO → rollback via Vercel Dashboard
```

---

## HISTORIQUE DES DÉCISIONS TECHNIQUES

```
Haiku vs Sonnet   : Haiku choisi pour le coût (15-20x moins cher)
                    Migrer vers Sonnet quand client payant
localStorage       : Choisi pour simplicité — migrer Supabase Phase 3
Fichier unique     : App.jsx unique pour simplifier le déploiement mobile
                    Séparer en composants si > 3000 lignes
sessionStorage     : Auth en sessionStorage — perdu à la fermeture (sécurité)
Vite vs CRA        : Vite pour la vitesse de build sur Vercel
```

---

## ÉVOLUTIONS PRÉVUES

```
Court terme (Phase 1 complète) :
→ Bloc notes vocal complet
→ ZayZay bot intégré
→ IA Staging photos
→ Dashboard analytics

Moyen terme (Phase 2 drone) :
→ Migration localStorage → Supabase
→ Multi-utilisateurs agence
→ Intégration drone autonome
→ Visite virtuelle 360°

Long terme (Phase 3 SaaS) :
→ White label agences
→ API exposée
→ Dashboard admin multi-agences
→ Facturation par usage
```
