import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const playwright = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const engine = process.env.BROWSER_ENGINE || 'chromium';
const browser = await playwright[engine].launch({ headless: true, ...(engine === 'chromium' ? process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : { channel: 'msedge' } : {}) });
const directory = process.env.CAPTURE_DIR || 'docs/audit';
await mkdir(directory, { recursive: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, timezoneId: 'Europe/Warsaw' });
  const page = await context.newPage(), errors = [], forbidden = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => { if (request.url().includes('/body.png')) forbidden.push(request.url()); });
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:4180');
  const nav = name => page.locator('.bottom-nav').getByRole('button', { name, exact: true }).click();
  const snapshot = () => page.evaluate(() => JSON.parse(localStorage.getItem('pakiernia.v2.local')).data);
  const capture = async (name, model = false) => {
    if (model) await page.locator('.body-model-toolbar').evaluate(element => {
      const header = document.querySelector('.topbar').getBoundingClientRect();
      scrollTo(0, scrollY + element.getBoundingClientRect().top - header.bottom - 8);
    });
    else await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(180);
    await page.screenshot({ path: `${directory}/measurements-v3-${engine}-${name}-390.png`, fullPage: !model && name !== 'setup' });
  };
  const footer = async () => {
    await page.waitForTimeout(250);
    for (const button of await page.locator('.body-setup-sheet .sheet-footer button').all()) {
      assert.ok(await button.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= innerHeight && element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
      }));
    }
  };
  // New account invitation does not block training. Optional setup can be deferred.
  assert.ok(await page.getByRole('button', { name: 'Rozpocznij trening', exact: true }).isVisible());
  await page.getByRole('button', { name: 'Skonfiguruj profil', exact: true }).click();
  await page.getByLabel('Wariant modelu').selectOption('female');
  await page.getByLabel('Wzrost (cm, opcjonalnie)').fill('170');
  await page.getByLabel('Cel treningowy').selectOption('strength');
  await page.getByRole('button', { name: 'Dalej', exact: true }).click();
  await page.getByLabel('Masa początkowa (kg, opcjonalnie)').fill('75,5');
  await page.getByText('Dodaj opcjonalne obwody', { exact: true }).click();
  await page.getByLabel('Talia (cm)', { exact: true }).fill('85');
  await capture('setup');
  await page.getByRole('button', { name: 'Zamknij konfigurację' }).click();
  await page.getByRole('button', { name: 'Kontynuuj edycję' }).click();
  assert.equal(await page.getByLabel('Masa początkowa (kg, opcjonalnie)').inputValue(), '75,5');
  for (const [width, height] of [[320, 360], [375, 500], [390, 600], [430, 844]]) { await page.setViewportSize({ width, height }); await footer(); }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { window.originalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = () => { throw Error('quota'); }; });
  await page.getByRole('button', { name: 'Zapisz konfigurację' }).click();
  assert.match(await page.getByRole('alert').innerText(), /Nie zapisano/);
  assert.equal(await page.getByLabel('Masa początkowa (kg, opcjonalnie)').inputValue(), '75,5');
  await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
  await page.locator('.body-setup-sheet').evaluate(form => { for (let i = 0; i < 2; i++) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
  let data = await snapshot();
  assert.equal(data.measurements.length, 1); assert.equal(data.measurements[0].weight, 75.5); assert.equal(data.bodyProfile.model, 'female');
  assert.equal(data.bodyProfile.sex, undefined); assert.equal(data.bodySetup.status, 'completed');
  const baseline = structuredClone(data);
  // Deliberately partial, dated fixture; legacy fields and original profile are preserved.
  await page.evaluate(() => {
    const key = 'pakiernia.v2.local', cache = JSON.parse(localStorage.getItem(key));
    cache.data.measurements = [{ id: 'latest', date: '2026-10-20', waist: 84, bicepsRight: 38 }, { id: 'middle', date: '2026-10-10', waist: 87, bicepsRight: 36 }, { id: 'first', date: '2026-10-01', waist: 90, biceps: 35 }];
    cache.data.legacyMeasurements = [{ date: 'Dzisiaj', biceps: 34 }];
    localStorage.setItem(key, JSON.stringify(cache));
  });
  await page.reload(); await nav('Pomiary');
  assert.match(await page.locator('.body-reading>b').innerText(), /84/);
  assert.match(await page.locator('.body-reading-deltas').innerText(), /-3/);
  assert.match(await page.locator('.body-reading-deltas').innerText(), /-6/);
  const stable = await snapshot();
  await page.locator('.body-model-options summary').click();
  for (const [model, label] of [['male', 'Mężczyzna'], ['female', 'Kobieta']]) {
    await page.getByRole('button', { name: label, exact: true }).click();
    for (const side of ['Przód', 'Tył']) {
      await page.getByRole('button', { name: side, exact: true }).click();
      const image = page.getByTestId('body-illustration').locator('img');
      await image.evaluate(image => image.decode());
      assert.equal(await image.getAttribute('src'), `/body-models/${model}-${side === 'Przód' ? 'front' : 'back'}.webp`);
      assert.ok(await image.evaluate(image => image.naturalWidth === 1024 && image.naturalHeight === 1536));
      for (const width of [320, 375, 390, 430]) {
        await page.setViewportSize({ width, height: 844 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const targets = await page.locator('.body-model-canvas .body-hotspot').evaluateAll(elements => elements.map(element => { const r = element.getBoundingClientRect(); return [r.width, r.height]; }));
        assert.ok(targets.every(([w, h]) => w >= 44 && h >= 44));
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await capture(`${model}-${side === 'Przód' ? 'front' : 'back'}`, true);
    }
  }
  await page.getByRole('button', { name: 'Biceps prawy: 38 cm', exact: true }).click();
  assert.equal(await page.getByLabel('Wybierz pomiar').inputValue(), 'bicepsRight');
  await page.getByRole('button', { name: 'Porównaj daty', exact: true }).click();
  await page.getByLabel('Data: Wtedy', { exact: true }).selectOption('2026-10-01');
  await page.getByLabel('Data: Teraz', { exact: true }).selectOption('2026-10-20');
  const slider = page.getByRole('slider', { name: 'Wtedy / Teraz — wybierz zapis' });
  await slider.fill('0');
  assert.match(await page.locator('.body-reading').innerText(), /Brak zapisanego pomiaru/);
  assert.equal(await page.getByRole('button', { name: 'Biceps prawy: brak pomiaru', exact: true }).getAttribute('data-available'), 'false');
  await slider.focus(); await page.keyboard.press('ArrowRight');
  assert.match(await page.locator('.body-reading>b').innerText(), /38/);
  assert.equal(await page.getByRole('button', { name: 'Biceps prawy: 38 cm', exact: true }).getAttribute('data-available'), 'true');
  await page.getByLabel('Wybierz pomiar').selectOption('waist');
  assert.equal(await page.getByRole('button', { name: 'Talia: 84 cm', exact: true }).getAttribute('data-changed'), 'true');
  await capture('compare');
  const source = await page.getByTestId('body-illustration').locator('img').getAttribute('src');
  await slider.fill('0');
  assert.equal(await page.getByTestId('body-illustration').locator('img').getAttribute('src'), source);
  assert.match(await page.locator('.body-reading>b').innerText(), /90/);
  await page.getByRole('button', { name: 'Neutralny', exact: true }).click();
  assert.ok(await page.getByTestId('neutral-body-model').isVisible());
  assert.equal(await page.locator('.body-model-canvas img').count(), 0);
  await capture('neutral');
  await page.reload(); await nav('Pomiary');
  data = await snapshot(); assert.equal(data.bodyProfile.model, 'neutral');
  assert.deepEqual(data.measurements, stable.measurements); assert.deepEqual(data.legacyMeasurements, stable.legacyMeasurements);
  assert.deepEqual(data.bodyGoalHistory, baseline.bodyGoalHistory); assert.deepEqual(data.plans, baseline.plans);
  assert.deepEqual(forbidden, []); assert.deepEqual(errors, []);
  // A genuinely new user may defer the wizard and start a workout with no measurements.
  await context.close();
  const fresh = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await fresh.goto(process.env.APP_URL || 'http://127.0.0.1:4180');
  await fresh.getByRole('button', { name: 'Później', exact: true }).click();
  await fresh.reload(); assert.equal(await fresh.getByRole('button', { name: 'Skonfiguruj profil', exact: true }).count(), 0);
  await fresh.getByRole('button', { name: 'Rozpocznij trening', exact: true }).click();
  assert.ok(await fresh.getByLabel('Ciężar serii 1', { exact: true }).isVisible());
  console.log(`Measurements 3.0 ${engine}: setup/retry/guard/optional fields; four decoded final assets; 44px points at 320/375/390/430px; real compare slider; static shape; legacy/history/goal preservation; deferred setup -> training PASS`);
} finally { await browser.close(); }
