---
name: zaymmo-design-system
description: Système de design complet de Zaymmo. Utiliser OBLIGATOIREMENT avant tout travail d'interface, création de composant, modification visuelle ou refonte. Contient couleurs, typographie, espacements, composants de base et règles visuelles de la plateforme.
---

# Zaymmo Design System

## IDENTITÉ VISUELLE

### Logo
- Monogramme ZAY en métal cuivré brossé 3D (fichier PNG généré par Gemini)
- ZAYMMO écrit en dessous en typographie cuivrée
- Toujours sur fond sombre — jamais sur fond blanc

### Couleurs principales
```
Cuivre principal   : #C8793A
Cuivre clair       : #D4894A
Cuivre foncé       : #9A5018
Cuivre highlight   : #F0A060
Cyan glacé         : #00D4E8
Cyan foncé         : #00C4D8
Fond principal     : #080808
Fond card          : #0C0A08
Fond surface       : #111008
Fond input         : #0F0B07
Bordure principale : #1A1410
Bordure active     : #C8793A40
Texte principal    : #E8D8C0
Texte secondaire   : #8A7060
Texte muted        : #3A2A1A
Erreur             : #E84A4A
Succès             : #4AE88A
Warning            : #E8B44A
```

### Typographie
```
Titres logo        : Georgia, serif — letter-spacing: 6-8px
Titres section     : system-ui, sans-serif — font-weight: 900
Corps texte        : system-ui, sans-serif — font-size: 13-14px
Labels             : system-ui — font-size: 9-11px — letter-spacing: 2-3px — MAJUSCULES
Tagline            : letter-spacing: 4px — color: #00D4E870
```

---

## COMPOSANTS DE BASE

### Bouton primaire
```jsx
style={{
  background: "linear-gradient(135deg, #C8793A, #9A5018)",
  color: "#050404",
  fontWeight: 900,
  fontSize: 13,
  padding: "14px 20px",
  borderRadius: 4,
  border: "none",
  letterSpacing: 2,
  cursor: "pointer"
}}
```

### Bouton secondaire
```jsx
style={{
  background: "#0F0B07",
  color: "#C8793A",
  fontWeight: 700,
  fontSize: 11,
  padding: "10px 16px",
  borderRadius: 4,
  border: "1px solid #C8793A25",
  letterSpacing: 1,
  cursor: "pointer"
}}
```

### Bouton cyan (actions IA)
```jsx
style={{
  background: "transparent",
  color: "#00D4E8",
  fontWeight: 700,
  fontSize: 11,
  padding: "10px 16px",
  borderRadius: 4,
  border: "1px solid #00D4E825",
  letterSpacing: 1,
  cursor: "pointer"
}}
```

### Bouton destructif
```jsx
style={{
  background: "#1A0808",
  color: "#E84A4A",
  fontWeight: 700,
  fontSize: 11,
  padding: "10px 16px",
  borderRadius: 4,
  border: "1px solid #E84A4A25",
  cursor: "pointer"
}}
```

### Card
```jsx
style={{
  background: "#0C0A08",
  borderRadius: 12,
  padding: "16px",
  border: "1px solid #1A1410",
  marginBottom: 12
}}
```

### Input
```jsx
style={{
  background: "#0F0B07",
  border: "1px solid #1A1410",
  borderRadius: 4,
  color: "#E8D8C0",
  padding: "10px 12px",
  fontSize: 13,
  width: "100%",
  outline: "none"
}}
```

### Input focus
```jsx
// Au focus ajouter:
border: "1px solid #C8793A40"
```

### Select / Dropdown
```jsx
style={{
  background: "#0F0B07",
  border: "1px solid #1A1410",
  borderRadius: 4,
  color: "#E8D8C0",
  padding: "10px 12px",
  fontSize: 13,
  width: "100%"
}}
```

### Label de champ
```jsx
style={{
  fontSize: 9,
  color: "#3A2A1A",
  letterSpacing: 2,
  marginBottom: 6,
  display: "block"
}}
```

### Section title (ST)
```jsx
// Titre de section dans une card
style={{
  fontSize: 10,
  color: "#C8793A",  // ou couleur spécifique
  letterSpacing: 2,
  fontWeight: 700,
  marginBottom: 12
}}
```

### Badge DPE
```
A → background: #1A4A1A, color: #4AE88A
B → background: #1A3A1A, color: #6AE86A
C → background: #3A3A1A, color: #E8E84A
D → background: #3A2A1A, color: #E8B44A
E → background: #3A1A1A, color: #E88A4A
F → background: #2A1A1A, color: #E86A4A
G → background: #1A0A0A, color: #E84A4A
```

### Tag / Chip
```jsx
style={{
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 10,
  background: "#C8793A15",
  color: "#C8793A",
  border: "1px solid #C8793A30",
  margin: "2px"
}}
```

### Checkbox personnalisée
```jsx
// Container
style={{
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  color: checked ? "#E8D8C0" : "#3A2A1A",
  cursor: "pointer",
  padding: "4px 0"
}}
```

---

## LAYOUT & ESPACEMENTS

### Structure principale app mobile
```
Header fixe         : height 56px — background #0A0806 — border-bottom #1A1410
Contenu scrollable  : flex:1 — overflow-y auto — padding 14px 16px
Barre basse fixe    : padding 10px 16px — background #060606
```

### Grille de champs (2 colonnes)
```jsx
style={{
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 12
}}
```

### Espacements standard
```
Entre sections      : marginBottom 16px
Entre champs        : gap 10px
Padding card        : 16px
Padding section     : 14px 16px
```

---

## ANIMATIONS

### fadeUp (apparition contenu)
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### blink (LED drone)
```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
```

### glowCopper (logo)
```css
@keyframes glowCopper {
  0%, 100% { filter: drop-shadow(0 0 8px #C8793A40); }
  50%       { filter: drop-shadow(0 0 20px #C8793A70); }
}
```

### Loading pulse
```css
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 1; }
}
```

---

## RÈGLES VISUELLES STRICTES

1. Jamais de fond blanc ou gris clair — toujours fond sombre
2. Cuivre pour tout ce qui est immobilier et business
3. Cyan uniquement pour tout ce qui est IA, drone, technologie
4. Bordures toujours très subtiles — jamais visibles au premier coup d'œil
5. Texte en majuscules UNIQUEMENT pour les labels et titres courts
6. Letter-spacing généreux sur tous les textes en majuscules
7. Border-radius : 4px pour boutons et inputs (style Cupra), 12px pour les cards
8. Jamais de box-shadow colorée sauf effets spéciaux logo
9. Les erreurs sont rouges (#E84A4A), les succès verts (#4AE88A), les infos IA en cyan
10. ZayZay et tout ce qui est IA : couleur cyan #00D4E8 exclusivement

---

## DRONE COMPONENT (réutilisable)

```jsx
// Drone SVG flottant standard
<div style={{animation: "floatDrone 2.5s ease-in-out infinite"}}>
  <svg width="28" height="20" viewBox="0 0 36 26">
    <rect x="8" y="7" width="20" height="12" rx="3" fill="#00D4E8" opacity="0.95"/>
    <line x1="2" y1="9" x2="9" y2="11" stroke="#00D4E8" strokeWidth="1.2"/>
    <line x1="27" y1="11" x2="34" y2="9" stroke="#00D4E8" strokeWidth="1.2"/>
    <ellipse cx="2" cy="12" rx="3.5" ry="1.4" fill="none" stroke="#00D4E8" strokeWidth="0.9" opacity="0.8"/>
    <ellipse cx="34" cy="12" rx="3.5" ry="1.4" fill="none" stroke="#00D4E8" strokeWidth="0.9" opacity="0.8"/>
    <circle cx="18" cy="19" r="2.5" fill="#C8793A"/>
    <circle cx="18" cy="7" r="1.5" fill="#FF3344" style={{animation: "blink 0.7s infinite"}}/>
  </svg>
</div>
```

---

## HEADER APP (structure fixe)

```jsx
<div style={{
  background: "#0A0806",
  padding: "10px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid #1A1410",
  position: "sticky",
  top: 0,
  zIndex: 100,
  flexShrink: 0
}}>
  {/* Logo ZAY + ZAYMMO */}
  {/* Boutons action droite */}
</div>
```

---

## STEP BAR (navigation pipeline)

```
Étapes : Photos → Analyse → Infos bien → Notes → Annonce → Aperçu → Fiche
Couleur active     : #C8793A
Couleur complète   : #C8793A (opacity 0.6)
Couleur inactive   : #1A1410
Connecteur         : ligne horizontale #1A1410
```

---

## PAGE D'ACCUEIL (après login)

```
3 boutons empilés :
1. NOUVELLE ANNONCE  → gradient cuivre → couleur fond sombre
2. HISTORIQUE        → fond #0F0B07 → texte cuivre → bordure cuivre subtile
3. ANNONCES SAUVEG.  → fond #0F0B07 → texte cyan → bordure cyan subtile
```

---

## ÉCRAN DE LOGIN

```
Fond               : #080808
Logo ZAY           : centré, 110px, animation glowCopper
ZAYMMO             : 30px, Georgia, cuivre, letter-spacing 7px
Tagline            : 9px, cyan 60% opacité, letter-spacing 5px
Input MDP          : style standard
Bouton ACCEDER     : pleine largeur, gradient cuivre, border-radius 4px
Mention            : "USAGE PROFESSIONNEL EXCLUSIF" — 8px — très discret
```
