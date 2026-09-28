import test from 'node:test';
import assert from 'node:assert/strict';
import { occurrenceKeys, captureSheetUi, restoreSheetUi } from '../sheet-ui-state.js';

test('cards com o mesmo nome ganham chaves diferentes pela ordem', () => {
  assert.deepEqual(occurrenceKeys(['Pistola', 'Faca', 'Pistola', 'Pistola']), ['Pistola#0', 'Faca#0', 'Pistola#1', 'Pistola#2']);
  assert.deepEqual(occurrenceKeys([]), []);
});

test('sem ficha aberta ou sem DOM de verdade, nada é capturado nem quebra', () => {
  globalThis.document = { activeElement: null };
  assert.equal(captureSheetUi(undefined, 'a', 'resumo'), null);
  assert.equal(captureSheetUi({}, 'a', 'resumo'), null);
  assert.equal(captureSheetUi({ querySelector: () => null }, 'a', 'resumo'), null);
  assert.equal(captureSheetUi({ querySelector: () => ({ dataset: { character: 'b', tab: 'resumo' } }) }, 'a', 'resumo'), null, 'outra ficha recomeça do zero');
  delete globalThis.document;
});

test('falha ao devolver o estado nunca derruba o desenho da ficha', () => {
  const hostile = { querySelector() { throw new Error('DOM inesperado'); } };
  assert.doesNotThrow(() => restoreSheetUi(hostile, { open: {}, scroll: { '.sheet-tab-content': 10 }, focus: null }));
  assert.doesNotThrow(() => restoreSheetUi(hostile, null));
});
