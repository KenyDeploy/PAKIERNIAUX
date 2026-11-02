import { useRef, useState } from "react";
import { X } from "lucide-react";
import { DraftDialogSheet } from "./DraftDialogSheet";
import { formChanged } from "./formDrafts.js";
import { bodyMetrics, legacyBodyMetrics, saveBodyMeasurement } from "./bodyMeasurements.js";

export function BodyMeasurementEditor({ row, reference, today, onPersist, onClose, onSaved }) {
  const [initial] = useState(() => ({ ...Object.fromEntries(bodyMetrics.map(metric => [metric.key, ""])), ...row, date: row?.date || today, note: row?.note || "" }));
  const [draft, setDraft] = useState(initial);
  const committed = useRef(false);
  const [error, setError] = useState("");
  const fields = [...bodyMetrics, ...legacyBodyMetrics.filter(metric => row && metric.key in row)];
  const submit = event => {
    event.preventDefault();
    if (committed.current) return;
    try { if (onPersist(data => saveBodyMeasurement(data, draft, reference))) { committed.current = true; onSaved?.(draft); onClose(); } else setError("Nie zapisano pomiaru. Formularz i wcześniejsze dane pozostają zachowane."); }
    catch (cause) { setError(cause.message); }
  };
  return <DraftDialogSheet dirty={formChanged(initial,draft)} labelledBy="body-measurement-title" onClose={onClose} onSubmit={submit} className="body-editor-sheet measurement-form">{requestClose => <>
    <header className="sheet-header"><h2 id="body-measurement-title">{reference ? "Edytuj pomiar" : "Dodaj pomiar"}</h2><button type="button" className="icon-button" aria-label="Zamknij pomiar" onClick={requestClose}><X size={20} /></button></header>
    <div className="sheet-body">
      <p className="body-hint">Wpisz tylko zmierzone wartości. Puste pola pozostają brakującymi danymi. Lewa i prawa strona to strony Twojego ciała.</p>
      <label>Data pomiaru<input type="date" name="date" required max={today} value={draft.date} onChange={e => setDraft(current => ({ ...current, date: e.target.value }))} /></label>
      <div className="body-measurement-fields">{fields.map(metric => <label key={metric.key}>{metric.label} ({metric.unit})<input name={metric.key} type="text" inputMode="decimal" autoComplete="off" value={draft[metric.key] ?? ""} onChange={e => setDraft(current => ({ ...current, [metric.key]: e.target.value }))} /></label>)}</div>
      <label>Notatka (opcjonalnie)<textarea name="note" rows="3" value={draft.note} onChange={e => setDraft(current => ({ ...current, note: e.target.value }))} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
    <footer className="sheet-footer"><button type="submit" className="primary-cta">Zapisz pomiar</button></footer>
  </>}</DraftDialogSheet>;
}
