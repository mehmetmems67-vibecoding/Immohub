---
name: zaymmo-offline-pwa
description: Mode hors-ligne et PWA de Zaymmo. Lire avant toute modification du service worker ou de l'installation. Permet à Zaymmo de fonctionner partiellement sans connexion et d'être installée comme une app native.
---

# Zaymmo Offline & PWA

## PRINCIPE

Zaymmo est installable comme une app native (PWA) sans passer par les stores.
Certaines fonctionnalités restent disponibles hors-ligne (consultation),
mais l'analyse IA nécessite toujours une connexion.

---

## MANIFEST PWA

```json
{
  "name": "Zaymmo - AI Vision Immobilier",
  "short_name": "Zaymmo",
  "description": "Plateforme IA pour agents immobiliers",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#080808",
  "theme_color": "#C8793A",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## SERVICE WORKER BASIQUE

```javascript
// public/sw.js
const CACHE_NAME = "zaymmo-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  // Network first pour API — Cache first pour assets statiques
  if (event.request.url.includes("api.anthropic.com")) {
    return; // Ne jamais cacher les appels API
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
```

---

## ENREGISTREMENT SERVICE WORKER

```javascript
// Dans App.jsx — au chargement
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("Service Worker enregistré"))
      .catch(err => console.error("Erreur SW:", err));
  }
}, []);
```

---

## DÉTECTION ET INSTALLATION PWA

```javascript
function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  }

  return { canInstall: !!installPrompt, isInstalled, install };
}
```

---

## BANNIÈRE INSTALLATION

```jsx
function InstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(
    localStorage.getItem("zaymmo_install_dismissed") === "true"
  );

  if (!canInstall || dismissed) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#0C0A08", borderTop: "1px solid #C8793A30",
      padding: "12px 16px", display: "flex", alignItems: "center",
      justifyContent: "space-between", zIndex: 1500,
    }}>
      <div style={{ fontSize: 11, color: "#E8D8C0" }}>
        Installez Zaymmo sur votre écran d'accueil
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={install}
          style={{ fontSize: 11, padding: "6px 14px", background: "#C8793A", color: "#050404", borderRadius: 4 }}>
          Installer
        </button>
        <button onClick={() => {
          setDismissed(true);
          localStorage.setItem("zaymmo_install_dismissed", "true");
        }} style={{ fontSize: 11, color: "#3A2A1A", background: "transparent" }}>
          ×
        </button>
      </div>
    </div>
  );
}
```

---

## GESTION HORS-LIGNE

```javascript
// Ce qui fonctionne hors-ligne :
const OFFLINE_CAPABLE = [
  "Consulter l'historique",
  "Consulter les annonces sauvegardées",
  "Voir les contacts CRM",
  "Voir l'agenda des visites",
  "Imprimer les fiches déjà générées",
];

// Ce qui nécessite une connexion :
const ONLINE_REQUIRED = [
  "Analyser des photos (API Anthropic)",
  "Générer une annonce (API Anthropic)",
  "Dictée vocale + nettoyage IA",
  "ZayZay bot",
  "Export QR code (API externe)",
];

// Bannière mode hors-ligne
function OfflineBanner({ isOnline }) {
  if (isOnline) return null;

  return (
    <div style={{
      background: "#3A2A1A", padding: "6px 16px",
      fontSize: 10, color: "#E8B44A", textAlign: "center",
    }}>
      Mode hors-ligne — Consultation uniquement, analyses indisponibles
    </div>
  );
}
```

---

## STOCKAGE PRIORITAIRE HORS-LIGNE

```javascript
// S'assurer que les données critiques sont toujours en localStorage
// (déjà le cas par défaut — pas de dépendance réseau pour la lecture)

function ensureOfflineDataReady() {
  return {
    history: getHistory(),
    saved: getSaved(),
    contacts: getContacts(),
    visits: getVisits(),
  };
}
```

---

## VITE CONFIG POUR PWA (référence)

```javascript
// vite.config.js — ajout si plugin PWA utilisé
// import { VitePWA } from 'vite-plugin-pwa'
//
// plugins: [
//   VitePWA({
//     registerType: 'autoUpdate',
//     manifest: { /* voir manifest ci-dessus */ }
//   })
// ]
```
