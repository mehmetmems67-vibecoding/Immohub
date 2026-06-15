---
name: zaymmo-feedback-loop
description: Système de feedback et amélioration continue de Zaymmo. Collecte les retours agents après chaque annonce pour optimiser les prompts automatiquement. Plus les agents utilisent Zaymmo, plus la qualité s'améliore.
---

# Zaymmo Feedback Loop

## PRINCIPE

Chaque retour agent améliore la prochaine génération.
Le système apprend des révisions, des notes et des corrections.

---

## COLLECTE FEEDBACK

```javascript
const FEEDBACK_KEY = "zaymmo_feedback";

function saveFeedback(feedback) {
  const all = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
  all.push({ ...feedback, date: new Date().toISOString() });
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all.slice(-200)));
}

// Types de feedback collectés
const feedbackTypes = {
  // Après génération annonce
  annonce_rating: { score: 1-5, type: meta.type, langue: meta.langAnnonce },
  // Après révision
  revision_type: { instruction: "raccourcir/reformuler/améliorer", applied: true },
  // Correction surface
  surface_correction: { ia: synth.surface, agent: meta.surface },
  // Équipements manqués
  equip_missed: ["garage", "cheminee"],
};
```

---

## AFFICHAGE FEEDBACK UI

```jsx
// Composant notation après génération
function FeedbackWidget({ onRate }) {
  const [rated, setRated] = useState(false);

  if (rated) return (
    <div style={{ fontSize: 11, color: "#4AE88A", padding: "6px 0" }}>
      ZayZay apprend de votre retour ✓
    </div>
  );

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 0", borderTop: "1px solid #1A1410"
    }}>
      <div style={{ fontSize: 10, color: "#3A2A1A", letterSpacing: 1 }}>
        QUALITÉ :
      </div>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => { onRate(n); setRated(true); }}
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "transparent",
            border: "1px solid #1A1410",
            color: "#3A2A1A", fontSize: 11,
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

## OPTIMISATION AUTOMATIQUE PROMPTS

```javascript
function getOptimizedInstructions() {
  const feedback = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
  if (feedback.length < 5) return "";

  const avgScore = feedback
    .filter(f => f.annonce_rating)
    .reduce((a, b) => a + b.annonce_rating.score, 0) / feedback.length;

  const revisions = feedback.filter(f => f.revision_type);
  const topRevision = revisions.reduce((acc, f) => {
    acc[f.revision_type.instruction] = (acc[f.revision_type.instruction] || 0) + 1;
    return acc;
  }, {});

  const instructions = [];
  if (avgScore < 3) instructions.push("Améliore le style et la richesse du vocabulaire.");
  if (topRevision["raccourcir"] > 3) instructions.push("Sois plus concis dès la première génération.");
  if (topRevision["reformuler"] > 3) instructions.push("Varie davantage les formulations.");

  return instructions.join(" ");
}
```

---

## RAPPORT HEBDOMADAIRE

```javascript
function getWeeklyReport() {
  const feedback = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = feedback.filter(f => new Date(f.date) > oneWeekAgo);

  return {
    analyses: recent.filter(f => f.type === "analyse").length,
    annonces: recent.filter(f => f.type === "annonce").length,
    note_moyenne: recent.filter(f => f.annonce_rating)
      .reduce((a, b) => a + b.annonce_rating.score, 0) / (recent.length || 1),
    ameliorations: recent.filter(f => f.revision_type).length,
  };
}
```
