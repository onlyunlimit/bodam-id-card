# SGIA 커뮤니티 운영

## 구조

- 홈페이지: https://onlyunlimit.github.io/ (GitHub Pages)
- 공유 글·댓글·통계: Cloudflare Workers + D1, 본인 Cloudflare 계정
- 자동화 방지: Cloudflare Turnstile (허용 호스트: onlyunlimit.github.io)
- 원본 설정 MD, 개인 자료, 관리자 비밀 파일: 로컬 `private/` 또는 `caveduck/`, Git 및 공개 배포 제외
- 직원 채널은 세계관 체험용입니다. 누구나 전환할 수 있으며 실제 기밀 게시판이 아닙니다.
- 부서 메신저·모의 사건은 브라우저 로컬 저장입니다. 팬/사내 커뮤니티의 글·댓글은 공유 DB 저장입니다.

## 관리자

관리자 URL은 `assets/service-config.js`의 api 주소에 `/admin`을 붙입니다.
관리자 로그인 키는 로컬 `private/admin/access.txt`에만 있습니다. **공개 저장소에 올리지 마세요.**

- 무작위 384비트 비밀 키; 서버에는 SHA-256 검증값만 등록
- 관리자 인증 후 8시간 HttpOnly / Secure / SameSite=Strict 세션 쿠키
- 관리 요청마다 서버 세션 재검증; 변조한 직원 뷰어로 접근 불가
- IP 열람, 숨김/복원, 본문 삭제, IP 30일 차단/해제 지원
- IP 열람과 관리 동작은 90일 감사 기록
- 관리자 키 원문 및 비밀번호 검증값은 API 응답에 포함되지 않음
- 공유 PC 사용 후 반드시 로그아웃

키 교체: 안전한 로컬 환경에서 새 무작위 키를 생성하고 `ADMIN_KEY_HASH`를 교체한 후 D1 `sessions`를 비워 기존 세션을 폐기합니다. 게시물 암호화용 `IP_KEY`와 `PASSWORD_PEPPER`는 키 교체 계획 없이 바꾸지 마세요. 이전 IP 복호화와 작성 비밀번호 검증에 사용됩니다.

## 작성자 관리

- 글: 제목, 닉네임, 내용, 부서(사내 게시판), 4자리 PIN
- 댓글: 닉네임, 내용, 4자리 PIN
- 저장 전 운영·IP 보관 안내 동의와 Turnstile 확인
- PIN: 개별 salt + 서버 pepper HMAC + PBKDF2-SHA256 100,000회
- 수정/삭제 시 원래 PIN 확인, 새 PIN으로 교체하지 않음
- PIN 추측: 기록당 15분 5회, IP당 15분 10회로 제한
- 생성: IP당 분당 6회; 전체 쓰기: IP당 시간당 30회
- 조회: IP당 분당 120회
- PIN 분실 복구 기능 없음. 관리자에게 삭제 문의 가능
- 글 본문 5,000자, 댓글 1,000자, 글당 댓글 최대 100개
- 작성자/관리자가 글을 삭제하면 댓글 본문도 함께 제거
- 숨김은 복원 가능, 본문 삭제는 앱 내 복구 불가

## IP·보관 기간

작성 시 Cloudflare가 제공하는 실제 연결 IP만 사용합니다. 공개 요청 본문의 IP는 사용하지 않습니다.
IP는 AES-GCM으로 암호화하여 30일간 보관하며 관리자는 서버 복호화를 거쳐 열람합니다. 관리자 IP 조회도 감사 기록에 남습니다.
VPN·공유기·통신사 NAT 때문에 IP로 개인을 확정할 수는 없습니다. IP 차단은 같은 망의 정상 이용자에게도 영향을 줄 수 있습니다.

원본 게시물/댓글은 삭제까지 유지합니다. 제한된 D1 복구 기간 안에는 삭제 이전 상태가 존재할 수 있으므로, 삭제는 모든 백업에서 즉시 제거를 의미하지 않습니다. 운영자의 별도 내보내기 백업에도 동일한 보관 정책을 적용해야 합니다.

매일 18:17 UTC의 예약 작업이 IP(30일), 만료 세션·차단·요청 제한, 감사 기록(90일), 중복 방문 키(3일)를 정리합니다. API IP 조회도 30일 기한을 검사하므로 정리 작업 지연으로 공개 기간이 늘어나지 않습니다.

## 방문 집계

KST 날짜 + IP를 비밀키 HMAC으로 변환하여 일별 중복을 제외합니다. 방문자의 원본 IP를 방문 통계 DB에 저장하지 않습니다.
동일 네트워크는 하루 1회로, 누적은 일별 고유 네트워크 방문 수 합계로 계산합니다. 실제 사람 수가 아닙니다.
중복 확인 키는 3일 후 정리하고 일별·누적 집계는 유지합니다. 브라우저 세션에서 30분 이내 페이지 이동은 읽기 요청만 수행합니다.

## 유지·비용·백업

서비스를 삭제하지 않고 계정·요금제 제한 안에서 운영하면 글은 유지됩니다. 무기한 가용성 보장은 없습니다.
Time Travel 기본 복구 범위는 무료 플랜 7일, 유료 플랜 30일입니다.
현재 무료 D1은 일일 500만 행 읽기·10만 행 쓰기, 총 5GB 저장소를 포함합니다. Workers 무료는 일일 요청 한도가 별도로 적용됩니다. 요청 한 번이 여러 DB 행 작업을 수행하므로 방문 수와 DB 제한을 같은 수로 보지 마세요.
한도 초과 시 무료 서비스가 일시적으로 오류를 반환할 수 있으며, 유료 전환은 별도 결정이 필요합니다. 이 작업에서 유료 요금제로 전환하지 않습니다.

- [D1 가격·무료 한도](https://developers.cloudflare.com/d1/platform/pricing/)
- [Workers 가격·요청 한도](https://developers.cloudflare.com/workers/platform/pricing/)
- [D1 Time Travel 복구](https://developers.cloudflare.com/d1/reference/time-travel/)

대시보드의 Workers & Pages / D1에서 요청량·행 작업·용량을 확인합니다. 예기치 않은 증가 시 글쓰기를 일시 중단하고 원인을 확인하세요.

백업은 프로젝트 루트에서 아래 명령으로 생성하고, 비공개 암호화 저장소에 보관합니다. SQL에는 공개 글뿐 아니라 비밀번호 검증값과 암호화된 IP가 들어 있습니다.

```sh
cd backend
npx wrangler d1 export sgia-community --remote --output ../private/admin/community-backup.sql
```

복구는 운영 DB에 즉시 덮어쓰지 말고 별도 D1 DB에 가져와 검증한 후 전환합니다. `IP_KEY`와 `PASSWORD_PEPPER`의 안전한 백업도 필요합니다.

## 배포

```sh
npm ci
npm test
npm run test:browser
npm ci --prefix backend
node --test backend/tests/*.test.mjs
cd backend
npx wrangler d1 migrations apply sgia-community --remote
npx wrangler deploy
# 최초 설정/교체 시만, 비공개 로컬 JSON에서 서버 비밀값 등록
npx wrangler secret bulk ../private/admin/worker-secrets.json
```

API 주소와 공개 Turnstile 사이트 키만 `assets/service-config.js`에 기록합니다. Worker 비밀 키·관리자 키를 이 파일에 넣지 마세요.

홈페이지는 소스 커밋·푸시 후 `python3 scripts/publish-pages.py --publish`로 배포합니다. `backend/`는 GitHub Pages 빌드 allowlist에 포함되지 않습니다.

## 2026-09 인터페이스 업데이트

- 관리자 메뉴는 일반 화면에서 제거했습니다. 소유자 진입 방법은 비공개 `private/admin/access.txt`에 적었습니다. 진입 동작은 인증을 대신하지 않으며 서버 비밀 키와 세션 검사를 통과해야 합니다.
- 글 좋아요는 D1 `post_likes`에 저장합니다. 게시물별 IP HMAC으로 중복을 방지하므로 원본 IP를 저장하거나 서로 다른 글의 이용자를 직접 연결하지 않습니다. 공유망의 여러 이용자는 하나의 좋아요로 처리될 수 있습니다. 취소 가능하며 삭제된 글의 좋아요는 예약 작업에서 제거합니다. IP당 분당 30회 제한을 적용합니다.
- `0003_opening_posts.sql`은 운영자 요청으로 작성한 시작용 게시물 7개, 댓글 7개와 초기 반응입니다. 실제 이용자의 활동이나 IP를 만들어 넣지 않습니다. 이 기록에는 작성자 PIN이 없으며 인증된 관리자가 관리합니다. 마이그레이션은 고정 ID로 중복 실행해도 글을 복제하지 않습니다.
- 커뮤니티의 운영 안내 패널은 제거하고, 작성 폼의 짧은 IP 보관 동의와 하단 개인정보 설명만 유지합니다.
- 메뉴는 본문만 교체하는 탐색 구조입니다. 공유 오디오/헤더를 유지하며 본문 교체 시 이전 타이머·이벤트·지도·수신음을 정리합니다. 별도 등록증 제작 도구나 외부 캐릭터 사이트로 나가면 문서가 바뀝니다.
- 안내서, 인물 자료, 부서 메시지 및 UI 번역은 `assets/*i18n.js`에 있습니다. 게시물·댓글·직접 입력한 메신저 메시지는 자동 번역하지 않습니다. 명령어 문법은 원본 그대로 복사합니다.
- 18개 층의 실내 배치는 공개 층별 용도를 바탕으로 추가 구성한 화면용 계획도입니다. 원본에 확정되지 않은 실드·크루 전용 층을 새로 지정하지 않았습니다.
