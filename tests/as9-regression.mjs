import test from "node:test";
import assert from "node:assert/strict";
import { CLASSES, ORIGINS, applyDerived, calculateDerived, sanitizeSkillSelections, skillSelectionStatus, abilitySkillBonus, characterResistances } from "../rules.js";
import { CLASS_POWERS, TRAIL_ABILITIES, RITUALS, allSelectableAbilities } from "../content.js";
import { choiceSpecsForAbility, choicesComplete } from "../choices.js";
import { ITEMS, inventoryUsage } from "../items.js";
import { ITEM_UPGRADES, upgradedItem, canApplyUpgrade } from "../item-upgrades.js";
import { abilityUseOptions } from "../use-options.js";
import { useAbility, undoLastUse } from "../session.js";
import { encodeDocument, decodeDocument } from "../character-sync.js";
import { THREATS } from "../threats.js";
import { DRONE_TYPES } from "../drone-types.js";

const source = "Arquivos Secretos #9";
const item = (name) => ITEMS.find((entry) => entry.name === name);
const trail = (name) => TRAIL_ABILITIES.find((entry) => entry.name === name && entry.source === source);
const character = (overrides = {}) => ({
  id: "as9-teste", nome: "Teste AS9", classe: "Combatente", origem: "Acadêmico", nivel: 2, nex: 10,
  atributos: { forca: 1, agilidade: 2, vigor: 2, intelecto: 2, presenca: 2 },
  habilidadesSelecionadas: [], habilidadeEscolhas: [], periciasOrigemEscolhidas: [],
  periciasClasseObrigatorias: [], periciasEscolhidas: [], periciasAdicionais: [], grausPericia: {},
  inventarioItens: [], recursos: {}, ...overrides,
});

test("AS9 tem duas origens, quatro poderes, duas trilhas completas e nenhum ritual novo", () => {
  assert.deepEqual(ORIGINS.filter((entry) => entry.source === source).map((entry) => entry.name), ["Treinado pela Hell Hunters", "Veterano de Conflito Armado"]);
  assert.deepEqual(CLASS_POWERS.filter((entry) => entry.source === source).map((entry) => entry.name).sort(), ["Municiador Ambulante", "Ripostar Ousado", "Tiro Intuitivo", "Tática de Abordagem"].sort());
  for (const [cls, name, page] of [["Combatente", "Incursor", "40"], ["Especialista", "Piloto de Drone", "41"]]) {
    assert.ok(CLASSES[cls].trails.includes(name));
    assert.deepEqual(TRAIL_ABILITIES.filter((entry) => entry.source === source && entry.category === cls).map((entry) => [entry.group, entry.unlockNex, entry.page]), [10, 40, 65, 99].map((nex) => [name, nex, page]));
  }
  assert.equal(RITUALS.filter((entry) => entry.source === source).length, 0);
  assert.ok(allSelectableAbilities(ORIGINS).filter((entry) => entry.category === "Origens" && entry.source === source).every((entry) => entry.page === 38));
});

test("Hell Hunters exige um par completo e calcula os bônus pelos patamares de NEX", () => {
  for (const [nex, pv, pe] of [[0, 0, 0], [5, 2, 1], [10, 3, 2], [15, 3, 2], [20, 4, 3], [99, 11, 10]]) {
    const base = character({ origem: "", nex, nivel: Math.max(0, Math.round(nex / 5)) });
    const baseline = calculateDerived(base);
    const melee = character({ ...base, origem: "Treinado pela Hell Hunters", periciasOrigemEscolhidas: ["Luta", "Fortitude"] });
    const ranged = character({ ...base, origem: "Treinado pela Hell Hunters", periciasOrigemEscolhidas: ["Pontaria", "Reflexos"] });
    assert.equal(calculateDerived(melee).pvMax - baseline.pvMax, pv, `PV NEX ${nex}`);
    assert.equal(calculateDerived(melee).peMax, baseline.peMax);
    assert.equal(calculateDerived(ranged).peMax - baseline.peMax, pe, `PE NEX ${nex}`);
    assert.equal(calculateDerived(ranged).pvMax, baseline.pvMax);
  }
  const invalid = character({ origem: "Treinado pela Hell Hunters", periciasOrigemEscolhidas: ["Luta", "Reflexos"] });
  assert.equal(skillSelectionStatus(invalid).complete, false);
  assert.deepEqual(invalid.periciasOrigemEscolhidas, []);
  const separate = character({ origem: "Treinado pela Hell Hunters", nex: 20, nivel: 15, optionalRules: { separateLevelNex: true }, periciasOrigemEscolhidas: ["Luta", "Fortitude"] });
  assert.equal(calculateDerived(separate).pvMax - calculateDerived({ ...separate, origem: "" }).pvMax, 4, "O texto da origem escala com NEX, mesmo separado do nível");
});

test("CQB registra um benefício estável e não converte o próprio treinamento em +2", () => {
  const cqb = trail("CQB");
  for (const [skills, expected] of [[[], "Pontaria"], [["Pontaria"], "Luta"], [["Pontaria", "Luta"], "bonus"]]) {
    const c = character({ trilha: "Incursor", periciasAdicionais: skills, grausPericia: Object.fromEntries(skills.map((s) => [s, 5])) });
    sanitizeSkillSelections(c);
    const spec = choiceSpecsForAbility(cqb, c)[0];
    assert.equal(spec.options[0].id, expected);
    c.habilidadeEscolhas.push({ abilityId: cqb.id, type: "cqb", valueId: expected, value: spec.options[0].label });
    for (let i = 0; i < 5; i++) applyDerived(c);
    assert.ok(c.periciasTreinadas.includes(expected === "bonus" ? "Luta" : expected));
    assert.equal(abilitySkillBonus(c, "Luta"), expected === "bonus" ? 2 : 0);
    assert.equal(abilitySkillBonus(c, "Pontaria"), expected === "bonus" ? 2 : 0);
    assert.equal(choicesComplete(cqb, c), true);
    const reloaded = JSON.parse(JSON.stringify(c));
    applyDerived(reloaded);
    assert.equal(choiceSpecsForAbility(cqb, reloaded)[0].options[0].id, expected);
  }
});

test("onze itens têm valores de referência e escudo calcula Defesa e resistência sem multiplicar por quantidade", () => {
  assert.equal(ITEMS.filter((entry) => entry.source === source).length, 11);
  for (const [name, category, spaces, damage, critical] of [
    ["Designated Marksman Rifle", "III", 3, "2d10", "19/x3"],
    ["Espingarda Serrada", "I", 1, "3d6", "20/x3"],
    ["Machado Tático", "II", 1, "1d8", "20/x3"],
    ["Pistola Taser", "II", 1, "2d6", "20/x3"],
  ]) {
    const entry = item(name), details = Object.fromEntries(entry.details);
    assert.equal(entry.category, category); assert.equal(entry.spaces, spaces);
    assert.equal(details.Dano, damage); assert.equal(details.Crítico, critical);
  }
  const c = character(), baseline = calculateDerived(c).defesa;
  c.inventarioItens = [{ itemId: item("Escudo Balístico LED").id, quantity: 2 }];
  assert.equal(calculateDerived(c).defesa, baseline + 2);
  assert.deepEqual(characterResistances(c), [{ label: "Balístico", value: 10, source: "Escudo Balístico LED" }]);
  c.inventarioItens = [{ itemId: item("Capacete Tático").id, quantity: 1 }];
  assert.equal(calculateDerived(c).defesa, baseline, "Capacete não inventa bônus de Defesa");
});

test("drones: tipo base incluído, sete perfis, modificações sem duplicação e categoria limitada a IV", () => {
  const drone = item("Drone de Combate Tático"), mods = ITEM_UPGRADES.filter((entry) => entry.target === drone.name);
  assert.equal(DRONE_TYPES.length, 7); assert.equal(mods.length, 7);
  assert.equal(upgradedItem(drone, [mods[0].id]).category, "III");
  assert.equal(upgradedItem(drone, mods.map((entry) => entry.id)).category, "IV");
  assert.equal(upgradedItem(drone, [mods[0].id, mods[0].id]).upgrades.length, 1);
  assert.equal(canApplyUpgrade(item("Pistola"), mods[0]), false);
  const shieldDrone = character({ inventarioItens: [{ itemId: drone.id, quantity: 2 }], inventarioModificacoes: { [drone.id]: [mods.find((mod) => mod.name === "Drone Protetor").id] } });
  assert.equal(calculateDerived(shieldDrone).defesa - calculateDerived(character()).defesa, 5);
  shieldDrone.droneDisponivel = false;
  assert.equal(calculateDerived(shieldDrone).defesa, calculateDerived(character()).defesa, "Drone quebrado/sem sinal não concede Defesa");
  for (const [nex, count] of [[40, 1], [65, 3], [99, 6]]) {
    const c = character({ classe: "Especialista", trilha: "Piloto de Drone", nex, nivel: Math.round(nex / 5), inventarioItens: [{ itemId: drone.id, quantity: 1 }], inventarioModificacoes: { [drone.id]: mods.slice(0, count + 1).map((entry) => entry.id) } });
    assert.equal(inventoryUsage(c).categoryCounts.IV, 1, "Drone requisitado é distinto do companheiro gratuito");
    assert.equal(upgradedItem(drone, mods.slice(0, count + 1).map((entry) => entry.id), c).freeDroneModifications, 0);
  }
  const c = character(), ability = trail("Companheiro Drone");
  const selected = [{ abilityId: ability.id, type: "drone", valueId: "utilitario", value: "Drone Utilitário" }];
  const specs = choiceSpecsForAbility(ability, c, selected);
  assert.equal(specs[0].options.length, 7);
  assert.ok(specs[1].options.every((entry) => !["Fortitude", "Luta", "Pontaria", "Reflexos", "Vontade"].includes(entry.id)));
  assert.equal(choicesComplete(ability, c, selected), false, "Drone Utilitário exige a perícia");
  selected.push({ abilityId: ability.id, type: "pericia", valueId: "Investigação", value: "Investigação" });
  assert.equal(choicesComplete(ability, c, selected), true);
  c.habilidadeEscolhas = selected;
  assert.deepEqual(choiceSpecsForAbility(ability, c)[1].options.map((entry) => entry.id), ["Investigação"], "Perícia confirmada não pode ser trocada");
});

test("proteção tem custos explícitos, desconto em NEX 99 e uso/desfazer mantém recursos", () => {
  const hostage = trail("Proteger Reféns"), protector = trail("Protetor dos Drones");
  const c = character({ classe: "Especialista", trilha: "Piloto de Drone", nex: 65, nivel: 13 });
  assert.deepEqual(abilityUseOptions(c, hostage).map((o) => o.cost), [2, 4]);
  assert.equal(abilityUseOptions(c, protector)[0].cost, 3);
  c.nex = 99; c.nivel = 20;
  const option = abilityUseOptions(c, protector)[0];
  assert.equal(option.cost, 1);
  applyDerived(c, true);
  const before = c.recursos.peAtual;
  const result = useAbility(c, { id: protector.id, name: protector.name, cost: option.cost, resource: "effort" });
  assert.equal(result.ok, true);
  assert.equal(c.recursos.peAtual, before - 1);
  undoLastUse(c);
  assert.equal(c.recursos.peAtual, before);
});

test("escolhas de treinamento e drone sobrevivem ao codec atual sem alterar identidade", () => {
  const c = character({ origem: "Treinado pela Hell Hunters", periciasOrigemEscolhidas: ["Pontaria", "Reflexos"], habilidadeEscolhas: [{ abilityId: trail("Companheiro Drone").id, type: "drone", valueId: "protetor", value: "Drone Protetor" }] });
  const doc = encodeDocument(c, "as9-rev");
  const decoded = decodeDocument(c.id, doc);
  assert.deepEqual(decoded.data.periciasOrigemEscolhidas, c.periciasOrigemEscolhidas);
  assert.deepEqual(decoded.data.habilidadeEscolhas, c.habilidadeEscolhas);
  assert.equal(decoded.data.id, c.id);
});

test("oito fichas Hell Hunters preservam as estatísticas impressas, inclusive bônus zero e VD do Ryder", () => {
  const sheets = THREATS.filter((entry) => entry.source === source);
  assert.equal(sheets.length, 8);
  assert.equal(THREATS.length, 196);
  assert.equal(new Set(THREATS.map((entry) => entry.id)).size, THREATS.length);
  // Colunas: página, VD, Defesa, PV, AGI, FOR, INT, PRE, VIG.
  const expected = [
    ["Jason Bloom", "21", 140, 30, 200, 2, 3, 1, 2, 3],
    ["Karen Brown", "23", 160, 33, 240, 4, 2, 2, 3, 2],
    ["Troy Walker", "25", 140, 29, 180, 2, 3, 1, 2, 3],
    ["Roy Stevens", "27", 160, 32, 250, 2, 3, 3, 4, 3],
    ["Stella Green", "29", 140, 29, 190, 3, 2, 3, 2, 2],
    ["Arnold Strolley", "31", 140, 30, 200, 2, 2, 4, 2, 3],
    ["Chloe Grey", "33", 140, 29, 170, 3, 2, 3, 3, 2],
    ["Ryder Staten", "34–35", 200, 34, 320, 4, 3, 2, 2, 3],
  ];
  for (const [name, page, vd, defense, pv, agi, forca, int, pre, vig] of expected) {
    const sheet = sheets.find((entry) => entry.name === name);
    assert.equal(sheet.page, page); assert.equal(sheet.vd, vd); assert.equal(sheet.defesa, defense); assert.equal(sheet.pontosDeVida, pv);
    assert.deepEqual(sheet.atributos, { agi, for: forca, int, pre, vig });
    assert.equal(sheet.machucadoEm, pv / 2);
    assert.equal(sheet.element, "Realidade"); assert.equal(sheet.category, "Pessoa");
    assert.ok(sheet.acoes.length >= 5);
  }
  assert.deepEqual(sheets.find((entry) => entry.name === "Jason Bloom").percepcao, { dice: 2, bonus: 0 });
  assert.deepEqual(sheets.find((entry) => entry.name === "Arnold Strolley").iniciativa, { dice: 2, bonus: 0 });
  assert.match(sheets.find((entry) => entry.name === "Ryder Staten").habilidadesPassivas[0].descricao, /3 ações/);
  assert.match(sheets.find((entry) => entry.name === "Troy Walker").habilidadesPassivas[0].descricao, /sobreposição/);
});
