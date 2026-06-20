---
name: zaymmo-roi-acheteur
description: Calcul de retour sur investissement Zaymmo. Lire avant toute modification des outils de calcul investisseur. Aide l'agent à présenter la rentabilité locative potentielle d'un bien à un acheteur investisseur.
---

# Zaymmo ROI Acheteur

## PRINCIPE

Pour les acheteurs investisseurs, Zaymmo calcule automatiquement
la rentabilité locative potentielle basée sur le prix et le marché local.

---

## CALCUL RENDEMENT LOCATIF BRUT

```javascript
function calculateGrossYield(prix, loyerMensuelEstime) {
  if (!prix || !loyerMensuelEstime) return null;

  const loyerAnnuel = loyerMensuelEstime * 12;
  const rendementBrut = (loyerAnnuel / prix) * 100;

  return {
    loyerAnnuel,
    rendementBrut: rendementBrut.toFixed(2),
  };
}
```

---

## ESTIMATION LOYER (basée sur ratios marché)

```javascript
// Ratios indicatifs prix/loyer par marché (à ajuster selon connaissance locale)
const RENT_RATIOS = {
  fr: { ratio: 0.0045, label: "France — ratio moyen national" },  // 0.45% du prix/mois
  lu: { ratio: 0.004,  label: "Luxembourg — marché tendu" },
  be: { ratio: 0.005,  label: "Belgique — ratio moyen" },
  de: { ratio: 0.0048, label: "Allemagne — ratio moyen" },
  gb: { ratio: 0.005,  label: "UK — ratio moyen" },
};

function estimateMonthlyRent(prix, pays, type) {
  const ratioData = RENT_RATIOS[pays] || RENT_RATIOS.fr;
  let baseLoyer = prix * ratioData.ratio;

  // Ajustement par type
  if (type === "Studio") baseLoyer *= 1.15; // Studios rendent plus au m²
  if (type === "Villa" || type === "Maison") baseLoyer *= 0.92; // Maisons rendent moins

  return Math.round(baseLoyer / 10) * 10; // Arrondi à la dizaine
}
```

---

## CALCUL RENDEMENT NET

```javascript
function calculateNetYield(prix, loyerMensuel, charges = {}) {
  const loyerAnnuel = loyerMensuel * 12;

  const chargesAnnuelles =
    (charges.taxeFonciere || prix * 0.012) +     // Estimation 1.2% du prix
    (charges.chargesCopro || 0) * 12 +
    (charges.assurance || 300) +
    (charges.entretien || prix * 0.005) +        // Estimation 0.5% du prix
    (charges.gestionLocative || loyerAnnuel * 0.07); // 7% si agence

  const revenuNet = loyerAnnuel - chargesAnnuelles;
  const rendementNet = (revenuNet / prix) * 100;

  return {
    loyerAnnuel,
    chargesAnnuelles: Math.round(chargesAnnuelles),
    revenuNet: Math.round(revenuNet),
    rendementNet: rendementNet.toFixed(2),
  };
}
```

---

## COMPOSANT CALCULATEUR ROI

```jsx
function ROICalculator({ meta }) {
  const [loyerCustom, setLoyerCustom] = useState("");
  const prix = Number(meta.prix) || 0;

  const loyerEstime = loyerCustom
    ? Number(loyerCustom)
    : estimateMonthlyRent(prix, meta.pays, meta.type);

  const brut = calculateGrossYield(prix, loyerEstime);
  const net  = calculateNetYield(prix, loyerEstime);

  return (
    <Card>
      <ST color="#4AE88A">CALCULATEUR ROI INVESTISSEUR</ST>

      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 9, color: "#3A2A1A", letterSpacing: 1 }}>
          LOYER MENSUEL ESTIMÉ
        </label>
        <input
          type="number"
          placeholder={loyerEstime.toString()}
          value={loyerCustom}
          onChange={e => setLoyerCustom(e.target.value)}
          style={{ width: "100%", padding: 8, fontSize: 13, marginTop: 4 }}
        />
        <div style={{ fontSize: 9, color: "#3A2A1A", marginTop: 4 }}>
          Estimation auto basée sur le marché — modifiable
        </div>
      </div>

      {/* Résultats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#0A0A0A", borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 9, color: "#3A2A1A" }}>RENDEMENT BRUT</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#4AE88A" }}>
            {brut?.rendementBrut}%
          </div>
        </div>
        <div style={{ background: "#0A0A0A", borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 9, color: "#3A2A1A" }}>RENDEMENT NET</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#00D4E8" }}>
            {net.rendementNet}%
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 10, color: "#8A7060" }}>
        Revenu annuel net estimé: <strong style={{color:"#C8793A"}}>{net.revenuNet.toLocaleString()}€</strong>
      </div>

      <div style={{ fontSize: 9, color: "#3A2A1A", marginTop: 8, fontStyle: "italic" }}>
        Estimations indicatives. Charges réelles à vérifier avec un professionnel.
      </div>
    </Card>
  );
}
```

---

## TABLEAU COMPARATIF FINANCEMENT

```javascript
function calculateLoanScenario(prix, apport, tauxAnnuel, dureeAnnees) {
  const montantEmprunte = prix - apport;
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const nbMensualites = dureeAnnees * 12;

  const mensualite = montantEmprunte *
    (tauxMensuel * Math.pow(1 + tauxMensuel, nbMensualites)) /
    (Math.pow(1 + tauxMensuel, nbMensualites) - 1);

  const coutTotal = mensualite * nbMensualites;
  const coutCredit = coutTotal - montantEmprunte;

  return {
    montantEmprunte,
    mensualite: Math.round(mensualite),
    coutCredit: Math.round(coutCredit),
    coutTotal: Math.round(coutTotal),
  };
}
```

---

## CASH-FLOW MENSUEL INVESTISSEUR

```javascript
function calculateMonthlyCashflow(loyerMensuel, mensualitePret, chargesMensuelles) {
  const cashflow = loyerMensuel - mensualitePret - chargesMensuelles;
  return {
    cashflow: Math.round(cashflow),
    positif: cashflow >= 0,
  };
}
```
