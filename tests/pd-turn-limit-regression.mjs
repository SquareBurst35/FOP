import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeSession, turnSpendLimit, useAbility, startNextTurn, startNextScene, undoLastUse } from '../session.js';
import { CharacterStore, encodeDocument, decodeDocument } from '../character-sync.js';

function agent(nivel = 6) {
  const character = {
    id: 'pd-turn-agent', nome: 'Teste de determinação', nivel, nex: nivel * 5,
    optionalRules: { determination: true, separateLevelNex: true },
    recursos: { pdAtual: 50, pdMax: 50, peAtual: 12, peMax: 12 },
  };
  normalizeSession(character);
  return character;
}
const use = (character, cost, extra = {}) => useAbility(character, { id: 'pd-action', name: 'Ação de teste', resource: 'effort', cost, ...extra });
function storage() {
  const entries = new Map();
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, String(value)) };
}

test('PD uses the current level, including separate level/NEX and legacy NEX fallback', () => {
  for (let level = 0; level <= 20; level++) assert.equal(turnSpendLimit(agent(level)), level);
  const character = agent();
  character.nex = 10;
  assert.equal(turnSpendLimit(character), 6);
  delete character.nivel;
  assert.equal(turnSpendLimit(character), 2);
});

test('3 + 2 PD shares the ability/ritual budget; another 2 is blocked without any debit or usage', () => {
  const character = agent();
  assert.equal(use(character, 3, { type: 'habilidade' }).ok, true);
  assert.equal(use(character, 2, { type: 'ritual', variant: 'Normal' }).ok, true);
  assert.equal(character.controleSessao.gastoTurno, 5);
  assert.equal(character.recursos.pdAtual, 45);
  assert.equal(character.recursos.peAtual, 12);
  const before = structuredClone(character);
  const blocked = use(character, 2, { sceneKey: 'once', sceneLimit: 1, sessionKey: 'once', sessionLimit: 1, turnLimit: 999 });
  assert.deepEqual(blocked, { ok: false, reason: 'turn', message: 'Limite de PD por turno atingido.' });
  assert.deepEqual(character, before);
  assert.equal(use(character, 1).ok, true);
  assert.equal(character.controleSessao.gastoTurno, 6);
  assert.equal(use(character, 0).ok, true);
  assert.equal(character.recursos.pdAtual, 44);
  assert.equal(character.recursos.pdMax, 50);
});

test('PD resets preserve current resources and scene/session restrictions; undo refunds an accepted use', () => {
  const character = agent();
  const limits = { sceneKey: 'once', sceneLimit: 1, sessionKey: 'once', sessionLimit: 1 };
  use(character, 3, limits);
  startNextTurn(character);
  assert.equal(character.controleSessao.gastoTurno, 0);
  assert.equal(character.controleSessao.turno, 2);
  assert.equal(character.recursos.pdAtual, 47);
  assert.equal(use(character, 1, limits).reason, 'scene');
  use(character, 6);
  assert.equal(use(character, 1).reason, 'turn');
  undoLastUse(character);
  assert.equal(character.recursos.pdAtual, 47);
  assert.equal(character.controleSessao.gastoTurno, 0);
  use(character, 2);
  startNextScene(character);
  assert.equal(character.controleSessao.cena, 2);
  assert.equal(character.controleSessao.turno, 1);
  assert.equal(character.controleSessao.gastoTurno, 0);
  assert.deepEqual(character.controleSessao.usosCena, {});
  assert.equal(use(character, 1, limits).reason, 'session');
  assert.equal(character.recursos.pdAtual, 45);
  assert.equal(character.recursos.peAtual, 12);
});

test('saved and synced PD budgets survive reload, level increases and turn resets', () => {
  const local = storage(), remote = storage();
  const character = agent();
  use(character, 5);
  new CharacterStore(local).write([character]);
  const reloaded = new CharacterStore(local).read()[0];
  assert.equal(use(reloaded, 2).reason, 'turn');
  assert.equal(reloaded.recursos.pdAtual, 45);
  const secondDevice = new CharacterStore(remote);
  secondDevice.select('pd-test-account');
  const sync = (data, version) => secondDevice.merge([decodeDocument(data.id, encodeDocument(data, `pd-${version}`, version))]);
  sync(reloaded, 1);
  let incoming = secondDevice.read()[0];
  assert.equal(use(incoming, 2).reason, 'turn');
  assert.equal(incoming.controleSessao.gastoTurno, 5);
  reloaded.nivel = 7;
  sync(reloaded, 2);
  incoming = secondDevice.read()[0];
  assert.equal(turnSpendLimit(incoming), 7);
  assert.equal(use(incoming, 2).ok, true);
  assert.equal(incoming.recursos.pdAtual, 43);
  assert.equal(incoming.controleSessao.gastoTurno, 7);
  startNextTurn(incoming);
  secondDevice.write([incoming]);
  const reopened = new CharacterStore(remote);
  reopened.select('pd-test-account');
  assert.equal(reopened.read()[0].controleSessao.gastoTurno, 0);
  assert.equal(reopened.read()[0].recursos.pdAtual, 43);
  assert.equal(reopened.read()[0].recursos.peAtual, 12);
});
