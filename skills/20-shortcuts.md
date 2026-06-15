---
name: zaymmo-shortcuts
description: Raccourcis et actions rapides de Zaymmo. Accès rapide aux fonctions fréquentes pour les agents expérimentés. Gain de temps significatif au quotidien.
---

# Zaymmo Shortcuts

## PRINCIPE

Les agents expérimentés ne veulent pas naviguer — ils veulent agir.
Les raccourcis permettent d'accéder aux fonctions en 1 tap.

---

## RACCOURCIS CLAVIER (desktop)

```javascript
useEffect(() => {
  const handleKeyboard = (e) => {
    // Ignorer si focus dans un input
    if (["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)) return;

    switch(e.key) {
      case "h": setShowHistory(true); break;       // H → Historique
      case "s": saveAnnonce(); break;               // S → Sauvegarder
      case "Escape": setHomepage(true); break;      // Esc → Accueil
      case "n": if(e.ctrlKey) { resetAll(); break; } // Ctrl+N → Nouveau bien
      case "c": if(e.ctrlKey && annonce) {          // Ctrl+C → Copier annonce
        const txt = (annonce.titre_principal||"") + "\n\n" + (annonce.description_longue||"");
        navigator.clipboard.writeText(txt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        break;
      }
    }
  };

  window.addEventListener("keydown", handleKeyboard);
  return () => window.removeEventListener("keydown", handleKeyboard);
}, [annonce, history]);
```

---

## ACTIONS RAPIDES (barre d'accès rapide)

```jsx
// Barre d'actions rapides — visible uniquement si annonce générée
{annonce && !homepage && (
  <div style={{
    display: "flex",
    gap: 6,
    padding: "6px 16px",
    background: "#0A0806",
    borderBottom: "1px solid #1A1410",
    overflowX: "auto",
  }}>
    {/* Copier */}
    <QuickAction
      label={copied ? "Copié !" : "Copier"}
      color={copied ? "#4AE88A" : "#C8793A"}
      onClick={() => {
        const txt = (annonce.titre_principal||"") + "\n\n" + (annonce.description_longue||"");
        navigator.clipboard.writeText(txt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }}
    />
    {/* Sauvegarder */}
    <QuickAction label="Sauvegarder" color="#4AE88A" onClick={saveAnnonce} />
    {/* Nouveau bien */}
    <QuickAction label="+ Nouveau" color="#E84A4A" onClick={resetAll} />
    {/* ZayZay */}
    <QuickAction label="ZayZay" color="#00D4E8" onClick={() => setShowZayZay(true)} />
  </div>
)}

function QuickAction({ label, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px",
      borderRadius: 4,
      background: `${color}15`,
      border: `1px solid ${color}30`,
      color: color,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      cursor: "pointer",
      flexShrink: 0,
      whiteSpace: "nowrap",
    }}>
      {label}
    </button>
  );
}
```

---

## DUPLICATION D'ANNONCE SIMILAIRE

```javascript
// Créer une nouvelle annonce basée sur un bien similaire
function duplicateFromHistory(h) {
  // Garder les infos de base — vider les données IA
  setMeta({
    ...defaultMeta,
    // Conserver uniquement les infos génériques
    pays: h.meta.pays,
    devise: h.meta.devise,
    type: h.meta.type,
    ville: h.meta.ville,
    code_postal: h.meta.code_postal,
    langAnnonce: h.meta.langAnnonce,
    chauffage: h.meta.chauffage,
    // Vider les données spécifiques au bien
    surface: "",
    prix: "",
    pieces: "",
    chambres: "",
  });
  setSynth(null);
  setAnnonce(null);
  setAnnonces({});
  setPhotos([]);
  setStep("photos");
  setHomepage(false);
}
```

---

## MODÈLES DE BIENS FRÉQUENTS

```javascript
// Templates pour les types de biens récurrents
const TEMPLATES = {
  appart_lux: {
    label: "Appartement Luxembourg type",
    meta: {
      pays: "lu", type: "Appartement", devise: "EUR",
      langAnnonce: "fr", chauffage: "Collectif gaz",
      dpe: "C", ascenseur: true, double_vitrage: true,
    }
  },
  maison_fr: {
    label: "Maison France type",
    meta: {
      pays: "fr", type: "Maison", devise: "EUR",
      langAnnonce: "fr", chauffage: "Individuel gaz",
      jardin: true, garage: true,
    }
  },
};

function applyTemplate(templateKey) {
  const tpl = TEMPLATES[templateKey];
  if (!tpl) return;
  setMeta(prev => ({ ...defaultMeta, ...tpl.meta }));
  setStep("photos");
  setHomepage(false);
}
```

---

## GESTES MOBILES

```javascript
// Swipe pour naviguer entre steps (mobile)
function useSwipeNavigation(onSwipeLeft, onSwipeRight) {
  const touchStartX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onSwipeLeft();   // Swipe gauche → étape suivante
      else          onSwipeRight();  // Swipe droit → étape précédente
    }
  };

  return { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd };
}

// Double tap pour copier annonce
function useDoubleTap(callback, delay = 300) {
  const lastTap = useRef(0);
  return () => {
    const now = Date.now();
    if (now - lastTap.current < delay) callback();
    lastTap.current = now;
  };
}
```

---

## ACCÈS RAPIDE DEPUIS LA PAGE ACCUEIL

```jsx
// Dernier bien analysé — accès direct depuis l'accueil
{history.length > 0 && (
  <div style={{
    width: "100%", maxWidth: 300,
    padding: "12px 16px",
    background: "#0F0B07",
    borderRadius: 10,
    border: "1px solid #1A1410",
  }}>
    <div style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 2, marginBottom: 8 }}>
      DERNIER BIEN
    </div>
    <div style={{ fontSize: 12, color: "#E8D8C0", marginBottom: 6 }}>
      {history[0].type} — {history[0].ville}
    </div>
    <button onClick={() => reopenFromHistory(history[0])}
      style={{
        fontSize: 10, padding: "5px 12px", borderRadius: 4,
        background: "#C8793A20", color: "#C8793A",
        border: "1px solid #C8793A30", cursor: "pointer",
      }}>
      Rouvrir →
    </button>
  </div>
)}
```
