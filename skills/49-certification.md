---
name: zaymmo-certification
description: Certification qualité des annonces Zaymmo. Lire avant toute modification du badge de certification. Valide qu'une annonce respecte les standards de qualité Zaymmo avant publication.
---

# Zaymmo Certification

## PRINCIPE

Une annonce "Certifiée Zaymmo" respecte tous les critères de qualité.
Le badge peut être affiché sur les plateformes pour rassurer les acheteurs.

---

## CRITÈRES DE CERTIFICATION

```javascript
function checkCertificationCriteria(meta, synth, annonce, photos) {
  const checks = {
    photosMinimum: photos.length >= 5,
    photosAnalysees: photos.filter(p => p.data).length >= photos.length * 0.8,
    surfaceRenseignee: !!meta.surface,
    prixRenseigne: !!meta.prix,
    dpeRenseigne: meta.dpe && meta.dpe !== "Non renseigne",
    descriptionComplete: annonce?.description_longue?.length >= 800,
    pointsClesPresents: (annonce?.points_cles?.length || 0) >= 5,
    callToActionPresent: !!annonce?.call_to_action,
    scoreQualiteOK: (synth?.score_global || 0) >= 5,
    titreOptimise: (annonce?.titre_principal?.length || 0) >= 20,
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return {
    checks,
    score: Math.round((passed / total) * 100),
    certified: passed === total,
    passedCount: passed,
    totalCount: total,
  };
}
```

---

## LABELS DE CRITÈRES

```javascript
const CRITERIA_LABELS = {
  photosMinimum:       "Au moins 5 photos",
  photosAnalysees:     "Photos analysées par IA",
  surfaceRenseignee:   "Surface renseignée",
  prixRenseigne:       "Prix renseigné",
  dpeRenseigne:        "DPE renseigné",
  descriptionComplete: "Description complète (800+ caractères)",
  pointsClesPresents:  "5+ points clés",
  callToActionPresent: "Call-to-action présent",
  scoreQualiteOK:      "Score qualité IA ≥ 5/10",
  titreOptimise:       "Titre optimisé",
};
```

---

## COMPOSANT BADGE CERTIFICATION

```jsx
function CertificationBadge({ meta, synth, annonce, photos }) {
  const result = checkCertificationCriteria(meta, synth, annonce, photos);

  if (result.certified) {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 20,
        background: "#4AE88A15", border: "1px solid #4AE88A40",
      }}>
        <span style={{ fontSize: 14 }}>✓</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#4AE88A" }}>
          CERTIFIÉ ZAYMMO
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 12px", borderRadius: 20,
      background: "#E8B44A15", border: "1px solid #E8B44A40",
    }}>
      <span style={{ fontSize: 11, color: "#E8B44A" }}>
        Qualité {result.score}% — {result.passedCount}/{result.totalCount}
      </span>
    </div>
  );
}
```

---

## PANNEAU DÉTAIL CERTIFICATION

```jsx
function CertificationDetail({ meta, synth, annonce, photos }) {
  const result = checkCertificationCriteria(meta, synth, annonce, photos);

  return (
    <Card>
      <ST color={result.certified ? "#4AE88A" : "#E8B44A"}>
        CERTIFICATION QUALITÉ
      </ST>

      <CertificationBadge meta={meta} synth={synth} annonce={annonce} photos={photos} />

      <div style={{ marginTop: 14 }}>
        {Object.entries(result.checks).map(([key, passed]) => (
          <div key={key} style={{
            display: "flex", alignItems: "center", gap: 8,
            fontSize: 11, color: passed ? "#8A7060" : "#3A2A1A",
            padding: "5px 0",
          }}>
            <span style={{ color: passed ? "#4AE88A" : "#E84A4A" }}>
              {passed ? "✓" : "✗"}
            </span>
            {CRITERIA_LABELS[key]}
          </div>
        ))}
      </div>

      {!result.certified && (
        <div style={{
          marginTop: 10, padding: "8px 12px",
          background: "#E8B44A10", borderRadius: 6,
          fontSize: 10, color: "#E8B44A",
        }}>
          Complétez les critères manquants pour obtenir la certification
        </div>
      )}
    </Card>
  );
}
```

---

## MENTION DANS LA FICHE CLIENT

```jsx
// Afficher le badge sur la fiche imprimée si certifié
{result.certified && (
  <div style={{
    position: "absolute", top: 16, right: 16,
    fontSize: 8, color: "#4AE88A", fontWeight: 700,
    border: "1px solid #4AE88A40", borderRadius: 12,
    padding: "3px 8px",
  }}>
    ✓ CERTIFIÉ ZAYMMO
  </div>
)}
```

---

## INTÉGRATION DANS L'EXPORT PLATEFORME

```javascript
// Ajouter la mention dans le texte exporté si certifié
function getExportTextWithCertification(annonce, isCertified) {
  let text = annonce.description_longue;
  if (isCertified) {
    text += "\n\n✓ Annonce vérifiée et certifiée par Zaymmo AI";
  }
  return text;
}
```
