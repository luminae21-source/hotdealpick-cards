import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require('sharp');
const d=JSON.parse(await readFile(new URL('../data/products.json',import.meta.url),'utf8'));
assert.equal(d.items.length,6);assert.equal(d.checked,'2026-11-11 18:00');
assert.deepEqual(d.items.map(p=>Math.round(p.price/(p.volume_ml*p.count)*100)),[790,937,1001,1700,2132,2180]);
for(const name of ['01-cover','02-unit-price','03-price-list','04-shopping-note']){
 const img=await sharp(new URL('../exports/'+name+'.png',import.meta.url).pathname).metadata();assert.equal(img.width,1080);assert.equal(img.height,1350);
 const svg=await readFile(new URL('../exports/'+name+'.svg',import.meta.url),'utf8');assert.ok(svg.includes('이 포스팅은 쿠팡 파트너스 활동의 일환으로,'));assert.ok(svg.includes('이에 따른 일정액의 수수료를 제공받습니다.'));assert.ok(svg.includes('2026.11.11 18:00'));
}
console.log('PASS: 6개 단위 가격, 4장 규격, 제휴 안내, 자료 기준 시각 확인');
