import { tr } from './i18n.js';
import { floorPlans } from './floor-plans.js';
import { listen, every, delay, onDispose, routeSignal } from './lifecycle.js';
import { $, $$, esc, state, heading, login, modal, toast } from './runtime.js';
export const floors = [
  ['8F', '중앙 통제 본부', '최고 의사결정 · 전투 투입 승인', true],
  ['7F', '정책·등급 심의실', '등급 판정 기준 · 정책 심의', true],
  ['6F', '대외 연구·위장 시설', '대외 연구 업무', false],
  ['5F', '일반 행정 / 대외 협력', '행정 업무 · 대외 협력', false],
  ['4F', '가이드 보호·교육 구역', '가이드 보호와 교육', false],
  ['3F', '가이드 관리국', '가이드 배치 및 관리', false],
  ['2F', '민원·등록·위장 로비', '비콘 사무실 · 각성자 등록', 'beacon'],
  ['1F', '보안 통제 로비', '출입 확인 · 보안 통제', false],
  ['B1', '센티넬 일상 관리 구역', '일상 생활 및 건강 관리', false],
  ['B2', '센티넬 훈련 구역', '전투 · 능력 제어 훈련', false],
  ['B3', '전술 시뮬레이션', '작전 훈련 및 시뮬레이션', false],
  ['B4', '오리진 생활 구역', '팀 오리진 생활 공간', 'origin'],
  ['B5', '센티넬 관리국 핵심', '배치 명령 · 위험도 관리', true],
  ['B6', '고위험 격리 구역', '통제 불가 개체의 격리', true],
  ['B7', '오리진 팀 전용 기록 구역', '제3의 각성자 기록', true],
  ['B8', '게이트 연구소', '게이트·잔류 파장 연구', true],
  ['B9', '극비 실험 구역', '접근 제한 연구', true],
  ['B10', '비공식 수용 구역', '비공식 수용 기록', true],
];
export function renderHeadquarters(target = $('#main')) {
  let selected = '2F';
  target.innerHTML =
    heading(
      'HEADQUARTERS / SPATIAL DIRECTORY',
      '각성관 층별 안내',
      '지상 8층 · 지하 10층의 통합 청사. 층을 선택해 시설과 배치 부서를 확인하십시오.',
    ) +
    `<div class="building-layout"><section class="building-section panel"><div class="section-title"><h2>청사 단면도</h2><span class="mono">SECTION A—A</span></div><div class="building-floor-list">${floors.map(([f, n, d, access]) => `<button class="floor-row" data-floor="${f}" data-underground="${f.startsWith('B')}" aria-pressed="${f === selected}"><b>${f}</b><span class="floor-slab"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span>${access === true && !state.staff ? '제한 시설' : n}</span>${typeof access === 'string' ? '<em>' + access.toUpperCase() + '</em>' : ''}</button>`).join('')}</div><p class="muted">FACILITY PLAN / NOT TO SCALE</p></section><aside><section class="floor-detail panel" id="floor-detail"></section><section class="panel assignment-note"><p class="eyebrow">UNIT ASSIGNMENTS</p><h2>부서 배치</h2><a href="beacon.html"><b>비콘</b><span>2F · 추적관리 사무실 ↗</span></a><a href="origin.html"><b>오리진</b><span>B4 생활 / B7 기록 ↗</span></a><a href="shield.html"><b>실드</b><span>각성관 · 전용 층 미지정 ↗</span></a><a href="entertainment.html"><b>헌터 크루</b><span>각성관 생활 · 전용 층 미지정 ↗</span></a><small>실드와 크루의 전용 층은 공개 설정에 지정되지 않았습니다. 훈련·행정 시설은 용도별로 표시합니다.</small></section></aside></div>`;
  function show() {
    const [f, n, d, a] = floors.find((x) => x[0] === selected),
      locked = a === true && !state.staff;
    $('#floor-detail').innerHTML =
      `<span class="eyebrow">FACILITY DIRECTORY</span><strong class="floor-number">${f}</strong><h2>${locked ? '접근 제한 시설' : n}</h2><div class="floor-plan detailed-plan" data-plan="${f}" aria-label="${f} 실내 배치도"><span class="plan-compass">N ↑</span><span class="plan-corridor"></span>${locked ? '<div class="plan-locked">RESTRICTED / ACCESS REQUIRED</div>' : floorPlans[f].map(([room, x, y, w, h], i) => `<button class="plan-room" data-room="${i}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"><small>${f}-${String(i + 1).padStart(2, '0')}</small><span>${esc(room)}</span><i></i></button>`).join('')}<span class="plan-scale">0 ━━━ 10m / SCHEMATIC</span></div><p>${locked ? '직원 채널에서 시설 분류를 열람할 수 있습니다.' : d}</p>${locked ? '<button id="floor-login" class="primary">직원 열람</button>' : typeof a === 'string' ? `<a class="primary" href="${a}.html">부서 페이지 ↗</a>` : '<span class="badge">SGIA FACILITY</span>'}`;
    $$('[data-room]').forEach(
      (b) =>
        (b.onclick = () => {
          const room = floorPlans[f][Number(b.dataset.room)][0];
          modal(
            f + ' / ' + room,
            '<div class="room-file"><p class="eyebrow">FACILITY ACCESS / ' +
              f +
              '</p><h3>' +
              esc(room) +
              '</h3><p>' +
              esc(d) +
              '</p><dl class="facts"><div><dt>출입 구분</dt><dd>' +
              (a === true ? 'LEVEL 4 · STAFF' : 'LEVEL 2 · ESCORT') +
              '</dd></div><div><dt>담당 구역</dt><dd>' +
              esc(n) +
              '</dd></div></dl><p>방문 시 해당 층 안내 데스크를 통해 담당자에게 연락하십시오.</p></div>',
          );
        }),
    );
    $('#floor-login')?.addEventListener('click', () => login(show));
    $$('[data-floor]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.floor === selected)),
    );
  }
  $$('[data-floor]').forEach(
    (b) =>
      (b.onclick = () => {
        selected = b.dataset.floor;
        show();
      }),
  );
  show();
  listen(document, 'sgia:viewer', () => {
    show();
    $$('[data-floor]').forEach((b) => {
      const f = floors.find((x) => x[0] === b.dataset.floor);
      b.children[2].textContent = f[3] === true && !state.staff ? '제한 시설' : f[1];
    });
  });
}
export const guideEntries = [
  [
    'world',
    '세계관',
    'WORLD ORIGIN',
    '수십 년 전, 원인 불명의 게이트 출현과 거의 동시에 센티넬의 최초 각성이 관측되었다. 사회는 이 힘을 보호·활용·통제하는 방향으로 발전했다.',
    '각성자는 센티넬과 가이드로 분류된다. 냄새나 외형으로는 구분할 수 없으며, 각성자 간 접촉 또는 검사를 통해 확인한다. 미각성자 정기 검사는 매년 6월 시행된다.',
  ],
  [
    'gate',
    '게이트',
    'GATE PHENOMENON',
    '다른 차원 또는 미확인 영역으로 연결되는 틈. 원형 포털, 거대한 문, 빛의 기둥 등 여러 형태로 나타난다.',
    '출현 전 동물의 이상 행동, 전자기기 오작동, 기상 이변이 관찰될 수 있다. 장시간 유지되면 현실 침식과 주변의 이계화가 발생한다. 내부에서는 괴물이 자연 발생하거나 환경 자체가 생명체처럼 작동한다.',
  ],
  [
    'sgia',
    '각성관',
    'SGIA ADMINISTRATION',
    '국가 각성자 통합관리청. 센티넬 폭주 예방, 가이드 배치와 보호, 각성자의 국가 활용, 불법 각성자·비인가 가이딩 통제를 수행한다.',
    '중앙 통제 본부는 정책·매칭·등급 기준과 전투 투입을 결정한다. 센티넬 관리국은 등급 판정, 정기 검사, 폭주 위험 예측과 임무 배치를 맡는다.',
  ],
  [
    'awakened',
    '각성자',
    'AWAKENED PERSONNEL',
    '이능력을 지닌 극소수의 인간. 모든 각성자는 의무 등록 대상이며 미등록 상태는 법률상 불법이다.',
    '일정 등급 이상은 이동과 직업에 제한을 받으며 임무 거부 시 처벌될 수 있다. 법적 국민의 지위와 국가 자산으로서의 취급 사이에 긴장이 존재한다.',
  ],
  [
    'hunter',
    '헌터',
    'HUNTER OPERATIONS',
    '작전에 투입되는 각성자 전력. 현장 직위는 요원·선임 요원·지휘 요원·특수 요원으로 구분된다.',
    '선임 요원은 소규모 팀을, 지휘 요원은 다수의 헌터를 통솔한다. 특수 요원은 S급 전담이며 관련 기록은 비공개다. 높은 등급은 더 강한 국가 통제를 수반한다.',
  ],
  [
    'sentinel',
    '센티넬',
    'SENTINEL',
    '초인적인 감각과 전투 능력을 얻는 대신 감각 과부하와 정신 붕괴의 위험을 안는 존재.',
    '일정 기간 가이딩을 받지 못하면 폭주 위험에 처한다. 폭주 범위와 위험은 등급에 따라 달라지며 정기적인 정신·감각 검사를 받는다.',
  ],
  [
    'guide',
    '가이드·가이딩',
    'GUIDE & GUIDING',
    '센티넬의 감각과 정신을 안정시키는 각성자. 가이딩은 가이드와 센티넬 사이에서만 효과가 있다.',
    '방사 가이딩은 접촉 없이 여러 센티넬에게 영향을 줄 수 있으나 안정까지 시간이 더 필요하다. 접촉 가이딩은 1대1로 수행한다. 과도한 가이딩은 가이드의 신체에 부담을 준다.',
  ],
  [
    'matching',
    '매칭',
    'COMPATIBILITY',
    '센티넬과 가이드의 상성을 매칭률로 측정한다. 높은 매칭률일수록 가이딩이 효과적이다.',
    '70% 이상은 안정적 파트너, 90% 이상은 희귀한 고적합 페어. 100%는 이론상 존재가 확인되지 않았다. 낮은 매칭률에서는 불쾌감과 거부 반응이 생길 수 있다.',
  ],
  [
    'pair',
    '페어',
    'PAIR REGISTRATION',
    '기관의 높은 매칭률 배정 또는 당사자 신청으로 맺는 파트너 관계.',
    '페어가 되면 스마트워치를 서로 등록하여 센티넬의 가이딩 수치를 공유할 수 있다. 페어 등록과 평생 귀속되는 각인은 서로 다른 개념이다.',
  ],
  [
    'imprint',
    '각인',
    'IMPRINT',
    '평생 각인 상대에게만 가이딩을 받을 수 있는 귀속 상태.',
    '기관에 신고하는 절차가 존재한다. 각인 후 가이딩 효율이 크게 증가하지만, 다른 상대에게 가이딩을 받으면 구토·어지럼증 등의 부작용이 발생한다. 드물게 일방적 각인도 일어난다.',
  ],
  [
    'third',
    '제3의 각성자',
    'THIRD AWAKENER',
    '기존 센티넬·가이드 분류 체계로 설명할 수 없는 존재.',
    '통과자는 게이트에 들어갔다가 인간의 형태로 돌아온 경우, 침식자는 정신·신체가 비가역적으로 변질된 경우, 귀환체는 내부의 무언가와 접촉한 뒤 돌아온 경우다. 오리진은 게이트 생환자 4명으로 구성된다.',
  ],
  [
    'teams',
    '팀별 운용',
    'DIRECTORATES',
    '오리진은 제3의 각성자와 변종 게이트, 비콘은 미등록 각성자 추적·신병 확보·불법 가이딩 단속, 실드는 고위험 게이트와 통제 불가 개체 대응을 담당한다.',
    '비콘은 회색, 실드는 백색을 대표색으로 사용한다. 실드는 괴물 갱생 프로젝트를 진행한다. 럭키트릭과 옵시더스는 별도의 기획사와 연계되는 헌터 크루이며 각성관에서 생활한다.',
  ],
  [
    'entertainment',
    '헌터 엔터테인먼트',
    'HUNTER CREWS',
    '럭키트릭은 앨리시안, 옵시더스는 헌터윈드 기획사와 연계되어 있다.',
    '헌터 활동에 아이돌 시장 규모의 팬덤이 형성된 체계다. 노래와 춤을 위한 그룹은 아니며 전투복·기술 연출·인터뷰·팬 소통이 기획된다. 대중의 지지와 인기는 수익 및 팀 등급 유지에 영향을 준다.',
  ],
  [
    'orpe',
    '오르페',
    'ORPÉ / EXTERNAL THREAT',
    '엄격한 등록·등급 체제에 반발한 탈영 센티넬, 미등록 가이드, 불법 연구자가 규합한 극단주의 범죄 집단.',
    '각성자의 자유와 해방을 표방하지만 비인가 가이딩 착취, 게이트 밀렵, 불법 인체 개조, 생체 병기 제조와 각성관 시스템 침입에 관여한다. SGIA 소속 부서가 아니다.',
  ],
];
const commands = [
  ['/게이트(C급)', 'C급 게이트 출현과 대응 임무'],
  ['/임무(비콘)', '지정 인물 또는 팀의 단독 임무'],
  ['/폭주(대상)', '지정 센티넬의 폭주 상태'],
  ['/단톡방(실드)', '팀 단톡방 HTML 출력'],
  ['/SGIA', '각성관 익명 커뮤니티'],
  ['/출력: 레빗 검색내역', '내용에 맞는 HTML 출력'],
  ['/OOC.txt: 에피소드 내용', '새 에피소드를 텍스트로 출력'],
  ['/OOC.html: 에피소드 내용', '새 에피소드를 HTML로 출력'],
  ['/메세지(셰퍼드): 어디신가요', '해당 인물에게 문자 전송'],
  ['/📟(셰퍼드): 위치 보고', '해당 인물의 단말기로 내용 전송'],
];
export function renderManual() {
  const initial = new URLSearchParams(location.search).get('q') || '';
  $('#main').innerHTML =
    heading(
      'PUBLIC REFERENCE / LOREBOOK',
      '세계관 안내서',
      '국가 각성자 통합관리청의 제도·분류·용어와 세계관 이용 명령어',
    ) +
    `<div class="manual-layout"><aside class="manual-index panel"><label>안내서 검색<input id="manual-search" type="search" placeholder="게이트, 각인, 등급…" value="${esc(initial)}"></label><nav>${guideEntries.map(([id, title]) => `<a href="#${id}">${title}</a>`).join('')}<a href="#ranks">등급 체계</a><a href="#commands">명령어</a></nav></aside><div class="manual-content">${guideEntries.map(([id, title, en, summary, body], i) => `<article class="guide-entry" id="${id}" data-search="${esc(title + ' ' + en + ' ' + summary + ' ' + body)}"><span class="guide-number">${String(i + 1).padStart(2, '0')}</span><div><p class="eyebrow">${en}</p><h2>${title}</h2><p class="guide-lead">${summary}</p><p>${body}</p>${id === 'matching' ? '<div class="match-bars"><span style="--level:70%">70% · 안정적 파트너</span><span style="--level:90%">90% · 희귀 고적합</span><span style="--level:100%">100% · 이론상 존재 불명</span></div>' : id === 'sgia' ? '<a href="headquarters.html">각성관 구조도 열람 ↗</a>' : id === 'teams' ? '<a href="departments.html">부서별 업무·시간표 열람 ↗</a>' : ''}</div></article>`).join('')}<section class="guide-entry" id="ranks" data-search="등급 체계 게이트 헌터 S A B C D E"><span class="guide-number">15</span><div><p class="eyebrow">CLASSIFICATION</p><h2>등급 체계</h2><div class="table-scroll"><table><thead><tr><th>등급</th><th>게이트 대응</th><th>헌터 관리</th></tr></thead><tbody>${[
      [
        'S',
        '인류 문명에 직접적 위협 · 세계 최고 전력 대응',
        '재난 병기 수준 · 이동·생활 전면 통제',
      ],
      ['A', '최정예 헌터 · 국제 협력', '고위험 전투 자산 · 가이드 필수'],
      ['B', '고급 헌터·특수 장비 · 주변 봉쇄', '전투 투입 · 전속 가이드 권장'],
      ['C', '숙련 헌터팀 · 전용 시설 관리', '비전투 임무 · 비상시 가이딩'],
      ['D', '일반 헌터팀 관리 가능', '미세 감각 각성 · 민간 생활·정기 검진'],
      ['E', '훈련용 · 24–48시간 내 자연 소멸', '일반 등급 언급은 있으나 상세 기준 미기재'],
    ]
      .map(
        (row) => `<tr>${row.map((x, i) => (i ? `<td>${x}</td>` : `<th>${x}</th>`)).join('')}</tr>`,
      )
      .join(
        '',
      )}</tbody></table></div><p class="muted">개별 인물의 SS·ERROR 표기는 원본 프로필의 별도 표기를 유지합니다.</p></div></section><section class="guide-entry" id="commands" data-search="명령어 OOC 메세지 단톡방 출력 게이트"><span class="guide-number">16</span><div><p class="eyebrow">CHARACTER CHAT COMMANDS</p><h2>명령어</h2><p>캐릭터 대화창에서 사용하는 명령어입니다. 홈페이지에서는 복사만 수행합니다.</p><div class="command-list">${commands.map(([cmd, d]) => `<button data-copy="${esc(cmd)}"><code>${esc(cmd)}</code><span>${d}</span><small>복사 ↗</small></button>`).join('')}</div><p>여러 명령어를 혼합할 수 있습니다. /html을 함께 입력하면 HTML 출력 반영을 요청할 수 있습니다.</p></div></section><p id="manual-empty" hidden>검색 결과가 없습니다.</p></div></div>`;
  const filter = () => {
    const q = $('#manual-search').value.trim().toLowerCase();
    $$('[data-search]').forEach(
      (e) => (e.hidden = !(e.dataset.search + ' ' + e.textContent).toLowerCase().includes(q)),
    );
    $('#manual-empty').hidden = $$('[data-search]').some((e) => !e.hidden);
  };
  $('#manual-search').oninput = filter;
  filter();
  $$('[data-copy]').forEach(
    (b) =>
      (b.onclick = async () => {
        try {
          await navigator.clipboard.writeText(b.dataset.copy);
          toast('명령어를 복사했습니다.');
        } catch {
          modal(
            '명령어 복사',
            `<pre>${esc(b.dataset.copy)}</pre><p>명령어를 선택해 복사해 주세요.</p>`,
          );
        }
      }),
  );
}
