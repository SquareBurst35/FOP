import { CORE_CLASS_ABILITIES, TRAIL_ABILITIES, RITUALS, allSelectableAbilities } from "./content.js?v=58";

const abilities = [...CORE_CLASS_ABILITIES, ...allSelectableAbilities()];
const byId = new Map(abilities.map((entry) => [entry.id, entry]));
const slug = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
export function abilityProgressNex(character) {
  return character?.optionalRules?.separateLevelNex
    ? Math.min(20, Math.max(1, Number(character.nivel) || 1)) * 5
    : Math.min(100, Math.max(0, Number(character?.nex) || 0));
}
export function automaticTrailAbilities(character) {
  return TRAIL_ABILITIES.filter((entry) => entry.category === character?.classe && entry.group === character?.trilha &&
    (entry.unlockStage ? entry.unlockStage <= Math.max(1, Number(character.sobreviventeEstagio) || 1) : entry.unlockNex <= abilityProgressNex(character)));
}
export function trailRequiredSkill(entry) {
  return { "Médico de Campo": "Medicina", "Parapsicólogo": "Profissão" }[entry?.group] || "";
}
export function canReceiveTrailAbility(character, entry) {
  const skill = trailRequiredSkill(entry);
  return !skill || Number(character?.grausPericia?.[skill]) >= 5 || (character?.periciasTreinadas ?? []).includes(skill);
}
const grantedNames = { "Método Intuitivo": ["Criar Selo"], "Fogo Amigo": ["Perito em Explosivos"] };
const choiceGrants = new Set(["Ele Me Ensina", "Especialista Diletante", "Dominar Habilidade Ritualística", "Transcender", "Expansão de Conhecimento", "Traços do Outro Lado"]);
export function ownedAbilities(character) {
  const owned = new Map([
    ...CORE_CLASS_ABILITIES.filter((entry) => entry.category === character?.classe && (entry.unlockStage ? entry.unlockStage <= Math.max(1, Number(character.sobreviventeEstagio) || 1) : entry.unlockNex <= abilityProgressNex(character))),
    ...automaticTrailAbilities(character),
    ...(character?.habilidadesSelecionadas ?? []).map((id) => byId.get(id)).filter(Boolean),
  ].map((entry) => [entry.id, entry]));
  for (let pass = 0; pass < 6; pass++) {
    const previous = owned.size;
    for (const entry of [...owned.values()]) {
      for (const name of grantedNames[entry.name] ?? []) {
        const granted = abilities.find((candidate) => candidate.name === name && (!['Combatente', 'Especialista', 'Ocultista'].includes(candidate.category) || candidate.category === character.classe));
        if (granted) owned.set(granted.id, granted);
      }
      if (!choiceGrants.has(entry.name)) continue;
      for (const choice of character.habilidadeEscolhas ?? []) {
        if (choice.abilityId !== entry.id || !["habilidade", "poder"].includes(choice.type)) continue;
        const granted = byId.get(choice.valueId);
        if (granted) owned.set(granted.id, granted);
      }
    }
    if (previous === owned.size) break;
  }
  return [...owned.values()];
}
export function ownsAbility(character, powerSlug) {
  return ownedAbilities(character).some((entry) => slug(entry.name) === powerSlug) ||
    (character?.habilidadesSelecionadas ?? []).some((id) => String(id).endsWith(`-${powerSlug}`));
}
export function chosenMonstrousElement(character) {
  const first = ownedAbilities(character).find((entry) => entry.group === "Monstruoso" && entry.unlockNex === 10);
  return first && (character.habilidadeEscolhas ?? []).find((choice) => choice.abilityId === first.id && choice.type === "elemento")?.valueId || "";
}
export function monstrousRitualActive(character) {
  return ownsAbility(character, "ser-aterrorizante") || (character?.efeitosAtivos ?? []).some((effect) => effect.name === "Etapa de Monstruoso");
}
export function effectiveAttributes(character) {
  const result = Object.fromEntries(["agilidade", "forca", "intelecto", "presenca", "vigor"].map((key) => [key, Number(character?.atributos?.[key]) || 0]));
  if (ownsAbility(character, "a-forca-do-saber")) result.intelecto += 1;
  for (const name of ["ser-assustador", "ser-expurgado", "ser-rasgado", "ser-apavorante", "ser-mutilado"]) {
    if (ownsAbility(character, name)) result.presenca -= 1;
  }
  const element = chosenMonstrousElement(character);
  if (ownsAbility(character, "ser-aterrorizante")) {
    const changes = { Sangue: { intelecto: -1, forca: 1 }, Morte: { presenca: -1, vigor: 1 }, Conhecimento: { forca: -1, intelecto: 1 }, Energia: { forca: -1, agilidade: 1 } };
    for (const [key, value] of Object.entries(changes[element] ?? {})) result[key] += value;
  }
  if (monstrousRitualActive(character)) {
    if (element === "Conhecimento" && ownsAbility(character, "ser-macabro")) result.intelecto += 1;
    if (ownsAbility(character, "ser-apavorante") || ownsAbility(character, "ser-mutilado")) {
      const key = { Sangue: "forca", Morte: "vigor", Conhecimento: "intelecto", Energia: "agilidade" }[element];
      if (key) result[key] += 1;
    }
  }
  for (const key of Object.keys(result)) result[key] = Math.max(0, result[key]);
  return result;
}

export function automaticTrailRituals(character) {
  const named = { "Canalizar o Medo": "Canalizar o Medo", "Medo Tangível": "Medo Tangível", "Conhecendo o Medo": "Conhecendo o Medo", "Presença do Medo": "Presença do Medo", "Lâmina do Medo": "Lâmina do Medo" };
  const names = ownedAbilities(character).map((entry) => named[entry.name]).filter(Boolean);
  if (ownsAbility(character, "ser-aterrorizante")) {
    const ritual = { Sangue: "Forma Monstruosa", Morte: "Fim Inevitável", Energia: "Deflagração de Energia" }[chosenMonstrousElement(character)];
    if (ritual) names.push(ritual);
  }
  return RITUALS.filter((ritual) => names.includes(ritual.name));
}
