import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),sharp=require('sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(await readFile(path.join(root,'data/products.json'),'utf8'));
const P={paper:'#F8FAF7',mint:'#E8F4F1',teal:'#426765',navy:'#223845',red:'#F33430',yellow:'#F4CF59',muted:'#647B7A',line:'#D8E4DF',white:'#FFFFFF'};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const money=n=>Math.round(n).toLocaleString('en-US');
const items=data.items.map(x=>({...x,unit:Math.round(x.price/(x.volume_ml*x.count)*100)})).sort((a,b)=>a.unit-b.unit);
const inlineAsset=async name=>'data:image/png;base64,'+(await readFile(path.join(root,'assets',name))).toString('base64');
const hero=await inlineAsset('winter-car-duo.png'),duo=await inlineAsset('checklist-duo.png');
const t=(x,y,s,size=28,weight=400,color=P.navy,anchor='start',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" ${extra}>${esc(s)}</text>`;
const r=(x,y,w,h,fill,rx=0,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const line=(x1,y1,x2,y2,color=P.line,width=1)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
const image=(src,x,y,w,h)=>`<image href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
function base(n,label){return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><title>핫딜픽 ${esc(label)}</title><desc>사용자 첨부 시안의 2026년 11월 11일 18시 가격 자료를 재구성한 디자인. 가격 재확인 전.</desc><style>text{font-family:'Noto Sans CJK KR','Noto Sans KR',sans-serif;font-kerning:normal;letter-spacing:-.6px}</style>${r(0,0,1080,1350,P.paper)}${t(64,34,'이 포스팅은 쿠팡 파트너스 활동의 일환으로,',22,400,P.muted)}${t(64,64,'이에 따른 일정액의 수수료를 제공받습니다.',22,400,P.muted)}${line(64,87,1016,87)}${r(64,111,44,46,P.red,12)}${t(86,145,'딜',30,700,P.white,'middle')}${t(122,145,'핫딜픽',29,700)}${t(1016,143,`${String(n).padStart(2,'0')} / 04`,22,400,P.teal,'end')}`;}
function footer(){return `${line(64,1245,1016,1245)}${t(64,1283,'hotdealpick.kr',25,700,P.teal)}${t(1016,1283,'첨부 자료 · 2026.11.11 18:00 기준',21,400,P.muted,'end')}${t(64,1320,'구매 전 배송비·쿠폰 조건과 최종 결제 금액을 확인하세요.',21,400,P.muted)}</svg>`;}
const kicker=(s)=>t(64,219,s,23,500,P.teal);

let cover=base(1,'성에제거제 가격 비교 표지')+kicker('겨울 준비  /  성에제거제 6종');
cover+=t(60,309,'성에제거제,',76,700)+t(60,399,'100mL당 얼마일까?',70,700,P.teal);
cover+=`<path d="M66 423 Q300 410 632 422" fill="none" stroke="${P.yellow}" stroke-width="9" stroke-linecap="round"/>`;
cover+=t(64,547,`${money(items[0].unit)}원`,92,700,P.red)+t(407,536,'—',63,400,P.muted)+t(520,547,`${money(items.at(-1).unit)}원`,92,700,P.navy);
cover+=t(64,594,'비교한 6종 기준',26,400,P.muted)+t(1016,594,`약 ${(items.at(-1).unit/items[0].unit).toFixed(1)}배 차이`,28,700,P.teal,'end');
cover+=r(64,638,952,442,P.mint,30)+t(94,692,'100mL당 낮은 순',25,700,P.teal);
items.slice(0,3).forEach((p,i)=>{let y=762+i*99;cover+=t(94,y,String(i+1).padStart(2,'0'),22,500,P.muted)+t(142,y,p.short_name,29,500)+t(142,y+39,`${money(p.unit)}원`,40,700,i===0?P.red:P.teal);});
cover+=image(hero,410,674,608,405)+t(64,1151,'가격표의 숫자만 보지 말고,',32,500)+t(64,1194,'용량까지 나눠서 비교해 보세요.',32,500,P.teal)+footer();

let chart=base(2,'100mL당 가격 비교')+kicker('PRICE CHECK  /  100mL 기준');
chart+=t(64,300,'같은 용량으로 놓고,',64,700)+t(64,379,'가격만 비교했어요.',64,700,P.teal);
chart+=t(64,433,'이번 비교에서는 420mL × 2통 묶음 3종이 낮았어요.',27,400,P.muted);
const x0=118,plotW=898,max=2500,startY=503,rowH=101;
for(let i=0;i<items.length;i++){
 const p=items[i],y=startY+i*rowH;const col=i===0?P.red:i<3?P.teal:'#A8BAB8';
 chart+=t(64,y,String(i+1).padStart(2,'0'),23,400,P.muted)+t(x0,y,p.name,30,500)+t(1016,y,`${money(p.unit)}원`,40,700,i===0?P.red:P.teal,'end');
 chart+=r(x0,y+21,plotW,19,'#EDF1ED',5)+r(x0,y+21,p.unit/max*plotW,19,col,5);
 chart+=t(x0,y+70,`${p.volume_ml}mL × ${p.count}통${p.condition?' · '+p.condition:''}`,21,400,P.muted);
}
chart+=line(x0,1125,1016,1125);
for(const tick of [0,1000,2000,2500]){const x=x0+tick/max*plotW;chart+=line(x,1125,x,1133,P.muted)+t(x,1160,tick===0?'0':money(tick),20,400,P.muted,tick===0?'start':tick===2500?'end':'middle');}
chart+=t(64,1213,'100mL당 가격 = 판매가 ÷ 총 용량(mL) × 100 · 원 단위 반올림',23,400,P.muted)+footer();

let table=base(3,'성에제거제 6종 판매가 표')+kicker('PRICE LIST  /  표시 판매가 함께 보기');
table+=t(64,300,'살 때 내는 가격도',64,700)+t(64,379,'함께 확인하세요.',64,700,P.teal)+t(64,432,'묶음 수량과 회원·쿠폰 조건까지 같은 줄에 담았어요.',26,400,P.muted);
table+=r(64,475,952,715,P.white,24,P.line)+r(65,476,950,59,P.mint,22)+r(65,505,950,30,P.mint);
table+=t(92,514,'순',23,500,P.teal)+t(147,514,'상품 · 구성',23,500,P.teal)+t(792,514,'판매가',23,500,P.teal,'end')+t(990,514,'100mL당',23,500,P.teal,'end');
items.forEach((p,i)=>{const y=535+i*109;if(i<3)table+=r(65,y,950,109,'#F0F7F3');if(i>0)table+=line(84,y,996,y);table+=t(100,y+49,String(i+1).padStart(2,'0'),23,400,P.muted,'middle')+t(147,y+45,p.name,30,500)+t(147,y+81,`${p.volume_ml}mL × ${p.count}통${p.condition?'  ·  '+p.condition:''}`,22,400,P.muted)+t(792,y+55,`${money(p.price)}원`,40,500,P.navy,'end')+t(990,y+55,`${money(p.unit)}원`,40,700,i===0?P.red:P.teal,'end');});
table+=t(64,1222,'비교 대상: 첨부 시안의 6종 · 강조 행은 100mL당 가격이 낮은 3종',22,400,P.muted)+footer();

let faq=base(4,'성에제거제 구매 전 확인사항')+kicker('SHOPPING NOTE  /  구매 전 확인');
faq+=t(64,300,'사기 전에,',64,700)+t(64,379,'세 가지만 확인해요.',64,700,P.teal)+image(duo,767,218,249,166);
const tips=[
 ['단위 가격','한 통 값보다 100mL당 가격','총 용량을 기준으로 나누면 묶음과 낱개를','같은 기준으로 비교할 수 있어요.'],
 ['결제 금액','배송비·회원·쿠폰 조건까지','같은 표시 가격이어도 결제 금액은 달라질 수 있어요.','구매 직전 최종 결제 금액을 확인하세요.'],
 ['사용·보관','용도와 보관 안내부터','사용 대상과 주의사항은 제품 표시를 확인하세요.','구매 수량은 사용량과 보관 공간에 맞춰 골라요.']
];
tips.forEach((q,i)=>{const y=492+i*220;faq+=t(64,y,String(i+1).padStart(2,'0'),44,400,P.teal)+t(151,y-10,q[0],22,500,P.muted)+t(151,y+39,q[1],36,700)+t(151,y+88,q[2],26,400,P.teal)+t(151,y+128,q[3],26,400,P.teal);if(i<2)faq+=line(151,y+164,1016,y+164);});
faq+=r(64,1175,952,45,P.mint,11)+t(540,1207,'겨울 준비도, 똑똑하게.',25,500,P.teal,'middle')+footer();

const pages=[['01-cover',cover],['02-unit-price',chart],['03-price-list',table],['04-shopping-note',faq]];
await mkdir(path.join(root,'exports'),{recursive:true});
for(const [name,svg] of pages){await writeFile(path.join(root,'exports',name+'.svg'),svg);await sharp(Buffer.from(svg)).png().toFile(path.join(root,'exports',name+'.png'));}
const html=`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>핫딜픽 · 성에제거제 6종</title><style>body{margin:0;padding:30px;background:#e8efeb;font-family:sans-serif;color:#223845}h1{font-size:22px}p{font-size:14px}.pages{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px}figure{margin:0}img{width:100%;display:block;box-shadow:0 8px 24px #22384512}figcaption{padding:10px}a{color:#426765}</style><h1>핫딜픽 · 성에제거제 6종</h1><p>첨부 자료 기준 재디자인 · 1080×1350 · 데이터 수정 후 npm run build</p><div class="pages">${pages.map(([name])=>`<figure><img src="exports/${name}.png" alt="${name}"><figcaption><a href="exports/${name}.png">PNG</a> · <a href="exports/${name}.svg">편집 가능한 SVG</a></figcaption></figure>`).join('')}</div></html>`;
await writeFile(path.join(root,'index.html'),html);
console.log(JSON.stringify({pages:pages.map(x=>x[0]),units:items.map(x=>x.unit),size:[1080,1350]}));
