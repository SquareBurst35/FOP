import test from "node:test";
import assert from "node:assert/strict";
import { performTacticalAction as perform, tacticalState, tacticalActions } from "../tactical.js";
import { tacticalDrones } from "../tactical-state.js";
import { renderTacticalPanel, tacticalForm } from "../tactical-ui.js";
import { ITEMS, inventoryUsage } from "../items.js";
import { calculateDerived, abilitySkillBonus } from "../rules.js";
import { undoLastUse } from "../session.js";
import { encodeDocument, decodeDocument } from "../character-sync.js";
import { ITEM_UPGRADES } from "../item-upgrades.js";
import { RITUALS } from "../content.js";
import { ritualUseOptions } from "../use-options.js";

const item = (name) => ITEMS.find((v) => v.name === name);
const make = (overrides = {}) => ({
  id: "automation-as9", nome: "Agente", classe: "Combatente", trilha: "Incursor", nex: 99, nivel: 20,
  atributos: { agilidade: 2, forca: 2, intelecto: 2, vigor: 2, presenca: 2 },
  grausPericia: { Tática: 10, Pontaria: 10, Luta: 5, Tecnologia: 5 }, outrosBonusPericia: {},
  recursos: { peAtual: 100, peMax: 100, pvAtual: 50, pvMax: 100 },
  inventarioItens: [], inventarioModificacoes: {}, habilidadeEscolhas: [], habilidadesSelecionadas: [],
  ...overrides,
});
const add = (c, name, quantity = 1) => c.inventarioItens.push({ itemId: item(name).id, quantity });
const power = (c, suffix) => c.habilidadesSelecionadas.push(`as9-${suffix}`);
const go = (c, action, p = {}, rng = () => 0) => { const r = perform(c, action, p, rng); assert.equal(r.ok, true, r.message); return r; };
function droneCharacter(nex = 99, second = false) {
  return make({ classe: "Especialista", trilha: "Piloto de Drone", nex, habilidadeEscolhas: [
    { abilityId: "as9-companheiro-drone", type: "drone", valueId: "medico" },
    ...(second ? [{ abilityId: "as9-mestre-dos-drones", type: "configuracao", valueId: "segundo" }] : []),
  ] });
}
const configure = (c, types, extra = {}, id = "companheiro-1") => go(c, "droneConfig", { droneId: id, types, available: true, operated: true, ...extra });

test("municiar prepara somente pacotes carregados, reduz espaços e desfaz a alocação", () => {
  const c = make(); power(c, "municiador-ambulante"); add(c, "Dardos Condutores", 3);
  const before = inventoryUsage(c).spaces;
  assert.deepEqual(go(c, "prepare", { mode: "roll" }).result.rolls, [1, 1]);
  assert.equal(perform(c, "prepare", { itemId: item("Dardos Condutores").id, count: 3 }).ok, false);
  go(c, "prepare", { itemId: item("Dardos Condutores").id, count: 2 });
  assert.equal(inventoryUsage(c).spaces, before - 2);
  assert.equal(c.inventarioItens[0].quantity, 3);
  assert.equal(undoLastUse(c).ok, true); assert.equal(inventoryUsage(c).spaces, before);
  go(c, "prepare", { itemId: item("Dardos Condutores").id, count: 2 });
  c.inventarioItens[0].quantity = 1;
  assert.equal(inventoryUsage(c).spaces, 0, "O desconto nunca passa da quantidade carregada");
});

test("Analisar Perigo aplica testes e Defesa uma vez, dura o próximo turno e expira", () => {
  const c = make(), defense = calculateDerived(c).defesa;
  go(c, "analyze", { roll: 25 });
  assert.equal(calculateDerived(c).defesa, defense + 4);
  assert.equal(abilitySkillBonus(c, "Tecnologia"), 4);
  assert.equal(go(c, "test", { skill: "Tecnologia", dt: 0 }).result.total, 10);
  assert.equal(perform(c, "analyze", { roll: 40 }).ok, false);
  go(c, "turn"); assert.equal(calculateDerived(c).defesa, defense + 4);
  go(c, "turn"); assert.equal(calculateDerived(c).defesa, defense);
  go(c, "scene"); go(c, "analyze", { roll: 14 }); assert.equal(calculateDerived(c).defesa, defense);
});

test("tática tem pool, participantes, ameaça, soma de dados e expiração no interlúdio", () => {
  const c = make(); power(c, "tatica-de-abordagem");
  go(c, "plan", { roll: 20, target: "Resgate", participants: "Ana, Beto" });
  assert.equal(c.operacoesAS9.pool, 3);
  const original = JSON.stringify(c);
  assert.equal(perform(c, "tactic", { count: 4, target: "Ana", kind: "teste", related: true }).ok, false);
  assert.equal(perform(c, "tactic", { count: 1, target: "Intruso", kind: "teste", related: true }).ok, false);
  assert.equal(JSON.stringify(c), original);
  const r = go(c, "tactic", { count: 2, target: "Ana", kind: "teste", related: true, baseTotal: 12 });
  assert.equal(r.result.final, 14); assert.equal(c.operacoesAS9.pool, 1);
  go(c, "scene"); assert.equal(c.operacoesAS9.pool, 1);
  go(c, "interlude"); assert.equal(c.operacoesAS9.pool, 0);
  assert.equal(tacticalActions(c).some(([id]) => id === "tactic"), false);
});

test("reféns: metade arredondada para baixo, custo e limite de três distintos por rodada", () => {
  const c = make();
  go(c, "hostage", { target: "Ana", distance: 3, damageEffect: true, damage: 11, half: true });
  assert.equal(c.recursos.pvAtual, 45); assert.equal(c.recursos.peAtual, 96);
  go(c, "hostage", { target: "Ana", distance: 1 });
  go(c, "hostage", { target: "Beto", distance: 1 }); go(c, "hostage", { target: "Caio", distance: 1 });
  assert.equal(perform(c, "hostage", { target: "Dora", distance: 1 }).ok, false);
  assert.equal(perform(c, "hostage", { target: "Ana", distance: 4 }).ok, false);
  go(c, "turn"); go(c, "hostage", { target: "Dora", distance: 3 });
});

test("falha por falta de PE/PD é atômica e desfazer restaura dano e recurso", () => {
  const c = make({ optionalRules: { determination: true } }); c.recursos.pdAtual = 3; c.recursos.pdMax = 10;
  const before = JSON.stringify(c);
  assert.equal(perform(c, "hostage", { target: "Ana", distance: 3, half: true, damageEffect: true, damage: 20 }).ok, false);
  assert.equal(JSON.stringify(c), before);
  c.recursos.pdAtual = 4;
  go(c, "hostage", { target: "Ana", distance: 3, half: true, damageEffect: true, damage: 20 });
  assert.equal(c.recursos.pdAtual, 0); assert.equal(c.recursos.pvAtual, 40);
  assert.equal(undoLastUse(c).ok, true); assert.equal(c.recursos.pdAtual, 4); assert.equal(c.recursos.pvAtual, 50);
  assert.equal(c.operacoesAS9, undefined);
});

test("desfazer não sobrescreve uma edição posterior dos PV", () => {
  const c = make(); go(c, "incoming", { damage: 10 }); c.recursos.pvAtual = 12;
  assert.equal(undoLastUse(c).ok, false); assert.equal(c.recursos.pvAtual, 12);
  assert.equal(c.controleSessao.historico.length, 1);
});

test("Ripostar é reservado antes do acerto, usa reação e resolve dano/contra-ataque", () => {
  const c = make(); add(c, "Machado Tático"); power(c, "ripostar-ousado");
  assert.equal(perform(c, "riposte", { before: false }).ok, false);
  go(c, "riposte", { before: true }); assert.equal(c.recursos.peAtual, 98);
  assert.equal(c.operacoesAS9.riposte.defense, calculateDerived(c).defesa + 5);
  assert.equal(perform(c, "riposte", { before: true }).ok, false);
  const r = go(c, "resolveRiposte", { incoming: 1, itemId: item("Machado Tático").id, dt: 10 });
  assert.equal(r.result.total, 13); assert.equal(r.result.damage, 3); assert.equal(c.recursos.peAtual, 98);
  assert.equal(c.operacoesAS9.riposte, undefined);
  assert.equal(c.controleSessao.historico.length, 2, "A resolução não deixa um registro de ataque duplicado");
  go(c, "turn"); go(c, "riposte", { before: true });
});

test("CQB, Full Metal Jacket e Tiro Intuitivo calculam contexto sem combinar mirar", () => {
  const c = make({ origem: "Veterano de Conflito Armado" }); add(c, "Espingarda Serrada"); power(c, "tiro-intuitivo");
  const p = { itemId: item("Espingarda Serrada").id, dt: 0, engaged: true, cqb: true, penalty: -2, fmj: true, intuitive: true };
  const r = go(c, "attack", p);
  assert.equal(r.cost, 5); assert.equal(r.result.total, 11); assert.equal(r.result.margin, 18);
  assert.equal(perform(c, "attack", { ...p, aim: true }).ok, false);
});

test("serrada reduz todo o dano em alcance médio; DMR calcula margem ao mirar", () => {
  const c = make(); add(c, "Espingarda Serrada"); add(c, "Designated Marksman Rifle");
  assert.equal(go(c, "attack", { itemId: item("Espingarda Serrada").id, dt: 0, range: "medio", damageBonus: 2 }).result.damage, 2);
  const r = go(c, "attack", { itemId: item("Designated Marksman Rifle").id, dt: 0, aim: true }, () => .7);
  assert.equal(r.result.margin, 14); assert.equal(r.result.crit, true); assert.equal(r.result.damageRolls.length, 6);
});

test("alvo-prioritário só elimina se causar dano efetivo; VD 201 aumenta margem", () => {
  const c = make(); add(c, "Espingarda Serrada");
  go(c, "mark", { target: "Alfa", vd: 200, visible: true });
  let r = go(c, "attack", { itemId: item("Espingarda Serrada").id, target: "Alfa", targetPv: 300, dt: 0, targetReduction: 100 });
  assert.equal(r.result.damage, 0); assert.equal(r.result.targetPv, 300); assert.ok(c.operacoesAS9.priority);
  r = go(c, "attack", { itemId: item("Espingarda Serrada").id, target: "Alfa", targetPv: 300, dt: 0 });
  assert.equal(r.result.targetPv, 0); assert.equal(c.operacoesAS9.priority, undefined);
  go(c, "mark", { target: "Beta", vd: 201, visible: true });
  assert.equal(go(c, "attack", { itemId: item("Espingarda Serrada").id, target: "Beta", dt: 0 }).result.margin, 15);
});

test("capacete só ignora dano adicional e machado é consumido no bloqueio", () => {
  const c = make(); add(c, "Capacete Tático"); add(c, "Machado Tático", 2);
  const r = go(c, "incoming", { damage: 30, extraDamage: 20, helmet: true });
  assert.equal(r.result.damage, 10); assert.equal(c.recursos.pvAtual, 40);
  go(c, "axe", { damage: 30, reduction: 5 }); assert.equal(c.recursos.pvAtual, 35);
  assert.equal(c.inventarioItens.find((v) => v.itemId === item("Machado Tático").id).quantity, 1);
  assert.equal(c.recursos.peAtual, 98);
  assert.equal(undoLastUse(c).ok, true); assert.equal(c.recursos.pvAtual, 40); assert.equal(c.inventarioItens[1].quantity, 2);
});

test("escudo tem cobertura situacional que termina com deslocamento e lanterna com imunidade de cena", () => {
  const c = make(); add(c, "Escudo Balístico LED");
  go(c, "cover"); assert.equal(c.operacoesAS9.cover, true);
  assert.equal(go(c, "incoming", { damage: 15, ballistic: true }).result.damage, 5);
  go(c, "move"); assert.equal(c.operacoesAS9.cover, false);
  go(c, "flash", { target: "Alfa", distance: 5, shortRange: true });
  go(c, "turn"); assert.equal(perform(c, "flash", { target: "Alfa", distance: 5, shortRange: true }).ok, false);
  go(c, "scene"); go(c, "flash", { target: "Alfa", distance: 5, shortRange: true });
});

test("taser: 20 dardos por pacote, carregador 10, consumo no erro e limite de atordoamento por alvo/cena", () => {
  const c = make(); add(c, "Pistola Taser"); add(c, "Dardos Condutores");
  go(c, "reload", { itemId: item("Pistola Taser").id });
  assert.equal(c.operacoesAS9.looseDarts, 10); assert.equal(c.operacoesAS9.ammo[item("Pistola Taser").id], 10);
  const p = { itemId: item("Pistola Taser").id, target: "Alfa", dt: 0, fortitude: 0, ammoTracking: true };
  assert.equal(go(c, "attack", p).result.stunned, true);
  assert.equal(go(c, "attack", p).result.stunned, false);
  assert.equal(c.operacoesAS9.ammo[item("Pistola Taser").id], 8);
  go(c, "attack", { ...p, dt: 100 }); assert.equal(c.operacoesAS9.ammo[item("Pistola Taser").id], 7);
  go(c, "reload", { itemId: item("Pistola Taser").id }); assert.equal(c.operacoesAS9.looseDarts, 7);
  go(c, "scene"); assert.equal(go(c, "attack", p).result.stunned, true);
});

test("granadeira portátil usa só 40 mm, um disparo e recarga consome a reserva requisitada", () => {
  const c = make(); add(c, "Lançador de Granadas Portátil"); add(c, "Granada de fragmentação");
  const weapon = item("Lançador de Granadas Portátil").id;
  assert.equal(perform(c, "reload", { itemId: weapon, ammoId: item("Granada de fragmentação").id }).ok, false);
  go(c, "ammo40mm", { name: "Fragmentação 40 mm", damageFormula: "6d6", category: "I", spaces: .5, count: 2, confirm40mm: true });
  go(c, "reload", { itemId: weapon, ammoId: "0" }); assert.equal(c.operacoesAS9.rounds40mm[0].quantity, 1);
  const r = go(c, "attack", { itemId: weapon, area: true, dt: 10 });
  assert.equal(r.result.damage, 6); assert.equal(r.result.rolls.length, 0, "Disparo em ponto dispensa teste de ataque");
  assert.equal(c.operacoesAS9.ammo[weapon], undefined);
  assert.equal(perform(c, "attack", { itemId: weapon, dt: 0 }).ok, false);
});

test("companheiros e drones do inventário mantêm tipos, perícia e disponibilidade independentes", () => {
  const c = droneCharacter(99, true); add(c, "Drone de Combate Tático", 2);
  assert.equal(tacticalDrones(c).length, 4);
  configure(c, ["medico", "protetor", "inteligente"]);
  configure(c, ["utilitario", "hacker"], { skill: "Tecnologia" }, "companheiro-2");
  const ds = tacticalDrones(c);
  assert.deepEqual(ds[0].types, ["medico", "protetor", "inteligente"]);
  assert.deepEqual(ds[1].types, ["utilitario", "hacker"]);
  assert.equal(ds[2].types.length, 0);
  assert.equal(perform(c, "droneConfig", { droneId: ds[1].id, types: ds[1].types, skill: "Investigação", available: true }).ok, false);
  configure(c, ds[0].types, { available: false });
  assert.equal(tacticalDrones(c)[1].available, true);
  assert.equal(calculateDerived(c).defesa, calculateDerived({ ...c, operacoesAS9: undefined, habilidadeEscolhas: [] }).defesa);
});

test("migração do drone legado conserva tipo e perícia sem duplicar Defesa", () => {
  const c = make(); add(c, "Drone de Combate Tático", 2);
  c.inventarioModificacoes[item("Drone de Combate Tático").id] = ITEM_UPGRADES.filter((v) => ["Drone Protetor", "Drone Utilitário"].includes(v.name)).map((v) => v.id);
  c.habilidadeEscolhas = [{ abilityId: item("Drone de Combate Tático").id, type: "pericia", valueId: "Tecnologia" }];
  assert.ok(tacticalDrones(c).every((d) => d.skill === "Tecnologia" && d.types.includes("protetor")));
  assert.equal(calculateDerived(c).defesa, 17);
  go(c, "turn"); assert.equal(calculateDerived(c).defesa, 17);
});

test("cura do drone respeita adjacência, controle, custo e PV máximo; conserta mesmo indisponível", () => {
  const c = droneCharacter(40);
  configure(c, ["medico"]);
  assert.equal(perform(c, "drone", { droneId: "companheiro-1", kind: "heal", self: true }).ok, false);
  go(c, "drone", { droneId: "companheiro-1", kind: "heal", adjacent: true, self: true });
  assert.equal(c.recursos.pvAtual, 54); assert.equal(c.recursos.peAtual, 98);
  configure(c, ["medico"], { operated: false, available: false });
  assert.equal(perform(c, "drone", { droneId: "companheiro-1", kind: "repair" }).ok, false);
  go(c, "drone", { droneId: "companheiro-1", kind: "repair", pieces: true });
  assert.equal(tacticalDrones(c)[0].available, true);
  assert.equal(perform(c, "drone", { droneId: "companheiro-1", kind: "heal", adjacent: true }).ok, false);
});

test("proteção de drone reduz de 3 para 1 PE e efeitos ativos terminam na cena", () => {
  for (const [nex, expected] of [[40, 3], [99, 1]]) {
    const c = droneCharacter(nex); configure(c, ["medico", "espiao"], { operated: false });
    assert.equal(go(c, "drone", { droneId: "companheiro-1", kind: "protect" }).cost, expected);
    configure(c, ["medico", "espiao"]);
    go(c, "drone", { droneId: "companheiro-1", kind: "thermal" }); assert.equal(c.operacoesAS9.effects.length, 1);
    go(c, "scene"); assert.equal(c.operacoesAS9.effects.length, 0);
  }
});

test("drones: testes recebem o auxílio apropriado, falha pode ser refeita uma única vez", () => {
  const c = droneCharacter(99); configure(c, ["medico", "hacker", "utilitario"], { skill: "Tecnologia" });
  const d = "companheiro-1";
  const first = go(c, "test", { skill: "Tecnologia", droneId: d, dt: 20 });
  assert.equal(first.result.rolls.length, 3, "Hacker e Utilitário não acumulam +1d20 na mesma perícia");
  const retry = go(c, "drone", { droneId: d, kind: "utilityRetry" }, () => .99);
  assert.equal(retry.cost, 3); assert.equal(retry.result.total, 25);
  assert.equal(perform(c, "drone", { droneId: d, kind: "retry" }).ok, false);
  go(c, "test", { skill: "Medicina", droneId: d, dt: 10 }); assert.equal(c.operacoesAS9.lastTest.result.bonus, 5);
  assert.equal(c.grausPericia.Medicina, undefined, "Treino fornecido pelo aliado não altera o treino permanente");
});

test("Ás dos Drones refaz ataque sem descontar o tiro ou Metralhar Tudo duas vezes", () => {
  const c = droneCharacter(99); configure(c, ["medico", "atirador"]); add(c, "Pistola Taser"); add(c, "Dardos Condutores");
  go(c, "reload", { itemId: item("Pistola Taser").id });
  go(c, "attack", { itemId: item("Pistola Taser").id, target: "Alfa", dt: 20, droneId: "companheiro-1", machineGun: true, ammoTracking: true });
  const pe = c.recursos.peAtual;
  const retry = go(c, "drone", { droneId: "companheiro-1", kind: "retry" }, () => .99);
  assert.equal(retry.result.hit, true); assert.equal(c.recursos.peAtual, pe - 3);
  assert.equal(c.operacoesAS9.ammo[item("Pistola Taser").id], 9);
  assert.equal(c.controleSessao.historico.at(-1).cost, 3);
});

test("veículo: central soma +5 só no contexto correto, limites se reiniciam com turno/cena", () => {
  const c = droneCharacter(40); configure(c, ["medico", "hacker"]);
  go(c, "vehicle", { central: true, smoke: true });
  assert.equal(go(c, "test", { skill: "Tecnologia", droneId: "companheiro-1", vehicleDrone: true }).result.bonus, 10);
  go(c, "central", { droneId: "companheiro-1" }); assert.equal(perform(c, "central", { droneId: "companheiro-1" }).ok, false);
  go(c, "turn"); go(c, "central", { droneId: "companheiro-1" });
  go(c, "smoke"); assert.equal(perform(c, "smoke").ok, false); go(c, "scene"); go(c, "smoke");
});

test("aliados: Jason reduz dano e Ryder aplica/expira formação sem alterar campos manuais", () => {
  const c = make(); go(c, "ally", { ally: "jason" });
  assert.equal(go(c, "allyUse", { damage: 18 }).result.damage, 8);
  go(c, "ally", { ally: "ryder", skill: "Luta", skill2: "Tática" });
  const defense = calculateDerived(c).defesa;
  go(c, "allyUse", { formation: "cunha" }); assert.equal(calculateDerived(c).defesa, defense + 5);
  go(c, "turn"); assert.equal(calculateDerived(c).defesa, defense);
  assert.equal(c.outrosBonusPericia.Luta, undefined);
});

test("estado, resultado e desfazer sobrevivem ao codec de sincronização; UI escapa entradas", () => {
  const c = make(); go(c, "mark", { target: '<img src=x onerror="1">', vd: 140, visible: true });
  const loaded = decodeDocument(c.id, encodeDocument(c, "automation-rev")).data;
  assert.deepEqual(loaded.operacoesAS9, c.operacoesAS9);
  assert.equal(undoLastUse(loaded).ok, true); assert.equal(loaded.recursos.peAtual, 100);
  assert.doesNotMatch(renderTacticalPanel(c), /<img src=x/); assert.match(renderTacticalPanel(c), /&lt;img/);
  for (const [id] of tacticalActions(c)) assert.equal(typeof tacticalForm(c, id), "string");
});

test("isenções de categoria pertencem ao companheiro e variam por patamar e segundo drone", () => {
  for (const [nex, free] of [[10, 0], [40, 1], [65, 3], [99, 6]]) {
    const c = droneCharacter(nex);
    const types = ["medico", "hacker", "protetor", "atirador", "espiao", "utilitario", "inteligente"];
    configure(c, types.slice(0, free + 1), { skill: "Tecnologia" });
    assert.equal(tacticalDrones(c)[0].category, "III");
    if (free < 6) { configure(c, types.slice(0, free + 2), { skill: "Tecnologia" }); assert.equal(tacticalDrones(c)[0].category, "IV"); }
  }
  const c = droneCharacter(99, true);
  configure(c, ["medico", "hacker", "protetor", "inteligente"]);
  configure(c, ["atirador", "espiao", "hacker", "inteligente"], {}, "companheiro-2");
  assert.ok(tacticalDrones(c).every((d) => d.category === "III"));
});

test("movimento de drone: uma ação por rodada e perda de sinal além de 5 km", () => {
  const c = droneCharacter(); configure(c, ["medico"]);
  go(c, "drone", { droneId: "companheiro-1", kind: "move", moveDistance: 12, fly: true, controllerDistanceKm: 5 });
  assert.equal(perform(c, "drone", { droneId: "companheiro-1", kind: "move", moveDistance: 1 }).ok, false);
  go(c, "turn");
  go(c, "drone", { droneId: "companheiro-1", kind: "move", moveDistance: 6, controllerDistanceKm: 5.1 });
  assert.equal(tacticalDrones(c)[0].available, false);
});

test("hacker anula a penalidade da ação completa, evita rastreamento e refaz usando a mesma informação", () => {
  const c = droneCharacter(); configure(c, ["medico", "hacker"]);
  const d = "companheiro-1";
  let r = go(c, "test", { skill: "Tecnologia", droneId: d, dt: 20, penalty: -5, penaltyDice: -1, hackFast: true });
  assert.equal(r.result.rolls.length, 3); assert.equal(r.result.bonus, 5); assert.equal(r.cost, 2);
  go(c, "drone", { droneId: d, kind: "avoidTrace" });
  assert.equal(perform(c, "drone", { droneId: d, kind: "avoidTrace" }).ok, false);
  assert.equal(perform(c, "drone", { droneId: d, kind: "hackRetry" }).ok, false);
  r = go(c, "drone", { droneId: d, kind: "hackRetry", sameInfo: true }, () => .99);
  assert.equal(r.cost, 0); assert.equal(r.result.total, 25);
});

test("resistência do taser pode ser resolvida depois sem disparo nem gasto adicional", () => {
  const c = make(); add(c, "Pistola Taser"); add(c, "Dardos Condutores");
  const weapon = item("Pistola Taser").id;
  go(c, "reload", { itemId: weapon });
  go(c, "attack", { itemId: weapon, target: "Alfa", dt: 0, ammoTracking: true });
  assert.ok(c.operacoesAS9.taserPending);
  assert.equal(go(c, "taserSave", { fortitude: 0 }).result.stunned, true);
  assert.equal(c.operacoesAS9.ammo[weapon], 9);
  assert.equal(c.operacoesAS9.taserPending, undefined);
  go(c, "turn"); assert.equal(c.operacoesAS9.taserEffects.length, 0); assert.ok(c.operacoesAS9.stunned.includes("Alfa"));
});

test("DMR permite Ataque Furtivo até médio; dano extra não multiplica no crítico", () => {
  const c = make({ classe: "Especialista", trilha: "Infiltrador", nex: 40 }); add(c, "Designated Marksman Rifle");
  const r = go(c, "attack", { itemId: item("Designated Marksman Rifle").id, target: "Alfa", dt: 0, range: "medio", aim: true, sneak: true, vulnerable: true }, () => .99);
  assert.equal(r.result.damage, 72, "6d10 no crítico + 2d6 furtivos");
  assert.equal(r.cost, 1); assert.equal(c.operacoesAS9.sneakUsed, true);
  assert.equal(perform(c, "attack", { itemId: item("Designated Marksman Rifle").id, dt: 0, range: "medio", sneak: true, vulnerable: true }).ok, false);
});

test("aríete e boroscópio verificam posse/contexto e não inventam bônus para a câmera", () => {
  const c = make(); add(c, "Aríete Portátil"); add(c, "Boroscópio Articulado");
  assert.equal(go(c, "test", { skill: "Atletismo", ram: true }).result.bonus, 10);
  assert.equal(perform(c, "test", { skill: "Investigação", borescope: true, scopeDistance: 4, twoHands: true }).ok, false);
  assert.equal(go(c, "test", { skill: "Investigação", borescope: true, scopeDistance: 3, twoHands: true }).result.bonus, 0);
});

test("Chloe concede conjuração e desconto só quando o ritual já era conhecido", () => {
  const c = make(), cloud = RITUALS.find((v) => v.name === "Nuvem de Cinzas");
  go(c, "ally", { ally: "chloe" });
  assert.equal(go(c, "allyUse", { variant: "normal" }).cost, 1, "Nuvem de Cinzas tem custo-base 1 PE");
  c.rituaisSelecionados = [cloud.id];
  assert.equal(ritualUseOptions(c, cloud)[0].cost, Math.max(1, Number(cloud.cost.match(/\d+/)[0]) - 1));
  go(c, "ally", { ally: "ryder", skill: "Luta", skill2: "Tática" });
  go(c, "ally", { ally: "jason" });
  assert.equal(perform(c, "ally", { ally: "ryder", skill: "Reflexos", skill2: "Tática" }).ok, false);
  go(c, "mission"); go(c, "ally", { ally: "ryder", skill: "Reflexos", skill2: "Tática" });
});

test("20 natural tem sucesso mesmo abaixo da DT e não libera repetição de falha", () => {
  const c = droneCharacter(); configure(c, ["medico", "hacker"]);
  const r = go(c, "test", { skill: "Tecnologia", droneId: "companheiro-1", dt: 100 }, () => .99);
  assert.equal(r.result.success, true); assert.equal(r.result.total, 25);
  assert.equal(perform(c, "drone", { droneId: "companheiro-1", kind: "retry" }).ok, false);
  add(c, "Pistola Taser");
  assert.equal(go(c, "attack", { itemId: item("Pistola Taser").id, target: "Alfa", dt: 100, fortitude: 0, fortitudeNatural20: true }, () => .99).result.stunned, false);
});
