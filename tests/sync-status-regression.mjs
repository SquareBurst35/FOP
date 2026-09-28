import test from 'node:test';
import assert from 'node:assert/strict';
import { createStatusPresenter, SHOW_AFTER_MS, KEEP_MS } from '../status-presenter.js';

function harness() {
  let time = 0, seq = 0;
  const timers = new Map(), shown = [];
  const present = createStatusPresenter((state, error) => shown.push([time, state, error?.code ?? null]), {
    now: () => time,
    setTimer: (fn, ms) => { timers.set(++seq, { at: time + ms, fn }); return seq; },
    clearTimer: id => timers.delete(id),
  });
  const advance = to => {
    while (true) {
      const next = [...timers].filter(([, t]) => t.at <= to).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      timers.delete(next[0]); time = next[1].at; next[1].fn();
    }
    time = to;
  };
  return { present, advance, shown, states: () => shown.map(s => s[1]) };
}

test('a normal edit cycle (pending, syncing, synced) never shows the transient text', () => {
  const h = harness();
  h.present('synced');
  for (let round = 0; round < 6; round++) {
    h.present('pending'); h.present('syncing');
    h.advance(h.shown.length * 0 + (round + 1) * 2500 - 800);
    h.present('synced');
    h.advance((round + 1) * 2500);
  }
  assert.ok(h.states().every(state => state === 'synced'), h.states().join());
});

test('syncing that lasts is shown once, then held before the synced text returns', () => {
  const h = harness();
  h.present('synced'); h.advance(1000);
  h.present('pending'); h.present('syncing');
  h.advance(1000 + SHOW_AFTER_MS - 1);
  assert.deepEqual(h.states(), ['synced']);
  h.advance(1000 + SHOW_AFTER_MS);
  assert.deepEqual(h.states(), ['synced', 'syncing']);
  h.advance(1000 + SHOW_AFTER_MS + 200);
  h.present('synced');
  h.advance(1000 + SHOW_AFTER_MS + KEEP_MS - 1);
  assert.deepEqual(h.states(), ['synced', 'syncing'], 'held for at least KEEP_MS');
  h.advance(1000 + SHOW_AFTER_MS + KEEP_MS);
  assert.deepEqual(h.states(), ['synced', 'syncing', 'synced']);
});

test('a stream of edits never shows syncing, however long it goes on', () => {
  const h = harness();
  h.present('synced');
  let t = 0;
  for (let i = 0; i < 30; i++) {
    t += 1200; h.advance(t);
    h.present('pending'); h.advance(t + 100);
    h.present('syncing'); h.advance(t + 600);
    if (i % 3 === 2) h.present('synced');
  }
  h.advance(t + 2000);
  assert.ok(h.states().every(state => state === 'synced'), h.states().join());
});

test('typing in a field that holds the upload shows syncing only after the typing stops', () => {
  const h = harness();
  h.present('synced');
  for (let i = 1; i <= 20; i++) { h.advance(i * 500); h.present('pending'); }
  h.advance(10000 + SHOW_AFTER_MS - 1);
  assert.deepEqual(h.states(), ['synced']);
  h.advance(10000 + SHOW_AFTER_MS);
  assert.deepEqual(h.states(), ['synced', 'syncing']);
});

test('a new edit while the syncing text is held keeps it instead of flipping back and forth', () => {
  const h = harness();
  h.present('syncing'); h.advance(SHOW_AFTER_MS);
  h.present('synced'); h.advance(SHOW_AFTER_MS + 300);
  h.present('pending'); h.present('syncing');
  h.advance(SHOW_AFTER_MS + KEEP_MS + 50);
  assert.deepEqual(h.states(), ['syncing']);
  h.present('synced'); h.advance(SHOW_AFTER_MS + KEEP_MS + 60);
  assert.deepEqual(h.states(), ['syncing', 'synced']);
});

test('errors, offline and loading are not delayed by the presenter', () => {
  const h = harness();
  h.present('loading'); h.present('synced');
  h.present('offline'); h.present('synced');
  h.present('error', { code: 'unavailable' });
  assert.deepEqual(h.shown.map(s => s[1]), ['loading', 'synced', 'offline', 'synced', 'error']);
  assert.equal(h.shown.at(-1)[2], 'unavailable');
});

test('an error that arrives while syncing is shown right after the hold', () => {
  const h = harness();
  h.present('syncing'); h.advance(SHOW_AFTER_MS);
  h.present('error', { code: 'permission-denied' });
  assert.deepEqual(h.states(), ['syncing']);
  h.advance(SHOW_AFTER_MS + KEEP_MS);
  assert.deepEqual(h.states(), ['syncing', 'error']);
});
