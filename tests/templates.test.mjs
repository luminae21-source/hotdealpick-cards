import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, isCardPNG } from '../scripts/common.mjs';
import { validateCard } from '../assets/validation.mjs';

test('nine reusable templates have matching blank inputs, safe row coordinates and exact PNGs', async () => {
  const manifest = JSON.parse(await readFile(path.join(ROOT, 'templates/manifest.json')));
  assert.equal(manifest.templates.length, 9);
  assert.equal(new Set(manifest.templates.map(t => `${t.mall}-${t.count}`)).size, 9);
  for (const template of manifest.templates) {
    const input = JSON.parse(await readFile(path.join(ROOT, template.input)));
    assert.equal(input.mall, template.mall); assert.equal(input.items.length, template.count);
    assert.equal(input.checked, '');
    assert.ok(input.items.every(item => Object.values(item).every(value => value === '')));
    assert.equal(validateCard(input).draft, true);
    assert.ok(isCardPNG(await readFile(path.join(ROOT, template.png))));
    const layout = JSON.parse(await readFile(path.join(ROOT, template.layout)));
    assert.deepEqual(layout.size, [1080, 1350]); assert.equal(layout.rows.length, template.count);
    let previous = 360;
    for (const row of layout.rows) {
      assert.ok(row.top >= previous && row.bottom > row.top + 110 && row.bottom < 1230);
      previous = row.bottom;
    }
  }
});
