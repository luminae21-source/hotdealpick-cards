# 3개·4개·5개 상품을 채우는 9종 템플릿

쿠팡·토스·네이버 × 3칸·4칸·5칸, 총 **9장**입니다. 모두 **1080×1350 PNG, 4:5**이며 스레드와 인스타 피드에 공통으로 사용합니다. 각 그림은 독립된 한 장입니다. 콜라주를 자르거나 5칸을 늘여서 3칸으로 만들지 않았습니다.

## 파일 선택

| 몰 | 3개용 PNG | 4개용 PNG | 5개용 PNG |
| --- | --- | --- | --- |
| 쿠팡 | [coupang-3.png](assets/tpl/coupang-3.png) | [coupang-4.png](assets/tpl/coupang-4.png) | [coupang-5.png](assets/tpl/coupang-5.png) |
| 토스 | [toss-3.png](assets/tpl/toss-3.png) | [toss-4.png](assets/tpl/toss-4.png) | [toss-5.png](assets/tpl/toss-5.png) |
| 네이버 | [naver-3.png](assets/tpl/naver-3.png) | [naver-4.png](assets/tpl/naver-4.png) | [naver-5.png](assets/tpl/naver-5.png) |

- `assets/tpl/<몰>-<개수>.png`: 상품·날짜가 비어 있는 배경. 로고·마스코트·제휴고지·제목·번호·하단 안내는 고정입니다.
- `assets/tpl/<몰>-<개수>.json`: 그림 안의 정확한 상품칸 좌표. 일반 상품 입력 때는 수정하지 않습니다.
- `templates/<몰>-<개수>.json`: **Claude가 복사해서 채울 상품 입력 양식**. 상품 정보는 전부 빈 문자열입니다.
- `templates/manifest.json`: 9종 PNG·좌표·입력 양식 대응표.
- 기존 `assets/tpl/<몰>.png/.json`은 이전 원본을 보존한 파일입니다. 새 작업은 개수가 붙은 파일을 사용합니다.

## Claude에서 사용

```sh
# 한 몰, 원하는 개수
npm run new -- --mall coupang --name daily3 --count 3
npm run new -- --mall toss --name daily4 --count 4
npm run new -- --mall naver --name daily5 --count 5

# 세 몰을 모두 같은 개수로 만들 때
npm run new -- --mall all --name campaign --count 4
```

`data/`에 생성된 JSON에 확인한 실제 상품만 입력한 뒤:

```sh
npm run pack
npm run build
```

유효한 상품 수를 기준으로 정확히 같은 칸 수의 배경을 자동 선택합니다. 예를 들어 `mall=toss`이고 표시할 상품이 4개면 `toss-4.png`를 사용합니다. 5행 중 미확인 2행이 제외되면 3칸 틀을 사용합니다. 표시할 상품이 3개 미만이면 만들지 않습니다.

프리뷰: `http://127.0.0.1:4173/assets/fill.html?data=data/toss_daily4.json`

한 파일만 렌더링: `npm run render -- --data data/toss_daily4.json` 또는 `node fillrender.mjs toss_daily4`. 결과는 `rendered/toss_daily4.png`입니다. 여러 상품 파일을 함께 내보낼 때는 `npm run pack`을 사용합니다.

## 유지할 규칙

Claude는 상품 사진·상품명·가격·가격조건·단위가·확인시각·링크만 입력합니다. 고정 제목은 `오늘의 장바구니`이며, JSON의 `title`은 카드 목록의 작업 제목으로 유지됩니다. 고지와 캐릭터를 다시 그리지 않습니다. 상품 수가 다르면 배경을 자르는 대신 해당 개수의 틀을 고릅니다.

가격 조건은 가격 바로 옆, 단위가는 그 아래 굵게 표시합니다. 상품 확인시각이 게시 기준과 다르면 상품명 아래 별도로 표시합니다. 토스에는 하단 게시 시점 가격 안내도 추가됩니다. 상품 사진이 없거나 열리지 않으면 `이미지 없음`을 표시하고 결과 보고서에 기록합니다.

상품명은 2줄까지 표시하며 긴 이름은 말줄임합니다. 전체 이름은 JSON·게시글·대체텍스트에 유지합니다. 빈 템플릿은 그 자체가 판매 게시물은 아닙니다. 날짜·가격·상품 사진을 확인해 채운 후 게시합니다.

## 생성 기록

3칸·4칸 배경 6장은 ImageGen으로 기존 몰별 5칸 원본을 각각 따로 편집했습니다. 5칸 3장은 기존 원본의 전체 구성을 유지하면서 상품칸에 남은 흐릿한 흔적을 ImageGen으로 정리했습니다. 모든 최종 PNG는 전체 이미지 단위로 1080×1350 규격에 맞췄습니다. 분할·크롭은 사용하지 않았습니다. 프롬프트: [count-template-prompts.json](prompts/count-template-prompts.json).
