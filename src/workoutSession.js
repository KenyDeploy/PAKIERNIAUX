import { number, validSet } from "./training.js";
import { seriesNeedsConfirmation } from "./activeSeries.js";
export const isBodyweightExercise = exercise => exercise.equipment === "Masa ciała";
// Only applied by the explicit Save action; a suggestion never becomes a result on its own.
export const confirmationRow = (exercise,row) => isBodyweightExercise(exercise) && String(row.weight??"").trim()==="" ? {...row,weight:"0"} : row;
export function seriesResultLabel(exercise,row) {
 if(isBodyweightExercise(exercise))return number(row.weight||0)===0?`${row.reps} powt. · masa ciała`:`+${row.weight} kg × ${row.reps}`;
 return `${row.weight} kg × ${row.reps}`;
}
export function sessionTotals(session) {
 const totals={sets:0,reps:0,volume:0,exercises:0,drafts:0};
 for(const exercise of session?.exercises||[]){
  if(exercise.skipped)continue;
  let performed=false;
  for(const row of exercise.sets||[]){
   if(row.skipped)continue;
   if(row.completed && validSet(row)){totals.sets++;totals.reps+=number(row.reps);totals.volume+=number(row.weight)*number(row.reps);performed=true;}
   else if(!row.completed && seriesNeedsConfirmation(row))totals.drafts++;
  }
  if(performed)totals.exercises++;
 }
 return totals;
}
export function navigateSession(session,index) {
 const next=typeof index==="function"?index(Number.isInteger(session.index)?session.index:0):index;
 if(!Number.isInteger(next)||next<0||next>=session.exercises.length)throw new Error("Nie znaleziono ćwiczenia w tej sesji.");
 return {...session,index:next};
}
