export function dateKey(value = new Date()) {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const number = value => Number(String(value).replace(",", "."));
export const volume = rows => rows.reduce((sum, row) => sum + (row.completed ? number(row.weight) * number(row.reps) : 0), 0);
export function lastExercise(workouts, id) {
  return [...workouts].sort((a, b) => b.startedAt - a.startedAt)
    .flatMap(workout => workout.exercises.filter(e => e.id === id).map(e => ({ ...e, date: workout.completedAt })))
    .find(e => e.sets.some(s => s.completed));
}
export function createSession(plan, exercises, workouts, now = Date.now()) {
  const selected = plan.exercises.map(id => exercises.find(e => e.id === id)).filter(Boolean);
  if (!selected.length) return null;
  return {
    id: crypto.randomUUID(), plan: { ...plan, exercises: selected.map(e => e.id) },
    startedAt: now, index: 0,
    exercises: selected.map(exercise => {
      const last = lastExercise(workouts, exercise.id)?.sets.filter(s => s.completed) || [];
      const target = plan.targets?.[exercise.id] || exercise;
      return { ...exercise, reps: target.reps, rest: target.rest || 90,
        sets: Array.from({ length: target.sets || 3 }, (_, i) => ({
          weight: String(last[i]?.weight ?? last[0]?.weight ?? ""),
          reps: String(last[i]?.reps ?? target.reps ?? 10), completed: false,
        })) };
    }),
  };
}
export function completeSession(session, now = Date.now()) {
  const exercises = session.exercises.map(e => ({ ...e, sets: e.sets.filter(s => s.completed) })).filter(e => e.sets.length);
  if (!exercises.length) return null;
  return { ...session, exercises, completedAt: now,
    durationSeconds: Math.max(0, Math.floor((now - session.startedAt) / 1000)),
    volume: exercises.reduce((sum, e) => sum + volume(e.sets), 0) };
}
export function measurementChange(measurements, key) {
  const valid = measurements.filter(m => m[key] != null && Number.isFinite(Number(m[key])));
  return { latest: valid[0]?.[key] ?? null, previous: valid[1]?.[key] ?? null,
    delta: valid.length > 1 ? Number((valid[0][key] - valid[1][key]).toFixed(1)) : null,
    previousDate: valid[1]?.date };
}
export function weekDates(now = new Date()) {
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return dateKey(d); });
}
export function currentStreak(days, now = new Date()) {
  const unique = new Set(days); const d = new Date(now);
  if (!unique.has(dateKey(d))) d.setDate(d.getDate() - 1);
  let count = 0;
  while (unique.has(dateKey(d))) { count++; d.setDate(d.getDate() - 1); }
  return count;
}
export function normalizeData(saved = {}, defaults) {
  const data = { ...defaults, ...saved, schemaVersion: 2 };
  for (const key of ["plans", "exercises", "measurements", "workouts", "completedDays"]) {
    if (!Array.isArray(data[key])) data[key] = defaults[key] || [];
  }
  data.plans = data.plans.filter(Boolean).map(p => ({ ...p, exercises: Array.isArray(p.exercises) ? p.exercises : [] }));
  data.exercises = data.exercises.filter(Boolean).map(e => ({ ...e, name: e.name || (e.id === 1 ? "Wyciskanie hantli na skosie" : "Ćwiczenie"), rest: e.rest || 90 }));
  // Legacy day numbers have no month/year. Preserve them separately rather than inventing dates.
  data.legacyCompletedDays = saved.legacyCompletedDays || data.completedDays.filter(d => typeof d === "number");
  data.completedDays = data.completedDays.filter(d => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d));
  data.waterByDate = saved.waterByDate || {};
  data.legacyMeasurements = saved.legacyMeasurements || data.measurements.filter(m => !/^\d{4}-\d{2}-\d{2}$/.test(m.date));
  data.measurements = data.measurements.filter(m => /^\d{4}-\d{2}-\d{2}$/.test(m.date));
  return data;
}
