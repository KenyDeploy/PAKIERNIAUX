import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto(process.env.APP_URL||'http://127.0.0.1:5173');
 const nav=name=>page.locator('.bottom-nav').getByRole('button',{name,exact:true}).click();const data=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
 await nav('Plany');await page.locator('.plan-card').filter({hasText:'Góra ciała — siła'}).getByRole('button',{name:'Rozpocznij',exact:true}).click();
 await page.getByLabel('Ciężar serii 1',{exact:true}).fill('22,5');await page.getByLabel('Powtórzenia serii 1',{exact:true}).fill('8');await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();
 assert.equal(await page.locator('.series-compact').count(),1);assert.equal((await data()).activeSession.exercises[0].sets.length,1);
 await page.getByRole('button',{name:'Czas treningu i opcje'}).click();await page.getByRole('button',{name:'Zakończ trening',exact:true}).click();await page.getByRole('button',{name:'Zapisz trening',exact:true}).click();assert.equal((await data()).workouts[0].volume,180);assert.equal((await data()).workouts[0].exercises[0].sets.length,1);
 await nav('Historia');assert.match(await page.locator('main').innerText(),/180/);await nav('Postęp');assert.match(await page.locator('.chart-value').innerText(),/22,5/);
 await nav('Pomiary');for(const [date,value] of [['2026-10-22','37'],['2026-10-29','38']]){await page.getByRole('button',{name:'Dodaj pomiar',exact:true}).click();await page.locator('input[name=date]').fill(date);await page.locator('input[name=bicepsRight]').fill(value);await page.getByRole('button',{name:'Zapisz pomiar',exact:true}).click();}assert.match(await page.getByTestId('measurement-change').innerText(),/\+1 cm/);
 for(const theme of ['Electric Lime','Neon Magenta','Electric Blue','Cyber Violet','Solar Orange','Arctic Teal']){
  await page.getByRole('button',{name:'Ustawienia',exact:true}).click();await page.getByRole('button',{name:theme,exact:true}).click();await page.getByRole('button',{name:'Zapisz motyw',exact:true}).click();
  for(const width of [320,375,390,430]){await page.setViewportSize({width,height:740});for(const tab of ['Pulpit','Plany','Baza','Historia','Postęp','Pomiary']){await nav(tab);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),theme+'/'+width+'/'+tab);assert.ok((await page.locator('input,select,textarea').evaluateAll(nodes=>nodes.map(el=>parseFloat(getComputedStyle(el).fontSize)))).every(size=>size>=16));}}
 }
 await nav('Postęp');assert.equal(await page.locator('.trend-chart polyline').getAttribute('stroke'),'var(--accent)');assert.ok((await page.locator('.badge-item small').allTextContents()).includes('Pierwszy trening'));assert.equal(await page.locator('.badge-item small').first().evaluate(el=>getComputedStyle(el,'::after').content),'none');
 if(process.env.AUDIT_SCREENSHOT){await page.getByRole('button',{name:'Ustawienia',exact:true}).click();await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:process.env.AUDIT_SCREENSHOT});}
 assert.deepEqual(errors,[]);console.log('Final audit: actual workout/history/progress/measurements, 6 themes × 4 widths × 6 tabs; no overflow, small numeric inputs or console errors.');
}finally{await browser.close();}
