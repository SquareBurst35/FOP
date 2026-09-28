// A ficha é redesenhada inteira a cada mudança (PV, item, perícia...). O que só
// existe no DOM some junto: cards abertos, rolagem das colunas e o foco do
// teclado. Aqui isso é anotado antes do redesenho e devolvido depois, só
// quando é a mesma ficha na mesma aba (trocar de ficha ou de aba recomeça).
const SCOPES = [".sheet-sidebar", ".sheet-tabs", ".sheet-tab-content"];
const SCROLLERS = [".sheet-sidebar", ".sheet-tab-content", ".summary-side", ".skills-table-wrap"];
const FOCUSABLE = "BUTTON, SUMMARY, A";

// Cards iguais no mesmo escopo (dois itens de mesmo nome) ganham o número da
// ocorrência para não trocarem de estado entre si.
export function occurrenceKeys(labels) {
  const seen = new Map();
  return labels.map((label) => {
    const count = seen.get(label) ?? 0;
    seen.set(label, count + 1);
    return `${label}#${count}`;
  });
}

function scopeOf(root, element) {
  return SCOPES.find((selector) => root.querySelector(selector)?.contains(element)) ?? null;
}

function cardLabel(details) {
  const summary = details.querySelector(":scope > summary");
  const name = summary?.querySelector("strong") ?? summary;
  return (name?.textContent ?? "").replace(/\s+/g, " ").trim();
}

// Cards de uma coluna, com a chave estável de cada um (nome + ocorrência). A
// chave usa só o nome porque o resto do resumo muda (DT, "Escolha pendente").
function keyedCards(root, scope) {
  const container = root.querySelector(scope);
  const cards = container ? [...container.querySelectorAll("details")] : [];
  const keys = occurrenceKeys(cards.map(cardLabel));
  return cards.map((details, index) => ({ details, key: `${scope}|${keys[index]}` }));
}

function attributeSelector(element) {
  const escape = (value) => value.replace(/["\\]/g, "\\$&");
  const parts = [...element.attributes]
    .filter((attribute) => attribute.name.startsWith("data-") || attribute.name === "aria-label" || attribute.name === "id")
    .map((attribute) => `[${attribute.name}="${escape(attribute.value)}"]`);
  return parts.length ? `${element.tagName.toLowerCase()}${parts.join("")}` : null;
}

// Só botões, resumos e links voltam a ter foco. Campos de texto ficam de fora
// de propósito: o "change" deles dispara ao sair do campo (Tab), e devolver o
// foco ali prenderia o jogador no que ele acabou de deixar.
function captureFocus(root, cards) {
  const active = document.activeElement;
  if (!active || !active.matches?.(FOCUSABLE) || !root.contains(active)) return null;
  const scope = scopeOf(root, active);
  if (!scope) return null;
  if (active.tagName === "SUMMARY") {
    const card = cards.find(({ details }) => details === active.parentElement);
    return card ? { summary: card.key } : null;
  }
  const selector = attributeSelector(active);
  if (!selector) return null;
  const matches = [...root.querySelector(scope).querySelectorAll(selector)];
  return { scope, selector, index: matches.indexOf(active) };
}

// Nada aqui pode quebrar o desenho da ficha: qualquer falha vira "sem estado".
export function captureSheetUi(root, characterId, tab) {
  try {
    if (typeof document === "undefined" || typeof root?.querySelector !== "function") return null;
    const layout = root.querySelector(".sheet-layout");
    if (!layout?.dataset || layout.dataset.character !== characterId) return null;
    const sameTab = layout.dataset.tab === tab;
    const cards = sameTab ? [".sheet-sidebar", ".sheet-tab-content"].flatMap((scope) => keyedCards(root, scope)) : [];
    const focus = captureFocus(root, cards);
    // Trocar de aba recomeça a leitura; só o foco na própria barra de abas fica.
    if (!sameTab) return focus?.scope === ".sheet-tabs" ? { open: {}, scroll: {}, focus } : null;
    return {
      open: Object.fromEntries(cards.map(({ details, key }) => [key, details.open])),
      scroll: Object.fromEntries(SCROLLERS.flatMap((selector) => {
        const element = root.querySelector(selector);
        return element && element.scrollTop > 0 ? [[selector, element.scrollTop]] : [];
      })),
      focus,
    };
  } catch {
    return null;
  }
}

export function restoreSheetUi(root, state) {
  if (!state) return;
  try {
    for (const { details, key } of [".sheet-sidebar", ".sheet-tab-content"].flatMap((scope) => keyedCards(root, scope))) {
      if (key in state.open && details.open !== state.open[key]) {
        details.open = state.open[key];
        // Marca o card devolvido para o CSS não tocar de novo a revelação do
        // corpo; o próximo clique do jogador nele volta a ter a animação.
        if (details.open) {
          details.dataset.kept = "";
          details.querySelector(":scope > summary")?.addEventListener("click", () => delete details.dataset.kept, { once: true });
        }
      }
    }
    for (const [selector, top] of Object.entries(state.scroll)) {
      const element = root.querySelector(selector);
      if (element) element.scrollTop = top;
    }
    const focus = state.focus;
    if (!focus) return;
    const target = focus.summary
      ? keyedCards(root, focus.summary.split("|")[0]).find(({ key }) => key === focus.summary)?.details.querySelector(":scope > summary")
      : root.querySelector(focus.scope)?.querySelectorAll(focus.selector)[focus.index];
    if (target && !target.disabled) target.focus({ preventScroll: true });
  } catch {
    // Sem estado devolvido a ficha continua correta, só perde o conforto.
  }
}
