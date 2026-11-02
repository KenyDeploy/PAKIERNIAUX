import { bodyMetrics } from "./bodyMeasurements.js";
import { bodyAnchors, bodyModelCapabilities } from "./bodyModelAdapter.js";
import { BodySilhouette } from "./BodySilhouette";

const format = value => value == null ? "—" : value.toLocaleString("pl-PL", { maximumFractionDigits: 1 });
export function BodyModelView({ model, view, state, selected, onSelect }) {
  const adapter = bodyModelCapabilities(model);
  const image = adapter.staticAvailable ? adapter[view] : null;
  const points = bodyMetrics.filter(metric => metric.key in bodyAnchors[view]);
  const buttons = points.map(metric => {
    const value = state.values[metric.key], source = state.sources[metric.key];
    return <button type="button" className={`body-hotspot${selected === metric.key ? " selected" : ""}`} key={metric.key} aria-pressed={selected === metric.key}
      aria-label={`${metric.label}: ${value == null ? "brak pomiaru" : `${format(value)} ${metric.unit}`}`} onClick={() => onSelect(metric.key)}>
      <span className="body-hotspot-dot" /><span className="body-hotspot-label">{metric.label}<b>{format(value)} {value == null ? "" : metric.unit}</b>{source && <small>{source.date}</small>}</span>
    </button>;
  });
  return <section className="body-model-view" aria-label={`Sylwetka — ${view === "front" ? "przód" : "tył"}`}>
    <div className="body-model-canvas" data-testid={image ? "body-illustration" : "temporary-body-model"}>
      {image ? <img src={image} alt={`Model ${adapter.label} — ${view === "front" ? "przód" : "tył"}`} /> : <BodySilhouette model={model} view={view}/>}
      {buttons.map((button,index) => <span key={points[index].key} className="body-point-position" style={{left:`${bodyAnchors[view][points[index].key][0]}%`,top:`${bodyAnchors[view][points[index].key][1]}%`}}>{button}</span>)}
    </div>
    <p className="body-illustration-caption">{image ? "Ilustracja statyczna" : "Schemat tymczasowy SVG"} · dotknij punktu pomiarowego</p>
  </section>;
}
