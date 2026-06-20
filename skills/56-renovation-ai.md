---
name: zaymmo-renovation-ai
description: Conseil de rénovation IA Zaymmo. Lire avant toute modification des suggestions de travaux. Génère un plan de rénovation priorisé avec retour sur investissement estimé pour chaque amélioration suggérée.
---

# Zaymmo Renovation AI

## PRINCIPE

Au-delà de l'estimation de coût travaux, Zaymmo Renovation AI
priorise les améliorations selon leur retour sur investissement —
quels travaux rapportent le plus de valeur ajoutée.

---

## CALCUL RETOUR SUR INVESTISSEMENT TRAVAUX

```javascript
const RENOVATION_ROI = {
  peinture_complete:      { coutMoyen: 3000,  valeurAjoutee: 4500,  roi: 1.5 },
  cuisine_renovation:     { coutMoyen: 10000, valeurAjoutee: 16000, roi: 1.6 },
  sdb_renovation:         { coutMoyen: 7000,  valeurAjoutee: 11000, roi: 1.57 },
  isolation_thermique:    { coutMoyen: 8000,  valeurAjoutee: 13000, roi: 1.62 },
  fenetres_double_vitrage:{ coutMoyen: 6000,  valeurAjoutee: 9000,  roi: 1.5 },
  amenagement_exterieur:  { coutMoyen: 5000,  valeurAjoutee: 7500,  roi: 1.5 },
  chauffage_remplacement: { coutMoyen: 7000,  valeurAjoutee: 9500,  roi: 1.36 },
  toiture_renovation:     { coutMoyen: 12000, valeurAjoutee: 14000, roi: 1.17 },
  electricite_mise_norme: { coutMoyen: 6000,  valeurAjoutee: 7000,  roi: 1.17 },
};
```

---

## GÉNÉRATION PLAN DE RÉNOVATION PRIORISÉ

```javascript
function generateRenovationPlan(synth, meta) {
  const detectedNeeds = detectTravauxNeeded(synth, meta); // depuis skill Estimation Travaux

  const planned = detectedNeeds
    .map(item => {
      const roi = RENOVATION_ROI[item.type];
      if (!roi) return null;
      return {
        type: item.type,
        label: TRAVAUX_LABELS[item.type],
        coutEstime: roi.coutMoyen,
        valeurAjoutee: roi.valeurAjoutee,
        roi: roi.roi,
        gainNet: roi.valeurAjoutee - roi.coutMoyen,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.roi - a.roi); // Trier par meilleur ROI d'abord

  return {
    items: planned,
    coutTotalEstime: planned.reduce((sum, p) => sum + p.coutEstime, 0),
    valeurAjouteeTotal: planned.reduce((sum, p) => sum + p.valeurAjoutee, 0),
    gainNetTotal: planned.reduce((sum, p) => sum + p.gainNet, 0),
  };
}
```

---

## COMPOSANT PLAN DE RÉNOVATION

```jsx
function RenovationPlanPanel({ synth, meta }) {
  const plan = generateRenovationPlan(synth, meta);

  if (plan.items.length === 0) return null;

  return (
    <Card>
      <ST color="#4AE88A">PLAN DE RÉNOVATION OPTIMISÉ</ST>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14,
      }}>
        <div>
          <div style={{ fontSize: 9, color: "#3A2A1A" }}>INVESTISSEMENT</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#E8B44A" }}>
            {plan.coutTotalEstime.toLocaleString()}€
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "#3A2A1A" }}>GAIN NET ESTIMÉ</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#4AE88A" }}>
            +{plan.gainNetTotal.toLocaleString()}€
          </div>
        </div>
      </div>

      {/* Liste priorisée */}
      <div style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 1, marginBottom: 8 }}>
        PRIORITÉ (meilleur ROI en premier)
      </div>
      {plan.items.map((item, i) => (
        <div key={i} style={{
          padding: "8px 10px", background: "#0A0A0A", borderRadius: 6,
          marginBottom: 6, display: "flex", justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#E8D8C0" }}>
              {i+1}. {item.label}
            </div>
            <div style={{ fontSize: 9, color: "#3A2A1A" }}>
              Coût: {item.coutEstime.toLocaleString()}€
            </div>
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700,
            color: item.roi >= 1.5 ? "#4AE88A" : "#E8B44A",
          }}>
            ROI {item.roi}x
          </div>
        </div>
      ))}

      <div style={{ fontSize: 9, color: "#3A2A1A", marginTop: 10, fontStyle: "italic" }}>
        ROI indicatif basé sur moyennes marché — varie selon localisation et qualité d'exécution
      </div>
    </Card>
  );
}
```

---

## ARGUMENTAIRE POUR L'ACHETEUR

```javascript
function getRenovationPitch(plan) {
  if (plan.items.length === 0) return null;

  const topItem = plan.items[0];

  return `Ce bien présente un excellent potentiel de valorisation. ` +
    `La rénovation prioritaire (${topItem.label.toLowerCase()}) offre un retour ` +
    `sur investissement de ${topItem.roi}x — un investissement de ${topItem.coutEstime.toLocaleString()}€ ` +
    `pourrait ajouter jusqu'à ${topItem.valeurAjoutee.toLocaleString()}€ de valeur au bien.`;
}
```

---

## RECOMMANDATIONS PAR BUDGET DISPONIBLE

```javascript
function getRecommendationsForBudget(plan, budgetDisponible) {
  let remainingBudget = budgetDisponible;
  const selected = [];

  for (const item of plan.items) {
    if (item.coutEstime <= remainingBudget) {
      selected.push(item);
      remainingBudget -= item.coutEstime;
    }
  }

  return {
    selected,
    budgetUtilise: budgetDisponible - remainingBudget,
    budgetRestant: remainingBudget,
    valeurAjouteeTotal: selected.reduce((sum, i) => sum + i.valeurAjoutee, 0),
  };
}
```
