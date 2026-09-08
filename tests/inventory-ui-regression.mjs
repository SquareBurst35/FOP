import assert from "node:assert/strict";
import { candidatesFor, resolveEquipment, equipmentIcon } from "../equipment-visuals.js";

const knife = { id: "knife", name: "Faca", group: "Armas", quantity: 1 };
const pistol = { id: "pistol", name: "Pistola", group: "Armas", quantity: 1 };
const armor = { id: "armor", name: "Proteção leve", group: "Proteções", quantity: 1 };
const backpack = { id: "backpack", name: "Mochila", group: "Operacionais", quantity: 1 };
const goggles = { id: "goggles", name: "Óculos", group: "Acessórios", quantity: 1 };
const flashlight = { id: "flashlight", name: "Lanterna", group: "Operacionais", quantity: 1 };
const ammo = { id: "ammo", name: "Balas curtas", group: "Munições", quantity: 1 };
const charm = { id: "charm", name: "Amuleto", group: "Paranormais", quantity: 1 };
const entries = [knife, pistol, armor, backpack, goggles, flashlight, ammo, charm];
const snapshot = JSON.stringify(entries);

assert.ok(Object.values(resolveEquipment([])).every((item) => item === null));
const singleWeapon = resolveEquipment([knife]);
assert.equal(singleWeapon.weapon.id, "knife");
assert.equal(singleWeapon.secondary, null, "Uma única cópia não pode ocupar duas posições");
assert.equal(singleWeapon.back, null, "Arma não deve acrescentar mochila ao boneco");
assert.equal(singleWeapon.armor, null, "Arma não deve acrescentar proteção ao boneco");
assert.equal(equipmentIcon(knife), "blade");
assert.equal(equipmentIcon(pistol), "pistol");
assert.equal(equipmentIcon({ name: "Fuzil de caça", group: "Armas" }), "rifle");

const equipped = resolveEquipment(entries);
assert.deepEqual(Object.fromEntries(Object.entries(equipped).map(([slot, entry]) => [slot, entry?.id])), {
  head: "goggles", armor: "armor", weapon: "knife", utility: "flashlight", back: "backpack",
  secondary: "pistol", ammo: "ammo", paranormal: "charm",
});
assert.deepEqual(candidatesFor("utility", entries).map((entry) => entry.id), ["flashlight"]);
assert.deepEqual(candidatesFor("back", entries).map((entry) => entry.id), ["backpack"]);
assert.equal(resolveEquipment(entries, { back: "" }).back, null, "Vazio escolhido deve continuar vazio");
assert.equal(resolveEquipment(entries, { weapon: "pistol" }).weapon.id, "pistol");
assert.equal(resolveEquipment(entries, { weapon: "removed-item" }).weapon, null, "Item removido não permanece equipado");
assert.equal(resolveEquipment(entries, { weapon: "backpack" }).weapon, null, "Preferência inválida não atravessa categorias");
assert.equal(resolveEquipment([{ ...pistol, quantity: 2 }]).secondary.id, "pistol");
assert.equal(resolveEquipment([pistol], { weapon: "pistol", secondary: "pistol" }).secondary, null);
assert.equal(JSON.stringify(entries), snapshot, "Escolhas visuais não alteram os itens da ficha");
console.log("Equipamentos visuais: categorias, escolhas, remoção e quantidades passaram.");
