import { EQUIPMENT_SLOTS, candidatesFor, resolveEquipment, equipmentPlacements } from "./equipment-visuals.js?v=21";
import { artForItem } from "./item-art.js?v=20";
import { createPaperdoll, drawItemIcon } from "./paperdoll-renderer.js?v=21";

const memoryPreferences = new Map();

function preferenceKey() {
  const [page, id] = window.location.hash.slice(1).split("/");
  return page === "ficha" && id ? `fop_visual_equipment_v1:${id}` : "";
}

function readPreferences(key) {
  if (memoryPreferences.has(key)) return memoryPreferences.get(key);
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

function savePreferences(key, preferences) {
  memoryPreferences.set(key, preferences);
  try { localStorage.setItem(key, JSON.stringify(preferences)); } catch { /* Session remains usable. */ }
}

const REPAINTING_CONTROLS = [
  "[data-ability-toggle]",
  "[data-ritual-toggle]",
  "[data-item-add]",
  "[data-item-group]",
  "[data-ability-category]",
  "[data-ability-group]",
  "[data-ritual-circle]",
  "[data-ritual-element]",
  "[data-item-quantity]",
  "[data-item-remove]",
  "[data-resource-action]",
  "[data-session-action]",
  "[data-rule-key]",
  "[data-level-up-structured-choice]",
  "[data-level-up-choice]",
].join(",");

let tabAnimationPending = false;
let dialogResume = null;
let suppressTimer = 0;

function dialogScroller(dialog) {
  if (!dialog) return null;
  if (dialog.matches(".catalog-picker-dialog")) return dialog;
  return dialog.querySelector(".level-up-body, .picker-body, .choice-dialog-body") ?? dialog;
}

function suppressReplayedAnimations() {
  document.documentElement.classList.add("suppress-ui-replay");
  window.clearTimeout(suppressTimer);
  suppressTimer = window.setTimeout(() => {
    document.documentElement.classList.remove("suppress-ui-replay");
  }, 280);
}

function rememberDialog(target) {
  const dialog = target.closest("dialog[open]");
  if (!dialog?.id) return;
  dialogResume = { id: dialog.id, scrollTop: dialogScroller(dialog)?.scrollTop ?? 0 };
}

function handleInteraction(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  if (event.type === "click" && target.closest("[data-sheet-tab]")) {
    tabAnimationPending = true;
    return;
  }
  if (event.type === "change" || target.closest(REPAINTING_CONTROLS)) {
    rememberDialog(target);
    suppressReplayedAnimations();
  }
}

function restoreInteractionState() {
  if (tabAnimationPending) {
    const content = document.querySelector(".sheet-tab-content");
    if (content) {
      content.classList.add("tab-enter");
      tabAnimationPending = false;
    }
  }
  if (!dialogResume) return;
  const dialog = document.getElementById(dialogResume.id);
  if (dialog?.open) {
    dialog.classList.add("restored-open");
    const scroller = dialogScroller(dialog);
    if (scroller) scroller.scrollTop = dialogResume.scrollTop;
  }
  dialogResume = null;
}

function readInventoryCard(card) {
  const name = card.querySelector("summary strong")?.textContent?.trim() || "Item";
  const context = card.querySelector("summary small")?.textContent?.trim() || "Equipamento";
  const group = context.split("·")[0]?.trim() || "Equipamento";
  const id = card.querySelector("[data-item-remove]")?.dataset.itemRemove;
  const quantity = Math.max(1, Number(card.querySelector(".quantity-stepper output")?.textContent) || 1);
  return { card, id, name, group, quantity };
}

function makeText(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function revealInventoryCard(card) {
  card.open = true;
  card.classList.remove("selection-revealed");
  void card.offsetWidth;
  card.classList.add("selection-revealed");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
}

function makeEquipmentSlot(definition, entries, controls, changeSelection) {
  const element = document.createElement("div");
  element.className = `paperdoll-slot slot-${definition.id}`;
  const mark = makeText("span", "paperdoll-slot-mark", definition.mark);
  mark.setAttribute("aria-hidden", "true");
  const label = makeText("label", "", definition.label);
  const select = document.createElement("select");
  select.id = `paperdoll-select-${definition.id}`;
  label.htmlFor = select.id;
  select.append(makeText("option", "", "Vazio"));
  select.options[0].value = "";
  for (const entry of candidatesFor(definition.id, entries)) {
    const option = makeText("option", "", entry.name);
    option.value = entry.id;
    select.append(option);
  }
  select.disabled = select.options.length === 1;
  select.addEventListener("change", () => changeSelection(definition.id, select.value));
  const details = makeText("button", "paperdoll-details", "Ver item");
  details.type = "button";
  details.addEventListener("click", () => {
    const selected = entries.find((entry) => entry.id === select.value);
    if (selected) revealInventoryCard(selected.card);
  });
  controls.set(definition.id, { element, select, details, mark, definition });
  element.append(mark, label, select, details);
  return element;
}

function setItemIcon(element, art) {
  element.replaceChildren();
  if (!art) return;
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  element.append(canvas);
  drawItemIcon(canvas, art);
}

function enhanceItemIcons() {
  for (const card of document.querySelectorAll(".item-card:not([data-pixel-art])")) {
    card.dataset.pixelArt = "true";
    const title = card.querySelector("summary strong");
    const art = artForItem({ name: title?.textContent?.trim() });
    if (!art || !title?.parentElement) continue;
    const icon = document.createElement("span");
    icon.className = "item-art-icon inventory-art-icon";
    icon.setAttribute("aria-hidden", "true");
    setItemIcon(icon, art);
    title.parentElement.classList.add("inventory-art-title");
    title.parentElement.prepend(icon);
  }
}

function enhanceInventory() {
  const section = document.querySelector(".inventory-section");
  if (!section || section.querySelector(".paperdoll-panel")) return;
  const list = section.querySelector(".inventory-list");
  const overview = section.querySelector(".inventory-overview");
  if (!list || !overview) return;

  const key = preferenceKey();
  if (!key) return;
  const entries = [...list.querySelectorAll(":scope > .item-card")].map(readInventoryCard).filter((entry) => entry.id);
  const preferences = { ...readPreferences(key) };
  const controls = new Map();
  const panel = document.createElement("section");
  panel.className = "paperdoll-panel";
  panel.setAttribute("aria-labelledby", "paperdoll-title");

  const heading = document.createElement("header");
  const titleWrap = document.createElement("div");
  titleWrap.append(makeText("span", "paperdoll-kicker", "Visual do agente"));
  const title = makeText("h3", "", "Equipamento no personagem");
  title.id = "paperdoll-title";
  titleWrap.append(title);
  const status = makeText("span", "paperdoll-state", "");
  status.setAttribute("role", "status");
  heading.append(titleWrap, status);

  const layout = document.createElement("div");
  layout.className = "paperdoll-layout";
  const sprite = document.createElement("div");
  sprite.className = "paperdoll-sprite";
  sprite.setAttribute("role", "img");
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  sprite.append(canvas);
  const drawDoll = createPaperdoll(canvas);

  function updateEquipment(changedSlot) {
    const equipped = resolveEquipment(entries, preferences);
    const placements = equipmentPlacements(equipped);
    drawDoll(placements, { backpack: /mochila/i.test(equipped.back?.name ?? "") });
    for (const [slot, control] of controls) {
      const entry = equipped[slot];
      control.element.classList.toggle("has-item", Boolean(entry));
      control.select.value = entry?.id ?? "";
      control.select.title = entry?.name ?? "Vazio";
      control.details.hidden = !entry;
      control.details.setAttribute("aria-label", entry ? `Ver detalhes de ${entry.name}` : "Ver item");
      const art = artForItem(entry);
      control.mark.className = `paperdoll-slot-mark${art ? " item-art-icon" : ""}`;
      if (control.mark.dataset.item !== (entry?.id ?? "")) {
        control.mark.dataset.item = entry?.id ?? "";
        setItemIcon(control.mark, art);
        if (!art) control.mark.textContent = control.definition.mark;
      }
      for (const option of control.select.options) {
        const candidate = entries.find((item) => item.id === option.value);
        const usedElsewhere = Object.entries(equipped).filter(([other, item]) => other !== slot && item?.id === option.value).length;
        option.disabled = Boolean(candidate && usedElsewhere >= candidate.quantity);
      }
    }
    const visibleIds = new Set(placements.map(p => p.art.id));
    const selected = Object.values(equipped).filter(Boolean);
    const worn = selected.filter(entry => visibleIds.has(artForItem(entry)?.id) || (entry === equipped.back && /mochila/i.test(entry.name)));
    const stored = selected.length - worn.length;
    const label = worn.length ? `${worn.length} equipamento${worn.length === 1 ? "" : "s"} no visual` : "Sem equipamento";
    const statusLabel = stored ? `${label} · ${stored} guardado${stored === 1 ? "" : "s"}` : label;
    if (status.textContent !== statusLabel) status.textContent = statusLabel;
    sprite.setAttribute("aria-label", worn.length ? `Agente em pixel art com ${worn.map((entry) => entry.name).join(", ")}` : "Agente em pixel art sem equipamento");
    if (changedSlot) {
      sprite.classList.remove("equipment-changed");
      void sprite.offsetWidth;
      sprite.classList.add("equipment-changed");
    }
  }

  function changeSelection(slot, id) {
    preferences[slot] = id;
    savePreferences(key, preferences);
    updateEquipment(slot);
  }

  const visibleSlots = EQUIPMENT_SLOTS.filter(slot => !slot.optional || candidatesFor(slot.id, entries).length);
  layout.append(sprite, ...visibleSlots.map((slot, index) => {
    const control = makeEquipmentSlot(slot, entries, controls, changeSelection);
    if (slot.optional) {
      control.classList.add("slot-extra");
      control.style.setProperty("--slot-column", index % 2 === 0 ? "1" : "3");
      control.style.setProperty("--slot-row", String(5 + Math.floor((index - 8) / 2)));
    }
    return control;
  }));
  updateEquipment();

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "paperdoll-add";
  addButton.textContent = "+ Adicionar item ao inventário";
  addButton.addEventListener("click", () => section.querySelector("#open-item-picker")?.click());

  panel.append(heading, layout, addButton);
  overview.after(panel);
}

function refreshInterface() {
  restoreInteractionState();
  enhanceInventory();
  enhanceItemIcons();
}

document.addEventListener("click", handleInteraction, true);
document.addEventListener("change", handleInteraction, true);
new MutationObserver(refreshInterface).observe(document.querySelector("#app"), {
  childList: true,
  subtree: true,
});
refreshInterface();
