---
name: zaymmo-ui-ux-intelligence
description: Intelligence design UI/UX avancée pour Zaymmo. Lire avant toute création ou modification d'interface pour appliquer les règles professionnelles de design mobile. Source adaptée de nextlevelbuilder/ui-ux-pro-max-skill (88.7k stars) et ceorkm/mobile-app-ui-design. Complète le skill 01-design-system.md avec des règles d'intentionnalité et de psychologie UX.
---

# Zaymmo UI/UX Intelligence

## PRINCIPE FONDAMENTAL

Un grand design mobile n'est pas une question de flashiness — c'est une question
d'intentionnalité. Chaque pixel, chaque valeur d'espacement, chaque choix de
couleur doit servir l'utilisateur (l'agent immobilier sur le terrain).

---

## RÈGLE DE COULEUR 60/30/10

```
Appliquée à Zaymmo :

60% — Neutre/Fond     → #080808, #0C0A08, #0F0B07 (noirs/bruns très foncés)
30% — Complémentaire  → #E8D8C0, #8A7060 (textes, surfaces secondaires)
10% — Accent          → #C8793A (cuivre) + #00D4E8 (cyan) pour les CTA et l'IA

Ne JAMAIS dépasser ce ratio — un excès de cuivre ou de cyan
fatigue l'œil et dilue l'impact des éléments vraiment importants
(boutons d'action, alertes, score).
```

---

## SYSTÈME DE GRILLE 8 POINTS

```javascript
// Tous les espacements Zaymmo doivent être divisibles par 8 ou 4
const SPACING_SCALE = {
  xs: 4,   // micro-espacement (entre icône et texte)
  sm: 8,   // espacement serré (padding bouton secondaire)
  md: 12,  // espacement standard (padding card)
  lg: 16,  // espacement section (padding contenu principal)
  xl: 24,  // espacement large (entre sections majeures)
  xxl: 32, // espacement très large (header page d'accueil)
};

// MAUVAIS — valeurs arbitraires
padding: "13px 17px"

// BON — sur la grille
padding: "12px 16px" // md / lg
```

---

## RÈGLE DE LA ZONE DU POUCE (THUMB ZONE)

```
Sur mobile, les actions PRIMAIRES doivent être dans le tiers inférieur
de l'écran — zone naturellement atteignable par le pouce en tenant
le téléphone à une main (cas typique de l'agent sur le terrain).

Application Zaymmo :
✓ Barre du bas (boutons navigation/action) — déjà conforme
✓ Bouton "Générer l'annonce" en bas de la zone notes — conforme
✓ Bouton flottant ZayZay en bas à droite — conforme (zone pouce droit)
✗ À ÉVITER : action critique uniquement accessible en haut d'écran
  sur un mobile en grand format (Xiaomi 14T = écran 6.6")
```

---

## RÈGLE PEAK-END

```
Les utilisateurs se souviennent du MOMENT FORT + de la FIN d'une expérience,
pas de chaque étape intermédiaire.

Application Zaymmo — les 2 moments à soigner particulièrement :

PEAK (moment fort) :
→ L'affichage du résultat d'analyse IA (score circulaire, points forts)
  Doit être visuellement satisfaisant — animation d'apparition, couleurs vives

END (fin du parcours) :
→ La confirmation de sauvegarde de l'annonce
  Doit être claire et gratifiante (pas juste un texte discret)
  Considérer une micro-animation de succès
```

---

## CHECKLIST PRÉ-LIVRAISON DESIGN (avant chaque nouvelle UI)

### Qualité visuelle
```
☐ Respect du ratio couleur 60/30/10
☐ Espacements sur la grille 8 points
☐ Typographie cohérente avec 01-design-system.md
☐ Pas plus de 2 niveaux de hiérarchie visuelle par écran
```

### Interaction
```
☐ Actions primaires dans la zone du pouce (tiers inférieur)
☐ Feedback visuel immédiat sur chaque tap (changement d'état)
☐ États de chargement présents partout où une attente > 300ms est possible
☐ Pas de zone tactile < 44px
```

### Mode clair/sombre
```
Zaymmo est sombre par défaut (pas de mode clair prévu Phase 1)
☐ Vérifier le contraste dans toutes les variations (loading, disabled, hover)
```

### Layout
```
☐ Responsive testé du plus petit (iPhone SE 375px) au plus grand mobile
☐ Pas de débordement horizontal (overflow-x non désiré)
☐ Contenu centré et limité en largeur sur desktop (max-width 480px)
```

### Accessibilité (renvoi vers 26 et 60)
```
☐ Contraste ≥ 4.5:1
☐ Focus visible au clavier
☐ Alt text descriptif
☐ ARIA labels sur boutons icône-only
```

---

## PATTERNS UX À ÉVITER (anti-patterns détectés communément)

```javascript
// ❌ Anti-pattern 1 : Loading state manquant
function BadButton() {
  return <button onClick={asyncAction}>Analyser</button>; // Pas de feedback pendant l'attente
}

// ✓ Correction
function GoodButton({ loading }) {
  return (
    <button onClick={asyncAction} disabled={loading}>
      {loading ? "Analyse en cours..." : "Analyser"}
    </button>
  );
}

// ❌ Anti-pattern 2 : Breakpoints responsive manquants
// Toujours tester à 375px (petit mobile) ET 480px (grand mobile/petite tablette)

// ❌ Anti-pattern 3 : Interaction sans transition
// Un changement d'état (step suivant, ouverture panneau) sans animation
// donne une impression de rupture, pas de fluidité

// ✓ Toujours utiliser fadeUp/fadeIn (déjà défini dans 01-design-system.md)
```

---

## INTENTIONNALITÉ PAR ÉCRAN ZAYMMO

```
ÉCRAN LOGIN
Intention : rassurer, donner confiance dès le premier contact
→ Logo proéminent, animation subtile, pas de friction (1 seul champ)

PAGE D'ACCUEIL
Intention : guider vers l'action la plus probable (nouvelle annonce)
→ Bouton principal visuellement dominant (60/30/10 respecté), 2 secondaires en dessous

STEP PHOTOS
Intention : encourager à ajouter suffisamment de photos sans frustrer
→ Compteur visible, feedback immédiat à chaque ajout, pas de blocage prématuré

STEP FICHE (résultats IA)
Intention : moment "Peak" — célébrer la qualité de l'analyse
→ Score animé, couleurs vives mais dans le ratio 60/30/10, hiérarchie claire

STEP ANNONCE
Intention : donner le contrôle à l'agent (édition, révision)
→ Actions secondaires groupées, action principale (Sauvegarder) distincte et visible

CONFIRMATION (sauvegarde, export)
Intention : moment "End" — gratification claire
→ Feedback positif net (couleur verte, icône ✓), pas juste discret
```

---

## DENSITÉ D'INFORMATION PAR CONTEXTE

```
Sur le terrain (usage principal Zaymmo), l'agent a souvent :
- Une seule main disponible
- Une attention partielle (en visite, en mouvement)
- Une lumière variable (intérieur sombre, extérieur ensoleillé)

CONSÉQUENCES DESIGN :
→ Privilégier moins d'éléments par écran, bien hiérarchisés
→ Texte suffisamment grand (min 13px, jamais en dessous de 11px même pour le secondaire)
→ Contraste renforcé plutôt que subtilité (le mode "high contrast" du skill 26 a du sens)
→ Actions critiques toujours répétées en bas (pas seulement en haut de form)
```

---

*Sources originales : nextlevelbuilder/ui-ux-pro-max-skill (88.7k★), ceorkm/mobile-app-ui-design — adapté pour le contexte Zaymmo*
