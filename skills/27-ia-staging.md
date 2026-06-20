---
name: zaymmo-ia-staging
description: Module de retouche photo et home staging virtuel de Zaymmo. Déclenché uniquement à la demande explicite de l'agent après analyse. Optimise l'usage des crédits en ne traitant que les photos qui en ont vraiment besoin.
---

# Zaymmo IA Staging

## PRINCIPE

Le staging IA est OPTIONNEL et MANUEL — jamais automatique.
Il ne se déclenche que si l'agent clique explicitement dessus,
et seulement sur les photos qui en bénéficieraient (détecté par l'analyse).

```
Analyse photo → Détection désordre/défauts → Suggestion staging (pas automatique)
→ Agent clique "Retoucher" → Génération → Comparaison avant/après → Validation agent
```

---

## DÉTECTION DU BESOIN

```javascript
// Lors de l'analyse normale, l'IA évalue si le staging aiderait
function needsStaging(photoAnalysis) {
  const indicators = [
    photoAnalysis.points_faibles?.some(p =>
      /désordre|personnel|daté|sombre|encombr/i.test(p)
    ),
    photoAnalysis.home_staging?.length > 2, // Plusieurs suggestions
    photoAnalysis.score_piece < 6,
  ];

  return indicators.filter(Boolean).length >= 1;
}

// Affichage suggestion (pas automatique)
{photo.data && needsStaging(photo.data) && (
  <div style={{
    fontSize: 10, color: "#C8793A",
    padding: "4px 8px", background: "#C8793A10",
    borderRadius: 4, marginTop: 4,
  }}>
    💡 Le staging virtuel pourrait améliorer cette photo
    <button onClick={() => requestStaging(photo)}
      style={{marginLeft: 8, color: "#00D4E8", background: "none", border: "none"}}>
      Retoucher →
    </button>
  </div>
)}
```

---

## TYPES DE RETOUCHES DISPONIBLES

```javascript
const STAGING_TYPES = {
  depersonnalisation: {
    label: "Dépersonnaliser",
    description: "Retire les objets personnels, photos de famille, décorations spécifiques",
    cout_estime: "0.02-0.04$",
  },
  home_staging: {
    label: "Home staging virtuel",
    description: "Ajoute du mobilier moderne dans une pièce vide ou la réagence",
    cout_estime: "0.04-0.08$",
  },
  luminosite: {
    label: "Correction luminosité",
    description: "Améliore l'éclairage et la luminosité générale de la photo",
    cout_estime: "0.01-0.02$",
  },
  suppression_objets: {
    label: "Suppression objets",
    description: "Retire les objets encombrants ou disgracieux",
    cout_estime: "0.02-0.03$",
  },
  ciel_exterieur: {
    label: "Amélioration ciel",
    description: "Pour les photos extérieures — ciel plus accueillant",
    cout_estime: "0.01-0.02$",
  },
};
```

---

## WORKFLOW DEMANDE STAGING

```javascript
async function requestStaging(photo, stagingType) {
  // Afficher le coût AVANT de lancer
  const cost = STAGING_TYPES[stagingType].cout_estime;
  const confirmed = window.confirm(
    `Retouche "${STAGING_TYPES[stagingType].label}" — coût estimé ${cost}.\nContinuer ?`
  );
  if (!confirmed) return;

  setStagingLoading(photo.id);

  try {
    // Phase 1 : Utilisation API image generation (à intégrer Phase 1.5)
    // Note: nécessite une API tierce (Stability AI, Replicate, etc.)
    // Architecture prête, intégration selon disponibilité budget

    const result = await callImageStagingAPI(photo, stagingType);

    // Stocker la version retouchée SANS écraser l'originale
    setPhotos(prev => prev.map(p =>
      p.id === photo.id
        ? { ...p, staged: { url: result.url, type: stagingType } }
        : p
    ));

  } catch (err) {
    setError("Erreur retouche : " + err.message);
  } finally {
    setStagingLoading(null);
  }
}
```

---

## COMPARAISON AVANT/APRÈS

```jsx
function StagingComparison({ photo, onAccept, onReject }) {
  if (!photo.staged) return null;

  return (
    <div style={{
      background: "#0C0A08",
      borderRadius: 12,
      padding: 14,
      border: "1px solid #C8793A30",
    }}>
      <div style={{ fontSize: 10, color: "#C8793A", letterSpacing: 1, marginBottom: 10 }}>
        COMPARAISON AVANT / APRÈS
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <img src={photo.preview} style={{ width: "100%", borderRadius: 8 }} />
          <div style={{ fontSize: 9, color: "#3A2A1A", textAlign: "center", marginTop: 4 }}>
            ORIGINAL
          </div>
        </div>
        <div>
          <img src={photo.staged.url} style={{ width: "100%", borderRadius: 8 }} />
          <div style={{ fontSize: 9, color: "#00D4E8", textAlign: "center", marginTop: 4 }}>
            RETOUCHÉ
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={() => onAccept(photo)}
          style={{
            flex: 1, padding: "8px", borderRadius: 6,
            background: "#4AE88A20", color: "#4AE88A",
            border: "1px solid #4AE88A40", fontSize: 11,
          }}>
          Utiliser cette version
        </button>
        <button onClick={() => onReject(photo)}
          style={{
            flex: 1, padding: "8px", borderRadius: 6,
            background: "transparent", color: "#3A2A1A",
            border: "1px solid #1A1410", fontSize: 11,
          }}>
          Garder l'original
        </button>
      </div>
    </div>
  );
}
```

---

## UTILISATION DANS LA FICHE CLIENT

```javascript
// Utiliser la version stagée si validée par l'agent, sinon l'originale
function getDisplayPhoto(photo) {
  return photo.staged?.validated ? photo.staged.url : photo.preview;
}

// Dans la fiche client imprimée
const photosForPrint = photos.map(p => getDisplayPhoto(p));
```

---

## INTÉGRATION API EXTERNE (Phase 1.5)

```javascript
// Architecture prête — à connecter selon le service choisi
async function callImageStagingAPI(photo, type) {
  // Option A : Stability AI (Stable Diffusion)
  // Option B : Replicate (modèles variés)
  // Option C : Google Imagen via Gemini API

  // Structure générique
  const response = await fetch("STAGING_API_ENDPOINT", {
    method: "POST",
    headers: { "Authorization": `Bearer ${STAGING_API_KEY}` },
    body: JSON.stringify({
      image: photo.preview,
      prompt: STAGING_PROMPTS[type],
      strength: 0.6, // Préserver la structure, modifier le contenu
    }),
  });

  return response.json();
}

const STAGING_PROMPTS = {
  depersonnalisation: "Remove personal items, family photos, and personal decorations while keeping the room structure intact",
  home_staging: "Add modern, neutral furniture to stage this room for real estate listing, professional interior design style",
  luminosite: "Enhance lighting and brightness naturally, make the room feel bright and welcoming",
  suppression_objets: "Remove clutter and unnecessary objects while preserving the room's architecture",
  ciel_exterieur: "Replace overcast sky with a bright, welcoming blue sky with light clouds",
};
```

---

## COÛT ET LIMITES

```
Coût par retouche    : 0.01-0.08$ selon le type
Max retouches/bien   : 5 recommandé (coût raisonnable)
Format supporté      : JPG, PNG
Résolution           : Identique à l'originale compressée (1024px)
Stockage             : Version stagée en plus de l'originale (localStorage limité)
```
