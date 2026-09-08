// Presentation preferences only. No character resources or rule calculations change here.
export const EQUIPMENT_SLOTS = [
  { id: "head", label: "Cabeça", mark: "◇" },
  { id: "armor", label: "Proteção", mark: "◫" },
  { id: "weapon", label: "Arma principal", mark: "⌖" },
  { id: "utility", label: "Cinto e utilitários", mark: "+" },
  { id: "back", label: "Mochila", mark: "◇" },
  { id: "secondary", label: "Arma secundária", mark: "⌖" },
  { id: "ammo", label: "Munição e ajustes", mark: "▥" },
  { id: "paranormal", label: "Paranormal", mark: "◉" },
];

function plain(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function visualSlot(entry) {
  const name = plain(entry.name);
  if (/capacete|elmo|oculos|mascara|viseira|chapeu|\bbone\b/.test(name)) return "head";
  if (/mochila/.test(name)) return "back";
  if (entry.group === "Armas") return "weapon";
  if (entry.group === "Proteções") return "armor";
  if (["Munições", "Modificações"].includes(entry.group)) return "ammo";
  if (entry.group === "Paranormais") return "paranormal";
  return "utility";
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
