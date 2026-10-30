export const formatClock = seconds => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export function workoutElapsedSeconds(session, now = Date.now()) {
  if (!session) return 0;
  const end = session.pausedAt ?? now;
  return Math.max(0, Math.floor((end - session.startedAt - (session.pausedDurationMs || 0)) / 1000));
}

export function pauseWorkoutClock(session, now = Date.now()) {
  return session.pausedAt != null ? session : { ...session, pausedAt: Math.max(session.startedAt, now) };
}

export function resumeWorkoutClock(session, now = Date.now()) {
  if (session.pausedAt == null) return session;
  return { ...session, pausedAt: null,
    pausedDurationMs: (session.pausedDurationMs || 0) + Math.max(0, now - session.pausedAt) };
}

export function startSessionRest(session, seconds, exerciseName, now = Date.now()) {
  if (!Number.isInteger(seconds) || seconds < 0 || seconds > 3600) throw new Error("Podaj przerwę od 0 do 3600 sekund.");
  return { ...session, restUntil: now + seconds * 1000, restPausedRemainingMs: null, restExerciseName: exerciseName };
}

const restRemainingMs = (session, now) => session?.restPausedRemainingMs != null
  ? Math.max(0, session.restPausedRemainingMs) : Math.max(0, (session?.restUntil || 0) - now);
export const restRemainingSeconds = (session, now = Date.now()) => Math.ceil(restRemainingMs(session, now) / 1000);

export function pauseSessionRest(session, now = Date.now()) {
  if (session.restPausedRemainingMs != null) return session;
  const remaining = restRemainingMs(session, now);
  return remaining > 0 ? { ...session, restUntil: null, restPausedRemainingMs: remaining } : session;
}

export function resumeSessionRest(session, now = Date.now()) {
  if (session.restPausedRemainingMs == null) return session;
  return { ...session, restUntil: now + Math.max(0, session.restPausedRemainingMs), restPausedRemainingMs: null };
}

export function extendSessionRest(session, seconds = 15, now = Date.now()) {
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > 3600) throw new Error("Podaj poprawne wydłużenie przerwy.");
  if (session.restPausedRemainingMs != null) return { ...session, restPausedRemainingMs: Math.max(0, session.restPausedRemainingMs) + seconds * 1000 };
  return { ...session, restUntil: Math.max(now, session.restUntil || 0) + seconds * 1000 };
}

export const skipSessionRest = session => ({ ...session, restUntil: null, restPausedRemainingMs: null });
