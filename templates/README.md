# Claude 상품 입력 양식 9종

이 폴더의 `<몰>-<개수>.json`을 `data/`에 새 이름으로 복사하고 실제 확인한 상품 정보를 채웁니다. `manifest.json`은 파일 대응표이므로 상품 데이터로 복사하지 않습니다.

| 몰 | 3개 | 4개 | 5개 |
| --- | --- | --- | --- |
| 쿠팡 | [coupang-3.json](coupang-3.json) | [coupang-4.json](coupang-4.json) | [coupang-5.json](coupang-5.json) |
| 토스 | [toss-3.json](toss-3.json) | [toss-4.json](toss-4.json) | [toss-5.json](toss-5.json) |
| 네이버 | [naver-3.json](naver-3.json) | [naver-4.json](naver-4.json) | [naver-5.json](naver-5.json) |

예: `npm run new -- --mall toss --name mypick --count 4`

`mall`, `title`, `checked`, `items` 외 루트 필드는 추가하지 않습니다. 모든 상품 값은 빈 문자열로 시작합니다. 원본 양식을 완성했다고 오해하지 않도록 가격·날짜·사진·링크 예시는 넣지 않았습니다.

`coupang.json`, `toss.json`, `naver.json`은 종전 호환용 5개 양식입니다. 새 작업은 개수가 붙은 이름을 권장합니다. 자세한 설명과 PNG 선택표는 [FILL.md](../FILL.md), 매번 쓸 요청문은 [claude-daily.md](../prompts/claude-daily.md)를 읽으세요.
