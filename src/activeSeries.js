import { number } from "./training.js";

export function activeSeriesIndex(exercise) {
  const selected = exercise.activeSetIndex;
  if (Number.isInteger(selected) && exercise.sets[selected] && !exercise.sets[selected].completed && !exercise.sets[selected].skipped) return selected;
  return exercise.sets.findIndex(row => !row.completed && !row.skipped);
}

export function changeExerciseSeries(data, sessionId, exerciseId, exerciseIndex, transform) {
  const session = data.activeSession;
  if (!session || session.id !== sessionId || session.exercises[exerciseIndex]?.id !== exerciseId) throw new Error("Sesja zmieniła się. Otwórz ponownie ćwiczenie.");
  if (session.exercises[exerciseIndex].skipped) throw new Error("Cofnij pominięcie ćwiczenia, aby zmienić serię.");
  return { ...data, activeSession: { ...session, exercises: session.exercises.map((exercise, index) => index === exerciseIndex ? transform(exercise) : exercise) } };
}

export function selectSeries(exercise, index) {
  if (!exercise.sets[index] || exercise.sets[index].skipped) throw new Error("Nie znaleziono serii.");
  return { ...exercise, activeSetIndex: index };
}

export function updateSeriesField(exercise, index, field, value) {
  if (!exercise.sets[index] || !["weight", "reps"].includes(field)) throw new Error("Nieprawidłowe pole serii.");
  return { ...exercise, activeSetIndex: index, sets: exercise.sets.map((row, i) => i === index ? { ...row, [field]: value, completed: false } : row) };
}

export function appendSeries(exercise) {
  return { ...exercise, activeSetIndex: exercise.sets.length, sets: [...exercise.sets, { weight: "", reps: String(exercise.reps ?? 10), completed: false }] };
}

// Reuse unfinished work before creating an additional row.
export function addOrResumeSeries(exercise) {
  const pending = activeSeriesIndex(exercise);
  return pending < 0 ? appendSeries(exercise) : selectSeries(exercise, pending);
}

export function confirmSeries(exercise, index) {
  if (!exercise.sets[index] || exercise.sets[index].skipped) throw new Error("Nie znaleziono serii.");
  const sets = exercise.sets.map((row, i) => i === index ? { ...row, completed: true } : row);
  let next = sets.findIndex((row, i) => i > index && !row.completed && !row.skipped);
  if (next < 0) next = sets.findIndex(row => !row.completed && !row.skipped);
  return { ...exercise, sets, activeSetIndex: next };
}

export function steppedSeriesValue(value, field, direction) {
  const current = String(value ?? "").trim() === "" ? 0 : number(value);
  if (!Number.isFinite(current) || current < 0 || (field === "reps" && !Number.isInteger(current))) throw new Error("Wpisz poprawną liczbę przed użyciem przycisków ±.");
  const next = Math.max(field === "weight" ? 0 : 1, Math.round((current + direction * (field === "weight" ? 2.5 : 1)) * 100) / 100);
  return String(next).replace(".", ",");
}
