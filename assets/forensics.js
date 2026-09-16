import { state } from './runtime.js';
export function initForensicCursor() {
  const el = document.createElement('div');
  el.id = 'forensic-cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<i></i><b></b><span>TRACE / <em></em></span>';
  document.body.append(el);
  document.addEventListener('pointermove', (e) => {
    const active =
      e.pointerType === 'mouse' &&
      state.motion &&
      !!e.target.closest(
        '.sealed-vault,.classified-board,[data-kind=keypad],[data-kind=intercept],[data-kind=orpe],[data-kind=evidence]',
      );
    el.hidden = !active;
    document.body.classList.toggle('forensic-tracking', active);
    if (!active) return;
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
    el.querySelector('em').textContent = Math.round(e.clientX) + ':' + Math.round(e.clientY);
  });
  document.addEventListener('pointerleave', () => {
    el.hidden = true;
    document.body.classList.remove('forensic-tracking');
  });
  el.hidden = true;
}
