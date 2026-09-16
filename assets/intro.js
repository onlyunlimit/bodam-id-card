import { initI18n, setLanguage, translateDOM } from './i18n.js';
import { installInterfaceTranslations } from './interface-i18n.js';
installInterfaceTranslations();
initI18n();
document.querySelectorAll('[data-lang]').forEach(
  (b) =>
    (b.onclick = () => {
      setLanguage(b.dataset.lang);
      translateDOM();
    }),
);
import { chirp } from './audio.js';
import { koreaTime } from './model.js';
const root = document.documentElement;
const media = matchMedia('(prefers-reduced-motion: reduce)');
let paused = media.matches,
  sound = true,
  connecting = false;
const clock = document.getElementById('intro-clock');
const tick = () => (clock.textContent = koreaTime().clock + ' KST');
tick();
setInterval(tick, 1000);
function motion() {
  root.dataset.motion = paused ? 'off' : 'on';
  document.getElementById('intro-motion').textContent = `모션 ${paused ? 'OFF' : 'ON'}`;
  document.getElementById('intro-motion').setAttribute('aria-pressed', String(paused));
}
motion();
media.addEventListener('change', () => {
  paused = media.matches;
  motion();
});
document.getElementById('intro-motion').onclick = () => {
  paused = media.matches || !paused;
  motion();
};
document.getElementById('intro-sound').onclick = (event) => {
  sound = !sound;
  event.currentTarget.textContent = `접속음 ${sound ? 'ON' : 'OFF'}`;
  event.currentTarget.setAttribute('aria-pressed', String(sound));
};
document.getElementById('connect').addEventListener('click', (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (connecting) return;
  connecting = true;
  if (sound) chirp();
  document.body.classList.add('connecting');
  document.getElementById('connection-log').textContent =
    'CHANNEL 01 / 신호 확인 · 외부인 열람 권한 승인';
  setTimeout(() => window.location.assign('portal.html'), paused ? 150 : 1900);
});
const canvas = document.getElementById('gate-particles'),
  ctx = canvas.getContext('2d');
let width = 0,
  height = 0,
  frame = 0;
const particles = Array.from({ length: 70 }, () => ({
  x: Math.random(),
  y: Math.random(),
  speed: 0.00007 + Math.random() * 0.00015,
  size: Math.random() * 1.5 + 0.4,
}));
function resize() {
  width = innerWidth;
  height = innerHeight;
  canvas.width = width * Math.min(devicePixelRatio, 2);
  canvas.height = height * Math.min(devicePixelRatio, 2);
  ctx?.setTransform(Math.min(devicePixelRatio, 2), 0, 0, Math.min(devicePixelRatio, 2), 0, 0);
}
resize();
addEventListener('resize', resize);
function draw() {
  if (!ctx) return;
  frame = requestAnimationFrame(draw);
  if (document.hidden) return;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#8debca';
  for (const p of particles) {
    if (!paused) p.y = (p.y - p.speed + 1) % 1;
    ctx.globalAlpha = 0.15 + p.x * 0.4;
    ctx.fillRect(p.x * width, p.y * height, p.size, p.size);
  }
}
draw();
addEventListener('pagehide', () => cancelAnimationFrame(frame));
addEventListener('pageshow', (event) => {
  if (event.persisted) {
    connecting = false;
    document.body.classList.remove('connecting');
    draw();
  }
});
