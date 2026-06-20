---
name: zaymmo-benchmark-marche
description: Benchmark et comparaison marché Zaymmo. Lire avant toute modification de l'analyse comparative. Compare les performances de l'agent avec ses propres données historiques pour identifier les tendances.
---

# Zaymmo Benchmark Marché

## PRINCIPE

Zaymmo compare automatiquement les nouveaux biens avec l'historique
de l'agent pour identifier les tendances, ce qui se vend vite,
quels types de biens performent le mieux.

---

## BENCHMARK INTERNE (basé sur historique agent)

```javascript
function getInternalBenchmark(meta) {
  const history = JSON.parse(localStorage.getItem("zaymmo_history") || "[]");

  // Biens similaires (même type, même ville si possible)
  const similaires = history.filter(h =>
    h.type === meta.type && h.id !== meta.id
  );

  if (similaires.length === 0) return null;

  const prixMoyenM2 = similaires
    .filter(h => h.prix && h.surface)
    .map(h => Number(h.prix) / Number(h.surface))
    .reduce((a, b, _, arr) => a + b / arr.length, 0);

  const scoreM oyen = similaires
    .filter(h => h.score)
    .reduce((a, b, _, arr) => a + b.score / arr.length, 0);

  return {
    nombreComparables: similaires.length,
    prixMoyenM2: Math.round(prixMoyenM2),
    scoreMoyenType: scoreMoyen.toFixed(1),
    positionPrix: meta.prix && meta.surface
      ? comparePricePosition(Number(meta.prix) / Number(meta.surface), prixMoyenM2)
      : null,
  };
}

function comparePricePosition(prixM2Bien, prixM2Moyen) {
  const diff = ((prixM2Bien - prixM2Moyen) / prixM2Moyen) * 100;
  if (diff > 15) return { label: "Au-dessus de la moyenne", diff: Math.round(diff), color: "#E84A4A" };
  if (diff < -15) return { label: "En-dessous de la moyenne", diff: Math.round(diff), color: "#4AE88A" };
  return { label: "Dans la moyenne", diff: Math.round(diff), color: "#C8793A" };
}
```

---

## COMPOSANT BENCHMARK

```jsx
function BenchmarkPanel({ meta }) {
  const benchmark = getInternalBenchmark(meta);

  if (!benchmark) {
    return (
      <div style={{ fontSize: 11, color: "#3A2A1A", textAlign: "center", padding: 16 }}>
        Pas assez de données historiques pour comparer ce type de bien
      </div>
    );
  }

  return (
    <Card>
      <ST color="#00D4E8">BENCHMARK INTERNE</ST>

      <div style={{ fontSize: 10, color: "#8A7060", marginBottom: 12 }}>
        Comparé à {benchmark.nombreComparables} bien(s) similaire(s) déjà analysé(s)
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={{ fontSize: 9, color: "#3A2A1A" }}>PRIX MOYEN/M²</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#C8793A" }}>
            {benchmark.prixMoyenM2.toLocaleString()}€
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "#3A2A1A" }}>SCORE MOYEN</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#00D4E8" }}>
            {benchmark.scoreMoyenType}/10
          </div>
        </div>
      </div>

      {benchmark.positionPrix && (
        <div style={{
          marginTop: 12, padding: "8px 12px",
          background: `${benchmark.positionPrix.color}15`, borderRadius: 6,
        }}>
          <div style={{ fontSize: 11, color: benchmark.positionPrix.color }}>
            {benchmark.positionPrix.label} ({benchmark.positionPrix.diff > 0 ? "+" : ""}{benchmark.positionPrix.diff}%)
          </div>
        </div>
      )}
    </Card>
  );
}
```

---

## TENDANCES PAR TYPE DE BIEN

```javascript
function getTrendsByType() {
  const history = JSON.parse(localStorage.getItem("zaymmo_history") || "[]");

  const byType = {};
  history.forEach(h => {
    if (!byType[h.type]) byType[h.type] = [];
    byType[h.type].push(h);
  });

  return Object.entries(byType).map(([type, entries]) => ({
    type,
    count: entries.length,
    scoreMoyen: entries.filter(e => e.score)
      .reduce((a,b,_,arr) => a + b.score/arr.length, 0).toFixed(1),
    prixMoyen: Math.round(
      entries.filter(e => e.prix)
        .reduce((a,b,_,arr) => a + Number(b.prix)/arr.length, 0)
    ),
  })).sort((a, b) => b.count - a.count);
}
```

---

## MEILLEURS SCORES (top biens)

```javascript
function getTopScoredBiens(limit = 5) {
  const history = JSON.parse(localStorage.getItem("zaymmo_history") || "[]");
  return history
    .filter(h => h.score)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
```

---

## AFFICHAGE TENDANCES

```jsx
function TrendsPanel() {
  const trends = getTrendsByType();
  const topBiens = getTopScoredBiens(3);

  return (
    <Card>
      <ST color="#C8793A">TENDANCES PAR TYPE</ST>

      {trends.map(t => (
        <div key={t.type} style={{
          display: "flex", justifyContent: "space-between",
          padding: "8px 0", borderBottom: "1px solid #1A1410",
        }}>
          <div>
            <div style={{ fontSize: 12, color: "#E8D8C0" }}>{t.type}</div>
            <div style={{ fontSize: 9, color: "#3A2A1A" }}>{t.count} bien(s)</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#C8793A" }}>{t.prixMoyen.toLocaleString()}€</div>
            <div style={{ fontSize: 9, color: "#00D4E8" }}>{t.scoreMoyen}/10</div>
          </div>
        </div>
      ))}

      {topBiens.length > 0 && (
        <>
          <div style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 1, marginTop: 14, marginBottom: 8 }}>
            TOP BIENS (meilleurs scores)
          </div>
          {topBiens.map((b, i) => (
            <div key={b.id} style={{ fontSize: 11, color: "#8A7060", padding: "4px 0" }}>
              {i+1}. {b.type} {b.ville} — {b.score}/10
            </div>
          ))}
        </>
      )}
    </Card>
  );
}
```
