import { EQUIPMENT_SLOTS, candidatesFor, resolveEquipment, equipmentPlacements } from "./equipment-visuals.js?v=55";
import { artForItem } from "./item-art.js?v=55";
import { createPaperdoll, drawItemIcon, paperdollVisibleStates } from "./paperdoll-renderer.js?v=55";

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
  // A animação de chegada do conteúdo é decidida em app.js pela chave de view;
  // aqui só cuidamos dos diálogos, que re-renderizam a cada clique interno.
  if (event.type === "change" || target.closest(REPAINTING_CONTROLS)) {
    rememberDialog(target);
    suppressReplayedAnimations();
  }
}

function restoreInteractionState() {
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

// A native <select>'s open option list is styled by the OS, not by us (it shows up
// blue with a plain scrollbar on Windows/Chrome no matter what CSS we write here), so
// the paperdoll slots use this button+listbox combobox instead to stay on-theme.
function createStyledSelect(id) {
  const root = document.createElement("div");
  root.className = "styled-select";
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.id = id;
  trigger.className = "styled-select-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  const valueLabel = document.createElement("span");
  trigger.append(valueLabel);
  const list = document.createElement("ul");
  list.id = `${id}-list`;
  list.className = "styled-select-list";
  list.setAttribute("role", "listbox");
  list.hidden = true;
  trigger.setAttribute("aria-controls", list.id);
  root.append(trigger, list);

  const state = { options: [{ value: "", label: "Vazio", disabled: false }], value: "", disabled: false, activeIndex: -1 };
  const changeListeners = [];
  const optionEls = () => [...list.children];

  function renderTrigger() {
    const current = state.options.find((option) => option.value === state.value);
    valueLabel.textContent = current ? current.label : "Vazio";
    trigger.title = current ? current.label : "Vazio";
    trigger.disabled = state.disabled;
  }

  function renderOptions() {
    list.replaceChildren(...state.options.map((option, index) => {
      const item = document.createElement("li");
      item.id = `${id}-option-${index}`;
      item.className = "styled-select-option";
      item.setAttribute("role", "option");
      item.textContent = option.label;
      item.setAttribute("aria-selected", String(option.value === state.value));
      if (option.disabled) item.setAttribute("aria-disabled", "true");
      item.addEventListener("click", () => {
        if (option.disabled) return;
        setValue(option.value, true);
        close();
        trigger.focus();
      });
      return item;
    }));
  }

  function setValue(value, fire) {
    state.value = value;
    renderTrigger();
    renderOptions();
    if (fire) for (const listener of changeListeners) listener();
  }

  function setActive(index) {
    for (const el of optionEls()) el.classList.remove("is-active");
    state.activeIndex = index;
    const el = optionEls()[index];
    if (el) {
      el.classList.add("is-active");
      el.scrollIntoView({ block: "nearest" });
      trigger.setAttribute("aria-activedescendant", el.id);
    } else {
      trigger.removeAttribute("aria-activedescendant");
    }
  }

  function moveActive(delta) {
    if (!state.options.length) return;
    let index = state.activeIndex;
    for (let step = 0; step < state.options.length; step++) {
      index = (index + delta + state.options.length) % state.options.length;
      if (!state.options[index].disabled) break;
    }
    setActive(index);
  }

  function onOutsideClick(event) {
    if (!root.contains(event.target)) close();
  }

  function open() {
    if (state.disabled || state.options.length <= 1 || !list.hidden) return;
    list.hidden = false;
    root.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    const currentIndex = state.options.findIndex((option) => option.value === state.value && !option.disabled);
    setActive(Math.max(0, currentIndex));
    document.addEventListener("pointerdown", onOutsideClick, true);
  }

  function close() {
    if (list.hidden) return;
    list.hidden = true;
    root.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
    setActive(-1);
    document.removeEventListener("pointerdown", onOutsideClick, true);
  }

  trigger.addEventListener("click", () => (list.hidden ? open() : close()));
  trigger.addEventListener("keydown", (event) => {
    if (list.hidden) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        open();
      }
      return;
    }
    if (event.key === "Escape") { event.preventDefault(); close(); trigger.focus(); }
    else if (event.key === "ArrowDown") { event.preventDefault(); moveActive(1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); moveActive(-1); }
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = state.options[state.activeIndex];
      if (option && !option.disabled) { setValue(option.value, true); close(); trigger.focus(); }
    }
  });

  renderTrigger();
  renderOptions();

  return {
    root,
    id,
    get value() { return state.value; },
    set value(value) { setValue(value, false); },
    get disabled() { return state.disabled; },
    set disabled(value) { state.disabled = value; renderTrigger(); },
    set title(value) { trigger.title = value; },
    get options() { return state.options; },
    set options(next) { state.options = next; renderTrigger(); renderOptions(); },
    refreshOptions: renderOptions,
    addEventListener(type, listener) { if (type === "change") changeListeners.push(listener); },
  };
}

function makeEquipmentSlot(definition, entries, controls, changeSelection) {
  const element = document.createElement("div");
  element.className = `paperdoll-slot slot-${definition.id}`;
  const mark = makeText("span", "paperdoll-slot-mark", definition.mark);
  mark.setAttribute("aria-hidden", "true");
  const label = makeText("label", "", definition.label);
  const select = createStyledSelect(`paperdoll-select-${definition.id}`);
  label.htmlFor = select.id;
  select.options = [
    { value: "", label: "Vazio", disabled: false },
    ...candidatesFor(definition.id, entries).map((entry) => ({ value: entry.id, label: entry.name, disabled: false })),
  ];
  select.disabled = select.options.length === 1;
  select.addEventListener("change", () => changeSelection(definition.id, select.value));
  const details = makeText("button", "paperdoll-details", "Ver item");
  details.type = "button";
  details.addEventListener("click", () => {
    const selected = entries.find((entry) => entry.id === select.value);
    if (selected) revealInventoryCard(selected.card);
  });
  controls.set(definition.id, { element, select, details, mark, definition });
  element.append(mark, label, select.root, details);
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
    drawDoll(placements, { appearance:section.dataset.appearance, backpack: /mochila/i.test(equipped.back?.name ?? "") });
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
      control.select.refreshOptions();
    }
    const visibleStates = paperdollVisibleStates(placements);
    const visibleIds = new Set(visibleStates.map(state => `${state.slot}:${state.id}`));
    const selected = Object.values(equipped).filter(Boolean);
    const worn = Object.entries(equipped).filter(([slot,entry]) => entry && (visibleIds.has(`${slot}:${artForItem(entry)?.id}`) || (slot === 'back' && /mochila/i.test(entry.name)))).map(([,entry]) => entry);
    const stored = selected.length - worn.length;
    const label = worn.length ? `${worn.length} equipamento${worn.length === 1 ? "" : "s"} no visual` : "Sem equipamento";
    const bothHands = placements.some(p => p.art.attachment === 'hand' && !visibleStates.some(s => s.id === p.art.id && s.slot === p.slot));
    const statusLabel = (stored ? `${label} · ${stored} guardado${stored === 1 ? "" : "s"}` : label) + (bothHands ? ' · pose com as duas mãos' : '');
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

function enhanceAppearancePreview(){
 const canvas=document.querySelector('#creator-appearance-preview'),select=document.querySelector('#aparencia');
 if(!canvas||!select||canvas.dataset.bound)return;
 canvas.dataset.bound='true';const draw=createPaperdoll(canvas),update=()=>draw([],{appearance:select.value});
 select.addEventListener('change',update);update();
}
new MutationObserver(enhanceAppearancePreview).observe(document.querySelector('#app'),{childList:true,subtree:true});
enhanceAppearancePreview();
