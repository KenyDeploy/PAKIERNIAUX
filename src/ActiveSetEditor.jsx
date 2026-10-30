import { useEffect, useRef, useState } from "react";
import { Check, Minus, Pencil, Plus } from "lucide-react";
import { validSet } from "./training.js";
import { activeSeriesIndex, appendSeries, changeExerciseSeries, selectSeries, steppedSeriesValue, updateSeriesField } from "./activeSeries.js";
import "./ActiveSetEditor.css";

export function ActiveSetEditor({ exercise, exerciseIndex, sessionId, onPersist, onConfirm }) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const form = useRef(null);
  const index = editing != null && exercise.sets[editing] ? editing : activeSeriesIndex(exercise);
  const row = exercise.sets[index];
  const previousIndex = useRef(index);
  useEffect(() => {
    if (previousIndex.current !== index) form.current?.scrollIntoView?.({ block: "nearest", behavior: "auto" });
    previousIndex.current = index;
  }, [index]);
  const completed = exercise.sets.map((set, i) => ({ ...set, index: i })).filter(set => set.completed && !set.skipped);
  const pending = exercise.sets.map((set, i) => ({ ...set, index: i })).filter(set => !set.completed && !set.skipped && set.index !== index);
  const persist = transform => {
    try {
      const saved = onPersist(data => changeExerciseSeries(data, sessionId, exercise.id, exerciseIndex, transform));
      setError(saved ? "" : "Nie zapisano zmiany. Dane pozostają zachowane — spróbuj ponownie.");
      return saved;
    } catch (cause) { setError(cause.message); return false; }
  };
  const choose = target => {
    if (persist(current => selectSeries(current, target))) {
      setEditing(target);
      form.current?.scrollIntoView?.({ block: "nearest", behavior: "auto" });
    }
  };
  const change = (field, value) => persist(current => updateSeriesField(current, index, field, value));
  const step = (field, direction) => {
    try { change(field, steppedSeriesValue(row[field], field, direction)); }
    catch (cause) { setError(cause.message); }
  };
  const confirm = () => {
    if (!validSet(row)) { setError("Podaj ciężar (0 dla masy ciała) i pełną liczbę powtórzeń większą od zera."); return; }
    if (row.completed) { setEditing(null); setError(""); return; }
    const accepted = onConfirm(index);
    if (accepted === false) { setError("Nie udało się zatwierdzić serii. Spróbuj ponownie."); return; }
    setEditing(null); setError("");
  };
  return <div className="active-set-editor">
    {row ? <div className="set-row active" ref={form}>
      <div className="set-row-heading"><b>Seria {index + 1} / {exercise.sets.length}</b><small>{exercise.skipped ? "Pominięta" : editing != null ? "Edycja wyniku" : "Aktywna"}</small></div>
      <div className="set-fields">{[["weight", "Ciężar (kg)", "decimal"], ["reps", "Powtórzenia", "numeric"]].map(([field, label, inputMode]) => <label key={field}>
        {label}<span className="series-stepper"><button type="button" disabled={exercise.skipped} aria-label={field === "weight" ? "Zmniejsz ciężar o 2,5 kg" : "Zmniejsz powtórzenia o 1"} onClick={() => step(field, -1)}><Minus size={18} /></button><input disabled={exercise.skipped} aria-label={`${field === "weight" ? "Ciężar" : "Powtórzenia"} serii ${index + 1}`} autoComplete="off" inputMode={inputMode} type="text" value={row[field]} onChange={event => change(field, event.target.value)} placeholder={field === "weight" ? "0" : ""} /><button type="button" disabled={exercise.skipped} aria-label={field === "weight" ? "Zwiększ ciężar o 2,5 kg" : "Zwiększ powtórzenia o 1"} onClick={() => step(field, 1)}><Plus size={18} /></button></span>
      </label>)}</div>
      <button type="button" className="set-confirm" disabled={exercise.skipped} aria-label={`Zatwierdź serię ${index + 1}`} onClick={confirm}><Check size={20} />{editing != null ? "Zapisz wynik serii" : "Zapisz serię"}</button>
    </div> : <p className="series-all-complete" role="status">Wszystkie dostępne serie są zatwierdzone. Możesz poprawić wynik lub dodać kolejną serię.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button type="button" className="add-set" disabled={exercise.skipped} onClick={() => { if (persist(appendSeries)) setEditing(null); }}><Plus size={18} /> Dodaj serię</button>
    {completed.length > 0 && <details className="series-history"><summary>Wykonane serie ({completed.length})</summary>{completed.map(set => <div className="series-summary-row" key={set.index}><span><Check size={15} /><b>Seria {set.index + 1}</b><small>{set.weight} kg × {set.reps}</small></span><button type="button" disabled={exercise.skipped} aria-label={`Popraw serię ${set.index + 1}`} onClick={() => choose(set.index)}><Pencil size={16} /> Popraw</button></div>)}</details>}
    {pending.length > 0 && <details className="series-history"><summary>Pozostałe serie ({pending.length})</summary>{pending.map(set => <div className="series-summary-row" key={set.index}><span><b>Seria {set.index + 1}</b><small>{String(set.weight ?? "").trim() === "" ? `${set.reps} powt. · oczekuje` : `${set.weight} kg × ${set.reps} · niezatwierdzona`}</small></span><button type="button" disabled={exercise.skipped} aria-label={`Przejdź do serii ${set.index + 1}`} onClick={() => choose(set.index)}>Wybierz</button></div>)}</details>}
  </div>;
}
