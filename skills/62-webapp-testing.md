---
name: zaymmo-webapp-testing
description: Toolkit de test fonctionnel pour Zaymmo. Lire avant tout test manuel ou automatisé de l'interface après déploiement. Source adaptée de ComposioHQ/awesome-claude-skills (webapp-testing) et az9713/playwright-ui-testing. Complète l'Agent QA (skill 05) avec des patterns de test navigateur réel et de vérification visuelle.
---

# Zaymmo Webapp Testing

## PRINCIPE

L'Agent QA (skill 05) vérifie le CODE avant déploiement.
Webapp Testing vérifie le COMPORTEMENT RÉEL après déploiement sur Vercel —
c'est le complément indispensable : code propre ≠ app qui fonctionne réellement.

```
QA Agent (code)  →  Déploiement Vercel  →  Webapp Testing (comportement réel)
```

---

## PATTERN "RECONNAISSANCE-PUIS-ACTION"

```
Règle d'or empruntée au skill original :
TOUJOURS observer l'état actuel de la page AVANT d'agir dessus.
Ne jamais cliquer ou remplir un champ "à l'aveugle".

1. Charger la page → attendre le chargement complet (pas juste le DOM,
   attendre que le JS ait fini de s'exécuter — réseau "idle")
2. Observer ce qui est réellement affiché (capture, lecture du contenu)
3. SEULEMENT ENSUITE interagir (clic, saisie)
4. Observer le résultat de l'action
5. Comparer avec le résultat attendu
```

---

## CHECKLIST TEST MANUEL POST-DÉPLOIEMENT ZAYMMO

### Test 1 — Chargement initial
```
☐ La page se charge sans erreur console (ouvrir DevTools)
☐ Le logo ZAY s'affiche correctement
☐ L'écran de login apparaît (pas de page blanche)
☐ Temps de chargement < 3 secondes sur connexion mobile normale
```

### Test 2 — Authentification
```
☐ Mot de passe incorrect → message d'erreur clair affiché
☐ Mot de passe correct (imoimoimoiaia) → accès à la page d'accueil
☐ Session persiste pendant la navigation (pas de déconnexion intempestive)
```

### Test 3 — Pipeline complet (le plus important)
```
☐ Page d'accueil → 3 boutons visibles et cliquables
☐ "Nouvelle annonce" → arrive bien sur step "photos"
☐ Ajout d'1 photo (galerie OU URL) → preview s'affiche
☐ Bouton "Analyser" → devient actif après ajout photo
☐ Clic Analyser → barre de progression visible, messages rotatifs
☐ Fin d'analyse → navigation AUTOMATIQUE vers step "fiche"
☐ Bannière verte "Analyse IA terminée" visible
☐ Champs PRÉ-REMPLIS avec les données de l'analyse (test critique — bug historique)
☐ Bouton "Notes agent" → navigue vers step "notes"
☐ Zone de texte notes fonctionnelle
☐ Bouton "Générer l'annonce" → lance la génération
☐ Annonce générée → navigation automatique vers step "annonce"
☐ Titre + description affichés correctement
☐ Bouton "Sauvegarder" VISIBLE (bug historique à re-vérifier à chaque déploiement)
☐ Clic Sauvegarder → confirmation affichée
```

### Test 4 — Navigation et retour
```
☐ Bouton "Accueil" en haut à droite → toujours visible et fonctionnel
☐ Retour à l'accueil depuis n'importe quel step → fonctionne
☐ "Historique" → affiche le bien qu'on vient d'analyser
☐ Rouvrir depuis historique → restaure TOUTES les données (meta + synth + annonce)
☐ "Annonces sauvegardées" → affiche l'annonce sauvegardée précédemment
```

### Test 5 — Reset propre
```
☐ Bouton "+ Nouveau bien" depuis l'annonce → repart à zéro
☐ Tous les champs meta sont vides (pas de résidu de l'annonce précédente)
☐ step revient à "photos"
```

### Test 6 — Multilingue
```
☐ Changement de langue annonce → génère dans la bonne langue
☐ Test spécifique luxembourgeois → vérifier absence de mots français/allemands
```

### Test 7 — Responsive
```
☐ Test sur Xiaomi 14T réel (appareil principal)
☐ Pas de débordement horizontal
☐ Tous les boutons accessibles au pouce
☐ Test rotation portrait/paysage (si applicable)
```

---

## SCRIPT DE VÉRIFICATION RAPIDE (console navigateur)

```javascript
// À coller dans la console DevTools après déploiement
// pour un check rapide sans navigation manuelle complète

function quickZaymmoCheck() {
  const checks = {
    "Logo présent": !!document.querySelector("svg, img[alt*='ZAY']"),
    "Pas d'erreur visible": !document.body.innerText.includes("Error") &&
                              !document.body.innerText.includes("undefined"),
    "LocalStorage accessible": (() => {
      try { localStorage.setItem("test", "1"); localStorage.removeItem("test"); return true; }
      catch { return false; }
    })(),
    "React monté": !!document.querySelector("#root")?.children.length,
  };

  console.table(checks);
  return Object.values(checks).every(Boolean);
}

quickZaymmoCheck();
```

---

## VÉRIFICATION DES LOGS CONSOLE

```
Après chaque déploiement, ouvrir DevTools → Console et vérifier :

❌ Erreurs rouges (bloquantes) — noter et corriger immédiatement
⚠️ Warnings React (clés manquantes, props dépréciées) — noter pour amélioration
✓ Aucune erreur réseau 4xx/5xx sur les appels API Anthropic
✓ Aucune fuite mémoire visible (Memory tab si test prolongé)
```

---

## TEST DE RÉGRESSION (avant/après modification)

```
Avant toute modification majeure :
1. Capturer l'état "baseline" — noter le comportement actuel qui fonctionne
2. Lister les fonctionnalités critiques à ne pas casser :
   - Pipeline complet Photos→Analyse→Notes→Annonce→Sauvegarde
   - Historique et restauration
   - Multilingue (au moins FR + 1 autre langue)
   - Export plateformes

Après modification :
3. Re-tester CHAQUE fonctionnalité de la liste baseline
4. Si une régression est détectée → ne PAS livrer, retour au
   Systematic Debugging (skill 58) pour trouver la cause racine
```

---

## TEST API — VÉRIFICATION SANS UI

```javascript
// Tester la clé API directement, sans passer par l'interface
async function testAnthropicConnection() {
  const API_KEY = "VOTRE_CLE_TEST"; // Ne jamais commiter une vraie clé
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 50,
        messages: [{ role: "user", content: "Réponds juste OK" }],
      }),
    });
    console.log("Status:", resp.status);
    const data = await resp.json();
    console.log("Réponse:", data);
    return resp.ok;
  } catch (e) {
    console.error("Erreur connexion API:", e);
    return false;
  }
}
```

---

## RAPPORT DE TEST STANDARD

```
Après chaque session de test, documenter :

Date: [date]
Version testée: [App_vX]
URL: immohub-black.vercel.app

✓ Tests réussis: [liste]
✗ Tests échoués: [liste avec description précise]
⚠️ Points d'attention: [comportements limites]

Si tout est vert → app prête pour usage en production
Si rouge → retour Systematic Debugging avant nouvelle livraison
```

---

*Sources originales : ComposioHQ/awesome-claude-skills (webapp-testing), az9713/playwright-ui-testing — adapté pour le contexte Zaymmo (test manuel mobile-first, sans Playwright installé)*
