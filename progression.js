import { characterLevel, usesSeparateLevel } from "./rules.js?v=7";

export const LEVEL_CAP = 20;
export const CLASS_POWER_LEVELS = [3, 6, 9, 12, 15, 18];
export const ATTRIBUTE_LEVELS = [4, 10, 16, 19];
export const TRAINING_LEVELS = [7, 14];
export const TRAIL_LEVEL = 2;
export const VERSATILITY_LEVEL = 10;

export const TRAINING_UPGRADE_COUNTS = {
  Combatente: 1,
  Especialista: 5,
  Ocultista: 3,
};

export function ritualCircleForLevel(level) {
  if (level >= 17) return 4;
  if (level >= 11) return 3;
  if (level >= 5) return 2;
  return 1;
}

export function createLevelUpPlan(character, selectedClass = character?.classe) {
  const fromLevel = characterLevel(character);
  if (fromLevel >= LEVEL_CAP) return null;
  const toLevel = fromLevel + 1;
  const className = selectedClass && selectedClass !== "Mundano" ? selectedClass : "";
  const firstAgentLevel = fromLevel === 0;
  const trainingRank = toLevel === 7 ? 10 : toLevel === 14 ? 15 : 0;
  return {
    fromLevel,
    toLevel,
    fromProgressNex: fromLevel * 5,
    targetProgressNex: toLevel * 5,
    targetNex: usesSeparateLevel(character) ? Number(character?.nex) || 0 : toLevel * 5,
    className,
    firstAgentLevel,
    needsClass: firstAgentLevel || !className,
    needsTrail: Boolean(className && toLevel === TRAIL_LEVEL && !character?.trilha),
    needsAttribute: ATTRIBUTE_LEVELS.includes(toLevel),
    needsClassPower: Boolean(className && CLASS_POWER_LEVELS.includes(toLevel)),
    needsVersatility: Boolean(className && toLevel === VERSATILITY_LEVEL),
    trainingRank,
    trainingCount: trainingRank ? TRAINING_UPGRADE_COUNTS[className] ?? 0 : 0,
    ritualPicks: className === "Ocultista" ? (firstAgentLevel ? 3 : 1) : 0,
    ritualCircle: ritualCircleForLevel(toLevel),
  };
}

export function levelLabel(level) {
  return level === 0 ? "Mundano" : `Nível ${level}`;
}
