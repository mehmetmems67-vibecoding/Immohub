---
name: zaymmo-self-learning
description: Système d'auto-apprentissage de Zaymmo. Zaymmo analyse les corrections de l'agent après chaque analyse pour améliorer progressivement la qualité des futures analyses et annonces. Plus Zaymmo est utilisé, plus il devient précis.
---

# Zaymmo Self-Learning

## PRINCIPE

Zaymmo apprend de chaque utilisation.
Quand l'agent corrige les infos pré-remplies par l'IA → Zaymmo mémorise.
À la prochaine analyse → Zaymmo tient compte des corrections passées.

```
Analyse IA → Pré-remplissage → Agent corrige → Zaymmo mémorise
→ Prochaine analyse → Prompts enrichis → Meilleure précision
```

---

## CE QUE ZAYMMO APPREND

```javascript
const learningData = {
  // Corrections de surface
  surface_corrections: [],    // [{ia: "85", agent: "92", type: "Appartement"}]

  // Corrections de pièces
  pieces_corrections: [],     // [{ia: 4, agent: 5, contexte: "maison"}]

  // Équipements manqués
  equipements_manques: [],    // ["poele_granules", "dressing"]

  // Qualité annonces
  annonce_ratings: [],        // [{score: 4, type: "Maison", langue: "fr"}]

  // Révisions fréquentes
  revision_patterns: [],      // [{instruction: "raccourcir", frequence: 8}]

  // Notes vocales communes
  notes_themes: [],           // ["cave à vin", "rénovation 2022", "vue dégagée"]

  // Stats globales
  total_analyses: 0,
  total_annonces: 0,
  derniere_mise_a_jour: null,
};
```

---

## COLLECTE DES CORRECTIONS

```javascript
// Après que l'agent quitte l'étape fiche → comparer avec synth
function collectCorrections(metaAvant, metaApres, synth) {
  const corrections = {};

  // Surface
  if (synth.surface_totale_estimee && metaApres.surface) {
    const iaVal = synth.surface_totale_estimee.replace(/[^0-9]/g, "");
    if (iaVal !== metaApres.surface) {
      corrections.surface = { ia: iaVal, agent: metaApres.surface };
    }
  }

  // Pièces
  if (synth.nb_pieces && metaApres.pieces) {
    if (synth.nb_pieces.toString() !== metaApres.pieces) {
      corrections.pieces = { ia: synth.nb_pieces, agent: metaApres.pieces };
    }
  }

  // Équipements ajoutés manuellement (pas détectés par IA)
  const equipements = ["cave","parking","terrasse","balcon","jardin","garage",
                       "piscine","poele_granules","cheminee","dressing"];
  corrections.equipements_ajoutes = equipements.filter(e =>
    metaApres[e] && !synth.equipements_detectes?.includes(e)
  );

  return corrections;
}

// Sauvegarder les corrections
function saveLearningData(corrections, meta) {
  const data = getLearningData();

  if (corrections.surface) {
    data.surface_corrections.push({
      ...corrections.surface,
      type: meta.type,
      date: new Date().toISOString(),
    });
    data.surface_corrections = data.surface_corrections.slice(-50); // Max 50
  }

  if (corrections.equipements_ajoutes?.length > 0) {
    data.equipements_manques.push(...corrections.equipements_ajoutes);
  }

  data.total_analyses = (data.total_analyses || 0) + 1;
  data.derniere_mise_a_jour = new Date().toISOString();

  localStorage.setItem("zaymmo_learning", JSON.stringify(data));
}
```

---

## UTILISATION DES APPRENTISSAGES

```javascript
// Enrichir le prompt d'analyse avec les apprentissages
function getLearningContext() {
  const data = getLearningData();
  if (!data || data.total_analyses < 3) return ""; // Pas assez de données

  const context = [];

  // Équipements souvent manqués
  const equipFreq = {};
  (data.equipements_manques || []).forEach(e => {
    equipFreq[e] = (equipFreq[e] || 0) + 1;
  });
  const topEquip = Object.entries(equipFreq)
    .filter(([, freq]) => freq >= 2)
    .map(([e]) => e);

  if (topEquip.length > 0) {
    context.push(`ATTENTION: Ces équipements sont souvent présents mais difficiles à détecter: ${topEquip.join(", ")}. Cherchez-les attentivement.`);
  }

  // Précision surface
  if (data.surface_corrections?.length >= 5) {
    const avgDiff = data.surface_corrections
      .map(c => Number(c.agent) - Number(c.ia))
      .reduce((a, b) => a + b, 0) / data.surface_corrections.length;

    if (Math.abs(avgDiff) > 10) {
      context.push(`NOTE: Tes estimations de surface tendent à être ${avgDiff > 0 ? "sous-estimées" : "surestimées"} de ~${Math.abs(Math.round(avgDiff))}m². Ajuste en conséquence.`);
    }
  }

  return context.join("\n");
}
```

---

## FEEDBACK EXPLICIT (notation annonce)

```javascript
// Après génération annonce — l'agent peut noter
function AnnonceRating({ onRate }) {
  const [rated, setRated] = useState(false);

  const handleRate = (score) => {
    // Sauvegarder le feedback
    const data = getLearningData();
    data.annonce_ratings = data.annonce_ratings || [];
    data.annonce_ratings.push({
      score,
      date: new Date().toISOString(),
    });
    data.annonce_ratings = data.annonce_ratings.slice(-100);
    localStorage.setItem("zaymmo_learning", JSON.stringify(data));
    setRated(true);
    onRate(score);
  };

  if (rated) {
    return (
      <div style={{ fontSize: 11, color: "#4AE88A" }}>
        Merci ! ZayZay apprend de votre retour.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 10, color: "#3A2A1A" }}>Cette annonce :</div>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => handleRate(n)}
          style={{
            background: "transparent",
            border: "1px solid #1A1410",
            borderRadius: 4,
            color: "#3A2A1A",
            padding: "3px 7px",
            fontSize: 11,
            cursor: "pointer",
          }}>
          {n}
        </button>
      ))}
    </div>
  );
}
```

---

## RAPPORT DE PROGRESSION

```javascript
function getLearningReport() {
  const data = getLearningData();
  if (!data) return null;

  const avgRating = data.annonce_ratings?.length > 0
    ? (data.annonce_ratings.reduce((a, b) => a + b.score, 0) / data.annonce_ratings.length).toFixed(1)
    : "N/A";

  return {
    total_analyses: data.total_analyses || 0,
    total_annonces: data.total_annonces || 0,
    note_moyenne: avgRating,
    apprentissages: Object.keys(data).filter(k => Array.isArray(data[k]) && data[k].length > 0).length,
    derniere_maj: data.derniere_mise_a_jour,
  };
}
```

---

## STORAGE

```javascript
const LEARNING_KEY = "zaymmo_learning";

function getLearningData() {
  try {
    return JSON.parse(localStorage.getItem(LEARNING_KEY) || "{}");
  } catch { return {}; }
}
```
