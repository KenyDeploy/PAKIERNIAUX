import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(process.env.APP_URL||'http://127.0.0.1:4182');
 await page.locator('.bottom-nav').getByRole('button',{name:'Plany',exact:true}).click();
 await page.locator('.plan-card').first().getByRole('button',{name:'Rozpocznij',exact:true}).click();
 const data=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
 const initial=await data();
 assert.ok((await page.locator('.compact-rest').boundingBox()).height<=58,'Idle rest is a single touch-height row');
 assert.equal(await page.getByText('Gotowy na przerwę?',{exact:true}).count(),0);
 await page.getByRole('button',{name:'Rozpocznij przerwę',exact:true}).click();
 const deadline=(await data()).activeSession.restUntil;
 await page.getByRole('button',{name:'Wydłuż przerwę o 15 sekund'}).click();
 assert.equal((await data()).activeSession.restUntil,deadline+15000);
 await page.getByRole('button',{name:'Pomiń przerwę',exact:true}).click();
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:844});
  const geometry=await page.locator('.workout-hero-photo .exercise-photo').evaluate(el=>{const r=el.getBoundingClientRect(),p=el.closest('.workout-hero-photo').getBoundingClientRect();return {ratio:r.width/r.height,contained:r.top>=p.top && r.bottom<=p.bottom+1 && r.left>=p.left && r.right<=p.right+1};});
  assert.ok(Math.abs(geometry.ratio-1.5)<0.02 && geometry.contained,JSON.stringify({width,geometry}));
  await page.getByRole('button',{name:'Powiększ zdjęcie ćwiczenia'}).click();
  assert.ok(await page.getByRole('button',{name:'Zamknij zdjęcie'}).isVisible());await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Opcje ćwiczenia',exact:true}).click();
  for(const name of ['Dodaj serię','Dodaj inne ćwiczenie','Zamień ćwiczenie','Pomiń ćwiczenie','Edytuj parametry','Usuń z bieżącego treningu'])assert.ok(await page.getByRole('dialog').getByRole('button',{name,exact:true}).isVisible());
  assert.ok((await page.locator('.session-menu-actions button').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height))).every(h=>h>=44 && h<=55));
  if(width===390)await page.screenshot({path:'docs/audit/polish-a-options-after-390.png'});
  await page.getByRole('button',{name:'Zamknij opcje ćwiczenia'}).click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByLabel('Ciężar serii 1',{exact:true}).focus();
  await page.evaluate(()=>{Object.defineProperty(visualViewport,'height',{value:340,configurable:true});visualViewport.dispatchEvent(new Event('resize'));});
  await page.waitForTimeout(80);
  const input=await page.getByLabel('Ciężar serii 1',{exact:true}).boundingBox(),dock=await page.locator('.workout-action-dock').boundingBox();
  assert.ok(input.y>=0 && input.y+input.height<=dock.y && dock.y+dock.height<=341);
  await page.evaluate(()=>{document.activeElement?.blur();delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'));});
 }
 await page.setViewportSize({width:390,height:844});
 for(let n=1;n<=2;n++){
  await page.getByLabel(`Ciężar serii ${n}`,{exact:true}).fill(n===1?'70':'80');
  await page.getByRole('button',{name:`Zatwierdź serię ${n}`,exact:true}).click();
  await page.getByRole('button',{name:'Dodaj serię',exact:true}).click();
 }
 assert.ok((await page.locator('.series-compact').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height))).every(h=>h<=60));
 assert.equal(await page.locator('.compact-rest').count(),1);
 await page.getByLabel('Ciężar serii 3',{exact:true}).fill('80');
 await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});
 await page.waitForTimeout(200);
 await page.screenshot({path:'docs/audit/polish-a-after-390.png',fullPage:true});
 assert.deepEqual((await data()).plans,initial.plans);
 // Different catalogue poses keep the full 3:2 tile. Custom portrait/landscape images use contain.
 for(let i=0;i<3;i++){
  await page.getByRole('button',{name:'Następne ćwiczenie',exact:true}).click();
  const ratio=await page.locator('.workout-hero-photo .exercise-photo').evaluate(el=>el.clientWidth/el.clientHeight);assert.ok(Math.abs(ratio-1.5)<0.03);
 }
 for(const [w,h] of [[200,600],[600,200]]){
  await page.evaluate(([w,h])=>{const c=document.createElement('canvas');c.width=w;c.height=h;const key='pakiernia.v2.local',snapshot=JSON.parse(localStorage.getItem(key));snapshot.data.activeSession.exercises[snapshot.data.activeSession.index].customPhoto=c.toDataURL('image/jpeg');localStorage.setItem(key,JSON.stringify(snapshot));},[w,h]);
  await page.reload();await page.getByRole('button',{name:'Wznów rozpoczęty trening'}).click();
  assert.equal(await page.locator('.workout-hero-photo .exercise-photo').evaluate(el=>getComputedStyle(el).backgroundSize),'contain');
 }
 assert.deepEqual(errors,[]);console.log('Polish A: full photo tiles/custom contain, zoom, one-row idle rest/start/+15/skip, compact options/results, 320–430 px and simulated keyboard PASS.');
}finally{await browser.close();}
