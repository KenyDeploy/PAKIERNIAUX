import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(process.env.APP_URL||'http://127.0.0.1:4180');
 const data=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
 const start=async(name='Góra ciała — siła')=>{await page.locator('.bottom-nav').getByRole('button',{name:'Plany',exact:true}).click();await page.locator('.plan-card').filter({hasText:name}).getByRole('button',{name:'Rozpocznij',exact:true}).click();};
 const three=async()=>{for(const n of [1,2,3]){if(n>1)await page.getByRole('button',{name:'Dodaj serię',exact:true}).click();await page.getByLabel(`Ciężar serii ${n}`,{exact:true}).fill(String(n*10));await page.getByLabel(`Powtórzenia serii ${n}`,{exact:true}).fill('8');await page.getByRole('button',{name:`Zatwierdź serię ${n}`,exact:true}).click();}};
 const review=async()=>{await page.getByRole('button',{name:'Czas treningu i opcje'}).click();await page.getByRole('button',{name:'Zakończ trening',exact:true}).click();};
 const request=async()=>{await review();await page.getByRole('button',{name:'Odrzuć trening bez zapisu',exact:true}).click();};
 const confirmation=()=>page.getByRole('dialog',{name:'Usunąć cały rozpoczęty trening?',exact:true});
 await start();await three();const before=await data();assert.equal(before.activeSession.exercises[0].sets.filter(row=>row.completed).length,3);
 await request();assert.ok(await confirmation().isVisible());const text=await confirmation().innerText();assert.match(text,/Usunąć cały rozpoczęty trening\?\s+Zapisane w nim serie zostaną utracone/);assert.ok(text.includes(before.activeSession.plan.name));assert.match(text,/Liczba wykonanych serii:\s*3/);assert.equal(await confirmation().getByRole('button').count(),2);assert.deepEqual(await data(),before);
 for(const [width,height] of [[320,360],[375,500],[390,600],[430,844]]){await page.setViewportSize({width,height});await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));for(const name of ['Wróć do treningu','Usuń trening'])assert.ok(await confirmation().getByRole('button',{name,exact:true}).evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));}
 await confirmation().getByRole('button',{name:'Wróć do treningu',exact:true}).click();assert.equal(await page.getByRole('dialog').count(),0);assert.deepEqual(await data(),before);
 await request();await page.keyboard.press('Escape');assert.deepEqual(await data(),before);assert.equal(await page.getByRole('dialog').count(),0);
 await request();await page.locator('.sheet-backdrop').click({position:{x:2,y:2}});assert.deepEqual(await data(),before);assert.equal(await page.getByRole('dialog').count(),0);
 await review();await page.keyboard.press('Escape');assert.deepEqual(await data(),before);
 await page.reload();await page.getByRole('button',{name:'Wznów rozpoczęty trening',exact:true}).click();assert.deepEqual(await data(),before);assert.equal(await page.locator('.series-compact').count(),3);
 // Saving still has only the existing review, no new confirmation.
 await review();await page.getByRole('button',{name:'Zapisz trening',exact:true}).click();let saved=await data();assert.equal(saved.activeSession,null);assert.equal(saved.workouts.length,1);assert.equal(saved.workouts[0].id,before.activeSession.id);assert.equal(saved.workouts[0].volume,480);assert.equal(await page.getByRole('dialog').count(),0);
 await start();await three();const toDelete=await data();await request();
 await page.evaluate(()=>{window.__discardSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota');};});await confirmation().getByRole('button',{name:'Usuń trening',exact:true}).click();assert.ok(await confirmation().isVisible());assert.ok(await confirmation().getByRole('alert').isVisible());assert.deepEqual(await data(),toDelete);
 await page.evaluate(()=>{Storage.prototype.setItem=window.__discardSet;});await confirmation().getByRole('button',{name:'Usuń trening',exact:true}).click();assert.deepEqual(await data(),{...toDelete,activeSession:null});await page.reload();assert.equal(await page.getByRole('button',{name:'Wznów rozpoczęty trening',exact:true}).count(),0);
 await start('Dół ciała — siła');const empty=await data();assert.ok(empty.activeSession.exercises.every(e=>e.sets.every(row=>!row.completed)));await request();assert.equal(await page.getByRole('dialog').count(),0);assert.deepEqual(await data(),{...empty,activeSession:null});assert.deepEqual(errors,[]);
 console.log('UX01: 3 performed sets, cancel/Escape/backdrop preserve exact snapshots, reload/resume, ordinary save, quota/retry, explicit discard and direct empty discard; 320–430 px passed. Chromium only.');
}finally{await browser.close();}
