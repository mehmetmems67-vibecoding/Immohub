---
name: zaymmo-scoring-ia
description: Système de scoring IA de Zaymmo. Lire avant toute modification du score global, ajout de critères d'évaluation ou modification de l'affichage des résultats. Garantit un scoring cohérent, transparent et actionnable pour l'agent.
---

# Zaymmo Scoring IA

## PRINCIPE DU SCORING

Le score Zaymmo est calculé sur 10 points.
Il évalue la qualité globale du bien ET son potentiel de vente.
Il est basé uniquement sur les photos et les données saisies.

```
Score = Etat général + Localisation + Energie + Equipements + Potentiel
        (0-3pts)      (0-2pts)       (0-2pts)  (0-2pts)     (0-1pt)
```

---

## GRILLE DE SCORING

### Critère 1 — État général (0 à 3 points)
```
3.0 pts → Excellent — comme neuf, aucun travaux requis
2.5 pts → Très bon — légères retouches cosmétiques
2.0 pts → Bon — rafraîchissement recommandé
1.5 pts → Moyen — travaux de rénovation nécessaires
1.0 pt  → À rénover — travaux importants
0.5 pt  → Mauvais état — rénovation complète
0.0 pt  → Inhabitable — travaux structurels
```

### Critère 2 — Atouts visuels (0 à 2 points)
```
2.0 pts → Exceptionnel — luminosité, volumes, vues, architecture remarquable
1.5 pts → Très bon — plusieurs atouts majeurs bien valorisés
1.0 pt  → Bon — quelques atouts, présentation correcte
0.5 pt  → Moyen — peu d'atouts, présentation standard
0.0 pt  → Aucun atout visuel détecté
```

### Critère 3 — Performance énergétique (0 à 2 points)
```
2.0 pts → DPE A ou B — excellent
1.5 pts → DPE C — bon
1.0 pt  → DPE D — moyen
0.5 pt  → DPE E — médiocre
0.0 pt  → DPE F ou G / Non renseigné
```

### Critère 4 — Équipements et prestations (0 à 2 points)
```
2.0 pts → Nombreux équipements premium (piscine, domotique, cuisine pro...)
1.5 pts → Bons équipements (garage, terrasse, jardin, double vitrage...)
1.0 pt  → Équipements standard (parking, cave...)
0.5 pt  → Peu d'équipements
0.0 pt  → Aucun équipement notable
```

### Critère 5 — Potentiel de valorisation (0 à 1 point)
```
1.0 pt  → Potentiel fort (sous-évalué, emplacement premium, rénovation rentable)
0.5 pt  → Potentiel moyen (améliorations possibles)
0.0 pt  → Potentiel limité
```

---

## INTERPRÉTATION DU SCORE

```javascript
function getScoreLabel(score) {
  if (score >= 9.0) return { label: "exceptionnel",  color: "#4AE88A", emoji: "🏆" };
  if (score >= 8.0) return { label: "excellent",      color: "#4AE88A", emoji: "⭐" };
  if (score >= 7.0) return { label: "très bon",       color: "#C8793A", emoji: "👍" };
  if (score >= 6.0) return { label: "bon",            color: "#C8793A", emoji: "✓"  };
  if (score >= 5.0) return { label: "correct",        color: "#E8B44A", emoji: "→"  };
  if (score >= 4.0) return { label: "moyen",          color: "#E8B44A", emoji: "⚠️" };
  if (score >= 3.0) return { label: "à améliorer",    color: "#E84A4A", emoji: "🔧" };
  return                   { label: "à rénover",      color: "#E84A4A", emoji: "🔨" };
}
```

---

## AFFICHAGE SCORE CIRCULAIRE

```jsx
function ScoreCircle({ score, size = 70 }) {
  const { label, color } = getScoreLabel(score);
  const degrees = score * 36; // 10 → 360°, 7 → 252°

  return (
    <div style={{ textAlign: "center" }}>
      {/* Cercle de progression */}
      <div style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `conic-gradient(${color} ${degrees}deg, #1A1410 0deg)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 6px",
      }}>
        {/* Cercle intérieur */}
        <div style={{
          width: size * 0.83,
          height: size * 0.83,
          borderRadius: "50%",
          background: "#0C0A08",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            fontSize: size * 0.28,
            fontWeight: 900,
            color: color,
            lineHeight: 1,
          }}>
            {score}
          </div>
          <div style={{ fontSize: size * 0.12, color: "#3A2A1A" }}>
            /10
          </div>
        </div>
      </div>

      {/* Label */}
      <div style={{ fontSize: 11, color: color, fontWeight: 700, letterSpacing: 1 }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}
```

---

## AFFICHAGE DÉTAIL SCORE

```jsx
function ScoreDetail({ synth }) {
  if (!synth) return null;

  const items = [
    { label: "État général",    value: synth.score_etat || "-",        max: 3 },
    { label: "Atouts visuels",  value: synth.score_atouts || "-",      max: 2 },
    { label: "Énergie",         value: synth.score_energie || "-",     max: 2 },
    { label: "Équipements",     value: synth.score_equipements || "-", max: 2 },
    { label: "Potentiel",       value: synth.score_potentiel || "-",   max: 1 },
  ];

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{
        fontSize: 9,
        color: "#3A2A1A",
        letterSpacing: 2,
        marginBottom: 8
      }}>
        DÉTAIL DU SCORE
      </div>
      {items.map((item, i) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 6,
        }}>
          <div style={{ fontSize: 10, color: "#8A7060", width: 90, flexShrink: 0 }}>
            {item.label}
          </div>
          {/* Barre de progression */}
          <div style={{
            flex: 1,
            height: 4,
            background: "#1A1410",
            borderRadius: 2,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: item.value !== "-"
                ? `${(item.value / item.max) * 100}%`
                : "0%",
              background: "linear-gradient(90deg, #C8793A, #D4894A)",
              borderRadius: 2,
              transition: "width 0.5s ease",
            }}/>
          </div>
          <div style={{ fontSize: 10, color: "#C8793A", fontWeight: 700, width: 30 }}>
            {item.value}/{item.max}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## FOURCHETTE DE PRIX

```javascript
function formatPriceRange(fourchette, devise) {
  if (!fourchette) return null;

  const symbol = CURRENCY_SYMBOLS[devise] || "€";
  const parts = fourchette.toString().split("-");

  if (parts.length === 2) {
    const low  = Number(parts[0]).toLocaleString("fr-FR");
    const high = Number(parts[1]).toLocaleString("fr-FR");
    return `${low} — ${high} ${symbol}`;
  }

  return `${Number(fourchette).toLocaleString("fr-FR")} ${symbol}`;
}

// Affichage
{synth.fourchette_prix && (
  <div style={{
    fontSize: 15,
    fontWeight: 700,
    color: "#C8793A",
    marginTop: 8,
  }}>
    {formatPriceRange(synth.fourchette_prix, meta.devise)}
  </div>
)}
```

---

## POINTS FORTS / DÉFAUTS / HOME STAGING

```jsx
function PointsColumn({ title, color, items }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{
      background: "#0A0A0A",
      borderRadius: 8,
      padding: "8px 10px",
      border: `1px solid ${color}20`,
    }}>
      <div style={{
        fontSize: 9,
        color: color,
        letterSpacing: 1,
        fontWeight: 700,
        marginBottom: 8,
      }}>
        {title}
      </div>
      {items.map((item, i) => (
        <div key={i} style={{
          fontSize: 10,
          color: "#8A7060",
          marginBottom: 5,
          paddingLeft: 8,
          borderLeft: `2px solid ${color}40`,
          lineHeight: 1.4,
        }}>
          {item}
        </div>
      ))}
    </div>
  );
}

// Usage
<div style={{
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 8,
  marginTop: 12,
}}>
  <PointsColumn
    title="POINTS FORTS"
    color="#4AE88A"
    items={synth.points_forts}
  />
  <PointsColumn
    title="DÉFAUTS"
    color="#E84A4A"
    items={synth.points_faibles}
  />
  <PointsColumn
    title="HOME STAGING"
    color="#C8793A"
    items={synth.retouches_home_staging}
  />
</div>
```

---

## POTENTIEL DE VALORISATION

```jsx
{synth.potentiel_valorisation && (
  <div style={{
    marginTop: 12,
    padding: "8px 12px",
    background: "#00D4E810",
    borderRadius: 8,
    border: "1px solid #00D4E830",
  }}>
    <div style={{
      fontSize: 9,
      color: "#00D4E8",
      letterSpacing: 2,
      marginBottom: 4,
    }}>
      POTENTIEL DE VALORISATION
    </div>
    <div style={{ fontSize: 11, color: "#8A9AA0" }}>
      {synth.potentiel_valorisation}
    </div>
  </div>
)}
```

---

## RECOMMANDATIONS AGENT

```jsx
{synth.recommandations_agent && (
  <div style={{
    marginTop: 12,
    padding: "10px 12px",
    background: "#0A0A1E",
    borderRadius: 8,
    borderLeft: "3px solid #C8793A",
    fontStyle: "italic",
    fontSize: 12,
    color: "#E8D8C0",
    lineHeight: 1.6,
  }}>
    {synth.recommandations_agent}
  </div>
)}
```

---

## BADGES DPE COLORÉS

```javascript
const DPE_COLORS = {
  A: { bg: "#1A4A1A", text: "#4AE88A", border: "#4AE88A40" },
  B: { bg: "#1A3A1A", text: "#6AE86A", border: "#6AE86A40" },
  C: { bg: "#3A3A1A", text: "#E8E84A", border: "#E8E84A40" },
  D: { bg: "#3A2A1A", text: "#E8B44A", border: "#E8B44A40" },
  E: { bg: "#3A1A1A", text: "#E88A4A", border: "#E88A4A40" },
  F: { bg: "#2A1A1A", text: "#E86A4A", border: "#E86A4A40" },
  G: { bg: "#1A0A0A", text: "#E84A4A", border: "#E84A4A40" },
};

function DPEBadge({ value, type = "DPE" }) {
  const colors = DPE_COLORS[value] || { bg: "#1A1410", text: "#3A2A1A", border: "#1A1410" };
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "3px 8px",
      borderRadius: 4,
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      fontSize: 11,
      fontWeight: 700,
      color: colors.text,
    }}>
      {type} {value || "NC"}
    </div>
  );
}
```

---

## INTÉGRATION DANS LE PIPELINE

```javascript
// Le score est calculé par l'IA lors de l'analyse
// Il est stocké dans synth.score_global
// Il alimente le prompt d'annonce via:

const scoreContext = synth ? `
Score Zaymmo: ${synth.score_global}/10 — ${synth.etat_global}
Points forts: ${(synth.points_forts || []).join(", ")}
Potentiel: ${synth.potentiel_valorisation || "standard"}
` : "";
```
