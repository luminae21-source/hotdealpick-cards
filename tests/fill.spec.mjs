import { test, expect } from '@playwright/test';
import { cardFixture } from './fixtures.mjs';
import { inspectLayout } from '../scripts/render.mjs';

async function load(page, data) {
  await page.route('**/data/fill-test.json', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) }));
  await page.goto('/assets/fill.html?data=data/fill-test.json');
  await page.waitForFunction(() => window.__FILL__?.status !== 'loading');
  return page.evaluate(() => window.__FILL__);
}

for (const mall of ['coupang', 'toss', 'naver']) for (const count of [3, 4, 5]) {
  test(`fill ${mall}-${count}: matching blank artwork, complete rows, exact output`, async ({ page }, testInfo) => {
    const state = await load(page, cardFixture(mall, count));
    expect(state.status).toBe('ready');
    expect(state.template).toBe(`${mall}-${count}`);
    await expect(page.getByTestId('product')).toHaveCount(count);
    expect((await inspectLayout(page)).errors).toEqual([]);
    expect(state.imageFailures).toHaveLength(count);
    await expect(page.locator('.image-placeholder:visible')).toHaveCount(count);
    expect(await page.locator('#card').evaluate(node => node.style.backgroundImage)).toContain(`${mall}-${count}.png`);
    // Metadata from the card must never change the fixed template artwork.
    expect(await page.locator('.sub').textContent()).toContain(`${count}개의 픽`);
    for (const row of await page.locator('.fill-row').all()) {
      const columns = await row.locator(':scope > div').evaluateAll(nodes => nodes.map(n => ({ left: n.getBoundingClientRect().left, right: n.getBoundingClientRect().right })));
      expect(columns[0].right).toBeLessThan(columns[1].left);
      expect(columns[1].right).toBeLessThan(columns[2].left);
    }
    if (mall === 'toss') await expect(page.locator('.posting-note')).toContainText('10/31 15:20 게시 시점 가격');
    await page.evaluate(() => {
      const mark = document.createElement('p'); mark.textContent = '렌더링 테스트 · 과거 자료 · 판매용 아님';
      Object.assign(mark.style, { position: 'absolute', right: '8px', bottom: '38px', background: '#fff', color: '#b31c1c', fontSize: '18px', border: '1px solid #b31c1c', padding: '3px' });
      document.querySelector('#card').append(mark);
    });
    const png = await page.locator('#frame').screenshot({ path: testInfo.outputPath(`${mall}-${count}.TEST-ONLY.png`) });
    expect(png.readUInt32BE(16)).toBe(1080);
    expect(png.readUInt32BE(20)).toBe(1350);
  });
}

test('fill selects the eligible count after incomplete rows are removed', async ({ page }) => {
  const data = cardFixture('coupang', 5); data.items[3].price = ''; data.items[4].checked = '';
  const state = await load(page, data);
  expect(state.status).toBe('ready'); expect(state.template).toBe('coupang-3');
  await expect(page.getByTestId('product')).toHaveCount(3);
});

test('fill requires its background to load before exposing an export', async ({ page }) => {
  await page.route('**/tpl/naver-4.png', route => route.abort());
  const state = await load(page, cardFixture('naver', 4));
  expect(state.status).toBe('error');
  await expect(page.locator('#frame')).not.toBeVisible();
});

test('fill records image failures and keeps wide offers inside their rows', async ({ page }) => {
  const data = cardFixture('coupang', 5);
  data.items[0].price = '999,999,999원'; data.items[0].cond = '가나다라마바사아자차카타';
  data.items[0].unit = '가나다라마바사아자차카타파하가나다라마바사아자차카타파하';
  data.items[0].img = 'https://images.example.com/broken.png';
  await page.route('https://images.example.com/broken.png', route => route.abort());
  const state = await load(page, data);
  expect(state.status).toBe('ready');
  expect(state.imageFailures.find(item => item.index === 0)?.reason).toBe('load');
  expect((await inspectLayout(page)).errors).toEqual([]);
});
