---
name: zaymmo-memory
description: Mémoire contextuelle de Zaymmo. Lire avant toute modification de la persistance de contexte entre sessions. Permet à ZayZay et au système de se souvenir des préférences, habitudes et contexte de l'agent entre les sessions.
---

# Zaymmo Memory

## PRINCIPE

Au-delà du simple historique, Zaymmo Memory retient le CONTEXTE
et les PRÉFÉRENCES de l'agent pour personnaliser l'expérience.

---

## STRUCTURE MÉMOIRE

```javascript
const MEMORY_KEY = "zaymmo_memory";

const memoryStructure = {
  preferences: {
    paysDefaut: "fr",
    langueDefaut: "fr",
    typeBienFrequent: "Maison",
    deviseDefaut: "EUR",
    tonAnnoncePrefere: "premium", // détecté via feedback
  },
  habitudes: {
    heureUsageFrequente: null,   // matin/après-midi/soir
    dureeAnalyseMoyenne: null,
    nombrePhotosMoyen: null,
  },
  contexteRecent: {
    derniereVille: "",
    dernierType: "",
    dernierPays: "",
  },
  villesFrequentes: [],          // ["Saint-Ail", "Luxembourg-Ville"]
};
```

---

## LECTURE ET ÉCRITURE MÉMOIRE

```javascript
function getMemory() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || "{}");
  } catch { return {}; }
}

function updateMemory(updates) {
  const current = getMemory();
  const updated = { ...current, ...updates };
  localStorage.setItem(MEMORY_KEY, JSON.stringify(updated));
  return updated;
}
```

---

## APPRENTISSAGE DES PRÉFÉRENCES

```javascript
// Après chaque analyse — mettre à jour le contexte
function learnFromSession(meta) {
  const memory = getMemory();

  // Type de bien le plus fréquent
  const history = JSON.parse(localStorage.getItem("zaymmo_history") || "[]");
  const typeCounts = history.reduce((acc, h) => {
    acc[h.type] = (acc[h.type] || 0) + 1;
    return acc;
  }, {});
  const typeFrequent = Object.entries(typeCounts).sort((a,b) => b[1]-a[1])[0]?.[0];

  // Villes fréquentes
  const villeCounts = history.reduce((acc, h) => {
    if (h.ville) acc[h.ville] = (acc[h.ville] || 0) + 1;
    return acc;
  }, {});
  const villesFrequentes = Object.entries(villeCounts)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 5)
    .map(([ville]) => ville);

  updateMemory({
    preferences: {
      ...memory.preferences,
      paysDefaut: meta.pays,
      langueDefaut: meta.langAnnonce,
      typeBienFrequent: typeFrequent || memory.preferences?.typeBienFrequent,
    },
    contexteRecent: {
      derniereVille: meta.ville,
      dernierType: meta.type,
      dernierPays: meta.pays,
    },
    villesFrequentes,
  });
}
```

---

## PRÉ-REMPLISSAGE INTELLIGENT NOUVEAU BIEN

```javascript
// Quand l'agent commence une nouvelle annonce — suggérer les valeurs habituelles
function getSmartDefaults() {
  const memory = getMemory();
  const prefs = memory.preferences || {};

  return {
    pays: prefs.paysDefaut || "fr",
    langAnnonce: prefs.langueDefaut || "fr",
    type: prefs.typeBienFrequent || "Appartement",
    devise: prefs.deviseDefaut || "EUR",
  };
}

// Utilisation dans resetAll()
function resetAllWithMemory() {
  const smartDefaults = getSmartDefaults();
  setMeta({
    ...defaultMeta,
    ...smartDefaults,
  });
}
```

---

## AUTOCOMPLÉTION VILLE

```jsx
function VilleAutocomplete({ value, onChange }) {
  const memory = getMemory();
  const suggestions = memory.villesFrequentes || [];

  return (
    <div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        list="villes-frequentes"
        placeholder="ex: Luxembourg-Ville"
        style={{ width: "100%", padding: 10 }}
      />
      <datalist id="villes-frequentes">
        {suggestions.map(v => <option key={v} value={v} />)}
      </datalist>
    </div>
  );
}
```

---

## MÉMOIRE CONVERSATIONNELLE ZAYZAY

```javascript
// ZayZay se souvient du contexte de la session précédente
function getZayZayMemoryContext() {
  const memory = getMemory();

  return `CONTEXTE AGENT (mémoire):
Type de bien habituel: ${memory.preferences?.typeBienFrequent || "non défini"}
Pays habituel: ${memory.preferences?.paysDefaut || "fr"}
Villes fréquentes: ${(memory.villesFrequentes || []).join(", ") || "aucune"}
Dernier bien traité: ${memory.contexteRecent?.dernierType || ""} à ${memory.contexteRecent?.derniereVille || ""}`;
}

// Intégrer dans zayZaySystemPrompt()
```

---

## RÉINITIALISATION MÉMOIRE

```javascript
// Option dans les paramètres — pour repartir à zéro
function resetMemory() {
  if (window.confirm("Réinitialiser les préférences mémorisées ?")) {
    localStorage.removeItem(MEMORY_KEY);
    alert("Mémoire réinitialisée.");
  }
}
```

---

## CONFIDENTIALITÉ MÉMOIRE

```
La mémoire Zaymmo ne contient QUE :
✓ Préférences d'usage (type bien, pays, langue)
✓ Statistiques agrégées (villes fréquentes)
✓ Contexte technique (dernier type de bien traité)

Elle ne contient JAMAIS :
✗ Données personnelles d'acheteurs
✗ Informations financières sensibles
✗ Contenu des conversations ZayZay verbatim
```
