---
name: zaymmo-pii-sanitize
description: Détection et anonymisation des données personnelles (PII) pour Zaymmo. Lire avant tout traitement de texte libre (notes agent, transcription vocale, contacts CRM) qui sera envoyé à l'API ou stocké. Source adaptée du skill "sanitize" (15 catégories PII, zéro dépendance, traitement 100% local). Complète le skill 16-rgpd-conformite.md avec une détection technique opérationnelle.
---

# Zaymmo PII Sanitize

## PRINCIPE

Détection et rédaction des données personnelles dans le texte AVANT
qu'il ne soit envoyé à l'API Anthropic ou stocké en localStorage.
100% local — aucune donnée n'est envoyée à un service tiers pour la détection elle-même.

---

## LES 15 CATÉGORIES PII APPLICABLES À ZAYMMO

```javascript
const PII_PATTERNS = {
  // 1. Téléphones (FR, LU, BE, DE, UK)
  telephone: /\b(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}\b|\b\+352[\s.-]?\d{2,3}[\s.-]?\d{2,3}[\s.-]?\d{2,3}\b/g,

  // 2. Emails
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // 3. Numéros de carte bancaire
  carteBancaire: /\b(?:\d[ -]*?){13,19}\b/g,

  // 4. IBAN
  iban: /\b[A-Z]{2}\d{2}[\s]?(?:\d{4}[\s]?){2,7}\d{1,4}\b/g,

  // 5. Numéro de sécurité sociale (France)
  secuFrance: /\b[12]\d{2}(0[1-9]|1[0-2])\d{2}\d{3}\d{3}\d{2}\b/g,

  // 6. Codes postaux + numéro de rue (adresse précise)
  adressePrecise: /\b\d{1,4}[,\s]+(?:rue|avenue|boulevard|chemin|impasse|allée)\s+[A-Za-zÀ-ÿ\s]+\b/gi,

  // 7. Clés API (génériques)
  cleAPI: /\b(?:sk-|pk-|api[_-]?key)[A-Za-z0-9_-]{20,}\b/gi,

  // 8. Mots de passe (patterns suspects dans du texte libre)
  motDePasse: /\b(?:mot\s*de\s*passe|password|mdp)\s*[:=]\s*\S+/gi,

  // 9. Dates de naissance (format JJ/MM/AAAA explicite avec contexte)
  dateNaissance: /\bn[ée]\(?e?\)?\s+le\s+\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/gi,

  // 10. Noms complets avec titre (M./Mme + Nom)
  nomAvecTitre: /\b(?:M\.|Mme|Monsieur|Madame)\s+[A-ZÀ-Ý][a-zà-ÿ]+(?:\s+[A-ZÀ-Ý][a-zà-ÿ]+)?\b/g,

  // 11. Plaques d'immatriculation (FR)
  plaqueImmat: /\b[A-Z]{2}-\d{3}-[A-Z]{2}\b/g,

  // 12. Numéro de passeport/CNI (France, format générique)
  documentIdentite: /\b\d{12}\b|\b[0-9]{2}[A-Z]{2}\d{5}\b/g,

  // 13. Coordonnées GPS précises
  coordonneesGPS: /\b-?\d{1,3}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}\b/g,

  // 14. Montants financiers personnels (hors prix du bien)
  montantPersonnel: /\b(?:salaire|revenu|épargne)\s+(?:de\s+)?\d[\d\s.,]*€?\b/gi,

  // 15. URLs avec tokens/paramètres sensibles
  urlAvecToken: /https?:\/\/[^\s]*[?&](?:token|key|secret|password)=[^\s&]+/gi,
};
```

---

## FONCTION DE DÉTECTION ET RAPPORT

```javascript
function detectPII(text) {
  const detections = [];

  for (const [category, pattern] of Object.entries(PII_PATTERNS)) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      detections.push({
        category,
        count: matches.length,
        // Ne JAMAIS inclure les valeurs réelles dans le rapport
        severity: getSeverity(category),
      });
    }
  }

  return {
    hasPII: detections.length > 0,
    detections,
    safe: detections.filter(d => d.severity === "high").length === 0,
  };
}

function getSeverity(category) {
  const highSeverity = ["carteBancaire", "iban", "secuFrance", "cleAPI",
                         "motDePasse", "documentIdentite"];
  return highSeverity.includes(category) ? "high" : "medium";
}
```

---

## FONCTION DE RÉDACTION (masquage)

```javascript
function redactPII(text) {
  let redacted = text;
  const replacements = {
    telephone: "[TÉLÉPHONE MASQUÉ]",
    email: "[EMAIL MASQUÉ]",
    carteBancaire: "[CARTE MASQUÉE]",
    iban: "[IBAN MASQUÉ]",
    secuFrance: "[NUMÉRO SÉCU MASQUÉ]",
    adressePrecise: "[ADRESSE PRÉCISE MASQUÉE]",
    cleAPI: "[CLÉ API MASQUÉE]",
    motDePasse: "[MOT DE PASSE MASQUÉ]",
    dateNaissance: "[DATE NAISSANCE MASQUÉE]",
    nomAvecTitre: "[NOM MASQUÉ]",
    plaqueImmat: "[PLAQUE MASQUÉE]",
    documentIdentite: "[DOCUMENT MASQUÉ]",
    coordonneesGPS: "[COORDONNÉES MASQUÉES]",
    montantPersonnel: "[MONTANT PERSONNEL MASQUÉ]",
    urlAvecToken: "[URL AVEC TOKEN MASQUÉE]",
  };

  for (const [category, pattern] of Object.entries(PII_PATTERNS)) {
    redacted = redacted.replace(pattern, replacements[category]);
  }

  return redacted;
}
```

---

## APPLICATION DANS LE PIPELINE ZAYMMO

### Notes agent (avant envoi au prompt IA)
```javascript
// Dans le flux de génération d'annonce
function prepareNotesForPrompt(notesAgent) {
  const detection = detectPII(notesAgent);

  if (detection.hasPII) {
    console.warn("PII détecté dans les notes agent:", detection.detections.map(d => d.category));

    // Ne PAS bloquer (l'agent peut légitimement noter "appeler M. Dupont au 06...")
    // mais avertir et proposer le nettoyage
    return {
      original: notesAgent,
      hasPII: true,
      suggestion: "Ces notes contiennent des données personnelles (téléphone, email...). Évitez de les inclure dans l'annonce publique.",
    };
  }

  return { original: notesAgent, hasPII: false };
}
```

### Transcription vocale (après nettoyage IA)
```javascript
// Vérification supplémentaire après le nettoyage par l'IA (skill 12)
function postCleanupPIICheck(cleanedTranscript) {
  const detection = detectPII(cleanedTranscript);
  if (detection.hasPII && detection.detections.some(d => d.severity === "high")) {
    return {
      blocked: true,
      message: "Données sensibles détectées dans la transcription — vérifiez avant d'enregistrer.",
    };
  }
  return { blocked: false };
}
```

### CRM Contacts (avant export/partage)
```javascript
// Si l'agent exporte ses données contacts (skill 36)
function sanitizeContactsExport(contacts) {
  return contacts.map(c => ({
    ...c,
    // Garder les vraies données pour usage interne
    // mais avertir si export externe demandé
  }));
}

function warnBeforeExternalShare(text) {
  const detection = detectPII(text);
  if (detection.hasPII) {
    return window.confirm(
      `Ce texte contient des données personnelles (${detection.detections.map(d=>d.category).join(", ")}). Continuer le partage ?`
    );
  }
  return true;
}
```

---

## COMPOSANT ALERTE PII UI

```jsx
function PIIWarningBanner({ text }) {
  const detection = detectPII(text);

  if (!detection.hasPII) return null;

  return (
    <div style={{
      padding: "8px 12px", background: detection.safe ? "#E8B44A10" : "#E84A4A10",
      border: `1px solid ${detection.safe ? "#E8B44A30" : "#E84A4A30"}`,
      borderRadius: 6, fontSize: 10,
      color: detection.safe ? "#E8B44A" : "#E84A4A",
      marginTop: 6,
    }}>
      ⚠️ Données personnelles détectées : {detection.detections.map(d => d.category).join(", ")}
      {!detection.safe && " — Sensible, évitez de partager."}
    </div>
  );
}
```

---

## DIFFÉRENCE AVEC LE SKILL RGPD (16)

```
Skill 16 (RGPD-conformite) = principes légaux et architecture de conformité
Skill 64 (PII-sanitize)    = détection TECHNIQUE opérationnelle (regex, fonctions)

Le skill 16 dit QUOI faire et POURQUOI (cadre légal).
Le skill 64 dit COMMENT le détecter concrètement dans le code.
Les deux se complètent et doivent être lus ensemble pour tout
traitement de texte libre dans Zaymmo.
```

---

## LIMITES ET FAUX POSITIFS

```
Cette détection regex locale a des limites connues (assumées, zéro dépendance) :
- Ne détecte pas les noms propres SANS titre (M./Mme) — limitation acceptée
- Les formats de téléphone très atypiques peuvent échapper à la détection
- Pas de NER (reconnaissance d'entités nommées) — pas de lib externe en Phase 1

Pour Zaymmo Phase 1, c'est suffisant car :
✓ Le volume de texte libre est limité (notes agent, courtes)
✓ L'usage reste local à l'agent (pas de partage automatique)
✓ Sert d'alerte, pas de blocage strict sauf cas haute sévérité
```

---

*Source originale : skill "sanitize" (openclaw/agentward-ai, référencé dans BehiSecc/awesome-claude-skills) — adapté pour le contexte Zaymmo et la RGPD française/européenne*
