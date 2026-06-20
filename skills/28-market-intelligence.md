---
name: zaymmo-market-intelligence
description: Intelligence marché de Zaymmo. Lire avant toute modification des fonctionnalités d'estimation de prix, comparables, négociation ou prédiction. Fournit aux agents des données de marché pour mieux conseiller leurs clients.
---

# Zaymmo Market Intelligence

## PRINCIPE

Zaymmo aide l'agent à positionner le bien sur le marché.
Les estimations sont basées sur les données saisies + connaissance générale du marché.
Toujours indicatif — jamais une garantie de prix.

---

## ESTIMATION FOURCHETTE PRIX

```javascript
// Déjà intégré dans sPrompt — synth.fourchette_prix
// Affichage avec contexte marché

function PriceEstimation({ synth, meta }) {
  if (!synth?.fourchette_prix) return null;

  const [low, high] = synth.fourchette_prix.split("-").map(Number);
  const prixM2Low  = Math.round(low / Number(meta.surface || 1));
  const prixM2High = Math.round(high / Number(meta.surface || 1));

  return (
    <div style={{
      background: "#0A0A1E",
      borderRadius: 10,
      padding: 12,
      border: "1px solid #00D4E830",
    }}>
      <div style={{ fontSize: 9, color: "#00D4E8", letterSpacing: 2, marginBottom: 8 }}>
        ESTIMATION MARCHÉ
      </div>
      <div style={{ fontSize: 16, fontWeight: 900, color: "#C8793A" }}>
        {low.toLocaleString()} — {high.toLocaleString()} €
      </div>
      <div style={{ fontSize: 11, color: "#8A7060", marginTop: 4 }}>
        Soit {prixM2Low.toLocaleString()} — {prixM2High.toLocaleString()} €/m²
      </div>
      {meta.prix && (
        <PricePositioning prix={Number(meta.prix)} low={low} high={high} />
      )}
    </div>
  );
}

function PricePositioning({ prix, low, high }) {
  let position, color, message;

  if (prix < low) {
    position = "Sous-évalué";
    color = "#4AE88A";
    message = "Le prix demandé est inférieur à l'estimation marché";
  } else if (prix > high) {
    position = "Au-dessus du marché";
    color = "#E84A4A";
    message = "Le prix demandé dépasse l'estimation — risque d'allonger le délai de vente";
  } else {
    position = "Dans le marché";
    color = "#C8793A";
    message = "Le prix est cohérent avec l'estimation";
  }

  return (
    <div style={{
      marginTop: 8, padding: "6px 10px",
      background: `${color}15`, borderRadius: 6,
      fontSize: 10, color: color,
    }}>
      {position} — {message}
    </div>
  );
}
```

---

## PRIX AU M² PAR TYPE DE BIEN

```javascript
// Calcul et affichage
function calculatePricePerM2(meta) {
  if (!meta.prix || !meta.surface) return null;
  return Math.round(Number(meta.prix) / Number(meta.surface));
}

// Comparaison avec moyenne locale (déclaratif — l'agent connaît son marché)
function PricePerM2Display({ meta }) {
  const prixM2 = calculatePricePerM2(meta);
  if (!prixM2) return null;

  return (
    <div style={{ fontSize: 11, color: "#8A7060" }}>
      Prix au m² : <span style={{ color: "#C8793A", fontWeight: 700 }}>
        {prixM2.toLocaleString()} €/m²
      </span>
    </div>
  );
}
```

---

## ESTIMATION DURÉE DE VENTE

```javascript
function estimateSaleDuration(synth, meta) {
  let baseScore = synth?.score_global || 5;
  let factors = [];

  // Score élevé = vente plus rapide
  let weeks = 16 - (baseScore * 1.2);

  // Ajustements
  if (meta.prix && synth?.fourchette_prix) {
    const [low, high] = synth.fourchette_prix.split("-").map(Number);
    if (Number(meta.prix) > high) {
      weeks += 6;
      factors.push("Prix au-dessus du marché (+6 semaines)");
    } else if (Number(meta.prix) < low) {
      weeks -= 3;
      factors.push("Prix attractif (-3 semaines)");
    }
  }

  if (["A","B"].includes(meta.dpe)) {
    weeks -= 2;
    factors.push("DPE performant (-2 semaines)");
  } else if (["F","G"].includes(meta.dpe)) {
    weeks += 4;
    factors.push("DPE faible (+4 semaines)");
  }

  weeks = Math.max(2, Math.round(weeks));

  return {
    semaines_min: Math.max(2, weeks - 4),
    semaines_max: weeks + 4,
    facteurs: factors,
  };
}
```

---

## SUGGESTION DE NÉGOCIATION

```javascript
function getNegotiationAdvice(meta, synth) {
  if (!meta.prix || !synth?.fourchette_prix) return null;

  const [low, high] = synth.fourchette_prix.split("-").map(Number);
  const prix = Number(meta.prix);
  const milieu = (low + high) / 2;

  let marge;
  if (prix > high) {
    marge = Math.round(((prix - milieu) / prix) * 100);
    return {
      type: "à la baisse",
      pourcentage: marge,
      conseil: `Le prix actuel laisse une marge de négociation d'environ ${marge}%. Préparez l'acheteur à cette possibilité.`,
    };
  } else if (prix < low) {
    return {
      type: "ferme",
      pourcentage: 0,
      conseil: "Le prix est déjà attractif — peu de marge de négociation, le bien devrait se vendre rapidement.",
    };
  }

  return {
    type: "standard",
    pourcentage: 3,
    conseil: "Prix cohérent avec le marché — marge de négociation standard de 2-5%.",
  };
}
```

---

## COMPARABLES MARCHÉ (déclaratif agent)

```jsx
// L'agent peut saisir des comparables connus pour enrichir l'analyse
function ComparablesInput({ comparables, onAdd, onRemove }) {
  const [newComp, setNewComp] = useState({ surface: "", prix: "", adresse: "" });

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 2, marginBottom: 8 }}>
        BIENS COMPARABLES (optionnel)
      </div>

      {comparables.map((c, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 11, color: "#8A7060", padding: "4px 0",
          borderBottom: "1px solid #1A1410",
        }}>
          <span>{c.adresse} — {c.surface}m²</span>
          <span style={{ color: "#C8793A" }}>{Number(c.prix).toLocaleString()}€</span>
        </div>
      ))}

      {/* Formulaire ajout rapide */}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <input placeholder="Surface" value={newComp.surface}
          onChange={e => setNewComp({...newComp, surface: e.target.value})}
          style={{ width: 60, fontSize: 10, padding: 4 }} />
        <input placeholder="Prix" value={newComp.prix}
          onChange={e => setNewComp({...newComp, prix: e.target.value})}
          style={{ width: 80, fontSize: 10, padding: 4 }} />
        <button onClick={() => { onAdd(newComp); setNewComp({surface:"",prix:"",adresse:""}); }}
          style={{ fontSize: 10, padding: "4px 10px", color: "#C8793A" }}>
          +
        </button>
      </div>
    </div>
  );
}
```

---

## INTÉGRATION DANS LE PROMPT D'ANALYSE

```javascript
// Enrichir sPrompt avec contexte marché si comparables fournis
function getMarketContext(comparables) {
  if (!comparables?.length) return "";

  const avgPriceM2 = comparables.reduce((sum, c) =>
    sum + (Number(c.prix) / Number(c.surface)), 0) / comparables.length;

  return `\nCOMPARABLES MARCHÉ FOURNIS PAR L'AGENT:
${comparables.map(c => `- ${c.adresse}: ${c.surface}m² à ${c.prix}€`).join("\n")}
Prix moyen au m² du secteur: ${Math.round(avgPriceM2)}€/m²
Utilise ces données pour affiner la fourchette de prix.`;
}
```

---

## AVERTISSEMENT LÉGAL

```
Toutes les estimations Zaymmo sont INDICATIVES.
Elles ne remplacent pas une expertise immobilière professionnelle.
L'agent reste seul responsable du prix final conseillé au client.
Mention à afficher : "Estimation IA à titre indicatif — non contractuelle"
```
