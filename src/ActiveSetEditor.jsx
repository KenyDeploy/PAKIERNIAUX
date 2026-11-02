import { Fragment, useEffect, useRef, useState } from "react";
import { Check, Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { validSet } from "./training.js";
import { activeSeriesIndex, appendSeries, changeExerciseSeries, confirmSeries, removeSeries, selectSeries, seriesNeedsConfirmation, seriesReference, steppedSeriesValue, updateSeriesField } from "./activeSeries.js";
import { DialogSheet } from "./DialogSheet";
import "./ActiveSetEditor.css";
import { confirmationRow, isBodyweightExercise, seriesResultLabel } from "./workoutSession.js";

export function ActiveSetEditor({ exercise, targetSets = exercise.targetSets, exerciseIndex, sessionId, onPersist, onConfirm, restModule }) {
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState("");
  const list = useRef(null);
  const previousLength = useRef(exercise.sets.length);
  const keyFor = (row,index) => row.id ?? `legacy-${index}`;
  const currentIndex = editing == null ? activeSeriesIndex(exercise) : exercise.sets.findIndex((row,index)=>keyFor(row,index)===editing);
  const bodyweight = isBodyweightExercise(exercise);
  // Only restore position on entry, not on every keystroke or clock tick.
  useEffect(() => {
    const pending = activeSeriesIndex(exercise);
    const index = pending >= 0 ? pending : exercise.sets.length - 1;
    const frame = window.requestAnimationFrame(() => {
      const row = list.current?.querySelector(`[data-series-index="${index}"]`);
      const adjacent = row?.previousElementSibling;
      const target = index > 0 && !exercise.skipped ? adjacent?.classList.contains("compact-rest") ? adjacent : row : document.querySelector(".workout-heading");
      target?.scrollIntoView?.({ block: "start", behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  const scrollTo = index => window.requestAnimationFrame(() => {
    const row = list.current?.querySelector(`[data-series-index="${index}"]`);
    const target = row?.previousElementSibling?.classList.contains("compact-rest") ? row.previousElementSibling : row;
    target?.scrollIntoView?.({block:"start",behavior:"auto"});
  });
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
      list.current.style.paddingBottom = inside ? "20px" : "0px";
      if (!inside) return;
      const scroller=list.current.closest(".content"), bounds=scroller.getBoundingClientRect();
      const top=bounds.top+8, bottom=bounds.bottom-8;
      const field=focused.getBoundingClientRect(), save=focused.closest(".series-entry")?.querySelector(".set-confirm")?.getBoundingClientRect();
      const end=save?.bottom||field.bottom;
      const delta=end>bottom ? end-bottom : field.top<top ? field.top-top : 0;
      if(delta)scroller.scrollBy({top:delta,behavior:"auto"});
    };
    let frame;
    const queue=()=>{window.cancelAnimationFrame(frame);frame=window.requestAnimationFrame(reveal);};
    visual?.addEventListener("resize",queue); visual?.addEventListener("scroll",queue);
    list.current?.addEventListener("focusin",queue); list.current?.addEventListener("focusout",queue);
    const node = list.current;
    return () => {window.cancelAnimationFrame(frame); visual?.removeEventListener("resize",queue); visual?.removeEventListener("scroll",queue); node?.removeEventListener("focusin",queue);node?.removeEventListener("focusout",queue); };
  }, []);
  const persist = transform => {
    try {
      const saved = onPersist(data => changeExerciseSeries(data,sessionId,exercise.id,exerciseIndex,transform));
      setError(saved ? "" : "Nie zapisano zmiany. Dane pozostają zachowane — spróbuj ponownie.");
      return saved;
    } catch(cause) { setError(cause.message); return false; }
  };
  const change = (index,field,value) => {
    const saved = persist(current=>updateSeriesField(current,index,field,value));
    if(saved && editing != null && editing!==keyFor(exercise.sets[index],index))setEditing(null);
    return saved;
  };
  const step = (index,field,direction) => {
    try { change(index,field,steppedSeriesValue(exercise.sets[index][field],field,direction)); }
    catch(cause){setError(cause.message);}
  };
  const confirm = index => {
    if (!validSet(confirmationRow(exercise,exercise.sets[index]))) {setError(bodyweight?"Wpisz pełną liczbę powtórzeń większą od zera i poprawne dodatkowe obciążenie (lub pozostaw puste dla 0 kg).":"Wpisz ciężar i pełną liczbę powtórzeń większą od zera.");return;}
    if (onConfirm(index) === false) {setError("Nie udało się zapisać serii. Twoje wpisy pozostają w karcie.");return;}
    setEditing(null);setError("");
    const next = activeSeriesIndex(confirmSeries(exercise,index));
    scrollTo(next >= 0 ? next : index);
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
    <p className="series-status" role="status">{exercise.sets.filter(row=>row.completed).length} wykonanych · {exercise.sets.filter(row=>!row.completed && !row.skipped).length} do wykonania</p>
    {exercise.sets.map((row,index)=>{
      const editable=!row.completed || editing===keyFor(row,index);
      return <Fragment key={keyFor(row,index)}>{index===currentIndex && restModule}<div className={`series-entry ${editable?`set-row ${index===currentIndex || editing===keyFor(row,index)?"active":"waiting"}`:"series-compact completed"}`} data-series-index={index} data-series-id={row.id}>
        {editable ? <>
          <div className="set-row-heading"><b>Seria {index+1}</b><small>{exercise.skipped?"Pominięta":row.completed?"Edycja wyniku":index===currentIndex?"Bieżąca":"Oczekująca"}</small><button type="button" className="series-delete" disabled={exercise.skipped} aria-label={`Usuń serię ${index+1}`} onClick={()=>requestDelete(index)}><Trash2 size={18}/></button></div>
          <div className="set-fields">{[["weight",bodyweight?"Dodatkowe kg":"Ciężar (kg)","decimal"],["reps","Powtórzenia","numeric"]].map(([field,label,inputMode])=><label key={field}>{label}<span className="series-stepper"><button type="button" disabled={exercise.skipped} aria-label={`Zmniejsz ${field==="weight"?"ciężar":"powtórzenia"} serii ${index+1}`} onClick={()=>step(index,field,-1)}><Minus size={18}/></button><input disabled={exercise.skipped} aria-label={`${field==="weight"?"Ciężar":"Powtórzenia"} serii ${index+1}`} aria-describedby={bodyweight?`bodyweight-${index}`:undefined} autoComplete="off" inputMode={inputMode} type="text" value={row[field]??""} onChange={event=>change(index,field,event.target.value)} placeholder={field==="weight"?(bodyweight?"0":"kg"):""}/><button type="button" disabled={exercise.skipped} aria-label={`Zwiększ ${field==="weight"?"ciężar":"powtórzenia"} serii ${index+1}`} onClick={()=>step(index,field,1)}><Plus size={18}/></button></span></label>)}</div>
          {bodyweight && <p id={`bodyweight-${index}`} className="bodyweight-set-hint">Masa ciała · dodatkowy ciężar opcjonalny. Puste pole = 0 kg przy zapisie serii.</p>}
          <button type="button" className="set-confirm" disabled={exercise.skipped} aria-label={`Zatwierdź serię ${index+1}`} onClick={()=>confirm(index)}><Check size={20}/>{row.completed?"Zapisz zmiany":"Zapisz serię"}</button>
        </> : <><Check className="series-done-icon" size={18}/><div className="series-result"><b>Seria {index+1}</b><span>{seriesResultLabel(exercise,row)}</span><small>Wykonana</small></div><button type="button" disabled={exercise.skipped} aria-label={`Edytuj serię ${index+1}`} onClick={()=>{if(persist(current=>selectSeries(current,index))){setEditing(keyFor(row,index));setError("");scrollTo(index);}}}><Pencil size={18}/></button><button type="button" disabled={exercise.skipped} aria-label={`Usuń serię ${index+1}`} onClick={()=>requestDelete(index)}><Trash2 size={18}/></button></>}
      </div></Fragment>;
    })}
    {currentIndex<0 && restModule}
    {!exercise.sets.length && <p className="series-all-complete">Brak serii. Dodaj serię albo przejdź do kolejnego ćwiczenia.</p>}
    {error && !removing && <p className="form-error" role="alert">{error}</p>}
    <button type="button" className="add-set" disabled={exercise.skipped} onClick={()=>{if(persist(appendSeries)){if(document.activeElement?.tagName==="INPUT")document.activeElement.blur();}}}><Plus size={18}/> Dodaj serię</button>
    <p className="series-add-hint">Cel planu: {targetSets??"—"} serii. Wykonaj tyle, ile potrzebujesz — kolejna karta pojawi się po „Dodaj serię”.</p>
    {removing && <DialogSheet labelledBy="remove-series-title" onClose={()=>{setRemoving(null);setError("");}} className="remove-series-sheet"><header className="sheet-header"><h2 id="remove-series-title">Usunąć serię {removing.number}?</h2><button type="button" className="icon-button" aria-label="Anuluj usuwanie serii" onClick={()=>{setRemoving(null);setError("");}}><X size={20}/></button></header><div className="sheet-body"><p>Usuniesz wynik lub wpisane wartości tylko z bieżącej sesji. Plan pozostanie bez zmian.</p>{error&&<p className="form-error" role="alert">{error}</p>}</div><footer className="sheet-footer"><button type="button" className="workout-menu-action session-remove-action" onClick={()=>erase(removing,true)}>Potwierdź usunięcie serii</button></footer></DialogSheet>}
  </div>;
}
