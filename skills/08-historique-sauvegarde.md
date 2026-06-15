---
name: zaymmo-historique-sauvegarde
description: Système complet de gestion historique et sauvegarde de Zaymmo. Lire avant toute modification du système de stockage, ajout de champ sauvegardé, modification de la restauration ou gestion de la timeline. Garantit zéro perte de données.
---

# Zaymmo Historique & Sauvegarde

## DEUX SYSTÈMES DISTINCTS

```
HISTORIQUE    → Automatique — enregistré après chaque analyse
               → 50 entrées max — FIFO (le plus ancien supprimé)
               → Clé : zaymmo_history
               → But : retrouver rapidement un bien analysé

SAUVEGARDÉES  → Manuel — bouton explicite "Sauvegarder"
               → 30 entrées max — choix de l'agent
               → Clé : zaymmo_saved
               → But : conserver les annonces finalisées
```

---

## STRUCTURE ENTRÉE HISTORIQUE

```javascript
const historyEntry = {
  // Identifiant unique
  id: Date.now().toString(),

  // Métadonnées affichage
  createdAt: new Date().toISOString(),
  user: currentUser?.name || "Admin",
  ville: meta.ville || "NC",
  type: meta.type || "Bien",
  surface: synth?.surface_totale_estimee || meta.surface || "NC",
  prix: meta.prix || null,

  // Score IA
  score: synth?.score_global || null,
  etat: synth?.etat_global || "NC",

  // Données complètes
  meta: {...meta},
  synth: synth,

  // Annonce (sauvegardée après génération)
  annonce: null,         // rempli après genAnnonce()
  annonces: {},          // { "fr": {...}, "en": {...} }

  // Photos (3 premières pour aperçu)
  photos_urls: photos
    .filter(p => p.preview)
    .map(p => p.preview)
    .slice(0, 3),

  // Timeline des actions
  timeline: [
    {
      action: "Analyse",
      date: new Date().toISOString(),
      user: currentUser?.name || "Admin"
    }
  ],

  // Exports effectués
  exported: [],
};
```

---

## STRUCTURE ENTRÉE SAUVEGARDÉE

```javascript
const savedEntry = {
  // Identifiant unique
  id: Date.now().toString(),

  // Métadonnées
  savedAt: new Date().toISOString(),
  user: currentUser?.name || "Admin",

  // Label affiché
  label: `${meta.type || "Bien"} - ${meta.ville || "NC"} - ${new Date().toLocaleDateString("fr-FR")}`,

  // Données complètes
  meta: {...meta},
  synth: synth,
  annonce: annonce,
  annonces: {...annonces},

  // Photos aperçu
  photos_urls: photos
    .filter(p => p.preview)
    .map(p => p.preview)
    .slice(0, 3),
};
```

---

## FONCTIONS CRUD HISTORIQUE

```javascript
// Lire
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("zaymmo_history") || "[]");
  } catch {
    return [];
  }
}

// Sauvegarder
function saveHistory(data) {
  localStorage.setItem("zaymmo_history", JSON.stringify(data));
}

// Ajouter entrée (appelé après runAnalysis)
function addToHistory(entry) {
  const hist = getHistory();
  const updated = [entry, ...hist].slice(0, 50); // Max 50
  saveHistory(updated);
  setHistory(updated);
}

// Supprimer entrée
function deleteHistoryEntry(id) {
  const updated = history.filter(h => h.id !== id);
  saveHistory(updated);
  setHistory(updated);
}

// Mettre à jour entrée existante (après génération annonce)
function updateHistoryEntry(id, updates) {
  const hist = getHistory();
  const updated = hist.map(h => h.id === id ? {...h, ...updates} : h);
  saveHistory(updated);
  setHistory(updated);
}
```

---

## FONCTIONS CRUD SAUVEGARDÉES

```javascript
// Lire
function getSaved() {
  try {
    return JSON.parse(localStorage.getItem("zaymmo_saved") || "[]");
  } catch {
    return [];
  }
}

// Sauvegarder explicitement
function saveAnnonce() {
  if (!annonce || !synth) {
    alert("Générez d'abord une annonce !");
    return;
  }
  const saved = getSaved();
  const entry = {
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
    user: currentUser?.name || "Admin",
    label: `${meta.type || "Bien"} - ${meta.ville || "NC"} - ${new Date().toLocaleDateString("fr-FR")}`,
    meta: {...meta},
    synth: synth,
    annonce: annonce,
    annonces: {...annonces},
    photos_urls: photos.filter(p => p.preview).map(p => p.preview).slice(0, 3),
  };
  const updated = [entry, ...saved].slice(0, 30); // Max 30
  localStorage.setItem("zaymmo_saved", JSON.stringify(updated));
  setSavedList(updated);
  alert("Annonce sauvegardée !");
}

// Supprimer sauvegarde
function deleteSaved(id) {
  const updated = savedList.filter(s => s.id !== id);
  localStorage.setItem("zaymmo_saved", JSON.stringify(updated));
  setSavedList(updated);
}
```

---

## MISE À JOUR AUTOMATIQUE HISTORIQUE

### Après génération annonce
```javascript
// Dans genAnnonce() — après setAnnonce(a)
const hist = getHistory();
if (hist.length > 0) {
  hist[0].annonce = a;
  hist[0].annonces = {...(hist[0].annonces || {}), [meta.langAnnonce]: a};
  hist[0].timeline = [...(hist[0].timeline || []), {
    action: `Annonce ${meta.langAnnonce.toUpperCase()}`,
    date: new Date().toISOString(),
    user: currentUser?.name || "Admin"
  }];
  saveHistory(hist);
  setHistory(hist);
}
```

### Après export plateforme
```javascript
// Dans exportToPlatform(platformName)
const hist = getHistory();
if (hist.length > 0) {
  hist[0].exported = [...(hist[0].exported || []), {
    platform: platformName,
    date: new Date().toISOString()
  }];
  hist[0].timeline = [...(hist[0].timeline || []), {
    action: `Exporté sur ${platformName}`,
    date: new Date().toISOString(),
    user: currentUser?.name || "Admin"
  }];
  saveHistory(hist);
  setHistory(hist);
}
```

---

## RESTAURATION COMPLÈTE

### Depuis historique
```javascript
function reopenFromHistory(h) {
  // Restaurer toutes les données
  setMeta(h.meta);
  setSynth(h.synth);

  // Restaurer annonce si présente
  if (h.annonce) {
    setAnnonce(h.annonce);
    setStep("annonce"); // Arriver sur l'annonce directement
  } else {
    setStep("fiche"); // Sinon sur la fiche pour corriger
  }

  // Restaurer multi-langue
  if (h.annonces && Object.keys(h.annonces).length > 0) {
    setAnnonces(h.annonces);
    setActiveLang(Object.keys(h.annonces)[0]);
  }

  // Fermer le panneau
  setShowHistory(false);
  setHomepage(false);
}
```

### Depuis sauvegardées
```javascript
function reopenFromSaved(s) {
  setMeta(s.meta);
  setSynth(s.synth);
  setAnnonce(s.annonce);

  if (s.annonces) {
    setAnnonces(s.annonces);
    setActiveLang(Object.keys(s.annonces)[0] || "fr");
  }

  setStep("annonce"); // Toujours sur l'annonce
  setShowSaved(false);
  setHomepage(false);
}
```

---

## AFFICHAGE HISTORIQUE

```javascript
// Carte historique
{history.map(h => (
  <div key={h.id} style={{
    background: C.surf,
    borderRadius: 8,
    padding: "10px 12px",
    marginBottom: 8,
    border: `1px solid ${C.brd}`
  }}>
    {/* En-tête */}
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
      <div>
        <span style={{fontSize:12,fontWeight:700,color:C.text}}>
          {h.type} — {h.ville}
        </span>
        {h.surface && (
          <span style={{fontSize:11,color:C.muted}}> · {h.surface}</span>
        )}
      </div>
      {h.score && (
        <div style={{
          fontSize:11,fontWeight:700,
          color: h.score >= 7 ? C.green : h.score >= 5 ? C.gold : C.err
        }}>
          {h.score}/10
        </div>
      )}
    </div>

    {/* Timeline */}
    {h.timeline && h.timeline.length > 0 && (
      <div style={{marginBottom:8}}>
        {h.timeline.map((t, i) => (
          <div key={i} style={{
            fontSize:10,color:C.muted,
            display:"flex",justifyContent:"space-between",
            padding:"2px 0",borderBottom:`1px solid ${C.brd}`
          }}>
            <span style={{color:C.acc}}>{t.action}</span>
            <span>{new Date(t.date).toLocaleDateString("fr-FR")} — {t.user}</span>
          </div>
        ))}
      </div>
    )}

    {/* Exports */}
    {h.exported && h.exported.length > 0 && (
      <div style={{fontSize:10,color:C.cyan,marginBottom:6}}>
        Exporté: {h.exported.map(e => e.platform).join(", ")}
      </div>
    )}

    {/* Actions */}
    <div style={{display:"flex",gap:6}}>
      <button onClick={() => reopenFromHistory(h)}
        style={{
          fontSize:10,padding:"4px 10px",borderRadius:6,
          background:`${C.acc}20`,color:C.acc,
          border:`1px solid ${C.acc}40`,cursor:"pointer"
        }}>
        Rouvrir
      </button>
      <button onClick={() => {
        if (window.confirm("Supprimer ce bien de l'historique ?"))
          deleteHistoryEntry(h.id);
      }} style={{
        fontSize:10,color:C.err,
        background:"transparent",border:"none",cursor:"pointer"
      }}>
        Supprimer
      </button>
    </div>
  </div>
))}
```

---

## AFFICHAGE SAUVEGARDÉES

```javascript
{savedList.map(s => (
  <div key={s.id} style={{
    background: C.surf,
    borderRadius: 8,
    padding: "10px 12px",
    marginBottom: 8,
    border: `1px solid ${C.gold}30`
  }}>
    {/* Label */}
    <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:4}}>
      {s.label}
    </div>

    {/* Date et auteur */}
    <div style={{fontSize:10,color:C.muted,marginBottom:8}}>
      {new Date(s.savedAt).toLocaleDateString("fr-FR")} — {s.user}
    </div>

    {/* Actions */}
    <div style={{display:"flex",gap:6}}>
      <button onClick={() => reopenFromSaved(s)}
        style={{
          fontSize:10,padding:"4px 10px",borderRadius:6,
          background:`${C.gold}20`,color:C.gold,
          border:`1px solid ${C.gold}40`,cursor:"pointer"
        }}>
        Rouvrir
      </button>
      <button onClick={() => {
        if (window.confirm("Supprimer cette annonce sauvegardée ?"))
          deleteSaved(s.id);
      }} style={{
        fontSize:10,color:C.err,
        background:"transparent",border:"none",cursor:"pointer"
      }}>
        Supprimer
      </button>
    </div>
  </div>
))}
```

---

## GESTION DES ERREURS STORAGE

```javascript
// Toujours wrapper en try/catch
function safeGetStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch(e) {
    console.error(`Erreur lecture ${key}:`, e);
    return [];
  }
}

function safeSetStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch(e) {
    // localStorage plein (quota dépassé)
    if (e.name === "QuotaExceededError") {
      alert("Stockage plein. Supprimez des anciens biens.");
    }
    return false;
  }
}
```

---

## LIMITES ET QUOTAS

```
localStorage max     : ~5MB par domaine
Entrée historique    : ~50KB en moyenne (avec photos base64 limitées)
Max historique       : 50 entrées × 50KB = ~2.5MB
Max sauvegardées     : 30 entrées × 50KB = ~1.5MB
Total estimé         : ~4MB — dans les limites

Si quota dépassé     : alert + suggestion suppression
Photos stockées      : 3 max par entrée — limitées à preview URL
Photos blob          : non stockées (perdues à la fermeture)
```

---

## MIGRATION DE DONNÉES

```javascript
// Si structure change entre versions
function migrateHistory(entries) {
  return entries.map(h => ({
    // Champs obligatoires avec valeurs par défaut
    id: h.id || Date.now().toString(),
    createdAt: h.createdAt || new Date().toISOString(),
    user: h.user || "Admin",
    ville: h.ville || h.meta?.ville || "NC",
    type: h.type || h.meta?.type || "Bien",
    meta: h.meta || {},
    synth: h.synth || null,
    annonce: h.annonce || null,
    annonces: h.annonces || {},
    timeline: h.timeline || [],
    exported: h.exported || [],
    photos_urls: h.photos_urls || [],
  }));
}

// Appeler au chargement
const [history, setHistory] = useState(() => {
  const raw = safeGetStorage("zaymmo_history");
  return migrateHistory(raw);
});
```
