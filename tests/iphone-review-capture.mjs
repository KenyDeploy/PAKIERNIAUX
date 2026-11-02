import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.clock.install({time:new Date('2026-11-02T12:00:00Z')});await page.goto(process.env.APP_URL||'http://127.0.0.1:4182');
 await page.getByRole('button',{name:'Rozpocznij trening',exact:true}).click();
 await page.evaluate(()=>{const k='pakiernia.v2.local',s=JSON.parse(localStorage.getItem(k));s.data.activeSession=null;s.data.workouts=[0,1,2].map(i=>({id:'capture-'+i,startedAt:new Date(2026,9,26+i*2,9).getTime(),completedAt:new Date(2026,9,26+i*2,10).getTime(),plan:{id:1,name:'Góra'},exercises:[{id:1,name:s.data.exercises[0].name,sets:[{id:'saved-'+i,weight:40+i*2.5,reps:8,completed:true}]}]}));s.data.measurements=[{id:'m1',date:'2026-10-01',waist:90},{id:'m2',date:'2026-10-15',waist:87},{id:'m3',date:'2026-10-30',waist:85}];localStorage.setItem(k,JSON.stringify(s));});
 const phase=process.env.CAPTURE_PHASE||'before';
 for(const theme of phase==='before'?['lime','blue']:['lime','blue','mono']){
  await page.evaluate(theme=>{const k='pakiernia.v2.local',s=JSON.parse(localStorage.getItem(k));s.data.preferences={...s.data.preferences,theme};localStorage.setItem(k,JSON.stringify(s));},theme);
  await page.reload();await page.waitForTimeout(100);await page.screenshot({path:`docs/audit/iphone-${phase}-${theme}-home-390.png`,fullPage:true});
  await page.locator('.bottom-nav').getByRole('button',{name:'Postęp',exact:true}).click();await page.locator('.chart-panel').first().screenshot({path:`docs/audit/iphone-${phase}-${theme}-chart-390.png`});
 }
 await page.locator('.bottom-nav').getByRole('button',{name:'Baza',exact:true}).click();await page.screenshot({path:`docs/audit/iphone-${phase}-catalog-390.png`});
 await page.locator('.bottom-nav').getByRole('button',{name:'Pulpit',exact:true}).click();await page.getByRole('button',{name:'Rozpocznij trening',exact:true}).click();
 for(let i=0;i<2;i++)await page.getByRole('button',{name:'Dodaj serię',exact:true}).click();
 await page.getByLabel('Ciężar serii 3',{exact:true}).fill('45');await page.waitForTimeout(100);await page.screenshot({path:`docs/audit/iphone-${phase}-workout-390.png`});
}finally{await browser.close();}
