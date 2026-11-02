import { useState } from "react";
import { Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import { DialogSheet } from "./DialogSheet";
import { TrendChart } from "./Visuals";
import { BodyModelView } from "./BodyModelView";
import { BodyProfileEditor } from "./BodyProfileEditor";
import { BodyMeasurementEditor } from "./BodyMeasurementEditor";
import { allBodyMetrics, bodyNumber, bodyState, bodyGoals, compareBodyStates, datedMeasurements, deleteBodyMeasurement, measurementRef } from "./bodyMeasurements.js";
import { measurementProgress } from "./measurementProgress.js";
import "./Measurements.css";
import "./MeasurementsPremium.css";

const format = value => value == null ? "—" : value.toLocaleString("pl-PL", { maximumFractionDigits: 1 });
const dateLabel = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString("pl-PL") : "—";
export function MeasurementsPage({ data, today, onPersist }) {
  const [tab, setTab] = useState("figure"), [metricKey, setMetric] = useState("waist"), [view, setView] = useState("front");
  const [dialog, setDialog] = useState(null), [entry, setEntry] = useState(null), [error, setError] = useState("");
  const [which, setWhich] = useState("now");
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
  const progress = measurementProgress(rows, metric.key, today);
  const previousDate = progress.previous?.date || "";
  const shown = tab === "previous" ? bodyState(progress.previous ? [progress.previous] : [], previousDate, true) : tab === "compare" && dates.length ? which === "then" ? before : after : current;
  const shownProgress = measurementProgress(rows, metric.key, shown.sources[metric.key]?.date || "0000-00-00", tab === "previous" ? progress.previous : undefined);
  const model = profile.model === "female" ? "female" : "male";
  const chooseModel = next => {
    try { if(!onPersist(source=>({...source,bodyProfile:{...source.bodyProfile,model:next}})))setError("Nie zapisano wyboru modelu. Spróbuj ponownie.");else setError(""); }
    catch {setError("Nie zapisano wyboru modelu. Spróbuj ponownie.");}
  };
  const signed = value => value == null ? "—" : (value>0?"+":"")+format(value);
  const trendText = progress.deltaPrevious == null ? "Dodaj kolejny pomiar, aby zobaczyć trend." : progress.deltaPrevious === 0 ? "Bez zmiany względem poprzedniego zapisu." : (progress.deltaPrevious>0?"Wzrost":"Spadek")+" o "+format(Math.abs(progress.deltaPrevious))+" "+metric.unit+". Kierunek zmiany oceniaj zgodnie ze swoim celem.";
  const previous = rows.filter(row => bodyNumber(row, metric.key) !== null);
  const delta = previous.length > 1 ? Number((bodyNumber(previous[0], metric.key) - bodyNumber(previous[1], metric.key)).toFixed(3)) : null;

  const edit = row => { setEntry(row ? { row, reference: measurementRef(data.measurements, row) } : null); setError(""); setDialog("measurement"); };
  const chooseMetric = key => { setMetric(key); };
  const dateControls = <div className="body-date-controls"><label>Data: Wtedy<select aria-label="Data: Wtedy" value={from} disabled={!dates.length} onChange={e => setFrom(e.target.value)}>{!dates.length && <option value="">Brak pomiarów</option>}{dates.map(date => <option key={date} value={date} disabled={date > to}>{dateLabel(date)}</option>)}</select></label><label>Data: Teraz<select aria-label="Data: Teraz" value={to} disabled={!dates.length} onChange={e => setTo(e.target.value)}>{!dates.length && <option value="">Brak pomiarów</option>}{dates.map(date => <option key={date} value={date} disabled={date < from}>{dateLabel(date)}</option>)}</select></label></div>;
  const reading = <section className="measurement-latest-value body-reading body-selected-point" aria-label="Wybrany pomiar i zmiany"><span>{metric.label} · {tab==="previous"?"poprzedni zapis":tab==="compare"?which==="then"?"wtedy":"teraz":"aktualnie"}</span><b>{format(shown.values[metric.key])} <small>{shown.values[metric.key] != null && metric.unit}</small></b><small>{shown.sources[metric.key] ? "Pomiar z "+dateLabel(shown.sources[metric.key].date) : tab==="previous"?"Brak wcześniejszego pomiaru tej części ciała":"Brak zapisanego pomiaru"}</small><div className="body-reading-deltas"><div><span>Od poprzedniego</span><b>{signed(shown.values[metric.key]==null?null:shownProgress.deltaPrevious)} <small>{shownProgress.deltaPrevious!=null && shown.values[metric.key]!=null && metric.unit}</small></b></div><div><span>Od początku</span><b>{signed(shown.values[metric.key]==null?null:shownProgress.deltaStart)} <small>{shownProgress.deltaStart!=null && shown.values[metric.key]!=null && metric.unit}</small></b></div></div><p data-testid="measurement-change">{delta == null ? "Potrzebne dwa pomiary do porównania" : signed(delta)+" "+metric.unit+" względem poprzedniego zapisu"}</p></section>;
  return <div className="measurements-page">
    <header className="body-page-heading"><div><span className="eyebrow">RZECZYWISTE POMIARY</span><h1>Pomiary ciała</h1></div><button type="button" className="body-icon-action" aria-label="Profil sylwetki" onClick={() => setDialog("profile")}><UserRound size={21} /></button></header>
    <section className="body-profile-summary"><button type="button" onClick={() => setDialog("profile")}><b>{bodyGoals[profile.goal] || "Twój profil i cel"}</b><small>{profile.heightCm ? format(profile.heightCm)+" cm · " : ""}Ustawienia sylwetki</small></button><span data-testid="profile-current-weight">Masa: {format(current.values.weight)} {current.values.weight != null && "kg"}{current.sources.weight && <small>z {dateLabel(current.sources.weight.date)}</small>}</span></section>
    <button type="button" className="primary-cta body-add-measurement" onClick={() => edit(null)}><Plus size={20} /> Dodaj pomiar</button>
    <div className="body-tabs body-view-modes" role="tablist" aria-label="Widoki pomiarów">{[["figure","Aktualnie"],["previous","Poprzedni"],["compare","Porównaj"],["history","Historia"]].map(([key,label]) => <button type="button" role="tab" aria-selected={tab === key} key={key} onClick={() => setTab(key)}>{label}</button>)}</div>
    <label className="body-metric-select">Wybrany pomiar<select aria-label="Wybierz pomiar" value={metric.key} onChange={e => chooseMetric(e.target.value)}>{metrics.map(item => <option value={item.key} key={item.key}>{item.label} ({item.unit})</option>)}</select></label>
    {tab === "compare" && <section className="body-compare-controls"><h2>Porównaj dwa zapisy</h2>{dateControls}<div className="body-toggle"><button type="button" aria-pressed={which === "then"} onClick={() => setWhich("then")}>Wtedy</button><button type="button" aria-pressed={which === "now"} onClick={() => setWhich("now")}>Teraz</button></div><p className="body-hint">Tylko dane z wybranych dni; brakujących obwodów nie uzupełniamy.</p>{dates.length<2 && <p className="body-hint">Dodaj pomiary z dwóch dni, aby zobaczyć porównanie.</p>}</section>}
    {tab === "history" && reading}
    {tab !== "history" && <section className="body-figure-panel" aria-label="Interaktywne punkty pomiarowe">
      <div className="body-model-toolbar"><div className="body-toggle" aria-label="Wariant ilustracji"><button type="button" aria-pressed={model==="male"} onClick={()=>chooseModel("male")}>Mężczyzna</button><button type="button" aria-pressed={model==="female"} onClick={()=>chooseModel("female")}>Kobieta</button></div><div className="body-toggle body-side-toggle"><button type="button" aria-pressed={view === "front"} onClick={() => setView("front")}>Przód</button><button type="button" aria-pressed={view === "back"} onClick={() => setView("back")}>Tył</button></div></div>
      {error && !dialog && <p className="form-error" role="alert">{error}</p>}
      <BodyModelView model={model} view={view} state={shown} selected={metric.key} onSelect={key=>{chooseMetric(key);window.requestAnimationFrame(()=>document.querySelector(".body-reading")?.scrollIntoView({block:"center",behavior:"smooth"}));}} />
      {reading}
      <p className="body-hint body-static-note">Statyczny schemat poglądowy. Zmiany pokazujemy w liczbach i na wykresie, nie przez rozciąganie sylwetki.</p>
    </section>}
    {tab === "compare" && <section className="body-history-panel"><h2>Różnice pomiarów</h2><div className="body-comparison-table"><table><caption>Wtedy / Teraz — rzeczywiste pomiary</caption><thead><tr><th>Pomiar</th><th>Wtedy</th><th>Teraz</th><th>Różnica</th></tr></thead><tbody>{compared.filter(item => metrics.some(m => m.key === item.key)).map(item => <tr key={item.key}><th>{item.label} ({item.unit})</th><td>{format(item.before)}</td><td>{format(item.after)}</td><td>{signed(item.delta)}</td></tr>)}</tbody></table></div></section>}
    <section className="body-list-panel"><header className="body-section-title"><h2>{metric.label} — progres</h2><span>{progress.readings.length} zapisów</span></header><TrendChart ranges points={[...previous].reverse().map(row => ({ date: dateLabel(row.date), time:new Date(`${row.date}T12:00:00`).getTime(), value: bodyNumber(row, metric.key) }))} unit={metric.unit} /><p className="body-trend" data-testid="body-trend">{trendText}</p>
      <div className="body-measurement-table"><table><caption>Historia pomiarów — {metric.label}</caption><thead><tr><th>Data</th><th>Wartość</th><th>Akcje</th></tr></thead><tbody>{rows.map((row,index) => <tr key={row.id ?? index}><td>{dateLabel(row.date)}{row.note && <small>{row.note}</small>}</td><td>{format(bodyNumber(row,metric.key))} {bodyNumber(row,metric.key) != null && metric.unit}</td><td><button type="button" className="body-icon-action" aria-label={"Edytuj pomiar "+row.date+" ("+(index+1)+")"} onClick={() => edit(row)}><Pencil size={17} /></button><button type="button" className="body-icon-action" aria-label={"Usuń pomiar "+row.date+" ("+(index+1)+")"} onClick={() => { setEntry({ row, reference:measurementRef(data.measurements,row) }); setError(""); setDialog("delete"); }}><Trash2 size={17} /></button></td></tr>)}</tbody></table></div>{!rows.length && <p className="empty-state">To miejsce na Twój pierwszy pomiar. Zacznij od jednego obwodu lub masy ciała.</p>}
    </section>
    {Array.isArray(data.bodyGoalHistory) && data.bodyGoalHistory.length > 0 && <details className="body-goal-history"><summary>Historia zmian celu ({data.bodyGoalHistory.length})</summary>{[...data.bodyGoalHistory].reverse().filter(Boolean).map((goal,index) => <div key={goal.id ?? index}><b>{bodyGoals[goal.goal] || goal.goal || "Bez ustalonego celu"}</b><span>Start: {goal.startedOn ? dateLabel(goal.startedOn) : "niezapisany"}{goal.targetWeight != null ? ` · cel ${format(goal.targetWeight)} kg` : ""}</span><small>{goal.changedAt != null ? `Zmiana zapisana ${new Date(goal.changedAt).toLocaleString("pl-PL")}` : "Daty wcześniejszej zmiany nie zapisano"}</small></div>)}</details>}
    {data.legacyMeasurements?.length > 0 && <details className="body-legacy"><summary>Poprzednie pomiary bez daty ({data.legacyMeasurements.length})</summary><p>Nie przypisujemy wymyślonych dat i nie włączamy tych wpisów do wykresów.</p>{data.legacyMeasurements.map((row,index) => <p key={index}>{JSON.stringify(row)}</p>)}</details>}
    {dialog === "profile" && <BodyProfileEditor profile={profile} current={current} onPersist={onPersist} onClose={() => setDialog(null)} onMeasurement={() => edit(null)} />}
    {dialog === "measurement" && <BodyMeasurementEditor key={entry?.row.id || "new"} row={entry?.row} reference={entry?.reference} today={today} onPersist={onPersist} onClose={() => setDialog(null)} onSaved={draft => { if(bodyNumber(draft,metric.key) === null) { const first=metrics.find(item=>bodyNumber(draft,item.key)!==null); if(first)setMetric(first.key); } }} />}
    {dialog === "delete" && <DialogSheet labelledBy="body-delete-title" onClose={() => setDialog(null)} className="body-editor-sheet"><header className="sheet-header"><h2 id="body-delete-title">Usunąć pomiar?</h2><button type="button" className="icon-button" aria-label="Anuluj usuwanie pomiaru" onClick={() => setDialog(null)}><X size={20} /></button></header><div className="sheet-body"><p>Usuniesz zapis z {dateLabel(entry.row.date)}. Pozostałe pomiary, cele i treningi zostaną zachowane.</p>{error && <p className="form-error" role="alert">{error}</p>}</div><footer className="sheet-footer"><button type="button" className="primary-cta body-danger" onClick={() => { try { if(onPersist(state=>deleteBodyMeasurement(state,entry.reference)))setDialog(null);else setError("Nie usunięto pomiaru. Spróbuj ponownie."); } catch(cause){setError(cause.message);} }}>Potwierdź usunięcie pomiaru</button></footer></DialogSheet>}
  </div>;
}
