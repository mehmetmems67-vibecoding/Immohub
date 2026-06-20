---
name: zaymmo-white-label
description: Personnalisation White Label de Zaymmo. Lire avant toute modification touchant la personnalisation par agence. Prépare l'architecture pour que chaque agence cliente puisse personnaliser Zaymmo à ses couleurs (Phase 3 SaaS).
---

# Zaymmo White Label

## PRINCIPE

Phase 1 : Profil agence simple (nom, logo, couleurs basiques).
Phase 3 SaaS : Personnalisation complète par agence cliente.

---

## STRUCTURE PROFIL AGENCE

```javascript
const agencyProfileStructure = {
  nomAgence: "Bon'Appart",
  nomAgent: "Julien Martin",
  telephone: "+33 6 XX XX XX XX",
  email: "julien@bonappart.fr",
  logoUrl: "",              // Phase 1.5 : upload logo agence
  couleurPrincipale: "#C8793A", // Phase 3 : personnalisable
  couleurSecondaire: "#00D4E8",
  carteProfessionnelle: "",  // N° carte pro (France)
  siret: "",
  adresseAgence: "",
};
```

---

## STORAGE PROFIL

```javascript
const PROFILE_KEY = "zaymmo_profile";

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  } catch { return {}; }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
```

---

## COMPOSANT ÉDITION PROFIL (Phase 1)

```jsx
function ProfileEditor({ onSave }) {
  const [profile, setProfile] = useState(() => getProfile());

  function update(field, value) {
    setProfile(prev => ({ ...prev, [field]: value }));
  }

  function save() {
    saveProfile(profile);
    onSave(profile);
  }

  return (
    <Card>
      <ST color="#C8793A">PROFIL AGENCE</ST>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input placeholder="Nom de l'agence" value={profile.nomAgence || ""}
          onChange={e => update("nomAgence", e.target.value)} style={{padding:8,fontSize:12}} />
        <input placeholder="Nom de l'agent" value={profile.nomAgent || ""}
          onChange={e => update("nomAgent", e.target.value)} style={{padding:8,fontSize:12}} />
        <input placeholder="Téléphone" value={profile.telephone || ""}
          onChange={e => update("telephone", e.target.value)} style={{padding:8,fontSize:12}} />
        <input placeholder="Email" value={profile.email || ""}
          onChange={e => update("email", e.target.value)} style={{padding:8,fontSize:12}} />
        <input placeholder="N° Carte professionnelle (optionnel)" value={profile.carteProfessionnelle || ""}
          onChange={e => update("carteProfessionnelle", e.target.value)} style={{padding:8,fontSize:12}} />
      </div>

      <button onClick={save}
        style={{
          width: "100%", padding: 10, marginTop: 12, borderRadius: 6,
          background: "#C8793A20", color: "#C8793A", border: "1px solid #C8793A40",
        }}>
        Enregistrer le profil
      </button>
    </Card>
  );
}
```

---

## UTILISATION DANS LES ANNONCES ET FICHES

```javascript
// Le profil alimente automatiquement :
// - Le call-to-action des annonces
// - Le footer des fiches imprimées
// - Les emails générés
// - Les mentions légales

function getProfileContext() {
  const profile = getProfile();
  return {
    nomAgent: profile.nomAgent || "Notre équipe",
    telephone: profile.telephone || "",
    email: profile.email || "",
    agence: profile.nomAgence || "Zaymmo",
  };
}
```

---

## ARCHITECTURE PHASE 3 — MULTI-AGENCES

```javascript
// Structure préparée pour quand Zaymmo deviendra multi-tenant

const futureMultiTenantSchema = {
  agencyId: "unique_agency_id",
  subdomain: "bonappart.zaymmo.com",  // Sous-domaine personnalisé
  branding: {
    logoUrl: "https://...",
    colors: {
      primary: "#C8793A",      // Personnalisable par agence
      secondary: "#00D4E8",
      background: "#080808",   // Reste sombre par défaut
    },
    customDomain: "",          // Option domaine propre
  },
  plan: "starter" | "pro" | "enterprise",
  agents: [],                  // Liste des agents de l'agence
  limits: {
    analysesParMois: 100,
    agentsMax: 5,
  },
};

// CSS variables dynamiques (préparation Phase 3)
function applyAgencyTheme(branding) {
  document.documentElement.style.setProperty("--zaymmo-primary", branding.colors.primary);
  document.documentElement.style.setProperty("--zaymmo-secondary", branding.colors.secondary);
}
```

---

## LOGO AGENCE DANS LES DOCUMENTS

```jsx
// Affichage logo agence si configuré, sinon logo Zaymmo par défaut
function DocumentHeader({ profile }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {profile.logoUrl ? (
        <img src={profile.logoUrl} style={{ height: 40 }} alt={profile.nomAgence} />
      ) : (
        <ZaymmoLogo size={40} />
      )}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#C8793A" }}>
          {profile.nomAgence || "ZAYMMO"}
        </div>
        {profile.nomAgence && (
          <div style={{ fontSize: 8, color: "#3A2A1A" }}>
            Propulsé par Zaymmo
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## NIVEAU DE PERSONNALISATION PAR PHASE

```
Phase 1 (actuelle) :
✓ Nom agence, agent, contact dans les documents
✓ Mentions légales personnalisées

Phase 1.5 :
→ Upload logo agence (image)
→ Couleur accent personnalisable (parmi palette validée)

Phase 3 (SaaS) :
→ Sous-domaine personnalisé
→ Branding complet (logo, couleurs, domaine)
→ Multi-agents par agence avec rôles
→ Facturation par abonnement
```
