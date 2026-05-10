import { useState, useRef, useEffect } from "react";

// ══════════════════════════════════════════════════════
// ZYMMO v1 — AI · Vision · Immobilier
// Drone Logo · Multi-langue · Multi-pays · Profil Pro
// ══════════════════════════════════════════════════════

const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || "imoimoimoiaia";
const API_KEY      = import.meta.env.VITE_ANTHROPIC_KEY || "";
const sleep = ms => new Promise(r=>setTimeout(r,ms));

// ── TRADUCTIONS ───────────────────────────────────────
const I18N = {
  fr:{
    steps:["Infos bien","Photos","Analyse","Annonce","Aperçu","Fiche interne"],
    icons:["📋","📸","🔍","✍️","👁","📄"],
    typeBien:"Type de bien",surface:"Surface (m²)",prix:"Prix de vente",
    ville:"Ville / Quartier",pieces:"Nb pièces",chambres:"Nb chambres",
    etage:"Étage",annee:"Année construction",charges:"Charges/mois",
    dpe:"Classe DPE",chauffage:"Chauffage",exposition:"Exposition",
    pays:"Pays du bien",devise:"Devise",langAnnonce:"Langue de l'annonce",
    equipements:"ÉQUIPEMENTS",infoSub:"Remplis ces infos avant d'analyser",
    addPhoto:"PHOTOS DU BIEN",gallerie:"Galerie photo",camera:"Prendre une photo",
    nommer:"NOMMER CETTE PIÈCE",suppr:"✕ Supprimer",
    analyser:"▶ Analyser",analysing:"⟳ Analyse en cours",
    results:"✓ RÉSULTATS",genAnnonce:"✍️ Générer l'annonce →",
    annonceTitle:"ANNONCE GÉNÉRÉE",reviser:"✎ Réviser",fermer:"✕ Fermer",
    appliquer:"Appliquer",apercu:"👁 Aperçu →",
    copier:"⇗ Copier",copie:"✓ Copié !",
    paysPlatform:"Plateformes — choisir le pays",
    ficheTitle:"📄 FICHE INTERNE",telecharger:"⬇ Télécharger",
    pointsForts:"POINTS FORTS",defauts:"DÉFAUTS",
    retouches:"RETOUCHES & HOME STAGING",
    travaux:"TRAVAUX",profil:"PROFIL ACHETEUR",
    estimation:"ESTIMATION",mentions:"MENTIONS LÉGALES",
    penseBetes:"PENSE-BÊTES VISITES",conseil:"CONSEIL EXPERT",
    noKey:"🔑 Clé API requise — voir README",
    types:["Appartement","Maison","Studio","Loft","Villa","Duplex","Terrain","Parking","Local"],
    chauffages:["Collectif gaz","Individuel gaz","Électrique","PAC","Géothermie","Fuel","Autre"],
    expos:["Non renseignée","Nord","Nord-Est","Est","Sud-Est","Sud","Sud-Ouest","Ouest","Nord-Ouest"],
    dpes:["Non renseigné","A","B","C","D","E","F","G"],
    equip:[["cave","🔒 Cave"],["parking","🚗 Parking"],["terrasse","🌿 Terrasse"],
           ["balcon","🌇 Balcon"],["jardin","🌳 Jardin"],["ascenseur","🛗 Ascenseur"],
           ["piscine","🏊 Piscine"],["gardien","👮 Gardien"],["digicode","📱 Digicode"],
           ["double_vitrage","🪟 Double vitrage"],["fibre","📡 Fibre"]],
  },
  en:{
    steps:["Property Info","Photos","Analysis","Listing","Preview","Internal Sheet"],
    icons:["📋","📸","🔍","✍️","👁","📄"],
    typeBien:"Property type",surface:"Area (m²)",prix:"Sale price",
    ville:"City / District",pieces:"Rooms",chambres:"Bedrooms",
    etage:"Floor",annee:"Year built",charges:"Monthly charges",
    dpe:"EPC class",chauffage:"Heating",exposition:"Orientation",
    pays:"Property country",devise:"Currency",langAnnonce:"Listing language",
    equipements:"AMENITIES",infoSub:"Fill in details before analysing",
    addPhoto:"PROPERTY PHOTOS",gallerie:"Photo gallery",camera:"Take a photo",
    nommer:"NAME THIS ROOM",suppr:"✕ Remove",
    analyser:"▶ Analyse",analysing:"⟳ Analysing",
    results:"✓ RESULTS",genAnnonce:"✍️ Generate listing →",
    annonceTitle:"GENERATED LISTING",reviser:"✎ Edit",fermer:"✕ Close",
    appliquer:"Apply",apercu:"👁 Preview →",
    copier:"⇗ Copy",copie:"✓ Copied!",
    paysPlatform:"Platforms — choose country",
    ficheTitle:"📄 INTERNAL SHEET",telecharger:"⬇ Download",
    pointsForts:"STRENGTHS",defauts:"DEFECTS",
    retouches:"STAGING TIPS",
    travaux:"WORKS",profil:"IDEAL BUYER",
    estimation:"ESTIMATE",mentions:"LEGAL NOTICES",
    penseBetes:"VISIT NOTES",conseil:"EXPERT ADVICE",
    noKey:"🔑 API key required — see README",
    types:["Apartment","House","Studio","Loft","Villa","Duplex","Land","Parking","Commercial"],
    chauffages:["Collective gas","Individual gas","Electric","Heat pump","Geothermal","Oil","Other"],
    expos:["Not specified","North","NE","East","SE","South","SW","West","NW"],
    dpes:["Not specified","A","B","C","D","E","F","G"],
    equip:[["cave","🔒 Cellar"],["parking","🚗 Parking"],["terrasse","🌿 Terrace"],
           ["balcon","🌇 Balcony"],["jardin","🌳 Garden"],["ascenseur","🛗 Elevator"],
           ["piscine","🏊 Pool"],["gardien","👮 Concierge"],["digicode","📱 Keypad"],
           ["double_vitrage","🪟 Double glazing"],["fibre","📡 Fibre"]],
  },
  de:{
    steps:["Objektdaten","Fotos","Analyse","Anzeige","Vorschau","Interne Akte"],
    icons:["📋","📸","🔍","✍️","👁","📄"],
    typeBien:"Objekttyp",surface:"Fläche (m²)",prix:"Verkaufspreis",
    ville:"Stadt / Viertel",pieces:"Zimmer",chambres:"Schlafzimmer",
    etage:"Stockwerk",annee:"Baujahr",charges:"Nebenkosten/Mt.",
    dpe:"Energieklasse",chauffage:"Heizung",exposition:"Ausrichtung",
    pays:"Land des Objekts",devise:"Währung",langAnnonce:"Anzeigesprache",
    equipements:"AUSSTATTUNG",infoSub:"Bitte vor der Analyse ausfüllen",
    addPhoto:"OBJEKTFOTOS",gallerie:"Fotogalerie",camera:"Foto aufnehmen",
    nommer:"RAUM BENENNEN",suppr:"✕ Löschen",
    analyser:"▶ Analysieren",analysing:"⟳ Analyse läuft",
    results:"✓ ERGEBNISSE",genAnnonce:"✍️ Anzeige erstellen →",
    annonceTitle:"GENERIERTE ANZEIGE",reviser:"✎ Bearbeiten",fermer:"✕ Schließen",
    appliquer:"Anwenden",apercu:"👁 Vorschau →",
    copier:"⇗ Kopieren",copie:"✓ Kopiert!",
    paysPlatform:"Plattformen — Land wählen",
    ficheTitle:"📄 INTERNE AKTE",telecharger:"⬇ Herunterladen",
    pointsForts:"STÄRKEN",defauts:"MÄNGEL",
    retouches:"STAGING-TIPPS",
    travaux:"ARBEITEN",profil:"IDEALER KÄUFER",
    estimation:"PREISSCHÄTZUNG",mentions:"RECHTLICHE HINWEISE",
    penseBetes:"BESICHTIGUNGSNOTIZEN",conseil:"EXPERTENRAT",
    noKey:"🔑 API-Schlüssel erforderlich",
    types:["Wohnung","Haus","Studio","Loft","Villa","Duplex","Grundstück","Parkplatz","Gewerbe"],
    chauffages:["Zentralheizung Gas","Einzelheizung Gas","Elektrisch","Wärmepumpe","Geothermie","Öl","Sonstige"],
    expos:["Nicht angegeben","Nord","Nordost","Ost","Südost","Süd","Südwest","West","Nordwest"],
    dpes:["Nicht angegeben","A","B","C","D","E","F","G"],
    equip:[["cave","🔒 Keller"],["parking","🚗 Parkplatz"],["terrasse","🌿 Terrasse"],
           ["balcon","🌇 Balkon"],["jardin","🌳 Garten"],["ascenseur","🛗 Aufzug"],
           ["piscine","🏊 Pool"],["gardien","👮 Hausmeister"],["digicode","📱 Türcode"],
           ["double_vitrage","🪟 Doppelverglasung"],["fibre","📡 Glasfaser"]],
  },
  lu:{
    steps:["Infos bien","Fotoen","Analyse","Annonce","Virschau","Intern Blat"],
    icons:["📋","📸","🔍","✍️","👁","📄"],
    typeBien:"Typ",surface:"Fläch (m²)",prix:"Verkaafspräis",
    ville:"Stad / Quartier",pieces:"Stécker",chambres:"Schlofzëmmer",
    etage:"Etage",annee:"Baajoer",charges:"Käschten/Mount",
    dpe:"Energieklass",chauffage:"Hëtzung",exposition:"Ausrichtung",
    pays:"Land",devise:"Währung",langAnnonce:"Sprooch",
    equipements:"AUSSTATTUNG",infoSub:"Virun der Analyse ausfëllen",
    addPhoto:"FOTOEN",gallerie:"Fotogalerie",camera:"Foto huelen",
    nommer:"RAUM NENNEN",suppr:"✕ Läschen",
    analyser:"▶ Analyséieren",analysing:"⟳ Analyse leeft",
    results:"✓ RESULTATER",genAnnonce:"✍️ Annonce erstellen →",
    annonceTitle:"GENERÉIERT ANNONCE",reviser:"✎ Beaarbechten",fermer:"✕ Zoumaachen",
    appliquer:"Uwenden",apercu:"👁 Virschau →",
    copier:"⇗ Kopéieren",copie:"✓ Kopéiert!",
    paysPlatform:"Plattformen — Land wielen",
    ficheTitle:"📄 INTERN BLAT",telecharger:"⬇ Eroflueden",
    pointsForts:"STÄERKTEN",defauts:"MÄNGEL",
    retouches:"STAGING-TIPPS",
    travaux:"AARBECHTEN",profil:"IDEALE KÄUFER",
    estimation:"PRÄISSCHÄTZUNG",mentions:"RECHTLECH HIWEISER",
    penseBetes:"BESICHTIGUNGSNOTIZEN",conseil:"EXPERTEROT",
    noKey:"🔑 API-Schlëssel erfuerderlech",
    types:["Appartement","Haus","Studio","Loft","Villa","Duplex","Terrain","Parkplaz","Geschäft"],
    chauffages:["Kollektiv Gas","Eenzel Gas","Elektresch","Wärmepompe","Geothermie","Ueleg","Soss"],
    expos:["Net uginn","Nord","Nordost","Ost","Südost","Süd","Südwest","West","Nordwest"],
    dpes:["Net uginn","A","B","C","D","E","F","G"],
    equip:[["cave","🔒 Keller"],["parking","🚗 Parkplaz"],["terrasse","🌿 Terrasse"],
           ["balcon","🌇 Balkon"],["jardin","🌳 Gaart"],["ascenseur","🛗 Lift"],
           ["piscine","🏊 Schwämmbad"],["gardien","👮 Gardist"],["digicode","📱 Duercode"],
           ["double_vitrage","🪟 Duebelgliesung"],["fibre","📡 Glasfaser"]],
  },
  nl:{
    steps:["Objectinfo","Foto's","Analyse","Advertentie","Voorbeeld","Intern dossier"],
    icons:["📋","📸","🔍","✍️","👁","📄"],
    typeBien:"Type object",surface:"Oppervlakte (m²)",prix:"Verkoopprijs",
    ville:"Stad / Wijk",pieces:"Kamers",chambres:"Slaapkamers",
    etage:"Verdieping",annee:"Bouwjaar",charges:"Servicekosten/mnd",
    dpe:"Energielabel",chauffage:"Verwarming",exposition:"Oriëntatie",
    pays:"Land van object",devise:"Valuta",langAnnonce:"Taal advertentie",
    equipements:"VOORZIENINGEN",infoSub:"Vul dit in voor de analyse",
    addPhoto:"OBJECTFOTO'S",gallerie:"Fotogalerij",camera:"Foto nemen",
    nommer:"RUIMTE BENOEMEN",suppr:"✕ Verwijderen",
    analyser:"▶ Analyseren",analysing:"⟳ Analyse loopt",
    results:"✓ RESULTATEN",genAnnonce:"✍️ Advertentie maken →",
    annonceTitle:"GEGENEREERDE ADVERTENTIE",reviser:"✎ Bewerken",fermer:"✕ Sluiten",
    appliquer:"Toepassen",apercu:"👁 Voorbeeld →",
    copier:"⇗ Kopiëren",copie:"✓ Gekopieerd!",
    paysPlatform:"Platformen — kies land",
    ficheTitle:"📄 INTERN DOSSIER",telecharger:"⬇ Downloaden",
    pointsForts:"STERKTES",defauts:"GEBREKEN",
    retouches:"STAGING-TIPS",
    travaux:"WERKEN",profil:"IDEALE KOPER",
    estimation:"PRIJSSCHATTING",mentions:"WETTELIJKE VERMELDINGEN",
    penseBetes:"BEZOEKNOTITIES",conseil:"EXPERT ADVIES",
    noKey:"🔑 API-sleutel vereist",
    types:["Appartement","Huis","Studio","Loft","Villa","Duplex","Grond","Parking","Bedrijf"],
    chauffages:["Collectief gas","Individueel gas","Elektrisch","Warmtepomp","Geothermisch","Stookolie","Andere"],
    expos:["Niet opgegeven","Noord","Noordoost","Oost","Zuidoost","Zuid","Zuidwest","West","Noordwest"],
    dpes:["Niet opgegeven","A","B","C","D","E","F","G"],
    equip:[["cave","🔒 Kelder"],["parking","🚗 Parking"],["terrasse","🌿 Terras"],
           ["balcon","🌇 Balkon"],["jardin","🌳 Tuin"],["ascenseur","🛗 Lift"],
           ["piscine","🏊 Zwembad"],["gardien","👮 Conciërge"],["digicode","📱 Digicode"],
           ["double_vitrage","🪟 Dubbele beglazing"],["fibre","📡 Glasvezel"]],
  },
};

// ── PLATEFORMES PAR PAYS ──────────────────────────────
const PLATFORMS = {
  fr:[
    {id:"seloger",name:"SeLoger",color:"#E30613",logo:"🏠"},
    {id:"leboncoin",name:"LeBonCoin",color:"#F56B2A",logo:"🟠"},
    {id:"pap",name:"PAP",color:"#005BAA",logo:"🔵"},
    {id:"bienici",name:"Bien'ici",color:"#00B0F0",logo:"🏡"},
  ],
  de:[
    {id:"immoscout",name:"ImmoScout24",color:"#E8230A",logo:"🏠"},
    {id:"immonet",name:"Immonet",color:"#005CA9",logo:"🔵"},
    {id:"kleinanz",name:"Kleinanzeigen",color:"#C8252C",logo:"🟥"},
    {id:"immowelt",name:"Immowelt",color:"#009FE3",logo:"🏡"},
  ],
  be:[
    {id:"immoweb",name:"Immoweb",color:"#E8402A",logo:"🏠"},
    {id:"logic",name:"Logic-immo",color:"#0072BC",logo:"🔵"},
    {id:"zimmo",name:"Zimmo",color:"#FF6600",logo:"🟠"},
    {id:"realo",name:"Realo",color:"#2ECC71",logo:"🟢"},
  ],
  lu:[
    {id:"athome",name:"Athome.lu",color:"#C8171E",logo:"🏠"},
    {id:"immotop",name:"Immotop",color:"#0066CC",logo:"🔵"},
    {id:"encord",name:"Encord",color:"#FF8800",logo:"🟠"},
  ],
  gb:[
    {id:"rightmove",name:"Rightmove",color:"#00DEB6",logo:"🏠"},
    {id:"zoopla",name:"Zoopla",color:"#8B00FF",logo:"🟣"},
    {id:"onthemkt",name:"OnTheMarket",color:"#1C3F6E",logo:"🔵"},
  ],
};

const COUNTRIES = {
  fr:"🇫🇷 France",de:"🇩🇪 Allemagne",be:"🇧🇪 Belgique",lu:"🇱🇺 Luxembourg",gb:"🇬🇧 Royaume-Uni"
};

// ── MENTIONS LÉGALES ──────────────────────────────────
const LEGAL = {
  fr:`Annonce soumise à la loi ALUR du 24 mars 2014. Prix exprimé honoraires inclus (HAI). DPE obligatoire selon décret n°2006-1147. Surface calculée selon la loi Carrez. Informations non contractuelles.`,
  de:`Angaben gemäß § 5a TMG. Energieausweis vorhanden gemäß EnEV 2014. Courtage zzgl. gesetzlicher MwSt. Angaben ohne Gewähr. Datenschutz gemäß DSGVO.`,
  be:`Annonce soumise au Code civil belge. PEB obligatoire. Prix HTVA sauf mention contraire. Informations non contractuelles. Honoraires selon barème en vigueur.`,
  lu:`Annonce soumise à la loi luxembourgeoise du 30 juillet 2013 relative aux transactions immobilières. CPE obligatoire. Prix TVA incluse. Informations non contractuelles.`,
  gb:`Subject to Property Misdescriptions Act 1991 and Consumer Protection Regulations 2008. EPC required under EPB Regulations 2012. All measurements approximate.`,
};

// Langue automatique par pays de plateforme
const PLATFORM_LANG = {fr:"fr",de:"de",be:"nl",lu:"fr",gb:"en"};

const CURRENCIES = {"EUR":"€","CHF":"CHF","GBP":"£"};

const ROOMS = [
  "Salon","Séjour","Cuisine","Chambre principale","Chambre",
  "Salle de bain","Salle d'eau","WC","Entrée","Bureau",
  "Dressing","Cellier","Buanderie","Cave","Garage",
  "Terrasse","Balcon","Jardin","Façade","Autre"
];

const DPE_C = {
  A:"#00A651",B:"#4CB748",C:"#BDD630",
  D:"#FFF200",E:"#F7941D",F:"#F15A22",G:"#ED1C24"
};

// ── PROMPTS ───────────────────────────────────────────
const VSYS = `Tu es un expert immobilier et diagnostiqueur. Réponds UNIQUEMENT en JSON valide sans backticks.`;

const vPrompt = (room) => `Analyse cette photo de "${room}". JSON:
{"piece":"${room}","surface_estimee_m2":<number|null>,"hauteur_plafond":"<standard|élevé|très élevé|mansardé|non visible>","etat_general":"<excellent|très bon|bon|correct|à rafraîchir|à rénover>","score_etat":<1-10>,"luminosite":"<excellente|bonne|correcte|faible>","revetement_sol":"<type>","revetement_murs":"<type>","menuiseries":"<double vitrage|triple vitrage|simple vitrage|non visible>","chauffage_visible":"<type|non visible>","equipements":["liste"],"defauts_detectes":["défauts visibles"],"points_forts":["atouts"],"suggestions_retouche":["améliorations"],"home_staging":["conseils"],"commentaire_expert":"2 phrases"}`;

const sPrompt = (analyses, meta) => {
  const safe = {type:meta.type,surface:meta.surface,pieces:meta.pieces,chambres:meta.chambres,
    etage:meta.etage,annee:meta.annee,ville:meta.ville,pays:meta.pays,dpe:meta.dpe,
    chauffage:meta.chauffage,exposition:meta.exposition,cave:meta.cave,parking:meta.parking,
    terrasse:meta.terrasse,balcon:meta.balcon,jardin:meta.jardin,ascenseur:meta.ascenseur,
    double_vitrage:meta.double_vitrage,piscine:meta.piscine,prix_vendeur:meta.prix||null,devise:meta.devise};
  return `Expert immobilier. Synthèse du bien:\nBIEN: ${JSON.stringify(safe)}\nANALYSES: ${JSON.stringify(analyses)}\nJSON:
{"surface_totale_estimee":<n>,"nb_pieces":<n>,"nb_chambres":<n>,"etat_global":"<état>","score_global":<1-10>,"style_dominant":"<style>","dpe_estime":"<A-G>","points_forts":["top5"],"points_faibles":["défauts"],"defauts_critiques":["bloquants"],"travaux_urgents":["urgents"],"travaux_valorisants":["valorisants"],"budget_travaux_estime":"<fourchette>","suggestions_retouche_globales":["retouches"],"profil_acheteur":"<profil>","fourchette_prix_basse":<n>,"fourchette_prix_haute":<n>,"conseil_mise_en_vente":"2 phrases","pense_betes":["notes visites et négociations"]}`;
};

const aPrompt = (synth, meta, lang, profil={}) => {
  const dev = CURRENCIES[meta.devise]||"€";
  const prix = meta.prix ? `${Number(meta.prix).toLocaleString()} ${dev}`
    : synth.fourchette_prix_basse ? `${synth.fourchette_prix_basse.toLocaleString()}–${synth.fourchette_prix_haute.toLocaleString()} ${dev}`
    : "Prix sur demande";
  const langName = {fr:"français",en:"anglais/English",de:"allemand/Deutsch",lu:"luxembourgeois",nl:"néerlandais/Nederlands"}[lang]||"français";
  const countryCtx = {fr:"marché immobilier français",de:"deutschen Immobilienmarkt",be:"marché immobilier belge",lu:"Luxemburger Immobilienmarkt",gb:"UK property market"}[meta.pays]||"marché immobilier";
  const profilInfo = profil.nomAgence ? `AGENCE: ${profil.nomAgence}${profil.nomAgent?` | Agent: ${profil.nomAgent}`:""}${profil.telephone?` | Tél: ${profil.telephone}`:""}${profil.email?` | Email: ${profil.email}`:""}` : "";

  return `Rédige une annonce immobilière professionnelle ENTIÈREMENT EN ${langName.toUpperCase()} pour le ${countryCtx}.
BIEN: ${meta.type} ${synth.surface_totale_estimee||meta.surface}m² à ${meta.ville||"NC"}
ÉTAT: ${synth.etat_global} — ${synth.score_global}/10
DPE: ${["A","B","C","D","E","F","G"].includes(meta.dpe)?meta.dpe:synth.dpe_estime||"NC"} | GES: ${["A","B","C","D","E","F","G"].includes(meta.ges)?meta.ges:"NC"}
PRIX: ${prix} | CHAUFFAGE: ${meta.chauffage}
ATOUTS: ${(synth.points_forts||[]).join(", ")}
ÉQUIPEMENTS: ${["cave","parking","terrasse","balcon","jardin","ascenseur","piscine","cellier","buanderie"].filter(k=>meta[k]).join(", ")||"standard"}
${profilInfo}
Adapte le style et la terminologie au pays: ${COUNTRIES[meta.pays]||"France"}.
JSON:
{"titre_principal":"≤80 chars","titre_court":"≤60 chars","description_courte":"150 mots","description_longue":"300 mots","points_cles":["5 points"],"tags":["SEO"],"avertissement_dpe":${["F","G"].includes(meta.dpe)?'"⚠️ Passoire thermique / Energiearm"':"null"}}`;
};

// ── API ───────────────────────────────────────────────
async function callClaude(messages, system, max=1500) {
  const ctrl=new AbortController(), tid=setTimeout(()=>ctrl.abort(),60000);
  try {
    const res=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",signal:ctrl.signal,
      headers:{
        "Content-Type":"application/json",
        "x-api-key": API_KEY,
        "anthropic-version":"2023-06-01",
        "anthropic-dangerous-direct-browser-access":"true",
      },
      body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:max,system,messages})
    });
    if (!res.ok){
      const e=await res.json().catch(()=>({}));
      throw new Error(e?.error?.message||`Erreur HTTP ${res.status}`);
    }
    const data=await res.json();
    const text=data.content?.map(b=>b.text||"").join("")||"";
    try{return JSON.parse(text.replace(/```json\n?|\n?```/g,"").trim());}
    catch{return{error:"Parse failed",raw:text.slice(0,200)};}
  } catch(e){
    if(e.name==="AbortError")throw new Error("Timeout — réessayez");
    throw e;
  } finally{clearTimeout(tid);}
}

// B04+B03: Compression avec crossOrigin + fallback FileReader
function toB64(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // B04: évite canvas taint
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const MAX = 1024;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const b64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
        if (!b64) throw new Error("Canvas vide");
        res({ b64, mediaType: "image/jpeg" });
      } catch(canvasErr) {
        // B14: Fallback FileReader si canvas échoue (SecurityError)
        const reader = new FileReader();
        reader.onload = () => {
          const b = reader.result?.split(",")[1] ?? "";
          if (!b) return rej(new Error("Lecture impossible"));
          res({ b64: b, mediaType: file.type || "image/jpeg" });
        };
        reader.onerror = () => rej(new Error("Erreur lecture fichier"));
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Image illisible")); };
    img.src = url;
  });
}

// B03: Convertir URL externe en base64 via fetch (haiku ne supporte pas source.url)
async function urlToB64(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => {
        const b = reader.result?.split(",")[1] ?? "";
        if (!b) return rej(new Error("Blob vide"));
        res({ b64: b, mediaType: blob.type || "image/jpeg" });
      };
      reader.onerror = () => rej(new Error("Erreur lecture blob"));
      reader.readAsDataURL(blob);
    });
  } catch(e) {
    throw new Error(`URL inaccessible: ${e.message}`);
  }
}

// ── STYLES ────────────────────────────────────────────
const C={bg:"#080812",surf:"#0E0E1C",brd:"#1A1A2E",acc:"#7C6FFF",gold:"#C8A97E",
  green:"#4AE88A",text:"#E8E6FF",muted:"#888",err:"#E84A4A"};
const inp={width:"100%",background:C.surf,border:`1px solid ${C.brd}`,borderRadius:8,
  padding:"11px 14px",color:C.text,fontFamily:"inherit",fontSize:14,boxSizing:"border-box"};
const btn=(bg,col="#fff",x={})=>({padding:"11px 18px",borderRadius:9,fontSize:13,fontWeight:700,
  border:"none",cursor:"pointer",background:bg,color:col,transition:"all 0.2s",fontFamily:"inherit",...x});

// ── COMPOSANTS ────────────────────────────────────────
function DPE({dpe}){
  const valid=dpe&&dpe.length===1&&DPE_C[dpe];
  if(!valid)return null;
  return(
    <div style={{display:"flex",gap:3,marginTop:6,flexWrap:"wrap"}}>
      {Object.keys(DPE_C).map(l=>(
        <div key={l} style={{width:l===dpe?26:18,height:l===dpe?26:18,borderRadius:4,
          background:l===dpe?DPE_C[l]:DPE_C[l]+"30",display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:l===dpe?11:8,fontWeight:700,
          color:l===dpe?"#fff":"#555",transition:"all 0.3s",
          boxShadow:l===dpe?`0 0 8px ${DPE_C[l]}60`:"none"}}>{l}</div>
      ))}
    </div>
  );
}

function Ring({score,size=70}){
  const c=score>=8?"#4AE88A":score>=6?"#E8C84A":"#E84A4A";
  const r=(size-6)/2,ci=2*Math.PI*r;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.brd} strokeWidth={6}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={6}
          strokeDasharray={ci} strokeDashoffset={ci*(1-score/10)}
          strokeLinecap="round" style={{transition:"stroke-dashoffset 1s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:17,fontWeight:800,color:c,lineHeight:1}}>{score}</span>
        <span style={{fontSize:8,color:"#555"}}>/10</span>
      </div>
    </div>
  );
}

function Card({children,style={}}){
  return <div style={{background:C.surf,borderRadius:12,border:`1px solid ${C.brd}`,
    padding:16,marginBottom:16,...style}}>{children}</div>;
}
function ST({children,color=C.acc}){
  return <div style={{fontSize:11,color,letterSpacing:2,marginBottom:12,fontWeight:600}}>{children}</div>;
}
function MF({label,children}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
      <label style={{fontSize:11,color:C.muted,letterSpacing:1}}>{label.toUpperCase()}</label>
      {children}
    </div>
  );
}
function Steps({current,L}){
  const all=["fiche","photos","analyse","annonce","apercu","fiche_interne"];
  const ci=all.indexOf(current);
  return(
    <div style={{display:"flex",alignItems:"center",overflowX:"auto",padding:"0 4px"}}>
      {L.steps.map((label,i)=>{
        const done=i<ci,active=i===ci;
        return(
          <div key={i} style={{display:"flex",alignItems:"center",flex:i<L.steps.length-1?1:"none"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:52}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",
                alignItems:"center",justifyContent:"center",fontSize:12,
                background:active?C.acc:done?C.green+"30":C.surf,
                border:`2px solid ${active?C.acc:done?C.green:C.brd}`,
                boxShadow:active?`0 0 12px ${C.acc}50`:"none",transition:"all 0.3s"}}>
                {done?"✓":L.icons[i]}
              </div>
              <span style={{fontSize:9,color:active?C.acc:done?C.green:"#444",
                whiteSpace:"nowrap",textAlign:"center"}}>{label}</span>
            </div>
            {i<L.steps.length-1&&<div style={{flex:1,height:2,
              background:done?C.green+"40":C.brd,margin:"0 2px",marginBottom:16}}/>}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════
function Login({onOk}){
  const [pwd,setPwd]=useState(""),[err,setErr]=useState(false),[shake,setShake]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{ref.current?.focus();},[]);
  function go(){
    if(pwd===APP_PASSWORD){sessionStorage.setItem("ih_auth","1");onOk();}
    else{setErr(true);setShake(true);setPwd("");setTimeout(()=>setShake(false),600);setTimeout(()=>setErr(false),2500);}
  }
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",
      justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:20}}>
      <style>{`
        @keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-8px)}50%{transform:translateX(8px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatDrone{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-8px) rotate(3deg)}}
        @keyframes glowLogo{0%,100%{filter:drop-shadow(0 0 10px #7C6FFF40)}50%{filter:drop-shadow(0 0 24px #7C6FFF80)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.1}}
        @keyframes orbit{from{transform:rotate(0deg) translateX(36px) rotate(0deg)}to{transform:rotate(360deg) translateX(36px) rotate(-360deg)}}
      `}</style>
      <div style={{width:"100%",maxWidth:380,animation:"fadeUp 0.5s ease"}}>
        {/* Logo Zymmo Login */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{position:"relative",width:100,height:100,margin:"0 auto 20px"}}>
            {/* Maison principale */}
            <svg width="100" height="100" viewBox="0 0 100 100"
              style={{animation:"glowLogo 2s ease-in-out infinite"}}>
              <defs>
                <linearGradient id="zLogin" x1="0" y1="0" x2="100" y2="100">
                  <stop offset="0%" stopColor="#7C6FFF"/>
                  <stop offset="60%" stopColor="#4A8EFF"/>
                  <stop offset="100%" stopColor="#4AE88A"/>
                </linearGradient>
                <linearGradient id="zLoginFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C6FFF" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="#4AE88A" stopOpacity="0.08"/>
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="24" fill="#0A0820"/>
              <rect width="100" height="100" rx="24" fill="url(#zLoginFill)"/>
              {/* Grille sol */}
              <line x1="50" y1="86" x2="10" y2="100" stroke="#7C6FFF" strokeWidth="0.5" opacity="0.15"/>
              <line x1="50" y1="86" x2="30" y2="100" stroke="#7C6FFF" strokeWidth="0.5" opacity="0.15"/>
              <line x1="50" y1="86" x2="70" y2="100" stroke="#7C6FFF" strokeWidth="0.5" opacity="0.15"/>
              <line x1="50" y1="86" x2="90" y2="100" stroke="#7C6FFF" strokeWidth="0.5" opacity="0.15"/>
              {/* Toit */}
              <polygon points="50,30 78,54 22,54" fill="url(#zLogin)" opacity="0.95"/>
              {/* Corps */}
              <rect x="26" y="54" width="48" height="30" fill="#7C6FFF" opacity="0.2"/>
              <rect x="26" y="54" width="48" height="30" fill="none" stroke="url(#zLogin)" strokeWidth="2"/>
              {/* Porte arrondie */}
              <rect x="40" y="66" width="20" height="18" rx="10" fill="url(#zLogin)" opacity="0.85"/>
              {/* Fenêtres */}
              <rect x="30" y="58" width="12" height="12" rx="2" fill="#4AE88A" opacity="0.5"/>
              <rect x="30" y="58" width="12" height="12" rx="2" fill="none" stroke="#4AE88A" strokeWidth="1"/>
              <rect x="58" y="58" width="12" height="12" rx="2" fill="#4AE88A" opacity="0.5"/>
              <rect x="58" y="58" width="12" height="12" rx="2" fill="none" stroke="#4AE88A" strokeWidth="1"/>
              {/* Orbite drone */}
              <ellipse cx="50" cy="40" rx="30" ry="10" fill="none" stroke="#4AE88A" strokeWidth="0.8" strokeDasharray="4,4" opacity="0.3"/>
            </svg>
            {/* Drone en orbite */}
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
              width:0,height:0,animation:"orbit 4s linear infinite"}}>
              <svg width="22" height="16" viewBox="0 0 22 16"
                style={{position:"absolute",top:-8,left:0}}>
                <rect x="6" y="4" width="10" height="8" rx="2.5" fill="#00F5FF" opacity="0.95"/>
                <line x1="2" y1="5" x2="7" y2="7" stroke="#00F5FF" strokeWidth="1.2"/>
                <line x1="15" y1="7" x2="20" y2="5" stroke="#00F5FF" strokeWidth="1.2"/>
                <line x1="2" y1="11" x2="7" y2="9" stroke="#00F5FF" strokeWidth="1.2"/>
                <line x1="15" y1="9" x2="20" y2="11" stroke="#00F5FF" strokeWidth="1.2"/>
                <ellipse cx="2" cy="7" rx="3" ry="1.2" fill="none" stroke="#00F5FF" strokeWidth="0.9" opacity="0.8"/>
                <ellipse cx="20" cy="7" rx="3" ry="1.2" fill="none" stroke="#00F5FF" strokeWidth="0.9" opacity="0.8"/>
                <ellipse cx="2" cy="11" rx="3" ry="1.2" fill="none" stroke="#00F5FF" strokeWidth="0.9" opacity="0.8"/>
                <ellipse cx="20" cy="11" rx="3" ry="1.2" fill="none" stroke="#00F5FF" strokeWidth="0.9" opacity="0.8"/>
                <circle cx="11" cy="12" r="2" fill="#FFD700"/>
                <circle cx="11" cy="4" r="1.2" fill="#FF2244" style={{animation:"blink 0.7s infinite"}}/>
              </svg>
            </div>
          </div>
          <div style={{fontWeight:900,fontSize:30,letterSpacing:5,
            background:"linear-gradient(90deg,#7C6FFF,#4A8EFF,#4AE88A)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            fontFamily:"Georgia,serif"}}>ZYMMO</div>
          <div style={{fontSize:11,color:"#555",letterSpacing:4,marginTop:6,fontFamily:"system-ui"}}>
            AI · VISION · IMMOBILIER
          </div>
        </div>
        <div style={{background:C.surf,borderRadius:16,border:`1px solid ${C.brd}`,
          padding:"28px 24px",animation:shake?"shake 0.5s ease":"none"}}>
          <div style={{fontSize:14,color:"#888",marginBottom:20,textAlign:"center"}}>
            Accès sécurisé — entrez le mot de passe
          </div>
          <input ref={ref} type="password" value={pwd}
            onChange={e=>{setPwd(e.target.value);setErr(false);}}
            onKeyDown={e=>e.key==="Enter"&&go()}
            placeholder="••••••••••"
            style={{...inp,letterSpacing:4,textAlign:"center",marginBottom:12,
              border:`1px solid ${err?"#E84A4A":C.brd}`,fontSize:18,outline:"none"}}/>
          {err&&<div style={{fontSize:12,color:"#E84A4A",textAlign:"center",marginBottom:12}}>
            ❌ Mot de passe incorrect
          </div>}
          <button onClick={go} style={{...btn("linear-gradient(135deg,#7C6FFF,#4AE88A)"),
            width:"100%",padding:14,fontSize:14,boxShadow:"0 4px 20px #7C6FFF40"}}>
            Accéder à ImmoHub →
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:11,color:"#222"}}>
          Accès réservé — usage professionnel
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════
export default function App(){
  const [auth,setAuth]=useState(()=>sessionStorage.getItem("ih_auth")==="1");
  if(!auth)return <Login onOk={()=>setAuth(true)}/>;
  return <ImmoHub/>;
}

function ImmoHub(){
  const [lang,setLang]=useState("fr");
  const L=I18N[lang]||I18N.fr;
  const [step,setStep]=useState("fiche");
  const [photos,setPhotos]=useState([]);
  const [urlIn,setUrlIn]=useState("");
  const [urlError,setUrlError]=useState("");
  const [analyses,setAnal]=useState([]);
  const [synth,setSynth]=useState(null);
  const [annonce,setAnnonce]=useState(null);
  const [loading,setLoading]=useState(false);
  const [loadMsg,setLoadMsg]=useState("");
  const [prog,setProg]=useState(0);
  const [error,setError]=useState(null);
  const [platCountry,setPC]=useState("fr");
  const [platform,setPlat]=useState("seloger");
  const [copied,setCopied]=useState(false);
  const [revMode,setRevMode]=useState(false);
  const [revInstr,setRevInstr]=useState("");
  const [revHist,setRevHist]=useState([]);
  // Multi-langue annonces
  const [multiLangMode,setMultiLangMode]=useState(false);
  const [selectedLangs,setSelectedLangs]=useState({fr:true,en:false,de:false,lu:false,nl:false});
  const [annonces,setAnnonces]=useState({}); // {fr:{...}, de:{...}, etc}
  const [activeLang,setActiveLang]=useState("fr"); // onglet actif
  const fileRef=useRef(null),mountedRef=useRef(true);
  useEffect(()=>{mountedRef.current=true;return()=>{mountedRef.current=false;};},[]);

  const [meta,setMeta]=useState({
    // PAYS EN PREMIER
    pays:"fr",
    type:"Appartement",adresse:"",ville:"",surface:"",pieces:"",chambres:"",
    etage:"",annee:"",prix:"",charges:"",
    dpe:"Non renseigné",ges:"Non renseigné",
    chauffage:"Collectif gaz",exposition:"Non renseignée",
    devise:"EUR",langAnnonce:"fr",
    cave:false,parking:false,terrasse:false,balcon:false,jardin:false,
    ascenseur:false,double_vitrage:false,fibre:false,piscine:false,
    gardien:false,digicode:false,cellier:false,buanderie:false,
  });

  // Profil professionnel
  const [profil,setProfil]=useState({
    nomAgence:"",nomAgent:"",telephone:"",email:"",siteWeb:"",
    logoUrl:"",slogan:"",
  });
  const setP=(k,v)=>setProfil(p=>({...p,[k]:v}));
  const [profilOpen,setProfilOpen]=useState(false);
  const setM=(k,v)=>setMeta(m=>({...m,[k]:v}));
  const dev=CURRENCIES[meta.devise]||"€";

  // Upload URL multi
  async function addUrls(){
    const lines=urlIn.trim().split(/[\n\s,]+/).filter(l=>l.startsWith("http"));
    if(!lines.length){setUrlError("Colle au moins une URL valide");return;}
    setUrlError("");setUrlIn("");
    const temps=lines.map(url=>({id:Math.random().toString(36).slice(2),
      url,preview:null,roomType:ROOMS[0],status:"loading",result:null}));
    setPhotos(p=>[...p,...temps]);
    await Promise.all(temps.map(async tp=>{
      try{
        const r=await fetch(tp.url);const b=await r.blob();
        if(!b.type.startsWith("image/"))throw new Error();
        const pu=URL.createObjectURL(b);
        setPhotos(p=>p.map(x=>x.id===tp.id?{...x,preview:pu,status:"idle"}:x));
      }catch{setPhotos(p=>p.map(x=>x.id===tp.id?{...x,preview:tp.url,status:"idle"}:x));}
    }));
  }

  async function onFiles(e){
    const files=Array.from(e.target.files||[]);
    if(!files.length)return;
    const np=files.filter(f=>f.type.startsWith("image/")).map(f=>({
      id:Math.random().toString(36).slice(2),file:f,preview:URL.createObjectURL(f),
      roomType:ROOMS[0],status:"idle",result:null}));
    setPhotos(p=>[...p,...np]);setStep("photos");e.target.value="";
  }

  const removePhoto=id=>{
    if(loading)return;
    setPhotos(p=>{const ph=p.find(x=>x.id===id);
      if(ph?.preview?.startsWith("blob:"))URL.revokeObjectURL(ph.preview);
      return p.filter(x=>x.id!==id);});
  };
  const setRT=(id,t)=>{if(!loading)setPhotos(p=>p.map(x=>x.id===id?{...x,roomType:t}:x));};

  async function runAnalysis(){
    if(!photos.length){setError("Ajoute au moins une photo");return;}
    if(!API_KEY){setError(L.noKey);return;}
    setLoading(true);setError(null);setProg(0);
    setAnal([]);setSynth(null);setAnnonce(null);setStep("analyse");
    const results=[];
    try { // B06: try/finally global pour garantir setLoading(false)
      for(let i=0;i<photos.length;i++){
        const ph=photos[i];
        if(!mountedRef.current)break;
        setLoadMsg(`${L.analysing} ${i+1}/${photos.length} — ${ph.roomType}`);
        setPhotos(p=>p.map(x=>x.id===ph.id?{...x,status:"analyzing"}:x));
        try{
          let b64data;
          if(ph.file){
            b64data = await toB64(ph.file); // Fichier galerie
          } else {
            b64data = await urlToB64(ph.url); // B03: URL → base64 via fetch
          }
          const content=[
            {type:"image",source:{type:"base64",media_type:b64data.mediaType,data:b64data.b64}},
            {type:"text",text:vPrompt(ph.roomType)}
          ];
          const res=await callClaude([{role:"user",content}],VSYS);
          results.push({piece:ph.roomType,...res});
          setPhotos(p=>p.map(x=>x.id===ph.id?{...x,status:"done",result:res}:x));
          setAnal([...results]);
        }catch(e){
          setPhotos(p=>p.map(x=>x.id===ph.id?{...x,status:"error",errMsg:e.message}:x));
          results.push({piece:ph.roomType,error:e.message});
          if(mountedRef.current)setError(`Photo ${i+1}: ${e.message}`);
        }
        setProg(Math.round(((i+1)/photos.length)*75));
        await sleep(200);
      }
      if(mountedRef.current&&results.filter(r=>!r.error).length>0){
        setLoadMsg("Synthèse globale…");setProg(88);setError(null);
        try{
          const s=await callClaude([{role:"user",content:sPrompt(results,meta)}],
            "Expert immobilier. JSON valide uniquement sans backticks.");
          if(mountedRef.current){setSynth(s);setProg(100);}
        }catch(e){if(mountedRef.current)setError("Erreur synthèse: "+e.message);}
      } else if(results.length>0&&results.every(r=>r.error)){
        if(mountedRef.current)setError("Toutes les photos ont échoué — vérifiez votre connexion");
      }
    } finally { // B06: toujours libérer le loading
      if(mountedRef.current){setLoading(false);setLoadMsg("");}
    }
  }

  async function genAnnonce(){
    if(!synth){setError("Lance d'abord l'analyse");return;}
    setLoading(true);setLoadMsg("Rédaction…");setStep("annonce");
    try{
      const a=await callClaude([{role:"user",content:aPrompt(synth,meta,meta.langAnnonce,profil)}],
        "Rédacteur immobilier expert. JSON valide uniquement sans backticks.",1500);
      if(mountedRef.current){
        setAnnonce(a);
        setAnnonces(prev=>({...prev,[meta.langAnnonce]:a}));
        setActiveLang(meta.langAnnonce);
      }
    }catch(e){if(mountedRef.current)setError("Erreur: "+e.message);}
    finally{if(mountedRef.current){setLoading(false);setLoadMsg("");}}
  }

  // Génération multi-langues simultanée
  async function genMultiLang(){
    if(!synth){setError("Lance d'abord l'analyse");return;}
    const langs=Object.entries(selectedLangs).filter(([,v])=>v).map(([k])=>k);
    if(!langs.length){setError("Coche au moins une langue");return;}
    setLoading(true);setStep("annonce");
    const flags={fr:"🇫🇷",en:"🇬🇧",de:"🇩🇪",lu:"🇱🇺",nl:"🇧🇪"};
    const results={...annonces};
    for(let i=0;i<langs.length;i++){
      const lg=langs[i];
      if(results[lg]) continue; // déjà générée → skip
      setLoadMsg(`${flags[lg]} Rédaction ${lg.toUpperCase()} — ${i+1}/${langs.length}`);
      try{
        const a=await callClaude(
          [{role:"user",content:aPrompt(synth,meta,lg,profil)}],
          "Rédacteur immobilier expert. JSON valide uniquement sans backticks.",1500
        );
        results[lg]=a;
        if(mountedRef.current)setAnnonces({...results});
      }catch(e){results[lg]={error:e.message};}
    }
    if(mountedRef.current){
      const firstOk=langs.find(l=>results[l]&&!results[l].error);
      if(firstOk){setAnnonce(results[firstOk]);setActiveLang(firstOk);}
      setLoading(false);setLoadMsg("");
    }
  }

  async function applyRev(){
    if(!revInstr.trim()||!annonce)return;
    setLoading(true);setLoadMsg("Révision…");
    try{
      const r=await callClaude([{role:"user",
        content:`TEXTE:\n"""\n${annonce.description_longue}\n"""\nINSTRUCTION: ${revInstr}\nJSON: {"description_longue":"..."}`}],
        "Éditeur immobilier. Modifie UNIQUEMENT ce qui est demandé. JSON sans backticks.");
      if(r.description_longue&&mountedRef.current){
        setRevHist(h=>[...h,annonce]);
        setAnnonce(a=>({...a,description_longue:r.description_longue}));
        setRevInstr("");
      }
    }catch(e){setError(e.message);}
    finally{if(mountedRef.current){setLoading(false);setLoadMsg("");}}
  }

  async function copy(){
    if(!annonce)return;
    const t=annonce.titre_court||annonce.titre_principal;
    const d=annonce.description_longue;
    const txt=`${t}\n\n${d}\n\n${(annonce.points_cles||[]).map(p=>`• ${p}`).join("\n")}`;
    try{await navigator.clipboard.writeText(txt);}
    catch{const ta=document.createElement("textarea");ta.value=txt;
      document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);}
    setCopied(true);setTimeout(()=>{if(mountedRef.current)setCopied(false);},2500);
  }

  function downloadFiche(){
    if(!synth||!annonce)return;
    const date=new Date().toLocaleDateString("fr-FR");
    const content=[
      `FICHE INTERNE — IMMO HUB v5`,`Générée le ${date}`,"═".repeat(50),
      ``,`BIEN: ${meta.type} — ${meta.ville||"NC"}`,
      `Surface: ${synth.surface_totale_estimee||meta.surface||"NC"} m²`,
      `Pièces: ${synth.nb_pieces||meta.pieces||"NC"} dont ${synth.nb_chambres||meta.chambres||"NC"} chambres`,
      `Étage: ${meta.etage||"NC"} | Année: ${meta.annee||"NC"}`,
      `Prix: ${meta.prix?Number(meta.prix).toLocaleString()+" "+dev:"À définir"}`,
      `Charges: ${meta.charges||"NC"} ${dev}/mois`,
      `DPE: ${meta.dpe} | Chauffage: ${meta.chauffage} | Exposition: ${meta.exposition}`,
      ``,`ÉQUIPEMENTS`,"─".repeat(30),
      ...L.equip.filter(([k])=>meta[k]).map(([,l])=>`• ${l}`),
      ``,`ÉVALUATION IA`,"─".repeat(30),
      `Score: ${synth.score_global}/10 — ${synth.etat_global}`,
      `Profil acheteur: ${synth.profil_acheteur||"NC"}`,
      synth.fourchette_prix_basse?`Estimation: ${synth.fourchette_prix_basse.toLocaleString()}–${synth.fourchette_prix_haute.toLocaleString()} ${dev}`:`Estimation: NC`,
      `Budget travaux: ${synth.budget_travaux_estime||"NC"}`,
      ``,`POINTS FORTS`,"─".repeat(30),
      ...(synth.points_forts||[]).map(p=>`✓ ${p}`),
      ``,`DÉFAUTS`,"─".repeat(30),
      ...(synth.points_faibles||[]).map(p=>`⚠ ${p}`),
      ...(synth.defauts_critiques||[]).map(p=>`🔴 ${p}`),
      ``,`TRAVAUX`,"─".repeat(30),
      ...(synth.travaux_urgents||[]).map(t=>`🔧 ${t}`),
      ...(synth.travaux_valorisants||[]).map(t=>`📈 ${t}`),
      ``,`HOME STAGING`,"─".repeat(30),
      ...(synth.suggestions_retouche_globales||[]).map(s=>`• ${s}`),
      ``,`CONSEIL EXPERT`,"─".repeat(30),
      synth.conseil_mise_en_vente||"NC",
      ``,`PENSE-BÊTES VISITES`,"─".repeat(30),
      ...(synth.pense_betes||[]).map((p,i)=>`${i+1}. ${p}`),
      ``,`ANNONCE RÉDIGÉE`,"─".repeat(30),
      `TITRE: ${annonce.titre_principal||"NC"}`,``,annonce.description_longue||"NC",
      ``,`═`.repeat(50),`MENTIONS LÉGALES — ${COUNTRIES[meta.pays]||"FR"}`,
      "─".repeat(30),LEGAL[meta.pays]||LEGAL.fr,
      ``,`═`.repeat(50),`ImmoHub v5 — Usage interne uniquement — ${date}`,
    ].join("\n");
    const blob=new Blob([content],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`ImmoHub_Fiche_${meta.ville||"bien"}_${date.replace(/\//g,"-")}.txt`;
    a.click();URL.revokeObjectURL(url);
  }

  const currPlats=PLATFORMS[platCountry]||PLATFORMS.fr;
  const canRun=photos.length>0&&!loading&&!!API_KEY;
  const DPE_VALID = ["A","B","C","D","E","F","G"];

  // Changer pays plateforme → auto-langue
  function changePlatCountry(country) {
    setPC(country);
    setPlat(PLATFORMS[country][0].id);
    // Générer annonce dans la langue du pays si pas encore disponible
    const targetLang = PLATFORM_LANG[country]||"fr";
    if (synth && !annonces[targetLang]) {
      setM("langAnnonce", targetLang);
      setTimeout(()=>genAnnonceForLang(targetLang), 100);
    } else if (annonces[targetLang]) {
      setAnnonce(annonces[targetLang]);
      setActiveLang(targetLang);
    }
  }

  // Générer annonce pour une langue spécifique
  async function genAnnonceForLang(lg) {
    if (!synth) return;
    setLoading(true); setLoadMsg(`Rédaction ${lg}…`);
    try {
      const a = await callClaude(
        [{role:"user",content:aPrompt(synth,meta,lg,profil)}],
        "Rédacteur immobilier expert. JSON valide uniquement sans backticks.",1500
      );
      if (mountedRef.current) {
        setAnnonces(prev=>({...prev,[lg]:a}));
        setAnnonce(a);
        setActiveLang(lg);
      }
    } catch(e) { if(mountedRef.current) setError("Erreur: "+e.message); }
    finally { if(mountedRef.current){setLoading(false);setLoadMsg("");} }
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,
      fontFamily:"system-ui,-apple-system,sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 12px #7C6FFF30}50%{box-shadow:0 0 28px #7C6FFF70}}
        @keyframes floatDrone{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-5px) rotate(2deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        *{box-sizing:border-box}input,select,textarea{outline:none;font-family:inherit}
        button{cursor:pointer;border:none;font-family:inherit}
        input[type=checkbox]{accent-color:#7C6FFF;cursor:pointer;width:17px;height:17px}
        input::placeholder,textarea::placeholder{color:#333}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1A1A2E;border-radius:2px}
      `}</style>

      {/* HEADER */}
      <div style={{padding:"11px 16px",background:"#060610",borderBottom:`1px solid ${C.brd}`,
        flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",
        gap:8,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* LOGO ZYMMO — Maison + Drone flottant */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{position:"relative",width:42,height:42,flexShrink:0}}>
              <svg width="42" height="42" viewBox="0 0 44 44"
                style={{filter:loading?"drop-shadow(0 0 10px #7C6FFF)":"drop-shadow(0 0 4px #7C6FFF50)",transition:"filter 0.3s"}}>
                <defs>
                  <linearGradient id="zLogo" x1="0" y1="0" x2="44" y2="44">
                    <stop offset="0%" stopColor="#7C6FFF"/>
                    <stop offset="100%" stopColor="#4AE88A"/>
                  </linearGradient>
                  <linearGradient id="zLogoFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C6FFF" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#4AE88A" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <rect width="44" height="44" rx="11" fill="#0A0820"/>
                <rect width="44" height="44" rx="11" fill="url(#zLogoFill)"/>
                <polygon points="22,13 37,25 7,25" fill="url(#zLogo)" opacity="0.95"/>
                <rect x="10" y="25" width="24" height="14" fill="#7C6FFF" opacity="0.2"/>
                <rect x="10" y="25" width="24" height="14" fill="none" stroke="url(#zLogo)" strokeWidth="1.5"/>
                <rect x="18" y="31" width="8" height="8" rx="4" fill="url(#zLogo)" opacity="0.9"/>
                <rect x="12" y="27" width="7" height="7" rx="1.5" fill="#4AE88A" opacity="0.5"/>
                <rect x="25" y="27" width="7" height="7" rx="1.5" fill="#4AE88A" opacity="0.5"/>
              </svg>
              {/* Mini Drone flottant */}
              <div style={{position:"absolute",top:-9,right:-9,animation:"floatDrone 2s ease-in-out infinite"}}>
                <svg width="20" height="15" viewBox="0 0 22 16">
                  <rect x="7" y="5" width="8" height="6" rx="2" fill="#00F5FF" opacity="0.95"/>
                  <line x1="3" y1="6" x2="8" y2="7" stroke="#00F5FF" strokeWidth="1"/>
                  <line x1="14" y1="7" x2="19" y2="6" stroke="#00F5FF" strokeWidth="1"/>
                  <line x1="3" y1="11" x2="8" y2="10" stroke="#00F5FF" strokeWidth="1"/>
                  <line x1="14" y1="10" x2="19" y2="11" stroke="#00F5FF" strokeWidth="1"/>
                  <ellipse cx="3" cy="7" rx="2.5" ry="1" fill="none" stroke="#00F5FF" strokeWidth="0.8" opacity="0.8"/>
                  <ellipse cx="19" cy="7" rx="2.5" ry="1" fill="none" stroke="#00F5FF" strokeWidth="0.8" opacity="0.8"/>
                  <ellipse cx="3" cy="11" rx="2.5" ry="1" fill="none" stroke="#00F5FF" strokeWidth="0.8" opacity="0.8"/>
                  <ellipse cx="19" cy="11" rx="2.5" ry="1" fill="none" stroke="#00F5FF" strokeWidth="0.8" opacity="0.8"/>
                  <circle cx="11" cy="11" r="1.5" fill="#FFD700"/>
                  <circle cx="11" cy="5" r="1" fill="#FF2244" style={{animation:"blink 0.8s infinite"}}/>
                </svg>
              </div>
            </div>
            <div>
              <div style={{fontWeight:900,fontSize:17,letterSpacing:3,
                background:"linear-gradient(90deg,#7C6FFF,#4AE88A)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                fontFamily:"Georgia,serif"}}>ZYMMO</div>
              <div style={{fontSize:8,color:"#444",letterSpacing:2}}>AI · VISION · IMMOBILIER</div>
            </div>
          </div>
          {/* Profil agence mini */}
          {profil.nomAgence&&(
            <div style={{fontSize:10,color:C.gold,borderLeft:`1px solid ${C.brd}`,
              paddingLeft:8,display:"flex",flexDirection:"column"}}>
              <span style={{fontWeight:700}}>{profil.nomAgence}</span>
              {profil.nomAgent&&<span style={{color:"#666"}}>{profil.nomAgent}</span>}
            </div>
          )}
        </div>

        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {/* Bouton profil pro */}
          <button onClick={()=>setProfilOpen(p=>!p)}
            style={{...btn(profilOpen?C.gold+"20":C.surf,profilOpen?C.gold:C.muted,
              {border:`1px solid ${profilOpen?C.gold:C.brd}`,fontSize:11,padding:"6px 10px"})}}>
            👤
          </button>
          {/* Sélecteur langue interface */}
          <select value={lang} onChange={e=>setLang(e.target.value)}
            style={{background:C.surf,border:`1px solid ${C.brd}`,borderRadius:7,
              padding:"6px 10px",color:C.text,fontSize:12,cursor:"pointer"}}>
            <option value="fr">🇫🇷 FR</option>
            <option value="en">🇬🇧 EN</option>
            <option value="de">🇩🇪 DE</option>
            <option value="lu">🇱🇺 LU</option>
            <option value="nl">🇧🇪 NL</option>
          </select>
        </div>

        {loading&&(
          <div style={{flex:1,minWidth:100,margin:"0 8px"}}>
            <div style={{fontSize:10,color:C.acc,marginBottom:3,textAlign:"right"}}>{loadMsg}</div>
            <div style={{height:3,background:C.brd,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${prog}%`,borderRadius:2,
                background:"linear-gradient(90deg,#7C6FFF,#4AE88A)",transition:"width 0.5s"}}/>
            </div>
          </div>
        )}
      </div>

      {/* PROFIL PRO — panneau déroulant */}
      {profilOpen&&(
        <div style={{padding:"14px 16px",background:"#0A0A1E",
          borderBottom:`1px solid ${C.gold}30`,animation:"fadeUp 0.2s ease"}}>
          <div style={{fontSize:11,color:C.gold,marginBottom:12,letterSpacing:1,fontWeight:700}}>
            👤 PROFIL PROFESSIONNEL
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
            {[
              ["nomAgence","🏢 Nom de l'agence","ImmoHub Conseil"],
              ["nomAgent","👤 Nom de l'agent","Jean Dupont"],
              ["telephone","📞 Téléphone","+352 123 456 789"],
              ["email","📧 Email","contact@immohub.lu"],
              ["siteWeb","🌐 Site web","www.immohub.lu"],
              ["slogan","💬 Slogan","Votre bien entre de bonnes mains"],
            ].map(([k,label,ph])=>(
              <div key={k} style={{display:"flex",flexDirection:"column",gap:4}}>
                <label style={{fontSize:10,color:C.muted,letterSpacing:1}}>{label}</label>
                <input value={profil[k]} onChange={e=>setP(k,e.target.value)}
                  placeholder={ph}
                  style={{...inp,fontSize:12,padding:"8px 10px"}}/>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,fontSize:10,color:"#555",fontStyle:"italic"}}>
            Ces infos apparaîtront dans l'aperçu plateforme et la fiche interne
          </div>
        </div>
      )}

      {/* STEP BAR */}
      <div style={{padding:"10px 16px",background:"#060610",
        borderBottom:`1px solid ${C.brd}`,flexShrink:0}}>
        <Steps current={step} L={L}/>
      </div>

      {/* ALERTES */}
      {error&&(
        <div style={{margin:"10px 16px 0",padding:"10px 14px",background:"#1F0A0A",
          border:`1px solid ${C.err}40`,borderRadius:8,fontSize:12,color:C.err,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>❌ {error}</span>
          <button onClick={()=>setError(null)} style={{background:"transparent",color:C.err,fontSize:18}}>×</button>
        </div>
      )}
      {!API_KEY&&(
        <div style={{margin:"10px 16px 0",padding:"10px 14px",background:"#1A1400",
          border:`1px solid ${C.gold}40`,borderRadius:8,fontSize:12,color:C.gold}}>
          {L.noKey}
        </div>
      )}

      {/* CONTENU */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>

        {/* ── FICHE BIEN — PAYS EN PREMIER ── */}
        <Card>
          <ST>📋 {L.infoSub}</ST>

          {/* PAYS EN PREMIER */}
          <div style={{marginBottom:14,padding:"12px 14px",background:"#0A0A1E",
            borderRadius:10,border:`1px solid ${C.acc}30`}}>
            <div style={{fontSize:10,color:C.acc,letterSpacing:1,marginBottom:8,fontWeight:700}}>
              🌍 PAYS DU BIEN — définit les plateformes, mentions légales et langue
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {Object.entries(COUNTRIES).map(([k,v])=>(
                <button key={k} onClick={()=>{setM("pays",k);setM("langAnnonce",PLATFORM_LANG[k]||"fr");}}
                  style={{padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:600,
                    background:meta.pays===k?C.acc:C.surf,
                    color:meta.pays===k?"#fff":"#666",
                    border:`1px solid ${meta.pays===k?C.acc:C.brd}`,
                    boxShadow:meta.pays===k?`0 0 12px ${C.acc}40`:"none",
                    transition:"all 0.2s"}}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:8}}>
            <MF label={L.typeBien}>
              <select value={meta.type} onChange={e=>setM("type",e.target.value)}
                style={{...inp,padding:"10px"}}>
                {L.types.map(o=><option key={o}>{o}</option>)}
              </select>
            </MF>
            <MF label={L.surface}>
              <input type="number" value={meta.surface} onChange={e=>setM("surface",e.target.value)}
                placeholder="85" style={inp}/>
            </MF>
            <MF label={L.prix}>
              <div style={{display:"flex",gap:5}}>
                <input type="number" value={meta.prix} onChange={e=>setM("prix",e.target.value)}
                  placeholder="285000" style={{...inp,flex:1}}/>
                <select value={meta.devise} onChange={e=>setM("devise",e.target.value)}
                  style={{...inp,width:65,padding:"10px 5px"}}>
                  <option value="EUR">€</option>
                  <option value="CHF">CHF</option>
                  <option value="GBP">£</option>
                </select>
              </div>
            </MF>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:8}}>
            <MF label={L.ville}>
              <input value={meta.ville} onChange={e=>setM("ville",e.target.value)}
                placeholder="ex: Luxembourg-Ville" style={inp}/>
            </MF>
            <MF label={L.pieces}>
              <input type="number" value={meta.pieces} onChange={e=>setM("pieces",e.target.value)}
                placeholder="4" style={inp}/>
            </MF>
            <MF label={L.chambres}>
              <input type="number" value={meta.chambres} onChange={e=>setM("chambres",e.target.value)}
                placeholder="2" style={inp}/>
            </MF>
            <MF label={L.etage}>
              <input value={meta.etage} onChange={e=>setM("etage",e.target.value)}
                placeholder="3/6" style={inp}/>
            </MF>
            <MF label={L.annee}>
              <input type="number" value={meta.annee} onChange={e=>setM("annee",e.target.value)}
                placeholder="1990" style={inp}/>
            </MF>
            <MF label={L.charges}>
              <input type="number" value={meta.charges} onChange={e=>setM("charges",e.target.value)}
                placeholder="200" style={inp}/>
            </MF>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:12}}>
            <MF label={L.dpe}>
              <select value={meta.dpe} onChange={e=>setM("dpe",e.target.value)}
                style={{...inp,padding:"10px"}}>
                {L.dpes.map(o=><option key={o}>{o}</option>)}
              </select>
              <DPE dpe={meta.dpe}/>
            </MF>
            <MF label="GES (Gaz effet de serre)">
              <select value={meta.ges||"Non renseigné"} onChange={e=>setM("ges",e.target.value)}
                style={{...inp,padding:"10px"}}>
                {["Non renseigné","A","B","C","D","E","F","G"].map(o=><option key={o}>{o}</option>)}
              </select>
              {/* Badge GES — même style que DPE */}
              {DPE_VALID.includes(meta.ges) && (
                <div style={{display:"flex",gap:3,marginTop:6,flexWrap:"wrap"}}>
                  {["A","B","C","D","E","F","G"].map(l=>(
                    <div key={l} style={{width:l===meta.ges?26:18,height:l===meta.ges?26:18,
                      borderRadius:4,background:l===meta.ges?"#7F5FFF":l===meta.ges?"#7F5FFF":"#7F5FFF20",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:l===meta.ges?11:8,fontWeight:700,
                      color:l===meta.ges?"#fff":"#555",transition:"all 0.3s",
                      boxShadow:l===meta.ges?"0 0 8px #7F5FFF60":"none"}}>
                      {l}
                    </div>
                  ))}
                </div>
              )}
            </MF>
            <MF label={L.chauffage}>
              <select value={meta.chauffage} onChange={e=>setM("chauffage",e.target.value)}
                style={{...inp,padding:"10px"}}>
                {L.chauffages.map(o=><option key={o}>{o}</option>)}
              </select>
            </MF>
            <MF label={L.exposition}>
              <select value={meta.exposition} onChange={e=>setM("exposition",e.target.value)}
                style={{...inp,padding:"10px"}}>
                {L.expos.map(o=><option key={o}>{o}</option>)}
              </select>
            </MF>
            <MF label={L.pays}>
              <select value={meta.pays} onChange={e=>setM("pays",e.target.value)}
                style={{...inp,padding:"10px"}}>
                {Object.entries(COUNTRIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </MF>
            <MF label={L.langAnnonce}>
              <select value={meta.langAnnonce} onChange={e=>setM("langAnnonce",e.target.value)}
                style={{...inp,padding:"10px"}}>
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="lu">🇱🇺 Lëtzebuergesch</option>
                <option value="nl">🇧🇪 Nederlands</option>
              </select>
            </MF>
          </div>
          <div style={{fontSize:11,color:C.muted,letterSpacing:1,marginBottom:10}}>{L.equipements}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
            {[...L.equip,["cellier","📦 Cellier"],["buanderie","🫧 Buanderie"]].map(([k,label])=>(
              <label key={k} style={{display:"flex",alignItems:"center",gap:8,
                fontSize:13,color:meta[k]?C.text:"#555",cursor:"pointer",padding:"4px 0"}}>
                <input type="checkbox" checked={!!meta[k]} onChange={e=>setM(k,e.target.checked)}/>
                {label}
              </label>
            ))}
          </div>
        </Card>

        {/* ── PHOTOS ── */}
        <Card>
          <ST color={C.acc}>📸 {L.addPhoto}</ST>
          {/* Multi-URL */}
          <div style={{marginBottom:14}}>
            <textarea value={urlIn} onChange={e=>{setUrlIn(e.target.value);setUrlError("");}}
              placeholder={`https://images.unsplash.com/...\nhttps://...\nhttps://...`}
              rows={3} style={{...inp,resize:"vertical",minHeight:75,fontSize:11,lineHeight:1.6,
                border:`1px solid ${urlError?C.err:C.brd}`}}/>
            {urlError&&<div style={{fontSize:10,color:C.err,marginTop:4}}>⚠ {urlError}</div>}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
              <div style={{fontSize:10,color:"#444"}}>
                {urlIn.trim()?`${urlIn.trim().split(/[\n\s]+/).filter(l=>l.startsWith("http")).length} URL(s)`:""}
              </div>
              <button onClick={addUrls} disabled={loading||!urlIn.trim()}
                style={{...btn(C.acc,"#fff"),fontSize:12,padding:"8px 16px",
                  opacity:(loading||!urlIn.trim())?0.5:1}}>
                {L.addPhoto&&"+ Ajouter"}
              </button>
            </div>
          </div>
          {/* Galerie / Caméra */}
          <input ref={fileRef} type="file" accept="image/*" multiple
            style={{display:"none"}} onChange={onFiles}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <button onClick={()=>fileRef.current?.click()} disabled={loading}
              style={{...btn("linear-gradient(135deg,#7C6FFF,#4AE88A)"),
                padding:"14px 10px",borderRadius:12,display:"flex",flexDirection:"column",
                alignItems:"center",gap:5,opacity:loading?0.5:1,
                boxShadow:"0 4px 16px #7C6FFF40"}}>
              <span style={{fontSize:24}}>🖼️</span>
              <span style={{fontSize:12}}>{L.gallerie}</span>
            </button>
            <button onClick={()=>{
              if(fileRef.current){
                fileRef.current.setAttribute("capture","environment");
                fileRef.current.click();
                setTimeout(()=>fileRef.current?.removeAttribute("capture"),500);
              }
            }} disabled={loading}
              style={{...btn(C.surf,C.acc),padding:"14px 10px",borderRadius:12,
                border:`2px solid ${C.acc}`,display:"flex",flexDirection:"column",
                alignItems:"center",gap:5,opacity:loading?0.5:1}}>
              <span style={{fontSize:24}}>📷</span>
              <span style={{fontSize:12}}>{L.camera}</span>
            </button>
          </div>
          {/* Grille photos */}
          {photos.length>0&&(
            <>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"center"}}>
                <div style={{fontSize:11,color:C.green}}>✓ {photos.length} photo{photos.length>1?"s":""}</div>
                <div style={{fontSize:10,color:"#555"}}>{L.nommer}</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:12}}>
                {photos.map((ph,i)=>(
                  <div key={ph.id} style={{background:"#06060F",borderRadius:10,overflow:"hidden",
                    border:`2px solid ${ph.status==="done"?C.green+"50":ph.status==="error"?C.err+"50":C.acc+"30"}`,
                    animation:"fadeUp 0.25s ease"}}>
                    <div style={{position:"relative",height:105,background:"#0A0A18"}}>
                      <div style={{position:"absolute",top:5,left:5,zIndex:2,width:20,height:20,
                        borderRadius:"50%",background:C.acc,color:"#fff",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:10,fontWeight:700}}>{i+1}</div>
                      {ph.status==="loading"?(
                        <div style={{width:"100%",height:"100%",display:"flex",
                          alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:20,color:"#555",animation:"spin 1s linear infinite",display:"block"}}>◌</span>
                        </div>
                      ):ph.preview?(
                        <img src={ph.preview} alt={ph.roomType}
                          style={{width:"100%",height:"100%",objectFit:"cover"}}
                          onError={e=>{e.target.style.display="none";}}/>
                      ):(
                        <div style={{width:"100%",height:"100%",display:"flex",
                          alignItems:"center",justifyContent:"center",color:"#555",fontSize:11}}>🖼️</div>
                      )}
                      {ph.status==="analyzing"&&(
                        <div style={{position:"absolute",inset:0,background:"#00000080",
                          display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{fontSize:22,color:"#fff",animation:"spin 1s linear infinite",display:"block"}}>◌</span>
                        </div>
                      )}
                      <div style={{position:"absolute",top:5,right:5}}>
                        <span style={{fontSize:9,padding:"2px 6px",borderRadius:6,
                          background:ph.status==="done"?"#0A1A12":ph.status==="error"?"#1A0A0A":"#111",
                          color:ph.status==="done"?C.green:ph.status==="error"?C.err:"#555"}}>
                          {ph.status==="done"?"✓":ph.status==="error"?"✗":ph.status==="analyzing"?"…":"○"}
                        </span>
                      </div>
                      {ph.result?.score_etat&&(
                        <div style={{position:"absolute",bottom:5,left:5,fontSize:10,
                          color:"#fff",background:"#00000090",padding:"1px 5px",borderRadius:4}}>
                          {ph.result.score_etat}/10
                        </div>
                      )}
                    </div>
                    <div style={{padding:8}}>
                      <select value={ph.roomType} onChange={e=>setRT(ph.id,e.target.value)}
                        disabled={loading}
                        style={{...inp,padding:"6px 8px",fontSize:10,marginBottom:5,border:`1px solid ${C.acc}40`}}>
                        {ROOMS.map(r=><option key={r}>{r}</option>)}
                      </select>
                      {ph.result&&!ph.result.error&&(
                        <div style={{fontSize:10,marginBottom:5,lineHeight:1.5}}>
                          {ph.result.surface_estimee_m2&&<div style={{color:C.gold}}>📐 ~{ph.result.surface_estimee_m2}m²</div>}
                          {ph.result.etat_general&&<div style={{color:"#888"}}>{ph.result.etat_general}</div>}
                          {ph.result.defauts_detectes?.slice(0,1).map((d,j)=><div key={j} style={{color:C.err}}>⚠ {d}</div>)}
                        </div>
                      )}
                      <button onClick={()=>removePhoto(ph.id)} disabled={loading}
                        style={{fontSize:10,color:loading?"#333":C.err,
                          background:"transparent",border:"none",padding:0,cursor:loading?"default":"pointer"}}>
                        {L.suppr}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {photos.length===0&&(
            <div style={{textAlign:"center",padding:"20px 0",color:"#333",fontSize:13}}>
              Ajoute des photos pour commencer
            </div>
          )}

          {/* Bouton Analyser — en bas après les photos */}
          {photos.length>0&&(
            <button onClick={canRun?runAnalysis:undefined} disabled={!canRun}
              style={{...btn(canRun?"linear-gradient(135deg,#7C6FFF,#4AE88A)":"#1A1A2E",
                canRun?"#fff":"#444"),
                width:"100%",padding:"16px",marginTop:16,fontSize:14,
                opacity:loading?0.6:1,
                boxShadow:canRun?"0 6px 20px #7C6FFF50":"none"}}>
              {loading?`⟳ ${prog}% — ${loadMsg}`:canRun?`▶ ${L.analyser} ${photos.length} photo${photos.length>1?"s":""}`:L.analyser}
            </button>
          )}
        </Card>

        {/* ── RÉSULTATS ── */}
        {synth&&(
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}>
                <ST color={C.green}>{L.results}</ST>
                <button onClick={genAnnonce} disabled={loading}
                  style={{...btn("linear-gradient(135deg,#7C6FFF,#4AE88A)"),
                    fontSize:12,padding:"10px 16px",opacity:loading?0.5:1}}>
                  {L.genAnnonce}
                </button>
              </div>
              <div style={{display:"flex",gap:16,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
                <Ring score={synth.score_global||5}/>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{synth.etat_global}</div>
                  <div style={{display:"flex",gap:12,fontSize:13,color:"#888",flexWrap:"wrap",marginBottom:8}}>
                    {synth.surface_totale_estimee&&<span>📐 ~{synth.surface_totale_estimee}m²</span>}
                    {synth.nb_pieces&&<span>🏠 {synth.nb_pieces}</span>}
                    {synth.nb_chambres&&<span>🛏 {synth.nb_chambres}</span>}
                  </div>
                  {synth.fourchette_prix_basse&&(
                    <div style={{fontSize:14,fontWeight:700,color:C.gold}}>
                      💰 {synth.fourchette_prix_basse.toLocaleString()}–{synth.fourchette_prix_haute.toLocaleString()} {dev}
                    </div>
                  )}
                </div>
                <DPE dpe={DPE_VALID.includes(meta.dpe)?meta.dpe:DPE_VALID.includes(synth?.dpe_estime)?synth.dpe_estime:null}/>
              </div>
              {synth.conseil_mise_en_vente&&(
                <div style={{fontSize:12,color:"#888",fontStyle:"italic",padding:"10px 14px",
                  background:"#06060F",borderRadius:8,borderLeft:`3px solid ${C.gold}`,
                  marginBottom:14,lineHeight:1.7}}>{synth.conseil_mise_en_vente}</div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {[[L.pointsForts,synth.points_forts,C.green],
                  [L.defauts,[...(synth.points_faibles||[]),...(synth.defauts_critiques||[]).map(d=>"🔴 "+d)],C.err],
                  [L.retouches,synth.suggestions_retouche_globales,C.gold]
                ].map(([title,items,col])=>(
                  <div key={title} style={{background:"#06060F",borderRadius:10,padding:"10px 12px"}}>
                    <div style={{fontSize:10,color:col,marginBottom:8,letterSpacing:1}}>{title}</div>
                    {(items||[]).slice(0,4).map((p,i)=>(
                      <div key={i} style={{fontSize:11,color:"#666",padding:"3px 0",
                        borderBottom:`1px solid ${C.brd}`,lineHeight:1.5}}>
                        <span style={{color:col}}>›</span> {p}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {synth.pense_betes?.length>0&&(
                <div style={{marginTop:12,background:"#06060F",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{fontSize:10,color:C.acc,marginBottom:8,letterSpacing:1}}>📌 {L.penseBetes}</div>
                  {synth.pense_betes.map((p,i)=>(
                    <div key={i} style={{fontSize:11,color:"#666",padding:"3px 0",
                      borderBottom:`1px solid ${C.brd}`,lineHeight:1.5}}>
                      {i+1}. {p}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── ANNONCE ── */}
        {(annonce||Object.keys(annonces).length>0)&&(
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
                <ST>{L.annonceTitle}</ST>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {revHist.length>0&&(
                    <button onClick={()=>{setAnnonce(revHist[revHist.length-1]);setRevHist(h=>h.slice(0,-1));}}
                      style={{...btn(C.surf,C.muted,{border:`1px solid ${C.brd}`,fontSize:11,padding:"7px 12px"})}}>↩</button>
                  )}
                  <button onClick={()=>setRevMode(m=>!m)}
                    style={{...btn(revMode?C.acc:C.acc+"20",revMode?"#fff":C.acc,
                      {border:`1px solid ${C.acc}40`,fontSize:11,padding:"7px 12px"})}}>
                    {revMode?L.fermer:L.reviser}
                  </button>
                  <button onClick={()=>setStep("apercu")}
                    style={{...btn(C.gold+"20",C.gold,{border:`1px solid ${C.gold}40`,fontSize:11,padding:"7px 12px"})}}>
                    {L.apercu}
                  </button>
                  <button onClick={()=>setStep("fiche_interne")}
                    style={{...btn(C.green+"20",C.green,{border:`1px solid ${C.green}40`,fontSize:11,padding:"7px 12px"})}}>
                    📄
                  </button>
                </div>
              </div>

              {/* ── MODE RÉVISION ── */}
              {revMode&&(
                <div style={{marginBottom:14,padding:14,background:"#0A0A18",
                  border:`1px solid ${C.acc}30`,borderRadius:10,animation:"fadeUp 0.2s ease"}}>

                  {/* Toggle Mode Simple / Multi-langue */}
                  <div style={{display:"flex",gap:8,marginBottom:14}}>
                    <button onClick={()=>setMultiLangMode(false)}
                      style={{...btn(!multiLangMode?C.acc:C.surf,!multiLangMode?"#fff":C.muted,
                        {border:`1px solid ${!multiLangMode?C.acc:C.brd}`,fontSize:11,padding:"7px 14px",flex:1})}}>
                      ✍️ 1 langue
                    </button>
                    <button onClick={()=>setMultiLangMode(true)}
                      style={{...btn(multiLangMode?C.acc:C.surf,multiLangMode?"#fff":C.muted,
                        {border:`1px solid ${multiLangMode?C.acc:C.brd}`,fontSize:11,padding:"7px 14px",flex:1})}}>
                      🌍 Multi-langues
                    </button>
                  </div>

                  {!multiLangMode ? (
                    /* MODE SIMPLE — 1 langue */
                    <>
                      <div style={{fontSize:11,color:C.acc,marginBottom:10}}>
                        Langue → modifier → appliquer
                      </div>
                      {/* Changement de langue */}
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:10,color:"#555",marginBottom:6}}>CHANGER LA LANGUE</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {[["fr","🇫🇷"],["en","🇬🇧"],["de","🇩🇪"],["lu","🇱🇺"],["nl","🇧🇪"]].map(([lg,flag])=>(
                            <button key={lg} onClick={()=>{
                              if(annonces[lg]){setAnnonce(annonces[lg]);setActiveLang(lg);}
                              else{setM("langAnnonce",lg);genAnnonce();}
                            }}
                              style={{padding:"6px 12px",borderRadius:16,fontSize:12,
                                background:activeLang===lg?C.acc+"20":"#111120",
                                border:`1px solid ${activeLang===lg?C.acc:"#222"}`,
                                color:activeLang===lg?C.acc:"#555",
                                boxShadow:annonces[lg]?`0 0 6px ${C.green}40`:"none"}}>
                              {flag} {annonces[lg]?"✓":""}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Instructions révision */}
                      <div style={{fontSize:10,color:"#555",marginBottom:8}}>MODIFIER LE TEXTE</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                        {["Ton plus formel","Ton plus chaleureux","Raccourcir","Mettre en avant le prix","Ajouter appel à l'action"].map(s=>(
                          <button key={s} onClick={()=>setRevInstr(s)}
                            style={{padding:"5px 10px",borderRadius:16,fontSize:10,
                              background:revInstr===s?C.acc+"20":"#111120",
                              border:`1px solid ${revInstr===s?C.acc:"#222"}`,
                              color:revInstr===s?C.acc:"#555"}}>{s}</button>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <textarea value={revInstr} onChange={e=>setRevInstr(e.target.value)}
                          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();applyRev();}}}
                          placeholder="Instruction précise…"
                          style={{...inp,flex:1,height:50,resize:"none"}}/>
                        <button onClick={applyRev} disabled={!revInstr.trim()||loading}
                          style={{...btn(C.acc),padding:"0 16px",opacity:(!revInstr.trim()||loading)?0.4:1}}>
                          {L.appliquer}
                        </button>
                      </div>
                    </>
                  ) : (
                    /* MODE MULTI-LANGUES — cases à cocher */
                    <>
                      <div style={{fontSize:11,color:C.acc,marginBottom:12}}>
                        Coche les langues souhaitées — une annonce sera générée pour chacune
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                        {[["fr","🇫🇷 Français"],["en","🇬🇧 English"],
                          ["de","🇩🇪 Deutsch"],["lu","🇱🇺 Lëtzebuergesch"],["nl","🇧🇪 Nederlands"]].map(([lg,label])=>(
                          <label key={lg} style={{display:"flex",alignItems:"center",gap:8,
                            fontSize:13,color:selectedLangs[lg]?C.text:"#555",
                            cursor:"pointer",padding:"8px 10px",borderRadius:8,
                            background:selectedLangs[lg]?C.acc+"15":"#0A0A18",
                            border:`1px solid ${selectedLangs[lg]?C.acc+"50":C.brd}`}}>
                            <input type="checkbox" checked={!!selectedLangs[lg]}
                              onChange={e=>setSelectedLangs(s=>({...s,[lg]:e.target.checked}))}/>
                            {label}
                            {annonces[lg]&&<span style={{marginLeft:"auto",color:C.green,fontSize:11}}>✓</span>}
                          </label>
                        ))}
                      </div>
                      <button onClick={genMultiLang} disabled={loading||!Object.values(selectedLangs).some(Boolean)}
                        style={{...btn("linear-gradient(135deg,#7C6FFF,#4AE88A)"),
                          width:"100%",padding:"12px",fontSize:13,
                          opacity:(loading||!Object.values(selectedLangs).some(Boolean))?0.5:1}}>
                        {loading?`⟳ ${loadMsg}`:`🌍 Générer ${Object.values(selectedLangs).filter(Boolean).length} langue(s)`}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Onglets langues si multi-langue généré */}
              {Object.keys(annonces).length>1&&(
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                  {Object.keys(annonces).map(lg=>{
                    const flags={fr:"🇫🇷",en:"🇬🇧",de:"🇩🇪",lu:"🇱🇺",nl:"🇧🇪"};
                    return(
                      <button key={lg} onClick={()=>{setActiveLang(lg);setAnnonce(annonces[lg]);}}
                        style={{padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:600,
                          background:activeLang===lg?C.acc:C.surf,
                          color:activeLang===lg?"#fff":"#666",
                          border:`1px solid ${activeLang===lg?C.acc:C.brd}`}}>
                        {flags[lg]} {lg.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Contenu annonce */}
              {annonce&&!annonce.error&&(
                <>
                  <div style={{fontSize:16,fontWeight:700,marginBottom:10,lineHeight:1.4}}>
                    {annonce.titre_principal}
                  </div>
                  {annonce.points_cles?.length>0&&(
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                      {annonce.points_cles.map((p,i)=>(
                        <span key={i} style={{fontSize:11,padding:"4px 10px",borderRadius:12,
                          background:C.acc+"18",color:C.acc,border:`1px solid ${C.acc}30`}}>{p}</span>
                      ))}
                    </div>
                  )}
                  <div style={{fontSize:13,lineHeight:1.85,color:"#B0B0C8",whiteSpace:"pre-wrap",
                    background:"#06060F",padding:14,borderRadius:8,border:`1px solid ${C.brd}`}}>
                    {annonce.description_longue}
                  </div>
                  {annonce.avertissement_dpe&&(
                    <div style={{marginTop:10,padding:"8px 12px",background:"#1F0A0A",
                      border:`1px solid ${C.err}30`,borderRadius:6,fontSize:11,color:C.err}}>
                      {annonce.avertissement_dpe}
                    </div>
                  )}
                </>
              )}
              {annonce?.error&&(
                <div style={{color:C.err,fontSize:12,padding:10}}>❌ {annonce.error}</div>
              )}
            </Card>
          </div>
        )}

        {/* ── APERÇU PLATEFORMES ── */}
        {annonce&&step==="apercu"&&(
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <Card>
              <ST color={C.gold}>{L.paysPlatform}</ST>
              {/* Sélecteur pays plateformes — auto-langue */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                {Object.entries(COUNTRIES).map(([k,v])=>(
                  <button key={k} onClick={()=>changePlatCountry(k)}
                    style={{padding:"6px 12px",borderRadius:7,fontSize:11,fontWeight:600,
                      background:platCountry===k?C.acc:C.surf,color:platCountry===k?"#fff":"#666",
                      border:`1px solid ${platCountry===k?C.acc:C.brd}`}}>
                    {v}
                    {annonces[PLATFORM_LANG[k]]&&<span style={{color:C.green,marginLeft:4}}>✓</span>}
                  </button>
                ))}
              </div>
              {/* Sélecteur plateforme */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
                {currPlats.map(p=>(
                  <button key={p.id} onClick={()=>setPlat(p.id)}
                    style={{padding:"8px 14px",borderRadius:8,fontSize:12,fontWeight:600,
                      background:platform===p.id?p.color:C.surf,
                      color:platform===p.id?"#fff":"#666",
                      border:`1px solid ${platform===p.id?p.color:C.brd}`}}>
                    {p.logo} {p.name}
                  </button>
                ))}
                <button onClick={copy}
                  style={{...btn(copied?C.green+"20":C.gold+"20",copied?C.green:C.gold,
                    {border:`1px solid ${copied?C.green:C.gold}40`,fontSize:11,marginLeft:"auto",padding:"8px 14px"})}}>
                  {copied?L.copie:L.copier}
                </button>
              </div>
              {(()=>{
                const p=currPlats.find(x=>x.id===platform)||currPlats[0];
                const titre=annonce.titre_court||annonce.titre_principal;
                const desc=annonce.description_courte||annonce.description_longue;
                return(
                  <div style={{border:`2px solid ${p.color}40`,borderRadius:12,overflow:"hidden",background:"#fff"}}>
                    <div style={{background:p.color,padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:18}}>{p.logo}</span>
                      <span style={{color:"#fff",fontWeight:700,fontSize:14}}>{p.name}</span>
                      <span style={{color:"rgba(255,255,255,0.6)",fontSize:11,marginLeft:"auto"}}>
                        {COUNTRIES[platCountry]}
                      </span>
                    </div>
                    <div style={{padding:18,color:"#1A1A1A"}}>
                      {photos.filter(ph=>ph.preview).length>0&&(
                        <div style={{display:"grid",gridTemplateColumns:photos.length>1?"2fr 1fr":"1fr",
                          gap:8,marginBottom:14,height:170,borderRadius:8,overflow:"hidden"}}>
                          <img src={photos[0].preview} alt="principale"
                            style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          {photos.length>1&&(
                            <div style={{display:"grid",gridTemplateRows:`repeat(${Math.min(photos.length-1,3)},1fr)`,gap:8}}>
                              {photos.slice(1,4).map((ph,i)=>(
                                <img key={i} src={ph.preview} alt={ph.roomType}
                                  style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:4}}/>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <div style={{fontSize:22,fontWeight:800,color:p.color,marginBottom:8}}>
                        {meta.prix?Number(meta.prix).toLocaleString()+" "+dev
                          :synth?.fourchette_prix_basse?`~${synth.fourchette_prix_basse.toLocaleString()} ${dev}`
                          :"Prix sur demande"}
                      </div>
                      <div style={{fontSize:17,fontWeight:700,marginBottom:10,lineHeight:1.3,color:"#1A1A1A"}}>{titre}</div>
                      <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap",
                        fontSize:13,color:"#555",borderBottom:"1px solid #EEE",paddingBottom:12}}>
                        <span>📐 {synth?.surface_totale_estimee||meta.surface}m²</span>
                        <span>🏠 {synth?.nb_pieces||meta.pieces}</span>
                        <span>🛏 {synth?.nb_chambres||meta.chambres}</span>
                        {meta.dpe?.length===1&&(
                          <span style={{padding:"2px 8px",borderRadius:4,fontWeight:700,
                            background:DPE_C[meta.dpe],color:"#fff",fontSize:11}}>DPE {meta.dpe}</span>
                        )}
                        {meta.charges&&<span>💰 {meta.charges} {dev}/mois</span>}
                      </div>
                      <div style={{fontSize:13,lineHeight:1.8,color:"#333",marginBottom:12}}>{desc}</div>
                      {annonce.points_cles?.length>0&&(
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                          {annonce.points_cles.map((pk,i)=>(
                            <span key={i} style={{fontSize:11,padding:"4px 10px",
                              background:p.color+"15",color:p.color,
                              borderRadius:16,border:`1px solid ${p.color}30`}}>{pk}</span>
                          ))}
                        </div>
                      )}
                      <div style={{display:"flex",gap:10,flexWrap:"wrap",fontSize:12,color:"#888",marginBottom:14}}>
                        {[...L.equip,["cellier","📦 Cellier"],["buanderie","🫧 Buanderie"]].filter(([k])=>meta[k]).map(([k,label])=><span key={k}>{label}</span>)}
                      </div>
                      {/* Mentions légales */}
                      <div style={{fontSize:10,color:"#AAA",lineHeight:1.6,padding:"10px 12px",
                        background:"#F8F8F8",borderRadius:6,borderLeft:"3px solid #DDD",marginBottom:14}}>
                        <div style={{fontWeight:700,marginBottom:4,fontSize:11}}>{L.mentions}</div>
                        {LEGAL[meta.pays]||LEGAL.fr}
                      </div>
                      {/* Profil agence */}
                      {profil.nomAgence&&(
                        <div style={{padding:"12px 14px",background:"#F0F0F8",borderRadius:8,
                          marginBottom:14,borderLeft:`3px solid ${p.color}`}}>
                          <div style={{fontWeight:700,fontSize:13,color:"#1A1A1A",marginBottom:4}}>
                            🏢 {profil.nomAgence}
                          </div>
                          {profil.nomAgent&&<div style={{fontSize:12,color:"#555"}}>👤 {profil.nomAgent}</div>}
                          {profil.telephone&&<div style={{fontSize:12,color:"#555"}}>📞 {profil.telephone}</div>}
                          {profil.email&&<div style={{fontSize:12,color:"#555"}}>📧 {profil.email}</div>}
                          {profil.siteWeb&&<div style={{fontSize:12,color:p.color}}>{profil.siteWeb}</div>}
                          {profil.slogan&&<div style={{fontSize:11,color:"#888",fontStyle:"italic",marginTop:4}}>{profil.slogan}</div>}
                        </div>
                      )}
                      <div style={{display:"inline-block",padding:"12px 24px",
                        background:p.color,color:"#fff",borderRadius:8,fontSize:13,fontWeight:700}}>
                        📞 {profil.telephone||"Contacter"}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Card>
          </div>
        )}

        {/* ── FICHE INTERNE ── */}
        {synth&&annonce&&step==="fiche_interne"&&(
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
                <ST color={C.green}>{L.ficheTitle}</ST>
                <button onClick={downloadFiche}
                  style={{...btn(C.green+"20",C.green,{border:`1px solid ${C.green}40`,fontSize:12,padding:"9px 16px"})}}>
                  {L.telecharger}
                </button>
              </div>
              {/* En-tête */}
              <div style={{background:"#06060F",borderRadius:10,padding:"14px",marginBottom:14}}>
                <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:13,marginBottom:8}}>
                  <span style={{color:C.gold,fontWeight:700}}>{meta.type} — {meta.ville||"NC"}</span>
                  <span style={{color:"#888"}}>{synth.surface_totale_estimee||meta.surface}m² · {synth.nb_pieces||meta.pieces} pièces</span>
                  <span style={{color:C.green,fontWeight:700}}>Score {synth.score_global}/10</span>
                </div>
                {meta.prix&&<div style={{fontSize:18,fontWeight:700,color:C.gold}}>{Number(meta.prix).toLocaleString()} {dev}</div>}
                {synth.fourchette_prix_basse&&(
                  <div style={{fontSize:12,color:"#666",marginTop:4}}>
                    {L.estimation}: {synth.fourchette_prix_basse.toLocaleString()}–{synth.fourchette_prix_haute.toLocaleString()} {dev}
                  </div>
                )}
              </div>
              {/* Grille */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                {[[L.pointsForts,synth.points_forts,C.green],
                  [L.defauts,[...(synth.points_faibles||[]),...(synth.defauts_critiques||[]).map(d=>"🔴 "+d)],C.err],
                  [L.travaux,[...(synth.travaux_urgents||[]).map(t=>"🔧 "+t),...(synth.travaux_valorisants||[]).map(t=>"📈 "+t)],"#7EC8C8"],
                  [L.retouches,synth.suggestions_retouche_globales,C.gold],
                ].map(([title,items,col])=>(
                  <div key={title} style={{background:"#06060F",borderRadius:10,padding:"12px"}}>
                    <div style={{fontSize:10,color:col,marginBottom:8,letterSpacing:1,fontWeight:700}}>{title}</div>
                    {(items||[]).map((p,i)=>(
                      <div key={i} style={{fontSize:11,color:"#666",padding:"4px 0",
                        borderBottom:`1px solid ${C.brd}`,lineHeight:1.5}}>
                        <span style={{color:col}}>›</span> {p}
                      </div>
                    ))}
                    {!items?.length&&<div style={{fontSize:10,color:"#333"}}>Aucun</div>}
                  </div>
                ))}
              </div>
              {/* Conseil */}
              {synth.conseil_mise_en_vente&&(
                <div style={{background:"#06060F",borderRadius:10,padding:"12px",marginBottom:12}}>
                  <div style={{fontSize:10,color:C.acc,marginBottom:6,letterSpacing:1}}>{L.conseil}</div>
                  <div style={{fontSize:12,color:"#888",lineHeight:1.7,fontStyle:"italic"}}>{synth.conseil_mise_en_vente}</div>
                  {synth.profil_acheteur&&(
                    <div style={{marginTop:8,fontSize:12,color:C.acc}}>
                      👤 {L.profil}: <strong>{synth.profil_acheteur}</strong>
                    </div>
                  )}
                </div>
              )}
              {/* Pense-bêtes */}
              {synth.pense_betes?.length>0&&(
                <div style={{background:"#06060F",borderRadius:10,padding:"12px",marginBottom:12}}>
                  <div style={{fontSize:10,color:C.acc,marginBottom:8,letterSpacing:1}}>📌 {L.penseBetes}</div>
                  {synth.pense_betes.map((p,i)=>(
                    <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.brd}`}}>
                      <span style={{color:C.acc,fontWeight:700,minWidth:18}}>{i+1}.</span>
                      <span style={{fontSize:12,color:"#666",lineHeight:1.5}}>{p}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Mentions */}
              <div style={{background:"#06060F",borderRadius:10,padding:"12px"}}>
                <div style={{fontSize:10,color:"#555",marginBottom:8,letterSpacing:1}}>
                  {L.mentions} — {COUNTRIES[meta.pays]}
                </div>
                <div style={{fontSize:10,color:"#555",lineHeight:1.7}}>{LEGAL[meta.pays]||LEGAL.fr}</div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* BARRE BAS */}
      <div style={{padding:"10px 16px",background:"#060610",borderTop:`1px solid ${C.brd}`,
        flexShrink:0,display:"flex",gap:10,justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:10,color:"#444"}}>
          {photos.length} photo{photos.length>1?"s":""} · {analyses.filter(a=>!a.error).length} analysée{analyses.filter(a=>!a.error).length>1?"s":""}
        </div>
        <div style={{display:"flex",gap:8}}>
          {synth&&!annonce&&(
            <button onClick={genAnnonce} disabled={loading}
              style={{...btn("linear-gradient(135deg,#7C6FFF,#4AE88A)"),fontSize:11,padding:"8px 14px",opacity:loading?0.5:1}}>
              {L.genAnnonce}
            </button>
          )}
          {annonce&&step!=="apercu"&&(
            <button onClick={()=>setStep("apercu")}
              style={{...btn(C.gold+"20",C.gold,{border:`1px solid ${C.gold}40`,fontSize:11,padding:"8px 14px"})}}>
              {L.apercu}
            </button>
          )}
          {annonce&&step!=="fiche_interne"&&(
            <button onClick={()=>setStep("fiche_interne")}
              style={{...btn(C.green+"20",C.green,{border:`1px solid ${C.green}40`,fontSize:11,padding:"8px 14px"})}}>
              {L.ficheTitle}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ImmoHub v5 — fin
