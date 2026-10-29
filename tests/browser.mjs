import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true,args:['--no-sandbox'], ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const page = await context.newPage();
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173');
await page.getByRole('button',{name:'Rozpocznij trening'}).click();
await page.getByRole('textbox',{name:'Ciężar serii 1',exact:true}).fill('22,5');
await page.getByRole('textbox',{name:'Powtórzenia serii 1',exact:true}).fill('8');
await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();
await page.getByRole('button',{name:'Dodaj serię'}).click();
assert.equal(await page.locator('.set-row').count(),4);
await page.getByRole('button',{name:'Następne',exact:true}).click();
await page.getByRole('textbox',{name:'Ciężar serii 1',exact:true}).fill('50');
await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();
const restUntil = await page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data.activeSession.restUntil);
assert.ok(restUntil > Date.now());
await page.reload();
await page.getByRole('button',{name:'Wznów rozpoczęty trening'}).click();
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data.activeSession.restUntil),restUntil);
await page.locator('.rest-card').waitFor();
assert.ok((await page.locator('.rest-card').innerText()).includes('PRZERWA'));
assert.equal(await page.getByRole('textbox',{name:'Ciężar serii 1',exact:true}).inputValue(),'50');
assert.equal(await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).getAttribute('aria-pressed'),'true');
await page.getByRole('button',{name:'Następne',exact:true}).click();
await page.getByRole('button',{name:'Następne',exact:true}).click();
await page.getByRole('button',{name:'Zakończ',exact:true}).click();
await page.getByText('Dobra robota!').waitFor();
let data=await page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
assert.equal(data.workouts.length,1);assert.equal(data.workouts[0].volume,680);assert.equal(data.activeSession,null);
await page.locator('.bottom-nav').getByRole('button',{name:'Postęp'}).click();
await page.getByLabel('Ćwiczenie na wykresie').selectOption('1');
assert.ok((await page.locator('.chart-value').innerText()).includes('22,5'));
await page.locator('.bottom-nav').getByRole('button',{name:'Pomiary'}).click();
for (const [date,biceps,weight] of [['2026-10-22','37','86'],['2026-10-29','38','87']]) {
  await page.locator('input[name="date"]').fill(date);
  await page.locator('input[name="biceps"]').fill(biceps);
  await page.locator('input[name="weight"]').fill(weight);
  await page.getByRole('button',{name:'Zapisz pomiar'}).click();
}
assert.ok((await page.locator('.body-metrics').innerText()).includes('+1 cm od poprzedniego'));
await page.screenshot({path:'/tmp/pakiernia-body.png',fullPage:true});
for(const width of [320,375,390,430,768,1280]) {
 await page.setViewportSize({width,height:844});
 for(const tab of ['Pulpit','Plany','Baza','Historia','Postęp','Pomiary']) {
  await page.locator('.bottom-nav').getByRole('button',{name:tab,exact:true}).click({timeout:5000}).catch(async error=>{
   await page.screenshot({path:'/tmp/pakiernia-overlap.png',fullPage:true});
   console.error({width,tab,layout:await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollY,nav:document.querySelector('.bottom-nav').getBoundingClientRect().toJSON(),main:document.querySelector('main').getBoundingClientRect().toJSON()}))});throw error;
  });
  const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(overflow.scroll<=width && overflow.width<=width,`Overflow ${width}/${tab}: ${JSON.stringify(overflow)}`);
  const sizes=await page.locator('input').evaluateAll(nodes=>nodes.map(n=>parseFloat(getComputedStyle(n).fontSize)));
  assert.ok(sizes.every(s=>s>=16),`Small input on ${tab}`);
 }
}
await page.setViewportSize({width:390,height:844});
await page.locator('.bottom-nav').getByRole('button',{name:'Pulpit'}).click();
await page.getByRole('button',{name:'Rozpocznij trening'}).click();
assert.equal(await page.getByRole('textbox',{name:'Ciężar serii 1',exact:true}).inputValue(),'22,5');
assert.ok((await page.locator('.last-result-card').innerText()).includes('22,5 kg × 8'));
await page.screenshot({path:'/tmp/pakiernia-workout.png',fullPage:true});
// An expired persisted deadline must not restart the rest on reopening.
await page.evaluate(()=>{const key='pakiernia.v2.local';const cache=JSON.parse(localStorage.getItem(key));cache.data.activeSession.restUntil=Date.now()-1000;localStorage.setItem(key,JSON.stringify(cache));});
await page.reload();
await page.getByRole('button',{name:'Wznów rozpoczęty trening'}).click();
assert.equal(await page.locator('.rest-card').count(),0);
page.once('dialog',dialog=>dialog.accept());
await page.getByRole('button',{name:'Anuluj rozpoczęty trening'}).click();
await page.locator('.bottom-nav').getByRole('button',{name:'Plany',exact:true}).click();
await page.getByRole('button',{name:'Utwórz nowy plan'}).click();
await page.getByLabel('Nazwa planu').fill('Plan testowy bez przerwy');
assert.equal(await page.locator('.plan-exercise-edit').count(),1);
await page.locator('.plan-targets').getByLabel('Serie',{exact:true}).fill('2');
await page.locator('.plan-targets').getByLabel('Powt.',{exact:true}).fill('9');
await page.locator('.plan-targets').getByLabel('Przerwa (s)',{exact:true}).fill('0');
for(const width of [320,390,768,1280]){
 await page.setViewportSize({width,height:640});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Plan modal overflow at ${width}`);
}
await page.getByRole('button',{name:'Zapisz plan',exact:true}).click();
await page.locator('.plan-card').filter({hasText:'Plan testowy bez przerwy'}).getByRole('button',{name:'Rozpocznij',exact:true}).click();
assert.equal(await page.locator('.set-row').count(),2);
await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();
assert.equal(await page.locator('.rest-card').count(),0);
await page.getByRole('button',{name:'Zakończ',exact:true}).click();
await page.getByText('Dobra robota!').waitFor();
await page.reload();
await page.locator('.bottom-nav').getByRole('button',{name:'Historia',exact:true}).click();
assert.ok((await page.locator('main').innerText()).includes('Plan testowy bez przerwy'));
assert.deepEqual(errors,[]);
console.log('PASS: plan targets -> workout -> save -> history -> chart -> reload; rest deadline persisted/expired, zero rest; 36 viewport/tab and 4 plan modal checks; inputs >=16px; no page errors.');
await browser.close();
