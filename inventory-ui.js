const GROUP_VISUALS = {
  Armas: { mark: "⌖", className: "weapons" },
  "Munições": { mark: "▥", className: "ammo" },
  "Proteções": { mark: "◫", className: "armor" },
  "Acessórios": { mark: "◇", className: "accessories" },
  "Modificações": { mark: "⌁", className: "mods" },
  Explosivos: { mark: "✦", className: "explosives" },
  Operacionais: { mark: "⬡", className: "operational" },
  Medicamentos: { mark: "+", className: "medicine" },
  Paranormais: { mark: "◉", className: "paranormal" },
};

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

function numberFrom(text) {
  const value = Number(String(text ?? "").replace(/\./g, "").replace(",", ".").match(/-?\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(value) ? value : 0;
}

function initials(name) {
  return String(name || "Agente")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "AG";
}

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
  const quantity = Math.max(1, numberFrom(card.querySelector(".quantity-stepper output")?.textContent) || 1);
  const spaceBadge = [...card.querySelectorAll("summary .badge")]
    .find((badge) => /espaço/i.test(badge.textContent || ""));
  const spaces = numberFrom(spaceBadge?.textContent);
  return { card, name, group, quantity, totalSpaces: spaces * quantity };
}

function makeText(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function makeLoadoutTile(entry) {
  const visual = GROUP_VISUALS[entry.group] ?? { mark: "◆", className: "other" };
  const button = document.createElement("button");
  button.type = "button";
  button.className = `loadout-slot loadout-${visual.className}`;
  if (entry.group === "Armas" || entry.group === "Proteções" || entry.totalSpaces >= 2) {
    button.classList.add("is-wide");
  }
  button.setAttribute("aria-label", `Ver detalhes de ${entry.name}`);

  const mark = makeText("span", "loadout-slot-mark", visual.mark);
  mark.setAttribute("aria-hidden", "true");
  const copy = document.createElement("span");
  copy.className = "loadout-slot-copy";
  copy.append(makeText("strong", "", entry.name), makeText("small", "", entry.group));
  const meta = document.createElement("span");
  meta.className = "loadout-slot-meta";
  meta.append(
    makeText("b", "", `${entry.quantity}×`),
    makeText("small", "", `${entry.totalSpaces.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} esp.`),
  );
  button.append(mark, copy, meta);
  button.addEventListener("click", () => {
    entry.card.open = true;
    entry.card.classList.remove("selection-revealed");
    void entry.card.offsetWidth;
    entry.card.classList.add("selection-revealed");
    entry.card.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  return button;
}

function makeAddTile(openButton) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "loadout-slot loadout-add-slot";
  button.setAttribute("aria-label", "Adicionar item ao inventário");
  const mark = makeText("span", "loadout-slot-mark", "＋");
  mark.setAttribute("aria-hidden", "true");
  const copy = document.createElement("span");
  copy.className = "loadout-slot-copy";
  copy.append(makeText("strong", "", "Adicionar item"), makeText("small", "", "Abrir catálogo"));
  button.append(mark, copy);
  button.addEventListener("click", () => openButton?.click());
  return button;
}

function enhanceInventory() {
  const section = document.querySelector(".inventory-section");
  if (!section || section.querySelector(".loadout-board")) return;
  const list = section.querySelector(".inventory-list");
  const overview = section.querySelector(".inventory-overview");
  if (!list || !overview) return;

  const entries = [...list.querySelectorAll(":scope > .item-card")].map(readInventoryCard);
  const capacityText = section.querySelector(".inventory-capacity strong")?.textContent || "0 / 0";
  const [occupiedText = "0", capacityValueText = "0"] = capacityText.split("/");
  const occupied = numberFrom(occupiedText);
  const capacity = numberFrom(capacityValueText);
  const fill = capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0;
  const state = section.querySelector(".inventory-capacity small")?.textContent?.trim() || "Carga operacional";
  const overloaded = section.querySelector(".inventory-capacity")?.classList.contains("warning")
    || section.querySelector(".inventory-capacity")?.classList.contains("blocked");
  const agentName = document.querySelector(".agent-identity h1")?.textContent?.trim() || "Agente";

  const board = document.createElement("section");
  board.className = "loadout-board";
  board.setAttribute("aria-labelledby", "loadout-title");

  const heading = document.createElement("header");
  heading.className = "loadout-board-heading";
  const titleWrap = document.createElement("div");
  titleWrap.append(makeText("span", "loadout-kicker", "Mapa de carga"));
  const title = makeText("h3", "", "Equipamento preparado");
  title.id = "loadout-title";
  titleWrap.append(title);
  const stateBadge = makeText("span", `loadout-state${overloaded ? " warning" : ""}`, state);
  heading.append(titleWrap, stateBadge);

  const field = document.createElement("div");
  field.className = "loadout-field";
  const agent = document.createElement("aside");
  agent.className = "loadout-agent-panel";
  const agentMark = makeText("div", "loadout-agent-mark", "");
  agentMark.style.setProperty("--loadout-fill", `${fill}%`);
  agentMark.setAttribute("aria-label", `${fill}% da capacidade comum ocupada`);
  agentMark.append(makeText("span", "", initials(agentName)));
  const capacityBar = document.createElement("div");
  capacityBar.className = "loadout-capacity-bar";
  capacityBar.setAttribute("aria-hidden", "true");
  const capacityFill = document.createElement("span");
  capacityFill.style.width = `${fill}%`;
  capacityBar.append(capacityFill);
  agent.append(
    agentMark,
    makeText("strong", "", agentName),
    makeText("small", "", `${occupiedText.trim()} de ${capacityValueText.trim()} espaços`),
    capacityBar,
  );

  const grid = document.createElement("div");
  grid.className = "loadout-grid";
  entries.forEach((entry) => grid.append(makeLoadoutTile(entry)));
  grid.append(makeAddTile(section.querySelector("#open-item-picker")));
  field.append(agent, grid);
  board.append(
    heading,
    field,
    makeText("p", "loadout-help", "Clique em um item para abrir sua descrição e controles logo abaixo."),
  );
  list.before(board);
}

function refreshInterface() {
  restoreInteractionState();
  enhanceInventory();
}

document.addEventListener("click", handleInteraction, true);
document.addEventListener("change", handleInteraction, true);
new MutationObserver(refreshInterface).observe(document.querySelector("#app"), {
  childList: true,
  subtree: true,
});
refreshInterface();
