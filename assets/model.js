export const teams = [
  {
    id: 'origin',
    name: '오리진',
    en: 'ORIGIN',
    department: '특수목적팀',
    color: '#9c9aff',
    description: '기록될 수 없는 존재들, 불가능한 임무의 마지막 선택.',
    staff:
      '오리진 게이트 생환자 4명으로 이루어진 특수목적팀. 제3의 각성자를 관리하며 변종 게이트에 대응합니다.',
  },
  {
    id: 'beacon',
    name: '비콘',
    en: 'BEACON',
    department: '추적관리팀',
    color: '#78c8d3',
    description: '보이지 않는 흔적을 따라, 모든 각성자를 제자리로.',
    staff:
      '미등록 각성자의 추적, 접촉, 등록과 신병 확보를 담당합니다. 가이드 중심의 팀에 현장 보호 전력을 배치합니다.',
  },
  {
    id: 'shield',
    name: '실드',
    en: 'SHIELD',
    department: '전술대응팀',
    color: '#dfb779',
    description: '재앙의 경계에서, 우리가 지켜야 할 것은 일상입니다.',
    staff:
      '원혈이 이끄는 최상위 전투팀. 게이트 대응과 함께 괴물 갱생 프로젝트의 보호 및 사회 적응 교육을 수행합니다.',
  },
  {
    id: 'lucky',
    name: '럭키트릭',
    en: 'LUCKY TRICK',
    department: '여성 헌터 크루',
    color: '#ed9fc0',
    description: '당신이 응원하는 빛이, 오늘의 도시를 지킵니다.',
    staff:
      '재인, 단조, 운새, 유진으로 구성된 여성 헌터 크루. 담당 연구원 케니와 함께 전투 및 대중 소통 활동을 수행합니다.',
  },
  {
    id: 'obsidus',
    name: '옵시더스',
    en: 'OBSIDUS',
    department: '남성 헌터 크루',
    color: '#8eafe7',
    description: '흔들리지 않는 방어, 빈틈없이 완성되는 전투.',
    staff:
      '차빈, 한호, 모현, 유환으로 구성된 남성 헌터 크루. 담당 연구원 에반이 장비 개발과 각성 상태 관리를 지원합니다.',
  },
  {
    id: 'orpe',
    name: '오르페',
    en: 'ORPÉ',
    department: '외부 감시 대상',
    color: '#fa8c85',
    description: '통제선 바깥의 움직임. 관찰을 중단하지 마십시오.',
    staff:
      'SGIA 소속이 아닌 불법 사설 단체. 관련 동향을 별도 기록합니다. 이곳의 활동 표시는 에이지의 알려진 일정 기준입니다.',
  },
];

const standard = [
  [360, 420, '기상 · 기본 점검', true],
  [420, 480, '아침 식사', false],
  [480, 660, '전투 · 능력 제어 훈련', true],
  [660, 750, '외부 임무 · 출동 대기', true],
  [750, 810, '점심 식사', false],
  [810, 930, '감각 안정 검사', true],
  [1080, 1140, '저녁 식사', false],
];
export function scheduleFor(id) {
  if (id === 'beacon')
    return [
      [540, 600, '타겟 정보 브리핑', true],
      [600, 720, '정보 조사 · 외근', true],
      [720, 780, '점심 식사', false],
      [780, 1050, '추적 · 대상 접촉', true],
      [1050, 1110, '일일 보고서 작성', true],
    ];
  if (id === 'orpe')
    return [
      [720, 780, '출근 · 임무 확인', true],
      [780, 1050, '자유 활동', false],
      [1050, 1110, '행동 · 임무', true],
    ];
  return standard.map((slot) =>
    slot[0] !== 810
      ? slot
      : [
          810,
          930,
          id === 'shield'
            ? '교육 · 사회 적응'
            : ['lucky', 'obsidus'].includes(id)
              ? '팬 소통 · 개인 스케줄'
              : '감각 안정 검사',
          true,
        ],
  );
}
export function koreaTime(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}.${parts.month}.${parts.day}`,
    clock: `${parts.hour}:${parts.minute}:${parts.second}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}
export function activityFor(id, minutes) {
  const slot = scheduleFor(id).find(([start, end]) => minutes >= start && minutes < end);
  if (slot) return { label: slot[2], active: slot[3], start: slot[0], end: slot[1] };
  return {
    label:
      id === 'beacon'
        ? '업무 외 시간'
        : id === 'orpe'
          ? '관측 일정 없음'
          : minutes >= 1260 || minutes < 360
            ? '취침'
            : '자유시간',
    active: false,
  };
}
export function formatMinutes(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}
export const incidentTypes = ['게이트', '괴물', '사건 발생', '미등록 각성자', '테러'];
const locations = [
  '성수동 폐공장',
  '강남 지하 연결로',
  '용산 철도 구역',
  '마포 한강변',
  '종로 상업 지구',
  '서초 연구 시설',
  '송파 물류 구역',
  '은평 산림 경계',
];
const descriptions = {
  게이트: [
    '공간 균열과 전자기 이상 감지. 현장 통제선 설치 요청.',
    '미확인 차원 경계 형성. 인근 주민 대피 및 등급 측정 진행.',
  ],
  괴물: [
    '경계 구역 밖에서 미확인 생명체 목격. 추적 장비 배치.',
    '야간 감지기에 비정상 생체 반응 기록. 인근 순찰 강화.',
  ],
  '사건 발생': [
    '각성 파장 급상승으로 시설 일부 정전. 현장 안전 점검 요청.',
    '관리 시설 내 경보 오작동. 잔류 마력과 장비 손상 조사.',
  ],
  '미등록 각성자': [
    '정기 검사 미응답자에게 각성 반응 확인. 비콘 접촉 요청.',
    '민간 지역에서 미등록 파장 포착. 담당 요원 배정 대기.',
  ],
  테러: [
    '불법 단체의 장비 탈취 정황 발견. 관련 동선 조사.',
    '마력 증폭 장치 설치 의심 신고. 현장 봉쇄 및 제거반 요청.',
  ],
};
export function generateIncident(index, random = Math.random, now = Date.now()) {
  const pick = (list) => list[Math.floor(random() * list.length)];
  const type = incidentTypes[index % incidentTypes.length];
  return {
    id: `SG-${now.toString(36).toUpperCase()}-${index}`,
    type,
    location: pick(locations),
    grade: pick(['D', 'C', 'C', 'B', 'B', 'A']),
    detail: pick(descriptions[type]),
    created: now,
    resolvedAt: null,
    x: 22 + random() * 56,
    y: 20 + random() * 58,
  };
}
export function isIncident(item) {
  return (
    item &&
    typeof item.id === 'string' &&
    item.id.length < 80 &&
    incidentTypes.includes(item.type) &&
    (locations.includes(item.location) ||
      (item.manual === true &&
        typeof item.location === 'string' &&
        item.location.trim().length > 0 &&
        item.location.length <= 140)) &&
    (item.coordinates === undefined ||
      (Array.isArray(item.coordinates) &&
        item.coordinates.length === 2 &&
        item.coordinates.every(Number.isFinite) &&
        Math.abs(item.coordinates[0]) <= 90 &&
        Math.abs(item.coordinates[1]) <= 180)) &&
    ['D', 'C', 'B', 'A'].includes(item.grade) &&
    (descriptions[item.type].includes(item.detail) ||
      (item.manual === true &&
        typeof item.detail === 'string' &&
        item.detail.length >= 5 &&
        item.detail.length <= 1500 &&
        typeof item.reporter === 'string' &&
        item.reporter.length <= 40 &&
        typeof item.zone === 'string' &&
        item.zone.length <= 80 &&
        ['오리진', '비콘', '실드'].includes(item.support) &&
        Number.isInteger(item.personnel) &&
        item.personnel >= 1 &&
        item.personnel <= 30 &&
        typeof item.requests === 'string' &&
        item.requests.length <= 500 &&
        Number.isFinite(item.occurredAt))) &&
    Number.isFinite(item.created) &&
    (item.resolvedAt === null || Number.isFinite(item.resolvedAt)) &&
    Number.isFinite(item.x) &&
    item.x >= 0 &&
    item.x <= 100 &&
    Number.isFinite(item.y) &&
    item.y >= 0 &&
    item.y <= 100
  );
}
export function tally(incidents) {
  return {
    total: incidents.length,
    open: incidents.filter((x) => !x.resolvedAt).length,
    resolved: incidents.filter((x) => x.resolvedAt).length,
    gates: incidents.filter((x) => x.type === '게이트' && !x.resolvedAt).length,
    monsters: incidents.filter((x) => x.type === '괴물' && !x.resolvedAt).length,
  };
}
