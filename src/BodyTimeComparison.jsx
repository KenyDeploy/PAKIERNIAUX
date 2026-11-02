export function BodyTimeComparison({ which, onChange, from, to, enabled, dateLabel }) {
  const label = which === "then" ? "Wtedy" : "Teraz";
  return <div className="body-time-slider">
    <label htmlFor="body-time-position">Wtedy / Teraz — wybierz zapis</label>
    <input id="body-time-position" type="range" min="0" max="1" step="1" value={which === "then" ? 0 : 1} disabled={!enabled}
      aria-valuetext={`${label}: ${dateLabel(which === "then" ? from : to)}`} onChange={event => onChange(event.target.value === "0" ? "then" : "now")}/>
    <div><button type="button" aria-pressed={which === "then"} onClick={() => onChange("then")}>Wtedy</button><button type="button" aria-pressed={which === "now"} onClick={() => onChange("now")}>Teraz</button></div>
    <output htmlFor="body-time-position" aria-live="polite">{label} · {dateLabel(which === "then" ? from : to)}</output>
  </div>;
}
