# 이미지·시각 자료

## 사원증 프레임

- 파일: `assets/art/id-frame.png`
- 생성: 내장 image_gen 도구 (CLI/API 키 방식 사용 안 함)
- 적용: `assets/portal.css`의 카드 앞면 테두리에 CSS mask를 적용합니다. 이미지의 중앙과 외곽은 표시하지 않습니다.
- 건물 배경 생성안은 사용자의 수정 요청에 따라 프로젝트에서 제거했습니다. 배경/건축 이미지는 배포하지 않습니다.

최종 생성 프롬프트:

> Use case: product-mockup. Asset type: isolated transparent portrait ID card FRAME overlay, a small reusable website asset, NOT background art. Render one elegant slim rounded rectangle premium SGIA-style identity card border in brushed platinum, precision engraved microline accents at the four corners, very subtle pearlescent holographic refraction along edges only. Front-on orthographic, perfectly symmetrical and centered, approximately 2:3 portrait ratio. Very thin border around a large completely transparent EMPTY center; outside also completely transparent alpha. No card content, no lettering, no person, no photo, no scene, no background, no shadows outside border, no logos. Single frame only, restrained and professional government technology identity aesthetic. Delicate steel-blue and silver highlights, realistic fine surface material.

생성 결과의 투명도는 프롬프트만으로 보장되지 않아 실제 UI에서는 CSS 마스크로 중앙과 외곽을 제거했습니다.

## 기타

- 인물: 사용자가 제공한 `image.md`의 공개 이미지 URL. 팀 로고는 포털에서 제거했습니다.
- SGIA 문장: 기존 벡터 자산을 수정한 `assets/emblem.svg`
- 지도: OpenStreetMap 타일 + Leaflet, 지도에 출처 표시
- 레이더·날씨·시각·구조도: 수치와 연동한 SVG/CSS UI
- Leaflet BSD 2-Clause 고지는 `assets/vendor/leaflet.js` 첫머리에 포함

## 2026-09 UI 이미지 키트

생성된 배경/건축 그림은 사용하지 않습니다. 사용자가 요청한 한 장의 UI 시트를 내장 image_gen으로 생성하고, Pillow로 셀별 자르기·WebP 저장만 수행했습니다. 생성 원본은 Codex generated_images 폴더에 보존합니다.

- `assets/art/silver-emblem.webp`: 실버 SGIA 문장, 헤더·인트로·사원증
- `assets/art/footprints.webp`: 추적 지도 발자국
- `assets/art/community-icon.webp`: 게시판·독립 메신저 패널 아이콘
- `assets/art/resolved-seal.webp`: 영문 종결 도장

생성 요청: 1536×1024, 3×2 UI sprite sheet; polished silver titanium SGIA shield monogram, forensic shoe soles, slim dossier tab with barcode, precision radio tuning dial, community speech bubble, crimson RESOLVED seal. Separate assets and gutters; front-on, refined intelligence-agency styling; no scenes, architecture or wallpaper. Generated backgrounds are contained within cropped UI components. Live labels, controls and diagram room text remain HTML for interaction, accessibility and localization.

기존 `assets/emblem.svg`는 레거시 링크 호환용으로 유지합니다. 새 포털의 문장은 위 WebP를 사용합니다.

## 기록실 개편

금속 파일 탭과 다이얼 이미지는 제거했습니다. 주파수는 이전 아날로그 슬라이더 구성으로 복원했습니다. 사용자가 제공한 13개 레퍼런스는 구획선·타이포 위계·기록물 배치의 참고로만 사용했으며, 원본 이미지·인물·로고·문구는 배포물에 포함하지 않았습니다.

## 인물 중심 편집 디자인

`assets/editorial.css`와 `assets/personnel-design.js`는 기존 인물 사진을 재사용합니다. 사진 콜라주, 문서 창, 스캔선, 영상 프레임 어긋남과 ASCII 열람 연출은 CSS/HTML로 구성하며 새로운 배경 그림은 만들지 않습니다. BUG의 오류 복원과 AZ의 봉인 문서 연출은 별도 분기입니다. 모션 OFF·기기 모션 줄이기에서는 연출을 생략합니다. 원본 레퍼런스의 인물·로고·문구는 사용하지 않습니다.

## 기획사·게임 단말 개편

- `elysian.html`: 엘리시안 / 럭키트릭. 핑크 광원·격자·반짝임, 공개 아티스트 프로필과 갤러리.
- `hunterwind.html`: 헌터윈드 / 옵시더스. 메탈·더스트, 공개 아티스트 프로필과 갤러리.
- `lucky.html`, `obsidus.html`도 각각 같은 기획사 화면을 엽니다. 팀 로고는 기획사 페이지에만 사용합니다.
- 갤러리 추가: 공개 이미지 파일을 `assets/gallery/` 아래 넣고 `assets/agency-gallery.js`에 `{ url: 'assets/gallery/name.webp', caption: '화보 이름' }`를 추가합니다. 파일 확장자는 PNG/JPG/WebP를 지원하며 다음 빌드·배포부터 표시됩니다.
- 포털 BGM은 사용자가 제공한 `bgm/sgia.mp3`입니다. 페이지 간 공유 재생 구조를 유지합니다.
- AZ 키패드는 세계관 연출용 클라이언트 UI이며 관리자 인증과 별개입니다. 실제 비공개 자료를 이 UI에 넣지 않습니다.
- 레트로 수신기·키패드·문서 넘김·개념 도해는 수치 및 동작과 연결된 HTML/CSS/SVG입니다. 레퍼런스 원본 이미지는 배포하지 않습니다.

## 사건 위치·포렌식 디자인 개편

- `assets/forensic.css`: 블랙·옥사이드 레드·회색·시안 공통 팔레트, 금속 키패드, 세로 기록실, 증거 문서, 팀별 입체 카드와 기획사 입구. 키패드 클릭음은 Web Audio로 짧은 기계식 타격음을 합성합니다.
- `assets/evidence.js`: ORPÉ 발화 대조·신원 식별·현장 대응 문서. 기존 공개 세계관 내용으로 구성했습니다.
- `assets/image-surfaces.js`: 포털 및 인트로의 인물·UI 이미지를 CSS 배경으로 표시하고 이미지 요소의 실제 `src`는 투명 픽셀로 바꿉니다. 대체 텍스트는 유지합니다. 기본 길게 누르기·드래그 동작을 제한하는 UI 처리이며, 이미지 URL을 비밀로 만들거나 다운로드를 완전히 막는 기능은 아닙니다. 지도 타일은 제외합니다.
- 신고 위치는 지도 클릭·핀 드래그·좌표 입력으로 선택합니다. 좌표는 브라우저의 기존 `sgia.incidents` 기록에 저장되며 관제·기록실·상세 지도에서 공유됩니다. 서버나 다른 기기로 동기화하지 않습니다.
- 종결 승인 시 활성 지도와 처리 대기 목록에서 제거됩니다. 종결 필터로 문서와 당시 위치를 다시 열람하거나 사건을 재개할 수 있습니다.
- 첨부한 22개 레퍼런스는 재질·레이아웃·색상 참고입니다. 원본 이미지나 로고를 새로 복제하지 않았습니다.

## 2026-10-04 프리쿠라 메이커

- UI 프레임·체크 무늬·종이·펜 스탬프는 CSS/Canvas로 직접 구성. 신규 외부 이미지 파일 없음.
- `assets/purikura-gallery.js`는 기존 공개 `characters.js`/`agency-gallery.js` 이미지 URL을 재사용하며, 공개 커뮤니티 아티스트 프로필 URL을 읽어 선택 목록에 추가. 기존 자산의 출처 유지. 비공개 참고 이미지/MD 복사 없음.
- 사용자가 넣는 사진·스티커는 브라우저 메모리에서만 처리하며 배포 자산으로 복사하지 않음.


## 2026-10-05 프리쿠라 편집 확장·한글 글꼴

- 하트·레이스·별빛·우표·폴라로이드·골드 프레임은 `assets/purikura-engine.js`의 Canvas 도형으로 직접 구성. 외부 프레임 이미지 없음.
- 예문 선택과 PNG 출력에 쓰는 한글 글꼴 4종을 Google Fonts 공식 저장소에서 내려받아 `assets/fonts/`에 자체 제공. 원본 TTF를 수정하지 않음. 각 폰트의 OFL.txt를 해당 폴더의 `*-OFL.txt`로 함께 배포.

| 글꼴 | 원본 출처 | 파일 / 라이선스 |
| --- | --- | --- |
| Jua | [Google Fonts / Jua](https://github.com/google/fonts/tree/main/ofl/jua) | `Jua-Regular.ttf`, `jua-OFL.txt` |
| Do Hyeon | [Google Fonts / Do Hyeon](https://github.com/google/fonts/tree/main/ofl/dohyeon) | `DoHyeon-Regular.ttf`, `dohyeon-OFL.txt` |
| Nanum Pen Script | [Google Fonts / Nanum Pen Script](https://github.com/google/fonts/tree/main/ofl/nanumpenscript) | `NanumPenScript-Regular.ttf`, `nanumpenscript-OFL.txt` |
| Nanum Brush Script | [Google Fonts / Nanum Brush Script](https://github.com/google/fonts/tree/main/ofl/nanumbrushscript) | `NanumBrushScript-Regular.ttf`, `nanumbrushscript-OFL.txt` |

- 나머지 고딕·세리프·타자기 예문은 시스템 글꼴 스택 사용. 기기별 대체 글꼴 차이가 있을 수 있음.
- 새 글꼴은 메이커에서만 로드. 공개 빌드에는 위 8개 폰트/라이선스 경로만 추가 허용하며 비공개 텍스트 파일 허용 범위를 넓히지 않음.

## 2026-11-06 팀별 독립 테마·블랙잭

- 올리브색 TV 프레임·다이얼·스피커·크림 카드, 오리진 게이트 링, 비콘 종이 클립, 실드 장갑판은 `team-themes.css`에서 직접 구현한 CSS입니다. 로컬 참고 HTML/MD/스크린샷을 배포 파일로 복사하지 않았습니다.
- `assets/art/personnel-placeholder.svg`: 직접 제작한 인물 미등록용 도형 실루엣. 딜러·리어·판덴의 실제 외형으로 설명하지 않습니다.
- 블랙잭 포커·시소의 인물 사진은 사용자가 로컬 소개 자료에 연결한 기존 Caveduck CDN URL을 사용합니다. 정확한 URL은 `assets/characters.js`의 해당 두 레코드에 있습니다. 원본 참고 이미지 파일을 복제하지 않았습니다.
- 엔터테인먼트 화면은 [JYP 공식 사이트](https://www.jype.com/)의 큰 아티스트 비주얼과 [SM 아티스트 목록](https://www.smentertainment.com/artist/)의 탐색 구조를 참고했습니다. 해당 사이트 사진·로고·코드를 가져오지 않았으며 기존 SGIA 인물 사진·그룹 로고만 사용합니다.
