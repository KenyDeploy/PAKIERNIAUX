// Original generated assets; provenance and exact prompts: docs/BODY_ASSETS_PROVENANCE.md.
const provenance = "Original OpenAI image_gen assets, generated for Pakiernia 2026-11-02; see docs/BODY_ASSETS_PROVENANCE.md";
export const bodyModelRegistry = {
  male: { label: "męski", front: "/body-models/male-front.webp", back: "/body-models/male-back.webp", license: provenance, deformation: null },
  female: { label: "kobiecy", front: "/body-models/female-front.webp", back: "/body-models/female-back.webp", license: provenance, deformation: null },
  neutral: { label: "neutralnego", front: null, back: null, license: null, deformation: null },
};
const front = { shoulders: [50, 21], chest: [50, 28], waist: [50, 39], hips: [50, 48], bicepsLeft: [68, 31], bicepsRight: [32, 31], thighLeft: [59, 62], thighRight: [41, 62], calfLeft: [59, 77], calfRight: [41, 77] };
const back = { shoulders: [50, 21], chest: [50, 28], waist: [50, 39], hips: [50, 48], bicepsLeft: [32, 31], bicepsRight: [68, 31], thighLeft: [41, 62], thighRight: [59, 62], calfLeft: [41, 77], calfRight: [59, 77] };
export const bodyAnchors = {
  male: { front, back },
  female: {
    front: { ...front, waist: [50, 37], hips: [50, 47], thighLeft: [59, 60], thighRight: [41, 60] },
    back: { ...back, waist: [50, 37], hips: [50, 47], thighLeft: [41, 60], thighRight: [59, 60] },
  },
};
export function bodyModelCapabilities(model) {
  const entry = Object.hasOwn(bodyModelRegistry, model) ? bodyModelRegistry[model] : bodyModelRegistry.neutral;
  return { ...entry, staticAvailable: Boolean(entry.front && entry.back && entry.license), temporaryAvailable: false, canDeform: false, canCompareSlider: false, canCompareValues: true };
}
export function prepareBodyTrend(before, after, profile) {
  const height = Number(profile?.heightCm);
  const inputs = [];
  if (Number.isFinite(height) && height > 0) for (const key of Object.keys(front)) {
    const from = before.values[key], to = after.values[key];
    if (from == null || to == null || from <= 0 || to <= 0) continue;
    inputs.push({ key, beforeCm: from, afterCm: to, deltaCm: to - from, deltaOverHeight: (to - from) / height, boundedTrend: Math.max(-0.035, Math.min(0.035, (to - from) / from)) });
  }
  // Inputs for a future calibrated adapter only; no raster scaling, muscle inference or predictions.
  return { status: "unsupported", canApply: false, heightCm: Number.isFinite(height) && height > 0 ? height : null, inputs,
    reason: "Brak zatwierdzonego modelu obsługującego miejscową deformację." };
}
