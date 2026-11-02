import { useState } from "react";
import { Play, Settings2 } from "lucide-react";
import { RestControls } from "./RestControls";
import { formatClock } from "./trainingClock.js";

export function CompactRest({ session, seconds, onStart, onAction, onSettings }) {
  const [error, setError] = useState("");
  return <section className="compact-rest" aria-label="Przerwa między seriami">
    <div className="compact-rest-heading"><span>{seconds > 0 ? session.restPausedRemainingMs != null ? "Przerwa · pauza" : "Przerwa" : "Gotowy na przerwę?"}</span>
      {seconds > 0 && <b role="timer" aria-live="off">{formatClock(seconds)}</b>}
      <button type="button" aria-label="Ustawienia przerwy" onClick={onSettings}><Settings2 size={18}/></button>
    </div>
    {seconds > 0 ? <RestControls session={session} onAction={onAction}/> : <button type="button" className="rest-quick-start" onClick={()=>{try{setError(onStart() ? "" : "Nie zapisano przerwy. Spróbuj ponownie.");}catch{setError("Nie zapisano przerwy. Spróbuj ponownie.");}}}><Play size={16}/> Rozpocznij przerwę</button>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </section>;
}
