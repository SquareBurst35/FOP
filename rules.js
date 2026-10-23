import { droneDefense, tacticalDefense, tacticalTestBonus, formationMovement } from "./tactical-state.js?v=1";
import { beforeSoBonus, turnSpendLimit } from "./session.js?v=34";
import { ITEM_BY_ID } from "./items.js?v=61";
import { upgradedItem } from "./item-upgrades.js?v=60";
import { ownsAbility, effectiveAttributes, chosenMonstrousElement, monstrousRitualActive, ownedAbilities, automaticTrailRituals } from "./ability-rules.js?v=1";
export const ATTRIBUTE_TARGET = 9;
export const MUNDANE_ATTRIBUTE_TARGET = 8;
export const ATTRIBUTE_MAX_AT_CREATION = 3;
export const SURVIVOR_STAGE_CAP = 5;

export const SKILLS = [
  "Acrobacia",
  "Adestramento",
  "Artes",
  "Atletismo",
  "Atualidades",
  "Ciências",
  "Crime",
  "Diplomacia",
  "Enganação",
  "Fortitude",
  "Furtividade",
  "Iniciativa",
  "Intimidação",
  "Intuição",
  "Investigação",
  "Luta",
  "Medicina",
  "Ocultismo",
  "Percepção",
  "Pilotagem",
  "Pontaria",
  "Profissão",
  "Reflexos",
  "Religião",
  "Sobrevivência",
  "Tática",
  "Tecnologia",
  "Vontade",
];

export const ORIGINS = [
  { name: "Treinado pela Hell Hunters", skills: [], skillChoices: 2, skillPairs: [["Luta", "Fortitude"], ["Pontaria", "Reflexos"]], skillChoiceLabel: "Treinamento da Hell Hunters", power: "Resistência do Treinamento", source: "Arquivos Secretos #9", sourcePage: 38 },
  { name: "Veterano de Conflito Armado", skills: ["Luta", "Pontaria"], power: "Full Metal Jacket", source: "Arquivos Secretos #9", sourcePage: 38 },
  { name: "Revoltado", skills: ["Furtividade", "Vontade"], power: "Antes Só", source: "Marca-páginas — O Segredo na Floresta (César)", sourcePage: null },
  { name: "Acadêmico", skills: ["Ciências", "Investigação"], power: "Saber é Poder", source: "Livro base" },
  { name: "Agente de Saúde", skills: ["Intuição", "Medicina"], power: "Técnica Medicinal", source: "Livro base" },
  { name: "Amnésico", skills: [], skillChoices: 2, skillChoiceLabel: "Definidas com o mestre", power: "Vislumbres do Passado", source: "Livro base" },
  { name: "Artista", skills: ["Artes", "Diplomacia"], power: "Magnum Opus", source: "Livro base" },
  { name: "Atleta", skills: ["Atletismo", "Fortitude"], power: "110%", source: "Livro base" },
  { name: "Criminoso", skills: ["Crime", "Furtividade"], power: "O Crime Compensa", source: "Livro base" },
  { name: "Cultista Arrependido", skills: ["Enganação", "Ocultismo"], power: "Traços do Outro Lado", source: "Livro base" },
  { name: "Desgarrado", skills: ["Fortitude", "Sobrevivência"], power: "Calejado", source: "Livro base" },
  { name: "Engenheiro", skills: ["Profissão", "Tecnologia"], power: "Ferramenta Favorita", source: "Livro base" },
  { name: "Executivo", skills: ["Diplomacia", "Profissão"], power: "Processo Otimizado", source: "Livro base" },
  { name: "Investigador", skills: ["Investigação", "Percepção"], power: "Faro para Pistas", source: "Livro base" },
  { name: "Lutador", skills: ["Acrobacia", "Iniciativa"], power: "Mão Pesada", source: "Livro base" },
  { name: "Magnata", skills: ["Diplomacia", "Pilotagem"], power: "Patrocinador da Ordem", source: "Livro base" },
  { name: "Mercenário", skills: ["Iniciativa", "Tática"], power: "Posição de Combate", source: "Livro base" },
  { name: "Militar", skills: ["Atletismo", "Pontaria"], power: "Para Bellum", source: "Livro base" },
  { name: "Operário", skills: ["Fortitude", "Profissão"], power: "Ferramenta de Trabalho", source: "Livro base" },
  { name: "Policial", skills: ["Percepção", "Pontaria"], power: "Patrulha", source: "Livro base" },
  { name: "Religioso", skills: ["Religião", "Vontade"], power: "Acalentar", source: "Livro base" },
  { name: "Servidor Público", skills: ["Intuição", "Vontade"], power: "Espírito Cívico", source: "Livro base" },
  { name: "Teórico da Conspiração", skills: ["Investigação", "Ocultismo"], power: "Eu Já Sabia", source: "Livro base" },
  { name: "T.I.", skills: ["Investigação", "Tecnologia"], power: "Motor de Busca", source: "Livro base" },
  { name: "Trabalhador Rural", skills: ["Adestramento", "Sobrevivência"], power: "Desbravador", source: "Livro base" },
  { name: "Trambiqueiro", skills: ["Crime", "Enganação"], power: "Impostor", source: "Livro base" },
  { name: "Universitário", skills: ["Atualidades", "Investigação"], power: "Dedicação", source: "Livro base" },

  { name: "Amigo dos Animais", skills: ["Adestramento", "Percepção"], power: "Companheiro Animal", source: "Sobrevivendo ao Horror" },
  { name: "Astronauta", skills: ["Ciências", "Fortitude"], power: "Acostumado ao Extremo", source: "Sobrevivendo ao Horror" },
  { name: "Chef do Outro Lado", skills: ["Ocultismo", "Profissão (cozinheiro)"], power: "Fome do Outro Lado", source: "Sobrevivendo ao Horror" },
  { name: "Colegial", skills: ["Atualidades", "Tecnologia"], power: "Poder da Amizade", source: "Sobrevivendo ao Horror" },
  { name: "Cosplayer", skills: ["Artes", "Vontade"], power: "Não é fantasia, é cosplay!", source: "Sobrevivendo ao Horror" },
  { name: "Diplomata", skills: ["Atualidades", "Diplomacia"], power: "Conexões", source: "Sobrevivendo ao Horror" },
  { name: "Explorador", skills: ["Fortitude", "Sobrevivência"], power: "Manual do Sobrevivente", source: "Sobrevivendo ao Horror" },
  { name: "Experimento", skills: ["Atletismo", "Fortitude"], power: "Mutação", source: "Sobrevivendo ao Horror" },
  { name: "Fanático por Criaturas", skills: ["Investigação", "Ocultismo"], power: "Conhecimento Oculto", source: "Sobrevivendo ao Horror" },
  { name: "Fotógrafo", skills: ["Artes", "Percepção"], power: "Através da Lente", source: "Sobrevivendo ao Horror" },
  { name: "Inventor Paranormal", skills: ["Profissão (engenheiro)", "Vontade"], power: "Invenção Paranormal", source: "Sobrevivendo ao Horror" },
  { name: "Jovem Místico", skills: ["Ocultismo", "Religião"], power: "A Culpa é das Estrelas", source: "Sobrevivendo ao Horror" },
  { name: "Legista do Turno da Noite", skills: ["Ciências", "Medicina"], power: "Luto Habitual", source: "Sobrevivendo ao Horror" },
  { name: "Mateiro", skills: ["Percepção", "Sobrevivência"], power: "Mapa Celeste", source: "Sobrevivendo ao Horror" },
  { name: "Mergulhador", skills: ["Atletismo", "Fortitude"], power: "Fôlego de Nadador", source: "Sobrevivendo ao Horror" },
  { name: "Motorista", skills: ["Pilotagem", "Reflexos"], power: "Mãos no Volante", source: "Sobrevivendo ao Horror" },
  { name: "Nerd Entusiasta", skills: ["Ciências", "Tecnologia"], power: "O Inteligentão", source: "Sobrevivendo ao Horror" },
  { name: "Profetizado", skills: ["Vontade"], skillChoices: 1, skillChoiceLabel: "Perícia da origem", power: "Luta ou Fuga", source: "Sobrevivendo ao Horror" },
  { name: "Psicólogo", skills: ["Intuição", "Profissão (psicólogo)"], power: "Terapia", source: "Sobrevivendo ao Horror" },
  { name: "Repórter Investigativo", skills: ["Atualidades", "Investigação"], power: "Encontrar a Verdade", source: "Sobrevivendo ao Horror" },

  { name: "Ferido por Ritual", skills: ["Ocultismo"], skillChoices: 1, skillChoiceLabel: "Perícia ligada ao elemento", power: "Mácula Ritualística", source: "Arquivos Secretos #1" },
  { name: "Transtornado Arrependido", skills: ["Luta", "Ocultismo"], power: "Sofrimento de Sangue", source: "Arquivos Secretos #1" },

  { name: "Caçador de Recompensas", skills: ["Crime", "Investigação"], power: "Quem Não Arrisca Não Petisca", source: "Arquivos Secretos #4" },
  { name: "Influencer Paranormal", skills: ["Enganação", "Tecnologia"], power: "Registrar Paranormal", source: "Arquivos Secretos #4" },

  { name: "Ufólogo", skills: ["Ciências", "Ocultismo"], power: "Minha Teoria Absurda", source: "Arquivos Secretos #5" },
  { name: "Funcionário de Beira de Estrada", skills: ["Fortitude", "Intuição"], power: "Turno Invertido", source: "Arquivos Secretos #5" },

  { name: "Exorcizado", skills: ["Fortitude", "Ocultismo"], power: "O Que Restou", source: "Arquivos Secretos #7" },
  { name: "Sensitivo Rebelde", skills: ["Intuição", "Vontade"], power: "Sussurros e Vultos", source: "Arquivos Secretos #7" },

  { name: "Cientista Ex-Panacea", skills: ["Atualidades", "Ciências"], power: "Existe uma Explicação", source: "Arquivos Secretos #6" },
  { name: "Cobaia Sobrevivente", skills: ["Fortitude", "Vontade"], power: "Forças para Enfrentar", source: "Arquivos Secretos #6" },
  { name: "Segurança Ex-Panacea", skills: ["Luta", "Pontaria"], power: "Técnicas de Contenção", source: "Arquivos Secretos #6" },
];

export const CLASSES = {
  Mundano: {
    initial: { pv: 8, pe: 1, san: 8 },
    gain: { pv: 0, pe: 0, san: 0 },
    determination: { initial: 4, gain: 0 },
    fixedSkills: [],
    skillChoiceGroups: [],
    choiceSkills: (intellect) => Math.max(1, 1 + intellect),
    trails: [],
  },
  Sobrevivente: {
    survivor: true,
    initial: { pv: 8, pe: 2, san: 8 },
    gain: { pv: 2, pe: 1, san: 2 },
    determination: { initial: 4, gain: 2 },
    fixedSkills: [],
    skillChoiceGroups: [],
    choiceSkills: (intellect) => Math.max(1, 1 + intellect),
    trails: ["Durão", "Esperto", "Esotérico"],
  },
  Combatente: {
    initial: { pv: 20, pe: 2, san: 12 },
    gain: { pv: 4, pe: 2, san: 3 },
    determination: { initial: 6, gain: 3 },
    fixedSkills: [],
    skillChoiceGroups: [
      ["Luta", "Pontaria"],
      ["Fortitude", "Reflexos"],
    ],
    choiceSkills: (intellect) => Math.max(1, 1 + intellect),
    trails: [
      "Aniquilador",
      "Incursor",
      "Comandante de Campo",
      "Guerreiro",
      "Operações Especiais",
      "Tropa de Choque",
      "Agente Secreto",
      "Caçador",
      "Monstruoso",
      "Performático",
    ],
  },
  Especialista: {
    initial: { pv: 16, pe: 3, san: 16 },
    gain: { pv: 3, pe: 3, san: 4 },
    determination: { initial: 8, gain: 4 },
    fixedSkills: [],
    skillChoiceGroups: [],
    choiceSkills: (intellect) => Math.max(1, 7 + intellect),
    trails: [
      "Atirador de Elite",
      "Piloto de Drone",
      "Infiltrador",
      "Médico de Campo",
      "Negociador",
      "Técnico",
      "Bibliotecário",
      "Perseverante",
      "Muambeiro",
      "Granadeiro Blaster",
      "Monstruoso",
      "Performático",
    ],
  },
  Ocultista: {
    initial: { pv: 12, pe: 4, san: 20 },
    gain: { pv: 2, pe: 4, san: 5 },
    determination: { initial: 10, gain: 5 },
    fixedSkills: ["Ocultismo", "Vontade"],
    skillChoiceGroups: [],
    choiceSkills: (intellect) => Math.max(1, 3 + intellect),
    trails: [
      "Conduíte",
      "Flagelador",
      "Graduado",
      "Intuitivo",
      "Lâmina Paranormal",
      "Exorcista",
      "Possuído",
      "Parapsicólogo",
      "Maledictólogo",
      "Criptologista do Oculto",
      "Monstruoso",
      "Performático",
    ],
  },
};

export function findOrigin(name) {
  return ORIGINS.find((origin) => origin.name === name) ?? null;
}

export function levelFromNex(nex) {
  const normalized = Math.min(100, Math.max(0, Number(nex) || 0));
  return normalized === 0 ? 0 : Math.ceil(normalized / 5);
}

export function usesSeparateLevel(character) {
  return Boolean(character?.optionalRules?.separateLevelNex);
}

export function isMundaneCharacter(character) {
  return !usesSeparateLevel(character) && Number(character?.nex) === 0 && character?.classe !== "Sobrevivente";
}

export function isSurvivorCharacter(character) {
  return character?.classe === "Sobrevivente";
}

export function survivorStage(character) {
  if (!isSurvivorCharacter(character)) return 0;
  return Math.min(
    SURVIVOR_STAGE_CAP,
    Math.max(1, Math.trunc(Number(character?.sobreviventeEstagio) || 1)),
  );
}

export function characterLevel(character) {
  if (usesSeparateLevel(character)) {
    return Math.min(20, Math.max(1, Number(character?.nivel) || 1));
  }
  return levelFromNex(character?.nex);
}

export function attributeTarget(nex, separateLevelNex = false) {
  return Number(nex) === 0 && !separateLevelNex
    ? MUNDANE_ATTRIBUTE_TARGET
    : ATTRIBUTE_TARGET;
}

export function attributeBudget(attributes, nex = 5, separateLevelNex = false) {
  const values = Object.values(attributes).map((value) => Number(value) || 0);
  const total = values.reduce((sum, value) => sum + value, 0);
  const target = attributeTarget(nex, separateLevelNex);
  return {
    total,
    target,
    remaining: target - total,
    zeroCount: values.filter((value) => value === 0).length,
    valid:
      total === target &&
      values.every((value) => value >= 0 && value <= ATTRIBUTE_MAX_AT_CREATION) &&
      values.filter((value) => value === 0).length <= 1,
  };
}

function hasSelectedPower(character, powerSlug) {
  return ownsAbility(character, powerSlug);
}

// Trilha Monstruoso (Sobrevivendo ao Horror p.17 para Combatente;
// Arquivos Secretos #7 p.81 e p.85 para Especialista e Ocultista): cada
// classe escolhe o mesmo elemento (Sangue/Morte/Conhecimento/Energia),
// mas o atributo que passa a calcular PE (e, só para Ocultista, a DT dos
// rituais) libera em NEX diferentes por classe — Especialista e Ocultista
// já na primeira habilidade da trilha (NEX 10%), Combatente só na
// segunda (Ser Macabro, NEX 40%).
const MONSTROUS_SWAP_ABILITY = {
  Combatente: "ser-macabro",
  Especialista: "ser-experimentado",
  Ocultista: "ser-escarificado",
};
const MONSTROUS_ELEMENT_ATTRIBUTE = {
  Sangue: "forca",
  Morte: "vigor",
  Conhecimento: "intelecto",
  Energia: "agilidade",
};

function monstrousElement(character) {
  return chosenMonstrousElement(character) || null;
}

function monstrousEffortAttribute(character) {
  const swapAbility = Object.values(MONSTROUS_SWAP_ABILITY).find((name) => hasSelectedPower(character, name));
  if (!swapAbility || !monstrousRitualActive(character)) return null;
  const element = monstrousElement(character);
  return MONSTROUS_ELEMENT_ATTRIBUTE[element] ?? null;
}

// Poderes de origem não entram em habilidadesSelecionadas: eles são
// automáticos a partir da origem escolhida (ver automaticAbilitiesFor em
// app.js), inclusive uma segunda origem obtida via "Flashback".
function hasOriginPower(character, powerName) {
  if (findOrigin(character?.origem)?.power === powerName) return true;
  return hasSelectedPower(character, "flashback") && (character?.habilidadeEscolhas ?? []).some(
    (choice) => choice.type === "origem" && findOrigin(choice.valueId)?.power === powerName,
  );
}

// Poderes passivos e incondicionais que somam um valor fixo numa perícia
// específica, sempre que conhecidos (nenhum depende de ação, alvo ou item
// equipado). Poderes que só valem contra um alvo específico (Envolto em
// Mistério), que trocam o atributo usado no teste (Racionalidade
// Inflexível) ou que vêm de trilha/ritual ficam fora por enquanto — são
// mecanicamente diferentes de "soma um número fixo".
const ABILITY_SKILL_BONUSES = [
  ["vontade-inabalavel", "Vontade", 2],
  ["vitalidade-reforcada", "Fortitude", 2],
  ["adaptacao-climatica", "Fortitude", 2],
  ["muito-sorrateiro", "Furtividade", 3],
  // Ocultista já é treinado em Ocultismo por classe, então o livro dá um
  // +2 direto em vez do "torna-se treinado ou +2" das outras duas classes.
  ["ser-escarificado", "Ocultismo", 2],
  ["gatuno", "Atletismo", 5],
  ["gatuno", "Crime", 5],
  ["o-sorriso", "Diplomacia", 2],
  ["o-sorriso", "Enganação", 2],
  ["iniciativa-aprimorada", "Iniciativa", 5],
];

// Mesma ideia, mas concedidos por uma origem em vez de uma habilidade.
const ORIGIN_SKILL_BONUSES = [
  ["Luta ou Fuga", "Vontade", 2],
];

// Bônus que só valem com Afinidade no elemento do poder (livro base p.116:
// Sangue de Ferro dá +2 PV/NEX sempre, e mais +5 Fortitude com Afinidade).
const AFFINITY_SKILL_BONUSES = [
  ["sangue-de-ferro", "Sangue", "Fortitude", 5],
];

export function abilitySkillBonus(character, skill) {
  const trainingBonuses = { "Rastrear o Paranormal": ["Sobrevivência", 2], "Revelação do Mal": ["Religião", 2], "Ser Amaldiçoado": ["Ocultismo", 2], "Ser Experimentado": ["Ocultismo", 2], "Meus Bebês": ["Profissão", 5], "Laboratório de Campo": ["Profissão", 5] };
  const owned = new Map(ownedAbilities(character).map((entry) => [entry.id, entry]));
  const fromTraining = (character.habilidadeEscolhas ?? []).filter((choice) => choice.type === "treinamento" && choice.valueId === "bonus").reduce((sum, choice) => {
    const name = owned.get(choice.abilityId)?.name;
    const benefit = name === "Carteirada" ? [(character.habilidadeEscolhas ?? []).find((item) => item.abilityId === choice.abilityId && item.type === "pericia")?.valueId, 2] : trainingBonuses[name];
    return sum + (benefit?.[0] === skill ? benefit[1] : 0);
  }, 0);
  const cqbBonus = ownsCqb(character) && ["Luta", "Pontaria"].includes(skill) && cqbChoice(character) === "bonus" ? 2 : 0;
  const fromAbilities = ABILITY_SKILL_BONUSES.reduce(
    (sum, [slug, targetSkill, bonus]) => sum + (targetSkill === skill && hasSelectedPower(character, slug) ? bonus : 0),
    0,
  );
  const fromOrigin = ORIGIN_SKILL_BONUSES.reduce(
    (sum, [powerName, targetSkill, bonus]) => sum + (targetSkill === skill && hasOriginPower(character, powerName) ? bonus : 0),
    0,
  );
  const fromAffinity = AFFINITY_SKILL_BONUSES.reduce(
    (sum, [slug, element, targetSkill, bonus]) => sum + (
      targetSkill === skill && character?.afinidadeElemental === element && hasSelectedPower(character, slug) ? bonus : 0
    ),
    0,
  );
  const socialPenalty = ["Diplomacia", "Enganação", "Intuição"].includes(skill) && (hasSelectedPower(character, "ser-experimentado") || hasSelectedPower(character, "ser-escarificado"))
    ? ["ser-expurgado", "ser-rasgado"].some((name) => hasSelectedPower(character, name)) ? 0 : ["ser-testado", "ser-perfurado"].some((name) => hasSelectedPower(character, name)) ? -5 : -2
    : 0;
  return fromAbilities + fromOrigin + fromAffinity + fromTraining + cqbBonus + tacticalTestBonus(character) + socialPenalty;
}

export function abilitySkillDiceModifier(character, skill) {
  let modifier = 0;
  if (["Diplomacia", "Enganação", "Intuição"].includes(skill)) {
    if (["ser-apavorante", "ser-mutilado"].some((name) => hasSelectedPower(character, name))) modifier -= 2;
    else if (["ser-expurgado", "ser-rasgado"].some((name) => hasSelectedPower(character, name))) modifier -= 1;
  }
  const penalties = { Sangue: ["Ciências", "Intuição"], Morte: ["Diplomacia", "Enganação"], Conhecimento: ["Atletismo", "Acrobacia"], Energia: ["Investigação", "Percepção"] };
  if (hasSelectedPower(character, "ser-amaldicoado") && penalties[monstrousElement(character)]?.includes(skill)) modifier -= hasSelectedPower(character, "ser-macabro") ? 2 : 1;
  if (skill === "Religião" && hasSelectedPower(character, "poder-da-fe") && (character.habilidadeEscolhas ?? []).some((choice) => String(choice.abilityId).endsWith("-poder-da-fe") && choice.type === "treinamento" && choice.valueId === "bonus")) modifier++;
  return modifier;
}

function ownsCqb(character) {
  const progress = usesSeparateLevel(character) ? characterLevel(character) * 5 : Number(character?.nex) || 0;
  return (character?.classe === "Combatente" && character?.trilha === "Incursor" && progress >= 10) || hasSelectedPower(character, "cqb");
}

function cqbChoice(character) {
  return (character?.habilidadeEscolhas ?? []).find((choice) => choice.type === "cqb" && String(choice.abilityId).endsWith("-cqb"))?.valueId;
}

function hellTraining(character) {
  if (!hasOriginPower(character, "Resistência do Treinamento")) return "";
  if (character?.origem === "Treinado pela Hell Hunters") {
    const skills = character.periciasOrigemEscolhidas ?? [];
    if (skills.length === 2 && ["Luta", "Fortitude"].every((skill) => skills.includes(skill))) return "pv";
    if (skills.length === 2 && ["Pontaria", "Reflexos"].every((skill) => skills.includes(skill))) return "pe";
    return "";
  }
  return (character?.habilidadeEscolhas ?? []).find((choice) => choice.type === "treinamento" && String(choice.abilityId).endsWith("-resistencia-do-treinamento"))?.valueId ?? "";
}

export function equippedProtections(character) {
  const entries = Array.isArray(character?.inventarioItens) ? character.inventarioItens : [];
  const seen = new Set();
  const items = [];
  for (const selected of entries) {
    const original = ITEM_BY_ID.get(selected.itemId);
    if (!original || original.group !== "Proteções" || seen.has(original.id)) continue;
    seen.add(original.id);
    items.push(upgradedItem(original, character?.inventarioModificacoes?.[original.id]));
  }
  return items;
}

function equipmentDefenseBonus(character) {
  return equippedProtections(character).reduce((sum, item) => {
    const value = item.details?.find(([key]) => key === "Defesa")?.[1];
    return sum + (Number(value) || 0);
  }, 0);
}

// Livro base: "Reflexos Defensivos" e "Precognição" são bônus passivos e
// incondicionais (+2 na Defesa sempre que a habilidade é conhecida), assim
// como "Patrulha" (poder da origem Policial). "Tanque de Guerra" e
// "Especialista em Proteção Leve" também são sempre ativos, mas só enquanto
// a proteção do tipo certo (pesada/leve) estiver equipada — dado que já
// lemos do inventário. Os demais bônus de Defesa do livro que dependem de
// uma ação/reação (Combate Defensivo, Barreira do Oculto) ficam de fora — o
// jogador aplica na hora, como já faz com o resto do combate. Rituais como
// Armadura de Sangue e Embaralhar são diferentes: duram a cena inteira uma
// vez conjurados, então entram por ativarRitualEffect()/efeitosAtivos em vez
// de daqui (ver mais abaixo).
function abilityDefenseBonus(character) {
  const formation = character?.operacoesAS9?.formation;
  let bonus = droneDefense(character) + tacticalDefense(character) + (formation?.type === "cunha" && formation.untilTurn >= (character.operacoesAS9.turn ?? 1) ? 5 : 0);
  if (hasSelectedPower(character, "reflexos-defensivos")) bonus += 2;
  if (hasSelectedPower(character, "precognicao")) bonus += 2;
  if (monstrousElement(character) === "Conhecimento" && hasSelectedPower(character, "ser-amaldicoado") && monstrousRitualActive(character)) bonus += effectiveAttributes(character).intelecto;
  if (hasOriginPower(character, "Patrulha")) bonus += 2;
  if (hasSelectedPower(character, "inquebravel") && isCharacterHurt(character)) bonus += 5;
  const proficiencies = equippedProtections(character).map(
    (item) => item.details?.find(([key]) => key === "Proficiência")?.[1] ?? "",
  );
  if (hasSelectedPower(character, "tanque-de-guerra") && proficiencies.some((value) => /pesada/i.test(value))) bonus += 2;
  if (hasSelectedPower(character, "especialista-em-protecao-leve") && proficiencies.some((value) => /leve/i.test(value))) bonus += 2;
  return bonus;
}

// Rituais que, uma vez conjurados, ficam com um efeito simples e contínuo
// até o jogador cancelar (ver character.efeitosAtivos, ligado pelo botão
// "Conjurar" e desligado por "Cancelar" na ficha — não expira sozinho
// porque cena/rodada não são mais rastreados automaticamente, ver o commit
// que tirou Resetar turno/cena). Cada variante guarda { defense } e,
// quando o livro também dá resistência a dano nessa variante (só
// Armadura de Sangue Discente/Verdadeiro), { resistanceLabel,
// resistanceValue } — isso alimenta tanto a Defesa quanto a caixa de
// Resistências (characterResistances, aba Resumo). "Armadura de Sangue"
// tem uma regra própria: não acumula com a Defesa do equipamento.
export const RITUAL_ACTIVE_EFFECTS = {
  "Armadura de Sangue": {
    Normal: { defense: 5 },
    Discente: { defense: 10, resistanceLabel: "Balístico, corte, impacto e perfuração", resistanceValue: 5 },
    Verdadeiro: { defense: 15, resistanceLabel: "Balístico, corte, impacto e perfuração", resistanceValue: 10 },
    excludesEquipmentDefense: true,
  },
  "Embaralhar": { Normal: { defense: 6 }, Discente: { defense: 10 }, Verdadeiro: { defense: 16 } },
};

// Mesma ideia, mas para uma habilidade (não ritual) cujo bônus só vale
// "durante uma cena de combate" — a ficha não sabe quando isso começa ou
// termina, então é o jogador quem ativa/desativa (mesmo botão Cancelar dos
// efeitos de ritual, ver renderActiveEffects em app.js). Só a Defesa base
// de +5 é automática; o +1 extra por acerto crítico do Rítmo Contagiante
// fica por conta do jogador.
export const ABILITY_ACTIVE_EFFECTS = {
  "Rítmo Contagiante": { Ativo: { defense: 5 } },
};

export function activeEffectData(effect) {
  return RITUAL_ACTIVE_EFFECTS[effect.name]?.[effect.variant] ?? ABILITY_ACTIVE_EFFECTS[effect.name]?.[effect.variant];
}

function activeEffectDefenseBonus(character) {
  return (character?.efeitosAtivos ?? []).reduce((sum, effect) => {
    const bonus = activeEffectData(effect)?.defense;
    return sum + (typeof bonus === "number" ? bonus : 0);
  }, 0);
}

function activeEffectsExcludeEquipmentDefense(character) {
  return (character?.efeitosAtivos ?? []).some((effect) => RITUAL_ACTIVE_EFFECTS[effect.name]?.excludesEquipmentDefense);
}

// "Machucado" (livro base): PV atual <= metade do PV máximo, arredondado
// para baixo — mesma conta já usada para as ameaças (ver machucadoEm em
// threats.js).
export function isCharacterHurt(character) {
  const pvMax = Number(character?.recursos?.pvMax) || 0;
  const pvAtual = Number(character?.recursos?.pvAtual) || 0;
  return pvMax > 0 && pvAtual <= Math.floor(pvMax / 2);
}

// Tipos de dano da progressão de resistência da trilha Monstruoso de
// Combatente (Sobrevivendo ao Horror p.17-20) — só essa classe descreve a
// trilha como uma escada simples de RD por elemento; Especialista e
// Ocultista Monstruoso trocam RD por mecânicas que dependem de gastar
// pontos de atributo a cada uso, então ficam fora daqui.
const COMBATENTE_MONSTRUOSO_RESISTANCE_TYPES = {
  Sangue: "Balístico e Sangue",
  Morte: "Perfuração e Morte",
  Conhecimento: "Balístico e Conhecimento",
  Energia: "Corte, eletricidade, fogo e Energia",
};

// Resistências a dano — permanentes ou ligadas agora por um efeito ativo de
// ritual/habilidade (aba Resumo, seção "Resistências"). Cobre poderes/
// habilidades/origens/efeitos ativos com valor automático e claro — fica de
// fora o que depende de uma ação específica (Casca Grossa só ao bloquear)
// ou de equipamento (Tanque de Guerra). `rituals`/`paranormalPowers` são
// injetados pelo chamador (rules.js não importa o catálogo de content.js)
// só para o Sofrimento de Sangue, que conta quantos rituais/poderes de
// Sangue o personagem conhece.
export function characterResistances(character, { rituals = [], paranormalPowers = [] } = {}) {
  const list = [];
  if (equippedProtections(character).some((item) => item.name === "Escudo Balístico LED")) {
    list.push({ label: "Balístico", value: 10, source: "Escudo Balístico LED" });
  }
  const hurt = isCharacterHurt(character);

  for (const effect of character?.efeitosAtivos ?? []) {
    const data = activeEffectData(effect);
    if (data?.resistanceValue) {
      list.push({ label: data.resistanceLabel, value: data.resistanceValue, source: `${effect.name} (${effect.variant})` });
    }
  }

  const resistirEscolhas = (character?.habilidadeEscolhas ?? []).filter(
    (choice) => choice.type === "elemento" && String(choice.abilityId).endsWith("-resistir-a-elemento"),
  );
  for (const choice of resistirEscolhas) {
    const value = character?.afinidadeElemental === choice.valueId ? 20 : 10;
    list.push({ label: choice.valueId, value, source: "Resistir a Elemento" });
  }

  if (hasSelectedPower(character, "ser-amaldicoado") && monstrousRitualActive(character)) {
    const element = monstrousElement(character);
    const value = hasSelectedPower(character, "ser-aterrorizante") ? 20
      : hasSelectedPower(character, "ser-assustador") ? 15
        : hasSelectedPower(character, "ser-macabro") ? 10
          : hasSelectedPower(character, "ser-amaldicoado") ? 5
            : 0;
    let label = COMBATENTE_MONSTRUOSO_RESISTANCE_TYPES[element];
    if (element === "Energia" && hasSelectedPower(character, "ser-assustador")) label += ", químico";
    if (element === "Morte" && hasSelectedPower(character, "ser-aterrorizante")) {
      label = "Perfuração";
      list.push({ label: "Morte", value: "Imune", source: "Ser Aterrorizante" });
    }
    if (element && value) list.push({ label, value, source: "Trilha Monstruoso" });
  }

  if (hasSelectedPower(character, "sangue-prazeroso") && hurt) {
    list.push({ label: "Sangue", value: 5, source: "Sangue Prazeroso" });
  }
  if (hasSelectedPower(character, "inquebravel") && hurt) {
    list.push({ label: "Geral", value: 5, source: "Inquebrável" });
  }
  if (hasSelectedPower(character, "inabalavel")) {
    list.push({ label: "Mental e paranormal", value: 10, source: "Inabalável" });
  }
  if (hasOriginPower(character, "Eu Já Sabia")) {
    const intelecto = effectiveAttributes(character).intelecto;
    if (intelecto > 0) list.push({ label: "Mental", value: intelecto, source: "Eu Já Sabia" });
  }
  if (hasOriginPower(character, "Mutação")) {
    list.push({ label: "Geral", value: 2, source: "Mutação" });
  }
  if (hasOriginPower(character, "Sofrimento de Sangue")) {
    const knownAbilityIds = new Set(character?.habilidadesSelecionadas ?? []);
    const sangueRituals = (character?.rituaisSelecionados ?? []).filter(
      (id) => rituals.find((entry) => entry.id === id)?.elements?.includes("Sangue"),
    ).length;
    const sanguePowers = paranormalPowers.filter((entry) => entry.group === "Sangue" && knownAbilityIds.has(entry.id)).length;
    list.push({ label: "Mental", value: 2 + Math.floor((sangueRituals + sanguePowers) / 2), source: "Sofrimento de Sangue" });
  }
  if (hasOriginPower(character, "O Que Restou")) {
    const element = (character?.habilidadeEscolhas ?? []).find(
      (choice) => choice.type === "elemento" && String(choice.abilityId).endsWith("-o-que-restou"),
    )?.valueId;
    if (element) list.push({ label: element, value: 5, source: "O Que Restou" });
  }

  return list;
}

// "Fôlego de Nadador" (origem Mergulhador) soma +5 PV fixos. "Calejado"
// (origem Desgarrado) soma +1 PV a cada 5% de NEX — não faz sentido pra um
// personagem Sobrevivente, que progride por estágio em vez de NEX.
function originVitalityBonus(character, nex) {
  let bonus = 0;
  if (hasOriginPower(character, "Fôlego de Nadador")) bonus += 5;
  if (!isSurvivorCharacter(character) && hasOriginPower(character, "Calejado")) bonus += Math.floor(nex / 5);
  if (nex >= 5 && hellTraining(character) === "pv") bonus += 2 + Math.floor(nex / 10);
  return bonus;
}

// "Dedicação" (origem Universitário): +1 PE sempre, mais +1 PE a cada NEX
// ímpar (15%, 25%, 35%...); essa escala não faz sentido pra Sobrevivente,
// mas o +1 PE base continua valendo pra ele.
function originEffortBonus(character, level) {
  const training = Number(character?.nex) >= 5 && hellTraining(character) === "pe" ? 1 + Math.floor(Number(character.nex) / 10) : 0;
  if (!hasOriginPower(character, "Dedicação")) return training;
  const oddNexSteps = isSurvivorCharacter(character) ? 0 : Math.floor(Math.max(0, level - 1) / 2);
  return 1 + oddNexSteps + training;
}

function ritualDtItemBonus(character, ritual, knowsSangueRitual) {
  const owned = new Set(
    (character?.inventarioItens ?? [])
      .map((selected) => ITEM_BY_ID.get(selected.itemId)?.name)
      .filter(Boolean),
  );
  let bonus = 0;
  if (owned.has("A Antena")) bonus += 3;
  if (owned.has("Cajado da Cruz de Sangue") && ritual?.element === "Sangue" && character?.classe === "Ocultista" && knowsSangueRitual) {
    bonus += 1;
  }
  return bonus;
}

// Livro base, p.78 ("DT de Testes de Resistência"): 10 + limite de PE por
// turno + o atributo indicado (Presença, para rituais). "A Antena" e o
// Cajado da Cruz de Sangue (Arquivos Secretos #7, só pra rituais de Sangue
// com um ocultista que já conheça um) somam bônus fixos quando possuídos.
// Ocultista Monstruoso (Ser Escarificado, Arquivos Secretos #7 p.85) troca
// Presença pelo atributo do elemento escolhido também para essa DT.
export function ritualDifficulty(character, ritual, knowsSangueRitual = false) {
  const attributes = effectiveAttributes(character);
  const presenca = attributes.presenca;
  const monstrousAttribute = hasSelectedPower(character, "ser-escarificado") ? monstrousEffortAttribute(character) : null;
  const dtAttribute = monstrousAttribute ? attributes[monstrousAttribute] : presenca;
  const owned = new Map(ownedAbilities(character).map((entry) => [entry.id, entry]));
  const specialist = (character.habilidadeEscolhas ?? []).some((choice) => owned.get(choice.abilityId)?.name === "Especialista em Elemento" && choice.type === "elemento" && (ritual?.elements ?? [ritual?.element]).includes(choice.valueId)) ? 2 : 0;
  return 10 + turnSpendLimit(character) + dtAttribute + ritualDtItemBonus(character, ritual, knowsSangueRitual) + (hasSelectedPower(character, "rituais-eficientes") ? 5 : 0) + specialist;
}

export function calculateDerived(character) {
  const classData = CLASSES[character.classe];
  const skillChoices = classData ? classData.choiceSkills(Number(character.atributos?.intelecto) || 0) + (hasSelectedPower(character, "a-forca-do-saber") ? 1 : 0) : 0;
  const { forca, vigor, presenca, intelecto, agilidade } = effectiveAttributes(character);
  const rawNex = Number(character.nex);
  const nex = Number.isFinite(rawNex) ? Math.min(100, Math.max(0, rawNex)) : 0;
  const level = characterLevel(character);
  const stage = survivorStage(character);
  const advances = character.classe === "Mundano"
    ? 0
    : isSurvivorCharacter(character)
      ? Math.max(0, stage - 1)
      : Math.max(0, level - 1);
  const usesDetermination = Boolean(
    character.optionalRules?.determination && classData?.determination,
  );
  const monstrousAttribute = monstrousEffortAttribute(character);
  const attributeValues = { forca, vigor, presenca, intelecto, agilidade };
  const effortAttribute = monstrousAttribute
    ? attributeValues[monstrousAttribute]
    : hasSelectedPower(character, "racionalidade-inflexivel")
      ? intelecto
      : presenca;
  const personalityEffort = hasSelectedPower(character, "personalidade-esoterica") ? 3 : 0;
  const vitalityBonus = hasSelectedPower(character, "vitalidade-reforcada")
    ? (isSurvivorCharacter(character) ? 0 : Math.max(0, level))
    : 0;
  // Sangue de Ferro (livro base p.116): +2 PV máximos por NEX (por nível).
  const sangueDeFerroBonus = hasSelectedPower(character, "sangue-de-ferro")
    ? (isSurvivorCharacter(character) ? 0 : 2 * Math.max(0, level))
    : 0;
  const willEffortBonus = hasSelectedPower(character, "vontade-inabalavel")
    ? (isSurvivorCharacter(character) ? 0 : Math.floor(Math.max(0, level) / 2))
    : 0;
  // Combatente Esforçado (poder de classe): +1 PE máximo por nível de NEX,
  // mesmo cálculo do Sangue de Ferro acima, só que para PE em vez de PV.
  const combatenteEsforcadoBonus = hasSelectedPower(character, "combatente-esforcado")
    ? (isSurvivorCharacter(character) ? 0 : Math.max(0, level))
    : 0;
  // Potencial Aprimorado (paranormal de Morte, livro base p.115): +1 PE
  // máximo por NEX, e +2 por NEX com Afinidade de Morte.
  const potencialAprimoradoBonus = hasSelectedPower(character, "potencial-aprimorado")
    ? (isSurvivorCharacter(character) ? 0 : Math.max(0, level) * (character.afinidadeElemental === "Morte" ? 2 : 1))
    : 0;
  const originVitality = originVitalityBonus(character, nex);
  const originEffort = originEffortBonus(character, level);
  const transcenderLevels = Array.isArray(character.transcenderNiveis)
    ? [...new Set(character.transcenderNiveis.map(Number).filter((value) => Number.isInteger(value) && value >= 1 && value <= level))]
    : [];
  const transcenderSanPenalty = !usesDetermination && !usesSeparateLevel(character)
    ? transcenderLevels.length * (classData?.gain?.san ?? 0)
    : 0;
  const possessionMax = character.trilha === "Possuído" && level >= 2
    ? 3 + transcenderLevels.length * 2
    : 0;
  const trailVitality = (hasSelectedPower(character, "casca-grossa") ? level : 0) + (hasSelectedPower(character, "ser-amaldicoado") && monstrousElement(character) === "Morte" && monstrousRitualActive(character) ? forca : 0);
  const trailEffort = hasSelectedPower(character, "a-forca-do-saber") ? intelecto : 0;

  if (!classData) {
    return {
      pvMax: 0,
      peMax: 0,
      sanMax: 0,
      defesa: 10 + agilidade + beforeSoBonus(character) + (activeEffectsExcludeEquipmentDefense(character) ? 0 : equipmentDefenseBonus(character)) + abilityDefenseBonus(character) + activeEffectDefenseBonus(character),
      deslocamento: 9 + formationMovement(character),
      advances,
      skillChoices: 0,
      fixedSkills: [],
      skillChoiceGroups: [],
      level,
      stage,
      usesDetermination: false,
      pdMax: 0,
      ppMax: 0,
      transcenderSanPenalty: 0,
    };
  }

  // Traços do Outro Lado (origem Cultista Arrependido, livro base p.18):
  // começa o jogo com metade da Sanidade inicial da classe (a perda vale só
  // para o valor inicial, não para o ganho por avanço).
  const classInitialSan = hasOriginPower(character, "Traços do Outro Lado")
    ? Math.floor(classData.initial.san / 2)
    : classData.initial.san;

  if (isSurvivorCharacter(character)) {
    const survivorDurability = character.trilha === "Durão"
      ? (stage >= 3 ? 6 : stage >= 2 ? 4 : 0)
      : 0;
    return {
      pvMax: classData.initial.pv + vigor + advances * classData.gain.pv + survivorDurability + vitalityBonus + originVitality,
      peMax: classData.initial.pe + effortAttribute + advances * classData.gain.pe + personalityEffort + willEffortBonus + originEffort,
      sanMax: classInitialSan + advances * classData.gain.san,
      defesa: 10 + agilidade + beforeSoBonus(character) + (activeEffectsExcludeEquipmentDefense(character) ? 0 : equipmentDefenseBonus(character)) + abilityDefenseBonus(character) + activeEffectDefenseBonus(character),
      deslocamento: 9 + formationMovement(character),
      advances,
      skillChoices,
      fixedSkills: classData.fixedSkills,
      skillChoiceGroups: classData.skillChoiceGroups,
      level: 0,
      stage,
      usesDetermination,
      transcenderSanPenalty: 0,
      pdMax: usesDetermination
        ? classData.determination.initial + effortAttribute + advances * classData.determination.gain
        : 0,
      ppMax: 0,
    };
  }

  return {
    pvMax: classData.initial.pv + vigor + advances * (classData.gain.pv + vigor) + vitalityBonus + originVitality + sangueDeFerroBonus + trailVitality,
    peMax: classData.initial.pe + effortAttribute + advances * (classData.gain.pe + effortAttribute) + personalityEffort + willEffortBonus + originEffort + combatenteEsforcadoBonus + potencialAprimoradoBonus + trailEffort,
    sanMax: Math.max(0, classInitialSan + advances * classData.gain.san - transcenderSanPenalty),
    defesa: 10 + agilidade + beforeSoBonus(character) + (activeEffectsExcludeEquipmentDefense(character) ? 0 : equipmentDefenseBonus(character)) + abilityDefenseBonus(character) + activeEffectDefenseBonus(character),
    deslocamento: 9 + formationMovement(character),
    advances,
    skillChoices,
    fixedSkills: classData.fixedSkills,
    skillChoiceGroups: classData.skillChoiceGroups,
    level,
    stage,
    usesDetermination,
    transcenderSanPenalty,
    pdMax: usesDetermination
        ? classData.determination.initial + effortAttribute + advances * (classData.determination.gain + effortAttribute) + trailEffort
      : 0,
    ppMax: possessionMax,
  };
}

function uniqueSkills(skills) {
  return [...new Set(skills.filter((skill) => SKILLS.includes(skill)))];
}

const POWER_SKILL_GRANTS = [
  ["-acrobatico", "Acrobacia"],
  ["-apaixonado-por-veiculos", "Pilotagem"],
  ["-as-do-volante", "Pilotagem"],
  ["-atletico", "Atletismo"],
  ["-direcao-defensiva", "Pilotagem"],
  ["-dedos-ageis", "Crime"],
  ["-detector-de-mentiras", "Intuição"],
  ["-especialista-em-emergencias", "Medicina"],
  ["-informado", "Atualidades"],
  ["-interrogador", "Intimidação"],
  ["-mentiroso-nato", "Enganação"],
  ["-observador", "Investigação"],
  ["-pai-de-pet", "Adestramento"],
  ["-palavras-de-devocao", "Religião"],
  ["-pensamento-tatico", "Tática"],
  ["-personalidade-esoterica", "Ocultismo"],
  ["-persuasivo", "Diplomacia"],
  ["-pesquisador-cientifico", "Ciências"],
  ["-proativo", "Iniciativa"],
  ["-rato-de-computador", "Tecnologia"],
  ["-resposta-rapida", "Reflexos"],
  ["-talentoso", "Artes"],
  ["-teimosia-obstinada", "Vontade"],
  ["-tenacidade", "Fortitude"],
  ["-sentidos-agucados", "Percepção"],
  ["-sobrevivencialista", "Sobrevivência"],
  ["-sorrateiro", "Furtividade"],
];

function powerGrantedSkills(character) {
  const selected = (character?.habilidadesSelecionadas ?? []).map(String);
  const trailSkills = [];
  if (hasSelectedPower(character, "rastrear-o-paranormal")) trailSkills.push("Sobrevivência");
  if (["ser-amaldicoado", "ser-experimentado", "ser-escarificado"].some((name) => hasSelectedPower(character, name))) trailSkills.push("Ocultismo");
  if (hasSelectedPower(character, "revelacao-do-mal")) trailSkills.push("Religião");
  if (hasSelectedPower(character, "meus-bebes") || hasSelectedPower(character, "mascate")) trailSkills.push("Profissão");
  const cqb = cqbChoice(character);
  if (ownsCqb(character) && ["Luta", "Pontaria"].includes(cqb)) trailSkills.push(cqb);
  return uniqueSkills([...POWER_SKILL_GRANTS
    .filter(([suffix]) => selected.some((id) => id.endsWith(suffix)))
    .map(([, skill]) => skill), ...trailSkills]);
}

export function getSkillConfiguration(character) {
  const origin = findOrigin(character.origem);
  const derived = calculateDerived(character);
  const originAutomatic = uniqueSkills(
    (origin?.skills ?? []).map((skill) => (skill.startsWith("Profissão") ? "Profissão" : skill)),
  );
  const rawClassAutomatic = uniqueSkills(derived.fixedSkills);
  const repeatedAutomaticSkills = rawClassAutomatic.filter((skill) =>
    originAutomatic.includes(skill),
  ).length;
  return {
    originAutomatic,
    originChoiceCount: Number(origin?.skillChoices) || 0,
    originChoiceLabel: origin?.skillChoiceLabel || "Perícias da origem",
    originSkillPairs: origin?.skillPairs ?? [],
    classAutomatic: rawClassAutomatic.filter((skill) => !originAutomatic.includes(skill)),
    classChoiceGroups: derived.skillChoiceGroups ?? [],
    classChoiceCount: derived.skillChoices + repeatedAutomaticSkills,
  };
}

export function sanitizeSkillSelections(character) {
  const config = getSkillConfiguration(character);
  const blockedAtStart = new Set([...config.originAutomatic, ...config.classAutomatic]);

  character.periciasOrigemEscolhidas = uniqueSkills(character.periciasOrigemEscolhidas ?? [])
    .filter((skill) => !blockedAtStart.has(skill))
    .slice(0, config.originChoiceCount);
  if (config.originSkillPairs.length && !config.originSkillPairs.some((pair) => pair.length === character.periciasOrigemEscolhidas.length && pair.every((skill) => character.periciasOrigemEscolhidas.includes(skill)))) {
    character.periciasOrigemEscolhidas = [];
  }

  const blockedForGroups = new Set([
    ...blockedAtStart,
    ...character.periciasOrigemEscolhidas,
  ]);
  character.periciasClasseObrigatorias = (character.periciasClasseObrigatorias ?? [])
    .map((skill, index) =>
      config.classChoiceGroups[index]?.includes(skill) && !blockedForGroups.has(skill) ? skill : "",
    )
    .slice(0, config.classChoiceGroups.length);
  while (character.periciasClasseObrigatorias.length < config.classChoiceGroups.length) {
    character.periciasClasseObrigatorias.push("");
  }

  const blockedForFree = new Set([
    ...blockedForGroups,
    ...character.periciasClasseObrigatorias,
  ]);
  character.periciasEscolhidas = uniqueSkills(character.periciasEscolhidas ?? [])
    .filter((skill) => !blockedForFree.has(skill))
    .slice(0, config.classChoiceCount);

  character.periciasAdicionais = uniqueSkills(character.periciasAdicionais ?? [])
    .filter((skill) => !blockedForFree.has(skill));

  character.periciasTreinadas = uniqueSkills([
    ...config.originAutomatic,
    ...character.periciasOrigemEscolhidas,
    ...config.classAutomatic,
    ...character.periciasClasseObrigatorias,
    ...character.periciasEscolhidas,
    ...character.periciasAdicionais,
    ...powerGrantedSkills(character),
  ]);

  return character;
}

export function skillSelectionStatus(character) {
  sanitizeSkillSelections(character);
  const config = getSkillConfiguration(character);
  const requiredGroups = config.classChoiceGroups.length;
  const completedGroups = character.periciasClasseObrigatorias.filter(Boolean).length;
  return {
    config,
    originSelected: character.periciasOrigemEscolhidas.length,
    groupsSelected: completedGroups,
    classSelected: character.periciasEscolhidas.length,
    complete:
      character.periciasOrigemEscolhidas.length === config.originChoiceCount &&
      completedGroups === requiredGroups &&
      character.periciasEscolhidas.length === config.classChoiceCount,
  };
}

export function applyDerived(character, resetCurrent = false) {
  character.rituaisSelecionados = [...new Set([...(character.rituaisSelecionados ?? []), ...automaticTrailRituals(character).map((ritual) => ritual.id)])];
  sanitizeSkillSelections(character);
  const derived = calculateDerived(character);
  const skillConfig = getSkillConfiguration(character);
  character.recursos ??= {};
  character.nivel = derived.level;
  if (isSurvivorCharacter(character)) character.sobreviventeEstagio = derived.stage;
  character.grausPericia ??= {};
  for (const skill of powerGrantedSkills(character)) {
    character.grausPericia[skill] = Math.max(5, Number(character.grausPericia[skill]) || 0);
  }
  if (hasSelectedPower(character, "poder-da-fe")) character.grausPericia.Religião = Math.max(10, Number(character.grausPericia.Religião) || 0);

  for (const resource of ["pv", "pe", "san"]) {
    const maxKey = `${resource}Max`;
    const currentKey = `${resource}Atual`;
    const oldMax = Number(character.recursos[maxKey]) || 0;
    character.recursos[maxKey] = derived[maxKey];

    if (resetCurrent || character.recursos[currentKey] == null || character.recursos[currentKey] === oldMax) {
      character.recursos[currentKey] = derived[maxKey];
    } else {
      character.recursos[currentKey] = Math.min(
        Number(character.recursos[currentKey]) || 0,
        derived[maxKey],
      );
    }
  }

  const oldPdMax = Number(character.recursos.pdMax) || 0;
  character.recursos.pdMax = derived.pdMax;
  if (
    resetCurrent ||
    character.recursos.pdAtual == null ||
    character.recursos.pdAtual === oldPdMax
  ) {
    character.recursos.pdAtual = derived.pdMax;
  } else {
    character.recursos.pdAtual = Math.min(
      Number(character.recursos.pdAtual) || 0,
      derived.pdMax,
    );
  }

  const oldPpMax = Number(character.recursos.ppMax) || 0;
  character.recursos.ppMax = derived.ppMax;
  if (resetCurrent || character.recursos.ppAtual == null || character.recursos.ppAtual === oldPpMax) {
    character.recursos.ppAtual = derived.ppMax;
  } else {
    character.recursos.ppAtual = Math.min(Number(character.recursos.ppAtual) || 0, derived.ppMax);
  }

  character.defesa = derived.defesa;
  character.deslocamento = derived.deslocamento;
  const protections = equippedProtections(character);
  character.protecao = protections.length ? protections.map((item) => item.name).join(" + ") : "Nenhuma";

  const origin = findOrigin(character.origem);
  character.beneficiosOrigem = origin
    ? { skills: [...origin.skills], power: origin.power, source: origin.source }
    : null;
  character.periciasClasse = {
    fixed: uniqueSkills([
      ...derived.fixedSkills,
      ...(character.periciasClasseObrigatorias ?? []),
    ]),
    choices: skillConfig.classChoiceCount,
    selected: [...(character.periciasEscolhidas ?? [])],
  };

  return character;
}
