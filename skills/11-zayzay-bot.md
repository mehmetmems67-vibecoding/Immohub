---
name: zaymmo-zayzay-bot
description: ZayZay — Assistant IA intégré de Zaymmo. Lire avant toute modification du bot, ajout de fonctionnalité ZayZay ou préparation Phase 2. ZayZay aide l'agent en temps réel, remplit les champs, guide l'utilisation et conseille sur le bien.
---

# Zaymmo ZayZay Bot

## QUI EST ZAYZAY ?

ZayZay est l'assistant IA personnel de chaque agent Zaymmo.
Il est disponible à tout moment via un bouton flottant dans l'app.

```
Rôle 1 → Guide d'utilisation : explique comment utiliser Zaymmo
Rôle 2 → Remplissage assisté : l'agent décrit, ZayZay remplit les champs
Rôle 3 → Conseiller immobilier : suggestions, prix, mise en valeur
Rôle 4 → Base Phase 2 : architecture prête pour voix, drone, vidéo
```

---

## PERSONNALITÉ ZAYZAY

```
Prénom      : ZayZay
Ton         : Professionnel mais chaleureux — comme un collègue expert
Concision   : Maximum 3 phrases par réponse (sauf demande explicite)
Langue      : Suit la langue de l'annonce sélectionnée
Humilité    : Admet quand il ne sait pas
Proactivité : Propose des actions concrètes sans qu'on lui demande
```

---

## COMPOSANT ZAYZAY

```jsx
// Bouton flottant ZayZay
function ZayZayButton({ onClick, hasUnread }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: 80,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #C8793A, #00D4E8)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        boxShadow: "0 4px 16px #C8793A40",
        zIndex: 1000,
        animation: "glowCopper 3s ease-in-out infinite",
      }}
    >
      ZZ
      {hasUnread && (
        <div style={{
          position: "absolute",
          top: 0, right: 0,
          width: 12, height: 12,
          borderRadius: "50%",
          background: "#E84A4A",
          animation: "blink 0.8s infinite",
        }}/>
      )}
    </button>
  );
}

// Panneau ZayZay
function ZayZayPanel({ meta, synth, step, currentUser, onClose, onFillMeta }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Bonjour ${currentUser?.name || ""}  ! Je suis ZayZay, votre assistant Zaymmo. Comment puis-je vous aider ?`,
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.concat(userMsg).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await callClaude(
        history,
        zayZaySystemPrompt(meta, synth, step, currentUser)
      );

      // Extraire JSON si ZayZay veut remplir des champs
      if (typeof response === "object" && response.fill_fields) {
        onFillMeta(response.fill_fields);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: response.message || "J'ai mis à jour les informations du bien.",
          timestamp: new Date(),
        }]);
      } else {
        const text = typeof response === "string"
          ? response
          : response.message || JSON.stringify(response);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: text,
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Désolé, je rencontre une difficulté. Réessayez dans un instant.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: "fixed",
      bottom: 140,
      right: 16,
      width: 300,
      maxHeight: 420,
      background: "#0C0A08",
      border: "1px solid #C8793A30",
      borderRadius: 16,
      display: "flex",
      flexDirection: "column",
      zIndex: 999,
      boxShadow: "0 8px 32px #C8793A20",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px",
        background: "linear-gradient(135deg, #C8793A15, #00D4E810)",
        borderBottom: "1px solid #1A1410",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#C8793A" }}>
          ZayZay · Assistant IA
        </div>
        <button onClick={onClose}
          style={{ background: "transparent", border: "none", color: "#3A2A1A", cursor: "pointer", fontSize: 16 }}>
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "85%",
              padding: "8px 10px",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: m.role === "user" ? "#C8793A20" : "#1A1410",
              color: m.role === "user" ? "#E8D8C0" : "#C0A890",
              fontSize: 12,
              lineHeight: 1.5,
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: 11, color: "#3A2A1A", textAlign: "center" }}>
            ZayZay réfléchit...
          </div>
        )}
        <div ref={messagesEndRef}/>
      </div>

      {/* Input */}
      <div style={{
        padding: "8px 10px",
        borderTop: "1px solid #1A1410",
        display: "flex",
        gap: 6,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Posez votre question..."
          style={{
            flex: 1,
            background: "#0F0B07",
            border: "1px solid #1A1410",
            borderRadius: 8,
            color: "#E8D8C0",
            padding: "7px 10px",
            fontSize: 12,
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: input.trim() ? "#C8793A" : "#1A1410",
            border: "none",
            borderRadius: 8,
            color: "#050404",
            padding: "7px 12px",
            fontSize: 11,
            fontWeight: 700,
            cursor: input.trim() ? "pointer" : "default",
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
```

---

## SYSTEM PROMPT ZAYZAY

```javascript
function zayZaySystemPrompt(meta, synth, step, currentUser) {
  return `Tu es ZayZay, l'assistant IA intégré de Zaymmo — la plateforme immobilière IA.
Tu aides ${currentUser?.name || "l'agent"} en temps réel.
Tu réponds en ${meta.langAnnonce === "en" ? "anglais" : meta.langAnnonce === "de" ? "allemand" : "français"}.
Sois CONCIS — maximum 3 phrases sauf si on te demande plus de détails.

CONTEXTE ACTUEL:
- Étape: ${step}
- Bien: ${meta.type || "Non défini"} à ${meta.ville || "Non défini"}
- Surface: ${meta.surface || "Non renseignée"}m²
- Prix: ${meta.prix ? Number(meta.prix).toLocaleString() + " €" : "Non renseigné"}
- DPE: ${meta.dpe || "Non renseigné"}
${synth ? `- Score IA: ${synth.score_global}/10 — ${synth.etat_global}` : "- Pas encore analysé"}
${synth ? `- Atouts: ${(synth.points_forts || []).slice(0,2).join(", ")}` : ""}

GUIDE ZAYMMO:
Photos → Analyser → IA pré-remplit → Agent corrige → Notes → Générer annonce → Sauvegarder → Exporter

COMMANDES SPÉCIALES:
Si l'agent décrit un bien, extrais les informations et réponds avec ce JSON:
{
  "fill_fields": {
    "type": "Maison",
    "surface": "185",
    "pieces": "7",
    "chambres": "4",
    "ville": "Saint-Ail",
    "prix": "450000"
  },
  "message": "J'ai mis à jour les informations du bien. Vérifiez et complétez si nécessaire."
}

Si c'est une question sur Zaymmo, réponds directement en texte.
Si tu ne sais pas, dis-le honnêtement.`;
}
```

---

## QUESTIONS FRÉQUENTES — RÉPONSES ZAYZAY

```javascript
const FAQ_ZAYZAY = {
  "comment analyser": "Ajoutez vos photos dans l'étape Photos, nommez chaque pièce, puis cliquez sur Analyser. L'IA pré-remplira automatiquement la fiche.",

  "comment sauvegarder": "Après avoir généré votre annonce, cliquez sur le bouton vert Sauvegarder. L'annonce sera accessible dans Annonces sauvegardées depuis l'accueil.",

  "comment dicter": "Dans l'étape Notes, cliquez sur Dicter, parlez naturellement, puis cliquez à nouveau pour arrêter. L'IA nettoie automatiquement votre transcription.",

  "comment exporter": "Dans l'étape Aperçu, sélectionnez votre pays et la plateforme souhaitée, puis cliquez sur Copier. L'annonce est copiée dans votre presse-papier.",

  "comment corriger": "Après l'analyse, l'étape Infos bien vous permet de vérifier et corriger toutes les informations pré-remplies par l'IA.",

  "cout analyse": "Une analyse coûte environ 0.01 à 0.12$ selon le nombre de photos et de langues générées.",

  "nombre photos": "Minimum 1 photo, maximum 15. Pour une analyse optimale, entre 8 et 12 photos couvrant toutes les pièces.",
};
```

---

## REMPLISSAGE ASSISTÉ PAR LANGAGE NATUREL

```javascript
// L'agent peut décrire le bien en langage naturel
// ZayZay extrait et remplit les champs

// Exemple d'input agent:
// "C'est une maison de 185m² à Saint-Ail avec 7 pièces dont 4 chambres,
//  terrain de 2700m², DPE B, prix 450 000€, garage et terrasse"

// ZayZay répond avec fill_fields:
{
  fill_fields: {
    type: "Maison",
    surface: "185",
    pieces: "7",
    chambres: "4",
    terrain: "2700",
    ville: "Saint-Ail",
    prix: "450000",
    dpe: "B",
    garage: true,
    terrasse: true,
  },
  message: "Parfait ! J'ai rempli les informations principales. Vérifiez et complétez le code postal, le nombre de SDB et WC."
}
```

---

## STATES ZAYZAY

```javascript
const [showZayZay, setShowZayZay]     = useState(false);
const [zayZayUnread, setZayZayUnread] = useState(false);
const [zayZayMessages, setZayZayMessages] = useState([]);
```

---

## GESTION DU PANNEAU ZAYZAY

```jsx
{/* Bouton flottant */}
<ZayZayButton
  onClick={() => {
    setShowZayZay(!showZayZay);
    setZayZayUnread(false);
  }}
  hasUnread={zayZayUnread}
/>

{/* Panneau */}
{showZayZay && (
  <ZayZayPanel
    meta={meta}
    synth={synth}
    step={step}
    currentUser={currentUser}
    onClose={() => setShowZayZay(false)}
    onFillMeta={(fields) => {
      setMeta(prev => ({...prev, ...fields}));
    }}
  />
)}
```

---

## PRÉPARATION PHASE 2

```javascript
// Architecture ZayZay prête pour les évolutions futures

// Phase 2 — Voix (ElevenLabs)
// ZayZay pourra parler à voix haute
// Interface : microphone + haut-parleur
// API : ElevenLabs Text-to-Speech

// Phase 2 — Drone
// ZayZay aura accès aux données drone en temps réel
// Pourra suggérer les meilleures angles de prise de vue
// Alertera sur les problèmes détectés (humidité, fissures, etc.)

// Phase 2 — Vidéo
// ZayZay générera le script de la voix off
// Synchronisation avec les séquences vidéo drone

// Structure messages extensible pour Phase 2
const messageExtended = {
  role: "assistant",
  content: "...",
  timestamp: new Date(),
  type: "text",          // text | voice | image | action
  metadata: {},          // données supplémentaires Phase 2
};
```

---

## MÉTRIQUES ZAYZAY

```javascript
// Tracker usage ZayZay pour amélioration continue
const zayZayMetrics = {
  questions_posees: 0,
  champs_remplis: 0,
  satisfaction: [],      // Notes 1-5 après chaque session
  questions_frequentes: {}, // { "comment analyser": 5, ... }
};

// Sauvegarder dans localStorage
localStorage.setItem("zaymmo_zayzay_metrics", JSON.stringify(zayZayMetrics));
```
