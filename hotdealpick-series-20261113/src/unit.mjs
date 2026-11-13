import {unitPrice} from './validate.mjs';
const [price,total,per=1]=process.argv.slice(2).map(Number);
console.log(unitPrice(price,total,per).toLocaleString('ko-KR')+'원');
