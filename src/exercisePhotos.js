import { catalog } from "./catalog.js";
// Generated for Pakiernia, 2026-10-29. Each atlas contains six specific exercises.
// Match the full name so renaming a custom exercise never assigns the wrong photo.
const names = [
  "Wyciskanie hantli na skosie", "Ściąganie drążka wyciągu",
  "Przysiad ze sztangą", "Wyciskanie żołnierskie",
  "Uginanie przedramion z hantlami", "Prostowanie ramion na wyciągu",
];
export function exercisePhotoStyle(exercise) {
  const aliases = { "Hip thrust": "Unoszenie bioder ze sztangą", "Face pull": "Przyciąganie liny do twarzy" };
  const name = aliases[exercise.name] || exercise.name;
  let index = names.indexOf(name), atlas = 1;
  if (index < 0) {
    const catalogIndex = catalog.findIndex(e => e.name === name);
    if (catalogIndex < 0) return null;
    atlas = Math.floor(catalogIndex / 6) + 2;
    index = catalogIndex % 6;
  }
  const filename = atlas === 1 ? "exercise-photos-v1.webp" : `exercise-photos-v1-${atlas}.webp`;
  return { backgroundImage: `url("/${filename}")`,
    backgroundPosition: `${index % 2 * 100}% ${Math.floor(index / 2) * 50}%` };
}
