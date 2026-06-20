---
name: zaymmo-estimation-travaux
description: Estimation des coûts de travaux Zaymmo. Lire avant toute modification du calcul de coûts de rénovation. Donne à l'agent une fourchette de budget travaux basée sur les défauts détectés par l'analyse photo.
---

# Zaymmo Estimation Travaux

## PRINCIPE

Basé sur les points faibles détectés par l'IA, Zaymmo estime
une fourchette de budget travaux — indicative, pour aider l'agent
à conseiller l'acheteur sur le budget global.

---

## GRILLE DE COÛTS MOYENS (France, indicatif)

```javascript
const TRAVAUX_COSTS = {
  peinture_complete:      { min: 25,  max: 45,  unite: "m²" },
  sol_renovation:         { min: 40,  max: 90,  unite: "m²" },
  cuisine_renovation:     { min: 5000, max: 18000, unite: "forfait" },
  sdb_renovation:         { min: 4000, max: 12000, unite: "forfait" },
  electricite_mise_norme: { min: 80,  max: 150, unite: "m²" },
  plomberie_renovation:   { min: 60,  max: 120, unite: "m²" },
  isolation_thermique:    { min: 50,  max: 100, unite: "m²" },
  chauffage_remplacement: { min: 3000, max: 12000, unite: "forfait" },
  fenetres_double_vitrage:{ min: 400, max: 800,  unite: "fenetre" },
  toiture_renovation:     { min: 80,  max: 180, unite: "m²" },
  facade_ravalement:      { min: 40,  max: 90,  unite: "m² facade" },
};
```

---

## DÉTECTION TRAVAUX DEPUIS L'ANALYSE

```javascript
function detectTravauxNeeded(synth, meta) {
  const travaux = [];

  // Analyse des points faibles textuels
  const pointsFaibles = (synth?.points_faibles || []).join(" ").toLowerCase();

  if (/peinture|murs?\s+(à|a)\s+rafra/i.test(pointsFaibles)) {
    travaux.push({ type: "peinture_complete", surface: meta.surface });
  }
  if (/sol|parquet|carrelage.*(à|a)\s+(rénov|chang)/i.test(pointsFaibles)) {
    travaux.push({ type: "sol_renovation", surface: meta.surface * 0.7 });
  }
  if (/cuisine.*(rénov|dat|ancien)/i.test(pointsFaibles)) {
    travaux.push({ type: "cuisine_renovation", surface: 1 });
  }
  if (/salle de bain.*(rénov|rafra|dat)/i.test(pointsFaibles)) {
    travaux.push({ type: "sdb_renovation", surface: 1 });
  }
  if (/humidité|fissure|électri.*(vétuste|ancien)/i.test(pointsFaibles)) {
    travaux.push({ type: "electricite_mise_norme", surface: meta.surface });
  }

  // DPE faible = isolation à prévoir
  if (["E","F","G"].includes(meta.dpe)) {
    travaux.push({ type: "isolation_thermique", surface: meta.surface });
    travaux.push({ type: "chauffage_remplacement", surface: 1 });
  }

  // Simple vitrage détecté
  if (!meta.double_vitrage && !meta.triple_vitrage) {
    const nbFenetres = Math.ceil(meta.surface / 15); // Estimation 1 fenêtre / 15m²
    travaux.push({ type: "fenetres_double_vitrage", surface: nbFenetres });
  }

  return travaux;
}
```

---

## CALCUL BUDGET TOTAL

```javascript
function calculateTravauxBudget(travauxList) {
  let totalMin = 0;
  let totalMax = 0;
  const detail = [];

  for (const item of travauxList) {
    const cost = TRAVAUX_COSTS[item.type];
    if (!cost) continue;

    const min = cost.unite === "forfait" || cost.unite === "fenetre"
      ? cost.min * (item.surface || 1)
      : Math.round(cost.min * item.surface);
    const max = cost.unite === "forfait" || cost.unite === "fenetre"
      ? cost.max * (item.surface || 1)
      : Math.round(cost.max * item.surface);

    totalMin += min;
    totalMax += max;

    detail.push({
      type: item.type,
      label: TRAVAUX_LABELS[item.type],
      min, max,
    });
  }

  return { totalMin, totalMax, detail };
}

const TRAVAUX_LABELS = {
  peinture_complete:      "Peinture complète",
  sol_renovation:         "Rénovation des sols",
  cuisine_renovation:     "Rénovation cuisine",
  sdb_renovation:         "Rénovation salle de bain",
  electricite_mise_norme: "Mise aux normes électriques",
  plomberie_renovation:   "Rénovation plomberie",
  isolation_thermique:    "Isolation thermique",
  chauffage_remplacement: "Remplacement chauffage",
  fenetres_double_vitrage:"Remplacement fenêtres",
  toiture_renovation:     "Rénovation toiture",
  facade_ravalement:      "Ravalement façade",
};
```

---

## AFFICHAGE COMPOSANT

```jsx
function TravauxEstimation({ meta, synth }) {
  const travauxList = detectTravauxNeeded(synth, meta);
  if (travauxList.length === 0) return null;

  const { totalMin, totalMax, detail } = calculateTravauxBudget(travauxList);

  return (
    <Card>
      <ST color="#E8B44A">ESTIMATION TRAVAUX</ST>

      <div style={{
        fontSize: 18, fontWeight: 900, color: "#E8B44A", marginBottom: 12,
      }}>
        {totalMin.toLocaleString()} — {totalMax.toLocaleString()} €
      </div>

      {detail.map((item, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 11, color: "#8A7060", padding: "6px 0",
          borderBottom: "1px solid #1A1410",
        }}>
          <span>{item.label}</span>
          <span style={{ color: "#E8B44A" }}>
            {item.min.toLocaleString()}—{item.max.toLocaleString()}€
          </span>
        </div>
      ))}

      <div style={{ fontSize: 9, color: "#3A2A1A", marginTop: 10, fontStyle: "italic" }}>
        Estimation indicative basée sur les prix moyens du marché.
        Demander des devis professionnels pour un chiffrage précis.
      </div>
    </Card>
  );
}
```

---

## INTÉGRATION DANS LE PRIX TOTAL ACQUÉREUR

```javascript
function getTotalAcquisitionCost(meta, travauxBudget) {
  const prixAchat = Number(meta.prix) || 0;
  const fraisNotaire = Math.round(prixAchat * 0.075); // ~7-8% ancien
  const travauxMoyen = (travauxBudget.totalMin + travauxBudget.totalMax) / 2;

  return {
    prixAchat,
    fraisNotaire,
    travaux: Math.round(travauxMoyen),
    total: Math.round(prixAchat + fraisNotaire + travauxMoyen),
  };
}
```

---

## RÈGLES D'AFFICHAGE

```
Afficher l'estimation SEULEMENT si des travaux sont détectés
Toujours préciser "indicatif" et recommander des devis pros
Ne jamais présenter comme un chiffrage garanti
Utile pour : conseiller l'acheteur, justifier une négociation
```
