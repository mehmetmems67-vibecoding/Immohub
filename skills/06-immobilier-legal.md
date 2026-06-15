---
name: zaymmo-immobilier-legal
description: Règles métier immobilier et cadre légal de Zaymmo. Lire avant toute génération d'annonce, fiche client, mentions légales ou adaptation par pays. Contient les règles DPE/GES, mentions obligatoires, plateformes par marché et conformité légale Europe.
---

# Zaymmo Immobilier & Légal

## MARCHÉS COUVERTS

```
France          : FR — € EUR
Luxembourg      : LU — € EUR
Belgique        : BE — € EUR
Allemagne       : DE — € EUR
Royaume-Uni     : GB — £ GBP
Suisse          : CH — CHF (optionnel)
```

---

## TYPES DE BIENS PAR PAYS

### France & Luxembourg & Belgique
```
Appartement, Maison, Villa, Chalet, Loft,
Duplex, Triplex, Studio, T1/T2/T3/T4/T5+,
Terrain, Local commercial, Bureau, Garage,
Immeuble, Château, Manoir, Corps de ferme
```

### Allemagne
```
Wohnung (appartement), Haus (maison),
Villa, Doppelhaus (maison jumelée),
Reihenhaus (maison de ville), Grundstück (terrain),
Gewerbe (commercial), Büro (bureau)
```

### Royaume-Uni
```
Flat, Apartment, House, Detached house,
Semi-detached, Terraced house, Bungalow,
Cottage, Studio, Land, Commercial
```

---

## DPE — DIAGNOSTIC DE PERFORMANCE ÉNERGÉTIQUE

### Valeurs valides
```
France/Belgique/Luxembourg :
A → ≤ 50 kWhEP/m²/an  — couleur #4AE88A (vert)
B → 51-90              — couleur #6AE86A
C → 91-150             — couleur #E8E84A (jaune)
D → 151-230            — couleur #E8B44A (orange clair)
E → 231-330            — couleur #E88A4A
F → 331-450            — couleur #E86A4A
G → > 450              — couleur #E84A4A (rouge)
```

### Validation DPE
```javascript
const DPE_VALID = ["A","B","C","D","E","F","G","Non renseigne"];
// Si valeur hors liste → afficher "Non renseigne"
```

### GES — Gaz à Effet de Serre
```
A → ≤ 5 kgCO2/m²/an
B → 6-10
C → 11-20
D → 21-35
E → 36-55
F → 56-80
G → > 80
```

### Affichage obligatoire (France)
```
Depuis 2021 : DPE opposable — valeur juridique
Depuis 2022 : Interdiction location logement G très énergivore
Depuis 2025 : Interdiction location logement F
Toujours afficher DPE + GES dans toute annonce française
```

---

## MENTIONS LÉGALES OBLIGATOIRES

### France
```
"Prix de vente : [PRIX] € — Honoraires à la charge de [vendeur/acheteur]"
"DPE : [CLASSE] — GES : [CLASSE]"
"Informations non contractuelles — Photos non contractuelles"
"[NOM AGENCE] — Carte professionnelle N°[NUMERO] — [VILLE]"
"Loi Hoguet N°70-9 du 2 janvier 1970"
```

### Luxembourg
```
"Prix de vente : [PRIX] €"
"Classe énergétique : [CLASSE]"
"Informatiounen net contractuell"
"[NOM AGENCE] — Autorisation d'établissement N°[NUMERO]"
```

### Belgique
```
"Prix : [PRIX] € — PEB : [CLASSE]"
"Informations à titre indicatif — non contractuelles"
"IPI — Institut Professionnel des Agents Immobiliers"
"N° IPI : [NUMERO]"
```

### Allemagne
```
"Kaufpreis : [PRIX] €"
"Energieausweis : Klasse [CLASSE]"
"Angaben ohne Gewähr"
"Maklercourtage : [X]% zzgl. MwSt."
```

### Royaume-Uni
```
"Guide price: £[PRIX]"
"EPC Rating: [CLASSE]"
"All measurements are approximate"
"[AGENCE] is a member of [ASSOCIATION]"
```

---

## PLATEFORMES D'ANNONCES PAR PAYS

```javascript
const PLATFORMS = {
  fr: [
    { id: "leboncoin",  name: "LeBonCoin",   color: "#E05C00", logo: "🟠" },
    { id: "seloger",    name: "SeLoger",      color: "#0066CC", logo: "🔵" },
    { id: "pap",        name: "PAP",          color: "#CC0000", logo: "🔴" },
    { id: "bienici",    name: "Bienici",      color: "#00AA44", logo: "🟢" },
    { id: "logicimmo",  name: "Logic-Immo",   color: "#FF6600", logo: "🟡" },
  ],
  lu: [
    { id: "athome",     name: "Athome.lu",    color: "#E05C00", logo: "🏠" },
    { id: "immotop",    name: "Immotop.lu",   color: "#0066CC", logo: "🔵" },
    { id: "remax",      name: "RE/MAX",       color: "#CC0000", logo: "🔴" },
  ],
  be: [
    { id: "immoweb",    name: "Immoweb",      color: "#E05C00", logo: "🟠" },
    { id: "immovlan",   name: "Immovlan",     color: "#0066CC", logo: "🔵" },
    { id: "zimmo",      name: "Zimmo",        color: "#00AA44", logo: "🟢" },
  ],
  de: [
    { id: "immoscout",  name: "ImmoBScout24", color: "#E05C00", logo: "🟠" },
    { id: "immowelt",   name: "Immowelt",     color: "#0066CC", logo: "🔵" },
    { id: "ebay-immo",  name: "eBay Immo",    color: "#CC0000", logo: "🔴" },
  ],
  gb: [
    { id: "rightmove",  name: "Rightmove",    color: "#00CC44", logo: "🟢" },
    { id: "zoopla",     name: "Zoopla",       color: "#8B00FF", logo: "🟣" },
    { id: "onthemarket",name: "OnTheMarket",  color: "#0066CC", logo: "🔵" },
  ],
};
```

---

## LANGUE PAR PAYS (défaut)

```javascript
const PLATFORM_LANG = {
  fr: "fr",
  lu: "lu",
  be: "fr",
  de: "de",
  gb: "en",
};
```

---

## DEVISES

```javascript
const CURRENCIES = {
  EUR: "euro",
  GBP: "livre sterling",
  CHF: "franc suisse",
};

const CURRENCY_SYMBOLS = {
  EUR: "€",
  GBP: "£",
  CHF: "CHF",
};
```

---

## TYPES DE CHAUFFAGE

```
Collectif gaz, Individuel gaz, Électrique,
Pompe à chaleur, Géothermie, Fioul,
Bois / Granulés, Solaire, Hybride,
Poêle à granulés, Radiateurs électriques
```

---

## EXPOSITIONS

```
Nord, Sud, Est, Ouest,
Nord-Est, Nord-Ouest, Sud-Est, Sud-Ouest,
Double exposition, Triple exposition,
Non renseignée
```

---

## RÈGLES ANNONCE PAR TYPE DE BIEN

### Appartement
```
Obligatoire     : Surface, étage/total, nb pièces, charges/mois
Recommandé      : Orientation, luminosité, état
Plateforme      : Indiquer "Appartement" ou "Apt"
Prix/m²         : Calculer et mentionner si > 300k€
```

### Maison
```
Obligatoire     : Surface habitable, terrain, nb pièces, nb chambres
Recommandé      : Plain-pied ou étage, garage, dépendances
Terrain         : Toujours en m² ET en ares si > 1000m²
                  Ex: "2700m² (27 ares)"
Prix/m²         : Calculer sur surface habitable
```

### Villa / Prestige
```
Ton             : Premium — vocabulaire valorisant
Obligatoire     : Toutes les surfaces, tous les équipements
Photos          : Minimum 10 recommandé
Prix            : Ne pas négocier dans l'annonce
```

---

## CALCULS UTILES

```javascript
// Prix au m²
const prixM2 = Math.round(Number(meta.prix) / Number(meta.surface));

// Terrain en ares
const aresStr = Number(meta.terrain) >= 1000
  ? ` (${Math.round(Number(meta.terrain)/100)} ares)`
  : "";

// Charges annuelles
const chargesAn = Number(meta.charges) * 12;

// Consommation comparée N1 vs N2
const evolution = meta.conso_kwh_n1 && meta.conso_kwh_n2
  ? Math.round((Number(meta.conso_kwh_n1) - Number(meta.conso_kwh_n2)) / Number(meta.conso_kwh_n2) * 100)
  : null;
```

---

## CONFORMITÉ EU AI ACT

```
Zaymmo est un outil d'assistance — pas de décision automatique
L'agent humain valide toujours l'annonce finale
Les estimations IA sont indicatives — non contractuelles
Traçabilité : historique de toutes les analyses conservé
Transparence : indiquer "Annonce assistée par IA" si requis
```

---

## CONFORMITÉ RGPD

```
Données stockées    : localStorage — sur l'appareil de l'agent
Pas de serveur      : aucune donnée transmise sauf à l'API Anthropic
API Anthropic       : données chiffrées en transit — TLS
Durée conservation  : jusqu'à suppression manuelle par l'agent
Droits utilisateur  : bouton "Supprimer" sur chaque entrée
Données acheteurs   : ne jamais stocker dans Zaymmo sans consentement
```

---

## FICHE CLIENT — MENTIONS LÉGALES

```
Footer obligatoire sur toute fiche imprimée :
"[NOM AGENCE] — Document de présentation — [DATE]"
"Informations non contractuelles — Photos non contractuelles"
"Surface selon loi Carrez/Boutin" (France uniquement)
"Prix susceptible de modification"
```

---

## VOCABULAIRE PREMIUM IMMOBILIER

### FR — Mots à utiliser
```
Exception, Prestige, Remarquable, Rare, Unique
Lumineux, Baigné de lumière, Luminosité généreuse
Volumes, Généreux, Élégant, Raffiné, Soigné
Hauts de gamme, Qualitatif, Premium
Idéalement situé, Emplacement privilégié
```

### FR — Mots à éviter
```
Basique, Simple, Ordinaire, Quelconque
Petit (dire "cosy" ou "intimiste")
Vieux (dire "de caractère" ou "historique")
Rénover (dire "potentiel d'aménagement")
Bruyant (ne pas mentionner)
```

---

## SURFACE — RÈGLES LÉGALES

### France — Loi Carrez
```
Appartements : surface privative loi Carrez obligatoire
              → exclut murs, cloisons, marches, gaines, embrasures
              → inclut hauteur ≥ 1m80
Maisons      : surface habitable loi Boutin
Erreur > 5%  : acheteur peut demander réduction de prix
```

### Luxembourg
```
Surface brute ou nette à préciser
Pas de loi Carrez — surface déclarée par le vendeur
```

### Belgique
```
Surface habitable nette
PEB (Performance Energétique des Bâtiments) = DPE belge
```
