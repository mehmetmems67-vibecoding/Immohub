---
name: zaymmo-agent-score
description: Score de performance agent Zaymmo. Lire avant toute modification du système de gamification. Calcule un score de performance pour motiver et valoriser l'utilisation efficace de Zaymmo.
---

# Zaymmo Agent Score

## PRINCIPE

Un score ludique qui valorise l'utilisation complète et efficace de Zaymmo.
Pas de classement entre agents en Phase 1 (mono-utilisateur) —
sert de suivi personnel de progression.

---

## CALCUL AGENT SCORE

```javascript
function calculateAgentScore() {
  const history = JSON.parse(localStorage.getItem("zaymmo_history") || "[]");
  const saved = JSON.parse(localStorage.getItem("zaymmo_saved") || "[]");
  const visits = JSON.parse(localStorage.getItem("zaymmo_visits") || "[]");
  const contacts = JSON.parse(localStorage.getItem("zaymmo_contacts") || "[]");

  let points = 0;
  const breakdown = [];

  // Points par bien analysé
  const analysisPoints = history.length * 10;
  points += analysisPoints;
  if (analysisPoints > 0) breakdown.push({ label: "Biens analysés", points: analysisPoints });

  // Points par annonce générée
  const annoncePoints = history.filter(h => h.annonce).length * 15;
  points += annoncePoints;
  if (annoncePoints > 0) breakdown.push({ label: "Annonces générées", points: annoncePoints });

  // Points par sauvegarde (qualité)
  const savedPoints = saved.length * 5;
  points += savedPoints;
  if (savedPoints > 0) breakdown.push({ label: "Annonces sauvegardées", points: savedPoints });

  // Points par visite planifiée
  const visitPoints = visits.length * 8;
  points += visitPoints;
  if (visitPoints > 0) breakdown.push({ label: "Visites planifiées", points: visitPoints });

  // Points par contact géré
  const contactPoints = contacts.length * 3;
  points += contactPoints;
  if (contactPoints > 0) breakdown.push({ label: "Contacts gérés", points: contactPoints });

  // Bonus score qualité élevé
  const highScoreBiens = history.filter(h => h.score >= 8).length;
  const bonusPoints = highScoreBiens * 20;
  points += bonusPoints;
  if (bonusPoints > 0) breakdown.push({ label: "Biens excellence (8+/10)", points: bonusPoints });

  return {
    totalPoints: points,
    breakdown,
    niveau: getAgentLevel(points),
  };
}

function getAgentLevel(points) {
  if (points >= 2000) return { label: "Maître Zaymmo", color: "#FFD700", icone: "👑" };
  if (points >= 1000) return { label: "Expert",        color: "#C8793A", icone: "⭐" };
  if (points >= 500)  return { label: "Confirmé",      color: "#00D4E8", icone: "🔥" };
  if (points >= 200)  return { label: "Initié",        color: "#4AE88A", icone: "📈" };
  return                    { label: "Débutant",      color: "#E8B44A", icone: "🌱" };
}
```

---

## COMPOSANT AFFICHAGE SCORE

```jsx
function AgentScoreCard() {
  const { totalPoints, breakdown, niveau } = calculateAgentScore();

  return (
    <Card>
      <ST color={niveau.color}>MON SCORE ZAYMMO</ST>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 32 }}>{niveau.icone}</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: niveau.color }}>
            {totalPoints.toLocaleString()} pts
          </div>
          <div style={{ fontSize: 11, color: "#8A7060" }}>
            {niveau.label}
          </div>
        </div>
      </div>

      {/* Détail */}
      {breakdown.map((b, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 11, color: "#8A7060", padding: "5px 0",
          borderBottom: "1px solid #1A1410",
        }}>
          <span>{b.label}</span>
          <span style={{ color: niveau.color }}>+{b.points}</span>
        </div>
      ))}
    </Card>
  );
}
```

---

## PALIERS ET RÉCOMPENSES VISUELLES

```javascript
const MILESTONES = [
  { points: 50,   message: "Premiers pas ! Continuez ainsi." },
  { points: 200,  message: "Vous maîtrisez les bases de Zaymmo." },
  { points: 500,  message: "Utilisateur confirmé — bravo !" },
  { points: 1000, message: "Niveau expert atteint !" },
  { points: 2000, message: "Vous êtes un Maître Zaymmo." },
];

function checkNewMilestone(previousPoints, currentPoints) {
  return MILESTONES.find(m =>
    previousPoints < m.points && currentPoints >= m.points
  );
}
```

---

## NOTIFICATION PALIER ATTEINT

```jsx
function MilestoneNotification({ milestone, onDismiss }) {
  if (!milestone) return null;

  return (
    <div style={{
      position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
      background: "#0C0A08", border: "1px solid #C8793A50",
      borderRadius: 12, padding: "14px 20px", zIndex: 2000,
      boxShadow: "0 8px 32px #C8793A30", textAlign: "center",
      animation: "fadeUp 0.3s ease",
    }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>🎉</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#C8793A" }}>
        {milestone.points} points atteints !
      </div>
      <div style={{ fontSize: 11, color: "#8A7060", marginTop: 4 }}>
        {milestone.message}
      </div>
      <button onClick={onDismiss}
        style={{ marginTop: 8, fontSize: 10, color: "#3A2A1A" }}>
        Fermer
      </button>
    </div>
  );
}
```
