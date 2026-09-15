// Regression coverage for Arquivos Secretos #3-7 content ported into the native
// catalogs (rules.js/content.js/items.js), replacing the abandoned supplements/
// staging schema book by book. Extended as each book lands.
import assert from "node:assert/strict";
import {
  CLASS_POWERS,
  GENERAL_POWERS,
  PARANORMAL_POWERS,
  RITUALS,
  TRAIL_ABILITIES,
  ORIGIN_BACKGROUNDS,
  ORIGIN_POWER_DETAILS,
} from "../content.js";
import { CLASSES, ORIGINS } from "../rules.js";
import { ITEMS } from "../items.js";
import { ITEM_UPGRADES } from "../item-upgrades.js";
import { ritualVariantData } from "../ritual-variants.js";

function unique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} contém valores duplicados`);
}

function byName(entries, name) {
  const found = entries.find((entry) => entry.name === name);
  assert.ok(found, `${name} não encontrado`);
  return found;
}

// No duplicate ids across the whole ability/item catalog — new AS4 entries must
// not collide with anything already integrated from earlier books.
unique([...CLASS_POWERS, ...GENERAL_POWERS, ...PARANORMAL_POWERS, ...TRAIL_ABILITIES].map((a) => a.id), "IDs de poderes/trilhas");
unique(RITUALS.map((r) => r.id), "IDs de rituais");
unique(ITEMS.map((i) => i.id), "IDs de itens");
unique(ITEM_UPGRADES.map((u) => u.id), "IDs de upgrades");

// AS4 origins
for (const name of ["Caçador de Recompensas", "Influencer Paranormal"]) {
  const origin = byName(ORIGINS, name);
  assert.equal(origin.source, "Arquivos Secretos #4");
  assert.ok(ORIGIN_POWER_DETAILS[origin.power], `${origin.power} sem detalhe de poder de origem`);
  assert.ok(ORIGIN_BACKGROUNDS[name], `${name} sem texto de background`);
}

// AS4 trail: Granadeiro Blaster (Especialista only)
assert.ok(CLASSES.Especialista.trails.includes("Granadeiro Blaster"));
const blaster = TRAIL_ABILITIES.filter((a) => a.category === "Especialista" && a.group === "Granadeiro Blaster");
assert.equal(blaster.length, 4);
assert.deepEqual(blaster.map((a) => a.unlockNex).sort((x, y) => x - y), [10, 40, 65, 99]);

// AS4 powers: 3 per class category, 3 general, 3 paranormal (group Energia)
for (const [name, category] of [
  ["Chuva de Balas", "Combatente"], ["Combatente Esforçado", "Combatente"], ["Treinamento Militarizado", "Combatente"],
  ["Análise Conturbada", "Especialista"], ["Profissão Perigo", "Especialista"], ["Quase Novo", "Especialista"],
  ["Explorador da Névoa", "Ocultista"], ["Sinestesia Paranormal", "Ocultista"], ["Terrores Noturnos", "Ocultista"],
]) {
  const power = byName(CLASS_POWERS, name);
  assert.equal(power.category, category);
  assert.equal(power.source, "Arquivos Secretos #4");
}
for (const name of ["Gororoba", "Ruído Branco", "Uma Última Olhada"]) {
  assert.equal(byName(GENERAL_POWERS, name).source, "Arquivos Secretos #4");
}
for (const name of ["Foco Gravitacional", "Sobrepor Imprevisível", "Traço de Inconsistência"]) {
  const power = byName(PARANORMAL_POWERS, name);
  assert.equal(power.source, "Arquivos Secretos #4");
  assert.equal(power.group, "Energia");
}

// AS4 ritual: Backup (2nd circle, Energia), with mined variant data
const backup = byName(RITUALS, "Backup");
assert.equal(backup.circle, 2);
assert.equal(backup.element, "Energia");
assert.equal(backup.cost, "3 PE/PD");
const variants = ritualVariantData("Backup", "Arquivos Secretos #4");
assert.ok(variants, "Backup sem entrada em ritual-variants.js");
assert.deepEqual(variants.variants.map((v) => [v.name, v.extra, v.minCircle]), [
  ["Discente", 2, 2],
  ["Verdadeiro", 5, 3],
]);

// AS4 items and upgrades
for (const name of ["Granada de Gás Lacrimogêneo", "Granada de Tinta", "Granada Ctrl+C Ctrl+V", "Lançador de Granadas"]) {
  assert.equal(byName(ITEMS, name).source, "Arquivos Secretos #4");
}
for (const name of ["Adesiva", "Dupla", "Programada"]) {
  const upgrade = ITEM_UPGRADES.find((u) => u.name === name && u.target === "Explosivos");
  assert.ok(upgrade, `${name} não encontrada entre as modificações de Explosivos`);
  assert.equal(upgrade.source, "Arquivos Secretos #4");
}

console.log("AS4 catalog: 2 origins, 1 trail (4 abilities), 15 powers, 1 ritual, 4 items, 3 upgrades verified.");
