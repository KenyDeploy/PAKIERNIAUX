import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:4180');
  const snapshot=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
  const select=async n=>{const edit=page.getByRole('button',{name:`Edytuj serię ${n}`,exact:true});if(await edit.count())await edit.click();else await page.getByLabel(`Ciężar serii ${n}`,{exact:true}).scrollIntoViewIfNeeded();};
  const save=async(n,weight='20')=>{await page.getByLabel(`Ciężar serii ${n}`,{exact:true}).fill(weight);await page.getByRole('button',{name:`Zatwierdź serię ${n}`,exact:true}).click();};
  await page.locator('.bottom-nav').getByRole('button',{name:'Plany',exact:true}).click();
  await page.locator('.plan-card').filter({hasText:'Góra ciała — siła'}).getByRole('button',{name:'Rozpocznij',exact:true}).click();
  const initial=await snapshot();await save(1);
  assert.equal(await page.locator('.series-compact').count(),1);assert.equal((await snapshot()).activeSession.exercises[0].sets.length,1);
  await page.getByRole('button',{name:'Dodaj serię',exact:true}).click();assert.equal((await snapshot()).activeSession.exercises[0].sets.length,2);
  await select(1);await page.getByRole('button',{name:'Opcje ćwiczenia',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Dodaj serię',exact:true}).click();
  assert.ok(await page.getByLabel('Ciężar serii 3',{exact:true}).isVisible(),'Menu addition must override local correction selection');
  await save(3,'40');assert.ok(await page.getByLabel('Ciężar serii 2',{exact:true}).isVisible());
  await save(2,'25');assert.equal(await page.locator('.active-set-editor input').count(),0);
  const performed=(await snapshot()).activeSession.exercises[0].sets;
  await page.getByRole('button',{name:'Dodaj serię',exact:true}).click();assert.ok(await page.getByLabel('Ciężar serii 4',{exact:true}).isVisible());assert.equal((await snapshot()).activeSession.exercises[0].sets[3].completed,false);
  assert.deepEqual((await snapshot()).activeSession.exercises[0].sets.slice(0,3),performed);
  await page.getByLabel('Ciężar serii 4',{exact:true}).fill('42,5');await page.reload();await page.getByRole('button',{name:'Wznów rozpoczęty trening',exact:true}).click();assert.equal(await page.getByLabel('Ciężar serii 4',{exact:true}).inputValue(),'42,5');
  await select(1);await page.getByLabel('Powtórzenia serii 1',{exact:true}).fill('7');
  await page.evaluate(()=>{window.__uxSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota');};});await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();assert.ok(await page.getByLabel('Powtórzenia serii 1',{exact:true}).isVisible());assert.ok(await page.getByRole('alert').isVisible());assert.equal((await snapshot()).activeSession.exercises[0].sets[0].completed,false);
  await page.evaluate(()=>{Storage.prototype.setItem=window.__uxSet;});await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();assert.equal((await snapshot()).activeSession.exercises[0].sets[0].reps,'7');
  for(const [width,height] of [[320,740],[375,740],[390,740],[430,740],[320,420]]) {
    await page.setViewportSize({width,height});await select(4);await page.getByLabel('Ciężar serii 4',{exact:true}).focus();await page.waitForTimeout(100);
    const input=await page.getByLabel('Ciężar serii 4',{exact:true}).boundingBox();assert.ok(input.y>=0 && input.y+input.height<=height);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.equal(await page.locator('.workout-navigation').evaluate(el=>getComputedStyle(el).position),'static');
    await page.locator('.workout-navigation').scrollIntoViewIfNeeded();assert.ok(await page.locator('.workout-navigation .primary-cta').evaluate(el=>{const r=el.getBoundingClientRect();return r.bottom<=innerHeight && el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));
  }
  assert.deepEqual((await snapshot()).plans,initial.plans);assert.deepEqual((await snapshot()).workouts,initial.workouts);
  await page.setViewportSize({width:390,height:740});await select(4);await page.getByLabel('Ciężar serii 4',{exact:true}).focus();
  await page.evaluate(()=>{window.scrollTo(0,0);Object.defineProperty(window.visualViewport,'height',{value:300,configurable:true});window.visualViewport.dispatchEvent(new Event('resize'));});await page.waitForTimeout(100);
  const visibleInput=await page.getByLabel('Ciężar serii 4',{exact:true}).boundingBox();assert.ok(visibleInput.y>=0 && visibleInput.y+visibleInput.height<=300,'Focused field must fit the visual viewport, not just innerHeight');
  await page.evaluate(()=>{delete window.visualViewport.height;window.visualViewport.dispatchEvent(new Event('resize'));});
  // Use isolated local fixtures to exercise manual and recorded history at enlarged text sizes.
  await page.evaluate(()=>{const key='pakiernia.v2.local',c=JSON.parse(localStorage.getItem(key));c.data.completedDays=['2026-10-20'];c.data.workouts=[{id:'history-ux-fixture',completedAt:new Date('2026-10-21T12:00:00').getTime(),durationSeconds:90,volume:160,plan:{name:'Długi tytuł zapisanego treningu — test czytelności'},exercises:[{id:1,name:'Wyciskanie',sets:[{weight:'20',reps:'8',completed:true}]}]}];localStorage.setItem(key,JSON.stringify(c));});
  await page.reload();await page.locator('.bottom-nav').getByRole('button',{name:'Historia',exact:true}).click();
  await page.addStyleTag({content:'html{font-size:24px} .history-list .history-row h2{font-size:2rem}'});
  for(const width of [320,375,390,430]) {
    await page.setViewportSize({width,height:740});
    for(const card of await page.locator('.history-row').all()) {
      const boxes=await card.evaluate(el=>{const r=s=>el.querySelector(s).getBoundingClientRect();return {date:r('time').bottom,titleTop:r('h2').top,titleBottom:r('h2').bottom,descriptionTop:r('p').top,overflow:el.scrollWidth>el.clientWidth};});
      assert.ok(boxes.titleTop>=boxes.date && boxes.descriptionTop>=boxes.titleBottom && !boxes.overflow,JSON.stringify(boxes));
    }
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  if(process.env.UX_HISTORY_SCREENSHOT)await page.screenshot({path:process.env.UX_HISTORY_SCREENSHOT,fullPage:true});
  assert.deepEqual(errors,[]);console.log('UX A regression: growing cards/add/menu/correction/quota/reload; history enlarged text; viewport 320–430 px and 420 px keyboard simulation passed. No physical iPhone test.');
} finally {await browser.close();}
