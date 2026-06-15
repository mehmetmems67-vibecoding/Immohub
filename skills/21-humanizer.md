---
name: zaymmo-humanizer
description: Humaniseur d'annonces Zaymmo. S'assure que les annonces générées par l'IA sonnent naturelles et humaines. Détecte et corrige les patterns d'écriture IA typiques pour produire un texte authentique.
---

# Zaymmo Humanizer

## PRINCIPE

Une annonce IA détectable = perte de crédibilité pour l'agent.
Zaymmo produit des annonces qui semblent rédigées par un expert humain.

---

## PATTERNS IA À DÉTECTER ET CORRIGER

```javascript
const AI_PATTERNS = [
  // Adverbes excessifs
  { pattern: /\bvéritablement\b/gi,       replace: "" },
  { pattern: /\bindubitablement\b/gi,     replace: "sans conteste" },
  { pattern: /\bexceptionnellement\b/gi,  replace: "particulièrement" },
  { pattern: /\bindéniablement\b/gi,      replace: "" },
  { pattern: /\bincontestablement\b/gi,   replace: "" },

  // Structures répétitives IA
  { pattern: /Cette propriété\s+qui\s+/gi, replace: "Cette propriété " },
  { pattern: /,\s*créant ainsi\s+/gi,      replace: ", créant " },
  { pattern: /,\s*offrant ainsi\s+/gi,     replace: ", offrant " },
  { pattern: /,\s*permettant ainsi\s+/gi,  replace: ", permettant " },

  // Formules bateau IA
  { pattern: /nichée dans un écrin\b/gi,   replace: "idéalement située" },
  { pattern: /harmonie parfaite entre\b/gi, replace: "alliance réussie entre" },
  { pattern: /havre de paix et de\b/gi,    replace: "espace de " },

  // Répétition de "qui"
  { pattern: /qui\s+qui\s+/gi, replace: "qui " },
];

function humanizeText(text) {
  let result = text;
  for (const { pattern, replace } of AI_PATTERNS) {
    result = result.replace(pattern, replace);
  }
  // Nettoyer doubles espaces
  result = result.replace(/\s{2,}/g, " ").trim();
  return result;
}
```

---

## PROFILS DE VOIX

```javascript
const VOICE_PROFILES = {
  expert:     "Ton expert — factuel, précis, professionnel",
  premium:    "Ton premium — élégant, valorisant, aspirationnel",
  chaleureux: "Ton chaleureux — humain, proche, convivial",
  neutre:     "Ton neutre — descriptif, clair, sans excès",
};

// Adapter selon le type de bien
function getVoiceProfile(meta) {
  if (meta.prix > 800000) return "premium";
  if (meta.type === "Maison" || meta.type === "Villa") return "chaleureux";
  if (meta.pays === "de" || meta.pays === "gb") return "neutre";
  return "expert";
}
```

---

## PROMPT HUMANISATION

```javascript
const humanizePrompt = (annonce, profile) =>
  `Tu es un rédacteur immobilier expert humain avec 15 ans d'expérience.
Réécris cette annonce pour qu'elle semble écrite par un humain passionné.

PROFIL DE VOIX: ${VOICE_PROFILES[profile]}

ANNONCE À HUMANISER:
"""
${annonce.description_longue}
"""

RÈGLES:
- Supprimer les adverbes excessifs (véritablement, indubitablement)
- Varier les structures de phrases — pas de répétition
- Ajouter 1-2 touches personnelles et authentiques
- Conserver TOUTES les informations factuelles
- Ne pas allonger le texte de plus de 10%
- Le résultat doit sembler écrit par Julien, Marie ou Thomas — pas par une IA

FORMAT JSON:
{"description_longue": "texte humanisé ici"}`;
```

---

## DÉTECTION SCORE "IA"

```javascript
function detectAIScore(text) {
  let score = 0;
  const checks = [
    { test: /véritablement|indubitablement|incontestablement/gi, points: 2 },
    { test: /créant ainsi|offrant ainsi|permettant ainsi/gi, points: 1 },
    { test: /harmonie (parfaite|subtile|remarquable)/gi, points: 1 },
    { test: /alliance (parfaite|subtile|harmonieuse)/gi, points: 1 },
    { test: /(.{20,})\1/gi, points: 3 }, // Répétitions de phrases
  ];

  for (const { test, points } of checks) {
    if (test.test(text)) score += points;
  }

  return {
    score,                    // 0 = humain, 10+ = très IA
    label: score === 0 ? "Naturel" : score <= 3 ? "Acceptable" : "À humaniser",
    needsHumanizing: score > 3,
  };
}
```

---

## INTÉGRATION DANS LE PIPELINE

```javascript
// Après génération annonce — humaniser automatiquement si score élevé
async function genAnnonceWithHumanize() {
  const rawAnnonce = await genAnnonce();

  const aiScore = detectAIScore(rawAnnonce.description_longue);
  if (aiScore.needsHumanizing) {
    const profile = getVoiceProfile(meta);
    const humanized = await callClaude(
      [{ role: "user", content: humanizePrompt(rawAnnonce, profile) }],
      "Rédacteur immobilier expert. Retourne uniquement le JSON demandé."
    );
    return { ...rawAnnonce, ...humanized };
  }

  return rawAnnonce;
}
```
