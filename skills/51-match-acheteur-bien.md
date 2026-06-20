---
name: zaymmo-match-acheteur-bien
description: Algorithme de matching acheteur-bien Zaymmo. Lire avant toute modification du système de correspondance. Connecte automatiquement les contacts CRM aux nouveaux biens correspondant à leurs critères.
---

# Zaymmo Match Acheteur-Bien

## PRINCIPE

Quand un nouveau bien est analysé, Zaymmo vérifie automatiquement
si des contacts existants correspondent aux critères — alerte l'agent.

---

## ALGORITHME DE MATCHING

```javascript
function calculateMatchScore(meta, criteres) {
  let score = 0;
  let maxScore = 0;
  const matchDetails = [];

  // Budget (poids: 30)
  maxScore += 30;
  if (criteres.budgetMax) {
    const prix = Number(meta.prix);
    const budgetMax = Number(criteres.budgetMax);
    const budgetMin = Number(criteres.budgetMin) || 0;

    if (prix >= budgetMin && prix <= budgetMax) {
      score += 30;
      matchDetails.push("Budget compatible");
    } else if (prix <= budgetMax * 1.1) {
      score += 15;
      matchDetails.push("Budget proche (10% au-dessus)");
    }
  } else {
    score += 15; // Pas de critère = neutre
  }

  // Type de bien (poids: 25)
  maxScore += 25;
  if (criteres.typeRecherche) {
    if (criteres.typeRecherche === meta.type) {
      score += 25;
      matchDetails.push("Type de bien exact");
    }
  } else {
    score += 12;
  }

  // Surface (poids: 20)
  maxScore += 20;
  if (criteres.surfaceMin) {
    const surface = Number(meta.surface);
    const surfaceMin = Number(criteres.surfaceMin);
    if (surface >= surfaceMin) {
      score += 20;
      matchDetails.push("Surface suffisante");
    } else if (surface >= surfaceMin * 0.9) {
      score += 10;
      matchDetails.push("Surface proche");
    }
  } else {
    score += 10;
  }

  // Ville (poids: 25)
  maxScore += 25;
  if (criteres.villesRecherchees?.length > 0) {
    const matches = criteres.villesRecherchees.some(v =>
      meta.ville?.toLowerCase().includes(v.toLowerCase())
    );
    if (matches) {
      score += 25;
      matchDetails.push("Ville recherchée");
    }
  } else {
    score += 12;
  }

  return {
    pourcentage: Math.round((score / maxScore) * 100),
    matchDetails,
  };
}
```

---

## RECHERCHE DE TOUS LES MATCHS

```javascript
function findAllMatches(meta) {
  const contacts = JSON.parse(localStorage.getItem("zaymmo_contacts") || "[]");

  const matches = contacts
    .filter(c => c.statut === "prospect" || c.statut === "actif")
    .map(c => ({
      contact: c,
      ...calculateMatchScore(meta, c.criteres || {}),
    }))
    .filter(m => m.pourcentage >= 60) // Seuil minimum pertinent
    .sort((a, b) => b.pourcentage - a.pourcentage);

  return matches;
}
```

---

## COMPOSANT ALERTE MATCH

```jsx
function MatchAlert({ meta }) {
  const matches = findAllMatches(meta);

  if (matches.length === 0) return null;

  return (
    <div style={{
      padding: 12, background: "#4AE88A10", borderRadius: 10,
      border: "1px solid #4AE88A30", marginBottom: 14,
    }}>
      <div style={{ fontSize: 11, color: "#4AE88A", fontWeight: 700, marginBottom: 8 }}>
        🎯 {matches.length} CONTACT(S) CORRESPONDENT À CE BIEN
      </div>

      {matches.slice(0, 3).map((m, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between",
          padding: "6px 0", borderBottom: "1px solid #1A1410",
        }}>
          <div>
            <div style={{ fontSize: 12, color: "#E8D8C0" }}>{m.contact.nom}</div>
            <div style={{ fontSize: 9, color: "#3A2A1A" }}>
              {m.matchDetails.join(" · ")}
            </div>
          </div>
          <div style={{
            fontSize: 14, fontWeight: 900,
            color: m.pourcentage >= 85 ? "#4AE88A" : "#E8B44A",
          }}>
            {m.pourcentage}%
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## ACTION RAPIDE — CONTACTER LE MATCH

```jsx
function MatchActionButtons({ match, meta, annonce }) {
  function sendWhatsApp() {
    const tel = match.contact.telephone?.replace(/[^0-9+]/g, "");
    const msg = encodeURIComponent(
      `Bonjour ${match.contact.nom}, j'ai un nouveau bien qui pourrait vous intéresser : ${annonce?.titre_principal || meta.type + " à " + meta.ville}. Souhaitez-vous plus d'informations ?`
    );
    window.open(`https://wa.me/${tel}?text=${msg}`, "_blank");
  }

  function logInteraction() {
    addContactNote(match.contact.id, "Match proposé", `Bien suggéré: ${meta.type} ${meta.ville} (match ${match.pourcentage}%)`);
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button onClick={() => { sendWhatsApp(); logInteraction(); }}
        style={{ fontSize: 10, padding: "4px 10px", background: "#4AE88A20", color: "#4AE88A" }}>
        Contacter
      </button>
    </div>
  );
}
```

---

## DÉCLENCHEMENT AUTOMATIQUE

```javascript
// Appeler après chaque analyse complétée
function checkMatchesAfterAnalysis(meta) {
  const matches = findAllMatches(meta);
  if (matches.length > 0) {
    trackEvent("matches_found", { count: matches.length, bestMatch: matches[0]?.pourcentage });
  }
  return matches;
}
```
