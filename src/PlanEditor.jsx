import { useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { DraftDialogSheet } from "./DraftDialogSheet";
import { formChanged, planFormValues, savePlanDraft } from "./formDrafts.js";
import "./PlanEditor.css";

export function PlanEditor({ plan, isNew, exercises, onPersist, onSaved, onClose }) {
  const [initial] = useState(plan);
  const [expected] = useState(isNew ? null : plan);
  const [draft, setDraft] = useState(plan);
  const [error, setError] = useState("");
  const committed = useRef(false);
  const submit = event => {
    event.preventDefault();
    if (committed.current) return;
    try {
      const candidate = { ...draft, name: draft.name || initial.name };
      if (!onPersist(data => savePlanDraft(data, candidate, expected))) { setError("Nie zapisano planu. Wszystkie wpisy pozostają w formularzu — spróbuj ponownie."); return; }
      committed.current = true;
      onSaved(candidate); onClose();
    } catch (cause) { setError(cause.message); }
  };
  return <DraftDialogSheet dirty={formChanged(planFormValues(initial,exercises),planFormValues(draft,exercises))} labelledBy="plan-editor-title" onClose={onClose} onSubmit={submit} className="plan-editor draft-plan-sheet">{requestClose => <>
    <header className="sheet-header"><div><span className="eyebrow">{isNew ? "NOWY PLAN" : "EDYCJA PLANU"}</span><h2 id="plan-editor-title">Ułóż swój trening</h2></div><button type="button" className="icon-button" aria-label="Zamknij" onClick={requestClose}><X size={18}/></button></header>
    <div className="sheet-body">
      <label>Nazwa planu<input name="name" value={draft.name ?? ""} onChange={event=>setDraft(current=>({...current,name:event.target.value}))}/></label>
      <label>Dni treningowe<input name="days" value={draft.days ?? ""} onChange={event=>setDraft(current=>({...current,days:event.target.value}))}/></label>
      <div className="editor-label"><span className="eyebrow">ĆWICZENIA W PLANIE</span><small>{draft.exercises.length} wybranych</small></div>
      <div className="selected-exercises">{draft.exercises.map(id=>{
        const exercise=exercises.find(item=>item.id===id);
        return <div className="plan-exercise-edit" key={id}>
          <button type="button" onClick={()=>setDraft(current=>({...current,exercises:current.exercises.filter(item=>item!==id)}))}>{exercise?.name}<X size={14}/></button>
          <div className="plan-targets">{[["sets","Serie",3,1,20],["reps","Powt.",10,1,100],["rest","Przerwa (s)",90,0,900]].map(([key,label,fallback,min,max])=><label key={key}>{label}<input type="number" inputMode="numeric" min={min} max={max} required value={draft.targets?.[id]?.[key]??exercise?.[key]??fallback} onChange={event=>setDraft(current=>({...current,targets:{...current.targets,[id]:{sets:exercise?.sets||3,reps:exercise?.reps||10,rest:exercise?.rest||90,...current.targets?.[id],[key]:event.target.value===""?"":Number(event.target.value)}}}))}/></label>)}</div>
        </div>;
      })}</div>
      <select className="exercise-picker" aria-label="Dodaj ćwiczenie do planu" defaultValue="" onChange={event=>{const id=Number(event.target.value);if(event.target.value)setDraft(current=>current.exercises.includes(id)?current:{...current,exercises:[...current.exercises,id]});event.target.value="";}}><option value="">+ Dodaj ćwiczenie z bazy</option>{exercises.filter(exercise=>!draft.exercises.includes(exercise.id)).map(exercise=><option value={exercise.id} key={exercise.id}>{exercise.name}</option>)}</select>
      {error&&<p className="form-error" role="alert">{error}</p>}
    </div>
    <footer className="sheet-footer"><button className="primary-cta" type="submit"><Check size={18}/> Zapisz plan</button></footer>
  </>}</DraftDialogSheet>;
}
