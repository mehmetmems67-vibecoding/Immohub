---
name: zaymmo-qa-agent
description: Agent QA complet de Zaymmo. Lancer OBLIGATOIREMENT après chaque modification du code avant de livrer le fichier. Contient tous les tests syntaxe, fonctionnels, navigation, pipeline et sécurité. Bloque la livraison si une erreur est détectée.
---

# Zaymmo QA Agent

## RÈGLE ABSOLUE

**Zéro livraison sans QA validé.**
Chaque modification du code App.jsx doit passer les 3 niveaux de tests avant d'être livré.
Si un test échoue → corriger → relancer → livrer seulement quand tout est vert.

---

## NIVEAU 1 — TESTS SYNTAXE (bloquants)

```python
import re

def qa_syntaxe(src):
    errors = []

    # Backticks équilibrés
    bt = src.count('`')
    if bt % 2 != 0:
        errors.append(f"BACKTICKS DÉSÉQUILIBRÉS: {bt} backticks")

    # Accolades équilibrées
    opens = src.count('{')
    closes = src.count('}')
    if opens != closes:
        errors.append(f"ACCOLADES: {{ x{opens} vs }} x{closes}")

    # Parenthèses équilibrées
    po = src.count('(')
    pc = src.count(')')
    if po != pc:
        errors.append(f"PARENTHÈSES: ( x{po} vs ) x{pc}")

    # Fragments React équilibrés
    fo = len(re.findall(r'(?<![a-zA-Z=])<>(?![a-zA-Z])', src))
    fc = len(re.findall(r'</>', src))
    if fo != fc:
        errors.append(f"FRAGMENTS: <> x{fo} vs </> x{fc}")

    # Strings cassées (saut de ligne dans guillemets)
    if len(re.findall(r'[+]\s*"\s*\n\s*"', src)) > 0:
        errors.append("STRING CASSÉE: guillemets sur plusieurs lignes")

    # Pas de <- dans JSX
    if len(re.findall(r'>\s*<-\s*[A-Za-z]', src)) > 0:
        errors.append("OPÉRATEUR <- INVALIDE dans JSX")

    # Export default présent
    if 'export default function App' not in src:
        errors.append("EXPORT DEFAULT manquant")

    # Import React présent
    if 'import { useState' not in src:
        errors.append("IMPORT REACT manquant")

    return errors
```

---

## NIVEAU 2 — TESTS FONCTIONNELS (bloquants)

```javascript
function qa_fonctionnel(src) {
  const errors = [];

  // ── PIPELINE ──────────────────────────────────
  if (!src.includes('step==="photos"'))
    errors.push("STEP photos manquant");
  if (!src.includes('step==="fiche"'))
    errors.push("STEP fiche manquant");
  if (!src.includes('step==="notes"'))
    errors.push("STEP notes manquant");
  if (!src.includes('step==="annonce"'))
    errors.push("STEP annonce manquant");
  if (!src.includes('step==="apercu"'))
    errors.push("STEP apercu manquant");
  if (!src.includes('step==="fiche_interne"'))
    errors.push("STEP fiche_interne manquant");

  // ── NAVIGATION ────────────────────────────────
  if (!src.includes('homepage,setHomepage'))
    errors.push("STATE homepage manquant");
  if (!src.includes('setHomepage(true)'))
    errors.push("BOUTON accueil manquant");
  if (!src.includes('Nouvelle annonce'))
    errors.push("BOUTON nouvelle annonce manquant");

  // ── META ──────────────────────────────────────
  if (!src.includes('code_postal'))
    errors.push("CHAMP code_postal manquant");
  if (!src.includes('sdb:""'))
    errors.push("CHAMP sdb manquant");
  if (!src.includes('wc:""'))
    errors.push("CHAMP wc manquant");
  if (!src.includes('garage:false'))
    errors.push("CHAMP garage manquant");
  if (!src.includes('poele_granules'))
    errors.push("CHAMP poele_granules manquant");
  if (!src.includes('chambre_parentale'))
    errors.push("CHAMP chambre_parentale manquant");
  if (!src.includes('notes_agent'))
    errors.push("CHAMP notes_agent manquant");
  if (!src.includes('conso_kwh_n1'))
    errors.push("CHAMP conso_kwh_n1 manquant");
  if (!src.includes('triple_vitrage'))
    errors.push("CHAMP triple_vitrage manquant");

  // ── ANALYSE ───────────────────────────────────
  if (!src.includes('async function runAnalysis'))
    errors.push("FONCTION runAnalysis manquante");
  if (!src.includes('async function urlToB64'))
    errors.push("FONCTION urlToB64 manquante");
  if (!src.includes('crossOrigin'))
    errors.push("crossOrigin canvas manquant");
  if (!src.includes('} finally { // B06'))
    errors.push("try/finally pipeline manquant");
  if (!src.includes('60000'))
    errors.push("TIMEOUT 60s manquant");

  // ── ANNONCE ───────────────────────────────────
  if (!src.includes('async function genAnnonce'))
    errors.push("FONCTION genAnnonce manquante");
  if (!src.includes('description_longue||annonce.description_courte'))
    errors.push("BUG G: apercu utilise description courte");
  if (!src.includes('NOTES AGENT:'))
    errors.push("NOTES AGENT dans prompt manquant");

  // ── SAUVEGARDE ────────────────────────────────
  if (!src.includes('function saveAnnonce'))
    errors.push("FONCTION saveAnnonce manquante");
  if (!src.includes('savedList,setSavedList'))
    errors.push("STATE savedList manquant");
  if (!src.includes('zaymmo_saved'))
    errors.push("STORAGE zaymmo_saved manquant");
  if (!src.includes('Annonces sauvegardees'))
    errors.push("BOUTON annonces sauvegardées manquant");

  // ── HISTORIQUE ────────────────────────────────
  if (!src.includes('zaymmo_history'))
    errors.push("STORAGE historique manquant");
  if (!src.includes('slice(0,50)'))
    errors.push("LIMITE 50 historique manquante");
  if (!src.includes('hist[0].annonce = a'))
    errors.push("SAUVEGARDE annonce dans historique manquante");
  if (!src.includes('if(h.annonce){setAnnonce'))
    errors.push("RESTAURATION annonce historique manquante");

  // ── VOCAL ─────────────────────────────────────
  if (!src.includes('SpeechRecognition'))
    errors.push("VOCAL SpeechRecognition manquant");
  if (!src.includes('async function startVoice'))
    errors.push("FONCTION startVoice manquante");

  // ── SÉCURITÉ ──────────────────────────────────
  if (!src.includes('imoimoimoiaia'))
    errors.push("MDP admin manquant");
  if (!src.includes('VITE_ANTHROPIC_KEY'))
    errors.push("CLÉ API via env manquante");
  if (src.includes('sk-ant-api'))
    errors.push("CLÉ API HARDCODÉE DÉTECTÉE — DANGER");
  if (!src.includes('anthropic-dangerous-direct-browser-access'))
    errors.push("HEADER CORS Anthropic manquant");

  // ── API & MODÈLE ──────────────────────────────
  if (!src.includes('claude-haiku'))
    errors.push("MODÈLE Haiku manquant");
  if (!src.includes('mountedRef.current'))
    errors.push("mountedRef protection manquante");

  // ── ÉQUIPEMENTS ───────────────────────────────
  if (!src.includes('"triple_vitrage"'))
    errors.push("ÉQUIPEMENT triple vitrage manquant");
  if (!src.includes('"garage"'))
    errors.push("ÉQUIPEMENT garage manquant");

  // ── MULTILINGUE ───────────────────────────────
  if (!src.includes('athome') || !src.includes('rightmove'))
    errors.push("PLATEFORMES multinationales manquantes");
  if (!src.includes('WICHTEG REEGELEN') && !src.includes('Keller (net Cave'))
    errors.push("RÈGLES LU luxembourgeois manquantes");

  // ── RESET ─────────────────────────────────────
  if (!src.includes('setSynth(null)') || !src.includes('setAnnonce(null)'))
    errors.push("RESET nouveau bien incomplet");

  // ── ZAY BOT ───────────────────────────────────
  if (!src.includes('ZayZay') && !src.includes('zayzay'))
    errors.push("ZAYZAY bot manquant");

  // ── PERFORMANCE ───────────────────────────────
  if (src.indexOf('const sleep') > src.indexOf('await sleep'))
    errors.push("sleep utilisé avant définition");
  if (!src.includes('URL.revokeObjectURL'))
    errors.push("Blob URLs non révoqués — fuite mémoire");

  return errors;
}
```

---

## NIVEAU 3 — TESTS PRE-DEPLOY (bloquants)

```python
def qa_predeploy(src, filepath):
    errors = []
    warnings = []

    # Taille fichier
    size_kb = len(src.encode('utf-8')) / 1024
    if size_kb > 500:
        warnings.append(f"FICHIER LOURD: {size_kb:.0f}KB — optimiser si possible")
    if size_kb > 1000:
        errors.append(f"FICHIER TROP LOURD: {size_kb:.0f}KB — Vercel peut rejeter")

    # Lignes
    lines = src.split('\n')
    if len(lines) > 5000:
        warnings.append(f"FICHIER LONG: {len(lines)} lignes")

    # Caractères non-ASCII dans code critique (hors strings)
    for i, line in enumerate(lines[:50]):
        if any(ord(c) > 127 for c in line) and not line.strip().startswith('//'):
            errors.append(f"CARACTÈRE NON-ASCII ligne {i+1}: {line.strip()[:40]}")

    # Variables d'environnement
    if 'VITE_ANTHROPIC_KEY' not in src:
        errors.append("VITE_ANTHROPIC_KEY manquant")

    # Console.log en production
    import re
    logs = re.findall(r'console\.log\(', src)
    if len(logs) > 5:
        warnings.append(f"CONSOLE.LOG: {len(logs)} occurrences — nettoyer avant prod")

    # TODO / FIXME restants
    todos = re.findall(r'//\s*(TODO|FIXME|HACK)', src)
    if todos:
        warnings.append(f"TODO/FIXME restants: {len(todos)}")

    return errors, warnings
```

---

## SCRIPT QA COMPLET

```python
#!/usr/bin/env python3
"""
ZAYMMO QA Agent — Lance avant chaque livraison
Usage: python3 qa_agent.py [chemin/vers/App.jsx]
"""
import re, sys

def run_all_qa(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        src = f.read()

    print("=" * 60)
    print("ZAYMMO QA AGENT — RAPPORT COMPLET")
    print("=" * 60)

    all_errors = []

    # Niveau 1 — Syntaxe
    print("\n── NIVEAU 1: SYNTAXE ──")
    syn_errors = qa_syntaxe(src)
    for e in syn_errors:
        print(f"  XX {e}")
        all_errors.append(e)
    if not syn_errors:
        print("  OK Syntaxe parfaite")

    # Niveau 2 — Fonctionnel
    print("\n── NIVEAU 2: FONCTIONNEL ──")
    func_errors = qa_fonctionnel(src)
    for e in func_errors:
        print(f"  XX {e}")
        all_errors.append(e)
    if not func_errors:
        print("  OK Toutes les fonctionnalités présentes")

    # Niveau 3 — Pre-deploy
    print("\n── NIVEAU 3: PRE-DEPLOY ──")
    dep_errors, dep_warnings = qa_predeploy(src, filepath)
    for e in dep_errors:
        print(f"  XX {e}")
        all_errors.append(e)
    for w in dep_warnings:
        print(f"  ?? {w}")
    if not dep_errors:
        print("  OK Prêt pour déploiement")

    # Résultat final
    lines = src.split('\n')
    size_kb = round(len(src.encode('utf-8')) / 1024)
    print("\n" + "=" * 60)
    print(f"Fichier: {len(lines)} lignes | {size_kb}KB")
    print(f"Tests: {len(all_errors)} erreur(s)")
    print("=" * 60)

    if all_errors:
        print("LIVRAISON BLOQUÉE — Corriger avant de livrer")
        return False
    else:
        print("ZAYMMO CERTIFIÉ — LIVRAISON AUTORISÉE ✓")
        return True

if __name__ == "__main__":
    filepath = sys.argv[1] if len(sys.argv) > 1 else "src/App.jsx"
    ok = run_all_qa(filepath)
    sys.exit(0 if ok else 1)
```

---

## QUAND LANCER LE QA

```
OBLIGATOIRE après :
✓ Toute modification de App.jsx
✓ Ajout d'un nouveau champ meta
✓ Ajout d'une fonctionnalité
✓ Correction d'un bug
✓ Refonte partielle ou totale
✓ Avant chaque commit GitHub

JAMAIS livrer sans QA vert.
```

---

## AJOUT DE NOUVEAUX TESTS

Quand on ajoute une fonctionnalité, ajouter le test correspondant :

```python
# Template nouveau test fonctionnel
if not src.includes('NOM_FONCTIONNALITE'):
    errors.push("FONCTIONNALITE X manquante")
```

---

## CODES D'ERREUR FRÉQUENTS

```
SYNTAXE BACKTICKS    → String template mal fermée
SYNTAXE ACCOLADES    → JSX mal fermé ou fonction incomplète
SYNTAXE FRAGMENTS    → <> sans </> ou inverse
SYNTAXE STRING       → "texte" cassé sur plusieurs lignes
FONCT PIPELINE       → step manquant ou mal conditionné
FONCT RESET          → resetAll() incomplet
FONCT STORAGE        → localStorage non géré
SECURITE CLÉ API     → clé hardcodée détectée
SECURITE MDP         → mot de passe admin modifié
DEPLOY TAILLE        → fichier trop lourd pour Vercel
```
