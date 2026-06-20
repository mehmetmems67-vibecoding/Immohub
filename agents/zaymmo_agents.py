#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
ZAYMMO AGENTS — Suite complète des 46 agents de qualité Phase 1
═══════════════════════════════════════════════════════════════

Usage:
    python3 zaymmo_agents.py [chemin/vers/App.jsx]              → lance TOUS les agents
    python3 zaymmo_agents.py [chemin] --only=01,05,12            → lance des agents précis
    python3 zaymmo_agents.py [chemin] --category=pipeline_qualite → lance une catégorie

Catégories disponibles:
    pipeline_qualite, design_ux, pipeline_zaymmo, intelligence,
    innovation, intelligence_avancee, contenu, technique, business,
    qualite_ia, auto_apprentissage, certification_formation,
    durabilite, securite_avancee

Chaque agent retourne une liste d'erreurs (vide = succès).
Les agents marqués BLOQUANT empêchent la livraison s'ils échouent.
"""

import re
import sys
import json
from datetime import datetime

# ═══════════════════════════════════════════════════════════════
# UTILITAIRES PARTAGÉS
# ═══════════════════════════════════════════════════════════════

def load_source(filepath):
    """Charge le fichier source à analyser."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()


def count_lines(src):
    return len(src.split('\n'))


# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 1 — PIPELINE QUALITÉ (4 agents) — TOUS BLOQUANTS
# ═══════════════════════════════════════════════════════════════

def agent_01_syntaxe(src):
    """
    Agent 01 — Syntaxe
    Vérifie l'équilibrage syntaxique complet du fichier App.jsx.
    BLOQUANT — aucune livraison possible si cet agent échoue.
    """
    errors = []

    # Backticks équilibrés
    bt = src.count('`')
    if bt % 2 != 0:
        errors.append(f"BACKTICKS DÉSÉQUILIBRÉS: {bt} backticks (nombre impair)")

    # Accolades équilibrées
    opens_b = src.count('{')
    closes_b = src.count('}')
    if opens_b != closes_b:
        errors.append(f"ACCOLADES DÉSÉQUILIBRÉES: {{ x{opens_b} vs }} x{closes_b}")

    # Parenthèses équilibrées
    po = src.count('(')
    pc = src.count(')')
    if po != pc:
        errors.append(f"PARENTHÈSES DÉSÉQUILIBRÉES: ( x{po} vs ) x{pc}")

    # Fragments React équilibrés
    fo = len(re.findall(r'(?<![a-zA-Z=])<>(?![a-zA-Z])', src))
    fc = len(re.findall(r'</>', src))
    if fo != fc:
        errors.append(f"FRAGMENTS REACT DÉSÉQUILIBRÉS: <> x{fo} vs </> x{fc}")

    # Strings cassées (saut de ligne réel dans guillemets)
    if len(re.findall(r'[+]\s*"\s*\n\s*"', src)) > 0:
        errors.append("STRING CASSÉE: guillemets avec saut de ligne réel détecté")

    # Pas de <- dans JSX (typo fréquente)
    if len(re.findall(r'>\s*<-\s*[A-Za-z]', src)) > 0:
        errors.append("OPÉRATEUR <- INVALIDE détecté dans JSX")

    # Crochets équilibrés
    bo = src.count('[')
    bc = src.count(']')
    if bo != bc:
        errors.append(f"CROCHETS DÉSÉQUILIBRÉS: [ x{bo} vs ] x{bc}")

    return errors


def agent_02_fonctionnel(src):
    """
    Agent 02 — Fonctionnel
    Vérifie que toutes les fonctionnalités critiques sont présentes dans le code.
    BLOQUANT — vérifie l'intégrité fonctionnelle complète.
    """
    errors = []

    required_features = [
        ('step==="photos"', "STEP photos manquant"),
        ('step==="fiche"', "STEP fiche manquant"),
        ('step==="notes"', "STEP notes manquant"),
        ('step==="annonce"', "STEP annonce manquant"),
        ('step==="apercu"', "STEP apercu manquant"),
        ('step==="fiche_interne"', "STEP fiche_interne manquant"),
        ('homepage,setHomepage', "STATE homepage manquant"),
        ('code_postal', "CHAMP code_postal manquant"),
        ('sdb:""', "CHAMP sdb manquant"),
        ('wc:""', "CHAMP wc manquant"),
        ('garage:false', "CHAMP garage manquant"),
        ('poele_granules', "CHAMP poele_granules manquant"),
        ('chambre_parentale', "CHAMP chambre_parentale manquant"),
        ('notes_agent', "CHAMP notes_agent manquant"),
        ('conso_kwh_n1', "CHAMP conso_kwh_n1 manquant"),
        ('triple_vitrage', "CHAMP triple_vitrage manquant"),
        ('async function runAnalysis', "FONCTION runAnalysis manquante"),
        ('async function urlToB64', "FONCTION urlToB64 manquante"),
        ('async function genAnnonce', "FONCTION genAnnonce manquante"),
        ('function saveAnnonce', "FONCTION saveAnnonce manquante"),
        ('imoimoimoiaia', "MDP admin manquant"),
        ('VITE_ANTHROPIC_KEY', "CLÉ API via env manquante"),
        ('claude-haiku', "MODÈLE Haiku manquant"),
    ]

    for marker, error_msg in required_features:
        if marker not in src:
            errors.append(error_msg)

    if 'sk-ant-api' in src:
        errors.append("CLÉ API HARDCODÉE DÉTECTÉE — DANGER CRITIQUE")

    return errors


def agent_03_predeploy(src, filepath=""):
    """
    Agent 03 — Pre-Deploy
    Checklist complète avant déploiement Vercel.
    BLOQUANT — dernière vérification avant push GitHub.
    """
    errors = []
    warnings = []

    size_kb = len(src.encode('utf-8')) / 1024
    if size_kb > 1000:
        errors.append(f"FICHIER TROP LOURD: {size_kb:.0f}KB — Vercel peut rejeter")
    elif size_kb > 500:
        warnings.append(f"Fichier lourd: {size_kb:.0f}KB — surveiller")

    lines = src.split('\n')
    for i, line in enumerate(lines[:50]):
        if any(ord(c) > 127 for c in line) and not line.strip().startswith('//'):
            errors.append(f"CARACTÈRE NON-ASCII ligne {i+1} (zone critique du code)")

    if 'export default function App' not in src:
        errors.append("EXPORT DEFAULT manquant — le build va échouer")

    if 'import { useState' not in src:
        errors.append("IMPORT REACT manquant")

    logs = re.findall(r'console\.log\(', src)
    if len(logs) > 10:
        warnings.append(f"CONSOLE.LOG nombreux: {len(logs)} occurrences — nettoyer si possible")

    todos = re.findall(r'//\s*(TODO|FIXME|HACK)', src)
    if todos:
        warnings.append(f"TODO/FIXME restants: {len(todos)}")

    return errors, warnings


def agent_04_regression(src, previous_src=None):
    """
    Agent 04 — Régression
    Compare avec une version précédente pour détecter une perte de fonctionnalité.
    BLOQUANT si previous_src est fourni et qu'une régression est détectée.
    """
    errors = []

    if previous_src is None:
        return errors  # Pas de comparaison possible, on passe

    # Liste des marqueurs critiques qui ne doivent JAMAIS disparaître
    critical_markers = [
        'imoimoimoiaia', 'VITE_ANTHROPIC_KEY', 'function saveAnnonce',
        'async function runAnalysis', 'async function genAnnonce',
        'homepage,setHomepage', 'code_postal', 'triple_vitrage',
    ]

    for marker in critical_markers:
        was_present = marker in previous_src
        is_present = marker in src
        if was_present and not is_present:
            errors.append(f"RÉGRESSION DÉTECTÉE: '{marker}' présent avant, absent maintenant")

    # Vérifier que la taille n'a pas drastiquement chuté (signe de perte de code)
    prev_lines = count_lines(previous_src)
    curr_lines = count_lines(src)
    if curr_lines < prev_lines * 0.7:
        errors.append(
            f"RÉGRESSION TAILLE: {prev_lines} lignes avant → {curr_lines} lignes maintenant "
            f"(perte de {round((1-curr_lines/prev_lines)*100)}%)"
        )

    return errors

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 2 — DESIGN & UX (4 agents)
# ═══════════════════════════════════════════════════════════════

def agent_05_design_consistency(src):
    """
    Agent 05 — Design Consistency
    Vérifie que les couleurs et composants respectent le Design System (skill 01).
    """
    errors = []
    warnings = []

    # Couleurs officielles Zaymmo qui doivent être utilisées
    official_colors = ['#C8793A', '#00D4E8', '#080808', '#4AE88A', '#E84A4A']
    colors_found = sum(1 for c in official_colors if c in src)
    if colors_found < 3:
        warnings.append(f"Seulement {colors_found}/5 couleurs officielles détectées dans le code")

    # Détection de couleurs suspectes hors palette (hex à 6 chiffres hors liste connue)
    all_hex_colors = set(re.findall(r'#[0-9A-Fa-f]{6}\b', src))
    known_palette = {
        'C8793A', 'D4894A', '9A5018', 'A85C20', 'E09050', 'F0A060',
        '00D4E8', '00C4D8', '080808', '0C0A08', '0F0B07', '111008',
        '1A1410', 'E8D8C0', '8A7060', '3A2A1A', '4AE88A', 'E84A4A', 'E8B44A',
    }
    suspicious = [c for c in all_hex_colors if c.lstrip('#').upper() not in
                  {k.upper() for k in known_palette}]
    if len(suspicious) > 15:
        warnings.append(f"{len(suspicious)} couleurs hors palette officielle détectées — vérifier cohérence")

    # Border-radius cohérent (4px boutons, 12px cards selon skill 01)
    if 'borderRadius:4' not in src and 'borderRadius: 4' not in src:
        warnings.append("Aucun borderRadius:4 trouvé — vérifier le style boutons (skill 01)")

    return errors, warnings


def agent_06_responsive(src):
    """
    Agent 06 — Responsive
    Vérifie les patterns responsive mobile-first (skill 26, 61).
    """
    errors = []
    warnings = []

    if 'maxWidth' not in src and 'max-width' not in src:
        warnings.append("Pas de maxWidth détecté — vérifier le centrage desktop")

    # Zones tactiles - chercher des paddings suspicieusement petits sur des boutons
    small_button_paddings = re.findall(r'padding:\s*["\']?[1-3]px', src)
    if len(small_button_paddings) > 5:
        warnings.append(f"{len(small_button_paddings)} paddings très petits détectés — vérifier zones tactiles ≥44px")

    return errors, warnings


def agent_07_animation(src):
    """
    Agent 07 — Animation
    Vérifie la présence des animations standard du Design System.
    """
    errors = []
    warnings = []

    required_animations = ['fadeUp', 'blink', 'glowCopper']
    missing = [a for a in required_animations if a not in src]
    if missing:
        warnings.append(f"Animations standard manquantes: {', '.join(missing)}")

    return errors, warnings


def agent_08_accessibilite(src):
    """
    Agent 08 — Accessibilité
    Vérifie les patterns d'accessibilité de base (skill 26, 60).
    """
    errors = []
    warnings = []

    if 'aria-label' not in src:
        warnings.append("Aucun aria-label détecté — vérifier les boutons icône-only")

    if 'role="alert"' not in src and 'role=\'alert\'' not in src:
        warnings.append("Pas de role='alert' détecté — erreurs non annoncées aux lecteurs d'écran")

    if 'role="status"' not in src:
        warnings.append("Pas de role='status' détecté — états de chargement non annoncés")

    return errors, warnings

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 3 — PIPELINE ZAYMMO (4 agents) — TOUS BLOQUANTS
# ═══════════════════════════════════════════════════════════════

def agent_09_pipeline_integrity(src):
    """
    Agent 09 — Pipeline Integrity
    Vérifie que le flux Photos→Analyse→Correction→Notes→Annonce est intact.
    BLOQUANT — c'est LE cœur fonctionnel de Zaymmo.
    """
    errors = []

    # Vérifier que chaque step a bien sa condition de rendu
    step_conditions = [
        'step==="photos"', 'step==="fiche"', 'step==="notes"',
        'step==="annonce"', 'step==="apercu"', 'step==="fiche_interne"',
    ]
    for cond in step_conditions:
        if cond not in src:
            errors.append(f"PIPELINE CASSÉ: condition '{cond}' absente")

    # Vérifier la navigation automatique après chaque étape clé
    if 'setStep("fiche")' not in src:
        errors.append("PIPELINE: navigation auto vers 'fiche' après analyse manquante")

    if 'setStep("annonce")' not in src:
        errors.append("PIPELINE: navigation auto vers 'annonce' après génération manquante")

    # Vérifier le step initial
    if 'useState("photos")' not in src:
        errors.append("PIPELINE: step initial doit être 'photos' (nouveau pipeline)")

    return errors


def agent_10_data_integrity(src):
    """
    Agent 10 — Data Integrity
    Vérifie la gestion propre de localStorage (historique, sauvegarde).
    BLOQUANT — protège contre la perte de données utilisateur.
    """
    errors = []

    required_storage_patterns = [
        ('zaymmo_history', "STORAGE historique manquant"),
        ('zaymmo_saved', "STORAGE sauvegardes manquant"),
        ('slice(0,50)', "LIMITE 50 entrées historique manquante"),
        ('slice(0, 30)', None),  # alternative syntax check below
    ]

    if 'zaymmo_history' not in src:
        errors.append("STORAGE historique manquant")
    if 'zaymmo_saved' not in src:
        errors.append("STORAGE sauvegardes manquant")
    if 'slice(0,50)' not in src and 'slice(0, 50)' not in src:
        errors.append("LIMITE 50 entrées historique manquante (fuite mémoire potentielle)")
    if 'slice(0,30)' not in src and 'slice(0, 30)' not in src:
        errors.append("LIMITE 30 annonces sauvegardées manquante")

    # Try/catch sur les accès localStorage
    if 'JSON.parse(localStorage' in src and 'try' not in src:
        errors.append("PARSING localStorage sans try/catch — risque de crash si données corrompues")

    return errors


def agent_11_prefill(src):
    """
    Agent 11 — Prefill
    Vérifie que l'IA pré-remplit bien la fiche après analyse.
    BLOQUANT — c'est le BUG HISTORIQUE le plus critique de Zaymmo, vérifié à chaque livraison.
    """
    errors = []

    if 'prefillFromSynth' not in src and 'setMeta(prev' not in src:
        errors.append(
            "BUG CRITIQUE HISTORIQUE: aucune fonction de pré-remplissage détectée "
            "— l'IA doit injecter synth dans meta après analyse"
        )

    # Vérifier que le pré-remplissage est appelé après l'analyse
    if 'setSynth(' in src:
        # Chercher si prefill est appelé proche de setSynth
        synth_positions = [m.start() for m in re.finditer(r'setSynth\(', src)]
        prefill_called_nearby = False
        for pos in synth_positions:
            nearby_code = src[pos:pos+500]
            if 'prefill' in nearby_code.lower() or 'setMeta(prev' in nearby_code:
                prefill_called_nearby = True
                break
        if not prefill_called_nearby and synth_positions:
            errors.append(
                "PRÉ-REMPLISSAGE NON CONNECTÉ: setSynth() appelé mais pas de prefill "
                "visible juste après — vérifier que meta est bien mis à jour"
            )

    return errors


def agent_12_navigation(src):
    """
    Agent 12 — Navigation
    Vérifie que tous les boutons retour/accueil/step sont fonctionnels.
    BLOQUANT — protège l'UX de navigation.
    """
    errors = []

    if 'setHomepage(true)' not in src:
        errors.append("BOUTON ACCUEIL: setHomepage(true) introuvable")

    if 'ACCUEIL' not in src.upper() and 'Accueil' not in src:
        errors.append("BOUTON ACCUEIL: texte du bouton introuvable")

    # Vérifier reset complet (bug historique "Nouvelle annonce ne repart pas de zéro")
    if 'resetAll' not in src and 'setSynth(null)' not in src:
        errors.append(
            "BUG HISTORIQUE: pas de fonction de reset complet détectée "
            "— 'Nouvelle annonce' doit repartir à zéro"
        )

    return errors

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 4 — INTELLIGENCE (4 agents)
# ═══════════════════════════════════════════════════════════════

def agent_13_multilingual(src):
    """
    Agent 13 — Multilingual
    Vérifie que toutes les langues sont complètes et le luxembourgeois correct.
    """
    errors = []
    warnings = []

    required_langs = ['fr:', 'en:', 'de:', 'lu:']
    for lang in required_langs:
        if lang not in src:
            errors.append(f"LANGUE MANQUANTE: bloc '{lang}' absent de I18N")

    # Règles grammaticales luxembourgeoises critiques (skill 07)
    lu_quality_markers = ['WICHTEG REEGELEN', 'wouer Investitioun', 'Keller (net Cave']
    lu_found = sum(1 for m in lu_quality_markers if m in src)
    if lu_found == 0:
        warnings.append("Règles grammaticales luxembourgeoises (skill 07) non détectées dans le prompt LU")

    # Vérifier les plateformes multi-pays
    required_platforms = ['athome', 'rightmove', 'immoweb', 'immoscout']
    missing_platforms = [p for p in required_platforms if p not in src]
    if missing_platforms:
        warnings.append(f"Plateformes manquantes possibles: {', '.join(missing_platforms)}")

    return errors, warnings


def agent_14_prompt_quality(src):
    """
    Agent 14 — Prompt Quality
    Vérifie que les prompts respectent les standards du skill 09.
    """
    errors = []
    warnings = []

    if 'JSON STRICT' not in src.upper() and 'json valide' not in src.lower():
        warnings.append("Demande de format JSON strict non détectée dans les prompts")

    if 'sans backticks' not in src.lower() and 'without backticks' not in src.lower():
        warnings.append("Instruction 'sans backticks' absente — risque de parsing JSON cassé")

    # Vérifier que la surface agent prime sur l'estimation IA (règle skill 09)
    if 'PRIORITAIRE' not in src.upper() and 'prend la priorité' not in src.lower():
        warnings.append("Règle de priorité surface agent > estimation IA non explicite dans le prompt")

    return errors, warnings


def agent_15_vision_quality(src):
    """
    Agent 15 — Vision Quality
    Vérifie la qualité du pipeline d'analyse photo (skill 10).
    """
    errors = []
    warnings = []

    if 'MAX_IMAGE_SIZE' not in src and '1024' not in src:
        warnings.append("Compression image (max 1024px) non détectée — coûts API potentiellement élevés")

    if 'image/jpeg", 0.85' not in src and "image/jpeg', 0.85" not in src:
        warnings.append("Qualité JPEG 85% non détectée dans la compression")

    if 'sleep(300)' not in src and 'await sleep' not in src:
        warnings.append("Pause entre analyses photo non détectée — risque de rate limiting API")

    return errors, warnings


def agent_16_zayzay(src):
    """
    Agent 16 — ZayZay
    Vérifie que le bot ZayZay est bien intégré (skill 11).
    """
    errors = []
    warnings = []

    if 'ZayZay' not in src and 'zayzay' not in src.lower():
        warnings.append("ZayZay bot non détecté dans le code — fonctionnalité skill 11 absente")

    if 'fill_fields' not in src:
        warnings.append("Fonction de remplissage assisté ZayZay (fill_fields) non détectée")

    return errors, warnings

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 5 — INNOVATION (4 agents)
# ═══════════════════════════════════════════════════════════════

def agent_17_staging_quality(src):
    """
    Agent 17 — Staging Quality
    Vérifie le module IA Staging (skill 27) — déclenchement manuel uniquement.
    """
    errors = []
    warnings = []

    if 'requestStaging' in src:
        # Si le staging existe, vérifier qu'il n'est jamais automatique
        if 'window.confirm' not in src:
            errors.append(
                "STAGING IA: pas de confirmation utilisateur détectée — "
                "le coût doit être affiché AVANT toute retouche (règle skill 27)"
            )

    return errors, warnings


def agent_18_security_audit(src):
    """
    Agent 18 — Security Audit
    Audit de sécurité complet (skills 25, 59, 63).
    BLOQUANT si clé API exposée.
    """
    errors = []
    warnings = []

    if 'sk-ant-api' in src:
        errors.append("CRITIQUE: clé API hardcodée détectée dans le code source")

    if re.search(r'console\.log\([^)]*password[^)]*\)', src, re.IGNORECASE):
        errors.append("CRITIQUE: possible log de mot de passe détecté")

    if 'sessionStorage' not in src:
        warnings.append("Pas de sessionStorage détecté — vérifier que l'auth n'utilise pas localStorage")

    if 'hashPassword' not in src and 'crypto.subtle' not in src:
        warnings.append("Pas de hashage de mot de passe détecté")

    return errors, warnings


def agent_19_performance(src):
    """
    Agent 19 — Performance
    Vérifie les optimisations de performance (skill 22).
    """
    errors = []
    warnings = []

    if 'URL.revokeObjectURL' not in src:
        warnings.append("Pas de URL.revokeObjectURL détecté — fuite mémoire potentielle sur les photos")

    if 'AbortSignal.timeout' not in src and 'AbortController' not in src:
        warnings.append("Pas de timeout sur les appels API détecté — risque de blocage indéfini")

    if 'mountedRef' not in src:
        warnings.append("Pas de mountedRef détecté — risque de setState après démontage")

    return errors, warnings


def agent_20_future_ready(src):
    """
    Agent 20 — Future Ready
    Vérifie que le code est prêt pour les évolutions Phase 2/3 (skill 46).
    """
    errors = []
    warnings = []

    # Vérifier l'absence de fonctions stockées dans les données (compatibilité API future)
    if 'function:' in src or '=> {' in src and 'localStorage.setItem' in src:
        pass  # Check informatif, pas critique en Phase 1

    # Vérifier le format de dates ISO (skill 46)
    if 'toISOString()' not in src:
        warnings.append("Pas de toISOString() détecté — vérifier le format de dates pour compatibilité future")

    return errors, warnings

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 6 — INTELLIGENCE AVANCÉE (4 agents)
# ═══════════════════════════════════════════════════════════════

def agent_21_scoring(src):
    """
    Agent 21 — Scoring
    Vérifie la cohérence du système de scoring (skill 13).
    """
    errors = []
    warnings = []

    if 'score_global' not in src:
        warnings.append("score_global non détecté — système de scoring incomplet")

    if 'getScoreLabel' not in src and 'ScoreCircle' not in src:
        warnings.append("Composant d'affichage du score non détecté")

    return errors, warnings


def agent_22_seo(src):
    """
    Agent 22 — SEO
    Vérifie l'optimisation SEO des annonces (skill 29).
    """
    errors = []
    warnings = []

    if 'TITLE_RULES' not in src and 'generateSEOTitle' not in src:
        warnings.append("Génération de titre SEO optimisé non détectée (skill 29)")

    return errors, warnings


def agent_23_emotion(src):
    """
    Agent 23 — Emotion
    Vérifie l'adaptation émotionnelle du ton (skill 57).
    """
    errors = []
    warnings = []

    if 'detectTargetProfile' not in src and 'EMOTION_PROFILES' not in src:
        warnings.append("Détection de profil acheteur cible non détectée (skill 57)")

    return errors, warnings


def agent_24_storytelling(src):
    """
    Agent 24 — Storytelling
    Vérifie que les annonces suivent la structure narrative (skill 14).
    """
    errors = []
    warnings = []

    if 'description_longue' not in src:
        errors.append("Champ description_longue manquant dans la structure annonce")

    # Vérifier la présence du call-to-action (règle storytelling acte 4)
    if 'call_to_action' not in src:
        warnings.append("call_to_action absent — l'acte 4 du storytelling (skill 14) doit être présent")

    return errors, warnings

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 7 — CONTENU (3 agents)
# ═══════════════════════════════════════════════════════════════

def agent_25_social_media(src):
    """
    Agent 25 — Social Media
    Vérifie le générateur de posts réseaux sociaux (skill 30).
    """
    errors = []
    warnings = []

    if 'generateInstagramPost' not in src and 'SOCIAL_FORMATS' not in src:
        warnings.append("Générateur de posts réseaux sociaux non détecté (skill 30)")

    return errors, warnings


def agent_26_email(src):
    """
    Agent 26 — Email
    Vérifie le générateur d'emails automatiques (skill 32).
    """
    errors = []
    warnings = []

    if 'EMAIL_TYPES' not in src and 'generatePresentationEmail' not in src:
        warnings.append("Générateur d'emails non détecté (skill 32)")

    if 'mailto:' not in src:
        warnings.append("Intégration mailto: non détectée pour ouverture app mail")

    return errors, warnings


def agent_27_qr_code(src):
    """
    Agent 27 — QR Code
    Vérifie la génération de QR codes (skill 31).
    """
    errors = []
    warnings = []

    if 'generateQRCodeURL' not in src and 'qrserver' not in src:
        warnings.append("Génération de QR code non détectée (skill 31)")

    return errors, warnings

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 8 — TECHNIQUE (3 agents)
# ═══════════════════════════════════════════════════════════════

def agent_28_offline_sync(src):
    """
    Agent 28 — Offline Sync
    Vérifie la gestion du mode hors-ligne (skill 44).
    """
    errors = []
    warnings = []

    if 'navigator.onLine' not in src and 'useNetworkStatus' not in src:
        warnings.append("Détection de connexion réseau non implémentée (skill 44)")

    return errors, warnings


def agent_29_pwa(src):
    """
    Agent 29 — PWA
    Vérifie l'installabilité PWA (skill 44).
    """
    errors = []
    warnings = []

    if 'serviceWorker' not in src and 'usePWAInstall' not in src:
        warnings.append("Service Worker / installation PWA non détectés (skill 44) — feature optionnelle Phase 1.5")

    return errors, warnings


def agent_30_api_ready(src):
    """
    Agent 30 — API Ready
    Vérifie que les structures de données sont API-ready (skill 46).
    """
    errors = []
    warnings = []

    # Vérifier l'absence de structures circulaires ou de fonctions stockées
    if 'exportAllDataAsJSON' not in src:
        warnings.append("Fonction d'export JSON global non détectée (skill 46) — préparation Phase 3")

    return errors, warnings

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 9 — BUSINESS (4 agents)
# ═══════════════════════════════════════════════════════════════

def agent_31_crm_integrity(src):
    """
    Agent 31 — CRM Integrity
    Vérifie la cohérence du mini-CRM (skill 36).
    """
    errors = []
    warnings = []

    if 'zaymmo_contacts' not in src:
        warnings.append("Storage CRM contacts non détecté (skill 36)")

    if 'findMatchingContacts' not in src and 'calculateMatchScore' not in src:
        warnings.append("Algorithme de matching acheteur-bien non détecté (skill 51)")

    return errors, warnings


def agent_32_reporting(src):
    """
    Agent 32 — Reporting
    Vérifie le système de reporting automatique (skill 37).
    """
    errors = []
    warnings = []

    if 'getGlobalStats' not in src and 'getStatsForPeriod' not in src:
        warnings.append("Système de statistiques globales non détecté (skill 37)")

    return errors, warnings


def agent_33_white_label(src):
    """
    Agent 33 — White Label
    Vérifie le profil agence personnalisable (skill 45).
    """
    errors = []
    warnings = []

    if 'zaymmo_profile' not in src and 'getProfile' not in src:
        warnings.append("Profil agence non détecté (skill 45)")

    return errors, warnings


def agent_34_benchmark(src):
    """
    Agent 34 — Benchmark
    Vérifie le benchmark interne (skill 38).
    """
    errors = []
    warnings = []

    if 'getInternalBenchmark' not in src:
        warnings.append("Benchmark interne non détecté (skill 38)")

    return errors, warnings

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 10 — QUALITÉ IA (4 agents)
# ═══════════════════════════════════════════════════════════════

def agent_35_brain_trainer(src):
    """
    Agent 35 — Brain Trainer
    Vérifie l'orchestration Zaymmo Brain (skill 53).
    """
    errors = []
    warnings = []

    if 'zaymmoBrainPipeline' not in src and 'getBrainRecommendation' not in src:
        warnings.append("Orchestrateur Zaymmo Brain non détecté (skill 53)")

    return errors, warnings


def agent_36_prediction_accuracy(src):
    """
    Agent 36 — Prediction Accuracy
    Vérifie les fonctions de prédiction (skill 55).
    """
    errors = []
    warnings = []

    if 'predictSaleDuration' not in src:
        warnings.append("Prédiction durée de vente non détectée (skill 55)")

    # Vérifier que les prédictions sont toujours marquées comme indicatives
    if 'predictSaleDuration' in src and 'indicatif' not in src.lower():
        warnings.append("Mention 'indicatif' absente — risque de présenter les prédictions comme garanties")

    return errors, warnings


def agent_37_market_pulse(src):
    """
    Agent 37 — Market Pulse
    Vérifie l'intelligence marché (skill 28, 52).
    """
    errors = []
    warnings = []

    if 'calculateNeuralPrice' not in src:
        warnings.append("Neural Price (estimation combinée multi-sources) non détecté (skill 52)")

    return errors, warnings


def agent_38_match_quality(src):
    """
    Agent 38 — Match Quality
    Vérifie l'algorithme de matching acheteur-bien (skill 51).
    """
    errors = []
    warnings = []

    if 'calculateMatchScore' not in src:
        warnings.append("Algorithme de matching non détecté (skill 51)")

    return errors, warnings

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 11 — AUTO-APPRENTISSAGE (2 agents)
# ═══════════════════════════════════════════════════════════════

def agent_39_self_improvement(src):
    """
    Agent 39 — Self-Improvement
    Vérifie le système d'auto-apprentissage (skill 15).
    """
    errors = []
    warnings = []

    if 'zaymmo_learning' not in src and 'collectCorrections' not in src:
        warnings.append("Système Self-Learning non détecté (skill 15)")

    return errors, warnings


def agent_40_feedback_analyzer(src):
    """
    Agent 40 — Feedback Analyzer
    Vérifie le système de feedback (skill 17).
    """
    errors = []
    warnings = []

    if 'zaymmo_feedback' not in src and 'saveFeedback' not in src:
        warnings.append("Système Feedback Loop non détecté (skill 17)")

    return errors, warnings

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 12 — CERTIFICATION & FORMATION (2 agents)
# ═══════════════════════════════════════════════════════════════

def agent_41_training_evaluator(src):
    """
    Agent 41 — Training Evaluator
    Vérifie le système de formation continue (skill 47).
    """
    errors = []
    warnings = []

    if 'getAgentLevel' not in src and 'TRAINING_TIPS' not in src:
        warnings.append("Système de formation/conseils contextuels non détecté (skill 47)")

    return errors, warnings


def agent_42_certification_guard(src):
    """
    Agent 42 — Certification Guard
    Vérifie le système de certification qualité (skill 49).
    """
    errors = []
    warnings = []

    if 'checkCertificationCriteria' not in src:
        warnings.append("Système de certification des annonces non détecté (skill 49)")

    return errors, warnings

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 13 — DURABILITÉ (2 agents)
# ═══════════════════════════════════════════════════════════════

def agent_43_green_validator(src):
    """
    Agent 43 — Green Validator
    Vérifie le calcul du Green Score (skill 41).
    """
    errors = []
    warnings = []

    if 'calculateGreenScore' not in src:
        warnings.append("Calcul du Green Score non détecté (skill 41)")

    return errors, warnings


def agent_44_renovation_estimator(src):
    """
    Agent 44 — Renovation Estimator
    Vérifie le plan de rénovation optimisé (skill 56).
    """
    errors = []
    warnings = []

    if 'generateRenovationPlan' not in src and 'RENOVATION_ROI' not in src:
        warnings.append("Plan de rénovation ROI non détecté (skill 56)")

    return errors, warnings

# ═══════════════════════════════════════════════════════════════
# CATÉGORIE 14 — SÉCURITÉ AVANCÉE (2 agents) — BLOQUANTS
# ═══════════════════════════════════════════════════════════════

def agent_45_ironclaw_guard(src):
    """
    Agent 45 — Ironclaw Guard
    Vérifie la protection contre l'injection de prompt (skill 59, 64).
    BLOQUANT — sécurité IA critique.
    """
    errors = []

    # Si notes_agent existe, vérifier qu'il y a une sanitization avant prompt
    if 'notes_agent' in src:
        if 'sanitizeForPrompt' not in src and 'sanitizeNotesForPrompt' not in src:
            errors.append(
                "SÉCURITÉ CRITIQUE: notes_agent injecté dans les prompts sans sanitization "
                "détectée — risque de prompt injection (skill 59, LLM01)"
            )

    return errors


def agent_46_rgpd_compliance(src):
    """
    Agent 46 — RGPD Compliance
    Vérifie la conformité RGPD de base (skill 16, 64).
    BLOQUANT — conformité légale.
    """
    errors = []

    if 'localStorage' in src and 'RGPD' not in src and 'rgpd' not in src.lower():
        pass  # Pas bloquant en soi, juste informatif

    # Vérifier qu'il existe un moyen de supprimer les données
    if 'deleteHistoryEntry' not in src and 'deleteSaved' not in src:
        errors.append(
            "RGPD: aucune fonction de suppression de données détectée — "
            "le droit à l'effacement doit être implémenté"
        )

    return errors


# ═══════════════════════════════════════════════════════════════
# REGISTRE COMPLET DES AGENTS
# ═══════════════════════════════════════════════════════════════

AGENT_REGISTRY = {
    "pipeline_qualite": {
        "label": "Pipeline Qualité (BLOQUANT)",
        "agents": [
            ("01", "Syntaxe", agent_01_syntaxe, "single"),
            ("02", "Fonctionnel", agent_02_fonctionnel, "single"),
            ("03", "Pre-Deploy", agent_03_predeploy, "tuple"),
            ("04", "Regression", agent_04_regression, "regression"),
        ],
        "blocking": True,
    },
    "design_ux": {
        "label": "Design & UX",
        "agents": [
            ("05", "Design Consistency", agent_05_design_consistency, "tuple"),
            ("06", "Responsive", agent_06_responsive, "tuple"),
            ("07", "Animation", agent_07_animation, "tuple"),
            ("08", "Accessibilité", agent_08_accessibilite, "tuple"),
        ],
        "blocking": False,
    },
    "pipeline_zaymmo": {
        "label": "Pipeline Zaymmo (BLOQUANT)",
        "agents": [
            ("09", "Pipeline Integrity", agent_09_pipeline_integrity, "single"),
            ("10", "Data Integrity", agent_10_data_integrity, "single"),
            ("11", "Prefill", agent_11_prefill, "single"),
            ("12", "Navigation", agent_12_navigation, "single"),
        ],
        "blocking": True,
    },
    "intelligence": {
        "label": "Intelligence",
        "agents": [
            ("13", "Multilingual", agent_13_multilingual, "tuple"),
            ("14", "Prompt Quality", agent_14_prompt_quality, "tuple"),
            ("15", "Vision Quality", agent_15_vision_quality, "tuple"),
            ("16", "ZayZay", agent_16_zayzay, "tuple"),
        ],
        "blocking": False,
    },
    "innovation": {
        "label": "Innovation",
        "agents": [
            ("17", "Staging Quality", agent_17_staging_quality, "tuple"),
            ("18", "Security Audit", agent_18_security_audit, "tuple"),
            ("19", "Performance", agent_19_performance, "tuple"),
            ("20", "Future Ready", agent_20_future_ready, "tuple"),
        ],
        "blocking": False,
    },
    "intelligence_avancee": {
        "label": "Intelligence avancée",
        "agents": [
            ("21", "Scoring", agent_21_scoring, "tuple"),
            ("22", "SEO", agent_22_seo, "tuple"),
            ("23", "Emotion", agent_23_emotion, "tuple"),
            ("24", "Storytelling", agent_24_storytelling, "tuple"),
        ],
        "blocking": False,
    },
    "contenu": {
        "label": "Contenu",
        "agents": [
            ("25", "Social Media", agent_25_social_media, "tuple"),
            ("26", "Email", agent_26_email, "tuple"),
            ("27", "QR Code", agent_27_qr_code, "tuple"),
        ],
        "blocking": False,
    },
    "technique": {
        "label": "Technique",
        "agents": [
            ("28", "Offline Sync", agent_28_offline_sync, "tuple"),
            ("29", "PWA", agent_29_pwa, "tuple"),
            ("30", "API Ready", agent_30_api_ready, "tuple"),
        ],
        "blocking": False,
    },
    "business": {
        "label": "Business",
        "agents": [
            ("31", "CRM Integrity", agent_31_crm_integrity, "tuple"),
            ("32", "Reporting", agent_32_reporting, "tuple"),
            ("33", "White Label", agent_33_white_label, "tuple"),
            ("34", "Benchmark", agent_34_benchmark, "tuple"),
        ],
        "blocking": False,
    },
    "qualite_ia": {
        "label": "Qualité IA",
        "agents": [
            ("35", "Brain Trainer", agent_35_brain_trainer, "tuple"),
            ("36", "Prediction Accuracy", agent_36_prediction_accuracy, "tuple"),
            ("37", "Market Pulse", agent_37_market_pulse, "tuple"),
            ("38", "Match Quality", agent_38_match_quality, "tuple"),
        ],
        "blocking": False,
    },
    "auto_apprentissage": {
        "label": "Auto-apprentissage",
        "agents": [
            ("39", "Self-Improvement", agent_39_self_improvement, "tuple"),
            ("40", "Feedback Analyzer", agent_40_feedback_analyzer, "tuple"),
        ],
        "blocking": False,
    },
    "certification_formation": {
        "label": "Certification & Formation",
        "agents": [
            ("41", "Training Evaluator", agent_41_training_evaluator, "tuple"),
            ("42", "Certification Guard", agent_42_certification_guard, "tuple"),
        ],
        "blocking": False,
    },
    "durabilite": {
        "label": "Durabilité",
        "agents": [
            ("43", "Green Validator", agent_43_green_validator, "tuple"),
            ("44", "Renovation Estimator", agent_44_renovation_estimator, "tuple"),
        ],
        "blocking": False,
    },
    "securite_avancee": {
        "label": "Sécurité avancée (BLOQUANT)",
        "agents": [
            ("45", "Ironclaw Guard", agent_45_ironclaw_guard, "single"),
            ("46", "RGPD Compliance", agent_46_rgpd_compliance, "single"),
        ],
        "blocking": True,
    },
}

# ═══════════════════════════════════════════════════════════════
# ORCHESTRATEUR PRINCIPAL
# ═══════════════════════════════════════════════════════════════

def run_agent(agent_id, label, fn, kind, src, previous_src=None, filepath=""):
    """Exécute un agent et normalise son résultat (errors, warnings)."""
    try:
        if kind == "single":
            errors = fn(src)
            warnings = []
        elif kind == "tuple":
            errors, warnings = fn(src)
        elif kind == "regression":
            errors = fn(src, previous_src)
            warnings = []
        else:
            errors, warnings = [], []
    except Exception as e:
        errors = [f"AGENT CRASH: {str(e)}"]
        warnings = []

    return {
        "id": agent_id,
        "label": label,
        "errors": errors,
        "warnings": warnings,
        "passed": len(errors) == 0,
    }


def run_all_agents(filepath, previous_filepath=None, only_ids=None, only_category=None):
    """
    Lance tous les agents (ou un sous-ensemble) et génère le rapport complet.
    """
    src = load_source(filepath)
    previous_src = load_source(previous_filepath) if previous_filepath else None

    sep = "=" * 70
    print(sep)
    print("ZAYMMO AGENTS — RAPPORT COMPLET DE QUALITÉ")
    print(sep)
    print(f"Fichier analysé : {filepath}")
    print(f"Date            : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Taille          : {round(len(src.encode('utf-8'))/1024)}KB | {count_lines(src)} lignes")
    print(sep)

    all_results = []
    blocking_errors = []
    total_warnings = []

    for cat_key, cat_data in AGENT_REGISTRY.items():
        if only_category and cat_key != only_category:
            continue

        cat_agents = cat_data["agents"]
        if only_ids:
            cat_agents = [a for a in cat_agents if a[0] in only_ids]
        if not cat_agents:
            continue

        print(f"\n── {cat_data['label']} ──")

        for agent_id, label, fn, kind in cat_agents:
            result = run_agent(agent_id, label, fn, kind, src, previous_src, filepath)
            all_results.append(result)

            status = "OK" if result["passed"] else "XX"
            print(f"  [{agent_id}] {status} {label}")

            for e in result["errors"]:
                print(f"        !! {e}")
                if cat_data["blocking"]:
                    blocking_errors.append(f"[{agent_id}] {label}: {e}")

            for w in result["warnings"]:
                print(f"        ?? {w}")
                total_warnings.append(f"[{agent_id}] {label}: {w}")

    # ── RAPPORT FINAL ──────────────────────────────────────────
    print("\n" + sep)
    total_agents = len(all_results)
    passed_agents = sum(1 for r in all_results if r["passed"])

    print(f"AGENTS EXÉCUTÉS : {total_agents}")
    print(f"AGENTS RÉUSSIS  : {passed_agents}/{total_agents}")
    print(f"ERREURS BLOQUANTES : {len(blocking_errors)}")
    print(f"WARNINGS (non bloquants) : {len(total_warnings)}")
    print(sep)

    if blocking_errors:
        print("\n🔴 LIVRAISON BLOQUÉE — Erreurs critiques à corriger :")
        for e in blocking_errors:
            print(f"  !! {e}")
        return False
    elif total_warnings:
        print("\n🟡 ZAYMMO CERTIFIÉ AVEC AVERTISSEMENTS")
        print(f"   {len(total_warnings)} amélioration(s) recommandée(s) mais non bloquante(s)")
        return True
    else:
        print("\n🟢 ZAYMMO CERTIFIÉ — TOUS LES AGENTS VERTS — LIVRAISON AUTORISÉE")
        return True


def generate_json_report(filepath, output_path=None):
    """Génère un rapport JSON exploitable pour suivi historique."""
    src = load_source(filepath)
    report = {
        "timestamp": datetime.now().isoformat(),
        "file": filepath,
        "size_kb": round(len(src.encode('utf-8')) / 1024),
        "lines": count_lines(src),
        "categories": {},
    }

    for cat_key, cat_data in AGENT_REGISTRY.items():
        cat_results = []
        for agent_id, label, fn, kind in cat_data["agents"]:
            result = run_agent(agent_id, label, fn, kind, src)
            cat_results.append({
                "id": result["id"],
                "label": result["label"],
                "passed": result["passed"],
                "errors": result["errors"],
                "warnings": result["warnings"],
            })
        report["categories"][cat_key] = {
            "label": cat_data["label"],
            "blocking": cat_data["blocking"],
            "agents": cat_results,
        }

    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"Rapport JSON sauvegardé : {output_path}")

    return report


# ═══════════════════════════════════════════════════════════════
# CLI — POINT D'ENTRÉE
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    args = sys.argv[1:]

    if not args:
        filepath = "src/App.jsx"
    else:
        filepath = args[0]

    only_ids = None
    only_category = None
    previous_filepath = None
    json_output = None

    for arg in args[1:]:
        if arg.startswith("--only="):
            only_ids = arg.split("=")[1].split(",")
        elif arg.startswith("--category="):
            only_category = arg.split("=")[1]
        elif arg.startswith("--previous="):
            previous_filepath = arg.split("=")[1]
        elif arg.startswith("--json="):
            json_output = arg.split("=")[1]

    if json_output:
        generate_json_report(filepath, json_output)
    else:
        success = run_all_agents(
            filepath,
            previous_filepath=previous_filepath,
            only_ids=only_ids,
            only_category=only_category,
        )
        sys.exit(0 if success else 1)
