import assert from "node:assert/strict";
import { choiceSpecsForAbility } from "../choices.js";
import { CORE_CLASS_ABILITIES, GENERAL_POWERS, PARANORMAL_POWERS, TRAIL_ABILITIES } from "../content.js";
import { ITEMS, inventoryUsage } from "../items.js";
import { calculateDerived, survivorStage } from "../rules.js";
import { turnSpendLimit } from "../session.js";

const survivor = (stage, trail = "") => ({
  classe: "Sobrevivente",
  sobreviventeEstagio: stage,
  trilha: trail,
  nex: 0,
  nivel: 0,
  atributos: { agilidade: 1, forca: 1, intelecto: 2, presenca: 2, vigor: 2 },
  optionalRules: { separateLevelNex: false, determination: false },
  habilidadesSelecionadas: [],
  transcenderNiveis: [],
});

assert.equal(survivorStage(survivor(1)), 1);
assert.equal(survivorStage(survivor(99)), 5);
assert.deepEqual(
  [1, 2, 3, 4, 5].map((stage) => {
    const value = calculateDerived(survivor(stage));
    return [value.pvMax, value.peMax, value.sanMax];
  }),
  [[10, 4, 8], [12, 5, 10], [14, 6, 12], [16, 7, 14], [18, 8, 16]],
);
assert.equal(calculateDerived(survivor(2, "Durão")).pvMax, 16);
assert.equal(calculateDerived(survivor(3, "Durão")).pvMax, 20);
assert.equal(calculateDerived({ ...survivor(5), optionalRules: { separateLevelNex: false, determination: true } }).pdMax, 14);
assert.equal(turnSpendLimit(survivor(5)), 1);

const hasNames = (entries, names, label) => {
  const actual = new Set(entries.map((entry) => entry.name));
  for (const name of names) assert.ok(actual.has(name), `${label}: falta ${name}`);
};

hasNames(CORE_CLASS_ABILITIES, ["Empenho", "Cicatrizado", "Treinamento Especial"], "Sobrevivente");
const cicatrizado = CORE_CLASS_ABILITIES.find((entry) => entry.name === "Cicatrizado");
assert.deepEqual(
  choiceSpecsForAbility(cicatrizado, survivor(5))[0].options.map((entry) => entry.id).sort(),
  ["Conhecimento", "Energia", "Morte", "Sangue"],
);
for (const trail of ["Durão", "Esperto", "Esotérico"]) {
  assert.equal(TRAIL_ABILITIES.filter((entry) => entry.category === "Sobrevivente" && entry.group === trail).length, 2);
}

hasNames(GENERAL_POWERS, [
  "Acrobático", "Ás do Volante", "Atlético", "Atraente", "Dedos Ágeis", "Detector de Mentiras",
  "Especialista em Emergências", "Estigmado", "Foco em Perícia", "Inventário Organizado", "Informado",
  "Interrogador", "Mentiroso Nato", "Observador", "Pai de Pet", "Palavras de Devoção", "Parceiro",
  "Pensamento Tático", "Personalidade Esotérica", "Persuasivo", "Pesquisador Científico", "Proativo",
  "Provisões de Emergência", "Racionalidade Inflexível", "Rato de Computador", "Resposta Rápida", "Talentoso",
  "Teimosia Obstinada", "Tenacidade", "Sentidos Aguçados", "Sobrevivencialista", "Sorrateiro",
  "Vitalidade Reforçada", "Vontade Inabalável", "Artista Marcial",
], "Poderes gerais de Sobrevivendo ao Horror");

hasNames(PARANORMAL_POWERS, [
  "Absorver Conhecimento", "Antecipar Vitalidade", "Apatia Herege", "Aura de Pavor",
  "Conexão Empática", "Espreitar da Besta", "Instintos Sanguinários", "Valer-se do Caos",
], "Poderes paranormais de Sobrevivendo ao Horror");

hasNames(ITEMS, [
  "Ampulheta do Tempo Sofrido", "Arreio Neural", "Câmera Obscura", "Centrifugador Existencial",
  "Conector de Membros", "Dose d’A Praga", "Enxame Fantasmagórico", "Espelho Refletor", "Fuzil Alheio",
  "Injeção de Lodo", "Instantâneo Mortal", "Mandíbula Agonizante", "A Primeira Adaga",
  "Projétil de Lodo, curto", "Projétil de Lodo, longo", "Rádio Chiador", "Repositório do Fracasso",
  "Retalho Tenebroso", "Tábula do Saber Custoso", "Carregador rápido", "Bateria potente",
], "Itens de Sobrevivendo ao Horror");

const compactItem = ITEMS.find((entry) => entry.name === "Instantâneo Mortal");
const organizedPower = GENERAL_POWERS.find((entry) => entry.name === "Inventário Organizado");
const organized = { ...survivor(1), habilidadesSelecionadas: [organizedPower.id], inventarioItens: [{ itemId: compactItem.id, quantity: 2 }] };
assert.equal(inventoryUsage(organized).spaces, 0.5);
assert.equal(inventoryUsage(organized).capacity, 7);

console.log("Sobrevivente e cobertura mecânica do suplemento passaram.");
