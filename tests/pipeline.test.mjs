import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, cp } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { ROOT, createManifest, readCards, rendererHash, sha256, writeJSON } from '../scripts/common.mjs';
import { startServer } from '../scripts/serve.mjs';
import { renderCards } from '../scripts/render.mjs';
import { buildSite } from '../scripts/build.mjs';
import { cardFixture, blankFixture } from './fixtures.mjs';

async function project(t, data = blankFixture()) {
  const root = await mkdtemp(path.join(ROOT, '.pipeline-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'data'));
  await mkdir(path.join(root, 'assets'));
  await writeFile(path.join(root, 'card.html'), '<!doctype html><main id="card"></main>');
  await writeFile(path.join(root, 'index.html'), '<!doctype html><a href="card.html?data=data/card.json">카드</a>');
  await writeFile(path.join(root, 'assets', 'style.css'), ':root { color: #223845; }');
  await writeJSON(path.join(root, 'data', 'card.json'), data);
  return root;
}

test('blank drafts create a report, no PNG, and a publishable relative manifest', async t => {
  const root = await project(t);
  const report = await renderCards({ root });
  assert.equal(report.ok, true);
  assert.equal(report.cards[0].status, 'draft');
  assert.deepEqual(await readdir(path.join(root, 'rendered')), ['report.json']);
  await mkdir(path.join(root, 'tests'));
  await writeFile(path.join(root, 'tests', 'private.txt'), 'never publish');
  await writeFile(path.join(root, '.env'), 'never publish');
  await writeFile(path.join(root, 'assets', '.private'), 'never publish');
  const manifest = await buildSite({ root });
  assert.deepEqual(manifest.cards[0], { file: 'data/card.json', mall: 'coupang', title: '오늘의 장바구니', checked: '', status: 'draft' });
  assert.deepEqual((await readdir(path.join(root, 'dist'))).sort(), ['.nojekyll', 'assets', 'card.html', 'data', 'index.html', 'manifest.json', 'rendered']);
  assert.deepEqual(await readdir(path.join(root, 'dist', 'assets')), ['style.css']);
  assert.deepEqual(await readdir(path.join(root, 'dist', 'rendered')), ['report.json']);
  const deployed = new URL(manifest.cards[0].file, 'https://owner.github.io/repository/');
  assert.equal(deployed.href, 'https://owner.github.io/repository/data/card.json');
  const app = await startServer({ root: path.join(root, 'dist') });
  t.after(app.close);
  assert.deepEqual(await (await fetch(`${app.url}/manifest.json`)).json(), manifest);
  assert.equal((await fetch(`${app.url}/card.html?data=data/card.json`)).status, 200);
});

test('build omits a previous successful report when all current cards become drafts', async t => {
  const root = await project(t, cardFixture());
  const [previousCard] = await readCards(root);
  await mkdir(path.join(root, 'rendered'));
  await writeJSON(path.join(root, 'rendered', 'report.json'), {
    ok: true,
    rendererHash: await rendererHash(root),
    cards: [{ file: previousCard.file, sourceHash: previousCard.sourceHash, status: 'ready', png: 'rendered/card.png' }],
  });
  await writeJSON(path.join(root, 'data', 'card.json'), blankFixture());
  const manifest = await buildSite({ root });
  assert.equal(manifest.cards[0].status, 'draft');
  assert.deepEqual(await readdir(path.join(root, 'dist', 'rendered')), []);
});

test('build omits a previous successful report that includes a deleted card', async t => {
  const root = await project(t);
  await writeJSON(path.join(root, 'data', 'removed.json'), cardFixture());
  const previousCards = await readCards(root);
  await mkdir(path.join(root, 'rendered'));
  await writeJSON(path.join(root, 'rendered', 'report.json'), {
    ok: true,
    rendererHash: await rendererHash(root),
    cards: previousCards.map(card => ({ file: card.file, sourceHash: card.sourceHash, status: card.result.draft ? 'draft' : 'ready' })),
  });
  await rm(path.join(root, 'data', 'removed.json'));
  const manifest = await buildSite({ root });
  assert.equal(manifest.cards.length, 1);
  assert.deepEqual(await readdir(path.join(root, 'dist', 'rendered')), []);
});

test('build omits a draft report created with an older renderer', async t => {
  const root = await project(t);
  await renderCards({ root });
  await writeFile(path.join(root, 'assets', 'style.css'), ':root { color: #426765; }');
  await buildSite({ root });
  assert.deepEqual(await readdir(path.join(root, 'dist', 'rendered')), []);
});

test('invalid active JSON removes stale PNGs and dist and records failure', async t => {
  const data = cardFixture();
  data.items[0].price = '';
  const root = await project(t, data);
  await mkdir(path.join(root, 'rendered'));
  await writeFile(path.join(root, 'rendered', 'obsolete.png'), 'stale');
  await assert.rejects(renderCards({ root }), /data\/card.json/);
  assert.deepEqual(await readdir(path.join(root, 'rendered')), ['report.json']);
  const report = JSON.parse(await readFile(path.join(root, 'rendered', 'report.json'), 'utf8'));
  assert.equal(report.ok, false);
  assert.ok(report.cards[0].errors.length);
  await mkdir(path.join(root, 'dist'));
  await writeFile(path.join(root, 'dist', 'obsolete.png'), 'stale');
  await assert.rejects(buildSite({ root }), /data\/card.json/);
  assert.deepEqual(await readdir(path.join(root, 'dist')), []);
});

test('malformed JSON makes the validate CLI exit nonzero', async t => {
  const root = await project(t);
  await cp(path.join(ROOT, 'scripts'), path.join(root, 'scripts'), { recursive: true });
  await cp(path.join(ROOT, 'assets', 'validation.mjs'), path.join(root, 'assets', 'validation.mjs'));
  await writeFile(path.join(root, 'data', 'card.json'), '{"mall":');
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', 'validate.mjs')], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(`${result.stdout}${result.stderr}`, /INVALID data\/card.json/);
});

test('build rejects active cards with absent, stale, or wrong-size PNGs', async t => {
  const root = await project(t, cardFixture());
  await assert.rejects(buildSite({ root }), /missing or stale/);
  const [card] = await readCards(root);
  await mkdir(path.join(root, 'rendered'));
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==', 'base64');
  await writeFile(path.join(root, 'rendered', 'card.png'), png);
  const report = { ok: true, rendererHash: await rendererHash(root), cards: [{ file: card.file, status: 'ready', sourceHash: card.sourceHash, png: 'rendered/card.png', pngHash: sha256(png) }] };
  await writeJSON(path.join(root, 'rendered', 'report.json'), report);
  await assert.rejects(buildSite({ root }), /missing or stale/);
  report.cards[0].sourceHash = 'old-input-hash';
  await writeJSON(path.join(root, 'rendered', 'report.json'), report);
  assert.equal((await createManifest(root)).cards[0].png, undefined);
  await assert.rejects(buildSite({ root }), /missing or stale/);
});

test('local server exposes only public paths and blocks encoded traversal', async t => {
  const root = await project(t);
  await writeFile(path.join(root, '.env'), 'private');
  await mkdir(path.join(root, 'scripts'));
  await writeFile(path.join(root, 'scripts', 'secret.mjs'), 'private');
  const app = await startServer({ root });
  t.after(app.close);
  const request = pathname => new Promise((resolve, reject) => {
    const req = http.get(`${app.url}${pathname}`, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    req.on('error', reject);
  });
  assert.equal(await request('/'), 200);
  assert.equal(await request('/manifest.json'), 200);
  assert.equal(await request('/.env'), 403);
  assert.equal(await request('/scripts/secret.mjs'), 404);
  assert.equal(await request('/assets/%252e%252e/.env'), 403);
  assert.equal(await request('/assets/%5c..%5c.env'), 400);
  assert.equal(await request('/assets/%00'), 400);
  const manifest = await (await fetch(`${app.url}/manifest.json`)).json();
  assert.equal(manifest.cards[0].status, 'draft');
});
