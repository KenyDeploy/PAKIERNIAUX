import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:process.platform==='win32'?{channel:'msedge'}:{})});
try {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,timezoneId:'Europe/Warsaw'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.clock.install({time:new Date('2026-10-30T11:00:00Z')});
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173');
  assert.equal(await page.getByTestId('training-count').innerText(),'0');assert.equal(await page.getByTestId('dashboard-set-count').innerText(),'0');
  assert.match(await page.locator('.dashboard-plan').innerText(),/Dół ciała — siła/);
  for(const [width,height] of [[320,568],[375,740],[390,844],[430,844]]) {
    await page.setViewportSize({width,height});
    const layout=await page.evaluate(()=>{const b=document.querySelector('.dashboard-start'),r=b.getBoundingClientRect(),calendar=document.querySelector('.workout-calendar').getBoundingClientRect(),stats=document.querySelector('.dashboard-metrics');return {width:document.documentElement.scrollWidth,cta:r.bottom,nav:document.querySelector('.bottom-nav').getBoundingClientRect().top,hit:b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),columns:getComputedStyle(stats).gridTemplateColumns.split(' ').length,calendar:calendar.top,week:document.querySelector('.dashboard-week').getBoundingClientRect().bottom};});
    assert.ok(layout.width<=width && layout.hit && layout.cta<layout.nav && layout.cta<400 && layout.columns===2 && layout.calendar>layout.week,JSON.stringify({width,...layout}));
  }
  await page.locator('.dashboard-water summary').click();await page.getByRole('button',{name:'Dodaj 0,2 litra'}).click();
  const snapshot=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
  const baseline=await snapshot();
  await page.evaluate(()=>{
    const key='pakiernia.v2.local',cache=JSON.parse(localStorage.getItem(key));
    const saved=(id,day,sets,volume)=>({id,startedAt:new Date(2026,9,day,10).getTime(),completedAt:new Date(2026,9,day,11).getTime(),durationSeconds:3600,volume,plan:{id:1,name:'Zapisany plan'},exercises:[{id:1,name:'Zapisane ćwiczenie',sets}]});
    cache.data.workouts=[saved('today',30,[{weight:'20',reps:'8',completed:true},{weight:'999',reps:'10',completed:false}],160),saved('recent',28,[{weight:'30',reps:'5',completed:true},{weight:null,reps:'10',completed:true}],150),saved('older',20,[{weight:'100',reps:'1',completed:true}],100)];
    cache.data.completedDays=['2026-10-28','2026-10-29'];cache.data.keepThisField={value:'preserve'};
    localStorage.setItem(key,JSON.stringify(cache));
  });
  await page.reload();
  assert.equal(await page.getByTestId('training-count').innerText(),'4');assert.equal(await page.getByTestId('dashboard-set-count').innerText(),'3');assert.match(await page.getByTestId('dashboard-volume').innerText(),/310 kg/);assert.equal(await page.getByTestId('dashboard-streak').innerText(),'3 dni');
  assert.equal(await page.locator('.dashboard-weekday[data-done="true"]').count(),3);
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.scrollTo(0,0));
  if(process.env.DASHBOARD_SCREENSHOT)await page.screenshot({path:process.env.DASHBOARD_SCREENSHOT});
  const beforeMark=await snapshot();
  await page.getByRole('button',{name:'Trening 2026-10-27',exact:true}).click();
  assert.equal(await page.getByTestId('training-count').innerText(),'5');assert.equal(await page.getByTestId('dashboard-set-count').innerText(),'3');assert.match(await page.getByTestId('dashboard-volume').innerText(),/310 kg/);
  await page.reload();assert.equal(await page.getByTestId('training-count').innerText(),'5');
  await page.getByRole('button',{name:'Trening 2026-10-27',exact:true}).click();
  assert.equal(await page.getByTestId('training-count').innerText(),'4');
  await page.getByRole('button',{name:'Trening 2026-10-30',exact:true}).click();
  assert.match(await page.locator('.notice').innerText(),/zapisany trening/);
  assert.deepEqual((await snapshot()).workouts,beforeMark.workouts);
  await page.locator('.dashboard-water summary').click();await page.getByRole('button',{name:'Dodaj 0,2 litra'}).click();assert.equal((await snapshot()).waterByDate['2026-10-30'],0.4);await page.getByRole('button',{name:'Odejmij 0,2 litra'}).click();assert.equal((await snapshot()).waterByDate['2026-10-30'],0.2);
  await page.locator('.dashboard-links').getByRole('button',{name:'Historia',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'Historia',exact:true}).isVisible());
  await page.locator('.brand').click();await page.locator('.dashboard-links').getByRole('button',{name:'Plany',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'Plany treningowe'}).isVisible());
  await page.locator('.brand').click();await page.locator('.dashboard-links').getByRole('button',{name:'Postęp',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'Twój postęp'}).isVisible());
  await page.locator('.brand').click();await page.getByRole('button',{name:'Rozpocznij trening',exact:true}).click();
  const draft=(await snapshot()).activeSession;assert.equal(draft.plan.id,2);
  await page.locator('.brand').click();assert.equal(await page.getByRole('button',{name:'Wznów rozpoczęty trening',exact:true}).count(),1);
  await page.getByRole('button',{name:'Wznów rozpoczęty trening',exact:true}).click();assert.equal((await snapshot()).activeSession.id,draft.id);
  const final=await snapshot();assert.deepEqual(final.plans,baseline.plans);assert.deepEqual(final.exercises,baseline.exercises);assert.deepEqual(final.workouts,beforeMark.workouts);assert.deepEqual(final.keepThisField,{value:'preserve'});
  await page.locator('.brand').click();await page.evaluate(()=>{const key='pakiernia.v2.local',cache=JSON.parse(localStorage.getItem(key));cache.data.activeSession=null;cache.data.plans=[];localStorage.setItem(key,JSON.stringify(cache));});await page.reload();
  await page.getByRole('button',{name:'Utwórz plan',exact:true}).click();assert.ok(await page.getByRole('heading',{name:'Plany treningowe'}).isVisible());
  assert.deepEqual(errors,[]);
  console.log('Dashboard: real metrics, manual calendar, hydration, plans, resume, empty state, links and 320–430 px passed');
}finally{await browser.close();}
