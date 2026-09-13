import { compositionFor, fittedArt } from './equipment-composition.js?v=24';
import { artForItem } from "./item-art.js?v=24";
import { placementFor, BODY_POINTS } from "./paperdoll-renderer.js?v=24";

// Presentation preferences only. No character resources or rule calculations change here.
export const EQUIPMENT_SLOTS = [
  { id: "head", label: "Cabeça", mark: "◇" },
  { id: "armor", label: "Proteção", mark: "◫" },
  { id: "weapon", label: "Mão direita", mark: "⌖" },
  { id: "utility", label: "Cinto e utilitários", mark: "+" },
  { id: "back", label: "Costas", mark: "◇" },
  { id: "secondary", label: "Mão esquerda", mark: "⌖" },
  { id: "ammo", label: "Munição e ajustes", mark: "▥" },
  { id: "paranormal", label: "Paranormal", mark: "◉" },
  { id: "eyes", label: "Óculos", mark: "◇", optional: true },
  { id: "face", label: "Rosto", mark: "◇", optional: true },
  { id: "sling", label: "Bandoleira", mark: "◇", optional: true },
  { id: "harness", label: "Arnês", mark: "◇", optional: true },
  { id: "neck", label: "Pescoço", mark: "◇", optional: true },
  { id: "arms", label: "Braços e mãos", mark: "◇", optional: true },
  { id: "feet", label: "Pés", mark: "◇", optional: true },
  { id: "outfit", label: "Traje", mark: "◇", optional: true },
  { id: "companion", label: "Companheiro", mark: "◇", optional: true },
  { id: "vehicle", label: "Equipamento do veículo", mark: "◇", optional: true },
  { id: "adjustment", label: "Ajuste do equipamento", mark: "+", optional: true },
];

function plain(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function visualSlot(entry) {
  const art = artForItem(entry);
  if (art) return compositionFor(art)?.slot ?? art.slot;
  const name = plain(entry.name);
  if (/capacete|elmo|oculos|mascara|viseira|chapeu|\bbone\b/.test(name)) return "head";
  if (/mochila/.test(name)) return "back";
  if (entry.group === "Armas") return "weapon";
  if (entry.group === "Proteções") return "armor";
  if (["Munições", "Modificações"].includes(entry.group)) return "ammo";
  if (entry.group === "Paranormais") return "paranormal";
  return "utility";
}

export function equipmentPlacements(equipped) {
  const outfit = artForItem(equipped.outfit);
  const points = { ...BODY_POINTS };
  if (outfit?.fullBody) {
    const p = placementFor(outfit, "outfit");
    for (const [key, value] of Object.entries(outfit.bodyAnchors)) {
      points[key] = [p.target[0] + (value[0] - p.anchor[0]) * p.width, p.target[1] + (value[1] - p.anchor[1]) * p.height];
    }
  }
  function place(art, slot) {
    const rendered = fittedArt(art, slot);
    let attachment = rendered.attachment === "hand" && slot === "secondary" ? "leftHand" : rendered.attachment;
    if (attachment === "belt" && slot === "paranormal") attachment = "relic";
    let target = points[attachment];
    if (['belt','pocket'].includes(rendered.composition)) {
      target = slot === 'ammo' ? [145,353] : slot === 'paranormal' ? [250,351] : [172,351];
      if (outfit?.fullBody) target = points[attachment];
    }
    // Explicit fit corrections are in base-body space, not in a replacement suit's space.
    if (outfit?.fullBody && rendered.target && !['companion','backpack','cape'].includes(rendered.composition)) delete rendered.target;
    return placementFor(rendered, slot, { target });
  }
  const result = Object.entries(equipped).flatMap(([slot, entry]) => {
    const art = artForItem(entry), recipe=compositionFor(art);
    if (!art || !recipe || recipe.visibility==='inventory' || recipe.kind==='adjustment') return [];
    if (art.parts?.length) return art.parts.map(part => {
      const right = part.side === "screenRight", hand=points[right ? 'hand' : 'leftHand'];
      return placementFor({ ...fittedArt(art,slot), ...part, parts: undefined,
        bounds: [0,0,1,1], anchor: [.5,.40], angle: 180, z: 65 }, slot,
        { target: hand });
    });
    return [place(art,slot)];
  });
  for (const [slot,entry] of Object.entries(equipped)) {
    const art=artForItem(entry);
    if(compositionFor(art)?.kind!=='adjustment')continue;
    const accepted=art.modification==='loader'
      ? /pistola|revólver|fuzil|espingarda|metralhadora|besta|balestra|sniper/i
      : /lanterna|taser|óculos|celular|rádio|notebook|câmera/i;
    const parent=result.find(p=>accepted.test(p.art.name));
    if(!parent)continue;
    const theta=parent.angle*Math.PI/180;
    const local=art.modification==='loader'?[.1,.06]:[.06,.10];
    const dx=parent.width*local[0]*parent.scaleX,dy=parent.height*local[1];
    const target=[parent.target[0]+dx*Math.cos(theta)-dy*Math.sin(theta),parent.target[1]+dx*Math.sin(theta)+dy*Math.cos(theta)];
    result.push(placementFor({...fittedArt(art,slot),widthOnDoll:art.modification==='loader'?19:12,angle:parent.angle,flip:parent.scaleX<0,z:parent.z+1},slot,{target}));
  }
  return result;
}

export function candidatesFor(slotId, entries) {
  return entries.filter((entry) => visualSlot(entry) === (slotId === "secondary" ? "weapon" : slotId));
}

export function resolveEquipment(entries, preferences = {}) {
  preferences = { ...preferences };
  for (const oldSlot of ['head','outfit','weapon']) {
    const selected=entries.find(e=>e.id===preferences[oldSlot]);
    const currentSlot=selected&&visualSlot(selected);
    if(currentSlot && artForItem(selected)?.slot===oldSlot && currentSlot!==oldSlot && !Object.hasOwn(preferences,currentSlot)) {
      preferences[currentSlot]=selected.id; delete preferences[oldSlot];
    }
  }
  const equipped = {};
  const used = new Map();
  for (const slot of EQUIPMENT_SLOTS) {
    const available = candidatesFor(slot.id, entries).filter((entry) =>
      (used.get(entry.id) ?? 0) < Math.max(1, Number(entry.quantity) || 1),
    );
    const hasPreference = Object.hasOwn(preferences, slot.id);
    const selected = hasPreference
      ? available.find((entry) => entry.id === preferences[slot.id])
      : available[0];
    equipped[slot.id] = selected ?? null;
    if (selected) used.set(selected.id, (used.get(selected.id) ?? 0) + 1);
  }
  return equipped;
}

export function equipmentIcon(entry) {
  if (!entry) return "";
  const slot = visualSlot(entry);
  if (slot === "ammo") return "ammo";
  if (slot === "paranormal") return "charm";
  if (slot !== "weapon") return "pouch";
  const name = plain(entry.name);
  if (/pistola|revolver|pregador/.test(name)) return "pistol";
  if (/arco|besta|balestra|estilingue/.test(name)) return "bow";
  if (/fuzil|espingarda|metralhadora|bazuca|lanca.chamas/.test(name)) return "rifle";
  if (/machad|martelo|marreta|picareta|\bacha\b/.test(name)) return "axe";
  if (/cajado|bastao|lanca|nunchaku|corrente|gadanho/.test(name)) return "staff";
  return "blade";
}
