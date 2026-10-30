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
  Square,
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
import { ActiveSetEditor } from "./ActiveSetEditor";
import { supabase } from "./supabase";
import { catalog, starterExercises } from "./catalog";
import { useTrainingData } from "./useTrainingData";
import { dateKey, number, volume, createSession, completeSession, validSet, trainingAttendance, planName, weekDates, currentStreak as calculateStreak } from "./training";
import { BodyProgress, ExerciseVisual, TrendChart } from "./Visuals";
import { exercisePhotoStyle } from "./exercisePhotos";
import { DialogSheet } from "./DialogSheet";
import { exerciseHistory, historySetLabel } from "./exerciseHistory.js";
import { ExerciseHistorySheet, seriesLabel } from "./ExerciseHistorySheet";
import { SessionExerciseEditor } from "./SessionExerciseEditor";
import { SessionExerciseMenu } from "./SessionExerciseMenu";
import { addSessionExercise, replaceSessionExercise, skipSessionExercise, removeSessionExercise, editSessionTargets, addSessionSet } from "./sessionActions.js";
import { ExercisePhotoField } from "./ExercisePhotoField";

const initialPlans = [
  {
    id: 1,
      name: "Góra ciała — siła",
    days: "Pon · Czw",
    duration: "45 min",
    exercises: [1, 2, 4, 5],
    color: "lime",
  },
  {
    id: 2,
      name: "Dół ciała — siła",
    days: "Wt · Pt",
    duration: "50 min",
    exercises: [3, 6],
    color: "orange",
  },
];
const defaultData = { plans: initialPlans, exercises: [...starterExercises, ...catalog], measurements: [], workouts: [], completedDays: [], waterByDate: {}, activeSession: null };
const displayNumber = value => Number(value || 0).toLocaleString("pl-PL", { maximumFractionDigits: 1 });
const displayDate = value => value && /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? new Date(`${value}T12:00:00`).toLocaleDateString("pl-PL") : typeof value === "number" ? new Date(value).toLocaleDateString("pl-PL") : value || "—";
function IconButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      className="icon-button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
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
export default function App() {
  const [tab, setTab] = useState("home");
  const { data, update, updateData, authUser, authLoading, cloudHydrated, syncStatus, retrySync, signOut } = useTrainingData(defaultData);
  const { plans, exercises, measurements, workouts, completedDays, waterByDate, activeSession } = data;
  const setPlans = value => update("plans", value);
  const setExercises = value => update("exercises", value);
  const setMeasurements = value => update("measurements", value);
  const setCompletedDays = value => update("completedDays", value);
  useEffect(() => { setTab("home"); setModal(null); setWorkoutPanel(null); setPlanEditor(null); setExerciseEditor(null); setSummary(null); setNotice(""); setNewExercise({ name: "", category: "Klatka", equipment: "Hantle" }); setExerciseError(""); }, [authUser?.id]);
  const [notice, setNotice] = useState("");
  const [summary, setSummary] = useState(null);
  const [statsExercise, setStatsExercise] = useState("");
  const [statsRange, setStatsRange] = useState(30);
  const [today, setToday] = useState(dateKey());
  useEffect(() => { const timer = setInterval(() => setToday(dateKey()), 30000); return () => clearInterval(timer); }, []);
  const water = waterByDate[today] || 0;
  const weekWater = weekDates().map(day => waterByDate[day] || 0);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const activePlan = activeSession?.plan || plans.find(p => p.id === selectedPlanId) || plans[0] || { name: "Utwórz plan", exercises: [] };
  const setActivePlan = plan => setSelectedPlanId(plan.id);
  const [exerciseEditor, setExerciseEditor] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Wszystkie");
  const [equipment, setEquipment] = useState("Wszystkie");
  const [modal, setModal] = useState(null);
  const [workoutPanel, setWorkoutPanel] = useState(null);
  const [includeFilled, setIncludeFilled] = useState(false);
  const [finishError, setFinishError] = useState("");
  const [exerciseError, setExerciseError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const openFinishReview = () => { setIncludeFilled(false); setFinishError(""); setModal("finish"); };
  const openExerciseEditor = exercise => { setExerciseError(""); setModal(null); setExerciseEditor({ ...exercise }); };
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "Klatka",
    equipment: "Hantle",
  });
  const activeExerciseIndex = activeSession?.index || 0;
  useEffect(() => {
    if (tab !== "workout") return;
    document.querySelector(".workout-header")?.scrollIntoView?.({ block: "start", behavior: "auto" });
  }, [activeExerciseIndex, activeSession?.id, activeSession?.exercises[activeExerciseIndex]?.id, tab]);
  const setActiveExerciseIndex = value => update("activeSession", current => ({ ...current, index: typeof value === "function" ? value(current.index) : value }));
  const [clockNow, setClockNow] = useState(Date.now);
  const restSeconds = Math.max(0, Math.ceil(((activeSession?.restUntil || 0) - clockNow) / 1000));
  const isResting = restSeconds > 0;
  const workoutStartedAt = activeSession?.startedAt;
  const elapsedWorkoutSeconds = Math.max(0, Math.floor((clockNow - (workoutStartedAt || clockNow)) / 1000));
  const [planEditor, setPlanEditor] = useState(null);
  const filteredExercises = useMemo(
    () =>
      exercises.filter(
        (exercise) =>
          `${exercise.name} ${exercise.category} ${exercise.equipment}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (category === "Wszystkie" || exercise.category === category) &&
          (equipment === "Wszystkie" || exercise.equipment === equipment),
      ),
    [exercises, query, category, equipment],
  );
  const openWorkout = (plan = activePlan) => {
    if (activeSession) { setTab("workout"); return; }
    const session = createSession(plan, exercises, workouts);
    if (!session) { setNotice("Dodaj ćwiczenia do planu przed rozpoczęciem."); setTab("plans"); return; }
    update("activeSession", session);
    setClockNow(Date.now()); setSummary(null); setNotice(""); setTab("workout");
  };
  const currentExercise = activeSession?.exercises[activeExerciseIndex];
  const historyExerciseId = currentExercise?.id;
  const exerciseSessions = useMemo(() => historyExerciseId == null ? [] : exerciseHistory(workouts, historyExerciseId), [workouts, historyExerciseId]);
  const previousExercise = exerciseSessions[0];
  const changeSession = transform => {
    try {
      return updateData(current => {
        if (!current.activeSession || current.activeSession.id !== activeSession?.id || current.activeSession.exercises[activeExerciseIndex]?.id !== currentExercise?.id) throw new Error("Sesja zmieniła się. Otwórz ponownie opcje ćwiczenia.");
        return { ...current, activeSession: transform(current.activeSession) };
      });
    } catch (cause) { setNotice(cause.message); return false; }
  };
  const setExerciseSkipped = skipped => {
    if (changeSession(session => skipSessionExercise(session, activeExerciseIndex, skipped))) setWorkoutPanel(null);
  };
  const updateSet = (index, field, value) => update("activeSession", session => ({ ...session,
    exercises: session.exercises.map((exercise, i) => i === session.index ? { ...exercise,
      sets: exercise.sets.map((row, j) => j === index ? { ...row, [field]: value, ...(field !== "completed" ? { completed: false } : {}) } : row) } : exercise) }));
  const toggleSet = index => {
    const row = currentExercise.sets[index];
    if (!row.completed && (row.weight === "" || !Number.isFinite(number(row.weight)) || number(row.weight) < 0 || !Number.isInteger(number(row.reps)) || number(row.reps) < 1)) {
      setNotice("Podaj ciężar (0 dla masy ciała) i pełną liczbę powtórzeń większą od zera."); return;
    }
    updateSet(index, "completed", !row.completed); setNotice("");
    if (!row.completed) {
      const now = Date.now();
      setClockNow(now);
      update("activeSession", session => ({ ...session, restUntil: now + (currentExercise.rest ?? 90) * 1000, restExerciseName: currentExercise.name }));
    }
  };
  const addSet = () => changeSession(session => addSessionSet(session, activeExerciseIndex));
  useEffect(() => {
    if (!activeSession || tab !== "workout") return;
    const tick = () => setClockNow(Date.now());
    tick();
    const timer = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", tick); };
  }, [activeSession?.id, tab]);
  const addExercise = (event) => {
    event.preventDefault();
    if (photoBusy) return;
    if (!newExercise.name.trim()) { setExerciseError("Podaj nazwę ćwiczenia."); return; }
    const saved = updateData(current => ({ ...current, exercises: [...current.exercises,
      { ...newExercise, name: newExercise.name.trim(), id: Date.now(), sets: 3, reps: 10, rest: 90, color: "lime" }] }));
    if (!saved) { setExerciseError("Nie udało się zapisać. Zwolnij miejsce na urządzeniu lub usuń zdjęcie i spróbuj ponownie."); return; }
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
  const addPlan = () => {
    const plan = {
      id: Date.now(),
      name: `Nowy plan ${plans.length + 1}`,
      days: "Do ustawienia",
      duration: "30 min",
      exercises: exercises[0] ? [exercises[0].id] : [],
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
      targets: planEditor.targets || {},
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
  const saveMeasurement = event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const entry = { id: crypto.randomUUID(), date: form.get("date"), createdAt: Date.now() };
    for (const key of ["weight", "biceps", "chest", "waist", "thigh"]) {
      const raw = form.get(key); entry[key] = raw === "" ? null : number(raw);
      if (entry[key] !== null && (!Number.isFinite(entry[key]) || entry[key] <= 0)) { setNotice("Pomiary muszą być większe od zera."); return; }
    }
    if (!["weight", "biceps", "chest", "waist", "thigh"].some(key => entry[key] !== null)) { setNotice("Uzupełnij przynajmniej jeden pomiar."); return; }
    setMeasurements(current => [entry, ...current].sort((a, b) => String(b.date).localeCompare(String(a.date)) || (b.createdAt || 0) - (a.createdAt || 0)));
    event.currentTarget.reset(); setNotice("Pomiar zapisany.");
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
    if (photoBusy) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    if (!name) { setExerciseError("Podaj nazwę ćwiczenia."); return; }
    const updated = { ...exerciseEditor, name, category: form.get("category"), equipment: form.get("equipment") };
    const saved = updateData(current => ({ ...current, exercises: current.exercises.map(exercise => exercise.id === updated.id ? updated : exercise) }));
    if (!saved) { setExerciseError("Nie udało się zapisać. Zwolnij miejsce na urządzeniu lub usuń zdjęcie i spróbuj ponownie."); return; }
    setExerciseEditor(null);
  };
  const toggleTrainingDay = day => {
    const key = dateKey(new Date(new Date().getFullYear(), new Date().getMonth(), day));
    if (workouts.some(w => dateKey(w.completedAt) === key)) {
      setNotice("Ten dzień zawiera zapisany trening z seriami. Zmiana kalendarza nie usuwa historii treningów."); return;
    }
    setCompletedDays(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key]);
  };
  const finishWorkout = (includeFilled = false) => {
    const session = activeSession && (includeFilled ? { ...activeSession, exercises: activeSession.exercises.map(e => e.skipped ? e : ({ ...e, sets: e.sets.map(s => ({ ...s, completed: s.completed || (!s.skipped && validSet(s)) })) })) } : activeSession);
    const result = session && completeSession(session);
    if (!result) { setNotice("Zatwierdź przynajmniej jedną serię przed zakończeniem."); return; }
    const saved = updateData(current => ({ ...current,
      workouts: current.workouts.some(w => w.id === result.id) ? current.workouts : [result, ...current.workouts],
      completedDays: [...new Set([...current.completedDays, dateKey(result.completedAt)])], activeSession: null }));
    if (!saved) { setFinishError("Nie udało się zapisać. Trening pozostaje otwarty — zwolnij miejsce i spróbuj ponownie."); return; }
    setModal(null); setSummary(result); setTab("history"); setNotice("");
  };
  const deleteExercise = (exerciseId) => {
    const saved = updateData(current => ({ ...current,
      exercises: current.exercises.filter(exercise => exercise.id !== exerciseId),
      plans: current.plans.map(plan => ({ ...plan, exercises: plan.exercises.filter(id => id !== exerciseId) })) }));
    if (saved) setExerciseEditor(null);
    else setExerciseError("Nie udało się zapisać zmiany. Spróbuj ponownie.");
  };
  const nav = [
    { id: "home", label: "Pulpit", icon: LayoutDashboard },
    { id: "plans", label: "Plany", icon: ListPlus },
    { id: "exercises", label: "Baza", icon: Dumbbell },
    { id: "history", label: "Historia", icon: History },
    { id: "stats", label: "Postęp", icon: BarChart3 },
    { id: "body", label: "Pomiary", icon: Ruler },
  ];
  const calendarNow = new Date();
  const calendarMonthName = calendarNow.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
  const calendarLeadingDays = (new Date(calendarNow.getFullYear(), calendarNow.getMonth(), 1).getDay() + 6) % 7;
  const calendarDays = [...Array(calendarLeadingDays).fill(null), ...Array.from({ length: new Date(calendarNow.getFullYear(), calendarNow.getMonth() + 1, 0).getDate() }, (_, i) => i + 1)];
  const calendarKey = day => dateKey(new Date(calendarNow.getFullYear(), calendarNow.getMonth(), day));
  const week = weekDates();
  const { dates: trainingDates, manualDays, count: trainingCount } = trainingAttendance(workouts, completedDays);
  const completedSetCount = activeSession?.exercises.filter(e => !e.skipped).reduce((sum,e) => sum + e.sets.filter(s => s.completed && !s.skipped && validSet(s)).length, 0) || 0;
  const filledSetCount = activeSession?.exercises.filter(e => !e.skipped).reduce((sum,e) => sum + e.sets.filter(s => !s.skipped && validSet(s)).length, 0) || 0;
  const currentWeekCompletion = week.map(day => trainingDates.includes(day));
  const currentStreak = calculateStreak(trainingDates);
  const streakMessage = currentStreak ? `${currentStreak} dni bez przerwy` : "Każdy trening się liczy. Zadbaj też o odpoczynek.";
  const weekVolumes = week.map(day => workouts.filter(w => dateKey(w.completedAt) === day).reduce((sum, w) => sum + w.volume, 0));
  const weekChartHeights = weekVolumes.map(v => v / Math.max(1, ...weekVolumes) * 100);
  const last7 = workouts.filter(w => w.completedAt >= Date.now() - 7 * 86400000);
  const prior7 = workouts.filter(w => w.completedAt >= Date.now() - 14 * 86400000 && w.completedAt < Date.now() - 7 * 86400000);
  const last7Volume = last7.reduce((sum, w) => sum + w.volume, 0);
  const priorVolume = prior7.reduce((sum, w) => sum + w.volume, 0);
  const weekChange = priorVolume > 0 ? `${displayNumber((last7Volume / priorVolume - 1) * 100)}% vs poprzednie 7 dni` : "Brak poprzedniego okresu do porównania";
  const history = [...workouts.map(w => ({ ...w, day: dateKey(w.completedAt), date: displayDate(w.completedAt), duration: `${Math.floor(w.durationSeconds / 60)} min`, name: planName(w.plan.name), volume: `${displayNumber(w.volume)} kg`, exercises: `${w.exercises.length} ćwiczeń` })),
    ...manualDays.map(day => ({ id: `manual-${day}`, day, date: displayDate(day), name: "Trening oznaczony ręcznie", manual: true }))].sort((a,b) => b.day.localeCompare(a.day) || (b.completedAt || 0) - (a.completedAt || 0));
  const monthVolume = workouts.filter(w => dateKey(w.completedAt).slice(0,7) === today.slice(0,7)).reduce((sum,w) => sum + w.volume, 0);
  const records = [...new Map(workouts.flatMap(w => w.exercises.map(e => [e.id, { id: e.id, name: e.name }]))).values()].map(e => ({ ...e, weight: Math.max(0, ...workouts.flatMap(w => w.exercises.filter(x => x.id === e.id).flatMap(x => x.sets.map(s => number(s.weight))))) }));
  const chartExerciseId = statsExercise || String(records[0]?.id || "");
  const strengthPoints = [...workouts].reverse().filter(w => w.completedAt >= Date.now() - statsRange * 86400000).flatMap(w => w.exercises.filter(e => String(e.id) === chartExerciseId).map(e => ({ date: displayDate(w.completedAt), value: Math.max(...e.sets.map(s => number(s.weight))) })));
  const changeWater = amount => update("waterByDate", current => ({ ...current, [today]: Math.max(0, Number(((current[today] || 0) + amount).toFixed(1))) }));
  if (supabase && authLoading) return <div className="auth-screen"><div className="auth-card"><span className="brand-mark"><Zap size={20} fill="currentColor" /></span><h1>Ładowanie profilu</h1><p>Sprawdzam Twoje dane treningowe.</p></div></div>;
  if (supabase && !authUser) return <div className="auth-screen"><form className="auth-card" onSubmit={submitAuth}><span className="brand-mark"><Zap size={20} fill="currentColor" /></span><span className="eyebrow">PAKIERNIA U MATIEGO</span><h1>{authMode === "login" ? "Wróć do swojego progresu" : "Załóż konto"}</h1><p>{authMode === "login" ? "Zaloguj się, aby mieć swoje plany, wyniki i odznaki na każdym urządzeniu." : "Twoje treningi i pomiary będą prywatne i zsynchronizowane."}</p><label>Email<input type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} required /></label><label>Hasło<input type="password" minLength={6} value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} required /></label>{authError && <div className="auth-error">{authError}</div>}<button className="primary-cta" type="submit">{authMode === "login" ? "Zaloguj się" : "Utwórz konto"}</button><button className="auth-switch" type="button" onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>{authMode === "login" ? "Nie mam jeszcze konta" : "Mam już konto"}</button></form></div>;

  return (
    <div className={`app-shell${tab === "workout" ? " is-workout" : ""}`}>
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
        <div className="sync-status" role="status">{syncStatus}{supabase && <button type="button" onClick={retrySync}>Synchronizuj</button>}</div>
        {supabase && !cloudHydrated && <section className="card"><p>Nie wczytano danych konta. Ponów połączenie przyciskiem powyżej.</p></section>}
        {notice && <div className="notice" role="status">{notice}<button type="button" aria-label="Zamknij komunikat" onClick={() => setNotice("")}>×</button></div>}
        {cloudHydrated && activeSession && tab !== "workout" && <button className="secondary-cta" onClick={() => setTab("workout")}>Wznów rozpoczęty trening <ArrowRight size={16} /></button>}
        {(!supabase || cloudHydrated) && <>

        {tab === "home" && (
          <>
            <section className="hero-panel">
              <div>
                <span className="eyebrow">{new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}</span>
                <h1>Czas na Twój trening.</h1>
                <p>Twój kolejny krok zaczyna się od jednej serii.</p>
              </div>
              <div className="hero-orbit">
                <Dumbbell size={28} />
                <span>
                  TRENINGI
                  <br />
                  <b data-testid="training-count">{trainingCount}</b>
                </span>
              </div>
            </section>
            <section className="section-heading">
              <div>
                <span className="eyebrow">DZISIAJ NA PLANIE</span>
                <h2>{planName(activePlan.name)}</h2>
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
                    <span key={index} className={index === (new Date().getDay() + 6) % 7 ? "today" : ""}>
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
                  {weekChange}
                </b>
              </div>
            </section>
            <section className="card workout-calendar">
              <div className="card-head"><div><span className="eyebrow">KALENDARZ TRENINGÓW</span><h2>{calendarMonthName}</h2></div><CalendarDays size={20} /></div>
              <div className="calendar-week-labels">{["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((day) => <span key={day}>{day}</span>)}</div>
              <div className="calendar-month-grid">{calendarDays.map((day, index) => day === null ? <span className="calendar-day-empty" key={`empty-${index}`} /> : <button type="button" aria-label={`Trening ${calendarKey(day)}`} aria-pressed={trainingDates.includes(calendarKey(day))} className={trainingDates.includes(calendarKey(day)) ? "calendar-day done" : "calendar-day"} key={day} onClick={() => toggleTrainingDay(day)}><b>{day}</b>{trainingDates.includes(calendarKey(day)) && <Check size={12} />}</button>)}</div>
              <div className="calendar-caption"><span><i className="calendar-dot done" /> kliknij dzień, aby oznaczyć trening</span><strong>{trainingDates.filter(d => d.slice(0,7) === today.slice(0,7)).length} dni wykonanych</strong></div>
            </section>
            <section className="achievement-banner">
              <div className="badge">
                <Trophy size={20} />
              </div>
              <div>
                <span className="eyebrow">NASTĘPNE OSIĄGNIĘCIE</span>
                <b>Pierwsze 5 treningów</b>
                <small>{trainingCount < 5 ? `Jeszcze ${5 - trainingCount} treningów do 5 sesji` : "Pierwsze 5 treningów ukończone"}</small>
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
                  <h2>{planName(plan.name)}</h2>
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
                <p>{exercises.length} ćwiczeń · maszyny i wolne ciężary</p>
              </div>
              <button
                className="round-add"
                aria-label="Dodaj własne ćwiczenie"
                onClick={() => { setExerciseError(""); setModal("exercise"); }}
              >
                <Plus size={20} />
              </button>
            </div>
            <details className="catalog-tools"><summary>Własne ćwiczenia i uzupełnianie bazy</summary><p>Użyj +, aby dodać własne ćwiczenie. Możesz też przywrócić usunięte pozycje z bazy startowej.</p><button type="button" className="secondary-cta" onClick={() => { setExercises(current => [...current, ...defaultData.exercises.filter(item => !current.some(e => e.id === item.id || e.name === item.name))]); setNotice("Baza uzupełniona o brakujące ćwiczenia."); }}>Uzupełnij bazę ćwiczeń</button></details>
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Szukaj ćwiczenia..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="catalog-filters"><label>Sprzęt<select aria-label="Filtr sprzętu" value={equipment} onChange={event => setEquipment(event.target.value)}><option value="Wszystkie">Każdy sprzęt</option>{[...new Set(exercises.map(e => e.equipment))].sort((a,b) => a.localeCompare(b,"pl")).map(item => <option key={item}>{item}</option>)}</select></label><span>{filteredExercises.length} wyników</span></div>
            <div className="category-scroll" aria-label="Partie mięśniowe">
              {["Wszystkie", ...new Set(exercises.map(e => e.category))].map(
                (item) => (
                  <button
                    key={item}
                    aria-pressed={category === item}
                    className={category === item ? "selected" : ""}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <div className="exercise-list">
              {[...new Set(filteredExercises.map(e => e.category))].map(group => <section className="exercise-group" key={group}><div className="exercise-group-heading"><h2>{group === "Klatka" ? "Klatka piersiowa" : group}</h2><span>{filteredExercises.filter(e => e.category === group).length} ćwiczeń</span></div>{filteredExercises.filter(e => e.category === group).map((exercise) => (
                <section
                  className="exercise-row"
                  key={exercise.id}
                  onClick={() => setModal(`rest-${exercise.id}`)}
                >
                  {exercisePhotoStyle(exercise) ? <span className="exercise-photo-thumb" role="img" aria-label={exercise.name} style={exercisePhotoStyle(exercise)} /> : <span className={`exercise-icon ${exercise.color}`}><Dumbbell size={18} /></span>}
                  <div>
                    <button type="button" className="exercise-open" onClick={event => { event.stopPropagation(); setModal(`rest-${exercise.id}`); }}>{exercise.name}</button>
                    <small>
                      {exercise.category} · {exercise.equipment} ·{" "}
                      {exercise.sets} serie × {exercise.reps} · przerwa{" "}
                      {Math.floor(exercise.rest / 60)}:
                      {String(exercise.rest % 60).padStart(2, "0")}
                    </small>
                  </div>
                  <div className="exercise-actions">
                    <button type="button" className="exercise-edit-button" aria-label={`Edytuj: ${exercise.name}`} onClick={(event) => { event.stopPropagation(); openExerciseEditor(exercise); }}><Pencil size={15} /><span>Edytuj</span></button>
                  </div>
                </section>
              ))}</section>)}
              {filteredExercises.length === 0 && (
                <div className="empty-state">Nie znaleziono ćwiczeń.</div>
              )}
            </div>
          </>
        )}
        {tab === "workout" && activeSession && !currentExercise && <section className="card empty-session"><h1>Trening bez ćwiczeń</h1><p>Dodaj ćwiczenie z bazy lub zakończ sesję przez podsumowanie.</p><button type="button" className="primary-cta" onClick={() => setWorkoutPanel("add")}><Plus size={20} /> Dodaj inne ćwiczenie</button><button type="button" className="workout-menu-action" onClick={openFinishReview}>Zakończ trening</button></section>}
        {tab === "workout" && currentExercise && (
          <div className="workout-screen">
            <div className="workout-header">
              <div className="workout-topline"><button className="back-link" onClick={() => setTab("home")}><X size={18} /> Zwiń</button><span className="timer"><Clock3 size={15} />{formatDuration(elapsedWorkoutSeconds)}</span><button type="button" className="workout-finish-link" aria-label="Zakończ trening" onClick={openFinishReview}>Zakończ</button></div>
              <div className="workout-heading">
                <span className="eyebrow">
                  ĆWICZENIE {activeExerciseIndex + 1} /{" "}
                  {activeSession.exercises.length}
                </span>
                <h1>{currentExercise.name}</h1>
                <small>{planName(activePlan.name)}</small>
              </div>
            </div>
            <div className="workout-progress">
              <span
                style={{
                  width: `${((activeExerciseIndex + 1) / activeSession.exercises.length) * 100}%`,
                }}
              />
              <small>
                {activeExerciseIndex + 1} z {activeSession.exercises.length}{" "}
                ćwiczeń
              </small>
            </div>
            <label className="exercise-jump">Przejdź do ćwiczenia<select aria-label="Przejdź do ćwiczenia" value={activeExerciseIndex} onChange={event => setActiveExerciseIndex(Number(event.target.value))}>{activeSession.exercises.map((e,i) => <option key={e.id} value={i}>{i + 1}. {e.name}</option>)}</select></label>
            <details className="workout-photo-details" key={currentExercise.id}>
              <summary>{exercisePhotoStyle(currentExercise) ? <span className="exercise-photo-thumb" role="img" aria-label={currentExercise.name} style={exercisePhotoStyle(currentExercise)} /> : <Dumbbell size={24} />}<span>Zdjęcie ćwiczenia<small>Dotknij, aby powiększyć</small></span><ChevronRight size={18} /></summary>
              <ExerciseVisual exercise={currentExercise} />
            </details>
            <button type="button" className="workout-last-result" aria-label="Ostatni trening — szczegóły ćwiczenia" onClick={() => setWorkoutPanel("history")}><History size={21} /><span><small>{previousExercise ? `Ostatni trening · ${displayDate(previousExercise.date)}` : "Ostatni trening"}</small><b>{previousExercise ? `${seriesLabel(previousExercise.sets.length)} · ${previousExercise.sets.slice(0, 3).map(historySetLabel).join(" / ") + (previousExercise.sets.length > 3 ? " …" : "")}` : "Brak wyników — ustal punkt wyjściowy"}</b></span><ChevronRight size={20} /></button>
            <section className="workout-exercise current-exercise card">
              {currentExercise.skipped && <div className="session-skipped-banner" role="status"><p>Ćwiczenie pominięte. Jego serie nie trafią do wyniku treningu.</p><button type="button" onClick={() => setExerciseSkipped(false)}>Cofnij pominięcie</button></div>}
              <div className="exercise-title">
                <span className={`exercise-icon ${currentExercise.color}`}>
                  <Dumbbell size={17} />
                </span>
                <div>
                  <h2>Twoje serie</h2>
                  <small>
                    {currentExercise.category} · cel {currentExercise.reps}{" "}
                    powtórzeń · przerwa {Math.floor(currentExercise.rest / 60)}:
                    {String(currentExercise.rest % 60).padStart(2, "0")}
                  </small>
                </div>
                <IconButton label="Menu ćwiczenia" onClick={() => setWorkoutPanel("exercise")}><span aria-hidden="true">•••</span></IconButton>
              </div>
              <ActiveSetEditor key={activeSession.id + ":" + currentExercise.id} exercise={currentExercise} exerciseIndex={activeExerciseIndex} sessionId={activeSession.id} onPersist={updateData} onConfirm={toggleSet} />
            </section>
            {isResting && (
              <section className="rest-card">
                <span className="eyebrow">
                  PRZERWA · {activeSession.restExerciseName || currentExercise.name}
                </span>
                <strong>
                  {Math.floor(restSeconds / 60)}:
                  {String(restSeconds % 60).padStart(2, "0")}
                </strong>
                <div>
                  <button onClick={() => update("activeSession", session => ({ ...session, restUntil: Math.max(Date.now(), session.restUntil || 0) + 15000 }))}>
                    +15 s
                  </button>
                  <button onClick={() => update("activeSession", session => ({ ...session, restUntil: null }))}>
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
              {activeExerciseIndex < activeSession.exercises.length - 1 ? (
                <button
                  className="primary-cta"
                  onClick={() => {
                    setActiveExerciseIndex((value) => value + 1);
                  }}
                >
                  Następne <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  className="finish-button"
                  onClick={openFinishReview}
                >
                  Zakończ <Check size={17} />
                </button>
              )}
            </div>
          </div>
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
                <b data-testid="history-training-count">{trainingCount}</b>
                <small>łącznie, w tym {manualDays.length} ręcznie</small>
              </div>
              <div>
                <span className="eyebrow">OBJĘTOŚĆ</span>
                <b>{displayNumber(monthVolume)}</b>
                <small>kg w tym miesiącu</small>
              </div>
              <div>
                <span className="eyebrow">ŚREDNIA</span>
                <b>{workouts.length ? `${Math.round(workouts.reduce((sum, w) => sum + w.durationSeconds, 0) / workouts.length / 60)} min` : "—"}</b>
                <small>tylko sesje z pomiarem czasu</small>
              </div>
            </div>
            <p className="history-data-note">Ręczne wpisy z kalendarza liczą się jako odbyte treningi. Czas, serie i objętość obliczamy tylko z sesji, w których zapisano te dane.</p>
            {summary && <section className="card workout-summary"><span className="eyebrow">TRENING ZAPISANY</span><h2>Dobra robota!</h2><p>{displayNumber(summary.volume)} kg · {summary.exercises.reduce((sum,e) => sum + e.sets.length, 0)} serii · {Math.floor(summary.durationSeconds / 60)} min</p><button type="button" className="back-link" onClick={() => setSummary(null)}>Zamknij podsumowanie</button></section>}
            {!history.length && <div className="empty-state">Ukończ pierwszy trening, aby zobaczyć prawdziwe wyniki.</div>}
            <div className="history-list">
              {history.map((item) => (
                <section className="history-row" key={item.id}>
                  <div className="history-date">
                    <b>{item.date.split(" ")[0]}</b>
                    <small>{item.date.split(" ").slice(1).join(" ")}</small>
                  </div>
                  <div>
                    <h2>{item.name}</h2>
                    {item.manual ? <p>Wpis z kalendarza · bez danych o seriach, czasie i objętości</p> : <p>
                      {item.exercises} <span>·</span> {item.duration}
                    </p>}
                  </div>
                  {!item.manual && <><strong>{item.volume}</strong>
                  <details className="session-details"><summary>Serie</summary>{item.exercises && workouts.find(w => w.id === item.id)?.exercises.map(e => <div key={e.id}><b>{e.name}</b><p>{e.sets.map(s => `${s.weight} kg × ${s.reps}`).join(" · ")}</p></div>)}</details></>}
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
            <section className="stats-hero card"><div><span className="eyebrow">OBJĘTOŚĆ · OSTATNIE 7 DNI</span><h2>{displayNumber(last7Volume)} <small>kg</small></h2><span className="muted">{weekChange}</span></div></section>
            <section className="card chart-panel"><div className="card-head"><h2>Ciężar w ćwiczeniu</h2></div>
              <div className="chart-controls"><select aria-label="Ćwiczenie na wykresie" value={chartExerciseId} onChange={e => setStatsExercise(e.target.value)}><option value="">Wybierz ćwiczenie</option>{records.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select><select aria-label="Zakres wykresu" value={statsRange} onChange={e => setStatsRange(Number(e.target.value))}><option value={30}>30 dni</option><option value={90}>90 dni</option><option value={3650}>Cała historia</option></select></div>
              <TrendChart points={strengthPoints} unit="kg" />
            </section>
            <section className="card chart-panel"><h2>Największy zapisany ciężar</h2>{!records.length && <p className="empty-state">Wyniki pojawią się po pierwszym treningu.</p>}{records.map(record => <div className="record" key={record.id}><div><span>{record.name}</span><b>{displayNumber(record.weight)} kg</b></div></div>)}</section>
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
                  { icon: Flame, label: "Pierwszy trening", done: trainingCount >= 1 },
                  { icon: Zap, label: "5 treningów", done: trainingCount >= 5 },
                  { icon: Target, label: "10 treningów", done: trainingCount >= 10 },
                  {
                    icon: Activity,
                    label: "25 treningów",
                    done: trainingCount >= 25,
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
            <BodyProgress measurements={measurements} />
            {data.legacyMeasurements?.length > 0 && <details className="card legacy-data"><summary>Poprzednie pomiary bez daty ({data.legacyMeasurements.length})</summary><p>Stara wersja zapisywała „Dzisiaj” zamiast daty. Zachowaliśmy te wpisy, ale nie uwzględniamy ich w wykresach i porównaniach.</p>{data.legacyMeasurements.map((m,i) => <p key={i}>{m.date}: waga {m.weight ?? "—"} kg, biceps {m.biceps ?? "—"} cm, klatka {m.chest ?? "—"} cm, talia {m.waist ?? "—"} cm, udo {m.thigh ?? "—"} cm</p>)}</details>}
            <section className="card"><h2>Masa ciała w czasie</h2><TrendChart points={[...measurements].reverse().filter(m => m.weight != null).map(m => ({ date: displayDate(m.date), value: m.weight }))} unit="kg" /></section>
            <form className="measurement-form card" onSubmit={saveMeasurement}>
              <div className="card-head">
                <div>
                  <span className="eyebrow">NOWY POMIAR</span>
                  <h2>Zapisz aktualny stan</h2>
                </div>
                <CalendarDays size={20} />
              </div>
              <label className="date-field">Data pomiaru<input type="date" name="date" defaultValue={today} max={today} required /></label>
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
                        inputMode="decimal"
                        type="number"
                        min="0.1"
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
              {!measurements.length && <p className="empty-state">Dodaj pierwszy pomiar.</p>}
              {measurements.map((measurement, index) => (
                <div
                  className="measurement-row"
                  key={`${measurement.date}-${index}`}
                >
                  <div>
                    <b>{displayDate(measurement.date)}</b>
                    <small>{measurement.weight ?? "—"} kg</small>
                  </div>
                  <span>{measurement.biceps ?? "—"} cm</span>
                  <span>{measurement.chest ?? "—"} cm</span>
                  <span>{measurement.waist ?? "—"} cm</span>
                  <span>{measurement.thigh ?? "—"} cm</span>
                </div>
              ))}
            </section>
          </>
        )}
        </>}
      </main>
      {tab !== "workout" && <nav className="bottom-nav">
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
      </nav>}
      {workoutPanel === "history" && currentExercise && <ExerciseHistorySheet exercise={currentExercise} sessions={exerciseSessions} onClose={() => setWorkoutPanel(null)} onProgress={() => { setStatsExercise(String(currentExercise.id)); setStatsRange(3650); setWorkoutPanel(null); setTab("stats"); }} />}
      {["add", "replace", "parameters"].includes(workoutPanel) && activeSession && (currentExercise || workoutPanel === "add") && <SessionExerciseEditor
        key={workoutPanel + activeSession.id + (currentExercise?.id ?? "empty")} mode={workoutPanel} session={activeSession} exercise={currentExercise || { name: "", sets: [], reps: 10, rest: 90 }} exercises={exercises}
        onClose={() => setWorkoutPanel(null)} onApply={(selected, values, confirmed) => changeSession(session =>
          workoutPanel === "add" ? addSessionExercise(session, selected, values) : workoutPanel === "replace" ? replaceSessionExercise(session, activeExerciseIndex, selected, values, confirmed) : editSessionTargets(session, activeExerciseIndex, values))} />}
      {workoutPanel === "exercise" && currentExercise && <SessionExerciseMenu exercise={currentExercise} session={activeSession}
        onClose={() => setWorkoutPanel(null)} onAddSet={() => { if (addSet()) setWorkoutPanel(null); }} onMode={setWorkoutPanel}
        onSkip={() => setExerciseSkipped(!currentExercise.skipped)} onRemove={confirmed => { const saved = changeSession(session => removeSessionExercise(session, activeExerciseIndex, confirmed)); if (saved) setWorkoutPanel(null); return saved; }}
        onJump={index => { setActiveExerciseIndex(index); setWorkoutPanel(null); }} onCollapse={() => { setWorkoutPanel(null); setTab("home"); }}
        onFinish={() => { setWorkoutPanel(null); openFinishReview(); }} />}
      {modal === "finish" && activeSession && <DialogSheet labelledBy="finish-title" onClose={() => setModal(null)} className="finish-review">
        <header className="sheet-header"><h2 id="finish-title">Zakończyć trening?</h2><IconButton label="Wróć do treningu" onClick={() => setModal(null)}><X size={18} /></IconButton></header>
        <div className="sheet-body">
          <div className="finish-counts"><div><b>{completedSetCount}</b><span>zatwierdzonych serii</span></div><div><b>{filledSetCount - completedSetCount}</b><span>do potwierdzenia</span></div></div>
          {activeSession.exercises.some(e => e.skipped) && <p className="sheet-hint">Pominięte ćwiczenia: {activeSession.exercises.filter(e => e.skipped).length}. Ich serie nie będą zapisane w wyniku.</p>}
          {filledSetCount > completedSetCount && <><label className="finish-checkbox"><input type="checkbox" checked={includeFilled} onChange={event => setIncludeFilled(event.target.checked)} /><span>{completedSetCount ? "Zapisz też niezaznaczone serie" : "Potwierdzam wykonanie wypełnionych serii"}</span></label><p className="sheet-hint">Sprawdź wartości — część może pochodzić z poprzedniego treningu.</p></>}
          {filledSetCount === 0 && <p className="sheet-hint">Brak serii do zapisania. Możesz wrócić do ćwiczeń albo odrzucić sesję.</p>}
          {filledSetCount > 0 && <details className="finish-set-list"><summary>Sprawdź serie</summary>{activeSession.exercises.filter(e => !e.skipped && e.sets.some(s => !s.skipped && validSet(s))).map(e => <div key={e.id}><b>{e.name}</b>{e.sets.map((s,i) => !s.skipped && validSet(s) && <p key={i}>{i + 1}. {s.weight} kg × {s.reps} · {s.completed ? "✓" : "niezatwierdzona"}</p>)}</div>)}</details>}
          {finishError && <p className="form-error" role="alert">{finishError}</p>}
        </div>
        <footer className="sheet-footer">
          {filledSetCount > 0 ? <button type="button" className="primary-cta" disabled={!completedSetCount && !includeFilled} onClick={() => finishWorkout(includeFilled)}>Zapisz trening</button> : <button type="button" className="primary-cta" onClick={() => setModal(null)}>Wróć do treningu</button>}
          <div className="sheet-secondary-actions">
            {filledSetCount > 0 && <button type="button" onClick={() => setModal(null)}>Kontynuuj</button>}
            <button type="button" className="danger-action" aria-label="Odrzuć trening bez zapisu" onClick={() => {
              if (!updateData(current => ({ ...current, activeSession: null }))) { setFinishError("Nie udało się zapisać zmiany. Spróbuj ponownie."); return; }
              setModal(null); setTab("home"); setNotice("Trening odrzucony bez zapisu.");
            }}>Odrzuć bez zapisu</button>
          </div>
        </footer>
      </DialogSheet>}
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
                  <div className="plan-exercise-edit" key={id}>
                    <button type="button" onClick={() => removeExerciseFromPlan(id)}>{exercise?.name}<X size={14} /></button>
                    <div className="plan-targets">{[["sets", "Serie", 3, 1, 20], ["reps", "Powt.", 10, 1, 100], ["rest", "Przerwa (s)", 90, 0, 900]].map(([key, label, fallback, min, max]) => <label key={key}>{label}<input type="number" min={min} max={max} required value={planEditor.targets?.[id]?.[key] ?? exercise?.[key] ?? fallback} onChange={event => setPlanEditor(current => ({ ...current, targets: { ...current.targets, [id]: { sets: exercise?.sets || 3, reps: exercise?.reps || 10, rest: exercise?.rest || 90, ...current.targets?.[id], [key]: event.target.value === "" ? "" : Number(event.target.value) } } }))} /></label>)}</div>
                  </div>
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
        <DialogSheet labelledBy="edit-exercise-title" onClose={() => setExerciseEditor(null)} onSubmit={saveExercise} className="exercise-sheet">
          <header className="sheet-header"><h2 id="edit-exercise-title">Edytuj ćwiczenie</h2><IconButton label="Zamknij" onClick={() => setExerciseEditor(null)}><X size={18} /></IconButton></header>
          <div className="sheet-body">
            <label>Nazwa ćwiczenia<input name="name" defaultValue={exerciseEditor.name} required /></label>
            <label>Partia<select name="category" aria-label="Partia" defaultValue={exerciseEditor.category}>{[...new Set([exerciseEditor.category, "Klatka", "Plecy", "Nogi", "Barki", "Biceps", "Triceps", "Brzuch"])].filter(Boolean).map(item => <option key={item}>{item}</option>)}</select></label>
            <label>Sprzęt<select name="equipment" aria-label="Sprzęt" defaultValue={exerciseEditor.equipment}>{[...new Set([exerciseEditor.equipment, "Hantle", "Sztanga", "Wyciąg", "Masa ciała", "Maszyna", "Suwnica Smitha"])].filter(Boolean).map(item => <option key={item}>{item}</option>)}</select></label>
            <ExercisePhotoField value={exerciseEditor.customPhoto} onChange={customPhoto => setExerciseEditor(current => ({ ...current, customPhoto }))} onBusy={setPhotoBusy} />
            <details className="exercise-more-options"><summary>Więcej opcji</summary><button type="button" className="danger-action" onClick={() => { if (window.confirm("Usunąć ćwiczenie z bazy i planów? Zapisane treningi pozostaną w historii.")) deleteExercise(exerciseEditor.id); }}>Usuń ćwiczenie</button></details>
            {exerciseError && <p className="form-error" role="alert">{exerciseError}</p>}
          </div>
          <footer className="sheet-footer"><button className="primary-cta" type="submit" disabled={photoBusy}><Check size={18} />{photoBusy ? "Przygotowuję zdjęcie…" : "Zapisz zmiany"}</button></footer>
        </DialogSheet>
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
                <ExerciseVisual exercise={exercise} />
                <button type="button" className="secondary-cta" onClick={() => openExerciseEditor(exercise)}><Pencil size={16} />Edytuj ćwiczenie i zdjęcie</button>
                <label>
                  Przerwa między seriami
                  <select name="rest" defaultValue={exercise.rest}>
                    <option value="0">Bez przerwy</option>
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
      {modal === "exercise" && <DialogSheet labelledBy="add-exercise-title" onClose={() => setModal(null)} onSubmit={addExercise} className="exercise-sheet">
        <header className="sheet-header"><h2 id="add-exercise-title">Dodaj ćwiczenie</h2><IconButton label="Zamknij" onClick={() => setModal(null)}><X size={18} /></IconButton></header>
        <div className="sheet-body">
          <label>Nazwa ćwiczenia<input value={newExercise.name} onChange={event => setNewExercise(current => ({ ...current, name: event.target.value }))} placeholder="np. Wznosy bokiem" required /></label>
          <label>Partia<select aria-label="Partia" value={newExercise.category} onChange={event => setNewExercise(current => ({ ...current, category: event.target.value }))}>{["Klatka", "Plecy", "Nogi", "Barki", "Biceps", "Triceps", "Brzuch"].map(item => <option key={item}>{item}</option>)}</select></label>
          <label>Sprzęt<select aria-label="Sprzęt" value={newExercise.equipment} onChange={event => setNewExercise(current => ({ ...current, equipment: event.target.value }))}>{["Hantle", "Sztanga", "Wyciąg", "Masa ciała", "Maszyna", "Suwnica Smitha"].map(item => <option key={item}>{item}</option>)}</select></label>
          <ExercisePhotoField value={newExercise.customPhoto} onChange={customPhoto => setNewExercise(current => ({ ...current, customPhoto }))} onBusy={setPhotoBusy} />
          {exerciseError && <p className="form-error" role="alert">{exerciseError}</p>}
        </div>
        <footer className="sheet-footer"><button className="primary-cta" type="submit" disabled={photoBusy}><Plus size={18} />{photoBusy ? "Przygotowuję zdjęcie…" : "Dodaj do bazy"}</button></footer>
      </DialogSheet>}
    </div>
  );
}

