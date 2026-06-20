---
name: zaymmo-crm-contacts
description: Gestion des contacts acheteurs Zaymmo. Lire avant toute modification du suivi des prospects. Permet à l'agent de suivre chaque acheteur potentiel, son historique et ses préférences directement depuis Zaymmo.
---

# Zaymmo CRM Contacts

## PRINCIPE

Un mini-CRM intégré pour suivre les acheteurs potentiels sans outil externe.
Respecte RGPD — données minimales, suppression facile.

---

## STRUCTURE CONTACT

```javascript
const contactStructure = {
  id: Date.now().toString(),
  nom: "Jean Dupont",
  telephone: "06...",
  email: "...",
  statut: "prospect",        // prospect | actif | client | perdu
  source: "visite",          // visite | telephone | site | recommandation
  biensInteresses: [],       // [bienId, bienId...]
  criteres: {
    budgetMin: "",
    budgetMax: "",
    typeRecherche: "",
    villesRecherchees: [],
    surfaceMin: "",
  },
  historique: [],            // [{date, action, note}]
  dateCreation: new Date().toISOString(),
  derniereInteraction: new Date().toISOString(),
};
```

---

## STORAGE CONTACTS

```javascript
const CONTACTS_KEY = "zaymmo_contacts";

function getContacts() {
  try {
    return JSON.parse(localStorage.getItem(CONTACTS_KEY) || "[]");
  } catch { return []; }
}

function saveContact(contact) {
  const contacts = getContacts();
  const updated = [contact, ...contacts].slice(0, 200); // Max 200 contacts
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
  return updated;
}

function updateContact(id, updates) {
  const contacts = getContacts();
  const updated = contacts.map(c => c.id === id
    ? { ...c, ...updates, derniereInteraction: new Date().toISOString() }
    : c
  );
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
  return updated;
}

function addContactNote(id, action, note) {
  const contacts = getContacts();
  const updated = contacts.map(c => {
    if (c.id !== id) return c;
    return {
      ...c,
      historique: [...(c.historique||[]), {
        date: new Date().toISOString(), action, note
      }],
      derniereInteraction: new Date().toISOString(),
    };
  });
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
  return updated;
}
```

---

## MATCHING CONTACT-BIEN

```javascript
// Trouver les contacts dont les critères correspondent à un bien
function findMatchingContacts(meta, contacts) {
  return contacts.filter(c => {
    const crit = c.criteres;
    if (!crit) return false;

    let matches = true;
    if (crit.budgetMax && Number(meta.prix) > Number(crit.budgetMax)) matches = false;
    if (crit.budgetMin && Number(meta.prix) < Number(crit.budgetMin)) matches = false;
    if (crit.typeRecherche && crit.typeRecherche !== meta.type) matches = false;
    if (crit.surfaceMin && Number(meta.surface) < Number(crit.surfaceMin)) matches = false;
    if (crit.villesRecherchees?.length > 0 &&
        !crit.villesRecherchees.some(v => meta.ville?.toLowerCase().includes(v.toLowerCase()))) {
      matches = false;
    }

    return matches;
  });
}
```

---

## COMPOSANT LISTE CONTACTS

```jsx
function ContactsPanel() {
  const [contacts, setContacts] = useState(() => getContacts());
  const [filter, setFilter] = useState("tous");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = filter === "tous"
    ? contacts
    : contacts.filter(c => c.statut === filter);

  return (
    <Card>
      <ST color="#C8793A">CONTACTS ({contacts.length})</ST>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {["tous","prospect","actif","client","perdu"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              fontSize: 10, padding: "4px 10px", borderRadius: 4,
              background: filter === s ? "#C8793A20" : "transparent",
              color: filter === s ? "#C8793A" : "#3A2A1A",
              border: "1px solid #1A1410", textTransform: "capitalize",
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.map(c => (
        <ContactCard key={c.id} contact={c}
          onUpdate={(updates) => setContacts(updateContact(c.id, updates))}
        />
      ))}

      <button onClick={() => setShowAdd(true)}
        style={{
          width: "100%", padding: 10, marginTop: 10, borderRadius: 6,
          background: "#C8793A20", color: "#C8793A",
          border: "1px solid #C8793A40", fontSize: 12,
        }}>
        + Ajouter un contact
      </button>

      {showAdd && (
        <ContactForm
          onSave={(contact) => { setContacts(saveContact(contact)); setShowAdd(false); }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </Card>
  );
}

function ContactCard({ contact, onUpdate }) {
  const STATUT_COLORS = {
    prospect: "#E8B44A", actif: "#00D4E8", client: "#4AE88A", perdu: "#3A2A1A",
  };

  return (
    <div style={{
      background: "#0A0A0A", borderRadius: 8, padding: 10,
      marginBottom: 8, border: "1px solid #1A1410",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#E8D8C0" }}>
          {contact.nom}
        </div>
        <div style={{
          fontSize: 9, padding: "2px 8px", borderRadius: 4,
          background: `${STATUT_COLORS[contact.statut]}20`,
          color: STATUT_COLORS[contact.statut],
        }}>
          {contact.statut}
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#8A7060", marginTop: 4 }}>
        {contact.telephone} {contact.email && `· ${contact.email}`}
      </div>
      {contact.criteres?.budgetMax && (
        <div style={{ fontSize: 10, color: "#3A2A1A", marginTop: 4 }}>
          Budget: {contact.criteres.budgetMin || "0"}—{contact.criteres.budgetMax}€
        </div>
      )}
    </div>
  );
}
```

---

## FORMULAIRE AJOUT CONTACT

```jsx
function ContactForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    nom: "", telephone: "", email: "", source: "visite",
    budgetMin: "", budgetMax: "", typeRecherche: "",
  });

  function save() {
    if (!form.nom) { alert("Nom requis"); return; }

    onSave({
      id: Date.now().toString(),
      nom: form.nom, telephone: form.telephone, email: form.email,
      statut: "prospect", source: form.source,
      biensInteresses: [], historique: [],
      criteres: {
        budgetMin: form.budgetMin, budgetMax: form.budgetMax,
        typeRecherche: form.typeRecherche, villesRecherchees: [],
      },
      dateCreation: new Date().toISOString(),
      derniereInteraction: new Date().toISOString(),
    });
  }

  return (
    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <input placeholder="Nom *" value={form.nom}
        onChange={e => setForm({...form, nom: e.target.value})} style={{padding:8,fontSize:12}} />
      <input placeholder="Téléphone" value={form.telephone}
        onChange={e => setForm({...form, telephone: e.target.value})} style={{padding:8,fontSize:12}} />
      <input placeholder="Email" value={form.email}
        onChange={e => setForm({...form, email: e.target.value})} style={{padding:8,fontSize:12}} />
      <div style={{ display: "flex", gap: 6 }}>
        <input placeholder="Budget min" value={form.budgetMin}
          onChange={e => setForm({...form, budgetMin: e.target.value})} style={{padding:8,fontSize:12,flex:1}} />
        <input placeholder="Budget max" value={form.budgetMax}
          onChange={e => setForm({...form, budgetMax: e.target.value})} style={{padding:8,fontSize:12,flex:1}} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={save} style={{flex:1,padding:10,background:"#4AE88A20",color:"#4AE88A"}}>
          Enregistrer
        </button>
        <button onClick={onCancel} style={{flex:1,padding:10,color:"#3A2A1A"}}>
          Annuler
        </button>
      </div>
    </div>
  );
}
```
