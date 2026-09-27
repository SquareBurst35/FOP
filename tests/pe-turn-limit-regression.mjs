import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeSession, turnSpendLimit, useAbility, startNextTurn, startNextScene, startNewSession, undoLastUse } from '../session.js';
import { CharacterStore, encodeDocument, decodeDocument } from '../character-sync.js';

function agent(overrides = {}) {
  const character = {
    id: 'pe-turn-agent', nome: 'Agente de teste', classe: 'Combatente', nivel: 6, nex: 30,
    recursos: { peAtual: 50, peMax: 50, pdAtual: 50, pdMax: 50, pvAtual: 50, pvMax: 50, sanAtual: 50, sanMax: 50 },
    controleSessao: {}, ...overrides,
  };
  normalizeSession(character);
  return character;
}
const use = (character, cost, extra = {}) => useAbility(character, { id: 'action', name: 'Ação de teste', resource: 'effort', cost, ...extra });
function storage() {
  const entries = new Map();
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, String(value)) };
}

test('PE budget equals stored level for levels 0–20, with NEX fallback only when needed', () => {
  for (let level = 0; level <= 20; level++) {
    assert.equal(turnSpendLimit(agent({ nivel: level, nex: level * 5 })), level);
    assert.equal(turnSpendLimit({ nex: level * 5 }), level);
  }
  assert.equal(turnSpendLimit({ nivel: 6, nex: 50 }), 6);
  assert.equal(turnSpendLimit({ nivel: '10', nex: 5, optionalRules: { separateLevelNex: true } }), 10);
  for (const nivel of [undefined, null, '', 'inválido', Infinity, -1]) {
    assert.equal(turnSpendLimit({ nivel, nex: 30 }), 6);
  }
  assert.equal(turnSpendLimit(agent(), { hasFacingDeath: true, ritual: true, hasPowerfulPresence: true }), 6);
});

// O limite por turno não bloqueia mais o uso (o jogador controla isso na mesa) — só a falta
// de recurso (PE/PV/PD/SAN insuficiente) ainda bloqueia. gastoTurno continua sendo somado só
// como registro/histórico.
test('spending past the turn budget still succeeds; only running out of PE blocks', () => {
  const character = agent();
  assert.equal(use(character, 3).ok, true);
  assert.equal(use(character, 2).ok, true);
  assert.equal(character.controleSessao.gastoTurno, 5);
  assert.equal(character.recursos.peAtual, 45);
  const further = use(character, 2, { sceneKey: 'limited', sceneLimit: 1, sessionKey: 'limited', sessionLimit: 1 });
  assert.equal(further.ok, true);
  assert.equal(character.controleSessao.gastoTurno, 7);
  assert.equal(character.recursos.peAtual, 43);
});

test('abilities and rituals share the same PE pool', () => {
  const character = agent();
  assert.equal(use(character, 3, { type: 'habilidade' }).ok, true);
  assert.equal(use(character, 3, { type: 'ritual', variant: 'Discente' }).ok, true);
  assert.equal(character.controleSessao.gastoTurno, 6);
  assert.equal(use(character, 1, { turnLimit: 999 }).ok, true);
  assert.equal(character.recursos.peAtual, 43);
  assert.equal(character.recursos.peMax, 50);
});

test('reset turn clears only the budget and advances the existing turn counter', () => {
  const character = agent();
  use(character, 3, { sceneKey: 'scene', sessionKey: 'session' });
  const before = structuredClone(character);
  startNextTurn(character);
  assert.equal(character.controleSessao.turno, 2);
  assert.equal(character.controleSessao.cena, 1);
  assert.equal(character.controleSessao.gastoTurno, 0);
  assert.deepEqual(character.recursos, before.recursos);
  assert.deepEqual(character.controleSessao.usosCena, before.controleSessao.usosCena);
  assert.deepEqual(character.controleSessao.usosSessao, before.controleSessao.usosSessao);
  assert.deepEqual(character.controleSessao.historico, before.controleSessao.historico);
  assert.equal(use(character, 6).ok, true);
  assert.equal(character.recursos.peAtual, 41);
});

test('reset scene renews scene uses without restoring PE; scene/session limits are informational only', () => {
  const character = agent();
  const limited = { sceneKey: 'once', sceneLimit: 1, sessionKey: 'once', sessionLimit: 1 };
  assert.equal(use(character, 3, limited).ok, true);
  startNextTurn(character);
  assert.equal(use(character, 0, limited).ok, true, 'a second use in the same scene is no longer blocked');
  assert.equal(character.controleSessao.usosCena.once, 2);
  startNextScene(character);
  assert.equal(character.controleSessao.cena, 2);
  assert.equal(character.controleSessao.turno, 1);
  assert.equal(character.controleSessao.gastoTurno, 0);
  assert.equal(character.recursos.peAtual, 47);
  assert.deepEqual(character.controleSessao.usosCena, {});
  assert.equal(use(character, 0, limited).ok, true);
  startNewSession(character);
  assert.equal(use(character, 0, limited).ok, true);
  assert.equal(character.recursos.peAtual, 47);
});

test('raising level updates turnSpendLimit(); gastoTurno keeps accumulating regardless', () => {
  const character = agent();
  use(character, 5);
  assert.equal(use(character, 2).ok, true);
  character.nivel = 7;
  character.nex = 35;
  assert.equal(turnSpendLimit(character), 7);
  assert.equal(character.controleSessao.gastoTurno, 7);
  assert.equal(use(character, 2).ok, true);
  assert.equal(character.controleSessao.gastoTurno, 9);
  assert.equal(character.recursos.peAtual, 41);
  const legacy = agent({ nivel: undefined });
  legacy.nex = 50;
  assert.equal(turnSpendLimit(legacy), 10);
});

test('gastoTurno above turnSpendLimit no longer blocks further PE use', () => {
  const character = agent();
  character.controleSessao.gastoTurno = 9;
  normalizeSession(character);
  assert.equal(character.controleSessao.gastoTurno, 9);
  assert.equal(use(character, 1).ok, true);
  assert.equal(use(character, 0).ok, true);
  startNextTurn(character);
  assert.equal(use(character, 6).ok, true);
});

test('PV, SAN, zero-cost actions and insufficient-resource checks keep their behavior', () => {
  for (const resource of ['pv', 'san']) {
    const character = agent({ nivel: 0 });
    assert.equal(use(character, 3, { resource }).ok, true);
    assert.equal(character.recursos[`${resource}Atual`], 47);
    assert.equal(character.controleSessao.gastoTurno, 0);
  }
  const poor = agent();
  poor.recursos.peAtual = 1;
  const before = structuredClone(poor);
  assert.equal(use(poor, 2).reason, 'resource');
  assert.deepEqual(poor, before);
});

test('undo refunds a use regardless of the turn budget', () => {
  const character = agent();
  use(character, 5);
  assert.equal(use(character, 2).ok, true);
  assert.equal(undoLastUse(character).ok, true);
  assert.equal(character.recursos.peAtual, 45);
  assert.equal(character.controleSessao.gastoTurno, 5);
  assert.equal(undoLastUse(character).ok, true);
  assert.equal(character.recursos.peAtual, 50);
  assert.equal(character.controleSessao.gastoTurno, 0);
  use(character, 3);
  startNextTurn(character);
  use(character, 2);
  undoLastUse(character);
  assert.equal(character.controleSessao.gastoTurno, 0);
  assert.equal(character.recursos.peAtual, 47);
});

test('reload and existing Firestore serialization preserve spent PE and level changes; spending is never blocked by them', () => {
  const localStorage = storage();
  const character = agent();
  use(character, 5);
  new CharacterStore(localStorage).write([character]);
  const reloaded = new CharacterStore(localStorage).read()[0];
  assert.equal(reloaded.controleSessao.gastoTurno, 5);
  assert.equal(use(reloaded, 2).ok, true);
  assert.equal(reloaded.recursos.peAtual, 43);

  const secondStorage = storage();
  const secondDevice = new CharacterStore(secondStorage);
  secondDevice.select('same-google-account');
  const sync = (data, version) => secondDevice.merge([decodeDocument(data.id, encodeDocument(data, `rev-${version}`, version))]);
  sync(reloaded, 1);
  let incoming = secondDevice.read()[0];
  assert.equal(use(incoming, 2).ok, true);
  assert.equal(incoming.recursos.peAtual, 41);

  reloaded.nivel = 7;
  reloaded.nex = 35;
  sync(reloaded, 2);
  incoming = secondDevice.read()[0];
  assert.equal(turnSpendLimit(incoming), 7);
  assert.equal(use(incoming, 2).ok, true);
  secondDevice.write([incoming]);
  const reopenedAccount = new CharacterStore(secondStorage);
  reopenedAccount.select('same-google-account');
  assert.equal(reopenedAccount.read()[0].recursos.peAtual, 41);

  startNextTurn(incoming);
  secondDevice.write([incoming]);
  const afterReset = new CharacterStore(secondStorage);
  afterReset.select('same-google-account');
  assert.equal(afterReset.read()[0].controleSessao.gastoTurno, 0);
  assert.equal(afterReset.read()[0].recursos.peAtual, 41);
});
