import test from 'node:test';
import assert from 'node:assert/strict';
import {validate,validDate,unitPrice} from '../src/validate.mjs';
// Deliberately synthetic, isolated validation data. Never included in production examples.
function fixture(n=3){return {mall:'coupang',title:'꾸준템 시리즈',checked:'2026-11-13 16:50',items:Array.from({length:n},()=>({name:'검증 전용 항목',price:'1,000원',cond:'',unit:'',img:'',url:'https://www.coupang.com/test-only',checked:'2026-11-13 16:50'}))};}
test('3,4,5 products are supported',()=>{for(const n of [3,4,5])assert.equal(validate(fixture(n)).items.length,n)});
test('missing price or checked excludes a row and preserves valid rows',()=>{const d=fixture(5);d.items[0].price='';d.items[1].checked='';assert.equal(validate(d).items.length,3);assert.equal(validate(d).excluded,2)});
test('fewer than 3 complete entries cannot render',()=>{const d=fixture();d.items[2].checked='';assert.throws(()=>validate(d),/3개 미만/)});
test('mall mismatch is blocked',()=>{const d=fixture();d.items[0].url='https://shopping.naver.com/test';assert.throws(()=>validate(d),/일치/)});
test('malicious lookalike hosts are blocked',()=>{const d=fixture();d.items[0].url='https://coupang.com.example.com/test';assert.throws(()=>validate(d),/일치/)});
test('invalid date and missing root time fail',()=>{assert.equal(validDate('2026-02-30 12:00'),false);assert.equal(validDate('2026-11-13 24:00'),false);const d=fixture();d.checked='';assert.throws(()=>validate(d),/시각/)});
test('zero price and discounts fail',()=>{const d=fixture();d.items[0].price='0원';assert.throws(()=>validate(d));d.items[0].price='1,000원';d.items[0].discountRate='50%';assert.throws(()=>validate(d),/필드/)});
test('unit math uses total quantity and correct rounding',()=>{assert.equal(unitPrice(13900,60),232);assert.equal(unitPrice(6640,840,100),790);assert.throws(()=>unitPrice(100,0))});
test('unverified claims and local path traversal fail',()=>{const d=fixture();d.items[0].name='최저가 검증';assert.throws(()=>validate(d));d.items[0].name='검증';d.items[0].img='assets/images/../../key.png';assert.throws(()=>validate(d),/경로/)});
