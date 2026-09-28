import { artForItem } from "./item-art.js?v=55";
import { drawItemIcon } from "./item-icons.js?v=1";

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

function refreshInterface() {
  restoreInteractionState();
  enhanceItemIcons();
}

document.addEventListener("click", handleInteraction, true);
document.addEventListener("change", handleInteraction, true);
new MutationObserver(refreshInterface).observe(document.querySelector("#app"), {
  childList: true,
  subtree: true,
});
refreshInterface();
