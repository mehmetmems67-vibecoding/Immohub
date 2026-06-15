---
name: zaymmo-ux-flow
description: Flux UX complet de Zaymmo. Lire avant toute modification de navigation, ajout d'écran, changement de pipeline ou modification d'interaction utilisateur. Contient chaque micro-interaction, transition, état de chargement et feedback visuel définis précisément.
---

# Zaymmo UX Flow

## PRINCIPES UX FONDAMENTAUX

1. **L'IA travaille, l'agent valide** — jamais l'inverse
2. **Zéro friction** — chaque action doit être évidente sans explication
3. **Feedback immédiat** — chaque action déclenche une réponse visuelle instantanée
4. **Pas de perte de données** — confirmation avant toute action destructive
5. **Mobile first** — tout pensé pour le Xiaomi 14T sur le terrain
6. **L'agent ne tape pas** — il corrige, il valide, il dicte

---

## FLUX COMPLET STEP BY STEP

### ÉCRAN LOGIN
```
Entrée         → Fond #080808 + Logo ZAY animé (glowCopper)
Action         → Saisie mot de passe
Validation     → Touche Entrée OU bouton ACCEDER
Succès         → fadeUp vers page d'accueil (300ms)
Erreur MDP     → Message rouge sous le champ — "Mot de passe incorrect"
               → Input shake animation (100ms)
État vide      → Bouton désactivé opacity 0.5
```

### PAGE D'ACCUEIL
```
Arrivée        → fadeUp des 3 boutons en cascade (100ms décalage)
Bouton 1       → NOUVELLE ANNONCE → reset complet → step "photos"
Bouton 2       → HISTORIQUE → panneau historique → liste biens
Bouton 3       → ANNONCES SAUVEGARDÉES → panneau saved → liste annonces
Retour         → Bouton "Accueil" header en haut à droite toujours visible
```

### STEP PHOTOS
```
Arrivée        → Message "Ajoutez les photos du bien pour commencer"
               → Compteur "0 photo · 0 analysée"

Ajout galerie  → Input file multiple → preview immédiate
Ajout URL      → Textarea → bouton + Ajouter → validation URL
Ajout caméra   → Input capture → preview immédiate

Par photo      → Thumbnail + nom pièce sélectionnable
               → Bouton supprimer (×) en haut à droite du thumbnail
               → Sélecteur type pièce : Salon/Cuisine/Chambre/SDB/Extérieur/Autre

Minimum        → 1 photo requise pour analyser
Maximum        → 15 photos — au-delà bloquer avec message

Bouton analyser → Visible dès 1 photo
               → Désactivé pendant loading
               → Texte : "> Analyser X photo(s)"
               → Gradient cuivre → noir du fond

Loading analyse → Barre de progression cuivre
               → Messages rotatifs : "Analyse photo 1/5...", "Détection équipements...", etc.
               → Pourcentage visible
               → PAS de bouton annuler (éviter états corrompus)

Après analyse  → Auto-navigation step "fiche"
               → Bannière verte "Analyse IA terminée — Vérifiez et corrigez"
               → Bouton "Modifier photos" pour revenir
```

### STEP FICHE (correction)
```
Arrivée        → Bannière verte si synth disponible
               → Champs pré-remplis par IA mis en évidence (border cuivre subtile)
               → Champs non remplis en placeholder grisé

Organisation   → Pays en premier (définit langue et plateformes)
               → Type de bien → Surface → Prix
               → Code postal → Ville
               → Pièces → Chambres → SDB → WC
               → Étage → Année construction → Charges
               → DPE → GES → Chauffage → Exposition
               → Langue annonce
               → Caractéristiques supplémentaires
               → Consommation énergétique
               → Équipements (cases à cocher 2 colonnes)

Validation     → Champs obligatoires : Type, Surface, Ville, Prix
               → Message d'erreur inline sous le champ
               → Pas de popup

Bouton Notes   → Visible dès que synth existe
               → "Notes agent →" en cuivre
               → Navigue vers step "notes"

Bouton Analyser → Visible si pas encore de synth ET photos présentes
               → Relancer une analyse
```

### STEP NOTES
```
Arrivée        → Titre "NOTES DE L'AGENT"
               → Sous-titre "Informations que les photos ne montrent pas"

Zone texte     → Placeholder avec exemples : "Cave à vin 20m², vue dégagée campagne,
               → rénovation complète 2022, voisinage calme..."
               → Taille minimale 120px — extensible
               → Sauvegarde auto dans meta.notes_agent

Dictée vocale  → Bouton "Dicter" → rouge pendant enregistrement
               → Indicateur LED clignotant pendant écoute
               → Message "Transcription en cours..." après arrêt
               → Texte nettoyé ajouté à la zone texte existante
               → Pas de remplacement — ajout à la suite

Navigation     → Bouton "Modifier infos" → retour step "fiche"
               → Bouton "Générer l'annonce →" → lance genAnnonce()
               → Bouton désactivé si loading
```

### STEP ANNONCE
```
Arrivée        → Animation fadeUp
               → Onglets langues si multi-langue généré

Affichage      → Titre principal en haut
               → Description longue (utilisée pour l'aperçu)
               → Points clés en tags

Actions        → Bouton "Raccourcir" → révision IA
               → Bouton "Reformuler" → révision IA
               → Input révision libre → bouton Appliquer
               → Bouton Undo (revenir version précédente)
               → Bouton Copier → feedback "Copié !"
               → Bouton Sauvegarder → vert gradient
               → Bouton Aperçu → step "apercu"
               → Bouton Fiche interne → step "fiche_interne"
               → Bouton "+ Nouveau bien" → resetAll()

Mode révision  → Désactiver pendant loading IA
               → Compteur de révisions (max 10)
               → Undo disponible après chaque révision

Multi-langue   → Onglets par langue générée
               → Générer langue supplémentaire à la demande
               → Chaque langue indépendante
```

### STEP APERÇU
```
Sélection pays → Boutons pays → auto-sélection première plateforme
Sélection plat → Boutons plateformes du pays sélectionné

Aperçu         → Carte stylée couleurs de la plateforme
               → Prix, titre, surface, pièces, chambres, DPE
               → Description longue de l'annonce générée
               → Points clés en tags couleur plateforme

Export         → Bouton copier → copie titre + description
               → Note dans timeline historique
               → Message confirmation "Annonce copiée !"
               → Timeout 2.5s

Plateformes FR : LeBonCoin, SeLoger, PAP
Plateformes DE : Immoscout24, Immowelt
Plateformes BE : Immoweb
Plateformes LU : Athome.lu
Plateformes GB : Rightmove
```

### STEP FICHE INTERNE
```
2 types        → Fiche PRO (confidentielle) — Fiche CLIENT (visite)

Fiche PRO      → Header ZAYMMO + CONFIDENTIEL - INTERNE
               → Score IA, fourchette prix, recommandations agent
               → Toutes les données techniques
               → Bouton imprimer

Fiche CLIENT   → Header ZAYMMO + prix + titre
               → 2-3 photos max en mosaïque
               → Surface, pièces, chambres, DPE badge
               → Description courte
               → Points clés en tags
               → Équipements
               → Mentions légales en bas
               → Bouton imprimer

Impression     → window.open nouvelle fenêtre
               → setTimeout 500ms puis window.print()
               → Auto-close après impression
```

---

## ÉTATS DE CHARGEMENT

### Loading global
```
Overlay        → PAS d'overlay — le contenu reste visible
Barre prog     → En haut de la zone concernée — couleur cuivre
Message        → Sous la barre — texte rotatif informatif
Boutons        → Disabled + opacity 0.5
Curseur        → default (pas de spinner système)
```

### Messages de chargement rotatifs
```
Analyse photos :
- "Analyse photo X/Y..."
- "Détection des équipements..."
- "Estimation de la surface..."
- "Évaluation de l'état général..."
- "Calcul du score..."
- "Synthèse en cours..."

Génération annonce :
- "Rédaction de l'annonce..."
- "Optimisation du style..."
- "Ajout des points clés..."
- "Finalisation..."

Révision :
- "Révision en cours..."
```

---

## FEEDBACK VISUELS

### Succès
```
Couleur        : #4AE88A
Duration       : 2500ms puis disparition
Style          : Background #4AE88A15 + border #4AE88A30 + texte vert
```

### Erreur
```
Couleur        : #E84A4A
Duration       : Permanent jusqu'à action utilisateur
Style          : Background #E84A4A15 + border #E84A4A30 + texte rouge
```

### Info IA
```
Couleur        : #00D4E8
Style          : Background #00D4E815 + border #00D4E830 + texte cyan
```

### Confirmation action destructive
```
Type           : window.confirm() natif
Message        : "Supprimer ce bien de l'historique ?"
                 "Commencer une nouvelle annonce ? Les données actuelles seront perdues."
```

---

## NAVIGATION HEADER

### Boutons toujours visibles
```
Gauche  : Logo ZAY (cliquable → page d'accueil)
Droite  : Bouton "Accueil" + Bouton Admin (si admin)
```

### Bouton Accueil
```javascript
onClick={() => {
  setHomepage(true);
  setShowHistory(false);
  setShowSaved(false);
  setShowAdmin(false);
}}
```

---

## GESTION DU SCROLL

```
Changement step    → scroll to top automatique (window.scrollTo(0,0))
Chargement données → position mémorisée
Panneau historique → scroll indépendant maxHeight 360px
```

---

## ZONES TACTILES MOBILE

```
Boutons minimum    : height 44px (standard iOS/Android)
Cases à cocher     : padding 8px autour pour zone tactile large
Thumbnails photos  : minimum 80px × 80px
Bouton supprimer   : minimum 32px × 32px
Inputs             : padding 10px 12px minimum
```

---

## GESTION ERREURS API

```
Timeout            : 60 secondes maximum
Retry              : 2 tentatives avec délai croissant
Message utilisateur: "Erreur de connexion. Vérifiez votre connexion internet."
                     "Crédit API insuffisant. Rechargez votre compte Anthropic."
Pas de crash       : toujours afficher un message clair
```

---

## TRANSITIONS ENTRE STEPS

```javascript
// Toujours avec animation fadeUp
<div style={{animation: "fadeUp 0.3s ease"}}>
  {/* Contenu du step */}
</div>

// @keyframes fadeUp
// from { opacity: 0; transform: translateY(8px); }
// to   { opacity: 1; transform: translateY(0); }
```

---

## STEP BAR VISUEL

```
Étapes affichées   : Photos → Analyse → Infos → Notes → Annonce → Aperçu → Fiche
Step complété      : cercle cuivre plein + check
Step actif         : cercle cuivre avec animation pulse
Step futur         : cercle gris foncé
Connecteur         : ligne horizontale grise — devient cuivre si step complété
Labels             : 9px sous chaque cercle — visible sur grand écran uniquement
Scroll horizontal  : si trop d'étapes pour l'écran
```

---

## ONBOARDING PREMIER USAGE

```
Détection          : localStorage "zaymmo_onboarded" absent
Déclenchement      : Après premier login réussi
Flow               : ZayZay guide les 3 premiers pas
                     1. "Commencez par ajouter des photos de votre bien"
                     2. "Laissez l'IA analyser et pré-remplir la fiche"
                     3. "Générez votre annonce en un clic"
Skip               : Bouton "Passer" toujours disponible
Mémorisation       : localStorage.setItem("zaymmo_onboarded", "true")
```

---

## RACCOURCIS GESTUELS (mobile)

```
Swipe gauche/droite : Navigation entre steps (si possible)
Long press photo    : Options (supprimer, renommer pièce)
Double tap annonce  : Copier dans presse-papier
Pull to refresh     : Recharger l'historique
```
