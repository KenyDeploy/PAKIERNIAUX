import { useState } from "react";
import { ArrowLeft, Check, Search, X } from "lucide-react";
import { DialogSheet } from "./DialogSheet";
import { exercisePhotoStyle } from "./exercisePhotos";
import { hasSessionSets, sessionTargets } from "./sessionActions.js";
import "./ExerciseSessionPanels.css";

export function SessionExerciseEditor({ mode, session, exercise, exercises, onClose, onApply }) {
  const [selected, setSelected] = useState(mode === "parameters" ? exercise : null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Wszystkie");
  const [values, setValues] = useState({ sets: exercise.targetSets ?? exercise.sets.length, reps: exercise.reps, rest: exercise.rest ?? 90 });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const categories = ["Wszystkie", ...new Set(exercises.map(e => e.category))];
  const filtered = exercises.filter(e => (category === "Wszystkie" || e.category === category) && `${e.name} ${e.category} ${e.equipment}`.toLocaleLowerCase("pl-PL").includes(query.toLocaleLowerCase("pl-PL")));
  const needsConfirmation = mode === "replace" && hasSessionSets(exercise);
  const choose = entry => {
    setSelected(entry); setValues({ sets: Number(entry.sets) || 3, reps: Number(entry.reps) || 10, rest: entry.rest ?? 90 }); setError(""); setConfirmed(false);
  };
  const submit = event => {
    event.preventDefault();
    if (!selected || (needsConfirmation && !confirmed)) return;
    try {
      const targets = sessionTargets(values);
      const result = onApply(selected, targets, confirmed);
      if (result) onClose();
      else setError("Nie udało się zapisać zmiany. Dane treningu pozostają zachowane. Spróbuj ponownie.");
    } catch (cause) { setError(cause.message); }
  };
  const title = mode === "add" ? "Dodaj ćwiczenie" : mode === "replace" ? "Zamień ćwiczenie" : "Edytuj parametry";
  return <DialogSheet labelledBy="session-editor-title" onClose={onClose} onSubmit={submit} className="workout-options-sheet session-exercise-editor">
    <header className="sheet-header"><h2 id="session-editor-title">{title}</h2><button type="button" className="icon-button" aria-label="Zamknij edycję sesji" onClick={onClose}><X size={20} /></button></header>
    <div className="sheet-body">
      <p className="session-only-hint">Tylko bieżący trening. Oryginalny plan pozostaje bez zmian.</p>
      {mode === "replace" && <div className="session-current-exercise"><small>Zastępowane ćwiczenie</small><b>{exercise.name}</b></div>}
      {!selected ? <>
        <label className="search-box"><Search size={20} /><input aria-label="Szukaj ćwiczenia do sesji" placeholder="Szukaj ćwiczenia…" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <div className="category-scroll" aria-label="Kategorie ćwiczeń">{categories.map(item => <button type="button" key={item} className={category === item ? "selected" : ""} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="session-exercise-picker">{filtered.map(entry => {
          const existing = session.exercises.some(e => e.id === entry.id);
          const photo = exercisePhotoStyle(entry);
          return <button type="button" key={entry.id} disabled={existing} onClick={() => choose(entry)} aria-label={`Wybierz: ${entry.name}`}>
            {photo && <span className="exercise-photo-thumb" role="img" aria-label={entry.name} style={photo} />}<span><b>{entry.name}</b><small>{entry.category} · {existing ? "Już w treningu" : entry.equipment}</small></span>
          </button>;
        })}{!filtered.length && <p className="empty-state">Brak pasujących ćwiczeń. Zmień wyszukiwanie lub kategorię.</p>}</div>
      </> : <>
        {mode !== "parameters" && <button type="button" className="workout-menu-action" onClick={() => { setSelected(null); setConfirmed(false); }}><ArrowLeft size={20} /> Wybierz inne ćwiczenie</button>}
        <h3>{selected.name}</h3>
        <div className="session-target-fields">{[["sets", "Docelowe serie", 1, 50], ["reps", "Docelowe powtórzenia", 1, 1000], ["rest", "Przerwa (sekundy)", 0, 3600]].map(([key, label, min, max]) => <label key={key}>{label}<input name={key} inputMode="numeric" type="number" min={min} max={max} step="1" required value={values[key]} onChange={e => setValues(current => ({ ...current, [key]: e.target.value }))} /></label>)}</div>
        {mode === "parameters" && <p className="sheet-hint">Nowy cel nie nadpisuje wpisanych wyników. Mniejsza liczba docelowych serii nie usuwa istniejących. Dodatkowe serie korzystają z nowego celu powtórzeń.</p>}
        {needsConfirmation && <div className="session-replacement-warning"><p>Zamiana usunie serie tego ćwiczenia z bieżącej sesji, w tym wpisane, podpowiedziane i zatwierdzone wartości. Nie zostaną przypisane do nowego ćwiczenia. Zapisana historia pozostaje zachowana.</p><label><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Potwierdzam zamianę i usunięcie bieżących serii</label></div>}
      </>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
    {selected && <footer className="sheet-footer"><button type="submit" className="primary-cta" disabled={needsConfirmation && !confirmed}><Check size={20} />{mode === "add" ? "Dodaj do treningu" : mode === "replace" ? "Zamień w treningu" : "Zapisz parametry"}</button></footer>}
  </DialogSheet>;
}
