import { createSession } from "./training.js";

export function sessionTargets(values) {
  const limits = { sets: [1, 50], reps: [1, 1000], rest: [0, 3600] };
  return Object.fromEntries(Object.entries(limits).map(([key, [min, max]]) => {
    const value = Number(values[key]);
    if (values[key] == null || String(values[key]).trim() === "" || !Number.isInteger(value) || value < min || value > max) {
      throw new Error("Podaj pełne liczby: serie 1–50, powtórzenia 1–1000, przerwa 0–3600 s.");
    }
    return [key, value];
  }));
}

export const hasSessionSets = exercise => exercise.sets.some(row => row.completed ||
  String(row.weight ?? "").trim() !== "" || String(row.reps ?? "").trim() !== "");

function rebuild(session, exercises, index = session.index) {
  return { ...session, exercises, index, plan: { ...session.plan, exercises: exercises.map(e => e.id) } };
}

function freshExercise(session, exercise, values) {
  const targets = sessionTargets(values);
  const entry = createSession({ ...session.plan, exercises: [exercise.id], targets: { [exercise.id]: targets } }, [exercise], []).exercises[0];
  return { ...entry, targetSets: targets.sets, skipped: false };
}

export function addSessionExercise(session, exercise, values) {
  if (session.exercises.some(e => e.id === exercise.id)) throw new Error("To ćwiczenie jest już w tym treningu. Wybierz je z menu lub dodaj kolejną serię.");
  return rebuild(session, [...session.exercises, freshExercise(session, exercise, values)], session.exercises.length);
}

export function replaceSessionExercise(session, index, exercise, values, confirmed = false) {
  const current = session.exercises[index];
  if (!current) throw new Error("Nie znaleziono ćwiczenia w rozpoczętym treningu.");
  if (session.exercises.some(e => e.id === exercise.id)) throw new Error("To ćwiczenie jest już w tym treningu. Wybierz inne.");
  if (hasSessionSets(current) && !confirmed) throw new Error("Potwierdź zamianę i usunięcie bieżących serii.");
  return rebuild(session, session.exercises.map((e, i) => i === index ? freshExercise(session, exercise, values) : e), index);
}

export function skipSessionExercise(session, index, skipped) {
  if (!session.exercises[index]) throw new Error("Nie znaleziono ćwiczenia w rozpoczętym treningu.");
  // Preserve the original rows for undo. Completion excludes the entire skipped entry.
  return { ...session, exercises: session.exercises.map((e, i) => i === index ? { ...e, skipped } : e) };
}

export function removeSessionExercise(session, index, confirmed = false) {
  const exercise = session.exercises[index];
  if (!exercise) throw new Error("Nie znaleziono ćwiczenia w rozpoczętym treningu.");
  if (!confirmed) throw new Error("Potwierdź usunięcie ćwiczenia i jego serii z bieżącego treningu.");
  const exercises = session.exercises.filter((_, i) => i !== index);
  const nextIndex = session.index > index ? session.index - 1 : Math.min(session.index, exercises.length - 1);
  return rebuild(session, exercises, Math.max(0, nextIndex));
}

export function editSessionTargets(session, index, values) {
  const targets = sessionTargets(values);
  if (!session.exercises[index]) throw new Error("Nie znaleziono ćwiczenia w rozpoczętym treningu.");
  return { ...session, exercises: session.exercises.map((e, i) => i === index ? {
    ...e, targetSets: targets.sets, reps: targets.reps, rest: targets.rest,
    // A smaller goal never discards rows or changes already entered results.
    sets: [...e.sets, ...Array.from({ length: Math.max(0, targets.sets - e.sets.length) }, () => ({ weight: "", reps: String(targets.reps), completed: false }))],
  } : e) };
}

export function addSessionSet(session, index) {
  const exercise = session.exercises[index];
  if (!exercise || exercise.skipped) throw new Error("Cofnij pominięcie ćwiczenia, aby dodać serię.");
  return { ...session, exercises: session.exercises.map((e, i) => i === index ? {
    ...e, activeSetIndex: e.sets.length, sets: [...e.sets, { weight: "", reps: String(e.reps), completed: false }],
  } : e) };
}
