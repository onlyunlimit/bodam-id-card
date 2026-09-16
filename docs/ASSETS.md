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

- 인물 및 기존 팀 로고: 사용자가 제공한 `image.md`의 공개 이미지 URL
- SGIA 문장: 기존 벡터 자산을 수정한 `assets/emblem.svg`
- 지도: OpenStreetMap 타일 + Leaflet, 지도에 출처 표시
- 레이더·날씨·시각·구조도: 수치와 연동한 SVG/CSS UI
- Leaflet BSD 2-Clause 고지는 `assets/vendor/leaflet.js` 첫머리에 포함

## 2026-09 UI 이미지 키트

생성된 배경/건축 그림은 사용하지 않습니다. 사용자가 요청한 한 장의 UI 시트를 내장 image_gen으로 생성하고, Pillow로 셀별 자르기·WebP 저장만 수행했습니다. 생성 원본은 Codex generated_images 폴더에 보존합니다.

- `assets/art/silver-emblem.webp`: 실버 SGIA 문장, 헤더·인트로·사원증
- `assets/art/footprints.webp`: 추적 지도 발자국
- `assets/art/dossier-tab.webp`: 사건 문서의 금속 파일 탭
- `assets/art/tuning-dial.webp`: 드래그/키보드 주파수 다이얼
- `assets/art/community-icon.webp`: 게시판·독립 메신저 패널 아이콘
- `assets/art/resolved-seal.webp`: 영문 종결 도장

생성 요청: 1536×1024, 3×2 UI sprite sheet; polished silver titanium SGIA shield monogram, forensic shoe soles, slim dossier tab with barcode, precision radio tuning dial, community speech bubble, crimson RESOLVED seal. Separate assets and gutters; front-on, refined intelligence-agency styling; no scenes, architecture or wallpaper. Generated backgrounds are contained within cropped UI components. Live labels, controls and diagram room text remain HTML for interaction, accessibility and localization.

기존 `assets/emblem.svg`는 레거시 링크 호환용으로 유지합니다. 새 포털의 문장은 위 WebP를 사용합니다.
