---
name: zaymmo-rgpd-conformite
description: Conformité RGPD et protection des données de Zaymmo. Lire avant tout stockage de données personnelles, ajout de champ sensible ou modification du système d'authentification. Garantit la conformité légale européenne.
---

# Zaymmo RGPD & Conformité

## PRINCIPES FONDAMENTAUX

```
1. Minimisation    → Ne collecter que les données nécessaires
2. Localisation    → Données sur l'appareil de l'agent uniquement
3. Transparence    → L'agent sait ce qui est stocké
4. Contrôle        → L'agent peut supprimer à tout moment
5. Sécurité        → Pas de clé API exposée, auth sécurisée
```

---

## DONNÉES STOCKÉES — INVENTAIRE

```javascript
const DATA_INVENTORY = {
  // localStorage
  zaymmo_users: {
    contenu: "Comptes agents (nom, mot de passe hashé, rôle)",
    sensibilite: "MOYEN",
    retention: "Jusqu'à suppression manuelle",
    justification: "Nécessaire pour l'authentification",
  },
  zaymmo_history: {
    contenu: "Historique analyses (infos bien, scores IA, annonces)",
    sensibilite: "FAIBLE — données bien, pas données personnelles acheteurs",
    retention: "50 dernières entrées — FIFO",
    justification: "Confort agent — retrouver ses analyses",
  },
  zaymmo_saved: {
    contenu: "Annonces sauvegardées manuellement",
    sensibilite: "FAIBLE",
    retention: "30 entrées max — suppression manuelle",
    justification: "Confort agent — conserver les meilleures annonces",
  },
  zaymmo_session: {
    contenu: "Session active (nom, rôle)",
    sensibilite: "FAIBLE",
    retention: "sessionStorage — perdu à la fermeture",
    justification: "Authentification en cours",
    storage: "sessionStorage",
  },
  zaymmo_learning: {
    contenu: "Données d'apprentissage anonymisées",
    sensibilite: "TRÈS FAIBLE — agrégé, pas d'identification",
    retention: "Illimitée — données anonymes",
    justification: "Amélioration qualité IA",
  },
};
```

---

## DONNÉES PERSONNELLES À NE PAS STOCKER

```javascript
// INTERDIT de stocker dans Zaymmo :
const FORBIDDEN_DATA = [
  "Noms et coordonnées des acheteurs potentiels",
  "Numéros de téléphone des acheteurs",
  "Emails des acheteurs",
  "Données financières des acheteurs",
  "Documents d'identité",
  "Données de santé",
  "Opinions politiques ou religieuses",
];

// Si un agent entre ces données dans les notes → avertissement
function checkSensitiveData(text) {
  const patterns = [
    /\b\d{2}[-. ]?\d{2}[-. ]?\d{2}[-. ]?\d{2}[-. ]?\d{2}\b/, // Téléphone FR
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,   // Email
    /\b\d{13}\b/,                                               // Carte bancaire
  ];

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      return "⚠️ Données personnelles détectées. Ne stockez pas les coordonnées des acheteurs dans Zaymmo.";
    }
  }
  return null;
}
```

---

## SÉCURITÉ AUTHENTIFICATION

```javascript
// Hashage du mot de passe (côté client — sécurité minimale)
// Note: Pour production SaaS → utiliser bcrypt côté serveur
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "zaymmo_salt_2024");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Vérification
async function verifyPassword(password, hash) {
  const computed = await hashPassword(password);
  return computed === hash;
}

// Session sécurisée
function saveSession(user) {
  const session = {
    id: user.id,
    name: user.name,
    role: user.role,
    loginAt: new Date().toISOString(),
  };
  sessionStorage.setItem("zaymmo_session", JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem("zaymmo_session");
}
```

---

## TRANSMISSION API — DONNÉES ENVOYÉES

```javascript
// Ce qui est envoyé à l'API Anthropic :
const API_DATA_SENT = {
  images: "Photos du bien (base64) — données non personnelles",
  prompts: "Descriptions du bien — données non personnelles",
  notes_agent: "Notes saisies/dictées — peut contenir des infos sensibles",
};

// Politique Anthropic :
// - Données chiffrées en transit (TLS)
// - Pas de conservation pour entraînement (API commerciale)
// - Conforme RGPD selon DPA Anthropic

// Mention à afficher dans l'app :
const API_MENTION = "Les photos et données du bien sont transmises à l'API Anthropic pour analyse. Elles sont chiffrées en transit et ne sont pas conservées par Anthropic.";
```

---

## DROITS DES UTILISATEURS

```jsx
// Interface gestion des données — accessible dans les paramètres admin
function DataManagementPanel() {
  return (
    <div>
      <h3>Gestion de vos données</h3>

      {/* Exporter */}
      <button onClick={() => {
        const allData = {
          history: JSON.parse(localStorage.getItem("zaymmo_history") || "[]"),
          saved: JSON.parse(localStorage.getItem("zaymmo_saved") || "[]"),
        };
        const blob = new Blob([JSON.stringify(allData, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "zaymmo_mes_donnees.json";
        a.click();
        URL.revokeObjectURL(url);
      }}>
        Exporter mes données
      </button>

      {/* Supprimer tout */}
      <button onClick={() => {
        if (window.confirm("Supprimer TOUTES vos données Zaymmo ? Cette action est irréversible.")) {
          localStorage.removeItem("zaymmo_history");
          localStorage.removeItem("zaymmo_saved");
          localStorage.removeItem("zaymmo_learning");
          alert("Données supprimées.");
        }
      }}>
        Supprimer toutes mes données
      </button>
    </div>
  );
}
```

---

## MENTIONS LÉGALES DANS L'APP

```javascript
// Footer de la fiche imprimée
const LEGAL_FOOTER = (agence, date) =>
  `${agence} — Document de présentation — ${date} — Informations non contractuelles`;

// Mention RGPD (optionnelle dans les paramètres)
const RGPD_MENTION =
  "Vos données sont stockées localement sur votre appareil. " +
  "Elles ne sont partagées qu'avec l'API Anthropic pour l'analyse IA. " +
  "Vous pouvez les supprimer à tout moment dans les paramètres.";
```

---

## CONFORMITÉ EU AI ACT 2024

```
Classification Zaymmo : Système IA à RISQUE LIMITÉ
Obligations :
✓ Transparence — l'agent sait qu'il utilise une IA
✓ Contrôle humain — l'agent valide toujours l'annonce finale
✓ Pas de décision automatique — l'IA assiste, ne décide pas
✓ Traçabilité — historique des analyses conservé
✓ Documentation — skills et agents documentés

NON applicable :
✗ Risque élevé — pas de décision d'embauche, crédit, santé
✗ Systèmes interdits — pas de manipulation, scoring social
```

---

## CHECKLIST CONFORMITÉ

```
Avant chaque déploiement vérifier :
✓ Pas de clé API dans le code (VITE_ANTHROPIC_KEY uniquement)
✓ Pas de données personnelles hardcodées
✓ Mot de passe hashé (pas en clair)
✓ sessionStorage pour auth (pas localStorage)
✓ Confirmation avant suppression de données
✓ Bouton "Supprimer" sur chaque entrée historique
✓ Timeout session implémenté
✓ HTTPS uniquement (Vercel gère automatiquement)
```
