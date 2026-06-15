---
name: zaymmo-performance
description: Optimisation des performances de Zaymmo. Lire avant toute modification susceptible d'impacter la vitesse, la mémoire ou la réactivité de l'app. Garantit une expérience fluide sur mobile même avec connexion lente.
---

# Zaymmo Performance

## RÈGLES FONDAMENTALES

```
1. Images compressées AVANT envoi API (max 1024px, qualité 85%)
2. Blob URLs révoqués après usage (URL.revokeObjectURL)
3. Pause 300ms entre chaque analyse photo (rate limiting)
4. localStorage limité (50 historique, 30 sauvegardés)
5. Pas de re-renders inutiles (useCallback, useMemo si nécessaire)
6. Lazy loading pour les listes longues
7. Timeout 60s sur tous les appels API
8. sleep() défini AVANT tout usage dans le code
```

---

## COMPRESSION IMAGES

```javascript
const MAX_IMAGE_SIZE = 1024; // px
const JPEG_QUALITY   = 0.85; // 85%

async function compressImage(source) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise((res, rej) => { img.onload=res; img.onerror=rej; img.src=source; });

  let { naturalWidth: w, naturalHeight: h } = img;
  if (w > MAX_IMAGE_SIZE || h > MAX_IMAGE_SIZE) {
    if (w > h) { h = Math.round(h * MAX_IMAGE_SIZE / w); w = MAX_IMAGE_SIZE; }
    else        { w = Math.round(w * MAX_IMAGE_SIZE / h); h = MAX_IMAGE_SIZE; }
  }

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY).split(",")[1];
}
```

---

## GESTION MÉMOIRE

```javascript
// Révoquer les blob URLs après usage
function addPhoto(file) {
  const blobUrl = URL.createObjectURL(file);
  setPhotos(prev => [...prev, { id: Date.now().toString(), file, preview: blobUrl }]);
}

function removePhoto(id) {
  setPhotos(prev => {
    const photo = prev.find(p => p.id === id);
    if (photo?.preview?.startsWith("blob:")) URL.revokeObjectURL(photo.preview);
    return prev.filter(p => p.id !== id);
  });
}

// Cleanup au unmount
useEffect(() => {
  return () => {
    photos.forEach(p => {
      if (p.preview?.startsWith("blob:")) URL.revokeObjectURL(p.preview);
    });
    mountedRef.current = false;
  };
}, []);
```

---

## SLEEP ET RATE LIMITING

```javascript
// TOUJOURS définir sleep en haut du fichier avant tout usage
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Usage dans runAnalysis
for (let i = 0; i < photos.length; i++) {
  // ... analyse photo i
  await sleep(300); // Pause entre chaque photo
}
```

---

## LAZY LOADING HISTORIQUE

```javascript
// Afficher seulement les 10 premières entrées
// Charger plus sur demande
const [visibleHistory, setVisibleHistory] = useState(10);

{history.slice(0, visibleHistory).map(h => (
  <HistoryCard key={h.id} h={h} />
))}

{history.length > visibleHistory && (
  <button onClick={() => setVisibleHistory(v => v + 10)}
    style={{ fontSize: 11, color: "#C8793A", background: "transparent", border: "none" }}>
    Voir plus ({history.length - visibleHistory} restants)
  </button>
)}
```

---

## MÉTRIQUES PERFORMANCE

```javascript
// Mesurer le temps d'analyse
async function runAnalysisWithMetrics() {
  const start = Date.now();
  await runAnalysis();
  const duration = Date.now() - start;

  // Sauvegarder pour amélioration continue
  const perf = JSON.parse(localStorage.getItem("zaymmo_perf") || "[]");
  perf.push({ duration, photos: photos.length, date: new Date().toISOString() });
  localStorage.setItem("zaymmo_perf", JSON.stringify(perf.slice(-20)));
}
```

---

## CHECKLIST PERFORMANCE

```
Avant chaque livraison vérifier :
✓ Pas de console.log() en production
✓ Images compressées (MAX 1024px)
✓ Blob URLs révoqués
✓ sleep(300) entre photos
✓ Timeout 60s sur les appels API
✓ localStorage limité (slice)
✓ mountedRef vérifié avant setState async
✓ try/finally sur tous les appels API
✓ Pas de fetch sans AbortController
```
