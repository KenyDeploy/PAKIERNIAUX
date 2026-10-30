import { useEffect, useRef, useState } from "react";
import { Check, Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { validSet } from "./training.js";
import { appendSeries, changeExerciseSeries, removeSeries, seriesNeedsConfirmation, seriesReference, steppedSeriesValue, updateSeriesField } from "./activeSeries.js";
import { DialogSheet } from "./DialogSheet";
import "./ActiveSetEditor.css";

export function ActiveSetEditor({ exercise, targetSets = exercise.targetSets, exerciseIndex, sessionId, onPersist, onConfirm }) {
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");
  const list = useRef(null);
  const previousLength = useRef(exercise.sets.length);
  const keyFor = (row,index) => row.id ?? `legacy-${index}`;
  const scrollTo = index => window.requestAnimationFrame(() => list.current?.querySelector(`[data-series-index="${index}"]`)?.scrollIntoView?.({block:"start",behavior:"auto"}));
  useEffect(() => {
    if (exercise.sets.length > previousLength.current) scrollTo(exercise.sets.length - 1);
    previousLength.current = exercise.sets.length;
  }, [exercise.sets.length]);
  useEffect(() => {
    const visual = window.visualViewport;
    const reveal = () => {
      const focused = document.activeElement;
      if (!list.current) return;
      const inside = list.current.contains(focused) && focused?.tagName === "INPUT";
      // A long list needs real scroll room when iOS keeps the layout viewport tall.
      const covered = Math.max(0, window.innerHeight - (visual?.offsetTop || 0) - (visual?.height || window.innerHeight));
      list.current.style.paddingBottom = inside ? `${covered}px` : "0px";
      if (!inside) return;
      const top = Math.max(visual?.offsetTop || 0, document.querySelector(".topbar")?.getBoundingClientRect().bottom || 0) + 12;
      const bottom = (visual?.offsetTop || 0) + (visual?.height || window.innerHeight) - 20;
      const rect = focused.getBoundingClientRect();
      const delta = rect.bottom > bottom ? rect.bottom - bottom : rect.top < top ? rect.top - top : 0;
      if (delta) window.scrollBy({top:delta,behavior:"auto"});
    };
    visual?.addEventListener("resize",reveal); visual?.addEventListener("scroll",reveal);
    return () => { visual?.removeEventListener("resize",reveal); visual?.removeEventListener("scroll",reveal); };
  }, []);
  const persist = transform => {
    try {
      const saved = onPersist(data => changeExerciseSeries(data,sessionId,exercise.id,exerciseIndex,transform));
      setError(saved ? "" : "Nie zapisano zmiany. Dane pozostają zachowane — spróbuj ponownie.");
      return saved;
    } catch(cause) { setError(cause.message); return false; }
  };
  const change = (index,field,value) => persist(current=>updateSeriesField(current,index,field,value));
  const step = (index,field,direction) => {
    try { change(index,field,steppedSeriesValue(exercise.sets[index][field],field,direction)); }
    catch(cause){setError(cause.message);}
  };
  const confirm = index => {
    if (!validSet(exercise.sets[index])) {setError("Podaj ciężar (0 dla masy ciała) i pełną liczbę powtórzeń większą od zera.");return;}
    if (onConfirm(index) === false) {setError("Nie udało się zapisać serii. Twoje wpisy pozostają w karcie.");return;}
    setEditing(null);setError("");
    if(list.current?.contains(document.activeElement) && document.activeElement?.tagName === "INPUT")document.activeElement.blur();
  };
  const erase = (reference,confirmed=false) => {
    if(persist(current=>removeSeries(current,reference,confirmed))){setRemoving(null);setEditing(null);}
  };
  const requestDelete = index => {
    const reference=seriesReference(exercise,index);setError("");
    if(seriesNeedsConfirmation(exercise.sets[index]))setRemoving({...reference,number:index+1});
    else erase(reference);
  };
  return <div className="active-set-editor growing-series-list" ref={list}>
    {exercise.sets.map((row,index)=>{
      const editable=!row.completed || editing===keyFor(row,index);
      return <div className={`series-entry ${editable?"set-row active":"series-compact completed"}`} key={keyFor(row,index)} data-series-index={index} data-series-id={row.id}>
        {editable ? <>
          <div className="set-row-heading"><b>Seria {index+1}</b><small>{exercise.skipped?"Pominięta":row.completed?"Edycja wyniku":"Do wykonania"}</small><button type="button" className="series-delete" disabled={exercise.skipped} aria-label={`Usuń serię ${index+1}`} onClick={()=>requestDelete(index)}><Trash2 size={18}/></button></div>
          <div className="set-fields">{[["weight","Ciężar (kg)","decimal"],["reps","Powtórzenia","numeric"]].map(([field,label,inputMode])=><label key={field}>{label}<span className="series-stepper"><button type="button" disabled={exercise.skipped} aria-label={`Zmniejsz ${field==="weight"?"ciężar":"powtórzenia"} serii ${index+1}`} onClick={()=>step(index,field,-1)}><Minus size={18}/></button><input disabled={exercise.skipped} aria-label={`${field==="weight"?"Ciężar":"Powtórzenia"} serii ${index+1}`} autoComplete="off" inputMode={inputMode} type="text" value={row[field]??""} onChange={event=>change(index,field,event.target.value)} placeholder={field==="weight"?"0":""}/><button type="button" disabled={exercise.skipped} aria-label={`Zwiększ ${field==="weight"?"ciężar":"powtórzenia"} serii ${index+1}`} onClick={()=>step(index,field,1)}><Plus size={18}/></button></span></label>)}</div>
          <button type="button" className="set-confirm" disabled={exercise.skipped} aria-label={`Zatwierdź serię ${index+1}`} onClick={()=>confirm(index)}><Check size={20}/>{row.completed?"Zapisz zmiany":"Zapisz serię"}</button>
        </> : <><Check className="series-done-icon" size={18}/><div className="series-result"><b>Seria {index+1}</b><span>{row.weight} kg × {row.reps}</span></div><button type="button" disabled={exercise.skipped} aria-label={`Edytuj serię ${index+1}`} onClick={()=>{setEditing(keyFor(row,index));setError("");scrollTo(index);}}><Pencil size={18}/></button><button type="button" disabled={exercise.skipped} aria-label={`Usuń serię ${index+1}`} onClick={()=>requestDelete(index)}><Trash2 size={18}/></button></>}
      </div>;
    })}
    {!exercise.sets.length && <p className="series-all-complete">Brak serii. Dodaj serię albo przejdź do kolejnego ćwiczenia.</p>}
    {error && !removing && <p className="form-error" role="alert">{error}</p>}
    <button type="button" className="add-set" disabled={exercise.skipped} onClick={()=>{if(persist(appendSeries)){if(document.activeElement?.tagName==="INPUT")document.activeElement.blur();}}}><Plus size={18}/> Dodaj serię</button>
    <p className="series-add-hint">Cel planu: {targetSets??"—"} serii. Wykonaj tyle, ile potrzebujesz — kolejna karta pojawi się po „Dodaj serię”.</p>
    {removing && <DialogSheet labelledBy="remove-series-title" onClose={()=>{setRemoving(null);setError("");}} className="remove-series-sheet"><header className="sheet-header"><h2 id="remove-series-title">Usunąć serię {removing.number}?</h2><button type="button" className="icon-button" aria-label="Anuluj usuwanie serii" onClick={()=>{setRemoving(null);setError("");}}><X size={20}/></button></header><div className="sheet-body"><p>Usuniesz wynik lub wpisane wartości tylko z bieżącej sesji. Plan pozostanie bez zmian.</p>{error&&<p className="form-error" role="alert">{error}</p>}</div><footer className="sheet-footer"><button type="button" className="workout-menu-action session-remove-action" onClick={()=>erase(removing,true)}>Potwierdź usunięcie serii</button></footer></DialogSheet>}
  </div>;
}
