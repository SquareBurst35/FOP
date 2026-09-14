import { slug, sourceFor } from './schema.js';
import { finite, integer, die, roll, transaction } from './dice.js';
const perk = (book, page, name, summary, mechanics) => ({ id: `as${book}-regalia-${slug(name)}`, name, source: sourceFor(book), sourcePage: page, summary, mechanics });
export const VEHICLE_PERKS = [
  perk(3, 128, 'Arsenal Secreto', 'Três vezes por missão, receba um item permitido pela patente, sem ocupar carga do veículo.', { arsenalUses: 3 }),
  perk(3, 128, 'Aprimoramentos de Velocidade', '+5 Pilotagem em viagens, perseguições e deslocamento de manobra.', { drivingBonus: 5 }),
  perk(3, 128, 'Bancos Reclináveis', 'O descanso no veículo torna-se confortável.', { rest: 'confortável' }),
  perk(3, 128, 'Estação de Trabalho', '+2 numa perícia escolhida dentro do veículo; exceto Luta, Pilotagem e Pontaria.', { choice: 'skill', excludedSkills: ['Luta', 'Pilotagem', 'Pontaria'], bonus: 2 }),
  perk(3, 128, 'Janelas Blindadas', 'RD +5 e cobertura total com o veículo fechado, inclusive se danificado.', { resistance: 5, closedCover: 'total', damagedCover: true }),
  perk(3, 128, 'Lataria Reforçada', 'Defesa +5. Pode ser adquirida duas vezes.', { defense: 5, repeat: 2 }),
  perk(3, 128, 'Para-choques Letais', 'Colisão causa 2d6 por 1,5 m e aumenta a DT em 5. Escolha impacto, corte ou perfuração.', { collisionDice: 2, collisionDc: 5, choice: 'damageType', damageTypes: ['Impacto', 'Corte', 'Perfuração'] }),
  perk(3, 128, 'Quadro de Investigação', '+5 para revisar o caso no interlúdio.', { reviewBonus: 5 }),
  perk(3, 128, 'Tração nas Quatro Rodas', 'Ignore a redução de deslocamento por terreno difícil.', { ignoresDifficultTerrain: true }),
  perk(5, 59, 'Conversão de Combustível para Alto Rendimento', 'O tanque comporta dez dados de combustível.', { fuelMaximum: 10 }),
  perk(5, 59, 'Gaiola de Proteção', 'Ocupantes recebem +5 Defesa e metade do dano de acidentes.', { occupantDefense: 5, crashMultiplier: 0.5 }),
  perk(5, 59, 'Indução Forçada', 'A tabela de manobra começa em 18 m na DT 5 e aumenta 3 m por faixa, até 36 m na DT 35.', { maneuverBase: 18, maneuverMaximum: 36 }),
  perk(5, 59, 'Pneus Run-Flat ou com Gel Selante', 'Ignore as penalidades por pneus furados.', { ignoresFlatTires: true }),
  perk(5, 59, 'Sistema de Óxido Nitroso', 'Uma vez por cena, ação livre dobra o deslocamento por uma rodada.', { nitroUses: 1, nitroMultiplier: 2 }),
  perk(5, 59, 'Sistema Multicombustível Avançado', '+1d20 para encontrar combustível.', { fuelSearchDice: 1 }),
  perk(5, 59, 'Sistema de Snorkel Selado', 'Permite funcionamento submerso enquanto a entrada de ar estiver acima da superfície.', { submergedEngineWithAir: true }),
  perk(5, 59, 'Tanques de Lastro Hidrodinâmicos', 'Permite movimento no fundo e controle narrativo de subida à superfície.', { bottomMovement: true, controlledBuoyancy: true }),
  perk(5, 59, 'Vedação Hermética', 'Imunidade a eletricidade e sem falhas elétricas por submersão.', { electricImmunity: true, submergedShortCircuit: false }),
];
const profile = (id, name, category, size, defense, resistance, hp, occupants, cargo, emptyCargo, perks) => ({ id, name, category, size, defense, resistance, hp, occupants, cargo, emptyCargo, perks, source: 'Arquivos Secretos #3', sourcePage: 126 });
export const VEHICLE_PROFILES = [
  profile('as3-veiculo-ii', 'Veículo operacional II', 'II', 'Grande', 8, 5, 100, 4, 20, 100, 1),
  profile('as3-veiculo-iii', 'Veículo operacional III', 'III', 'Grande', 10, 10, 150, 5, 30, 130, 2),
  profile('as3-veiculo-iv', 'Veículo operacional IV', 'IV', 'Enorme', 12, 15, 200, 6, 40, 160, 3),
  { ...profile('as3-moto-gauderios', 'Motocicleta dos Gaudérios Abutres', 'III', 'Médio', 14, 5, 120, 2, 5, 45, 2), sourcePage: 131, fixedPerks: ['Arsenal Secreto', 'Aprimoramentos de Velocidade'], wheels: 2 },
];
export const VEHICLE_DAMAGE = [
  ['stopped', 'Perda Total', 'Ação padrão e Pilotagem DT 20 para reiniciar; falha impede funcionamento.'],
  ['brakes', 'Freio Defeituoso', 'Ao frear, Pilotagem DT 20; falha avança mais metade do deslocamento.'],
  ['flat', 'Pneu Furado', 'Cada pneu causa −1d20 Pilotagem e −3 m; todos furados impedem movimento.'],
  ['suspension', 'Suspensão Danificada', 'Em terreno difícil, perde 2d6 PV por rodada.'],
  ['overheat', 'Motor Superaquecido', 'Ao percorrer metade do deslocamento, 1d6 ímpar causa Perda Total.'],
  ['headlights', 'Faróis Quebrados', 'Em escuridão, dirigir equivale à condição cego.'],
  ['leak', 'Tanque Furado', 'Um dado de combustível é considerado 1 automaticamente.'],
  ['doors', 'Portas Danificadas', 'Na manobra evasiva, ocupantes fazem Reflexos DT 20; falha causa 2d6 impacto e caído.'],
].map(([id, name, summary], i) => ({ id, name, summary, die: i + 1, source: 'Arquivos Secretos #3', sourcePage: 130 }));
const byId = new Map(VEHICLE_PERKS.map(p => [p.id, p]));
const has = (state, key) => state.perks.some(p => byId.get(p.id)?.mechanics[key]);
const total = (state, key) => state.perks.reduce((sum, p) => sum + finite(byId.get(p.id)?.mechanics[key]), 0);
export function createVehicle(profileId, selectedPerks, bonusPerks = 0) {
  return transaction({}, state => {
    const base = VEHICLE_PROFILES.find(p => p.id === profileId);
    if (!base) throw new Error('Perfil de veículo inválido.');
    const perks = (base.fixedPerks ? [...base.fixedPerks.map(name => ({ id: VEHICLE_PERKS.find(p => p.name === name).id })), ...selectedPerks] : selectedPerks).map(p => typeof p === 'string' ? { id: p } : p);
    if (perks.length > base.perks + integer(bonusPerks, 0, 10)) throw new Error('Limite de regalias excedido.');
    const counts = {};
    for (const entry of perks) {
      const data = byId.get(entry.id); if (!data) throw new Error('Regalia inválida.');
      counts[entry.id] = (counts[entry.id] || 0) + 1;
      if (counts[entry.id] > (data.mechanics.repeat || 1)) throw new Error('Regalia repetida além do permitido.');
      if (data.mechanics.choice === 'skill' && (!entry.skill || data.mechanics.excludedSkills.includes(entry.skill))) throw new Error('Escolha uma perícia permitida para a estação.');
      if (data.mechanics.choice === 'damageType' && !data.mechanics.damageTypes.includes(entry.damageType)) throw new Error('Escolha o tipo de dano da regalia.');
    }
    Object.assign(state, { profileId, perks, hp: base.hp, fuel: 5, damage: [], turn: 1, scene: 1, mission: 1, nitroScene: 0, nitroTurn: 0, evasiveTurn: 0, arsenalUsed: 0, maneuver: 0, closed: true });
    state.fuel = has(state, 'fuelMaximum') ? 10 : 5;
  });
}
export function vehicleStats(state, driver = {}) {
  const base = VEHICLE_PROFILES.find(p => p.id === state.profileId);
  if (!base) throw new Error('Perfil inválido.');
  const damaged = state.hp <= base.hp / 2, flats = state.damage.filter(d => d === 'flat').length;
  const tires = has(state, 'ignoresFlatTires') ? 0 : flats;
  const forced = has(state, 'maneuverBase'), score = finite(state.maneuver) + total(state, 'drivingBonus');
  let movement = score < 5 ? 0 : Math.min(forced ? 36 : 30, (forced ? 18 : 15) + 3 * Math.floor((score - 5) / 5));
  movement = Math.max(0, movement - tires * 3);
  if (damaged) movement /= 2;
  if (state.nitroScene === state.scene && state.nitroTurn === state.turn) movement *= 2;
  if (state.hp <= 0 || state.fuel <= 0 || tires >= (base.wheels || 4) || state.damage.some(d => ['stopped', 'disabled'].includes(d))) movement = 0;
  return { ...base, hp: state.hp, maximumHp: base.hp, damaged, defense: base.defense + finite(driver.agility) + total(state, 'defense') + finite(driver.vehicleDefenseBonus), resistance: base.resistance + total(state, 'resistance'), movement, pilotDicePenalty: -tires, fuelMaximum: has(state, 'fuelMaximum') ? 10 : 5, cover: has(state, 'closedCover') && state.closed ? 'total' : damaged ? 'none' : 'light', occupantDefense: total(state, 'occupantDefense'), crashMultiplier: has(state, 'crashMultiplier') ? 0.5 : 1 };
}
export function vehicleAction(state, id, input = {}, random = Math.random) {
  return transaction(state, next => {
    const stats = vehicleStats(next, input.driver);
    if (id === 'maneuver') { next.maneuver = integer(input.test, -100, 1000); return { movement: vehicleStats(next, input.driver).movement }; }
    if (id === 'nextTurn') { next.turn++; return {}; }
    if (id === 'nextScene') { next.scene++; next.turn = 1; next.evasiveTurn = 0; return {}; }
    if (id === 'nextMission') { next.mission++; next.arsenalUsed = 0; return {}; }
    if (id === 'refuel') { next.fuel = input.canister ? Math.min(stats.fuelMaximum, next.fuel + 2) : stats.fuelMaximum; return { fuel: next.fuel }; }
    if (id === 'fuel') {
      const values = Array.from({ length: next.fuel }, () => die(6, random));
      if (next.damage.includes('leak') && values.length) values[0] = 1;
      next.fuel -= values.filter(n => n === 1).length;
      return { dice: values, fuel: next.fuel };
    }
    if (id === 'drive') return { activation: finite(input.test) >= 20 ? 'movimento' : 'completa', accident: finite(input.test) <= 15 };
    if (id === 'nitro') {
      if (!has(next, 'nitroUses') || next.nitroScene === next.scene) throw new Error('A regalia não está disponível nesta cena.');
      next.nitroScene = next.scene; next.nitroTurn = next.turn; return { movement: vehicleStats(next, input.driver).movement };
    }
    if (id === 'evasive') {
      if (finite(input.rank) < 5 || next.evasiveTurn === next.turn || !input.moving) throw new Error('Requer Pilotagem treinada, veículo em movimento e reação disponível na rodada.');
      next.evasiveTurn = next.turn;
      return { defense: stats.defense + finite(input.pilotBonus), doorsCheck: next.damage.includes('doors') ? { skill: 'Reflexos', dc: 20, failure: { damage: '2d6', type: 'Impacto', condition: 'caído' } } : null };
    }
    if (id === 'collision') {
      const distance = Number(input.distance);
      if (!Number.isFinite(distance) || distance < 1.5 || distance > stats.movement) throw new Error('Distância fora do deslocamento disponível.');
      const success = finite(input.pilotTest) + total(next, 'collisionDc') > finite(input.reflexTest);
      if (!success) return { success, damage: 0 };
      const count = Math.floor(distance / 1.5) * (has(next, 'collisionDice') ? 2 : 1), result = roll(`${count}d6`, random);
      const ownDamage = Math.max(0, Math.floor(result.total / 2) - stats.resistance);
      next.hp = Math.max(0, next.hp - ownDamage);
      return { success, damage: result.total, dice: result.dice, ownDamage, type: next.perks.find(p => byId.get(p.id)?.mechanics.collisionDice)?.damageType || 'Impacto' };
    }
    if (id === 'damage') {
      const damage = integer(input.damage, 0, 100000), afterResistance = input.ignoreResistance ? damage : Math.max(0, damage - stats.resistance);
      next.hp = Math.max(0, next.hp - afterResistance);
      let fault = null;
      if (afterResistance >= stats.maximumHp / 2) { fault = VEHICLE_DAMAGE[die(8, random) - 1]; next.damage.push(fault.id); }
      return { damage: afterResistance, fault };
    }
    if (id === 'vital') {
      if (finite(input.attack) < stats.defense + 10) return { hit: false };
      if (['flat', 'headlights', 'windows'].includes(input.part)) {
        next.damage.push(input.part);
        return { hit: true, effect: input.part === 'windows' ? { damage: roll('2d4', random), type: 'Perfuração', save: 'Reflexos', dc: 20, success: 'half' } : null };
      }
      if (input.part === 'tank' && input.firearm && input.visibleTank) {
        const result = die(6, random); if (result % 2) { next.hp = 0; next.fuel = 0; }
        return { hit: true, die: result, areaEffect: result % 2 ? { radius: 9, damage: roll('12d6', random), types: ['Perfuração', 'Fogo'], condition: 'em chamas', outsideSave: { skill: 'Reflexos', dc: 25, half: true, avoidCondition: true } } : null };
      }
      throw new Error('Ponto vital ou requisito inválido.');
    }
    if (id === 'repair') {
      const test = finite(input.test), restored = test >= 30 ? stats.maximumHp : test >= 15 ? Math.floor(stats.maximumHp / 2) : test >= 10 ? 20 : 0;
      const count = test >= 25 ? next.damage.length : test >= 20 ? 3 : test >= 15 ? 1 : 0;
      const chosen = input.removeDamage || next.damage.map((_, i) => i).slice(0, count);
      if (chosen.length > count || new Set(chosen).size !== chosen.length || chosen.some(i => !Number.isInteger(i) || i < 0 || i >= next.damage.length)) throw new Error('Seleção de reparos inválida.');
      next.hp = Math.min(stats.maximumHp, next.hp + restored); next.damage = next.damage.filter((_, i) => !chosen.includes(i));
      return { restored, removed: chosen.length };
    }
    if (id === 'restart') {
      if (!next.damage.includes('stopped')) throw new Error('O veículo não está parado por esse defeito.');
      next.damage = next.damage.filter(d => d !== 'stopped'); if (finite(input.test) < 20) next.damage.push('disabled');
      return { success: finite(input.test) >= 20 };
    }
    if (id === 'suspension') {
      if (!next.damage.includes('suspension') || !input.difficultTerrain) throw new Error('O defeito não se aplica.');
      const damage = roll('2d6', random); next.hp = Math.max(0, next.hp - damage.total); return { damage };
    }
    if (id === 'overheat') {
      if (!next.damage.includes('overheat') || !input.movedHalf) throw new Error('O defeito não se aplica.');
      const result = die(6, random); if (result % 2) next.damage.push('stopped'); return { die: result };
    }
    if (id === 'arsenal') {
      if (!has(next, 'arsenalUses') || next.arsenalUsed >= 3 || !input.itemAllowed) throw new Error('Arsenal indisponível ou item não permitido pela patente.');
      next.arsenalUsed++; return { grantItem: input.itemId };
    }
    if (id === 'brake') return { extraMovement: next.damage.includes('brakes') && finite(input.test) < 20 ? stats.movement / 2 : 0 };
    throw new Error('Ação de veículo desconhecida.');
  });
}
