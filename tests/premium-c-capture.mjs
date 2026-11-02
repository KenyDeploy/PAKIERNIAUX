import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto(process.env.APP_URL||'http://127.0.0.1:4182');
 await page.getByRole('button',{name:'Rozpocznij trening',exact:true}).click();
 await page.evaluate(()=>{const k='pakiernia.v2.local',s=JSON.parse(localStorage.getItem(k));const date=n=>{const d=new Date();d.setDate(d.getDate()-n);d.setHours(10,0,0,0);return d.getTime();};s.data.activeSession=null;s.data.workouts=[6,4,2,0].map((n,i)=>({id:'fixture-'+i,startedAt:date(n)-1800000,completedAt:date(n),plan:{id:1,name:'Góra ciała — siła'},exercises:[{id:1,name:s.data.exercises[0].name,sets:[{weight:40+i*2.5,reps:8,completed:true}]}]}));s.data.completedDays=[];localStorage.setItem(k,JSON.stringify(s));});
 await page.reload();await page.waitForTimeout(120);
 const phase=process.env.CAPTURE_PHASE||'before';
 await page.screenshot({path:`docs/audit/premium-c-home-${phase}-390.png`,fullPage:true});
 await page.locator('.bottom-nav').getByRole('button',{name:'Baza',exact:true}).click();await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(120);
 await page.screenshot({path:`docs/audit/premium-c-catalog-${phase}-390.png`});
}finally{await browser.close();}
