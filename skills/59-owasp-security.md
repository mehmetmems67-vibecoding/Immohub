---
name: zaymmo-owasp-security
description: Référence sécurité OWASP Top 10:2025 adaptée pour Zaymmo. Lire avant tout code touchant l'authentification, la gestion des entrées utilisateur, le stockage de données ou les appels API. Source adaptée de agamm/claude-code-owasp. Couvre les vulnérabilités web classiques ET les risques spécifiques aux applications utilisant des LLM (OWASP LLM Top 10).
---

# Zaymmo OWASP Security

## OWASP TOP 10:2025 — APPLIQUÉ À ZAYMMO

### 1. Broken Access Control (Contrôle d'accès défaillant)
```javascript
// RISQUE Zaymmo : un agent "invite" accède aux fonctions admin
// MAUVAIS — pas de vérification
function deleteUser(id) {
  // N'importe qui peut appeler ça
}

// BON — vérification systématique du rôle
function deleteUser(id, currentUser) {
  if (currentUser?.role !== "admin") {
    setError("Action réservée aux administrateurs");
    return;
  }
  // ... suite
}

// Vérifier CHAQUE action sensible :
// - Suppression de comptes
// - Modification du profil agence
// - Accès aux données d'autres agents (si multi-utilisateur futur)
```

### 2. Security Misconfiguration (Mauvaise configuration)
```javascript
// RISQUE Zaymmo : variables d'environnement mal configurées sur Vercel
// Vérifier systématiquement :
// - VITE_ANTHROPIC_KEY définie dans Production ET Preview
// - Pas de mode debug actif en production
// - Pas de console.log() avec données sensibles en prod

// MAUVAIS
console.log("User data:", currentUser, password);

// BON
console.log("Auth attempt:", !!currentUser);
```

### 3. Supply Chain Failures (Failles chaîne d'approvisionnement)
```
RISQUE Zaymmo : dépendances npm compromises
- Vérifier package.json régulièrement (npm audit)
- Ne pas ajouter de dépendances non nécessaires
- Zaymmo utilise un minimum de dépendances externes (React + Vite uniquement)
- Toute nouvelle lib externe doit être justifiée et vérifiée
```

### 4. Cryptographic Failures (Failles cryptographiques)
```javascript
// RISQUE Zaymmo : mot de passe mal hashé
// MAUVAIS — mot de passe en clair
const user = { password: "monmotdepasse123" };

// BON — toujours hashé avec salt
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0")).join("");
}

// JAMAIS stocker le SALT en dur visible — utiliser une valeur dédiée projet
```

### 5. Injection
```javascript
// RISQUE Zaymmo : injection dans les prompts IA (prompt injection)
// MAUVAIS — notes agent injectées sans filtrage
const prompt = `Génère une annonce avec ces notes: ${meta.notes_agent}`;

// BON — sanitization avant injection dans le prompt
function sanitizeForPrompt(input) {
  const dangerous = [
    /ignore\s+(les\s+)?instructions?\s+précédentes?/gi,
    /system\s*:/gi,
    /\[INST\]/gi,
  ];
  let clean = input;
  for (const pattern of dangerous) clean = clean.replace(pattern, "");
  return clean.slice(0, 2000);
}
const safePrompt = `Notes: ${sanitizeForPrompt(meta.notes_agent)}`;
```

### 6. Insecure Design (Conception non sécurisée)
```
RISQUE Zaymmo : pas de limite sur les tentatives de connexion
AMÉLIORATION : ajouter un délai progressif après échecs de connexion

function checkLoginAttempts() {
  const attempts = parseInt(sessionStorage.getItem("login_attempts") || "0");
  if (attempts >= 5) {
    return { blocked: true, message: "Trop de tentatives. Réessayez dans 5 minutes." };
  }
  return { blocked: false };
}
```

### 7. Authentication Failures (Défaillances d'authentification)
```javascript
// RISQUE Zaymmo : session qui ne expire jamais
// BON — timeout de session implémenté (voir skill 25-securite.md)
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4h

function isSessionValid(session) {
  if (!session) return false;
  const elapsed = Date.now() - new Date(session.loginAt).getTime();
  return elapsed < SESSION_TIMEOUT;
}

// Vérifier à chaque action sensible, pas juste au login
useEffect(() => {
  const session = getSession();
  if (!isSessionValid(session)) {
    clearSession();
    // Rediriger vers login
  }
}, []);
```

### 8. Integrity Failures (Failles d'intégrité)
```
RISQUE Zaymmo : modification non détectée des données localStorage
- Pas de signature/checksum actuellement (Phase 1 acceptable, local uniquement)
- Phase 3 (backend) : ajouter une validation serveur des données critiques
```

### 9. Logging Failures (Défaillances de journalisation)
```javascript
// RISQUE Zaymmo : pas de trace des actions sensibles
// AMÉLIORATION : logger les actions admin (sans données sensibles)

function logAdminAction(action, adminUser) {
  const logs = JSON.parse(localStorage.getItem("zaymmo_admin_logs") || "[]");
  logs.push({
    action,
    user: adminUser.name,
    date: new Date().toISOString(),
  });
  localStorage.setItem("zaymmo_admin_logs", JSON.stringify(logs.slice(-100)));
}

// Utiliser pour : suppression utilisateur, changement de rôle, reset données
```

### 10. Exception Handling (Gestion des exceptions)
```javascript
// RISQUE Zaymmo : erreur qui expose des détails techniques à l'utilisateur
// MAUVAIS
catch(err) {
  setError(err.stack); // Expose la structure interne du code
}

// BON
catch(err) {
  console.error("Internal error:", err); // Log technique pour debug
  setError(ERRORS.API_SERVER); // Message générique pour l'utilisateur
}
```

---

## OWASP LLM TOP 10 (2025) — SPÉCIFIQUE IA ZAYMMO

### LLM01 — Prompt Injection
```javascript
// Déjà couvert — voir sanitizeForPrompt() ci-dessus
// Risque particulier : les notes agent dictées vocalement
// peuvent contenir des instructions malveillantes si lues à voix haute
// par quelqu'un d'autre que l'agent légitime

// Appliquer systématiquement à TOUS les inputs utilisateur
// avant injection dans un prompt :
// - meta.notes_agent
// - Les questions posées à ZayZay
// - Tout texte libre saisi
```

### LLM02 — Sensitive Information Disclosure
```javascript
// RISQUE : l'IA pourrait répéter des infos sensibles si on les lui donne
// Ne JAMAIS envoyer dans un prompt :
// - Mots de passe
// - Données acheteurs (voir skill RGPD)
// - Clés API d'autres services

// Vérifier avant chaque appel callClaude() que le contenu envoyé
// ne contient que des données du BIEN, pas de données personnelles tierces
```

### LLM05 — Improper Output Handling
```javascript
// RISQUE : le JSON retourné par l'IA n'est pas toujours fiable à 100%
// TOUJOURS valider la structure avant utilisation

function safeParseAIResponse(response, expectedFields) {
  try {
    const parsed = typeof response === "string" ? JSON.parse(response) : response;
    // Vérifier que les champs attendus existent
    for (const field of expectedFields) {
      if (!(field in parsed)) {
        console.warn(`Champ manquant dans la réponse IA: ${field}`);
      }
    }
    return parsed;
  } catch (e) {
    throw new Error("Réponse IA invalide");
  }
}
```

### LLM06 — Excessive Agency
```
RISQUE : ZayZay ne doit JAMAIS agir sans validation de l'agent
Règle stricte (déjà dans skill ZayZay) :
- ZayZay peut SUGGÉRER de remplir des champs (fill_fields)
- ZayZay ne doit JAMAIS sauvegarder, supprimer ou envoyer sans confirmation explicite
- Toute action destructive doit passer par window.confirm()
```

### LLM09 — Misinformation
```
RISQUE : l'IA peut halluciner des informations sur le bien
MITIGATION (déjà en place) :
- Les estimations sont toujours marquées "indicatif"
- La surface saisie par l'agent prime sur l'estimation IA
- Le score et la fourchette de prix ne sont jamais présentés comme garantis
```

---

## CHECKLIST SÉCURITÉ ZAYMMO (synthèse OWASP)

```
☐ Aucune clé API hardcodée (Cryptographic Failures)
☐ Mots de passe hashés, jamais en clair (Cryptographic Failures)
☐ Vérification de rôle avant actions admin (Broken Access Control)
☐ Sanitization des notes agent avant prompt (Injection / LLM01)
☐ Session avec timeout (Authentication Failures)
☐ Pas de stack trace exposée à l'utilisateur (Exception Handling)
☐ Validation des réponses JSON de l'IA (LLM05)
☐ ZayZay ne fait aucune action destructive sans confirmation (LLM06)
☐ Pas de données personnelles tierces dans les prompts (LLM02)
☐ npm audit lancé avant chaque dépendance ajoutée (Supply Chain)
```

---

## RISQUES SPÉCIFIQUES SKILLS/AGENTS (2026)

```
Contexte 2026 : l'écosystème des skills agentic IA a connu des attaques
documentées (ToxicSkills, ClawHavoc, prompt injection via logs).

Pour Zaymmo, règles de prudence :
- Ne jamais exécuter de skill externe non vérifié sans lecture complète
- Les 58 skills Zaymmo sont tous écrits et vérifiés manuellement
- Aucun skill Zaymmo n'exécute de script externe automatiquement
- Si on récupère un skill GitHub externe, toujours lire le contenu
  intégralement avant de l'adapter (ce qu'on fait déjà)
```

---

*Source originale : agamm/claude-code-owasp (OWASP Top 10:2025 + LLM Top 10) — adapté pour le contexte Zaymmo*
