import { $, esc, state } from './runtime.js';
import { delay } from './lifecycle.js';
import { registerCopy } from './i18n.js';
[
  ['열람 장면 건너뛰기', 'Skip opening sequence', '閲覧演出をスキップ', '跳过开场动画'],
  ['신원 대조 중', 'Matching identity', '身元を照合中', '正在核对身份'],
  ['기록 복원 중', 'Restoring record', '記録を復元中', '正在恢复记录'],
  ['접근 기록 봉인', 'Sealing access record', 'アクセス記録を封印', '封存访问记录'],
].forEach((row) => registerCopy(...row));
export function visualSignature(c) {
  const n = [...c.id].reduce((s, x) => s + x.charCodeAt(0), 0);
  return {
    number: String(n).padStart(4, '0'),
    angle: (n % 5) - 2,
    variant: n % 3,
    mode:
      c.id === 'bug'
        ? 'fault'
        : c.team === 'orpe'
          ? 'classified'
          : ['lucky', 'obsidus'].includes(c.team)
            ? 'studio'
            : c.team === 'beacon'
              ? 'scanner'
              : c.team === 'shield'
                ? 'tactical'
                : 'archive',
  };
}
export function scanMarkup(c) {
  const v = visualSignature(c);
  return `<span class="video-echo" aria-hidden="true"><img src="${c.portrait}" alt="" loading="lazy" draggable="false"></span><span class="video-time" aria-hidden="true">REC <i></i> ${v.number} / ${c.code}</span><span class="video-scan" aria-hidden="true"></span><span class="video-corners" aria-hidden="true"></span>`;
}
export function openSequence(dialog, c) {
  const v = visualSignature(c);
  const stage = dialog.querySelector('.profile-stage');
  stage.dataset.mode = v.mode;
  stage.dataset.subject = c.id;
  stage.style.setProperty('--profile-skew', v.angle + 'deg');
  if (!state.motion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const overlay = document.createElement('div');
  overlay.className = 'profile-acquisition';
  overlay.dataset.mode = v.mode;
  const lines =
    v.mode === 'fault'
      ? ['PACKET 0x' + v.number + ' / MISMATCH', 'REPAIRING INDEX…', 'BUG / SESSION RESTORED']
      : v.mode === 'classified'
        ? ['SEALED / ORPÉ / ' + v.number, 'ACCESS TRAIL ENCRYPTED', 'AZ / RESTRICTED RECORD']
        : [
            'SGIA / ' + c.code + ' / ' + v.number,
            'IDENTITY CHANNEL MATCHED',
            c.code + ' / RECORD OPEN',
          ];
  overlay.innerHTML = `<div class="acquisition-top"><span>PERSONNEL ARCHIVE</span><span>${v.number}</span></div><pre aria-hidden="true">${v.mode === 'fault' ? '0101  ////  1100\n!    INDEX LOST    !\n0010  ////  1011' : '+───┬───┬───+\n│ ░ │ ▒ │ ▓ │\n+───┴───┴───+'}</pre><strong>${esc(c.code)}</strong><span class="acquisition-line" data-no-translate>${lines[0]}</span><div class="acquisition-meter"><i></i></div><button class="acquisition-skip">열람 장면 건너뛰기</button>`;
  stage.prepend(overlay);
  stage.classList.add('acquiring');
  const timers = [];
  const finish = () => {
    timers.forEach(clearTimeout);
    overlay.remove();
    stage.classList.remove('acquiring');
  };
  $('.acquisition-skip', overlay).onclick = finish;
  [440, 850].forEach((ms, i) =>
    timers.push(
      delay(() => {
        if (overlay.isConnected) $('.acquisition-line', overlay).textContent = lines[i + 1];
      }, ms),
    ),
  );
  timers.push(delay(finish, v.mode === 'classified' ? 1650 : v.mode === 'fault' ? 1550 : 1250));
  dialog.addEventListener('close', finish, { once: true });
}
