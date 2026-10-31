import { test, expect } from '@playwright/test';
import { cardFixture, blankFixture, DISCLOSURES } from './fixtures.mjs';
import { inspectLayout } from '../scripts/render.mjs';

const fixtureURL = '**/data/browser-test.json';

async function loadCard(page, input) {
  await page.route(fixtureURL, route => route.fulfill({
    status: 200,
    contentType: 'application/json; charset=utf-8',
    body: JSON.stringify(input),
  }));
  await page.goto('/card.html?data=browser-test.json&export=1', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => ['ready', 'invalid', 'error'].includes(window.__CARD_STATE__?.status));
  return page.evaluate(() => window.__CARD_STATE__);
}

async function markTestScreenshot(page) {
  await page.evaluate(() => {
    const banner = document.createElement('div');
    banner.textContent = '디자인 테스트 · 과거 참고자료 · 판매용 아님';
    Object.assign(banner.style, {
      position: 'absolute', right: '44px', bottom: '2px',
      zIndex: '2147483647', padding: '1px 8px', textAlign: 'center',
      fontSize: '22px', lineHeight: '24px', fontWeight: '800', color: '#9d1a16',
      border: '1px solid #d63732', borderRadius: '5px', background: '#fff7f6',
      pointerEvents: 'none',
    });
    document.querySelector('#card').append(banner);
  });
}

for (const [mall, count] of [['coupang', 5], ['toss', 5], ['naver', 5]]) {
  test(`${mall}: ${count}-product layout, fixed disclosure, typography and exact PNG size`, async ({ page }, testInfo) => {
    const input = cardFixture(mall, count);
    input.title = '오늘의 장바구니';
    const state = await loadCard(page, input);
    expect(state.status).toBe('ready');
    expect((await inspectLayout(page)).errors).toEqual([]);
    const card = page.locator('#card');
    await expect(card).toBeVisible();
    const bounds = await card.boundingBox();
    expect(bounds.width).toBe(1080);
    expect(bounds.height).toBe(1350);
    const products = page.getByTestId('product');
    await expect(products).toHaveCount(count);
    const disclosure = page.getByTestId('disclosure');
    await expect(disclosure).toHaveText(DISCLOSURES[mall]);
    expect(await disclosure.evaluate(el => Number.parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(22);
    const noticeBox = await disclosure.boundingBox();
    expect(noticeBox.y - bounds.y).toBeLessThan(40);
    const hero = page.getByTestId('hero-art');
    await expect(hero).toBeVisible();
    expect((await hero.boundingBox()).width).toBeGreaterThan(250);
    expect(await hero.evaluate(image => image.tagName === 'IMG' && /\.png(?:$|[?#])/.test(image.getAttribute('src')) && image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(card).toContainText('hotdealpick.kr');
    await expect(card).toContainText('결제 전 최종가 확인');
    for (const name of await page.getByTestId('product-name').all()) {
      const measurement = await name.evaluate(el => {
        const css = getComputedStyle(el);
        return { fontSize: parseFloat(css.fontSize), clamp: css.webkitLineClamp, height: el.getBoundingClientRect().height, lineHeight: parseFloat(css.lineHeight) };
      });
      expect(measurement.fontSize).toBeGreaterThanOrEqual(30);
      expect(measurement.clamp).toBe('2');
      expect(measurement.height).toBeLessThanOrEqual(measurement.lineHeight * 2 + 2);
    }
    for (const price of await page.getByTestId('product-price').all()) {
      expect(await price.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(40);
    }
    for (const unit of await page.getByTestId('product-unit').all()) {
      expect(await unit.evaluate(el => Number.parseInt(getComputedStyle(el).fontWeight, 10))).toBeGreaterThanOrEqual(700);
    }
    for (const product of await products.all()) {
      const box = await product.boundingBox();
      expect(box.y).toBeGreaterThanOrEqual(bounds.y);
      expect(box.y + box.height).toBeLessThanOrEqual(bounds.y + bounds.height);
      expect(await product.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    }
    if (mall === 'toss') {
      await expect(card).toContainText('10/31 15:20 게시 시점 가격');
      await expect(card).not.toContainText('쿠팡');
      await expect(card).not.toContainText('네이버');
    }
    await markTestScreenshot(page);
    const output = testInfo.outputPath(`${mall}-${count}-products.TEST-ONLY.png`);
    const png = await card.screenshot({ path: output });
    expect(png.readUInt32BE(16)).toBe(1080);
    expect(png.readUInt32BE(20)).toBe(1350);
    await testInfo.attach(`${mall} historical test preview`, { path: output, contentType: 'image/png' });
  });
}

for (const count of [3, 4]) {
  test(`${count}-product layout fits the same production canvas`, async ({ page }) => {
    expect((await loadCard(page, cardFixture('coupang', count))).status).toBe('ready');
    await expect(page.getByTestId('product')).toHaveCount(count);
    expect((await inspectLayout(page)).errors).toEqual([]);
  });
}

test('partial rows never appear as empty price placeholders', async ({ page }) => {
  const input = cardFixture('coupang', 5);
  input.items[3].price = '';
  input.items[4].checked = '';
  expect((await loadCard(page, input)).status).toBe('ready');
  await expect(page.getByTestId('product')).toHaveCount(3);
  await expect(page.locator('#card')).not.toContainText(input.items[3].name);
  await expect(page.locator('#card')).not.toContainText(input.items[4].name);
});

test('long permitted title and five long product names fit production render bounds', async ({ page }) => {
  const input = cardFixture('coupang', 5);
  // Layout stress text only, never public product/price data or a sale claim.
  input.title = '가나다라마바사아자차카타파하가나다라마바사아자차카타파하';
  for (const item of input.items) item.name = `${item.name} ${item.name}`;
  const state = await loadCard(page, input);
  expect(state.status).toBe('ready');
  const layout = await inspectLayout(page);
  expect(layout.errors).toEqual([]);
  for (const name of await page.getByTestId('product-name').all()) {
    const size = await name.evaluate(el => ({ height: el.getBoundingClientRect().height, line: parseFloat(getComputedStyle(el).lineHeight) }));
    expect(size.height).toBeLessThanOrEqual(size.line * 2 + 2);
  }
});

test('empty sample shows a correction message and produces no card', async ({ page }) => {
  const state = await loadCard(page, blankFixture());
  expect(['invalid', 'error']).toContain(state.status);
  await expect(page.locator('#card')).not.toBeVisible();
  await expect(page.locator('body')).not.toHaveText('');
});

test('image timeout settles to a placeholder instead of delaying export forever', async ({ page }) => {
  const input = cardFixture();
  input.items[0].img = 'https://images.example.com/slow.png';
  await page.route('https://images.example.com/slow.png', () => new Promise(() => {}));
  const state = await loadCard(page, input);
  expect(state.status).toBe('ready');
  expect(state.imageFailures.some(failure => failure.reason === 'timeout')).toBe(true);
  await expect(page.locator('[data-testid="image-fallback"]:visible')).toHaveCount(3);
});

test('wide price conditions and units fit beside large prices without clipping', async ({ page }) => {
  const input = cardFixture('coupang', 5);
  input.title = '가나다라마바사아자차카타파하가나다라마바사아자차카타파하';
  // Synthetic boundary values exist only in this test and are never saved as a preview or sale JSON.
  input.items[0].price = '999,999,999원';
  input.items[0].cond = '가나다라마바사아자차카타';
  input.items[0].unit = '가나다라마바사아자차카타파하가나다라마바사아자차카타파하';
  const state = await loadCard(page, input);
  expect(state.status).toBe('ready');
  expect((await inspectLayout(page)).errors).toEqual([]);
});

for (const [label, mutate] of [
  ['fewer than three eligible products', input => { input.items[2].price = ''; }],
  ['other mall URL', input => { input.items[0].url = 'https://smartstore.naver.com/__test_only__/wrong-mall'; }],
  ['prohibited lowest-price claim', input => { input.title = '최저가'; }],
  ['custom disclosure field', input => { input.disclosure = '삭제'; }],
]) {
  test(`blocks ${label} before exposing a card`, async ({ page }) => {
    const input = cardFixture();
    mutate(input);
    const state = await loadCard(page, input);
    expect(['invalid', 'error']).toContain(state.status);
    await expect(page.locator('#card')).not.toBeVisible();
  });
}

test('remote image success, broken image and missing image all settle before ready', async ({ page }) => {
  const input = cardFixture();
  input.items[0].img = 'https://images.example.com/success.svg';
  input.items[1].img = 'https://images.example.com/broken.svg';
  await page.route('https://images.example.com/success.svg', route => route.fulfill({
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#e8f4f1"/><text x="100" y="110" text-anchor="middle" font-size="28" fill="#426765">TEST</text></svg>',
  }));
  await page.route('https://images.example.com/broken.svg', route => route.abort('failed'));
  expect((await loadCard(page, input)).status).toBe('ready');
  const loaded = page.locator('img[src="https://images.example.com/success.svg"]');
  await expect(loaded).toBeVisible();
  expect(await loaded.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator('[data-testid="image-fallback"]:visible')).toHaveCount(2);
  expect(await page.locator('#card img').evaluateAll(images => images.filter(img => img.getBoundingClientRect().width > 0).every(img => img.complete && img.naturalWidth > 0))).toBe(true);
});

test('untrusted text is never interpreted as HTML', async ({ page }) => {
  const input = cardFixture();
  input.items[0].name = '<img src=x onerror="window.__injected=1">';
  const state = await loadCard(page, input);
  expect(await page.evaluate(() => window.__injected)).toBeUndefined();
  await expect(page.locator('img[onerror]')).toHaveCount(0);
  if (state.status === 'ready') {
    await expect(page.getByTestId('product-name').first()).toHaveText(input.items[0].name);
  } else {
    await expect(page.locator('#card')).not.toBeVisible();
  }
});

test('path traversal and remote JSON references are rejected', async ({ page }) => {
  for (const data of ['../package.json', 'https://example.com/card.json', '/data/coupang.json']) {
    await page.goto(`/card.html?data=${encodeURIComponent(data)}&export=1`);
    await page.waitForFunction(() => ['invalid', 'error'].includes(window.__CARD_STATE__?.status));
    await expect(page.locator('#card')).not.toBeVisible();
  }
});

test('missing and malformed JSON are reported without a broken card', async ({ page }) => {
  await page.route(fixtureURL, route => route.fulfill({ status: 404, body: 'missing' }));
  await page.goto('/card.html?data=browser-test.json&export=1');
  await page.waitForFunction(() => ['invalid', 'error'].includes(window.__CARD_STATE__?.status));
  await expect(page.locator('#card')).not.toBeVisible();
  await page.unroute(fixtureURL);
  await page.route(fixtureURL, route => route.fulfill({ contentType: 'application/json', body: '{ invalid' }));
  await page.reload();
  await page.waitForFunction(() => ['invalid', 'error'].includes(window.__CARD_STATE__?.status));
  await expect(page.locator('#card')).not.toBeVisible();
});
