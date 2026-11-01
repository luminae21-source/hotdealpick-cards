import { chromium } from '@playwright/test';
import { startServer } from './scripts/serve.mjs';
const files = process.argv.slice(2);
const app = await startServer({ root: process.cwd() });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
for (const f of files) {
  await page.goto(`${app.url}/assets/fill.html?data=data/${f}.json`);
  await page.waitForFunction(() => window.__FILL__?.status !== 'loading');
  const st = await page.evaluate(() => window.__FILL__);
  if (st.status !== 'ready') { console.log('FAIL', f, st.error); continue; }
  await page.locator('#frame').screenshot({ path: `rendered/fill_${f}.png` });
  console.log('OK', f);
}
await browser.close(); await app.close?.();
process.exit(0);
