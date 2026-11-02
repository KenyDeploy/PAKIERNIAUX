import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await page.goto(process.env.APP_URL||'http://127.0.0.1:4181');
  await page.locator('.bottom-nav').getByRole('button',{name:'Plany',exact:true}).click();
  await page.locator('.plan-card').first().getByRole('button',{name:'Rozpocznij',exact:true}).click();
  await page.getByLabel('Ciężar serii 1',{exact:true}).fill('70');
  await page.getByRole('button',{name:'Zatwierdź serię 1',exact:true}).click();
  await page.getByRole('button',{name:'Dodaj serię',exact:true}).click();
  await page.getByLabel('Ciężar serii 2',{exact:true}).fill('80');
  await page.getByRole('button',{name:'Zatwierdź serię 2',exact:true}).click();
  await page.getByRole('button',{name:'Dodaj serię',exact:true}).click();
  await page.getByLabel('Ciężar serii 3',{exact:true}).fill('80');
  await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0);});
  await page.screenshot({path:process.env.SCREENSHOT||'docs/audit/ux03-05-before-390.png',fullPage:true});
} finally {await browser.close();}
