import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(process.env.APP_URL||'http://127.0.0.1:4180');
  const data=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
  const rows=async()=>(await data()).activeSession.exercises[0].sets;
  const resume=()=>page.getByRole('button',{name:'Wznów rozpoczęty trening',exact:true}).click();
  const start=async()=>{await page.locator('.bottom-nav').getByRole('button',{name:'Plany',exact:true}).click();await page.locator('.plan-card').filter({hasText:'Góra ciała — siła'}).getByRole('button',{name:'Rozpocznij',exact:true}).click();};
  const add=()=>page.getByRole('button',{name:'Dodaj serię',exact:true}).click();
  const save=async(n,weight,reps='8')=>{await page.getByLabel(`Ciężar serii ${n}`,{exact:true}).fill(weight);await page.getByLabel(`Powtórzenia serii ${n}`,{exact:true}).fill(reps);await page.getByRole('button',{name:`Zatwierdź serię ${n}`,exact:true}).click();};
  const finish=async()=>{await page.getByRole('button',{name:'Czas treningu i opcje'}).click();await page.getByRole('button',{name:'Zakończ trening',exact:true}).click();};
  await start();const initial=await data();assert.equal((await rows()).length,1);assert.equal(await page.locator('.series-entry').count(),1);assert.equal(await page.locator('.series-picker, .series-history').count(),0);
  assert.equal((await data()).activeSession.exercises[0].targetSets,3);
  for(let i=0;i<5;i++)await add();assert.equal((await rows()).length,6);
  await page.getByRole('button',{name:'Usuń serię 6',exact:true}).click();assert.equal(await page.getByRole('dialog').count(),0);assert.equal((await rows()).length,5);
  const originalIds=(await rows()).map(row=>row.id);assert.equal(new Set(originalIds).size,5);
  for(const n of [1,2,3])await save(n,String(n*10));
  assert.equal(await page.locator('.series-compact').count(),3);assert.equal(await page.locator('.set-row').count(),2);assert.equal((await rows()).length,5,'Saving never automatically appends a row');
  for(const width of [320,375,390,430]) {
    await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.ok((await page.locator('.series-compact').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height))).every(height=>height<=100));
    await page.getByLabel('Ciężar serii 5',{exact:true}).focus();
    await page.evaluate(()=>{Object.defineProperty(visualViewport,'height',{value:300,configurable:true});visualViewport.dispatchEvent(new Event('resize'));});await page.waitForTimeout(80);
    const r=await page.getByLabel('Ciężar serii 5',{exact:true}).boundingBox();assert.ok(r.y>=0 && r.y+r.height<=300);
    await page.evaluate(()=>{delete visualViewport.height;visualViewport.dispatchEvent(new Event('resize'));});
  }
  await page.setViewportSize({width:390,height:844});await page.locator('.current-exercise').scrollIntoViewIfNeeded();
  if(process.env.AFTER_SCREENSHOT){await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});await page.screenshot({path:process.env.AFTER_SCREENSHOT,fullPage:true});}
  await page.getByRole('button',{name:'Edytuj serię 1',exact:true}).click();await save(1,'25','7');assert.equal((await rows())[0].id,originalIds[0]);
  await page.getByRole('button',{name:'Usuń serię 2',exact:true}).click();await page.getByRole('button',{name:'Anuluj usuwanie serii'}).click();assert.equal((await rows()).length,5);
  await page.getByRole('button',{name:'Usuń serię 2',exact:true}).click();const before=await rows();
  await page.evaluate(()=>{window.__set=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota');};});await page.getByRole('button',{name:'Potwierdź usunięcie serii'}).click();assert.deepEqual(await rows(),before);assert.ok(await page.getByRole('alert').isVisible());
  await page.evaluate(()=>{Storage.prototype.setItem=window.__set;});await page.getByRole('button',{name:'Potwierdź usunięcie serii'}).click();
  const remaining=[originalIds[0],...originalIds.slice(2)];assert.deepEqual((await rows()).map(row=>row.id),remaining);
  assert.deepEqual(await page.locator('.series-entry b').allTextContents(),['Seria 1','Seria 2','Seria 3','Seria 4']);
  await page.reload();await resume();assert.deepEqual((await rows()).map(row=>row.id),remaining);assert.equal((await rows()).length,4);
  await page.locator('.brand').click();await resume();assert.equal((await rows()).length,4);
  await finish();await page.getByRole('button',{name:'Zapisz trening',exact:true}).click();let snapshot=await data();assert.equal(snapshot.workouts.length,1);assert.equal(snapshot.workouts[0].volume,415);assert.deepEqual(snapshot.workouts[0].exercises[0].sets.map(row=>row.id),[originalIds[0],originalIds[2]]);assert.deepEqual(snapshot.plans,initial.plans);
  await start();await page.evaluate(()=>{const k='pakiernia.v2.local',c=JSON.parse(localStorage.getItem(k));c.data.activeSession.exercises[0].sets=[{id:'legacy-performed',weight:'50',reps:'8',completed:true,note:'preserve'},{weight:'55',reps:'6',completed:false},{id:'legacy-pending',weight:'',reps:'8',completed:false}];c.data.activeSession.exercises[0].targetSets=7;localStorage.setItem(k,JSON.stringify(c));});
  await page.reload();await resume();assert.equal(await page.locator('.series-compact').count(),1);assert.equal(await page.locator('.set-row').count(),2);assert.equal((await rows())[0].note,'preserve');await save(2,'55','6');assert.equal((await rows()).length,3);assert.equal((await rows())[2].id,'legacy-pending');
  // Empty exercises remain empty even though their plan target is nonzero.
  for(let n=3;n>=1;n--){await page.getByRole('button',{name:`Usuń serię ${n}`,exact:true}).click();if(await page.getByRole('dialog').count())await page.getByRole('button',{name:'Potwierdź usunięcie serii'}).click();}
  assert.equal((await rows()).length,0);await page.reload();await resume();assert.equal((await rows()).length,0);assert.equal((await data()).activeSession.exercises[0].targetSets,7);
  await finish();assert.equal(await page.getByRole('button',{name:'Zapisz trening',exact:true}).count(),0);await page.getByRole('button',{name:'Odrzuć trening bez zapisu'}).click();assert.equal((await data()).workouts.length,1);
  assert.deepEqual((await data()).plans,initial.plans);assert.deepEqual(errors,[]);
  console.log('Growing series: 5 rows / 3 confirmations / edit first / delete second / quota / stable IDs / refresh / re-entry / finish / legacy drafts / empty exercise; 320–430 px and simulated keyboard passed.');
}finally{await browser.close();}
