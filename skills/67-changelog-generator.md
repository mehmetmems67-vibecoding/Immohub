---
name: zaymmo-changelog-generator
description: Génération automatique du changelog Zaymmo. Lire après chaque livraison de version (App_vX) pour produire des notes de version lisibles. Inspiré des patterns changelog-generator présents dans alirezarezvani/claude-skills. Transforme l'historique des modifications en journal de version structuré et compréhensible.
---

# Zaymmo Changelog Generator

## PRINCIPE

Après des dizaines de versions (App_v1 à App_vX), il devient difficile
de se souvenir de ce qui a changé entre chaque version. Ce skill génère
un changelog lisible à partir des modifications effectuées en session.

---

## STRUCTURE DU CHANGELOG ZAYMMO

```markdown
# Changelog Zaymmo

## [App_v7] - 2026-06-21

### ✨ Ajouté
- Nouveau pipeline Photos → Analyse → Correction → Notes → Annonce
- Code postal, salles de bain, WC dans la fiche bien
- Garage dans les équipements
- Poêle à granulés et chambre parentale en caractéristiques
- Bloc notes agent avec dictée vocale et nettoyage IA

### 🐛 Corrigé
- Bug H : "Nouvelle annonce" ne repartait pas de zéro
- Bug I : Bouton Sauvegarder invisible
- Pré-remplissage automatique depuis l'analyse IA non fonctionnel

### 🔧 Modifié
- Step bar mise à jour avec nouvelle étape "Notes"
- Steps réorganisés : Photos en premier au lieu de Infos bien

### ⚠️ Notes de déploiement
- Vérifier VITE_ANTHROPIC_KEY après déploiement
- Tester le pipeline complet sur Xiaomi 14T avant usage client
```

---

## CATÉGORIES DE CHANGEMENTS

```javascript
const CHANGELOG_CATEGORIES = {
  ajoute:    { emoji: "✨", label: "Ajouté", description: "Nouvelles fonctionnalités" },
  corrige:   { emoji: "🐛", label: "Corrigé", description: "Bugs résolus" },
  modifie:   { emoji: "🔧", label: "Modifié", description: "Changements de comportement existant" },
  supprime:  { emoji: "🗑️", label: "Supprimé", description: "Fonctionnalités retirées" },
  securite:  { emoji: "🔒", label: "Sécurité", description: "Corrections de sécurité" },
  perf:      { emoji: "⚡", label: "Performance", description: "Optimisations" },
  design:    { emoji: "🎨", label: "Design", description: "Changements visuels" },
};
```

---

## GÉNÉRATION DEPUIS LA SESSION DE CHAT

```javascript
// Pattern : à la fin de chaque session de modification importante,
// générer le changelog à partir des bugs/features traités

function generateChangelogEntry(version, date, changes) {
  let md = `## [${version}] - ${date}\n\n`;

  for (const [category, items] of Object.entries(changes)) {
    if (items.length === 0) continue;
    const cat = CHANGELOG_CATEGORIES[category];
    md += `### ${cat.emoji} ${cat.label}\n`;
    items.forEach(item => { md += `- ${item}\n`; });
    md += '\n';
  }

  return md;
}

// Exemple d'utilisation après une session
const changes = {
  ajoute: [
    "Triple vitrage dans les équipements",
    "Consommation énergétique kWh + devise sur 2 ans",
  ],
  corrige: [
    "Bug A : raccourcir trop agressif (50% au lieu de 75%)",
    "Bug B : undo qui ne fonctionnait pas",
  ],
  modifie: [],
  supprime: [],
  securite: [],
  perf: [],
  design: [],
};

const entry = generateChangelogEntry("App_v4", "2026-06-15", changes);
```

---

## EXTRACTION AUTOMATIQUE DEPUIS LA CONVERSATION

```
Pattern pour générer le changelog à partir de l'historique de discussion :

1. Repérer les phrases marquées "Bug X —" dans la conversation
   → catégorie "corrige"
2. Repérer les phrases "Fonctionnalité —" ou "Skill X créé"
   → catégorie "ajoute"
3. Repérer "on modifie", "on change"
   → catégorie "modifie"
4. Compiler en une entrée de changelog horodatée
```

---

## CHANGELOG SPÉCIFIQUE SKILLS (méta)

```markdown
# Changelog Skills Zaymmo

## Phase 1 — Skills spécifiques (01-57)
2026-06-21 : 57 skills créés couvrant fondation, qualité, métier,
intelligence, marketing, business, durabilité, intelligence collective.

## Phase 1 — Skills récupérés GitHub (58+)
2026-06-21 :
- 58-systematic-debugging (ChrisWiles/claude-code-showcase)
- 59-owasp-security (agamm/claude-code-owasp)
- 60-accessibility-audit (AccessLint, rampstackco/claude-skills)
- 61-ui-ux-intelligence (nextlevelbuilder/ui-ux-pro-max-skill)
- 62-webapp-testing (ComposioHQ/awesome-claude-skills, az9713)
- 63-secure-env-variables (wrsmith108/varlock-claude-skill)
- 64-pii-sanitize (openclaw/agentward-ai sanitize skill)
- 65-blueprint-planning (imbue-ai/blueprint)
- 66-skills-auditor (GetBindu/awesome-claude-code-and-skills)
- 67-changelog-generator (pattern alirezarezvani/claude-skills)
```

---

## RAPPEL : NE PAS CONFONDRE AVEC

```
Skill 24 (Maintenance & Evolution) = QUOI faire pour modifier le code
Skill 37 (Reporting Automatique)   = Stats d'USAGE de l'app (agent)
Skill 67 (Changelog Generator)     = Journal des VERSIONS du code lui-même

Les trois sont complémentaires, pas redondants.
```

---

## TEMPLATE RAPIDE POUR CHAQUE LIVRAISON

```markdown
## [App_vX] - [DATE]

### ✨ Ajouté
- 

### 🐛 Corrigé
- 

### 🔧 Modifié
- 

### ⚠️ Notes de déploiement
- 
```

---

*Pattern inspiré des skills changelog-generator présents dans l'écosystème Claude Skills (notamment alirezarezvani/claude-skills, daymade/claude-code-skills) — adapté pour le suivi de versions Zaymmo App.jsx et de la collection de skills elle-même*
