---
name: zaymmo-social-media
description: Génération de contenu réseaux sociaux Zaymmo. Lire avant toute modification des posts générés pour Instagram, Facebook, LinkedIn. Transforme automatiquement chaque annonce en contenu prêt à publier sur chaque réseau.
---

# Zaymmo Social Media

## PRINCIPE

Chaque annonce générée peut produire automatiquement des posts adaptés
à chaque réseau social, avec le bon format, ton et longueur.

---

## FORMATS PAR RÉSEAU

```javascript
const SOCIAL_FORMATS = {
  instagram: {
    maxLength: 2200,
    style: "Visuel et émotionnel, emojis modérés, hashtags en fin de post",
    structure: "Accroche courte + 2-3 phrases + CTA + hashtags",
    hashtagsCount: 15,
  },
  facebook: {
    maxLength: 500,
    style: "Conversationnel, informatif, peu d'emojis",
    structure: "Accroche + description courte + points clés + CTA",
    hashtagsCount: 3,
  },
  linkedin: {
    maxLength: 1300,
    style: "Professionnel, factuel, orienté investissement/marché",
    structure: "Angle business/marché + caractéristiques + données chiffrées + CTA",
    hashtagsCount: 5,
  },
};
```

---

## GÉNÉRATION POST INSTAGRAM

```javascript
function generateInstagramPost(annonce, meta, synth) {
  const emoji = {
    Maison: "🏡", Appartement: "🏢", Villa: "🏖️", Studio: "🏠",
  }[meta.type] || "🏠";

  const post = `${emoji} ${annonce.titre_principal}

${annonce.description_courte.slice(0, 200)}...

✨ ${(synth?.points_forts || []).slice(0,3).join(" • ")}

📍 ${meta.ville}
💰 ${Number(meta.prix).toLocaleString()} €
📐 ${meta.surface}m² — ${meta.pieces} pièces

${annonce.call_to_action}

${(annonce.hashtags || []).join(" ")} #immobilier #avendre #realestate`;

  return post.slice(0, SOCIAL_FORMATS.instagram.maxLength);
}
```

---

## GÉNÉRATION POST FACEBOOK

```javascript
function generateFacebookPost(annonce, meta) {
  const post = `🏠 NOUVELLE ANNONCE — ${annonce.titre_principal}

${annonce.description_courte}

📋 Caractéristiques :
${(annonce.points_cles || []).map(p => `✓ ${p}`).join("\n")}

📍 ${meta.ville} | 💰 ${Number(meta.prix).toLocaleString()} €

${annonce.call_to_action}

#immobilier #${meta.ville?.replace(/\s/g,"")}`;

  return post.slice(0, SOCIAL_FORMATS.facebook.maxLength);
}
```

---

## GÉNÉRATION POST LINKEDIN

```javascript
function generateLinkedInPost(annonce, meta, synth) {
  const investorAngle = synth?.fourchette_prix
    ? `\n\n📊 Estimation marché : ${synth.fourchette_prix.replace("-", " — ")} €`
    : "";

  const post = `Nouvelle opportunité immobilière à ${meta.ville}

${annonce.description_courte}

Caractéristiques clés :
${(annonce.points_cles || []).slice(0,4).map(p => `→ ${p}`).join("\n")}

DPE : ${meta.dpe} | Surface : ${meta.surface}m²${investorAngle}

${annonce.call_to_action}

#immobilier #investissement #${meta.ville?.replace(/\s/g,"")}`;

  return post.slice(0, SOCIAL_FORMATS.linkedin.maxLength);
}
```

---

## COMPOSANT GÉNÉRATEUR SOCIAL

```jsx
function SocialMediaPanel({ annonce, meta, synth }) {
  const [activeNetwork, setActiveNetwork] = useState("instagram");
  const [copied, setCopied] = useState(false);

  const generators = {
    instagram: generateInstagramPost,
    facebook:  generateFacebookPost,
    linkedin:  generateLinkedInPost,
  };

  const post = generators[activeNetwork](annonce, meta, synth);

  const copyPost = () => {
    navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Card>
      <ST color="#C8793A">RÉSEAUX SOCIAUX</ST>

      {/* Onglets réseaux */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["instagram","facebook","linkedin"].map(net => (
          <button key={net} onClick={() => setActiveNetwork(net)}
            style={{
              padding: "6px 12px", borderRadius: 6, fontSize: 11,
              background: activeNetwork === net ? "#C8793A20" : "transparent",
              color: activeNetwork === net ? "#C8793A" : "#3A2A1A",
              border: `1px solid ${activeNetwork === net ? "#C8793A40" : "#1A1410"}`,
              textTransform: "capitalize",
            }}>
            {net}
          </button>
        ))}
      </div>

      {/* Aperçu post */}
      <div style={{
        background: "#0A0A0A", borderRadius: 8, padding: 12,
        fontSize: 12, color: "#C0A890", lineHeight: 1.6,
        whiteSpace: "pre-wrap", maxHeight: 300, overflowY: "auto",
        marginBottom: 10,
      }}>
        {post}
      </div>

      {/* Compteur caractères */}
      <div style={{ fontSize: 9, color: "#3A2A1A", marginBottom: 10 }}>
        {post.length} / {SOCIAL_FORMATS[activeNetwork].maxLength} caractères
      </div>

      {/* Bouton copier */}
      <button onClick={copyPost}
        style={{
          width: "100%", padding: 10, borderRadius: 6,
          background: copied ? "#4AE88A20" : "#C8793A20",
          color: copied ? "#4AE88A" : "#C8793A",
          border: `1px solid ${copied ? "#4AE88A40" : "#C8793A40"}`,
          fontSize: 12, fontWeight: 700,
        }}>
        {copied ? "Copié !" : `Copier pour ${activeNetwork}`}
      </button>
    </Card>
  );
}
```

---

## ADAPTATION SELON LE PRIX

```javascript
// Tonalité différente selon la gamme de prix
function getSocialTone(prix) {
  if (prix > 800000) return "premium"; // Ton luxe, sobriété
  if (prix > 400000) return "standard"; // Ton chaleureux classique
  return "accessible"; // Ton dynamique, premier achat
}

const TONE_ADJUSTMENTS = {
  premium: { emojis: "minimal", style: "Élégant et sobre" },
  standard: { emojis: "modéré", style: "Chaleureux et engageant" },
  accessible: { emojis: "généreux", style: "Dynamique et accessible" },
};
```

---

## STORIES INSTAGRAM (format court)

```javascript
function generateStorySlides(annonce, meta, photos) {
  return [
    { type: "cover", text: annonce.titre_principal, photo: photos[0]?.preview },
    { type: "info", text: `${meta.surface}m² · ${meta.pieces} pièces · ${meta.ville}` },
    { type: "highlight", text: (synth?.points_forts || [])[0] || "" },
    { type: "price", text: `${Number(meta.prix).toLocaleString()} €` },
    { type: "cta", text: "Contactez-nous pour une visite" },
  ];
}
```
