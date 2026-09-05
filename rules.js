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
  { name: "Acadêmico", skills: ["Ciências", "Investigação"], power: "Saber é Poder", source: "Livro base" },
  { name: "Agente de Saúde", skills: ["Intuição", "Medicina"], power: "Técnica Medicinal", source: "Livro base" },
  { name: "Amnésico", skills: [], skillChoices: 2, skillChoiceLabel: "Definidas com o mestre", power: "Vislumbres do Passado", source: "Livro base" },
  { name: "Artista", skills: ["Artes", "Diplomacia"], power: "Magnum Opus", source: "Livro base" },
  { name: "Atleta", skills: ["Atletismo", "Fortitude"], power: "110%", source: "Livro base" },
  { name: "Criminoso", skills: ["Crime", "Furtividade"], power: "O Crime Compensa", source: "Livro base" },
  { name: "Cultista Arrependido", skills: ["Enganação", "Ocultismo"], power: "Traços do Outro Lado", source: "Livro base" },
  { name: "Desgarrado", skills: ["Fortitude", "Sobrevivência"], power: "Calejado", source: "Livro base" },
  { name: "Engenheiro", skills: ["Profissão", "Tecnologia"], power: "Ferramentas Favoritas", source: "Livro base" },
  { name: "Executivo", skills: ["Diplomacia", "Profissão"], power: "Processo Otimizado", source: "Livro base" },
  { name: "Investigador", skills: ["Investigação", "Percepção"], power: "Faro para Pistas", source: "Livro base" },
  { name: "Lutador", skills: ["Acrobacia", "Iniciativa"], power: "Mão Pesada", source: "Livro base" },
  { name: "Magnata", skills: ["Diplomacia", "Pilotagem"], power: "Patrocinador da Ordem", source: "Livro base" },
  { name: "Mercenário", skills: ["Iniciativa", "Tática"], power: "Posição de Combate", source: "Livro base" },
  { name: "Militar", skills: ["Atletismo", "Pontaria"], power: "Treinamento Militar", source: "Livro base" },
  { name: "Operário", skills: ["Fortitude", "Profissão"], power: "Ferramentas da Profissão", source: "Livro base" },
  { name: "Policial", skills: ["Percepção", "Pontaria"], power: "Patrulha", source: "Livro base" },
  { name: "Religioso", skills: ["Religião", "Vontade"], power: "Exorcismo", source: "Livro base" },
  { name: "Servidor Público", skills: ["Intuição", "Vontade"], power: "Espírito Cívico", source: "Livro base" },
  { name: "Teórico da Conspiração", skills: ["Investigação", "Ocultismo"], power: "Eu Já Sabia", source: "Livro base" },
  { name: "T.I.", skills: ["Investigação", "Tecnologia"], power: "Computação Avançada", source: "Livro base" },
  { name: "Trabalhador Rural", skills: ["Adestramento", "Sobrevivência"], power: "Trilhas e Rumos", source: "Livro base" },
  { name: "Trambiqueiro", skills: ["Crime", "Enganação"], power: "Impostor", source: "Livro base" },
  { name: "Universitário", skills: ["Atualidades", "Investigação"], power: "Empenho", source: "Livro base" },

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
      "Comandante de Campo",
      "Guerreiro",
      "Operações Especiais",
      "Tropa de Choque",
      "Agente Secreto",
      "Caçador",
      "Monstruoso",
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
      "Infiltrador",
      "Médico de Campo",
      "Negociador",
      "Técnico",
      "Bibliotecário",
      "Perseverante",
      "Muambeiro",
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
  return (character?.habilidadesSelecionadas ?? []).some((id) =>
    String(id).endsWith(`-${powerSlug}`),
  );
}

export function calculateDerived(character) {
  const classData = CLASSES[character.classe];
  const vigor = Number(character.atributos?.vigor) || 0;
  const presenca = Number(character.atributos?.presenca) || 0;
  const intelecto = Number(character.atributos?.intelecto) || 0;
  const agilidade = Number(character.atributos?.agilidade) || 0;
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
  const effortAttribute = hasSelectedPower(character, "racionalidade-inflexivel")
    ? intelecto
    : presenca;
  const personalityEffort = hasSelectedPower(character, "personalidade-esoterica") ? 3 : 0;
  const vitalityBonus = hasSelectedPower(character, "vitalidade-reforcada")
    ? (isSurvivorCharacter(character) ? 0 : Math.max(0, level))
    : 0;
  const willEffortBonus = hasSelectedPower(character, "vontade-inabalavel")
    ? (isSurvivorCharacter(character) ? 0 : Math.floor(Math.max(0, level) / 2))
    : 0;
  const transcenderLevels = Array.isArray(character.transcenderNiveis)
    ? [...new Set(character.transcenderNiveis.map(Number).filter((value) => Number.isInteger(value) && value >= 1 && value <= level))]
    : [];
  const transcenderSanPenalty = !usesDetermination && !usesSeparateLevel(character)
    ? transcenderLevels.length * (classData?.gain?.san ?? 0)
    : 0;

  if (!classData) {
    return {
      pvMax: 0,
      peMax: 0,
      sanMax: 0,
      defesa: 10 + agilidade,
      deslocamento: 9,
      advances,
      skillChoices: 0,
      fixedSkills: [],
      skillChoiceGroups: [],
      level,
      stage,
      usesDetermination: false,
      pdMax: 0,
      transcenderSanPenalty: 0,
    };
  }


  if (isSurvivorCharacter(character)) {
    const survivorDurability = character.trilha === "Durão"
      ? (stage >= 3 ? 6 : stage >= 2 ? 4 : 0)
      : 0;
    return {
      pvMax: classData.initial.pv + vigor + advances * classData.gain.pv + survivorDurability + vitalityBonus,
      peMax: classData.initial.pe + effortAttribute + advances * classData.gain.pe + personalityEffort + willEffortBonus,
      sanMax: classData.initial.san + advances * classData.gain.san,
      defesa: 10 + agilidade,
      deslocamento: 9,
      advances,
      skillChoices: classData.choiceSkills(Number(character.atributos?.intelecto) || 0),
      fixedSkills: classData.fixedSkills,
      skillChoiceGroups: classData.skillChoiceGroups,
      level: 0,
      stage,
      usesDetermination,
      transcenderSanPenalty: 0,
      pdMax: usesDetermination
        ? classData.determination.initial + effortAttribute + advances * classData.determination.gain
        : 0,
    };
  }

  return {
    pvMax: classData.initial.pv + vigor + advances * (classData.gain.pv + vigor) + vitalityBonus,
    peMax: classData.initial.pe + effortAttribute + advances * (classData.gain.pe + effortAttribute) + personalityEffort + willEffortBonus,
    sanMax: Math.max(0, classData.initial.san + advances * classData.gain.san - transcenderSanPenalty),
    defesa: 10 + agilidade,
    deslocamento: 9,
    advances,
    skillChoices: classData.choiceSkills(Number(character.atributos?.intelecto) || 0),
    fixedSkills: classData.fixedSkills,
    skillChoiceGroups: classData.skillChoiceGroups,
    level,
    stage,
    usesDetermination,
    transcenderSanPenalty,
    pdMax: usesDetermination
      ? classData.determination.initial + effortAttribute + advances * (classData.determination.gain + effortAttribute)
      : 0,
  };
}

function uniqueSkills(skills) {
  return [...new Set(skills.filter((skill) => SKILLS.includes(skill)))];
}

const POWER_SKILL_GRANTS = [
  ["-acrobatico", "Acrobacia"],
  ["-as-do-volante", "Pilotagem"],
  ["-atletico", "Atletismo"],
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
  return uniqueSkills(POWER_SKILL_GRANTS
    .filter(([suffix]) => selected.some((id) => id.endsWith(suffix)))
    .map(([, skill]) => skill));
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

  character.defesa = derived.defesa;
  character.deslocamento = derived.deslocamento;

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
