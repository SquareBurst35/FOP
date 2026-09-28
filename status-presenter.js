// Calm sync status. Every edit goes pending -> syncing -> synced within a second
// or two; showing each step made the header text flicker. Those short cycles
// stay invisible: "Sincronizando…" only appears when syncing is still going
// SHOW_AFTER_MS after the last edit (so never while someone is mid-edit), and
// once shown it stays a moment before giving way. Other states show at once.
export const SHOW_AFTER_MS = 3000;
export const KEEP_MS = 900;

export function createStatusPresenter(show, { showAfter = SHOW_AFTER_MS, keep = KEEP_MS, now = Date.now, setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  let shown = null;
  let shownAt = 0;
  let busySince = 0;
  let lastEdit = 0;
  let timer = null;
  const cancel = () => { clearTimer(timer); timer = null; };
  const put = (state, error) => { cancel(); shown = state; shownAt = now(); show(state, error); };
  const later = (ms, state, error) => { cancel(); timer = setTimer(() => put(state, error), Math.max(0, ms)); };
  return function present(state, error) {
    if (state === 'pending' || state === 'syncing') {
      const at = now();
      busySince ||= at;
      if (state === 'pending') lastEdit = at;
      if (shown === 'syncing') return cancel();
      return later(Math.max(busySince, lastEdit) + showAfter - at, 'syncing');
    }
    busySince = 0;
    const left = shown === 'syncing' ? keep - (now() - shownAt) : 0;
    if (left > 0) return later(left, state, error);
    put(state, error);
  };
}
