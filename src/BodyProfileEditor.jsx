import { useRef, useState } from "react";
import { X } from "lucide-react";
import { DraftDialogSheet } from "./DraftDialogSheet";
import { formChanged } from "./formDrafts.js";
import { bodyBuilds, bodyGoals, modelNames, saveBodyProfile } from "./bodyMeasurements.js";

export function BodyProfileEditor({ profile, current, onPersist, onClose, onMeasurement }) {
  const [expected] = useState(profile);
  const initial = { model: expected.model || "neutral", build: expected.build || "average", heightCm: expected.heightCm ?? "", goal: expected.goal || "", targetWeight: expected.targetWeight ?? "", goalStartedOn: expected.goalStartedOn || "" };
  const [draft, setDraft] = useState(initial);
  const committed = useRef(false);
  const [error, setError] = useState("");
  const change = (key, value) => setDraft(state => key === "goal" && !value ? { ...state, goal: "", targetWeight: "", goalStartedOn: "" } : { ...state, [key]: value });
  const submit = event => {
    event.preventDefault();
    if (committed.current) return;
    try { if (onPersist(data => saveBodyProfile(data, draft, expected))) { committed.current = true; onClose(); } else setError("Nie zapisano profilu. Formularz i wcześniejsze dane pozostają zachowane."); }
    catch (cause) { setError(cause.message); }
  };
  return <DraftDialogSheet dirty={formChanged(initial,draft)} labelledBy="body-profile-title" onClose={onClose} onSubmit={submit} className="body-editor-sheet">{requestClose => <>
    <header className="sheet-header"><h2 id="body-profile-title">Profil sylwetki</h2><button type="button" className="icon-button" aria-label="Zamknij profil" onClick={requestClose}><X size={20} /></button></header>
    <div className="sheet-body">
      <p className="body-hint">Model to wybór grafiki. Nie określa płci biologicznej ani składu ciała. Budowa bazowa jest ustawieniem użytkownika, nie wynikiem analizy.</p>
      <label>Model sylwetki<select aria-label="Model sylwetki" value={draft.model} onChange={e => change("model", e.target.value)}>{Object.entries(modelNames).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Wyjściowa budowa<select aria-label="Wyjściowa budowa" value={draft.build} onChange={e => change("build", e.target.value)}>{Object.entries(bodyBuilds).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Wzrost (cm)<input inputMode="decimal" type="text" value={draft.heightCm} onChange={e => change("heightCm", e.target.value)} /></label>
      <div className="body-profile-current"><b>Aktualna masa: {current.values.weight == null ? "brak pomiaru" : `${current.values.weight} kg`}</b>{current.sources.weight && <small>Pomiar z {current.sources.weight.date}</small>}<span>Tkanka tłuszczowa: {current.values.bodyFat == null ? "brak wpisu" : `${current.values.bodyFat}%`}</span>{current.sources.bodyFat && <small>Wpis ręczny z {current.sources.bodyFat.date}</small>}<button type="button" onClick={() => !formChanged(initial,draft) ? onMeasurement() : setError("Zapisz profil przed przejściem do pomiarów. Twoje wpisy pozostają w formularzu.")}>Dodaj pomiar masy / tkanki tłuszczowej</button></div>
      <label>Cel<select aria-label="Cel" value={draft.goal} onChange={e => change("goal", e.target.value)}><option value="">Bez ustalonego celu</option>{Object.entries(bodyGoals).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Masa docelowa (kg, opcjonalnie)<input inputMode="decimal" type="text" value={draft.targetWeight} onChange={e => change("targetWeight", e.target.value)} /></label>
      <label>Data rozpoczęcia celu<input type="date" value={draft.goalStartedOn} onChange={e => change("goalStartedOn", e.target.value)} required={Boolean(draft.goal)} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
    <footer className="sheet-footer"><button type="submit" className="primary-cta">Zapisz profil</button></footer>
  </>}</DraftDialogSheet>;
}
