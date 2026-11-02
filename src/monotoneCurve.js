// Shape-preserving cubic Hermite interpolation (limited harmonic tangents).
// Each segment's control points stay within its endpoint range; no invented peaks.
export function monotonePath(points) {
 if(points.length<2)return "";
 const d=points.slice(1).map((p,i)=>(p.y-points[i].y)/(p.x-points[i].x));
 const m=points.map((_,i)=>i===0?d[0]:i===points.length-1?d.at(-1):d[i-1]*d[i]<=0?0:2/(1/d[i-1]+1/d[i]));
 for(let i=0;i<d.length;i++){
  if(!d[i]){m[i]=0;m[i+1]=0;continue;}
  const size=Math.hypot(m[i]/d[i],m[i+1]/d[i]);
  if(size>3){const scale=3/size;m[i]*=scale;m[i+1]*=scale;}
 }
 const n=v=>Number(v.toFixed(4));
 return `M ${n(points[0].x)} ${n(points[0].y)}`+points.slice(1).map((p,i)=>{const a=points[i],h=(p.x-a.x)/3;return ` C ${n(a.x+h)} ${n(a.y+m[i]*h)}, ${n(p.x-h)} ${n(p.y-m[i+1]*h)}, ${n(p.x)} ${n(p.y)}`;}).join("");
}
