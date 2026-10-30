import { currentStreak, dateKey, number, trainingAttendance, weekDates } from "./training.js";

export function recordedWeights(exercise) {
  if (exercise.skipped) return [];
  return (exercise.sets || []).flatMap(row => {
    const weight = number(row.weight), reps = number(row.reps);
    return row.completed === true && !row.skipped && row.weight != null && String(row.weight).trim() !== "" && Number.isFinite(weight) && weight >= 0 && Number.isInteger(reps) && reps > 0 ? [weight] : [];
  });
}

// Seven local calendar days, including today; no draft sets or cached/demo totals.
export function dashboardMetrics(workouts, completedDays, now = new Date()) {
  const end = new Date(now), start = new Date(end);
  start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 6);
  const attendance = trainingAttendance(workouts, completedDays);
  let sets = 0, volume = 0, loadedSets = 0;
  for (const workout of workouts) {
    const completed = new Date(workout.completedAt).getTime();
    if (!Number.isFinite(completed) || completed < start.getTime() || completed > end.getTime()) continue;
    for (const exercise of workout.exercises || []) {
      if (exercise.skipped) continue;
      for (const row of exercise.sets || []) {
        const reps = number(row.reps), missingLoad = row.weight == null || String(row.weight).trim() === "";
        const weight = missingLoad ? null : number(row.weight);
        if (row.completed !== true || row.skipped || !Number.isInteger(reps) || reps < 1 || (weight !== null && (!Number.isFinite(weight) || weight < 0))) continue;
        sets++;
        if (weight !== null) { loadedSets++; volume += weight * reps; }
      }
    }
  }
  return { trainingCount: attendance.count, sets, volume, loadedSets,
    streak: currentStreak(attendance.dates, end),
    week: weekDates(end).map(date => ({ date, attended: attendance.dates.includes(date), today: date === dateKey(end) })) };
}

const dayNames = [["nd", "niedz", "niedziela"], ["pon", "poniedziałek"], ["wt", "wtorek"], ["śr", "środa"], ["czw", "czwartek"], ["pt", "piątek"], ["so", "sob", "sobota"]];
function scheduledToday(plan, day) {
  const tokens = String(plan.days || "").toLocaleLowerCase("pl-PL").split(/[\s·,;/]+/).filter(Boolean);
  return tokens.length > 0 && tokens.every(token => dayNames.some(names => names.includes(token))) && tokens.some(token => dayNames[day].includes(token));
}

export function dashboardPlan(plans, selectedPlanId, activeSession, today) {
  if (activeSession) return { plan: activeSession.plan, label: "Trening w toku" };
  const selected = plans.find(plan => plan.id === selectedPlanId);
  if (selected) return { plan: selected, label: "Wybrany plan" };
  const scheduled = plans.find(plan => scheduledToday(plan, new Date(`${today}T12:00:00`).getDay()));
  return scheduled ? { plan: scheduled, label: "Dzisiaj na planie" } : { plan: plans[0] || null, label: plans.length ? "Twój plan · wybierz na dziś" : "Zaplanuj trening" };
}
