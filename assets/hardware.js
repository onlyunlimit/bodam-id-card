import { $, $$, esc, modal, state, logActivity } from './runtime.js';
import { delay, every, listen } from './lifecycle.js';
import { chirp, keyClick } from './audio.js';
import { tr, registerCopy } from './i18n.js';
[
  ['기밀 파일 열기', 'Open sealed file', '機密ファイルを開く', '打开机密文件'],
  ['접근 코드', 'Access code', 'アクセスコード', '访问码'],
  [
    '코드가 일치하지 않습니다.',
    'Access code does not match.',
    'アクセスコードが一致しません。',
    '访问码不匹配。',
  ],
  ['입력 대기', 'Awaiting input', '入力待機', '等待输入'],
  ['기록 봉인 해제', 'Unseal record', '記録の封印を解除', '解封记录'],
  ['삭제', 'Delete', '削除', '删除'],
  ['승인', 'Confirm', '確認', '确认'],
  ['신호 고정', 'Lock signal', '信号を固定', '锁定信号'],
  ['미세 조정', 'Fine tuning', '微調整', '微调'],
  ['감청 원문', 'Intercept transcript', '傍受原文', '监听原文'],
  ['무결성 검사', 'Integrity check', '整合性検査', '完整性检查'],
  ['추적 중지', 'Stop trace', '追跡を停止', '停止追踪'],
  ['추적 재개', 'Resume trace', '追跡を再開', '恢复追踪'],
].forEach((row) => registerCopy(...row));
const beep = (pitch = 850) => {
  if ($('#sound-toggle')?.getAttribute('aria-pressed') === 'true') chirp(pitch);
};
export function sealedArchive(target, open) {
  target.innerHTML = `<section class="sealed-vault forensic-desk"><header class="vault-heading"><span class="eyebrow">COUNTERINTELLIGENCE / RESTRICTED NETWORK</span><h2>외부 위협 정보</h2><p>비인가 조직 · 관측 자료의 외부 반출을 금합니다.</p></header><div class="evidence-board"><svg class="evidence-links" viewBox="0 0 800 430" preserveAspectRatio="none" aria-hidden="true"><path d="M100 100L450 220L680 70M450 220L150 340M450 220L670 360"/></svg><div class="evidence-note note-a"><span>01 / INTERCEPT</span><pre aria-hidden="true">SIGNAL ...... LOST
VOICEPRINT .. DUPLICATE
SOURCE ...... UNKNOWN

▓▒░  ░▒▓  ▓░▒
▒░▓  ▓▒░  ░▓▒</pre><b>UNVERIFIED</b></div><div class="evidence-note note-b"><span>02 / OBSERVATION</span><div class="evidence-wave" aria-hidden="true"></div><small>37° N / 127° E<br>SEOUL SECTOR</small></div><button id="open-sealed" class="sealed-folder" aria-label="기밀 파일 열기"><span class="folder-spine">ORPÉ / ARCHIVE 04</span><span class="folder-class">RESTRICTED<br>INTELLIGENCE</span><span class="folder-title">CASE FILE<br><b>ORPÉ</b></span><span class="folder-stamp">SEALED</span><span class="folder-bottom"><i class="barcode"></i>SUBJECT / AZ <b>열람 요청 ↗</b></span></button><div class="evidence-note note-c"><span>03 / CROSS-CHECK</span><div class="redacted-lines" aria-hidden="true"><i></i><i></i><i></i></div><small>CHAIN OF CUSTODY<br>RECORD RETAINED</small></div></div><footer class="vault-audit"><span>● RECORD LOCKED</span><span>ACCESS LOG / MONITORED</span><span>INDEX 04—001</span></footer></section>`;
  $('#open-sealed').onclick = () => keypad(open);
}
function keypad(open) {
  const d = modal(
    'ORPÉ / ACCESS TERMINAL',
    `<section class="keypad-device"><div class="device-label"><span>SG—04 / KEY CONTROL</span><i></i></div><div class="keypad-screen"><label for="archive-pin">접근 코드</label><input id="archive-pin" type="password" inputmode="numeric" autocomplete="off" maxlength="4" aria-label="접근 코드" placeholder="_ _ _ _"><span id="pin-status" role="status">입력 대기</span></div><div class="hardware-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 'DEL', 0, 'ENTER'].map((k) => `<button data-key="${k}" aria-label="${k === 'DEL' ? '삭제' : k === 'ENTER' ? '승인' : k}">${k}<small>${typeof k === 'number' ? 'SG / ' + k : '↵'}</small></button>`).join('')}</div><div class="device-vents"></div></section>`,
    'keypad',
  );
  const input = $('#archive-pin');
  let busy = false,
    attempts = 0;
  const timers = [];
  const later = (fn, ms) =>
    timers.push(
      delay(() => {
        if (d.open) fn();
      }, ms),
    );
  const submit = () => {
    if (busy) return;
    if (input.value !== '0826') {
      attempts++;
      $('#pin-status').textContent = tr('코드가 일치하지 않습니다.');
      input.value = '';
      const device = $('.keypad-device');
      device.classList.remove('code-rejected');
      void device.offsetWidth;
      device.classList.add('code-rejected');
      beep(180);
      logActivity('ORPÉ / ACCESS DENIED', 'DENIED');
      if (attempts % 3 === 0) {
        device.dataset.echo = 'true';
        later(() => {
          device.dataset.echo = 'false';
        }, 1600);
      }
      return;
    }
    busy = true;
    input.disabled = true;
    $$('[data-key]', d).forEach((b) => (b.disabled = true));
    $('#pin-status').textContent = 'ACCESS ACCEPTED';
    beep(1100);
    const sequence = document.createElement('div');
    sequence.className = 'archive-release';
    sequence.innerHTML = `<div class="release-toasts" role="status"></div><div class="release-pages" aria-hidden="true">${Array.from({ length: 6 }, (_, i) => `<span style="--sheet:${i}"><b>ORPÉ / ${String(i + 1).padStart(3, '0')}</b><i></i><i></i><i></i><strong>VERIFIED</strong></span>`).join('')}</div>`;
    $('.keypad-device').append(sequence);
    ['ACCESS VERIFIED', 'EVIDENCE INDEX RESTORED', 'FILE UNSEALED'].forEach((s, i) =>
      later(
        () => {
          const e = document.createElement('span');
          e.textContent = '✓ ' + s;
          $('.release-toasts').append(e);
          beep(950 + i * 180);
        },
        state.motion ? i * 400 : 0,
      ),
    );
    later(
      () => {
        d.close();
        open();
        logActivity('ORPÉ / SEALED RECORD', 'UNSEAL');
      },
      state.motion ? 2050 : 50,
    );
  };
  $$('[data-key]', d).forEach(
    (b) =>
      (b.onclick = () => {
        if (busy) return;
        const k = b.dataset.key;
        keyClick();
        if (k === 'ENTER') submit();
        else if (k === 'DEL') input.value = input.value.slice(0, -1);
        else if (input.value.length < 4) input.value += k;
      }),
  );
  input.oninput = () => (input.value = input.value.replace(/\D/g, '').slice(0, 4));
  input.onkeydown = (e) => {
    if (/^[0-9]$/.test(e.key) || ['Backspace', 'Enter'].includes(e.key)) keyClick();
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };
  d.addEventListener('close', () => timers.forEach(clearTimeout), { once: true });
  input.focus();
}
export function mountReceiver() {
  const device = $('.receiver');
  if (!device) return;
  device.insertAdjacentHTML(
    'afterbegin',
    '<div class="receiver-plaque"><span>SGIA COMMUNICATIONS ENGINEERING</span><b>R—04</b><i>ANALOG / DUPLEX</i></div>',
  );
  device.insertAdjacentHTML(
    'beforeend',
    `<div class="frequency-scale" aria-hidden="true">${Array.from({ length: 21 }, (_, i) => `<span>${i % 5 === 0 ? 80 + i * 2 : ''}</span>`).join('')}<i id="tuning-needle"></i></div><div class="receiver-controls"><button id="tune-down" aria-label="주파수 낮추기">−</button><button id="receiver-dial" class="receiver-dial" role="slider" aria-label="미세 조정" aria-valuemin="80" aria-valuemax="120" aria-valuenow="98.6"><i></i></button><button id="tune-up" aria-label="주파수 높이기">＋</button><button id="lock-signal">신호 고정</button></div><div class="receiver-meter"><span>SIGNAL / dB</span><div>${'<i></i>'.repeat(20)}</div></div><div class="device-vents"></div>`,
  );
  const range = $('#frequency'),
    dial = $('#receiver-dial');
  const update = () => {
    const value = Number(range.value);
    device.style.setProperty('--tune', ((value - 80) / 40) * 100 + '%');
    dial.style.setProperty('--dial-angle', (value - 80) * 7 - 140 + 'deg');
    dial.setAttribute('aria-valuenow', range.value);
    const strength = Math.max(1, 20 - Math.round(Math.abs(value - 98.6)));
    $$('.receiver-meter i').forEach((e, i) => e.classList.toggle('lit', i < strength));
  };
  const tune = (n) => {
    range.value = Math.max(80, Math.min(120, n));
    range.dispatchEvent(new Event('input'));
  };
  listen(range, 'input', update);
  $('#tune-down').onclick = () => tune(+range.value - 0.1);
  $('#tune-up').onclick = () => tune(+range.value + 0.1);
  $('#lock-signal').onclick = () => {
    tune(98.6);
    beep();
  };
  let drag = null;
  dial.onpointerdown = (e) => {
    drag = { x: e.clientX, y: e.clientY, value: +range.value };
    dial.setPointerCapture(e.pointerId);
  };
  dial.onpointermove = (e) => {
    if (drag) tune(drag.value + (e.clientX - drag.x - e.clientY + drag.y) * 0.08);
  };
  dial.onpointerup = dial.onpointercancel = () => (drag = null);
  dial.onkeydown = (e) => {
    if (['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      tune(
        e.key === 'Home'
          ? 80
          : e.key === 'End'
            ? 120
            : +range.value + (['ArrowUp', 'ArrowRight'].includes(e.key) ? 0.1 : -0.1),
      );
    }
  };
  update();
}
export function interceptTerminal(snapshot) {
  const d = modal(
    'ORPÉ / SIGNAL INTELLIGENCE',
    `<section class="intercept-device"><div class="device-label"><span>INTERCEPT STATION / 04</span><b>● LINK</b></div><div class="intercept-screen"><div class="terminal-scope" aria-hidden="true"><i></i><b>CH.04</b></div><div class="intercept-readout"><span>PACKETS <b id="packet-count">0000</b></span><span>INTEGRITY <b id="integrity-state">UNVERIFIED</b></span><div class="packet-stream" id="packet-stream"></div></div></div><div class="terminal-actions"><button id="intercept-pause">추적 중지</button><button id="intercept-check">무결성 검사</button><button id="intercept-source">감청 원문</button></div><pre id="intercept-output" class="intercept-output" data-no-translate>${esc(snapshot)}</pre><div class="device-vents"></div></section>`,
    'intercept',
  );
  let paused = false,
    count = 0;
  const rows = [
    'CH.04 / CARRIER DETECTED',
    'PACKET / TIMESTAMP MISMATCH',
    'RELAY / DUPLICATE VOICEPRINT',
    'ORPÉ / SIGNAL QUARANTINED',
  ];
  const push = () => {
    if (!d.open || !$('#packet-stream', d) || paused || document.hidden) return;
    count++;
    $('#packet-count').textContent = String(count).padStart(4, '0');
    const line = document.createElement('span');
    line.textContent = String(count).padStart(3, '0') + ' > ' + rows[(count - 1) % rows.length];
    $('#packet-stream').prepend(line);
    while ($('#packet-stream').children.length > 5) $('#packet-stream').lastChild.remove();
  };
  push();
  const timer = every(() => {
    if (state.motion) push();
  }, 1300);
  $('#intercept-pause').onclick = (e) => {
    paused = !paused;
    e.target.textContent = tr(paused ? '추적 재개' : '추적 중지');
    $('.terminal-scope').classList.toggle('paused', paused);
  };
  const pending = [];
  $('#intercept-check').onclick = (e) => {
    const b = e.currentTarget;
    b.disabled = true;
    $('#integrity-state').textContent = 'SCANNING…';
    pending.push(
      delay(
        () => {
          if (!d.open || !$('#integrity-state')) return;
          $('#integrity-state').textContent = 'MISMATCH / ISOLATED';
          $('#intercept-output').textContent =
            'CHECK COMPLETE\n02 DUPLICATE PACKETS\n01 TIMESTAMP CONFLICT\nRECOMMENDATION: CROSS-CHECK WITNESS RECORDS';
          b.disabled = false;
          beep(450);
        },
        state.motion ? 1000 : 0,
      ),
    );
  };
  $('#intercept-source').onclick = () => {
    push();
    $('#intercept-output').textContent = snapshot + '\n\nRAW CHANNEL / SOURCE RECORD';
  };
  d.addEventListener(
    'close',
    () => {
      clearInterval(timer);
      pending.forEach(clearTimeout);
    },
    { once: true },
  );
}
