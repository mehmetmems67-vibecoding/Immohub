---
name: zaymmo-agenda-visites
description: Gestion de l'agenda et des visites Zaymmo. Lire avant toute modification de la planification de visites. Permet à l'agent de planifier, suivre et gérer les visites de chaque bien directement depuis Zaymmo.
---

# Zaymmo Agenda & Visites

## PRINCIPE

Chaque bien peut avoir des visites planifiées et suivies.
Stockage local simple — pas de synchronisation calendrier externe en Phase 1.

---

## STRUCTURE VISITE

```javascript
const visiteStructure = {
  id: Date.now().toString(),
  bienId: "history_entry_id",      // Lien vers l'entrée historique
  bienLabel: "Maison - Saint-Ail",
  date: "2026-06-25",
  heure: "14:30",
  nomClient: "Jean Dupont",
  telephoneClient: "06...",
  emailClient: "...",
  statut: "planifiee",              // planifiee | confirmee | realisee | annulee
  notes: "",
  feedback: "",                     // Après visite
  interet: null,                    // 1-5 — niveau d'intérêt estimé
};
```

---

## STORAGE VISITES

```javascript
const VISITS_KEY = "zaymmo_visits";

function getVisits() {
  try {
    return JSON.parse(localStorage.getItem(VISITS_KEY) || "[]");
  } catch { return []; }
}

function saveVisit(visit) {
  const visits = getVisits();
  const updated = [...visits, visit].sort((a, b) =>
    new Date(a.date + " " + a.heure) - new Date(b.date + " " + b.heure)
  );
  localStorage.setItem(VISITS_KEY, JSON.stringify(updated));
  return updated;
}

function updateVisit(id, updates) {
  const visits = getVisits();
  const updated = visits.map(v => v.id === id ? { ...v, ...updates } : v);
  localStorage.setItem(VISITS_KEY, JSON.stringify(updated));
  return updated;
}

function deleteVisit(id) {
  const visits = getVisits().filter(v => v.id !== id);
  localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
  return visits;
}
```

---

## COMPOSANT PLANIFICATION VISITE

```jsx
function VisitScheduler({ bienId, bienLabel, onScheduled }) {
  const [form, setForm] = useState({
    date: "", heure: "", nomClient: "", telephoneClient: "",
  });

  function schedule() {
    if (!form.date || !form.heure) {
      alert("Date et heure requises");
      return;
    }

    const visit = {
      id: Date.now().toString(),
      bienId,
      bienLabel,
      ...form,
      statut: "planifiee",
      notes: "",
      feedback: "",
      interet: null,
    };

    saveVisit(visit);
    onScheduled(visit);
    setForm({ date: "", heure: "", nomClient: "", telephoneClient: "" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input type="date" value={form.date}
        onChange={e => setForm({...form, date: e.target.value})}
        style={{ padding: 8, fontSize: 12 }} />
      <input type="time" value={form.heure}
        onChange={e => setForm({...form, heure: e.target.value})}
        style={{ padding: 8, fontSize: 12 }} />
      <input placeholder="Nom client" value={form.nomClient}
        onChange={e => setForm({...form, nomClient: e.target.value})}
        style={{ padding: 8, fontSize: 12 }} />
      <input placeholder="Téléphone" value={form.telephoneClient}
        onChange={e => setForm({...form, telephoneClient: e.target.value})}
        style={{ padding: 8, fontSize: 12 }} />
      <button onClick={schedule}
        style={{
          padding: 10, borderRadius: 6, background: "#C8793A20",
          color: "#C8793A", border: "1px solid #C8793A40", fontSize: 12,
        }}>
        Planifier la visite
      </button>
    </div>
  );
}
```

---

## VUE AGENDA

```jsx
function AgendaView() {
  const [visits, setVisits] = useState(() => getVisits());
  const today = new Date().toISOString().split("T")[0];

  const upcoming = visits.filter(v => v.date >= today && v.statut !== "annulee");
  const past     = visits.filter(v => v.date < today || v.statut === "realisee");

  return (
    <Card>
      <ST color="#C8793A">AGENDA DES VISITES</ST>

      <div style={{ fontSize: 10, color: "#3A2A1A", letterSpacing: 1, marginBottom: 8 }}>
        À VENIR ({upcoming.length})
      </div>
      {upcoming.map(v => (
        <VisitCard key={v.id} visit={v}
          onUpdate={(updates) => setVisits(updateVisit(v.id, updates))}
          onDelete={() => setVisits(deleteVisit(v.id))}
        />
      ))}

      {past.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: "#3A2A1A", letterSpacing: 1, marginTop: 16, marginBottom: 8 }}>
            PASSÉES ({past.length})
          </div>
          {past.map(v => (
            <VisitCard key={v.id} visit={v} readonly
              onUpdate={(updates) => setVisits(updateVisit(v.id, updates))}
            />
          ))}
        </>
      )}
    </Card>
  );
}

function VisitCard({ visit, onUpdate, onDelete, readonly }) {
  return (
    <div style={{
      background: "#0A0A0A", borderRadius: 8, padding: 10,
      marginBottom: 8, border: "1px solid #1A1410",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#E8D8C0" }}>
          {visit.bienLabel}
        </div>
        <div style={{ fontSize: 11, color: "#C8793A" }}>
          {visit.date} — {visit.heure}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#8A7060", marginTop: 4 }}>
        {visit.nomClient} {visit.telephoneClient && `· ${visit.telephoneClient}`}
      </div>

      {!readonly && (
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button onClick={() => onUpdate({ statut: "confirmee" })}
            style={{ fontSize: 9, padding: "3px 8px", color: "#4AE88A" }}>
            Confirmer
          </button>
          <button onClick={onDelete}
            style={{ fontSize: 9, padding: "3px 8px", color: "#E84A4A" }}>
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## RAPPEL SMS/WHATSAPP (lien direct)

```javascript
function getReminderLink(visit, type = "sms") {
  const message = `Bonjour ${visit.nomClient}, rappel de notre rendez-vous visite le ${visit.date} à ${visit.heure} pour ${visit.bienLabel}.`;

  if (type === "whatsapp") {
    const tel = visit.telephoneClient?.replace(/[^0-9+]/g, "");
    return `https://wa.me/${tel}?text=${encodeURIComponent(message)}`;
  }

  return `sms:${visit.telephoneClient}?body=${encodeURIComponent(message)}`;
}
```

---

## STATISTIQUES VISITES PAR BIEN

```javascript
function getVisitStats(bienId) {
  const visits = getVisits().filter(v => v.bienId === bienId);
  return {
    total: visits.length,
    realisees: visits.filter(v => v.statut === "realisee").length,
    interetMoyen: visits.filter(v => v.interet)
      .reduce((a,b) => a + b.interet, 0) / (visits.filter(v=>v.interet).length || 1),
  };
}
```
