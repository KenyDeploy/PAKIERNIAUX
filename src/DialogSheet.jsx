import { useLayoutEffect, useRef, useState } from "react";

export function DialogSheet({ children, labelledBy, onClose, onSubmit, className = "" }) {
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  const [viewport, setViewport] = useState(null);
  const Panel = onSubmit ? "form" : "section";
  useLayoutEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus({ preventScroll: true });
    const visual = window.visualViewport;
    const resize = () => setViewport({ height: visual?.height || window.innerHeight, top: visual?.offsetTop || 0 });
    resize();
    visual?.addEventListener("resize", resize);
    visual?.addEventListener("scroll", resize);
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previousOverflow;
      visual?.removeEventListener("resize", resize);
      visual?.removeEventListener("scroll", resize);
      window.removeEventListener("resize", resize);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);
  const keys = event => {
    if (event.key === "Escape") { event.preventDefault(); close.current(); return; }
    if (event.key !== "Tab") return;
    const items = [...panel.current.querySelectorAll('button, input, select, textarea, summary, a[href], [tabindex="0"]')]
      .filter(element => !element.disabled && element.getClientRects().length > 0);
    const first = items[0], last = items.at(-1);
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) {
      event.preventDefault(); first.focus();
    }
  };
  return <div className="sheet-backdrop" style={viewport ? { height: viewport.height, top: viewport.top } : undefined}
    onPointerDown={event => { if (event.target === event.currentTarget) close.current(); }}>
    <Panel className={`dialog-sheet ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}
      ref={panel} tabIndex={-1} onKeyDown={keys} onSubmit={onSubmit}>{children}</Panel>
  </div>;
}
