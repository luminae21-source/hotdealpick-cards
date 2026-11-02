# v6 몰별 독립 마스코트

현재 카드에 사용하는 파일은 `assets/mascots/coupang.png`, `toss.png`, `naver.png`입니다. 내장 ImageGen을 몰마다 따로 호출해 독립 생성했으며 콜라주에서 잘라낸 자료가 아닙니다. 투명 RGBA 원본 1536×1024를 비율 그대로 900×600으로 축소했습니다.

- 쿠팡: 리트리버와 삼색 고양이, 빨간 바구니
- 토스: 삼색 고양이, 파란 쇼핑백
- 네이버: 리트리버, 초록 가방

각 프롬프트 원문은 `prompts/mascot-prompts.json`에 있습니다. 글자·가격·제품은 그림에서 분리되어 있고 캐릭터의 비율을 늘이거나 팔다리를 임의 합성하지 않습니다. 카드 속 실제 상품은 별도 `img` 필드로 지정합니다. 이 그림은 쇼핑몰 공식 캐릭터가 아닌 핫딜픽의 마스코트입니다.

아래는 갤러리 등에서 유지하는 이전 에셋 기록입니다.

# 2D 캐릭터 제작 기록

생성 방식: 내장 ImageGen 도구. 별도 API/CLI는 사용하지 않았습니다.

사용 파일: `assets/mascots-anime-v2.png` — 1536 × 1024, RGBA 투명 배경.

사용 목적: 핫딜픽 카드와 목록 페이지의 강아지·삼색 고양이 캐릭터. 글자·몰 로고·상품 포장·가격은 그림에 넣지 않고 HTML/JSON에서 표시합니다.

최종 생성 프롬프트:

> Use case: illustration-story. Asset type: transparent PNG hero mascot illustration for a Korean Hotdealpick shopping card. Primary request: beautifully drawn, lively 2D animation illustration of an adorable golden floppy-eared puppy and a chubby calico cat (white, orange, charcoal patches) together excitedly pushing and riding a small coral-red shopping cart. Two characters only. The puppy smiles brightly with sparkling eyes and one paw raised; the calico cat peeks from the cart with a happy wink and a curved tail. Clear expressive hand-drawn line art in warm dark navy, high-quality 2D cel animation shading, soft pastel highlights, tiny blush cheeks, charming rounded anatomy, lively diagonal movement. Feel like a delightful hand-illustrated animation still, not a flat generic vector icon and not 3D. Composition: compact balanced full-body group with entire cart, ears and tails visible; wider than tall around a 3:2 silhouette, centered, clean transparent background around all shapes, artwork fills most of canvas with a modest margin. Include only a few small floating mint and butter-yellow sparkles and one coral heart close to the group. Palette: warm golden fur, cream white, orange and charcoal cat patches, coral red #F33430 cart, mint #E8F4F1, teal #426765, navy #223845 outlines; warm soft yellow secondary. Constraints: no text, letters, logos, product packages, prices, brand marks, watermarks, surrounding panel, border or background scene. The cart should be mostly empty; no invented products. Real transparent alpha background, not a checkerboard drawing. Polished premium editorial mascot art suitable for a cheerful shopping poster header.

## 3·4·5개용 빈 배경 9종

`assets/tpl/<몰>-<개수>.png`는 각각 독립된 1080×1350 이미지입니다. 5칸 원본 3장의 구성을 유지하면서 잔여 상품 흔적을 정리하고, ImageGen 내장 도구로 같은 디자인의 3칸·4칸 6장을 각각 편집했습니다. 전체 이미지를 규격에 맞춘 것 외에 분할·크롭·부분 합성은 없습니다. 프롬프트 기록: `prompts/count-template-prompts.json`. 위치 좌표와 입력 양식은 `FILL.md`를 따릅니다.
