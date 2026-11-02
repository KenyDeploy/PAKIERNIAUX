export const themes = [
  {id:"lime",name:"Electric Lime",accent:"#C9FF31"},
  {id:"magenta",name:"Neon Magenta",accent:"#F43CB6"},
  {id:"blue",name:"Electric Blue",accent:"#4EA5FF"},
  {id:"violet",name:"Cyber Violet",accent:"#A879FF"},
  {id:"orange",name:"Solar Orange",accent:"#FF9B42"},
  {id:"teal",name:"Arctic Teal",accent:"#34DDBB"},
  {id:"mono",name:"Classic Mono",accent:"#F2F2F2"}
];
export const themeFor = id => themes.find(theme=>theme.id===id) || themes[0];
export function saveTheme(data,id) {
  if(!themes.some(theme=>theme.id===id))throw new Error("Nieznany motyw.");
  return {...data,preferences:{...data.preferences,theme:id}};
}
export function themeTokens(id) {
  return {"--accent":themeFor(id).accent,"--on-accent":"#101510",...(id==="mono"?{"--accent-glow":"transparent","--accent-soft":"#171919","--accent-border":"#737978"}:{})};
}
export function exportSnapshot(data) {
  return JSON.stringify({application:"Pakiernia u Matiego",formatVersion:1,exportedAt:new Date().toISOString(),data},null,2);
}
