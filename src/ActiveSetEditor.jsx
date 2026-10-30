import { useEffect, useRef, useState } from "react";
import { Check, Minus, Pencil, Plus } from "lucide-react";
import { validSet } from "./training.js";
import { activeSeriesIndex, addOrResumeSeries, changeExerciseSeries, selectSeries, steppedSeriesValue, updateSeriesField } from "./activeSeries.js";
import "./ActiveSetEditor.css";

export function ActiveSetEditor({ exercise, exerciseIndex, sessionId, onPersist, onConfirm }) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const form = useRef(null);
  const isEditing = editing != null && editing === exercise.activeSetIndex && exercise.sets[editing];
  const index = isEditing ? editing : activeSeriesIndex(exercise);
  const row = exercise.sets[index];
  const previousIndex = useRef(index);
  useEffect(() => {
    if (previousIndex.current !== index) form.current?.scrollIntoView?.({ block: "start", behavior: "auto" });
    previousIndex.current = index;
  }, [index]);
  useEffect(() => {
    const visual = window.visualViewport;
    const reveal = () => {
      const focused = document.activeElement;
      if (!form.current?.contains(focused) || focused?.tagName !== "INPUT") return;
      const top = Math.max(visual?.offsetTop || 0, document.querySelector(".topbar")?.getBoundingClientRect().bottom || 0) + 12;
      const bottom = (visual?.offsetTop || 0) + (visual?.height || window.innerHeight) - 20;
      const rect = focused.getBoundingClientRect();
      const delta = rect.bottom > bottom ? rect.bottom - bottom : rect.top < top ? rect.top - top : 0;
      if (delta) window.scrollBy({ top: delta, behavior: "auto" });
    };
    visual?.addEventListener("resize", reveal);
    visual?.addEventListener("scroll", reveal);
    return () => { visual?.removeEventListener("resize", reveal); visual?.removeEventListener("scroll", reveal); };
  }, []);
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
      setEditing(exercise.sets[target].completed ? target : null);
      form.current?.scrollIntoView?.({ block: "start", behavior: "auto" });
    }
  };
  const change = (field, value) => persist(current => updateSeriesField(current, index, field, value));
  const step = (field, direction) => {
    try { change(field, steppedSeriesValue(row[field], field, direction)); }
    catch (cause) { setError(cause.message); }
  };
  const confirm = () => {
    if (!validSet(row)) { setError("Podaj ciężar (0 dla masy ciała) i pełną liczbę powtórzeń większą od zera."); return; }
    const accepted = onConfirm(index);
    if (accepted === false) { setError("Nie udało się zatwierdzić serii. Spróbuj ponownie."); return; }
    document.activeElement?.tagName === "INPUT" && form.current?.contains(document.activeElement) && document.activeElement.blur();
    setEditing(null); setError("");
  };
  return <div className="active-set-editor">
    <div className="series-picker" role="group" aria-label="Wybierz serię">{exercise.sets.map((set, i) => <button type="button" key={i} disabled={exercise.skipped || set.skipped} aria-current={i === index ? "step" : undefined} aria-label={`Wybierz serię ${i + 1} — ${i === index ? "aktywna" : set.completed ? "wykonana" : "oczekuje"}`} onClick={() => choose(i)}><b>{i + 1}</b><small>{i === index ? "Aktywna" : set.completed ? "Wykonana" : "Oczekuje"}</small></button>)}</div>
    {row ? <div className="set-row active" ref={form}>
      <div className="set-row-heading"><b>Seria {index + 1} / {exercise.sets.length}</b><small>{exercise.skipped ? "Pominięta" : isEditing ? "Edycja wyniku" : "Aktywna"}</small></div>
      <div className="set-fields">{[["weight", "Ciężar (kg)", "decimal"], ["reps", "Powtórzenia", "numeric"]].map(([field, label, inputMode]) => <label key={field}>
        {label}<span className="series-stepper"><button type="button" disabled={exercise.skipped} aria-label={field === "weight" ? "Zmniejsz ciężar o 2,5 kg" : "Zmniejsz powtórzenia o 1"} onClick={() => step(field, -1)}><Minus size={18} /></button><input disabled={exercise.skipped} aria-label={`${field === "weight" ? "Ciężar" : "Powtórzenia"} serii ${index + 1}`} autoComplete="off" inputMode={inputMode} type="text" value={row[field]} onChange={event => change(field, event.target.value)} placeholder={field === "weight" ? "0" : ""} /><button type="button" disabled={exercise.skipped} aria-label={field === "weight" ? "Zwiększ ciężar o 2,5 kg" : "Zwiększ powtórzenia o 1"} onClick={() => step(field, 1)}><Plus size={18} /></button></span>
      </label>)}</div>
      <button type="button" className="set-confirm" disabled={exercise.skipped} aria-label={`Zatwierdź serię ${index + 1}`} onClick={confirm}><Check size={20} />{isEditing ? "Zapisz wynik serii" : "Zapisz serię"}</button>
    </div> : <p className="series-all-complete" role="status">Wszystkie dostępne serie są zatwierdzone. Możesz poprawić wynik lub dodać kolejną serię.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button type="button" className="add-set" disabled={exercise.skipped} onClick={() => { if (persist(addOrResumeSeries)) { setEditing(null); form.current?.scrollIntoView?.({ block: "start", behavior: "auto" }); } }}><Plus size={18} /> Dodaj serię</button>
    {activeSeriesIndex(exercise) >= 0 && <p className="series-add-hint">„Dodaj serię” otworzy niewykonaną serię {activeSeriesIndex(exercise) + 1}. Dodatkową dodasz w menu.</p>}
    {completed.length > 0 && <details className="series-history"><summary>Wykonane serie ({completed.length})</summary>{completed.map(set => <div className="series-summary-row" key={set.index}><span><Check size={15} /><b>Seria {set.index + 1}</b><small>{set.weight} kg × {set.reps}</small></span><button type="button" disabled={exercise.skipped} aria-label={`Popraw serię ${set.index + 1}`} onClick={() => choose(set.index)}><Pencil size={16} /> Popraw</button></div>)}</details>}
    {pending.length > 0 && <details className="series-history"><summary>Pozostałe serie ({pending.length})</summary>{pending.map(set => <div className="series-summary-row" key={set.index}><span><b>Seria {set.index + 1}</b><small>{String(set.weight ?? "").trim() === "" ? `${set.reps} powt. · oczekuje` : `${set.weight} kg × ${set.reps} · niezatwierdzona`}</small></span><button type="button" disabled={exercise.skipped} aria-label={`Przejdź do serii ${set.index + 1}`} onClick={() => choose(set.index)}>Wybierz</button></div>)}</details>}
  </div>;
}
