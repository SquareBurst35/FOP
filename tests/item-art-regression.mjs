import assert from "node:assert/strict";
import fs from "node:fs";
import { ITEMS } from "../items.js";
import { ITEM_ART, ORIGINAL_ITEM_ART, artForItem } from "../item-art.js";
import { atlasRect } from "../item-icons.js";

assert.equal(ITEM_ART.length, ITEMS.length, "Todos os itens do catálogo precisam de arte");
assert.equal(new Set(ITEM_ART.map(a=>a.id)).size, ITEMS.length);
assert.equal(new Set(ORIGINAL_ITEM_ART.map(a=>`${a.atlas}:${a.sourceRect.join(',')}`)).size, 165, "Cada item tem seu próprio sprite");
for (const item of ITEMS) {
  const art=artForItem(item);
  assert.ok(art, `Arte ausente: ${item.name}`);
  assert.ok(fs.existsSync(new URL(`../${art.atlas}`,import.meta.url)),art.atlas);
  const rect=atlasRect(art);
  assert.ok(rect.width>0&&rect.height>0&&rect.x>=0&&rect.y>=0);
  assert.ok(rect.x+rect.width<=art.imageWidth&&rect.y+rect.height<=art.imageHeight, item.name);
}
assert.equal(artForItem({ name: "Pistola pesada" })?.name, "Pistola pesada", "Ícone encontrado pelo nome exibido na lista");
console.log(`${ITEMS.length} ícones verificados: cobertura, arquivos e recortes.`);
