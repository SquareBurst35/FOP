import test from 'node:test';
import assert from 'node:assert/strict';
import { CharacterStore, GUEST_KEY, accountKey } from '../character-sync.js';

const memory = () => { const data = new Map(); return { data, getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), removeItem: k => data.delete(k) }; };
let sequence = 0;
const make = storage => new CharacterStore(storage, () => `op-${++sequence}`);
const char = (id, nome = 'Agente') => ({ id, nome, recursos: {}, inventarioItens: [], rituaisSelecionados: [] });
// Simula o envio completo: tudo que estava na fila foi aceito pela nuvem.
const syncAll = (store, uid) => { for (const [id, job] of Object.entries(store.state().pending)) store.acknowledge(uid, id, job, [{ id, data: job.data, revision: job.token, version: 1 }]); };

test('sem nada pendente, limpar o dispositivo remove o cache da conta e as cópias locais que ela recebeu', () => {
  const storage = memory(), store = make(storage);
  store.write([char('antes-do-login'), char('sem-conta')]);
  store.select('A'); store.migrate(); syncAll(store, 'A');
  store.write([...store.read(), char('depois-do-login')]); syncAll(store, 'A');
  assert.ok(storage.getItem(accountKey('A')));
  const result = store.clearDevice('A');
  assert.deepEqual(result, { cleared: true, removedLocalCopies: 2 });
  assert.equal(storage.getItem(accountKey('A')), null, 'cache da conta removido');
  store.select(null);
  assert.deepEqual(store.read(), [], 'as duas fichas locais copiadas para a conta também saíram');
});

test('fichas locais que a conta nunca recebeu continuam no dispositivo', () => {
  const storage = memory(), store = make(storage);
  store.write([char('minha')]);
  store.select('A'); store.migrate(); syncAll(store, 'A');
  store.select(null);
  store.write([...store.read(), char('criada-sem-conta')]);
  store.select('A');
  store.clearDevice('A'); store.select(null);
  assert.deepEqual(store.read().map(c => c.id), ['criada-sem-conta']);
});

test('com alterações ainda por enviar nada é apagado: o navegador guarda a única cópia', () => {
  const storage = memory(), store = make(storage);
  store.select('A'); store.write([char('nova')]);
  const before = storage.getItem(accountKey('A'));
  assert.deepEqual(store.clearDevice('A'), { cleared: false, reason: 'pending' });
  assert.equal(storage.getItem(accountKey('A')), before);
  assert.equal(store.read()[0].id, 'nova');
});

test('limpar a conta A não toca no cache da conta B', () => {
  const storage = memory(), store = make(storage);
  store.select('A'); store.write([char('a1')]); syncAll(store, 'A');
  store.select('B'); store.write([char('b1')]); syncAll(store, 'B');
  store.clearDevice('A');
  store.select('B');
  assert.equal(store.read()[0].id, 'b1');
});

test('sem conta, ou com o cache da conta ainda inexistente, não lança erro nem apaga nada', () => {
  const storage = memory(), store = make(storage);
  store.write([char('local')]);
  assert.deepEqual(store.clearDevice(null), { cleared: false, reason: 'no-account' });
  assert.deepEqual(store.clearDevice('nunca-entrou'), { cleared: true, removedLocalCopies: 0 });
  assert.equal(store.read()[0].id, 'local');
});
