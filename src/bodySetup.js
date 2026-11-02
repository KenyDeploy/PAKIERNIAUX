import { bodyMetrics, saveBodyMeasurement, saveBodyProfile } from "./bodyMeasurements.js";

// One atomic snapshot update: no second copy of weight, no migration of old readings.
export function completeBodySetup(data, draft, today, now = Date.now(), expected = data.bodyProfile || {}) {
  const profile = data.bodyProfile || {};
  let next = saveBodyProfile(data, {
    ...profile, model: draft.model, build: profile.build || "average",
    heightCm: draft.heightCm, goal: draft.goal,
    targetWeight: draft.goal === profile.goal ? profile.targetWeight : null,
    goalStartedOn: draft.goal ? (draft.goal === profile.goal && profile.goalStartedOn || today) : null,
  }, expected, now);
  const readings = Object.fromEntries(bodyMetrics.filter(metric => metric.key in draft).map(metric => [metric.key, draft[metric.key]]));
  if (Object.values(readings).some(value => value != null && String(value).trim() !== "")) {
    next = saveBodyMeasurement(next, { ...readings, date: today, note: "Pomiar z konfiguracji profilu" }, null, now);
  }
  return { ...next, bodySetup: { ...data.bodySetup, status: "completed", completedAt: now } };
}

export function deferBodySetup(data) {
  return { ...data, bodySetup: { ...data.bodySetup, status: "deferred" } };
}
