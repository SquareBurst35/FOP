import test from 'node:test';
import assert from 'node:assert/strict';
import { effectsMode, readPreference, writePreference, buttonLabel, startEffectsSetting, STORAGE_KEY } from '../effects.js';

function fakes({ stored = null, systemReduced = false } = {}) {
  const store = new Map(stored ? [[STORAGE_KEY, stored]] : []);
  const listeners = {};
  const button = {
    textContent: '', title: '', disabled: false, attrs: {},
    setAttribute(name, value) { this.attrs[name] = value; },
    addEventListener(type, fn) { listeners[type] = fn; },
  };
  const mediaListeners = [];
  const media = { matches: systemReduced, addEventListener: (_, fn) => mediaListeners.push(fn) };
  return { store, button, listeners, media, mediaListeners, root: { dataset: {} },
    storage: { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) } };
}

test('o pedido do sistema sempre reduz; senão vale a escolha do jogador', () => {
  assert.equal(effectsMode({ preference: 'normal', systemReduced: false }), 'normal');
  assert.equal(effectsMode({ preference: 'reduced', systemReduced: false }), 'reduced');
  assert.equal(effectsMode({ preference: 'normal', systemReduced: true }), 'reduced');
});

test('armazenamento quebrado (janela privada) cai em "normal" sem lançar erro', () => {
  const broken = { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); } };
  assert.equal(readPreference(broken), 'normal');
  assert.doesNotThrow(() => writePreference(broken, 'reduced'));
  assert.equal(readPreference(undefined), 'normal');
});

test('o botão explica o estado e trava quando o sistema já pede menos movimento', () => {
  const normal = buttonLabel({ preference: 'normal', systemReduced: false });
  assert.deepEqual([normal.text, normal.pressed, normal.locked], ['Efeitos: normais', false, false]);
  const chosen = buttonLabel({ preference: 'reduced', systemReduced: false });
  assert.deepEqual([chosen.text, chosen.pressed, chosen.locked], ['Efeitos: reduzidos', true, false]);
  const system = buttonLabel({ preference: 'normal', systemReduced: true });
  assert.deepEqual([system.text, system.pressed, system.locked], ['Efeitos: reduzidos', true, true]);
});

test('clicar alterna, grava a escolha e marca a página', () => {
  const f = fakes();
  startEffectsSetting({ root: f.root, button: f.button, storage: f.storage, media: f.media });
  assert.equal(f.root.dataset.effects, 'normal');
  f.listeners.click();
  assert.equal(f.root.dataset.effects, 'reduced');
  assert.equal(f.store.get(STORAGE_KEY), 'reduced');
  assert.equal(f.button.attrs['aria-pressed'], 'true');
  f.listeners.click();
  assert.equal(f.root.dataset.effects, 'normal');
  assert.equal(f.store.get(STORAGE_KEY), 'normal');
});

test('a escolha gravada volta ao abrir o site', () => {
  const f = fakes({ stored: 'reduced' });
  startEffectsSetting({ root: f.root, button: f.button, storage: f.storage, media: f.media });
  assert.equal(f.root.dataset.effects, 'reduced');
  assert.equal(f.button.textContent, 'Efeitos: reduzidos');
  assert.equal(f.button.disabled, false);
});

test('com o sistema pedindo menos movimento o botão fica travado, e mudanças no sistema são seguidas', () => {
  const f = fakes({ systemReduced: true });
  startEffectsSetting({ root: f.root, button: f.button, storage: f.storage, media: f.media });
  assert.equal(f.root.dataset.effects, 'reduced');
  assert.equal(f.button.disabled, true);
  f.media.matches = false;
  f.mediaListeners.forEach((fn) => fn());
  assert.equal(f.root.dataset.effects, 'normal');
  assert.equal(f.button.disabled, false);
});
