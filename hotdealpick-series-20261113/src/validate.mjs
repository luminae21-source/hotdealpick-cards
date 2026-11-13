import {malls,series} from './config.mjs';
const banned=/최저가|미백|다이어트|면역|써\s*봤|써\s*본|재구매\s*인증/;
export function validDate(s){
  if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s))return false;
  const [y,m,d,h,n]=s.match(/\d+/g).map(Number);
  const dt=new Date(Date.UTC(y,m-1,d,h,n));
  return dt.getUTCFullYear()===y && dt.getUTCMonth()===m-1 && dt.getUTCDate()===d && h<24 && n<60;
}
export function unitPrice(price,total,per=1){
  if(![price,total,per].every(x=>Number.isFinite(x)&&x>0))throw Error('단위 가격 계산에는 양수 가격·총 수량·비교 단위가 필요합니다.');
  return Math.round(price/total*per);
}
export function validate(data){
  if(!data || !malls[data.mall])throw Error('몰은 coupang / naver / toss 중 하나입니다.');
  if(Object.keys(data).some(k=>!['mall','title','checked','items'].includes(k)))throw Error('허용되지 않은 루트 필드입니다.');
  if(!Object.values(series).includes(data.title))throw Error('제목은 오늘의 장바구니 또는 꾸준템 시리즈입니다.');
  if(!validDate(data.checked))throw Error('실제 게시 기준 시각을 YYYY-MM-DD HH:mm 형식으로 입력하세요.');
  if(!Array.isArray(data.items)||data.items.length<3||data.items.length>5)throw Error('원본 상품 수는 3~5개입니다.');
  for(const p of data.items){
    if(!p||Object.keys(p).some(k=>!['name','price','cond','unit','img','url','checked'].includes(k)))throw Error('허용되지 않은 상품 필드입니다.');
    if(['name','price','cond','unit','img','url','checked'].some(k=>typeof p[k]!=='string'))throw Error('모든 상품 필드는 문자열입니다.');
  }
  const included=data.items.filter(p=>p.price.trim()&&p.checked.trim());
  if(included.length<3)throw Error('가격과 확인 시각이 있는 상품이 3개 미만이라 카드를 만들지 않습니다.');
  for(const p of included){
    if(!p.name.trim()||!validDate(p.checked))throw Error('상품명과 유효한 확인 시각이 필요합니다.');
    if(!/^(?:[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)원$/.test(p.price))throw Error('가격은 양수 원화로 입력하세요. 예: 13,900원');
    if(p.cond && !/^(와우가|쿠폰가|회원가)([ ·/]+(와우가|쿠폰가|회원가))*$/.test(p.cond))throw Error('가격 조건은 확인된 와우가·쿠폰가·회원가만 가능합니다.');
    const copy=[p.name,p.cond,p.unit].join(' ');
    if(banned.test(copy))throw Error('허용되지 않은 광고·체험 표현입니다.');
    for(const [k,m] of Object.entries(malls))if(k!==data.mall && copy.includes(m.label))throw Error('다른 몰 이름을 카드에 넣을 수 없습니다.');
    let u;try{u=new URL(p.url)}catch{throw Error('실제 상품의 HTTPS 링크가 필요합니다.')}
    if(u.protocol!=='https:'||u.username||u.password||!malls[data.mall].hosts.some(h=>u.hostname===h||u.hostname.endsWith('.'+h)))throw Error('카드 몰과 상품 링크가 일치해야 합니다.');
    if(p.img && !/^assets\/images\/[a-zA-Z0-9_./-]+\.(png|jpg|jpeg|webp)$/.test(p.img))throw Error('확인한 상품 사진을 assets/images/ 아래에 저장하고 로컬 경로를 넣으세요.');
    if(p.img.includes('..'))throw Error('이미지 상대 경로에 ..를 넣을 수 없습니다.');
  }
  return {items:included,excluded:data.items.length-included.length};
}
