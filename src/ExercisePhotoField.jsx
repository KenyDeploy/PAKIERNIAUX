import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { isCustomPhoto, prepareExercisePhoto } from "./photoUpload.js";

export function ExercisePhotoField({ value, onChange, onBusy }) {
  const id = useId();
  const sequence = useRef(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => { sequence.current++; onBusy(false); }, [onBusy]);
  const select = async event => {
    const input = event.currentTarget, file = input.files?.[0];
    if (!file) return;
    const token = ++sequence.current;
    setError(""); setBusy(true); onBusy(true);
    try {
      const photo = await prepareExercisePhoto(file);
      if (token === sequence.current) onChange(photo);
    } catch (cause) { if (token === sequence.current) setError(cause.message); }
    finally { if (token === sequence.current) { setBusy(false); onBusy(false); input.value = ""; } }
  };
  return <div className="exercise-photo-field">
    <span>Zdjęcie ćwiczenia <small>opcjonalnie</small></span>
    {isCustomPhoto(value) && <img src={value} alt="Podgląd zdjęcia ćwiczenia" />}
    <div className="photo-picker-actions">
      <label className="photo-file-label" htmlFor={id}><ImagePlus size={18} />{busy ? "Przygotowuję zdjęcie…" : value ? "Zmień zdjęcie" : "Wybierz zdjęcie"}
        <input id={id} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={select} />
      </label>
      {value && <button type="button" disabled={busy} className="photo-remove" onClick={() => { setError(""); onChange(null); }}><Trash2 size={16} /> Usuń zdjęcie</button>}
    </div>
    <small>JPG, PNG lub WebP · do 10 MB.</small>
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
