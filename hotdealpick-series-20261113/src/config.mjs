export const malls = {
  coupang: {label:'쿠팡', ink:'#C83D31', accent:'#ED4839', paper:'#FFF6EC', pale:'#FFE8D9',
    disclosure:['이 포스팅은 쿠팡 파트너스 활동의 일환으로,','이에 따른 일정액의 수수료를 제공받습니다.'], hosts:['coupang.com']},
  naver: {label:'네이버', ink:'#176E4E', accent:'#16855D', paper:'#F2F8ED', pale:'#DFEED7',
    disclosure:['이 포스팅은 네이버 쇼핑 커넥트 활동의 일환으로,','판매 발생 시 수수료를 제공받습니다.'], hosts:['smartstore.naver.com','brand.naver.com','shopping.naver.com','naver.me']},
  toss: {label:'토스', ink:'#2255A2', accent:'#3979D8', paper:'#EFF7FC', pale:'#DAEDFA',
    disclosure:['이 콘텐츠는 토스쇼핑 쉐어링크 활동의 일환으로,','링크를 통한 구매가 발생하면 일정 수수료를 지급받습니다.'], hosts:['toss.im']}
};
export const themes = {
  market: {label:'함께 장보기', topic:'오늘의 쇼핑 메모', footer:'home'},
  pantry: {label:'주방의 기본', topic:'주방에서 자주 찾는 것들', footer:'market'},
  home: {label:'포근한 집콕', topic:'매일을 채우는 생활용품', footer:'pantry'},
  season: {label:'계절 준비', topic:'겨울을 준비하는 작은 습관', footer:'home'}
};
export const series = {basket:'오늘의 장바구니', steady:'꾸준템 시리즈'};
export function defaultTheme(mall,mode) {
  return mode==='basket' ? 'market' : ({coupang:'pantry',naver:'home',toss:'season'}[mall]);
}
export const colors = {navy:'#223845',teal:'#426765',red:'#F33430',muted:'#73817C',yellow:'#F4CF59',mint:'#E8F4F1'};
