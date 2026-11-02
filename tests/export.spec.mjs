import { test, expect } from '@playwright/test';
import { mkdtemp, mkdir, cp, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, writeJSON } from '../scripts/common.mjs';
import { renderCards } from '../scripts/render.mjs';
import { buildSite } from '../scripts/build.mjs';
import { startServer } from '../scripts/serve.mjs';
import { cardFixture } from './fixtures.mjs';

test('production export and Pages build create three exact PNGs with matching links', async () => {
  test.setTimeout(60_000);
  // Isolated historical fixtures: never written to the real data/ or shipped as sale cards.
  const root = await mkdtemp(path.join(ROOT, '.pipeline-test-export-'));
  let app;
  try {
    await mkdir(path.join(root, 'data'));
    for (const file of ['card.html', 'index.html', 'assets']) {
      await cp(path.join(ROOT, file), path.join(root, file), { recursive: true });
    }
    for (const [mall, count] of [['coupang', 5], ['toss', 4], ['naver', 3]]) {
      await writeJSON(path.join(root, 'data', `${mall}.json`), cardFixture(mall, count));
    }
    const report = await renderCards({ root });
    expect(report.ok).toBe(true);
    expect(report.cards).toHaveLength(3);
    for (const entry of report.cards) {
      expect(entry.status).toBe('ready');
      expect(entry.renderer).toBe('fill');
      expect(entry.template).toMatch(/^(coupang-5|toss-4|naver-3)$/);
      expect(entry.layout.errors).toEqual([]);
      expect(entry.layout.fontLoaded).toBe(true);
      const png = await readFile(path.join(root, entry.png));
      expect(png.readUInt32BE(16)).toBe(1080);
      expect(png.readUInt32BE(20)).toBe(1350);
    }
    const manifest = await buildSite({ root });
    expect(manifest.cards).toHaveLength(3);
    expect((await readdir(path.join(root, 'dist', 'rendered'))).sort()).toEqual(['coupang.png', 'naver.png', 'report.json', 'toss.png']);
    app = await startServer({ root: path.join(root, 'dist') });
    for (const entry of manifest.cards) {
      expect(entry.png).toBe(`rendered/${entry.mall}.png`);
      expect((await fetch(`${app.url}/${entry.png}`)).status).toBe(200);
      expect((await fetch(`${app.url}/${entry.file}`)).status).toBe(200);
    }
    expect((await fetch(`${app.url}/tests/fixtures.mjs`)).status).toBe(404);
  } finally {
    await app?.close();
    const resolved = path.resolve(root);
    if (path.dirname(resolved) !== path.resolve(ROOT) || !path.basename(resolved).startsWith('.pipeline-test-export-')) {
      throw new Error('Refusing to remove an unexpected test directory.');
    }
    await rm(resolved, { recursive: true, force: true });
  }
});
