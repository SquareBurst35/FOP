import assert from "node:assert/strict";
import { CLASS_POWERS, GENERAL_POWERS, PARANORMAL_POWERS, RITUALS, TRAIL_ABILITIES } from "../content.js";
import { calculateDerived, SKILLS } from "../rules.js";

let scenarioNumber = 0;

class MockElement {
  constructor(dataset = {}, tagName = "DIV") {
    this.dataset = dataset;
    this.tagName = tagName;
    this.type = "";
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
    set: (value) => {
      app._html = String(value); generation += 1;
      // Replaced DOM nodes must be released just as they are in a real browser.
      transient.clear(); collections.clear();
    },
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
      const matches = [...markup().matchAll(new RegExp(`<(input|button|select)[^>]*${attribute}(?:=[^ >]+)?[^>]*>`, "g"))];
      const elements = matches.map((match) => {
        const [tag, tagName] = match;
        const datasets = {};
        for (const match of tag.matchAll(/(data-[a-z0-9-]+)(?:="([^"]*)")?/g)) {
          datasets[dataKey(match[1])] = match[2] ?? "";
        }
        const element = new MockElement(datasets, tagName.toUpperCase());
        element.type = tag.match(/type="([^"]*)"/)?.[1] ?? (tagName === "input" ? "text" : "button");
        element.value = tag.match(/value="([^"]*)"/)?.[1] ?? "";
        element.checked = /\schecked(?:\s|\/|>)/.test(tag);
        element.disabled = /\sdisabled(?:\s|\/|>)/.test(tag);
        if (tagName === 'select') {
          const body=markup().slice(match.index,markup().indexOf('</select>',match.index));
          element.options=[...body.matchAll(/<option[^>]*value="([^"]+)"[^>]*>([^<]*)/g)].map((option)=>({value:option[1],textContent:option[2],dataset:{choiceLabel:option[2]}}));
          Object.defineProperty(element,'selectedOptions',{get:()=>element.options.filter(option=>option.value===element.value)});
        }
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
      const element = documentMock.querySelectorAll(selector).find((candidate) => candidate.value === value || candidate.options?.some(option=>option.value===value));
      assert.ok(element, `Opção ${value} não encontrada em ${selector}`);
      assert.equal(element.disabled, false, `Opção ${value} está desabilitada`);
      element.checked = true;
      if(element.tagName==='SELECT')element.value=value;
      element.dispatch("change");
    },
    options(selector) {
      return documentMock.querySelectorAll(selector).flatMap((element) => element.options?.map(option=>option.value)??element.value);
    },
    clickData(selector, key, value) {
      const element = documentMock.querySelectorAll(selector).find((candidate) => candidate.dataset[key] === value);
      assert.ok(element, `Controle ${selector} com ${key}=${value} não encontrado`);
      assert.equal(element.disabled, false, `Controle ${selector} com ${key}=${value} está desabilitado`);
      element.dispatch("click");
    },
    body() { return documentMock.querySelector(".level-up-body"); },
    target(selector) { return documentMock.querySelector(selector); },
  };
}

function powerId(name, category) {
  return [...CLASS_POWERS, ...GENERAL_POWERS].find((entry) => entry.name === name && (!category || entry.category === category))?.id;
}

function paranormalId(name) {
  return PARANORMAL_POWERS.find((entry) => entry.name === name)?.id;
}

function ritualId() {
  return RITUALS.find(r=>r.circle===1).id;
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

// Poderes com escolha própria, como Habilidade Aprimorada, são configurados dentro do level up.
{
  const ui = await boot(characterAtLevel({ id: "habilidade-aprimorada", level: 2 }));
  enterChoices(ui);
  ui.choose("[data-level-up-class-power]", powerId("<Habilidade> Aprimorada", "Gerais"));
  assert.match(ui.html(), /Habilidade&gt; Aprimorada — Escolha a habilidade ou ritual com DT/);
  const [target] = ui.options("[data-level-up-structured-choice]");
  assert.ok(target, "Nenhum alvo predefinido apareceu para Habilidade Aprimorada");
  ui.choose("[data-level-up-structured-choice]", target);
  finish(ui);
  const saved = ui.saved();
  assert.equal(saved.nivel, 3);
  assert.ok(saved.habilidadeEscolhas.some((entry) => entry.type === "alvo" && entry.valueId === target));
}

// O botão de uma habilidade ativa desconta PE e registra o uso no histórico.
{
  const palpite = GENERAL_POWERS.find((entry) => entry.name === "Palpite Confiante");
  const character = characterAtLevel({ id: "uso-habilidade", level: 5, abilities: [palpite.id] });
  const ui = await boot(character);
  ui.clickData("[data-sheet-tab]", "sheetTab", "habilidades");
  ui.clickData("[data-use-ability]", "useAbility", palpite.id);
  const saved = ui.saved();
  assert.equal(saved.recursos.peAtual, character.recursos.peAtual - 1);
  assert.equal(saved.controleSessao.gastoTurno, 1);
  assert.equal(saved.controleSessao.historico.at(-1).name, "Palpite Confiante");
}

console.log("13 cenários de regressão do level up e da sessão passaram.");

// The UI no longer blocks a second use past the turn budget, and the old reset controls are gone.
for (const determination of [false, true]) {
  const label = determination ? "PD" : "PE";
  const currentKey = determination ? "pdAtual" : "peAtual";
  const power = GENERAL_POWERS.find(entry => entry.name === "Palpite Confiante");
  const character = characterAtLevel({ id: `${label}-ui-limit`, level: 1, abilities: [power.id], optionalRules: { determination } });
  const ui = await boot(character);
  assert.doesNotMatch(ui.html(), /Resetar turno/);
  assert.doesNotMatch(ui.html(), /Resetar cena/);
  assert.doesNotMatch(ui.html(), /data-session-action="session"/);
  ui.clickData("[data-sheet-tab]", "sheetTab", "habilidades");
  ui.clickData("[data-use-ability]", "useAbility", power.id);
  const afterFirst = ui.saved();
  ui.clickData("[data-use-ability]", "useAbility", power.id);
  const afterSecond = ui.saved();
  assert.equal(afterSecond.recursos[currentKey], afterFirst.recursos[currentKey] - 1);
  assert.equal(afterSecond.controleSessao.historico.length, 2);
}

// Ritual version selection is deferred until confirmation and persists its cost.
for (const determination of [false, true]) {
 const label=determination?'PD':'PE',currentKey=determination?'pdAtual':'peAtual';
 const ritual=RITUALS.find(r=>r.name==='Amaldiçoar Arma (Sangue)');
 const character=characterAtLevel({id:`ritual-versoes-${label}`,level:11,className:'Ocultista',rituals:[ritual.id],optionalRules:{determination}});
 character.afinidadeElemental='Sangue';
 const ui=await boot(character);ui.clickData('[data-sheet-tab]','sheetTab','rituais');
 ui.clickData('[data-use-ritual]','useRitual',ritual.id);
 assert.match(ui.html(),/data-use-option="normal"/);assert.match(ui.html(),/data-use-option="discente"/);assert.match(ui.html(),/data-use-option="verdadeiro"/);
 assert.equal(ui.saved().recursos[currentKey],character.recursos[currentKey]);
 ui.clickData('[data-use-option]','useOption','verdadeiro');
 ui.click('confirm-spend-dialog');
 assert.equal(ui.saved().recursos[currentKey],character.recursos[currentKey]-6);
 assert.equal(ui.saved().controleSessao.historico.at(-1).variant,'Verdadeiro');
 const afterFirstCast=ui.saved();
 ui.clickData('[data-use-ritual]','useRitual',ritual.id);
 ui.clickData('[data-use-option]','useOption','verdadeiro');
 ui.click('confirm-spend-dialog');
 // Um segundo cast além do limite por turno não é mais bloqueado.
 assert.equal(ui.saved().recursos[currentKey],afterFirstCast.recursos[currentKey]-6);
}
// New catalog entry, capacity bonus and attached upgrades survive save/reload.
{
 const {ITEMS}=await import('../items.js');
 const {ITEM_UPGRADES}=await import('../item-upgrades.js');
 const pack=ITEMS.find(i=>i.name==='Mochila militar'),armor=ITEMS.find(i=>i.name==='Proteção leve');
 const character=characterAtLevel({id:'inventario-v13',level:5});
 character.atributos.forca=1;character.patente='Agente de Elite';character.inventarioItens=[{itemId:pack.id,quantity:1},{itemId:armor.id,quantity:1}];
 const ui=await boot(character);ui.clickData('[data-sheet-tab]','sheetTab','inventario');
 assert.match(ui.html(),/Mochila militar/);assert.match(ui.html(),/2 \/ 7/);
 const reinforced=ITEM_UPGRADES.find(u=>u.target==='Proteções'&&u.name==='Reforçada');
 ui.clickData('[data-upgrade-action]','upgradeId',reinforced.id);
 assert.ok(ui.saved().inventarioModificacoes[armor.id].includes(reinforced.id));
 assert.match(ui.html(),/3 \/ 7/);
 ui.click('open-item-picker');ui.clickData('[data-item-group]','itemGroup','Modificações');assert.match(ui.html(),/Lente de Revelação/);
}
console.log('Ritual dialog, female persistence, inventory capacity and attached upgrades passed.');

// Possuído: require Transcender at a class-power level, then allow ordinary advances.
{
  const character = characterAtLevel({ id: "possuido-evolucao", level: 2, className: "Ocultista" });
  character.trilha = "Possuído";
  const ui = await boot(character);
  enterChoices(ui);
  assert.deepEqual(ui.options("[data-level-up-class-power]"), [powerId("Transcender", "Ocultista")]);
  ui.choose("[data-level-up-class-power]", powerId("Transcender", "Ocultista"));
  ui.click("next-level-up");
  assert.equal(ui.saved().nivel, 2, "The paranormal power must be chosen before confirming");
  ui.choose("[data-level-up-paranormal-power]", paranormalId("Afortunado"));
  ui.choose("[data-level-up-ritual]", ritualId());
  finish(ui);
  const evolved = ui.saved();
  assert.deepEqual(evolved.transcenderNiveis, [3]);
  assert.equal(evolved.recursos.ppMax, 5);
  assert.equal(evolved.recursos.sanMax, character.recursos.sanMax);
  assert.ok(evolved.habilidadeEscolhas.some(c => c.abilityId === powerId("Transcender", "Ocultista") && c.type === "poder" && c.valueId === paranormalId("Afortunado")));
  for (const legacy of [false, true]) {
    const saved = structuredClone(evolved);
    if (legacy) saved.habilidadeEscolhas = [];
    const next = await boot(saved);
    enterChoices(next);
    assert.deepEqual(next.options("[data-level-up-class-power]"), []);
    assert.deepEqual(next.options("[data-level-up-paranormal-power]"), []);
    next.choose("[data-level-up-attribute]", "agilidade");
    next.choose("[data-level-up-ritual]", next.options("[data-level-up-ritual]")[0]);
    finish(next);
    const advanced = next.saved();
    assert.equal(advanced.nivel, 4);
    assert.deepEqual(advanced.transcenderNiveis, [3]);
    assert.equal(advanced.recursos.ppMax, 5);
    assert.equal(advanced.recursos.sanMax - evolved.recursos.sanMax, 5, "Ordinary levels keep their SAN gain");
    assert.ok(advanced.habilidadeEscolhas.some(c => c.abilityId === powerId("Transcender", "Ocultista") && c.valueId === paranormalId("Afortunado")), "Saved evolution history repairs an old missing link");
  }
}

// Combatente com INT 2: as quatro escolhas devem ser exigidas e salvas no NEX 35%.
{
  const character = characterAtLevel({ id: "grau-combatente-int2", level: 6 });
  character.periciasAdicionais = SKILLS.slice(0, 6);
  character.grausPericia = Object.fromEntries(character.periciasAdicionais.map((skill) => [skill, 5]));
  const ui = await boot(character);
  enterChoices(ui);
  assert.match(ui.html(), /Eleve 4 perícia\(s\) de \+5 para \+10/);
  for (const skill of SKILLS.slice(0, 3)) ui.choose("[data-level-up-grade]", skill);
  ui.click("next-level-up");
  assert.match(ui.html(), /Escolhas do nível/);
  assert.equal(ui.saved().nivel, 6, "Três escolhas não completam a evolução");
  ui.choose("[data-level-up-grade]", SKILLS[3]);
  finish(ui);
  const saved = ui.saved();
  assert.equal(saved.nivel, 7);
  for (const skill of SKILLS.slice(0, 4)) assert.equal(saved.grausPericia[skill], 10);
  for (const skill of SKILLS.slice(4, 6)) assert.equal(saved.grausPericia[skill], 5);
}

// Ele Me Ensina must complete the nested Transcender choice at NEX 65%.
{
  const character=characterAtLevel({id:'ele-me-ensina-transcender',className:'Ocultista',level:12,abilities:[powerId('Transcender','Ocultista'),paranormalId('Afortunado')]});
  character.trilha='Possuído';character.transcenderNiveis=[3,6,9,12];
  const ui=await boot(character);enterChoices(ui);
  ui.choose('[data-level-up-structured-choice]',powerId('Transcender','Ocultista'));
  assert.ok(ui.options('[data-level-up-paranormal-power]').length);
  ui.choose('[data-level-up-paranormal-power]',paranormalId('Aprender Ritual'));
  ui.choose('[data-level-up-transcender-ritual]',ui.options('[data-level-up-transcender-ritual]')[0]);
  ui.choose('[data-level-up-affinity-element]','Energia');
  ui.choose('[data-level-up-ritual]',ui.options('[data-level-up-ritual]')[0]);
  finish(ui);
  assert.deepEqual(ui.saved().transcenderNiveis,[3,6,9,12,13]);
  assert.equal(ui.saved().recursos.ppMax,13);
  assert.equal(ui.saved().rituaisSelecionados.length,2);
  assert.ok(ui.saved().habilidadeEscolhas.some(c=>c.abilityId===powerId('Transcender','Ocultista')&&c.type==='poder'&&c.valueId===paranormalId('Aprender Ritual')));
}
// Graduado's bonus ritual belongs to the newly unlocked circle and is additional.
{
  const known=RITUALS.filter(r=>r.circle===1).slice(0,4).map(r=>r.id);
  const saber=TRAIL_ABILITIES.find(a=>a.name==='Saber Ampliado');
  const character=characterAtLevel({id:'graduado-novo-circulo',className:'Ocultista',level:4,rituals:known,abilityChoices:[{abilityId:saber.id,type:'ritual',valueId:known[0]}]});
  character.trilha='Graduado';
  const ui=await boot(character);enterChoices(ui);
  const extra=ui.options('[data-level-up-structured-choice]');
  assert.ok(extra.length>0);
  assert.ok(extra.every(id=>RITUALS.find(r=>r.id===id)?.circle===2));
  ui.choose('[data-level-up-structured-choice]',extra[0]);
  assert.equal(ui.options('[data-level-up-ritual]').includes(extra[0]),false);
  ui.choose('[data-level-up-ritual]',ui.options('[data-level-up-ritual]')[0]);
  finish(ui);
  assert.equal(ui.saved().rituaisSelecionados.length,known.length+2);
}
// All survivor trails complete all four staged advances without class-power choices.
for(const trail of ['Durão','Esperto','Esotérico']) {
  let character=characterAtLevel({id:`sobrevivente-${trail}`,className:'Sobrevivente',level:0});
  character.trilha='';character.sobreviventeEstagio=1;
  for(let stage=2;stage<=5;stage++) {
    const ui=await boot(character);
    ui.click('start-level-up');ui.click('next-level-up');ui.click('next-level-up');
    assert.match(ui.html(),/Escolhas do estágio/);
    assert.equal(ui.options('[data-level-up-class-power]').length,0);
    if(stage===2){ui.choose('[data-survivor-trail]',trail);if(trail==='Esperto')ui.choose('[data-survivor-skill]',ui.options('[data-survivor-skill]')[0]);}
    if(stage===3)ui.choose('[data-survivor-attribute]','agilidade');
    if(stage===4&&trail==='Esperto')for(const skill of ui.options('[data-survivor-trail-skill]').slice(0,2))ui.choose('[data-survivor-trail-skill]',skill);
    if(stage===4&&trail==='Esotérico')ui.choose('[data-survivor-ritual]',ui.options('[data-survivor-ritual]')[0]);
    if(stage===5)ui.choose('[data-survivor-danger]','Sangue');
    ui.click('next-level-up');assert.ok(ui.html().includes('Confira antes de aplicar o estágio.'),`${trail}: stage ${stage} must reach confirmation`);ui.click('next-level-up');
    character=ui.saved();assert.equal(character.sobreviventeEstagio,stage);assert.equal(character.nex,0);
  }
  if(trail==='Esotérico')assert.equal(character.rituaisSelecionados.length,1);
  if(trail==='Esotérico')assert.ok(character.habilidadeEscolhas.some(c=>c.type==='ritual'&&c.abilityId===TRAIL_ABILITIES.find(a=>a.name==='Iniciado').id));
  if(trail==='Esperto')assert.ok(character.habilidadeEscolhas.some(c=>c.type==='pericia'&&c.abilityId===TRAIL_ABILITIES.find(a=>a.name==='Esperto').id));
}

// The grimoire quota must stay fixed while individual checkboxes rerender the UI.
{
  const character=characterAtLevel({id:'grimorio-cota',className:'Ocultista',level:7});character.trilha='Graduado';
  const ui=await boot(character);enterChoices(ui);
  const first=ui.options('[data-level-up-structured-choice]')[0];
  ui.choose('[data-level-up-structured-choice]',first);
  ui.choose('[data-level-up-ritual]',ui.options('[data-level-up-ritual]')[0]);
  ui.click('next-level-up');assert.equal(ui.saved().nivel,7,'One ritual cannot fill an INT 2 grimoire');
  const second=ui.options('[data-level-up-structured-choice]').find(id=>id!==first);
  ui.choose('[data-level-up-structured-choice]',second);finish(ui);
  assert.equal(ui.saved().rituaisSelecionados.length,3);
}
// Borrowed training must save the secondary choice and the two skill upgrades.
{
  const character=characterAtLevel({id:'diletante-treinamento',className:'Especialista',level:5});
  const ui=await boot(character);enterChoices(ui);
  ui.choose('[data-level-up-class-power]',powerId('Especialista Diletante','Especialista'));
  const training=powerId('Treinamento em Perícia','Combatente');
  ui.choose('[data-level-up-structured-choice]',training);
  const skills=ui.options('[data-level-up-power-training]').slice(0,2);
  assert.equal(skills.length,2);
  for(const skill of skills)ui.choose('[data-level-up-power-training]',skill);
  finish(ui);
  for(const skill of skills) {
    assert.equal(ui.saved().grausPericia[skill],5);
    assert.ok(ui.saved().habilidadeEscolhas.some(c=>c.abilityId===training&&c.type==='pericia'&&c.valueId===skill));
  }
}
// Possuído cannot silently lose a power slot when level and exposure are separated.
{
  const character=characterAtLevel({id:'possuido-nivel-separado',className:'Ocultista',level:2,optionalRules:{separateLevelNex:true,determination:false}});character.trilha='Possuído';
  const ui=await boot(character);enterChoices(ui);
  assert.deepEqual(ui.options('[data-level-up-class-power]'),[powerId('Transcender','Ocultista')]);
  ui.choose('[data-level-up-class-power]',powerId('Transcender','Ocultista'));
  ui.choose('[data-level-up-paranormal-power]',paranormalId('Aprender Ritual'));
  assert.ok(ui.options('[data-level-up-transcender-ritual]').every(id=>RITUALS.find(r=>r.id===id).circle===1));
  ui.choose('[data-level-up-transcender-ritual]',ui.options('[data-level-up-transcender-ritual]')[0]);
  ui.choose('[data-level-up-ritual]',ui.options('[data-level-up-ritual]')[0]);
  finish(ui);
  assert.equal(ui.saved().nex,10);assert.equal(ui.saved().nivel,3);
  assert.equal(ui.saved().recursos.sanMax,calculateDerived({...ui.saved(),transcenderNiveis:[]}).sanMax);
}
// Registering Monstruoso's daily step changes resources without changing base attributes.
{
  const first=TRAIL_ABILITIES.find(a=>a.name==='Ser Amaldiçoado');
  const character=characterAtLevel({id:'monstruoso-etapa',level:8,attributes:{agilidade:1,forca:4,intelecto:3,presenca:1,vigor:2},abilityChoices:[{abilityId:first.id,type:'elemento',valueId:'Sangue'}]});character.trilha='Monstruoso';
  const ui=await boot(character);ui.click('toggle-monstrous-ritual');
  const active=ui.saved();assert.ok(active.recursos.peMax>calculateDerived({...active,efeitosAtivos:[]}).peMax);
  assert.deepEqual(active.atributos,character.atributos);
  ui.click('toggle-monstrous-ritual');assert.equal(ui.saved().efeitosAtivos.length,0);
}
console.log(`${scenarioNumber} fichas verificadas nos fluxos de evolução, escolhas, sessão e inventário.`);
