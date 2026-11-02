import { useId, useState } from "react";
import { monotonePath } from "./monotoneCurve.js";
import "./SmoothChart.css";
const format=v=>Number(v).toLocaleString("pl-PL",{maximumFractionDigits:2});
export function SmoothChart({ points, unit="", compact=false, name="Wykres", ranges=false }) {
 const id=useId().replaceAll(":", ""),[active,setActive]=useState(null),[range,setRange]=useState(0);
 const cutoff=range?Date.now()-range*86400000:-Infinity;
 const data=points.filter(p=>p.value!=null && Number.isFinite(Number(p.value)) && (!range || p.time!=null && p.time>=cutoff));
 if(!data.length)return <div className={compact?"mini-chart-wrap":"trend-chart"}>{ranges && <Range value={range} onChange={value=>{setRange(value);setActive(null);}}/>}<p className="empty-state">Brak zapisanych wyników w tym okresie.</p></div>;
 const values=data.map(p=>Number(p.value)),low=Math.min(...values),high=Math.max(...values),padding=Math.max(1,(high-low)*.15),min=Math.max(0,low-padding),max=high+padding;
 const bottom=compact?38:135,left=compact?5:35,right=compact?115:300,top=compact?5:20;
 const timed=data.length>1 && data.every((p,i)=>Number.isFinite(p.time) && (!i || p.time>data[i-1].time));
 const x=i=>data.length===1?(left+right)/2:left+(timed?(data[i].time-data[0].time)/(data.at(-1).time-data[0].time):i/(data.length-1))*(right-left),y=v=>bottom-(v-min)/(max-min||1)*(bottom-top);
 const coordinates=data.map((p,i)=>({x:x(i),y:y(Number(p.value))})),path=monotonePath(coordinates);
 const selected=data[Math.min(active??data.length-1,data.length-1)];
 const choose=(event,i)=>{event.stopPropagation();setActive(i);};
 return <div className={compact?"mini-chart-wrap":"trend-chart"}>
  {ranges && <Range value={range} onChange={value=>{setRange(value);setActive(null);}}/>}
  {(!compact || active!=null) && <div className={compact?"mini-chart-value":"chart-value"} aria-live="polite">{selected.date} · <b>{format(selected.value)} {unit}</b></div>}
  <svg className={compact?"mini-chart":"smooth-chart"} viewBox={compact?"0 0 120 44":"0 0 320 160"} role="group" aria-label={`${name} ${unit}: ${data.map(p=>`${p.date}: ${p.value}`).join(', ')}`}>
   <defs><linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity=".14"/><stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs>
   {!compact && [min,(min+max)/2,max].map((v,i)=><g key={i}><line x1={left} x2={right} y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".1"/><text x="0" y={y(v)+4} fill="var(--muted)" fontSize="9">{format(v)}</text></g>)}
   {path && <><path className="chart-fill" d={`${path} L ${right} ${bottom} L ${left} ${bottom} Z`} fill={`url(#gradient-${id})`}/><path className="chart-line" d={path} fill="none" stroke="var(--accent)" strokeWidth="2.2" vectorEffect="non-scaling-stroke"/></>}
   {data.map((p,i)=><g key={i}><circle cx={x(i)} cy={y(p.value)} r={compact?2:3.5} fill="var(--accent)"/><circle cx={x(i)} cy={y(p.value)} r={compact?7:14} fill="transparent" tabIndex="0" role="button" aria-label={`${p.date}: ${format(p.value)} ${unit}`} onFocus={e=>choose(e,i)} onClick={e=>choose(e,i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(e,i);}}}/></g>)}
  </svg>
  {!compact && <><div className="chart-dates"><span>{data[0].date}</span><span>{data.at(-1).date}</span></div><details className="chart-table"><summary>Pokaż wartości</summary>{data.map((p,i)=><div key={i}>{p.date}<b>{format(p.value)} {unit}</b></div>)}</details></>}
 </div>;
}
function Range({value,onChange}){return <div className="chart-ranges" aria-label="Zakres danych wykresu">{[[7,"7 dni"],[30,"30 dni"],[90,"90 dni"],[0,"Cały okres"]].map(([days,label])=><button type="button" key={days} aria-pressed={value===days} onClick={()=>onChange(days)}>{label}</button>)}</div>;}
