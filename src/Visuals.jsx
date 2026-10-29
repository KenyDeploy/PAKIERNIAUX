import React, { useState } from "react";
import { measurementChange } from "./training";
import { exercisePhotoStyle } from "./exercisePhotos";

const metrics = [["weight", "Masa ciała", "kg"], ["biceps", "Biceps", "cm"], ["chest", "Klatka", "cm"], ["waist", "Talia", "cm"], ["thigh", "Udo", "cm"]];
const fmt = value => value == null ? "—" : Number(value).toLocaleString("pl-PL", { maximumFractionDigits: 1 });
export function BodyProgress({ measurements }) {
  const [selected, setSelected] = useState("biceps");
  return <section className="card body-progress"><div className="card-head"><div><span className="eyebrow">MAPA POMIARÓW</span><h2>Twoja sylwetka</h2></div></div>
    <div className="body-map-layout">
      <svg className="body-map" viewBox="0 0 180 330" role="img" aria-label="Sylwetka z zaznaczonymi miejscami pomiarów">
        <defs><linearGradient id="bodyFill" x2="1" y2="1"><stop stopColor="#384733"/><stop offset="1" stopColor="#141d16"/></linearGradient></defs>
        <g fill="url(#bodyFill)" stroke="#75876a" strokeWidth="1.4">
          <ellipse cx="90" cy="30" rx="20" ry="24" />
          <path d="M79 53 L77 65 Q57 65 49 76 L35 130 L23 169 Q22 177 30 178 L44 147 L57 111 L64 150 L62 177 L57 217 L63 303 Q66 311 74 302 L83 224 L90 192 L97 224 L106 302 Q114 311 117 303 L123 217 L118 177 L116 150 L123 111 L136 147 L150 178 Q158 177 157 169 L145 130 L131 76 Q123 65 103 65 L101 53" />
        </g>
        <g fill="none" stroke="#8ca17c" strokeWidth="1" opacity=".6"><path d="M66 91 Q90 106 114 91 M90 78 V151 M69 123 Q90 130 111 123 M65 153 Q90 161 115 153 M64 183 L83 204 M116 183 L97 204" /></g>
        {[[48,108,"biceps"],[90,93,"chest"],[90,151,"waist"],[69,221,"thigh"]].map(([x,y,key]) => <g key={key}><circle cx={x} cy={y} r="10" fill={selected === key ? "#c8ff00" : "#4b6838"} opacity=".25"/><circle cx={x} cy={y} r="4" fill={selected === key ? "#c8ff00" : "#9aba82"}/></g>)}
      </svg>
      <div className="body-metrics">{metrics.map(([key,label,unit]) => {
        const change = measurementChange(measurements, key);
        return <button type="button" key={key} className={selected === key ? "selected" : ""} onClick={() => setSelected(key)}>
          <span>{label}</span><b>{fmt(change.latest)} <small>{unit}</small></b>
          <small className="measurement-delta">{change.delta == null ? "Potrzebne 2 pomiary" : `${change.delta > 0 ? "+" : ""}${fmt(change.delta)} ${unit} od poprzedniego`}</small>
        </button>;
      })}</div>
    </div><p className="muted body-note">Zmiana oznacza różnicę między dwoma ostatnimi dostępnymi pomiarami danej partii. Kierunek zmiany oceniaj zgodnie ze swoim celem.</p>
  </section>;
}
export function TrendChart({ points, unit }) {
  const [active, setActive] = useState(null);
  if (!points.length) return <p className="empty-state">Brak zapisanych wyników w tym okresie.</p>;
  const values = points.map(p => Number(p.value)), low = Math.min(...values), high = Math.max(...values);
  const padding = Math.max(1, (high - low) * .15), min = Math.max(0, low - padding), max = high + padding;
  const x = i => points.length === 1 ? 160 : 35 + i / (points.length - 1) * 260;
  const y = value => 135 - (value - min) / (max - min || 1) * 100;
  const selected = points[Math.min(active ?? points.length - 1, points.length - 1)];
  return <div className="trend-chart"><div className="chart-value" aria-live="polite">{selected.date} · <b>{fmt(selected.value)} {unit}</b></div>
    <svg viewBox="0 0 320 160" role="img" aria-label={`Wykres ${unit}: ${points.map(p => `${p.date}: ${p.value}`).join(", ")}`}>
      {[min, (min + max)/2, max].map((v,i) => <g key={i}><line x1="35" x2="300" y1={y(v)} y2={y(v)} stroke="#303b2c"/><text x="0" y={y(v)+4} fill="#98a58e" fontSize="9">{fmt(v)}</text></g>)}
      <polyline points={points.map((p,i) => `${x(i)},${y(p.value)}`).join(" ")} fill="none" stroke="#c8ff00" strokeWidth="2.5" />
      {points.map((p,i) => <g key={i}><circle cx={x(i)} cy={y(p.value)} r="5" fill="#c8ff00"/><circle cx={x(i)} cy={y(p.value)} r="14" fill="transparent" tabIndex="0" role="button" aria-label={`${p.date}: ${p.value} ${unit}`} onFocus={() => setActive(i)} onClick={() => setActive(i)} onKeyDown={e => { if(e.key === "Enter" || e.key === " ") { e.preventDefault(); setActive(i); } }} /></g>)}
    </svg><div className="chart-dates"><span>{points[0].date}</span><span>{points.at(-1).date}</span></div>
    <details className="chart-table"><summary>Pokaż wartości</summary>{points.map((p,i) => <div key={i}>{p.date}<b>{fmt(p.value)} {unit}</b></div>)}</details>
  </div>;
}
export function ExerciseVisual({ exercise }) {
  const photo = exercisePhotoStyle(exercise);
  if (photo) return <figure className="exercise-visual"><div className="exercise-photo" role="img" aria-label={exercise.name} style={photo} /><figcaption>{exercise.name} · wizualizacja AI</figcaption></figure>;
  const isLeg = exercise.category === "Nogi", isBack = exercise.category === "Plecy";
  return <figure className="exercise-visual">
    <svg viewBox="0 0 320 150" role="img" aria-label={`Ilustracja partii: ${exercise.category}`}>
      <defs><radialGradient id="exerciseGlow"><stop stopColor="#40592d" stopOpacity=".6"/><stop offset="1" stopColor="#111710" stopOpacity="0"/></radialGradient></defs>
      <ellipse cx="160" cy="90" rx="135" ry="65" fill="url(#exerciseGlow)"/>
      <path d="M60 136 H260" stroke="#44513a" strokeWidth="2"/>
      <g stroke="#99aa8b" strokeWidth="9" strokeLinecap="round" fill="none">
        <circle cx="162" cy="29" r="12" fill="#758b66" strokeWidth="2"/>
        <path d={isLeg ? "M162 49 L150 79 L177 99 L158 130 M150 79 L122 103 L130 130 M158 53 L129 43 L103 44 M158 53 L190 44 L213 44" : isBack ? "M162 49 V86 M162 57 L130 42 L117 17 M162 57 L194 42 L207 17 M162 86 L137 120 L117 129 M162 86 L187 120 L207 129" : "M162 49 V86 M162 57 L129 71 L110 52 M162 57 L195 71 L214 52 M162 86 L143 130 M162 86 L181 130"}/>
      </g>
      <g stroke="#c8ff00" strokeWidth="8" strokeLinecap="round"><path d={isLeg ? "M68 39 H249" : isBack ? "M91 12 H231" : "M95 44 H121 M203 44 H229"}/></g>
      <text x="16" y="23" fill="#c8ff00" fontSize="10" letterSpacing="2">{exercise.category.toUpperCase()}</text>
    </svg><figcaption>{exercise.equipment} · ilustracja partii mięśniowej</figcaption>
  </figure>;
}
