import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { DialogSheet } from "./DialogSheet";
import { historySetLabel, historyVolumeLabel } from "./exerciseHistory.js";
import "./ExerciseSessionPanels.css";

const dateLabel = value => new Date(value).toLocaleDateString("pl-PL");
const seriesLabel = count => `${count} ${count === 1 ? "seria" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "serie" : "serii"}`;
export { seriesLabel };

export function ExerciseHistorySheet({ exercise, sessions, onClose, onProgress }) {
  const [selected, setSelected] = useState(0);
  const session = sessions[selected];
  const recent = sessions.slice(0, 5);
  return <DialogSheet labelledBy="exercise-history-title" onClose={onClose} className="workout-options-sheet exercise-history-sheet">
    <header className="sheet-header"><h2 id="exercise-history-title">{selected === 0 ? "Ostatni trening" : "Wcześniejszy trening"}{session && <small>{dateLabel(session.date)}</small>}</h2><button type="button" className="icon-button" aria-label="Zamknij historię ćwiczenia" onClick={onClose}><X size={20} /></button></header>
    <div className="sheet-body">
      <h3>{exercise.name}</h3>
      {session ? <>
        <p className="muted">{seriesLabel(session.sets.length)} · tylko zatwierdzone wyniki</p>
        <div aria-label="Serie wybranego treningu">{session.sets.map((row, i) => <div className="workout-history-set" key={i}><span>Seria {row.index}</span><b>{historySetLabel(row)}</b></div>)}</div>
        <p className="history-volume" data-testid="exercise-history-volume">{historyVolumeLabel(session)}</p>
        {session.durationSeconds != null && <p className="history-exercise-time">Czas ćwiczenia: {Math.floor(session.durationSeconds / 60)}:{String(Math.floor(session.durationSeconds % 60)).padStart(2, "0")}</p>}
        {recent.length > 0 && <section className="exercise-history-sessions" aria-label="Ostatnie pięć wykonań ćwiczenia"><h3>Ostatnie {recent.length === 1 ? "wykonanie" : "wykonania"} ({recent.length})</h3>{recent.map((item, index) => <button type="button" key={`${item.sessionId}-${index}`} aria-pressed={index === selected} onClick={() => setSelected(index)}><span><b>{dateLabel(item.date)}</b><small>{seriesLabel(item.sets.length)} · {item.sets.slice(0, 3).map(historySetLabel).join(" / ")}{item.sets.length > 3 ? " …" : ""}</small></span>{index === selected ? <Check size={18} /> : <ArrowRight size={18} />}</button>)}</section>}
        {sessions.length === 1 && <p className="muted">Brak wcześniejszych sesji tego ćwiczenia.</p>}
      </> : <div className="empty-state"><p>Nie masz jeszcze zapisanych wyników tego ćwiczenia.</p><p>Zatwierdź serię i zakończ trening, aby pojawiła się tutaj historia.</p></div>}
    </div>
    <footer className="sheet-footer"><button type="button" className="workout-menu-action" onClick={onProgress}>Pełna historia / progres ćwiczenia <ArrowRight size={20} /></button></footer>
  </DialogSheet>;
}
