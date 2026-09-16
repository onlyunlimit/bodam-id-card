let scope = new AbortController();
const cleanups = new Set();
export const routeSignal = () => scope.signal;
export function onDispose(fn) {
  cleanups.add(fn);
  return () => cleanups.delete(fn);
}
export function disposeRoute() {
  scope.abort();
  for (const fn of cleanups) fn();
  cleanups.clear();
  scope = new AbortController();
}
export function listen(target, type, fn, options = {}) {
  target.addEventListener(type, fn, { ...options, signal: scope.signal });
}
export function every(fn, ms) {
  const id = setInterval(fn, ms);
  onDispose(() => clearInterval(id));
  return id;
}
export function delay(fn, ms) {
  const cleanup = () => clearTimeout(id);
  const id = setTimeout(() => {
    cleanups.delete(cleanup);
    fn();
  }, ms);
  onDispose(cleanup);
  return id;
}
