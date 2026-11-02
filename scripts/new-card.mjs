import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, exists, parseArgs, isMain } from './common.mjs';

export function emptyCard(mall, count = 5) {
  if (!['coupang', 'toss', 'naver'].includes(mall)) throw new Error('몰은 coupang, toss, naver 중 하나입니다.');
  if (![3, 4, 5].includes(count)) throw new Error('상품 수는 3, 4, 5 중 하나입니다.');
  return { mall, title: '오늘의 장바구니', checked: '', items: Array.from({ length: count }, () => ({ name: '', price: '', cond: '', unit: '', img: '', url: '', checked: '' })) };
}

export async function newCards({ root = ROOT, mall, name, count = '5' }) {
  if (!name || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(name)) throw new Error('--name에 영문·숫자·밑줄·하이픈 이름을 입력하세요.');
  const malls = mall === 'all' ? ['coupang', 'toss', 'naver'] : [mall];
  const files = malls.map(m => ({ file: `data/${m}_${name}.json`, data: emptyCard(m, Number(count)) }));
  for (const { file } of files) if (await exists(path.join(root, file))) throw new Error(`기존 파일은 덮어쓰지 않습니다: ${file}`);
  await mkdir(path.join(root, 'data'), { recursive: true });
  for (const { file, data } of files) await writeFile(path.join(root, file), `${JSON.stringify(data, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  return files.map(({ file }) => file);
}

if (isMain(import.meta.url)) {
  try { for (const file of await newCards(parseArgs(process.argv.slice(2), ['mall', 'name', 'count']))) console.log(`초안 생성: ${file}`); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
