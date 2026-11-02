import { exerciseHistory } from "./exerciseHistory.js";
export function exerciseChartPoints(sessions, key="weight") {
 return [...sessions].sort((a,b)=>a.date-b.date).flatMap(s=>{
  const weights=s.sets.filter(row=>row.weight!=null).map(row=>row.weight);
  const value=key==="volume"?s.hasLoad?s.volume:null:weights.length?Math.max(...weights):null;
  return value==null?[]:[{date:new Date(s.date).toLocaleDateString("pl-PL"),time:s.date,value}];
 });
}
export function workoutVolumePoints(workouts) {
 return workouts.flatMap(w=>{
  const entries=[...new Set((w.exercises||[]).map(e=>e.id))].flatMap(id=>exerciseHistory([w],id));
  const loaded=entries.filter(s=>s.hasLoad);
  if(!loaded.length)return [];
  const time=loaded[0].date;
  return time>Date.now()?[]:[{time,date:new Date(time).toLocaleDateString("pl-PL"),value:loaded.reduce((sum,s)=>sum+s.volume,0)}];
 }).sort((a,b)=>a.time-b.time);
}
