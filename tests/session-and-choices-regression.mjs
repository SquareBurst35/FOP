import assert from "node:assert/strict";
import {
  CORE_CLASS_ABILITIES,
  RITUALS,
  allSelectableAbilities,
} from "../content.js";
import { ITEMS } from "../items.js";
import { ORIGINS, SKILLS } from "../rules.js";
import {
  abilityCanRepeatChoice,
  choiceSpecsForAbility,
} from "../choices.js";
import {
  normalizeSession,
  parseUseCost,
  rollUseCost,
  startNextScene,
  startNextTurn,
  turnSpendLimit,
  undoLastUse,
  useAbility,
} from "../session.js";

const abilities = [...CORE_CLASS_ABILITIES, ...allSelectableAbilities(ORIGINS)];
const abilityById = new Map(abilities.map((entry) => [entry.id, entry]));
const byName = (name) => abilities.find((entry) => entry.name === name);

function character(overrides = {}) {
  return {
    classe: "Ocultista",
    nex: 25,
    nivel: 5,
    optionalRules: { separateLevelNex: false, determination: false },
    afinidadeElemental: "",
    atributos: { presenca: 3 },
    recursos: { pvAtual: 20, pvMax: 20, peAtual: 12, peMax: 12, sanAtual: 15, sanMax: 15, pdAtual: 10, pdMax: 10 },
    controleSessao: {},
    habilidadesSelecionadas: [],
    habilidadeEscolhas: [],
    rituaisSelecionados: RITUALS.slice(0, 3).map((entry) => entry.id),
    periciasTreinadas: SKILLS.slice(0, 8),
    grausPericia: Object.fromEntries(SKILLS.map((skill) => [skill, 0])),
    ...overrides,
  };
}

assert.deepEqual(parseUseCost("2 a 5 PE"), { kind: "variable", min: 2, max: 5, resource: "effort" });
assert.deepEqual(parseUseCost("Ação de movimento e 3 PE"), { kind: "fixed", min: 3, max: 3, resource: "effort" });
assert.equal(parseUseCost("1 vez por cena").sceneLimit, 1);
assert.equal(parseUseCost("Passivo").kind, "none");
const sanityCost = parseUseCost("Ação completa e 1d4 SAN");
assert.equal(sanityCost.resource, "san");
assert.equal(rollUseCost(sanityCost, () => 0), 1);
assert.equal(rollUseCost(sanityCost, () => 0.999), 4);

const standard = character();
assert.equal(turnSpendLimit(standard), 5);
assert.equal(turnSpendLimit(standard, { hasFacingDeath: true }), 6);
standard.afinidadeElemental = "Morte";
assert.equal(turnSpendLimit(standard, { hasFacingDeath: true }), 7);
assert.equal(turnSpendLimit(standard, { ritual: true, hasPowerfulPresence: true }), 8);

const spend = character();
let result = useAbility(spend, { id: "teste", name: "Teste", cost: 3, resource: "effort", turnLimit: 5 });
assert.equal(result.ok, true);
assert.equal(spend.recursos.peAtual, 9);
assert.equal(spend.controleSessao.gastoTurno, 3);
result = useAbility(spend, { id: "teste-2", name: "Teste 2", cost: 3, resource: "effort", turnLimit: 5 });
assert.equal(result.reason, "turn");
assert.equal(spend.recursos.peAtual, 9);
assert.equal(undoLastUse(spend).ok, true);
assert.equal(spend.recursos.peAtual, 12);
assert.equal(spend.controleSessao.gastoTurno, 0);

const determination = character({ optionalRules: { separateLevelNex: false, determination: true } });
result = useAbility(determination, { id: "pd", name: "Uso com PD", cost: 2, resource: "effort", turnLimit: 5 });
assert.equal(result.ok, true);
assert.equal(determination.recursos.pdAtual, 8);
assert.equal(determination.recursos.peAtual, 12);

const sanitySpend = character();
result = useAbility(sanitySpend, { id: "san", name: "Uso com SAN", cost: 3, resource: "san", turnLimit: 5 });
assert.equal(result.ok, true);
assert.equal(sanitySpend.recursos.sanAtual, 12);
assert.equal(sanitySpend.controleSessao.gastoTurno, 0);

const scene = character();
result = useAbility(scene, { id: "cena", name: "Uma vez", cost: 0, resource: "effort", turnLimit: 5, sceneKey: "cena", sceneLimit: 1 });
assert.equal(result.ok, true);
assert.equal(useAbility(scene, { id: "cena", name: "Uma vez", cost: 0, resource: "effort", turnLimit: 5, sceneKey: "cena", sceneLimit: 1 }).reason, "scene");
startNextTurn(scene);
assert.equal(scene.controleSessao.gastoTurno, 0);
assert.equal(scene.controleSessao.usosCena.cena, 1);
startNextScene(scene);
assert.equal(scene.controleSessao.turno, 1);
assert.deepEqual(scene.controleSessao.usosCena, {});
normalizeSession(scene);

const choiceCharacter = character({ nex: 50, nivel: 10 });
const context = { abilityById, automaticAbilities: [] };
const improved = byName("<Habilidade> Aprimorada");
assert.equal(abilityCanRepeatChoice(improved), true);
assert.ok(choiceSpecsForAbility(improved, choiceCharacter, [], context)[0].options.length >= 3);

const invention = byName("Invenção Paranormal");
const inventionSpec = choiceSpecsForAbility(invention, choiceCharacter, [], context)[0];
assert.equal(inventionSpec.type, "ritual");
assert.ok(inventionSpec.options.length > 20);
assert.ok(inventionSpec.options.every((item) => RITUALS.find((ritual) => ritual.id === item.id)?.circle === 1));

const transcender = abilities.find((entry) => entry.name === "Transcender");
const resist = byName("Resistir a Elemento");
const staged = [{ abilityId: transcender.id, type: "poder", valueId: resist.id, value: resist.name }];
const transcenderSpecs = choiceSpecsForAbility(transcender, choiceCharacter, staged, context);
assert.equal(transcenderSpecs.length, 2);
assert.equal(transcenderSpecs[1].type, "elemento");

for (const name of [
  "Predador de Sangue",
  "Zona dos Sussurros",
  "Prática com Materiais Ritualísticos",
  "Estágio Terminal",
  "Kian Vai Nos Salvar",
  "Tratamento de Emergência",
  "Sintonização Mental com Arma",
  "Engolir Sangue",
]) assert.ok(byName(name), `${name} ausente do catálogo de Arquivos Secretos #2`);
assert.equal(RITUALS.filter((entry) => entry.source === "Arquivos Secretos #2").length, 4);
assert.ok(ITEMS.length >= 100);

console.log("Controle de sessão e escolhas estruturadas passaram.");
