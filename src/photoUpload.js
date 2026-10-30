export const MAX_PHOTO_BYTES = 80 * 1024;
export const MAX_PHOTO_DATA_LENGTH = Math.ceil(MAX_PHOTO_BYTES / 3) * 4 + 23;
export const isCustomPhoto = value => typeof value === "string" && value.length <= MAX_PHOTO_DATA_LENGTH && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value);

export async function prepareExercisePhoto(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Wybierz zdjęcie JPG, PNG lub WebP.");
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error("Wybierz zdjęcie o rozmiarze do 10 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url;
    try { await image.decode(); } catch { throw new Error("Nie można odczytać zdjęcia. Spróbuj innego pliku."); }
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("Zdjęcie nie ma poprawnych wymiarów.");
    const canvas = document.createElement("canvas");
    for (const size of [640, 480, 320]) {
      const ratio = Math.min(1, size / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Przeglądarka nie obsługuje przygotowania zdjęcia.");
      context.fillStyle = "#131613"; context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.82, 0.65, 0.45]) {
        const result = canvas.toDataURL("image/jpeg", quality);
        if (isCustomPhoto(result)) return result;
      }
    }
    throw new Error("Nie udało się zmniejszyć zdjęcia. Wybierz inne.");
  } finally { URL.revokeObjectURL(url); }
}
