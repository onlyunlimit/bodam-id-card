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
