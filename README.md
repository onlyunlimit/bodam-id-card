# onlyunlimit · SGIA

국가 각성자 통합관리청 창작 세계관 포털. **https://onlyunlimit.github.io/**

## 페이지

| 페이지 | 기능 |
| --- | --- |
| `index.html` | 중심축 고정 게이트 인트로·접속 효과음 |
| `portal.html` | 서울 위험 분포·기상·브리핑 + 각성관 18개 층별 실내 배치 |
| `departments.html` | 오리진·비콘·실드 조직 안내 |
| `origin.html`, `beacon.html`, `shield.html` | 부서별 카드·시간표·인물별 브리핑·독립 메신저 |
| `entertainment.html`, `lucky.html`, `obsidus.html` | 헌터 기획사와 크루·팬 채널 |
| `orpe.html` | 사건 기록실의 위협정보로 연결하는 호환 URL |
| `records.html` | 직접 신고·문서 열람·긴급 알림·튜닝 다이얼 + ORPÉ 추적 |
| `headquarters.html` | 통합 관제의 각성관 안내로 연결하는 호환 URL |
| `manual.html` | 로어북 기반 세계관·게이트·등급·가이딩·매칭·명령어 안내 |
| `community.html` | 팬·사내 게시판·댓글·좋아요·작성자 수정/삭제 |

## 실행·검사

Node.js 23 이상(서버 테스트는 내장 SQLite 사용), 브라우저 검사는 설치된 Chrome을 사용합니다.

```sh
npm ci
npm run dev
# http://localhost:4173
npm test
npm run test:browser
npm ci --prefix backend
node --test backend/tests/*.test.mjs
```

`npm run dev`는 공개 파일만 `dist/`로 빌드해 제공합니다. 수정 후 `npm run build`로 미리보기에 반영합니다. **저장소 루트를 웹 루트로 제공하지 마세요.**

## 화면·데이터

- 한국어·영어·일본어·중국어 버튼. 안내서·인물 자료·부서 메시지·시설 및 폼 UI를 번역하며, 명령어 문법과 이용자 글은 원문을 유지합니다. 인물은 한국어 이름 + 고정 영문 코드, 영어 모드에서는 코드만 표시합니다.
- 포털 메뉴는 공통 오디오를 유지한 채 본문만 전환합니다. 클릭·열람 활동 로그와 텍스트 내보내기를 제공합니다.

- 다크/라이트 두 가지 모드. 직원 채널은 별도 색상·사내망 표시와 상세 정보를 제공합니다.
- 신규 세션은 외부인 뷰어입니다. 체험용 사원증 로그인 상태는 같은 브라우저 세션의 페이지 간에 유지됩니다. 실제 인증이 아니며 공개 소개 데이터는 JS 파일에 포함됩니다.
- 메인 이미지는 카드, 서브·상세·현장 이미지는 상세 프로필에 표시합니다. 과거 이미지는 별도 접기/펴기 기록입니다. 임의 이미지 전환 탭은 없습니다.
- 카드 클릭/Enter로 상세 프로필, 좌우 스와이프/방향키로 앞뒤 회전, 0.8초 길게 누르면 캐릭터로 이동합니다. 여명은 COMING SOON입니다. `image.md` 원본 자체를 읽거나 배포하지 않습니다.
- 비콘: 회색·청회색 문서 카드 / 오리진: 보랏빛 홀로그램 / 실드: 백색 전술 카드 / ORPÉ: 다크·레드 기밀 스타일.
- 시간표는 한국 시각과 원본 일과표 기준입니다. 활동·휴식·취침·업무 외·모의 비상 출동을 색으로 구분합니다. 비콘의 개인 기상 훈련을 부서 근무로 계산하지 않습니다.
- 비콘은 2F, 오리진 생활 구역은 B4, 기록 구역은 B7입니다. 실드와 크루 전용 층은 설정에 없으므로 임의 배정하지 않습니다.
- 실제 서울 지도는 Leaflet 1.9.4 + OpenStreetMap입니다. 관측점과 추적 경로는 가상이며 실제 사건 위치가 아닙니다. 지도 타일은 방문자가 보는 범위만 요청하며 출처를 표시합니다.
- 날씨는 Open-Meteo 현재 관측과 시간별 예보입니다. 실패·오래된 관측은 연결 대기로 표시합니다. 시각은 Asia/Seoul 기준입니다.
- 사건·해결 도장·부서 메신저는 로컬 저장된 세계관 체험입니다. 팬/사내 커뮤니티의 글·댓글은 공유 Cloudflare D1에 저장합니다.
- 생성 이미지는 실버 SGIA 로고, 발자국, 단말 파일 탭, 주파수 다이얼, 커뮤니티 아이콘, 영문 도장에 적용합니다. 건물·배경 그림은 사용하지 않습니다. 배치도와 실시간 데이터는 조작 가능한 HTML/SVG입니다.

## 커뮤니티 운영·관리자

서버 코드는 `backend/`, 공개 API 주소와 Turnstile 사이트 키는 `assets/service-config.js`에 있습니다.
**관리자 인증은 체험 직원 로그인과 완전히 별개**입니다.

- 글·댓글: 사용자 지정 닉네임·4자리 PIN·서버 작성 시각
- 사내 게시판: 제목·닉네임·부서/괴물/직접 입력 지원
- PIN 원문 미저장, 서버 pepper + salt + PBKDF2 검증, 시도 제한·Turnstile
- 관리자는 숨김·복원·본문 삭제·암호화 IP 열람·차단/해제 가능
- 관리자 비밀 키는 **로컬 `private/admin/access.txt`**에만 보관
- 8시간 HttpOnly 관리자 세션, 출처 검증, 별도 관리 API
- 작성 IP 30일, 관리 감사 기록 90일, 방문 중복 키 3일 보관
- 방문 집계는 KST 일별 네트워크 중복 제외 합계로 실제 사람 수와 다를 수 있음

[유지 기간·비용·백업·관리자 운영 문서](docs/COMMUNITY-OPERATIONS.md)를 참고하세요.

## 비공개 자료

| 위치 | 처리 |
| --- | --- |
| `caveduck/` | 원본 MD·로어북·프롬프트, Git 무시·배포 제외 |
| `private/personal/` | 개인 `jy.html` 및 개인 이미지, 로컬 보존 |
| `private/admin/` | 관리자 키·서버 비밀값·DB 백업, Git 무시·배포 제외 |
| `backend/.dev.vars`, `.env*` | 로컬 서버 비밀 환경, Git 무시 |
| `dist/`, `node_modules/`, 테스트 출력 | 생성물, Git 무시 |

GitHub는 공개 저장소의 파일별 private 설정을 제공하지 않습니다. 빌드 허용 목록과 Git 무시 규칙으로 앞으로의 업로드를 제외합니다. **과거에 커밋된 개인 자료는 기존 소스 저장소 Git 기록에 남습니다.** 전용 홈페이지 저장소에는 공개 빌드 파일만 복사합니다.

`monster.html`, `sgia.html`, `team.html`은 기존 제작 도구이며 링크를 유지합니다. 보담 관련 기존 콘텐츠도 별도 페이지로 유지합니다.

## 배포

소스 작업 브랜치: `feat/onlyunlimit-sgia` (기존 저장소 `bodam-id-card`).
홈페이지 전용 저장소: `onlyunlimit/onlyunlimit.github.io`.

```sh
# 소스 변경사항 검사 후 커밋·푸시
python3 scripts/publish-pages.py --publish
```

게시 스크립트는 공개 허용 목록의 `dist/`만 복사합니다. 원본 MD·개인 자료·서버 소스·비밀값·과거 Git 이력을 복사하지 않습니다. `.github/workflows/pages.yml`은 기존 프로젝트 사이트용 수동 배포 설정입니다.

[프레임 생성 기록](docs/ASSETS.md) · [Leaflet 라이선스](https://github.com/Leaflet/Leaflet/blob/v1.9.4/LICENSE) · [OpenStreetMap 이용 정책](https://operations.osmfoundation.org/policies/tiles/)
