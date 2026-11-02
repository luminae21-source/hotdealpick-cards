import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import { newCards } from '../scripts/new-card.mjs';
import { captionFiles, socialPack } from '../scripts/social-pack.mjs';
import { ROOT } from '../scripts/common.mjs';
import { cardFixture, blankFixture, DISCLOSURES } from './fixtures.mjs';

test('three independent blank templates never invent checked prices', async t => {
  const root = await mkdtemp(path.join(ROOT, '.pipeline-test-social-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const paths = await newCards({ root, mall: 'all', name: 'campaign', count: '5' });
  assert.equal(paths.length, 3);
  for (const file of paths) {
    const data = JSON.parse(await readFile(path.join(root, file), 'utf8'));
    assert.ok(file.includes(data.mall));
    assert.equal(data.items.length, 5);
    assert.equal(data.checked, '');
    assert.ok(data.items.every(item => Object.values(item).every(value => value === '')));
  }
  await assert.rejects(newCards({ root, mall: 'all', name: 'campaign' }), /덮어쓰지/);
  await assert.rejects(newCards({ root, mall: 'all', name: '../escape' }), /name/);
});

test('caption chunks preserve every item and mall disclosure within 500 characters', () => {
  for (const mall of ['coupang', 'toss', 'naver']) {
    const data = cardFixture(mall, 5);
    for (const [i, item] of data.items.entries()) item.name = `${i + 1}번 생활용품 ${'상품 설명 '.repeat(20)}`.trim();
    const files = captionFiles(data);
    const thread = Object.entries(files).filter(([name]) => name.startsWith('threads-')).map(([, text]) => text);
    assert.ok(thread.length > 1);
    for (const text of thread) { assert.ok(Array.from(text).length <= 500); assert.ok(text.startsWith(DISCLOSURES[mall])); }
    for (const item of data.items) { assert.ok(thread.join('\n').includes(item.name)); assert.ok(files['instagram.txt'].includes(item.price)); }
    assert.ok(files['alt.txt'].includes(data.checked));
  }
  assert.throws(() => captionFiles(blankFixture()), /완성된/);
});

test('social export refuses active JSON without a matching rendered PNG', async t => {
  const root = await mkdtemp(path.join(ROOT, '.pipeline-test-social-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await newCards({ root, mall: 'coupang', name: 'test' });
  const { writeFile } = await import('node:fs/promises');
  await writeFile(path.join(root, 'data/coupang_test.json'), JSON.stringify(cardFixture()));
  await assert.rejects(socialPack({ root }), /missing or stale/);
});
