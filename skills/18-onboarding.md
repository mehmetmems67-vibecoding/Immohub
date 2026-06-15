---
name: zaymmo-onboarding
description: Système d'onboarding de Zaymmo. Guide interactif pour les nouveaux agents. ZayZay accompagne les 3 premières utilisations pour que l'agent soit autonome rapidement.
---

# Zaymmo Onboarding

## PRINCIPE

Un nouvel agent maîtrise Zaymmo en 3 utilisations.
ZayZay guide chaque étape sans surcharger.

---

## DÉTECTION PREMIER USAGE

```javascript
const ONBOARDING_KEY = "zaymmo_onboarded";
const ONBOARDING_STEP_KEY = "zaymmo_onboarding_step";

function isFirstTime() {
  return !localStorage.getItem(ONBOARDING_KEY);
}

function getOnboardingStep() {
  return parseInt(localStorage.getItem(ONBOARDING_STEP_KEY) || "0");
}

function completeOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, "true");
  localStorage.removeItem(ONBOARDING_STEP_KEY);
}
```

---

## MESSAGES ONBOARDING PAR ÉTAPE

```javascript
const ONBOARDING_MESSAGES = {
  welcome: {
    title: "Bienvenue sur Zaymmo !",
    message: "Je suis ZayZay, votre assistant. Je vais vous guider en 3 étapes simples.",
    action: "C'est parti →",
  },
  step_photos: {
    title: "Étape 1 — Les photos",
    message: "Commencez par ajouter les photos du bien. L'IA analyse chaque pièce automatiquement.",
    highlight: "photos-section",
  },
  step_analyse: {
    title: "Étape 2 — L'analyse",
    message: "Cliquez sur Analyser. L'IA pré-remplit la fiche. Vous n'avez qu'à corriger les erreurs.",
    highlight: "analyser-button",
  },
  step_annonce: {
    title: "Étape 3 — L'annonce",
    message: "Ajoutez vos notes, puis générez l'annonce en un clic. Zaymmo fait le reste.",
    highlight: "generer-button",
  },
  complete: {
    title: "Vous êtes prêt !",
    message: "ZayZay reste disponible à tout moment via le bouton ZZ en bas à droite.",
    action: "Commencer →",
  },
};
```

---

## COMPOSANT TOOLTIP ONBOARDING

```jsx
function OnboardingTooltip({ step, onNext, onSkip }) {
  const msg = ONBOARDING_MESSAGES[step];
  if (!msg) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 100,
      left: "50%",
      transform: "translateX(-50%)",
      width: "85%",
      maxWidth: 320,
      background: "#0C0A08",
      border: "1px solid #C8793A40",
      borderRadius: 12,
      padding: "16px 18px",
      zIndex: 2000,
      boxShadow: "0 8px 32px #C8793A20",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#C8793A" }}>
          ZayZay · {msg.title}
        </div>
        <button onClick={onSkip}
          style={{ background: "transparent", border: "none", color: "#3A2A1A", cursor: "pointer", fontSize: 11 }}>
          Passer
        </button>
      </div>

      {/* Message */}
      <div style={{ fontSize: 12, color: "#8A7060", lineHeight: 1.5, marginBottom: 12 }}>
        {msg.message}
      </div>

      {/* Action */}
      <button onClick={onNext}
        style={{
          width: "100%",
          padding: "10px",
          background: "linear-gradient(135deg, #C8793A, #9A5018)",
          border: "none",
          borderRadius: 6,
          color: "#050404",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
        }}>
        {msg.action || "Suivant →"}
      </button>
    </div>
  );
}
```

---

## INTÉGRATION DANS L'APP

```javascript
// States onboarding
const [onboardingStep, setOnboardingStep] = useState(
  isFirstTime() ? "welcome" : null
);

// Progression
function nextOnboardingStep() {
  const steps = ["welcome","step_photos","step_analyse","step_annonce","complete"];
  const current = steps.indexOf(onboardingStep);
  if (current < steps.length - 1) {
    const next = steps[current + 1];
    setOnboardingStep(next);
    localStorage.setItem(ONBOARDING_STEP_KEY, (current + 1).toString());
  } else {
    setOnboardingStep(null);
    completeOnboarding();
  }
}

// Skip complet
function skipOnboarding() {
  setOnboardingStep(null);
  completeOnboarding();
}

// Affichage
{onboardingStep && (
  <OnboardingTooltip
    step={onboardingStep}
    onNext={nextOnboardingStep}
    onSkip={skipOnboarding}
  />
)}
```

---

## RÉINITIALISER L'ONBOARDING (admin)

```javascript
// Dans les paramètres admin
function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
  localStorage.removeItem(ONBOARDING_STEP_KEY);
  alert("Onboarding réinitialisé. Rechargez la page.");
}
```
