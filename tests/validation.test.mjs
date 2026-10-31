import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCard } from '../assets/validation.mjs';
import { cardFixture, blankFixture, clone } from './fixtures.mjs';

test('three mall types accept complete historical test fixtures', () => {
  for (const mall of ['coupang', 'toss', 'naver']) {
    const result = validateCard(cardFixture(mall));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.data.items.length, 3);
    assert.equal(result.data.mall, mall);
  }
});

test('blank samples are recognizable drafts and cannot become a card', () => {
  for (const mall of ['coupang', 'toss', 'naver']) {
    const result = validateCard(blankFixture(mall));
    assert.equal(result.ok, false);
    assert.equal(result.draft, true);
    assert.equal(result.data, null);
  }
});

test('price and each item timestamp are both required; incomplete rows are omitted', () => {
  const input = cardFixture('coupang', 5);
  input.items[3].price = '';
  input.items[4].checked = '';
  const result = validateCard(input);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.data.items.length, 3);
  assert.ok(result.warnings.length >= 2);
  assert.deepEqual(result.data.items.map(x => x.name), input.items.slice(0, 3).map(x => x.name));
});

test('fewer than three eligible items cannot be rendered', () => {
  const input = cardFixture();
  input.items[2].checked = '';
  assert.equal(validateCard(input).ok, false);
  input.items[2].checked = input.checked;
  input.items[2].price = '';
  assert.equal(validateCard(input).ok, false);
});

test('accepts three, four and five rows but rejects more than five', () => {
  for (const count of [3, 4, 5]) {
    assert.equal(validateCard(cardFixture('coupang', count)).ok, true);
  }
  const input = cardFixture('coupang', 5);
  input.items.push(clone(input.items[0]));
  assert.equal(validateCard(input).ok, false);
});

test('strict existing schema rejects seller, old price, discount and custom disclosure fields', () => {
  for (const key of ['seller', 'originalPrice', 'discount', 'discountRate']) {
    const input = cardFixture();
    input.items[0][key] = '금지 필드';
    assert.equal(validateCard(input).ok, false, key);
  }
  const input = cardFixture();
  input.disclosure = '제휴고지를 바꾸려는 값';
  assert.equal(validateCard(input).ok, false);
});

test('rejects other-mall URL, lookalike host, unsafe URL and credentials', () => {
  for (const url of [
    'https://smartstore.naver.com/__test_only__/reference',
    'https://www.coupang.com.evil.invalid/product',
    'http://www.coupang.com/product',
    'javascript:alert(1)',
    'https://name:password@www.coupang.com/product',
  ]) {
    const input = cardFixture();
    input.items[0].url = url;
    assert.equal(validateCard(input).ok, false, url);
  }
});

test('Toss card cannot mention another mall in product text or price conditions', () => {
  for (const key of ['name', 'cond']) {
    const input = cardFixture('toss');
    input.items[0][key] = '쿠팡 비교';
    assert.equal(validateCard(input).ok, false, key);
  }
});

test('prohibited claims are blocked in title and customer-visible fields', () => {
  for (const phrase of ['최저가', '미백', '다이어트', '면역', '직접 써봤어요']) {
    const input = cardFixture();
    input.title = phrase;
    assert.equal(validateCard(input).ok, false, phrase);
  }
  for (const key of ['name', 'cond', 'unit']) {
    const input = cardFixture();
    input.items[0][key] = '최저가';
    assert.equal(validateCard(input).ok, false, key);
  }
});

test('checks real calendar dates, leap years and time ranges in root and row timestamps', () => {
  for (const value of ['2026-02-29 15:20', '2026-13-01 15:20', '2026-10-31 24:00', '2026-10-31 15:60', '2026/10/31 15:20']) {
    for (const atRoot of [false, true]) {
      const input = cardFixture();
      if (atRoot) input.checked = value;
      else input.items[0].checked = value;
      assert.equal(validateCard(input).ok, false, `${value}, root=${atRoot}`);
    }
  }
  const input = cardFixture();
  input.checked = '2024-02-29 15:20';
  for (const item of input.items) item.checked = input.checked;
  assert.equal(validateCard(input).ok, true);
});

test('malformed types and missing required data fail without throwing', () => {
  for (const input of [null, [], '', 1, {}, { mall: 'other' }, { ...cardFixture(), items: {} }]) {
    assert.doesNotThrow(() => validateCard(input));
    assert.equal(validateCard(input).ok, false);
  }
  for (const key of ['name', 'url']) {
    const input = cardFixture();
    input.items[0][key] = '';
    assert.equal(validateCard(input).ok, false, key);
  }
});

test('validation does not mutate incoming JSON', () => {
  const input = cardFixture();
  const before = clone(input);
  validateCard(input);
  assert.deepEqual(input, before);
});

test('discount and original-price copy cannot be embedded in ordinary text fields', () => {
  for (const phrase of ['정가', '정상가', '할인율', '50% 할인', '반값']) {
    const input = cardFixture();
    input.items[0].cond = phrase;
    assert.equal(validateCard(input).ok, false, phrase);
  }
});

test('spacing and invisible characters cannot bypass prohibited-copy checks', () => {
  for (const phrase of ['최 저 가', '최\u200b저\u200b가', '미 백', '다 이 어 트', '직접 써 봤어요']) {
    const input = cardFixture();
    input.title = phrase;
    assert.equal(validateCard(input).ok, false, phrase);
  }
});

test('unsafe image URLs cannot reach the browser renderer', () => {
  for (const img of ['http://images.example.com/photo.png', 'https://localhost/photo.png', 'https://127.0.0.1/photo.png', 'https://10.0.0.1/photo.png', 'https://192.168.1.1/photo.png', 'data:image/svg+xml,<svg/>', 'javascript:alert(1)', '../photo.png']) {
    const input = cardFixture();
    input.items[0].img = img;
    assert.equal(validateCard(input).ok, false, img);
  }
});

test('absent price or item checked properties omit their rows without inventing values', () => {
  const input = cardFixture('coupang', 5);
  delete input.items[3].price;
  delete input.items[4].checked;
  const result = validateCard(input);
  assert.equal(result.ok, true);
  assert.equal(result.data.items.length, 3);
  assert.equal(result.warnings.filter(x => x.code === 'ITEM_OMITTED').length, 2);
});

test('item verification cannot be later than card posting time', () => {
  const input = cardFixture();
  input.items[0].checked = '2026-10-31 15:21';
  const result = validateCard(input);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(x => x.code === 'TIMESTAMP_ORDER'));
});
