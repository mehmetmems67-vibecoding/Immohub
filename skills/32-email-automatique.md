---
name: zaymmo-email-automatique
description: Génération d'emails automatiques Zaymmo. Lire avant toute modification de la génération de templates email. Crée automatiquement les emails de présentation, relance et suivi pour gagner du temps à l'agent.
---

# Zaymmo Email Automatique

## PRINCIPE

Zaymmo génère des emails prêts à envoyer pour chaque étape de la relation
avec un acheteur potentiel — présentation, relance, confirmation de visite.

---

## TYPES D'EMAILS GÉNÉRÉS

```javascript
const EMAIL_TYPES = {
  presentation: {
    label: "Présentation du bien",
    usage: "Premier contact avec un acheteur potentiel",
  },
  relance: {
    label: "Relance après visite",
    usage: "Suivi quelques jours après une visite",
  },
  confirmation_visite: {
    label: "Confirmation de visite",
    usage: "Confirmer un rendez-vous de visite",
  },
  nouvelle_annonce: {
    label: "Nouvelle annonce correspondante",
    usage: "Alerter un acheteur sur un bien correspondant à ses critères",
  },
  offre_recue: {
    label: "Accusé réception d'offre",
    usage: "Confirmer la réception d'une offre d'achat",
  },
};
```

---

## GÉNÉRATION EMAIL PRÉSENTATION

```javascript
async function generatePresentationEmail(annonce, meta, profil) {
  const prompt = `Tu es un agent immobilier professionnel.
Rédige un email de présentation pour ce bien, à envoyer à un acheteur potentiel.

BIEN:
${annonce.titre_principal}
${annonce.description_courte}
Prix: ${Number(meta.prix).toLocaleString()} €
Surface: ${meta.surface}m²

STYLE: Professionnel, chaleureux, pas trop long (150-200 mots)
STRUCTURE: Salutation personnalisée + accroche + points clés + invitation visite + signature

FORMAT JSON:
{
  "objet": "Objet de l'email",
  "corps": "Corps complet de l'email avec sauts de ligne \\n"
}`;

  const result = await callClaude(
    [{ role: "user", content: prompt }],
    "Rédacteur emails immobiliers professionnels."
  );

  return {
    objet: result.objet,
    corps: result.corps.replace(
      "[SIGNATURE]",
      `${profil.nomAgent || "L'équipe Zaymmo"}\n${profil.telephone || ""}\n${profil.email || ""}`
    ),
  };
}
```

---

## TEMPLATES STATIQUES (sans appel API — rapides)

```javascript
const EMAIL_TEMPLATES = {
  confirmation_visite: (data) => ({
    objet: `Confirmation visite — ${data.titre}`,
    corps: `Bonjour ${data.nomClient || ""},

Je vous confirme notre rendez-vous pour la visite du bien suivant :

${data.titre}
📍 ${data.adresse}
📅 ${data.date} à ${data.heure}

N'hésitez pas à me contacter si vous avez la moindre question avant la visite.

Cordialement,
${data.nomAgent}
${data.telephone}`,
  }),

  relance: (data) => ({
    objet: `Suite à votre visite — ${data.titre}`,
    corps: `Bonjour ${data.nomClient || ""},

J'espère que la visite du ${data.date} vous a plu.

N'hésitez pas à me faire part de vos impressions ou de toute question
complémentaire concernant ce bien.

Je reste à votre disposition pour organiser une seconde visite ou
discuter des modalités d'achat.

Cordialement,
${data.nomAgent}
${data.telephone}`,
  }),

  offre_recue: (data) => ({
    objet: `Accusé réception de votre offre — ${data.titre}`,
    corps: `Bonjour ${data.nomClient || ""},

J'accuse bonne réception de votre offre d'achat concernant :
${data.titre}

Montant proposé : ${data.montantOffre} €

Je transmets votre offre au vendeur et reviens vers vous rapidement
avec sa réponse.

Cordialement,
${data.nomAgent}
${data.telephone}`,
  }),
};
```

---

## COMPOSANT GÉNÉRATEUR EMAIL

```jsx
function EmailGeneratorPanel({ annonce, meta, profil }) {
  const [emailType, setEmailType] = useState("presentation");
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      let email;
      if (emailType === "presentation") {
        email = await generatePresentationEmail(annonce, meta, profil);
      } else {
        email = EMAIL_TEMPLATES[emailType]?.({
          titre: annonce.titre_principal,
          nomAgent: profil.nomAgent,
          telephone: profil.telephone,
          adresse: meta.ville,
        });
      }
      setGeneratedEmail(email);
    } finally {
      setLoading(false);
    }
  }

  function copyEmail() {
    const text = `Objet: ${generatedEmail.objet}\n\n${generatedEmail.corps}`;
    navigator.clipboard.writeText(text);
  }

  function openInMailApp() {
    const subject = encodeURIComponent(generatedEmail.objet);
    const body = encodeURIComponent(generatedEmail.corps);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <Card>
      <ST color="#C8793A">GÉNÉRATEUR EMAIL</ST>

      {/* Sélecteur type */}
      <select value={emailType} onChange={e => setEmailType(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10, fontSize: 12 }}>
        {Object.entries(EMAIL_TYPES).map(([key, val]) => (
          <option key={key} value={key}>{val.label}</option>
        ))}
      </select>

      <button onClick={generate} disabled={loading}
        style={{
          width: "100%", padding: 10, borderRadius: 6,
          background: "#C8793A20", color: "#C8793A",
          border: "1px solid #C8793A40", fontSize: 12, marginBottom: 12,
        }}>
        {loading ? "Génération..." : "Générer l'email"}
      </button>

      {/* Aperçu */}
      {generatedEmail && (
        <div>
          <div style={{ fontSize: 11, color: "#8A7060", marginBottom: 6 }}>
            <strong>Objet:</strong> {generatedEmail.objet}
          </div>
          <div style={{
            background: "#0A0A0A", borderRadius: 8, padding: 12,
            fontSize: 11, color: "#C0A890", whiteSpace: "pre-wrap",
            maxHeight: 200, overflowY: "auto", marginBottom: 10,
          }}>
            {generatedEmail.corps}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={copyEmail} style={{ flex: 1, fontSize: 11, padding: 8 }}>
              Copier
            </button>
            <button onClick={openInMailApp} style={{ flex: 1, fontSize: 11, padding: 8 }}>
              Ouvrir Mail
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
```

---

## INTÉGRATION MAILTO

```javascript
// Ouverture directe dans l'app mail du téléphone
function openMailto(email, destinataire = "") {
  const subject = encodeURIComponent(email.objet);
  const body = encodeURIComponent(email.corps);
  window.location.href = `mailto:${destinataire}?subject=${subject}&body=${body}`;
}
```
