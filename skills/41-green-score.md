---
name: zaymmo-green-score
description: Score environnemental Zaymmo. Lire avant toute modification de l'évaluation écologique d'un bien. Calcule un score vert basé sur le DPE, les équipements et le potentiel d'amélioration énergétique.
---

# Zaymmo Green Score

## PRINCIPE

Au-delà du DPE seul, Zaymmo calcule un score environnemental global
qui valorise les biens écologiques — argument de vente croissant.

---

## CALCUL GREEN SCORE

```javascript
function calculateGreenScore(meta, synth) {
  let score = 0;
  const details = [];

  // DPE (0-4 points)
  const dpeScores = { A: 4, B: 3.5, C: 2.5, D: 1.5, E: 0.5, F: 0, G: 0 };
  const dpePoints = dpeScores[meta.dpe] || 0;
  score += dpePoints;
  if (dpePoints > 0) details.push(`DPE ${meta.dpe}: +${dpePoints}pts`);

  // GES (0-2 points)
  const gesScores = { A: 2, B: 1.5, C: 1, D: 0.5, E: 0, F: 0, G: 0 };
  const gesPoints = gesScores[meta.ges] || 0;
  score += gesPoints;
  if (gesPoints > 0) details.push(`GES ${meta.ges}: +${gesPoints}pts`);

  // Chauffage écologique (0-2 points)
  if (/pompe.{0,3}chaleur|géothermie|solaire/i.test(meta.chauffage)) {
    score += 2;
    details.push("Chauffage écologique: +2pts");
  } else if (/granulés|bois/i.test(meta.chauffage)) {
    score += 1.5;
    details.push("Chauffage bois/granulés: +1.5pts");
  }

  // Isolation (0-1 point)
  if (meta.triple_vitrage) {
    score += 1;
    details.push("Triple vitrage: +1pt");
  } else if (meta.double_vitrage) {
    score += 0.5;
    details.push("Double vitrage: +0.5pt");
  }

  // Équipements verts (0-1 point)
  if (meta.poele_granules) {
    score += 0.5;
    details.push("Poêle à granulés: +0.5pt");
  }

  return {
    score: Math.min(10, Math.round(score * 10) / 10),
    details,
    label: getGreenLabel(score),
  };
}

function getGreenLabel(score) {
  if (score >= 8) return { label: "Excellent", color: "#4AE88A" };
  if (score >= 6) return { label: "Bon", color: "#6AE86A" };
  if (score >= 4) return { label: "Moyen", color: "#E8B44A" };
  return { label: "À améliorer", color: "#E84A4A" };
}
```

---

## COMPOSANT AFFICHAGE GREEN SCORE

```jsx
function GreenScoreBadge({ meta, synth }) {
  const result = calculateGreenScore(meta, synth);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", background: `${result.label.color}10`,
      borderRadius: 10, border: `1px solid ${result.label.color}30`,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: `${result.label.color}20`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 900, color: result.label.color,
      }}>
        🌱
      </div>
      <div>
        <div style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 1 }}>
          GREEN SCORE
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: result.label.color }}>
          {result.score}/10 — {result.label.label}
        </div>
      </div>
    </div>
  );
}
```

---

## ARGUMENT MARKETING VERT

```javascript
function getGreenSellingPoints(meta, greenScore) {
  const points = [];

  if (["A","B"].includes(meta.dpe)) {
    points.push("Logement basse consommation — économies garanties sur les factures énergétiques");
  }
  if (/pompe.{0,3}chaleur|géothermie/i.test(meta.chauffage)) {
    points.push("Chauffage renouvelable — réduction de l'empreinte carbone");
  }
  if (meta.triple_vitrage) {
    points.push("Triple vitrage — isolation thermique et phonique optimale");
  }
  if (greenScore.score >= 7) {
    points.push("Bien éligible aux meilleures conditions de prêt vert (selon banques)");
  }

  return points;
}
```

---

## INTÉGRATION DANS L'ANNONCE

```javascript
// Ajouter au prompt si Green Score élevé
function getGreenContext(meta, synth) {
  const greenScore = calculateGreenScore(meta, synth);
  if (greenScore.score < 6) return "";

  return `\nARGUMENT ÉCOLOGIQUE FORT: Green Score ${greenScore.score}/10. Mettre en avant la performance environnementale dans l'annonce.`;
}
```
