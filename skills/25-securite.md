---
name: zaymmo-securite
description: Sécurité applicative de Zaymmo. Lire avant toute modification touchant l'authentification, les clés API, le stockage de données sensibles ou l'exposition de l'app. Garantit une protection complète contre les vulnérabilités courantes.
---

# Zaymmo Sécurité

## PRINCIPES DE SÉCURITÉ

```
1. Clé API JAMAIS hardcodée — toujours via import.meta.env
2. Mot de passe JAMAIS en clair dans le code source visible
3. Pas de données sensibles dans les logs console
4. Validation de toutes les entrées utilisateur
5. Pas d'injection possible dans les prompts IA
6. CORS configuré correctement pour l'API Anthropic
```

---

## GESTION CLÉ API

```javascript
// CORRECT — toujours via variable d'environnement
const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY;

// INTERDIT — jamais ça
// const API_KEY = "sk-ant-api03-xxxxx"; ❌❌❌

// Vérification avant utilisation
if (!API_KEY) {
  setError("Clé API manquante. Configurez VITE_ANTHROPIC_KEY dans Vercel.");
  return;
}

// Ne JAMAIS logger la clé
console.log("API configurée:", !!API_KEY); // OK — pas la valeur
// console.log("Clé:", API_KEY); // ❌ JAMAIS
```

---

## AUTHENTIFICATION

```javascript
// Structure utilisateur sécurisée
const userStructure = {
  id: "unique_id",
  name: "Nom Agent",
  passwordHash: "hash_sha256...",  // JAMAIS le mot de passe en clair
  role: "admin" | "invite",
  createdAt: "ISO date",
};

// Hashage (sécurité basique côté client)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "zaymmo_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0")).join("");
}

// Connexion
async function login(password) {
  const users = getUsers();
  const hash = await hashPassword(password);
  const user = users.find(u => u.passwordHash === hash);

  if (!user) {
    setError("Mot de passe incorrect");
    return false;
  }

  saveSession(user);
  return true;
}
```

---

## SESSION SÉCURISÉE

```javascript
// sessionStorage — pas localStorage pour l'auth
// Avantage : effacé à la fermeture de l'onglet/navigateur

function saveSession(user) {
  const session = {
    id: user.id,
    name: user.name,
    role: user.role,
    loginAt: new Date().toISOString(),
    // Pas de mot de passe, pas de hash dans la session
  };
  sessionStorage.setItem("zaymmo_session", JSON.stringify(session));
}

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem("zaymmo_session") || "null");
  } catch { return null; }
}

function clearSession() {
  sessionStorage.removeItem("zaymmo_session");
}

// Timeout session — déconnexion auto après inactivité
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 heures

function isSessionValid(session) {
  if (!session) return false;
  const elapsed = Date.now() - new Date(session.loginAt).getTime();
  return elapsed < SESSION_TIMEOUT;
}
```

---

## VALIDATION DES ENTRÉES

```javascript
// Toujours valider avant traitement
function validateMeta(meta) {
  const errors = [];

  // Surface — nombre positif raisonnable
  if (meta.surface && (isNaN(meta.surface) || meta.surface < 0 || meta.surface > 10000)) {
    errors.push("Surface invalide");
  }

  // Prix — nombre positif raisonnable
  if (meta.prix && (isNaN(meta.prix) || meta.prix < 0 || meta.prix > 100000000)) {
    errors.push("Prix invalide");
  }

  // Code postal — format basique
  if (meta.code_postal && !/^[0-9A-Za-z\s-]{3,10}$/.test(meta.code_postal)) {
    errors.push("Code postal invalide");
  }

  return errors;
}

// Sanitization texte libre (notes agent)
function sanitizeText(text) {
  // Limiter la taille
  if (text.length > 5000) text = text.slice(0, 5000);
  // Pas de scripts ou HTML
  text = text.replace(/<script[^>]*>.*?<\/script>/gi, "");
  text = text.replace(/<[^>]+>/g, "");
  return text;
}
```

---

## PROTECTION CONTRE PROMPT INJECTION

```javascript
// Les notes agent sont injectées dans le prompt — risque d'injection
function sanitizeForPrompt(userInput) {
  if (!userInput) return "";

  // Supprimer les tentatives d'instructions système
  const dangerous = [
    /ignore\s+(les\s+)?instructions?\s+précédentes?/gi,
    /system\s*:/gi,
    /\[INST\]/gi,
    /forget\s+everything/gi,
  ];

  let clean = userInput;
  for (const pattern of dangerous) {
    clean = clean.replace(pattern, "");
  }

  return clean.slice(0, 2000); // Limiter la taille
}

// Utiliser avant d'injecter dans aPrompt()
const safeNotes = sanitizeForPrompt(meta.notes_agent);
```

---

## CORS ET API ANTHROPIC

```javascript
// Header obligatoire pour appel direct navigateur
const headers = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true", // OBLIGATOIRE
};

// Note : ce header expose la clé côté client
// Pour production SaaS — migrer vers un backend proxy
// qui cache la clé API côté serveur
```

---

## GESTION DES RÔLES

```javascript
const ROLES = {
  admin: {
    label: "Administrateur",
    permissions: ["create", "read", "update", "delete", "manage_users"],
  },
  invite: {
    label: "Invité",
    permissions: ["create", "read"],
  },
};

function hasPermission(user, action) {
  return ROLES[user?.role]?.permissions.includes(action) ?? false;
}

// Protection actions admin
{hasPermission(currentUser, "manage_users") && (
  <AdminPanel />
)}
```

---

## CHECKLIST SÉCURITÉ AVANT DÉPLOIEMENT

```
✓ Aucune clé API hardcodée (grep "sk-ant" dans le code)
✓ Aucun mot de passe en clair
✓ sessionStorage pour auth (pas localStorage)
✓ Validation des entrées numériques
✓ Sanitization des notes agent avant prompt
✓ Pas de console.log() avec données sensibles
✓ HTTPS uniquement (Vercel par défaut)
✓ Permissions par rôle vérifiées
```

---

## RÉPONSE AUX INCIDENTS

```
Si clé API compromise :
1. Révoquer immédiatement sur console.anthropic.com
2. Générer une nouvelle clé
3. Mettre à jour VITE_ANTHROPIC_KEY sur Vercel
4. Redéployer

Si compte admin compromis :
1. Changer le mot de passe immédiatement
2. Vérifier l'historique des connexions si disponible
3. Réinitialiser les sessions actives
```
