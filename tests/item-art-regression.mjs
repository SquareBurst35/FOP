import assert from "node:assert/strict";
import fs from "node:fs";
import { ITEMS } from "../items.js";
import { ITEM_ART, ORIGINAL_ITEM_ART, artForItem } from "../item-art.js";
import { EQUIPMENT_SLOTS, visualSlot, resolveEquipment, equipmentPlacements } from "../equipment-visuals.js";
import { BODY_POINTS, atlasRect, placementFor, anchorOnDoll } from "../paperdoll-renderer.js";

assert.equal(ITEM_ART.length, ITEMS.length, "Todos os itens do catálogo precisam de arte");
assert.equal(new Set(ITEM_ART.map(a=>a.id)).size, ITEMS.length);
assert.equal(new Set(ORIGINAL_ITEM_ART.map(a=>`${a.atlas}:${a.sourceRect.join(',')}`)).size, 165, "Cada item tem seu próprio sprite");
for (const item of ITEMS) {
  const art=artForItem(item);
  assert.ok(art, `Arte ausente: ${item.name}`);
  assert.ok(EQUIPMENT_SLOTS.some(s=>s.id===art.slot), `Posição inválida: ${item.name}`);
  assert.ok(fs.existsSync(new URL(`../${art.atlas}`,import.meta.url)),art.atlas);
  const rect=atlasRect(art);
  assert.ok(rect.width>0&&rect.height>0&&rect.x>=0&&rect.y>=0);
  assert.ok(rect.x+rect.width<=art.imageWidth&&rect.y+rect.height<=art.imageHeight, item.name);
  assert.ok(art.anchor.every(n=>Number.isFinite(n)&&n>=0&&n<=1), `Encaixe inválido: ${item.name}`);
  for(const slot of art.slot==='weapon'?['weapon','secondary']:[art.slot]) {
    const p=placementFor(art,slot);
    assert.ok(p.width>0&&p.height>0,item.name);
    if(art.attachment==='hand') {
      const grip=anchorOnDoll(p);
      assert.deepEqual([grip.x,grip.y],BODY_POINTS[slot==='secondary'?'leftHand':'hand'],item.name);
    }
  }
}
const owned = name => ({...ITEMS.find(i=>i.name===name),quantity:1});
assert.equal(visualSlot(owned('Pé de morto')),'feet');
assert.equal(visualSlot(owned('Fuzil Alheio')),'weapon');
assert.equal(visualSlot(owned('Manoplas do Colosso')),'arms');
assert.equal(visualSlot(owned('Crânio espiral')),'weapon');
assert.equal(visualSlot(owned('Óculos de visão térmica')),'eyes');
assert.equal(equipmentPlacements(resolveEquipment([owned('Carregador rápido')])).length,0,'Ajuste guardado não fica flutuando');
const armed=resolveEquipment([owned('Fuzil de assalto'),owned('Carregador rápido')]);
assert.ok(equipmentPlacements(armed).some(p=>p.slot==='adjustment'));
const gloves=equipmentPlacements(resolveEquipment([owned('Manoplas do Colosso')]));
assert.equal(gloves.length,2);
assert.notEqual(gloves[0].target[0],gloves[1].target[0],'Uma manopla em cada mão');
const suit=equipmentPlacements(resolveEquipment([owned('Traje espacial'),owned('Lanterna')]));
assert.ok(suit.some(p=>p.art.fullBody));
assert.notDeepEqual(suit.find(p=>p.slot==='weapon').target,BODY_POINTS.hand,'O traje tem seus próprios pontos de apoio');
const baton=owned('Bastão');
assert.equal(resolveEquipment([baton],{weapon:baton.id,secondary:baton.id}).secondary,null);
console.log(`${ITEMS.length} sprites verificados: cobertura, arquivos, recortes, mãos, roupas e modificações.`);
