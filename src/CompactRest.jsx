import { useState } from "react";
import { Play, Settings2 } from "lucide-react";
import { RestControls } from "./RestControls";
import { formatClock } from "./trainingClock.js";

export function CompactRest({ session, seconds, onStart, onAction, onSettings }) {
  const [error, setError] = useState("");
  const start = () => {try{setError(onStart() ? "" : "Nie zapisano przerwy. Spróbuj ponownie.");}catch{setError("Nie zapisano przerwy. Spróbuj ponownie.");}};
  return <section className={`compact-rest ${seconds > 0 ? "is-running" : "is-idle"}`} aria-label="Przerwa między seriami">
    <div className="compact-rest-heading">
      {seconds > 0 ? <><span>{session.restPausedRemainingMs != null ? "Przerwa · pauza" : "Przerwa"}</span><b role="timer" aria-live="off">{formatClock(seconds)}</b></> : <button type="button" className="rest-quick-start" onClick={start}><Play size={16}/> Rozpocznij przerwę</button>}
      <button type="button" aria-label="Ustawienia przerwy" onClick={onSettings}><Settings2 size={18}/></button>
    </div>
    {seconds > 0 && <RestControls session={session} onAction={onAction}/>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </section>;
}
