---
name: zaymmo-neural-price
description: Estimation de prix avancée Zaymmo combinant IA et données historiques. Lire avant toute modification du moteur d'estimation. Combine score IA, comparables, benchmark interne et tendances pour l'estimation la plus précise possible.
---

# Zaymmo Neural Price

## PRINCIPE

Neural Price combine TOUTES les sources de données disponibles
pour produire l'estimation la plus fiable possible :
Score IA + Comparables + Benchmark interne + Green Score + Marché

---

## MOTEUR D'ESTIMATION COMBINÉ

```javascript
function calculateNeuralPrice(meta, synth, comparables, historyBenchmark) {
  const sources = [];
  let weightedSum = 0;
  let totalWeight = 0;

  // Source 1 : Estimation IA initiale (poids: 30%)
  if (synth?.fourchette_prix) {
    const [low, high] = synth.fourchette_prix.split("-").map(Number);
    const mid = (low + high) / 2;
    sources.push({ source: "Analyse IA photos", valeur: mid, poids: 30 });
    weightedSum += mid * 30;
    totalWeight += 30;
  }

  // Source 2 : Comparables marché réels (poids: 35% — le plus fiable)
  if (comparables?.estimationMoyenne) {
    sources.push({ source: "Comparables secteur", valeur: comparables.estimationMoyenne, poids: 35 });
    weightedSum += comparables.estimationMoyenne * 35;
    totalWeight += 35;
  }

  // Source 3 : Benchmark interne agent (poids: 20%)
  if (historyBenchmark?.prixMoyenM2) {
    const estimBenchmark = historyBenchmark.prixMoyenM2 * Number(meta.surface);
    sources.push({ source: "Historique agent", valeur: estimBenchmark, poids: 20 });
    weightedSum += estimBenchmark * 20;
    totalWeight += 20;
  }

  // Source 4 : Prix déclaré agent (poids: 15% — référence)
  if (meta.prix) {
    sources.push({ source: "Prix saisi agent", valeur: Number(meta.prix), poids: 15 });
    weightedSum += Number(meta.prix) * 15;
    totalWeight += 15;
  }

  if (totalWeight === 0) return null;

  const estimationFinale = Math.round(weightedSum / totalWeight);
  const marge = Math.round(estimationFinale * 0.08); // ±8%

  return {
    estimationFinale,
    fourchetteBasse: estimationFinale - marge,
    fourchetteHaute: estimationFinale + marge,
    sources,
    confiance: calculateConfidence(sources.length, totalWeight),
  };
}

function calculateConfidence(nbSources, totalWeight) {
  if (nbSources >= 3 && totalWeight >= 70) return { label: "Élevée", color: "#4AE88A" };
  if (nbSources >= 2 && totalWeight >= 45) return { label: "Moyenne", color: "#E8B44A" };
  return { label: "Faible", color: "#E84A4A" };
}
```

---

## COMPOSANT AFFICHAGE NEURAL PRICE

```jsx
function NeuralPriceCard({ meta, synth, comparables, historyBenchmark }) {
  const result = calculateNeuralPrice(meta, synth, comparables, historyBenchmark);

  if (!result) return null;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <ST color="#C8793A">NEURAL PRICE™</ST>
        <div style={{
          fontSize: 9, padding: "3px 8px", borderRadius: 4,
          background: `${result.confiance.color}15`, color: result.confiance.color,
        }}>
          Confiance {result.confiance.label}
        </div>
      </div>

      <div style={{ fontSize: 24, fontWeight: 900, color: "#C8793A", marginBottom: 4 }}>
        {result.estimationFinale.toLocaleString()} €
      </div>
      <div style={{ fontSize: 11, color: "#8A7060", marginBottom: 14 }}>
        Fourchette: {result.fourchetteBasse.toLocaleString()} — {result.fourchetteHaute.toLocaleString()} €
      </div>

      {/* Sources */}
      <div style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 1, marginBottom: 8 }}>
        SOURCES UTILISÉES ({result.sources.length})
      </div>
      {result.sources.map((s, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 10, color: "#8A7060", padding: "4px 0",
          borderBottom: "1px solid #1A1410",
        }}>
          <span>{s.source} ({s.poids}%)</span>
          <span style={{ color: "#C8793A" }}>{Math.round(s.valeur).toLocaleString()}€</span>
        </div>
      ))}

      <div style={{ fontSize: 9, color: "#3A2A1A", marginTop: 10, fontStyle: "italic" }}>
        Estimation combinée multi-sources — indicative, non contractuelle
      </div>
    </Card>
  );
}
```

---

## ÉVOLUTION DE LA PRÉCISION DANS LE TEMPS

```javascript
// Plus l'agent utilise Zaymmo, plus le benchmark interne s'enrichit
// et plus Neural Price devient précis pour son marché spécifique

function getPrecisionEvolution() {
  const history = JSON.parse(localStorage.getItem("zaymmo_history") || "[]");

  return {
    nombreBiensAnalyses: history.length,
    qualiteEstimation:
      history.length < 5  ? "Базовая — peu de données historiques" :
      history.length < 20 ? "Bonne — historique en construction" :
      history.length < 50 ? "Très bonne — historique solide" :
      "Excellente — historique riche et fiable",
  };
}
```

---

## AVERTISSEMENT TRANSPARENCE

```
Neural Price combine plusieurs sources d'estimation pour réduire
les biais d'une source unique. Plus il y a de sources disponibles
(comparables, historique), plus l'estimation est fiable.

Toujours afficher :
"Estimation Neural Price — combine IA, comparables et historique.
À titre indicatif uniquement, ne remplace pas une expertise professionnelle."
```
