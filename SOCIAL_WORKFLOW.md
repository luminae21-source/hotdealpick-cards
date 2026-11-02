# 스레드·인스타 공통 제작 서식

쿠팡, 토스, 네이버를 **각각 독립된 1080×1350 PNG 한 장**으로 만듭니다. 같은 PNG를 스레드 이미지 게시물과 인스타 피드·캐러셀에 사용할 수 있습니다. 4:5 이미지용이며 릴스 영상이나 9:16 스토리를 생성하는 기능은 포함하지 않습니다.

## 세 몰 × 세 개수 = 9종 디자인

| 몰 | 색감 | 마스코트 | 입력 양식 |
| --- | --- | --- | --- |
| 쿠팡 | 피치 배경, 빨강 강조 | 리트리버와 삼색 고양이, 빨간 바구니 | [coupang.json](templates/coupang.json) |
| 토스 | 하늘색 배경, 파랑 강조 | 삼색 고양이, 파란 쇼핑백 | [toss.json](templates/toss.json) |
| 네이버 | 연두 배경, 초록 강조 | 리트리버·고양이, 초록 가방·바구니 | [naver.json](templates/naver.json) |

캐릭터는 상단에 자연스럽게 배치하고 실제 상품 사진과 상품명은 별도 영역에 둡니다. 동물의 발·귀·꼬리가 잘리거나 사진을 가리지 않도록 비율을 유지합니다. 상품 사진을 임의로 생성하거나 다른 상품으로 바꾸지 않습니다. 상품을 캐릭터 소품으로 들게 하는 새로운 장면이 필요한 경우에도 실제 포장·수량·표시는 별도로 보존합니다.

상품명·가격·단위가·확인시각은 HTML 텍스트로 빈칸에 채웁니다. 로고·제휴고지·큰 제목·번호·캐릭터는 고정 배경 PNG에 포함됩니다. 3개·4개·5개 전용 PNG와 입력 양식은 [9종 선택표](FILL.md), [JSON 목록](templates/README.md)에 있습니다. 마스코트 파일과 장면 생성 프롬프트는 [ARTWORK.md](ARTWORK.md), [mascot-prompts.json](prompts/mascot-prompts.json)에 있습니다.

## 한 번 준비

```sh
npm ci
npx playwright install chromium
```

## 매번 만드는 방법

```sh
# campaign 부분은 원하는 영문/숫자 작업명으로 바꿉니다.
npm run new -- --mall all --name campaign --count 5
```

`data/coupang_campaign.json`, `data/toss_campaign.json`, `data/naver_campaign.json`이 생깁니다. 하나만 만들 때는 `--mall toss`처럼 지정합니다. 기존 파일은 덮어쓰지 않으며 상품 수는 `--count 3`, `--count 4`, `--count 5`로 선택합니다. 완성한 상품 수에 맞는 틀을 자동 사용합니다.

Claude에게 [매일 작업용 요청문](prompts/claude-daily.md)과 실제 상품 링크·정보를 전달하세요. Claude Code 또는 저장소 수정 기능이 있는 Claude 환경에서는 파일을 직접 수정할 수 있습니다. 일반 Claude 채팅에서는 완성된 JSON을 받아 해당 경로에 저장하세요.

확인된 정보를 채운 다음 실행합니다.

```sh
npm run pack
```

이 명령은 검증, 이미지 생성, 채널별 문구 작성을 순서대로 실행합니다. 각 JSON 하나가 PNG 한 장에 대응합니다. 3장을 붙인 뒤 자르는 과정은 없습니다. 빈 초안은 건너뛰고 확인된 상품이 3개 미만인 미완성 카드는 생성하지 않습니다.

## 완성 파일

예를 들어 `social/toss_campaign/`에는 다음 파일이 생깁니다.

| 파일 | 사용 방법 |
| --- | --- |
| `toss_campaign.png` | 스레드 또는 인스타에 첨부할 1080×1350 이미지 |
| `threads-01.txt` | 스레드 첫 글의 본문. 길면 `02`, `03`으로 이어지며 각 파일을 순서대로 게시 |
| `instagram.txt` | 인스타 게시물 본문 |
| `alt.txt` | 이미지 대체텍스트 원본. 앱 입력 제한에 맞게 줄일 수 있음 |
| `links.json` | 상품 번호와 해당 몰의 실제 링크 대응표 |
| `handoff.json` | 이미지·문구 파일, 기준시각, 이미지 누락 내역 |

스레드 본문은 보수적으로 파일당 500자 안에 들어오도록 상품 단위로 나눕니다. 조건부 가격은 조건과 함께 표시합니다. 이미지 안 주소에는 클릭 기능이 없으므로 실제 링크는 게시글 또는 프로필에도 넣으세요.

이 도구가 계정에 자동으로 게시하지는 않습니다. 파일과 문구를 함께 준비합니다. 게시 전 실제 가격·조건과 `handoff.json`의 `imageFailures`를 확인하세요. 상품 이미지가 없으면 카드에 ‘이미지 없음’이 표시되므로 실제 사진을 넣고 다시 생성하세요.

## GitHub와 Claude 연결

1. 이 저장소를 Claude Code에서 열거나 GitHub 연동 대상으로 지정합니다.
2. Claude는 `CLAUDE.md`를 읽고 각 몰의 JSON과 제공받은 상품 이미지 파일만 편집합니다.
3. `npm run pack`으로 확인한 뒤 변경한 JSON·이미지를 커밋합니다.
4. GitHub Actions의 **Validate, render and publish Hotdealpick** 실행 결과를 엽니다.
5. 빈 템플릿 9종은 `hotdealpick-9-templates`, 실제 상품을 채운 결과는 `hotdealpick-cards-실행번호` 아티팩트를 내려받습니다. `rendered/`에 PNG, `social/`에 게시용 묶음이 있습니다.

기존 워크플로는 기본 브랜치에 반영하면 GitHub Pages도 갱신합니다. SNS 게시 계정 연결이나 Claude API 키는 이 저장소에 저장하지 않습니다.

## 참고 시안

[쿠팡](examples/reference-art/coupang-1080x1350.png), [토스](examples/reference-art/toss-1080x1350.png), [네이버](examples/reference-art/naver-1080x1350.png)는 사용자가 제공한 과거 상품 구성을 바탕으로 각각 독립 생성한 디자인 참고 이미지입니다. 가격을 현재 판매 정보로 재검증하지 않았으며 상품 그림도 설명용입니다. `data/`로 복사해서 실판매 카드로 사용하지 않습니다. 실제 운영 카드는 확인한 상품 사진과 정보를 위 서식에 넣어 만듭니다.
