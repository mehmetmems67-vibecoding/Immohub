---
name: zaymmo-architecture
description: Architecture technique complète de Zaymmo. Lire OBLIGATOIREMENT avant toute refonte, ajout de fonctionnalité, modification du pipeline ou création de nouveau composant. Contient la structure du code, les patterns, le state management, les fonctions clés et les règles d'organisation.
---

# Zaymmo Architecture

## STACK TECHNIQUE

```
Frontend    : React 18 + Vite
Déploiement : Vercel (auto-deploy depuis GitHub main)
Repo        : mehmetmems67-vibecoding/Immohub
URL prod    : immohub-black.vercel.app
Fichier     : src/App.jsx (fichier unique)
API IA      : Anthropic Claude (claude-haiku-4-5)
Stockage    : localStorage (pas de backend)
Auth        : sessionStorage
```

---

## STRUCTURE DU FICHIER APP.JSX

```
1. Imports React
2. Constantes globales (STORAGE_KEY, HISTORY_KEY, etc.)
3. Données statiques (I18N, PLATFORMS, CURRENCIES, LANG_INSTRUCTIONS)
4. Fonctions utilitaires (sleep, urlToB64, etc.)
5. Composants UI réutilisables (Card, ST, MF, Steps, etc.)
6. Fonction App principale (Login)
7. Fonction Zaymmo principale (app après login)
8. Export default App
```

---

## CONSTANTES STORAGE

```javascript
const STORAGE_KEY   = "zaymmo_users";
const HISTORY_KEY   = "zaymmo_history";
const SESSION_KEY   = "zaymmo_session";
const SAVED_KEY     = "zaymmo_saved";
```

---

## COULEURS (objet C)

```javascript
const C = {
  bg:   "#080808",
  surf: "#0C0A08",
  brd:  "#1A1410",
  text: "#E8D8C0",
  muted:"#3A2A1A",
  acc:  "#C8793A",    // cuivre principal
  cyan: "#00D4E8",    // cyan glacé (IA/drone)
  gold: "#C8793A",    // alias acc
  green:"#4AE88A",    // succès
  err:  "#E84A4A",    // erreur
};
```

---

## META — Structure complète

```javascript
const defaultMeta = {
  // Localisation
  pays: "fr",
  devise: "EUR",
  langAnnonce: "fr",

  // Bien
  type: "Appartement",
  surface: "",
  pieces: "",
  chambres: "",
  sdb: "",
  wc: "",
  terrain: "",
  etage: "",
  annee: "",

  // Localisation bien
  adresse: "",
  code_postal: "",
  ville: "",

  // Prix
  prix: "",
  charges: "",

  // Diagnostics
  dpe: "Non renseigne",
  ges: "Non renseigne",
  chauffage: "Collectif gaz",
  exposition: "Non renseignee",

  // Equipements
  cave: false,
  parking: false,
  terrasse: false,
  balcon: false,
  jardin: false,
  ascenseur: false,
  double_vitrage: false,
  triple_vitrage: false,
  fibre: false,
  piscine: false,
  gardien: false,
  digicode: false,
  cellier: false,
  buanderie: false,
  garage: false,

  // Caracteristiques supplementaires
  cheminee: false,
  sous_sol: "",
  dressing: false,
  poele_granules: false,
  chambre_parentale: false,

  // Consommation energetique
  conso_kwh_n1: "",
  conso_eur_n1: "",
  conso_kwh_n2: "",
  conso_eur_n2: "",

  // Notes agent
  notes_agent: "",
};
```

---

## STATES PRINCIPAUX (Zaymmo function)

```javascript
// Navigation
const [homepage, setHomepage]     = useState(true);
const [step, setStep]             = useState("photos");
const [showHistory, setShowHistory] = useState(false);
const [showSaved, setShowSaved]   = useState(false);
const [showAdmin, setShowAdmin]   = useState(false);

// Données bien
const [meta, setMeta]             = useState({...defaultMeta});
const [photos, setPhotos]         = useState([]);
const [analyses, setAnal]         = useState([]);
const [synth, setSynth]           = useState(null);

// Annonce
const [annonce, setAnnonce]       = useState(null);
const [annonces, setAnnonces]     = useState({});
const [activeLang, setActiveLang] = useState("fr");
const [revHist, setRevHist]       = useState([]);
const [revMode, setRevMode]       = useState(false);
const [revInstr, setRevInstr]     = useState("");

// UI
const [loading, setLoading]       = useState(false);
const [loadMsg, setLoadMsg]       = useState("");
const [prog, setProg]             = useState(0);
const [error, setError]           = useState(null);
const [copied, setCopied]         = useState(false);

// Historique & Sauvegarde
const [history, setHistory]       = useState(() => getHistory());
const [savedList, setSavedList]   = useState(() => getSaved());

// Vocal
const [isRecording, setIsRecording] = useState(false);
const [transcribing, setTranscribing] = useState(false);
const [voiceError, setVoiceError] = useState("");

// Options
const [includeAIFindings, setIncludeAIFindings] = useState(false);
const [multiLangMode, setMultiLangMode] = useState(false);

// Refs
const mountedRef = useRef(true);
const recognitionRef = useRef(null);
```

---

## PIPELINE PRINCIPAL

```
ÉTAPE 1 — photos
  → L'agent ajoute des photos (galerie, URL, caméra)
  → Bouton "Analyser" lance runAnalysis()
  → Auto-navigation vers step "fiche"

ÉTAPE 2 — fiche
  → IA a pré-rempli les champs depuis synth
  → Agent vérifie et corrige
  → Bouton "Notes agent" → step "notes"
  → Bouton "Analyser encore" si besoin

ÉTAPE 3 — notes
  → Zone texte libre pour infos supplémentaires
  → Dictée vocale avec nettoyage IA
  → Bouton "Générer l'annonce" → genAnnonce()
  → Auto-navigation vers step "annonce"

ÉTAPE 4 — annonce
  → Annonce générée affichée
  → Mode révision (raccourcir, reformuler, etc.)
  → Multi-langue possible
  → Bouton Sauvegarder
  → Bouton "Aperçu plateforme" → step "apercu"

ÉTAPE 5 — apercu
  → Aperçu par plateforme (LeBonCoin, Athome, etc.)
  → Export avec copie clipboard
  → Timeline du bien

ÉTAPE 6 — fiche_interne
  → Fiche pro CONFIDENTIEL
  → Fiche client présentation visite
  → Impression
```

---

## FONCTIONS CLÉS

### setM — Mise à jour meta
```javascript
function setM(key, value) {
  setMeta(prev => ({...prev, [key]: value}));
}
```

### getHistory / saveHistory
```javascript
function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
}
function saveHistory(data) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
}
```

### getSaved / saveSaved
```javascript
function getSaved() {
  return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
}
```

### saveAnnonce — Sauvegarde explicite
```javascript
function saveAnnonce() {
  if (!annonce || !synth) return;
  const saved = getSaved();
  const entry = {
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
    user: currentUser?.name || "Admin",
    label: (meta.type||"Bien") + " - " + (meta.ville||"NC") + " - " + new Date().toLocaleDateString("fr-FR"),
    meta: {...meta},
    synth: synth,
    annonce: annonce,
    annonces: {...annonces},
    photos_urls: photos.filter(p=>p.preview).map(p=>p.preview).slice(0,3),
  };
  const updated = [entry, ...saved].slice(0, 30);
  localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  setSavedList(updated);
}
```

### resetAll — Nouvelle annonce
```javascript
function resetAll() {
  setSynth(null);
  setAnnonce(null);
  setAnal([]);
  setPhotos([]);
  setAnnonces({});
  setRevHist([]);
  setStep("photos");
  setMeta({...defaultMeta});
  setIncludeAIFindings(false);
  setHomepage(false);
}
```

### callClaude — Appel API
```javascript
async function callClaude(messages, system = "", retries = 2) {
  const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 4000,
          system,
          messages,
        }),
      });
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch(e) {
      if (attempt === retries) throw e;
      await sleep(1000 * (attempt + 1));
    }
  }
}
```

### urlToB64 — Image URL vers base64
```javascript
async function urlToB64(url) {
  // Méthode 1 : Canvas (pour images sans CORS)
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((res, rej) => {
      img.onload = res; img.onerror = rej;
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.min(img.naturalWidth, 1024);
    canvas.height = Math.round(img.naturalHeight * (canvas.width / img.naturalWidth));
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return dataUrl.split(",")[1];
  } catch(canvasErr) {
    // Méthode 2 : FileReader fallback
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result.split(",")[1]);
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });
  }
}
```

---

## PRÉ-REMPLISSAGE DEPUIS SYNTH

```javascript
// Après runAnalysis() — injecter synth dans meta
function prefillFromSynth(s) {
  setMeta(prev => ({
    ...prev,
    surface:   s.surface_totale_estimee?.toString().replace(/[^0-9]/g,"") || prev.surface,
    pieces:    s.nb_pieces?.toString() || prev.pieces,
    chambres:  s.nb_chambres?.toString() || prev.chambres,
    dpe:       ["A","B","C","D","E","F","G"].includes(s.dpe_estime) ? s.dpe_estime : prev.dpe,
    chauffage: s.chauffage_detecte || prev.chauffage,
    // Equipements détectés
    terrasse:  s.equipements_detectes?.includes("terrasse") || prev.terrasse,
    garage:    s.equipements_detectes?.includes("garage") || prev.garage,
    jardin:    s.equipements_detectes?.includes("jardin") || prev.jardin,
    cave:      s.equipements_detectes?.includes("cave") || prev.cave,
    piscine:   s.equipements_detectes?.includes("piscine") || prev.piscine,
  }));
}
```

---

## STRUCTURE SYNTH (retour analyse IA)

```javascript
{
  score_global: 7.8,           // /10
  etat_global: "très bon",
  surface_totale_estimee: "~185m2",
  nb_pieces: 7,
  nb_chambres: 3,
  dpe_estime: "B",
  chauffage_detecte: "Individuel gaz",
  style_dominant: "Moderne contemporain",
  points_forts: ["Luminosité", "Volumes", "Cuisine équipée"],
  points_faibles: ["Surface exacte manquante"],
  retouches_home_staging: ["Dépersonnaliser", "Uniformiser palette"],
  equipements_detectes: ["garage", "terrasse", "jardin"],
  fourchette_prix: "285000-360000",
  analyse_par_piece: [...],
  recommandations_agent: "...",
}
```

---

## STRUCTURE ANNONCE (retour génération)

```javascript
{
  titre_principal: "Maison d'Exception 170m² — Saint-Ail",
  description_courte: "...",   // 120-150 mots
  description_longue: "...",   // 280-320 mots
  points_cles: ["...", "..."], // 5-7 points
  hashtags: ["#immobilier", "#maison"],
  call_to_action: "Contactez Admin au 06..."
}
```

---

## RÈGLES D'ARCHITECTURE STRICTES

1. **Fichier unique** — tout dans App.jsx, pas de séparation en composants externes
2. **localStorage uniquement** — pas de base de données, pas de backend
3. **sessionStorage pour auth** — clé zaymmo_session
4. **Clé API via .env** — VITE_ANTHROPIC_KEY uniquement, jamais hardcodée
5. **Modèle** — claude-haiku-4-5 pour économiser les crédits
6. **try/finally** — TOUJOURS setLoading(false) dans le finally
7. **mountedRef** — vérifier mountedRef.current avant tout setState async
8. **Max 50 entrées historique** — slice(0,50) à chaque sauvegarde
9. **Max 30 annonces sauvegardées** — slice(0,30)
10. **Max photos** — 15 photos maximum par analyse
11. **Compression images** — MAX 1024px avant envoi API
12. **sleep entre photos** — await sleep(300) entre chaque analyse photo

---

## VARIABLES D'ENVIRONNEMENT

```
VITE_ANTHROPIC_KEY = sk-ant-api...  (dans Vercel Environment Variables)
```

---

## DÉPLOIEMENT

```
Branche   : main
Build cmd : npm run build
Output    : dist/
Node      : 18+
Framework : Vite
```
