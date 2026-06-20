---
name: zaymmo-network-agences
description: Réseau inter-agences Zaymmo. Lire avant toute modification du partage de données entre agences. Architecture préparée pour la Phase 3 SaaS où plusieurs agences partagent une intelligence de marché collective.
---

# Zaymmo Network Agences

## PRINCIPE

Phase 1 : Mono-agence — pas de réseau actif.
Phase 3 SaaS : Les agences utilisatrices peuvent partager anonymement
des données de marché agrégées pour enrichir l'intelligence collective.

---

## DONNÉES PARTAGEABLES (anonymisées)

```javascript
// Ce qui POURRAIT être partagé entre agences (Phase 3, opt-in uniquement)
const SHAREABLE_DATA_TYPES = {
  prixM2ParSecteur: {
    description: "Prix moyen au m² par ville/quartier",
    anonymise: true,
    utilite: "Améliore les estimations de toutes les agences du réseau",
  },
  tendancesMarche: {
    description: "Évolution des prix par type de bien et région",
    anonymise: true,
    utilite: "Détection de tendances macro impossibles à voir seul",
  },
  dureeVenteMoyenne: {
    description: "Temps moyen de vente par caractéristiques",
    anonymise: true,
    utilite: "Affine les prédictions de durée de vente",
  },
};

// JAMAIS partagé même en réseau :
const NEVER_SHARED = [
  "Coordonnées clients/acheteurs",
  "Adresses exactes des biens",
  "Notes privées de l'agent",
  "Prix de négociation final",
  "Données personnelles de toute nature",
];
```

---

## ARCHITECTURE PHASE 3 — OPT-IN RÉSEAU

```javascript
// Structure préparée — inactive en Phase 1
const networkParticipationSchema = {
  agencyId: "unique_id",
  participation: false,  // Opt-in explicite requis
  dataSharedTypes: [],   // Sélection granulaire de ce qui est partagé
  consentDate: null,
  benefitsReceived: {
    marketDataAccess: false,
    trendAlerts: false,
  },
};

function enableNetworkParticipation(types) {
  // Phase 3 uniquement — nécessite consentement explicite RGPD
  console.log("Phase 3 feature: Network participation");
}
```

---

## BÉNÉFICES DU RÉSEAU (Phase 3)

```javascript
const NETWORK_BENEFITS = {
  donneesMarcheEnrichies: "Estimations plus précises grâce à des milliers de transactions",
  alertesOpportunites: "Détection de biens sous-évalués dans le réseau",
  benchmarkSectoriel: "Comparaison avec la moyenne du réseau, pas que vos propres biens",
  intelligenceCollective: "Plus d'agences utilisent Zaymmo, plus tout le monde y gagne",
};
```

---

## SIMULATION RÉSEAU (Phase 1 — données fictives illustratives)

```javascript
// En Phase 1, on peut montrer une preview de ce que serait le réseau
// avec des données d'exemple pour illustrer la valeur future

function getNetworkPreviewExample() {
  return {
    message: "Disponible en Phase SaaS — Rejoignez le réseau Zaymmo",
    exempleDonnee: {
      secteur: "Centre-ville type",
      prixM2Moyen: "Calculé sur 500+ transactions du réseau",
      tendance: "+3.2% sur 12 mois",
    },
  };
}
```

---

## COMPOSANT TEASER RÉSEAU (Phase 1)

```jsx
function NetworkTeaser() {
  return (
    <Card>
      <ST color="#00D4E8">RÉSEAU ZAYMMO</ST>

      <div style={{
        padding: 14, background: "#00D4E810", borderRadius: 8,
        border: "1px solid #00D4E830", textAlign: "center",
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🌐</div>
        <div style={{ fontSize: 12, color: "#00D4E8", fontWeight: 700, marginBottom: 6 }}>
          Bientôt disponible
        </div>
        <div style={{ fontSize: 11, color: "#8A7060", lineHeight: 1.5 }}>
          Connectez-vous au réseau d'agences Zaymmo pour des estimations
          encore plus précises basées sur des milliers de transactions.
        </div>
      </div>
    </Card>
  );
}
```

---

## PROTECTION DE LA CONCURRENCE LOYALE

```
Règles éthiques du futur réseau :
- Aucune agence ne voit les données spécifiques d'une autre agence
- Uniquement des agrégats anonymisés (moyennes, tendances)
- Pas de ciblage commercial entre agences concurrentes
- Opt-in explicite et révocable à tout moment
- Conformité RGPD stricte sur l'anonymisation
```
