---
name: zaymmo-reporting-automatique
description: Reporting automatique de Zaymmo. Lire avant toute modification du tableau de bord ou des statistiques d'activité. Génère des rapports automatiques pour suivre la performance de l'agent et de l'agence.
---

# Zaymmo Reporting Automatique

## PRINCIPE

Zaymmo génère automatiquement des statistiques d'activité
depuis les données déjà collectées (historique, sauvegardés, contacts, visites).
Pas de saisie supplémentaire requise.

---

## CALCUL STATISTIQUES GLOBALES

```javascript
function getGlobalStats() {
  const history  = JSON.parse(localStorage.getItem("zaymmo_history") || "[]");
  const saved    = JSON.parse(localStorage.getItem("zaymmo_saved") || "[]");
  const visits   = JSON.parse(localStorage.getItem("zaymmo_visits") || "[]");
  const contacts = JSON.parse(localStorage.getItem("zaymmo_contacts") || "[]");

  return {
    totalBiensAnalyses: history.length,
    totalAnnoncesGenerees: history.filter(h => h.annonce).length,
    totalAnnoncesSauvegardees: saved.length,
    totalVisitesPlanifiees: visits.length,
    totalVisitesRealisees: visits.filter(v => v.statut === "realisee").length,
    totalContacts: contacts.length,
    contactsActifs: contacts.filter(c => c.statut === "actif").length,
    scoreM oyen: history.filter(h => h.score)
      .reduce((a,b) => a + b.score, 0) / (history.filter(h=>h.score).length || 1),
  };
}
```

---

## STATISTIQUES PAR PÉRIODE

```javascript
function getStatsForPeriod(days = 7) {
  const history = JSON.parse(localStorage.getItem("zaymmo_history") || "[]");
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const recent = history.filter(h => new Date(h.createdAt) > cutoff);

  return {
    periode: `${days} derniers jours`,
    biensAnalyses: recent.length,
    parType: groupByType(recent),
    parVille: groupByVille(recent),
    scoreMoyen: recent.filter(h => h.score)
      .reduce((a,b) => a + b.score, 0) / (recent.filter(h=>h.score).length || 1),
    exportsPlateformes: recent.reduce((sum, h) => sum + (h.exported?.length || 0), 0),
  };
}

function groupByType(entries) {
  return entries.reduce((acc, h) => {
    acc[h.type] = (acc[h.type] || 0) + 1;
    return acc;
  }, {});
}

function groupByVille(entries) {
  return entries.reduce((acc, h) => {
    acc[h.ville] = (acc[h.ville] || 0) + 1;
    return acc;
  }, {});
}
```

---

## COMPOSANT DASHBOARD

```jsx
function ReportingDashboard() {
  const [period, setPeriod] = useState(7);
  const globalStats = getGlobalStats();
  const periodStats = getStatsForPeriod(period);

  return (
    <div>
      {/* Stats globales — cartes */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16,
      }}>
        <StatCard label="Biens analysés" value={globalStats.totalBiensAnalyses} color="#C8793A" />
        <StatCard label="Annonces générées" value={globalStats.totalAnnoncesGenerees} color="#00D4E8" />
        <StatCard label="Visites planifiées" value={globalStats.totalVisitesPlanifiees} color="#4AE88A" />
        <StatCard label="Contacts actifs" value={globalStats.contactsActifs} color="#E8B44A" />
      </div>

      {/* Sélecteur période */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[7, 30, 90].map(d => (
          <button key={d} onClick={() => setPeriod(d)}
            style={{
              fontSize: 11, padding: "5px 12px", borderRadius: 4,
              background: period === d ? "#C8793A20" : "transparent",
              color: period === d ? "#C8793A" : "#3A2A1A",
              border: "1px solid #1A1410",
            }}>
            {d}j
          </button>
        ))}
      </div>

      {/* Détail période */}
      <Card>
        <ST color="#C8793A">{periodStats.periode.toUpperCase()}</ST>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#C8793A" }}>
          {periodStats.biensAnalyses}
        </div>
        <div style={{ fontSize: 11, color: "#8A7060" }}>biens analysés</div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 1, marginBottom: 6 }}>
            PAR TYPE DE BIEN
          </div>
          {Object.entries(periodStats.parType).map(([type, count]) => (
            <div key={type} style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 11, color: "#8A7060", padding: "4px 0",
            }}>
              <span>{type}</span>
              <span style={{ color: "#C8793A" }}>{count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#0C0A08", borderRadius: 10, padding: 14,
      border: `1px solid ${color}20`,
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>
        {Math.round(value) || 0}
      </div>
      <div style={{ fontSize: 10, color: "#3A2A1A", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}
```

---

## RAPPORT HEBDOMADAIRE GÉNÉRÉ PAR IA

```javascript
async function generateWeeklyReport() {
  const stats = getStatsForPeriod(7);

  const prompt = `Génère un résumé d'activité hebdomadaire pour un agent immobilier.

DONNÉES:
${JSON.stringify(stats, null, 2)}

Rédige un résumé court (100 mots max) avec :
- Bilan de la semaine
- Point fort à souligner
- Suggestion d'amélioration

FORMAT JSON: {"resume": "texte du résumé"}`;

  return await callClaude(
    [{ role: "user", content: prompt }],
    "Assistant business immobilier. JSON uniquement."
  );
}
```

---

## EXPORT RAPPORT

```javascript
function exportReportAsText() {
  const stats = getGlobalStats();
  const period = getStatsForPeriod(30);

  const report = `RAPPORT ZAYMMO — ${new Date().toLocaleDateString("fr-FR")}

STATISTIQUES GLOBALES
Biens analysés: ${stats.totalBiensAnalyses}
Annonces générées: ${stats.totalAnnoncesGenerees}
Visites planifiées: ${stats.totalVisitesPlanifiees}
Contacts actifs: ${stats.contactsActifs}

30 DERNIERS JOURS
Biens analysés: ${period.biensAnalyses}
Score moyen: ${period.scoreMoyen.toFixed(1)}/10
Exports plateformes: ${period.exportsPlateformes}
`;

  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zaymmo_rapport_${new Date().toISOString().split("T")[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
```
