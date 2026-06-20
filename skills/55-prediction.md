---
name: zaymmo-prediction
description: Prédictions Zaymmo. Lire avant toute modification des fonctionnalités prédictives. Regroupe les prédictions de durée de vente, d'évolution de prix et de probabilité de vente rapide basées sur les données du bien.
---

# Zaymmo Prédiction

## PRINCIPE

Au-delà de l'estimation de prix, Zaymmo prédit des indicateurs
temporels et probabilistes pour mieux conseiller vendeur et acheteur.

---

## PRÉDICTION DURÉE DE VENTE (détaillée)

```javascript
function predictSaleDuration(meta, synth, neuralPrice) {
  let baseWeeks = 12; // Moyenne marché par défaut

  const factors = [];

  // Score qualité
  if (synth?.score_global >= 8) {
    baseWeeks -= 4;
    factors.push({ label: "Excellent état", impact: -4 });
  } else if (synth?.score_global < 5) {
    baseWeeks += 6;
    factors.push({ label: "Travaux nécessaires", impact: +6 });
  }

  // Positionnement prix
  if (neuralPrice?.estimationFinale && meta.prix) {
    const ecart = (Number(meta.prix) - neuralPrice.estimationFinale) / neuralPrice.estimationFinale;
    if (ecart > 0.1) {
      baseWeeks += 8;
      factors.push({ label: "Prix au-dessus du marché", impact: +8 });
    } else if (ecart < -0.05) {
      baseWeeks -= 3;
      factors.push({ label: "Prix attractif", impact: -3 });
    }
  }

  // DPE
  if (["A","B"].includes(meta.dpe)) {
    baseWeeks -= 2;
    factors.push({ label: "DPE performant", impact: -2 });
  } else if (["F","G"].includes(meta.dpe)) {
    baseWeeks += 5;
    factors.push({ label: "DPE faible (passoire thermique)", impact: +5 });
  }

  // Type de bien (studios/appart se vendent plus vite que maisons grandes)
  if (meta.type === "Studio" || meta.type === "Appartement") {
    baseWeeks -= 1;
  }

  baseWeeks = Math.max(2, Math.round(baseWeeks));

  return {
    semainesEstimees: baseWeeks,
    fourchetteMin: Math.max(2, baseWeeks - 4),
    fourchetteMax: baseWeeks + 6,
    facteurs: factors,
    probabiliteVenteRapide: calculateQuickSaleProbability(baseWeeks),
  };
}

function calculateQuickSaleProbability(weeks) {
  if (weeks <= 6)  return { pourcentage: 80, label: "Très probable" };
  if (weeks <= 10) return { pourcentage: 60, label: "Probable" };
  if (weeks <= 16) return { pourcentage: 40, label: "Modérée" };
  return                  { pourcentage: 20, label: "Plus longue" };
}
```

---

## PRÉDICTION ÉVOLUTION DE PRIX (12 mois)

```javascript
function predictPriceEvolution(meta, greenScore) {
  // Estimation simplifiée basée sur facteurs connus
  let tendanceAnnuelle = 2.5; // % moyen marché immobilier stable

  const factors = [];

  if (greenScore?.score >= 7) {
    tendanceAnnuelle += 1;
    factors.push("Bien écologique — valorisation croissante attendue");
  }

  if (["F","G"].includes(meta.dpe)) {
    tendanceAnnuelle -= 1.5;
    factors.push("DPE faible — risque de décote réglementaire");
  }

  if (meta.terrain && Number(meta.terrain) > 1000) {
    tendanceAnnuelle += 0.5;
    factors.push("Grand terrain — rareté valorisée");
  }

  return {
    tendanceAnnuelle: tendanceAnnuelle.toFixed(1),
    projection12mois: meta.prix
      ? Math.round(Number(meta.prix) * (1 + tendanceAnnuelle/100))
      : null,
    facteurs: factors,
  };
}
```

---

## COMPOSANT AFFICHAGE PRÉDICTIONS

```jsx
function PredictionPanel({ meta, synth, neuralPrice, greenScore }) {
  const duration = predictSaleDuration(meta, synth, neuralPrice);
  const evolution = predictPriceEvolution(meta, greenScore);

  return (
    <Card>
      <ST color="#9B6FFF">PRÉDICTIONS</ST>

      {/* Durée de vente */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 1 }}>
          DURÉE DE VENTE ESTIMÉE
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#9B6FFF" }}>
          {duration.fourchetteMin}-{duration.fourchetteMax} semaines
        </div>
        <div style={{ fontSize: 11, color: duration.probabiliteVenteRapide.pourcentage >= 60 ? "#4AE88A" : "#E8B44A" }}>
          {duration.probabiliteVenteRapide.label} ({duration.probabiliteVenteRapide.pourcentage}%)
        </div>
      </div>

      {/* Facteurs */}
      {duration.facteurs.map((f, i) => (
        <div key={i} style={{
          fontSize: 10, color: "#8A7060", padding: "3px 0",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>{f.label}</span>
          <span style={{ color: f.impact < 0 ? "#4AE88A" : "#E84A4A" }}>
            {f.impact > 0 ? "+" : ""}{f.impact} sem.
          </span>
        </div>
      ))}

      {/* Évolution prix */}
      {evolution.projection12mois && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid #1A1410" }}>
          <div style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 1 }}>
            PROJECTION VALEUR 12 MOIS
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#C8793A" }}>
            {evolution.projection12mois.toLocaleString()} € ({evolution.tendanceAnnuelle > 0 ? "+" : ""}{evolution.tendanceAnnuelle}%)
          </div>
        </div>
      )}

      <div style={{ fontSize: 9, color: "#3A2A1A", marginTop: 10, fontStyle: "italic" }}>
        Prédictions indicatives basées sur des modèles statistiques généraux
      </div>
    </Card>
  );
}
```

---

## AVERTISSEMENT PRÉDICTIONS

```
Toute prédiction est probabiliste, jamais garantie.
Le marché immobilier dépend de nombreux facteurs externes
(conjoncture économique, taux d'intérêt, événements locaux)
impossibles à anticiper avec certitude.

Mention obligatoire : "Prédiction statistique indicative — 
ne constitue pas un engagement contractuel"
```
