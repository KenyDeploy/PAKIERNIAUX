import { useState } from "react";
import { Dumbbell, ListPlus, Pencil, Plus, RotateCcw, SkipForward, Square, Trash2, X } from "lucide-react";
import { DialogSheet } from "./DialogSheet";
import { exercisePhotoStyle } from "./exercisePhotos";
import "./ExerciseSessionPanels.css";

export function SessionExerciseMenu({ exercise, session, onClose, onAddSet, onMode, onSkip, onRemove, onJump, onCollapse, onFinish }) {
  const [removing, setRemoving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const photo = exercisePhotoStyle(exercise);
  const remove = () => {
    if (!confirmed) return;
    if (!onRemove(confirmed)) setError("Nie udało się zapisać zmiany. Ćwiczenie i jego serie pozostają zachowane.");
  };
  return <DialogSheet labelledBy="exercise-menu-title" onClose={onClose} className="workout-options-sheet session-exercise-menu">
    <header className="sheet-header"><h2 id="exercise-menu-title">{removing ? "Usunąć z treningu?" : "Opcje ćwiczenia"}</h2><button type="button" className="icon-button" aria-label="Zamknij opcje ćwiczenia" onClick={onClose}><X size={20} /></button></header>
    <div className="sheet-body">
      <div className="session-menu-preview">{photo ? <span className="exercise-photo-thumb" role="img" aria-label={exercise.name} style={photo} /> : <Dumbbell size={24} />}<span><b>{exercise.name}</b><small>{exercise.category}</small></span></div>
      {removing ? <><p className="sheet-hint">Usuniesz to ćwiczenie oraz jego wpisane i wykonane serie wyłącznie z rozpoczętej sesji. Oryginalny plan, baza ćwiczeń i historia zapisanych treningów pozostaną zachowane.</p><label className="session-remove-confirm"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />Potwierdzam usunięcie z bieżącego treningu</label><button type="button" className="workout-menu-action" onClick={() => { setRemoving(false); setConfirmed(false); setError(""); }}>Wróć do opcji</button></> : <>
        <button type="button" className="workout-menu-action" disabled={exercise.skipped} onClick={onAddSet}><Plus size={22} /> Dodaj serię</button>
        <button type="button" className="workout-menu-action" onClick={() => onMode("add")}><ListPlus size={22} /> Dodaj inne ćwiczenie</button>
        <button type="button" className="workout-menu-action" onClick={() => onMode("replace")}><RotateCcw size={22} /> Zamień ćwiczenie</button>
        <button type="button" className="workout-menu-action session-skip-action" onClick={onSkip}><SkipForward size={22} />{exercise.skipped ? "Cofnij pominięcie" : "Pomiń ćwiczenie"}</button>
        <button type="button" className="workout-menu-action" onClick={() => onMode("parameters")}><Pencil size={22} /> Edytuj parametry</button>
        <button type="button" className="workout-menu-action session-remove-action" onClick={() => setRemoving(true)}><Trash2 size={22} /> Usuń z bieżącego treningu</button>
        <label className="exercise-jump">Przejdź do ćwiczenia<select aria-label="Przejdź do ćwiczenia" value={session.index} onChange={event => onJump(Number(event.target.value))}>{session.exercises.map((entry, index) => <option key={entry.id} value={index}>{index + 1}. {entry.name}{entry.skipped ? " · pominięte" : ""}</option>)}</select></label>
        <button type="button" className="workout-menu-action" onClick={onCollapse}>Zwiń trening</button>
      </>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
    <footer className="sheet-footer">{removing ? <button type="button" className="workout-menu-action session-remove-action" disabled={!confirmed} onClick={remove}><Trash2 size={20} /> Usuń tylko z tej sesji</button> : <button type="button" className="workout-menu-action" onClick={onFinish}><Square size={20} /> Zakończ trening</button>}</footer>
  </DialogSheet>;
}
