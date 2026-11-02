# 핫딜픽 3개·4개·5개 템플릿 사용하기

**쿠팡·토스·네이버 × 상품 3개·4개·5개 = 총 9종**입니다. 모두 1080×1350 PNG이며 스레드와 인스타 피드에 공통으로 쓸 수 있습니다.

1. 빈 PNG는 `assets/tpl/`에서 `coupang-3.png`처럼 **몰-개수.png** 파일을 고릅니다. 전체 선택표는 [FILL.md](FILL.md)에 있습니다.
2. Claude에게 이 프로젝트 폴더와 [prompts/claude-daily.md](prompts/claude-daily.md)를 전달합니다.
3. 상품 입력 양식은 `templates/`의 **몰-개수.json**입니다. 날짜·가격·상품 사진·링크를 실제 확인한 값으로 채웁니다.
4. `npm run pack`을 실행하면 몰과 상품 수에 맞는 PNG, 스레드 본문, 인스타 본문, 대체텍스트, 상품 링크를 `social/`에 준비합니다.

처음 한 번 `npm ci`와 `npx playwright install chromium`을 실행합니다. 자세한 설치·반복 작업은 [SOCIAL_WORKFLOW.md](SOCIAL_WORKFLOW.md)를 따릅니다.

일반 작업에서 캐릭터나 배경을 다시 그릴 필요가 없습니다. 빈 칸만 채우면 됩니다. SNS 계정에 직접 게시하는 기능은 포함하지 않습니다.

## GitHub 반영 상태

대상 저장소는 `luminae21-source/hotdealpick-cards`입니다. 이 전달본의 변경은 로컬에서 완성·검증했지만 연결 앱이 쓰기 요청을 HTTP 403으로 거부하여 **원격 업로드는 아직 완료되지 않았습니다.** 비밀번호나 API 키를 이 파일에 입력하지 마세요.

첨부된 `GITHUB_CHANGES.patch`를 GitHub 쓰기 권한이 있는 Claude Code 또는 로컬 Git 환경에서 적용할 수 있습니다. 기존 데이터를 통째로 덮어쓰지 않도록 변경분 패치만 적용합니다.

```sh
git clone https://github.com/luminae21-source/hotdealpick-cards.git
cd hotdealpick-cards
git switch -c templates/3-4-5
# 패치 파일 경로는 실제 압축을 푼 위치에 맞춥니다.
git apply --3way ../GITHUB_CHANGES.patch
npm ci
npx playwright install chromium
npm test
npm run test:browser
git add .
git commit -m "Add nine reusable social templates and Claude workflow"
git push -u origin templates/3-4-5
```

패치에 충돌이 나면 최신 저장소의 수정 내용을 확인해 함께 반영합니다. 강제 푸시나 기존 파일 일괄 삭제는 필요하지 않습니다. GitHub 반영 후 Actions에서 `hotdealpick-9-templates`와 상품 게시용 묶음을 내려받을 수 있습니다.
