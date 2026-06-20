---
name: zaymmo-api-exposition
description: Préparation de l'exposition API de Zaymmo. Lire avant toute modification de l'architecture de données. Prépare le code pour qu'il soit facilement exposable en API pour intégrations futures (Phase 3 SaaS).
---

# Zaymmo API Exposition

## PRINCIPE

Phase 1 : Pas d'API exposée — tout est local.
Phase 3 SaaS : Zaymmo expose une API pour intégrations tierces
(autres CRM, sites web d'agences, applications partenaires).

---

## STRUCTURE DE DONNÉES API-READY

```javascript
// Toutes les structures de données Zaymmo sont déjà pensées
// pour être exposables facilement en JSON via une future API REST

// Exemple : structure bien analysé — déjà 100% sérialisable JSON
const bienAPIReady = {
  id: "string",
  type: "string",
  surface: "number",
  prix: "number",
  ville: "string",
  // ... toutes les données meta sont des types primitifs simples
  // Aucune référence circulaire, aucune fonction stockée
};
```

---

## ENDPOINTS FUTURS PRÉVUS (Phase 3)

```javascript
// Documentation prévisionnelle des endpoints futurs

const FUTURE_API_ENDPOINTS = {
  // Authentification
  "POST /api/v1/auth/login": "Connexion agent",
  "POST /api/v1/auth/refresh": "Rafraîchir token",

  // Biens
  "GET    /api/v1/properties":      "Liste des biens analysés",
  "GET    /api/v1/properties/:id":  "Détail d'un bien",
  "POST   /api/v1/properties":      "Créer une analyse",
  "PUT    /api/v1/properties/:id":  "Mettre à jour un bien",
  "DELETE /api/v1/properties/:id":  "Supprimer un bien",

  // Annonces
  "POST /api/v1/properties/:id/listing":      "Générer une annonce",
  "POST /api/v1/properties/:id/listing/:lang":"Générer dans une langue",
  "GET  /api/v1/properties/:id/export/:platform": "Export plateforme",

  // Analyse
  "POST /api/v1/properties/:id/analyze": "Lancer analyse photos",

  // Contacts & CRM
  "GET  /api/v1/contacts":     "Liste des contacts",
  "POST /api/v1/contacts":     "Créer un contact",

  // Visites
  "GET  /api/v1/visits":       "Liste des visites",
  "POST /api/v1/visits":       "Planifier une visite",
};
```

---

## FORMAT DE RÉPONSE STANDARD (préparation)

```javascript
// Standard de réponse à adopter quand l'API sera créée
function apiResponse(success, data = null, error = null) {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString(),
    version: "1.0",
  };
}

// Exemple succès
// apiResponse(true, { property: {...} })

// Exemple erreur
// apiResponse(false, null, { code: "NOT_FOUND", message: "Bien introuvable" })
```

---

## AUTHENTIFICATION API FUTURE (JWT)

```javascript
// Architecture prévue pour Phase 3
const futureAuthSchema = {
  accessToken: "JWT court (15min)",
  refreshToken: "JWT long (7 jours)",
  scopes: ["read:properties", "write:properties", "read:contacts"],
};

// Headers prévus
// Authorization: Bearer <access_token>
// X-Agency-ID: <agency_id>
```

---

## WEBHOOK FUTURS (notifications)

```javascript
// Pour permettre aux agences d'intégrer Zaymmo à leurs outils
const FUTURE_WEBHOOKS = {
  "property.analyzed":   "Déclenché quand une analyse est terminée",
  "listing.generated":   "Déclenché quand une annonce est générée",
  "visit.scheduled":     "Déclenché quand une visite est planifiée",
  "property.exported":   "Déclenché quand une annonce est exportée",
};
```

---

## RATE LIMITING FUTUR

```javascript
const FUTURE_RATE_LIMITS = {
  starter:    { analysesParJour: 10,  apiCallsParMinute: 30 },
  pro:        { analysesParJour: 50,  apiCallsParMinute: 100 },
  enterprise: { analysesParJour: null, apiCallsParMinute: 500 }, // illimité
};
```

---

## EXPORT DONNÉES (déjà disponible Phase 1)

```javascript
// Export local déjà fonctionnel — base pour la future API
function exportAllDataAsJSON() {
  return {
    properties: getHistory(),
    saved: getSaved(),
    contacts: getContacts(),
    visits: getVisits(),
    profile: getProfile(),
    exportedAt: new Date().toISOString(),
  };
}

function downloadDataExport() {
  const data = exportAllDataAsJSON();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zaymmo_export_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## IMPORT DONNÉES (migration future backend)

```javascript
// Préparer la possibilité de migrer localStorage → backend
function importDataFromJSON(jsonData) {
  if (jsonData.properties) {
    localStorage.setItem("zaymmo_history", JSON.stringify(jsonData.properties));
  }
  if (jsonData.saved) {
    localStorage.setItem("zaymmo_saved", JSON.stringify(jsonData.saved));
  }
  if (jsonData.contacts) {
    localStorage.setItem("zaymmo_contacts", JSON.stringify(jsonData.contacts));
  }
  if (jsonData.profile) {
    localStorage.setItem("zaymmo_profile", JSON.stringify(jsonData.profile));
  }
}
```

---

## PRINCIPE DE COMPATIBILITÉ ASCENDANTE

```
Toute donnée stockée localStorage doit pouvoir être migrée
vers une future base de données sans perte ni transformation complexe.

Règles à respecter dans tout le code :
✓ Pas de fonctions stockées dans les objets de données
✓ Pas de références circulaires
✓ Dates toujours en format ISO 8601
✓ IDs toujours en string (compatibilité UUID future)
✓ Structures plates autant que possible
```
