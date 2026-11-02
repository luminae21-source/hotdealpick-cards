/**
 * Rendering/validation fixtures ONLY. Never copy these rows to data/ or a live card.
 * Product text and historical prices were visible in the user's 2026-10-31
 * reference screenshot. They have not been checked as current offers.
 * Each mall uses its own reference rows. __test_only__ URLs are synthetic
 * test inputs, not actual sale listings or a verification of availability.
 * All browser-test data and images are intercepted; no product URL is visited.
 */
const historicalRows = { coupang: [
  ['대용량 할로윈 몬스터 롤리팝 캔디 100p 800g', '14,900원', '', '10g당 186원', '2026-10-31 15:20'],
  ['엘투 할로윈 츄이 캔디 약 100봉지 400g', '16,550원', '', '10g당 414원', '2026-10-31 15:20'],
  ['호박바구니 파티용품 소 혼합색상 36개', '14,490원', '', '1개 403원', '2026-10-31 15:20'],
  ['파티해 LED 20구 큐티 가랜드 호박', '5,450원', '', '', '2026-10-31 11:15'],
  ['파티쇼 콘서트 야광팔찌 5mm 100개 (랜덤 색)', '9,010원', '와우가', '1개 90원', '2026-10-31 15:20'],
], toss: [
  ['블루투스 무선 이어폰 노이즈캔슬링 최신형', '29,900원', '', '1세트 29,900원', '2026-10-31 15:20'],
  ['스테인리스 텀블러 600ml 보온보냉 손잡이형', '12,900원', '', '1개 12,900원', '2026-10-31 15:20'],
  ['포근한 극세사 담요 대형 150×200cm', '18,500원', '', '1장 18,500원', '2026-10-31 15:20'],
  ['고보습 바디로션 500ml 촉촉한 데일리 케어', '9,900원', '', '100ml당 1,980원', '2026-10-31 15:20'],
  ['에어프라이어 5L 대용량 디지털 온도조절', '59,900원', '', '1대 59,900원', '2026-10-31 15:20'],
], naver: [
  ['가정용 사과 3kg 당도선별 신선과일', '12,900원', '', '100g당 430원', '2026-10-31 15:20'],
  ['생수 2L×12병 먹는샘물', '6,980원', '', '1병당 582원', '2026-10-31 15:20'],
  ['IH 인덕션 후라이팬 28cm 논스틱 코팅', '19,900원', '', '1개 19,900원', '2026-10-31 15:20'],
  ['세탁세제 2.7L×2개 실내건조용', '15,900원', '', '100ml당 294원', '2026-10-31 15:20'],
  ['프리미엄 화장지 30롤 3겹 데일리', '13,900원', '', '1롤당 463원', '2026-10-31 15:20'],
] };

const hosts = {
  coupang: 'www.coupang.com',
  toss: 'shopping.toss.im',
  naver: 'smartstore.naver.com',
};

export const DISCLOSURES = {
  coupang: '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
  toss: '이 콘텐츠는 토스쇼핑 쉐어링크 활동의 일환으로, 링크를 통한 구매가 발생하면 일정 수수료를 지급받습니다.',
  naver: '이 포스팅은 네이버 쇼핑 커넥트 활동의 일환으로, 판매 발생 시 수수료를 제공받습니다.',
};

export function cardFixture(mall = 'coupang', count = 3) {
  return {
    mall,
    title: '과거 자료 · 렌더링 테스트',
    checked: '2026-10-31 15:20',
    items: historicalRows[mall].slice(0, count).map(([name, price, cond, unit, checked], index) => ({
      name,
      price,
      cond: mall === 'coupang' ? cond : '',
      unit,
      img: '',
      url: `https://${hosts[mall]}/__test_only__/reference-${index + 1}`,
      checked,
    })),
  };
}

export function blankFixture(mall = 'coupang') {
  return {
    mall,
    title: '오늘의 장바구니',
    checked: '',
    items: Array.from({ length: 3 }, () => ({
      name: '', price: '', cond: '', unit: '', img: '', url: '', checked: '',
    })),
  };
}

export function clone(value) {
  return structuredClone(value);
}
