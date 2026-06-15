---
name: zaymmo-navigation-fluidite
description: Règles de navigation et fluidité de Zaymmo. Lire avant toute modification de routing, boutons de navigation, transitions entre écrans ou gestion du scroll. Garantit une expérience mobile parfaite sans friction.
---

# Zaymmo Navigation & Fluidité

## PRINCIPES DE NAVIGATION

1. **Toujours savoir où on est** — step bar visible en permanence hors homepage/login
2. **Toujours pouvoir revenir** — bouton Accueil en haut à droite sur tous les écrans
3. **Jamais de cul-de-sac** — chaque écran a au moins un bouton de sortie
4. **Navigation mémorisée** — si on quitte et revient, retrouver exactement le même état
5. **Zéro rechargement** — tout se passe dans la même page React

---

## BOUTON ACCUEIL (toujours présent)

```jsx
// Dans le header — toujours visible
<button onClick={() => {
  setHomepage(true);
  setShowHistory(false);
  setShowSaved(false);
  setShowAdmin(false);
}} style={{
  background: "transparent",
  color: C.muted,
  border: `1px solid ${C.brd}`,
  borderRadius: 4,
  fontSize: 11,
  padding: "6px 10px",
  cursor: "pointer",
  letterSpacing: 1
}}>
  ACCUEIL
</button>
```

---

## NAVIGATION ENTRE STEPS

### Ordre officiel du pipeline
```
homepage → photos → fiche → notes → annonce → apercu → fiche_interne
```

### Transitions autorisées
```
homepage      → photos (nouvelle annonce)
homepage      → historique (voir historique)
homepage      → saved (voir sauvegardes)
photos        → fiche (après analyse)
photos        → homepage (bouton accueil)
fiche         → photos (modifier photos)
fiche         → notes (continuer)
fiche         → homepage (bouton accueil)
notes         → fiche (modifier infos)
notes         → annonce (après génération)
notes         → homepage (bouton accueil)
annonce       → apercu (voir aperçu)
annonce       → fiche_interne (voir fiche)
annonce       → photos (nouveau bien = reset)
annonce       → homepage (bouton accueil)
apercu        → annonce (retour)
apercu        → homepage (bouton accueil)
fiche_interne → annonce (retour)
fiche_interne → homepage (bouton accueil)
```

### Boutons de navigation dans chaque step
```
STEP PHOTOS :
  → [Accueil] header droite

STEP FICHE :
  → [← Modifier photos] haut de page si synth présent
  → [Notes agent →] bas de page si synth présent
  → [Accueil] header droite

STEP NOTES :
  → [← Modifier infos] bouton gauche bas
  → [Générer l'annonce →] bouton droit bas
  → [Accueil] header droite

STEP ANNONCE :
  → [Aperçu] bouton action
  → [Fiche interne] bouton action
  → [+ Nouveau bien] bouton rouge bas
  → [Accueil] header droite

STEP APERÇU :
  → [← Retour annonce] bouton haut
  → [Accueil] header droite

STEP FICHE INTERNE :
  → [← Retour annonce] bouton haut
  → [Accueil] header droite
```

---

## SCROLL

### Règle principale
```javascript
// À chaque changement de step — scroll to top
useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, [step]);
```

### Zones à scroll indépendant
```
Panneau historique  : maxHeight 360px — overflow-y auto
Panneau sauvegardé  : maxHeight 360px — overflow-y auto
Step bar            : overflow-x auto (si trop large)
Contenu principal   : flex:1 — overflow-y auto
```

### Scroll to error
```javascript
// Si erreur de validation — scroll vers le champ
document.getElementById(fieldId)?.scrollIntoView({
  behavior: "smooth",
  block: "center"
});
```

---

## MÉMORISATION D'ÉTAT

### Ce qui est mémorisé (localStorage)
```
zaymmo_users    → comptes utilisateurs
zaymmo_history  → 50 derniers biens analysés
zaymmo_saved    → 30 annonces sauvegardées
zaymmo_session  → session active (sessionStorage)
```

### Ce qui est perdu à la fermeture
```
meta en cours   → si pas sauvegardé
photos en cours → blobs locaux
annonce en cours → si pas sauvegardée
```

### Avertissement avant fermeture
```javascript
// Si données en cours non sauvegardées
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (annonce && !homepage) {
      e.preventDefault();
      e.returnValue = "";
    }
  };
  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [annonce, homepage]);
```

---

## TRANSITIONS VISUELLES

### Apparition de contenu (fadeUp)
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Usage */
animation: "fadeUp 0.3s ease"
```

### Apparition rapide (fadeIn)
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Usage pour panneaux */
animation: "fadeIn 0.2s ease"
```

### Step bar transition
```css
/* Connecteur qui se remplit */
transition: "background 0.3s ease, width 0.3s ease"
```

---

## STEP BAR COMPONENT

```jsx
function Steps({ current, L }) {
  const all = ["photos","fiche","notes","annonce","apercu","fiche_interne"];
  const labels = ["Photos","Infos","Notes","Annonce","Aperçu","Fiche"];
  const ci = all.indexOf(current);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      overflowX: "auto",
      padding: "0 4px",
      gap: 0
    }}>
      {labels.map((label, i) => {
        const done = i < ci;
        const active = i === ci;
        return (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            flex: i < labels.length - 1 ? 1 : 0
          }}>
            {/* Cercle step */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: done ? "#C8793A" : active ? "#C8793A" : "#1A1410",
              border: active ? "2px solid #C8793A" : "2px solid #1A1410",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 10,
              color: done || active ? "#050404" : "#3A2A1A",
              fontWeight: 700,
              animation: active ? "pulse 2s infinite" : "none"
            }}>
              {done ? "✓" : i + 1}
            </div>
            {/* Connecteur */}
            {i < labels.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: done ? "#C8793A" : "#1A1410",
                transition: "background 0.3s ease"
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

## PANNEAU HISTORIQUE

```jsx
// Structure navigation historique
{showHistory && !homepage && (
  <div style={{
    padding: "14px 16px",
    background: "#0A0806",
    borderBottom: `1px solid ${C.brd}`,
    animation: "fadeIn 0.2s ease",
    maxHeight: 360,
    overflowY: "auto"
  }}>
    {/* Header panneau */}
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12
    }}>
      <div style={{fontSize:11,color:C.acc,letterSpacing:1,fontWeight:700}}>
        HISTORIQUE ({history.length})
      </div>
      <button onClick={() => setShowHistory(false)}
        style={{fontSize:10,color:C.muted,background:"transparent",border:"none"}}>
        Fermer ×
      </button>
    </div>

    {/* Liste biens */}
    {history.map(h => (
      <div key={h.id} style={{
        background: C.surf,
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 8,
        border: `1px solid ${C.brd}`
      }}>
        {/* Infos bien */}
        {/* Timeline */}
        {/* Boutons Rouvrir + Supprimer */}
      </div>
    ))}
  </div>
)}
```

---

## PANNEAU ANNONCES SAUVEGARDÉES

```jsx
// Structure navigation saved
{showSaved && !homepage && (
  <div style={{
    padding: "14px 16px",
    background: "#1A1400",
    borderBottom: `1px solid ${C.gold}30`,
    animation: "fadeIn 0.2s ease",
    maxHeight: 360,
    overflowY: "auto"
  }}>
    {/* Header */}
    <div style={{fontSize:11,color:C.gold,marginBottom:12,letterSpacing:1,fontWeight:700}}>
      ANNONCES SAUVEGARDÉES ({savedList.length})
    </div>

    {/* Liste annonces */}
    {savedList.map(s => (
      <div key={s.id} style={{
        background: C.surf,
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 8,
        border: `1px solid ${C.gold}30`
      }}>
        {/* Label annonce */}
        {/* Date + utilisateur */}
        {/* Boutons Rouvrir + Supprimer */}
      </div>
    ))}
  </div>
)}
```

---

## ROUVRIR DEPUIS HISTORIQUE

```javascript
// Restauration complète — arriver sur step annonce si annonce existe
function reopenFromHistory(h) {
  setMeta(h.meta);
  setSynth(h.synth);
  if (h.annonce) {
    setAnnonce(h.annonce);
    setStep("annonce");
  } else {
    setStep("fiche");
  }
  if (h.annonces) setAnnonces(h.annonces);
  setActiveLang(Object.keys(h.annonces || {})[0] || "fr");
  setShowHistory(false);
  setHomepage(false);
}
```

---

## ROUVRIR DEPUIS SAUVEGARDÉES

```javascript
function reopenFromSaved(s) {
  setMeta(s.meta);
  setSynth(s.synth);
  setAnnonce(s.annonce);
  if (s.annonces) setAnnonces(s.annonces);
  setActiveLang(Object.keys(s.annonces || {})[0] || "fr");
  setStep("annonce");
  setShowSaved(false);
  setHomepage(false);
}
```

---

## GESTION BOUTON RETOUR NAVIGATEUR

```javascript
// Empêcher la fermeture accidentelle par le bouton retour
useEffect(() => {
  window.history.pushState(null, "", window.location.href);
  const handlePop = () => {
    window.history.pushState(null, "", window.location.href);
    // Proposer de revenir à l'accueil
    if (!homepage) setHomepage(true);
  };
  window.addEventListener("popstate", handlePop);
  return () => window.removeEventListener("popstate", handlePop);
}, [homepage]);
```

---

## FLUIDITÉ MOBILE

### Zones tactiles minimales
```
Boutons          : min-height 44px
Checkboxes       : padding 8px — zone tactile large
Thumbnails photos: min 80×80px
Bouton ×         : min 32×32px
Inputs           : padding 10px 12px
```

### Pas de hover sur mobile
```javascript
// Utiliser onClick uniquement — pas de onMouseEnter/onMouseLeave
// Les effets hover CSS sont inutiles sur mobile
```

### Clavier virtuel
```javascript
// Éviter que le clavier cache les boutons importants
// Placer les boutons d'action EN HAUT des formulaires si possible
// Ou utiliser position sticky
```

### Performance scroll
```javascript
// Utiliser transform plutôt que top/left pour les animations
// Éviter les repaints inutiles
// Images avec lazy loading
```
