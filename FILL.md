# 빈칸 채우기 카드 (11/1 진우 결정)

디자인은 GPT 시안 그대로 쓰고, Claude는 **빈칸만** 채운다: 상품 사진·상품명·조건(와우가 등)·가격·단위 가격, 제목 아래 날짜 줄.

- `assets/tpl/<몰>.png` — GPT 시안에서 상품 칸·날짜 줄·'예시 상품' 줄만 지운 빈 틀(나머지는 원본 그대로)
- `assets/tpl/<몰>.json` — 상품 줄 위치(자동으로 찾은 값)·날짜 줄 위치
- `assets/fill.html?data=data/<파일>.json` — 기존 JSON 형식(`mall·title·checked·items[name,price,cond,unit,img,url,checked]`) 그대로 읽어 칸만 채움 · 검사는 `assets/validation.mjs` 그대로
- `node fillrender.mjs <파일이름>` → `rendered/fill_<파일이름>.png` (1122×1402 → 게시용 1080×1350으로 줄여 씀)

규칙
- 틀의 상품 칸 수와 상품 수가 같아야 함(지금 틀 = 5칸). 3·4칸 틀은 GPT에서 받는 대로 추가
- 날짜 줄 = `M/D HH:MM 확인 가격 · N개의 픽`(토스 = `게시 시점 가격`) · 상품 확인 시각이 다르면 그 줄에 작게 표시
- 토스 카드에 다른 몰 이름 X · 네이버 상품 사진 규칙은 진우 결정 따름
