---
name: zaymmo-skills-auditor
description: Auditeur de qualité des 65 skills Zaymmo eux-mêmes. Lire avant d'ajouter un nouveau skill ou périodiquement pour vérifier que les skills existants restent pertinents et à jour. Source adaptée de claudemd-auditor (GetBindu/awesome-claude-code-and-skills). Note chaque skill sur 6 axes calibrés et propose le Top-3 des améliorations concrètes.
---

# Zaymmo Skills Auditor

## PRINCIPE

Avec 65 skills Zaymmo, il existe un risque de dérive : skills devenus obsolètes
après une refonte, doublons entre skills, descriptions trop vagues pour
déclencher le bon skill au bon moment. Cet auditeur note chaque skill
sur 6 axes calibrés et retourne le Top-3 des améliorations concrètes.

---

## LES 6 AXES D'AUDIT (0-100 points, calibrés)

```
1. SPÉCIFICITÉ (0-20 pts)
   Le skill donne-t-il des instructions précises et actionnables,
   ou reste-t-il vague et générique ?

   0-5   : Généralités sans exemple concret
   6-12  : Quelques exemples mais incomplets
   13-20 : Code/exemples précis, directement copiables-collables

2. COUVERTURE (0-20 pts)
   Le skill couvre-t-il vraiment tous les cas qu'il prétend couvrir ?

   0-5   : Couvre le cas nominal seulement
   6-12  : Couvre les cas nominaux + quelques cas limites
   13-20 : Couvre nominal + limites + edge cases documentés

3. CONCISION (0-15 pts)
   Le skill est-il à la bonne longueur — ni trop court (inutile),
   ni trop long (pollue le contexte) ?

   0-5   : Trop court pour être utile OU beaucoup trop long (>500 lignes)
   6-10  : Longueur correcte mais avec du remplissage
   11-15 : Longueur optimale, chaque section apporte de la valeur

4. FRAÎCHEUR / À JOUR (0-20 pts)
   Le skill reflète-t-il l'état ACTUEL du code Zaymmo,
   ou a-t-il été écrit avant une refonte et n'a pas été mis à jour ?

   0-5   : Référence des structures de code qui n'existent plus
   6-12  : Globalement à jour avec quelques détails datés
   13-20 : Parfaitement synchronisé avec le code actuel

5. PARTICULARITÉS CAPTURÉES (0-15 pts)
   Le skill capture-t-il les spécificités UNIQUES de Zaymmo,
   ou pourrait-il s'appliquer à n'importe quel projet ?

   0-5   : Générique, pourrait être pour n'importe quelle app
   6-10  : Quelques mentions Zaymmo mais surface
   11-15 : Profondément ancré dans le contexte Zaymmo (couleurs, pipeline, etc.)

6. ADÉQUATION DU TON (0-10 pts)
   Le ton et la structure sont-ils cohérents avec les autres skills Zaymmo ?

   0-3   : Ton ou structure incohérents avec le reste
   4-7   : Globalement cohérent
   8-10  : Parfaitement aligné (même structure de sections, même registre)
```

---

## SCORE TOTAL ET INTERPRÉTATION

```
0-40   : 🔴 Skill à refaire entièrement
41-60  : 🟡 Skill fonctionnel mais nécessite révision
61-80  : 🟢 Bon skill, améliorations mineures possibles
81-100 : ⭐ Skill exemplaire
```

---

## CODES D'ERREUR (cas limites)

```javascript
const AUDIT_ERROR_CODES = {
  too_short: "Skill < 50 lignes — probablement incomplet",
  not_a_skillmd: "Fichier ne respecte pas le format SKILL.md (pas de frontmatter YAML)",
  too_long: "Skill > 600 lignes — risque de pollution du contexte, à scinder",
  duplicate_concept: "Chevauche significativement un autre skill existant",
  stale_reference: "Référence du code (ex: nom de fonction) qui n'existe plus dans App.jsx actuel",
};
```

---

## FONCTION D'AUDIT (méthodologie)

```python
def audit_skill(skill_path, current_app_jsx_content=None):
    """
    Audite un skill Zaymmo sur les 6 axes.
    Retourne un score et le Top-3 des améliorations.
    """
    with open(skill_path, 'r', encoding='utf-8') as f:
        content = f.read()

    scores = {}
    issues = []

    # Vérification frontmatter
    if not content.startswith('---'):
        return {"error": "not_a_skillmd", "score": 0}

    lines = content.split('\n')
    line_count = len(lines)

    # Axe 3 — Concision (mesurable directement)
    if line_count < 50:
        scores['concision'] = 3
        issues.append("too_short")
    elif line_count > 600:
        scores['concision'] = 5
        issues.append("too_long")
    elif 100 <= line_count <= 400:
        scores['concision'] = 15  # zone optimale
    else:
        scores['concision'] = 10

    # Axe 1 — Spécificité (présence de blocs de code = bon signe)
    code_blocks = content.count('```')
    scores['specificite'] = min(20, code_blocks * 2)

    # Axe 5 — Particularités Zaymmo (mots-clés spécifiques)
    zaymmo_markers = ['Zaymmo', 'C8793A', '00D4E8', 'meta.', 'synth.',
                       'App.jsx', 'ZayZay', 'Vercel']
    marker_count = sum(content.count(m) for m in zaymmo_markers)
    scores['particularites'] = min(15, marker_count)

    # Axe 6 — Ton (présence de structure cohérente avec autres skills)
    has_principle_section = '## PRINCIPE' in content
    has_checklist = 'CHECKLIST' in content.upper()
    scores['ton'] = (5 if has_principle_section else 0) + (5 if has_checklist else 0)

    return {
        "scores": scores,
        "total": sum(scores.values()),
        "issues": issues,
        "line_count": line_count,
    }
```

---

## RAPPORT TYPE GÉNÉRÉ

```markdown
## Audit: 02-architecture.md

**Score total: 78/100** 🟢

| Axe | Score | Commentaire |
|---|---|---|
| Spécificité | 18/20 | Beaucoup de code concret, exemples copiables |
| Couverture | 16/20 | Couvre bien le pipeline, manque les edge cases multi-langue |
| Concision | 12/15 | Longueur correcte (310 lignes) |
| Fraîcheur | 14/20 | ⚠️ Référence resetAll() — vérifier si renommé en resetAllWithMemory() (skill 54) |
| Particularités | 13/15 | Très ancré Zaymmo |
| Ton | 5/10 | Manque une section CHECKLIST en fin de skill |

### Top-3 améliorations
1. **[FRAÎCHEUR]** Vérifier la cohérence entre resetAll() (skill 02) et
   resetAllWithMemory() (skill 54) — risque de duplication de logique
2. **[COUVERTURE]** Ajouter une section sur la gestion des erreurs
   multi-langue dans le pipeline (cas où une langue échoue à générer)
3. **[TON]** Ajouter une checklist de fin de skill comme dans 05-qa-agent.md
   pour la cohérence avec le reste de la collection
```

---

## QUAND LANCER UN AUDIT

```
OBLIGATOIRE :
✓ Après une refonte majeure de App.jsx (vérifier que les skills
  référencent toujours les bonnes fonctions/structures)
✓ Avant d'ajouter un nouveau skill (vérifier qu'il n'existe pas
  déjà un skill qui couvre ce sujet — éviter les doublons)

RECOMMANDÉ :
○ Tous les ~20 nouveaux skills créés — audit de cohérence globale
○ Si un skill semble ne jamais se déclencher comme prévu
  (la description n'est peut-être pas assez précise)
```

---

## DÉTECTION DE DOUBLONS ENTRE SKILLS ZAYMMO

```python
def detect_overlapping_skills(all_skill_paths):
    """
    Compare les descriptions de tous les skills pour détecter
    les chevauchements potentiels qui créent de la confusion.
    """
    descriptions = {}
    for path in all_skill_paths:
        with open(path) as f:
            content = f.read()
            # Extraire la ligne description du frontmatter
            for line in content.split('\n'):
                if line.startswith('description:'):
                    descriptions[path] = line.replace('description:', '').strip()

    # Comparaison simple par mots-clés partagés (illustratif)
    # Exemple de chevauchement déjà identifié dans Zaymmo :
    # skill 16 (rgpd-conformite) et skill 64 (pii-sanitize)
    # → PAS un doublon : 16 = cadre légal, 64 = détection technique
    # → Documenté comme complémentaire, pas redondant (voir skill 64)

    return descriptions
```

---

## CHECKLIST QUALITÉ SKILL (avant publication)

```
☐ Frontmatter YAML présent avec name + description précise
☐ Description indique CLAIREMENT quand le skill doit se déclencher
☐ Au moins 1 section "## PRINCIPE" expliquant le pourquoi
☐ Exemples de code concrets, pas que de la théorie
☐ Longueur entre 100 et 500 lignes (zone optimale)
☐ Pas de doublon évident avec un skill existant
   (si chevauchement, documenter la complémentarité explicitement)
☐ Références au code (noms de fonctions, couleurs) vérifiées à jour
☐ Section finale claire (checklist, résumé, ou prochaines étapes)
```

---

*Source originale : claudemd-auditor (GetBindu/awesome-claude-code-and-skills) — adapté pour auditer la collection des skills Zaymmo elle-même plutôt qu'un fichier CLAUDE.md unique*
