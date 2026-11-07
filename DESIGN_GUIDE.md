# SGIA 디자인 수정 안내

> 기준: 2026-11-06 · 화면 구조는 [SITE_MAP.md](SITE_MAP.md), 변경 내역은 [CHANGELOG.md](CHANGELOG.md).
> **색상·크기·여백은 CSS, 화면 구성·버튼 문구는 JS, 사진 URL은 데이터 파일을 수정합니다.**

## 1. GitHub에서 어떤 저장소를 열어야 하나요?

| 용도 | GitHub 위치 | 수정 후 반영 |
| --- | --- | --- |
| 유지 관리할 원본 | [bodam-id-card / feat/onlyunlimit-sgia](https://github.com/onlyunlimit/bodam-id-card/tree/feat/onlyunlimit-sgia) | 커밋만으로 현재 홈페이지가 자동 갱신되지는 않습니다. 공개 빌드 배포가 필요합니다. |
| 실제 서비스되는 파일 | [onlyunlimit.github.io / main](https://github.com/onlyunlimit/onlyunlimit.github.io/tree/main) | 이 저장소의 `assets/*.css`를 GitHub에서 수정·커밋하면 Pages 배포 후 현재 홈페이지에 반영됩니다. |

**GitHub에서 바로 보며 CSS를 조정하려면** 두 번째 저장소에서 아래 표의 같은 경로를 찾아 수정하면 됩니다. 변경한 내용은 **원본 저장소의 같은 파일에도 옮겨 두세요.** 다음 원본 배포는 공개 파일을 다시 복사하므로, 배포 저장소에만 있는 수정은 덮어써집니다.

원본을 수정하고 정상 배포하는 경로:

1. 위 원본 브랜치에서 파일 열기 → 연필(Edit) → 수정 → Commit changes.
2. 로컬에서 해당 변경을 가져와 `npm run build`로 미리보기 및 관련 검사.
3. 원본 커밋·푸시 후 `python3 scripts/publish-pages.py --publish` 실행 또는 배포 작업 요청.
4. 공개 사이트에서 확인. 바로 안 바뀌면 Pages 완료 후 새로고침.

원본의 [pages.yml](.github/workflows/pages.yml)은 **수동 실행 전용**이며, 현재 서비스용 저장소로 파일을 복사하는 작업과 다릅니다. 원본 커밋만으로 `onlyunlimit.github.io`가 바뀌는 구조는 아닙니다. 관리자 화면은 GitHub Pages가 아니라 별도의 Worker 배포가 필요합니다.


## 최신 수정 위치 — 2026-11-06

새 디자인은 **아래 두 CSS가 마지막으로 적용**됩니다. 이전 파일의 같은 선택자를 고쳐도 이 규칙이 덮어쓸 수 있습니다.

| 바꾸려는 화면 | 구성·문구 | 최종 디자인 위치 |
| --- | --- | --- |
| 블랙잭 — 시소 금속 TV·크림 기록 카드 | `assets/team-design.js`의 `blackjack` 분기, `assets/units.js` | `assets/team-themes.css`의 `BLACKJACK`, `.field-tv`, `.tv-screen`, `[data-team=blackjack]` |
| 오리진 — 보라색 게이트·아치형 표본 | `team-design.js`의 `origin` 분기 | `team-themes.css`의 `ORIGIN`, `.origin-aperture`, `.origin-ring` |
| 비콘 — 청회색 수사철·클립 증거 사진 | `team-design.js`의 `beacon` 분기 | `team-themes.css`의 `BEACON`, `.beacon-evidence` |
| 실드 — 황동·카키 장갑판 | `team-design.js`의 기본 실드 분기 | `team-themes.css`의 `SHIELD`, `.shield-lineup` |
| 팀별 배경·라이트/다크 | 경로별 `body[data-unit]` | `team-themes.css` 맨 위, `:root[data-theme=light]` |
| 공통 입력창·닫기 버튼·라이트모드 | 공통 셸 `assets/runtime.js` | `assets/service-design.css` 맨 위 및 마지막 라이트모드 규칙 |
| 커뮤니티 색상·목록·여백·프로필 피드 | `assets/community.js` | `service-design.css`의 `Community colors`, `.fan-layout`, `.post-row`, `.profile-feed` |
| 기획사 큰 인물 이미지·전환 속도 | `assets/agencies.js`의 `advance`, `every(...,6500)` | `service-design.css`의 `Artist labels`, `.spotlight-frame`, `.agency-hero` |
| 블랙잭 인물·사진 | `assets/characters.js`의 `poker/dealer/rear/panden/siso` | 이미지 미등록 3명은 `assets/art/personnel-placeholder.svg` |
| 관리자 멤버·좋아요 설정 | `backend/admin-composer.js`, `backend/admin.js` | 관리자 HTML 내부 CSS. 변경 후 Worker 별도 배포 필요 |


## 2. 가장 자주 고칠 파일

| 바꾸려는 것 | 먼저 열 파일 | 파일 안에서 검색할 글자 |
| --- | --- | --- |
| 사이트 전체 기본 색상 | [assets/forensic.css](assets/forensic.css) | 맨 위 `:root`, `--bg`, `--surface`, `--text`, `--accent`, `--danger` |
| 밝은 테마 색상 | [assets/forensic.css](assets/forensic.css) | `:root[data-theme='light']` |
| 럭키트릭·옵시더스 커뮤니티 색상 | [assets/fan-community.css](assets/fan-community.css) | `--fan-bg`, `--fan-paper`, `--fan-accent`, `.fan-community.obsidus` |
| 커뮤니티 바깥 배경·헤더까지 색상 통일 | [assets/fan-community.css](assets/fan-community.css) | `html[data-community-theme='lucky']`, `html[data-community-theme='obsidus']` |
| 인물 카드 크기·사진·이름판 | [assets/forensic.css](assets/forensic.css) | `.person-card`, `.id-photo`, `.id-caption`, `.person-title` |
| 사건 기록 카드 크기·간격 | [assets/forensic.css](assets/forensic.css) | `.case-file`, `.case-content`, `.case-location`, 파일 하단의 기록물 규칙 |
| 게시글 목록·본문·댓글 | [assets/fan-community.css](assets/fan-community.css) | `.fan-post-card`, `.feed-body`, `.post-body`, `.comment-row` |
| 선택한 태그·입력·자동완성 | [assets/fan-community.css](assets/fan-community.css) | `.selected-hashtags`, `.selected-hashtag`, `.hashtag-input`(자동 # 표시), `.hashtag-suggestions` |
| 시작 화면 | [assets/intro.css](assets/intro.css) | `.threshold`, `.threshold-copy`, `.intro-brand` |

### CSS가 여러 파일에 있는 이유

포털 페이지는 다음 순서로 스타일을 불러옵니다.

`vendor/leaflet.css` → `portal.css` → `editorial.css` → `game-ui.css` → `forensic.css` → `fan-community.css` → `service-design.css` → `team-themes.css`

- `portal.css`: 공통 화면의 기본 뼈대와 초기 스타일.
- `editorial.css`: 카드·편집형 화면 스타일.
- `game-ui.css`: 기밀 파일·금속 키패드·수신기·기획사·안내서.
- `forensic.css`: 현재 카드·사건기록·기밀 UI와 기본 색상의 후속 조정.
- `fan-community.css`: 커뮤니티 전체와 해시태그.

같은 선택자가 여러 번 나오면 **아래쪽 선언과 나중에 로드되는 파일**도 확인하세요. 우선순위가 같을 때 뒤의 값이 적용됩니다. 더 구체적인 선택자, `!important`, 모바일 `@media`가 우선하는 경우도 있습니다. `portal.css` 한 곳만 수정했는데 변화가 없다면 `forensic.css`부터 다시 검색하면 됩니다.

## 3. 화면별 상세 위치

표의 ‘구성 파일’은 HTML 조각을 만들어 넣는 JS입니다. 루트의 `community.html`, `records.html` 등은 대부분 진입 파일이므로 본문 디자인이 그 안에 전부 들어 있지 않습니다.

| 화면·부분 | 주소 | 구성·문구 파일 | 디자인 파일 / 검색어 |
| --- | --- | --- | --- |
| 접속 대기실 | `/index.html` | [intro.js](assets/intro.js), [index.html](index.html) | [intro.css](assets/intro.css): `.threshold`, `.intro-header`, `.intro-footer` |
| 공통 상단 메뉴·하단·로그인·팝업 | 모든 포털 | [runtime.js](assets/runtime.js) | [portal.css](assets/portal.css): `.site-header`, `.site-nav`, `.site-footer`, `#document-dialog`; [forensic.css](assets/forensic.css)의 덮어쓰기 |
| 메뉴 이동·페이지 연결 | 모든 포털 | [app.js](assets/app.js) | 화면 주소를 바꿀 때만 수정 |
| 통합 관제·날씨·시계 | `/portal.html` | [monitor.js](assets/monitor.js): `renderOverview` | [portal.css](assets/portal.css), [forensic.css](assets/forensic.css): `.control-grid`, `.map-panel`, `.readout`, `.weather-panel`, `.clock-panel` |
| 각성관·층별 시설 | `/portal.html` 아래 | [guide.js](assets/guide.js): `renderHeadquarters`, [floor-plans.js](assets/floor-plans.js) | [portal.css](assets/portal.css), [game-ui.css](assets/game-ui.css): `floor`, `facility` 검색 |
| 부서 목록 | `/departments.html` | [units.js](assets/units.js): `renderDirectory` | [editorial.css](assets/editorial.css), [forensic.css](assets/forensic.css): `.directory-card`, `.directory-visual` |
| 오리진·비콘·실드 카드 | `/origin.html`, `/beacon.html`, `/shield.html` | [units.js](assets/units.js), [personnel-design.js](assets/personnel-design.js) | [forensic.css](assets/forensic.css): `.person-card`, `.card-face`, `.id-caption`; [game-ui.css](assets/game-ui.css)의 기본 카드 |
| 인물 상세·과거 이미지 | 인물 카드 클릭 | [units.js](assets/units.js) | [forensic.css](assets/forensic.css): `.profile-stage`, `.profile-photo-window`, `.profile-photo-index`, `.past-record` |
| 부서 메신저 | 부서 화면 | [units.js](assets/units.js): `messenger`, [voices.js](assets/voices.js) | [portal.css](assets/portal.css): `.messenger`, `.messenger-body` |
| 기획사 선택 화면 | `/entertainment.html` | [agencies.js](assets/agencies.js): `renderAgencyDirectory` | [editorial.css](assets/editorial.css), [forensic.css](assets/forensic.css): `.ent-directory`, `.directory-card` |
| 럭키트릭·옵시더스 기획사 화면 | `/elysian.html`, `/hunterwind.html` | [agencies.js](assets/agencies.js): `renderAgency` | [game-ui.css](assets/game-ui.css), [forensic.css](assets/forensic.css): `.agency-site`, `.agency-hero`, `.agency-lineup` |
| 화보·확대 사진 | 기획사 화면 | [agency-gallery.js](assets/agency-gallery.js) | [forensic.css](assets/forensic.css): `.agency-gallery`, `.gallery-grid`, `.gallery-lightbox` |
| 사건 목록·필터 | `/records.html` | [monitor.js](assets/monitor.js): `renderRecords` | [forensic.css](assets/forensic.css): `.case-file`, `.case-content`, `.case-location` |
| 사건 상세 문서 | 사건 클릭 | [incident-ui.js](assets/incident-ui.js): `openIncident` | [forensic.css](assets/forensic.css) 하단: `.record-dossier`, `.dossier-zone-label`, `#case-location-map` |
| 신고서 작성 창 | 기록실 → 신고서 | [monitor.js](assets/monitor.js): `incident-form`, [report-map.js](assets/report-map.js) | [portal.css](assets/portal.css): `.board-form`; [forensic.css](assets/forensic.css): `.report-map-field`, `.address-tools`, `.area-controls` |
| 지도 높이·핀·위치 라벨 | 관제·기록실·신고·에이지 | [monitor.js](assets/monitor.js): `createMap`, [report-map.js](assets/report-map.js) | [portal.css](assets/portal.css), [forensic.css](assets/forensic.css): `.seoul-map`, `.incident-pin`, `.report-location-pin`, `.map-detection` |
| 기밀 파일 입구·추적 커서 | 기록실 ORPÉ | [hardware.js](assets/hardware.js), [forensics.js](assets/forensics.js) | [game-ui.css](assets/game-ui.css), [forensic.css](assets/forensic.css): `vault`, `forensic-cursor` 검색 |
| 금속 숫자 키패드·주파수 수신기 | 기록실 | [hardware.js](assets/hardware.js) | [game-ui.css](assets/game-ui.css), [forensic.css](assets/forensic.css): `.keypad-device`, `.hardware-keys`, `.receiver`, `.receiver-dial` |
| 에이지·증거 문서·동선 추적 | 기록실 잠금 해제 후 | [monitor.js](assets/monitor.js): `renderOrpe`, [evidence.js](assets/evidence.js) | [forensic.css](assets/forensic.css): `.classified-board`, `.evidence-reader`, `.tracking-section` |
| 세계관 안내서 | `/manual.html` | [guide.js](assets/guide.js), [manual-visuals.js](assets/manual-visuals.js) | [game-ui.css](assets/game-ui.css): `.manual-index`, `.guide-entry`, `.lore-diagram` |
| 커뮤니티 상단·그룹 로고·피드 | `/community.html?board=lucky` 또는 `obsidus` | [community.js](assets/community.js) | [fan-community.css](assets/fan-community.css): `.fan-hero`, `.fan-feed-tabs`, `.fan-post-card`; 최종 색상은 `service-design.css` |
| 사내 라운지 | `/community.html?board=staff` | [community.js](assets/community.js), [staff-board.js](assets/staff-board.js) | [fan-community.css](assets/fan-community.css): `.staff`, `.staff-masthead`, `.staff-channel-nav` |
| 글쓰기·첨부·댓글·태그 | 커뮤니티 팝업 | [community.js](assets/community.js), [community-media.js](assets/community-media.js), [staff-board.js](assets/staff-board.js) | [fan-community.css](assets/fan-community.css): `.upload-field`, `.upload-image`, `.attachment-remove`, `.comment-row`, `.selected-hashtag` |
| 관리자 화면 | API의 `/admin` | [backend/admin.js](backend/admin.js), [backend/admin-composer.js](backend/admin-composer.js) | `admin.js` 안 `<style>`; 홈페이지 CSS와 별개. 수정 후 Worker 배포 필요 |

`headquarters.html`, `orpe.html`, `lucky.html`, `obsidus.html`은 호환 경로입니다. 따로 디자인을 복제하지 말고 표의 실제 화면 파일을 수정합니다.

## 4. 사진·로고·문구 수정

- 인물 이름·설명·기본 이미지: [assets/characters.js](assets/characters.js).
- 로고·상세 이미지·화보 연결: [assets/media.js](assets/media.js), 화보 배열은 [assets/agency-gallery.js](assets/agency-gallery.js)도 확인.
- 화면 버튼·항목 문구: 해당 구성 JS에서 보이는 문장을 검색.
- 다른 언어 문구: [assets/i18n.js](assets/i18n.js), `assets/*-i18n.js`, 각 모듈의 `registerCopy`.
- 첨부 사진의 전체 비율: [fan-community.css](assets/fan-community.css)의 `.post-photos img[data-preserve-ratio]`. `height:auto`와 `background-size:contain`을 유지하면 잘리지 않습니다.
- 인물 이미지는 [image-surfaces.js](assets/image-surfaces.js)가 CSS 배경으로 표시합니다. 실제 보이는 사진 크롭은 `object-fit`뿐 아니라 `background-size`, `background-position`도 확인하세요.
- 관리자 화면의 생성 파일 `backend/admin-media.generated.js`는 직접 고치지 않습니다. 공유 첨부 동작은 `assets/community-media.js`, 생성은 `backend/scripts/build-admin-media.mjs`입니다.

## 5. 자주 쓰는 수정 예시

```css
/* 소개 페이지 상단 중앙 로고: .agency-nav-logo */
width: clamp(140px, 20vw, 270px);
height: 100px;

/* 카드 안쪽 여백 / 둥근 모서리 / 글자 크기 */
padding: 16px;
border-radius: 10px;
font-size: 14px;

/* 카드 간격: 해당 grid 또는 flex 부모에서 조정 */
gap: 12px;
```

- 카드 **안쪽** 간격은 `padding`, 카드 **바깥** 간격은 부모 `gap` 또는 `margin`.
- 그림자·입체감은 `box-shadow`, 카드 테두리는 `border`.
- 사진이 모서리 밖으로 나오면 사진을 감싼 요소의 `border-radius`와 `overflow:hidden`을 함께 확인.
- 휴대폰 크기는 같은 파일에서 `@media`와 해당 선택자를 다시 검색해 수정. 데스크톱만 고치면 모바일 규칙이 기존 값을 유지할 수 있습니다.
- 버튼 크기만 바꿀 때 JS 이벤트·`id`·`data-*` 속성은 유지하면 기존 클릭 기능을 보존할 수 있습니다.
- 새 규칙을 파일 맨 아래 계속 추가하기보다, 현재 적용되는 규칙을 찾아 값을 수정하는 편이 관리하기 쉽습니다.

## 6. 모바일 디자인만 수정하려면

**모바일용 별도 HTML은 없습니다.** 같은 CSS 안의 `@media (max-width: …px)`가 화면 너비에 따라 적용됩니다. 모바일만 바꾸려면 해당 범위 **중괄호 안**에서 수정하세요.

| 화면 | 수정 파일 | 먼저 검색할 모바일 구간 |
| --- | --- | --- |
| 커뮤니티·라운지·태그 | `assets/fan-community.css` | `@media`, `.fan-layout`, `.staff`, `.hashtag-editor` |
| 사건 카드·상세·신고·기밀 화면 | `assets/forensic.css` | `@media`, `.case-file`, `.record-dossier`, `.report-map-field` |
| 인물 카드·목록 | `assets/editorial.css`, `assets/forensic.css` | `max-width: 760px`, `max-width: 360px`, `.person-card` |
| 키패드·기획사·안내서 | `assets/game-ui.css` | `max-width: 900px`, `max-width: 760px` |
| 공통 메뉴·문서 창 | `assets/portal.css` | `max-width: 850px`, `max-width: 580px`, `max-width: 360px` |
| 시작 화면 | `assets/intro.css` | `@media`, `.threshold` |

### 예: 커뮤니티의 모바일 여백과 글자만 줄이기

`assets/fan-community.css`에서 기존 모바일 규칙을 찾아 아래처럼 값을 조정합니다. 아래 수치는 수정 예시이며 현재 설정값은 아닙니다.

```css
@media (max-width: 700px) {
  .fan-community { padding: 14px; }
  .fan-post-card { padding: 16px; }
  .fan-post-card h3 { font-size: 18px; }
}
```

- `max-width: 700px`는 700px 이하에서만 적용됩니다. 그 밖의 데스크톱 스타일은 유지됩니다.
- 같은 모바일 선택자가 파일 뒤에 또 있으면 뒤의 규칙도 확인하세요. `forensic.css`의 규칙이 앞에서 읽은 CSS를 덮어쓸 수도 있습니다.
- 한 줄에 카드 1개는 해당 부모의 `grid-template-columns: 1fr`, 두 개는 `repeat(2, minmax(0, 1fr))`로 조정합니다.
- 모바일 입력칸 글자는 `font-size: 16px`부터 확인하세요. iPhone에서 작은 입력 글자를 선택할 때 자동 확대되는 현상을 줄일 수 있습니다. 태그 입력칸 선택자는 `.hashtag-input textarea`입니다.
- 가로로 삐져나오는 항목은 `width:100%`, `min-width:0`, `box-sizing:border-box`, 긴 문장의 `overflow-wrap:anywhere`를 확인합니다. 전체 `body`를 잘라 문제를 숨기면 버튼·내용까지 잘릴 수 있습니다.
- 사진 비율을 유지하려면 고정 높이 대신 `height:auto`를 사용합니다. CSS 배경으로 표시하는 사진은 `background-size:contain`도 함께 확인합니다.

### PC에서 모바일 화면 미리보기

1. 사이트를 열고 Chrome 개발자 도구를 엽니다(Mac: `⌘⌥I`, Windows: `F12`).
2. 휴대폰/태블릿 아이콘을 선택합니다(Mac: `⌘⇧M`, Windows: `Ctrl⇧M`).
3. 화면 폭을 **320px → 390px → 430px**로 바꿔 확인합니다. 마지막에 넓은 데스크톱 화면도 확인합니다.
4. 게시글 작성·상세 창을 열어 내부 스크롤, 태그 5개, 긴 이름과 이미지가 잘리는지 확인합니다.
5. 개발자 도구의 Styles에서 바꾼 값은 미리보기일 뿐입니다. 확인한 값을 GitHub의 해당 CSS에 저장해야 유지됩니다.
6. 배포 완료 후 실제 휴대폰에서도 확인합니다. 특히 키보드·한글 입력·터치 동작은 PC 화면 축소만으로 모두 재현되지 않습니다.

## 프리쿠라 메이커 디자인

| 바꿀 부분 | 파일 / 검색어 |
| --- | --- |
| 화면 항목·도구 이름 | 독립판 [purikura.html](purikura.html), SGIA 미니 [purikura-sgia.html](purikura-sgia.html). 공통 도구 마크업 변경은 두 파일에 함께 적용 |
| 핑크/실버 배경·버튼·도구 패널 | [assets/purikura.css](assets/purikura.css): `:root`, `.booth-layout`, `.stage`, `.tools`, `.inspector` |
| 모바일 배치 | 같은 CSS의 `@media(max-width:1100px)`, `.mobile-dock`, `.tools.is-open`, `.inspector.is-open`; 좁은 화면 세부 여백은 700/380px 기준 |
| PNG에 찍히는 사진지·프레임·워터마크 | [assets/purikura-engine.js](assets/purikura-engine.js): `drawFrame`/`renderScene` — 화면 CSS가 아니라 캔버스 그리기 코드 |
| SGIA 미니 전용 랜덤/선택용 사진 추가 | [assets/purikura-gallery.js](assets/purikura-gallery.js): `extraPhotos`에 `{name:'이름',url:'https://…'}` 추가 |
| 사이트·DB 목록 연결 | [assets/purikura-site-gallery.js](assets/purikura-site-gallery.js); `data-sgia-gallery`가 있는 SGIA 미니에서만 로드 |
| 확대·각도 직접 입력·부분 지우개 | 두 HTML의 `scale-number`, `rotation-number`, `erase-size`; JS `syncTransformFields`, `sourcePoint`, `imageFor` |
| 도구 동작·업로드·저장·정렬 | [assets/purikura.js](assets/purikura.js), 엔진의 `snapItem` |
| 요소 옆 삭제·자르기 버튼 | HTML `selection-actions`, CSS `.selection-actions`, JS `placeActions` |
| 자르기 창·원본 복원 | [assets/purikura-crop.js](assets/purikura-crop.js), HTML `crop-dialog`, CSS `.crop-preview` |
| 글꼴 예문·± 버튼·모바일 패널 동작 | [assets/purikura-controls.js](assets/purikura-controls.js), CSS `.font-grid`, `.range-stepper` |
| 실제 한글 글꼴 파일 | `assets/fonts/`와 CSS `@font-face`; 출처/라이선스는 [자산 문서](docs/ASSETS.md) |


프레임 종류와 겹침 순서는 화면과 PNG에 함께 반영됩니다. 사진지 크기를 바꾸면 요소는 중앙을 기준으로 이동하며 실제 픽셀 크기와 회전은 유지됩니다. 화면에 맞추는 미리보기 배율 때문에 눈에 보이는 크기는 달라질 수 있습니다.

SGIA 미니에서만 기존 인물·화보와 공개 커뮤니티 프로필을 자동으로 합칩니다. 독립판에는 이 목록과 DB 연결이 없습니다. 두 버전은 CSS·편집 JS를 공유하므로 모바일 패널 디자인도 함께 적용됩니다. 파일·URL로 작업에 넣은 사진은 공개 목록에 자동 저장되지 않습니다. 사진 링크는 외부 캔버스 사용(CORS)이 허용되어야 PNG 저장에 사용할 수 있습니다.

## 7. 별도 제작 도구

[sgia.html](sgia.html), [monster.html](monster.html), [team.html](team.html), [quote.html](quote.html), [setlog.html](setlog.html), [bodam.html](bodam.html), [idcard/index.html](idcard/index.html), [school/index.html](school/index.html)은 별도 HTML 앱입니다. 각 파일의 `<style>`과 `<script>`를 확인합니다. 공통 포털 CSS가 모두 적용되는 구조는 아닙니다.

## 8. 수정 후 확인

1. 수정 화면의 데스크톱과 좁은 모바일 화면 확인.
2. 밝은/어두운 테마, 직원/방문자 화면이 달라지는 부분이면 각각 확인.
3. 클릭·닫기·다시 열기 동작 확인. 태그는 5개 추가·개별 삭제·수정 저장까지 확인.
4. 변경 내역은 [CHANGELOG.md](CHANGELOG.md)에 기록. 배포 전/완료 여부를 구분.

이 문서는 수정 위치 안내서입니다. 문서를 편집하는 것만으로 홈페이지 디자인이 바뀌지는 않습니다.

### 작성 옵션 입력 위치 (2026-11-07)

- 닉네임 선택 필드·미입력 안내: `assets/community.js`의 `#write-post` 클릭 처리의 게시글 폼과 `openPost` 댓글 폼.
- 관리자 작성 시각: `backend/admin-composer.js`의 `timeField`, `selectedTime`, `managedEditor`. 한국 시간 변환과 서버 검증은 유지하면서 라벨·간격을 수정하세요. 서버 파일 변경은 Worker 별도 배포가 필요합니다.

### 테마·로고·공개 이름 (2026-11-07)

- 팬 커뮤니티는 모드와 무관하게 럭키트릭 밝은 핑크 / 옵시더스 블랙·실버·골드 고정. `service-design.css`의 `html[data-theme][data-community-theme=...]`가 최종 팔레트이며, 이탈하면 저장된 사이트 모드를 복원합니다. 사내 게시판은 사이트 모드를 따릅니다.
- 커뮤니티의 기존 `.fan-hero-art` 로고는 유지합니다. 크기는 `service-design.css`의 해당 선택자에서 조절합니다. 소개 페이지 로고는 `agencies.js`의 `.agency-nav-logo`, 중앙 정렬·크기는 `service-design.css` 맨 아래 규칙입니다. 소개 페이지의 히어로 아래 중복 로고는 없으며 큰 제목은 ELYSIAN/HUNTERWIND 영어 표기입니다.
- 고정 재질의 인물 카드에는 카드 내부의 `--text`·`--muted`를 사용합니다. 페이지 모드의 색을 직접 물려주면 어두운 카드 위에 어두운 글씨가 생길 수 있습니다.
- 공개 인물 이름·사진 캡션·고정 인물 태그에는 코드네임만 사용합니다. 본명이 비밀인 인물의 본명을 공개 데이터에 덧붙이지 마세요. 커뮤니티 이름은 D1 `members`에 별도 저장됩니다.
