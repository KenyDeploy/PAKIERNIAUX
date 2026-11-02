import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Square } from "lucide-react";

export function WorkoutNavigation({ index, count, onPrevious, onNext, onFinish }) {
  const navigation = useRef(null);
  useEffect(()=>{
    const viewport=window.visualViewport;
    const position=()=>{
      if(!navigation.current)return;
      const shell=navigation.current.closest(".app-shell");
      shell?.style.setProperty("--workout-height",`${viewport?.height||window.innerHeight}px`);
      shell?.style.setProperty("--workout-top",`${viewport?.offsetTop||0}px`);
      shell?.classList.toggle("is-typing",Boolean(document.activeElement?.matches(".growing-series-list input")));
    };
    position(); viewport?.addEventListener("resize",position); viewport?.addEventListener("scroll",position); window.addEventListener("resize",position);document.addEventListener("focusin",position);document.addEventListener("focusout",position);
    const shell=navigation.current.closest(".app-shell");
    return ()=>{viewport?.removeEventListener("resize",position);viewport?.removeEventListener("scroll",position);window.removeEventListener("resize",position);document.removeEventListener("focusin",position);document.removeEventListener("focusout",position);shell?.style.removeProperty("--workout-height");shell?.style.removeProperty("--workout-top");shell?.classList.remove("is-typing");};
  },[]);
  return <nav ref={navigation} className="workout-navigation workout-action-dock" aria-label="Nawigacja treningu">
    <button type="button" className="secondary-cta workout-previous" disabled={index===0} aria-label="Poprzednie ćwiczenie" onClick={onPrevious}><ArrowLeft size={20}/></button>
    <button type="button" className="secondary-cta workout-next" disabled={index>=count-1} aria-label="Następne ćwiczenie" onClick={onNext}>Następne <ArrowRight size={18}/></button>
    <button type="button" className="secondary-cta workout-finish" aria-label="Zakończ trening" onClick={onFinish}><Square size={16}/> Zakończ</button>
  </nav>;
}
