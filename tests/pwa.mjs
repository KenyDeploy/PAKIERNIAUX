// Local device mode only: verifies the cached app shell/photos, not cloud account offline support.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try {
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();const errors=[];const failedRequests=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',request=>{if(request.url().startsWith('http://127.'))failedRequests.push({url:request.url(),error:request.failure()?.errorText});});
 await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173');
 await page.getByRole('button',{name:'Rozpocznij trening'}).waitFor();
 await page.evaluate(()=>Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Service worker did not activate')),20000))]).then(()=>true));
 await page.reload();
 assert.equal(await page.evaluate(()=>Boolean(navigator.serviceWorker.controller)),true);
 await page.getByRole('button',{name:'Rozpocznij trening'}).click();
 await page.getByRole('textbox',{name:'Ciężar serii 1',exact:true}).fill('42,5');
 await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();
 await context.setOffline(true);
 await page.reload();
 await page.getByRole('button',{name:'Wznów rozpoczęty trening'}).click({timeout:5000}).catch(async error=>{
  await page.screenshot({path:'/tmp/pakiernia-offline-failure.png',fullPage:true});
  console.error(failedRequests);
  console.error(await page.evaluate(async()=>({url:location.href,text:document.body.innerText.slice(0,1000),activeSession:Boolean(JSON.parse(localStorage.getItem('pakiernia.v2.local')||'null')?.data.activeSession),worker:Boolean(navigator.serviceWorker?.controller),caches:await caches.keys(),scripts:await Promise.all([...document.scripts].filter(s=>s.src).map(async s=>{const r=await caches.match(s.src);return {src:s.src,cached:Boolean(r),vary:r?.headers.get('vary'),type:r?.headers.get('content-type')};}))})));
  throw error;
 });
 assert.equal(await page.getByRole('textbox',{name:'Ciężar serii 1',exact:true}).inputValue(),'42,5');
 await page.getByRole('button',{name:'Zakończ trening',exact:true}).click();
 await page.getByRole('button',{name:'Zapisz trening',exact:true}).click();
 await page.getByText('Dobra robota!').waitFor();
 await page.reload();
 assert.equal(await page.getByTestId('training-count').innerText(),'1');
 const decoded=await page.evaluate(async()=>{const image=new Image();image.src='/exercise-photos-v1-12.webp';await image.decode();return image.naturalWidth>0;});
 assert.equal(decoded,true);
 assert.deepEqual(errors,[]);
 console.log('PASS: production shell and photo cache -> offline reload -> restore draft -> save local workout -> reopen. Cloud account offline support is not covered.');
} finally {await browser.close();}
