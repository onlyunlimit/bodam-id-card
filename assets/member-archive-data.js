// Personnel-file extras. Facts are limited to the published character profiles.
// Memo kinds: sticky (rare paper note), red / blue (ink in the margin), pencil.
const cdn = (path) => `https://cdn.caveduck.io/cdn-cgi/image/dpr=2,f=auto,w=800/${path}`;

export const zionCards = [
  ['charim-1920x/4182a0e8-4685-46c8-8360-24f7998425df?v=ed5528', 'Bloom 100K Milestone'],
  ['charim-1920x/a934b5c5-8e50-4ee8-b975-9f207b4a8929?v=eabd74', 'Caveduck 20K Chronicle'],
  ['charim-1920x/18e4cb37-e2a4-40c0-9b23-bad8e0a8bbe3?v=8baf22', 'Caveduck 30K Tribute'],
  ['charim-standard/13b4ac68-37ae-4582-90c2-74ec39897ec4?v=396ff1', 'White Day · 40K Edition'],
  ['charim-standard/43fe47e0-f8c7-4088-aecc-32948f89d0c1?v=f4897b', '60K & Bloom 700K'],
  ['charim-standard/b288e5cd-47d5-4c75-9fb0-93cf3601d790?v=df1ae6', 'Bloom 800K Prestige'],
  ['charim-standard/82d5eb00-5190-4513-aa3c-da55d318d893?v=0349ed', 'Caveduck 70K Edition'],
  ['charim-standard/18d0de65-ac9c-469a-af32-6f34f0a1bb08?v=86cbd9', 'Bloom 900K Vanguard'],
  ['charim-standard/475b7f2a-c7f9-4fc7-a1e4-2647ceedf869?v=1a7338', 'Caveduck 80K Record'],
  ['charim-standard/8d1c2743-2770-439d-93fb-423d7924d53a?v=ee4c6d', 'Bloom 100K Collector’s Plate'],
  ['charim-standard/af616fba-f286-4874-99a5-63f39c9d70cc?v=180789', 'Caveduck 90K Commemoration'],
  ['charim-standard/d2bcaa97-7e20-4239-ac8b-85b53e37103e?v=7baaf7', 'Caveduck 100K Grand Milestone'],
  ['charim-standard/3217d049-70ac-4a0a-afca-47e26080adde?v=da2507', 'Caveduck 110K Legacy'],
  ['charim/fd2e3c16-cc62-476f-a71f-4c493980ecfc?v=f8f3d9', 'June 18 — Birthday Edition'],
  ['charim-standard/dc0aba47-3b90-4012-a7fd-2d0f63da4bbb?v=25082f', 'Caveduck 120K Sovereign'],
  ['charim-standard/9e026184-02bf-4d80-a0c4-99734a134f9e?v=e6259e', 'Autumn Moon — Chuseok'],
  ['charim-standard/7c4066c5-66a9-4d27-accb-99cdd95510fa?v=def656', 'All Hallows’ Eve — Nocturne'],
].map(([path, title]) => ({ url: cdn(path), title }));

// English back-of-card titles for the general profile gallery.
export function galleryTitle(label = '') {
  if (/역안/.test(label)) return 'Inverted Eye Edition';
  if (/과거|전\)/.test(label)) return 'Before the Gate — Archive';
  if (/수감/.test(label)) return 'Confinement Record';
  if (/현장/.test(label)) return 'Field Dispatch Edition';
  if (/야근|일상/.test(label)) return 'After Hours Edition';
  if (/상세/.test(label)) return 'Close Study Edition';
  return 'Official Portrait Edition';
}

export const memberFacts = {
  jion: {
    birthday: '06/18',
    build: '근접 파괴형 상체 발달',
    directive: '근접 섬멸 담당. 괴물은 죽인다는 신념을 가진 위험한 전력 헌터.',
    observation: ['주황빛이 도는 헝클어진 적발과 날카로운 붉은 적안. 전투에 방해된다는 이유로 셔츠 단추와 넥타이를 늘 대충 풀어헤치고 다닌다. 극한의 신체 강화 및 비정상적 회복력을 보유하며, ', '폭주 시 흰자가 붉게 물들고 노란 십자 동공이 드러나는 역안', '이 발동한다.'],
    warning: '※ 본인 열람 절대 금지',
    notes: [
      ['sticky', '본인이 잘생긴 걸 전혀 모름. 거울을 아예 안 보고 사는 건지, 얼굴 낭비가 심함.', '기록관 K'],
      ['blue', '쌍둥이 형 데인한테 죽어도 ‘형’이라고 안 부름. 다 반말인데 사고 치면 갑자기 존댓말 씀 ㅋㅋ', '실드 팀원 메모'],
      ['red', '괴물은 다 죽여야 한다면서 정작 본인이 괴물 취급받으면 눈 돌아감. 건드리지 말 것.', '정신감정 소견 여백'],
      ['pencil', '예쁜 얼굴이랑 애교에 극도로 약함!! 얼굴 빨개져서 버럭 소리 지를 때가 제일 웃김.', '익명 제보'],
    ],
    seed: [
      ['실드 팀원 A', '오늘도 훈련장 벽 한 면 다 부숴먹고 시치미 떼는 중... 수리비 청구서 또 올라옵니다.', 'hand', '#F4F1EA', 0.08, 0.1],
      ['전담 가이드', '가이딩 받을 때 귀 끝까지 빨개지면서 괜히 화내는 거 다 티 나요, 지온 씨.', 'serif', '#F2A7A7', 0.42, 0.42],
      ['SGIA 기록관', 'LEVEL A+ ARCHIVE ACCESS VERIFIED. 현장 복귀 전 셔츠 단추 정돈 요망.', 'mono', '#A9C8F0', 0.12, 0.78],
    ],
  },
  wonhyeol: {
    birthday: '08/21',
    directive: '게이트를 닫는 자. 단독 토벌이 가능한 최상위 센티넬.',
    highlight: '게이트 개방 · 봉인 · 안정화',
    notes: [
      ['red', '역안 발동 = 전장 강제 종료. 현장 정리 인력 미리 대기시킬 것.', '작전과 메모'],
      ['pencil', '말수 적음. 대답 안 해도 다 듣고 있음. 무뚝뚝한데 책임감은 제일 셈.', '실드 팀원'],
      ['blue', '갱생 프로젝트 교관 겸 보호자. 교육 일지는 생각보다 꼼꼼하게 씀.', '프로젝트 담당관'],
    ],
  },
  dain: {
    birthday: '06/18',
    directive: '실드의 회복과 감정 안정을 책임지는 완충 전력.',
    highlight: '생명 회복 · 감정 안정 파동',
    notes: [
      ['blue', '지온의 쌍둥이 형. 동생이 형이라고 안 불러도 별로 개의치 않는 눈치.', '기록관 K'],
      ['pencil', '서두르지 않음. 상대의 속도를 먼저 맞춰 줌. 불안한 상황일수록 더 차분해짐.', '의무실'],
      ['sticky', '팀 분위기 가라앉으면 일단 데인부터 찾을 것.', '실드 내부 메모'],
    ],
  },
  sando: {
    birthday: '01/09',
    directive: '모든 전투를 확률로 읽는 실드의 분석가.',
    highlight: '전투 예측 · 위험 확률 계산',
    notes: [
      ['red', '원혈한테도 할 말은 다 함. 직설적이라 회의가 짧아짐 (좋은 의미로).', '작전 회의록 여백'],
      ['pencil', '냉소적인 말투 = 걱정하고 있다는 뜻. 오래된 전우들은 다 앎.', '실드 팀원'],
      ['blue', '괴물 행동 패턴 예측 적중률 높음. 보고서 숫자는 그대로 믿어도 됨.', '분석관'],
    ],
  },
  baekjin: {
    birthday: '12/12',
    directive: '두려움을 안고도 정확히 조준하는 신입 저격 요원.',
    highlight: '정밀 저격 · 후방 지원',
    notes: [
      ['blue', '모두에게 존댓말. 선배들이 반말 하라고 해도 계속 존댓말 씀.', '실드 팀원'],
      ['pencil', '정장 대신 검은 훈련복. 복장 규정 문의 → 팀장 승인 완료.', '총무과'],
      ['sticky', '호기심 많음!! 질문 리스트 들고 다님.', '교육 담당'],
    ],
  },
  ibex: {
    location: 'B4 오리진 생활 구역 · 3F 가이드 관리국',
    directive: '게이트에서 돌아온 네 명을 이끄는 원칙주의자.',
    highlight: '특수 추적 · 고위험 게이트 탐사',
    notes: [
      ['pencil', '규칙적인 생활, 조용한 장소 선호. 일정 바꾸려면 하루 전에 말할 것.', '오리진 담당관'],
      ['red', '뿔 관리는 본인이 직접. 손대지 말 것.', '의무실 메모'],
      ['blue', '침착함. 팀원 셋이 동시에 사고 쳐도 목소리 안 높임.', '기록관 K'],
    ],
  },
  slun: {
    location: 'B6 고위험 격리 구역',
    directive: '분류 체계로 설명되지 않는 귀환자.',
    highlight: '센티넬 파장 간섭 · 하반신 변이',
    notes: [
      ['red', '평온한 태도 ≠ 안전. 격리 기준 그대로 유지.', '격리 관리관'],
      ['pencil', '사흘 만에 귀환. 생존 불가 판정 게이트였음. 기록 재확인 필요.', '게이트 조사과'],
      ['blue', '정기 감각 검사 + 정신의학과 검진 대상. 일정 누락 주의.', '의무실'],
    ],
  },
  jaeshin: {
    location: 'B4 오리진 생활 구역',
    directive: '보이지 않는 실로 퇴로를 막는 귀환체.',
    highlight: '거미줄 함정 · 매개체 인형 조종',
    notes: [
      ['pencil', '휴식 시간에 천장에 있음. 놀라지 말 것. 진짜로.', '오리진 생활 구역'],
      ['blue', '실뜨기, 인형 만들기 좋아함. 책상 위 인형은 함부로 치우지 말기.', '총무과'],
      ['red', '기억이 파편적. 과거 질문은 짧게.', '상담 기록 여백'],
    ],
  },
  bug: {
    location: 'B8 게이트 연구소',
    directive: '세계를 데이터처럼 읽는 오리진의 간섭자.',
    highlight: '데이터 실체화 · 공간 좌표 수정',
    notes: [
      ['red', '회로 문양 보이면 능력 과사용 신호. 바로 휴식시킬 것.', '오리진 담당관'],
      ['pencil', '말수 적음, 무심함. 전산실 장비 상태는 제일 먼저 알아챔.', '전산실'],
      ['sticky', '전 컴공과. 노트북 빌려달라고 하면 일단 의심부터.', '기록관 K'],
    ],
  },
  binjo: {
    directive: '차분한 지시로 현장을 통솔하는 비콘의 팀장.',
    highlight: '원거리 가이딩',
    notes: [
      ['blue', '개인 훈련 06:00, 정규 업무 09:00. 한 번도 늦은 적 없음.', '비콘 근태 기록'],
      ['pencil', '백안으로 목표 포착 → 가이딩 확산. 극소수만 가능.', '가이드 관리국'],
      ['red', '지시는 조용하지만 번복 없음.', '비콘 팀원'],
    ],
  },
  levit: {
    height: '196cm',
    directive: '게이트 너머의 괴이를 불러 전장을 뒤집는 비콘의 전력.',
    highlight: '괴이 소환',
    notes: [
      ['red', '정신 상태에 따라 소환 규모 달라짐. 컨디션 체크 먼저!!', '비콘 현장 메모'],
      ['pencil', '예측 불가. 그래도 가이드 보호 임무는 끝까지 함.', '비콘 팀원'],
      ['blue', '소환된 괴이는 토벌 후 사라짐. 잔존 보고 없음 확인.', '게이트 조사과'],
    ],
  },
  shepherd: {
    directive: '불평은 먼저, 출동은 더 먼저.',
    highlight: '동물적 감각을 통한 추적',
    notes: [
      ['pencil', '투덜투덜하면서 제일 먼저 출동함. 특전사 출신.', '비콘 팀원'],
      ['red', '감각 과활성 → 어지럼증 / 신경 과민. 소음 많은 현장 주의.', '의무실'],
      ['blue', '약자 보호가 최우선. 미세한 흔적 절대 안 놓침.', '추적관리팀 기록'],
    ],
  },
  seowon: {
    directive: '부드러운 미소로 경계를 낮추는 현장 요원.',
    highlight: '방사 가이딩 · 대상 접촉',
    notes: [
      ['blue', '민간 접촉 때문에 회색 수트 고정. 단정함 유지.', '비콘 현장 메모'],
      ['pencil', '최소 접촉, 방사 가이딩 선호. 대화로 먼저 풀어보는 타입.', '가이드 관리국'],
      ['sticky', '야근 많음. 커피 사다 주면 고마워함.', '익명 제보'],
    ],
  },
  yeomyeong: {
    directive: '특정 사건에서만 영매 능력을 발휘하는 비콘 요원.',
    highlight: '영매 · 실종 및 살인 사건 조사',
    notes: [
      ['pencil', '조용하고 순함. 평소엔 일반 업무 담당.', '비콘 팀원'],
      ['red', '체력 약함. 장시간 현장 투입 시 교대 인원 배치.', '의무실'],
      ['blue', '정식 프로필 공개 예정. 기록 추가 대기.', '기록관 K'],
    ],
  },
  poker: {
    directive: '판을 읽고 기물을 배치하는 블랙잭 팀장.',
    highlight: '53장의 카드 기물을 실체화하는 데크',
    notes: [
      ['red', '기물 배치 = 작전 지시. 카드 순서 바뀌면 바로 물어볼 것.', '블랙잭 작전 메모'],
      ['pencil', '고위험 현장 돌입·회수 지휘. 판단이 빠름.', '대테러부대 기록'],
    ],
  },
  dealer: { directive: '팀원 간 생각을 잇는 작전 중개.', highlight: '팀원 간 생각을 공유하는 링크 연결', notes: [['pencil', '링크는 임무 중에만. 외형 정보 비공개 유지.', '블랙잭 작전 메모']] },
  rear: { directive: '영역을 선언하고 후면을 지키는 리어가드.', highlight: 'Crown · 영역 선언과 침입 감지', notes: [['pencil', '후퇴 시간 확보 담당. 외형 정보 비공개 유지.', '블랙잭 작전 메모']] },
  panden: { directive: '시야 너머를 탐지하는 관측 담당.', highlight: '공간 너머의 인원과 특징 탐지', notes: [['red', '능력 소모 따라 탐지 정확도 변동. 보고 시 소모량 같이 기록.', '블랙잭 작전 메모']] },
  siso: {
    directive: '빠루로 진입로를 열고 인질을 회수하는 막내.',
    highlight: '야간 시야 · 기동 · 돌입과 회수',
    notes: [
      ['pencil', '검은 고양이 출신 수인. 야간 시야 좋음.', '블랙잭 작전 메모'],
      ['blue', '진입로 개방 → 인질 회수. 동선 제일 빠름.', '대테러부대 기록'],
    ],
  },
};
