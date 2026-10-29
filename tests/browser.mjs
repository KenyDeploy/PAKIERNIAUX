import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
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
await page.reload();
await page.getByRole('button',{name:'Wznów rozpoczęty trening'}).click();
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
  await page.locator('.bottom-nav').getByRole('button',{name:tab,exact:true}).click();
  const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(overflow.scroll<=overflow.width,`Overflow ${width}/${tab}: ${JSON.stringify(overflow)}`);
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
assert.deepEqual(errors,[]);
console.log('PASS: completed workout -> history -> real chart -> body deltas -> reload/resume -> previous results; 36 viewport/tab checks; inputs >=16px; no page errors.');
await browser.close();
