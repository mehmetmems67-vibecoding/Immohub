---
name: zaymmo-accessibility-audit
description: Audit accessibilité WCAG 2.2 AA approfondi pour Zaymmo. Lire avant toute modification d'interface pour garantir la conformité aux 4 principes WCAG (Perceptible, Utilisable, Compréhensible, Robuste). Source adaptée de AccessLint et rampstackco/claude-skills. Complète le skill 26-accessibilite.md avec une checklist d'audit complète.
---

# Zaymmo Accessibility Audit

## LES 4 PRINCIPES WCAG APPLIQUÉS À ZAYMMO

WCAG organise l'accessibilité autour de 4 principes.
Cet audit couvre chacun en profondeur pour l'app Zaymmo.

---

## 1. PERCEPTIBLE — L'information doit être perceptible

### Alternatives textuelles
```jsx
// Toute image non-décorative a un texte alternatif descriptif
<img src={photo.preview} alt={`Photo ${photo.roomType} du bien à ${meta.ville}`} />

// Images décoratives (icônes purement visuelles) → alt vide
<img src="/decoration.svg" alt="" />

// Logo Zaymmo — toujours alt descriptif
<img src="/logo-zay.png" alt="Zaymmo - AI Vision Immobilier" />
```

### Contenu adaptable
```
✓ Structure conventionnée par le markup (titres hiérarchiques), pas que par le style visuel
✓ L'ordre de lecture a du sens même sans CSS
✓ Les labels sont des éléments <label>, pas juste du texte stylé à côté
```

### Distinguable (contraste)
```javascript
// Ratios de contraste Zaymmo — déjà validés dans 01-design-system.md
// Texte normal : minimum 4.5:1 (AA)
// Texte large (18px+) : minimum 3:1 (AA)
// Éléments UI (boutons, bordures actives) : minimum 3:1

const CONTRAST_VALIDATED = {
  "texte principal #E8D8C0 / fond #080808": "12.5:1 — AAA ✓",
  "texte secondaire #8A7060 / fond #080808": "5.8:1 — AA ✓",
  "cuivre #C8793A / fond #080808": "5.2:1 — AA ✓",
  "cyan #00D4E8 / fond #080808": "9.1:1 — AAA ✓",
};

// RÈGLE : la couleur n'est JAMAIS le seul moyen de transmettre une info
// Exemple : un statut "erreur" doit avoir une icône/texte EN PLUS de la couleur rouge
```

---

## 2. UTILISABLE — L'interface doit être opérable

### Navigation clavier (desktop/tablette avec clavier)
```jsx
// Tout élément interactif accessible au Tab
<button tabIndex={0}>...</button>

// Ordre de tabulation logique : Header → Contenu → Actions
// Pas de piège au clavier (focus trap involontaire)

// Modales et panneaux (ZayZay, Historique) : fermer avec Escape
useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === "Escape") onClose();
  };
  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, []);
```

### Cibles tactiles suffisantes (déjà dans 26-accessibilite.md)
```
✓ Boutons ≥ 44×44px
✓ Espacement suffisant entre éléments cliquables adjacents
```

### Pas de piège au focus
```jsx
// Le panneau ZayZay, une fois ouvert, ne doit pas bloquer
// la possibilité de revenir au contenu principal
// Toujours un bouton de fermeture clairement accessible
```

### Délais suffisants
```javascript
// Les messages de confirmation (copié, sauvegardé) restent visibles
// assez longtemps pour être lus (2.5s minimum, déjà standard Zaymmo)
const COPY_FEEDBACK_DURATION = 2500; // OK — laisse le temps de lire
```

---

## 3. COMPRÉHENSIBLE — Contenu et interface compréhensibles

### Langue déclarée
```html
<!-- index.html -->
<html lang="fr">
<!-- Changer dynamiquement si meta.langAnnonce change l'interface -->
```

### Labels et instructions clairs
```jsx
// Chaque champ a un label visible (pas juste un placeholder)
// MAUVAIS — placeholder seul disparaît à la saisie
<input placeholder="Surface" />

// BON — label persistant + placeholder en exemple
<label htmlFor="surface">SURFACE (M²)</label>
<input id="surface" placeholder="ex: 85" />
```

### Prévention des erreurs
```jsx
// Confirmation avant action destructive (déjà implémenté)
if (window.confirm("Supprimer ce bien de l'historique ?")) {
  deleteHistoryEntry(id);
}

// Message d'erreur explicite et actionnable
// MAUVAIS : "Erreur"
// BON : "Surface invalide — entrez un nombre entre 1 et 10000"
```

### Comportement prévisible
```
✓ Pas de changement de contexte inattendu (ex: navigation auto sans action utilisateur)
✓ Les boutons font ce que leur libellé annonce
✓ Pas de soumission de formulaire au simple focus
```

---

## 4. ROBUSTE — Compatible avec les technologies d'assistance

### ARIA correct
```jsx
// États dynamiques annoncés
<div role="status" aria-live="polite">
  {loading && `Analyse en cours : ${prog}%`}
</div>

// Erreurs annoncées immédiatement
<div role="alert" aria-live="assertive">
  {error}
</div>

// Boutons icône-only avec aria-label
<button aria-label="Supprimer cette photo" onClick={removePhoto}>×</button>
<button aria-label="Fermer ZayZay" onClick={onClose}>×</button>

// Champs invalides marqués
<input aria-invalid={!!fieldError} aria-describedby={fieldError ? "error-id" : undefined} />
```

### Noms accessibles
```jsx
// Chaque composant interactif a un nom accessible clair
// soit via texte visible, soit via aria-label

// Le drone animé décoratif → aria-hidden (purement visuel)
<svg aria-hidden="true">{/* drone SVG */}</svg>
```

---

## CHECKLIST D'AUDIT COMPLÈTE ZAYMMO

### Perceptible
```
☐ Toutes les images ont un alt pertinent (ou alt="" si décoratif)
☐ Contraste texte/fond ≥ 4.5:1 partout
☐ L'information n'est jamais véhiculée par la couleur seule
☐ Les badges DPE ont aussi une lettre, pas que la couleur
```

### Utilisable
```
☐ Tous les boutons accessibles au clavier (Tab + Enter)
☐ Panneaux (ZayZay, Historique) fermables avec Escape
☐ Zones tactiles ≥ 44px sur mobile
☐ Pas de fonctionnalité disponible UNIQUEMENT au swipe/geste
```

### Compréhensible
```
☐ Chaque input a un <label> associé, pas qu'un placeholder
☐ lang="fr" déclaré (ou langue dynamique selon contexte)
☐ Messages d'erreur explicites et actionnables
☐ Confirmation avant suppression/action destructive
```

### Robuste
```
☐ role="status" sur les zones de chargement
☐ role="alert" sur les messages d'erreur
☐ aria-label sur tous les boutons icône-only
☐ Éléments décoratifs (drone, halos) marqués aria-hidden
```

---

## OUTILS DE VÉRIFICATION RECOMMANDÉS

```
Pour audit manuel rapide sur Zaymmo :
1. Navigation 100% clavier (débrancher la souris/désactiver le tactile)
2. Zoom navigateur à 200% — vérifier que rien n'est coupé
3. Lecteur d'écran mobile (TalkBack Android / VoiceOver iOS)
   — tester le pipeline complet Photos → Analyse → Annonce
4. Simulateur de daltonisme (vérifier les badges DPE notamment)
```

---

## PRIORISATION DES CORRECTIONS

```
P0 — Bloquant : empêche complètement l'usage (pas de label, pas de alt sur infos critiques)
P1 — Majeur : rend l'usage très difficile (contraste insuffisant, pas de focus visible)
P2 — Mineur : gêne mais contournable (libellé un peu vague)
P3 — Amélioration : au-delà du minimum AA, vers AAA
```

---

*Sources originales : AccessLint (accesslint/claude-marketplace), rampstackco/claude-skills accessibility-audit — adapté pour le contexte Zaymmo*
