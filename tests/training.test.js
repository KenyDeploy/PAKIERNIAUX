import test from "node:test";
import assert from "node:assert/strict";
import { createSession, completeSession, lastExercise, measurementChange, normalizeData, weekDates, currentStreak } from "../src/training.js";
const exercises = [{ id: 3, name: "Przysiad", sets: 4, reps: 6, rest: 150 }];
const plan = { id: 1, exercises: [3] };
test("four-set workout stores only confirmed sets and calculates volume", () => {
  const s = createSession(plan, exercises, [], 1000);
  assert.equal(s.exercises[0].sets.length, 4);
  s.exercises[0].sets[0] = { weight: "22,5", reps: "8", completed: true };
  s.exercises[0].sets[1] = { weight: "50", reps: "6", completed: false };
  const result = completeSession(s, 61000);
  assert.equal(result.volume, 180); assert.equal(result.durationSeconds, 60);
  assert.equal(result.exercises[0].sets.length, 1);
  assert.equal(s.exercises[0].sets.length, 4);
});
test("previous results seed next session by exercise ID, without auto-completion", () => {
  const s = createSession(plan, exercises, [], 1000);
  s.exercises[0].sets[0] = { weight: "60", reps: "7", completed: true };
  const history = [completeSession(s, 61000)];
  const next = createSession(plan, exercises, history);
  assert.equal(next.exercises[0].sets[0].weight, "60");
  assert.equal(next.exercises[0].sets[0].completed, false);
  assert.equal(lastExercise(history, 3).sets[0].reps, "7");
  assert.equal(completeSession(next), null);
});
test("plan-specific targets override exercise defaults", () => {
  const s = createSession({ ...plan, targets: { 3: { sets: 5, reps: 12, rest: 60 } } }, exercises, []);
  assert.equal(s.exercises[0].sets.length, 5);
  assert.equal(s.exercises[0].sets[0].reps, "12");
  assert.equal(s.exercises[0].rest, 60);
});
test("measurements compare latest available values without converting omissions to zero", () => {
  assert.deepEqual(measurementChange([{date:"2026-10-29",biceps:38},{date:"2026-10-26",biceps:null},{date:"2026-10-22",biceps:37}], "biceps"), { latest:38,previous:37,delta:1,previousDate:"2026-10-22" });
  assert.equal(measurementChange([], "weight").delta, null);
});
test("calendar crosses months and streak is current rather than all-time longest", () => {
  assert.deepEqual(weekDates(new Date(2026,10,1)), ["2026-10-26","2026-10-27","2026-10-28","2026-10-29","2026-10-30","2026-10-31","2026-11-01"]);
  assert.equal(currentStreak(["2026-10-31","2026-11-01"], new Date(2026,10,1)), 2);
  assert.equal(currentStreak(["2026-10-01","2026-10-02","2026-10-03"], new Date(2026,10,1)), 0);
});
test("migration preserves undated legacy data and explicit empty arrays", () => {
  const d = normalizeData({ completedDays:[1,3], measurements:[{date:"Dzisiaj",weight:86}], plans:[], customKey:42 }, { plans:[plan], exercises, measurements:[], workouts:[], completedDays:[] });
  assert.deepEqual(d.plans, []); assert.deepEqual(d.completedDays, []);
  assert.deepEqual(d.legacyCompletedDays, [1,3]);
  assert.equal(d.legacyMeasurements.length, 1); assert.equal(d.measurements.length, 0);
  assert.equal(d.customKey, 42);
});
