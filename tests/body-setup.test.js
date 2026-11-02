import test from "node:test";
import assert from "node:assert/strict";
import { completeBodySetup, deferBodySetup } from "../src/bodySetup.js";
import { normalizeData } from "../src/training.js";
import { bodyModelCapabilities } from "../src/bodyModelAdapter.js";

const defaults = { plans: [], exercises: [], measurements: [], workouts: [], completedDays: [] };
const today = "2026-11-02", now = new Date(`${today}T12:00:00`).getTime();
test("setup is offered only for a new empty snapshot; old accounts remain unchanged", () => {
  assert.equal(normalizeData({}, defaults).bodySetup.status, "pending");
  const legacy = { ...defaults, measurements: [{ id: "old", date: "2026-10-01", biceps: 35 }], extra: "keep" };
  const restored = normalizeData(legacy, defaults);
  assert.equal(restored.bodySetup, undefined);
  assert.deepEqual(restored.measurements, legacy.measurements);
  assert.equal(restored.extra, "keep");
  assert.equal(normalizeData(deferBodySetup(normalizeData({}, defaults)), defaults).bodySetup.status, "deferred");
});
test("setup atomically adds real optional readings and preserves history, profile extras and source snapshot", () => {
  const data = { ...defaults, keep: true, measurements: [{ id: "legacy", date: "2026-10-01", biceps: 35 }], bodyProfile: { model: "neutral", build: "slim", goal: "strength", goalStartedOn: "2026-10-01", targetWeight: 80, keep: 1 } };
  const original = structuredClone(data);
  const next = completeBodySetup(data, { model: "female", heightCm: "170", goal: "loss", weight: "75,5", waist: "85" }, today, now);
  assert.deepEqual(data, original);
  assert.equal(next.measurements.length, 2);
  assert.equal(next.measurements[0].weight, 75.5);
  assert.equal(next.measurements[0].waist, 85);
  assert.equal(next.measurements[0].bicepsLeft, undefined);
  assert.deepEqual(next.measurements[1], original.measurements[0]);
  assert.equal(next.bodyProfile.keep, 1);
  assert.equal(next.bodyProfile.sex, undefined);
  assert.equal(next.bodyProfile.weight, undefined);
  assert.equal(next.bodyGoalHistory.length, 2);
  assert.equal(next.bodyGoalHistory[0].goal, "strength");
  assert.equal(next.bodySetup.status, "completed");
  assert.equal(next.keep, true);
});
test("setup can finish without any readings, rejects invalid values and concurrent profile edits", () => {
  const draft = { model: "neutral", heightCm: "", goal: "", weight: "" };
  const next = completeBodySetup(defaults, draft, today, now);
  assert.deepEqual(next.measurements, []);
  assert.equal(next.bodyProfile.model, "neutral");
  assert.throws(() => completeBodySetup(defaults, { ...draft, weight: "bad" }, today, now), /Nieprawidłowy/);
  assert.throws(() => completeBodySetup(defaults, { ...draft, heightCm: "400" }, today, now), /wzrost/);
  assert.throws(() => completeBodySetup({ ...defaults, bodyProfile: { model: "male" } }, draft, today, now, {}), /Profil zmienił/);
});
test("four final asset paths exist, neutral has no implied sex or illustration and shape never deforms", async () => {
  const { access } = await import("node:fs/promises");
  for (const model of ["male", "female"]) {
    const capability = bodyModelCapabilities(model);
    assert.equal(capability.staticAvailable, true);
    for (const view of ["front", "back"]) await access(new URL(`../public${capability[view]}`, import.meta.url));
    assert.equal(capability.canDeform, false);
    assert.equal(capability.canCompareValues, true);
  }
  assert.equal(bodyModelCapabilities("neutral").staticAvailable, false);
});
