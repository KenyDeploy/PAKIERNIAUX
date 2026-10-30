import { useState } from "react";
import { Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import { DialogSheet } from "./DialogSheet";
import { TrendChart } from "./Visuals";
import { BodyModelView } from "./BodyModelView";
import { BodyProfileEditor } from "./BodyProfileEditor";
import { BodyMeasurementEditor } from "./BodyMeasurementEditor";
import { allBodyMetrics, bodyNumber, bodyState, bodyGoals, compareBodyStates, datedMeasurements, deleteBodyMeasurement, measurementRef, modelNames } from "./bodyMeasurements.js";
import { prepareBodyTrend } from "./bodyModelAdapter.js";
import "./Measurements.css";

const format = value => value == null ? "—" : value.toLocaleString("pl-PL", { maximumFractionDigits: 1 });
const dateLabel = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString("pl-PL") : "—";
export function MeasurementsPage({ data, today, onPersist }) {
  const [tab, setTab] = useState("figure"), [metricKey, setMetric] = useState("waist"), [view, setView] = useState("front");
  const [dialog, setDialog] = useState(null), [entry, setEntry] = useState(null), [error, setError] = useState("");
  const [compare, setCompare] = useState(false), [which, setWhich] = useState("now");
  const [chosenFrom, setFrom] = useState(""), [chosenTo, setTo] = useState("");
  const rows = datedMeasurements(data.measurements, today), profile = data.bodyProfile || {};
  const metrics = allBodyMetrics.filter(metric => !["biceps", "thigh"].includes(metric.key) || rows.some(row => bodyNumber(row, metric.key) !== null));
  const metric = metrics.find(item => item.key === metricKey) || metrics[0];
  const current = bodyState(data.measurements, today);
  const dates = [...new Set(rows.map(row => row.date))].sort();
  const to = dates.includes(chosenTo) ? chosenTo : dates.at(-1) || "";
  const candidateFrom = dates.includes(chosenFrom) ? chosenFrom : dates.at(-2) || to;
  const from = candidateFrom > to ? to : candidateFrom;
  const before = bodyState(rows, from, true), after = bodyState(rows, to, true);
  const compared = compareBodyStates(before, after);
  const shown = compare && dates.length ? which === "then" ? before : after : current;
  const previous = rows.filter(row => bodyNumber(row, metric.key) !== null);
  const delta = previous.length > 1 ? Number((bodyNumber(previous[0], metric.key) - bodyNumber(previous[1], metric.key)).toFixed(3)) : null;
  const trend = prepareBodyTrend(before, after, profile);
  const edit = row => { setEntry(row ? { row, reference: measurementRef(data.measurements, row) } : null); setError(""); setDialog("measurement"); };
  const chooseMetric = key => { setMetric(key); };
  const dateControls = <div className="body-date-controls"><label>Data: Wtedy<select aria-label="Data: Wtedy" value={from} disabled={!dates.length} onChange={e => setFrom(e.target.value)}>{!dates.length && <option value="">Brak pomiarów</option>}{dates.map(date => <option key={date} value={date} disabled={date > to}>{dateLabel(date)}</option>)}</select></label><label>Data: Teraz<select aria-label="Data: Teraz" value={to} disabled={!dates.length} onChange={e => setTo(e.target.value)}>{!dates.length && <option value="">Brak pomiarów</option>}{dates.map(date => <option key={date} value={date} disabled={date < from}>{dateLabel(date)}</option>)}</select></label></div>;
  return <div className="measurements-page">
    <header className="body-page-heading"><div><span className="eyebrow">RZECZYWISTE POMIARY</span><h1>Pomiary ciała</h1></div><button type="button" className="body-icon-action" aria-label="Profil sylwetki" onClick={() => setDialog("profile")}><UserRound size={21} /></button></header>
    <section className="body-profile-summary"><button type="button" onClick={() => setDialog("profile")}><b>Model {modelNames[profile.model || "neutral"] || "neutralny"}</b><small>{profile.heightCm ? `${format(profile.heightCm)} cm` : "Wzrost niepodany"} · {bodyGoals[profile.goal] || "Cel nieustawiony"}</small></button><span data-testid="profile-current-weight">Masa: {format(current.values.weight)} {current.values.weight != null && "kg"}{current.sources.weight && <small>z {dateLabel(current.sources.weight.date)}</small>}</span></section>
    <button type="button" className="primary-cta body-add-measurement" onClick={() => edit(null)}><Plus size={20} /> Dodaj pomiar</button>
    <div className="body-tabs" role="tablist" aria-label="Widoki pomiarów">{[["figure","Sylwetka"],["list","Lista"],["history","Historia"]].map(([key,label]) => <button type="button" role="tab" aria-selected={tab === key} key={key} onClick={() => setTab(key)}>{label}</button>)}</div>
    <label className="body-metric-select">Wybierz pomiar<select aria-label="Wybierz pomiar" value={metric.key} onChange={e => chooseMetric(e.target.value)}>{metrics.map(item => <option value={item.key} key={item.key}>{item.label} ({item.unit})</option>)}</select></label>
    <section className="measurement-latest-value"><span>{metric.label}</span><b>{format(current.values[metric.key])} <small>{current.values[metric.key] != null && metric.unit}</small></b>{current.sources[metric.key] ? <small>Ostatni zapis: {dateLabel(current.sources[metric.key].date)}</small> : <small>Brak zapisanego pomiaru</small>}<p data-testid="measurement-change">{delta == null ? "Potrzebne dwa pomiary do porównania" : `${delta > 0 ? "+" : ""}${format(delta)} ${metric.unit} względem poprzedniego zapisu`}</p></section>
    {tab === "figure" && <section className="body-figure-panel" aria-label="Interaktywne punkty pomiarowe">
      <div className="body-toggle"><button type="button" aria-pressed={view === "front"} onClick={() => setView("front")}>Przód</button><button type="button" aria-pressed={view === "back"} onClick={() => setView("back")}>Tył</button></div>
      <label className="body-checkbox"><input type="checkbox" checked={compare} disabled={!dates.length} onChange={e => setCompare(e.target.checked)} />Porównaj zapisane stany</label>
      {compare && <>{dateControls}<div className="body-toggle"><button type="button" aria-pressed={which === "then"} onClick={() => setWhich("then")}>Wtedy</button><button type="button" aria-pressed={which === "now"} onClick={() => setWhich("now")}>Teraz</button></div><p className="body-hint">Tylko pomiary zapisane w wybranym dniu. Brakujące pola pozostają puste.</p></>}
      {!compare && <p className="body-hint">Ostatnie dostępne zapisy do dzisiaj. Datę każdego pomiaru pokazujemy przy punkcie.</p>}
      <BodyModelView model={profile.model || "neutral"} view={view} state={shown} selected={metric.key} onSelect={chooseMetric} />
      <div className="body-selected-point" role="status"><b>{metric.label}: {format(shown.values[metric.key])} {shown.values[metric.key] != null && metric.unit}</b><span>{shown.sources[metric.key] ? `Pomiar z ${dateLabel(shown.sources[metric.key].date)}` : "Brak wartości dla tego stanu"}</span></div>
      <p className="body-capability-note" data-testid="body-deformation-status">Zmiana proporcji: niedostępna. {trend.reason} Nie rozciągamy grafiki na podstawie masy ciała. Przyszła wizualizacja będzie poglądowa, nie medycznym skanem.</p>
    </section>}
    {tab === "list" && <section className="body-list-panel"><h2>{metric.label} — wykres i tabela</h2><TrendChart points={[...previous].reverse().map(row => ({ date: dateLabel(row.date), value: bodyNumber(row, metric.key) }))} unit={metric.unit} />
      <div className="body-measurement-table"><table><caption>Zapisane pomiary — {metric.label}</caption><thead><tr><th>Data</th><th>Wartość</th><th>Akcje</th></tr></thead><tbody>{rows.map((row,index) => <tr key={row.id ?? index}><td>{dateLabel(row.date)}{row.note && <small>{row.note}</small>}</td><td>{format(bodyNumber(row,metric.key))} {bodyNumber(row,metric.key) != null && metric.unit}</td><td><button type="button" className="body-icon-action" aria-label={`Edytuj pomiar ${row.date} (${index + 1})`} onClick={() => edit(row)}><Pencil size={17} /></button><button type="button" className="body-icon-action" aria-label={`Usuń pomiar ${row.date} (${index + 1})`} onClick={() => { setEntry({ row, reference:measurementRef(data.measurements,row) }); setError(""); setDialog("delete"); }}><Trash2 size={17} /></button></td></tr>)}</tbody></table></div>{!rows.length && <p className="empty-state">Dodaj pierwszy pomiar.</p>}
    </section>}
    {tab === "history" && <section className="body-history-panel"><h2>Porównanie zapisanych stanów</h2>{dateControls}<p className="body-hint">Porównujemy wyłącznie pola zmierzone w wybranych dniach. Znak różnicy nie oznacza automatycznie poprawy.</p>{dates.length < 2 && <p className="body-hint">Potrzebne są dwie daty, aby zobaczyć zmianę w czasie.</p>}<div className="body-comparison-table"><table><caption>Wtedy / Teraz — rzeczywiste pomiary</caption><thead><tr><th>Pomiar</th><th>Wtedy</th><th>Teraz</th><th>Różnica</th></tr></thead><tbody>{compared.filter(item => metrics.some(m => m.key === item.key)).map(item => <tr key={item.key}><th>{item.label} ({item.unit})</th><td>{format(item.before)}</td><td>{format(item.after)}</td><td>{item.delta == null ? "—" : `${item.delta > 0 ? "+" : ""}${format(item.delta)}`}</td></tr>)}</tbody></table></div><p className="body-capability-note">Suwak porównania wyglądu wymaga modelu z obsługą deformacji i nie jest obecnie dostępny.</p></section>}
    {Array.isArray(data.bodyGoalHistory) && data.bodyGoalHistory.length > 0 && <details className="body-goal-history"><summary>Historia zmian celu ({data.bodyGoalHistory.length})</summary>{[...data.bodyGoalHistory].reverse().filter(Boolean).map((goal,index) => <div key={goal.id ?? index}><b>{bodyGoals[goal.goal] || goal.goal || "Bez ustalonego celu"}</b><span>Start: {goal.startedOn ? dateLabel(goal.startedOn) : "niezapisany"}{goal.targetWeight != null ? ` · cel ${format(goal.targetWeight)} kg` : ""}</span><small>{goal.changedAt != null ? `Zmiana zapisana ${new Date(goal.changedAt).toLocaleString("pl-PL")}` : "Daty wcześniejszej zmiany nie zapisano"}</small></div>)}</details>}
    {data.legacyMeasurements?.length > 0 && <details className="body-legacy"><summary>Poprzednie pomiary bez daty ({data.legacyMeasurements.length})</summary><p>Nie przypisujemy wymyślonych dat i nie włączamy tych wpisów do wykresów.</p>{data.legacyMeasurements.map((row,index) => <p key={index}>{JSON.stringify(row)}</p>)}</details>}
    {dialog === "profile" && <BodyProfileEditor profile={profile} current={current} onPersist={onPersist} onClose={() => setDialog(null)} onMeasurement={() => edit(null)} />}
    {dialog === "measurement" && <BodyMeasurementEditor key={entry?.row.id || "new"} row={entry?.row} reference={entry?.reference} today={today} onPersist={onPersist} onClose={() => setDialog(null)} onSaved={draft => { if(bodyNumber(draft,metric.key) === null) { const first=metrics.find(item=>bodyNumber(draft,item.key)!==null); if(first)setMetric(first.key); } }} />}
    {dialog === "delete" && <DialogSheet labelledBy="body-delete-title" onClose={() => setDialog(null)} className="body-editor-sheet"><header className="sheet-header"><h2 id="body-delete-title">Usunąć pomiar?</h2><button type="button" className="icon-button" aria-label="Anuluj usuwanie pomiaru" onClick={() => setDialog(null)}><X size={20} /></button></header><div className="sheet-body"><p>Usuniesz zapis z {dateLabel(entry.row.date)}. Pozostałe pomiary, cele i treningi zostaną zachowane.</p>{error && <p className="form-error" role="alert">{error}</p>}</div><footer className="sheet-footer"><button type="button" className="primary-cta body-danger" onClick={() => { try { if(onPersist(state=>deleteBodyMeasurement(state,entry.reference)))setDialog(null);else setError("Nie usunięto pomiaru. Spróbuj ponownie."); } catch(cause){setError(cause.message);} }}>Potwierdź usunięcie pomiaru</button></footer></DialogSheet>}
  </div>;
}
