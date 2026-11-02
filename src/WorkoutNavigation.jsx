import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Square } from "lucide-react";

export function WorkoutNavigation({ index, count, onPrevious, onNext, onFinish }) {
  const navigation = useRef(null);
  useEffect(()=>{
    const viewport=window.visualViewport;
    const position=()=>{
      if(!navigation.current)return;
      const covered=Math.max(0,window.innerHeight-(viewport?.offsetTop||0)-(viewport?.height||window.innerHeight));
      navigation.current.style.bottom=`${covered}px`;
    };
    position(); viewport?.addEventListener("resize",position); viewport?.addEventListener("scroll",position);
    return ()=>{viewport?.removeEventListener("resize",position);viewport?.removeEventListener("scroll",position);};
  },[]);
  return <nav ref={navigation} className="workout-navigation workout-action-dock" aria-label="Nawigacja treningu">
    <button type="button" className="secondary-cta workout-previous" disabled={index===0} aria-label="Poprzednie ćwiczenie" onClick={onPrevious}><ArrowLeft size={20}/></button>
    <button type="button" className="secondary-cta workout-next" disabled={index>=count-1} aria-label="Następne ćwiczenie" onClick={onNext}>Następne <ArrowRight size={18}/></button>
    <button type="button" className="secondary-cta workout-finish" aria-label="Zakończ trening" onClick={onFinish}><Square size={16}/> Zakończ</button>
  </nav>;
}
