---
name: zaymmo-error-recovery
description: Gestion des erreurs et récupération de Zaymmo. Chaque erreur possible est gérée proprement sans crash. L'agent voit toujours un message clair et peut continuer son travail.
---

# Zaymmo Error Recovery

## PRINCIPE

Zaymmo ne crashe jamais — il récupère toujours élégamment.
Chaque erreur = message clair + action possible pour l'agent.

---

## CATALOGUE D'ERREURS

```javascript
const ERRORS = {
  // API
  API_KEY_MISSING:    "Clé API manquante. Configurez VITE_ANTHROPIC_KEY dans Vercel.",
  API_KEY_INVALID:    "Clé API invalide. Vérifiez votre clé Anthropic.",
  API_QUOTA:          "Crédit API épuisé. Rechargez votre compte sur console.anthropic.com",
  API_TIMEOUT:        "Délai dépassé. Vérifiez votre connexion internet.",
  API_RATE_LIMIT:     "Trop de requêtes. Attendez 30 secondes et réessayez.",
  API_SERVER:         "Erreur serveur Anthropic. Réessayez dans quelques minutes.",

  // Images
  IMG_CORS:           "Image non accessible depuis Zaymmo. Téléchargez la photo directement.",
  IMG_FORMAT:         "Format non supporté. Utilisez JPG ou PNG.",
  IMG_TOO_LARGE:      "Image trop volumineuse. La compression a échoué.",
  IMG_LOAD_FAILED:    "Impossible de charger cette image. Vérifiez l'URL.",

  // Stockage
  STORAGE_FULL:       "Stockage plein. Supprimez des anciens biens dans l'historique.",
  STORAGE_CORRUPTED:  "Données corrompues. Certaines entrées ont été réinitialisées.",

  // Réseau
  NETWORK_OFFLINE:    "Pas de connexion internet. Vérifiez votre réseau.",
  NETWORK_SLOW:       "Connexion lente détectée. L'analyse peut prendre plus de temps.",

  // Analyse
  NO_PHOTOS:          "Ajoutez au moins une photo pour analyser.",
  ALL_PHOTOS_FAILED:  "Aucune photo n'a pu être analysée. Vérifiez les images.",
  PARSE_ERROR:        "Erreur de traitement. Réessayez l'analyse.",

  // Auth
  AUTH_FAILED:        "Mot de passe incorrect.",
  SESSION_EXPIRED:    "Session expirée. Reconnectez-vous.",
};
```

---

## COMPOSANT ERREUR

```jsx
function ErrorMessage({ message, onRetry, onDismiss }) {
  if (!message) return null;

  return (
    <div style={{
      padding: "10px 14px",
      background: "#1A0808",
      border: "1px solid #E84A4A30",
      borderRadius: 8,
      marginBottom: 12,
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      animation: "fadeUp 0.2s ease",
    }}>
      <div style={{ fontSize: 16, flexShrink: 0 }}>⚠️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: "#E84A4A", lineHeight: 1.5 }}>
          {message}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {onRetry && (
            <button onClick={onRetry}
              style={{
                fontSize: 10, padding: "4px 10px", borderRadius: 4,
                background: "#E84A4A20", color: "#E84A4A",
                border: "1px solid #E84A4A30", cursor: "pointer",
              }}>
              Réessayer
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss}
              style={{
                fontSize: 10, padding: "4px 10px", borderRadius: 4,
                background: "transparent", color: "#3A2A1A",
                border: "1px solid #1A1410", cursor: "pointer",
              }}>
              Ignorer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## RÉCUPÉRATION API

```javascript
async function callClaudeWithRecovery(messages, system, retries = 2) {
  const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY;

  if (!API_KEY) throw new Error(ERRORS.API_KEY_MISSING);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({ model: "claude-haiku-4-5", max_tokens: 4000, system, messages }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (resp.status === 401) throw new Error(ERRORS.API_KEY_INVALID);
      if (resp.status === 429) throw new Error(ERRORS.API_RATE_LIMIT);
      if (resp.status === 529) throw new Error(ERRORS.API_QUOTA);
      if (!resp.ok)            throw new Error(ERRORS.API_SERVER);

      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      return JSON.parse(text.replace(/```json|```/g, "").trim());

    } catch (err) {
      if (err.name === "AbortError") throw new Error(ERRORS.API_TIMEOUT);
      if (attempt === retries) throw err;

      // Attendre avant de réessayer
      await sleep(1000 * (attempt + 1));
    }
  }
}
```

---

## RÉCUPÉRATION STOCKAGE

```javascript
function safeStorage(action, key, data) {
  try {
    if (action === "get") {
      return JSON.parse(localStorage.getItem(key) || "[]");
    }
    if (action === "set") {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    }
  } catch (err) {
    if (err.name === "QuotaExceededError") {
      setError(ERRORS.STORAGE_FULL);
      // Tenter de libérer de l'espace
      const history = JSON.parse(localStorage.getItem("zaymmo_history") || "[]");
      if (history.length > 10) {
        localStorage.setItem("zaymmo_history", JSON.stringify(history.slice(0, 10)));
        // Réessayer
        try {
          localStorage.setItem(key, JSON.stringify(data));
          return true;
        } catch { return false; }
      }
    }
    return null;
  }
}
```

---

## RÉCUPÉRATION RÉSEAU

```javascript
// Détecter connexion
function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Afficher bannière si hors ligne
{!isOnline && (
  <div style={{
    background: "#3A2A1A",
    padding: "8px 16px",
    fontSize: 11,
    color: "#E8B44A",
    textAlign: "center",
  }}>
    Hors ligne — Les analyses nécessitent une connexion internet
  </div>
)}
```

---

## VALIDATION AVANT ANALYSE

```javascript
function validateBeforeAnalysis() {
  const errors = [];

  if (!photos.length) errors.push(ERRORS.NO_PHOTOS);
  if (!import.meta.env.VITE_ANTHROPIC_KEY) errors.push(ERRORS.API_KEY_MISSING);
  if (!navigator.onLine) errors.push(ERRORS.NETWORK_OFFLINE);

  return errors;
}
```
