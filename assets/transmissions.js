import { $, esc, modal, state, logActivity } from './runtime.js';
import { delay } from './lifecycle.js';
import { tr, registerCopy } from './i18n.js';
for (const row of [
  ['채널 연결 중', 'Connecting to channel', 'チャンネルに接続中', '正在连接频道'],
  ['전문 복호화 중', 'Decoding transmission', '通信を復号中', '正在解码通信'],
  ['열람 확인', 'Acknowledge receipt', '受領を確認', '确认收悉'],
  ['수신 확인 완료', 'Receipt acknowledged', '受領確認済み', '已确认收悉'],
  ['일시 정지', 'Pause', '一時停止', '暂停'],
  ['계속 읽기', 'Resume reading', '読み上げを再開', '继续阅读'],
  ['전체 읽기', 'Show full report', '全文を表示', '显示全文'],
  ['일정 진행', 'Schedule progress', '予定の進捗', '日程进度'],
])
  registerCopy(...row);
export function requestTransmission(button, receive) {
  if (button.disabled) return;
  const label = button.textContent;
  button.disabled = true;
  button.textContent = tr('채널 연결 중');
  delay(
    () => {
      receive();
      button.disabled = false;
      button.textContent = label;
    },
    state.motion ? 950 : 0,
  );
}
export function openTransmission(sender, message, source) {
  const d = modal(
    sender,
    `<section class="transmission-reader"><div class="dossier-strip"><span>SGIA / COMMUNICATIONS</span><span>CH.01</span></div><div class="transmission-progress"><span id="transmission-stage">${tr('채널 연결 중')}</span><progress max="100" value="12"></progress></div><div id="transmission-body" hidden><p>${esc(tr(message))}</p><button class="primary" id="transmission-ack">${tr('열람 확인')}</button></div></section>`,
    'transmission',
  );
  const pending = [];
  const stage = (time, fn) =>
    pending.push(
      delay(
        () => {
          if (d.open && $('.transmission-reader', d)) fn();
        },
        state.motion ? time : 0,
      ),
    );
  stage(450, () => {
    $('#transmission-stage').textContent = tr('전문 복호화 중');
    $('.transmission-progress progress').value = 58;
  });
  stage(1200, () => {
    $('.transmission-progress progress').value = 100;
    $('#transmission-stage').textContent = tr('수신');
    $('#transmission-body').hidden = false;
  });
  $('#transmission-ack').onclick = (e) => {
    source.dataset.read = 'true';
    const badge = source.querySelector('.badge');
    if (badge) badge.textContent = tr('수신 확인 완료');
    e.currentTarget.disabled = true;
    e.currentTarget.textContent = tr('수신 확인 완료');
    logActivity(sender, 'ACK');
  };
  d.addEventListener('close', () => pending.forEach(clearTimeout), { once: true });
}
