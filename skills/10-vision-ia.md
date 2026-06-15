---
name: zaymmo-vision-ia
description: Système de vision IA de Zaymmo. Lire avant toute modification du pipeline d'analyse photo, ajout de source d'image, modification de la compression ou changement du flux analyse→synthèse. Garantit une analyse photo maximale avec un coût API minimal.
---

# Zaymmo Vision IA

## PRINCIPE

Zaymmo utilise Claude Vision (claude-haiku-4-5) pour analyser chaque photo
individuellement puis synthétiser l'ensemble en un rapport expert.

```
Photos → Base64 → Claude Vision (par photo) → Synthèse globale → Pré-remplissage fiche
```

---

## SOURCES D'IMAGES SUPPORTÉES

```javascript
// 3 sources possibles
const SOURCES = {
  galerie:  "Input file — photos depuis la galerie mobile",
  camera:   "Input capture — photo prise sur le moment",
  url:      "URL externe — lien vers image en ligne",
};

// Structure d'une photo dans le state
const photoItem = {
  id: Date.now().toString() + Math.random(),
  file: null,          // File object si galerie/caméra
  url: "",             // URL si source externe
  preview: "",         // URL blob pour affichage preview
  roomType: "Salon",   // Type de pièce assigné
  data: null,          // Résultat analyse IA (null = pas encore analysé)
  error: null,         // Message d'erreur si analyse échouée
  analyzing: false,    // En cours d'analyse
};
```

---

## CONVERSION IMAGE → BASE64

### Méthode principale (Canvas)
```javascript
async function urlToB64(url) {
  try {
    // Méthode 1: Canvas — meilleure qualité, compression contrôlée
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    // Compression : max 1024px sur le grand côté
    const MAX = 1024;
    let { naturalWidth: w, naturalHeight: h } = img;
    if (w > MAX || h > MAX) {
      if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
      else       { w = Math.round(w * MAX / h); h = MAX; }
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85); // Qualité 85%
    return dataUrl.split(",")[1]; // Retourner seulement le base64

  } catch (canvasErr) {
    // Méthode 2: FileReader — fallback si CORS bloque
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
```

### Conversion depuis File object
```javascript
async function fileToB64(file) {
  // Créer une URL blob
  const blobUrl = URL.createObjectURL(file);
  try {
    const b64 = await urlToB64(blobUrl);
    return b64;
  } finally {
    URL.revokeObjectURL(blobUrl); // Libérer la mémoire
  }
}
```

---

## PIPELINE D'ANALYSE COMPLET

```javascript
async function runAnalysis() {
  if (!photos.length) {
    setError("Ajoutez au moins une photo");
    return;
  }
  if (!API_KEY) {
    setError(L.noKey);
    return;
  }

  setLoading(true);
  setError(null);
  setProg(0);
  setAnal([]);
  setSynth(null);

  const results = [];

  try { // B06 — try/finally obligatoire

    // ── ÉTAPE 1: Analyser chaque photo ────────────────
    for (let i = 0; i < photos.length; i++) {
      if (!mountedRef.current) break;

      const photo = photos[i];
      const progress = Math.round((i / photos.length) * 70);
      setProg(progress);
      setLoadMsg(`Analyse photo ${i + 1}/${photos.length}...`);

      try {
        // Convertir en base64
        let b64;
        if (photo.file) {
          b64 = await fileToB64(photo.file);
        } else if (photo.url || photo.preview) {
          b64 = await urlToB64(photo.url || photo.preview);
        } else {
          continue;
        }

        // Appel API avec vision
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5",
            max_tokens: 1500,
            messages: [{
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/jpeg",
                    data: b64,
                  },
                },
                {
                  type: "text",
                  text: photoPrompt(photo.roomType),
                },
              ],
            }],
          }),
          signal: AbortSignal.timeout(60000), // Timeout 60s
        });

        const data = await resp.json();
        const text = data.content?.map(b => b.text || "").join("") || "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        results.push({ ...parsed, roomType: photo.roomType, photoIndex: i });

        // Mettre à jour les analyses en temps réel
        if (mountedRef.current) {
          setAnal(prev => [...prev, { id: photo.id, data: parsed, error: null }]);
        }

      } catch (photoErr) {
        // Erreur sur une photo → continuer les autres
        results.push({ error: photoErr.message, roomType: photo.roomType, photoIndex: i });
        if (mountedRef.current) {
          setAnal(prev => [...prev, { id: photo.id, data: null, error: photoErr.message }]);
        }
      }

      // Pause entre photos — éviter rate limiting
      await sleep(300);
    }

    // ── ÉTAPE 2: Synthèse globale ──────────────────────
    if (!mountedRef.current) return;
    setProg(80);
    setLoadMsg("Synthèse en cours...");

    const validResults = results.filter(r => !r.error);
    if (validResults.length === 0) {
      throw new Error("Aucune photo n'a pu être analysée");
    }

    const synthResp = await callClaude(
      [{ role: "user", content: sPrompt(validResults, meta) }],
      "Expert immobilier senior. JSON valide uniquement sans backticks."
    );

    // ── ÉTAPE 3: Pré-remplissage fiche ───────────────
    if (mountedRef.current) {
      setSynth(synthResp);
      setProg(100);
      prefillFromSynth(synthResp); // Injecter dans meta
      setStep("fiche"); // Naviguer vers la fiche

      // Sauvegarder dans historique
      const entry = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        user: currentUser?.name || "Admin",
        ville: meta.ville || "NC",
        type: meta.type,
        surface: synthResp.surface_totale_estimee || meta.surface || "NC",
        prix: meta.prix || null,
        score: synthResp.score_global || null,
        etat: synthResp.etat_global || "NC",
        meta: {...meta},
        synth: synthResp,
        annonce: null,
        annonces: {},
        photos_urls: photos.filter(p => p.preview).map(p => p.preview).slice(0, 3),
        timeline: [{
          action: "Analyse",
          date: new Date().toISOString(),
          user: currentUser?.name || "Admin"
        }],
        exported: [],
      };
      addToHistory(entry);
    }

  } finally { // B06 — OBLIGATOIRE
    if (mountedRef.current) {
      setLoading(false);
      setLoadMsg("");
    }
  }
}
```

---

## PRÉ-REMPLISSAGE FICHE DEPUIS SYNTH

```javascript
function prefillFromSynth(s) {
  if (!s) return;

  setMeta(prev => ({
    ...prev,
    // Surface — seulement si champ vide
    surface: prev.surface || s.surface_totale_estimee?.toString().replace(/[^0-9]/g, "") || prev.surface,
    // Pièces
    pieces: prev.pieces || s.nb_pieces?.toString() || prev.pieces,
    // Chambres
    chambres: prev.chambres || s.nb_chambres?.toString() || prev.chambres,
    // SDB
    sdb: prev.sdb || s.nb_sdb?.toString() || prev.sdb,
    // DPE
    dpe: ["A","B","C","D","E","F","G"].includes(s.dpe_estime) ? s.dpe_estime : prev.dpe,
    // Chauffage
    chauffage: s.chauffage_detecte || prev.chauffage,
    // Équipements détectés
    terrasse: prev.terrasse || (s.equipements_detectes?.includes("terrasse") ?? false),
    garage:   prev.garage   || (s.equipements_detectes?.includes("garage") ?? false),
    jardin:   prev.jardin   || (s.equipements_detectes?.includes("jardin") ?? false),
    cave:     prev.cave     || (s.equipements_detectes?.includes("cave") ?? false),
    piscine:  prev.piscine  || (s.equipements_detectes?.includes("piscine") ?? false),
    balcon:   prev.balcon   || (s.equipements_detectes?.includes("balcon") ?? false),
    ascenseur:prev.ascenseur|| (s.equipements_detectes?.includes("ascenseur") ?? false),
  }));
}
```

---

## AFFICHAGE DES RÉSULTATS D'ANALYSE

```javascript
// Section résultats (step "fiche" avec synth présent)
{synth && (
  <div style={{animation: "fadeUp 0.3s ease"}}>
    <Card>
      <ST color={C.green}>OK RÉSULTATS</ST>

      {/* Score global */}
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
        <div style={{
          width: 70, height: 70, borderRadius: "50%",
          background: `conic-gradient(${C.gold} ${synth.score_global * 36}deg, #1A1410 0deg)`,
          display:"flex",alignItems:"center",justifyContent:"center"
        }}>
          <div style={{
            width:58,height:58,borderRadius:"50%",
            background:C.surf,display:"flex",flexDirection:"column",
            alignItems:"center",justifyContent:"center"
          }}>
            <div style={{fontSize:20,fontWeight:900,color:C.gold}}>{synth.score_global}</div>
            <div style={{fontSize:8,color:C.muted}}>/10</div>
          </div>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>{synth.etat_global}</div>
          <div style={{fontSize:11,color:C.muted}}>~{synth.surface_totale_estimee}</div>
          {synth.nb_pieces && <div style={{fontSize:11,color:C.muted}}>{synth.nb_pieces} pièces · {synth.nb_chambres} chambres</div>}
          {synth.fourchette_prix && (
            <div style={{fontSize:13,color:C.gold,fontWeight:700,marginTop:4}}>
              {Number(synth.fourchette_prix.split("-")[0]).toLocaleString()}—{Number(synth.fourchette_prix.split("-")[1]).toLocaleString()} {CURRENCY_SYMBOLS[meta.devise] || "€"}
            </div>
          )}
        </div>
      </div>

      {/* DPE badges */}
      <div style={{display:"flex",gap:4,marginBottom:12}}>
        {["A","B","C","D","E","F","G"].map(d => (
          <div key={d} style={{
            padding:"3px 8px",borderRadius:4,fontSize:11,fontWeight:700,
            background: synth.dpe_estime === d ? DPE_COLORS[d]?.bg : "#1A1410",
            color: synth.dpe_estime === d ? DPE_COLORS[d]?.text : "#333",
          }}>{d}</div>
        ))}
      </div>

      {/* Résumé IA */}
      {synth.recommandations_agent && (
        <div style={{
          fontSize:12,color:C.text,lineHeight:1.6,
          padding:"10px 12px",background:"#0A0A1E",borderRadius:8,
          borderLeft:`3px solid ${C.gold}`,marginBottom:12,fontStyle:"italic"
        }}>
          {synth.recommandations_agent}
        </div>
      )}

      {/* 3 colonnes : Points forts / Défauts / Home staging */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        <PointsColumn title="POINTS FORTS" color={C.green} items={synth.points_forts}/>
        <PointsColumn title="DÉFAUTS" color={C.err} items={synth.points_faibles}/>
        <PointsColumn title="HOME STAGING" color={C.gold} items={synth.retouches_home_staging}/>
      </div>
    </Card>
  </div>
)}
```

---

## TYPES DE PIÈCES (roomType)

```javascript
const ROOM_TYPES = {
  fr: ["Salon","Cuisine","Chambre","Salle de bain","WC","Entrée","Bureau",
       "Garage","Cave","Terrasse","Jardin","Façade","Autre"],
  en: ["Living room","Kitchen","Bedroom","Bathroom","WC","Hallway","Study",
       "Garage","Cellar","Terrace","Garden","Facade","Other"],
  de: ["Wohnzimmer","Küche","Schlafzimmer","Badezimmer","WC","Flur","Büro",
       "Garage","Keller","Terrasse","Garten","Fassade","Sonstiges"],
};
```

---

## GESTION DES ERREURS VISION

```javascript
// Types d'erreurs et messages utilisateur
const VISION_ERRORS = {
  CORS:     "Image non accessible — essayez de télécharger la photo directement",
  TIMEOUT:  "Analyse trop longue — vérifiez votre connexion internet",
  API_KEY:  "Clé API invalide — vérifiez vos paramètres",
  QUOTA:    "Crédit API épuisé — rechargez votre compte Anthropic",
  FORMAT:   "Format image non supporté — utilisez JPG ou PNG",
  SIZE:     "Image trop lourde — la compression automatique a échoué",
  PARSE:    "Erreur de traitement — réessayez avec cette photo",
};
```

---

## LIMITES ET PERFORMANCES

```
Photos max         : 15 par analyse
Taille max image   : 1024px × 1024px (après compression)
Qualité JPEG       : 85% (bon compromis qualité/poids)
Timeout par photo  : 60 secondes
Pause entre photos : 300ms (éviter rate limiting)
Tokens par photo   : ~1500 max
Tokens synthèse    : ~2000 max
Coût par photo     : ~0.001$ (Haiku)
Coût analyse 10ph  : ~0.015$ total
```
