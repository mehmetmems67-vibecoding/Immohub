---
name: zaymmo-analytics
description: Système d'analytics interne Zaymmo. Lire avant toute modification du tracking d'usage. Mesure l'utilisation de l'app pour identifier les fonctionnalités les plus utilisées et les points de friction.
---

# Zaymmo Analytics

## PRINCIPE

Analytics 100% local — pas d'envoi externe (Google Analytics, etc.)
Respecte la vie privée tout en donnant de la visibilité sur l'usage.

---

## ÉVÉNEMENTS TRACKÉS

```javascript
const ANALYTICS_KEY = "zaymmo_analytics";

const EVENT_TYPES = {
  // Pipeline
  photos_added:        "Photo ajoutée",
  analysis_started:    "Analyse lancée",
  analysis_completed:  "Analyse terminée",
  analysis_failed:     "Analyse échouée",
  fields_corrected:    "Champs corrigés",
  notes_added:         "Notes ajoutées",
  voice_used:          "Dictée vocale utilisée",
  annonce_generated:   "Annonce générée",
  annonce_revised:     "Annonce révisée",
  annonce_saved:       "Annonce sauvegardée",
  annonce_exported:    "Annonce exportée",

  // Navigation
  history_opened:      "Historique ouvert",
  saved_opened:        "Sauvegardées ouvert",
  zayzay_opened:       "ZayZay ouvert",

  // Erreurs
  error_occurred:      "Erreur survenue",
};
```

---

## FONCTION DE TRACKING

```javascript
function trackEvent(eventType, metadata = {}) {
  try {
    const events = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "[]");
    events.push({
      type: eventType,
      metadata,
      timestamp: new Date().toISOString(),
    });
    // Garder seulement les 500 derniers événements
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events.slice(-500)));
  } catch (e) {
    // Ne jamais bloquer l'app si analytics échoue
    console.error("Analytics error:", e);
  }
}

// Usage dans le code
trackEvent("analysis_started", { photoCount: photos.length });
trackEvent("annonce_generated", { langue: meta.langAnnonce, type: meta.type });
```

---

## CALCUL MÉTRIQUES D'USAGE

```javascript
function getUsageMetrics() {
  const events = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "[]");

  const countByType = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  // Taux de conversion pipeline
  const analysisStarted = countByType.analysis_started || 0;
  const annonceGenerated = countByType.annonce_generated || 0;
  const annonceSaved = countByType.annonce_saved || 0;

  return {
    totalEvenements: events.length,
    parType: countByType,
    tauxConversionAnnonce: analysisStarted > 0
      ? ((annonceGenerated / analysisStarted) * 100).toFixed(0)
      : 0,
    tauxSauvegarde: annonceGenerated > 0
      ? ((annonceSaved / annonceGenerated) * 100).toFixed(0)
      : 0,
    utilisationVocale: countByType.voice_used || 0,
    utilisationZayZay: countByType.zayzay_opened || 0,
  };
}
```

---

## TEMPS MOYEN PAR ÉTAPE

```javascript
function trackStepDuration(step) {
  const key = `zaymmo_step_start_${step}`;
  sessionStorage.setItem(key, Date.now().toString());
}

function getStepDuration(step) {
  const key = `zaymmo_step_start_${step}`;
  const start = sessionStorage.getItem(key);
  if (!start) return null;

  const duration = Date.now() - parseInt(start);
  trackEvent("step_duration", { step, durationMs: duration });
  return duration;
}
```

---

## DÉTECTION POINTS DE FRICTION

```javascript
function getFrictionPoints() {
  const events = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "[]");

  const errors = events.filter(e => e.type === "error_occurred");
  const failedAnalysis = events.filter(e => e.type === "analysis_failed");

  const errorsByContext = errors.reduce((acc, e) => {
    const ctx = e.metadata?.context || "unknown";
    acc[ctx] = (acc[ctx] || 0) + 1;
    return acc;
  }, {});

  return {
    totalErrors: errors.length,
    failedAnalysisCount: failedAnalysis.length,
    topErrorContexts: Object.entries(errorsByContext)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
  };
}
```

---

## COMPOSANT DASHBOARD ANALYTICS (admin)

```jsx
function AnalyticsDashboard() {
  const metrics = getUsageMetrics();
  const friction = getFrictionPoints();

  return (
    <Card>
      <ST color="#00D4E8">ANALYTICS D'USAGE</ST>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <MetricBox label="Taux conversion annonce" value={`${metrics.tauxConversionAnnonce}%`} color="#4AE88A" />
        <MetricBox label="Taux sauvegarde" value={`${metrics.tauxSauvegarde}%`} color="#C8793A" />
        <MetricBox label="Usage vocal" value={metrics.utilisationVocale} color="#00D4E8" />
        <MetricBox label="Usage ZayZay" value={metrics.utilisationZayZay} color="#E8B44A" />
      </div>

      {friction.totalErrors > 0 && (
        <div style={{
          padding: 10, background: "#E84A4A10", borderRadius: 8,
          border: "1px solid #E84A4A30",
        }}>
          <div style={{ fontSize: 10, color: "#E84A4A", letterSpacing: 1 }}>
            POINTS DE FRICTION DÉTECTÉS
          </div>
          {friction.topErrorContexts.map(([ctx, count]) => (
            <div key={ctx} style={{ fontSize: 11, color: "#8A7060", padding: "4px 0" }}>
              {ctx}: {count} occurrence(s)
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function MetricBox({ label, value, color }) {
  return (
    <div style={{ background: "#0A0A0A", borderRadius: 8, padding: 10 }}>
      <div style={{ fontSize: 18, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 9, color: "#3A2A1A" }}>{label}</div>
    </div>
  );
}
```

---

## NETTOYAGE PÉRIODIQUE

```javascript
// Nettoyer les événements de plus de 90 jours
function cleanOldAnalytics() {
  const events = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "[]");
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const filtered = events.filter(e => new Date(e.timestamp) > cutoff);
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(filtered));
}
```
