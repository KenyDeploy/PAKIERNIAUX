import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true,args:['--no-sandbox'], ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const page = await context.newPage();
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173');
await page.locator('.bottom-nav').getByRole('button',{name:'Baza',exact:true}).click();
assert.equal(await page.locator('.exercise-row').count(),72);
assert.equal(await page.locator('.exercise-group-heading').count(),7);
assert.equal(await page.locator('.exercise-photo-thumb').count(),72);
const photoUrls=await page.locator('.exercise-photo-thumb').evaluateAll(nodes=>[...new Set(nodes.map(el=>getComputedStyle(el).backgroundImage.match(/url\("?([^\")]+)"?\)/)[1]))]);
for(const url of photoUrls){const response=await page.request.get(url);assert.equal(response.status(),200);assert.ok(response.headers()['content-type'].includes('image/webp'),`Photo not served as an image: ${url}`);}
await page.getByLabel('Filtr sprzętu').selectOption('Maszyna');
await page.locator('.category-scroll').getByRole('button',{name:'Nogi',exact:true}).click();
assert.ok(await page.locator('.exercise-row').count()>=8);
assert.ok((await page.locator('.exercise-list').innerText()).includes('suwnicy'));
assert.ok(!(await page.locator('.exercise-list').innerText()).includes('Hantle'));
await page.getByLabel('Filtr sprzętu').selectOption('Wszystkie');
await page.locator('.category-scroll').getByRole('button',{name:'Wszystkie',exact:true}).click();
await page.locator('.bottom-nav').getByRole('button',{name:'Pulpit',exact:true}).click();
await page.getByRole('button',{name:'Rozpocznij trening'}).click();
assert.equal(await page.locator('.bottom-nav').count(),0);
assert.equal(await page.locator('.workout-navigation').evaluate(el=>getComputedStyle(el).position),'static');
assert.equal(await page.locator('.current-exercise').evaluate(el=>getComputedStyle(el,'::before').content),'none');
for(const width of [320,390,768]){
 await page.setViewportSize({width,height:844});
 assert.ok(await page.evaluate(width=>document.documentElement.scrollWidth<=width && innerWidth<=width,width));
 const positions=await page.evaluate(()=>({sets:document.querySelector('.current-exercise').getBoundingClientRect().bottom,nav:document.querySelector('.workout-navigation').getBoundingClientRect().top}));
 assert.ok(positions.nav>=positions.sets,'Workout navigation overlaps sets');
}
await page.setViewportSize({width:390,height:844});
await page.getByRole('textbox',{name:'Ciężar serii 1',exact:true}).fill('22,5');
await page.getByRole('textbox',{name:'Powtórzenia serii 1',exact:true}).fill('8');
await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();
await page.getByRole('button',{name:'Dodaj serię'}).click();
assert.equal(await page.locator('.set-row').count(),4);
await page.getByRole('button',{name:'Następne',exact:true}).click();
await page.getByRole('textbox',{name:'Ciężar serii 1',exact:true}).fill('50');
await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();
const restUntil = await page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data.activeSession.restUntil);
await page.getByRole('button',{name:'Poprzednie',exact:true}).click();
assert.equal(await page.getByRole('textbox',{name:'Ciężar serii 1',exact:true}).inputValue(),'22,5');
await page.getByRole('button',{name:'Następne',exact:true}).click();
assert.equal(await page.getByRole('textbox',{name:'Ciężar serii 1',exact:true}).inputValue(),'50');
assert.ok(await page.locator('.workout-header').evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('.topbar').getBoundingClientRect().bottom));
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
await page.getByRole('button',{name:'Zapisz zatwierdzone serie',exact:true}).click();
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
await page.getByRole('button',{name:'Zapisz zatwierdzone serie',exact:true}).click();
await page.getByText('Dobra robota!').waitFor();
await page.reload();
await page.locator('.bottom-nav').getByRole('button',{name:'Historia',exact:true}).click();
assert.ok((await page.locator('main').innerText()).includes('Plan testowy bez przerwy'));
// Manual attendance updates every count and history without inventing session results.
await page.locator('.bottom-nav').getByRole('button',{name:'Pulpit',exact:true}).click();
const manualDate=await page.evaluate(()=>{const d=new Date();d.setDate(d.getDate()===1?2:1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
const beforeManual=await page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
await page.getByRole('button',{name:`Trening ${manualDate}`,exact:true}).click();
assert.equal(await page.getByTestId('training-count').innerText(),'3');
await page.locator('.bottom-nav').getByRole('button',{name:'Historia',exact:true}).click();
assert.equal(await page.getByTestId('history-training-count').innerText(),'3');
assert.equal(await page.getByText('Trening oznaczony ręcznie',{exact:true}).count(),1);
const afterManual=await page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
assert.deepEqual(afterManual.workouts,beforeManual.workouts);
await page.reload();
assert.equal(await page.getByTestId('training-count').innerText(),'3');
await page.getByRole('button',{name:`Trening ${manualDate}`,exact:true}).click();
assert.equal(await page.getByTestId('training-count').innerText(),'2');
// The finish dialog lets the user explicitly confirm filled, unchecked sets.
await page.getByRole('button',{name:'Rozpocznij trening'}).click();
await page.getByRole('textbox',{name:'Ciężar serii 1',exact:true}).fill('30,5');
await page.getByRole('button',{name:'Zakończ trening',exact:true}).click();
const dialog=page.getByRole('dialog',{name:'Zakończyć trening?'});
assert.ok((await dialog.innerText()).includes('Zatwierdzone serie: 0'));
await page.screenshot({path:'/tmp/pakiernia-finish-review.png',fullPage:true});
await dialog.getByRole('button',{name:'Zatwierdź wypełnione serie i zapisz',exact:true}).click();
await page.getByText('Dobra robota!').waitFor();
const finished=await page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
assert.equal(finished.activeSession,null);
assert.equal(finished.workouts.length,3);
assert.equal(finished.workouts[0].exercises[0].sets[0].weight,'30,5');
// Empty sessions can be closed deliberately, without creating a fake workout.
await page.locator('.bottom-nav').getByRole('button',{name:'Plany',exact:true}).click();
await page.locator('.plan-card').filter({hasText:'Dół ciała — siła'}).getByRole('button',{name:'Rozpocznij',exact:true}).click();
await page.getByRole('button',{name:'Zakończ trening',exact:true}).click();
assert.ok((await dialog.innerText()).includes('Nie ma serii do zapisania'));
await dialog.getByRole('button',{name:'Odrzuć trening bez zapisu',exact:true}).click();
assert.equal(await page.getByTestId('training-count').innerText(),'3');
assert.equal(await page.getByRole('button',{name:'Wznów rozpoczęty trening'}).count(),0);
assert.deepEqual(errors,[]);
console.log('PASS: plan -> workout -> finish review -> save -> history -> chart -> reload; manual attendance/counts/history; confirm unchecked sets; discard empty session; rest deadlines and zero rest; 36 viewport/tab and 4 modal checks; inputs >=16px; no page errors.');
await browser.close();
