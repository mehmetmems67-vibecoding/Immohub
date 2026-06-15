---
name: zaymmo-vocal-transcription
description: Système vocal et transcription de Zaymmo. Lire avant toute modification de la dictée vocale, ajout de commandes vocales ou préparation de l'intégration ElevenLabs Phase 2. Garantit une transcription propre et naturelle pour les notes agent.
---

# Zaymmo Vocal & Transcription

## PRINCIPE

L'agent parle naturellement — ZayZay transcrit et nettoie automatiquement.
Le texte propre s'insère dans le bloc notes sans remplacer ce qui existe déjà.

```
Agent parle → SpeechRecognition (navigateur) → Transcription brute
→ Claude nettoie (euh, ah, répétitions) → Texte propre ajouté aux notes
```

---

## COMPATIBILITÉ NAVIGATEUR

```javascript
// Vérification support
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

// Compatibilité 2025
// ✅ Chrome Android (Xiaomi 14T) — supporté
// ✅ Chrome Desktop — supporté
// ✅ Edge — supporté
// ⚠️ Firefox — support limité
// ❌ Safari iOS — non supporté (utiliser Chrome iOS)

if (!SR) {
  setVoiceError("Dictée non supportée sur ce navigateur. Utilisez Chrome.");
  return;
}
```

---

## CONFIGURATION SPEECHRECOGNITION

```javascript
function configureSpeechRecognition(lang) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();

  // Langue selon pays sélectionné
  const LANG_MAP = {
    fr: "fr-FR",
    en: "en-GB",
    de: "de-DE",
    lu: "fr-FR",  // Luxembourgeois pas supporté → fallback français
    nl: "nl-NL",
  };
  rec.lang = LANG_MAP[lang] || "fr-FR";

  // Configuration
  rec.continuous = true;          // Continue à écouter
  rec.interimResults = false;     // Résultats finaux uniquement
  rec.maxAlternatives = 1;        // Une seule transcription

  return rec;
}
```

---

## FONCTION STARVOICE COMPLÈTE

```javascript
async function startVoice() {
  // Arrêter si déjà en cours
  if (isRecording) {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
    return;
  }

  // Vérifier compatibilité
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    setVoiceError("Dictée non supportée. Utilisez Chrome.");
    return;
  }

  // Configurer la reconnaissance
  const rec = configureSpeechRecognition(meta.langAnnonce || "fr");
  recognitionRef.current = rec;

  let transcript = "";

  // Événements
  rec.onstart = () => {
    setIsRecording(true);
    setVoiceError("");
    setTranscribing(false);
  };

  rec.onresult = (event) => {
    // Accumuler les résultats finaux
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        transcript += event.results[i][0].transcript + " ";
      }
    }
  };

  rec.onerror = (event) => {
    const ERRORS = {
      "not-allowed":   "Microphone non autorisé — vérifiez les permissions Chrome",
      "no-speech":     "Aucune parole détectée — réessayez",
      "network":       "Erreur réseau — vérifiez votre connexion",
      "aborted":       "Dictée interrompue",
      "audio-capture": "Microphone non disponible",
    };
    setVoiceError(ERRORS[event.error] || `Erreur: ${event.error}`);
    setIsRecording(false);
  };

  rec.onend = async () => {
    setIsRecording(false);

    if (!transcript.trim()) return;

    // Nettoyage IA
    setTranscribing(true);
    try {
      const cleaned = await callClaude(
        [{
          role: "user",
          content: transcriptionPrompt(transcript)
        }],
        "Tu es un correcteur de transcription vocale. Retourne uniquement le texte corrigé, sans commentaire ni guillemets."
      );

      // Extraire le texte nettoyé
      let cleanedText = "";
      if (typeof cleaned === "string") {
        cleanedText = cleaned.trim();
      } else if (cleaned && typeof cleaned === "object") {
        cleanedText = cleaned.texte || cleaned.text || transcript.trim();
      } else {
        cleanedText = transcript.trim();
      }

      // Ajouter aux notes existantes (ne pas remplacer)
      if (mountedRef.current) {
        setM("notes_agent",
          (meta.notes_agent || "") +
          (meta.notes_agent ? "\n" : "") +
          cleanedText
        );
      }

    } catch (err) {
      // Fallback : ajouter la transcription brute
      if (mountedRef.current) {
        setM("notes_agent",
          (meta.notes_agent || "") +
          (meta.notes_agent ? "\n" : "") +
          transcript.trim()
        );
      }
    } finally {
      if (mountedRef.current) setTranscribing(false);
    }
  };

  // Démarrer
  try {
    rec.start();
  } catch (err) {
    setVoiceError("Impossible de démarrer la dictée. Réessayez.");
    setIsRecording(false);
  }
}
```

---

## PROMPT DE TRANSCRIPTION

```javascript
const transcriptionPrompt = (transcript) => `Tu es un correcteur de transcription vocale spécialisé immobilier.

TRANSCRIPTION BRUTE:
"${transcript}"

MISSION:
1. Supprimer TOUTES les hésitations : euh, ah, ben, bah, hm, voilà, donc, du coup
2. Corriger les répétitions involontaires
3. Reformuler proprement en conservant 100% des informations
4. Adapter le vocabulaire immobilier si nécessaire
5. Produire un texte fluide et professionnel
6. Corriger les erreurs de reconnaissance vocale évidentes

EXEMPLES DE CORRECTIONS:
Brut   : "euh donc la cuisine elle fait euh environ 20m² avec euh un îlot central en marbre"
Propre : "Cuisine d'environ 20m² avec îlot central en marbre"

Brut   : "y'a aussi euh une cave à vin et euh voilà le garage il fait 40m² avec euh deux places"
Propre : "Cave à vin et garage de 40m² avec deux places de stationnement"

Brut   : "la vue elle est vraiment exceptionnelle on voit on voit toute la vallée depuis le salon"
Propre : "Vue exceptionnelle sur la vallée depuis le salon"

Brut   : "le bien il a été rénové en 2022 tous les réseaux électricité plomberie tout ça"
Propre : "Rénovation complète en 2022 incluant électricité et plomberie"

RETOURNE UNIQUEMENT le texte corrigé, sans guillemets, sans commentaire, sans explication.`;
```

---

## UI DICTÉE VOCALE

```jsx
{/* Bouton dictée */}
<button
  onClick={startVoice}
  style={{
    padding: "10px 16px",
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 8,
    border: `1px solid ${isRecording ? "#FF444440" : "#C8793A40"}`,
    background: isRecording ? "#3A0A0A" : "#C8793A20",
    color: isRecording ? "#FF4444" : "#C8793A",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  }}
>
  {isRecording ? "⏹ Arrêter" : "🎤 Dicter"}
</button>

{/* Indicateur enregistrement */}
{isRecording && (
  <div style={{
    fontSize: 11,
    color: "#FF4444",
    display: "flex",
    alignItems: "center",
    gap: 6,
  }}>
    <span style={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "#FF4444",
      display: "inline-block",
      animation: "blink 0.8s infinite",
    }}/>
    Enregistrement en cours...
  </div>
)}

{/* Indicateur transcription */}
{transcribing && (
  <div style={{fontSize: 11, color: "#00D4E8"}}>
    Transcription IA en cours...
  </div>
)}

{/* Erreur */}
{voiceError && (
  <div style={{
    fontSize: 11,
    color: "#E84A4A",
    padding: "6px 10px",
    background: "#E84A4A15",
    borderRadius: 6,
    border: "1px solid #E84A4A30",
  }}>
    {voiceError}
  </div>
)}
```

---

## CLEANUP ET MÉMOIRE

```javascript
// Nettoyer la reconnaissance à la fermeture du composant
useEffect(() => {
  return () => {
    mountedRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };
}, []);

// Arrêter si navigation
useEffect(() => {
  if (step !== "notes" && isRecording) {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  }
}, [step]);
```

---

## ÉTATS VOCAUX

```javascript
// States nécessaires
const [isRecording, setIsRecording]     = useState(false);
const [transcribing, setTranscribing]   = useState(false);
const [voiceError, setVoiceError]       = useState("");

// Refs
const recognitionRef = useRef(null);
```

---

## SCÉNARIOS D'UTILISATION

### Sur le terrain (Xiaomi 14T)
```
1. Agent arrive dans le bien
2. Prend les photos avec l'app caméra
3. Dans Zaymmo → ajoute les photos
4. Lance l'analyse
5. Vérifie les infos pré-remplies
6. Va dans Notes → clique Dicter
7. Parle en marchant dans le bien :
   "La cuisine fait 25m² avec îlot central granit,
    vue sur le jardin sud, robinetterie haut de gamme,
    rénovée en 2023, cave à vin 12m² en sous-sol,
    chauffage plancher chauffant dans toutes les pièces"
8. Clique Arrêter → ZayZay nettoie
9. Génère l'annonce enrichie
```

### Notes complémentaires
```
Peut utiliser plusieurs fois la dictée
Chaque dictée s'ajoute à la suite
Peut aussi écrire manuellement entre les dictées
Le bloc notes final alimente le prompt d'annonce
```

---

## PRÉPARATION PHASE 2 — VOIX ELEVENLABS

```javascript
// Architecture préparée pour TTS Phase 2

// Phase 2 : ZayZay répond vocalement
async function zayZaySpeak(text) {
  // TODO Phase 2 : Intégration ElevenLabs
  // const audio = await elevenlabs.textToSpeech({
  //   text: text,
  //   voice_id: "zayzay_voice_id",
  //   model_id: "eleven_multilingual_v2",
  // });
  // audio.play();
  console.log("Phase 2: ZayZay dira:", text);
}

// Phase 2 : Commandes vocales globales
async function startGlobalVoiceCommands() {
  // TODO Phase 2 : Commandes vocales pour toute l'app
  // "ZayZay, analyse les photos"
  // "ZayZay, génère l'annonce en luxembourgeois"
  // "ZayZay, exporte sur Athome"
  // "ZayZay, sauvegarde l'annonce"
}

// Phase 2 : Clone vocal agent
// L'agent enregistre sa voix une fois
// ZayZay utilise sa voix pour les présentations vidéo
```

---

## BONNES PRATIQUES DICTÉE

```
POUR L'AGENT :
✅ Parler clairement et pas trop vite
✅ Donner les chiffres et mesures clairement
✅ Mentionner les équipements spéciaux
✅ Décrire l'ambiance et les atouts invisibles
✅ Citer les rénovations récentes avec années
✅ Mentionner le voisinage et l'environnement

À ÉVITER :
❌ Parler en fond sonore fort (chantier, rue)
❌ Chuchoter ou parler trop loin du micro
❌ Mélanger les langues dans une même dictée
❌ Donner des infos déjà dans la fiche bien
```
