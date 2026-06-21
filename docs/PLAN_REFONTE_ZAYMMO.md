# PLAN BLUEPRINT — REFONTE COMPLÈTE ZAYMMO

## Statut
🔵 Planifié — Prêt à exécuter à 100% de quota

## Contexte
67 skills + 46 agents créés et validés sur GitHub. La refonte doit produire
un App.jsx propre qui respecte TOUS les skills dès le premier jet, plutôt
que d'empiler des patchs comme les versions précédentes (v1 à v7).

Bugs historiques à résoudre définitivement dans cette refonte :
- Pré-remplissage IA non connecté (confirmé par Agent 11 — Prefill)
- Sanitization notes_agent manquante avant prompt (confirmé par Agent 45 — Ironclaw Guard)
- Bouton Sauvegarder parfois invisible
- "Nouvelle annonce" qui ne repart pas toujours de zéro

---

## DÉCISIONS PRISES (validées dans les sessions précédentes)

| Sujet | Décision | Skill source |
|---|---|---|
| Architecture fichier | Fichier unique App.jsx | 02 |
| Pipeline | Photos → Analyse → Fiche (correction) → Notes → Annonce → Aperçu → Fiche interne | 03, 04 |
| Couleurs | Cuivre #C8793A + Cyan #00D4E8 + Fond #080808 | 01 |
| Logo | ZAY monogramme PNG (Gemini) + ZAYMMO en dessous | 01 |
| Modèle IA | claude-haiku-4-5 (coût optimisé) | 09 |
| Stockage | localStorage uniquement (Phase 1) | 02, 08 |
| Auth | sessionStorage avec hash SHA-256 | 25, 59 |
| Langues | FR, EN, DE, LU, NL | 07 |
| Pays | FR, LU, BE, DE, GB | 06 |

---

## ORDRE D'EXÉCUTION — 12 BLOCS

### BLOC 1 — Fondations (skills 01, 02, 07)
```
1.1 Imports React + constantes storage (STORAGE_KEY, HISTORY_KEY, SAVED_KEY)
1.2 Objet couleurs C{} complet (skill 01)
1.3 I18N complet 5 langues (skill 07) — structure complète avec tous les
    champs (steps, typeBien, surface, equip[], etc.)
1.4 LANG_INSTRUCTIONS avec règles luxembourgeoises précises (skill 07)
1.5 PLATFORMS{} par pays (skill 06)
1.6 CURRENCIES + CURRENCY_SYMBOLS (skill 06)
1.7 DPE_COLORS (skill 13)
```

### BLOC 2 — Utilitaires & sécurité (skills 22, 25, 59, 63, 64)
```
2.1 sleep() — défini en tout premier, avant tout usage
2.2 urlToB64() avec compression 1024px qualité 0.85 (skill 10, 22)
2.3 fileToB64() avec revokeObjectURL (skill 22)
2.4 hashPassword() / verifyPassword() SHA-256 (skill 25, 59)
2.5 sanitizeForPrompt() — protection prompt injection (skill 59, 64) ⚠️ BUG À CORRIGER
2.6 detectPII() / redactPII() basique (skill 64)
2.7 callClaude() avec retry + timeout 60s (skill 09, 19)
```

### BLOC 3 — Composants UI réutilisables (skills 01, 04, 61)
```
3.1 Card, ST (section title), MF (meta field), Label
3.2 Steps (step bar avec nouvelle séquence photos→fiche→notes→annonce→apercu→fiche_interne)
3.3 Boutons standards (primaire, secondaire, cyan, destructif) — skill 01
3.4 DPEBadge, ScoreCircle (skill 13)
3.5 Drone SVG component réutilisable (skill 01)
3.6 Logo ZAY (image PNG) + ZAYMMO text (skill 01)
```

### BLOC 4 — Authentification & structure App (skills 01, 25)
```
4.1 Fonction App() — Login avec hashPassword
4.2 getUsers/saveUsers/getSession/saveSession/clearSession
4.3 Compte admin auto-créé si absent (imoimoimoiaia)
4.4 Gestion des rôles (admin/invite) — hasPermission()
4.5 Timeout de session (skill 25)
```

### BLOC 5 — State management Zaymmo principal (skill 02)
```
5.1 defaultMeta{} COMPLET avec tous les champs (code_postal, sdb, wc,
    garage, poele_granules, chambre_parentale, notes_agent,
    conso_kwh_n1/n2, triple_vitrage, etc.)
5.2 Tous les useState (homepage, step="photos", meta, photos, analyses,
    synth, annonce, annonces, etc.)
5.3 mountedRef + useEffect cleanup
5.4 resetAll() COMPLET — reset à TOUS les champs ⚠️ BUG À CORRIGER
```

### BLOC 6 — Pipeline Photos → Analyse (skills 03, 09, 10, 11)
```
6.1 Step "photos" — UI ajout galerie/URL/caméra
6.2 runAnalysis() avec try/finally (// B06), boucle photos, sleep(300)
6.3 sPrompt() et photoPrompt() complets (skill 09)
6.4 prefillFromSynth() — CONNEXION CRITIQUE ⚠️ BUG HISTORIQUE À CORRIGER
    DOIT être appelé juste après setSynth() dans runAnalysis()
6.5 Navigation auto vers step "fiche" après analyse
6.6 Affichage résultats (score, points forts/faibles, home staging) — skill 10, 13
```

### BLOC 7 — Step Fiche bien / correction (skills 01, 03, 06)
```
7.1 Tous les champs meta dans l'ordre UX (skill 03) :
    Pays → Type → Surface → Prix → Code postal → Ville →
    Pièces/Chambres/SDB/WC → Étage/Année/Charges →
    DPE/GES/Chauffage/Exposition → Langue annonce
7.2 Caractéristiques supplémentaires (cheminée, dressing, poêle, chambre parentale, sous-sol)
7.3 Consommation énergétique N-1/N-2 (kWh + devise)
7.4 Équipements (15 cases incluant triple_vitrage, garage)
7.5 Bannière verte "Analyse IA terminée" + bouton "Modifier photos"
7.6 Bouton "Notes agent" → navigation step "notes"
```

### BLOC 8 — Step Notes + Vocal (skills 12, 64)
```
8.1 Zone textarea notes_agent
8.2 startVoice() avec SpeechRecognition (skill 12)
8.3 transcriptionPrompt() nettoyage IA (skill 12)
8.4 Application sanitizeForPrompt() avant TOUT envoi au prompt annonce ⚠️ FIX SÉCURITÉ
8.5 Bouton "Générer l'annonce" → genAnnonce()
```

### BLOC 9 — Génération Annonce (skills 09, 14, 21, 57)
```
9.1 aPrompt() complet avec storytelling (skill 14), emotion/ton (skill 57)
9.2 genAnnonce() avec sanitization notes_agent ⚠️ FIX SÉCURITÉ
9.3 Navigation auto vers step "annonce"
9.4 Mode révision (raccourcir 50%, reformuler) + Undo (skill 09)
9.5 Multi-langue (genAnnonceForLang, onglets)
9.6 saveAnnonce() — bouton VISIBLE et fonctionnel ⚠️ BUG À CORRIGER
9.7 Bouton "+ Nouveau bien" → resetAll() COMPLET
```

### BLOC 10 — Historique & Sauvegarde (skill 08)
```
10.1 addToHistory() avec timeline[]
10.2 updateHistoryEntry() après annonce générée + après export
10.3 reopenFromHistory() — restauration COMPLÈTE (meta+synth+annonce+annonces)
10.4 saveAnnonce()/reopenFromSaved() pour les sauvegardées
10.5 Panneaux UI Historique + Sauvegardées avec timeline visible
```

### BLOC 11 — Aperçu, Export, Fiche interne (skills 06, 29, 31)
```
11.1 Step "apercu" — sélection pays/plateforme, aperçu stylé
11.2 exportToPlatform() avec copie clipboard + timeline update
11.3 generateSEOTitle() optimisé par plateforme (skill 29)
11.4 Step "fiche_interne" — Fiche PRO (confidentielle) + Fiche CLIENT
11.5 printPro()/printClient() avec QR code (skill 31)
11.6 Fix bugs D/E (texte/tags qui débordent sur les photos)
```

### BLOC 12 — Page d'accueil & Navigation (skills 03, 04)
```
12.1 Page accueil avec 3 boutons (Nouvelle annonce/Historique/Sauvegardées)
12.2 Header avec logo + bouton Accueil toujours visible
12.3 ZayZay bouton flottant + panneau (skill 11) — SI temps suffisant
12.4 Step bar avec nouvelle séquence à 6 étapes
```

---

## FONCTIONNALITÉS REPORTÉES (si manque de temps/quota)

Ces blocs peuvent être ajoutés en session suivante sans bloquer le lancement :
- ZayZay bot complet (skill 11) — peut être ajouté après la base fonctionnelle
- CRM Contacts (skill 36) — fonctionnalité additionnelle
- Agenda Visites (skill 35) — fonctionnalité additionnelle
- IA Staging (skill 27) — nécessite API tierce non encore choisie
- Toutes les fonctionnalités "Intelligence avancée" (Neural Price, Brain, etc.)
  peuvent être ajoutées progressivement après la V1 de la refonte

**Priorité absolue : Blocs 1 à 12 = app 100% fonctionnelle et sans bug historique**

---

## TESTS REQUIS (Agent QA + zaymmo_agents.py)

```
Après CHAQUE bloc majeur (5, 6, 9, 10) :
☐ Lancer python3 zaymmo_agents.py --category=pipeline_qualite (bloquant)
☐ Lancer python3 zaymmo_agents.py --category=pipeline_zaymmo (bloquant)
☐ Lancer python3 zaymmo_agents.py --category=securite_avancee (bloquant)

Après le code complet (fin bloc 12) :
☐ python3 zaymmo_agents.py src/App.jsx (suite complète, 46 agents)
☐ 0 erreur bloquante obligatoire avant livraison
☐ Test manuel pipeline complet (skill 62) sur Vercel après déploiement
```

---

## CRITÈRES DE SUCCÈS DE LA REFONTE

```
☐ Déploiement Vercel sans erreur de build
☐ Pipeline complet fonctionnel : Photos→Analyse→Fiche→Notes→Annonce→Aperçu→Fiche interne
☐ BUG RÉSOLU : pré-remplissage IA fonctionne (vérifié Agent 11)
☐ BUG RÉSOLU : bouton Sauvegarder toujours visible
☐ BUG RÉSOLU : sanitization notes_agent avant prompt (vérifié Agent 45)
☐ BUG RÉSOLU : "Nouveau bien" reset complet
☐ Historique + Sauvegardées avec restauration complète
☐ Multi-langue fonctionnel (au moins FR + LU avec règles grammaticales)
☐ Export plateformes avec timeline
☐ Tous les 46 agents passent en catégories bloquantes (01-04, 09-12, 45-46)
```

---

## ESTIMATION VOLUME

```
Code estimé total      : ~3000-3500 lignes (similaire aux versions précédentes
                          mais mieux organisé et sans dette technique)
Sessions nécessaires    : probablement 1 session à 100% si concentrée sur
                          Blocs 1-12, en suivant strictement ce plan
Stratégie si coupure    : chaque bloc est indépendamment testable —
                          on peut s'arrêter proprement après n'importe quel bloc
```

---

## PROCHAINE SESSION — CHECKLIST DE DÉMARRAGE

```
1. Lire ce document en entier
2. Lire skills 01, 02, 03, 04 (fondation) avant de commencer le Bloc 1
3. Lire skill 65 (Blueprint) — déjà fait en écrivant ce plan
4. Commencer Bloc 1, dans l'ordre, sans sauter d'étape
5. Tester avec zaymmo_agents.py après chaque bloc critique (5, 6, 9, 10)
6. Ne PAS ajouter de fonctionnalité hors plan sans le valider avec Mem's d'abord
```
