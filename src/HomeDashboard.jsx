import { useEffect, useMemo } from "react";
import { ArrowRight, CalendarDays, Droplets, Dumbbell, Flame, History, ListPlus, Plus, TrendingUp, Weight } from "lucide-react";
import { dashboardMetrics, dashboardPlan } from "./dashboard.js";
import { planName } from "./training.js";
import "./HomeDashboard.css";

const format = value => value.toLocaleString("pl-PL", { maximumFractionDigits: 1 });
const weekdays = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
export function HomeDashboard({ plans, selectedPlanId, activeSession, workouts, completedDays, today, water, weekWater, onStart, onPlans, onHistory, onProgress, onWater, calendar }) {
  useEffect(() => { window.scrollTo?.({ top: 0, left: 0, behavior: "auto" }); }, []);
  const metrics = useMemo(() => dashboardMetrics(workouts, completedDays), [workouts, completedDays, today]);
  const { plan, label } = dashboardPlan(plans, selectedPlanId, activeSession, today);
  const canStart = Boolean(activeSession || plan?.exercises.length);
  const cards = [
    { title: "Treningi", hint: "łącznie", value: format(metrics.trainingCount), id: "training-count", Icon: CalendarDays, tone: "cyan", action: onHistory },
    { title: "Serie", hint: "ostatnie 7 dni", value: format(metrics.sets), id: "dashboard-set-count", Icon: ListPlus, tone: "magenta", action: onProgress },
    { title: "Objętość", hint: metrics.sets && !metrics.loadedSets ? "brak ciężaru · 7 dni" : metrics.loadedSets < metrics.sets ? "zapisany ciężar · 7 dni" : "ostatnie 7 dni", value: metrics.sets && !metrics.loadedSets ? "—" : `${format(metrics.volume)} kg`, id: "dashboard-volume", Icon: Weight, tone: "orange", action: onProgress },
    { title: "Passa", hint: "dni z rzędu", value: `${metrics.streak} ${metrics.streak === 1 ? "dzień" : "dni"}`, id: "dashboard-streak", Icon: Flame, tone: "red", action: onHistory },
  ];
  return <div className="home-dashboard">
    <section className="dashboard-welcome"><h1>Czas na Twój<br />trening.</h1><p>Twój kolejny krok zaczyna się od jednej serii.</p></section>
    <section className="dashboard-plan" aria-label="Twój plan treningowy">
      <button type="button" className="dashboard-plan-link" onClick={onPlans}><span className="dashboard-plan-icon"><Dumbbell size={25} /></span><span><small>{label}</small><b>{plan ? planName(plan.name) : "Wybierz plan treningowy"}</b><span>{plan ? `${activeSession ? activeSession.exercises.length : plan.exercises.length} ćwiczeń${plan.duration ? ` · ${plan.duration} (plan)` : ""}` : "Utwórz plan w zakładce Plany"}</span></span><ArrowRight size={18} /></button>
      <button type="button" className={`primary-cta dashboard-start${activeSession ? " secondary-cta" : ""}`} aria-label={activeSession ? "Wznów rozpoczęty trening" : canStart ? "Rozpocznij trening" : plan ? "Uzupełnij plan" : "Utwórz plan"} onClick={() => canStart ? onStart(plan) : onPlans()}>{activeSession ? "Wznów trening" : canStart ? "Rozpocznij trening" : plan ? "Uzupełnij plan" : "Utwórz plan"}<ArrowRight size={19} /></button>
    </section>
    <section className="dashboard-metrics" aria-label="Statystyki treningowe">{cards.map(({ title, hint, value, id, Icon, tone, action }) => <button type="button" className="dashboard-metric" key={id} onClick={action} aria-label={`${title}: ${value}, ${hint}`}><span className={`dashboard-metric-icon ${tone}`}><Icon size={19} /></span><span><small>{title}</small><b data-testid={id}>{value}</b><span className="dashboard-metric-period">{hint}</span></span></button>)}</section>
    <section className="dashboard-week" aria-label="Bieżący tydzień"><div className="dashboard-section-heading"><h2>Twój tydzień</h2><button type="button" aria-label="Otwórz postęp" onClick={onProgress}><TrendingUp size={20} /></button></div><div className="dashboard-week-days">{metrics.week.map((day, i) => <div className={`dashboard-weekday${day.today ? " today" : ""}`} key={day.date} data-done={day.attended} aria-label={`${day.date}: ${day.attended ? "trening oznaczony" : "brak treningu"}`}><small>{weekdays[i]}</small><span /><b>{Number(day.date.slice(-2))}</b></div>)}</div><p>Bieżący tydzień · zaznaczone dni treningowe</p></section>
    <nav className="dashboard-links" aria-label="Skróty pulpitu"><button type="button" onClick={onHistory}><History size={18} />Historia</button><button type="button" onClick={onPlans}><Dumbbell size={18} />Plany</button><button type="button" onClick={onProgress}><TrendingUp size={18} />Postęp</button></nav>
    {calendar}
    <details className="dashboard-water"><summary><Droplets size={19} /><span>Nawodnienie</span><b>{format(water)} L</b></summary><div className="dashboard-water-body"><p>Dzisiaj · cel 2 L</p><div className="dashboard-water-actions"><button type="button" aria-label="Odejmij 0,2 litra" onClick={() => onWater(-0.2)}>− 0,2 L</button><button type="button" aria-label="Dodaj 0,2 litra" onClick={() => onWater(0.2)}><Plus size={17} /> 0,2 L</button></div><div className="dashboard-water-week" aria-label="Nawodnienie w bieżącym tygodniu">{weekWater.map((value, i) => <span key={i}><small>{weekdays[i]}</small><b>{format(value)} L</b></span>)}</div></div></details>
  </div>;
}
