import { characters } from './characters.js';
import { teams, activityFor, scheduleFor, koreaTime, formatMinutes } from './model.js';
import { teamLogos } from './media.js';
import { $, $$, esc, state, heading, modal, login, toast, read, save } from './runtime.js';
export const units = teams.filter((t) => ['origin', 'beacon', 'shield'].includes(t.id));
export const unitLocations = {
  origin: 'B4 · 오리진 생활 구역',
  beacon: '2F · 추적관리팀 사무실',
  shield: '각성관 · 전술대응팀 (전용 층 미지정)',
  lucky: '앨리시안 기획사 · 각성관 생활',
  obsidus: '헌터윈드 기획사 · 각성관 생활',
};
export function status(id, emergency = false) {
  const a = activityFor(id, koreaTime().minutes);
  const type = emergency
    ? 'emergency'
    : a.label === '취침'
      ? 'sleep'
      : a.active
        ? 'active'
        : /식사|자유/.test(a.label)
          ? 'rest'
          : 'off';
  return { ...a, type, label: emergency ? '비상 출동 · 모의 훈련' : a.label };
}
export function statusMarkup(id) {
  const a = status(id);
  return `<span class="unit-status" data-status="${a.type}" data-status-unit="${id}"><i></i>${a.label}</span>`;
}
export function renderDirectory(entertainment = false) {
  const list = entertainment ? teams.filter((t) => ['lucky', 'obsidus'].includes(t.id)) : units;
  $('#main').innerHTML =
    heading(
      entertainment ? 'HUNTER ENTERTAINMENT' : 'ORGANIZATION & OPERATIONS',
      entertainment ? '헌터 엔터테인먼트' : '조직·부서',
      entertainment
        ? '각성관과 기획사가 함께 운용하는 공식 헌터 크루.'
        : '임무와 전문성에 따라 구성된 국가 각성자 통합관리청의 현장 조직.',
    ) +
    `<div class="directory-grid">${list
      .map(
        (t, i) =>
          `<a href="${t.id}.html" class="directory-card" data-team="${t.id}"><span class="eyebrow">${entertainment ? (t.id === 'lucky' ? 'ELYSIAN' : 'HUNTERWIND') : 'DIRECTORATE 0' + (i + 1)}</span><div class="directory-logo">${teamLogos[t.id] ? `<img src="${teamLogos[t.id]}" alt="${t.name} 로고">` : `<strong>${t.en}</strong>`}</div><div class="directory-title"><h2>${t.name}<small>${t.department}</small></h2><span>↗</span></div><p>${t.staff}</p><div class="directory-meta"><span>${unitLocations[t.id]}</span>${statusMarkup(t.id)}</div><div class="avatar-stack">${characters
            .filter((c) => c.team === t.id)
            .map((c) => `<img src="${c.portrait}" alt="" loading="lazy">`)
            .join(
              '',
            )}<span>${characters.filter((c) => c.team === t.id).length} ${entertainment ? 'PROFILES' : 'PERSONNEL'}</span></div></a>`,
      )
      .join(
        '',
      )}</div>${entertainment ? '<a class="wide-link" href="community.html">FAN COMMUNITY <b>팬 커뮤니티 방문하기 ↗</b></a>' : '<div class="organization-note"><span class="eyebrow">CENTRAL ADMINISTRATION</span><h2>중앙 통제 본부</h2><p>정책 수립 · 매칭·등급 기준 · 전투 투입 승인 · 극비 프로젝트 관리</p><div class="org-branches"><span>센티넬 관리국</span><span>가이드 관리국</span><span>일반 행정·대외 협력</span></div><a href="headquarters.html">청사 내 부서 위치 확인 ↗</a></div>'}`;
}
export function detailImage(c) {
  return c.gallery?.find((g) => /서브|상세|현장|야근|역안/.test(g.label))?.url || c.portrait;
}
function dossier(c) {
  if (!state.staff) return login(() => dossier(c));
  const historic = (c.gallery || []).filter((g) => /과거/.test(g.label));
  modal(
    c.code,
    `<div class="dossier-layout"><div><img class="dossier-photo" src="${detailImage(c)}" alt="${esc(c.name)} 상세 프로필">${historic.length ? `<details class="past-record"><summary>과거 기록 이미지</summary>${historic.map((g) => `<figure><img src="${g.url}" alt="${esc(g.label)}" loading="lazy"><figcaption>${esc(g.label)}</figcaption></figure>`).join('')}</details>` : ''}</div><div><p class="eyebrow">${teams.find((t) => t.id === c.team).en} / PERSONNEL FILE</p><h3>${esc(c.name)}</h3><p>${esc(c.bio)}</p><dl class="facts">${[
      ['등급', c.rank],
      ['나이', c.age + '세'],
      ['역할', c.role],
      ['위치', c.location],
      ['능력', c.ability],
      ['외형', c.appearance],
      ['관찰 기록', c.notes],
    ]
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
      .join(
        '',
      )}</dl>${c.link ? `<a class="primary" href="${c.link}" target="_blank" rel="noopener noreferrer">캐릭터 접속 ↗</a>` : '<span class="coming-soon">COMING SOON</span>'}</div></div>`,
    c.team,
  );
}
export function renderCards(list, target) {
  target.innerHTML = list
    .map(
      (c, i) =>
        `<article class="person-card" data-team="${c.team}" data-character="${c.id}" style="--order:${i}"><div class="card-tilt"><button class="card-turner" aria-label="${esc(c.code)} 카드 뒤집기. 길게 누르면 캐릭터 접속" aria-pressed="false"><span class="card-rotator"><span class="card-face front" aria-hidden="false"><span class="id-card-head"><img src="assets/emblem.svg" alt=""><span>${c.team === 'orpe' ? 'CLASSIFIED / ORPÉ' : 'SGIA / ' + teams.find((t) => t.id === c.team).en}</span><span>${state.staff ? esc(c.rank) : 'PUBLIC'}</span></span><span class="id-photo"><img src="${c.portrait}" alt="${state.staff ? esc(c.name) : '신원 비공개'}" draggable="false" loading="lazy">${!state.staff ? '<span class="redaction-label">IDENTITY PROTECTED</span>' : ''}</span><span class="id-caption"><small>${state.staff ? esc(c.role) : 'PERSONNEL RECORD'}</small><strong class="card-code">${esc(c.code)}</strong><span>${state.staff ? esc(c.name) : '제한 열람 · 상세 정보 비공개'}</span></span><span class="id-card-foot"><span class="barcode"></span><small>SG / ${String(i + 1).padStart(3, '0')}</small><span>↔ FLIP</span></span><span class="hologram"></span></span><span class="card-face back" aria-hidden="true"><span class="eyebrow">${state.staff ? 'INTERNAL RECORD' : 'PUBLIC RECORD'}</span><img class="back-emblem" src="assets/emblem.svg" alt=""><strong>${esc(c.code)}</strong><p>${state.staff ? esc(c.role) : '개인 식별 정보는 직원 채널에서 열람하십시오.'}</p><dl><dt>소속</dt><dd>${teams.find((t) => t.id === c.team).name}</dd>${state.staff ? `<dt>능력</dt><dd>${esc(c.ability)}</dd>` : ''}</dl><span class="back-bottom">SGIA · AUTHORIZED RECORD</span></span></span><span class="hold-meter"></span></button></div><div class="card-actions"><button data-dossier="${c.id}">${state.staff ? '상세 프로필' : '직원 열람'} ↗</button>${c.link ? `<a href="${c.link}" target="_blank" rel="noopener noreferrer">캐릭터 접속</a>` : '<span class="coming-soon">COMING SOON</span>'}</div></article>`,
    )
    .join('');
  $$('[data-dossier]', target).forEach(
    (b) => (b.onclick = () => dossier(list.find((c) => c.id === b.dataset.dossier))),
  );
  $$('.person-card', target).forEach((card) => {
    const btn = $('.card-turner', card),
      c = list.find((c) => c.id === card.dataset.character);
    let start = null,
      timer,
      held = false,
      dragged = false,
      suppress = false;
    const clear = () => {
      clearTimeout(timer);
      card.classList.remove('holding');
    };
    const reset = () => {
      clear();
      start = null;
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    };
    const flip = () => {
      const on = card.classList.toggle('flipped');
      btn.setAttribute('aria-pressed', String(on));
      $('.front', card).setAttribute('aria-hidden', String(on));
      $('.back', card).setAttribute('aria-hidden', String(!on));
    };
    btn.onpointerdown = (e) => {
      if (!e.isPrimary || e.button !== 0) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      held = false;
      dragged = false;
      suppress = false;
      btn.setPointerCapture(e.pointerId);
      card.classList.add('holding');
      timer = setTimeout(() => {
        held = true;
        suppress = true;
        clear();
        if (c.link) location.assign(c.link);
        else toast('출시 준비 중인 캐릭터입니다.');
      }, 800);
    };
    btn.onpointermove = (e) => {
      const r = btn.getBoundingClientRect(),
        x = (e.clientX - r.left) / r.width,
        y = (e.clientY - r.top) / r.height;
      if (state.motion && e.pointerType === 'mouse') {
        card.style.setProperty('--tilt-x', `${(y - 0.5) * -9}deg`);
        card.style.setProperty('--tilt-y', `${(x - 0.5) * 12}deg`);
        card.style.setProperty('--shine-x', `${x * 100}%`);
        card.style.setProperty('--shine-y', `${y * 100}%`);
      }
      if (start && (Math.abs(e.clientX - start.x) > 10 || Math.abs(e.clientY - start.y) > 10)) {
        clear();
        dragged = true;
        suppress = true;
      }
    };
    btn.onpointerup = (e) => {
      if (
        start &&
        !held &&
        dragged &&
        Math.abs(e.clientX - start.x) > 40 &&
        Math.abs(e.clientX - start.x) > Math.abs(e.clientY - start.y)
      )
        flip();
      clear();
      start = null;
    };
    btn.onpointercancel = () => {
      suppress = true;
      reset();
    };
    btn.onlostpointercapture = () => {
      if (start) {
        suppress = true;
        reset();
      }
    };
    btn.onpointerleave = reset;
    btn.oncontextmenu = (e) => e.preventDefault();
    btn.onclick = (e) => {
      if (e.detail === 0 || !suppress) flip();
      suppress = false;
    };
  });
}
const chatLines = {
  origin: [
    '오늘 검사 순서 바뀌었다. 단말 확인해.',
    '연구소 네트워크는 건드리지 마.',
    '…이미 확인했는데.',
    '생활 구역 복귀하면 보고해.',
  ],
  beacon: [
    '금일 타겟 파일 갱신했습니다. 확인 바랍니다.',
    '현장 도착. 연락 안 받는데요.',
    '문 두드려 봤어?',
    '네. 민원 안 들어오게 하고 있습니다.',
  ],
  shield: [
    '차단선 점검 완료. 각자 위치 보고.',
    '교육 구역 특이사항 없습니다.',
    '오늘도 같이 식사합니까?',
    '예정대로 진행한다.',
  ],
  lucky: [
    '오늘 소통 일정 확인했어?',
    '응원 메시지 벌써 읽었지!',
    '다치지 말고 돌아오자.',
    '다 같이 확인하고 답장하자.',
  ],
  obsidus: [
    '장비 점검 먼저. 출동 시간 확인해.',
    '준비 끝났습니다.',
    '오늘 브리핑은 제가 할게요.',
    '무사 귀환하고 팬 채널에서 보자.',
  ],
};
export function messenger(id, container) {
  const people = characters.filter((c) => c.team === id);
  let loaded = false;
  container.innerHTML = `<button class="messenger-launch" aria-expanded="false"><span class="messenger-icon">↗</span><span><b>${teams.find((t) => t.id === id).name} 업무 채널</b><small>SGIA MESSENGER · ${people.length}명</small></span><span class="unread">${people.length}</span><span>⌄</span></button><div class="messenger-body" hidden><div class="messenger-caption">보안 채널 · 가상 인물의 자동 대화</div><div class="chat-log" role="log" aria-label="부서 대화"></div><form class="chat-form"><input aria-label="팀에 메시지" placeholder="메시지 입력" maxlength="200" required><button aria-label="메시지 보내기">↑</button></form><small class="muted">체험 대화 · 이 브라우저에 저장</small></div>`;
  const log = $('.chat-log', container),
    button = $('.messenger-launch', container);
  let pending = [];
  function append(p, text, self = false, time = koreaTime().clock.slice(0, 5), animate = true) {
    const el = document.createElement('div');
    el.className = 'chat-message' + (self ? ' self' : '') + (animate ? ' incoming' : '');
    el.innerHTML = `${!self ? `<img src="${p.portrait}" alt="">` : ''}<div><small>${self ? '나' : esc(p.name.split(' · ')[0])}</small><p>${esc(text)}</p><time>${esc(time)}</time></div>`;
    log.append(el);
    while (log.children.length > 40) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  }
  const stored = read('chat.' + id, []);
  const messages = Array.isArray(stored)
    ? stored
        .filter(
          (x) => typeof x.text === 'string' && x.text.length <= 200 && typeof x.time === 'string',
        )
        .slice(-30)
    : [];
  button.onclick = () => {
    if (!state.staff) return login(() => button.click());
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    $('.messenger-body', container).hidden = !open;
    if (open && !loaded) {
      loaded = true;
      chatLines[id].forEach((line, i) =>
        pending.push(
          setTimeout(
            () => {
              if (!state.staff) return;
              append(people[i % people.length], line);
            },
            state.motion ? i * 440 : 0,
          ),
        ),
      );
      messages.forEach((x) =>
        append(people.find((p) => p.id === x.person) || people[0], x.text, x.self, x.time, false),
      );
    }
  };
  $('.chat-form', container).onsubmit = (e) => {
    e.preventDefault();
    if (!state.staff) return;
    const input = $('input', e.target),
      text = input.value.trim();
    if (!text) return;
    const msg = { text, self: true, time: koreaTime().clock.slice(0, 5) };
    append(null, text, true, msg.time);
    messages.push(msg);
    input.value = '';
    save('chat.' + id, messages.slice(-30));
    pending.push(
      setTimeout(
        () => {
          if (!state.staff) return;
          const p = people[0],
            reply = {
              text: '메시지 확인. 일정에 맞춰 진행하겠습니다.',
              person: p.id,
              self: false,
              time: koreaTime().clock.slice(0, 5),
            };
          append(p, reply.text, false, reply.time);
          messages.push(reply);
          save('chat.' + id, messages.slice(-30));
        },
        state.motion ? 1100 : 100,
      ),
    );
  };
  document.addEventListener('sgia:viewer', () => {
    if (!state.staff) {
      pending.forEach(clearTimeout);
      $('.messenger-body', container).hidden = true;
      button.setAttribute('aria-expanded', 'false');
    }
  });
}
export function renderUnit(id) {
  const t = teams.find((t) => t.id === id),
    ent = ['lucky', 'obsidus'].includes(id);
  $('#main').innerHTML =
    heading(
      ent ? 'HUNTER ENTERTAINMENT / OFFICIAL CREW' : 'DIRECTORATE / ' + t.en,
      t.name,
      ent ? unitLocations[id] : t.department,
    ) +
    `<section class="unit-masthead" data-team="${id}"><div><span class="eyebrow">${ent ? 'OFFICIAL HUNTER CREW' : 'SENTINEL & GUIDE INTEGRATED ADMINISTRATION'}</span><h2>${t.en}</h2><p>${t.staff}</p><div class="unit-meta"><span>${unitLocations[id]}</span>${statusMarkup(id)}</div></div>${teamLogos[id] ? `<img src="${teamLogos[id]}" alt="${t.name} 로고">` : '<div class="beacon-mark">B<span>TRACK & REGISTER</span></div>'}</section><div class="unit-workspace"><section class="unit-schedule panel"><div class="section-title"><h2>오늘의 부서 일정</h2><span class="mono">KST / <span class="schedule-clock"></span></span></div><div class="day-track"></div><div class="schedule-slots"></div><p class="muted">비상 출동은 시간표와 별도로 표시합니다.${id === 'beacon' ? ' 보고 일정은 18:30까지이며 현장 상황에 따라 퇴근이 달라질 수 있습니다.' : ''}</p><button id="unit-emergency" class="subtle" data-staff-only>비상 출동 모의 훈련</button></section><section class="unit-communications"><div class="briefing panel"><div class="section-title"><h2>부서 브리핑</h2><span class="status-dot"></span></div><div id="unit-briefing" aria-live="polite"></div><button id="brief-refresh" class="subtle">새 연락 수신 ↻</button><small class="muted">시간표 기반 가상 연락</small></div><div id="unit-messenger" class="messenger panel"></div></section></div><div class="section-title personnel-heading"><div><p class="eyebrow">${ent ? 'CREW PROFILES' : 'PERSONNEL DIRECTORY'}</p><h2>${ent ? '크루 구성원' : '소속 요원'}</h2></div><span class="muted">클릭·스와이프하여 회전 / 0.8초 길게 눌러 접속</span></div><div id="character-grid" class="character-grid"></div>${ent ? `<a class="wide-link" href="community.html?board=${id}"><span>OFFICIAL FAN BOARD</span><b>${t.name} 팬 커뮤니티 ↗</b></a>` : ''}`;
  const list = characters.filter((c) => c.team === id);
  renderCards(list, $('#character-grid'));
  messenger(id, $('#unit-messenger'));
  let emergency = false,
    lastMinute = -1;
  function schedule() {
    const now = koreaTime();
    $('.schedule-clock').textContent = now.clock.slice(0, 5);
    if (now.minutes === lastMinute) return;
    lastMinute = now.minutes;
    const slots = scheduleFor(id);
    $('.day-track').innerHTML =
      slots
        .map(
          ([s, e, label, a]) =>
            `<span title="${formatMinutes(s)} ${label}" style="left:${s / 14.4}%;width:${(e - s) / 14.4}%" class="${a ? 'active' : 'rest'}"></span>`,
        )
        .join('') + `<i style="left:${now.minutes / 14.4}%" title="현재 시각"></i>`;
    $('.schedule-slots').innerHTML = slots
      .map(
        ([s, e, l]) =>
          `<div class="schedule-slot ${now.minutes >= s && now.minutes < e ? 'current' : ''}"><time>${formatMinutes(s)}—${formatMinutes(e)}</time><span>${l}</span>${now.minutes >= s && now.minutes < e ? '<i>NOW</i>' : ''}</div>`,
      )
      .join('');
  }
  let briefCount = 0;
  function brief() {
    const a = status(id, emergency),
      p = list[briefCount++ % list.length];
    const el = document.createElement('div');
    el.className = 'brief-message incoming';
    el.innerHTML = `<img src="${p.portrait}" alt=""><div><small>${state.staff ? esc(p.name.split(' · ')[0]) : t.name + ' 상황실'} <time>${koreaTime().clock.slice(0, 5)}</time></small><p>${emergency ? '비상 출동 훈련을 시작합니다. 담당 구역 확인 바랍니다.' : a.active ? a.label + ' 진행 중입니다. 단말 수신 상태 확인 바랍니다.' : a.label + '입니다. 다음 업무 전까지 연락망을 유지합니다.'}</p></div>`;
    $('#unit-briefing').prepend(el);
    while ($('#unit-briefing').children.length > 2) $('#unit-briefing').lastChild.remove();
  }
  $('#brief-refresh').onclick = brief;
  $('#unit-emergency').onclick = () => {
    emergency = !emergency;
    const a = status(id, emergency);
    const s = $('[data-status-unit]');
    s.dataset.status = a.type;
    s.innerHTML = '<i></i>' + a.label;
    $('#unit-emergency').textContent = emergency ? '모의 훈련 종료' : '비상 출동 모의 훈련';
    brief();
  };
  schedule();
  brief();
  setInterval(() => {
    if (!document.hidden && state.motion) brief();
  }, 30000);
  document.addEventListener('sgia:clock', schedule);
  document.addEventListener('sgia:viewer', () => {
    renderCards(list, $('#character-grid'));
    $$('[data-staff-only]').forEach((e) => (e.hidden = !state.staff));
  });
}
