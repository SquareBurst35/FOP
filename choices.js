import {
  CLASS_POWERS,
  GENERAL_POWERS,
  PARANORMAL_POWERS,
  RITUALS,
  SKILL_ATTRIBUTES,
  TRAIL_ABILITIES,
} from "./content.js?v=9";
import { ITEMS } from "./items.js?v=9";
import { SKILLS } from "./rules.js?v=9";

export const CHOICE_TYPE_LABELS = {
  alvo: "Alvo aprimorado",
  aliado: "Tipo de aliado",
  atributo: "Atributo",
  elemento: "Elemento",
  habilidade: "Habilidade",
  item: "Item",
  numero: "Número da sorte",
  pericia: "Perícia",
  poder: "Poder recebido",
  ritual: "Ritual",
};

const ELEMENTS = ["Conhecimento", "Energia", "Morte", "Sangue"];
const ALLY_TYPES = [
  "Assassino",
  "Atirador",
  "Combatente",
  "Faz-tudo",
  "Médico",
  "Perseguidor",
  "Vigilante",
];

const option = (id, label, description = "") => ({ id: String(id), label, description });

function progressNex(character) {
  if (character.optionalRules?.separateLevelNex) return Math.max(0, Number(character.nivel || 0) * 5);
  return Math.max(0, Number(character.nex || 0));
}

function selectedValue(staged, abilityId, type) {
  return staged.find((entry) => entry.abilityId === abilityId && entry.type === type)?.valueId ?? "";
}

function knownRituals(character) {
  const selected = new Set(character.rituaisSelecionados ?? []);
  return RITUALS.filter((entry) => selected.has(entry.id));
}

function elementOptions() {
  return ELEMENTS.map((element) => option(element, element));
}

function ritualOptions(entries) {
  return entries.map((entry) => option(entry.id, entry.name, `${entry.elements?.join(" + ") ?? entry.element} · ${entry.circle}º círculo`));
}

function itemOptions(entries) {
  return entries.map((entry) => option(entry.id, entry.name, `${entry.group} · categoria ${entry.category}`));
}

function abilityOptions(entries) {
  return entries.map((entry) => option(entry.id, entry.name, `${entry.group} · ${entry.cost}`));
}

function spec(abilityId, type, label, options, { count = 1, help = "", ownerAbilityId = abilityId } = {}) {
  return { abilityId, ownerAbilityId, type, label, options, count, help };
}

export function abilityCanRepeatChoice(entry) {
  return [
    "<Habilidade> Aprimorada",
    "Aprender Ritual",
    "Dominar Habilidade Ritualística",
    "Resistir a Elemento",
    "Transcender",
    "Treinamento em Perícia",
  ].includes(entry?.name);
}

export function choiceSpecsForAbility(entry, character, staged = [], context = {}) {
  if (!entry || !character) return [];
  const levelNex = progressNex(character);
  const name = entry.name;
  const ownedAbilities = [
    ...(context.automaticAbilities ?? []),
    ...(character.habilidadesSelecionadas ?? []).map((id) => context.abilityById?.get(id)).filter(Boolean),
  ];

  if (name === "Perito") {
    const trained = (character.periciasTreinadas ?? []).filter((skill) => !["Luta", "Pontaria"].includes(skill));
    return [spec(entry.id, "pericia", "Escolha duas perícias para Perito", trained.map((skill) => option(skill, skill)), {
      count: Math.min(2, trained.length),
      help: "Luta e Pontaria não podem ser escolhidas.",
    })];
  }
  if (name === "Treinamento em Perícia") {
    const maxRank = levelNex >= 70 ? 15 : levelNex >= 35 ? 10 : 5;
    const skills = SKILLS.filter((skill) => Number(character.grausPericia?.[skill] ?? 0) < maxRank);
    return [spec(entry.id, "pericia", "Escolha duas perícias para avançar", skills.map((skill) => option(skill, skill)), {
      count: Math.min(2, skills.length),
      help: `O grau máximo permitido agora é +${maxRank}.`,
    })];
  }
  if (name === "Mochila de Utilidades") {
    const useful = ITEMS.filter((item) => !["Armas", "Munições", "Proteções"].includes(item.group));
    return [spec(entry.id, "item", "Escolha o item da mochila", itemOptions(useful), {
      help: "A redução fica ligada a este tipo de item.",
    })];
  }
  if (name === "Especialista em Elemento" || name === "Acostumado à Maldição de <Elemento>" || name === "Ser Amaldiçoado") {
    return [spec(entry.id, "elemento", "Escolha o elemento", elementOptions())];
  }
  if (name === "Mestre em Elemento") {
    const specialistIds = [...(context.abilityById?.values?.() ?? [])]
      .filter((ability) => ability.name === "Especialista em Elemento")
      .map((ability) => ability.id);
    const selected = new Set((character.habilidadeEscolhas ?? [])
      .filter((choice) => specialistIds.includes(choice.abilityId) && choice.type === "elemento")
      .map((choice) => choice.valueId));
    return [spec(entry.id, "elemento", "Escolha um elemento já especializado", elementOptions().filter((item) => selected.has(item.id)), {
      help: "Primeiro adquira Especialista em Elemento para este mesmo elemento.",
    })];
  }
  if (name === "Ritual Predileto") {
    return [spec(entry.id, "ritual", "Escolha um ritual conhecido", ritualOptions(knownRituals(character)))];
  }
  if (name === "A Favorita") {
    return [spec(entry.id, "item", "Escolha a arma favorita", itemOptions(ITEMS.filter((item) => item.group === "Armas")))];
  }
  if (name === "<Habilidade> Aprimorada") {
    const existingCounts = new Map();
    for (const choice of character.habilidadeEscolhas ?? []) {
      if (choice.abilityId !== entry.id || choice.type !== "alvo") continue;
      existingCounts.set(choice.valueId, (existingCounts.get(choice.valueId) ?? 0) + 1);
    }
    const targetAbilities = ownedAbilities
      .filter((ability) => ability && ability.id !== entry.id && !["Transcender", "Treinamento em Perícia"].includes(ability.name))
      .map((ability) => option(`habilidade:${ability.id}`, ability.name, `Habilidade · ${ability.group}`));
    const targetRituals = knownRituals(character)
      .map((ritual) => option(`ritual:${ritual.id}`, ritual.name, `Ritual · ${ritual.circle}º círculo`));
    return [spec(entry.id, "alvo", "Escolha a habilidade ou ritual com DT", [...targetAbilities, ...targetRituals].filter((item) => (existingCounts.get(item.id) ?? 0) < 2), {
      help: "A primeira escolha concede +2 na DT; repetir o mesmo alvo leva o bônus total a +5. Confirme com o mestre se o alvo possui DT.",
    })];
  }
  if (name === "Ferramentas Favoritas") {
    return [spec(entry.id, "item", "Escolha a ferramenta favorita", itemOptions(ITEMS), {
      help: "Escolha um item coerente com a profissão do agente.",
    })];
  }
  if (name === "Ferramentas da Profissão") {
    return [spec(entry.id, "item", "Escolha a ferramenta usada como arma", itemOptions(ITEMS.filter((item) => item.group === "Armas")))];
  }
  if (name === "Companheiro Animal") {
    const specs = [spec(entry.id, "pericia", "Escolha a perícia ajudada pelo companheiro", SKILLS.map((skill) => option(skill, skill)), {
      help: "A escolha deve ser aprovada pelo mestre.",
    })];
    if (levelNex >= 35) specs.push(spec(entry.id, "aliado", "Escolha o tipo de aliado do companheiro", ALLY_TYPES.map((type) => option(type, type)), {
      help: "Esta função é liberada a partir de NEX 35%.",
    }));
    return specs;
  }
  if (name === "Mutação") {
    const physical = SKILLS.filter((skill) => ["AGI", "FOR", "VIG"].includes(SKILL_ATTRIBUTES[skill]));
    return [spec(entry.id, "pericia", "Escolha a perícia física aprimorada", physical.map((skill) => option(skill, `${skill} (${SKILL_ATTRIBUTES[skill]})`)))];
  }
  if (name === "Invenção Paranormal") {
    return [spec(entry.id, "ritual", "Escolha o ritual de 1º círculo do invento", ritualOptions(RITUALS.filter((ritual) => ritual.circle === 1)))];
  }
  if (name === "A Culpa é das Estrelas") {
    return [spec(entry.id, "numero", "Escolha o número da sorte", Array.from({ length: 20 }, (_, index) => option(index + 1, String(index + 1))))];
  }
  if (name === "Mácula Ritualística") {
    const specs = [spec(entry.id, "elemento", "Escolha o elemento da mácula", elementOptions())];
    const element = selectedValue(staged, entry.id, "elemento") || selectedValue(character.habilidadeEscolhas ?? [], entry.id, "elemento");
    if (element) specs.push(spec(entry.id, "ritual", "Escolha o ritual de 1º círculo ligado à mácula", ritualOptions(RITUALS.filter((ritual) => ritual.circle === 1 && ritual.elements.includes(element))), {
      help: `A lista mostra apenas rituais de ${element}.`,
    }));
    return specs;
  }
  if (name === "Dominar Habilidade Ritualística") {
    const abilities = TRAIL_ABILITIES.filter((ability) => ability.category === "Ocultista" && ability.unlockNex <= levelNex);
    return [spec(entry.id, "habilidade", "Escolha a habilidade de trilha de Ocultista", abilityOptions(abilities), {
      help: "Habilidades encadeadas ainda exigem as anteriores.",
    })];
  }
  if (name === "Aprender Ritual") {
    const maximumCircle = levelNex >= 75 ? 3 : levelNex >= 45 ? 2 : 1;
    const known = new Set(character.rituaisSelecionados ?? []);
    return [spec(entry.id, "ritual", "Escolha o ritual aprendido", ritualOptions(RITUALS.filter((ritual) => ritual.circle <= maximumCircle && !known.has(ritual.id))))];
  }
  if (name === "Resistir a Elemento") {
    const used = new Set((character.habilidadeEscolhas ?? []).filter((choice) => choice.abilityId === entry.id && choice.type === "elemento").map((choice) => choice.valueId));
    return [spec(entry.id, "elemento", "Escolha o elemento resistido", elementOptions().filter((item) => !used.has(item.id)))];
  }
  if (name === "Expansão de Conhecimento") {
    const powers = CLASS_POWERS.filter((power) => power.category !== character.classe && power.name !== "Transcender" && power.unlockNex <= levelNex);
    return [spec(entry.id, "poder", "Escolha o poder de outra classe", abilityOptions(powers))];
  }
  if (name === "Transcender") {
    const known = new Set(character.habilidadesSelecionadas ?? []);
    const powers = PARANORMAL_POWERS.filter((power) => !known.has(power.id) || abilityCanRepeatChoice(power));
    const specs = [spec(entry.id, "poder", "Escolha o poder paranormal", abilityOptions(powers))];
    const selectedPowerId = selectedValue(staged, entry.id, "poder");
    const selectedPower = PARANORMAL_POWERS.find((power) => power.id === selectedPowerId);
    if (selectedPower) {
      const nested = choiceSpecsForAbility(selectedPower, character, staged, context);
      specs.push(...nested.map((item) => ({ ...item, ownerAbilityId: selectedPower.id })));
    }
    return specs;
  }
  return [];
}

export function choicesComplete(entry, character, choices = character.habilidadeEscolhas ?? [], context = {}) {
  const specs = choiceSpecsForAbility(entry, character, choices, context);
  if (!specs.length) return true;
  return specs.every((requirement) => {
    const selected = choices.filter((choice) => choice.abilityId === requirement.ownerAbilityId && choice.type === requirement.type);
    return selected.length >= requirement.count;
  });
}
