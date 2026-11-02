import { SmoothChart } from "./SmoothChart";
export function MiniChart({values,labels,name}){return <SmoothChart compact points={values.map((value,i)=>({value,date:labels[i]}))} name={name}/>;}
