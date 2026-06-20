---
name: zaymmo-client-portal
description: Espace client Zaymmo. Lire avant toute modification du partage d'informations avec les vendeurs. Permet de générer un résumé partageable pour que le vendeur suive l'avancement de la vente de son bien.
---

# Zaymmo Client Portal

## PRINCIPE

Le vendeur n'a pas accès à Zaymmo directement (Phase 1),
mais l'agent peut générer un résumé partageable de l'avancement.
Phase SaaS future : vrai portail web avec login client.

---

## STRUCTURE RÉSUMÉ VENDEUR

```javascript
function generateVendorSummary(meta, synth, annonce, visits, exported) {
  return {
    bien: {
      titre: annonce?.titre_principal || `${meta.type} ${meta.ville}`,
      surface: meta.surface,
      prix: meta.prix,
    },
    statut: {
      annonceGeneree: !!annonce,
      plateformesExportees: exported || [],
      scoreQualite: synth?.score_global,
    },
    activite: {
      visitesPlanifiees: visits?.filter(v => v.statut === "planifiee").length || 0,
      visitesRealisees: visits?.filter(v => v.statut === "realisee").length || 0,
      derniereMaj: new Date().toISOString(),
    },
  };
}
```

---

## COMPOSANT RÉSUMÉ PARTAGEABLE

```jsx
function VendorSummaryCard({ meta, synth, annonce, visits, exported }) {
  const summary = generateVendorSummary(meta, synth, annonce, visits, exported);

  function generateShareableText() {
    return `SUIVI DE VOTRE BIEN — ${summary.bien.titre}

📊 Statut : ${summary.statut.annonceGeneree ? "Annonce active" : "En préparation"}
${summary.statut.scoreQualite ? `⭐ Score qualité : ${summary.statut.scoreQualite}/10` : ""}

📍 Diffusion :
${summary.statut.plateformesExportees.length > 0
  ? summary.statut.plateformesExportees.map(e => `✓ ${e.platform}`).join("\n")
  : "Pas encore diffusé"}

📅 Activité :
${summary.activite.visitesPlanifiees} visite(s) planifiée(s)
${summary.activite.visitesRealisees} visite(s) réalisée(s)

Mis à jour le ${new Date(summary.activite.derniereMaj).toLocaleDateString("fr-FR")}`;
  }

  function shareViaWhatsApp(telephone) {
    const text = encodeURIComponent(generateShareableText());
    window.open(`https://wa.me/${telephone}?text=${text}`, "_blank");
  }

  function copyShareableText() {
    navigator.clipboard.writeText(generateShareableText());
  }

  return (
    <Card>
      <ST color="#C8793A">SUIVI VENDEUR</ST>

      <div style={{
        background: "#0A0A0A", borderRadius: 8, padding: 12,
        fontSize: 11, color: "#C0A890", whiteSpace: "pre-wrap",
        marginBottom: 10,
      }}>
        {generateShareableText()}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={copyShareableText}
          style={{ flex: 1, padding: 10, fontSize: 11, background: "#C8793A20", color: "#C8793A" }}>
          Copier
        </button>
        <button onClick={() => shareViaWhatsApp("")}
          style={{ flex: 1, padding: 10, fontSize: 11, background: "#4AE88A20", color: "#4AE88A" }}>
          Envoyer WhatsApp
        </button>
      </div>
    </Card>
  );
}
```

---

## TIMELINE VISUELLE POUR VENDEUR

```jsx
function VendorTimeline({ historyEntry }) {
  if (!historyEntry?.timeline) return null;

  return (
    <div>
      <div style={{ fontSize: 10, color: "#3A2A1A", letterSpacing: 1, marginBottom: 10 }}>
        HISTORIQUE DE VOTRE BIEN
      </div>
      {historyEntry.timeline.map((t, i) => (
        <div key={i} style={{
          display: "flex", gap: 10, marginBottom: 12,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#C8793A", marginTop: 4, flexShrink: 0,
          }} />
          <div>
            <div style={{ fontSize: 12, color: "#E8D8C0" }}>{t.action}</div>
            <div style={{ fontSize: 10, color: "#3A2A1A" }}>
              {new Date(t.date).toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## PRÉPARATION PHASE SAAS — VRAI PORTAIL

```javascript
// Architecture prête pour Phase 3 (SaaS multi-agences)
// Chaque vendeur aura un login unique avec accès limité en lecture

const futureClientPortalSchema = {
  vendeurId: "unique_id",
  bienId: "history_entry_id",
  accesToken: "token_unique_genere",
  permissions: ["view_status", "view_timeline", "view_stats"],
  // PAS d'accès à : modification, suppression, autres biens
};

// URL future type : zaymmo.com/suivi/[accesToken]
```

---

## RAPPORT MENSUEL VENDEUR (généré par IA)

```javascript
async function generateMonthlyVendorReport(meta, synth, visits, exported) {
  const prompt = `Génère un rapport mensuel pour un vendeur immobilier.

BIEN: ${meta.type} ${meta.surface}m² à ${meta.ville}
Score qualité: ${synth?.score_global}/10
Visites: ${visits?.length || 0}
Plateformes: ${exported?.map(e=>e.platform).join(", ") || "aucune"}

Rédige un message rassurant et professionnel (100 mots max) résumant l'activité du mois.

FORMAT JSON: {"rapport": "texte"}`;

  return await callClaude(
    [{ role: "user", content: prompt }],
    "Agent immobilier rédigeant un rapport client. JSON uniquement."
  );
}
```
