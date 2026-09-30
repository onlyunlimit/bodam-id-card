# 홈페이지 구성 안내

> 확인일: **2026-09-30** · 기준: 현재 저장소의 라우터, 페이지 파일, 공개 빌드 목록.
> 홈페이지: https://onlyunlimit.github.io/ · 최근 변경: [CHANGELOG.md](CHANGELOG.md)
>
> 이 문서는 **현재 코드 구성**을 설명합니다. 배포 여부는 변경 이력의 배포 상태에서 별도로 확인합니다.

## 1. 전체 구조 한눈에 보기

홈페이지는 아래 세 영역을 함께 제공하는 구조입니다. 모든 페이지가 상단 메뉴에 표시되는 것은 아닙니다.

```text
/ 또는 /index.html — SGIA 접속 대기실
└─ /portal.html — SGIA 공통 포털
   ├─ 통합 관제 → 같은 페이지 아래에 각성관 층별 안내
   ├─ 조직·부서 → 오리진 / 비콘 / 실드
   ├─ 엔터테인먼트 → 엘리시안·럭키트릭 / 헌터윈드·옵시더스
   ├─ 사건 기록실 → 같은 페이지 아래에 ORPÉ 위협 정보
   ├─ 세계관 안내서
   └─ 커뮤니티 → 럭키트릭 / 옵시더스 / SGIA 사내 게시판

별도 제작 도구
├─ /sgia.html — SGIA 트친소·등록증 형식 카드
├─ /monster.html — 괴물 기밀 기록 카드
├─ /team.html — 팀·인물 기록 카드
├─ /quote.html — 소설·로그 발췌 이미지
└─ /setlog.html — 다인 로그 이미지

보담고 기존 콘텐츠
├─ /bodam.html — 보담고 소개·학생증 진입
├─ /school/index.html — 학교 홈페이지
├─ /idcard/index.html — 학생증 제작
└─ /character/*.html — 기존 캐릭터 소개 4개
```

**경로 읽는 법:** `/records.html`은 홈페이지 주소 뒤에 붙는 경로이며, 저장소에서는 루트의 `records.html` 파일에 해당합니다. 표의 페이지 이름을 누르면 공개 사이트로 이동합니다.

## 2. SGIA 상단 메뉴와 페이지

| 항목 | 접속 경로 | 화면 구성·주요 기능 | 열람 구분 |
| --- | --- | --- | --- |
| [접속 대기실](https://onlyunlimit.github.io/index.html) | `/`, `/index.html` | 회전 게이트, 접속 연출, 접속 효과음, 언어·모션 설정. 접속 버튼으로 통합 관제 이동 | 공개 |
| [통합 관제](https://onlyunlimit.github.io/portal.html) | `/portal.html` | 세계 지도와 미종결 사건 핀·구역, 위험 등급·게이트 집계, 부서 운용 상태, 서울 날씨, 한국 시각, 브리핑, 제작 도구 링크 | 공개 중심 |
| [각성관 층별 안내](https://onlyunlimit.github.io/portal.html#headquarters) | `/portal.html#headquarters` | 통합 관제 아래 구역. 지상·지하 총 18개 층 선택, 실내 계획도, 방별 설명, 관련 부서 이동 | 일부 시설 직원 화면에서 열람 |
| [조직·부서](https://onlyunlimit.github.io/departments.html) | `/departments.html` | 오리진·비콘·실드 3개 부서의 소개 및 상세 페이지 진입 | 공개 |
| [오리진](https://onlyunlimit.github.io/origin.html) | `/origin.html` | 부서 소개, 시간표, 브리핑, 소속 인물 카드·상세 기록, 업무 메신저 | 공개 카드 / 직원 상세 |
| [비콘](https://onlyunlimit.github.io/beacon.html) | `/beacon.html` | 추적관리팀 소개, 시간표, 브리핑, 소속 인물 카드·상세 기록, 업무 메신저 | 공개 카드 / 직원 상세 |
| [실드](https://onlyunlimit.github.io/shield.html) | `/shield.html` | 부서 소개, 시간표, 브리핑, 소속 인물 카드·상세 기록, 업무 메신저 | 공개 카드 / 직원 상세 |
| [엔터테인먼트](https://onlyunlimit.github.io/entertainment.html) | `/entertainment.html` | 그룹별 입체 소개 패널 2개. 각 기획사 페이지로 이동 | 공개 |
| [엘리시안·럭키트릭](https://onlyunlimit.github.io/elysian.html) | `/elysian.html` | 핑크 계열 기획사 화면, 아티스트 4명, 공개 상세 프로필, 화보 갤러리·확대 및 이전/다음, 팬 게시판 연결 | 공개 |
| [헌터윈드·옵시더스](https://onlyunlimit.github.io/hunterwind.html) | `/hunterwind.html` | 금속·어두운 계열 기획사 화면, 아티스트 4명, 공개 상세 프로필, 화보 갤러리·확대 및 이전/다음, 팬 게시판 연결 | 공개 |
| [사건 기록실](https://onlyunlimit.github.io/records.html) | `/records.html` | 아날로그 수신기·주파수 조정, 사건 필터·목록·상세 문서, 지도, 신고서 작성, 긴급 수신 알림, 종결 승인·재개 | 신고·처리 업무는 직원 화면 |
| [ORPÉ 위협 정보](https://onlyunlimit.github.io/records.html#threats) | `/records.html#threats` | 기록실 아래 구역. 봉인 파일, 숫자 키패드·클릭음, 추적 커서, AZ 정보, ASCII 신원 화면, 증거 문서 3개, 동선 지도·감청 로그 | 코드 입력 연출 + 일부 직원 열람 |
| [세계관 안내서](https://onlyunlimit.github.io/manual.html) | `/manual.html` | 용어 검색·목차, 게이트·각성자·가이딩·각인·매칭 등 설명, 등급표, 개념 도해, 명령어 복사 | 공개 |
| [커뮤니티](https://onlyunlimit.github.io/community.html) | `/community.html` | 그룹별 4개 피드, 사진 첨부, 팬·아티스트 글/답글, 글·댓글 좋아요, 6자리 PIN 수정·삭제, 관리자 진입 | 팬 공개 / 사내는 직원 화면 |

### 호환 경로: 다른 페이지가 추가로 생긴 것이 아닙니다

| 기존 경로 | 실제 표시 화면 | 의미 |
| --- | --- | --- |
| `/headquarters.html` | 통합 관제의 `#headquarters` 구역 | 각성관 바로가기. 별도 층별 안내 화면을 중복 관리하지 않음 |
| `/orpe.html` | 사건 기록실의 `#threats` 구역 | 빌런·위협 정보 바로가기 |
| `/lucky.html` | 엘리시안 기획사 화면 | `/elysian.html`과 같은 기획사 내용을 표시 |
| `/obsidus.html` | 헌터윈드 기획사 화면 | `/hunterwind.html`과 같은 기획사 내용을 표시 |

위 경로는 HTTP 리다이렉트가 아니라 `assets/app.js`가 대응하는 화면을 그리는 방식입니다. 주소창에는 기존 경로가 남을 수 있습니다.

### 커뮤니티 게시판별 경로

| 게시판 | 경로 | 저장 방식 |
| --- | --- | --- |
| 럭키트릭 팬 게시판 | `/community.html?board=lucky` | 공유 서버 |
| 옵시더스 팬 게시판 | `/community.html?board=obsidus` | 공유 서버 |
| SGIA 자유게시판 | `/community.html?board=staff&channel=free` | 공유 서버. 회사 생활·질문·일상. `channel` 생략 시 기본 게시판 |
| SGIA 혼잣말 | `/community.html?board=staff&channel=soliloquy` | 공유 서버. 세계관 밖 캐릭터·팀 덕질, 글당 태그 최대 5개 |

게시판을 지정하지 않거나 잘못 지정하면 럭키트릭 게시판을 표시합니다. 사내 게시판의 직원 전환은 세계관 체험용 화면 구분입니다. 혼잣말은 `&tag=member:jaein` 또는 `&tag=team:origin`처럼 인물·팀 하나로 필터링할 수 있습니다. 태그와 게시판은 작성·수정 시 지정하며, 기존 사내 글은 자유게시판에 유지됩니다.

팬 커뮤니티는 `board`에 `&feed=`를 붙여 구분합니다. 기본은 Highlight입니다.

| 탭 | URL 예시 | 내용 |
| --- | --- | --- |
| Highlight | `/community.html?board=lucky&feed=highlight` | 팬·아티스트 글을 좋아요 수, 최신순으로 정렬 |
| Fan | `/community.html?board=lucky&feed=fan` | 팬 게시글 최신순 |
| From LuckyTrick / Obsidus | `/community.html?board=obsidus&feed=artist` | 관리자가 멤버를 선택해 작성한 공식 게시글 |
| Comments by LuckyTrick / Obsidus | `/community.html?board=obsidus&feed=comments` | 아티스트가 쓴 댓글·답글 모음, 원문 대화로 연결 |

- **럭키트릭/엘리시안:** 핑크·진주빛 레트로 창과 입체 로고 카드.
- **옵시더스:** 블랙·브러시드 실버·골드 포인트.
- **전체 배경:** 팬 커뮤니티에 들어갈 때만 배경·헤더·내비게이션·푸터·공통 패널에 그룹 색상을 적용합니다. 다른 페이지나 사내 게시판으로 나가면 기존 라이트/다크 설정으로 복귀하고, 뒤로 가기로 재진입해도 해당 그룹 테마가 적용됩니다.
- **사진:** 글당 최대 2장. JPG·PNG·WebP 원본 20MB까지 자동 압축(최대 1600px, 필요 시 단계적 축소, 저장본 400KB 이하). HTTPS 이미지 링크도 가능. 첨부 미리보기의 ×로 개별 취소하며 관리자 작성·수정·프로필에도 적용됩니다. URL 방식은 원본 호스트의 이미지 제공에 의존합니다.
- **프로필:** 멤버 버튼 → 프로필 열람 → 관리자 프로필 편집 링크.
- **관리자:** 커뮤니티 맨 아래 작은 ‘관리자 로그인’ 링크 → 별도 API `/admin?board=lucky` 또는 `obsidus` → 인증 → 멤버 선택·공식 글 작성·프로필 변경·게시글/댓글 관리.
- **저장 범위:** 프로필 변경은 커뮤니티 멤버 소개·공식 글/댓글의 표시 이름/사진에 반영됩니다. 기획사 페이지의 세계관 상세 기록은 기존 코드 자료를 사용합니다.
- **작성 비밀번호:** 신규는 숫자 6자리. 기존 4자리 기록은 수정 시 6자리로 전환하며, 삭제에는 기존 비밀번호 사용.


## 3. 별도 제작 도구·기존 페이지

아래 페이지는 SGIA 공통 포털 라우터 밖에 있습니다. 이동하면 문서 전체가 바뀌므로 포털의 BGM·공통 화면이 그대로 유지되는 구조가 아닙니다.

| 페이지 | 경로 | 기능·연결 관계 |
| --- | --- | --- |
| [SGIA 트친소 카드](https://onlyunlimit.github.io/sgia.html) | `/sgia.html` | 소개·성향 등 입력, 테마 선택, PNG 저장. 통합 관제의 ‘각성자 등록증’ 링크로 연결 |
| [괴물 기록 카드](https://onlyunlimit.github.io/monster.html) | `/monster.html` | 기밀 기록물 형식 편집, 테마 선택, PNG 저장. 통합 관제의 괴물 기록 링크로 연결 |
| [팀·인물 기록 카드](https://onlyunlimit.github.io/team.html) | `/team.html` | 괴물·각성자·비각성자 및 센티넬·가이드 등 선택, 기록 편집, 테마 선택, PNG 저장 |
| [발췌 이미지 제작](https://onlyunlimit.github.io/quote.html) | `/quote.html` | 소설·로그 발췌 문구와 디자인 편집, PNG 저장. 상단 6개 메뉴에는 없음 |
| [다인 로그 제작](https://onlyunlimit.github.io/setlog.html) | `/setlog.html` | 2~5인 구성 선택, 크기 조절, 이미지 저장. 상단 6개 메뉴에는 없음 |
| [보담고 소개](https://onlyunlimit.github.io/bodam.html) | `/bodam.html` | 기존 보담고 소개와 학생증 제작 진입. 학교 바로가기에는 Coming Soon 문구가 남아 있음 |
| [보담고 홈페이지](https://onlyunlimit.github.io/school/index.html) | `/school/index.html` | 학교소개·공지·가정통신문·시간표·익명 게시 영역·갤러리·식단·화면 캡처. 익명 글은 브라우저 로컬 저장 |
| [보담고 학생증](https://onlyunlimit.github.io/idcard/index.html) | `/idcard/index.html` | 이름·생일·닉네임·사진 입력, 학생증 이미지 저장 |
| [차유성](https://onlyunlimit.github.io/character/cha.html) | `/character/cha.html` | 기존 캐릭터 소개 |
| [민도현](https://onlyunlimit.github.io/character/min.html) | `/character/min.html` | 기존 캐릭터 소개 |
| [남태의](https://onlyunlimit.github.io/character/nam.html) | `/character/nam.html` | 기존 캐릭터 소개 |
| [서이건](https://onlyunlimit.github.io/character/seo.html) | `/character/seo.html` | 기존 캐릭터 소개 |

## 4. 여러 페이지에 공통으로 붙는 기능

- **상단:** 한국어·영어·일본어·중국어, BGM, 직원 화면 전환, 라이트/다크, 모션 설정.
- **메뉴:** 통합 관제 / 조직·부서 / 엔터테인먼트 / 사건 기록실 / 세계관 안내서 / 커뮤니티.
- **하단:** 세계관 안내, 접속 로그·텍스트 내보내기, 개인정보 설명, 접속 대기실, 방문 집계.
- **업무 메신저:** 부서·크루 채널 선택, 메시지 입력, 최소화. 공유 커뮤니티와 별개의 로컬 기능.
- **인물 카드:** 클릭·Enter로 상세 기록, 좌우 스와이프·방향키로 뒤집기, 길게 누르기로 외부 캐릭터 링크 이동. 상세 기록과 과거 이미지는 페이지 이동이 아닌 문서 창으로 열림.
- **이미지:** 포털·인트로의 인물/UI 이미지는 CSS 배경으로 표시. 대체 텍스트를 유지하며 기본 이미지 길게 누르기·드래그를 제한. URL 자체를 비공개로 만드는 기능은 아님.
- **화면 전환:** SGIA 메뉴 안에서는 본문만 교체해 BGM을 유지. 이전 화면의 타이머·지도·이벤트는 정리.

## 5. 신고 등록부터 종결까지

```text
직원 화면 → 사건 기록실 → 신고서 작성
  → 주소·지역명 검색 후 결과 선택 ↔ 지도 클릭 / 핀 드래그 / 위·경도 적용
  → 지점 / 검색된 경계 / 직접 그린 구역 + 추정 반경(m) 선택
  → 지원 요청 팀: 비콘 / 실드 / 오리진 또는 직접 입력(최대 80자)
  → 신고 접수 → 긴급 알림 + 처리 대기 목록
  → 기록실 지도와 통합 관제 지도에 같은 좌표·구역 표시
  → 사건 선택 → 상세 문서와 위치 지도 열람
  → 종결 승인 → 처리 대기 목록·활성 지도에서 제거
  → ‘종결’ 필터 → 기록·당시 위치 확인 / 다시 열기
```

지도는 세계 범위로 축소·이동할 수 있습니다. 주소 검색은 OpenStreetMap/Nominatim을 사용하며 입력 완료 또는 검색 버튼으로 조회합니다. 핀 위치를 바꾸면 주소를 채우고, 주소가 없으면 좌표로 기록합니다. 검색 실패 시 직접 핀이나 좌표로 지정할 수 있습니다.

구역은 제공되는 실제 지형·행정 경계 또는 직접 그린 다각형으로 표시합니다. 검색된 경계는 해당 지역 전체이며, 추정 반경 값이 경계를 잘라내거나 원으로 그리지는 않습니다. 경계가 제공되지 않는 곳은 직접 구역을 그립니다. 기존 반복 바이탈 파형은 제거했고 주파수 조정에 반응하는 수신 표시를 유지합니다.

종결은 기록 삭제가 아닙니다. 재개하면 활성 목록과 지도에 다시 반영됩니다. 사건 데이터는 **현재 브라우저에만 저장**되며 다른 기기·사용자에게 실시간 공유되지 않습니다.

## 6. 저장 위치와 로그인 의미

| 대상 | 어디에 저장·처리되는가 | 구분할 점 |
| --- | --- | --- |
| 신고·좌표·구역·추정 반경·종결 상태 | 브라우저 localStorage의 `sgia.incidents` | 새로고침 후 유지. 브라우저 데이터 삭제 시 사라질 수 있음 |
| 업무 메신저 입력 | localStorage의 `sgia.chat.*` | 채널별 로컬 체험. 다른 방문자와 실시간 채팅하지 않음 |
| 테마·모션 등 설정 | 브라우저 저장소 | 해당 브라우저 설정 |
| 직원 화면 전환 | sessionStorage의 `sgia.staff` | 체험용 사원증 UI. 실제 직원 인증이 아님 |
| 접속·열람 활동 로그 | sessionStorage의 `sgia.activity` | 이용 중 활동 기록. 아래 개발 변경 이력과 다른 로그 |
| 게시글·댓글·답글·좋아요·사진·커뮤니티 멤버 프로필 | Cloudflare Workers API + D1 | 여러 방문자에게 공유되는 데이터 |
| 방문 통계 | 공유 API | 일별 네트워크 중복 제외 집계. 실제 사람 수와 동일하지 않음 |
| 지도·주소 검색·날씨 | OpenStreetMap / Nominatim / Open-Meteo | 지도·날씨는 외부 서비스. 사건·추적은 창작 세계관 체험 |
| 실제 관리자 | 별도 서버 인증·세션 | 포털 직원 전환 및 ORPÉ 키패드와 무관 |

관리자 화면 경로는 `assets/service-config.js`의 API 주소에 `/admin`을 붙입니다. 인증 정보는 문서에 적지 않습니다. 상세 운영은 [커뮤니티 운영 문서](docs/COMMUNITY-OPERATIONS.md)를 참고하세요.

## 7. 어느 파일을 수정하면 되는가

| 수정할 대상 | 주요 파일 |
| --- | --- |
| 페이지 연결·메뉴별 본문·호환 경로 | `assets/app.js` |
| 헤더·메뉴·공통 문서 창·로그인 연출·접속 로그 | `assets/runtime.js` |
| 통합 관제·신고·사건 지도·ORPÉ 추적 | `assets/monitor.js` |
| 주소 검색·핀·구역 선택 / GeoJSON 검증 | `assets/report-map.js`, `assets/geo-model.js`, `backend/geocode.js` |
| 사내 게시판 분류·인물/팀 태그 | `assets/staff-board.js`, `assets/staff-tags.js`, `backend/staff.js` |
| 사건 상세 기록·긴급 알림 | `assets/incident-ui.js` |
| 사건 데이터 검증·집계·시간표 계산 | `assets/model.js` |
| 봉인 파일·키패드·수신기·감청 단말 | `assets/hardware.js` |
| ORPÉ 증거 색인·문서 열람 / 추적 커서 | `assets/evidence.js` / `assets/forensics.js` |
| 부서·인물 카드·상세 프로필·메신저 | `assets/units.js`, `assets/personnel-design.js` |
| 공개 인물 데이터·이미지/로고 연결 | `assets/characters.js`, `assets/media.js` |
| 기획사 화면·화보 목록 | `assets/agencies.js`, `assets/agency-gallery.js` |
| 안내서·각성관·층별 계획도 | `assets/guide.js`, `assets/manual-visuals.js`, `assets/floor-plans.js` |
| 커뮤니티 화면·공개 API 설정 | `assets/community.js`, `assets/community-media.js`, `assets/fan-community.css`, `assets/service-config.js` |
| 공유 게시판 서버·DB 변경 | `backend/` |
| 번역 | `assets/i18n.js`, `assets/*-i18n.js` |
| 포털 스타일 | `assets/portal.css` → `assets/editorial.css` → `assets/game-ui.css` → `assets/forensic.css` 순서로 적용 |
| 인트로 / 배경 이미지 표시 처리 | `assets/intro.js`, `assets/intro.css` / `assets/image-surfaces.js` |
| BGM·짧은 합성 효과음 | `bgm/sgia.mp3`, `assets/audio.js` |
| 화면 이동 시 정리 | `assets/lifecycle.js` |
| 기존 제작 도구·보담고 페이지 | 해당 HTML 안의 스타일·스크립트 확인 |

포털 HTML은 공통 스타일과 스크립트를 불러오는 진입 파일입니다. 화면 내용은 주로 JS에서 만들기 때문에 HTML만 열면 실제 구성이 잘 보이지 않을 수 있습니다.

## 8. 실행·배포·문서 위치

- 로컬 실행: `npm run dev` → `http://localhost:4173`.
- 실행 중 수정 반영: `npm run build`로 `dist/`를 다시 만듭니다.
- 공개 파일 목록: `scripts/build.mjs`의 `publicEntries`.
- 홈페이지 배포: `scripts/publish-pages.py`. 소스 저장소와 홈페이지 배포 저장소가 분리되어 있습니다.
- `caveduck/`, `private/`, 서버 비밀값은 공개 빌드에서 제외됩니다.
- 이 문서·`AGENTS.md`·`CHANGELOG.md`도 현재 공개 빌드 대상이 아닙니다. 저장소/IDE에서 읽는 관리 문서입니다.

### 문서를 찾는 순서

1. **어디에 어떤 화면이 있나?** → 이 문서 `SITE_MAP.md`.
2. **최근 무엇이 바뀌었나?** → [CHANGELOG.md](CHANGELOG.md).
3. **다음 작업자는 어떤 규칙으로 수정하나?** → [AGENTS.md](AGENTS.md).
4. **실행 방법·프로젝트 개요는?** → [README.md](README.md).
5. **서버 운영·관리자는?** → [docs/COMMUNITY-OPERATIONS.md](docs/COMMUNITY-OPERATIONS.md).
6. **이미지·디자인 자산 출처는?** → [docs/ASSETS.md](docs/ASSETS.md).

새 페이지·별칭·저장 방식이 바뀌면 이 문서와 변경 이력을 함께 수정합니다.
