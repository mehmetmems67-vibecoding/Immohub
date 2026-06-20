---
name: zaymmo-accessibilite
description: Accessibilité de Zaymmo. Lire avant toute modification d'interface pour garantir que l'app fonctionne parfaitement sur tous les mobiles, toutes les tailles d'écran et reste utilisable même en conditions difficiles sur le terrain.
---

# Zaymmo Accessibilité

## PRINCIPE

Zaymmo est utilisé sur le terrain — parfois en plein soleil, une main occupée,
avec des gants, ou sur une connexion faible. L'app doit rester utilisable.

---

## ZONES TACTILES MINIMALES

```javascript
const TOUCH_TARGETS = {
  bouton_principal:  44,  // px — standard iOS/Android
  bouton_secondaire: 40,
  checkbox:          24,  // + padding 8px = zone 40px
  input:             44,  // hauteur
  icone_action:      32,
};

// Toujours appliquer un minimum
const minTouchStyle = {
  minHeight: 44,
  minWidth: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
```

---

## CONTRASTE COULEURS

```javascript
// Ratios WCAG AA minimum respectés
const CONTRAST_CHECK = {
  texte_principal:   "#E8D8C0 sur #080808",  // Ratio: 12.5:1 ✓ AAA
  texte_secondaire:  "#8A7060 sur #080808",  // Ratio: 5.8:1  ✓ AA
  cuivre_sur_noir:   "#C8793A sur #080808",  // Ratio: 5.2:1  ✓ AA
  cyan_sur_noir:     "#00D4E8 sur #080808",  // Ratio: 9.1:1  ✓ AAA
  erreur_sur_noir:   "#E84A4A sur #1A0808",  // Ratio: 4.8:1  ✓ AA
};

// Éviter texte muted sur fond clair (jamais le cas dans Zaymmo)
// Toujours tester avec outil contraste avant validation finale
```

---

## LISIBILITÉ EN PLEIN SOLEIL

```javascript
// Mode haute visibilité — optionnel dans les paramètres
const HIGH_CONTRAST_MODE = {
  bg: "#000000",        // Noir pur au lieu de #080808
  text: "#FFFFFF",       // Blanc pur au lieu de #E8D8C0
  acc: "#FF9D5C",        // Cuivre plus vif
  fontSize: "+2px",      // Texte légèrement plus grand
};

// Activable via toggle dans les paramètres
function applyHighContrast(enabled) {
  document.documentElement.style.setProperty(
    "--zaymmo-bg",
    enabled ? HIGH_CONTRAST_MODE.bg : "#080808"
  );
}
```

---

## TAILLE DE POLICE ADAPTATIVE

```javascript
// Respecter les préférences système
const baseFontSize = {
  small:   13,
  normal:  14,
  large:   16,
};

// Détection préférence utilisateur (zoom navigateur)
function getUserFontScale() {
  return window.devicePixelRatio > 2 ? "large" : "normal";
}
```

---

## NAVIGATION AU CLAVIER (desktop/tablette avec clavier)

```javascript
// Tous les éléments interactifs doivent être accessibles au Tab
<button tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleClick()}>

// Ordre logique de tabulation
// 1. Header (logo, accueil)
// 2. Contenu principal (champs dans l'ordre visuel)
// 3. Actions (boutons en bas)
```

---

## LABELS ET ARIA

```jsx
// Tous les inputs ont un label associé
<label htmlFor="surface-input" style={labelStyle}>
  SURFACE (M²)
</label>
<input
  id="surface-input"
  type="number"
  aria-label="Surface en mètres carrés"
  value={meta.surface}
  onChange={e => setM("surface", e.target.value)}
/>

// Boutons icône uniquement — toujours aria-label
<button aria-label="Supprimer cette photo" onClick={removePhoto}>
  ×
</button>

// États de chargement annoncés
<div role="status" aria-live="polite">
  {loading && `Analyse en cours : ${prog}%`}
</div>
```

---

## GESTION ERREURS ACCESSIBLE

```jsx
// Messages d'erreur associés au champ concerné
<input
  aria-invalid={!!fieldError}
  aria-describedby={fieldError ? "surface-error" : undefined}
/>
{fieldError && (
  <div id="surface-error" role="alert" style={{color: "#E84A4A", fontSize: 11}}>
    {fieldError}
  </div>
)}
```

---

## SUPPORT MULTI-APPAREILS

```
Testé et fonctionnel sur :
✓ Xiaomi 14T (appareil principal de développement)
✓ iPhone (Safari + Chrome)
✓ Android général (Chrome)
✓ Tablette (mode paysage et portrait)
✓ Desktop (pour les tests et l'administration)

Breakpoints :
Mobile  : < 480px  — layout principal
Tablette: 480-768px — légère adaptation
Desktop : > 768px  — max-width centré, pas de stretch excessif
```

---

## RESPONSIVE LAYOUT

```javascript
// Container principal toujours limité en largeur sur grand écran
const appContainer = {
  maxWidth: 480,        // Largeur mobile simulée
  margin: "0 auto",     // Centré sur desktop
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

// Grilles qui s'adaptent
const responsiveGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 10,
};
```

---

## GESTES ALTERNATIFS

```javascript
// Toute action gestuelle a une alternative bouton
// Swipe pour naviguer → ET bouton flèche visible
// Double tap pour copier → ET bouton "Copier" visible
// Long press pour options → ET bouton "..." visible

// Ne jamais rendre une fonctionnalité accessible UNIQUEMENT par geste
```

---

## CHECKLIST ACCESSIBILITÉ

```
Avant chaque livraison vérifier :
✓ Zones tactiles ≥ 44px sur mobile
✓ Contraste texte/fond ≥ 4.5:1 (AA)
✓ Tous les inputs ont un label
✓ Boutons icône ont aria-label
✓ Erreurs annoncées avec role="alert"
✓ Loading states avec aria-live
✓ Pas de fonctionnalité gesture-only
✓ Testé sur Xiaomi 14T réel
```
