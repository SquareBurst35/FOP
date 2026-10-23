import { useAbility, turnSpendLimit, beforeSoBonus } from "./session.js?v=34";
import { ITEM_BY_ID } from "./items.js?v=61";
import { upgradedItem } from "./item-upgrades.js?v=60";
import { SKILLS, abilitySkillBonus, calculateDerived } from "./rules.js?v=73";
import { ritualUseOptions } from "./use-options.js?v=74";
import { SKILL_ATTRIBUTES, RITUALS } from "./content.js?v=58";
import { tacticalDrones, tacticalEffects, progressNex, selectedPower, trailPower, preparedAmmo, pruneTacticalInventory } from "./tactical-state.js?v=1";

const copy = (v) => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
const number = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const int = (v, lo = 0, hi = 1000000) => Math.max(lo, Math.min(hi, Math.trunc(number(v))));
const requireRule = (yes, message) => { if (!yes) throw new Error(message); };
const label = (v) => String(v ?? "").trim().slice(0, 120);
const incursor = (c, n, suffix) => trailPower(c, "Incursor", n, suffix);
const pilot = (c, n, suffix) => trailPower(c, "Piloto de Drone", n, suffix);
export const utilitySkills = SKILLS.filter((s) => !["Fortitude", "Luta", "Pontaria", "Reflexos", "Vontade"].includes(s));
export const ownedItems = (c) => (c.inventarioItens ?? []).filter((v) => number(v.quantity, 1) > 0).map((v) => ({ ...upgradedItem(ITEM_BY_ID.get(v.itemId) ?? { id: v.itemId, details: [] }, c.inventarioModificacoes?.[v.itemId], c), quantity: number(v.quantity, 1) }));
const hasItem = (c, name) => ownedItems(c).some((v) => v.name === name);
const fmj = (c) => c.origem === "Veterano de Conflito Armado" || selectedPower(c, "full-metal-jacket") || (selectedPower(c, "flashback") && (c.habilidadeEscolhas ?? []).some((v) => v.type === "origem" && v.valueId === "Veterano de Conflito Armado"));
export function tacticalState(c) {
  const s = copy(c.operacoesAS9 ?? {});
  return { turn: 1, scene: 1, interlude: 1, effects: [], prepared: {}, hostages: [], stunned: [], dazzled: [], drones: [], ammo: {}, looseDarts: 0, rounds40mm: [], ...s, effects: tacticalEffects(c), drones: tacticalDrones(c) };
}
export function rollDice(count, sides, random = Math.random) {
  return Array.from({ length: int(count, 0, 100) }, () => Math.floor(Math.max(0, Math.min(0.999999999, number(random()))) * sides) + 1);
}
function testProfile(c, p, s) {
  requireRule(SKILLS.includes(p.skill), "Escolha uma perícia válida.");
  const key = p.attribute || ({ AGI: "agilidade", FOR: "forca", INT: "intelecto", PRE: "presenca", VIG: "vigor" }[SKILL_ATTRIBUTES[p.skill]]);
  let dice = int(c.atributos?.[key], -5, 20) + int(p.extraDice, -10, 10);
  let bonus = number(c.grausPericia?.[p.skill]) + number(c.outrosBonusPericia?.[p.skill]) + abilitySkillBonus(c, p.skill) + beforeSoBonus(c) + number(p.extraBonus);
  const d = s.drones.find((v) => v.id === p.droneId && v.available);
  if (p.droneId) requireRule(d, "O drone escolhido está indisponível.");
  const types = d?.types ?? [];
  let medicalTraining = false;
  let droneBonusDie = false;
  if ((types.includes("atirador") && ["Luta", "Pontaria"].includes(p.skill) && p.attack) || (types.includes("espiao") && ["Investigação", "Percepção"].includes(p.skill)) || (types.includes("hacker") && p.skill === "Tecnologia") || (types.includes("utilitario") && p.skill === d.skill) || (types.includes("medico") && p.skill === "Medicina" && number(c.grausPericia?.Medicina) >= 5)) droneBonusDie = true; // Bônus semelhantes de drones não se acumulam.
  if (types.includes("medico") && p.skill === "Medicina" && number(c.grausPericia?.Medicina) < 5) medicalTraining = true;
  if (p.explosives && incursor(c, 40, "entrada-explosiva")) bonus += 5;
  if (p.borescope) requireRule(hasItem(c, "Boroscópio Articulado") && ["Investigação", "Percepção"].includes(p.skill) && number(p.scopeDistance) <= 3 && p.twoHands === true, "Boroscópio exige duas mãos, alcance de 3 m e Investigação ou Percepção.");
  if (p.ram) { requireRule(hasItem(c, "Aríete Portátil"), "Adicione o aríete ao inventário."); bonus += 10; }
  if (p.vehicleDrone) { requireRule(s.vehicle?.central && d && p.skill === "Tecnologia", "A central exige drone, Tecnologia e a regalia ativa."); bonus += 5; }
  if (s.formation && s.formation.untilTurn >= s.turn) {
    if (["cunha", "linha"].includes(s.formation.type) && p.attack) bonus += 5;
    if (s.formation.type === "coluna" && p.skill === "Furtividade") bonus += 5;
  }
  const allySkills = { jason: ["Fortitude"], karen: ["Pontaria"], troy: ["Luta"], roy: ["Medicina"], stella: ["Pilotagem"], chloe: ["Investigação"] };
  if (s.ally && ((allySkills[s.ally] ?? []).includes(p.skill) || (s.ally === "arnold" && p.explosives) || (s.ally === "ryder" && (s.allySkills ?? []).includes(p.skill)))) {
    if (s.ally === "roy" && number(c.grausPericia?.Medicina) < 5) medicalTraining = true;
    else droneBonusDie = true;
  }
  if (medicalTraining) bonus += 5;
  if (droneBonusDie) dice += 1;
  return { dice, bonus };
}
function rollTest(c, p, s, random) {
  const profile = testProfile(c, p, s);
  const rolls = rollDice(profile.dice > 0 ? profile.dice : 2 - profile.dice, 20, random);
  const natural = profile.dice > 0 ? Math.max(...rolls) : Math.min(...rolls);
  const total = natural + profile.bonus;
  return { ...profile, rolls, natural, total, success: p.dt === "" || p.dt == null ? null : natural === 20 || total >= int(p.dt) };
}
const detail = (item, key) => item?.details?.find(([k]) => k === key)?.[1] ?? "";
function damageRoll(expression, critical, random) {
  const m = String(expression).match(/^(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/i);
  requireRule(m, "Este dano precisa ser informado pela mesa.");
  const rolls = rollDice(Number(m[1]) * critical, Number(m[2]), random);
  return { rolls, total: rolls.reduce((a, b) => a + b, 0) + (m[3] === "-" ? -1 : 1) * number(m[4]) };
}
function consumeItem(c, itemId) {
  const entry = c.inventarioItens?.find((v) => v.itemId === itemId && number(v.quantity, 1) > 0);
  requireRule(entry, "Item indisponível no inventário.");
  if (number(entry.quantity, 1) <= 1) c.inventarioItens = c.inventarioItens.filter((v) => v !== entry);
  else entry.quantity -= 1;
}
function activeDrone(s, id) {
  const d = s.drones.find((v) => v.id === id);
  requireRule(d?.available, "Selecione um drone disponível.");
  requireRule(d.types.includes("inteligente") || d.operated, "Opere o controle com duas mãos ou use um drone inteligente.");
  return d;
}
function effect(s, id, values) { s.effects = s.effects.filter((v) => v.id !== id); s.effects.push({ id, scene: s.scene, ...values }); }

export function tacticalActions(c) {
  const out = [ ["test", "Teste de perícia", "Role os dados com os bônus e o contexto escolhidos."], ["incoming", "Receber dano", "Calcule redução, crítico e PV."], ["vehicle", "Configurar veículo", "Marque as regalias disponíveis na operação."], ["ally", "Selecionar aliado", "Benefícios dos aliados Hell Hunters, concedidos pela mesa."], ["turn", "Próximo turno", "Encerra efeitos e libera reações da rodada."], ["scene", "Nova cena", "Encerra os efeitos de cena e reinicia limites."], ["interlude", "Novo interlúdio", "Descarta dados de tática não usados."], ["mission", "Nova missão", "Encerra efeitos e libera novas perícias do aliado Ryder."] ];
  if (c.operacoesAS9?.taserPending) out.push(["taserSave", "Resolver resistência do taser", "Informe Fortitude do alvo já atingido, sem disparar de novo."]);
  if (number(c.grausPericia?.Tática) >= 5) out.push(["analyze", "Analisar Perigo", "Movimento · Tática DT 15 · 1/cena."]);
  if (selectedPower(c, "municiador-ambulante")) out.push(["prepare", "Municiar", "Interlúdio · role a capacidade e prepare os pacotes carregados."]);
  if (selectedPower(c, "tatica-de-abordagem")) out.push(["plan", "Tática de Abordagem", "Interlúdio · Tática DT 10 · 1/interlúdio."]);
  if (number(c.operacoesAS9?.pool) > 0) out.push(["tactic", "Gastar dados de tática", "Reação · teste, dano ou cura do grupo que planejou."]);
  if (selectedPower(c, "ripostar-ousado")) { out.push(["riposte", "Preparar Ripostar Ousado", "Reação especial · 2 PE · antes de saber se o ataque acerta."]); if (c.operacoesAS9?.riposte) out.push(["resolveRiposte", "Resolver Ripostar Ousado", "Informe o resultado do ataque recebido para calcular o contra-ataque."]); }
  if (incursor(c, 40, "entrada-explosiva")) out.push(["deploy", "Implantar explosivo", "1 PE · mina ou carga como movimento."]);
  if (incursor(c, 65, "proteger-refens")) out.push(["hostage", "Proteger Reféns", "Reação · 2 ou 4 PE · até 3 reféns distintos por rodada."]);
  if (incursor(c, 99, "alvo-prioritario")) out.push(["mark", "Alvo-prioritário", "5 PE · escolha o inimigo visível e seu VD."]);
  out.push(["attack", "Atacar com equipamento", "Acerto, crítico e dano com os efeitos aplicáveis do AS #9."]);
  if (hasItem(c, "Machado Tático")) out.push(["axe", "Sacrificar machado no bloqueio", "2 PE · consome um machado · +20 RD neste bloqueio."]);
  if (hasItem(c, "Escudo Balístico LED")) out.push(["cover", "Cobertura do escudo", "Movimento · cobertura leve até se deslocar."], ["flash", "Lanterna do escudo", "Movimento · ofusca por 1 rodada · 1 vez por alvo/cena."]);
  if (hasItem(c, "Lançador de Granadas Portátil")) out.push(["ammo40mm", "Munição de 40 mm", "Cadastre a munição requisitada separadamente, com os dados aprovados pela mesa."]);
  if (hasItem(c, "Pistola Taser") || hasItem(c, "Lançador de Granadas Portátil")) out.push(["reload", "Recarregar arma", "Contagem opcional de dardos ou granada única do lançador portátil."]);
  if (tacticalDrones(c).length) out.push(["droneConfig", "Configurar drone", "Tipo base, modificações, perícia permanente e disponibilidade individuais."], ["drone", "Usar drone", "Ações dos tipos do drone; o custo da trilha é calculado pelo NEX."]);
  if (c.operacoesAS9?.vehicle?.central) out.push(["central", "Guardar/pegar drone", "Livre · uma vez por rodada na central."]);
  if (c.operacoesAS9?.vehicle?.smoke) out.push(["smoke", "Lançadores de Fumaça", "Movimento · uma vez por cena · nuvem de fumaça ao redor do veículo."]);
  if (c.operacoesAS9?.ally) out.push(["allyUse", "Usar benefício do aliado", "Ação, custo e resultado conforme o aliado selecionado."]);
  if (c.operacoesAS9?.cover) out.push(["move", "Registrar deslocamento", "Encerra a cobertura leve do escudo."]);
  return out;
}

// Transação em uma cópia: falhas de validação ou falta de PE não deixam alterações parciais.
const RETRY = Symbol("same attack retry");
export function performTacticalAction(character, action, p = {}, random = Math.random, retryToken) {
  try {
    requireRule(tacticalActions(character).some(([id]) => id === action), "A ação não está disponível para esta ficha.");
    const c = copy(character);
    let s = tacticalState(c);
    const replay = retryToken === RETRY;
    c.operacoesAS9 = s;
    let cost = 0, result = {}, message = "", name = tacticalActions(character).find(([id]) => id === action)[1];
    if (action === "turn") {
      s.turn += 1; s.hostages = []; s.specialReaction = false; s.centralUsed = false; s.sneakUsed = false; delete s.riposte;
      s.effects = s.effects.filter((e) => e.untilTurn == null || e.untilTurn >= s.turn);
      if (s.formation?.untilTurn < s.turn) delete s.formation;
      s.taserEffects = (s.taserEffects ?? []).filter((v) => v.untilTurn >= s.turn);
      s.dazzled = s.dazzled.map((v) => ({ ...v, active: v.untilTurn >= s.turn }));
      message = `Turno ${s.turn}.`;
    } else if (action === "scene" || action === "interlude" || action === "mission") {
      s.scene += 1; s.turn = 1; s.hostages = []; s.stunned = []; s.dazzled = []; s.effects = []; s.specialReaction = false; s.centralUsed = false; s.sneakUsed = false; s.analyzed = false; s.smokeUsed = false; s.arnoldUsed = false;
      delete s.riposte; delete s.taserPending; s.taserEffects = []; delete s.cover; delete s.formation; delete s.lastTest;
      if (action === "interlude" || action === "mission") { s.interlude += 1; s.pool = 0; s.planMade = false; s.preparationCapacity = 0; delete s.plan; }
      if (action === "mission") { delete s.ryderSkills; delete s.allySkills; delete s.ally; delete s.priority; }
      message = action === "interlude" || action === "mission" ? "Novo interlúdio; dados de tática anteriores descartados." : `Cena ${s.scene}.`;
    } else if (action === "analyze" || action === "plan") {
      const analysis = action === "analyze";
      requireRule(analysis ? !s.analyzed : !s.planMade, "Esta ação já foi feita nesta cena.");
      requireRule(number(c.grausPericia?.Tática) >= (analysis ? 5 : 10), "Treinamento insuficiente em Tática.");
      if (!analysis) requireRule(number(c.atributos?.intelecto) >= 1 && label(p.target), "Informe a ameaça específica do plano.");
      const roll = p.roll === "" || p.roll == null ? rollTest(c, { skill: "Tática" }, s, random) : { total: int(p.roll, -99, 999) };
      const dt = analysis ? 15 : 10, bonus = roll.total >= dt ? (analysis ? 2 : 1) + Math.floor((roll.total - dt) / 5) : 0;
      if (analysis) { s.analyzed = true; if (bonus) effect(s, "analyze", { name: "Analisar Perigo", tests: bonus, defense: bonus, untilTurn: s.turn + 1 }); }
      else { s.planMade = true; s.pool = bonus; s.plan = { target: label(p.target), participants: [...new Set([label(c.nome) || "Você", ...String(p.participants ?? "").split(",").map(label).filter(Boolean)])] }; }
      result = { ...roll, bonus }; message = `Tática ${roll.total} × DT ${dt}: ${bonus ? (analysis ? `+${bonus} em testes e Defesa até o fim do próximo turno.` : `${bonus}d6 de tática disponíveis.`) : "falha."}`;
    } else if (action === "prepare") {
      requireRule(number(c.atributos?.intelecto) >= 2, "Municiador exige Intelecto 2.");
      if (p.mode === "roll") {
        const rolls = rollDice(c.atributos.intelecto, 6, random); s.preparationCapacity = rolls.reduce((a, b) => a + b, 0);
        result = { rolls }; message = `Municiar: ${rolls.join(" + ")} = ${s.preparationCapacity} pacotes para preparar nesta ação de interlúdio.`;
      } else {
        const item = ownedItems(c).find((v) => v.id === p.itemId && v.group === "Munições");
        const count = int(p.count, 1, 99), already = preparedAmmo(c, p.itemId, item?.quantity);
        requireRule(item && count <= item.quantity - already && count <= number(s.preparationCapacity), "Selecione pacotes carregados e role capacidade suficiente primeiro.");
        s.prepared[item.id] = already + count; s.preparationCapacity -= count;
        message = `${count} pacote(s) de ${item.name} preparado(s), sem ocupar espaço.`;
      }
    } else if (action === "tactic") {
      const count = int(p.count, 1, 100), target = label(p.target);
      requireRule(["teste", "dano", "cura"].includes(p.kind) && s.plan?.participants.includes(target), "Escolha um participante do planejamento e o tipo de bônus.");
      requireRule(p.related === true && count <= number(s.pool), "Confirme a relação com a ameaça planejada e use apenas dados disponíveis.");
      const rolls = rollDice(count, 6, random), total = rolls.reduce((a, b) => a + b, 0);
      s.pool -= count; result = { rolls, total, final: number(p.baseTotal) + total, target, kind: p.kind }; message = `${target}: +${total} em ${p.kind} (${rolls.join(" + ")}); restam ${s.pool}d6. Total com o valor-base: ${result.final}.`;
      if (p.kind === "cura" && p.self === true && target === (label(c.nome) || "Você")) c.recursos.pvAtual = Math.min(number(c.recursos.pvMax), number(c.recursos.pvAtual) + result.final);
    } else if (action === "riposte") {
      requireRule(!s.specialReaction && p.before === true && number(c.atributos?.agilidade) >= 2 && number(c.grausPericia?.Luta) >= 5, "Exige AGI 2, Luta treinada, reação disponível e ativação antes de saber o acerto.");
      cost = 2; s.specialReaction = true; s.riposte = { turn: s.turn, defense: calculateDerived(c).defesa + 5 };
      message = `Defesa ${s.riposte.defense} contra este ataque; depois, resolva o contra-ataque.`;
    } else if (action === "resolveRiposte") {
      requireRule(s.riposte?.turn === s.turn, "Prepare a reação antes de resolver o ataque recebido.");
      const missed = !p.incomingNatural20 && number(p.incoming) < s.riposte.defense;
      delete s.riposte;
      if (!missed && p.applyIncoming) c.recursos.pvAtual = Math.max(0, number(c.recursos.pvAtual) - int(p.incomingDamage));
      const counter = performTacticalAction(c, "attack", { ...p, counterAttack: true, bonus: missed ? 5 : 0 }, random);
      requireRule(counter.ok, counter.message); c.controleSessao.historico.pop(); s = c.operacoesAS9;
      result = counter.result; message = `${missed ? "O ataque recebido errou: +5 no contra-ataque." : "O ataque recebido acertou."} ${counter.message}`;
    } else if (action === "hostage") {
      const target = label(p.target);
      requireRule(target && p.distance !== "" && p.distance != null && number(p.distance) <= 3 && number(p.distance) >= 0, "Informe um refém protegido a até 3 m.");
      requireRule(s.hostages.includes(target) || s.hostages.length < 3, "Você já protegeu três reféns diferentes nesta rodada.");
      requireRule(!p.half || p.damageEffect, "A redução adicional só se aplica a dano.");
      cost = p.half ? 4 : 2; s.hostages = [...new Set([...s.hostages, target])];
      const damage = p.damageEffect ? Math.floor(int(p.damage) / (p.half ? 2 : 1)) : 0;
      if (p.damageEffect) c.recursos.pvAtual = Math.max(0, number(c.recursos.pvAtual) - damage);
      result = { damage, target }; message = `${target} protegido: você recebe ${p.damageEffect ? `${damage} de dano` : label(p.effect) || "o efeito negativo"}.`;
    } else if (action === "mark") {
      requireRule(label(p.target) && p.visible === true && p.vd != null && p.vd !== "" && number(p.vd) >= 0, "Informe o inimigo visível e o VD informado pelo mestre.");
      cost = 5; s.priority = { target: label(p.target), vd: int(p.vd) }; message = `${s.priority.target}: ${s.priority.vd <= 200 ? "qualquer dano seu reduz os PV a 0" : "+5 na margem de ameaça"}.`;
    } else if (action === "test" || action === "attack") {
      let weapon, penalty = int(p.penalty, -99, 0), extraDice = int(p.penaltyDice, -10, 0), skill = p.skill, extraBonus = int(p.bonus, -999, 999);
      if (action === "attack") {
        requireRule(p.dt !== "" && p.dt != null, "Informe a Defesa do alvo.");
        weapon = ownedItems(c).find((v) => v.id === p.itemId && v.group === "Armas"); requireRule(weapon, "Escolha uma arma do inventário.");
        skill = /balístico|fogo|disparo|fuzil|pistola|metralhadora|espingarda|arco|besta|balestra|bazuca|lançador|lança-chamas/i.test(`${weapon.name} ${detail(weapon, "Tipo")} ${weapon.summary}`) ? "Pontaria" : "Luta";
        if (weapon.upgrades?.some((v) => ["Alongada", "Certeira"].includes(v.name))) extraBonus += 2;
        if (p.counterAttack) { requireRule(skill === "Luta", "Contra-ataque exige arma corpo a corpo."); if (weapon.name === "Machado Tático") extraBonus += 2; }
        if (p.thrown) skill = "Pontaria";
        if (p.engaged && skill === "Pontaria") penalty -= 5;
        if (p.movingVehicle) { if (!(s.vehicle?.station && p.mounted)) penalty += int(p.vehiclePenalty, -99, 0); else requireRule(/duas/i.test(detail(weapon, "Empunhadura")) && /fogo/i.test(`${weapon.summary} ${detail(weapon, "Tipo")} ${detail(weapon, "Proficiência")}`), "A estação exige arma de fogo de duas mãos."); }
        if (p.cqb) { requireRule(incursor(c, 10, "cqb") && p.engaged && skill === "Pontaria", "CQB só anula a penalidade de alvo engajado."); penalty += 5; cost += 1; }
        if (p.intuitive) { requireRule(selectedPower(c, "tiro-intuitivo") && !p.aim && skill === "Pontaria" && number(c.grausPericia?.Pontaria) >= 10, "Tiro Intuitivo exige Pontaria veterana e ataque à distância sem mirar."); cost += 2; }
      }
      if (p.fmj) { requireRule(fmj(c) && ["Luta", "Pontaria"].includes(skill) && (penalty < 0 || extraDice < 0), "Full Metal Jacket exige penalidade em Luta ou Pontaria."); cost += 2; penalty = 0; extraDice = 0; }
      if (p.alert) { const d = activeDrone(s, p.droneId); requireRule(d.types.includes("protetor") && ["Fortitude", "Reflexos", "Vontade"].includes(skill), "Alerta exige drone protetor e teste de resistência."); cost += 2; extraBonus += 5; }
      if (p.hackFast) { const d = activeDrone(s, p.droneId); requireRule(d.types.includes("hacker") && skill === "Tecnologia", "Acelerar exige drone hacker e Tecnologia."); cost += 2; extraDice = 0; penalty = 0; /* Só marque a penalidade por hackear como ação completa. */ }
      if (p.agile) requireRule(weapon && /ágil/i.test(`${detail(weapon, "Empunhadura")} ${weapon.summary}`) && skill === "Luta", "Agilidade em Luta exige uma arma ágil.");
      const params = { ...p, attribute: p.agile ? "agilidade" : undefined, skill, attack: action === "attack", extraBonus: extraBonus + penalty, extraDice };
      result = p.area && weapon?.name === "Lançador de Granadas Portátil" ? { rolls: [], natural: 0, total: 0, bonus: 0 } : rollTest(c, params, s, random);
      s.lastTest = { params, originalParams: copy(p), result, dt: p.dt === "" || p.dt == null ? null : int(p.dt), rerolled: false, action };
      message = `${skill}: [${result.rolls.join(", ")}] ${result.bonus >= 0 ? "+" : ""}${result.bonus} = ${result.total}${p.dt !== "" && p.dt != null ? ` × DT ${int(p.dt)}: ${result.success ? "sucesso" : "falha"}${result.natural === 20 ? " (20 natural)" : ""}` : ""}.`;
      if (action === "attack") {
        let damage = 0, formula = detail(weapon, "Dano"), critical = String(detail(weapon, "Crítico"));
        const priority = s.priority?.target === label(p.target) ? s.priority : null;
        let margin = number(critical.match(/^(\d+)/)?.[1], 20) - (p.intuitive ? 2 : 0) - (priority?.vd >= 201 ? 5 : 0);
        if (/Designated Marksman|DMR/i.test(weapon.name) && p.aim && number(c.grausPericia?.Pontaria) >= 10) margin -= 5;
        const hit = !p.area && (result.natural === 20 || result.total >= int(p.dt)), crit = hit && result.natural >= margin;
        if (weapon.name === "Pistola Taser" && p.ammoTracking && !replay) { requireRule(number(s.ammo[weapon.id]) >= 1, "Recarregue a pistola taser antes de disparar."); s.ammo[weapon.id] -= 1; }
        if (weapon.name === "Lançador de Granadas Portátil") {
          if (replay) formula = p.damageFormula;
          else {
            const loaded = s.ammo[weapon.id]; requireRule(loaded?.damageFormula, "Carregue uma granada 40 mm antes de disparar.");
            formula = loaded.damageFormula; delete s.ammo[weapon.id];
          }
          s.lastTest.damageFormula = formula;
        }
        let extra = 0;
        if (p.machineGun) { const d = activeDrone(s, p.droneId); requireRule(d.types.includes("atirador"), "Metralhar Tudo exige drone atirador operado."); cost += 2; if (hit) extra = rollDice(2, 8, random).reduce((a, b) => a + b, 0); }
        if (hit || p.area) {
          const rolled = damageRoll(p.damageFormula && weapon.name !== "Lançador de Granadas Portátil" ? p.damageFormula : formula || p.damageFormula, crit ? number(critical.match(/x(\d+)/i)?.[1], 2) : 1, random);
          if (p.sneak) {
            requireRule(((c.classe === "Especialista" && c.trilha === "Infiltrador" && progressNex(c) >= 10) || selectedPower(c, "ataque-furtivo")) && !s.sneakUsed && p.vulnerable === true, "Ataque Furtivo exige a habilidade, alvo desprevenido/flanqueado e só ocorre uma vez por rodada.");
            requireRule(["curto", "medio"].includes(p.range) && (p.range !== "medio" || weapon.name === "Designated Marksman Rifle"), "O DMR permite Ataque Furtivo até alcance médio.");
            const n = c.optionalRules?.separateLevelNex ? number(c.nivel) * 5 : number(c.nex);
            extra += rollDice(n >= 99 ? 4 : n >= 65 ? 3 : n >= 40 ? 2 : 1, 6, random).reduce((a,b) => a+b, 0); cost += 1; s.sneakUsed = true;
          }
          damage = Math.max(0, rolled.total + extra + ((skill === "Luta" || p.thrown) ? number(c.atributos?.forca) : 0) + int(p.damageBonus, -999, 999) + (s.formation?.type === "linha" && s.formation.untilTurn >= s.turn ? 5 : 0));
          if (weapon.name === "Espingarda Serrada" && ["medio", "longo", "extremo"].includes(p.range)) damage = Math.floor(damage / 2);
          damage = Math.max(0, damage - int(p.targetReduction));
          result.damageRolls = rolled.rolls;
        }
        const targetPv = priority?.vd <= 200 && damage > 0 ? 0 : Math.max(0, int(p.targetPv) - damage);
        result = { ...result, hit, crit, margin, damage, targetPv };
        s.lastTest.attackResult = result;
        message += ` ${hit ? `Acerto${crit ? " crítico" : ""}` : "Erro"}; ameaça ${margin}; dano ${damage}${p.targetPv !== "" && p.targetPv != null ? `; alvo fica com ${targetPv} PV` : ""}.`;
        if (priority?.vd <= 200 && damage > 0) { message += " Alvo-prioritário eliminado (0 PV)."; delete s.priority; }
        if (weapon.name === "Lançador de Granadas Portátil") message += p.area ? " Disparo em ponto: todos fazem a resistência da granada." : hit ? " O alvo atingido diretamente não faz o teste de resistência da granada; demais alvos fazem normalmente." : " Resolva a dispersão e as resistências da granada com a mesa.";
        if (hit && weapon.name === "Pistola Taser") {
          const target = label(p.target); requireRule(target, "Identifique o alvo para acompanhar a imunidade ao atordoamento.");
          const dt = 10 + turnSpendLimit(c) + number(c.atributos?.agilidade); // DT de atributo: 10 + limite de PE + atributo.
          const immune = s.stunned.includes(target) && !p.waiveStun;
          const stun = !immune && !p.fortitudeNatural20 && p.fortitude !== "" && p.fortitude != null && number(p.fortitude) < dt;
          if (stun) { s.stunned.push(target); s.taserEffects = [...(s.taserEffects ?? []), { target, untilTurn: s.turn }]; }
          if (!immune && (p.fortitude === "" || p.fortitude == null)) s.taserPending = { target, dt };
          else delete s.taserPending;
          result.stunDt = dt; result.stunned = stun;
          message += immune ? " Alvo já atordoado nesta cena: imune ao novo atordoamento." : ` Fortitude DT ${dt}${p.fortitude === "" || p.fortitude == null ? " para evitar atordoamento por 1 rodada (informe o resultado em uma resolução da mesa)" : stun ? ": atordoado por 1 rodada" : ": evitou o atordoamento"}.`;
        }
      }
    } else if (action === "taserSave") {
      requireRule(s.taserPending && p.fortitude !== "" && p.fortitude != null, "Informe o resultado de Fortitude do alvo.");
      const { target, dt } = s.taserPending;
      const stun = (!s.stunned.includes(target) || p.waiveStun) && !p.fortitudeNatural20 && number(p.fortitude) < dt;
      if (stun) { s.stunned = [...new Set([...s.stunned, target])]; s.taserEffects = [...(s.taserEffects ?? []), { target, untilTurn: s.turn }]; }
      delete s.taserPending; result = { stunned: stun, stunDt: dt }; message = `${target}: Fortitude ${number(p.fortitude)} × DT ${dt}; ${stun ? "atordoado por 1 rodada" : "não fica atordoado"}.`;
    } else if (action === "incoming" || action === "axe") {
      let damage = int(p.damage), extra = Math.min(damage, int(p.extraDamage)), ignored = false, reduction = int(p.reduction);
      if (action === "axe") { requireRule(!s.specialReaction, "Reação especial de defesa já usada nesta rodada."); cost = 2; consumeItem(c, ownedItems(c).find((v) => v.name === "Machado Tático").id); reduction += 20; s.specialReaction = true; }
      if (p.helmet) { requireRule(hasItem(c, "Capacete Tático") && extra > 0, "O capacete só verifica dano adicional de crítico ou ataque furtivo."); const rolled = rollDice(1, 4, random)[0]; ignored = rolled === 1; result.helmetDie = rolled; if (ignored) damage -= extra; }
      if (p.ballistic && hasItem(c, "Escudo Balístico LED")) reduction = Math.max(reduction, 10);
      damage = Math.max(0, damage - reduction); c.recursos.pvAtual = Math.max(0, number(c.recursos.pvAtual) - damage);
      result = { ...result, damage, ignored }; message = `${ignored ? `Capacete ignorou ${extra} de dano adicional. ` : ""}RD ${reduction}; sofre ${damage} de dano; ${c.recursos.pvAtual} PV atuais.`;
    } else if (action === "deploy") {
      const item = ownedItems(c).find((v) => v.id === p.itemId && /mina antipessoal|carga de arrombamento/i.test(v.name));
      requireRule(item, "Selecione uma mina antipessoal ou carga de arrombamento carregada."); cost = 1; consumeItem(c, item.id); message = `${item.name} implantada como movimento; +5 no teste para implantar/utilizar.`;
    } else if (action === "cover") { s.cover = true; message = "Cobertura leve: +5 Defesa contra ataques à distância para você e seres Médios ou menores atrás do escudo; termina ao se deslocar.";
    } else if (action === "move") { s.cover = false; message = "Deslocamento registrado; cobertura do escudo encerrada.";
    } else if (action === "flash") {
      const target = label(p.target); requireRule(target && number(p.distance) <= 9 && number(p.distance) >= 0 && p.shortRange === true, "Escolha um alvo em alcance curto e dentro do cone de 9 m.");
      requireRule(!s.dazzled.some((v) => v.target === target), "Este alvo já está imune à lanterna nesta cena.");
      s.dazzled.push({ target, untilTurn: s.turn, active: true }); message = `${target}: ofuscado por 1 rodada; imune à lanterna pelo resto da cena.`;
    } else if (action === "ammo40mm") {
      requireRule(label(p.name) && /^[0-9]+d[0-9]+(?:\s*[+-]\s*[0-9]+)?$/i.test(p.damageFormula) && ["0", "I", "II", "III", "IV"].includes(p.category), "Informe nome, dano em dados e categoria da munição de 40 mm segundo a referência da mesa.");
      requireRule(p.confirm40mm === true && p.spaces !== "", "Confirme que esta é munição própria de 40 mm, requisitada separadamente, e informe os espaços.");
      const entry = { name: label(p.name), damageFormula: p.damageFormula, quantity: int(p.count, 1, 99), category: p.category, spaces: Math.max(0, Math.min(99, number(p.spaces))) };
      s.rounds40mm.push(entry); message = `${entry.quantity} unidade(s) de ${entry.name}, 40 mm, adicionada(s) à carga; dano e categoria conforme os dados da mesa.`;
    } else if (action === "reload") {
      const weapon = ownedItems(c).find((v) => v.id === p.itemId);
      if (weapon?.name === "Pistola Taser") {
        const needed = 10 - int(s.ammo[weapon.id], 0, 10);
        requireRule(needed > 0, "O carregador já está cheio.");
        if (s.looseDarts < needed) { const darts = ownedItems(c).find((v) => v.name === "Dardos Condutores"); requireRule(darts, "Você precisa de um pacote de dardos."); s.looseDartsPrepared = preparedAmmo(c, darts.id, darts.quantity) >= darts.quantity; consumeItem(c, darts.id); s.looseDarts += 20; }
        s.looseDarts -= needed; s.ammo[weapon.id] = 10; message = `Pistola taser: 10 dardos carregados; ${s.looseDarts} dardos de reserva fora dos pacotes.`;
      } else {
        requireRule(weapon?.name === "Lançador de Granadas Portátil" && !s.ammo[weapon.id], "Selecione um lançador portátil descarregado.");
        requireRule(/^\d+$/.test(String(p.ammoId)), "Escolha a munição de 40 mm cadastrada.");
        const grenade = s.rounds40mm[int(p.ammoId)]; requireRule(grenade?.quantity > 0, "Cadastre primeiro a munição requisitada em Munição de 40 mm. Granadas de arremesso não são compatíveis.");
        grenade.quantity -= 1; s.ammo[weapon.id] = { name: grenade.name, damageFormula: grenade.damageFormula }; message = `${grenade.name} de 40 mm carregada no lançador (1 disparo), com ação de movimento.`;
      }
    } else if (action === "droneConfig") {
      const d = s.drones.find((v) => v.id === p.droneId); requireRule(d, "Selecione um drone.");
      const types = [...new Set(Array.isArray(p.types) ? p.types : [])];
      requireRule(types.length > 0 && types.every((v) => ["atirador", "espiao", "hacker", "inteligente", "medico", "protetor", "utilitario"].includes(v)), "Selecione pelo menos um tipo de drone.");
      requireRule(!d.types[0] || types[0] === d.types[0], "O primeiro tipo é a base permanente deste drone; mantenha-o como primeira escolha.");
      if (types.includes("utilitario")) requireRule(utilitySkills.includes(p.skill) && (!d.skill || d.skill === p.skill), "Escolha uma perícia permitida e mantenha a escolha permanente.");
      Object.assign(d, { types, name: label(p.name) || d.name, skill: d.skill || (types.includes("utilitario") ? p.skill : ""), available: p.available === true, operated: p.operated === true });
      message = `${d.name} configurado individualmente.`;
    } else if (action === "drone") {
      const kind = p.kind;
      const d = ["repair", "replace", "protect"].includes(kind) ? s.drones.find((v) => v.id === p.droneId) : activeDrone(s, p.droneId);
      requireRule(d, "Selecione um drone.");
      const typeFor = { heal: "medico", thermal: "espiao", arms: "inteligente", utilityRetry: "utilitario", hackRetry: "hacker", avoidTrace: "hacker" };
      if (typeFor[kind]) requireRule(d.types.includes(typeFor[kind]), "Este drone não possui o tipo necessário.");
      if (kind === "protect") { requireRule(d.available && pilot(c, 40, "protetor-dos-drones"), "Exige drone disponível e Protetor dos Drones."); cost = pilot(c, 99, "mestre-dos-drones") ? 1 : 3; message = `Efeito negativo evitado em ${d.name}.`;
      } else if (kind === "repair" || kind === "replace") {
        requireRule(d.companion && pilot(c, 10, "companheiro-drone") && (kind === "replace" || p.pieces === true), "Conserto exige peças do companheiro; reposição custa duas ações de interlúdio.");
        d.available = true; message = `${d.name} ${kind === "repair" ? "consertado: 1 ação" : "substituído: 2 ações"} de interlúdio.`;
      } else if (kind === "move") {
        const distance = int(p.moveDistance, 0, p.fly ? 12 : 6);
        requireRule(d.movedTurn !== `${s.scene}:${s.turn}` && number(p.moveDistance) <= (p.fly ? 12 : 6) && number(p.moveDistance) > 0, "O drone tem uma ação de movimento por rodada: até 6 m no solo ou 12 m voando.");
        d.movedTurn = `${s.scene}:${s.turn}`; d.controllerDistanceKm = Math.max(0, number(p.controllerDistanceKm));
        if (d.controllerDistanceKm > 5) { d.available = false; message = `${d.name} deslocou ${distance} m e perdeu o sinal além de 5 km do controle.`; }
        else message = `${d.name} deslocou ${distance} m ${p.fly ? "voando" : "no solo"}; movimento desta rodada usado.`;
      } else if (kind === "heal") {
        requireRule(p.adjacent === true && (p.self === true || label(p.target)), "Informe um alvo adjacente ao drone, ou marque a cura em você."); cost = 2; const rolls = rollDice(2, 8, random), total = rolls.reduce((a, b) => a + b, 2);
        if (p.self) c.recursos.pvAtual = Math.min(number(c.recursos.pvMax), number(c.recursos.pvAtual) + total);
        result = { rolls, total }; message = `${p.self ? "Você recupera" : `${label(p.target) || "Alvo"} recupera`} ${total} PV (2d8+2)${p.self ? `; ${c.recursos.pvAtual}/${c.recursos.pvMax}` : "; aplique na ficha do alvo"}.`;
      } else if (kind === "thermal" || kind === "arms") {
        cost = 2; effect(s, `${kind}:${d.id}`, { name: `${d.name}: ${kind === "thermal" ? "visão térmica e interceptação de rádio" : "braços manipuladores, até 5 espaços"}`, droneId: d.id }); message = "Efeito do drone ativo até o fim da cena.";
      } else if (["retry", "utilityRetry", "hackRetry", "avoidTrace"].includes(kind)) {
        const last = s.lastTest;
        requireRule(last && last.dt != null && last.params.droneId === d.id && last.result.success === false, "Registre primeiro um teste falho com este drone e a DT.");
        if (kind === "avoidTrace") { requireRule(last.params.skill === "Tecnologia" && last.dt - last.result.total >= 5 && !last.traceAvoided, "Evitar rastreamento exige falha por 5+ e só pode ser aplicado uma vez."); cost = 3; last.traceAvoided = true; message = "Rastreamento evitado após a falha no hack.";
        } else {
          requireRule(!last.rerolled && !last.params.area, "Esta tentativa já foi refeita ou não era um teste; não encadeie novas tentativas.");
          if (kind === "retry") { requireRule(pilot(c, 65, "as-dos-drones"), "Exige Ás dos Drones."); cost = 3; }
          if (kind === "utilityRetry") { requireRule(last.params.skill === d.skill, "Use a perícia permanente do drone utilitário."); cost = 3; }
          if (kind === "hackRetry") requireRule(last.params.skill === "Tecnologia" && p.sameInfo === true, "A nova tentativa de hack exige a mesma informação.");
          if (last.action === "attack") {
            const retried = performTacticalAction(c, "attack", { ...last.originalParams, damageFormula: last.damageFormula || last.originalParams.damageFormula }, random, RETRY);
            requireRule(retried.ok, retried.message);
            c.controleSessao.historico.pop(); s = c.operacoesAS9;
            result = retried.result; s.lastTest.rerolled = true; message = `Nova tentativa do ataque: ${retried.message}`;
          } else { result = rollTest(c, last.params, s, random); last.result = result; last.rerolled = true; message = `Nova tentativa: ${result.total} × DT ${last.dt}: ${result.success ? "sucesso" : "falha"}.`; }
        }
      } else throw new Error("Escolha uma ação válida do drone.");
    } else if (action === "vehicle") {
      s.vehicle = { central: p.central === true, station: p.station === true, smoke: p.smoke === true }; message = "Regalias do veículo atualizadas.";
    } else if (action === "central") {
      requireRule(!s.centralUsed && s.drones.some((v) => v.id === p.droneId), "A central já foi usada nesta rodada ou o drone não existe."); s.centralUsed = true; message = "Drone guardado/pego com ação livre; central usada nesta rodada.";
    } else if (action === "smoke") {
      requireRule(!s.smokeUsed, "Lançadores de Fumaça já usados nesta cena."); s.smokeUsed = true; effect(s, "smoke", { name: "Fumaça ao redor do veículo — aplique os efeitos de granada de fumaça à área" }); message = "Lançadores acionados como movimento.";
    } else if (action === "ally") {
      requireRule(["", "jason", "karen", "troy", "roy", "stella", "arnold", "chloe", "ryder"].includes(p.ally), "Selecione um aliado válido.");
      if (p.ally === "ryder") requireRule(SKILLS.includes(p.skill) && SKILLS.includes(p.skill2) && p.skill !== p.skill2 && (!s.ryderSkills || s.ryderSkills.join() === [p.skill, p.skill2].join()), "Ryder concede duas perícias diferentes, fixas durante a missão.");
      if (p.ally === "ryder") s.ryderSkills = [p.skill, p.skill2];
      s.ally = p.ally; s.allySkills = p.ally === "ryder" ? [p.skill, p.skill2] : []; message = p.ally ? "Aliado disponível; seus benefícios entram nos testes desta operação." : "Aliado removido.";
    } else if (action === "allyUse") {
      if (s.ally === "jason") { cost = 2; const damage = Math.max(0, int(p.damage) - 10); c.recursos.pvAtual = Math.max(0, number(c.recursos.pvAtual) - damage); result.damage = damage; message = `Jason reduziu 10; você sofreu ${damage} de dano.`;
      } else if (s.ally === "karen") { cost = 2; result.total = rollDice(3, 6, random).reduce((a, b) => a + b, 0); result.final = int(p.baseTotal) + result.total; message = `+${result.total} de dano no ataque que causou dano; total ${result.final} com o dano-base.`;
      } else if (s.ally === "troy") { cost = 5; message = "Reação: realize um ataque adicional.";
      } else if (s.ally === "roy") { requireRule(p.self === true || (p.adjacent === true && label(p.target)), "Informe um alvo adjacente para a habilidade do Roy, ou escolha você."); result.total = p.removeCondition ? 0 : rollDice(3, 10, random).reduce((a, b) => a + b, 0); if (p.self && !p.removeCondition) c.recursos.pvAtual = Math.min(number(c.recursos.pvMax), number(c.recursos.pvAtual) + result.total); message = `${p.removeCondition ? "Remova uma condição, exceto morrendo" : `${result.total} PV recuperados`}. O quadro de aliado não especifica custo/ação: use a decisão da mesa.`;
      } else if (s.ally === "stella") { requireRule(s.lastTest?.params.skill === "Pilotagem" && s.lastTest.dt != null && s.lastTest.result.success === false && !s.lastTest.rerolled, "Registre um teste falho de Pilotagem ainda não refeito."); cost = 2; result = rollTest(c, s.lastTest.params, s, random); s.lastTest.rerolled = true; s.lastTest.result = result; message = `Pilotagem refeita: ${result.total} × DT ${s.lastTest.dt}.`;
      } else if (s.ally === "arnold") { requireRule(!s.arnoldUsed, "Explosivo de Arnold já recebido nesta cena."); const item = ITEM_BY_ID.get(p.itemId); requireRule(item && /granada|explosivo|mina antipessoal|carga de arrombamento/i.test(item.name), "Escolha um explosivo."); cost = 2; s.arnoldUsed = true; c.inventarioItens ??= []; const existing = c.inventarioItens.find((v) => v.itemId === item.id); if (existing) existing.quantity = int(existing.quantity, 1, 98) + 1; else c.inventarioItens.push({ itemId: item.id, quantity: 1 }); message = `${item.name} recebida de Arnold.`;
      } else if (s.ally === "ryder") { requireRule(["cunha", "coluna", "linha"].includes(p.formation), "Escolha uma formação."); cost = 2; s.formation = { type: p.formation, untilTurn: s.turn }; message = `Formação ${p.formation} ativa até o início do seu próximo turno; aplique os benefícios também aos aliados participantes.`;
      } else {
        const ritual = RITUALS.find((v) => v.name === "Nuvem de Cinzas");
        const option = ritualUseOptions(c, ritual).find((v) => v.id === (p.variant || "normal"));
        requireRule(option && !option.disabled && option.cost != null, option?.reason || "Escolha uma forma válida de Nuvem de Cinzas.");
        cost = option.cost; effect(s, "chloe-cloud", { name: `Nuvem de Cinzas · ${option.label} · camuflagem na área conforme o ritual` }); message = `Nuvem de Cinzas (${option.label}) conjurada com ajuda de Chloe por ${cost} PE. Aplique a área e camuflagem da forma escolhida.`;
      }
    }
    pruneTacticalInventory(c);
    for (const id of Object.keys(s.prepared)) { const q = c.inventarioItens?.find((v) => v.itemId === id)?.quantity ?? 0; s.prepared[id] = preparedAmmo(c, id, q); }
    s.lastResult = { action, name, message, result, at: new Date().toISOString() };
    if (replay) cost = 0;
    const use = useAbility(c, { id: `as9-${action}`, name, cost, resource: "effort", type: "operação", variant: message });
    if (!use.ok) return use;
    const fields = ["operacoesAS9", "inventarioItens", "inventarioModificacoes", "recursos.pvAtual"];
    const get = (obj, path) => path.split(".").reduce((v, k) => v?.[k], obj);
    use.record.as9Changes = fields.filter((path) => JSON.stringify(get(character, path)) !== JSON.stringify(get(c, path))).map((path) => ({ path, before: copy(get(character, path)) ?? null, after: copy(get(c, path)) ?? null }));
    Object.assign(character, c);
    return { ok: true, message, result, cost, record: use.record };
  } catch (error) { return { ok: false, message: error.message }; }
}
