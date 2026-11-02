export function MiniChart({ values, labels, name, line = false }) {
 const max=Math.max(1,...values), min=line?Math.min(...values):0, range=Math.max(1,max-min);
 const x=i=>values.length<2?60:5+i/(values.length-1)*110;
 const y=v=>30-(v-min)/range*24;
 return <svg className="mini-chart" viewBox="0 0 120 36" role="img" aria-label={`${name}: ${values.map((v,i)=>`${labels[i]}: ${v}`).join('; ')}`}>
  <path d="M2 32 H118" stroke="currentColor" opacity=".15"/>
  {line ? <><polyline points={values.map((v,i)=>`${x(i)},${y(v)}`).join(' ')} fill="none" stroke="currentColor" strokeWidth="2"/>{values.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill="currentColor"/>)}</> : values.map((v,i)=><rect key={i} x={4+i*16.5} y={v?30-v/max*26:30} width="10" height={v?v/max*26:0} rx="2" fill="currentColor" opacity={i===values.length-1?1:.55}/>)}
 </svg>;
}
