import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, Check, ChevronLeft, ChevronRight, Copy,
  Dumbbell, Flame, Gauge, History, Layers3, Moon, Pause, Play, Plus,
  Palette, PlusCircle, RotateCcw, Settings, SkipForward, Sun, Timer, Trash2, Trophy, TrendingUp,
  Upload, Download, RefreshCcw, Scale, X
} from "lucide-react";
import "./styles.css";
import { supabase } from "./supabase";

const STORAGE = {
  theme:"pm_theme", exercises:"pm_exercises", plans:"pm_plans", history:"pm_history",
  markedDays:"pm_marked_days", completedDays:"pm_completed_days", bodyStats:"pm_body_stats", settings:"pm_settings"
};

const DEFAULT_EXERCISES = [
  {id:"1",name:"Rozpiętki na maszynie",category:"Klatka"},
  {id:"2",name:"Wyciskanie hantli nad głowę",category:"Barki"},
  {id:"3",name:"Przysiady ze sztangą",category:"Nogi"},
  {id:"4",name:"Uginanie ramion ze sztangą",category:"Biceps"},
  {id:"5",name:"Wyciskanie sztangi leżąc",category:"Klatka"},
  {id:"6",name:"Ściąganie drążka wyciągu",category:"Plecy"}
];
const DEFAULT_PLANS = [
  {id:"1",name:"FBW A",exerciseIds:["5","6","2","3"]},
  {id:"2",name:"GÓRA",exerciseIds:["5","6","2","4"]}
];

const read = (key, fallback) => {
  try { const x=localStorage.getItem(key); return x ? JSON.parse(x) : fallback; } catch { return fallback; }
};
const uid = p => `${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const dateStr = (d=new Date()) => {
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
};
const parseDate = x => new Date(`${x}T00:00:00`);
const fmtDate = x => x ? parseDate(x).toLocaleDateString("pl-PL",{day:"numeric",month:"short",year:"numeric"}) : "—";
const duration = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const number = x => new Intl.NumberFormat("pl-PL",{maximumFractionDigits:1}).format(Number(x)||0);
const startWeek = d => { const x=new Date(d); const day=x.getDay()||7; x.setDate(x.getDate()-day+1); x.setHours(0,0,0,0); return x; };
const diffDays = (a,b) => Math.round((parseDate(a)-parseDate(b))/86400000);

function Splash({done,theme}) {
  return <div className={`splash ${done?"splash-out":""} splash-${theme}`}>
    <style>{`.splash-modern{background:#f2f5ff;color:#17233b}.splash-modern .splash-logo{background:#2858df;color:#fff;box-shadow:5px 5px 0 #173a9f}.splash-modern .splash-sub{color:#2858df}.splash-modern .splash-loader{background:#dbe3fa}.splash-modern .splash-loader span{background:#2858df}.splash-signal{background:#fff3ed;color:#2b1d20}.splash-signal .splash-logo{background:#d95243;color:#fff;box-shadow:5px 5px 0 #96352f}.splash-signal .splash-sub{color:#d95243}.splash-signal .splash-loader{background:#f3d7cc}.splash-signal .splash-loader span{background:#d95243}.splash-aqua{background:#eaf9f7;color:#123139}.splash-aqua .splash-logo{background:#078b88;color:#fff;box-shadow:5px 5px 0 #056360}.splash-aqua .splash-sub{color:#078b88}.splash-aqua .splash-loader{background:#cce8e5}.splash-aqua .splash-loader span{background:#078b88}`}</style>
    <div className="splash-logo"><Dumbbell size={34}/></div>
    <div className="splash-title">PAKIERNIA</div>
    <div className="splash-sub">U MATIEGO</div>
    <div className="splash-loader"><span/></div>
  </div>
}

function AuthScreen(){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const submit=async event=>{
    event.preventDefault();setBusy(true);setMessage("");
    const result=mode==="login"?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password});
    setBusy(false);
    if(result.error){setMessage("Nie udało się zalogować. Sprawdź email i hasło.");return}
    if(mode==="signup"&&!result.data.session)setMessage("Sprawdź skrzynkę email i potwierdź konto.");
  };
  return <main className="auth-screen"><style>{`.auth-screen{--auth-bg:#f2f5ff;--auth-surface:#fff;--auth-soft:#e8edfb;--auth-line:#c4d0ee;--auth-text:#17233b;--auth-muted:#697892;--auth-accent:#2858df;min-height:100vh;display:grid;place-items:center;padding:40px 24px;background:radial-gradient(circle at 85% 10%,#dbe5ff 0,transparent 30%),var(--auth-bg);color:var(--auth-text)}.auth-card{width:min(450px,100%);padding:34px;border:1px solid var(--auth-line);border-radius:18px;background:var(--auth-surface);box-shadow:0 24px 70px #284da31f}.auth-brand{position:absolute;top:28px;left:30px;display:grid;grid-template-columns:auto auto;align-items:center;column-gap:10px}.auth-brand .brand-mark{grid-row:span 2;background:var(--auth-accent);color:#fff;box-shadow:5px 5px 0 #173a9f}.auth-brand b{font-size:12px;letter-spacing:.16em}.auth-brand small{font:500 10px 'DM Mono',monospace;color:var(--auth-accent)}.auth-card h1{font-size:42px;line-height:.98;letter-spacing:-.055em;margin:10px 0}.auth-card p{color:var(--auth-muted);line-height:1.6;margin:0 0 24px}.auth-card form{display:flex;flex-direction:column;gap:4px}.auth-card label{display:block;font:500 10px 'DM Mono',monospace;color:var(--auth-muted);margin-bottom:10px}.auth-card input{display:block;width:100%;min-height:50px;margin-top:7px;padding:0 13px;border:1px solid var(--auth-line);border-radius:9px;background:var(--auth-soft);color:var(--auth-text);font:600 15px 'Space Grotesk',sans-serif}.auth-card input:focus{outline:2px solid var(--auth-accent);outline-offset:1px}.auth-card .primary{min-height:50px;background:var(--auth-accent);border-color:var(--auth-accent);color:#fff;box-shadow:4px 4px 0 #173a9f;margin-top:5px}.auth-message{margin-top:14px;padding:12px;border-radius:9px;background:var(--auth-soft);color:var(--auth-accent);font-size:12px}.auth-switch{display:block;margin:20px auto 0;border:0;background:transparent;color:var(--auth-accent);font-weight:700}.auth-card .eyebrow{color:var(--auth-accent)}@media(max-width:520px){.auth-screen{display:block;padding:28px 15px}.auth-brand{position:static;margin:0 0 30px 4px}.auth-card{padding:24px;border-radius:14px}.auth-card h1{font-size:36px}}`}</style><div className="auth-brand"><span className="brand-mark"><Dumbbell size={27}/></span><b>PAKIERNIA</b><small>U MATIEGO</small></div><section className="auth-card"><div className="eyebrow">TWOJE DANE</div><h1>{mode==="login"?"Witaj z powrotem.":"Załóż konto."}</h1><p>{mode==="login"?"Zaloguj się, aby mieć swoje treningi i pomiary zawsze pod ręką.":"Utwórz konto i zachowaj swój progres bez względu na urządzenie."}</p><form onSubmit={submit}><label>Email<input type="email" required autoComplete="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="ty@przyklad.pl"/></label><label>Hasło<input type="password" required minLength="6" autoComplete={mode==="login"?"current-password":"new-password"} value={password} onChange={event=>setPassword(event.target.value)} placeholder="Minimum 6 znaków"/></label><button className="primary full" disabled={busy}>{busy?"Ładowanie...":mode==="login"?"Zaloguj się":"Utwórz konto"}</button></form>{message&&<div className="auth-message">{message}</div>}<button className="auth-switch" onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage("")}}>{mode==="login"?"Nie masz konta? Zarejestruj się":"Masz już konto? Zaloguj się"}</button></section></main>
}

function App() {
  const [ready,setReady]=useState(false);
  const [authReady,setAuthReady]=useState(!supabase);
  const [user,setUser]=useState(null);
  const [cloudLoaded,setCloudLoaded]=useState(!supabase);
  const [theme,setTheme]=useState(()=>{const saved=localStorage.getItem(STORAGE.theme);return saved==="light"||!saved?"modern":saved});
  const dark=theme==="dark";
  const themeOptions=[
    {id:"dark",name:"Dark",desc:"Grafit + limonka",color:"#d8f36a"},
    {id:"modern",name:"Modern",desc:"Kobalt + biel",color:"#4768ff"},
    {id:"signal",name:"Signal",desc:"Koral + granat",color:"#ef765f"},
    {id:"aqua",name:"Aqua",desc:"Turkus + atrament",color:"#16a6a0"}
  ];
  const [exercises,setExercises]=useState(()=>read(STORAGE.exercises,DEFAULT_EXERCISES));
  const [plans,setPlans]=useState(()=>read(STORAGE.plans,DEFAULT_PLANS));
  const [history,setHistory]=useState(()=>read(STORAGE.history,[]));
  const [marked,setMarked]=useState(()=>read(STORAGE.markedDays,[]));
  const [completedDays,setCompletedDays]=useState(()=>read(STORAGE.completedDays,[]));
  const [body,setBody]=useState(()=>read(STORAGE.bodyStats,[]));
  const [settings,setSettings]=useState(()=>({defaultRest:90,vibration:true,weeklyGoal:3,weeklyReminder:true,restByCategory:{},profileName:"",...read(STORAGE.settings,{})}));

  const [tab,setTab]=useState("home");
  const [session,setSession]=useState(null);
  const [exIdx,setExIdx]=useState(0);
  const [sessionSec,setSessionSec]=useState(0);
  const [rest,setRest]=useState(0);
  const [restRun,setRestRun]=useState(false);
  const [sheet,setSheet]=useState(null);
  const [toast,setToast]=useState(null);
  const [selectedDate,setSelectedDate]=useState(dateStr());
  const [month,setMonth]=useState(new Date());
  const [query,setQuery]=useState("");
  const [statsEx,setStatsEx]=useState("");
  const [newEx,setNewEx]=useState("");
  const [newCat,setNewCat]=useState("Klatka");
  const [newPlan,setNewPlan]=useState("");
  const [planIds,setPlanIds]=useState([]);
  const [weight,setWeight]=useState(""); const [chest,setChest]=useState("");
  const [arm,setArm]=useState(""); const [waist,setWaist]=useState(""); const [thigh,setThigh]=useState("");
  const [note,setNote]=useState("");
  const [photo,setPhoto]=useState("");
  const photoRef=useRef(null);
  const importRef=useRef(null);
  const timer=useRef(null), restTimer=useRef(null);

  useEffect(()=>{ const t=setTimeout(()=>setReady(true),900); return()=>clearTimeout(t); },[]);
  useEffect(()=>{
    if(!supabase)return;
    supabase.auth.getSession().then(({data})=>{setUser(data.session?.user||null);setAuthReady(true)});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user||null));
    return()=>subscription.unsubscribe();
  },[]);
  useEffect(()=>{
    if(!supabase||!user){setCloudLoaded(!supabase);return}
    setCloudLoaded(false);
    supabase.from("user_data").select("data").eq("user_id",user.id).maybeSingle().then(({data,error})=>{
      if(!error&&data?.data){const saved=data.data;if(Array.isArray(saved.exercises))setExercises(saved.exercises);if(Array.isArray(saved.plans))setPlans(saved.plans);if(Array.isArray(saved.history))setHistory(saved.history);if(Array.isArray(saved.marked))setMarked(saved.marked);if(Array.isArray(saved.completedDays))setCompletedDays(saved.completedDays);if(Array.isArray(saved.body))setBody(saved.body);if(saved.settings)setSettings(saved.settings)}
      setCloudLoaded(true);
    });
  },[user]);
  useEffect(()=>localStorage.setItem(STORAGE.theme,theme),[theme]);
  useEffect(()=>localStorage.setItem(STORAGE.exercises,JSON.stringify(exercises)),[exercises]);
  useEffect(()=>localStorage.setItem(STORAGE.plans,JSON.stringify(plans)),[plans]);
  useEffect(()=>localStorage.setItem(STORAGE.history,JSON.stringify(history)),[history]);
  useEffect(()=>localStorage.setItem(STORAGE.markedDays,JSON.stringify(marked)),[marked]);
  useEffect(()=>localStorage.setItem(STORAGE.completedDays,JSON.stringify(completedDays)),[completedDays]);
  useEffect(()=>localStorage.setItem(STORAGE.bodyStats,JSON.stringify(body)),[body]);
  useEffect(()=>localStorage.setItem(STORAGE.settings,JSON.stringify(settings)),[settings]);
  useEffect(()=>{
    if(!supabase||!user||!cloudLoaded)return;
    const payload={theme,exercises,plans,history,marked,completedDays,body,settings};
    const timeout=setTimeout(()=>supabase.from("user_data").upsert({user_id:user.id,data:payload,updated_at:new Date().toISOString()}).then(({error})=>{if(error)notify("Nie udało się zsynchronizować danych","error")}),500);
    return()=>clearTimeout(timeout);
  },[theme,exercises,plans,history,marked,completedDays,body,settings,user,cloudLoaded]);

  useEffect(()=>{
    if(!session) return;
    timer.current=setInterval(()=>setSessionSec(v=>v+1),1000);
    return()=>clearInterval(timer.current);
  },[session]);
  useEffect(()=>{
    if(!restRun) return;
    restTimer.current=setInterval(()=>{
      setRest(v=>{
        if(v<=1){
          clearInterval(restTimer.current); setRestRun(false);
          if(settings.vibration && navigator.vibrate) navigator.vibrate([120,80,120]);
          notify("Przerwa zakończona. Lecimy dalej 🔥","success"); return 0;
        }
        return v-1;
      });
    },1000);
    return()=>clearInterval(restTimer.current);
  },[restRun,settings.vibration]);

  const notify=(message,tone="default")=>{
    setToast({message,tone}); setTimeout(()=>setToast(null),2400);
  };
  const today=dateStr();
  const sorted=useMemo(()=>[...history].sort((a,b)=>`${b.date}-${b.id}`.localeCompare(`${a.date}-${a.id}`)),[history]);
  const historyDays=useMemo(()=>new Set(history.map(x=>x.date)),[history]);
  const markedSet=useMemo(()=>new Set(marked),[marked]);
  const completedSet=useMemo(()=>new Set(completedDays),[completedDays]);
  const latest=body[0]||{};
  const totalVolume=history.reduce((s,w)=>s+(Number(w.totalWeight)||0),0);
  const totalSets=history.reduce((s,w)=>s+(w.exercises||[]).reduce((a,e)=>a+(e.sets||[]).length,0),0);
  const weeklyBody=useMemo(()=>body.filter(x=>diffDays(today,x.date)<=56),[body,today]);
  const previousBody=body[1]||{};
  const bodyDelta=(field)=>previousBody[field]===undefined?0:Number(latest[field]||0)-Number(previousBody[field]||0);
  const currentMonth=`${today.slice(0,7)}`;
  const monthCount=history.filter(w=>w.date.startsWith(currentMonth)).length;
  const weeklyGoal=Number(settings.weeklyGoal)||3;
  const weeklyWorkouts=new Set([...history.map(workout=>workout.date),...completedDays].filter(date=>{const age=diffDays(today,date);return age>=0&&age<7})).size;
  const weeklyRemaining=Math.max(0,weeklyGoal-weeklyWorkouts);
  const streak=useMemo(()=>{
    const u=[...new Set(history.map(w=>w.date))].sort((a,b)=>b.localeCompare(a));
    if(!u.length || diffDays(today,u[0])>1) return 0;
    let c=1,base=u[0];
    for(let i=1;i<u.length;i++){ if(diffDays(base,u[i])===1){c++;base=u[i]}else break; }
    return c;
  },[history,today]);

  const active=session?.exercises?.[exIdx]||null;
  const previous=useMemo(()=>{
    if(!active)return null;
    for(const w of sorted){const e=(w.exercises||[]).find(x=>(x.id&&x.id===active.id)||x.name===active.name);if(e)return e}
    return null;
  },[active,sorted]);
  const pr=useMemo(()=>{
    if(!active)return 0; let max=0;
    history.forEach(w=>(w.exercises||[]).forEach(e=>{
      if((e.id&&e.id===active.id)||e.name===active.name)(e.sets||[]).forEach(s=>max=Math.max(max,Number(s.weight)||0))
    })); return max;
  },[active,history]);
  const progress=session?Math.round((session.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0)/Math.max(1,session.exercises.reduce((a,e)=>a+e.sets.length,0)))*100):0;
  const volume=active?active.sets.reduce((s,x)=>s+(Number(x.weight)||0)*(Number(x.reps)||0),0):0;

  const startWorkout=plan=>{
    const ses=(plan.exerciseIds||[]).map(id=>{
      const ex=exercises.find(x=>x.id===id);
      const old=sorted.flatMap(w=>w.exercises||[]).find(e=>(e.id&&e.id===id)||e.name===ex?.name);
      const base=old?.sets?.length?old.sets:[{reps:"",weight:"",rpe:"",done:false}];
      return {id,name:ex?.name||"Ćwiczenie",category:ex?.category||"Trening",note:"",effort:"",sets:base.map(s=>({reps:s.reps??"",weight:s.weight??"",rpe:s.rpe??"",done:false}))};
    });
    setSession({id:uid("session"),planId:plan.id,planName:plan.name,exercises:ses});
    setExIdx(0);setSessionSec(0);setRest(0);setRestRun(false);setSheet(null);setTab("workout");
  };
  const quick=()=>startWorkout({id:uid("quick"),name:"Szybki trening",exerciseIds:[exercises[0]?.id||"1"]});
  const toggleCompletedDay=date=>setCompletedDays(days=>days.includes(date)?days.filter(day=>day!==date):[...days,date]);
  const updateExercise=(exerciseIndex,field,value)=>setSession(p=>({...p,exercises:p.exercises.map((exercise,index)=>index===exerciseIndex?{...exercise,[field]:value}:exercise)}));
  const updateSet=(ei,si,field,value)=>setSession(p=>({...p,exercises:p.exercises.map((e,i)=>i!==ei?e:{...e,sets:e.sets.map((s,j)=>j===si?{...s,[field]:value}:s)})}));
  const doneSet=(ei,si)=>{
    const next=!session.exercises[ei].sets[si].done; updateSet(ei,si,"done",next);
    if(next){setRest(Number(settings.restByCategory?.[active?.category])||settings.defaultRest);setRestRun(true);if(settings.vibration&&navigator.vibrate)navigator.vibrate(50)}
  };
  const addSet=(ei,copy=false)=>setSession(p=>({...p,exercises:p.exercises.map((e,i)=>{
    if(i!==ei)return e;const last=e.sets.at(-1);return {...e,sets:[...e.sets,copy&&last?{...last,done:false}:{reps:"",weight:"",rpe:"",done:false}]}
  })}));
  const removeSet=(ei,si)=>setSession(p=>({...p,exercises:p.exercises.map((e,i)=>i!==ei||e.sets.length<=1?e:{...e,sets:e.sets.filter((_,j)=>j!==si)})}));
  const applyPrevious=()=>{if(!previous)return;setSession(p=>({...p,exercises:p.exercises.map((e,i)=>i!==exIdx?e:{...e,sets:previous.sets.map(s=>({reps:s.reps??"",weight:s.weight??"",rpe:"",done:false}))})}));notify("Wynik z ostatniego treningu wczytany")};
  const finish=()=>{
    if(!session)return;
    const clean=session.exercises.map(e=>({...e,sets:e.sets.map(s=>({...s,done:!!s.done}))}));
    const reps=clean.reduce((s,e)=>s+e.sets.reduce((a,x)=>a+(Number(x.reps)||0),0),0);
    const vol=clean.reduce((s,e)=>s+e.sets.reduce((a,x)=>a+(Number(x.weight)||0)*(Number(x.reps)||0),0),0);
    setHistory(p=>[{id:uid("workout"),date:today,duration:duration(sessionSec),planName:session.planName,totalReps:reps,totalWeight:vol,note,exercises:clean},...p]);
    setMarked(p=>p.includes(today)?p:[...p,today]);setSession(null);setRest(0);setRestRun(false);setNote("");setSheet(null);setTab("home");
    notify("Trening zapisany. Dobra robota! 💪","success");
  };
  const deleteWorkout=id=>{
    const item=history.find(x=>x.id===id);if(!item)return;
    setHistory(p=>p.filter(x=>x.id!==id));
    if(!history.some(x=>x.id!==id&&x.date===item.date))setMarked(p=>p.filter(x=>x!==item.date));
    notify("Trening usunięty");
  };
  const saveBody=e=>{
    e.preventDefault();if(![weight,chest,arm,waist,thigh].some(Boolean))return;
    const old=body[0]||{};setBody(p=>{const next=[{id:uid("measurement"),date:today,photo,
      weight:weight!==""?Number(weight):Number(old.weight)||0,chest:chest!==""?Number(chest):Number(old.chest)||0,
      arm:arm!==""?Number(arm):Number(old.arm)||0,waist:waist!==""?Number(waist):Number(old.waist)||0,
      thigh:thigh!==""?Number(thigh):Number(old.thigh)||0},...p];const photoIds=new Set(next.filter(entry=>entry.photo).slice(0,3).map(entry=>entry.id));return next.map(entry=>entry.photo&&!photoIds.has(entry.id)?{...entry,photo:""}:entry)});
    setWeight("");setChest("");setArm("");setWaist("");setThigh("");setPhoto("");notify("Pomiar zapisany","success");
  };
  const readPhoto=e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>setPhoto(String(reader.result));reader.readAsDataURL(file)};
  const createEx=e=>{e.preventDefault();if(!newEx.trim())return;setExercises(p=>[...p,{id:uid("ex"),name:newEx.trim(),category:newCat}]);setNewEx("");notify("Dodano ćwiczenie")};
  const createPlan=e=>{e.preventDefault();if(!newPlan.trim()||!planIds.length)return;setPlans(p=>[...p,{id:uid("plan"),name:newPlan.trim(),exerciseIds:planIds}]);setNewPlan("");setPlanIds([]);setSheet(null);notify("Plan utworzony","success")};
  const exportData=()=>{
    const blob=new Blob([JSON.stringify({version:5,exportedAt:new Date().toISOString(),theme,exercises,plans,history,marked,completedDays,body,settings},null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`pakiernia-backup-${today}.json`;a.click();URL.revokeObjectURL(a.href);notify("Backup pobrany");
  };
  const importData=e=>{
    const file=e.target.files?.[0];if(!file)return;const r=new FileReader();
    r.onload=()=>{try{const d=JSON.parse(r.result);if(Array.isArray(d.history))setHistory(d.history);if(Array.isArray(d.exercises))setExercises(d.exercises);if(Array.isArray(d.plans))setPlans(d.plans);if(Array.isArray(d.marked))setMarked(d.marked);if(Array.isArray(d.completedDays))setCompletedDays(d.completedDays);if(Array.isArray(d.body))setBody(d.body);if(d.settings)setSettings(p=>({...p,...d.settings}));notify("Backup przywrócony","success")}catch{notify("Nie udało się odczytać pliku","error")}};
    r.readAsText(file);e.target.value="";
  };

  if(!ready||!authReady)return <Splash done={false} theme={theme}/>;
  if(supabase&&!user)return <AuthScreen/>;

  const nav=[
    ["home","Pulpit",Activity],["workout","Trening",Dumbbell],["history","Historia",CalendarDays],
    ["stats","Postęp",BarChart3],["plans","Plany",Layers3],["more","Więcej",Settings]
  ];
  const categories=["Klatka","Plecy","Barki","Nogi","Biceps","Triceps","Brzuch"];

  return <div className={`app ${dark?"dark":"light"} theme-${theme}`}>
    <header className="topbar">
      <button className="brand" onClick={()=>setTab("home")}>
        <span className="brand-mark"><Dumbbell size={21}/></span>
        <span><b>PAKIERNIA</b><small>U MATIEGO</small></span>
      </button>
      <div className="top-actions">
        {session&&<button className="timer-pill" onClick={()=>setTab("workout")}><Timer size={16}/>{duration(sessionSec)}</button>}
        {!session&&<button className="week-status" onClick={()=>setTab("history")}><Activity size={16}/><span><b>{weeklyWorkouts}</b> / {weeklyGoal}</span><small>{weeklyRemaining?`brakuje ${weeklyRemaining}`:"cel zrobiony"}</small></button>}
      </div>
    </header>

    <main className="content">
      {tab==="home"&&<Home/>}
      {tab==="workout"&&session&&<Workout/>}
      {tab==="history"&&<HistoryPage/>}
      {tab==="history"&&<ManualWeek onToggle={toggleCompletedDay} completedSet={completedSet} today={today}/>} 
      {tab==="stats"&&<div className="stats-layout"><BodyMap latest={latest} previous={previousBody} bodyDelta={bodyDelta}/><StatsPage/></div>}
      {tab==="stats"&&<StrengthChart history={history}/>} 
      {tab==="stats"&&<section className="card photo-checkin"><SectionTitle eyebrow="CHECK-IN" title="Tygodniowe zdjęcie sylwetki"/><p>Dodaj zdjęcie raz w tygodniu, aby porównać zmianę obok pomiarów.</p><div className="photo-actions"><button className="secondary" onClick={()=>photoRef.current?.click()}><Upload/> {photo?"Zmień zdjęcie":"Dodaj zdjęcie"}</button>{(photo||latest.photo)&&<img src={photo||latest.photo} alt="Podgląd tygodniowego zdjęcia"/>}</div><input ref={photoRef} hidden type="file" accept="image/*" onChange={readPhoto}/><label className="reminder-toggle"><input type="checkbox" checked={settings.weeklyReminder} onChange={e=>setSettings(s=>({...s,weeklyReminder:e.target.checked}))}/><span>Przypominaj o pomiarze raz w tygodniu</span></label></section>}
      {tab==="plans"&&<PlansPage/>}
      {tab==="more"&&<MorePage/>}
      {tab==="more"&&<section className="card weekly-goal-panel"><SectionTitle eyebrow="CEL TYGODNIA" title="Ile treningów chcesz zrobić?"/><div className="weekly-goal-control"><div><b>{weeklyWorkouts} / {weeklyGoal}</b><small>{weeklyRemaining?`Brakuje ${weeklyRemaining} treningów`:"Cel tygodnia zrobiony"}</small></div><select value={weeklyGoal} onChange={e=>setSettings(s=>({...s,weeklyGoal:Number(e.target.value)}))}>{[2,3,4,5,6].map(goal=><option key={goal} value={goal}>{goal} treningi</option>)}</select></div></section>}
      {tab==="more"&&<section className="card rest-settings"><SectionTitle eyebrow="PRZERWY" title="Czas odpoczynku"/><div className="rest-settings-grid">{categories.map(category=><label key={category}>{category}<select value={settings.restByCategory?.[category]||settings.defaultRest} onChange={e=>setSettings(s=>({...s,restByCategory:{...s.restByCategory,[category]:Number(e.target.value)}}))}>{[45,60,75,90,120,150].map(value=><option key={value} value={value}>{value} s</option>)}</select></label>)}</div></section>}
      {tab==="more"&&<section className="card profile-panel"><SectionTitle eyebrow="PROFIL" title="Twoje konto na tym urządzeniu"/><p className="profile-copy">Dane są zapisane lokalnie. Backup pozwala przenieść profil na inne urządzenie.</p><input value={settings.profileName} onChange={e=>setSettings(s=>({...s,profileName:e.target.value}))} placeholder="Twoje imię lub pseudonim"/></section>}
      {tab==="more"&&supabase&&user&&<section className="card account-panel"><SectionTitle eyebrow="KONTO" title={user.email||"Zalogowany użytkownik"}/><button className="secondary" onClick={()=>supabase.auth.signOut()}>Wyloguj się</button></section>}
    </main>

    {!session&&<nav className="bottom-nav"><button className="nav-start" onClick={()=>setSheet("plans")} aria-label="Rozpocznij trening"><Play size={21} fill="currentColor"/><span>START</span></button>{nav.map(([id,label,I])=><button key={id} className={tab===id?"active":""} onClick={()=>id==="workout"?setSheet("plans"):setTab(id)}><I size={20}/><span>{label}</span></button>)}</nav>}

    {sheet==="plans"&&<Modal title="Wybierz trening" eyebrow="START" close={()=>setSheet(null)}>
      <div className="choice-list">{plans.map(p=><button className="choice" key={p.id} onClick={()=>startWorkout(p)}><span><b>{p.name}</b><small>{p.exerciseIds.length} ćwiczeń</small></span><Play size={19}/></button>)}</div>
      <button className="secondary full" onClick={quick}><PlusCircle size={18}/> Szybki trening</button>
    </Modal>}
    {sheet==="finish"&&<Modal title="Kończymy?" eyebrow="PODSUMOWANIE" close={()=>setSheet(null)}>
      <div className="summary-grid"><Metric label="Czas" value={duration(sessionSec)}/><Metric label="Serie" value={session?.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0)||0}/><Metric label="Tonaż" value={`${number(session?.exercises.reduce((a,e)=>a+e.sets.reduce((x,z)=>x+(Number(z.weight)||0)*(Number(z.reps)||0),0),0))} kg`}/></div>
      <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Notatka z treningu (opcjonalnie)"/>
      <button className="success full" onClick={finish}><Check size={18}/> Zapisz trening</button>
    </Modal>}
    {sheet==="create-plan"&&<Modal title="Zbuduj trening" eyebrow="NOWY PLAN" close={()=>setSheet(null)}>
      <input value={newPlan} onChange={e=>setNewPlan(e.target.value)} placeholder="Nazwa planu"/>
      <div className="select-exercises">{exercises.map(x=><button key={x.id} className={planIds.includes(x.id)?"selected":""} onClick={()=>setPlanIds(p=>p.includes(x.id)?p.filter(i=>i!==x.id):[...p,x.id])}><span><b>{x.name}</b><small>{x.category}</small></span>{planIds.includes(x.id)?<Check/>:<Plus/>}</button>)}</div>
      <button className="primary full" onClick={createPlan}>Utwórz plan</button>
    </Modal>}
    <style>{`.bottom-nav{grid-template-columns:repeat(7,1fr)}.bottom-nav button:nth-child(2){order:1}.bottom-nav button:nth-child(3){order:2}.bottom-nav button:nth-child(4){order:3}.bottom-nav .nav-start{order:4;color:#18200f;background:var(--accent);box-shadow:0 4px 0 #778d31}.bottom-nav button:nth-child(5){order:5}.bottom-nav button:nth-child(6){order:6}.bottom-nav button:nth-child(7){order:7}.strength-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:18px}.strength-summary>div{padding:13px;border-radius:10px;background:var(--surface2)}.strength-summary small,.strength-summary b,.strength-summary span{display:block}.strength-summary small{font:500 9px 'DM Mono',monospace;color:var(--muted)}.strength-summary b{font-size:23px;color:var(--accent);margin:6px 0 3px}.strength-summary span{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pr-list,.progress-list{margin-top:12px}.body-trends{grid-template-columns:repeat(5,1fr)}.body-trend{min-width:0;padding:14px;border-radius:10px;background:var(--surface2)}.body-trend small,.body-trend b,.body-trend span{display:flex;align-items:center}.body-trend small{font:500 9px 'DM Mono',monospace;color:var(--muted)}.body-trend b{font-size:18px;margin:7px 0}.body-trend span{font:500 10px 'DM Mono',monospace;gap:2px;white-space:nowrap}.body-trend .up{color:var(--success)}.body-trend .down{color:var(--danger)}.body-trend .flat{color:var(--muted)}.body-history{margin-top:16px;border-top:1px solid var(--line)}.body-history-row{display:flex;justify-content:space-between;gap:14px;padding:12px 0;border-bottom:1px solid var(--line);font:500 11px 'DM Mono',monospace;color:var(--muted)}.body-history-row b,.body-history-row small{display:block}.body-history-row b{color:var(--text)}.body-history-row small{font-size:10px;margin-top:3px}.body-history-row>span:last-child{text-align:right}@media(max-width:800px){.body-trends{grid-template-columns:repeat(2,1fr)}.strength-summary{grid-template-columns:1fr}.body-history-row{display:block}.body-history-row>span:last-child{display:block;text-align:left;margin-top:5px}}@media(max-width:480px){.bottom-nav{width:calc(100% - 12px);gap:2px}.bottom-nav button{font-size:7px;padding:0 2px}.bottom-nav svg{width:17px}.body-trend b{font-size:16px}}`}</style>
    <style>{`.sets{gap:6px}.set{grid-template-columns:32px minmax(0,1fr) auto;align-items:center;padding:8px 10px;border-radius:10px}.set-number{width:32px;height:32px;border-radius:8px}.set-fields{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(150px,1.25fr);align-items:end;gap:6px}.set-fields input{min-height:40px;height:40px;font-size:15px}.set-fields label{font-size:8px}.rpe{grid-column:auto}.rpe small{margin-bottom:4px}.rpe>div{gap:3px}.rpe button{min-height:34px;height:34px;padding:0 5px}.set-actions{flex-direction:row;align-items:center;gap:3px}.check{width:38px;height:38px}.set-actions .delete{width:32px;height:32px}.add-row{gap:8px;margin-top:8px}.add-row button{min-height:42px}.workout-head{padding-bottom:19px}.previous{padding:16px 20px}.bottom-nav{grid-template-columns:repeat(7,1fr)}.bottom-nav button:nth-child(2){order:1}.bottom-nav button:nth-child(3){order:2}.bottom-nav button:nth-child(4){order:3}.bottom-nav .nav-start{order:4}.bottom-nav button:nth-child(5){order:5}.bottom-nav button:nth-child(6){order:6}.bottom-nav button:nth-child(7){order:7}.app.light{--accent:#718c1a;--accent2:#536c10;--line:#c4ccb7}.app.light .primary,.app.light .bottom-nav .nav-start{background:#c9ee4f;border-color:#abc934;color:#17200f}.app.light .hero{background:linear-gradient(110deg,#fbfcf7,#edf5cb)}.app.light .hero h1 em{color:#718c1a}.app.light .metric.accent strong,.app.light .metric.accent svg{color:#718c1a}@media(max-width:800px){.set-fields{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(130px,1.25fr)}.set-actions{flex-direction:column}.check{width:36px;height:36px}.set-actions .delete{width:30px;height:30px}}@media(max-width:520px){.set{grid-template-columns:30px minmax(0,1fr) auto;padding:7px}.set-number{width:30px;height:30px}.set-fields{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(108px,1.2fr);gap:4px}.set-fields input{padding:0 7px;font-size:14px}.rpe button{font-size:12px}.set-actions .delete{display:none}.bottom-nav{width:calc(100% - 12px)}}`}</style>
    <style>{`.theme-modern{--bg:#eef1f8;--surface:#ffffff;--surface2:#e5eaf5;--line:#cbd3e4;--text:#17233b;--muted:#697892;--accent:#4768ff;--accent2:#2948c7}.theme-signal{--bg:#f8eee9;--surface:#fffaf7;--surface2:#f3e1da;--line:#dfc7bc;--text:#271c20;--muted:#856e6d;--accent:#e96653;--accent2:#ae3f35}.theme-aqua{--bg:#e8f5f4;--surface:#fbfffe;--surface2:#d9eeec;--line:#bbd9d6;--text:#122b31;--muted:#5d7b80;--accent:#119e99;--accent2:#08716f}.app.theme-modern .primary,.app.theme-signal .primary,.app.theme-aqua .primary{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:4px 4px 0 color-mix(in srgb,var(--accent) 65%,#000)}.app.theme-modern .bottom-nav .nav-start,.app.theme-signal .bottom-nav .nav-start,.app.theme-aqua .bottom-nav .nav-start{background:var(--accent);color:#fff;box-shadow:0 4px 0 color-mix(in srgb,var(--accent) 65%,#000)}.app.theme-modern .hero{background:linear-gradient(110deg,#fff,#e5eaff)}.app.theme-signal .hero{background:linear-gradient(110deg,#fffaf7,#f8d9cf)}.app.theme-aqua .hero{background:linear-gradient(110deg,#fbfffe,#d7eeeb)}.theme-picker{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:17px}.theme-choice{min-width:0;min-height:106px;padding:13px;border:1px solid var(--line);border-radius:11px;background:var(--surface2);color:var(--text);display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:11px;position:relative}.theme-choice:hover{border-color:var(--accent);transform:translateY(-2px)}.theme-choice.selected{border:2px solid var(--accent);padding:12px;background:var(--surface)}.theme-choice i{width:25px;height:25px;border-radius:8px;display:block;border:2px solid color-mix(in srgb,var(--text) 20%,transparent)}.theme-choice span,.theme-choice b,.theme-choice small{display:block}.theme-choice b{font-size:13px}.theme-choice small{font:500 9px 'DM Mono',monospace;color:var(--muted);margin-top:3px}.theme-choice>svg{position:absolute;right:10px;top:10px;color:var(--accent)}@media(max-width:700px){.theme-picker{grid-template-columns:repeat(2,1fr)}}`}</style>
    <style>{`.app.theme-modern{background:#f2f5ff;color:#17233b}.app.theme-modern .topbar{background:#f2f5ffe8}.app.theme-modern .hero{background:linear-gradient(120deg,#fff 0%,#e7edff 100%);border-color:#c4d0ee}.app.theme-modern .card,.app.theme-modern .metric{background:#fff;border-color:#c4d0ee}.app.theme-modern .metric:not(.accent),.app.theme-modern .set,.app.theme-modern .quick-grid button,.app.theme-modern .exercise-list>div,.app.theme-modern .plan-exercises div{background:#e8edfb}.app.theme-modern .primary{background:#2858df;color:#fff;border-color:#2858df;box-shadow:4px 4px 0 #173a9f}.app.theme-modern .accent,.app.theme-modern .metric.accent strong,.app.theme-modern .metric.accent svg,.app.theme-modern .eyebrow,.app.theme-modern .section-title small{color:#2858df}.app.theme-modern .bottom-nav .nav-start{background:#2858df;color:#fff;box-shadow:0 4px 0 #173a9f}.app.theme-modern .theme-choice.selected{background:#eef2ff}.app.theme-signal{background:#fff3ed;color:#2b1d20}.app.theme-signal .topbar{background:#fff3ede8}.app.theme-signal .hero{background:linear-gradient(120deg,#fffaf7 0%,#ffe0d3 100%);border-color:#e5bcae}.app.theme-signal .card,.app.theme-signal .metric{background:#fffaf7;border-color:#e5bcae}.app.theme-signal .metric:not(.accent),.app.theme-signal .set,.app.theme-signal .quick-grid button,.app.theme-signal .exercise-list>div,.app.theme-signal .plan-exercises div{background:#f9e7df}.app.theme-signal .primary{background:#d95243;color:#fff;border-color:#d95243;box-shadow:4px 4px 0 #96352f}.app.theme-signal .metric.accent strong,.app.theme-signal .metric.accent svg,.app.theme-signal .eyebrow,.app.theme-signal .section-title small{color:#c74439}.app.theme-signal .bottom-nav .nav-start{background:#d95243;color:#fff;box-shadow:0 4px 0 #96352f}.app.theme-signal .theme-choice.selected{background:#fff0e9}.app.theme-aqua{background:#eaf9f7;color:#123139}.app.theme-aqua .topbar{background:#eaf9f7e8}.app.theme-aqua .hero{background:linear-gradient(120deg,#fbfffe 0%,#cdeee9 100%);border-color:#a9d7d1}.app.theme-aqua .card,.app.theme-aqua .metric{background:#fbfffe;border-color:#a9d7d1}.app.theme-aqua .metric:not(.accent),.app.theme-aqua .set,.app.theme-aqua .quick-grid button,.app.theme-aqua .exercise-list>div,.app.theme-aqua .plan-exercises div{background:#dff2ef}.app.theme-aqua .primary{background:#078b88;color:#fff;border-color:#078b88;box-shadow:4px 4px 0 #056360}.app.theme-aqua .metric.accent strong,.app.theme-aqua .metric.accent svg,.app.theme-aqua .eyebrow,.app.theme-aqua .section-title small{color:#078b88}.app.theme-aqua .bottom-nav .nav-start{background:#078b88;color:#fff;box-shadow:0 4px 0 #056360}.app.theme-aqua .theme-choice.selected{background:#e1f5f2}`}</style>
    <style>{`.app.theme-modern .plan-chip,.app.theme-modern .week button.planned,.app.theme-modern .calendar-grid button.planned,.app.theme-modern .select-exercises button.selected,.app.theme-modern .badges span{color:#2858df;background:#2858df18;border-color:#2858df66}.app.theme-modern .progress span,.app.theme-modern .rpe button.on,.app.theme-modern .check.on,.app.theme-modern .switch.on{background:#2858df;border-color:#2858df;color:#fff}.app.theme-modern .rest-box{border-color:#2858df66;background:#2858df12}.app.theme-modern .rest-box small,.app.theme-modern .rest-box strong,.app.theme-modern .rest-box button{color:#2858df}.app.theme-modern .set.set-done{border-color:#2858df66;background:#2858df12}.app.theme-modern .success,.app.theme-modern .toast.success{background:#2858df;border-color:#2858df;color:#fff}.app.theme-modern .body-trend .up{color:#2858df}.app.theme-signal .plan-chip,.app.theme-signal .week button.planned,.app.theme-signal .calendar-grid button.planned,.app.theme-signal .select-exercises button.selected,.app.theme-signal .badges span{color:#c74439;background:#e9665318;border-color:#e9665366}.app.theme-signal .progress span,.app.theme-signal .rpe button.on,.app.theme-signal .check.on,.app.theme-signal .switch.on{background:#d95243;border-color:#d95243;color:#fff}.app.theme-signal .rest-box{border-color:#d9524366;background:#d9524312}.app.theme-signal .rest-box small,.app.theme-signal .rest-box strong,.app.theme-signal .rest-box button{color:#c74439}.app.theme-signal .set.set-done{border-color:#d9524366;background:#d9524312}.app.theme-signal .success,.app.theme-signal .toast.success{background:#d95243;border-color:#d95243;color:#fff}.app.theme-signal .body-trend .up{color:#d95243}.app.theme-aqua .plan-chip,.app.theme-aqua .week button.planned,.app.theme-aqua .calendar-grid button.planned,.app.theme-aqua .select-exercises button.selected,.app.theme-aqua .badges span{color:#078b88;background:#119e9918;border-color:#119e9966}.app.theme-aqua .progress span,.app.theme-aqua .rpe button.on,.app.theme-aqua .check.on,.app.theme-aqua .switch.on{background:#078b88;border-color:#078b88;color:#fff}.app.theme-aqua .rest-box{border-color:#078b8866;background:#078b8812}.app.theme-aqua .rest-box small,.app.theme-aqua .rest-box strong,.app.theme-aqua .rest-box button{color:#078b88}.app.theme-aqua .set.set-done{border-color:#078b8866;background:#078b8812}.app.theme-aqua .success,.app.theme-aqua .toast.success{background:#078b88;border-color:#078b88;color:#fff}.app.theme-aqua .body-trend .up{color:#078b88}`}</style>
    <style>{`.app.light.theme-modern{--accent:#2858df;--accent2:#173a9f;--line:#c4d0ee}.app.light.theme-signal{--accent:#d95243;--accent2:#a9362f;--line:#e5bcae}.app.light.theme-aqua{--accent:#078b88;--accent2:#056360;--line:#a9d7d1}`}</style>
    <style>{`.app.light.theme-modern .brand-mark,.app.light.theme-signal .brand-mark,.app.light.theme-aqua .brand-mark{background:var(--accent);color:#fff;box-shadow:5px 5px 0 color-mix(in srgb,var(--accent) 65%,#000)}.app.light.theme-modern .bottom-nav button.active,.app.light.theme-signal .bottom-nav button.active,.app.light.theme-aqua .bottom-nav button.active{background:var(--accent);color:#fff}.app.light.theme-modern .hero h1 em,.app.light.theme-signal .hero h1 em,.app.light.theme-aqua .hero h1 em{color:var(--accent)}.app.light.theme-modern .metric.accent strong,.app.light.theme-modern .metric.accent svg,.app.light.theme-signal .metric.accent strong,.app.light.theme-signal .metric.accent svg,.app.light.theme-aqua .metric.accent strong,.app.light.theme-aqua .metric.accent svg{color:var(--accent)}.app.light.theme-modern .quick-grid svg,.app.light.theme-signal .quick-grid svg,.app.light.theme-aqua .quick-grid svg,.app.light.theme-modern .plan-title>svg,.app.light.theme-signal .plan-title>svg,.app.light.theme-aqua .plan-title>svg{color:var(--accent)}`}</style>
    <style>{`.app.light.theme-modern{--bg:#f2f5ff;--surface:#fff;--surface2:#e8edfb;--line:#c4d0ee;--text:#17233b;--muted:#697892;--accent:#2858df;--accent2:#173a9f}.app.light.theme-signal{--bg:#fff3ed;--surface:#fffaf7;--surface2:#f9e7df;--line:#e5bcae;--text:#2b1d20;--muted:#856e6d;--accent:#d95243;--accent2:#a9362f}.app.light.theme-aqua{--bg:#eaf9f7;--surface:#fbfffe;--surface2:#dff2ef;--line:#a9d7d1;--text:#123139;--muted:#5d7b80;--accent:#078b88;--accent2:#056360}.app.light.theme-modern .calendar-grid button,.app.light.theme-modern .week button,.app.light.theme-signal .calendar-grid button,.app.light.theme-signal .week button,.app.light.theme-aqua .calendar-grid button,.app.light.theme-aqua .week button{background:var(--surface2);color:var(--muted);border-color:var(--line)}.app.light.theme-modern .bottom-nav,.app.light.theme-signal .bottom-nav,.app.light.theme-aqua .bottom-nav{background:color-mix(in srgb,var(--surface) 94%,transparent);border-color:var(--line)}`}</style>
    <style>{`.week-status{min-height:42px;border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text);display:flex;align-items:center;gap:7px;padding:0 12px}.week-status:hover{border-color:var(--accent);background:var(--surface2)}.week-status svg{color:var(--accent)}.week-status span{font:500 13px 'DM Mono',monospace}.week-status span b{color:var(--accent)}.week-status small{font-size:10px;color:var(--muted);white-space:nowrap}@media(max-width:480px){.week-status small{display:none}.week-status{padding:0 10px}}`}</style>
    <style>{`.weekly-goal-panel{margin-top:-4px}.weekly-goal-control{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:17px;padding:15px;border-radius:10px;background:var(--surface2)}.weekly-goal-control b,.weekly-goal-control small{display:block}.weekly-goal-control b{font-size:24px;color:var(--accent)}.weekly-goal-control small{font-size:11px;color:var(--muted);margin-top:3px}.weekly-goal-control select{min-height:44px;border:1px solid var(--line);border-radius:9px;background:var(--surface);color:var(--text);padding:0 10px;font-weight:700}@media(max-width:480px){.weekly-goal-control{align-items:flex-start;flex-direction:column}.weekly-goal-control select{width:100%}}`}</style>
    <style>{`.splash-modern .splash-logo{box-shadow:5px 5px 0 #173a9f!important}.splash-modern .splash-loader span{background:#2858df!important}.app.theme-modern .brand-mark{background:#2858df;color:#fff;box-shadow:5px 5px 0 #173a9f}.app.theme-signal .brand-mark{background:#d95243;color:#fff;box-shadow:5px 5px 0 #96352f}.app.theme-aqua .brand-mark{background:#078b88;color:#fff;box-shadow:5px 5px 0 #056360}.manual-help,.body-map-help{margin:7px 0 0;color:var(--muted);font-size:12px}.manual-days{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-top:17px}.manual-days button{min-width:0;min-height:70px;border:1px solid var(--line);border-radius:10px;background:var(--surface2);color:var(--muted);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;position:relative}.manual-days button:hover{border-color:var(--accent)}.manual-days button.checked{background:var(--accent);border-color:var(--accent);color:#fff}.manual-days button b{font-size:17px;color:var(--text)}.manual-days button.checked b{color:#fff}.manual-days button small{font:500 9px 'DM Mono',monospace;text-transform:uppercase}.manual-days button svg{position:absolute;right:6px;top:6px}.manual-days button em{font:500 8px 'DM Mono',monospace;font-style:normal;color:var(--accent)}.manual-days button.checked em{color:#fff}.body-map-card{overflow:hidden}.body-map{min-height:360px;position:relative;max-width:700px;margin:18px auto 0;display:flex;justify-content:center}.body-map img{width:270px;height:390px;object-fit:contain;display:block}.body-map .body-fallback{height:390px;width:270px;fill:var(--surface2);stroke:var(--accent);stroke-width:2;stroke-linejoin:round;display:none}.card:has(.body-trends){display:none}.body-label{position:absolute;display:flex;flex-direction:column;gap:2px;padding:9px 11px;border-radius:8px;background:var(--surface2);border:1px solid var(--line);min-width:108px;z-index:1}.body-label:after{content:"";position:absolute;width:34px;height:1px;background:var(--accent);top:50%;opacity:.8}.body-label b{font-size:14px;color:var(--text)}.body-label small{font:500 9px 'DM Mono',monospace;color:var(--muted)}.body-label span{font:500 10px 'DM Mono',monospace;color:var(--accent)}.chest-point{left:5%;top:112px}.chest-point:after,.waist-point:after{right:-34px}.arm-point{right:5%;top:140px}.arm-point:after,.thigh-point:after{left:-34px}.waist-point{left:5%;top:215px}.thigh-point{right:5%;top:270px}.weight-point{right:5%;top:57px}.weight-point:after{left:-34px}.bottom-nav{grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}.bottom-nav button{min-width:0;overflow:hidden;white-space:nowrap}.bottom-nav button span{max-width:100%;overflow:hidden;text-overflow:ellipsis}.app.light .bottom-nav{box-shadow:0 8px 30px #17233b26}@media(max-width:600px){.content{padding-bottom:142px}.manual-days{gap:4px}.manual-days button{min-height:62px}.manual-days button em{display:none}.body-map{min-height:520px;display:block}.body-map img,.body-map .body-fallback{display:block;margin:auto;height:390px;width:270px}.body-map img + .body-fallback{display:none}.body-label{min-width:104px}.chest-point{left:0;top:92px}.arm-point{right:0;top:148px}.waist-point{left:0;top:236px}.thigh-point{right:0;top:315px}.weight-point{right:0;top:34px}.body-label:after{width:20px}.chest-point:after,.waist-point:after{right:-20px}.arm-point:after,.thigh-point:after,.weight-point:after{left:-20px}}`}</style>
    <style>{`.body-map .waist-point{top:178px}.body-map .thigh-point{top:232px}@media(max-width:600px){.body-map .waist-point{top:188px}.body-map .thigh-point{top:255px}}`}</style>
    <style>{`.stats-layout{display:flex;flex-direction:column;gap:22px}.stats-layout>.page{gap:20px}.body-map-card{margin:0}.body-map-card+.page{margin:0}.body-map{margin-top:22px}.body-map img,.body-map .body-fallback{background:var(--surface);border-radius:12px;padding:4px}@media(max-width:600px){.stats-layout{gap:18px}.body-map-card{padding:17px}.body-map{min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px}.body-map img,.body-map .body-fallback{grid-column:1/-1;width:240px;height:300px;margin:0 auto 8px}.body-label{position:relative;left:auto!important;right:auto!important;top:auto!important;min-width:0;width:100%;padding:10px}.body-label:after{display:none}.weight-point{grid-column:1/-1;width:100%}}`}</style>
    <style>{`.exercise-feedback{border-color:color-mix(in srgb,var(--accent) 35%,var(--line))}.effort-scale{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:16px 0 9px}.effort-scale button{min-height:42px;border:1px solid var(--line);border-radius:9px;background:var(--surface2);color:var(--muted);font-weight:700}.effort-scale button.selected{background:var(--accent);border-color:var(--accent);color:#fff}.exercise-feedback textarea{width:100%;min-height:74px;border:1px solid var(--line);background:var(--surface);color:var(--text);border-radius:9px;padding:11px;resize:vertical}.photo-checkin{margin-top:0}.photo-checkin p{color:var(--muted);font-size:12px;margin:8px 0 14px}.photo-actions{display:flex;align-items:center;gap:12px}.photo-actions img{width:68px;height:68px;border-radius:9px;object-fit:cover;border:1px solid var(--line)}.reminder-toggle{display:flex;align-items:center;gap:8px;margin-top:15px;color:var(--muted);font-size:12px}.reminder-toggle input{accent-color:var(--accent)}.stats-layout+.photo-checkin{margin-top:0}@media(max-width:520px){.effort-scale{grid-template-columns:1fr}.photo-actions{justify-content:space-between}}`}</style>
    <style>{`.strength-chart{margin-top:0}.strength-chart>p{color:var(--muted);font-size:12px;margin:8px 0 0}.chart-bars{height:210px;display:flex;align-items:stretch;gap:8px;margin-top:18px;padding:20px 4px 0;border-bottom:1px solid var(--line)}.chart-column{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px}.chart-column i{display:block;width:100%;max-width:54px;min-height:6px;border-radius:7px 7px 0 0;background:var(--accent)}.chart-column span{font:500 9px 'DM Mono',monospace;color:var(--accent);white-space:nowrap;transform:rotate(-45deg);height:24px}.chart-column small{font:500 8px 'DM Mono',monospace;color:var(--muted);white-space:nowrap}.rest-settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}.rest-settings-grid label{font:500 10px 'DM Mono',monospace;color:var(--muted)}.rest-settings-grid select{display:block;width:100%;min-height:40px;margin-top:5px;border:1px solid var(--line);border-radius:8px;background:var(--surface2);color:var(--text);padding:0 7px;font-weight:700}.profile-copy{color:var(--muted);font-size:12px;margin:8px 0 12px}.profile-panel input{width:100%;min-height:46px;border:1px solid var(--line);background:var(--surface2);color:var(--text);border-radius:9px;padding:0 12px;font-weight:700}@media(max-width:600px){.rest-settings-grid{grid-template-columns:repeat(2,1fr)}.chart-bars{gap:4px}.chart-column span{font-size:8px}}`}</style>
    <style>{`.auth-screen{--bg:#f2f5ff;--surface:#fff;--surface2:#e8edfb;--line:#c4d0ee;--text:#17233b;--muted:#697892;--accent:#2858df;min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--bg);color:var(--text)}.auth-card{width:min(440px,100%);padding:28px;border:1px solid var(--line);border-radius:16px;background:var(--surface);box-shadow:0 20px 60px #0002}.auth-brand{position:absolute;top:26px;left:26px;display:grid;grid-template-columns:auto auto;align-items:center;column-gap:10px}.auth-brand .brand-mark{grid-row:span 2;background:var(--accent);color:#fff;box-shadow:5px 5px 0 #173a9f}.auth-brand b{font-size:12px;letter-spacing:.16em}.auth-brand small{font:500 10px 'DM Mono',monospace;color:var(--accent)}.auth-card h1{font-size:38px;line-height:1;letter-spacing:-.05em;margin:10px 0}.auth-card p{color:var(--muted);line-height:1.55;margin:0 0 22px}.auth-card label{display:block;font:500 10px 'DM Mono',monospace;color:var(--muted);margin-bottom:12px}.auth-card input{display:block;width:100%;min-height:48px;margin-top:6px;padding:0 12px;border:1px solid var(--line);border-radius:9px;background:var(--surface2);color:var(--text);font:700 15px 'Space Grotesk',sans-serif}.auth-card input:focus{outline:2px solid var(--accent);outline-offset:1px}.auth-message{margin-top:12px;padding:11px;border-radius:8px;background:var(--surface2);color:var(--accent);font-size:12px}.auth-switch{display:block;margin:18px auto 0;border:0;background:transparent;color:var(--accent);font-weight:700}.account-panel{display:flex;align-items:flex-end;justify-content:space-between;gap:18px}@media(max-width:520px){.auth-brand{position:static;margin-bottom:22px}.auth-screen{display:block;padding-top:38px}.auth-card{padding:22px}.account-panel{align-items:stretch;flex-direction:column}}`}</style>
    <Toast data={toast}/>
  </div>;

  function Home(){
    const week=Array.from({length:7},(_,i)=>{const d=startWeek(new Date());d.setDate(d.getDate()+i);return{date:dateStr(d),day:d.toLocaleDateString("pl-PL",{weekday:"short"}).replace(".",""),num:d.getDate()}});
    const last=sorted[0];
    return <div className="page">
      <section className="hero">
        <div><div className="eyebrow">DASHBOARD</div><h1>{streak?<>Trzymasz tempo.<br/><em>Nie odpuszczaj.</em></>:<>Gotowy na<br/><em>kolejny trening?</em></>}</h1><p>Plan, progres, rekordy i historia. Podczas treningu liczy się tylko następna seria.</p></div>
        <div className="hero-actions"><button className="primary big" onClick={()=>setSheet("plans")}><Play size={18} fill="currentColor"/> Rozpocznij trening</button><button className="secondary big" onClick={quick}><PlusCircle size={18}/> Szybki</button></div>
      </section>
      <div className="stats-row">
        <Metric label="Streak" value={`${streak} dni`} icon={<Flame/>} accent/><Metric label="Ten miesiąc" value={monthCount}/><Metric label="Treningów" value={history.length}/><Metric label="Łączny tonaż" value={`${number(totalVolume)} kg`}/>
      </div>
      <div className="two-col">
        <section className="card"><SectionTitle eyebrow="OSTATNI TRENING" title={last?.planName||"Jeszcze nie trenowałeś"}/>{last?<><div className="last-head"><span>{fmtDate(last.date)}</span></div><div className="mini-grid"><Metric label="Czas" value={last.duration}/><Metric label="Powtórzenia" value={last.totalReps||0}/><Metric label="Tonaż" value={`${number(last.totalWeight)} kg`} accent/></div></>:<div className="empty">Zacznij pierwszy trening i tutaj pojawi się podsumowanie.</div>}</section>
        <section className="card"><SectionTitle eyebrow="TEN TYDZIEŃ" title="Rytm treningowy"/><div className="week">{week.map(x=><button key={x.date} onClick={()=>{setSelectedDate(x.date);setTab("history")}} className={`${historyDays.has(x.date)?"done":markedSet.has(x.date)?"planned":""} ${x.date===today?"today":""}`}><small>{x.day}</small><b>{x.num}</b>{historyDays.has(x.date)&&<i/>}</button>)}</div></section>
      </div>
      <section className="card"><SectionTitle eyebrow="SZYBKIE AKCJE" title="Co dziś robimy?"/><div className="quick-grid">
        <button onClick={()=>setSheet("plans")}><Play/><b>Rozpocznij plan</b><small>Gotowy trening</small></button>
        <button onClick={()=>setTab("stats")}><BarChart3/><b>Sprawdź progres</b><small>Siła i rekordy</small></button>
        <button onClick={()=>setTab("history")}><CalendarDays/><b>Historia</b><small>Kalendarz treningów</small></button>
      </div></section>
    </div>
  }

  function Workout(){
    const doneExercises=session.exercises.filter(e=>e.sets.length&&e.sets.every(s=>s.done)).length;
    return <div className="page workout-page">
      <div className="workout-top"><button className="secondary" onClick={()=>setTab("home")}><ChevronLeft/> Wyjdź</button><span className="plan-chip">{session.planName}</span><button className="danger" onClick={()=>setSheet("finish")}>Zakończ</button></div>
      <section className="workout-head card">
        <div><div className="eyebrow">ĆWICZENIE {String(exIdx+1).padStart(2,"0")} / {String(session.exercises.length).padStart(2,"0")}</div><h1>{active.name}</h1><div className="muted">{active.category}</div><div className="badges"><span>PR {pr||0} kg</span>{previous&&<span>Ostatnio {previous.sets.length} serii</span>}</div></div>
        <div className="volume"><small>TONAŻ</small><b>{number(volume)} kg</b></div>
        <div className="progress"><span style={{width:`${progress}%`}}/></div><div className="progress-info"><span>{doneExercises}/{session.exercises.length} ćwiczeń</span><b>{progress}%</b></div>
      </section>
      {rest>0&&<section className="rest-box"><div><small>PRZERWA</small><strong>{duration(rest)}</strong></div><div><button onClick={()=>setRest(v=>v+30)}>+30s</button><button onClick={()=>setRestRun(v=>!v)}>{restRun?<Pause/>:<Play/>}</button><button onClick={()=>{setRest(0);setRestRun(false)}}><SkipForward/></button></div></section>}
      {previous&&<section className="previous card"><div><small>OSTATNI WYNIK</small><b>{previous.sets.map(s=>`${s.reps||0} × ${s.weight||0}`).join(" · ")}</b></div><button className="secondary" onClick={applyPrevious}><RotateCcw/> Użyj</button></section>}
      <section className="card exercise-feedback"><div className="section-head"><div><div className="eyebrow">ODCZUCIA</div><h2>Jak poszło?</h2></div><span className="muted">{active.category}</span></div><div className="effort-scale">{[["easy","Lekko"],["ok","W sam raz"],["hard","Ciężko"]].map(([value,label])=><button key={value} className={active.effort===value?"selected":""} onClick={()=>updateExercise(exIdx,"effort",active.effort===value?"":value)}>{label}</button>)}</div><textarea value={active.note||""} onChange={e=>updateExercise(exIdx,"note",e.target.value)} placeholder="Uwaga do tego ćwiczenia..."/></section>
      <section className="card sets-card"><div className="section-head"><div><div className="eyebrow">SERIE</div><h2>Wynik każdej serii</h2></div><span className="muted">{active.sets.length} serii</span></div>
        <div className="sets">{active.sets.map((s,i)=><div className={`set ${s.done?"set-done":""}`} key={i}>
          <span className="set-number">{i+1}</span>
          <div className="set-fields"><label>Powt.<input type="number" min="0" step="1" value={s.reps} onChange={e=>updateSet(exIdx,i,"reps",e.target.value)} inputMode="numeric"/></label><label>Ciężar<input type="number" min="0" step="0.5" value={s.weight} onChange={e=>updateSet(exIdx,i,"weight",e.target.value)} inputMode="decimal"/></label>
          <div className="rpe"><small>RPE</small><div>{[6,7,8,9,10].map(r=><button key={r} className={s.rpe===r?"on":""} onClick={()=>updateSet(exIdx,i,"rpe",s.rpe===r?"":r)}>{r}</button>)}</div></div></div>
          <div className="set-actions"><button className={`check ${s.done?"on":""}`} onClick={()=>doneSet(exIdx,i)}><Check/></button><button className="delete" disabled={active.sets.length<=1} onClick={()=>removeSet(exIdx,i)}><Trash2/></button></div>
        </div>)}</div>
        <div className="add-row"><button className="secondary full" onClick={()=>addSet(exIdx,true)}><Copy/> Kopiuj serię</button><button className="primary full" onClick={()=>addSet(exIdx)}><Plus/> Dodaj serię</button></div>
      </section>
      <div className="exercise-nav"><button className="secondary full" disabled={!exIdx} onClick={()=>setExIdx(v=>v-1)}><ChevronLeft/> Poprzednie</button><button className="primary full" disabled={exIdx===session.exercises.length-1} onClick={()=>setExIdx(v=>v+1)}>Następne <ChevronRight/></button></div>
    </div>
  }

  function HistoryPage(){
    const grid=useMemo(()=>{const y=month.getFullYear(),m=month.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),blank=(first.getDay()||7)-1;return[...Array(blank).fill(null),...Array.from({length:days},(_,i)=>i+1)]},[month]);
    const dayWorkouts=history.filter(w=>w.date===selectedDate);
    return <div className="page"><PageTitle eyebrow="HISTORIA" title="Kalendarz treningów" desc="Kliknij dzień, aby zobaczyć zapisane treningi."/><section className="card calendar"><div className="calendar-head"><div><h2>{month.toLocaleString("pl-PL",{month:"long",year:"numeric"})}</h2><small>Twój rytm</small></div><div><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></div></div><div className="weekdays">{["Pn","Wt","Śr","Cz","Pt","So","Nd"].map(x=><span key={x}>{x}</span>)}</div><div className="calendar-grid">{grid.map((d,i)=>{if(!d)return <span key={i}/>;const date=`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,done=historyDays.has(date),plan=markedSet.has(date);return <button key={date} className={`${done?"done":plan?"planned":""} ${selectedDate===date?"selected":""}`} onClick={()=>setSelectedDate(date)}>{d}{done&&<small>{history.filter(w=>w.date===date).length}×</small>}</button>})}</div></section><section className="card"><SectionTitle eyebrow={fmtDate(selectedDate)} title="Treningi tego dnia"/>{dayWorkouts.length?dayWorkouts.map(w=><div className="history-item" key={w.id}><div className="history-main"><b>{w.planName}</b><small>{w.duration} · {number(w.totalWeight)} kg · {w.totalReps||0} powt.</small></div><button className="delete" onClick={()=>deleteWorkout(w.id)}><Trash2/></button><details><summary>Szczegóły ćwiczeń</summary>{(w.exercises||[]).map(e=><div className="history-ex" key={e.id+e.name}><b>{e.name}</b><small>{e.sets.map((s,i)=>`S${i+1}: ${s.reps||0}×${s.weight||0}${s.rpe?` RPE${s.rpe}`:""}`).join(" · ")}</small></div>)}</details></div>):<div className="empty">Brak treningu w tym dniu.</div>}</section></div>
  }

  function StatsPage(){
    const prs=exercises.map(x=>{let max=0,reps=0;history.forEach(w=>(w.exercises||[]).forEach(e=>{if((e.id&&e.id===x.id)||e.name===x.name)(e.sets||[]).forEach(s=>{if(Number(s.weight)>max){max=Number(s.weight);reps=Number(s.reps)||0}})}));return{...x,max,reps}}).filter(x=>x.max>0).sort((a,b)=>b.max-a.max);
    const selected=exercises.find(x=>x.id===statsEx);const rows=selected?history.filter(w=>(w.exercises||[]).some(e=>(e.id&&e.id===selected.id)||e.name===selected.name)).sort((a,b)=>a.date.localeCompare(b.date)).slice(-8).reverse().map(w=>{const e=(w.exercises||[]).find(x=>(x.id&&x.id===selected.id)||x.name===selected.name);return{date:w.date,max:Math.max(0,...(e?.sets||[]).map(s=>Number(s.weight)||0)),vol:(e?.sets||[]).reduce((s,x)=>s+(Number(x.weight)||0)*(Number(x.reps)||0),0)}}):[];
    const strengthVolume=history.filter(workout=>diffDays(today,workout.date)<=7).reduce((sum,workout)=>sum+(Number(workout.totalWeight)||0),0);
    const deltaLabel=(field,unit)=>{const delta=bodyDelta(field);return delta===0?"Bez zmiany":`${delta>0?"+":""}${number(delta)} ${unit}`};
    return <div className="page"><PageTitle eyebrow="POSTĘP" title="Twoja forma, liczby, progres." desc="Widzisz, co rośnie, co spada i kiedy warto dołożyć ciężaru."/><div className="stats-row"><Metric label="Rekordy" value={prs.length} icon={<Trophy/>} accent/><Metric label="Tonaż" value={`${number(totalVolume)} kg`} icon={<TrendingUp/>}/><Metric label="Serie" value={totalSets} icon={<Gauge/>}/><Metric label="Ostatni tydzień" value={`${number(strengthVolume)} kg`} icon={<Activity/>}/></div><div className="two-col"><section className="card"><SectionTitle eyebrow="SIŁA" title="Podsumowanie progresu"/><div className="strength-summary"><div><small>REKORDY</small><b>{prs.length}</b><span>{prs.length?"ćwiczeń z zapisanym PR":"Dodaj pierwszy wynik"}</span></div><div><small>NAJLEPSZY PR</small><b>{prs[0]?`${prs[0].max} kg`:"—"}</b><span>{prs[0]?.name||"Brak danych"}</span></div><div><small>OSTATNIA SESJA</small><b>{history[0]?`${number(history[0].totalWeight)} kg`:"—"}</b><span>{history[0]?fmtDate(history[0].date):"Brak treningów"}</span></div></div>{prs.length?<div className="pr-list">{prs.slice(0,6).map(x=><div className="pr-row" key={x.id}><span><b>{x.name}</b><small>{x.category}</small></span><strong>{x.max} kg<small>{x.reps} powt.</small></strong></div>)}</div>:<div className="empty">Zapisz trening, aby zobaczyć rekordy i progres siłowy.</div>}</section><section className="card"><SectionTitle eyebrow="ĆWICZENIE" title="Historia wyniku"/><select value={statsEx} onChange={e=>setStatsEx(e.target.value)}><option value="">Wybierz ćwiczenie</option>{exercises.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>{statsEx?rows.length?<div className="progress-list">{rows.map((r,index)=><div className="stat-row" key={`${r.date}-${index}`}><span>{fmtDate(r.date)}</span><b>{r.max} kg <small>· {number(r.vol)} kg</small></b></div>)}</div>:<div className="empty">Brak zapisów.</div>:<div className="empty">Wybierz ćwiczenie, aby zobaczyć progres.</div>}</section></div><section className="card"><SectionTitle eyebrow="POMIARY CIAŁA" title="Zmiana od poprzedniego pomiaru"/><div className="body-grid body-trends">{[["Waga","weight","kg"],["Klatka","chest","cm"],["Ramię","arm","cm"],["Pas","waist","cm"],["Udo","thigh","cm"]].map(([label,field,unit])=>{const delta=bodyDelta(field);return <div className="body-trend" key={field}><small>{label}</small><b>{latest[field]||0} {unit}</b><span className={delta>0?"up":delta<0?"down":"flat"}>{delta>0?<ArrowUpRight size={14}/>:delta<0?<ArrowDownRight size={14}/>:null}{deltaLabel(field,unit)}</span></div>})}</div><div className="body-history">{weeklyBody.length?weeklyBody.slice(0,6).map((entry,index)=><div className="body-history-row" key={entry.id}><span><b>{fmtDate(entry.date)}</b><small>{index===0?"Najnowszy pomiar":"Pomiar tygodniowy"}</small></span><span>{entry.weight||0} kg · {entry.chest||0} cm klatka · {entry.waist||0} cm pas</span></div>):<div className="empty">Dodawaj pomiary raz w tygodniu, aby zobaczyć zmianę w czasie.</div>}</div></section><section className="card"><SectionTitle eyebrow="NOWY POMIAR" title="Dodaj pomiar tygodniowy"/><form onSubmit={saveBody} className="measure-form">{[["Waga",weight,setWeight],["Klatka",chest,setChest],["Ramię",arm,setArm],["Pas",waist,setWaist],["Udo",thigh,setThigh]].map(([l,v,s])=><input key={l} type="number" min="0" step="0.5" placeholder={l} value={v} onChange={e=>s(e.target.value)} inputMode="decimal"/>)}<button className="primary">Zapisz pomiar</button></form></section></div>
  }

  function PlansPage(){return <div className="page"><div className="title-row"><PageTitle eyebrow="PLANY" title="Treningi gotowe do odpalenia." desc="Wybierasz plan, naciskasz start i aplikacja prowadzi Cię przez trening."/><button className="primary" onClick={()=>setSheet("create-plan")}><Plus/> Nowy plan</button></div><div className="plans-grid">{plans.map(p=><section className="card plan-card" key={p.id}><div className="plan-title"><div><small>PLAN</small><h2>{p.name}</h2></div><Dumbbell/></div><div className="plan-exercises">{p.exerciseIds.map((id,i)=>{const x=exercises.find(e=>e.id===id);return <div key={id+i}><span>{i+1}. {x?.name||"Ćwiczenie"}</span><small>{x?.category}</small></div>})}</div><button className="primary full" onClick={()=>startWorkout(p)}><Play fill="currentColor"/> Start treningu</button></section>)}</div></div>}

  function MorePage(){const filtered=exercises.filter(x=>x.name.toLowerCase().includes(query.toLowerCase())||x.category.toLowerCase().includes(query.toLowerCase()));return <div className="page"><PageTitle eyebrow="WIĘCEJ" title="Narzędzia i ustawienia" desc="Wszystko, czego nie potrzebujesz podczas samego treningu."/><section className="card"><SectionTitle eyebrow="ĆWICZENIA" title="Baza ruchów"/><form className="exercise-form" onSubmit={createEx}><input value={newEx} onChange={e=>setNewEx(e.target.value)} placeholder="Np. Wiosłowanie hantlem"/><select value={newCat} onChange={e=>setNewCat(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select><button className="primary">Dodaj</button></form><input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Szukaj ćwiczenia"/><div className="exercise-list">{filtered.map(x=><div key={x.id}><span><b>{x.name}</b><small>{x.category}</small></span><button className="delete" onClick={()=>setExercises(p=>p.filter(e=>e.id!==x.id))}><Trash2/></button></div>)}</div></section><section className="card"><SectionTitle eyebrow="WYGLĄD" title="Wybierz styl"/><div className="theme-picker">{themeOptions.map(option=><button key={option.id} className={`theme-choice ${theme===option.id?"selected":""}`} onClick={()=>setTheme(option.id)}><i style={{background:option.color}}/><span><b>{option.name}</b><small>{option.desc}</small></span>{theme===option.id&&<Check size={17}/>}</button>)}</div></section><section className="card"><SectionTitle eyebrow="USTAWIENIA" title="Aplikacja"/><div className="setting"><span><b>Tryb nocny</b><small>Szybkie przełączenie z aktualnego stylu</small></span><button className="secondary" onClick={()=>setTheme(dark?"modern":"dark")}>{dark?<Sun/>:<Moon/>}{dark?"Jasny":"Ciemny"}</button></div><div className="setting"><span><b>Domyślna przerwa</b><small>Startuje po zaliczeniu serii</small></span><select value={settings.defaultRest} onChange={e=>setSettings(s=>({...s,defaultRest:Number(e.target.value)}))}>{[45,60,75,90,120,150].map(x=><option key={x} value={x}>{x} s</option>)}</select></div><div className="setting"><span><b>Wibracje</b><small>Powiadomienie po końcu przerwy</small></span><button className={`switch ${settings.vibration?"on":""}`} onClick={()=>setSettings(s=>({...s,vibration:!s.vibration}))}><i/></button></div></section><section className="card"><SectionTitle eyebrow="DANE" title="Backup"/><div className="backup-actions"><button className="secondary full" onClick={exportData}><Download/> Eksportuj backup</button><button className="secondary full" onClick={()=>importRef.current?.click()}><Upload/> Przywróć backup</button></div><input ref={importRef} hidden type="file" accept="application/json" onChange={importData}/></section></div>}
}

function ManualWeek({onToggle,completedSet,today}){
  const start=startWeek(new Date());
  const days=Array.from({length:7},(_,index)=>{const date=new Date(start);date.setDate(start.getDate()+index);return{date:dateStr(date),day:date.toLocaleDateString("pl-PL",{weekday:"short"}).replace(".",""),num:date.getDate()}});
  return <section className="card manual-week"><SectionTitle eyebrow="RĘCZNE OZNACZENIE" title="Odbyte treningi"/><p className="manual-help">Zaznacz dzień, jeśli trening odbył się poza aplikacją.</p><div className="manual-days">{days.map(day=><button key={day.date} className={completedSet.has(day.date)?"checked":""} onClick={()=>onToggle(day.date)}><small>{day.day}</small><b>{day.num}</b>{completedSet.has(day.date)&&<Check size={14}/>} {day.date===today&&<em>DZIŚ</em>}</button>)}</div></section>
}
function BodyMap({latest,previous,bodyDelta}){
  const measurements=[
    ["Klatka","chest","cm","chest-point"],["Biceps","arm","cm","arm-point"],["Pas","waist","cm","waist-point"],["Udo","thigh","cm","thigh-point"]
  ];
  const change=field=>previous[field]===undefined?"Nowy":`${bodyDelta(field)>0?"+":""}${bodyDelta(field)||0} cm`;
  return <section className="card body-map-card"><SectionTitle eyebrow="SYLWETKA" title="Twoje wymiary"/><p className="body-map-help">Aktualne wartości i zmiana względem poprzedniego pomiaru.</p><div className="body-map"><img src="/body.png" alt="Sylwetka ciała" onError={event=>{event.currentTarget.style.display="none";event.currentTarget.nextElementSibling.style.display="block"}}/><svg className="body-fallback" viewBox="0 0 180 300" role="img" aria-label="Sylwetka ciała"><circle cx="90" cy="28" r="19"/><path d="M72 53c-13 12-17 38-13 67l12 3 2 72-12 88h22l7-83 7 83h22l-12-88 2-72 12-3c4-29 0-55-13-67-9 6-17 6-26 0Z"/><path d="M61 70 24 145M119 70l37 75"/><path d="M59 120h62"/></svg>{latest.weight>0&&<div className="body-label weight-point"><b>{latest.weight} kg</b><small>Waga</small><span>{previous.weight===undefined?"Nowy":`${bodyDelta("weight")>0?"+":""}${bodyDelta("weight")} kg`}</span></div>}{measurements.map(([label,field,unit,position])=><div className={`body-label ${position}`} key={field}><b>{latest[field]||0} {unit}</b><small>{label}</small><span>{change(field)}</span></div>)}</div></section>
}
function StrengthChart({history}){
  const points=history.slice(0,8).reverse();
  const max=Math.max(1,...points.map(item=>Number(item.totalWeight)||0));
  return <section className="card strength-chart"><SectionTitle eyebrow="WYKRES" title="Tonaż treningów"/><p>Porównaj obciążenie z ostatnich sesji.</p>{points.length?<div className="chart-bars">{points.map(item=><div className="chart-column" key={item.id}><span>{number(item.totalWeight)} kg</span><i style={{height:`${Math.max(6,(Number(item.totalWeight)||0)/max*100)}%`}}/><small>{fmtDate(item.date)}</small></div>)}</div>:<div className="empty">Zapisz kilka treningów, aby zobaczyć wykres.</div>}</section>
}
function Metric({label,value,icon,accent}){return <div className={`metric ${accent?"accent":""}`}>{icon&&React.cloneElement(icon,{size:17})}<small>{label}</small><strong>{value}</strong></div>}
function SectionTitle({eyebrow,title}){return <div className="section-title"><div><small>{eyebrow}</small><h2>{title}</h2></div></div>}
function PageTitle({eyebrow,title,desc}){return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{desc&&<p>{desc}</p>}</div></div>}
function Modal({title,eyebrow,close,children}){return <div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal"><div className="modal-head"><div><small>{eyebrow}</small><h2>{title}</h2></div><button className="icon-btn" onClick={close}><X/></button></div>{children}</div></div>}
function Toast({data}){return data?<div className={`toast ${data.tone||""}`}>{data.message}</div>:null}

export default App;
