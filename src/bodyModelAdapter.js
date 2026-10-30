// Only assets with verified provenance may be connected here. Never use body.png implicitly.
export const bodyModelRegistry = {
  male: { label: "męskiego", front: null, back: null, license: null, deformation: null },
  female: { label: "kobiecego", front: null, back: null, license: null, deformation: null },
  neutral: { label: "neutralnego", front: null, back: null, license: null, deformation: null },
};
export const bodyAnchors = {
  front: { shoulders: [50, 17], chest: [50, 28], waist: [50, 42], hips: [50, 52], bicepsLeft: [78, 33], bicepsRight: [22, 33], thighLeft: [62, 68], thighRight: [38, 68], calfLeft: [62, 86], calfRight: [38, 86] },
  back: { shoulders: [50, 17], chest: [50, 28], waist: [50, 42], hips: [50, 52], bicepsLeft: [22, 33], bicepsRight: [78, 33], thighLeft: [38, 68], thighRight: [62, 68], calfLeft: [38, 86], calfRight: [62, 86] },
};
export function bodyModelCapabilities(model) {
  const entry = Object.hasOwn(bodyModelRegistry, model) ? bodyModelRegistry[model] : bodyModelRegistry.neutral;
  return { ...entry, staticAvailable: Boolean(entry.front && entry.back && entry.license), canDeform: false, canCompareSlider: false };
}
export function prepareBodyTrend(before, after, profile) {
  const height = Number(profile?.heightCm);
  const inputs = [];
  if (Number.isFinite(height) && height > 0) for (const key of Object.keys(bodyAnchors.front)) {
    const from = before.values[key], to = after.values[key];
    if (from == null || to == null || from <= 0 || to <= 0) continue;
    inputs.push({ key, beforeCm: from, afterCm: to, deltaCm: to - from, deltaOverHeight: (to - from) / height, boundedTrend: Math.max(-0.035, Math.min(0.035, (to - from) / from)) });
  }
  // Inputs for a future calibrated adapter only; no raster scaling, muscle inference or predictions.
  return { status: "unsupported", canApply: false, heightCm: Number.isFinite(height) && height > 0 ? height : null, inputs,
    reason: "Brak zatwierdzonego modelu obsługującego miejscową deformację." };
}
