---
name: zaymmo-seo-plateformes
description: Optimisation SEO des annonces Zaymmo pour chaque plateforme immobilière. Lire avant toute modification de la génération de titre, mots-clés ou structure d'annonce. Maximise la visibilité sur LeBonCoin, SeLoger, Athome et autres plateformes.
---

# Zaymmo SEO Plateformes

## PRINCIPE

Chaque plateforme a son propre algorithme de recherche.
Une annonce bien optimisée apparaît plus haut dans les résultats.

---

## RÈGLES TITRE PAR PLATEFORME

```javascript
const TITLE_RULES = {
  leboncoin: {
    maxLength: 75,
    structure: "[Type] [Surface]m² [Pièces]p - [Ville]",
    motsClesPrioritaires: ["type bien", "surface", "ville", "nb pièces"],
    exemple: "Maison 170m² 5p - Saint-Ail - Jardin",
  },
  seloger: {
    maxLength: 70,
    structure: "[Type] [Pièces]P [Surface]m² [Quartier/Ville]",
    motsClesPrioritaires: ["type", "pièces", "surface", "quartier"],
    exemple: "Maison 5P 170m² Saint-Ail - Terrain 2700m²",
  },
  pap: {
    maxLength: 80,
    structure: "[Type] de [Surface]m² à [Ville] - [Atout principal]",
    motsClesPrioritaires: ["type", "surface", "ville", "atout unique"],
    exemple: "Maison de 170m² à Saint-Ail - Terrain 2700m² sans vis-à-vis",
  },
  athome: {
    maxLength: 70,
    structure: "[Type] - [Ville] - [Surface]m² - [DPE]",
    motsClesPrioritaires: ["type", "ville", "surface", "dpe"],
    exemple: "Maison - Luxembourg-Ville - 185m² - DPE B",
  },
  immoweb: {
    maxLength: 75,
    structure: "[Type] [Pièces] ch. à [Ville]",
    motsClesPrioritaires: ["type", "chambres", "ville"],
    exemple: "Maison 4 ch. à Bruxelles",
  },
  rightmove: {
    maxLength: 65,
    structure: "[Bedrooms] bed [Type] for sale in [Location]",
    motsClesPrioritaires: ["bedrooms", "type", "location"],
    exemple: "4 bed Detached house for sale in Manchester",
  },
};
```

---

## GÉNÉRATION TITRE OPTIMISÉ

```javascript
function generateSEOTitle(meta, synth, platform) {
  const rules = TITLE_RULES[platform] || TITLE_RULES.leboncoin;
  const surface = meta.surface || synth?.surface_totale_estimee?.replace(/[^0-9]/g, "");
  const pieces = meta.pieces;
  const ville = meta.ville;
  const type = meta.type;

  let title = "";

  switch(platform) {
    case "leboncoin":
      title = `${type} ${surface}m²${pieces ? ` ${pieces}p` : ""} - ${ville}`;
      if (meta.jardin) title += " - Jardin";
      else if (meta.terrasse) title += " - Terrasse";
      break;

    case "seloger":
      title = `${type} ${pieces ? `${pieces}P ` : ""}${surface}m² ${ville}`;
      if (meta.terrain) title += ` - Terrain ${meta.terrain}m²`;
      break;

    case "athome":
      title = `${type} - ${ville} - ${surface}m²`;
      if (meta.dpe && meta.dpe !== "Non renseigne") title += ` - DPE ${meta.dpe}`;
      break;

    default:
      title = `${type} ${surface}m² - ${ville}`;
  }

  // Tronquer si trop long
  if (title.length > rules.maxLength) {
    title = title.slice(0, rules.maxLength - 3) + "...";
  }

  return title;
}
```

---

## MOTS-CLÉS PAR TYPE DE RECHERCHE

```javascript
// Les acheteurs recherchent souvent par ces termes — les inclure naturellement
const SEARCH_KEYWORDS = {
  fr: {
    localisation: ["proche centre-ville", "quartier calme", "à pied de", "accès rapide"],
    qualite_vie: ["sans vis-à-vis", "lumineux", "calme", "résidentiel"],
    investissement: ["bon état", "rénové", "aux normes", "économies d'énergie"],
    famille: ["proche écoles", "quartier familial", "espace vert", "jardin"],
    transport: ["proche gare", "transports en commun", "accès autoroute"],
  },
  en: {
    localisation: ["close to center", "quiet neighbourhood", "walking distance"],
    qualite_vie: ["no overlook", "bright", "quiet", "residential"],
    investissement: ["good condition", "renovated", "energy efficient"],
    famille: ["near schools", "family friendly", "green space", "garden"],
    transport: ["near station", "public transport", "motorway access"],
  },
};

function injectKeywords(description, meta, lang = "fr") {
  const keywords = SEARCH_KEYWORDS[lang] || SEARCH_KEYWORDS.fr;
  let enriched = description;

  // Ajouter naturellement selon les caractéristiques du bien
  if (meta.jardin && !description.includes("jardin")) {
    // Le mot jardin devrait déjà être présent via les équipements
  }

  return enriched; // Les mots-clés sont gérés nativement par le prompt storytelling
}
```

---

## STRUCTURE OPTIMALE DESCRIPTION

```javascript
const SEO_DESCRIPTION_STRUCTURE = {
  premiere_phrase: "Doit contenir : type de bien + ville + surface (les 3 critères de recherche principaux)",
  premier_paragraphe: "Doit contenir : nombre de pièces, atout principal, localisation précise",
  mots_cles_naturels: "DPE, surface, ville, type de bien répétés naturellement 2-3 fois max",
  call_to_action: "Inciter à la prise de contact — améliore le taux de clic",
};
```

---

## OPTIMISATION AI-SEO (recherche IA / GEO)

```javascript
// Pour les moteurs IA (ChatGPT, Perplexity, Google AI Overview)
// qui résument et recommandent des biens

const AI_SEO_PROMPT_ADDITION = `
Pour optimiser la visibilité auprès des moteurs de recherche IA:
- Structurer l'information de façon claire et factuelle dans le premier paragraphe
- Inclure des données chiffrées précises (surface exacte, prix, DPE)
- Répondre implicitement aux questions fréquentes (pièces, chambres, équipements)
- Éviter le jargon marketing pur — privilégier les faits vérifiables
`;

// Format de données structurées (pour usage futur site web Zaymmo)
function generateStructuredData(meta, synth) {
  return {
    "@context": "https://schema.org",
    "@type": "House",
    "name": `${meta.type} ${meta.surface}m² ${meta.ville}`,
    "numberOfRooms": meta.pieces,
    "numberOfBedrooms": meta.chambres,
    "floorSize": { "@type": "QuantitativeValue", "value": meta.surface, "unitCode": "MTK" },
    "address": { "@type": "PostalAddress", "addressLocality": meta.ville, "postalCode": meta.code_postal },
    "offers": { "@type": "Offer", "price": meta.prix, "priceCurrency": meta.devise },
  };
}
```

---

## HASHTAGS RÉSEAUX SOCIAUX

```javascript
function generateHashtags(meta, synth) {
  const tags = [
    "#immobilier",
    `#${meta.type?.toLowerCase().replace(/\s/g, "")}`,
    `#${meta.ville?.toLowerCase().replace(/[\s-]/g, "")}`,
  ];

  if (meta.pays === "lu") tags.push("#luxembourg", "#immolux");
  if (meta.pays === "fr") tags.push("#immofrance", "#avendre");
  if (meta.pays === "be") tags.push("#immobelgique");

  if (["A","B"].includes(meta.dpe)) tags.push("#ecologique", "#economiesenergie");
  if (meta.piscine) tags.push("#piscine");
  if (meta.jardin) tags.push("#jardin");
  if (synth?.score_global >= 8) tags.push("#coupdecoeur");

  return tags.slice(0, 8); // Max 8 hashtags pertinents
}
```

---

## CHECKLIST SEO PAR ANNONCE

```
✓ Titre contient type + surface + ville
✓ Titre respecte la longueur max de la plateforme
✓ Premier paragraphe contient les infos clés (pièces, atout, lieu)
✓ DPE mentionné si renseigné
✓ Pas de répétition excessive de mots-clés (sur-optimisation)
✓ Call-to-action présent en fin d'annonce
✓ Hashtags pertinents générés pour réseaux sociaux
```
