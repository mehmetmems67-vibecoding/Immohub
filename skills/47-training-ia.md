---
name: zaymmo-training-ia
description: Formation continue des agents via Zaymmo. Lire avant toute modification du système de formation. ZayZay aide les nouveaux agents à progresser en simulant des situations et en donnant des conseils contextuels.
---

# Zaymmo Training IA

## PRINCIPE

Au-delà de l'onboarding initial, ZayZay continue de former l'agent
en analysant ses habitudes et en suggérant des améliorations.

---

## DÉTECTION NIVEAU AGENT

```javascript
function getAgentLevel() {
  const metrics = getUsageMetrics(); // depuis Analytics skill
  const totalAnalyses = metrics.parType?.analysis_completed || 0;

  if (totalAnalyses < 5)   return { level: "débutant",     label: "Découverte" };
  if (totalAnalyses < 20)  return { level: "intermediaire", label: "En progression" };
  if (totalAnalyses < 50)  return { level: "confirme",      label: "Confirmé" };
  return                        { level: "expert",         label: "Expert" };
}
```

---

## CONSEILS CONTEXTUELS PAR NIVEAU

```javascript
const TRAINING_TIPS = {
  débutant: [
    "Astuce : Prenez vos photos depuis les coins de chaque pièce pour une analyse plus précise",
    "Astuce : Utilisez la dictée vocale pour gagner du temps sur les notes",
    "Astuce : L'IA pré-remplit la fiche — vérifiez surtout la surface et le prix",
  ],
  intermediaire: [
    "Astuce : Ajoutez des comparables marché pour affiner l'estimation de prix",
    "Astuce : Le bouton Raccourcir/Reformuler permet d'ajuster le ton de l'annonce",
    "Astuce : Sauvegardez vos meilleures annonces comme modèles de référence",
  ],
  confirme: [
    "Astuce : Utilisez les raccourcis clavier pour aller plus vite (S = Sauvegarder)",
    "Astuce : Le Green Score peut être un argument de vente différenciant",
    "Astuce : Exploitez le CRM intégré pour ne perdre aucun contact",
  ],
  expert: [
    "Astuce : Créez des templates pour vos types de biens récurrents",
    "Astuce : Le benchmark interne révèle vos tendances de performance",
    "Astuce : Exportez vos données régulièrement pour vos archives",
  ],
};

function getRandomTip(level) {
  const tips = TRAINING_TIPS[level] || TRAINING_TIPS.débutant;
  return tips[Math.floor(Math.random() * tips.length)];
}
```

---

## COMPOSANT CONSEIL DU JOUR

```jsx
function DailyTip() {
  const { level } = getAgentLevel();
  const [tip] = useState(() => getRandomTip(level));
  const [dismissed, setDismissed] = useState(
    sessionStorage.getItem("zaymmo_tip_dismissed") === "true"
  );

  if (dismissed) return null;

  return (
    <div style={{
      padding: "10px 14px", background: "#00D4E810",
      borderRadius: 8, border: "1px solid #00D4E830",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: 12,
    }}>
      <div style={{ fontSize: 11, color: "#00D4E8" }}>
        💡 {tip}
      </div>
      <button onClick={() => {
        setDismissed(true);
        sessionStorage.setItem("zaymmo_tip_dismissed", "true");
      }} style={{ background: "transparent", border: "none", color: "#3A2A1A" }}>
        ×
      </button>
    </div>
  );
}
```

---

## SIMULATION D'ENTRAÎNEMENT (mode pratique)

```javascript
// Mode pratique avec un bien fictif pour s'entraîner sans impact réel
const TRAINING_SCENARIOS = [
  {
    label: "Appartement standard",
    meta: { type: "Appartement", surface: "65", pieces: "3", ville: "Exemple-Ville", prix: "280000" },
    objectif: "Générer une annonce complète en moins de 3 minutes",
  },
  {
    label: "Maison avec défauts",
    meta: { type: "Maison", surface: "140", pieces: "6", ville: "Exemple-Ville", prix: "320000" },
    objectif: "Identifier les points faibles et proposer un argumentaire de négociation",
  },
];

function startTrainingMode(scenario) {
  return {
    ...scenario,
    isTraining: true, // Flag pour ne pas sauvegarder dans l'historique réel
  };
}
```

---

## BADGE DE PROGRESSION

```jsx
function ProgressionBadge() {
  const { level, label } = getAgentLevel();
  const metrics = getUsageMetrics();

  const LEVEL_COLORS = {
    débutant: "#E8B44A",
    intermediaire: "#00D4E8",
    confirme: "#C8793A",
    expert: "#4AE88A",
  };

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20,
      background: `${LEVEL_COLORS[level]}15`,
      border: `1px solid ${LEVEL_COLORS[level]}30`,
    }}>
      <span style={{ fontSize: 10, color: LEVEL_COLORS[level], fontWeight: 700 }}>
        {label}
      </span>
    </div>
  );
}
```

---

## QUESTIONS FRÉQUENTES PAR NIVEAU (ZayZay enrichi)

```javascript
// ZayZay adapte ses réponses selon le niveau détecté
function getZayZayToneForLevel(level) {
  const tones = {
    débutant: "Sois très pédagogue, explique chaque étape en détail, encourage.",
    intermediaire: "Sois efficace, donne des astuces avancées sans réexpliquer les bases.",
    confirme: "Sois direct et technique, suppose une bonne maîtrise de l'outil.",
    expert: "Sois bref, propose des optimisations avancées et raccourcis.",
  };
  return tones[level] || tones.débutant;
}
```
