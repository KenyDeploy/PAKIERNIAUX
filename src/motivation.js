import { dateKey, number } from "./training.js";
import { allBodyMetrics, bodyNumber, datedMeasurements, validBodyDate } from "./bodyMeasurements.js";

export const XP_PER_LEVEL = 300;
const performed = row => row?.completed === true && !row.skipped && Number.isInteger(number(row.reps)) && number(row.reps)>0 &&
  (row.weight == null || String(row.weight).trim()==="" || Number.isFinite(number(row.weight)) && number(row.weight)>=0);
export function premiumInsights(workouts, completedDays, measurements = [], now = new Date()) {
 const end = new Date(now), today = dateKey(end), seen = new Set();
 const sessions = workouts.filter(w=>{
  if(w.completedAt==null || String(w.completedAt).trim()==="" || !Number.isFinite(Number(w.completedAt)) || Number(w.completedAt)>end.getTime() || !(w.exercises||[]).some(e=>!e.skipped && (e.sets||[]).some(performed)))return false;
  if(w.id!=null){if(seen.has(w.id))return false;seen.add(w.id);}return true;
 }).sort((a,b)=>a.completedAt-b.completedAt);
 const sessionDays = new Set(sessions.map(w=>dateKey(w.completedAt)));
 const manual = [...new Set(completedDays)].filter(d=>validBodyDate(d) && d<=today && !sessionDays.has(d));
 const days = Array.from({length:7},(_,i)=>{const d=new Date(end);d.setDate(d.getDate()-6+i);return {date:dateKey(d),volume:0,loadedSets:0,trainings:0};});
 const groups = new Map(), recordEvents=[];
 for(const session of sessions){
  const day=days.find(d=>d.date===dateKey(session.completedAt));if(day)day.trainings++;
  const best=new Map();
  for(const exercise of session.exercises||[]){
   if(exercise.skipped)continue;
   for(const row of (exercise.sets||[]).filter(performed)){
    const missing=row.weight==null || String(row.weight).trim()==="";
    if(missing)continue;
    const weight=number(row.weight),reps=number(row.reps);
    if(day){day.volume+=weight*reps;day.loadedSets++;}
    if(exercise.id==null)continue;
    const key=JSON.stringify([exercise.id,reps]);
    if(!best.has(key)||best.get(key).weight<weight)best.set(key,{id:exercise.id,name:exercise.name,weight,reps,completedAt:session.completedAt});
   }
  }
  for(const [key,point] of best){
   const points=groups.get(key)||[], previous=points.length?Math.max(...points.map(p=>p.weight)):null;
   if(previous!=null && point.weight>previous)recordEvents.push({...point,previous,delta:point.weight-previous});
   points.push(point);groups.set(key,points);
  }
 }
 for(const d of days)if(manual.includes(d.date))d.trainings++;
 const comparable=[...groups.values()].filter(points=>points.length>=2).sort((a,b)=>b.at(-1).completedAt-a.at(-1).completedAt)[0]||[];
 const latest=comparable.at(-1), previous=comparable.at(-2);
 const attendance=[...new Set([...sessionDays,...manual])].sort();
 let longest=0,run=0,last=null;
 for(const d of attendance){const current=new Date(`${d}T12:00:00`);if(last){const expected=new Date(last);expected.setDate(expected.getDate()+1);run=dateKey(expected)===d?run+1:1;}else run=1;longest=Math.max(longest,run);last=current;}
 const measurementDays=[...new Set(datedMeasurements(measurements,today).filter(row=>allBodyMetrics.some(m=>bodyNumber(row,m.key)!==null)).map(row=>row.date))].sort();
 const span=measurementDays.length?Math.round((new Date(`${measurementDays.at(-1)}T12:00:00`)-new Date(`${measurementDays[0]}T12:00:00`))/86400000):0;
 const count=sessions.length+manual.length;
 const badges=[
  {id:'first',label:'Pierwszy trening',hint:'1 zapisany trening lub oznaczony dzień',earned:count>=1},
  {id:'five',label:'5 treningów',hint:'5 treningów / dni frekwencji',earned:count>=5},
  {id:'ten',label:'10 treningów',hint:'10 treningów / dni frekwencji',earned:count>=10},
  {id:'twentyfive',label:'25 treningów',hint:'25 treningów / dni frekwencji',earned:count>=25},
  {id:'streak',label:'Rytm treningu',hint:'3 kolejne dni frekwencji',earned:longest>=3},
  {id:'record',label:'Nowy rekord',hint:'Większy ciężar przy tych samych powtórzeniach',earned:recordEvents.length>0},
  {id:'measure',label:'Regularne pomiary',hint:'3 dni pomiarów na przestrzeni min. 14 dni',earned:measurementDays.length>=3 && span>=14},
 ];
 const xp=sessions.length*100+manual.length*20+measurementDays.length*15;
 const weeklyRecord=recordEvents.filter(r=>dateKey(r.completedAt)>=days[0].date).at(-1)||null;
 return {days,trend:weeklyRecord?groups.get(JSON.stringify([weeklyRecord.id,weeklyRecord.reps])):comparable,latestProgress:latest?{...latest,delta:latest.weight-previous.weight}:null,
  weeklyRecord,
  xp,level:Math.floor(xp/XP_PER_LEVEL)+1,levelXp:xp%XP_PER_LEVEL,nextLevelXp:XP_PER_LEVEL,badges};
}
