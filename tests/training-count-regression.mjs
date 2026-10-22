import test from "node:test";
import assert from "node:assert/strict";
import { createLevelUpPlan } from "../progression.js";

const character = (classe, level, intellect, separate = false) => ({
  classe, nivel: level, nex: separate ? 10 : level * 5,
  atributos: { intelecto: intellect }, optionalRules: { separateLevelNex: separate },
});

test("Grau de Treinamento soma Intelecto à quantidade própria de cada classe", () => {
  for (const [classe, base] of [["Combatente", 2], ["Especialista", 5], ["Ocultista", 3]]) {
    for (const intellect of [0, 1, 2, 5]) {
      for (const level of [6, 13]) {
        const plan = createLevelUpPlan(character(classe, level, intellect));
        assert.equal(plan.trainingCount, base + intellect, `${classe}, INT ${intellect}, nível ${level + 1}`);
        assert.equal(plan.trainingRank, level === 6 ? 10 : 15);
      }
    }
  }
});

test("Combatente INT 2 aumenta quatro perícias ao entrar no nível 7, sem novo aumento no 8", () => {
  assert.equal(createLevelUpPlan(character("Combatente", 6, 2)).trainingCount, 4);
  assert.equal(createLevelUpPlan(character("Combatente", 7, 2)).trainingCount, 0);
  assert.equal(createLevelUpPlan(character("Combatente", 7, 2)).trainingRank, 0);
});

test("nível/NEX separados mantém os patamares de treinamento nos níveis 7 e 14", () => {
  const plan = createLevelUpPlan(character("Combatente", 6, "2", true));
  assert.equal(plan.targetNex, 10);
  assert.equal(plan.trainingRank, 10);
  assert.equal(plan.trainingCount, 4);
});
