import { bodyNumber, datedMeasurements } from "./bodyMeasurements.js";

// Only actual readings of this metric; missing sides and future records stay excluded.
export function measurementProgress(rows, key, until, selectedReading) {
  const all = datedMeasurements(rows, until).filter(row => bodyNumber(row, key) !== null);
  const selectedIndex = selectedReading ? all.indexOf(selectedReading) : 0;
  const readings = selectedIndex < 0 ? [] : all.slice(selectedIndex);
  const latest = readings[0] || null, previous = readings[1] || null, first = readings.at(-1) || null;
  const value = latest ? bodyNumber(latest, key) : null;
  const difference = row => latest && row ? Number((value - bodyNumber(row, key)).toFixed(3)) : null;
  return { readings, latest, previous, first, value, deltaPrevious: difference(previous), deltaStart: difference(first) };
}
