---
name: zaymmo-qr-code
description: Génération de QR codes Zaymmo. Lire avant toute modification de la fiche client ou ajout de fonctionnalité de partage rapide. Chaque bien génère un QR code unique pour un accès instantané à l'annonce complète.
---

# Zaymmo QR Code

## PRINCIPE

Chaque fiche client imprimée affiche un QR code permettant à l'acheteur
de scanner et accéder instantanément aux informations complètes du bien.

---

## GÉNÉRATION QR CODE (sans dépendance externe)

```javascript
// Utilisation d'une API QR gratuite — pas de lib à installer
function generateQRCodeURL(data, size = 200) {
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=C8793A&bgcolor=080808`;
}

// Alternative avec couleurs Zaymmo (cuivre sur fond sombre)
function generateZaymmoQR(meta, annonce) {
  // Contenu encodé : résumé du bien (pas de backend pour stocker une vraie URL)
  const content = `${annonce.titre_principal}
${meta.surface}m² - ${meta.pieces} pieces
${Number(meta.prix).toLocaleString()} EUR
${meta.ville}
${annonce.call_to_action}`;

  return generateQRCodeURL(content, 180);
}
```

---

## COMPOSANT QR CODE

```jsx
function QRCodeDisplay({ meta, annonce, size = 100 }) {
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    if (annonce && meta) {
      setQrUrl(generateZaymmoQR(meta, annonce));
    }
  }, [annonce, meta]);

  if (!qrUrl) return null;

  return (
    <div style={{ textAlign: "center" }}>
      <img
        src={qrUrl}
        alt="QR Code du bien"
        width={size}
        height={size}
        style={{ borderRadius: 8, border: "1px solid #1A1410" }}
      />
      <div style={{ fontSize: 8, color: "#3A2A1A", marginTop: 4, letterSpacing: 1 }}>
        SCANNEZ POUR PLUS D'INFOS
      </div>
    </div>
  );
}
```

---

## INTÉGRATION DANS LA FICHE CLIENT

```jsx
// Ajouter dans printClient() — coin bas droit de la fiche
<div style={{
  position: "absolute",
  bottom: 20,
  right: 20,
}}>
  <QRCodeDisplay meta={meta} annonce={annonce} size={90} />
</div>
```

---

## QR CODE POUR PARTAGE VCARD AGENT

```javascript
// Génère un QR code vCard pour ajouter l'agent aux contacts
function generateAgentVCard(profil) {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profil.nomAgent || "Agent Zaymmo"}
ORG:${profil.agence || "Zaymmo"}
TEL:${profil.telephone || ""}
EMAIL:${profil.email || ""}
END:VCARD`;

  return generateQRCodeURL(vcard, 150);
}
```

---

## VARIANTES QR CODE

```javascript
const QR_VARIANTS = {
  bien: {
    label: "Infos du bien",
    generator: generateZaymmoQR,
  },
  contact: {
    label: "Contact agent (vCard)",
    generator: (meta, annonce, profil) => generateAgentVCard(profil),
  },
  whatsapp: {
    label: "WhatsApp direct",
    generator: (meta, annonce, profil) => {
      const tel = profil.telephone?.replace(/[^0-9+]/g, "");
      const msg = encodeURIComponent(`Bonjour, je suis intéressé(e) par le bien: ${annonce.titre_principal}`);
      return generateQRCodeURL(`https://wa.me/${tel}?text=${msg}`, 180);
    },
  },
};
```

---

## SÉLECTEUR DE TYPE QR DANS LA FICHE

```jsx
function QRTypeSelector({ meta, annonce, profil, onSelect }) {
  const [selected, setSelected] = useState("bien");

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {Object.entries(QR_VARIANTS).map(([key, variant]) => (
          <button key={key} onClick={() => { setSelected(key); onSelect(key); }}
            style={{
              fontSize: 10, padding: "5px 10px", borderRadius: 4,
              background: selected === key ? "#C8793A20" : "transparent",
              color: selected === key ? "#C8793A" : "#3A2A1A",
              border: `1px solid ${selected === key ? "#C8793A40" : "#1A1410"}`,
            }}>
            {variant.label}
          </button>
        ))}
      </div>

      <QRCodeDisplay
        meta={meta}
        annonce={annonce}
        size={120}
      />
    </div>
  );
}
```

---

## LIMITES

```
Pas de backend       : le QR code encode du texte, pas une vraie URL cliquable web
Phase SaaS future    : générer une vraie page web par bien → QR code → URL réelle
Taille max données   : ~2000 caractères pour rester scannable facilement
API utilisée         : qrserver.com (gratuite, pas de clé requise)
Fallback             : si API indisponible, ne pas bloquer l'impression
```
