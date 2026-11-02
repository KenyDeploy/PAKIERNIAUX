import { useRef, useState } from "react";
import { X } from "lucide-react";
import { DraftDialogSheet } from "./DraftDialogSheet";
import { bodyGoals, bodyMetrics, modelNames } from "./bodyMeasurements.js";
import { completeBodySetup } from "./bodySetup.js";
import { formChanged } from "./formDrafts.js";
import "./Measurements.css";
import "./Measurements3.css";

export function BodySetupWizard({ data, today, onPersist, onClose }) {
  const [profile] = useState(data.bodyProfile || {});
  const initial = { model: profile.model || "neutral", heightCm: profile.heightCm ?? "", goal: profile.goal || "", weight: "" };
  const [draft, setDraft] = useState(initial);
  const [step, setStep] = useState(0), [error, setError] = useState("");
  const committed = useRef(false);
  const change = (key, value) => setDraft(previous => ({ ...previous, [key]: value }));
  const submit = event => {
    event.preventDefault();
    if (step === 0) { setStep(1); return; }
    if (committed.current) return;
    try {
      if (onPersist(current => completeBodySetup(current, draft, today, Date.now(), profile))) { committed.current = true; onClose(); }
      else setError("Nie zapisano konfiguracji. Twoje wpisy pozostają tutaj. Spróbuj ponownie.");
    } catch (cause) { setError(cause.message); }
  };
  return <DraftDialogSheet dirty={formChanged(initial, draft)} labelledBy="body-setup-title" onClose={onClose} onSubmit={submit} className="body-editor-sheet body-setup-sheet">{requestClose => <>
    <header className="sheet-header"><div><small>KROK {step + 1} Z 2 · OPCJONALNIE</small><h2 id="body-setup-title">Twój punkt startowy</h2></div><button type="button" className="icon-button" aria-label="Zamknij konfigurację" onClick={requestClose}><X size={20}/></button></header>
    <div className="sheet-body">
      <p className="body-hint">Możesz zacząć trening bez pomiarów. Wszystkie ustawienia zmienisz później w Pomiarach.</p>
      {step === 0 ? <>
        <label>Wariant modelu<select value={draft.model} onChange={event => change("model", event.target.value)}>{Object.entries(modelNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <p className="body-hint">To wybór ilustracji, nie określenie płci biologicznej. Neutralny pokazuje punkty i wartości bez postaci.</p>
        <label>Wzrost (cm, opcjonalnie)<input inputMode="decimal" value={draft.heightCm} onChange={event => change("heightCm", event.target.value)}/></label>
        <label>Cel treningowy<select value={draft.goal} onChange={event => change("goal", event.target.value)}><option value="">Ustalę później</option>{Object.entries(bodyGoals).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      </> : <>
        <p className="body-hint">Nowy pomiar z dzisiaj ({today}). Istniejące wpisy i historia celu pozostaną zachowane.</p>
        <label>Masa początkowa (kg, opcjonalnie)<input inputMode="decimal" value={draft.weight} onChange={event => change("weight", event.target.value)}/></label>
        <details className="body-setup-optional"><summary>Dodaj opcjonalne obwody</summary><div className="body-measurement-fields">{bodyMetrics.filter(metric => metric.unit === "cm").map(metric => <label key={metric.key}>{metric.label} (cm)<input inputMode="decimal" value={draft[metric.key] ?? ""} onChange={event => change(metric.key, event.target.value)}/></label>)}</div></details>
      </>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
    <footer className="sheet-footer">{step === 1 && <button type="button" className="secondary-cta" onClick={() => setStep(0)}>Wstecz</button>}<button type="submit" className="primary-cta">{step === 0 ? "Dalej" : "Zapisz konfigurację"}</button></footer>
  </>}</DraftDialogSheet>;
}
