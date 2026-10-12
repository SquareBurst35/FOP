// Dados da ficha vêm de localStorage e da nuvem, e (com importação) de arquivos
// de outros jogadores: nenhum campo pode virar marcação. O teste coloca uma
// carga hostil em TODOS os campos de texto, desenha cada tela e confirma que a
// carga nunca aparece crua no HTML (só escapada).
import test from "node:test";
import assert from "node:assert/strict";
import { RITUALS } from "../content.js";
import { calculateDerived } from "../rules.js";

const PAYLOAD = '"><img src=x onerror=window.__xss=1>';
const RAW = /"><img src=x onerror/;
const tag = (field) => `${PAYLOAD}<${field}>`;

class MockElement {
  constructor(dataset = {}, tagName = "DIV") {
    Object.assign(this, { dataset, tagName, type: "", listeners: new Map(), classes: new Set(), value: "", checked: false, disabled: false, open: false, scrollTop: 0, textContent: "", _html: "" });
    this.classList = { add: (...n) => n.forEach((x) => this.classes.add(x)), remove: (...n) => n.forEach((x) => this.classes.delete(x)) };
  }
  set innerHTML(value) { this._html = String(value); }
  get innerHTML() { return this._html; }
  addEventListener(type, callback) { this.listeners.set(type, [...(this.listeners.get(type) ?? []), callback]); }
  dispatch(type = "click") { for (const callback of this.listeners.get(type) ?? []) callback({ target: this }); }
  focus() {} showModal() { this.open = true; } close() { this.open = false; } scrollIntoView() {}
}
const dataKey = (attribute) => attribute.replace(/^data-/, "").replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

function hostileCharacter() {
  const character = {
    id: "hostil", nome: tag("nome"), jogador: tag("jogador"), origem: tag("origem"), classe: tag("classe"), trilha: tag("trilha"), patente: tag("patente"),
    nex: 35, nivel: 7, optionalRules: { separateLevelNex: false, determination: false },
    atributos: { agilidade: 2, forca: 1, intelecto: 3, presenca: 3, vigor: 2 },
    periciasOrigemEscolhidas: [], periciasClasseObrigatorias: [], periciasEscolhidas: [], periciasAdicionais: [],
    periciasTreinadas: [tag("pericia")], grausPericia: {}, outrosBonusPericia: {}, skillRanksVersion: 1,
    habilidadesSelecionadas: [], habilidadeEscolhas: [], afinidadeElemental: tag("afinidade"), transcenderNiveis: [],
    rituaisSelecionados: RITUALS.slice(0, 4).map((r) => r.id), peritoPericias: [], levelUpHistory: [], recursos: {}, inventarioItens: [],
    anotacoes: tag("anotacoes"), pericias: tag("pericias"), inventario: tag("inventario"), habilidadesNotas: tag("hn"), rituaisNotas: tag("rn"),
    personalidade: tag("personalidade"), historico: tag("historico"), objetivo: tag("objetivo"),
    foto: `data:image/png;base64,AAAA${PAYLOAD}`,
    itensPersonalizados: [{ id: tag("item-id"), name: tag("item-nome"), category: "I", spaces: 1, quantity: 1, dano: tag("dano"), tipo: tag("tipo"), critico: tag("crit"), alcance: tag("alcance"), proficiencia: tag("prof"), empunhadura: tag("emp") }],
    efeitosAtivos: [{ id: tag("efeito-id"), name: tag("efeito-nome"), variant: tag("efeito-variante") }],
  };
  const derived = calculateDerived(character);
  character.recursos = { pvAtual: derived.pvMax, pvMax: derived.pvMax, peAtual: derived.peMax, peMax: derived.peMax, sanAtual: derived.sanMax, sanMax: derived.sanMax, pdAtual: 0, pdMax: 0 };
  return character;
}

async function boot(hash) {
  const app = new MockElement(), header = new MockElement(), home = new MockElement(), toast = new MockElement();
  let generation = 0;
  Object.defineProperty(app, "innerHTML", { get: () => app._html, set: (v) => { app._html = String(v); generation += 1; } });
  const markup = () => `${app.innerHTML}${header.innerHTML}`;
  const transient = new Map(), collections = new Map();
  const documentMock = {
    querySelector(selector) {
      if (selector === "#app") return app;
      if (selector === "#header-actions") return header;
      if (selector === "#home-button") return home;
      if (selector === "#toast") return toast;
      const present = selector.startsWith("#") ? markup().includes(`id="${selector.slice(1)}"`) : selector.startsWith(".") ? markup().includes(selector.slice(1)) : false;
      if (!present) return null;
      const key = `${generation}:${selector}`;
      if (!transient.has(key)) transient.set(key, new MockElement());
      return transient.get(key);
    },
    querySelectorAll(selector) {
      const key = `${generation}:${selector}`;
      if (collections.has(key)) return collections.get(key);
      const attribute = selector.match(/\[([^\]]+)\]/)?.[1];
      const found = attribute && markup().includes(attribute)
        ? [...markup().matchAll(new RegExp(`<(input|button)[^>]*${attribute}(?:=[^ >]+)?[^>]*>`, "g"))].map(([text, name]) => {
            const datasets = {};
            for (const match of text.matchAll(/(data-[a-z0-9-]+)(?:="([^"]*)")?/g)) datasets[dataKey(match[1])] = match[2] ?? "";
            return new MockElement(datasets, name.toUpperCase());
          })
        : [];
      collections.set(key, found);
      return found;
    },
  };
  const storage = new Map([["fop_personagens_v1", JSON.stringify([hostileCharacter()])]]);
  globalThis.document = documentMock;
  globalThis.localStorage = { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, String(v)) };
  globalThis.window = { location: { hash }, addEventListener() {}, clearTimeout() {}, setTimeout() { return 0; }, confirm: () => true, prompt: () => null, scrollTo() {} };
  await import(`../app.js?xss=${boot.count = (boot.count ?? 0) + 1}`);
  return { html: markup, tab: (name) => documentMock.querySelectorAll("[data-sheet-tab]").find((b) => b.dataset.sheetTab === name)?.dispatch("click"), click: (id) => documentMock.querySelector(`#${id}`)?.dispatch("click") };
}

test("nenhuma tela da ficha deixa campos de texto virarem marcação", async () => {
  const ui = await boot("#ficha/hostil");
  for (const tab of ["resumo", "habilidades", "rituais", "inventario", "anotacoes"]) {
    ui.tab(tab);
    assert.doesNotMatch(ui.html(), RAW, `carga hostil crua na aba ${tab}`);
  }
  ui.tab("resumo");
  assert.match(ui.html(), /&quot;&gt;&lt;img src=x onerror=window\.__xss=1&gt;&lt;nome&gt;/, "o nome aparece, mas escapado");
});

test("o inventário e os efeitos ativos escapam ids e nomes que vêm da ficha", async () => {
  const ui = await boot("#ficha/hostil");
  ui.tab("inventario");
  const inventory = ui.html();
  assert.doesNotMatch(inventory, RAW);
  assert.match(inventory, /data-custom-item-remove="[A-Za-z0-9_-]+"/, "o id do item personalizado virou um id seguro");
  ui.tab("resumo");
  const summary = ui.html();
  assert.doesNotMatch(summary, RAW);
  assert.match(summary, /data-cancel-effect="[A-Za-z0-9_-]+"/, "o id do efeito ativo virou um id seguro");
});

test("a tela inicial e as de diálogo também escapam", async () => {
  const home = await boot("#home");
  assert.doesNotMatch(home.html(), RAW);
  const sheet = await boot("#ficha/hostil");
  for (const id of ["start-level-up", "edit-core", "optional-rules-button"]) {
    sheet.click(id);
    assert.doesNotMatch(sheet.html(), RAW, `carga hostil crua depois de #${id}`);
  }
});
