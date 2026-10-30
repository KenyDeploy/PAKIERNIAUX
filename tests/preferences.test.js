import test from "node:test";
import assert from "node:assert/strict";
import {themes,themeFor,themeTokens,saveTheme,exportSnapshot} from "../src/preferences.js";
test("six exact accents, readable contrast, legacy fallback and non-destructive preference updates",()=>{
 assert.deepEqual(themes.map(t=>t.accent),["#C9FF31","#F43CB6","#4EA5FF","#A879FF","#FF9B42","#34DDBB"]);
 const lum=hex=>{const c=hex.match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
 for(const theme of themes){assert.ok((lum(theme.accent.slice(1))+.05)/(lum("101510")+.05)>=4.5);assert.equal(themeTokens(theme.id)["--accent"],theme.accent);}
 assert.equal(themeFor(undefined).id,"lime");assert.equal(themeFor("unknown").id,"lime");
 const a={preferences:{other:"keep"},measurements:[{biceps:35}],unknown:true};const b=saveTheme(a,"teal");
 assert.equal(a.preferences.theme,undefined);assert.equal(b.preferences.other,"keep");assert.equal(b.measurements,a.measurements);assert.throws(()=>saveTheme(a,"invalid"));
 assert.deepEqual(JSON.parse(exportSnapshot(b)).data,b);
});
