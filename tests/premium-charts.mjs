import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.clock.install({time:new Date('2026-11-02T12:00:00Z')});await page.goto(process.env.APP_URL||'http://127.0.0.1:4182');
 assert.equal(await page.locator('.mini-chart .chart-line').count(),0);
 await page.getByRole('button',{name:'Rozpocznij trening',exact:true}).click();
 await page.evaluate(()=>{const k='pakiernia.v2.local',s=JSON.parse(localStorage.getItem(k));s.data.activeSession=null;s.data.workouts=[1,10,20].map((days,i)=>{const t=Date.now()-days*86400000;return {id:'chart-'+i,startedAt:t-1800000,completedAt:t,plan:{id:1,name:'Plan'},exercises:[{id:1,name:s.data.exercises[0].name,sets:[{weight:40+i*5,reps:8,completed:true}]}]};});s.data.measurements=[{date:'2026-10-01',weight:80},{date:'2026-10-15',weight:82},{date:'2026-10-30',weight:81}];localStorage.setItem(k,JSON.stringify(s));});
 for(const theme of ['lime','blue','mono']){
  await page.evaluate(theme=>{const k='pakiernia.v2.local',s=JSON.parse(localStorage.getItem(k));s.data.preferences={...s.data.preferences,theme};localStorage.setItem(k,JSON.stringify(s));},theme);await page.reload();
  const mini=page.locator('.dashboard-metric').first();await mini.locator('svg [role=button]').last().click();assert.ok(await page.locator('.home-dashboard').isVisible());assert.match(await mini.locator('.mini-chart-value').innerText(),/2026/);
  await page.locator('.bottom-nav').getByRole('button',{name:'Postęp',exact:true}).click();const chart=page.locator('.chart-panel').first();
  await page.getByLabel('Zakres wykresu',{exact:true}).selectOption('7');assert.equal(await chart.locator('.chart-line').count(),0);assert.equal(await chart.locator('svg [role=button]').count(),1);
  await page.getByLabel('Zakres wykresu',{exact:true}).selectOption('3650');assert.match(await chart.locator('.chart-line').getAttribute('d'),/ C /);assert.equal(await chart.locator('.chart-fill').count(),1);
  const color=await chart.locator('.chart-line').evaluate(el=>getComputedStyle(el).stroke);assert.equal(color,theme==='lime'?'rgb(201, 255, 49)':theme==='blue'?'rgb(78, 165, 255)':'rgb(242, 242, 242)');
  assert.equal(await chart.locator('.chart-line').evaluate(el=>getComputedStyle(el).filter),'none');
  await chart.locator('svg [role=button]').first().click();assert.match(await chart.locator('.chart-value').innerText(),/50 kg/);
  for(const width of [320,375,390,430]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await page.setViewportSize({width:390,height:844});
  await page.locator('.bottom-nav').getByRole('button',{name:'Pomiary',exact:true}).click();await page.getByLabel('Wybierz pomiar').selectOption('weight');const body=page.locator('.body-list-panel .trend-chart');
  assert.equal(await body.locator('.chart-line').count(),1);await body.getByRole('button',{name:'7 dni',exact:true}).click();assert.equal(await body.locator('.chart-line').count(),0);assert.equal(await body.locator('svg [role=button]').count(),1);
  await body.getByRole('button',{name:'Cały okres',exact:true}).click();assert.equal(await body.locator('svg [role=button]').count(),3);
 }
 await page.locator('.bottom-nav').getByRole('button',{name:'Pulpit',exact:true}).click();await page.getByRole('button',{name:'Rozpocznij trening',exact:true}).click();
 await page.getByRole('button',{name:'Ostatni trening — szczegóły ćwiczenia'}).click();await page.locator('.exercise-history-charts > summary').click();
 assert.equal(await page.locator('.exercise-history-charts .chart-line').count(),2);
 await page.locator('.exercise-history-charts .trend-chart').first().getByRole('button',{name:'7 dni',exact:true}).click();assert.equal(await page.locator('.exercise-history-charts .trend-chart').first().locator('.chart-line').count(),0);
 await page.keyboard.press('Escape');
 await page.locator('.brand').click();await page.getByRole('button',{name:'Ustawienia',exact:true}).click();
 await page.getByRole('button',{name:'Electric Lime',exact:true}).click();await page.getByRole('button',{name:'Classic Mono',exact:true}).click();await page.getByRole('button',{name:'Zapisz motyw',exact:true}).click();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data.preferences.theme),'mono');
 assert.deepEqual(errors,[]);console.log('Premium curves: Lime/Blue/Mono colors, no glow, monotone paths/gradient, exact point interaction, empty/single-point states, ranges, body/strength/expanded exercise weight and volume history, 320–430 px PASS.');
}finally{await browser.close();}
