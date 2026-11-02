import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : process.platform === 'win32' ? {channel:'msedge'} : {})});
try {
  const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173');
  await page.locator('.primary-cta').first().click();
  for(const width of [320,375,390,430]) {
    await page.setViewportSize({width,height:740});
    await page.evaluate(()=>window.scrollTo(0,0));
    const layout=await page.evaluate(()=>{
      const rect=s=>document.querySelector(s).getBoundingClientRect();
      return {width:document.documentElement.scrollWidth,firstInputBottom:rect('.set-fields input').bottom,nav:rect('.workout-navigation').top,sets:rect('.current-exercise').bottom,font:getComputedStyle(document.querySelector('.set-fields input')).fontSize,photoHeight:rect('.workout-hero-photo').height};
    });
    assert.ok(layout.width<=width,JSON.stringify({width,...layout}));
    assert.ok(layout.firstInputBottom<740,'First set fields must be above fold');
    assert.ok(layout.nav>=layout.sets,'Navigation overlaps sets');
    assert.ok(parseFloat(layout.font)>=16);
    assert.ok(layout.photoHeight<=150);
    assert.equal(await page.locator('.bottom-nav').count(),0);
    console.log(width,layout);
  }
  await page.getByLabel('Ciężar serii 1',{exact:true}).fill('22,5');
  await page.getByLabel('Powtórzenia serii 1',{exact:true}).fill('8');
  await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();
  await page.getByLabel('Ciężar serii 2',{exact:true}).fill('20');
  assert.equal(await page.locator('.set-row.completed').count(),1);
  assert.match(await page.locator('.set-row.active').innerText(),/Seria 2/);
  await page.getByRole('button',{name:'Dodaj serię',exact:true}).click();
  assert.equal(await page.locator('.set-row').count(),4);
  await page.getByRole('button',{name:'Następne',exact:true}).click();
  await page.getByRole('button',{name:'Poprzednie',exact:true}).click();
  assert.equal(await page.getByLabel('Ciężar serii 1',{exact:true}).inputValue(),'22,5');
  await page.locator('.workout-last-result').click();
  await page.getByRole('button',{name:'Zamknij historię ćwiczenia'}).click();
  await page.getByRole('button',{name:'Czas treningu i opcje'}).click();
  assert.ok(await page.locator('.workout-total-time').isVisible());
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Opcje ćwiczenia',exact:true}).click();
  assert.ok(await page.getByLabel('Przejdź do ćwiczenia').isVisible());
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Czas treningu i opcje'}).click();
  await page.getByRole('button',{name:'Zakończ trening',exact:true}).click();
  await page.getByRole('button',{name:'Zapisz trening',exact:true}).click();
  await page.getByRole('button',{name:'Pulpit',exact:true}).click();
  await page.locator('.primary-cta').first().click();
  await page.locator('.workout-last-result').click();
  assert.match(await page.locator('.workout-history-set').innerText(),/22,5 kg × 8/);
  await page.keyboard.press('Escape');
  // Seed an older saved session in this isolated test profile only.
  await page.evaluate(()=>{
    const key='pakiernia.v2.local'; const cache=JSON.parse(localStorage.getItem(key));
    const older=structuredClone(cache.data.workouts[0]);
    older.id='older-history-fixture'; older.completedAt=new Date(2026,9,20,12).getTime();
    older.exercises[0].sets=[{weight:'60',reps:'8',completed:true},{weight:'999',reps:'10',completed:false}];
    cache.data.workouts.push(older); localStorage.setItem(key,JSON.stringify(cache));
  });
  await page.reload();
  await page.getByRole('button',{name:'Wznów rozpoczęty trening'}).click();
  await page.locator('.workout-last-result').click();
  for(const width of [320,375,390,430]) {
    await page.setViewportSize({width,height:740});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.ok(await page.locator('.exercise-history-sheet .sheet-footer button').isVisible());
  }
  await page.locator('.exercise-history-sessions button').nth(1).click();
  assert.match(await page.locator('#exercise-history-title').innerText(),/20.10.2026/);
  assert.equal(await page.locator('.workout-history-set').count(),1);
  assert.match(await page.locator('.history-volume').innerText(),/480 kg/);
  const exerciseId=await page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')).data.activeSession.exercises[0].id);
  await page.getByRole('button',{name:'Pełna historia / progres ćwiczenia'}).click();
  assert.equal(await page.getByLabel('Ćwiczenie na wykresie').inputValue(),String(exerciseId));
  assert.equal(await page.getByLabel('Zakres wykresu').inputValue(),'3650');
  await page.getByRole('button',{name:'Wznów rozpoczęty trening'}).click();
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.scrollTo(0,0));
  if (process.env.WORKOUT_SCREENSHOT) await page.screenshot({path:process.env.WORKOUT_SCREENSHOT});
  assert.deepEqual(errors,[]);
  console.log('Workout UI: passed');
} finally { await browser.close(); }
