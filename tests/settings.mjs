import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173');const open=()=>page.getByRole('button',{name:'Ustawienia',exact:true}).click();const accent=()=>page.locator('.app-shell').evaluate(el=>getComputedStyle(el).getPropertyValue('--accent').trim());const data=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')||'null')?.data);
 await open();assert.equal(await accent(),'#C9FF31');
 for(const [name,hex] of [['Neon Magenta','#F43CB6'],['Electric Blue','#4EA5FF'],['Cyber Violet','#A879FF'],['Solar Orange','#FF9B42'],['Arctic Teal','#34DDBB'],['Electric Lime','#C9FF31']]){
  await page.getByRole('button',{name,exact:true}).click();assert.equal(await accent(),hex);
  for(const width of [320,375,390,430]){await page.setViewportSize({width,height:740});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 }
 await page.getByRole('button',{name:'Neon Magenta',exact:true}).click();await page.getByRole('button',{name:'Wróć z ustawień'}).click();assert.equal(await accent(),'#C9FF31');await open();await page.getByRole('button',{name:'Electric Blue',exact:true}).click();await page.getByRole('button',{name:'Zapisz motyw',exact:true}).click();assert.equal((await data()).preferences.theme,'blue');
 await page.reload();assert.equal(await accent(),'#4EA5FF');await open();await page.getByRole('button',{name:'Arctic Teal',exact:true}).click();await page.getByRole('button',{name:'Cofnij podgląd'}).click();assert.equal(await accent(),'#4EA5FF');
 await page.getByRole('button',{name:'Cyber Violet',exact:true}).click();await page.evaluate(()=>{window.__originalSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota');};});await page.getByRole('button',{name:'Zapisz motyw',exact:true}).click();assert.ok(await page.getByRole('alert').isVisible());assert.equal((await data()).preferences.theme,'blue');await page.evaluate(()=>{Storage.prototype.setItem=window.__originalSet;});await page.getByRole('button',{name:'Zapisz motyw',exact:true}).click();assert.equal((await data()).preferences.theme,'violet');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Pobierz moje dane (JSON)',exact:true}).click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'pakiernia-dane.json');assert.equal(await page.getByRole('button',{name:'Wyloguj',exact:true}).count(),0);
 await page.getByRole('button',{name:'Otwórz profil sylwetki i pomiary'}).click();await page.getByRole('button',{name:'Profil sylwetki',exact:true}).click();for(const width of [320,375,390,430]){await page.setViewportSize({width,height:500});await page.getByLabel('Wzrost (cm)').focus();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await page.locator('.sheet-footer button').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight));}await page.getByRole('button',{name:'Zamknij profil'}).click();
 assert.deepEqual(errors,[]);console.log('Settings: 6 previews, save/cancel/reload/quota/export/profile modal, 320/375/390/430 px; no console errors.');
}finally{await browser.close();}
