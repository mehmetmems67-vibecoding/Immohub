---
name: zaymmo-secure-env-variables
description: Gestion sécurisée des variables d'environnement et secrets pour Zaymmo. Lire AVANT toute manipulation de VITE_ANTHROPIC_KEY ou de tout futur secret. Source adaptée de wrsmith108/varlock-claude-skill. Empêche les secrets d'apparaître dans les sessions Claude, les terminaux, les logs ou les commits Git.
---

# Zaymmo Secure Env Variables

## PRINCIPE

Quand on travaille avec Claude sur le code Zaymmo, les secrets (clé API)
peuvent accidentellement fuiter dans :
- La sortie terminal (bash_tool)
- Le contexte de la session Claude
- Les fichiers de logs ou les traces
- Les commits Git ou les diffs

Ce skill impose des patterns stricts pour empêcher toute exposition accidentelle.

---

## LA RÈGLE ABSOLUE — JAMAIS / TOUJOURS

```
Les secrets ne doivent JAMAIS apparaître dans le contexte de Claude.

❌ NE JAMAIS FAIRE                    ✅ TOUJOURS FAIRE À LA PLACE
echo $VITE_ANTHROPIC_KEY              echo "Clé configurée: $([ -n "$VITE_ANTHROPIC_KEY" ] && echo OK || echo MANQUANTE)"
cat .env                              cat .env.example (sans valeurs réelles)
console.log(API_KEY)                  console.log("API configurée:", !!API_KEY)
Lire le fichier .env avec view        Lire .env.example ou la doc des variables attendues
Coller une clé dans le chat           Ne jamais coller de vraie clé, même partiellement
```

---

## APPLICATION DIRECTE À ZAYMMO

### La seule variable secrète du projet
```
VITE_ANTHROPIC_KEY → clé API Anthropic, configurée dans Vercel Dashboard
                      JAMAIS dans le code source
                      JAMAIS dans les messages de chat
                      JAMAIS dans les captures d'écran partagées
```

### Pattern sécurisé dans le code
```javascript
// ✅ CORRECT — accès via variable d'environnement uniquement
const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY;

// Vérification SANS exposer la valeur
if (!API_KEY) {
  setError("Clé API manquante. Configurez VITE_ANTHROPIC_KEY dans Vercel.");
  return;
}

// ❌ INTERDIT — quoi qu'il arrive
const API_KEY = "sk-ant-api03-xxxxxxxxxxxxx"; // Jamais en dur
console.log("Ma clé:", API_KEY);                // Jamais loggée
```

---

## QUAND MEM'S PARTAGE DES CAPTURES D'ÉCRAN

```
Règle de vigilance pour Claude (moi) en session Zaymmo :

Si une capture d'écran partagée contient :
- Une clé API visible (même partielle) → ne JAMAIS la répéter dans la réponse
- Un mot de passe visible → ne JAMAIS le répéter dans la réponse
- Des données Vercel Environment Variables → traiter comme sensible

Si je dois confirmer qu'une clé est "bien configurée", je dis :
"La clé semble présente" — JAMAIS "je vois que ta clé est sk-ant-xxx..."
```

---

## SCHÉMA DE VARIABLES (équivalent .env.schema pour Zaymmo)

```
Documentation SANS valeurs réelles — sûr à partager et lire :

VITE_ANTHROPIC_KEY
  Type: string (secret)
  Requis: oui
  Format attendu: commence par "sk-ant-api03-"
  Où la configurer: Vercel Dashboard → Settings → Environment Variables
  Environnements: Production + Preview + Development
  Description: Clé API pour les appels Claude (analyse photos, génération annonces)
```

---

## VALIDATION SANS EXPOSITION

```javascript
// Pattern de validation sécurisée — confirme la présence sans révéler la valeur
function validateEnvSecurely() {
  const checks = {
    "VITE_ANTHROPIC_KEY présente": !!import.meta.env.VITE_ANTHROPIC_KEY,
    "Format clé valide": import.meta.env.VITE_ANTHROPIC_KEY?.startsWith("sk-ant-") ?? false,
  };

  // Affichage masqué si jamais on doit montrer un état
  const maskedStatus = Object.entries(checks).map(([name, ok]) =>
    `${ok ? "✓" : "✗"} ${name}`
  );

  console.log(maskedStatus.join("\n"));
  return Object.values(checks).every(Boolean);
}
```

---

## ROTATION DE CLÉ — PROCÉDURE SÉCURISÉE

```
Si la clé API doit être changée (compromission suspectée, renouvellement) :

1. Mem's génère une nouvelle clé sur console.anthropic.com
   (Claude ne doit jamais générer ou voir cette étape)
2. Mem's met à jour VITE_ANTHROPIC_KEY dans Vercel Dashboard directement
   (PAS via une commande que Claude exécute)
3. Mem's révoque l'ancienne clé sur console.anthropic.com
4. Redéployer sur Vercel pour appliquer la nouvelle variable
5. Claude peut aider à VÉRIFIER que la nouvelle clé fonctionne
   (test de connexion sans jamais voir la valeur — voir skill 62-webapp-testing)

Claude n'intervient JAMAIS dans la génération ou la saisie de la clé elle-même.
```

---

## GIT — PRÉVENTION DES FUITES

```bash
# Vérifier qu'aucun secret n'est sur le point d'être commité
# AVANT chaque commit GitHub, mentalement vérifier :

☐ Le fichier App.jsx ne contient AUCUNE clé en dur (grep "sk-ant" → vide)
☐ Pas de fichier .env accidentellement ajouté au commit
☐ .gitignore contient bien ".env" et ".env.local"

# .gitignore recommandé pour Zaymmo
.env
.env.local
.env.*.local
```

---

## CHECKLIST AVANT TOUTE SESSION DE CODE ZAYMMO

```
☐ Aucune clé API ne sera demandée ni collée dans le chat
☐ Toute vérification de clé se fait par test fonctionnel (ça marche / ça marche pas)
   jamais par lecture de la valeur
☐ Les captures d'écran de Mem's contenant Vercel Settings sont traitées
   avec prudence — ne jamais répéter de valeur visible
☐ Le code généré utilise TOUJOURS import.meta.env.VITE_ANTHROPIC_KEY
☐ Aucun console.log() n'expose de variable sensible
```

---

## INTÉGRATION AVEC AGENT QA SÉCURITÉ

```python
# Déjà dans qa_syntax_agent.py — renforcé par ce skill
def check_no_hardcoded_secrets(src):
    errors = []
    if 'sk-ant-api' in src:
        errors.append("CLÉ API HARDCODÉE DÉTECTÉE — violation varlock pattern")
    if re.search(r'console\.log\([^)]*API_KEY[^)]*\)', src):
        errors.append("LOG POTENTIEL DE CLÉ API DÉTECTÉ")
    return errors
```

---

*Source originale : wrsmith108/varlock-claude-skill (basé sur dmno-dev/varlock) — adapté pour le contexte Zaymmo (sans CLI Varlock, principes appliqués manuellement)*
