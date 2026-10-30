import { number } from "./training.js";

// Read-only projection of saved workouts. Never changes training drafts or persistence.
export function exerciseHistory(workouts, exerciseId) {
  return workouts.flatMap(workout => {
    const date = typeof workout.completedAt === "number" ? workout.completedAt
      : typeof workout.completedAt === "string" && workout.completedAt.trim() ? Date.parse(workout.completedAt) : NaN;
    if (!Number.isFinite(date) || date <= 0 || !Number.isFinite(new Date(date).getTime())) return [];
    const performed = (workout.exercises || []).filter(exercise => exercise.id === exerciseId && !exercise.skipped)
      .map(exercise => ({ durationSeconds: exercise.durationSeconds, sets: (exercise.sets || []).flatMap((row, index) => {
        if (row.completed !== true || row.skipped || !Number.isInteger(number(row.reps)) || number(row.reps) < 1) return [];
        const missingWeight = row.weight == null || String(row.weight).trim() === "";
        const weight = missingWeight ? null : number(row.weight);
        if (weight !== null && (!Number.isFinite(weight) || weight < 0)) return [];
        return [{ index: index + 1, weight, reps: number(row.reps) }];
      }) })).filter(exercise => exercise.sets.length);
    const sets = performed.flatMap(exercise => exercise.sets);
    if (!sets.length) return [];
    const hasRecordedTime = performed.every(exercise => typeof exercise.durationSeconds === "number" && Number.isFinite(exercise.durationSeconds) && exercise.durationSeconds >= 0);
    return [{ sessionId: workout.id, date, sets,
      durationSeconds: hasRecordedTime ? performed.reduce((sum, exercise) => sum + exercise.durationSeconds, 0) : null,
      volume: sets.reduce((total, row) => total + (row.weight === null ? 0 : row.weight * row.reps), 0),
      missingLoad: sets.some(row => row.weight === null),
      hasLoad: sets.some(row => row.weight !== null) }];
  }).sort((a, b) => b.date - a.date);
}

const format = value => value.toLocaleString("pl-PL", { maximumFractionDigits: 2 });
export function historySetLabel(row) {
  if (row.weight === null) return `${row.reps} powt. · bez zapisanego ciężaru`;
  if (row.weight === 0) return `${row.reps} powt. · bez dodatkowego obciążenia`;
  return `${format(row.weight)} kg × ${row.reps}`;
}

export function historyVolumeLabel(session) {
  if (!session.hasLoad) return "Brak zapisanego obciążenia do obliczenia objętości w kg";
  return `${session.missingLoad ? "Objętość serii z zapisanym ciężarem" : "Całkowita objętość"}: ${format(session.volume)} kg`;
}
