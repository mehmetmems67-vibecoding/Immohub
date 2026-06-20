---
name: zaymmo-comparables-marche
description: Gestion des biens comparables Zaymmo. Lire avant toute modification de la saisie ou utilisation de comparables marché. Permet à l'agent d'enrichir l'estimation avec des données réelles du secteur.
---

# Zaymmo Comparables Marché

## PRINCIPE

L'agent peut saisir manuellement des biens comparables récemment vendus
dans le secteur pour affiner l'estimation de prix proposée par l'IA.

---

## STRUCTURE COMPARABLE

```javascript
const comparableStructure = {
  id: Date.now().toString(),
  adresse: "",
  ville: "",
  type: "",
  surface: "",
  prix: "",
  dateVente: "",
  source: "manuel",          // manuel | notaire | observation
  notes: "",
};
```

---

## STORAGE COMPARABLES (par secteur)

```javascript
const COMPARABLES_KEY = "zaymmo_comparables";

function getComparables(ville = null) {
  const all = JSON.parse(localStorage.getItem(COMPARABLES_KEY) || "[]");
  return ville ? all.filter(c => c.ville?.toLowerCase() === ville.toLowerCase()) : all;
}

function addComparable(comparable) {
  const all = JSON.parse(localStorage.getItem(COMPARABLES_KEY) || "[]");
  const updated = [comparable, ...all].slice(0, 100);
  localStorage.setItem(COMPARABLES_KEY, JSON.stringify(updated));
  return updated;
}

function deleteComparable(id) {
  const all = getComparables().filter(c => c.id !== id);
  localStorage.setItem(COMPARABLES_KEY, JSON.stringify(all));
  return all;
}
```

---

## CALCUL ESTIMATION AFFINÉE

```javascript
function getRefinedEstimate(meta, comparables) {
  const relevant = comparables.filter(c =>
    c.type === meta.type &&
    c.ville?.toLowerCase() === meta.ville?.toLowerCase()
  );

  if (relevant.length === 0) return null;

  const prixM2List = relevant
    .filter(c => c.prix && c.surface)
    .map(c => Number(c.prix) / Number(c.surface));

  if (prixM2List.length === 0) return null;

  const avgPrixM2 = prixM2List.reduce((a,b) => a+b, 0) / prixM2List.length;
  const minPrixM2 = Math.min(...prixM2List);
  const maxPrixM2 = Math.max(...prixM2List);

  const surface = Number(meta.surface) || 0;

  return {
    nombreComparables: relevant.length,
    prixM2Moyen: Math.round(avgPrixM2),
    estimationBasse: Math.round(minPrixM2 * surface),
    estimationHaute: Math.round(maxPrixM2 * surface),
    estimationMoyenne: Math.round(avgPrixM2 * surface),
  };
}
```

---

## COMPOSANT SAISIE COMPARABLE

```jsx
function ComparableForm({ meta, onAdded }) {
  const [form, setForm] = useState({
    adresse: "", surface: "", prix: "", dateVente: "",
  });

  function save() {
    if (!form.surface || !form.prix) {
      alert("Surface et prix requis");
      return;
    }

    const comparable = {
      id: Date.now().toString(),
      adresse: form.adresse,
      ville: meta.ville,
      type: meta.type,
      surface: form.surface,
      prix: form.prix,
      dateVente: form.dateVente,
      source: "manuel",
    };

    addComparable(comparable);
    onAdded();
    setForm({ adresse: "", surface: "", prix: "", dateVente: "" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <input placeholder="Adresse (optionnel)" value={form.adresse}
        onChange={e => setForm({...form, adresse: e.target.value})}
        style={{ padding: 7, fontSize: 11 }} />
      <div style={{ display: "flex", gap: 6 }}>
        <input placeholder="Surface m²" value={form.surface}
          onChange={e => setForm({...form, surface: e.target.value})}
          style={{ padding: 7, fontSize: 11, flex: 1 }} />
        <input placeholder="Prix vente" value={form.prix}
          onChange={e => setForm({...form, prix: e.target.value})}
          style={{ padding: 7, fontSize: 11, flex: 1 }} />
      </div>
      <input type="date" value={form.dateVente}
        onChange={e => setForm({...form, dateVente: e.target.value})}
        style={{ padding: 7, fontSize: 11 }} />
      <button onClick={save}
        style={{ padding: 8, background: "#C8793A20", color: "#C8793A", fontSize: 11 }}>
        + Ajouter ce comparable
      </button>
    </div>
  );
}
```

---

## AFFICHAGE ESTIMATION AFFINÉE

```jsx
function RefinedEstimatePanel({ meta }) {
  const [comparables, setComparables] = useState(() => getComparables(meta.ville));
  const [showForm, setShowForm] = useState(false);

  const estimate = getRefinedEstimate(meta, comparables);

  return (
    <Card>
      <ST color="#4AE88A">COMPARABLES SECTEUR</ST>

      {estimate ? (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "#8A7060" }}>
            Basé sur {estimate.nombreComparables} comparable(s) à {meta.ville}
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#4AE88A", marginTop: 4 }}>
            {estimate.estimationBasse.toLocaleString()} — {estimate.estimationHaute.toLocaleString()} €
          </div>
          <div style={{ fontSize: 11, color: "#3A2A1A" }}>
            {estimate.prixM2Moyen.toLocaleString()}€/m² en moyenne
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: "#3A2A1A", marginBottom: 12 }}>
          Aucun comparable enregistré pour {meta.ville || "cette ville"}
        </div>
      )}

      {/* Liste comparables existants */}
      {comparables.map(c => (
        <div key={c.id} style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 10, color: "#8A7060", padding: "4px 0",
          borderBottom: "1px solid #1A1410",
        }}>
          <span>{c.surface}m² {c.adresse && `— ${c.adresse}`}</span>
          <span style={{ color: "#4AE88A" }}>{Number(c.prix).toLocaleString()}€</span>
        </div>
      ))}

      {!showForm ? (
        <button onClick={() => setShowForm(true)}
          style={{ marginTop: 10, fontSize: 11, color: "#C8793A" }}>
          + Ajouter un comparable
        </button>
      ) : (
        <div style={{ marginTop: 10 }}>
          <ComparableForm meta={meta} onAdded={() => {
            setComparables(getComparables(meta.ville));
            setShowForm(false);
          }} />
        </div>
      )}
    </Card>
  );
}
```
