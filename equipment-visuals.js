import { artForItem } from "./item-art.js?v=20";
import { placementFor, BODY_POINTS } from "./paperdoll-renderer.js?v=20";

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
  if (art) return art.slot;
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
    let attachment = art.attachment === "hand" && slot === "secondary" ? "leftHand" : art.attachment;
    if (attachment === "belt" && slot === "paranormal") attachment = "relic";
    return placementFor(art, slot, { target: points[attachment] });
  }
  return Object.entries(equipped).flatMap(([slot, entry]) => {
    const art = artForItem(entry);
    if (!art) return [];
    // Vehicle components stay in their inventory position, not on the agent's body.
    if (slot === "vehicle") return [];
    if (slot === "adjustment") {
      const accepted = art.modification === "loader"
        ? /pistola|revólver|fuzil|espingarda|metralhadora|besta|balestra|sniper/i
        : /lanterna|taser|óculos|celular|rádio|notebook|câmera/i;
      const owner = Object.entries(equipped).find(([key, value]) => key !== slot && value && accepted.test(value.name));
      if (!owner) return [];
      const parentArt = artForItem(owner[1]);
      if (!parentArt) return [];
      const parent = place(parentArt, owner[0]);
      const theta = parent.angle * Math.PI / 180;
      const offset = parent.width * 0.1;
      const target = [parent.target[0] + Math.cos(theta) * offset, parent.target[1] + Math.sin(theta) * offset];
      return [placementFor({ ...art, widthOnDoll: art.modification === "loader" ? 24 : 19, angle: parent.angle, z: parent.z + 1 }, slot, { target })];
    }
    let renderedArt = art;
    if (art.parts?.length) return art.parts.map(part => {
      const right = part.side === "screenRight";
      return placementFor({ ...art, ...part, parts: undefined, bounds: [0,0,1,1], anchor: [.5,.8], angle: 180, z: 110 }, slot,
        { target: [points[right ? "hand" : "leftHand"][0], points[right ? "hand" : "leftHand"][1] - 30] });
    });
    // A paired gauntlet is drawn after the fingers; its solid palms still grip the object.
    if (slot === "arms") renderedArt = { ...art, z: 110 };
    return [place(renderedArt, slot)];
  });
}

export function candidatesFor(slotId, entries) {
  return entries.filter((entry) => visualSlot(entry) === (slotId === "secondary" ? "weapon" : slotId));
}

export function resolveEquipment(entries, preferences = {}) {
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
