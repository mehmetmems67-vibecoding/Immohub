---
name: zaymmo-brain
description: Cerveau central de Zaymmo. Lire avant toute modification touchant l'intelligence globale du système. Orchestre tous les autres skills IA pour une cohérence d'ensemble — le point central qui relie Vision IA, Scoring, Self-Learning et Prompts.
---

# Zaymmo Brain

## PRINCIPE

Zaymmo Brain n'est pas un skill isolé — c'est l'orchestrateur central
qui coordonne tous les modules IA pour qu'ils travaillent ensemble
de façon cohérente plutôt qu'en silos.

```
Vision IA → Scoring → Self-Learning → Prompts → Market Intelligence
                    ↓
              ZAYMMO BRAIN
                    ↓
        Décision finale cohérente
```

---

## ORCHESTRATION DU PIPELINE COMPLET

```javascript
async function zaymmoBrainPipeline(photos, meta) {
  const context = {
    meta,
    learningContext: getLearningContext(),      // Self-Learning
    timestamp: new Date().toISOString(),
  };

  // 1. Vision IA — analyser les photos
  const visionResults = await runVisionAnalysis(photos, context);

  // 2. Synthèse enrichie par l'historique
  const synth = await generateSynthesis(visionResults, context);

  // 3. Scoring — calculer le score global
  const scoring = calculateAgentScore ? null : synth; // Score déjà dans synth

  // 4. Market Intelligence — enrichir avec comparables si disponibles
  const comparables = getComparables(meta.ville);
  const marketContext = comparables.length > 0
    ? getRefinedEstimate(meta, comparables)
    : null;

  // 5. Neural Price — combiner toutes les sources
  const historyBenchmark = getInternalBenchmark(meta);
  const neuralPrice = calculateNeuralPrice(meta, synth, marketContext, historyBenchmark);

  // 6. Green Score — évaluation environnementale
  const greenScore = calculateGreenScore(meta, synth);

  // 7. Self-Learning — collecter pour amélioration future
  collectCorrections(meta, meta, synth); // Sera comparé après corrections agent

  return {
    synth,
    neuralPrice,
    greenScore,
    marketContext,
    confidence: neuralPrice?.confiance || { label: "Standard", color: "#C8793A" },
  };
}
```

---

## COHÉRENCE INTER-MODULES

```javascript
// Zaymmo Brain s'assure que les modules ne se contredisent pas

function ensureCoherence(synth, neuralPrice, greenScore) {
  const issues = [];

  // Vérifier cohérence score global vs prix estimé
  if (synth.score_global >= 8 && neuralPrice?.estimationFinale) {
    // Un bien excellent ne devrait pas avoir un prix anormalement bas
    // (vérification de cohérence, pas de correction automatique)
  }

  // Vérifier cohérence DPE vs Green Score
  if (["A","B"].includes(synth.dpe_estime) && greenScore.score < 5) {
    issues.push("Incohérence DPE/GreenScore détectée — vérifier manuellement");
  }

  return { coherent: issues.length === 0, issues };
}
```

---

## DÉCISION FINALE ENRICHIE

```javascript
function getBrainRecommendation(context) {
  const { synth, neuralPrice, greenScore, marketContext } = context;

  let recommendation = "";

  // Logique de recommandation basée sur l'ensemble des signaux
  if (synth.score_global >= 8 && neuralPrice?.confiance.label === "Élevée") {
    recommendation = "Bien d'excellente qualité avec estimation fiable — prêt pour publication immédiate.";
  } else if (synth.score_global < 5) {
    recommendation = "Bien nécessitant des travaux — envisager home staging avant publication.";
  } else if (neuralPrice?.confiance.label === "Faible") {
    recommendation = "Ajoutez des comparables marché pour affiner l'estimation de prix.";
  } else {
    recommendation = "Bien prêt pour publication avec les informations actuelles.";
  }

  if (greenScore.score >= 7) {
    recommendation += " Mettez en avant la performance environnementale comme argument de vente.";
  }

  return recommendation;
}
```

---

## COMPOSANT SYNTHÈSE BRAIN

```jsx
function BrainSummaryCard({ context }) {
  const recommendation = getBrainRecommendation(context);
  const coherence = ensureCoherence(context.synth, context.neuralPrice, context.greenScore);

  return (
    <Card>
      <ST color="#9B6FFF">SYNTHÈSE INTELLIGENTE</ST>

      <div style={{
        padding: 12, background: "#9B6FFF10", borderRadius: 8,
        borderLeft: "3px solid #9B6FFF", fontSize: 12, color: "#E8D8C0",
        lineHeight: 1.6, marginBottom: 10,
      }}>
        {recommendation}
      </div>

      {!coherence.coherent && (
        <div style={{ fontSize: 10, color: "#E8B44A" }}>
          ⚠️ {coherence.issues.join(", ")}
        </div>
      )}
    </Card>
  );
}
```

---

## RÔLE DANS L'ARCHITECTURE GLOBALE

```
Zaymmo Brain ne remplace AUCUN module existant.
Il les coordonne pour que :
- L'estimation de prix tienne compte du score qualité
- Les recommandations soient cohérentes entre elles
- L'agent reçoive UNE synthèse claire plutôt que des signaux épars
- Le Self-Learning s'applique de façon transversale à tous les modules
```

---

## ÉVOLUTION FUTURE (Phase 2)

```javascript
// Phase 2 : Zaymmo Brain intégrera aussi les données drone
// pour une cohérence encore plus poussée

const futureBrainPhase2 = {
  inputs: [
    "Vision IA (photos smartphone)",
    "Drone Intelligence (scan complet)",
    "Thermal Vision (caméra thermique)",
    "Sound Analysis (acoustique)",
    "IoT (capteurs connectés)",
  ],
  output: "Une seule synthèse cohérente combinant toutes les sources",
};
```
