import assert from "node:assert/strict";
import {
  CLASS_POWERS,
  CORE_CLASS_ABILITIES,
  PARANORMAL_POWERS,
  RITUAL_CIRCLES,
  RITUALS,
  SKILL_ATTRIBUTES,
  TRAIL_ABILITIES,
  allSelectableAbilities,
} from "../content.js";
import { ITEMS } from "../items.js";
import {
  CLASSES,
  ORIGINS,
  SKILLS,
  calculateDerived,
  characterLevel,
  levelFromNex,
} from "../rules.js";
import {
  ATTRIBUTE_LEVELS,
  CLASS_POWER_LEVELS,
  LEVEL_CAP,
  TRAINING_LEVELS,
  VERSATILITY_LEVEL,
  createLevelUpPlan,
  ritualCircleForLevel,
} from "../progression.js";

function unique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} contém valores duplicados`);
}

function agent({ className = "Combatente", level = 1, nex = level * 5, optionalRules, transcenderNiveis = [] } = {}) {
  return {
    classe: className,
    nivel: level,
    nex,
    optionalRules: optionalRules ?? { separateLevelNex: false, determination: false },
    atributos: { agilidade: 2, forca: 2, intelecto: 2, presenca: 2, vigor: 2 },
    transcenderNiveis,
  };
}

assert.equal(LEVEL_CAP, 20);
for (let nex = 0; nex <= 100; nex += 5) {
  assert.equal(levelFromNex(nex), nex === 0 ? 0 : nex / 5);
}
assert.equal(levelFromNex(-50), 0);
assert.equal(levelFromNex(150), 20);

for (const className of ["Combatente", "Especialista", "Ocultista"]) {
  let previous = null;
  for (let level = 1; level <= LEVEL_CAP; level += 1) {
    const character = agent({ className, level });
    assert.equal(characterLevel(character), level);
    const derived = calculateDerived(character);
    for (const key of ["pvMax", "peMax", "sanMax", "defesa", "deslocamento"]) {
      assert.ok(Number.isFinite(derived[key]) && derived[key] >= 0, `${className} nível ${level}: ${key} inválido`);
    }
    if (previous) {
      assert.ok(derived.pvMax >= previous.pvMax);
      assert.ok(derived.peMax >= previous.peMax);
      assert.ok(derived.sanMax >= previous.sanMax);
    }
    previous = derived;

    const plan = createLevelUpPlan(character);
    if (level === LEVEL_CAP) {
      assert.equal(plan, null);
      continue;
    }
    const target = level + 1;
    assert.equal(plan.toLevel, target);
    assert.equal(plan.targetNex, target * 5);
    assert.equal(plan.needsClassPower, CLASS_POWER_LEVELS.includes(target));
    assert.equal(plan.needsAttribute, ATTRIBUTE_LEVELS.includes(target));
    assert.equal(Boolean(plan.trainingRank), TRAINING_LEVELS.includes(target));
    assert.equal(plan.needsVersatility, target === VERSATILITY_LEVEL);
    assert.equal(plan.ritualCircle, ritualCircleForLevel(target));
  }
}

const baseCombatant = calculateDerived(agent({ className: "Combatente", level: 6 }));
const transcendedCombatant = calculateDerived(agent({ className: "Combatente", level: 6, transcenderNiveis: [3, 6] }));
assert.equal(baseCombatant.sanMax - transcendedCombatant.sanMax, 6);
assert.equal(transcendedCombatant.transcenderSanPenalty, 6);

const determination = calculateDerived(agent({
  className: "Combatente",
  level: 6,
  transcenderNiveis: [3, 6],
  optionalRules: { separateLevelNex: false, determination: true },
}));
assert.equal(determination.transcenderSanPenalty, 0);
assert.ok(determination.pdMax > 0);

const separate = agent({
  level: 4,
  nex: 55,
  optionalRules: { separateLevelNex: true, determination: false },
});
assert.equal(characterLevel(separate), 4);
assert.equal(createLevelUpPlan(separate).targetNex, 55);

unique(SKILLS, "Perícias");
assert.deepEqual(Object.keys(SKILL_ATTRIBUTES).sort(), [...SKILLS].sort());
unique(ORIGINS.map((entry) => entry.name), "Origens");
unique(ITEMS.map((entry) => entry.id), "Itens");
unique(RITUALS.map((entry) => entry.id), "Rituais");
unique(
  [...CORE_CLASS_ABILITIES, ...allSelectableAbilities(ORIGINS)].map((entry) => entry.id),
  "Habilidades",
);
assert.deepEqual([...new Set(RITUALS.map((entry) => entry.circle))].sort(), RITUAL_CIRCLES);
assert.ok(RITUALS.every((entry) => RITUAL_CIRCLES.includes(entry.circle)));
assert.ok(CLASS_POWERS.every((entry) => ["Combatente", "Especialista", "Ocultista"].includes(entry.category)));
assert.ok(PARANORMAL_POWERS.every((entry) => entry.category === "Poderes Paranormais"));

for (const [className, data] of Object.entries(CLASSES)) {
  if (className === "Mundano") continue;
  for (const trail of data.trails) {
    const unlocks = TRAIL_ABILITIES
      .filter((entry) => entry.category === className && entry.group === trail)
      .map((entry) => entry.unlockNex)
      .sort((a, b) => a - b);
    assert.deepEqual(unlocks, [10, 40, 65, 99], `${className}/${trail} está incompleta`);
  }
}

console.log("Matriz de regras, progressão e catálogos passou.");
