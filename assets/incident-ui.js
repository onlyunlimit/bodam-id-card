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
    `<article class="record-dossier"><div class="dossier-strip"><span>INCIDENT RESPONSE DIVISION</span><b>${record.grade} / ${esc(record.type)}</b></div><h3>${esc(record.location)}</h3><dl class="facts">${fields.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><h4>상황 설명</h4><div class="report-controls"><button id="report-pause">일시 정지</button><button id="report-complete">전체 읽기</button></div><p id="typed-report" class="typed-report" data-no-translate></p>${record.resolvedAt ? '<img class="record-seal" src="assets/art/resolved-seal.webp" alt="RESOLVED">' : '<span class="pending-tag">AWAITING RESPONSE</span>'}</article>`,
    'record',
  );
  const text = tr(record.detail),
    out = $('#typed-report');
  const letters = Array.from(text);
  let n = 0,
    timer,
    paused = false;
  const type = () => {
    if (!d.open || !out.isConnected || paused) return;
    out.textContent = letters.slice(0, ++n).join('');
    if (n < letters.length) timer = delay(type, /[.,。!?。！？]/.test(letters[n - 1]) ? 420 : 75);
    else $('#report-pause').disabled = true;
  };
  $('#report-pause').onclick = (e) => {
    paused = !paused;
    e.currentTarget.textContent = tr(paused ? '계속 읽기' : '일시 정지');
    clearTimeout(timer);
    if (!paused) type();
  };
  $('#report-complete').onclick = () => {
    clearTimeout(timer);
    n = letters.length;
    out.textContent = text;
    $('#report-pause').disabled = true;
  };
  if (state.motion) type();
  else {
    out.textContent = text;
    $('#report-pause').disabled = true;
  }
  d.addEventListener('close', () => clearTimeout(timer), { once: true });
}
