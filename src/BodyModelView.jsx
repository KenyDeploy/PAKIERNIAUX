import { bodyMetrics } from "./bodyMeasurements.js";
import { bodyAnchors, bodyModelCapabilities } from "./bodyModelAdapter.js";

const format = value => value == null ? "—" : value.toLocaleString("pl-PL", { maximumFractionDigits: 1 });
export function BodyModelView({ model, view, state, selected, onSelect }) {
  const adapter = bodyModelCapabilities(model);
  const image = adapter.staticAvailable ? adapter[view] : null;
  const points = bodyMetrics.filter(metric => metric.key in bodyAnchors[view]);
  const buttons = points.map(metric => {
    const anchor = bodyAnchors[view][metric.key], value = state.values[metric.key], source = state.sources[metric.key];
    return <button type="button" className={`body-hotspot${selected === metric.key ? " selected" : ""}`} key={metric.key} aria-pressed={selected === metric.key}
      aria-label={`${metric.label}: ${value == null ? "brak pomiaru" : `${format(value)} ${metric.unit}`}`} onClick={() => onSelect(metric.key)} style={image ? { left: `${anchor[0]}%`, top: `${anchor[1]}%` } : undefined}>
      <span className="body-hotspot-dot" /><span>{metric.label}<b>{format(value)} {value == null ? "" : metric.unit}</b>{source && <small>{source.date}</small>}</span>
    </button>;
  });
  return <section className="body-model-view" aria-label={`Sylwetka — ${view === "front" ? "przód" : "tył"}`}>
    {image ? <div className="body-model-canvas"><img src={image} alt={`Model ${adapter.label} — ${view === "front" ? "przód" : "tył"}`} />{buttons}</div> : <>
      <div className="body-model-missing" data-testid="missing-body-model"><h3>Brak zatwierdzonej grafiki modelu {adapter.label}</h3><p>{view === "front" ? "Widok przodu" : "Widok tyłu"} jest gotowy do podłączenia zasobu. Wybierz punkt pomiarowy poniżej.</p><small>Nie pokazujemy zastępczej anatomii ani nie rozciągamy obrazu.</small></div>
      <div className="body-hotspot-list" aria-label="Punkty pomiarowe">{buttons}</div>
    </>}
  </section>;
}
