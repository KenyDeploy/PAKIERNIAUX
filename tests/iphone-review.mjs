import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(process.env.APP_URL||'http://127.0.0.1:4182');await page.getByRole('button',{name:'Rozpocznij trening',exact:true}).click();
 const data=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
 const first=await data(),sessionId=first.activeSession.id;
 const geometry=()=>page.evaluate(()=>{
  const area=document.querySelector('.is-workout .content').getBoundingClientRect(),dock=document.querySelector('.workout-action-dock').getBoundingClientRect();
  const overlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const clipped=[...document.querySelectorAll('.series-entry')].map(el=>{const r=el.getBoundingClientRect();return {left:Math.max(area.left,r.left),right:Math.min(area.right,r.right),top:Math.max(area.top,r.top),bottom:Math.min(area.bottom,r.bottom)};}).filter(r=>r.bottom>r.top);
  return {overlap:overlap(area,dock),cards:clipped.map(r=>overlap(r,dock)),area:{top:area.top,bottom:area.bottom},dock:{top:dock.top,bottom:dock.bottom}};
 });
 for(const count of [3,5,10]){
  while(await page.locator('.series-entry').count()<count)await page.getByRole('button',{name:'Dodaj serię',exact:true}).click();
  for(const fraction of [0,.25,.5,.75,1]){
   await page.locator('.is-workout .content').evaluate((el,f)=>el.scrollTop=(el.scrollHeight-el.clientHeight)*f,fraction);
   const g=await geometry();assert.equal(g.overlap,0);assert.ok(g.cards.every(v=>v===0));
  }
 }
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:844});
  await page.getByLabel('Ciężar serii 10',{exact:true}).focus();
  for(const top of [0,35]){
   await page.evaluate(top=>{Object.defineProperty(visualViewport,'height',{value:340,configurable:true});Object.defineProperty(visualViewport,'offsetTop',{value:top,configurable:true});visualViewport.dispatchEvent(new Event('resize'));},top);await page.waitForTimeout(100);
   const result=await page.getByLabel('Ciężar serii 10',{exact:true}).evaluate(el=>{
    const input=el.getBoundingClientRect(),save=el.closest('.series-entry').querySelector('.set-confirm'),r=save.getBoundingClientRect(),area=el.closest('.content').getBoundingClientRect();return {inside:input.top>=area.top && r.bottom<=area.bottom,hit:save.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),inputHit:el===document.elementFromPoint(input.x+input.width/2,input.y+input.height/2)};
   });assert.ok(result.inside && result.hit && result.inputHit,JSON.stringify({width,top,result}));assert.equal((await geometry()).overlap,0);
  }
  await page.evaluate(()=>{document.activeElement?.blur();delete visualViewport.height;delete visualViewport.offsetTop;visualViewport.dispatchEvent(new Event('resize'));});
 }
 await page.setViewportSize({width:390,height:844});
 for(const n of [1,2,3]){await page.getByLabel(`Ciężar serii ${n}`,{exact:true}).fill('20');await page.getByRole('button',{name:`Zatwierdź serię ${n}`,exact:true}).click();}
 const ids=(await data()).activeSession.exercises[0].sets.map(r=>r.id);
 await page.getByRole('button',{name:'Edytuj serię 1',exact:true}).click();await page.getByLabel('Ciężar serii 1',{exact:true}).fill('25');await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();
 await page.getByRole('button',{name:'Usuń serię 2',exact:true}).click();await page.getByRole('button',{name:'Potwierdź usunięcie serii'}).click();
 assert.deepEqual((await data()).activeSession.exercises[0].sets.map(r=>r.id),[ids[0],...ids.slice(2)]);
 await page.reload();await page.getByRole('button',{name:'Wznów rozpoczęty trening'}).click();assert.equal((await data()).activeSession.id,sessionId);assert.equal(await page.locator('.series-entry').count(),9);
 // Show the entire actual source tile for three poses, preserving the source position.
 for(const [slug,name] of [['squat','Przysiad ze sztangą'],['pullup','Podciąganie nachwytem'],['press','Wyciskanie sztangi na ławce poziomej']]){
  await page.evaluate(name=>{const k='pakiernia.v2.local',s=JSON.parse(localStorage.getItem(k)),exercise=s.data.exercises.find(e=>e.name===name);s.data.activeSession.exercises.push({...exercise,sets:[{id:'photo-'+exercise.id,weight:'',reps:'8',repsSuggested:true,completed:false}]});s.data.activeSession.index=s.data.activeSession.exercises.length-1;localStorage.setItem(k,JSON.stringify(s));},name);
  await page.reload();await page.getByRole('button',{name:'Wznów rozpoczęty trening'}).click();
  const ratio=await page.locator('.workout-hero-photo').evaluate(el=>el.clientWidth/el.clientHeight);assert.ok(Math.abs(ratio-1.5)<.02);
  const source=await page.locator('.workout-hero-photo .exercise-photo').evaluate(el=>getComputedStyle(el).backgroundImage);
  await page.locator('.workout-hero-photo').screenshot({path:`docs/audit/iphone-photo-${slug}-390.png`});
  await page.getByRole('button',{name:'Powiększ zdjęcie ćwiczenia'}).click();assert.equal(await page.locator('.exercise-photo-expanded').evaluate(el=>getComputedStyle(el).backgroundImage),source);await page.keyboard.press('Escape');
 }
 await page.getByRole('button',{name:'Czas treningu i opcje'}).click();await page.getByRole('dialog').getByRole('button',{name:'Zakończ trening',exact:true}).click();await page.getByRole('button',{name:'Zapisz trening',exact:true}).click();assert.equal((await data()).activeSession,null);
 await page.locator('.bottom-nav').getByRole('button',{name:'Baza',exact:true}).click();assert.equal(await page.locator('.exercise-edit-button').count(),0);
 await page.locator('.exercise-row').first().click();await page.getByRole('button',{name:'Edytuj ćwiczenie i zdjęcie',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'Edytuj ćwiczenie',exact:true}).isVisible());await page.getByRole('button',{name:'Zamknij',exact:true}).click();
 assert.deepEqual((await data()).plans,first.plans);assert.deepEqual(errors,[]);console.log('iPhone review: clipped-rectangle and hit tests, 3/5/10 rows, 320–430 px, keyboard height/offset, save/edit/delete/reload/finish, 3 complete photo tiles, list/details edit PASS. Chromium simulation only.');
}finally{await browser.close();}
