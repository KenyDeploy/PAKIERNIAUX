import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Check,
  Clock3,
  Dumbbell,
  Droplets,
  Flame,
  History,
  LayoutDashboard,
  ListPlus,
  Plus,
  Search,
  Settings2,
  Target,
  Trophy,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
  Medal,
  Ruler,
  Weight,
  Pause,
  RotateCcw,
  SkipForward,
  Pencil,
  Trash2,
} from "lucide-react";
import "./styles.css";
import { supabase } from "./supabase";

const starterExercises = [
  {
    id: 1,
    category: "Klatka",
    equipment: "Hantle",
    sets: 3,
    reps: 8,
    rest: 120,
    color: "lime",
  },
  {
    id: 2,
    name: "Ściąganie drążka wyciągu",
    category: "Plecy",
    equipment: "Wyciąg",
    sets: 3,
    reps: 10,
    rest: 120,
    color: "blue",
  },
  {
    id: 3,
    name: "Przysiad ze sztangą",
    category: "Nogi",
    equipment: "Sztanga",
    sets: 4,
    reps: 6,
    rest: 150,
    color: "orange",
  },
  {
    id: 4,
    name: "Wyciskanie żołnierskie",
    category: "Barki",
    equipment: "Sztanga",
    sets: 3,
    reps: 8,
    rest: 120,
    color: "violet",
  },
  {
    id: 5,
    name: "Uginanie przedramion z hantlami",
    category: "Biceps",
    equipment: "Hantle",
    sets: 3,
    reps: 12,
    rest: 60,
    color: "yellow",
  },
  {
    id: 6,
    name: "Prostowanie ramion na wyciągu",
    category: "Triceps",
    equipment: "Wyciąg",
    sets: 3,
    reps: 12,
    rest: 60,
    color: "red",
  },
];
const initialPlans = [
  {
    id: 1,
    name: "Upper Body Power",
    days: "Pon · Czw",
    duration: "45 min",
    exercises: [1, 2, 4, 5],
    color: "lime",
  },
  {
    id: 2,
    name: "Lower Body Strength",
    days: "Wt · Pt",
    duration: "50 min",
    exercises: [3, 6],
    color: "orange",
  },
];
const measurementSeed = [
  { date: "Dzisiaj", weight: 86.3, biceps: 37, chest: 104, waist: 84, thigh: 59 },
  { date: "2 tyg. temu", weight: 87.1, biceps: 36.5, chest: 103, waist: 86, thigh: 59.5 },
  { date: "4 tyg. temu", weight: 88.0, biceps: 36, chest: 102, waist: 88, thigh: 60 },
];
const history = [
  {
    date: "Dzisiaj",
    name: "Upper Body Power",
    duration: "42 min",
    volume: "4 280 kg",
    exercises: "4 ćwiczenia",
  },
  {
    date: "Wt, 1 kwi",
    name: "Lower Body Strength",
    duration: "49 min",
    volume: "6 120 kg",
    exercises: "5 ćwiczeń",
  },
  {
    date: "Sob, 29 mar",
    name: "Upper Body Power",
    duration: "44 min",
    volume: "4 050 kg",
    exercises: "4 ćwiczenia",
  },
];
const lastPerformance = {
  "Wyciskanie hantli na skosie": {
    weight: "25 kg",
    reps: "8",
    sets: "3",
    volume: "600 kg",
    date: "29 mar",
  },
  "Ściąganie drążka wyciągu": {
    weight: "55 kg",
    reps: "10",
    sets: "3",
    volume: "1 650 kg",
    date: "29 mar",
  },
  "Wyciskanie żołnierskie": {
    weight: "32.5 kg",
    reps: "8",
    sets: "3",
    volume: "780 kg",
    date: "29 mar",
  },
  "Uginanie przedramion z hantlami": {
    weight: "14 kg",
    reps: "12",
    sets: "3",
    volume: "504 kg",
    date: "29 mar",
  },
};

function IconButton({ children, label, onClick }) {
  return (
    <button
      className="icon-button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function MoreDots() {
  return <span className="more-dots">•••</span>;
}
function ProgressRing({ value }) {
  return (
    <div
      className="progress-ring"
      style={{ "--progress": `${value * 3.6}deg` }}
    >
      <strong>{value}%</strong>
      <span>cel dnia</span>
    </div>
  );
}
function formatDuration(totalSeconds) {
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
}
function loadList(key, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(stored) && stored.length > 0 ? stored : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [cloudHydrated, setCloudHydrated] = useState(!supabase);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [water, setWater] = useState(() => Number(localStorage.getItem("pakiernia.water") || 0.8));
  const [waterLog, setWaterLog] = useState(() => JSON.parse(localStorage.getItem("pakiernia.waterLog") || "[1.8,2,1.5,2.2,0.8,0,0]"));
  const [completedDays, setCompletedDays] = useState(() => JSON.parse(localStorage.getItem("pakiernia.completedDays") || "[1,3,5]"));
  const [activePlan, setActivePlan] = useState(initialPlans[0]);
  const [plans, setPlans] = useState(() => loadList("pakiernia.plans", initialPlans).map((plan) => ({ ...plan, exercises: Array.isArray(plan.exercises) ? plan.exercises : [] })));
  const [exercises, setExercises] = useState(() => loadList("pakiernia.exercises", starterExercises));
  const [exerciseEditor, setExerciseEditor] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Wszystkie");
  const [modal, setModal] = useState(null);
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "Klatka",
    equipment: "Hantle",
  });
  const [doneSets, setDoneSets] = useState({ 0: true });
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutStartedAt, setWorkoutStartedAt] = useState(null);
  const [elapsedWorkoutSeconds, setElapsedWorkoutSeconds] = useState(0);
  const [planEditor, setPlanEditor] = useState(null);
  const [measurements, setMeasurements] = useState(measurementSeed);
  const [measurementForm, setMeasurementForm] = useState({
    weight: "",
    biceps: "",
    chest: "",
    waist: "",
    thigh: "",
  });
  const loadCloudData = async (userId) => {
    try {
      const request = supabase.from("user_data").select("data").eq("user_id", userId).maybeSingle();
      const result = await Promise.race([request, new Promise((resolve) => setTimeout(() => resolve({ data: null, error: new Error("Supabase timeout") }), 8000))]);
      if (!result.error && result.data?.data) {
        const saved = result.data.data;
        if (typeof saved.water === "number") setWater(saved.water);
        if (Array.isArray(saved.waterLog)) setWaterLog(saved.waterLog);
        if (Array.isArray(saved.completedDays)) setCompletedDays(saved.completedDays);
        if (Array.isArray(saved.plans)) setPlans(saved.plans);
        if (Array.isArray(saved.exercises)) setExercises(saved.exercises);
        if (Array.isArray(saved.measurements)) setMeasurements(saved.measurements);
      }
    } catch (error) {
      console.error("Supabase profile load failed", error);
    } finally {
      setCloudHydrated(true);
      setAuthLoading(false);
    }
  };
  useEffect(() => {
    if (!supabase) return undefined;
    let mounted = true;
    const sessionTimeout = setTimeout(() => setAuthLoading(false), 8000);
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAuthUser(data.session?.user ?? null);
      if (data.session?.user) loadCloudData(data.session.user.id);
      else setAuthLoading(false);
    }).catch((error) => { console.error("Supabase session load failed", error); setAuthLoading(false); }).finally(() => clearTimeout(sessionTimeout));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) loadCloudData(session.user.id);
      else { setCloudHydrated(false); setAuthLoading(false); }
    });
    return () => { mounted = false; clearTimeout(sessionTimeout); listener.subscription.unsubscribe(); };
  }, []);
  const filteredExercises = useMemo(
    () =>
      exercises.filter(
        (exercise) =>
          `${exercise.name} ${exercise.category} ${exercise.equipment}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (category === "Wszystkie" || exercise.category === category),
      ),
    [exercises, query, category],
  );
  const openWorkout = (plan = activePlan) => {
    setActivePlan(plan);
    setActiveExerciseIndex(0);
    setDoneSets({});
    setWorkoutStartedAt(Date.now());
    setElapsedWorkoutSeconds(0);
    setTab("workout");
  };
  const currentExercise =
    exercises.find(
      (item) => item.id === activePlan.exercises[activeExerciseIndex],
    ) || exercises[0];
  const toggleSet = (index) => {
    setDoneSets((current) => ({ ...current, [index]: !current[index] }));
    if (!doneSets[index] && currentExercise) {
      setRestSeconds(currentExercise.rest);
      setIsResting(true);
    }
  };
  useEffect(() => {
    if (!isResting || restSeconds <= 0) return undefined;
    const timer = setInterval(() => setRestSeconds((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [isResting, restSeconds]);
  useEffect(() => { localStorage.setItem("pakiernia.water", String(water)); localStorage.setItem("pakiernia.waterLog", JSON.stringify(waterLog)); }, [water, waterLog]);
  useEffect(() => { localStorage.setItem("pakiernia.completedDays", JSON.stringify(completedDays)); }, [completedDays]);
  useEffect(() => { localStorage.setItem("pakiernia.plans", JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem("pakiernia.exercises", JSON.stringify(exercises)); }, [exercises]);
  useEffect(() => {
    if (!supabase || !authUser || !cloudHydrated) return undefined;
    const payload = { water, waterLog, completedDays, plans, exercises, measurements };
    const timer = setTimeout(() => { supabase.from("user_data").upsert({ user_id: authUser.id, data: payload, updated_at: new Date().toISOString() }).then(({ error }) => { if (error) console.error("Cloud sync failed", error); }); }, 450);
    return () => clearTimeout(timer);
  }, [authUser, cloudHydrated, water, waterLog, completedDays, plans, exercises, measurements]);
  useEffect(() => {
    if (!workoutStartedAt || tab !== "workout") return undefined;
    const timer = setInterval(() => setElapsedWorkoutSeconds(Math.floor((Date.now() - workoutStartedAt) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [workoutStartedAt, tab]);
  useEffect(() => {
    if (isResting && restSeconds === 0) setIsResting(false);
  }, [isResting, restSeconds]);
  const addExercise = (event) => {
    event.preventDefault();
    if (!newExercise.name.trim()) return;
    setExercises((current) => [
      ...current,
      { ...newExercise, id: Date.now(), sets: 3, reps: 10, color: "lime" },
    ]);
    setNewExercise({ name: "", category: "Klatka", equipment: "Hantle" });
    setModal(null);
  };
  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthError("");
    const result = authMode === "login" ? await supabase.auth.signInWithPassword(authForm) : await supabase.auth.signUp(authForm);
    if (result.error) setAuthError(result.error.message);
    else if (authMode === "signup" && !result.data.session) setAuthError("Sprawdź email, aby potwierdzić konto.");
  };
  const signOut = () => supabase?.auth.signOut();
  const addPlan = () => {
    const plan = {
      id: Date.now(),
      name: `Nowy plan ${plans.length + 1}`,
      days: "Do ustawienia",
      duration: "30 min",
      exercises: [1],
      color: "blue",
    };
    setPlans((current) => [...current, plan]);
    setPlanEditor(plan);
  };
  const savePlan = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const updated = {
      ...planEditor,
      name: form.get("name") || planEditor.name,
      days: form.get("days") || "Do ustawienia",
      exercises: planEditor.exercises,
    };
    setPlans((current) =>
      current.map((plan) => (plan.id === updated.id ? updated : plan)),
    );
    setActivePlan(updated);
    setPlanEditor(null);
  };
  const addExerciseToPlan = (exerciseId) =>
    setPlanEditor((current) =>
      current.exercises.includes(exerciseId)
        ? current
        : { ...current, exercises: [...current.exercises, exerciseId] },
    );
  const removeExerciseFromPlan = (exerciseId) =>
    setPlanEditor((current) => ({
      ...current,
      exercises: current.exercises.filter((id) => id !== exerciseId),
    }));
  const saveMeasurement = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entry = {
      date: "Dzisiaj",
      weight: Number(form.get("weight")),
      biceps: Number(form.get("biceps")),
      chest: Number(form.get("chest")),
      waist: Number(form.get("waist")),
      thigh: Number(form.get("thigh")),
    };
    setMeasurements((current) => [entry, ...current]);
    setMeasurementForm({ weight: "", biceps: "", chest: "", waist: "", thigh: "" });
  };
  const saveRest = (event, exerciseId) => {
    event.preventDefault();
    const seconds = Number(new FormData(event.currentTarget).get("rest"));
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, rest: seconds } : exercise,
      ),
    );
    setModal(null);
  };
  const saveExercise = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const updated = { ...exerciseEditor, name: form.get("name"), category: form.get("category"), equipment: form.get("equipment") };
    setExercises((current) => current.map((exercise) => exercise.id === updated.id ? updated : exercise));
    setExerciseEditor(null);
  };
  const toggleTrainingDay = (day) => {
    setCompletedDays((current) => {
      const alreadyCompleted = current.includes(day);
      return alreadyCompleted ? current.filter((item) => item !== day) : [...current, day];
    });
  };
  const finishWorkout = () => { const today = new Date().getDate(); if (!completedDays.includes(today)) setCompletedDays((current) => [...current, today]); setIsResting(false); setTab("history"); };
  const deleteExercise = (exerciseId) => {
    setExercises((current) => current.filter((exercise) => exercise.id !== exerciseId));
    setPlans((current) => current.map((plan) => ({ ...plan, exercises: plan.exercises.filter((id) => id !== exerciseId) })));
  };
  const nav = [
    { id: "home", label: "Pulpit", icon: LayoutDashboard },
    { id: "plans", label: "Plany", icon: ListPlus },
    { id: "exercises", label: "Baza", icon: Dumbbell },
    { id: "history", label: "Historia", icon: History },
    { id: "stats", label: "Postęp", icon: BarChart3 },
    { id: "body", label: "Pomiary", icon: Ruler },
  ];
  const weekWater = waterLog;
  const calendarNow = new Date();
  const calendarMonthName = calendarNow.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
  const calendarLeadingDays = (new Date(calendarNow.getFullYear(), calendarNow.getMonth(), 1).getDay() + 6) % 7;
  const calendarDays = [...Array(calendarLeadingDays).fill(null), ...Array.from({ length: new Date(calendarNow.getFullYear(), calendarNow.getMonth() + 1, 0).getDate() }, (_, index) => index + 1)];
  const referenceWeekDay = completedDays.length > 0 ? Math.max(...completedDays) : calendarNow.getDate();
  const referenceWeekDate = new Date(calendarNow.getFullYear(), calendarNow.getMonth(), referenceWeekDay);
  const currentWeekDayNumbers = Array.from({ length: 7 }, (_, index) => referenceWeekDay - ((referenceWeekDate.getDay() + 6) % 7) + index);
  const currentWeekCompletion = currentWeekDayNumbers.map((day) => day > 0 && completedDays.includes(day));
  const currentStreak = (() => {
    const selectedDays = [...new Set(completedDays)].sort((first, second) => first - second);
    let longest = 0;
    let current = 0;
    selectedDays.forEach((day, index) => {
      current = index > 0 && day === selectedDays[index - 1] + 1 ? current + 1 : 1;
      longest = Math.max(longest, current);
    });
    return longest;
  })();
  const streakMessage = currentStreak === 0 ? "Brak treningu dzisiaj · passa zresetowana" : `${currentStreak} dni bez przerwy`;
  const weekChartHeights = currentWeekCompletion.map((done, index) => done ? 88 + (index % 3) * 4 : 18);
  const changeWater = (amount) => {
    const next = Math.max(0, Math.min(2, Number((water + amount).toFixed(1))));
    setWater(next);
    setWaterLog((current) => current.map((value, index) => index === 4 ? next : value));
  };

  if (supabase && authLoading) return <div className="auth-screen"><div className="auth-card"><span className="brand-mark"><Zap size={20} fill="currentColor" /></span><h1>Ładowanie profilu</h1><p>Sprawdzam Twoje dane treningowe.</p></div></div>;
  if (supabase && !authUser) return <div className="auth-screen"><form className="auth-card" onSubmit={submitAuth}><span className="brand-mark"><Zap size={20} fill="currentColor" /></span><span className="eyebrow">PAKIERNIA U MATIEGO</span><h1>{authMode === "login" ? "Wróć do swojego progresu" : "Załóż konto"}</h1><p>{authMode === "login" ? "Zaloguj się, aby mieć swoje plany, wyniki i odznaki na każdym urządzeniu." : "Twoje treningi i pomiary będą prywatne i zsynchronizowane."}</p><label>Email<input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required /></label><label>Hasło<input type="password" minLength={6} value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required /></label>{authError && <div className="auth-error">{authError}</div>}<button className="primary-cta" type="submit">{authMode === "login" ? "Zaloguj się" : "Utwórz konto"}</button><button className="auth-switch" type="button" onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>{authMode === "login" ? "Nie mam jeszcze konta" : "Mam już konto"}</button></form></div>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("home")}>
          <span className="brand-mark">
            <Zap size={18} fill="currentColor" />
          </span>
          <span>
            <b>PAKIERNIA</b>
            <small>U MATIEGO</small>
          </span>
        </button>
        <div className="top-actions">
          <span className="status-dot" />
          <IconButton label={supabase ? "Wyloguj" : "Ustawienia"} onClick={supabase ? signOut : undefined}>
            <Settings2 size={18} />
          </IconButton>
        </div>
      </header>
      <main className="content">
        {tab === "home" && (
          <>
            <section className="hero-panel">
              <div>
                <span className="eyebrow">ŚRODA · 2 KWIETNIA</span>
                <h1>Witaj, Mati.</h1>
                <p>Twój kolejny krok zaczyna się od jednej serii.</p>
              </div>
              <div className="hero-orbit">
                <Dumbbell size={28} />
                <span>
                  TRENINGI
                  <br />
                  <b>{completedDays.length}</b>
                </span>
              </div>
            </section>
            <section className="section-heading">
              <div>
                <span className="eyebrow">DZISIAJ NA PLANIE</span>
                <h2>{activePlan.name}</h2>
              </div>
              <button className="text-button" onClick={() => setTab("plans")}>
                Zmień plan <ChevronRight size={16} />
              </button>
            </section>
            <button className="primary-cta" onClick={() => openWorkout()}>
              <span className="cta-icon">
                <Zap size={20} fill="currentColor" />
              </span>
              <span>
                <b>Rozpocznij trening</b>
                <small>
                  {activePlan.exercises.length} ćwiczenia ·{" "}
                  {activePlan.duration}
                </small>
              </span>
              <ArrowRight size={20} />
            </button>
            <div className="metric-grid">
              <section className="water-card card">
                <div className="card-head">
                  <div className="metric-icon blue-bg">
                    <Droplets size={18} />
                  </div>
                  <span className="eyebrow">NAWODNIENIE</span>
                  <b>
                    {water.toFixed(1)}
                    <small> / 2.0 L</small>
                  </b>
                </div>
                <div className="water-today-meter">
                  <div className="water-today-label"><span>DZIŚ</span><b>{Math.round((water / 2) * 100)}%</b></div>
                  <div className="water-today-track"><span style={{ width: `${Math.min(100, (water / 2) * 100)}%` }} /></div>
                </div>
                <div className="water-days">
                  {weekWater.map((value, index) => (
                    <span key={index} className={index === 4 ? "today" : ""}>
                      <i style={{ "--day-fill": `${Math.min(100, (value / 2) * 100)}%` }} />
                      {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"][index]}
                    </span>
                  ))}
                </div>
                <div className="water-actions">
                  <button onClick={() => changeWater(-0.2)}>
                    − 0.2 L
                  </button>
                  <button
                    className="water-add"
                    onClick={() => changeWater(0.2)}
                  >
                    <Plus size={15} /> szklanka
                  </button>
                </div>
              </section>
              <section className="streak-card card">
                <div className="card-head">
                  <div className="metric-icon orange-bg">
                    <Flame size={18} />
                  </div>
                  <span className="eyebrow">PASSA</span>
                </div>
                <strong>{currentStreak}</strong>
                <span className="muted">dni z rzędu</span>
                <div className="mini-bars">
                  {currentWeekCompletion.map((done, index) => (
                    <i key={index} className={done ? "completed" : ""} style={{ height: `${weekChartHeights[index]}%` }} />
                  ))}
                </div>
                <span className={currentStreak === 0 ? "streak-reset" : "success-text"}>{streakMessage}</span>
              </section>
            </div>
            <section className="section-heading compact">
              <div>
                <span className="eyebrow">SZYBKI PODGLĄD</span>
                <h2>Twój tydzień</h2>
              </div>
              <button className="icon-button" onClick={() => setTab("stats")}>
                <ArrowRight size={18} />
              </button>
            </section>
            <section className="card week-card">
              <div className="week-chart">
                {weekChartHeights.map((height, index) => (
                  <div
                    key={index}
                    className={currentWeekCompletion[index] ? "chart-day active" : "chart-day"}
                  >
                    <span style={{ height: `${height}%` }} />
                    <small>
                      {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"][index]}
                    </small>
                  </div>
                ))}
              </div>
              <div className="chart-footer">
                <span>
                  <i className="legend lime" /> Objętość treningowa
                </span>
                <b>
                  +18.4% <TrendingUp size={14} />
                </b>
              </div>
            </section>
            <section className="card workout-calendar">
              <div className="card-head"><div><span className="eyebrow">KALENDARZ TRENINGÓW</span><h2>{calendarMonthName}</h2></div><CalendarDays size={20} /></div>
              <div className="calendar-week-labels">{["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((day) => <span key={day}>{day}</span>)}</div>
              <div className="calendar-month-grid">{calendarDays.map((day, index) => day === null ? <span className="calendar-day-empty" key={`empty-${index}`} /> : <button type="button" className={completedDays.includes(day) ? "calendar-day done" : "calendar-day"} key={day} onClick={() => toggleTrainingDay(day)}><b>{day}</b>{completedDays.includes(day) && <Check size={12} />}</button>)}</div>
              <div className="calendar-caption"><span><i className="calendar-dot done" /> kliknij dzień, aby oznaczyć trening</span><strong>{completedDays.length} dni wykonanych</strong></div>
            </section>
            <section className="achievement-banner">
              <div className="badge">
                <Trophy size={20} />
              </div>
              <div>
                <span className="eyebrow">NASTĘPNE OSIĄGNIĘCIE</span>
                <b>Pierwszy tydzień</b>
                <small>Jeszcze 2 treningi do odznaki</small>
              </div>
              <Target size={20} />
            </section>
          </>
        )}
        {tab === "plans" && (
          <>
            <div className="page-heading">
              <span className="eyebrow">TWOJA ORGANIZACJA</span>
              <h1>Plany treningowe</h1>
              <p>Buduj rutynę, do której chce się wracać.</p>
            </div>
            <button className="secondary-cta" onClick={addPlan}>
              <Plus size={18} /> Utwórz nowy plan
            </button>
            <div className="plan-list">
              {plans.length === 0 && <div className="empty-state">Nie masz jeszcze planu. Utwórz pierwszy powyżej.</div>}
              {plans.filter(Boolean).map((plan) => {
                const planExercises = Array.isArray(plan.exercises) ? plan.exercises : [];
                return (
                <section className={`plan-card ${plan.color}`} key={plan.id}>
                  <div className="plan-top">
                    <span className="plan-symbol">
                      <Dumbbell size={19} />
                    </span>
                    <span className="eyebrow">{plan.days}</span>
                    <IconButton
                      label="Edytuj plan"
                      onClick={() => setPlanEditor(plan)}
                    >
                      <Settings2 size={16} />
                    </IconButton>
                  </div>
                  <h2>{plan.name}</h2>
                  <p>
                    {planExercises.length} ćwiczenia <span>·</span>{" "}
                    {plan.duration}
                  </p>
                  <div className="plan-exercises">
                    {planExercises.map((id) => (
                      <span key={id}>
                        {
                          exercises
                            .find((exercise) => exercise.id === id)
                            ?.name?.split(" ")[0]
                        }
                      </span>
                    ))}
                  </div>
                  <button
                    className="plan-start"
                    onClick={() => openWorkout(plan)}
                  >
                    <Zap size={15} fill="currentColor" /> Rozpocznij
                  </button>
                </section>
                );
              })}
            </div>
          </>
        )}
        {tab === "exercises" && (
          <>
            <div className="page-heading row-heading">
              <div>
                <span className="eyebrow">TWOJA BAZA</span>
                <h1>Ćwiczenia</h1>
                <p>{exercises.length} ćwiczeń gotowych do użycia.</p>
              </div>
              <button
                className="round-add"
                onClick={() => setModal("exercise")}
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Szukaj ćwiczenia..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="category-scroll">
              {["Wszystkie", "Klatka", "Plecy", "Nogi", "Barki", "Ramiona"].map(
                (item) => (
                  <button
                    key={item}
                    className={category === item ? "selected" : ""}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <div className="exercise-list">
              {filteredExercises.map((exercise) => (
                <section
                  className="exercise-row"
                  key={exercise.id}
                  onClick={() => setModal(`rest-${exercise.id}`)}
                >
                  <span className={`exercise-icon ${exercise.color}`}>
                    <Dumbbell size={18} />
                  </span>
                  <div>
                    <b>{exercise.name}</b>
                    <small>
                      {exercise.category} · {exercise.equipment} ·{" "}
                      {exercise.sets} serie × {exercise.reps} · przerwa{" "}
                      {Math.floor(exercise.rest / 60)}:
                      {String(exercise.rest % 60).padStart(2, "0")}
                    </small>
                  </div>
                  <div className="exercise-actions">
                    <button type="button" aria-label="Edytuj ćwiczenie" onClick={(event) => { event.stopPropagation(); setExerciseEditor(exercise); }}><Pencil size={15} /></button>
                    <button type="button" aria-label="Usuń ćwiczenie" onClick={(event) => { event.stopPropagation(); deleteExercise(exercise.id); }}><Trash2 size={15} /></button>
                  </div>
                </section>
              ))}
              {filteredExercises.length === 0 && (
                <div className="empty-state">Nie znaleziono ćwiczeń.</div>
              )}
            </div>
          </>
        )}
        {tab === "workout" && (
          <>
            <div className="workout-header">
              <button className="back-link" onClick={() => setTab("home")}>
                <X size={18} /> Opuść
              </button>
              <div>
                <span className="eyebrow">
                  ĆWICZENIE {activeExerciseIndex + 1} /{" "}
                  {activePlan.exercises.length}
                </span>
                <h1>{activePlan.name}</h1>
              </div>
              <span className="timer">
                <Clock3 size={15} /> {formatDuration(elapsedWorkoutSeconds)}
              </span>
            </div>
            <div className="workout-progress">
              <span
                style={{
                  width: `${((activeExerciseIndex + 1) / activePlan.exercises.length) * 100}%`,
                }}
              />
              <small>
                {activeExerciseIndex + 1} z {activePlan.exercises.length}{" "}
                ćwiczeń
              </small>
            </div>
            {lastPerformance[currentExercise.name] && (
              <section className="last-result-card">
                <div className="last-result-heading">
                  <div>
                    <span className="eyebrow">OSTATNI WYNIK · {lastPerformance[currentExercise.name].date}</span>
                    <h2>{currentExercise.name}</h2>
                  </div>
                  <TrendingUp size={18} />
                </div>
                <div className="last-result-grid">
                  <div><span>SERIE</span><b>{lastPerformance[currentExercise.name].sets}</b></div>
                  <div><span>CIĘŻAR</span><b>{lastPerformance[currentExercise.name].weight}</b></div>
                  <div><span>POWTÓRZENIA</span><b>{lastPerformance[currentExercise.name].reps}</b></div>
                  <div><span>OBJĘTOŚĆ</span><b>{lastPerformance[currentExercise.name].volume}</b></div>
                </div>
                <small className="last-result-note">Cel na dziś: utrzymaj wynik albo dodaj 1 powtórzenie.</small>
              </section>
            )}
            <section className="workout-exercise current-exercise card">
              <div className="exercise-title">
                <span className={`exercise-icon ${currentExercise.color}`}>
                  <Dumbbell size={17} />
                </span>
                <div>
                  <h2>{currentExercise.name}</h2>
                  <small>
                    {currentExercise.category} · cel {currentExercise.reps}{" "}
                    powtórzeń · przerwa {Math.floor(currentExercise.rest / 60)}:
                    {String(currentExercise.rest % 60).padStart(2, "0")}
                  </small>
                </div>
                <MoreDots />
              </div>
              <div className="set-labels">
                <span>SERIA</span>
                <span>KG</span>
                <span>POWT.</span>
                <span />
              </div>
              {Array.from(
                { length: Math.min(3, currentExercise.sets) },
                (_, setIndex) => {
                  const setId = activeExerciseIndex * 3 + setIndex;
                  return (
                    <div
                      className={`set-row ${doneSets[setId] ? "completed" : ""}`}
                      key={setIndex}
                    >
                      <b>{setIndex + 1}</b>
                      <input
                        inputMode="decimal"
                        type="number"
                        step="0.5"
                        defaultValue={setIndex === 0 ? "22.5" : "25"}
                      />
                      <span>kg</span>
                      <input
                        inputMode="numeric"
                        type="number"
                        defaultValue={currentExercise.reps}
                      />
                      <button onClick={() => toggleSet(setId)}>
                        {doneSets[setId] ? <Check size={18} /> : ""}
                      </button>
                    </div>
                  );
                },
              )}
              <button className="add-set">
                <Plus size={15} /> Dodaj serię
              </button>
            </section>
            {isResting && (
              <section className="rest-card">
                <span className="eyebrow">
                  PRZERWA · {currentExercise.name}
                </span>
                <strong>
                  {Math.floor(restSeconds / 60)}:
                  {String(restSeconds % 60).padStart(2, "0")}
                </strong>
                <div>
                  <button onClick={() => setRestSeconds((value) => value + 15)}>
                    +15 s
                  </button>
                  <button onClick={() => setIsResting(false)}>
                    <SkipForward size={15} /> Pomiń
                  </button>
                </div>
              </section>
            )}
            <div className="workout-navigation">
              <button
                className="secondary-cta"
                disabled={activeExerciseIndex === 0}
                onClick={() => setActiveExerciseIndex((value) => value - 1)}
              >
                Poprzednie
              </button>
              {activeExerciseIndex < activePlan.exercises.length - 1 ? (
                <button
                  className="primary-cta"
                  onClick={() => {
                    setIsResting(false);
                    setActiveExerciseIndex((value) => value + 1);
                  }}
                >
                  Następne <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  className="finish-button"
                  onClick={finishWorkout}
                >
                  Zakończ <Check size={17} />
                </button>
              )}
            </div>
          </>
        )}
        {tab === "history" && (
          <>
            <div className="page-heading">
              <span className="eyebrow">DANE, KTÓRE MOTYWUJĄ</span>
              <h1>Historia</h1>
              <p>Każda sesja buduje obraz Twojego progresu.</p>
            </div>
            <div className="history-summary">
              <div>
                <span className="eyebrow">TRENINGI</span>
                <b>12</b>
                <small>łącznie</small>
              </div>
              <div>
                <span className="eyebrow">OBJĘTOŚĆ</span>
                <b>48.2k</b>
                <small>kg w tym miesiącu</small>
              </div>
              <div>
                <span className="eyebrow">ŚREDNIA</span>
                <b>43m</b>
                <small>czas treningu</small>
              </div>
            </div>
            <div className="history-list">
              {history.map((item) => (
                <section className="history-row" key={item.date + item.name}>
                  <div className="history-date">
                    <b>{item.date.split(" ")[0]}</b>
                    <small>{item.date.split(" ").slice(1).join(" ")}</small>
                  </div>
                  <div>
                    <h2>{item.name}</h2>
                    <p>
                      {item.exercises} <span>·</span> {item.duration}
                    </p>
                  </div>
                  <strong>{item.volume}</strong>
                  <ChevronRight size={17} />
                </section>
              ))}
            </div>
          </>
        )}
        {tab === "stats" && (
          <>
            <div className="page-heading">
              <span className="eyebrow">KONSEKWENCJA &gt; MOTYWACJA</span>
              <h1>Twój postęp</h1>
              <p>Małe liczby. Duża różnica po czasie.</p>
            </div>
            <section className="level-card">
              <div className="level-emblem">
                <Medal size={25} />
              </div>
              <div>
                <span className="eyebrow">POZIOM 4 · BUILDER</span>
                <h2>1 240 XP</h2>
                <div className="xp-track">
                  <span style={{ width: "68%" }} />
                </div>
                <small>260 XP do poziomu 5</small>
              </div>
              <strong>68%</strong>
            </section>
            <section className="stats-hero card">
              <div>
                <span className="eyebrow">OBJĘTOŚĆ · OSTATNIE 7 DNI</span>
                <h2>
                  14 280 <small>kg</small>
                </h2>
                <span className="success-text">
                  <TrendingUp size={14} /> +18.4% vs poprzedni tydzień
                </span>
              </div>
              <ProgressRing value={72} />
            </section>
            <section className="card chart-panel">
              <div className="card-head">
                <div>
                  <span className="eyebrow">SIŁA</span>
                  <h2>Najlepsze wyniki</h2>
                </div>
                <span className="period-pill">
                  30 dni <ChevronRight size={14} />
                </span>
              </div>
              {[
                { name: "Przysiad ze sztangą", value: "90 kg", width: "88%" },
                { name: "Wyciskanie hantli", value: "25 kg", width: "76%" },
                { name: "Ściąganie drążka", value: "55 kg", width: "64%" },
              ].map((record) => (
                <div className="record" key={record.name}>
                  <div>
                    <span>{record.name}</span>
                    <b>{record.value}</b>
                  </div>
                  <div className="record-bar">
                    <i style={{ width: record.width }} />
                  </div>
                </div>
              ))}
            </section>
            <section className="card badges-panel">
              <div className="card-head">
                <div>
                  <span className="eyebrow">
                    KOLEKCJA · SREBRO / ZŁOTO / PLATYNA
                  </span>
                  <h2>Odznaki</h2>
                </div>
                <Trophy size={20} />
              </div>
              <div className="badges">
                {[
                  { icon: Flame, label: "Regularność · złoto", done: true },
                  { icon: Zap, label: "Progres ciężaru · srebro", done: true },
                  { icon: Target, label: "Nowy rekord · złoto", done: false },
                  {
                    icon: Activity,
                    label: "12 tygodni · platyna",
                    done: false,
                  },
                ].map(({ icon: BadgeIcon, label, done }) => (
                  <div
                    className={done ? "badge-item earned" : "badge-item"}
                    key={label}
                  >
                    <span>
                      <BadgeIcon size={20} />
                    </span>
                    <small>{label}</small>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
        {tab === "body" && (
          <>
            <div className="page-heading">
              <span className="eyebrow">TWOJE DANE</span>
              <h1>Ciało i pomiary</h1>
              <p>
                Aktualizuj co 2–4 tygodnie i obserwuj kierunek, nie pojedynczy
                dzień.
              </p>
            </div>
            <section className="body-highlight card">
              <div className="metric-icon blue-bg">
                <Weight size={18} />
              </div>
              <div>
                <span className="eyebrow">MASA CIAŁA</span>
                <h2>
                  {measurements[0].weight} <small>kg</small>
                </h2>
                <span className="success-text">
                  <TrendingDown size={14} /> −
                  {(
                    measurements[measurements.length - 1].weight -
                    measurements[0].weight
                  ).toFixed(1)}{" "}
                  kg od pierwszego pomiaru
                </span>
              </div>
              <Ruler size={25} />
            </section>
            <form className="measurement-form card" onSubmit={saveMeasurement}>
              <div className="card-head">
                <div>
                  <span className="eyebrow">NOWY POMIAR</span>
                  <h2>Zapisz aktualny stan</h2>
                </div>
                <CalendarDays size={20} />
              </div>
              <div className="measurement-grid">
                {[
                  ["weight", "Waga", "kg"],
                  ["biceps", "Biceps", "cm"],
                  ["chest", "Klatka", "cm"],
                  ["waist", "Talia", "cm"],
                  ["thigh", "Udo", "cm"],
                ].map(([name, label, unit]) => (
                  <label key={name}>
                    {label}
                    <div>
                      <input
                        name={name}
                        required
                        inputMode="decimal"
                        type="number"
                        step="0.1"
                        placeholder="0"
                      />
                      <span>{unit}</span>
                    </div>
                  </label>
                ))}
              </div>
              <button className="primary-cta" type="submit">
                <Plus size={18} /> Zapisz pomiar
              </button>
            </form>
            <section className="card measurement-history">
              <div className="card-head">
                <div>
                  <span className="eyebrow">ZMIANA W CZASIE</span>
                  <h2>Historia pomiarów</h2>
                </div>
                <TrendingUp size={20} />
              </div>
              <div className="measurement-labels"><span>DATA / WAGA</span><span>BICEPS</span><span>KLATKA</span><span>TALIA</span><span>UDO</span></div>
              {measurements.map((measurement, index) => (
                <div
                  className="measurement-row"
                  key={`${measurement.date}-${index}`}
                >
                  <div>
                    <b>{measurement.date}</b>
                    <small>{measurement.weight} kg</small>
                  </div>
                  <span>{measurement.biceps} cm</span>
                  <span>{measurement.chest} cm</span>
                  <span>{measurement.waist} cm</span>
                  <span>{measurement.thigh} cm</span>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
      <nav className="bottom-nav">
        {nav.map(({ id, label, icon: NavIcon }) => (
          <button
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
            key={id}
          >
            <NavIcon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {planEditor && (
        <div className="modal-backdrop" onClick={() => setPlanEditor(null)}>
          <form
            className="modal plan-editor"
            onSubmit={savePlan}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">EDYCJA PLANU</span>
                <h2>Ułóż swój trening</h2>
              </div>
              <IconButton label="Zamknij" onClick={() => setPlanEditor(null)}>
                <X size={18} />
              </IconButton>
            </div>
            <label>
              Nazwa planu
              <input name="name" defaultValue={planEditor.name} />
            </label>
            <label>
              Dni treningowe
              <input name="days" defaultValue={planEditor.days} />
            </label>
            <div className="editor-label">
              <span className="eyebrow">ĆWICZENIA W PLANIE</span>
              <small>{planEditor.exercises.length} wybranych</small>
            </div>
            <div className="selected-exercises">
              {planEditor.exercises.map((id) => {
                const exercise = exercises.find((item) => item.id === id);
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => removeExerciseFromPlan(id)}
                  >
                    {exercise?.name}
                    <X size={14} />
                  </button>
                );
              })}
            </div>
            <select
              className="exercise-picker"
              onChange={(event) => {
                if (event.target.value)
                  addExerciseToPlan(Number(event.target.value));
                event.target.value = "";
              }}
              defaultValue=""
            >
              <option value="">+ Dodaj ćwiczenie z bazy</option>
              {exercises
                .filter(
                  (exercise) => !planEditor.exercises.includes(exercise.id),
                )
                .map((exercise) => (
                  <option value={exercise.id} key={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
            </select>
            <button className="primary-cta" type="submit">
              <Check size={18} /> Zapisz plan
            </button>
          </form>
        </div>
      )}
      {exerciseEditor && (
        <div className="modal-backdrop" onClick={() => setExerciseEditor(null)}>
          <form className="modal" onSubmit={saveExercise} onClick={(event) => event.stopPropagation()}>
            <div className="modal-head"><div><span className="eyebrow">EDYCJA BAZY</span><h2>Edytuj ćwiczenie</h2></div><IconButton label="Zamknij" onClick={() => setExerciseEditor(null)}><X size={18} /></IconButton></div>
            <label>Nazwa ćwiczenia<input name="name" defaultValue={exerciseEditor.name} required /></label>
            <label>Partia<select name="category" defaultValue={exerciseEditor.category}><option>Klatka</option><option>Plecy</option><option>Nogi</option><option>Barki</option><option>Biceps</option><option>Triceps</option><option>Brzuch</option></select></label>
            <label>Sprzęt<select name="equipment" defaultValue={exerciseEditor.equipment}><option>Hantle</option><option>Sztanga</option><option>Wyciąg</option><option>Masa ciała</option></select></label>
            <button className="primary-cta" type="submit"><Check size={18} /> Zapisz zmiany</button>
          </form>
        </div>
      )}
      {typeof modal === "string" &&
        modal.startsWith("rest-") &&
        (() => {
          const exercise = exercises.find(
            (item) => item.id === Number(modal.replace("rest-", "")),
          );
          return (
            <div className="modal-backdrop" onClick={() => setModal(null)}>
              <form
                className="modal"
                onSubmit={(event) => saveRest(event, exercise.id)}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="modal-head">
                  <div>
                    <span className="eyebrow">USTAWIENIA ĆWICZENIA</span>
                    <h2>{exercise.name}</h2>
                  </div>
                  <IconButton label="Zamknij" onClick={() => setModal(null)}>
                    <X size={18} />
                  </IconButton>
                </div>
                <label>
                  Przerwa między seriami
                  <select name="rest" defaultValue={exercise.rest}>
                    <option value="30">30 sekund</option>
                    <option value="60">1 minuta</option>
                    <option value="90">1:30</option>
                    <option value="120">2 minuty</option>
                    <option value="150">2:30</option>
                    <option value="180">3 minuty</option>
                  </select>
                </label>
                <button className="primary-cta" type="submit">
                  <Check size={18} /> Zapisz przerwę
                </button>
              </form>
            </div>
          );
        })()}
      {modal === "exercise" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <form
            className="modal"
            onSubmit={addExercise}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">WŁASNA BAZA</span>
                <h2>Dodaj ćwiczenie</h2>
              </div>
              <IconButton label="Zamknij" onClick={() => setModal(null)}>
                <X size={18} />
              </IconButton>
            </div>
            <label>
              Nazwa ćwiczenia
              <input
                autoFocus
                value={newExercise.name}
                onChange={(event) =>
                  setNewExercise({ ...newExercise, name: event.target.value })
                }
                placeholder="np. Wznosy bokiem"
              />
            </label>
            <label>
              Partia
              <select
                value={newExercise.category}
                onChange={(event) =>
                  setNewExercise({
                    ...newExercise,
                    category: event.target.value,
                  })
                }
              >
                <option>Klatka</option>
                <option>Plecy</option>
                <option>Nogi</option>
                <option>Barki</option>
                <option>Ramiona</option>
                <option>Brzuch</option>
              </select>
            </label>
            <label>
              Sprzęt
              <select
                value={newExercise.equipment}
                onChange={(event) =>
                  setNewExercise({
                    ...newExercise,
                    equipment: event.target.value,
                  })
                }
              >
                <option>Hantle</option>
                <option>Sztanga</option>
                <option>Wyciąg</option>
                <option>Masa ciała</option>
              </select>
            </label>
            <button className="primary-cta" type="submit">
              <Plus size={18} /> Dodaj do bazy
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
