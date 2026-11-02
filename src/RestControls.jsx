import { useState } from "react";
import { Pause, Play, SkipForward } from "lucide-react";
import "./WorkoutMedia.css";

export function RestControls({ session, onAction }) {
  const [error, setError] = useState("");
  const paused = session.restPausedRemainingMs != null;
  const run = action => {
    try { setError(onAction(action) ? "" : "Nie zapisano zmiany przerwy. Spróbuj ponownie."); }
    catch { setError("Nie zapisano zmiany przerwy. Spróbuj ponownie."); }
  };
  return <><div className="rest-action-controls">
    <button type="button" aria-label="Wydłuż przerwę o 15 sekund" onClick={() => run("extend")}>+15 s</button>
    <button type="button" aria-label={paused ? "Wznów przerwę" : "Wstrzymaj przerwę"} onClick={() => run(paused ? "resume" : "pause")}>{paused ? <Play size={16} /> : <Pause size={16} />}{paused ? "Wznów" : "Pauza"}</button>
    <button type="button" aria-label="Pomiń przerwę" onClick={() => run("skip")}><SkipForward size={16} /> Pomiń</button>
  </div>{error && <p className="form-error" role="alert">{error}</p>}</>;
}
