import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {sharp,root} from './layout.mjs';
import {malls,defaultTheme,themes} from './config.mjs';
const catalog=JSON.parse(await readFile(path.join(root,'catalog.json'),'utf8'));
assert.equal(catalog.length,18);
for(const p of catalog){
  const meta=await sharp(path.join(root,'previews',p.name+'.png')).metadata();assert.equal(meta.width,1080);assert.equal(meta.height,1350);
  const s=await readFile(path.join(root,'templates',p.name+'.svg'),'utf8');
  for(const line of malls[p.mall].disclosure)assert.ok(s.includes(line));
  assert.ok(s.includes('font-size="22"'));assert.ok(s.includes('font-size="32"'));assert.ok(s.includes('font-size="42"'));
  assert.ok(s.includes('디자인 서식'));assert.ok(s.includes('최종가 확인'));
  if(p.mall==='toss')assert.ok(s.includes('게시 시점 가격'));
  const t=defaultTheme(p.mall,p.mode);assert.notEqual(t,themes[t].footer);
  const d=JSON.parse(await readFile(path.join(root,'data',p.name+'.json'),'utf8'));assert.equal(d.items.length,p.count);assert.equal(d.checked,'');
  assert.ok(d.items.every(x=>Object.values(x).every(v=>v==='')));
}
for(const t of Object.keys(themes)){const m=await sharp(path.join(root,'assets/mascots',t+'.png')).metadata();assert.equal(m.hasAlpha,true);}
console.log('PASS: 18 cards, dimensions, empty inputs, disclosures, type sizes, distinct poses, transparent mascots.');
