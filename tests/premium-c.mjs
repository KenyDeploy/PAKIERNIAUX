import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.clock.install({time:new Date('2026-11-02T12:00:00Z')});await page.goto(process.env.APP_URL||'http://127.0.0.1:4182');
 assert.equal(await page.getByTestId('total-xp').innerText(),'0 XP');assert.match(await page.locator('.dashboard-progress-card').innerText(),/dwóch zapisach/);
 await page.getByRole('button',{name:'Rozpocznij trening',exact:true}).click();
 await page.evaluate(()=>{const k='pakiernia.v2.local',s=JSON.parse(localStorage.getItem(k));s.data.activeSession=null;s.data.workouts=Array.from({length:10},(_,i)=>({id:'fixture-'+i,startedAt:new Date(2026,9,24+i,9).getTime(),completedAt:new Date(2026,9,24+i,10).getTime(),plan:{id:1,name:'Plan'},exercises:[{id:1,name:s.data.exercises[0].name,sets:[{weight:40+i*2.5,reps:8,completed:true},{weight:999,reps:10,completed:false}]}]}));s.data.completedDays=['2026-11-01'];s.data.measurements=[{id:'m1',date:'2026-10-01',weight:80},{id:'m2',date:'2026-10-08',weight:81},{id:'m3',date:'2026-10-15',waist:85}];localStorage.setItem(k,JSON.stringify(s));});
 await page.reload();const snapshot=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
 const before=await snapshot();assert.equal(await page.getByTestId('total-xp').innerText(),'1045 XP');assert.match(await page.locator('.rewards-heading h2').innerText(),/4/);
 assert.equal(await page.getByRole('progressbar',{name:'Postęp do następnego poziomu'}).getAttribute('aria-valuenow'),'145');
 assert.equal(await page.locator('.dashboard-metric .mini-chart').count(),2);assert.equal(await page.locator('.dashboard-progress-card .mini-chart').count(),1);
 assert.match(await page.locator('.dashboard-progress-card').innerText(),/REKORD/);assert.match(await page.locator('.dashboard-progress-card').innerText(),/62,5 kg/);
 await page.locator('.rewards-panel summary').click();assert.equal(await page.locator('.reward-badge.earned').count(),6);
 for(const width of [320,375,390,430]){
  await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);await page.screenshot({path:'docs/audit/premium-c-rewards-after-390.png',fullPage:true});
 await page.locator('.bottom-nav').getByRole('button',{name:'Postęp',exact:true}).click();assert.equal(await page.getByTestId('total-xp').innerText(),'1045 XP');assert.equal(await page.locator('.reward-badge').count(),7);
 await page.locator('.bottom-nav').getByRole('button',{name:'Baza',exact:true}).click();assert.equal(await page.locator('.exercise-row').count(),72);
 const normal=(await page.locator('.exercise-row').first().boundingBox()).height;
 await page.getByRole('button',{name:'Kompaktowa lista',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Kompaktowa lista'}).getAttribute('aria-pressed'),'true');
 assert.ok((await page.locator('.exercise-row').first().boundingBox()).height<normal);
 assert.equal(await page.locator('.exercise-edit-button').count(),0);
 for(const width of [320,375,390,430]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const b=await page.locator('.exercise-row').first().boundingBox();assert.ok(b.width>=44 && b.height>=44);}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);await page.screenshot({path:'docs/audit/premium-c-catalog-compact-390.png'});
 await page.locator('.exercise-row').first().click();await page.getByRole('button',{name:'Edytuj ćwiczenie i zdjęcie',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'Edytuj ćwiczenie',exact:true}).isVisible());await page.getByRole('button',{name:'Zamknij',exact:true}).click();
 await page.getByPlaceholder('Szukaj ćwiczenia...',{exact:true}).fill('wyciskanie');assert.ok(await page.locator('.exercise-row').count()>0);await page.getByPlaceholder('Szukaj ćwiczenia...',{exact:true}).fill('');
 await page.getByLabel('Filtr sprzętu').selectOption('Maszyna');await page.locator('.category-scroll').getByRole('button',{name:'Nogi',exact:true}).click();assert.ok(await page.locator('.exercise-row').count()>0);
 assert.deepEqual((await snapshot()).workouts,before.workouts);assert.deepEqual((await snapshot()).exercises,before.exercises);assert.equal((await snapshot()).xp,undefined);
 await page.reload();assert.equal(await page.getByTestId('total-xp').innerText(),'1045 XP');assert.deepEqual(errors,[]);
 console.log('Premium C: real mini charts/records, derived XP and six badges, shared stats, compact catalogue/edit/filter, reload/no new data copies, 320–430 px PASS.');
}finally{await browser.close();}
