import assert from "node:assert/strict";
import { CLASS_POWERS, PARANORMAL_POWERS, RITUALS } from "../content.js";
import { calculateDerived, SKILLS } from "../rules.js";

let scenarioNumber = 0;

class MockElement {
  constructor(dataset = {}) {
    this.dataset = dataset;
    this.listeners = new Map();
    this.classes = new Set();
    this.classList = {
      add: (...names) => names.forEach((name) => this.classes.add(name)),
      remove: (...names) => names.forEach((name) => this.classes.delete(name)),
    };
    this.value = "";
    this.checked = false;
    this.disabled = false;
    this.open = false;
    this.scrollTop = 0;
    this.scrolledIntoView = false;
    this.textContent = "";
    this._html = "";
  }

  set innerHTML(value) { this._html = String(value); }
  get innerHTML() { return this._html; }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  dispatch(type = "click") {
    for (const callback of this.listeners.get(type) ?? []) callback({ target: this });
  }
  focus() {}
  showModal() { this.open = true; }
  close() { this.open = false; }
  scrollIntoView() { this.scrolledIntoView = true; }
}

function dataKey(attribute) {
  return attribute
    .replace(/^data-/, "")
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function characterAtLevel({
  id,
  level,
  className = "Combatente",
  optionalRules = { separateLevelNex: false, determination: false },
  attributes = { agilidade: 2, forca: 2, intelecto: 2, presenca: 2, vigor: 2 },
  abilities = [],
  rituals = [],
  abilityChoices = [],
} = {}) {
  const character = {
    id,
    nome: `Agente ${id}`,
    jogador: "Teste",
    origem: "Acadêmico",
    classe: className,
    trilha: level >= 2 ? (className === "Ocultista" ? "Conduíte" : className === "Especialista" ? "Infiltrador" : "Guerreiro") : "",
    nex: optionalRules.separateLevelNex ? 10 : level * 5,
    nivel: level,
    patente: "Recruta",
    optionalRules,
    atributos: attributes,
    periciasOrigemEscolhidas: [],
    periciasClasseObrigatorias: [],
    periciasEscolhidas: [],
    periciasAdicionais: [],
    periciasTreinadas: [],
    grausPericia: {},
    outrosBonusPericia: {},
    skillRanksVersion: 1,
    habilidadesSelecionadas: abilities,
    habilidadeEscolhas: abilityChoices,
    afinidadeElemental: "",
    transcenderNiveis: [],
    rituaisSelecionados: rituals,
    peritoPericias: [],
    levelUpHistory: [],
    recursos: {},
  };
  const derived = calculateDerived(character);
  character.recursos = {
    pvAtual: derived.pvMax,
    pvMax: derived.pvMax,
    peAtual: derived.peMax,
    peMax: derived.peMax,
    sanAtual: derived.sanMax,
    sanMax: derived.sanMax,
    pdAtual: derived.pdMax,
    pdMax: derived.pdMax,
  };
  return character;
}

async function boot(character) {
  scenarioNumber += 1;
  let generation = 0;
  const app = new MockElement();
  const header = new MockElement();
  const home = new MockElement();
  const toast = new MockElement();
  const transient = new Map();
  const collections = new Map();
  Object.defineProperty(app, "innerHTML", {
    get: () => app._html,
    set: (value) => { app._html = String(value); generation += 1; },
  });
  const markup = () => `${app.innerHTML}${header.innerHTML}`;
  const present = (selector) => {
    if (selector.startsWith("#")) return markup().includes(`id="${selector.slice(1)}"`);
    if (selector.startsWith(".")) return markup().includes(`class="${selector.slice(1)}`) || markup().includes(` ${selector.slice(1)}`);
    const attribute = selector.match(/\[([^\]]+)\]/)?.[1];
    return attribute ? markup().includes(attribute) : false;
  };
  const documentMock = {
    querySelector(selector) {
      if (selector === "#app") return app;
      if (selector === "#header-actions") return header;
      if (selector === "#home-button") return home;
      if (selector === "#toast") return toast;
      if (!present(selector)) return null;
      const key = `${generation}:${selector}`;
      if (!transient.has(key)) transient.set(key, new MockElement());
      return transient.get(key);
    },
    querySelectorAll(selector) {
      const key = `${generation}:${selector}`;
      if (collections.has(key)) return collections.get(key);
      const attribute = selector.match(/\[([^\]]+)\]/)?.[1];
      if (!attribute || !markup().includes(attribute)) {
        collections.set(key, []);
        return [];
      }
      const matches = [...markup().matchAll(new RegExp(`<input[^>]*${attribute}(?:=[^ >]+)?[^>]*>`, "g"))];
      const elements = matches.map(([tag]) => {
        const datasets = {};
        for (const match of tag.matchAll(/(data-[a-z0-9-]+)(?:="([^"]*)")?/g)) {
          datasets[dataKey(match[1])] = match[2] ?? "";
        }
        const element = new MockElement(datasets);
        element.value = tag.match(/value="([^"]*)"/)?.[1] ?? "";
        element.checked = /\schecked(?:\s|\/|>)/.test(tag);
        element.disabled = /\sdisabled(?:\s|\/|>)/.test(tag);
        return element;
      });
      collections.set(key, elements);
      return elements;
    },
  };
  const storage = new Map([["fop_personagens_v1", JSON.stringify([character])]]);
  globalThis.document = documentMock;
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
  };
  globalThis.window = {
    location: { hash: `#ficha/${character.id}` },
    addEventListener() {},
    clearTimeout() {},
    setTimeout() { return 0; },
    confirm: () => true,
    prompt: () => null,
    scrollTo() {},
  };
  await import(`../app.js?regression=${scenarioNumber}`);

  return {
    app,
    document: documentMock,
    html: () => app.innerHTML,
    saved: () => JSON.parse(storage.get("fop_personagens_v1"))[0],
    click(id) {
      const element = documentMock.querySelector(`#${id}`);
      assert.ok(element, `Controle #${id} não encontrado`);
      element.dispatch("click");
    },
    choose(selector, value) {
      const element = documentMock.querySelectorAll(selector).find((candidate) => candidate.value === value);
      assert.ok(element, `Opção ${value} não encontrada em ${selector}`);
      assert.equal(element.disabled, false, `Opção ${value} está desabilitada`);
      element.checked = true;
      element.dispatch("change");
    },
    options(selector) {
      return documentMock.querySelectorAll(selector).map((element) => element.value);
    },
    body() { return documentMock.querySelector(".level-up-body"); },
    target(selector) { return documentMock.querySelector(selector); },
  };
}

function powerId(name, category) {
  return CLASS_POWERS.find((entry) => entry.name === name && (!category || entry.category === category))?.id;
}

function paranormalId(name) {
  return PARANORMAL_POWERS.find((entry) => entry.name === name)?.id;
}

function ritualId() {
  return RITUALS[0].id;
}

function enterChoices(ui) {
  ui.click("start-level-up");
  ui.click("next-level-up");
  ui.click("next-level-up");
  assert.match(ui.html(), /Escolhas do nível/);
}

function finish(ui) {
  ui.click("next-level-up");
  assert.match(ui.html(), /Confirmar evolução/);
  ui.click("next-level-up");
}

// Transcender simples: revela a continuação, preserva o fluxo e retira apenas o ganho de SAN.
{
  const character = characterAtLevel({ id: "transcender-simples", level: 2 });
  const ui = await boot(character);
  enterChoices(ui);
  ui.body().scrollTop = 420;
  ui.choose("[data-level-up-class-power]", powerId("Transcender", "Combatente"));
  assert.equal(ui.target("#level-up-paranormal-power-choice").scrolledIntoView, true);
  assert.equal(ui.body().scrollTop, 420);
  ui.choose("[data-level-up-paranormal-power]", paranormalId("Afortunado"));
  finish(ui);
  const saved = ui.saved();
  assert.equal(saved.nivel, 3);
  assert.equal(saved.recursos.sanMax, character.recursos.sanMax);
  assert.deepEqual(saved.transcenderNiveis, [3]);
  assert.ok(saved.habilidadesSelecionadas.includes(paranormalId("Afortunado")));
}

// Aprender Ritual cria e salva a escolha adicional.
{
  const ui = await boot(characterAtLevel({ id: "aprender-ritual", level: 5 }));
  enterChoices(ui);
  ui.choose("[data-level-up-class-power]", powerId("Transcender", "Combatente"));
  ui.choose("[data-level-up-paranormal-power]", paranormalId("Aprender Ritual"));
  assert.match(ui.html(), /Aprender Ritual — escolha um ritual/);
  ui.choose("[data-level-up-transcender-ritual]", ritualId());
  finish(ui);
  const saved = ui.saved();
  assert.ok(saved.rituaisSelecionados.includes(ritualId()));
  assert.ok(saved.habilidadeEscolhas.some((entry) => entry.type === "ritual" && entry.valueId === ritualId()));
}

// Resistir a Elemento exige e registra o elemento.
{
  const ui = await boot(characterAtLevel({ id: "resistir-elemento", level: 5 }));
  enterChoices(ui);
  ui.choose("[data-level-up-class-power]", powerId("Transcender", "Combatente"));
  ui.choose("[data-level-up-paranormal-power]", paranormalId("Resistir a Elemento"));
  ui.choose("[data-level-up-paranormal-element]", "Morte");
  finish(ui);
  assert.ok(ui.saved().habilidadeEscolhas.some((entry) => entry.type === "elemento" && entry.value === "Morte"));
}

// Expansão de Conhecimento exige e salva um poder de outra classe.
{
  const ownAcuidade = powerId("Acuidade com Arma", "Combatente");
  const ui = await boot(characterAtLevel({ id: "expansao", level: 5, abilities: [ownAcuidade] }));
  enterChoices(ui);
  ui.choose("[data-level-up-class-power]", powerId("Transcender", "Combatente"));
  ui.choose("[data-level-up-paranormal-power]", paranormalId("Expansão de Conhecimento"));
  assert.equal(ui.options("[data-level-up-expanded-power]").includes(powerId("Acuidade com Arma", "Especialista")), false);
  const otherPower = powerId("Balística Avançada", "Especialista");
  ui.choose("[data-level-up-expanded-power]", otherPower);
  finish(ui);
  assert.ok(ui.saved().habilidadesSelecionadas.includes(otherPower));
}

// Versatilidade também pode abrir Transcender e a primeira afinidade em NEX 50%.
{
  const ui = await boot(characterAtLevel({ id: "versatilidade", level: 9 }));
  enterChoices(ui);
  ui.choose("[data-level-up-attribute]", "agilidade");
  ui.choose("[data-level-up-versatility]", powerId("Transcender", "Combatente"));
  ui.choose("[data-level-up-paranormal-power]", paranormalId("Afortunado"));
  assert.equal(ui.target("#level-up-affinity-choice").scrolledIntoView, true);
  ui.choose("[data-level-up-affinity-element]", "Energia");
  finish(ui);
  assert.equal(ui.saved().afinidadeElemental, "Energia");
}

// Transcender deixa de ser oferecido quando nenhuma recompensa paranormal válida resta.
{
  const allAbilities = [...CLASS_POWERS, ...PARANORMAL_POWERS].map((entry) => entry.id);
  const resistId = paranormalId("Resistir a Elemento");
  const abilityChoices = ["Conhecimento", "Energia", "Morte", "Sangue"].map((element) => ({
    abilityId: resistId,
    type: "elemento",
    valueId: element,
    value: element,
    level: 2,
  }));
  const ui = await boot(characterAtLevel({
    id: "transcender-esgotado",
    level: 2,
    abilities: allAbilities,
    rituals: RITUALS.map((entry) => entry.id),
    abilityChoices,
  }));
  enterChoices(ui);
  assert.equal(ui.options("[data-level-up-class-power]").includes(powerId("Transcender", "Combatente")), false);
}

// Com NEX e nível separados, Transcender não aparece como poder do avanço de nível.
{
  const character = characterAtLevel({ id: "nex-separado", level: 2, optionalRules: { separateLevelNex: true, determination: false } });
  const ui = await boot(character);
  enterChoices(ui);
  assert.equal(ui.options("[data-level-up-class-power]").includes(powerId("Transcender", "Combatente")), false);
  ui.choose("[data-level-up-class-power]", powerId("Armamento Pesado", "Combatente"));
  finish(ui);
  assert.equal(ui.saved().nex, 10);
  assert.equal(ui.saved().nivel, 3);
}

// Jogando sem Sanidade continua usando a progressão normal de PD.
{
  const character = characterAtLevel({ id: "determinacao", level: 2, optionalRules: { separateLevelNex: false, determination: true } });
  const ui = await boot(character);
  enterChoices(ui);
  ui.choose("[data-level-up-class-power]", powerId("Transcender", "Combatente"));
  ui.choose("[data-level-up-paranormal-power]", paranormalId("Afortunado"));
  finish(ui);
  assert.ok(ui.saved().recursos.pdMax > character.recursos.pdMax);
}

// Uma ficha editada com todos os atributos no máximo não fica presa no nível 4.
{
  const ui = await boot(characterAtLevel({ id: "atributos-maximos", level: 3, attributes: { agilidade: 5, forca: 5, intelecto: 5, presenca: 5, vigor: 5 } }));
  enterChoices(ui);
  assert.match(ui.html(), /Todos os atributos já estão no máximo/);
  finish(ui);
  assert.equal(ui.saved().nivel, 4);
}

// Um ocultista que já conhece todo o catálogo permitido não fica preso por uma lista vazia.
{
  const allRituals = RITUALS.map((entry) => entry.id);
  const ui = await boot(characterAtLevel({ id: "rituais-esgotados", level: 2, className: "Ocultista", rituals: allRituals }));
  enterChoices(ui);
  ui.choose("[data-level-up-class-power]", powerId("Camuflar Ocultismo", "Ocultista"));
  assert.match(ui.html(), /Todos os rituais permitidos já estão na ficha/);
  finish(ui);
  assert.equal(ui.saved().nivel, 3);
}

// Treinamento em Perícia exige opções válidas e aplica exatamente duas melhorias.
{
  const ui = await boot(characterAtLevel({ id: "treinamento", level: 2 }));
  enterChoices(ui);
  ui.choose("[data-level-up-class-power]", powerId("Treinamento em Perícia", "Combatente"));
  ui.choose("[data-level-up-power-training]", SKILLS[0]);
  ui.choose("[data-level-up-power-training]", SKILLS[1]);
  finish(ui);
  assert.equal(ui.saved().grausPericia[SKILLS[0]], 5);
  assert.equal(ui.saved().grausPericia[SKILLS[1]], 5);
}

console.log("11 cenários de regressão do level up passaram.");
