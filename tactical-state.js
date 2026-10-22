// Estado derivado do AS #9. Não altera escolhas, treino ou bônus manuais.
import { DRONE_TYPES } from "./drone-types.js?v=1";

export const progressNex = (c) => c?.optionalRules?.separateLevelNex ? Math.max(0, Number(c.nivel) || 0) * 5 : Number(c?.nex) || 0;
export const selectedPower = (c, suffix) => (c?.habilidadesSelecionadas ?? []).some((id) => String(id).endsWith(`-${suffix}`));
export const trailPower = (c, trail, nex, suffix) => (c?.trilha === trail && c?.classe === (trail === "Incursor" ? "Combatente" : "Especialista") && progressNex(c) >= nex) || selectedPower(c, suffix);
export const droneAllowance = (c) => c?.classe === "Especialista" && c?.trilha === "Piloto de Drone" ? (progressNex(c) >= 99 ? ((c.habilidadeEscolhas ?? []).some((v) => v.type === "configuracao" && v.valueId === "segundo" && String(v.abilityId).endsWith("-mestre-dos-drones")) ? 3 : 6) : progressNex(c) >= 65 ? 3 : progressNex(c) >= 40 ? 1 : 0) : 0;
const typeIds = new Set(DRONE_TYPES.map((v) => v.id));
const legacyTypes = (c, itemId) => (c?.inventarioModificacoes?.[itemId] ?? []).map((id) => DRONE_TYPES.find((v) => String(id).endsWith(`-drone-${v.id}`))?.id).filter(Boolean);

export function tacticalDrones(c) {
  const defaults = [];
  const choices = c?.habilidadeEscolhas ?? [];
  if (trailPower(c, "Piloto de Drone", 10, "companheiro-drone")) {
    const base = choices.find((v) => v.type === "drone" && String(v.abilityId).endsWith("-companheiro-drone"))?.valueId;
    const skill = choices.find((v) => v.type === "pericia" && String(v.abilityId).endsWith("-companheiro-drone"))?.valueId;
    defaults.push({ id: "companheiro-1", name: "Companheiro drone", types: base ? [base] : [], skill: skill || "", companion: true });
    if (progressNex(c) >= 99 && choices.some((v) => v.type === "configuracao" && v.valueId === "segundo" && String(v.abilityId).endsWith("-mestre-dos-drones"))) defaults.push({ id: "companheiro-2", name: "Segundo companheiro", types: [], skill: "", companion: true });
  }
  for (const item of c?.inventarioItens ?? []) {
    if (!String(item.itemId).endsWith("-drone-de-combate-tatico")) continue;
    for (let i = 0; i < Math.min(99, Number(item.quantity) || 1); i++) defaults.push({ id: `${item.itemId}-${i}`, itemId: item.itemId, name: `Drone do inventário ${i + 1}`, types: legacyTypes(c, item.itemId), skill: choices.find((v) => v.abilityId === item.itemId && v.type === "pericia")?.valueId || "", companion: false });
  }
  return defaults.map((base) => {
    const saved = c?.operacoesAS9?.drones?.find((v) => v.id === base.id);
    return { ...base, available: c?.droneDisponivel !== false, operated: false, ...saved, id: base.id, itemId: base.itemId, companion: base.companion, types: [...new Set((saved?.types ?? base.types).filter((id) => typeIds.has(id)))], category: Math.max(0, (saved?.types ?? base.types).length - 1) > (base.companion ? droneAllowance(c) : 0) ? "IV" : "III" };
  });
}

export function tacticalEffects(c) {
  const s = c?.operacoesAS9;
  return (s?.effects ?? []).filter((e) => (e.scene == null || e.scene === (s?.scene ?? 1)) && (e.untilTurn == null || e.untilTurn >= (s?.turn ?? 1)));
}
export const tacticalDefense = (c) => tacticalEffects(c).reduce((n, e) => n + (Number(e.defense) || 0), 0);
export const tacticalTestBonus = (c) => tacticalEffects(c).reduce((n, e) => n + (Number(e.tests) || 0), 0);
export const droneDefense = (c) => tacticalDrones(c).some((d) => d.available && d.types.includes("protetor")) ? 5 : 0;
export function preparedAmmo(c, itemId, quantity) {
  return Math.min(Math.max(0, Number(quantity) || 0), Math.max(0, Math.trunc(Number(c?.operacoesAS9?.prepared?.[itemId]) || 0)));
}

export function pruneTacticalInventory(c) {
  if (!c.operacoesAS9) return;
  const s = c.operacoesAS9;
  s.prepared = Object.fromEntries(Object.entries(s.prepared ?? {}).map(([id, count]) => [id, preparedAmmo(c, id, (c.inventarioItens ?? []).find((v) => v.itemId === id)?.quantity ?? 0)]).filter(([, count]) => count > 0));
  if (s.drones) s.drones = tacticalDrones(c);
  if (c.inventarioModificacoes) {
    const owned = new Set((c.inventarioItens ?? []).map((v) => v.itemId));
    c.inventarioModificacoes = Object.fromEntries(Object.entries(c.inventarioModificacoes).filter(([id]) => owned.has(id)));
  }
}
export function formationMovement(c) {
  const s = c?.operacoesAS9;
  return s?.formation?.type === "coluna" && s.formation.untilTurn >= (s.turn ?? 1) ? 3 : 0;
}
