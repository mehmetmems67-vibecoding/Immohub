---
name: zaymmo-emotion-ton
description: Adaptation émotionnelle et tonale Zaymmo. Lire avant toute génération d'annonce pour adapter le ton au profil d'acheteur ciblé. Dernier skill Phase 1 — complète le système de storytelling avec une couche d'adaptation fine du ton.
---

# Zaymmo Emotion & Ton Adapté

## PRINCIPE

Le même bien se présente différemment selon l'acheteur visé.
Ce skill affine le ton de l'annonce au-delà du storytelling général.

---

## DÉTECTION DU PROFIL CIBLE

```javascript
function detectTargetProfile(meta, synth) {
  const signals = {
    famille: 0,
    investisseur: 0,
    premier_achat: 0,
    senior: 0,
    luxe: 0,
  };

  // Signaux basés sur les caractéristiques du bien
  if (Number(meta.chambres) >= 3) signals.famille += 2;
  if (meta.jardin) signals.famille += 1;
  if (meta.chambre_parentale) signals.famille += 1;

  if (meta.prix && Number(meta.prix) < 250000) signals.premier_achat += 2;
  if (meta.type === "Studio" || meta.type === "Appartement" && Number(meta.surface) < 50) {
    signals.premier_achat += 1;
    signals.investisseur += 1;
  }

  if (meta.ascenseur && !Number(meta.etage)?.toString().includes("/")) signals.senior += 1;
  if (meta.type === "Appartement" && meta.etage === "0") signals.senior += 2;

  if (meta.prix && Number(meta.prix) > 600000) signals.luxe += 2;
  if (synth?.score_global >= 8.5) signals.luxe += 1;

  // Retourner le profil dominant
  const dominant = Object.entries(signals).sort((a,b) => b[1]-a[1])[0];
  return {
    profil: dominant[1] > 0 ? dominant[0] : "general",
    signals,
  };
}
```

---

## CONFIGURATION TON PAR PROFIL

```javascript
const EMOTION_PROFILES = {
  famille: {
    motsClesEmotion: ["épanouir", "grandir", "rassemblement", "souvenirs", "sécurité"],
    instructionTon: "Ton chaleureux et rassurant. Évoquer la vie de famille, les moments partagés, la sécurité de l'environnement.",
    exempleAccroche: "Imaginez vos enfants grandir dans ce cadre où chaque recoin invite au jeu et à la découverte...",
  },
  investisseur: {
    motsClesEmotion: ["rentabilité", "opportunité", "valorisation", "stratégique", "pérenne"],
    instructionTon: "Ton factuel et orienté chiffres. Mettre en avant le potentiel locatif, la localisation stratégique, la rentabilité.",
    exempleAccroche: "Une opportunité d'investissement stratégique dans un secteur à fort potentiel locatif...",
  },
  premier_achat: {
    motsClesEmotion: ["enfin", "accessible", "premier chez-soi", "tremplin", "réussite"],
    instructionTon: "Ton enthousiaste et encourageant. Valoriser l'accessibilité, le potentiel, l'accomplissement personnel.",
    exempleAccroche: "Votre tout premier chez-vous mérite d'être à la hauteur de vos ambitions...",
  },
  senior: {
    motsClesEmotion: ["sérénité", "simplicité", "accessible", "paisible", "confort"],
    instructionTon: "Ton serein et rassurant. Valoriser l'accessibilité, la simplicité de vie, le calme.",
    exempleAccroche: "Un cadre de vie pensé pour la sérénité, où chaque détail simplifie le quotidien...",
  },
  luxe: {
    motsClesEmotion: ["exception", "raffinement", "exclusivité", "prestige", "excellence"],
    instructionTon: "Ton sobre et premium. Pas de superlatifs excessifs — laisser les faits parler avec élégance.",
    exempleAccroche: "Une propriété d'exception où chaque détail témoigne d'une exigence sans compromis...",
  },
  general: {
    motsClesEmotion: ["qualité", "confort", "bien-être", "équilibre"],
    instructionTon: "Ton équilibré et valorisant, adapté à un public large.",
    exempleAccroche: "Découvrez un cadre de vie qui conjugue confort et qualité au quotidien...",
  },
};
```

---

## INTÉGRATION DANS LE PROMPT D'ANNONCE

```javascript
function getEmotionInstructions(meta, synth) {
  const { profil } = detectTargetProfile(meta, synth);
  const config = EMOTION_PROFILES[profil];

  return `
PROFIL ACHETEUR CIBLE DÉTECTÉ: ${profil}
TON À ADOPTER: ${config.instructionTon}
MOTS-CLÉS ÉMOTIONNELS À INTÉGRER: ${config.motsClesEmotion.join(", ")}
EXEMPLE D'ACCROCHE DANS CE STYLE: "${config.exempleAccroche}"
`;
}

// Ajouter dans aPrompt()
// const emotionContext = getEmotionInstructions(meta, synth);
```

---

## SÉLECTEUR MANUEL DE PROFIL (override agent)

```jsx
function ProfileSelector({ meta, synth, onSelect }) {
  const detected = detectTargetProfile(meta, synth);
  const [selected, setSelected] = useState(detected.profil);

  const PROFILE_LABELS = {
    famille: "👨‍👩‍👧 Famille",
    investisseur: "📊 Investisseur",
    premier_achat: "🔑 Premier achat",
    senior: "🌿 Senior",
    luxe: "💎 Luxe",
    general: "🏠 Général",
  };

  return (
    <div>
      <div style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 1, marginBottom: 8 }}>
        PROFIL ACHETEUR CIBLE
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(PROFILE_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => { setSelected(key); onSelect(key); }}
            style={{
              fontSize: 10, padding: "5px 10px", borderRadius: 6,
              background: selected === key ? "#C8793A20" : "transparent",
              color: selected === key ? "#C8793A" : "#3A2A1A",
              border: `1px solid ${selected === key ? "#C8793A40" : "#1A1410"}`,
            }}>
            {label}
          </button>
        ))}
      </div>
      {selected === detected.profil && (
        <div style={{ fontSize: 9, color: "#00D4E8", marginTop: 6 }}>
          Détecté automatiquement par l'IA
        </div>
      )}
    </div>
  );
}
```

---

## VARIANTES D'ANNONCE PAR PROFIL (génération multiple)

```javascript
// Possibilité de générer plusieurs versions pour différents canaux
async function generateMultiProfileAnnonces(meta, synth) {
  const profiles = ["famille", "investisseur"]; // Sélection agent
  const results = {};

  for (const profile of profiles) {
    const customMeta = { ...meta, _forcedProfile: profile };
    results[profile] = await genAnnonce(customMeta, synth);
  }

  return results;
}
```

---

## CHECKLIST QUALITÉ ÉMOTIONNELLE

```
✓ Le profil cible est cohérent avec les caractéristiques du bien
✓ Le ton reste authentique — pas de sur-jeu émotionnel
✓ Les mots-clés émotionnels sont intégrés naturellement, pas plaqués
✓ Les faits restent prioritaires sur l'émotion (jamais de mensonge enjolivé)
✓ L'agent peut toujours override le profil détecté automatiquement
```

---

## FIN PHASE 1 — RÉCAPITULATIF

```
57 Skills Zaymmo spécifiques créés et documentés.
Architecture complète couvrant :
- Fondation (Design, Architecture, UX, Navigation)
- Qualité (QA, Performance, Sécurité, Accessibilité, Déploiement, Maintenance)
- Métier immobilier (Légal, Multilingue, Historique, Prompts)
- Intelligence (Vision, ZayZay, Vocal, Scoring, Storytelling, Self-Learning)
- Marketing (SEO, Social, QR, Email, Négociation)
- Business (Agenda, CRM, Reporting, Benchmark, ROI, Travaux)
- Avancé (Green Score, Analytics, Client Portal, White Label, API)
- Intelligence collective (Brain, Memory, Neural Price, Prédiction, Renovation, Emotion)

Prochaine étape : récupération des skills GitHub existants
puis lancement de la refonte complète de Zaymmo.
```
