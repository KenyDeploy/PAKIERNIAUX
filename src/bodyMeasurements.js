import { dateKey, number } from "./training.js";

export const bodyMetrics = [
  { key: "weight", label: "Masa ciała", unit: "kg" },
  { key: "chest", label: "Klatka", unit: "cm" }, { key: "shoulders", label: "Barki", unit: "cm" },
  { key: "waist", label: "Talia", unit: "cm" }, { key: "hips", label: "Biodra", unit: "cm" },
  { key: "bicepsLeft", label: "Biceps lewy", unit: "cm" }, { key: "bicepsRight", label: "Biceps prawy", unit: "cm" },
  { key: "thighLeft", label: "Udo lewe", unit: "cm" }, { key: "thighRight", label: "Udo prawe", unit: "cm" },
  { key: "calfLeft", label: "Łydka lewa", unit: "cm" }, { key: "calfRight", label: "Łydka prawa", unit: "cm" },
  { key: "bodyFat", label: "Tkanka tłuszczowa (wpis ręczny)", unit: "%" },
];
export const legacyBodyMetrics = [{ key: "biceps", label: "Biceps — strona nieoznaczona", unit: "cm" }, { key: "thigh", label: "Udo — strona nieoznaczona", unit: "cm" }];
export const allBodyMetrics = [...bodyMetrics, ...legacyBodyMetrics];
export const bodyGoals = { muscle: "Budowa mięśni", loss: "Redukcja", recomp: "Rekompozycja", strength: "Siła", maintain: "Utrzymanie", fitness: "Ogólna sprawność" };
export const bodyBuilds = { slim: "Smukły", average: "Średni", athletic: "Atletyczny", larger: "Masywniejszy" };
export const modelNames = { male: "Męski", female: "Kobiecy", neutral: "Neutralny" };
export const bodyNumber = (row, key) => {
  const raw = row?.[key];
  if (raw == null || String(raw).trim() === "") return null;
  const value = number(raw);
  return Number.isFinite(value) && (key === "bodyFat" ? value >= 0 && value <= 100 : value > 0) ? value : null;
};
export function validBodyDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "") && dateKey(new Date(`${value}T12:00:00`)) === value;
}
export function datedMeasurements(rows, until = "9999-12-31") {
  return rows.filter(row => row && validBodyDate(row.date) && row.date <= until).map((row, index) => ({ row, index }))
    .sort((a, b) => b.row.date.localeCompare(a.row.date) || (b.row.updatedAt || b.row.createdAt || 0) - (a.row.updatedAt || a.row.createdAt || 0) || a.index - b.index).map(item => item.row);
}
export function bodyState(rows, date, exact = false) {
  const eligible = datedMeasurements(rows, date).filter(row => !exact || row.date === date);
  const values = {}, sources = {};
  for (const metric of allBodyMetrics) {
    const row = eligible.find(entry => bodyNumber(entry, metric.key) !== null);
    values[metric.key] = row ? bodyNumber(row, metric.key) : null;
    sources[metric.key] = row ? { id: row.id ?? null, date: row.date } : null;
  }
  return { date, values, sources };
}
export function compareBodyStates(before, after) {
  return allBodyMetrics.map(metric => ({ ...metric, before: before.values[metric.key], after: after.values[metric.key],
    delta: before.values[metric.key] == null || after.values[metric.key] == null ? null : Number((after.values[metric.key] - before.values[metric.key]).toFixed(3)) }));
}
export const measurementRef = (rows, row) => ({ id: row.id, index: rows.indexOf(row), signature: JSON.stringify(row) });
function locate(rows, ref) {
  const index = ref.id != null ? rows.findIndex(row => row.id === ref.id) : ref.index;
  if (index < 0 || JSON.stringify(rows[index]) !== ref.signature) throw new Error("Pomiar zmienił się. Otwórz go ponownie przed edycją lub usunięciem.");
  return index;
}
export function saveBodyMeasurement(data, draft, ref = null, now = Date.now()) {
  if (!validBodyDate(draft.date) || draft.date > dateKey(now)) throw new Error("Wybierz prawdziwą datę pomiaru, nie późniejszą niż dzisiaj.");
  const index = ref ? locate(data.measurements, ref) : -1;
  const original = index >= 0 ? data.measurements[index] : {};
  const entry = { ...original, id: original.id ?? crypto.randomUUID(), date: draft.date, note: String(draft.note || "").trim(), ...(index < 0 ? { createdAt: now } : {}), updatedAt: now };
  for (const metric of allBodyMetrics) {
    // Preserve unedited legacy fields; never infer a side from the old biceps/thigh.
    if (!(metric.key in draft)) continue;
    const raw = draft[metric.key];
    if (raw == null || String(raw).trim() === "") entry[metric.key] = null;
    else {
      const value = bodyNumber(draft, metric.key);
      if (value === null) throw new Error(`Nieprawidłowy pomiar: ${metric.label}. Wpisz dodatnią liczbę; tkanka tłuszczowa: 0–100%.`);
      entry[metric.key] = value;
    }
  }
  if (!allBodyMetrics.some(metric => bodyNumber(entry, metric.key) !== null)) throw new Error("Wpisz przynajmniej jeden rzeczywisty pomiar.");
  const measurements = index >= 0 ? data.measurements.map((row, i) => i === index ? entry : row) : [entry, ...data.measurements];
  return { ...data, measurements: [...datedMeasurements(measurements), ...measurements.filter(row => !validBodyDate(row?.date))] };
}
export function deleteBodyMeasurement(data, ref) {
  const index = locate(data.measurements, ref);
  return { ...data, measurements: data.measurements.filter((_, i) => i !== index) };
}
const goalSignature = profile => JSON.stringify([profile.goal || "", profile.targetWeight ?? null, profile.goalStartedOn || null]);
export function saveBodyProfile(data, draft, expected = data.bodyProfile || {}, now = Date.now()) {
  const previous = data.bodyProfile || {};
  if (JSON.stringify(previous) !== JSON.stringify(expected)) throw new Error("Profil zmienił się. Otwórz formularz ponownie.");
  if (!Object.hasOwn(modelNames, draft.model) || !Object.hasOwn(bodyBuilds, draft.build) || (draft.goal && !Object.hasOwn(bodyGoals, draft.goal))) throw new Error("Wybierz dostępny model, budowę i cel.");
  const optional = (raw, max, label) => {
    if (raw == null || String(raw).trim() === "") return null;
    const value = number(raw);
    if (!Number.isFinite(value) || value <= 0 || value > max) throw new Error(`Sprawdź pole ${label} (wartość dodatnia, maks. ${max}).`);
    return value;
  };
  const profile = { ...previous, model: draft.model, build: draft.build, heightCm: optional(draft.heightCm, 300, "wzrost"),
    goal: draft.goal || "", targetWeight: optional(draft.targetWeight, 1000, "masa docelowa"), goalStartedOn: draft.goalStartedOn || null, updatedAt: now };
  if (profile.goal && !validBodyDate(profile.goalStartedOn)) throw new Error("Podaj datę rozpoczęcia celu.");
  if (!profile.goal && (profile.targetWeight !== null || profile.goalStartedOn)) throw new Error("Wybierz cel przed podaniem jego daty lub masy docelowej.");
  let history = Array.isArray(data.bodyGoalHistory) ? [...data.bodyGoalHistory] : [];
  if (goalSignature(profile) !== goalSignature(previous)) {
    if (!history.length && previous.goal) history.push({ id: crypto.randomUUID(), goal: previous.goal, targetWeight: previous.targetWeight ?? null, startedOn: previous.goalStartedOn || null, changedAt: null });
    history.push({ id: crypto.randomUUID(), goal: profile.goal, targetWeight: profile.targetWeight, startedOn: profile.goalStartedOn, changedAt: now });
  }
  return { ...data, bodyProfile: profile, bodyGoalHistory: history };
}
