import { copyFile, readdir, lstat, mkdir, rm, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readCards, assertValid, createManifest, readReport, rendererHash, resetDirectory, writeJSON, isMain } from './common.mjs';

async function copyPublicTree(source, destination) {
  const metadata = await lstat(source);
  if (metadata.isSymbolicLink()) throw new Error(`Cannot publish symlink: ${source}`);
  if (metadata.isDirectory()) {
    await mkdir(destination, { recursive: true });
    for (const name of (await readdir(source)).sort()) {
      if (!name.startsWith('.')) await copyPublicTree(path.join(source, name), path.join(destination, name));
    }
  } else if (metadata.isFile()) {
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
}

export async function buildSite({ root = ROOT } = {}) {
  const output = await resetDirectory(root, 'dist');
  const stageName = `.build-stage-${process.pid}-${Date.now()}`;
  const stage = await resetDirectory(root, stageName);
  try {
    const cards = await readCards(root);
    assertValid(cards);
    const manifest = await createManifest(root, { strict: true, cards });
    for (const file of ['index.html', 'card.html', 'assets']) await copyPublicTree(path.join(root, file), path.join(stage, file));
    await mkdir(path.join(stage, 'data'), { recursive: true });
    for (const card of cards) await copyPublicTree(path.join(root, card.file), path.join(stage, card.file));
    await mkdir(path.join(stage, 'rendered'), { recursive: true });
    for (const card of manifest.cards) if (card.png) await copyPublicTree(path.join(root, card.png), path.join(stage, card.png));
    const report = await readReport(root);
    const reportCards = Array.isArray(report?.cards) ? report.cards : [];
    const reportedHashes = new Map(reportCards.map(card => [card?.file, card?.sourceHash]));
    const reportIsCurrent = report?.ok === true &&
      reportCards.length === cards.length && reportedHashes.size === cards.length &&
      cards.every(card => reportedHashes.get(card.file) === card.sourceHash) &&
      report.rendererHash === await rendererHash(root);
    // A draft-only build can succeed without PNGs; do not carry a report from
    // formerly active, deleted or changed cards into that otherwise valid site.
    if (reportIsCurrent) await writeJSON(path.join(stage, 'rendered', 'report.json'), report);
    await writeJSON(path.join(stage, 'manifest.json'), manifest);
    await writeFile(path.join(stage, '.nojekyll'), '');
    await rm(output, { recursive: true, force: true });
    await rename(stage, output);
    console.log(`Built dist/: ${manifest.cards.length} JSON file(s), ${manifest.cards.filter(card => card.png).length} PNG(s).`);
    return manifest;
  } finally { await rm(stage, { recursive: true, force: true }); }
}
if (isMain(import.meta.url)) {
  try {
    if (process.argv.length > 2) throw new Error('build takes no options.');
    await buildSite();
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
