import { mkdir, copyFile, writeFile, rm, rename } from 'node:fs/promises';
import path from 'node:path';
import { MALLS, validateCard } from '../assets/validation.mjs';
import { ROOT, readCards, assertValid, createManifest, readReport, resetDirectory, writeJSON, isMain } from './common.mjs';

const characters = text => Array.from(text).length;
const displayMall = mall => ({ coupang: '쿠팡', toss: '토스', naver: '네이버' })[mall];
const footer = '가격·조건은 달라질 수 있어요. 결제 전 최종가를 확인해 주세요.\nhotdealpick.kr';

export function captionFiles(input) {
  const result = validateCard(input);
  if (!result.ok) throw new Error('완성된 상품 JSON만 게시용 문구로 만들 수 있습니다.');
  const data = result.data;
  const disclosure = MALLS[data.mall].disclosure;
  const title = `${displayMall(data.mall)}에서 담아본 장바구니 🛒`;
  const lines = data.items.map((item, i) => `${i + 1}. ${item.name}\n${item.price}${item.cond ? ` (${item.cond})` : ''}${item.unit ? ` · ${item.unit}` : ''}`);
  const prefix = `${disclosure}\n\n${title}\n`;
  const suffix = `\n\n${footer}`;
  const groups = [];
  let current = [];
  // Reserve room for continuation numbering. Never split a product name/price.
  for (const line of lines) {
    if (characters(prefix + [...current, line].join('\n\n') + suffix) > 480 && current.length) {
      groups.push(current); current = [];
    }
    if (characters(prefix + line + suffix) > 480) throw new Error('상품명 또는 가격조건이 길어 스레드 문구를 줄여야 합니다.');
    current.push(line);
  }
  if (current.length) groups.push(current);
  const files = Object.fromEntries(groups.map((group, i) => [
    `threads-${String(i + 1).padStart(2, '0')}.txt`,
    `${disclosure}\n\n${title}${groups.length > 1 ? ` (${i + 1}/${groups.length})` : ''}\n\n${group.join('\n\n')}${suffix}\n`,
  ]));
  files['instagram.txt'] = `${disclosure}\n\n${title}\n필요했던 물건이 있는지 가볍게 살펴보세요.\n\n${lines.join('\n\n')}\n\n${data.checked} (한국시간) 게시 기준\n${footer}\n\n#핫딜픽 #장바구니\n`;
  files['alt.txt'] = `핫딜픽 ${displayMall(data.mall)} 상품 카드. ${data.checked} 게시 기준. ${data.items.map((item, i) => `${i + 1}번 ${item.name}, ${item.price}${item.cond ? `, ${item.cond}` : ''}${item.unit ? `, ${item.unit}` : ''}, ${item.checked} 가격 확인.`).join(' ')} 결제 전 최종가 확인.\n`;
  return files;
}

export async function socialPack({ root = ROOT } = {}) {
  const cards = await readCards(root);
  assertValid(cards);
  const manifest = await createManifest(root, { strict: true, cards });
  const report = await readReport(root);
  const stageName = `.social-stage-${process.pid}-${Date.now()}`;
  const stage = await resetDirectory(root, stageName);
  const output = path.join(root, 'social');
  const handoff = { schemaVersion: 1, canvas: { width: 1080, height: 1350, aspectRatio: '4:5' }, channels: ['threads', 'instagram'], autoPosted: false, cards: [] };
  try {
    for (const entry of manifest.cards.filter(card => card.status === 'ready')) {
      const card = cards.find(card => card.file === entry.file);
      const data = card.result.data;
      const stem = path.basename(entry.file, '.json');
      const folder = path.join(stage, stem);
      await mkdir(folder);
      await copyFile(path.join(root, entry.png), path.join(folder, `${stem}.png`));
      const captions = captionFiles(data);
      for (const [name, content] of Object.entries(captions)) await writeFile(path.join(folder, name), content, 'utf8');
      await writeJSON(path.join(folder, 'links.json'), data.items.map((item, index) => ({ index: index + 1, name: item.name, url: item.url, checked: item.checked })));
      const imageFailures = report?.cards?.find(item => item.file === entry.file)?.imageFailures ?? [];
      const ready = { mall: data.mall, source: entry.file, image: `${stem}.png`, captions: Object.keys(captions).filter(name => name !== 'alt.txt'), alt: 'alt.txt', links: 'links.json', checked: data.checked, sourceHash: card.sourceHash, imageFailures, reviewBeforePosting: true };
      await writeJSON(path.join(folder, 'handoff.json'), ready);
      handoff.cards.push({ folder: stem, ...ready });
    }
    await writeJSON(path.join(stage, 'manifest.json'), handoff);
    await rm(output, { recursive: true, force: true });
    await rename(stage, output);
    console.log(`social/: ${handoff.cards.length} 카드의 PNG·스레드·인스타 문구 준비 완료`);
    return handoff;
  } finally { await rm(stage, { recursive: true, force: true }); }
}

if (isMain(import.meta.url)) {
  try { if (process.argv.length > 2) throw new Error('social에는 추가 옵션이 없습니다.'); await socialPack(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
