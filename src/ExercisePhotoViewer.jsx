import { useRef } from "react";
import { X } from "lucide-react";
import { DialogSheet } from "./DialogSheet";
import { ExerciseVisual } from "./Visuals";
import { exercisePhotoStyle } from "./exercisePhotos";
import { isCustomPhoto } from "./photoUpload.js";
import "./WorkoutMedia.css";

export function ExercisePhotoViewer({ exercise, onClose }) {
  const photo = exercisePhotoStyle(exercise);
  const swipe = useRef(null);
  const pointers = useRef(new Set());
  const down = event => {
    if (event.pointerType !== "touch") return;
    pointers.current.add(event.pointerId);
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Synthetic/inactive pointers need no capture. */ }
    swipe.current = pointers.current.size === 1 && event.pointerType === "touch" ? { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp } : null;
  };
  const up = event => {
    const start = swipe.current;
    if (start?.id === event.pointerId && pointers.current.size === 1) {
      const dy = event.clientY - start.y, dx = Math.abs(event.clientX - start.x);
      if (dy >= 120 && dy > dx * 1.5 && event.timeStamp - start.time < 800) onClose();
    }
    pointers.current.delete(event.pointerId); swipe.current = null;
  };
  return <DialogSheet labelledBy="exercise-photo-title" onClose={onClose} className="exercise-photo-viewer" backdropClassName="photo-viewer-backdrop">
    <header className="sheet-header"><h2 id="exercise-photo-title">Zdjęcie ćwiczenia</h2><button type="button" className="icon-button" aria-label="Zamknij zdjęcie" onClick={onClose}><X size={24} /></button></header>
    <div className="photo-viewer-stage" onPointerDown={down} onPointerUp={up} onPointerCancel={event => { pointers.current.delete(event.pointerId); swipe.current = null; }}>{isCustomPhoto(exercise.customPhoto) ? <img src={exercise.customPhoto} alt={exercise.name} draggable="false" /> : photo ? <div className="exercise-photo-expanded" role="img" aria-label={exercise.name} style={photo} /> : <ExerciseVisual exercise={exercise} />}</div>
    <footer className="photo-viewer-caption"><h3>{exercise.name}</h3><p>{exercise.category}</p><small>{isCustomPhoto(exercise.customPhoto) ? "Twoje zdjęcie" : photo ? "Wizualizacja AI" : "Ilustracja partii mięśniowej"}</small></footer>
  </DialogSheet>;
}
