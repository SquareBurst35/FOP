// "Efeitos: normais / reduzidos". Reduzido faz o site se comportar como quem
// pede "reduzir movimento" no sistema (regras espelhadas em effects.css): sem
// fundo animado, sem animações de ficha, só o estado final das mudanças. O
// pedido do sistema sempre vale e não pode ser desfeito por aqui.
export const STORAGE_KEY = "fop_efeitos_v1";

export function effectsMode({ preference, systemReduced }) {
  return systemReduced || preference === "reduced" ? "reduced" : "normal";
}

export function readPreference(storage) {
  try {
    return storage?.getItem(STORAGE_KEY) === "reduced" ? "reduced" : "normal";
  } catch {
    return "normal";
  }
}

export function writePreference(storage, preference) {
  try {
    storage?.setItem(STORAGE_KEY, preference);
  } catch {
    // Sem armazenamento (janela privada) a escolha vale só até recarregar.
  }
}

export function buttonLabel({ preference, systemReduced }) {
  const mode = effectsMode({ preference, systemReduced });
  return {
    text: mode === "reduced" ? "Efeitos: reduzidos" : "Efeitos: normais",
    pressed: mode === "reduced",
    locked: systemReduced,
    title: systemReduced
      ? "O sistema pede menos movimento, então os efeitos ficam reduzidos."
      : mode === "reduced"
        ? "Voltar a mostrar animações e o fundo animado"
        : "Reduzir animações e esconder o fundo animado",
  };
}

// Sem DOM (testes em Node) só as funções acima são usadas.
export function startEffectsSetting({ root = document.documentElement, button = document.querySelector("#effects-toggle"), storage = globalThis.localStorage, media = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)") } = {}) {
  let preference = readPreference(storage);
  const state = () => ({ preference, systemReduced: media?.matches === true });
  const apply = () => {
    const current = state();
    root.dataset.effects = effectsMode(current);
    if (!button) return;
    const label = buttonLabel(current);
    button.textContent = label.text;
    button.title = label.title;
    button.disabled = label.locked;
    button.setAttribute("aria-pressed", String(label.pressed));
  };
  button?.addEventListener("click", () => {
    preference = preference === "reduced" ? "normal" : "reduced";
    writePreference(storage, preference);
    apply();
  });
  media?.addEventListener?.("change", apply);
  apply();
}

if (typeof document !== "undefined") startEffectsSetting();
