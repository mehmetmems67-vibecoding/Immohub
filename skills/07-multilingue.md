---
name: zaymmo-multilingue
description: Règles multilingues complètes de Zaymmo. Lire avant toute génération d'annonce, traduction, adaptation de l'interface ou ajout de langue. Contient les règles grammaticales précises par langue, le vocabulaire immobilier validé et les pièges à éviter.
---

# Zaymmo Multilingue

## LANGUES SUPPORTÉES

```
fr → Français
en → English
de → Deutsch
lu → Lëtzebuergesch
nl → Nederlands
```

---

## STRUCTURE I18N

```javascript
const I18N = {
  fr: {
    steps: ["Photos","Infos bien","Notes","Annonce","Aperçu","Fiche"],
    typeBien: "Type de bien",
    surface: "Surface (m²)",
    prix: "Prix de vente",
    ville: "Ville / Quartier",
    pieces: "Nb pièces",
    chambres: "Nb chambres",
    etage: "Étage",
    annee: "Année construction",
    charges: "Charges/mois",
    addPhoto: "PHOTOS DU BIEN",
    analyser: "Analyser",
    genAnnonce: "Générer l'annonce →",
    apercu: "Aperçu",
    ficheTitle: "Fiche interne",
    equipements: "ÉQUIPEMENTS",
    infoSub: "INFORMATIONS DU BIEN",
    noKey: "Clé API manquante",
    runAnalysis: "Analyser les photos",
    equip: [
      ["cave","Cave"],["parking","Parking"],
      ["terrasse","Terrasse"],["balcon","Balcon"],
      ["jardin","Jardin"],["ascenseur","Ascenseur"],
      ["piscine","Piscine"],["gardien","Gardien"],
      ["digicode","Digicode"],["double_vitrage","Double vitrage"],
      ["triple_vitrage","Triple vitrage"],["fibre","Fibre"],
      ["cellier","Cellier"],["buanderie","Buanderie"],
      ["garage","Garage"]
    ],
  },
  en: {
    steps: ["Photos","Property info","Notes","Listing","Preview","Internal file"],
    typeBien: "Property type",
    surface: "Surface area (m²)",
    prix: "Asking price",
    ville: "City / District",
    pieces: "Nb rooms",
    chambres: "Nb bedrooms",
    etage: "Floor",
    annee: "Year built",
    charges: "Service charges/month",
    addPhoto: "PROPERTY PHOTOS",
    analyser: "Analyse",
    genAnnonce: "Generate listing →",
    apercu: "Preview",
    ficheTitle: "Internal file",
    equipements: "AMENITIES",
    infoSub: "PROPERTY INFORMATION",
    noKey: "API key missing",
    runAnalysis: "Analyse photos",
    equip: [
      ["cave","Cellar"],["parking","Parking"],
      ["terrasse","Terrace"],["balcon","Balcony"],
      ["jardin","Garden"],["ascenseur","Lift"],
      ["piscine","Swimming pool"],["gardien","Caretaker"],
      ["digicode","Entry code"],["double_vitrage","Double glazing"],
      ["triple_vitrage","Triple glazing"],["fibre","Fibre"],
      ["cellier","Utility room"],["buanderie","Laundry room"],
      ["garage","Garage"]
    ],
  },
  de: {
    steps: ["Fotos","Objektdaten","Notizen","Expose","Vorschau","Interne Akte"],
    typeBien: "Objekttyp",
    surface: "Wohnfläche (m²)",
    prix: "Kaufpreis",
    ville: "Stadt / Lage",
    pieces: "Zimmeranzahl",
    chambres: "Schlafzimmer",
    etage: "Stockwerk",
    annee: "Baujahr",
    charges: "Nebenkosten/Monat",
    addPhoto: "OBJEKTFOTOS",
    analyser: "Analysieren",
    genAnnonce: "Expose erstellen →",
    apercu: "Vorschau",
    ficheTitle: "Interne Akte",
    equipements: "AUSSTATTUNG",
    infoSub: "OBJEKTINFORMATIONEN",
    noKey: "API-Schlüssel fehlt",
    runAnalysis: "Fotos analysieren",
    equip: [
      ["cave","Keller"],["parking","Stellplatz"],
      ["terrasse","Terrasse"],["balcon","Balkon"],
      ["jardin","Garten"],["ascenseur","Aufzug"],
      ["piscine","Pool"],["gardien","Hausmeister"],
      ["digicode","Türcode"],["double_vitrage","Doppelverglasung"],
      ["triple_vitrage","Dreifachverglasung"],["fibre","Glasfaser"],
      ["cellier","Abstellraum"],["buanderie","Waschraum"],
      ["garage","Garage"]
    ],
  },
  lu: {
    steps: ["Fotoen","Infos Bett","Notizen","Annonce","Virschau","Intern Blat"],
    typeBien: "Typ vum Bett",
    surface: "Flach (m²)",
    prix: "Verkaafsprais",
    ville: "Stad / Quartier",
    pieces: "Unzuel Zëmmeren",
    chambres: "Schloofzëmmeren",
    etage: "Stack",
    annee: "Baujor",
    charges: "Käschten/Mount",
    addPhoto: "FOTOEN VUM BETT",
    analyser: "Analyséieren",
    genAnnonce: "Annonce erstellen →",
    apercu: "Virschau",
    ficheTitle: "Intern Blat",
    equipements: "AUSRÜSTUNG",
    infoSub: "INFORMATIOUNEN VUM BETT",
    noKey: "API Schlëssel feelt",
    runAnalysis: "Fotoen analyséieren",
    equip: [
      ["cave","Keller"],["parking","Parking"],
      ["terrasse","Terrass"],["balcon","Balkon"],
      ["jardin","Gaart"],["ascenseur","Lift"],
      ["piscine","Schwämmbad"],["gardien","Hausmeeschter"],
      ["digicode","Digicode"],["double_vitrage","Duebelgliesung"],
      ["triple_vitrage","Dräifachgliesung"],["fibre","Glasfaser"],
      ["cellier","Keller"],["buanderie","Wäschraum"],
      ["garage","Garage"]
    ],
  },
  nl: {
    steps: ["Foto's","Eigendomsinfo","Notities","Advertentie","Voorbeeld","Intern bestand"],
    typeBien: "Type eigendom",
    surface: "Oppervlakte (m²)",
    prix: "Verkoopprijs",
    ville: "Stad / Wijk",
    pieces: "Aantal kamers",
    chambres: "Slaapkamers",
    etage: "Verdieping",
    annee: "Bouwjaar",
    charges: "Servicekosten/maand",
    addPhoto: "FOTO'S VAN HET PAND",
    analyser: "Analyseren",
    genAnnonce: "Advertentie genereren →",
    apercu: "Voorbeeld",
    ficheTitle: "Intern bestand",
    equipements: "VOORZIENINGEN",
    infoSub: "EIGENDOMSINFORMATIE",
    noKey: "API-sleutel ontbreekt",
    runAnalysis: "Foto's analyseren",
    equip: [
      ["cave","Kelder"],["parking","Parkeerplaats"],
      ["terrasse","Terras"],["balcon","Balkon"],
      ["jardin","Tuin"],["ascenseur","Lift"],
      ["piscine","Zwembad"],["gardien","Conciërge"],
      ["digicode","Toegangscode"],["double_vitrage","Dubbele beglazing"],
      ["triple_vitrage","Drievoudige beglazing"],["fibre","Glasvezel"],
      ["cellier","Bijkeuken"],["buanderie","Wasruimte"],
      ["garage","Garage"]
    ],
  },
};
```

---

## INSTRUCTIONS DE RÉDACTION PAR LANGUE

```javascript
const LANG_INSTRUCTIONS = {
  fr: "Tu es un rédacteur immobilier expert. Rédige TOUT en français uniquement. Aucun mot dans une autre langue. Style premium et valorisant. Vocabulaire immobilier professionnel.",

  en: "You are an expert real estate copywriter. Write EVERYTHING in English only. No French, no German. Full paragraphs, rich vocabulary. Premium property language.",

  de: "Du bist ein erfahrener Immobilien-Texter. Schreibe ALLES auf Deutsch. Kein Französisch, kein Englisch. Professionelle Immobiliensprache. Vollständige Absätze.",

  lu: `Schreif ALLES op Lëtzebuergesch. NUR LËTZEBUERGESCH.

WICHTEG REEGELEN (Règles grammaticales importantes):
- "Quadratmeter" (net "Quadratmeter" mat Akzenter)
- "vu Lëtzebuerg" (net "vun Lëtzebuerg" — 'vun' gëtt 'vu' virun L)
- "wouer Investitioun" (net "wahre" — mot allemand)
- "Plafongshéicht" (mat G, net D)
- "Beliichtung" (net "Beleuchtung" — allemand)
- "Keller" (net "Cave" — Cave ass Franséisch)
- "e modernen Lift" (net "Aufzuch" — ze Daitsch)
- "Miwwelen" (net "Mobilement" — Franséisch)
- "Terrassefenster" (net "Terrassenfikster")
- "bréngen" (net "biengen")

BEISPILL RICHTEG:
"Dëse spektakuläre Loft vu 100 Quadratmeter läit am Häerz vu Lëtzebuerg an ass eng wouer Investitioun an d'Zukunft."

Schreif 4 vollstänneg Abschnitter mat mindestens 3 Sätz jeeweils.`,

  nl: "Schrijf ALLES in het Nederlands. Geen Frans, geen Duits. Professionele vastgoedtaal. Volledige alinea's met rijke woordenschat. Premium stijl.",
};
```

---

## VOCABULAIRE IMMOBILIER VALIDÉ PAR LANGUE

### Français
```
Superficie → Surface
Chambre à coucher → Chambre
Salle de bains → Salle de bain (ou SDB)
Toilettes → WC / Salle d'eau
Séjour → Salon / Pièce de vie
Cuisine américaine → Cuisine ouverte / Cuisine américaine
Sous-sol → Cave / Sous-sol
Terrasse couverte → Véranda / Terrasse couverte
```

### English
```
Bedroom → Bedroom (not "room")
Bathroom → Bathroom / Shower room
Reception room → Living room / Reception
Study → Home office / Study
En-suite → En-suite bathroom
Conservatory → Conservatory / Garden room
Loft → Loft / Attic room
```

### Deutsch
```
Schlafzimmer → Schlafzimmer (not "Bedroom")
Wohnzimmer → Wohnzimmer / Wohnbereich
Badezimmer → Badezimmer / Bad
Küche → Küche / Einbauküche
Dachgeschoss → Dachgeschoss / Mansarde
Erdgeschoss → Erdgeschoss (EG)
Obergeschoss → Obergeschoss (OG)
```

### Lëtzebuergesch
```
Schloofzëmmer → Schloofzëmmer
Wunnzëmmer → Wunnzëmmer / Wunnberäich
Buedzëmmer → Buedzëmmer
Küch → Küch / Equipéiert Küch
Daachgeschoss → Daachstock
Äerdgeschoss → Äerdgeschoss
Terrass → Terrass (net "Terrasse" — Franséisch)
Gaart → Gaart (net "Jardin" — Franséisch)
```

### Nederlands
```
Slaapkamer → Slaapkamer
Woonkamer → Woonkamer / Leefruimte
Badkamer → Badkamer
Keuken → Keuken / Inbouwkeuken
Zolder → Zolder
Begane grond → Begane grond
```

---

## RÈGLES DE GÉNÉRATION MULTILINGUE

### Ordre de génération recommandé
```
1. Langue principale du pays sélectionné
2. Français si pays LU ou BE
3. Autres langues à la demande
```

### Stockage par langue
```javascript
// annonces = { "fr": {...}, "en": {...}, "lu": {...} }
const [annonces, setAnnonces] = useState({});
const [activeLang, setActiveLang] = useState("fr");

// Ajouter une langue
setAnnonces(prev => ({...prev, [lang]: newAnnonce}));

// Afficher les onglets si > 1 langue
{Object.keys(annonces).length > 1 && (
  // Onglets de langues
)}
```

### Éviter la retraduction
```javascript
// Ne jamais retraduire une annonce existante
// Si langue déjà générée → afficher l'existante
async function genAnnonceForLang(lang) {
  if (annonces[lang]) return; // Déjà générée
  // Sinon générer...
}
```

---

## PIÈGES MULTILINGUES À ÉVITER

### Luxembourgeois — Erreurs fréquentes
```
❌ "vun Lëtzebuerg" → ✅ "vu Lëtzebuerg"
❌ "wahre Perle" → ✅ "wouer Schatz"
❌ "Cave" → ✅ "Keller"
❌ "Jardin" → ✅ "Gaart"
❌ "Terrasse" → ✅ "Terrass"
❌ "Aufzug" → ✅ "Lift"
❌ "Möblierung" → ✅ "Miwwelen"
❌ "Beleuchtung" → ✅ "Beliichtung"
❌ "Plafondhöhe" → ✅ "Plafongshéicht"
❌ "bringen" → ✅ "bréngen"
```

### Allemand — Pièges courants
```
❌ Anglicismes non adaptés
❌ Faux amis avec le français
✅ Toujours "Wohnfläche" et non "Surface"
✅ "Kaufpreis" et non "Prix"
✅ "Nebenkosten" et non "Charges"
```

### Anglais — Style UK vs US
```
Zaymmo utilise UK English par défaut
❌ "apartment" (US) → ✅ "flat" (UK) pour petits logements
❌ "elevator" (US) → ✅ "lift" (UK)
❌ "realtor" (US) → ✅ "estate agent" (UK)
❌ "closet" (US) → ✅ "wardrobe" ou "built-in wardrobe" (UK)
Exception : Luxembourg/Belgique → utiliser English international
```

---

## ADAPTATION CULTURELLE PAR PAYS

### France
```
Mettre en avant : luminosité, volumes, DPE performant
Argument fort  : "Classement DPE B — économies garanties"
Ton            : Professionnel avec touches émotionnelles
Call-to-action : "Contactez-nous pour organiser une visite"
```

### Luxembourg
```
Mettre en avant : sécurité, investissement, qualité de vie
Argument fort  : "Investissement sûr au cœur de l'Europe"
Ton            : Premium et international
Multi-langue   : Toujours proposer FR + LU + EN
```

### Belgique
```
Mettre en avant : PEB, proximité transports, quartier
Argument fort  : "PEB A — Performance énergétique maximale"
Ton            : Équilibré — pratique et valorisant
```

### Allemagne
```
Mettre en avant : Energieausweis, Nebenkosten, Lage
Argument fort  : "Energieeffizientes Wohnen — Klasse B"
Ton            : Factuel et précis — les Allemands apprécient les détails
```

### Royaume-Uni
```
Mettre en avant : Location, transport links, EPC
Argument fort  : "Excellent EPC rating — low running costs"
Ton            : Enthousiaste mais factuel
Guide price    : Toujours "guide price" jamais prix fixe
```

---

## FORMAT ANNONCE PAR LANGUE

### Description courte (120-150 mots)
```
Accroche forte → Description bien → 1-2 atouts majeurs → CTA
```

### Description longue (280-320 mots)
```
Paragraphe 1 (60-80 mots)  : Présentation générale + localisation
Paragraphe 2 (70-90 mots)  : Espaces de vie + architecture
Paragraphe 3 (70-90 mots)  : Équipements + performances énergétiques
Paragraphe 4 (40-60 mots)  : Conclusion + call-to-action
```

### Points clés (5-7 points)
```
Format : "Surface + localisation"
         "Nb pièces + nb chambres"
         "DPE classe X + GES classe Y"
         "Équipement remarquable"
         "Atout unique"
```
