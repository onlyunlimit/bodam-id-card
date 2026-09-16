import { $, esc, modal, state, logActivity } from './runtime.js';
import { koreaTime } from './model.js';
import { delay, onDispose } from './lifecycle.js';
import { chirp } from './audio.js';
import { tr } from './i18n.js';
export function emergencyAlert(record) {
  $('#emergency-stack')?.remove();
  const stack = document.createElement('aside');
  stack.id = 'emergency-stack';
  stack.className = 'emergency-stack';
  stack.setAttribute('aria-label', '긴급 수신 알림');
  document.body.append(stack);
  onDispose(() => stack.remove());
  const messages = [
    ['PRIORITY ' + record.grade, record.location],
    ['DISPATCH REQUEST', record.support || '중앙 통제 본부'],
    ['SIGNAL RECEIVED', record.id],
  ];
  messages.forEach(([label, body], i) =>
    delay(
      () => {
        if (!stack.isConnected) return;
        const panel = document.createElement('div');
        panel.className = 'emergency-window';
        panel.style.setProperty('--alert-order', i);
        panel.innerHTML =
          '<span class="eyebrow">' +
          esc(label) +
          '</span><strong>' +
          esc(tr(body)) +
          '</strong><small>CH.04 / ' +
          koreaTime().clock +
          '</small>';
        stack.prepend(panel);
      },
      state.motion ? i * 200 : 0,
    ),
  );
  const dismiss = document.createElement('button');
  dismiss.textContent = tr('확인 · 경보 해제');
  dismiss.onclick = () => {
    stack.remove();
    logActivity('경보 확인', 'ACK');
  };
  stack.append(dismiss);
  if (document.querySelector('#sound-toggle')?.getAttribute('aria-pressed') === 'true') chirp();
}
export function openIncident(record) {
  const when = koreaTime(new Date(record.created));
  const fields = [
    ['신고자', record.reporter || 'SGIA 자동 관측망'],
    ['발생 위치', record.location],
    [
      '발생 시각',
      record.occurredAt
        ? koreaTime(new Date(record.occurredAt)).date +
          ' ' +
          koreaTime(new Date(record.occurredAt)).clock
        : when.date + ' ' + when.clock,
    ],
    ['접수 시각', when.date + ' ' + when.clock + ' KST'],
    ['구역', record.zone || '서울권 / 현장 통제선'],
    ['지원 요청 팀', record.support || (record.type === '미등록 각성자' ? '비콘' : '실드')],
    ['필요 인원', record.personnel || { A: 8, B: 4, C: 2, D: 1 }[record.grade]],
    ['추가 요청사항', record.requests || '현장 접근 전 파장 측정. 주민 통제선 확보.'],
  ];
  const d = modal(
    'CASE / ' + record.id,
    `<article class="record-dossier"><div class="dossier-strip"><span>INCIDENT RESPONSE DIVISION</span><b>${record.grade} / ${esc(record.type)}</b></div><h3>${esc(record.location)}</h3><dl class="facts">${fields.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><h4>상황 설명</h4><p id="typed-report" class="typed-report" data-no-translate></p>${record.resolvedAt ? '<img class="record-seal" src="assets/art/resolved-seal.webp" alt="RESOLVED">' : '<span class="pending-tag">AWAITING RESPONSE</span>'}</article>`,
    'record',
  );
  const text = tr(record.detail),
    out = $('#typed-report');
  let n = 0,
    timer;
  const type = () => {
    if (!d.open || !out.isConnected) return;
    out.textContent = text.slice(0, (n += 2));
    if (n < text.length) timer = delay(type, 18);
  };
  if (state.motion) type();
  else out.textContent = text;
  d.addEventListener('close', () => clearTimeout(timer), { once: true });
}
export function bindDial() {
  const range = $('#frequency');
  if (!range) return;
  range.insertAdjacentHTML(
    'beforebegin',
    '<div class="tuning-knob" id="tuning-knob" role="slider" tabindex="0" aria-label="수신 주파수" aria-valuemin="80" aria-valuemax="120" aria-valuenow="98.6"><img src="assets/art/tuning-dial.webp" alt="" draggable="false"><i></i><span>FINE TUNE</span></div>',
  );
  const knob = $('#tuning-knob');
  function update(value) {
    range.value = Math.max(80, Math.min(120, value)).toFixed(1);
    range.dispatchEvent(new Event('input'));
    knob.style.setProperty('--dial', (Number(range.value) - 80) * 7 - 140 + 'deg');
    knob.setAttribute('aria-valuenow', range.value);
  }
  let start = null;
  knob.onpointerdown = (e) => {
    if (e.button !== 0) return;
    start = { y: e.clientY, x: e.clientX, value: Number(range.value) };
    knob.setPointerCapture(e.pointerId);
  };
  knob.onpointermove = (e) => {
    if (start) update(start.value + (e.clientX - start.x + start.y - e.clientY) / 8);
  };
  knob.onpointerup = knob.onpointercancel = () => (start = null);
  knob.onkeydown = (e) => {
    const d = {
      ArrowUp: 0.1,
      ArrowRight: 0.1,
      ArrowDown: -0.1,
      ArrowLeft: -0.1,
      PageUp: 1,
      PageDown: -1,
    }[e.key];
    if (d) {
      e.preventDefault();
      update(Number(range.value) + d);
    }
    if (e.key === 'Home') {
      e.preventDefault();
      update(80);
    }
    if (e.key === 'End') {
      e.preventDefault();
      update(120);
    }
  };
  range.addEventListener('input', () => {
    knob.style.setProperty('--dial', (Number(range.value) - 80) * 7 - 140 + 'deg');
    knob.setAttribute('aria-valuenow', range.value);
  });
  update(98.6);
}
