import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const out={source:'0bb095de8d1bd2304a6cfba6649a89906300131c',environment:'Chromium local preview, isolated localStorage; not native iOS',screens:[],checks:{},errors:[]};
try{
 const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.on('pageerror',e=>out.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')out.errors.push(m.text());});
 await p.goto(process.env.APP_URL||'http://127.0.0.1:4180');
 const snapshot=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('pakiernia.v2.local')||'null')?.data);
 const nav=name=>p.locator('.bottom-nav').getByRole('button',{name,exact:true}).click();
 const bounds=async(label,selector)=>{const locator=p.locator(selector).first();return {label,...await locator.evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,visibleWithoutScroll:r.top>=0&&r.bottom<=innerHeight,viewportHeight:innerHeight,scrollY,documentHeight:document.documentElement.scrollHeight};})};};
 for(const width of [320,375,390,430]){
  await p.setViewportSize({width,height:844});
  for(const name of ['Pulpit','Plany','Baza','Historia','Postęp','Pomiary']){
   await nav(name);await p.evaluate(()=>scrollTo(0,0));
   const selector={'Pulpit':'.dashboard-start','Plany':'.content>.secondary-cta','Baza':'.search-box input','Historia':'.page-heading h1','Postęp':'.chart-controls','Pomiary':'.body-add-measurement'}[name];
   out.screens.push({viewportWidth:width,screen:name,...await bounds('primary',selector),overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
  }
 }
 await p.setViewportSize({width:390,height:844});await nav('Pulpit');await p.getByRole('button',{name:'Rozpocznij trening',exact:true}).click();
 out.checks.firstSet=await bounds('first set save','.set-confirm');
 await p.getByLabel('Ciężar serii 1',{exact:true}).fill('40');await p.getByLabel('Powtórzenia serii 1',{exact:true}).fill('8');await p.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();
 for(let i=0;i<4;i++)await p.getByRole('button',{name:'Dodaj serię',exact:true}).click();
 await p.waitForTimeout(200);
 out.checks.fiveRows={add:await bounds('add set','.add-set'),next:await bounds('next exercise','.workout-navigation'),compactCount:await p.locator('.series-compact').count(),editableCount:await p.locator('.set-row').count()};
 await p.reload();await p.getByRole('button',{name:'Wznów rozpoczęty trening',exact:true}).click();await p.waitForTimeout(200);
 out.checks.fiveRowsAfterResume={lastDraft:await bounds('last draft','[data-series-index="4"]'),add:await bounds('add set','.add-set'),next:await bounds('next exercise','.workout-navigation')};
 // A fresh exercise with only suggested repetitions still triggers replacement confirmation.
 await p.getByRole('button',{name:'Następne',exact:true}).click();await p.getByRole('button',{name:'Opcje ćwiczenia',exact:true}).click();await p.getByRole('dialog').getByRole('button',{name:'Zamień ćwiczenie',exact:true}).click();
 const candidate=p.locator('.session-exercise-picker>button:not([disabled])').first();await candidate.click();out.checks.emptyReplacement={confirmationVisible:await p.getByLabel('Potwierdzam zamianę i usunięcie bieżących serii').count(),hasEnteredWeight:(await snapshot()).activeSession.exercises[1].sets[0].weight};await p.getByRole('button',{name:'Zamknij edycję sesji'}).click();
 await p.locator('.brand').click();await nav('Plany');let s=await snapshot();const count=s.plans.length;
 await p.getByRole('button',{name:'Utwórz nowy plan',exact:true}).click();await p.getByLabel('Nazwa planu',{exact:true}).fill('AUDIT niezapisany szkic');
 out.checks.planSaveLocation=await bounds('save plan','.plan-editor .primary-cta');
 await p.setViewportSize({width:320,height:360});await p.waitForTimeout(200);out.checks.planSaveShortViewport=await bounds('save plan','.plan-editor .primary-cta');await p.setViewportSize({width:390,height:844});
 await p.locator('.plan-editor').getByRole('button',{name:'Zamknij',exact:true}).click();out.checks.cancelNewPlan={before:count,after:(await snapshot()).plans.length,lastName:(await snapshot()).plans.at(-1).name};
 await p.locator('.plan-card').first().getByRole('button',{name:'Edytuj plan',exact:true}).click();const originalName=(await snapshot()).plans[0].name;await p.getByLabel('Nazwa planu',{exact:true}).fill('AUDIT nazwa utracona po błędzie');
 await p.evaluate(()=>{window.__auditSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota audit');};});await p.getByRole('button',{name:'Zapisz plan',exact:true}).click();
 out.checks.planQuota={modalStillOpen:await p.locator('.plan-editor').count(),storedName:(await snapshot()).plans[0].name,originalName,status:await p.locator('.sync-status').innerText()};await p.evaluate(()=>{Storage.prototype.setItem=window.__auditSet;});
 await nav('Pomiary');await p.getByRole('button',{name:'Dodaj pomiar',exact:true}).click();await p.locator('input[name=weight]').fill('81');await p.locator('.sheet-backdrop').click({position:{x:2,y:2}});out.checks.measurementBackdrop={dialogRemaining:await p.getByRole('dialog').count(),records:(await snapshot()).measurements.length};
 await p.getByRole('button',{name:'Ustawienia',exact:true}).click();out.checks.settingsSyncLocation=await p.getByRole('heading',{name:'Konto i synchronizacja',exact:true}).evaluate(el=>({top:el.getBoundingClientRect().top,viewportHeight:innerHeight}));
 out.checks.settingsGear=await bounds('settings gear','.top-actions .icon-button');await p.getByRole('button',{name:'Otwórz profil sylwetki i pomiary'}).click();await p.getByRole('button',{name:'Profil sylwetki',exact:true}).click();out.checks.profileFooter=[];
 for(const [width,height] of [[320,360],[375,500],[390,600],[430,844]]){await p.setViewportSize({width,height});await p.getByLabel('Wzrost (cm)',{exact:true}).focus();await p.waitForTimeout(250);out.checks.profileFooter.push({viewportWidth:width,...await bounds('profile save','.body-editor-sheet .sheet-footer button')});}
 await p.getByRole('button',{name:'Zamknij profil',exact:true}).click();await p.setViewportSize({width:390,height:844});await p.locator('.brand').click();await p.getByRole('button',{name:'Wznów rozpoczęty trening',exact:true}).click();await p.getByRole('button',{name:'Czas treningu i opcje'}).click();await p.getByRole('button',{name:'Zakończ trening',exact:true}).click();
 const beforeDiscard=await snapshot();await p.getByRole('button',{name:'Odrzuć trening bez zapisu'}).click();s=await snapshot();out.checks.discard={hadConfirmed:beforeDiscard.activeSession.exercises.some(e=>e.sets.some(r=>r.completed)),additionalConfirmation:await p.getByRole('dialog').count(),activeSessionAfter:s.activeSession,historyBefore:beforeDiscard.workouts.length,historyAfter:s.workouts.length};
 console.log(JSON.stringify(out,null,2));if(process.env.UX_AUDIT_OUTPUT)await writeFile(process.env.UX_AUDIT_OUTPUT,JSON.stringify(out,null,2));
}finally{await browser.close();}
