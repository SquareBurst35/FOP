import { SUPPLEMENT_ABILITIES, SUPPLEMENT_ORIGINS, SUPPLEMENT_TRAILS, SUPPLEMENT_BY_ID } from './catalog.js';
import { finite } from './dice.js';
import { slug } from './schema.js';
export function progressionNex(character) {
  return character.optionalRules?.separateLevelNex ? Math.max(0, finite(character.nivel) * 5) : Math.max(0, finite(character.nex));
}
export function trailProgressNex(character, record) {
  return record?.mechanics?.exposureProgression ? Math.max(0, finite(character.nex)) : progressionNex(character);
}
export function skillRank(character, skill) {
  return Math.max(finite(character.grausPericia?.[skill]), character.periciasTreinadas?.includes(skill) ? 5 : 0);
}
export function supplementRecords(character) {
  const ids = new Set(character.habilidadesSelecionadas || []);
  const origin = SUPPLEMENT_ORIGINS.find(o => o.name === character.origem);
  if (origin) ids.add(origin.ability.id);
  for (const entry of SUPPLEMENT_TRAILS) if (entry.category === character.classe && entry.group === character.trilha && entry.unlockNex <= trailProgressNex(character, entry)) ids.add(entry.id);
  for (const choice of character.habilidadeEscolhas || []) {
    if (['poder', 'habilidade'].includes(choice.type) && ids.has(choice.ownerAbilityId || choice.abilityId)) ids.add(choice.valueId);
    if (choice.type === 'origem' && ids.has(choice.ownerAbilityId || choice.abilityId)) {
      const additional = SUPPLEMENT_ORIGINS.find(o => o.name === choice.valueId); if (additional) ids.add(additional.ability.id);
    }
  }
  for (const effect of character.supplementState?.effects || []) for (const id of effect.grantedAbilities || []) ids.add(id);
  return [...ids].map(id => SUPPLEMENT_BY_ID.get(id)).filter(e => e && SUPPLEMENT_ABILITIES.includes(e));
}
export function allOwnedAbilities(character, context = {}) {
  const entries = [...(context.automaticAbilities || []), ...supplementRecords(character)];
  const map = context.abilityById || new Map();
  for (const id of character.habilidadesSelecionadas || []) { const entry = map.get(id); if (entry) entries.push(entry); }
  const ids = new Set(entries.map(e => e.id));
  // Grants are followed only from an owned source, not from arbitrary saved choices.
  for (let pass = 0; pass < 4; pass++) {
    for (const choice of character.habilidadeEscolhas || []) {
      if (!['poder', 'habilidade'].includes(choice.type) || !ids.has(choice.ownerAbilityId || choice.abilityId) || ids.has(choice.valueId)) continue;
      const entry = map.get(choice.valueId) || SUPPLEMENT_BY_ID.get(choice.valueId);
      if (entry) { entries.push(entry); ids.add(entry.id); }
    }
    for (const entry of [...entries]) for (const name of entry.mechanics?.grants || []) {
      const granted = [...map.values()].find(e => e.name === name && (!['Combatente', 'Especialista', 'Ocultista'].includes(e.category) || e.category === character.classe));
      if (granted && !ids.has(granted.id)) { entries.push(granted); ids.add(granted.id); }
    }
  }
  return [...new Map(entries.map(e => [e.id, e])).values()];
}
export function chosenValues(character, entry, type) {
  return (character.habilidadeEscolhas || []).filter(c => c.abilityId === entry.id && c.type === type).map(c => c.valueId);
}
export function monstrousElement(character) {
  const first = SUPPLEMENT_TRAILS.find(e => e.group === 'Monstruoso' && e.category === character.classe && e.unlockNex === 10);
  return first ? chosenValues(character, first, 'elemento')[0] || '' : '';
}
export function acquisitionCount(character, entry) {
  const recorded = character.supplementState?.acquisitions?.[entry.id];
  return Math.max(supplementRecords(character).some(e => e.id === entry.id) ? 1 : 0, Array.isArray(recorded) ? recorded.length : 0);
}
export function hasSupplementAffinity(character, entry) {
  return Boolean(entry.mechanics?.element && character.afinidadeElemental === entry.mechanics.element && acquisitionCount(character, entry) >= 2);
}
export function prerequisiteResult(requirement, character, context = {}) {
  if (!requirement) return { ok: true, reasons: [] };
  const r = requirement, reasons = [];
  if (r.all) for (const child of r.all) reasons.push(...prerequisiteResult(child, character, context).reasons);
  if (r.any) {
    const results = r.any.map(child => prerequisiteResult(child, character, context));
    if (!results.some(result => result.ok)) reasons.push(results.map(result => result.reasons.join(' e ')).join(' ou '));
  }
  if (r.attribute && finite(character.atributos?.[r.attribute]) < r.minimum) reasons.push(`${r.attribute}: mínimo ${r.minimum}`);
  if (r.skill && skillRank(character, r.skill) < r.rank) reasons.push(`${r.skill}: grau +${r.rank}`);
  if (r.nex && progressionNex(character) < r.nex) reasons.push(`NEX de progressão ${r.nex}%`);
  if (r.exposureNex && finite(character.nex) < r.exposureNex) reasons.push(`Exposição NEX ${r.exposureNex}%`);
  const owned = allOwnedAbilities(character, context);
  if (r.ability && !owned.some(e => e.name === r.ability)) reasons.push(r.ability);
  if (r.elementPowers) {
    const count = owned.filter(e => (e.category === 'Poderes Paranormais' || e.category === 'Paranormais') && (e.mechanics?.element || e.group) === r.elementPowers && e.id !== context.excludedId).length;
    if (count < r.minimum) reasons.push(`${r.elementPowers} ${r.minimum}`);
  }
  if (r.profession) {
    const accepted = (character.habilidadeEscolhas || []).some(c => c.type === 'profissao' && slug(c.valueId) === slug(r.profession) && owned.some(e => e.id === (c.ownerAbilityId || c.abilityId)))
      || (character.supplementState?.professions || []).some(p => slug(p.name) === slug(r.profession) && (p.rank || skillRank(character, 'Profissão')) >= r.rank)
      || character.supplementState?.story?.['professionEquivalent:' + r.profession] === true;
    if (skillRank(character, 'Profissão') < r.rank || !accepted) reasons.push(`Profissão (${r.profession} ou equivalente) treinada`);
  }
  if (r.story && character.supplementState?.story?.[r.story] !== true) reasons.push('Requisito de história pendente de registro pelo mestre');
  return { ok: !reasons.length, reasons };
}
export function supplementEligibility(entry, character, context = {}) {
  if (!entry?.mechanics) return { ok: true, reasons: [] };
  const result = prerequisiteResult(entry.mechanics.prerequisites, character, { ...context, excludedId: entry.id });
  if (entry.unlockNex > trailProgressNex(character, entry)) result.reasons.push(`Requer NEX ${entry.unlockNex}%.`);
  if (entry.mechanics.monstrousVariant && character.afinidadeElemental && monstrousElement(character) && character.afinidadeElemental !== monstrousElement(character)) result.reasons.push('A afinidade deve corresponder ao elemento de Monstruoso.');
  return { ok: !result.reasons.length, reasons: [...new Set(result.reasons)] };
}
