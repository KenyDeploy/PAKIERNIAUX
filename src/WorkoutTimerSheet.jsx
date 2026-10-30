import { useState } from "react";
import { Pause, Play, Square, X } from "lucide-react";
import { DialogSheet } from "./DialogSheet";
import { formatClock, restRemainingSeconds, workoutElapsedSeconds } from "./trainingClock.js";
import { RestControls } from "./RestControls";
import "./WorkoutMedia.css";

export function WorkoutTimerSheet({ session, now, onClose, onToggle, onRest, onRestAction, onFinish }) {
  const initial = session.manualRestSeconds ?? 90;
  const [seconds, setSeconds] = useState(initial);
  const [custom, setCustom] = useState(![60, 90, 120, 150].includes(initial));
  const [error, setError] = useState("");
  const rest = restRemainingSeconds(session, now);
  const start = event => {
    event.preventDefault();
    if (String(seconds).trim() === "" || !Number.isInteger(Number(seconds)) || Number(seconds) < 1 || Number(seconds) > 3600) {
      setError("Podaj pełną liczbę sekund od 1 do 3600."); return;
    }
    if (onRest(Number(seconds))) setError("");
    else setError("Nie udało się zapisać przerwy. Spróbuj ponownie.");
  };
  return <DialogSheet labelledBy="workout-timer-title" onClose={onClose} className="workout-options-sheet workout-timer-sheet">
    <header className="sheet-header"><h2 id="workout-timer-title">Czas i przerwa</h2><button type="button" className="icon-button" aria-label="Zamknij panel treningu" onClick={onClose}><X size={20} /></button></header>
    <div className="sheet-body">
      <section className="workout-clock-section" aria-label="Licznik treningu"><p>Całkowity czas treningu</p><p className="workout-total-time" role="timer" aria-live="off">{formatClock(workoutElapsedSeconds(session, now))}</p><p className="timer-state">{session.pausedAt != null ? "Licznik wstrzymany" : "Licznik działa"}</p><p className="sheet-hint">Obejmuje przerwy; pomija wyłącznie pauzy tego licznika.</p><button type="button" className="workout-menu-action" onClick={() => { if (!onToggle()) setError("Nie udało się zapisać zmiany licznika."); else setError(""); }}>{session.pausedAt != null ? <Play size={20} /> : <Pause size={20} />}{session.pausedAt != null ? "Wznów licznik treningu" : "Wstrzymaj licznik treningu"}</button></section>
      <form id="manual-rest-form" className="manual-rest-form" onSubmit={start}>
        <h3>Przerwa między seriami</h3><p className="sheet-hint">Oba zegary są niezależne: pauza jednego nie zatrzymuje drugiego.</p>
        {rest > 0 && <><p className="timer-current-rest" role="timer" aria-live="off">Pozostała przerwa: <b>{formatClock(rest)}</b>{session.restPausedRemainingMs != null && " · wstrzymana"}</p><RestControls session={session} onAction={onRestAction} /></>}
        <div className="rest-presets">{[60, 90, 120, 150].map(value => <button type="button" key={value} aria-pressed={!custom && seconds === value} onClick={() => { setSeconds(value); setCustom(false); setError(""); }}>{formatClock(value)}</button>)}</div>
        <button type="button" className="custom-rest-toggle" aria-pressed={custom} onClick={() => setCustom(true)}>Własny czas przerwy</button>
        {custom && <label className="custom-rest-field">Czas przerwy (sekundy)<input inputMode="numeric" type="number" min="1" max="3600" step="1" required value={seconds} onChange={e => setSeconds(e.target.value)} /></label>}
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
    <footer className="sheet-footer"><button type="submit" form="manual-rest-form" className="primary-cta">{rest > 0 ? "Rozpocznij przerwę od nowa" : "Rozpocznij przerwę"}</button><button type="button" className="workout-menu-action timer-finish-action" onClick={onFinish}><Square size={20} /> Zakończ trening</button></footer>
  </DialogSheet>;
}
