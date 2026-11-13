import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {malls,themes,series,colors as C,defaultTheme} from './config.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp')}catch(e){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw e;sharp=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'sharp'));}
export {sharp};
const e=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text=(x,y,s,size=28,weight=400,fill=C.navy,anchor='start')=>`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${e(s)}</text>`;
const rect=(x,y,w,h,fill,rx=0,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const img=(href,x,y,w,h)=>`<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
const cache=new Map();
async function asset(file,embedded){
  if(!embedded)return '../'+file;
  if(!cache.has(file)){const b=await readFile(path.join(root,file)); const safe=await sharp(b).resize(800,800,{fit:'inside',withoutEnlargement:true}).png().toBuffer();cache.set(file,'data:image/png;base64,'+safe.toString('base64'));}
  return cache.get(file);
}
function width(s,size){return [...s].reduce((n,c)=>n+(c===' '?0.28:/[\u0000-\u007f]/.test(c)?0.60:1),0)*size;}
function wrap(s,size,max,maxLines=2){
  const words=s.trim().split(/\s+/);let lines=[''];
  for(const word of words){
    const last=lines.length-1,test=lines[last]?(lines[last]+' '+word):word;
    if(width(test,size)<=max)lines[last]=test;
    else if(width(word,size)<=max)lines.push(word);
    else {for(const c of word){if(width(lines.at(-1)+c,size)>max)lines.push('');lines[lines.length-1]+=c;}}
  }
  lines=lines.filter(Boolean);if(lines.length>maxLines)throw Error('상품명이 두 줄을 넘습니다. 정확한 핵심 명칭으로 줄여 주세요: '+s);
  return lines;
}
const dateLabel=s=>s?s.slice(5).replace('-','/'):'';
function photoPlaceholder(x,y,size,preview){
  return rect(x,y,size,size,'#F3F5F1',20)+`<g transform="translate(${x+size/2-21} ${y+size/2-29})" fill="none" stroke="#B9C6BF" stroke-width="2.5"><rect width="42" height="32" rx="6"/><circle cx="30" cy="10" r="4"/><path d="m5 26 10-10 9 10 6-7 7 7"/></g>`+text(x+size/2,y+size/2+32,preview?'상품 사진':'사진 미제공',18,400,C.muted,'middle');
}
export async function layout({mall,mode,count,items=[],checked='',theme=defaultTheme(mall,mode),episode='01',topic='',preview=false,embedded=true}){
  if(!malls[mall]||!series[mode]||!themes[theme]||![3,4,5].includes(count))throw Error('잘못된 서식 옵션입니다.');
  if(!/^\d{2,3}$/.test(episode))throw Error('시리즈 회차는 01처럼 2~3자리 숫자입니다.');
  if(topic.length>22)throw Error('회차 주제는 22자 이내로 줄여 주세요.');
  const m=malls[mall],th=themes[theme];
  const hero=await asset(`assets/mascots/${theme}.png`,embedded),foot=await asset(`assets/mascots/${th.footer}.png`,embedded);
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><title>핫딜픽 ${e(series[mode])} · ${m.label} · ${count}개${preview?' · 디자인 서식':''}</title><desc>${preview?'상품과 가격이 입력되지 않은 디자인 미리보기입니다. 게시용 카드가 아닙니다.':e(checked)+' 확인 가격. 구매 전 최종가 확인.'}</desc><style>text{font-family:'Noto Sans CJK KR','Noto Sans KR',sans-serif;letter-spacing:-.6px}svg{background:${m.paper}}</style>`;
  svg+=rect(0,0,1080,1350,m.paper)+`<ellipse cx="1020" cy="210" rx="220" ry="210" fill="${m.pale}" opacity=".6"/><ellipse cx="40" cy="1350" rx="220" ry="140" fill="${m.pale}" opacity=".75"/>`;
  svg+=rect(32,22,1016,78,m.pale,24)+text(55,53,m.disclosure[0],22,500,C.navy)+text(55,83,m.disclosure[1],22,500,C.navy);
  svg+=rect(48,124,49,49,C.red,14)+text(72.5,161,'딜',34,700,'white','middle')+text(111,160,'핫딜픽',32,700);
  svg+=rect(258,127,111,43,'#FFFFFF',21)+text(313.5,157,m.label,24,700,m.ink,'middle');
  svg+=img(hero,673,125,354,302);
  if(mode==='basket'){
    svg+=text(48,249,'오늘의',48,700,C.navy)+text(43,345,'장바구니',88,700,m.ink);
  }else{
    svg+=text(48,231,`VOL. ${episode}  ·  ${topic||th.topic}`,23,500,m.ink)+text(44,322,'꾸준템',92,700,C.navy)+text(338,321,'시리즈',64,700,m.ink);
  }
  const underY=mode==='basket'?365:345;
  svg+=`<path d="M51 ${underY} C190 ${underY-11},386 ${underY-9},590 ${underY-2}" fill="none" stroke="${C.yellow}" stroke-width="12" stroke-linecap="round"/>`;
  svg+=text(48,408,`${preview?'확인 시각 입력':dateLabel(checked)+' 확인 가격'} · ${count}개의 ${mode==='basket'?'픽':'꾸준템'}`,24,500,C.teal);
  const top=441,gap=13,total=724,row=(total-gap*(count-1))/count;
  for(let i=0;i<count;i++){
    const p=items[i]||{},y=top+i*(row+gap),cy=y+row/2;
    svg+=rect(36,y+3,1008,row,'#223845',28).replace('fill="#223845"','fill="#223845" opacity=".035"');
    svg+=rect(36,y,1008,row,'#FFFFFF',28);
    const badgeSize=count===5?36:40;
    svg+=rect(51,y+18,badgeSize,badgeSize,m.accent,13)+text(51+badgeSize/2,y+18+badgeSize*.72,String(i+1).padStart(2,'0'),24,700,'white','middle');
    const photoSize=count===3?152:count===4?128:102,px=103,py=cy-photoSize/2;
    if(p.img)svg+=img(await asset(p.img,embedded),px,py,photoSize,photoSize);
    else svg+=photoPlaceholder(px,py,photoSize,preview);
    const nx=count===3?279:count===4?256:228,nameMax=760-nx;
    const names=preview?['상품명을 입력하세요','용량 · 구성 입력']:wrap(p.name,32,nameMax);
    let ny=cy-((names.length-1)*39)/2-9;
    names.forEach((s,j)=>{svg+=text(nx,ny+j*39,s,32,j===0?700:400,j===0?C.navy:C.teal)});
    svg+=text(nx,ny+(names.length-1)*39+32,preview?'상품별 확인 시각':dateLabel(p.checked)+' 확인',18,400,C.muted);
    const price=preview?'가격 입력':p.price,priceSize=preview?42:44;
    if(width(price,priceSize)>243)throw Error('가격이 가격 칸을 넘습니다. 100만 원 이상의 상품은 별도 레이아웃이 필요합니다.');
    svg+=text(1012,cy-2,price,priceSize,700,C.red,'end');
    if(p.cond)svg+=text(1012,cy-43,p.cond,20,700,m.ink,'end');
    const unit=preview?'단위 가격 입력':p.unit;
    if(unit){if(width(unit,22)>242)throw Error('단위 가격을 20자 이내로 줄여 주세요.');svg+=rect(771,cy+13,241,34,'#FFF1C9',17)+text(891.5,cy+38,unit,22,700,C.navy,'middle');}
  }
  if(mall==='toss')svg+=text(48,1203,`⚠ ${preview?'M/D HH:MM':dateLabel(checked)} 게시 시점 가격`,22,700,m.ink);
  else svg+=text(48,1203,preview?'상품 입력 전 · 디자인 서식':'표시 가격은 확인 시점 기준입니다.',22,400,C.teal);
  svg+=rect(48,1226,315,63,m.accent,25)+text(71,1268,'hotdealpick.kr',30,700,'white')+`<circle cx="330" cy="1257" r="17" fill="white"/><path d="M321 1257h17m-6-6 6 6-6 6" fill="none" stroke="${m.accent}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  svg+=text(391,1268,'결제 전 최종가 확인',27,700,C.navy)+img(foot,835,1192,190,144);
  svg+=text(48,1320,preview?'미리보기용 빈 서식 · 실제 상품과 가격 확인 후 사용':'가격·재고·배송비는 구매 시 달라질 수 있습니다.',19,400,C.muted);
  return svg+'</svg>';
}
