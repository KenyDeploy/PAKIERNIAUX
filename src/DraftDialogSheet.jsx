import { useLayoutEffect, useRef, useState } from "react";
import { DialogSheet } from "./DialogSheet";

// Keep the original inputs mounted. A single sheet owns focus and the scroll lock.
export function DraftDialogSheet({ dirty, onClose, onSubmit, labelledBy, children, ...props }) {
  const [asking, setAsking] = useState(false);
  const previousFocus = useRef(null), continueButton = useRef(null);
  const requestClose = () => {
    if (asking) { setAsking(false); return; }
    if (!dirty) { onClose(); return; }
    previousFocus.current = document.activeElement;
    setAsking(true);
  };
  useLayoutEffect(() => {
    if (asking) continueButton.current?.focus({ preventScroll: true });
    else if (previousFocus.current?.isConnected) { previousFocus.current.focus({ preventScroll: true }); previousFocus.current = null; }
  }, [asking]);
  return <DialogSheet {...props} labelledBy={asking ? `${labelledBy}-draft-close` : labelledBy} onClose={requestClose}
    onSubmit={onSubmit ? event => { if (asking) event.preventDefault(); else onSubmit(event); } : undefined}>
    <div style={{ display: asking ? "none" : "contents" }} aria-hidden={asking || undefined} inert={asking || undefined}>
      {children(requestClose)}
    </div>
    {asking && <>
      <header className="sheet-header"><h2 id={`${labelledBy}-draft-close`}>Masz niezapisane zmiany</h2></header>
      <div className="sheet-body"><p>Twój szkic jest zachowany. Możesz kontynuować edycję albo świadomie go odrzucić.</p></div>
      <footer className="sheet-footer"><button type="button" ref={continueButton} className="primary-cta" onClick={() => setAsking(false)}>Kontynuuj edycję</button><button type="button" className="workout-menu-action session-remove-action" onClick={onClose}>Odrzuć szkic</button></footer>
    </>}
  </DialogSheet>;
}
