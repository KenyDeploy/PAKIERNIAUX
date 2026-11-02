import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const engine=process.env.BROWSER_ENGINE||'chromium';
const playwright=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await playwright[engine].launch({headless:true,...(engine==='chromium'&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
const directory=process.env.CAPTURE_DIR||'docs/audit/ux4';await mkdir(directory,{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:'Europe/Warsaw'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.APP_URL||'http://127.0.0.1:4200');
 const nav=name=>page.locator('.bottom-nav').getByRole('button',{name,exact:true}).click();
 const snapshot=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
 const top=async()=>assert.ok(await page.evaluate(()=>scrollY<=1 && document.querySelector('.content').scrollTop<=1),'Main screen must start at top');
 for(const width of [320,375,390,430]){
   await page.setViewportSize({width,height:width===320?568:844});
   for(let repeat=0;repeat<2;repeat++)for(const name of ['Baza','Plany','Historia','Postęp','Pomiary','Pulpit']){
     await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
     await nav(name);await top();
     await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
     await nav(name);await top();
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   }
 }
 // Detail dialog must return to the exact list context, keeping filters.
 await nav('Baza');await page.getByLabel('Filtr sprzętu').selectOption('Maszyna');
 await page.locator('.exercise-row').last().scrollIntoViewIfNeeded();
 const listPosition=await page.evaluate(()=>scrollY);
 await page.locator('.exercise-row').last().click();
 await page.getByRole('button',{name:'Zamknij',exact:true}).click();
 assert.equal(await page.getByLabel('Filtr sprzętu').inputValue(),'Maszyna');
 assert.ok(Math.abs((await page.evaluate(()=>scrollY))-listPosition)<=2);
 await nav('Pulpit');await page.locator('.dashboard-start').click();
 await page.locator('.workout-photo-preview>summary').click();
 await page.getByRole('button',{name:'Powiększ zdjęcie ćwiczenia'}).click();
 assert.ok(await page.getByRole('dialog',{name:'Zdjęcie ćwiczenia',exact:true}).isVisible());
 await page.getByRole('button',{name:'Zamknij zdjęcie'}).click();
 await page.locator('.workout-photo-preview>summary').click();
 const initial=await snapshot();const series=async()=>(await snapshot()).activeSession.exercises[0].sets;
 const save=async(n,w,r='8')=>{await page.getByLabel(`Ciężar serii ${n}`,{exact:true}).fill(w);await page.getByLabel(`Powtórzenia serii ${n}`,{exact:true}).fill(r);await page.getByRole('button',{name:`Zatwierdź serię ${n}`,exact:true}).click();};
 for(let n=1;n<=5;n++){if(n>1)await page.getByRole('button',{name:'Dodaj serię',exact:true}).click();await save(n,String(n*10));}
 const ids=(await series()).map(s=>s.id);
 await page.getByRole('button',{name:'Edytuj serię 1',exact:true}).click();await save(1,'25','7');
 await page.getByRole('button',{name:'Usuń serię 3',exact:true}).click();await page.getByRole('button',{name:'Potwierdź usunięcie serii'}).click();
 assert.deepEqual((await series()).map(s=>s.id),ids.filter((_,i)=>i!==2));
 await page.locator('.workout-quick-actions').getByRole('button',{name:'Opcje',exact:true}).click();
 await page.getByRole('button',{name:'Dodaj inne ćwiczenie',exact:true}).click();
 await page.getByRole('button',{name:'Wybierz: Przysiad ze sztangą',exact:true}).click();
 await page.getByRole('button',{name:'Dodaj do treningu',exact:true}).click();
 const picker=page.getByLabel('Ćwiczenia w sesji',{exact:true});const added=(await snapshot()).activeSession.index;
 assert.equal(await picker.locator('option').count(),initial.activeSession.exercises.length+1);
 await page.getByRole('button',{name:'Poprzednie ćwiczenie',exact:true}).click();assert.equal((await snapshot()).activeSession.index,added-1);
 await page.getByRole('button',{name:'Następne ćwiczenie',exact:true}).click();assert.equal((await snapshot()).activeSession.index,added);
 await picker.selectOption('0');assert.deepEqual((await series()).map(s=>s.id),ids.filter((_,i)=>i!==2));
 // Long session: each addition keeps its own draft; resume must reveal the selected row.
 for(let i=0;i<10;i++)await page.getByRole('button',{name:'Dodaj serię',exact:true}).click();
 await page.getByLabel('Ciężar serii 14',{exact:true}).fill('67,5');
 const draft=await snapshot();await page.locator('.brand').click();await page.locator('.dashboard-start').click();
 assert.equal(await page.getByLabel('Ciężar serii 14',{exact:true}).inputValue(),'67,5');
 assert.deepEqual((await snapshot()).activeSession,draft.activeSession);
 await page.waitForFunction(()=>{const el=document.querySelector('input[aria-label="Ciężar serii 14"]'),r=el.getBoundingClientRect(),c=el.closest('.content').getBoundingClientRect();return r.top>=c.top&&r.bottom<=c.bottom;},null,{timeout:2000});
 for(const width of [320,375,390,430]){
   await page.setViewportSize({width,height:740});await page.getByLabel('Ciężar serii 14',{exact:true}).focus();
   await page.evaluate(()=>{Object.defineProperty(visualViewport,'height',{value:340,configurable:true});visualViewport.dispatchEvent(new Event('resize'));});await page.waitForTimeout(100);
   await page.waitForFunction(()=>{const el=document.querySelector('input[aria-label="Ciężar serii 14"]'),c=el.closest('.content').getBoundingClientRect(),save=el.closest('.series-entry').querySelector('.set-confirm').getBoundingClientRect();return el.getBoundingClientRect().top>=c.top&&save.bottom<=c.bottom;},null,{timeout:2000});
   await page.evaluate(()=>{document.activeElement.blur();delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'));});
 }
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);await page.screenshot({path:`${directory}/ux4-${engine}-resume-390.png`});
 await page.getByRole('button',{name:'Zakończ trening',exact:true}).click();
 assert.equal(await page.getByTestId('finish-set-count').innerText(),'4');assert.equal(await page.getByTestId('finish-rep-count').innerText(),'31');assert.equal(await page.getByTestId('finish-volume').innerText(),'1055 kg');
 await page.getByRole('button',{name:'Zapisz trening',exact:true}).click();
 const final=await snapshot();assert.equal(final.workouts.at(-1).volume,1055);assert.deepEqual(final.plans,initial.plans);assert.deepEqual(final.measurements,initial.measurements);
 // Every theme is persisted then checked on the actual screens, including Mono/blue.
 for(const name of ['Electric Lime','Neon Magenta','Electric Blue','Cyber Violet','Solar Orange','Arctic Teal','Classic Mono']){
   await page.getByRole('button',{name:'Ustawienia',exact:true}).click();await page.getByRole('button',{name,exact:true}).click();await page.getByRole('button',{name:'Zapisz motyw',exact:true}).click();
   for(const tab of ['Pulpit','Plany','Baza','Historia','Postęp','Pomiary']){await nav(tab);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
   await page.screenshot({path:`${directory}/ux4-${engine}-${name.replaceAll(' ','-')}-390.png`});
 }
 assert.deepEqual(errors,[]);console.log(`UX4 ${engine}: repeated tab resets + retaps 320/375/390/430; filtered list context; 5 series/edit first/delete third/add exercise/prev-next; 14-row resume; keyboard geometry; exact 4-set 31-rep 1055kg summary; 7 themes PASS`);
}finally{await browser.close();}
