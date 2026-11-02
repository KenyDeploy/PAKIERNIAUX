import { useState } from "react";
import { bodyMetrics } from "./bodyMeasurements.js";
import { bodyAnchors, bodyModelCapabilities } from "./bodyModelAdapter.js";

const format = value => value == null ? "—" : value.toLocaleString("pl-PL", { maximumFractionDigits: 1 });
export function BodyModelView({ model, view, state, comparison = [], selected, onSelect }) {
  const adapter = bodyModelCapabilities(model);
  const image = adapter.staticAvailable ? adapter[view] : null;
  const [failedImage, setFailedImage] = useState(null);
  const showImage = image && failedImage !== image;
  const anchors = bodyAnchors[model]?.[view] || bodyAnchors.male[view];
  const points = bodyMetrics.filter(metric => metric.key in anchors);
  const buttons = points.map(metric => {
    const value = state.values[metric.key], source = state.sources[metric.key];
    const changed = comparison.some(item => item.key === metric.key && item.delta != null && item.delta !== 0);
    return <button type="button" className={`body-hotspot${selected === metric.key ? " selected" : ""}`} key={metric.key} aria-pressed={selected === metric.key}
      data-available={value != null} data-changed={value != null && changed}
      aria-label={`${metric.label}: ${value == null ? "brak pomiaru" : `${format(value)} ${metric.unit}`}`} onClick={() => onSelect(metric.key)}>
      <span className="body-hotspot-dot"/><span className="body-hotspot-label">{metric.label}<b>{format(value)} {value == null ? "" : metric.unit}</b>{source && <small>{source.date}</small>}</span>
    </button>;
  });
  return <section className="body-model-view" aria-label={`Sylwetka — ${view === "front" ? "przód" : "tył"}`}>
    {showImage ? <div className="body-model-canvas" data-testid="body-illustration">
      <img src={image} width="1024" height="1536" alt={`Model ${adapter.label} — ${view === "front" ? "przód" : "tył"}`} onError={() => setFailedImage(image)}/>
      {buttons.map((button, index) => <span key={points[index].key} className="body-point-position" style={{ left: `${anchors[points[index].key][0]}%`, top: `${anchors[points[index].key][1]}%` }}>{button}</span>)}
    </div> : <div className="body-model-neutral" data-testid="neutral-body-model"><p>{model === "neutral" ? "Wariant neutralny: punkty i wartości bez postaci. Wybór nie określa płci biologicznej." : "Nie udało się wczytać ilustracji. Twoje pomiary są nadal dostępne."}</p><div className="body-hotspot-list">{buttons}</div></div>}
    <p className="body-illustration-caption">{showImage ? "Ilustracja statyczna · dotknij punktu pomiarowego" : "Wybierz pomiar"}</p>
  </section>;
}
