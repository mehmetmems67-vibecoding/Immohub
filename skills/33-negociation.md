---
name: zaymmo-negociation
description: Assistant de négociation Zaymmo. Lire avant toute modification des suggestions de négociation. Aide l'agent à conseiller vendeur et acheteur avec des arguments factuels basés sur l'analyse du bien.
---

# Zaymmo Négociation

## PRINCIPE

Zaymmo fournit des arguments factuels pour la négociation,
basés sur le score, le marché et les caractéristiques réelles du bien.
L'IA ne négocie jamais à la place de l'agent — elle l'arme d'arguments.

---

## ARGUMENTS CÔTÉ VENDEUR (justifier le prix)

```javascript
function getSellerArguments(meta, synth) {
  const args = [];

  if (synth?.score_global >= 7.5) {
    args.push(`Score qualité ${synth.score_global}/10 — bien au-dessus de la moyenne du marché`);
  }

  if (["A","B"].includes(meta.dpe)) {
    args.push(`DPE ${meta.dpe} — économies d'énergie significatives pour l'acheteur, argument de valeur`);
  }

  if (meta.garage || meta.parking) {
    args.push("Stationnement inclus — rare et recherché en zone urbaine");
  }

  if (synth?.points_forts?.length >= 3) {
    args.push(`Multiples atouts : ${synth.points_forts.slice(0,3).join(", ")}`);
  }

  if (meta.terrain && Number(meta.terrain) > 1000) {
    args.push(`Terrain de ${meta.terrain}m² — potentiel d'extension ou de valorisation future`);
  }

  return args;
}
```

---

## ARGUMENTS CÔTÉ ACHETEUR (justifier une offre inférieure)

```javascript
function getBuyerArguments(meta, synth) {
  const args = [];

  if (synth?.points_faibles?.length > 0) {
    args.push(`Travaux à prévoir : ${synth.points_faibles.slice(0,2).join(", ")}`);
  }

  if (["E","F","G"].includes(meta.dpe)) {
    args.push(`DPE ${meta.dpe} — coûts énergétiques élevés à anticiper, travaux de rénovation énergétique recommandés`);
  }

  if (synth?.retouches_home_staging?.length >= 2) {
    args.push("Présentation à rafraîchir avant mise en valeur optimale");
  }

  if (meta.annee && Number(meta.annee) < 1980) {
    args.push("Bien ancien — vérifier l'état des installations électriques et plomberie");
  }

  return args;
}
```

---

## CALCUL MARGE DE NÉGOCIATION SUGGÉRÉE

```javascript
function getSuggestedMargin(meta, synth) {
  let baseMargin = 5; // % par défaut

  // Score élevé = moins de marge
  if (synth?.score_global >= 8) baseMargin = 2;
  else if (synth?.score_global >= 6) baseMargin = 4;
  else baseMargin = 7;

  // DPE faible = plus de marge négociable
  if (["F","G"].includes(meta.dpe)) baseMargin += 3;

  // Temps sur le marché (si connu via historique)
  // Plus le bien est ancien dans l'historique, plus la marge augmente

  return {
    pourcentage: baseMargin,
    montant: meta.prix ? Math.round(Number(meta.prix) * baseMargin / 100) : null,
  };
}
```

---

## COMPOSANT ASSISTANT NÉGOCIATION

```jsx
function NegotiationAssistant({ meta, synth }) {
  const [view, setView] = useState("vendeur"); // vendeur | acheteur

  const sellerArgs = getSellerArguments(meta, synth);
  const buyerArgs  = getBuyerArguments(meta, synth);
  const margin     = getSuggestedMargin(meta, synth);

  return (
    <Card>
      <ST color="#C8793A">ASSISTANT NÉGOCIATION</ST>

      {/* Toggle vue */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <button onClick={() => setView("vendeur")}
          style={{
            flex: 1, padding: 8, borderRadius: 6, fontSize: 11,
            background: view === "vendeur" ? "#C8793A20" : "transparent",
            color: view === "vendeur" ? "#C8793A" : "#3A2A1A",
            border: "1px solid #1A1410",
          }}>
          Côté vendeur
        </button>
        <button onClick={() => setView("acheteur")}
          style={{
            flex: 1, padding: 8, borderRadius: 6, fontSize: 11,
            background: view === "acheteur" ? "#00D4E820" : "transparent",
            color: view === "acheteur" ? "#00D4E8" : "#3A2A1A",
            border: "1px solid #1A1410",
          }}>
          Côté acheteur
        </button>
      </div>

      {/* Arguments */}
      <div style={{ marginBottom: 12 }}>
        {(view === "vendeur" ? sellerArgs : buyerArgs).map((arg, i) => (
          <div key={i} style={{
            fontSize: 11, color: "#8A7060", padding: "6px 10px",
            borderLeft: `2px solid ${view === "vendeur" ? "#C8793A40" : "#00D4E840"}`,
            marginBottom: 6,
          }}>
            {arg}
          </div>
        ))}
      </div>

      {/* Marge suggérée */}
      {margin.montant && (
        <div style={{
          padding: 10, background: "#0A0A1E", borderRadius: 8,
          border: "1px solid #1A1410",
        }}>
          <div style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 1 }}>
            MARGE NÉGOCIATION ESTIMÉE
          </div>
          <div style={{ fontSize: 14, color: "#C8793A", fontWeight: 700 }}>
            {margin.pourcentage}% — environ {margin.montant.toLocaleString()} €
          </div>
        </div>
      )}
    </Card>
  );
}
```

---

## RÈGLES ÉTHIQUES

```
L'assistant négociation est un OUTIL D'AIDE, pas une décision automatique.
L'agent reste seul juge de la stratégie de négociation appropriée.
Ne jamais présenter les suggestions comme des garanties.
Toujours mentionner : "Suggestions indicatives basées sur l'analyse IA"
```
