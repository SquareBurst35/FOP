import {
  ATTRIBUTE_MAX_AT_CREATION,
  CLASSES,
  ORIGINS,
  SKILLS,
  applyDerived,
  attributeBudget,
  attributeTarget,
  calculateDerived,
  characterLevel,
  findOrigin,
  getSkillConfiguration,
  isMundaneCharacter,
  levelFromNex,
  sanitizeSkillSelections,
  skillSelectionStatus,
  usesSeparateLevel,
} from "./rules.js?v=7";
import {
  ABILITY_CATEGORIES,
  CLASS_POWERS,
  CORE_CLASS_ABILITIES,
  GENERAL_POWERS,
  ORIGIN_BACKGROUNDS,
  ORIGIN_POWER_DETAILS,
  PARANORMAL_POWERS,
  PATENTS,
  RITUAL_CIRCLES,
  RITUAL_ELEMENTS,
  RITUALS,
  SKILL_ATTRIBUTES,
  TRAIL_ABILITIES,
  allSelectableAbilities,
} from "./content.js?v=7";
import {
  INVENTORY_GROUPS,
  ITEMS,
  ITEM_BY_ID,
  PATENT_ITEM_LIMITS,
  inventoryUsage,
} from "./items.js?v=7";
import { LEVEL_CAP, createLevelUpPlan, levelLabel } from "./progression.js?v=7";

const STORAGE_KEY = "fop_personagens_v1";

const ATTRIBUTE_LABELS = {
  agilidade: "AGI",
  forca: "FOR",
  intelecto: "INT",
  presenca: "PRE",
  vigor: "VIG",
};

const STEPS = ["Identidade", "Formação", "Atributos", "Perícias", "Recursos", "Revisão"];

const app = document.querySelector("#app");
const headerActions = document.querySelector("#header-actions");
const homeButton = document.querySelector("#home-button");
const toastElement = document.querySelector("#toast");

let toastTimer;
let creatorState = null;
let currentStep = 0;
let activeSheetTab = "resumo";
let activeAbilityCategory = "Combatente";
let activeAbilityGroup = "";
let abilitySearch = "";
let activeRitualCircle = 1;
let activeRitualElement = "Conhecimento";
let ritualSearch = "";
let activeItemGroup = "Armas";
let activeItemSource = "Todos";
let itemSearch = "";
let levelUpState = null;

const ALL_ABILITIES = allSelectableAbilities(ORIGINS);
const ABILITY_BY_ID = new Map(
  [...CORE_CLASS_ABILITIES, ...ALL_ABILITIES].map((entry) => [entry.id, entry]),
);
const RITUAL_BY_ID = new Map(RITUALS.map((entry) => [entry.id, entry]));

homeButton.addEventListener("click", () => navigate("home"));
window.addEventListener("hashchange", renderRoute);

function createBlankCharacter() {
  const character = {
    id: crypto.randomUUID(),
    nome: "",
    jogador: "",
    origem: "",
    classe: "Mundano",
    trilha: "",
    nex: 0,
    nivel: 0,
    patente: "Sem patente",
    optionalRules: {
      separateLevelNex: false,
      determination: false,
    },
    atributos: {
      agilidade: 1,
      forca: 1,
      intelecto: 1,
      presenca: 1,
      vigor: 1,
    },
    recursos: {
      pvAtual: 10,
      pvMax: 10,
      peAtual: 5,
      peMax: 5,
      sanAtual: 10,
      sanMax: 10,
      pdAtual: 0,
      pdMax: 0,
    },
    defesa: 10,
    deslocamento: 9,
    protecao: "Nenhuma",
    periciasOrigemEscolhidas: [],
    periciasClasseObrigatorias: [],
    periciasEscolhidas: [],
    periciasAdicionais: [],
    periciasTreinadas: [],
    grausPericia: {},
    outrosBonusPericia: {},
    skillRanksVersion: 1,
    pericias: "",
    inventario: "",
    inventarioItens: [],
    habilidades: "",
    habilidadesNotas: "",
    habilidadesSelecionadas: [],
    rituaisSelecionados: [],
    rituaisNotas: "",
    peritoPericias: [],
    levelUpHistory: [],
    anotacoes: "",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
  return applyDerived(normalizeCharacter(character), true);
}

function normalizeCharacter(character) {
  if (!character || typeof character !== "object") return character;
  ensureOptionalRules(character);
  character.atributos ??= { agilidade: 1, forca: 1, intelecto: 1, presenca: 1, vigor: 1 };
  character.periciasTreinadas = Array.isArray(character.periciasTreinadas)
    ? character.periciasTreinadas
    : [];
  character.periciasAdicionais = Array.isArray(character.periciasAdicionais)
    ? [...new Set(character.periciasAdicionais.filter((skill) => SKILLS.includes(skill)))]
    : [];

  const isLegacySkillSheet = character.skillRanksVersion !== 1;
  character.grausPericia ??= {};
  character.outrosBonusPericia ??= {};
  for (const skill of SKILLS) {
    const legacyDefault = character.periciasTreinadas.includes(skill) ? 5 : 0;
    const grade = Number(character.grausPericia[skill]);
    character.grausPericia[skill] = [0, 5, 10, 15].includes(grade)
      ? grade
      : isLegacySkillSheet
        ? legacyDefault
        : 0;
    character.outrosBonusPericia[skill] = clamp(
      numberOr(character.outrosBonusPericia[skill], 0),
      -99,
      99,
    );
  }
  character.skillRanksVersion = 1;

  character.habilidadesNotas ??= character.habilidades ?? "";
  character.rituaisNotas ??= "";
  character.habilidadesSelecionadas = Array.isArray(character.habilidadesSelecionadas)
    ? [...new Set(character.habilidadesSelecionadas.filter((id) => ABILITY_BY_ID.has(id)))]
    : [];
  character.rituaisSelecionados = Array.isArray(character.rituaisSelecionados)
    ? [...new Set(character.rituaisSelecionados.filter((id) => RITUAL_BY_ID.has(id)))]
    : [];
  character.peritoPericias = Array.isArray(character.peritoPericias)
    ? [...new Set(character.peritoPericias.filter((skill) => SKILLS.includes(skill)))]
    : [];
  character.levelUpHistory = Array.isArray(character.levelUpHistory)
    ? character.levelUpHistory
    : [];
  const inventoryQuantities = new Map();
  for (const selected of Array.isArray(character.inventarioItens) ? character.inventarioItens : []) {
    if (!ITEM_BY_ID.has(selected?.itemId)) continue;
    inventoryQuantities.set(
      selected.itemId,
      clamp((inventoryQuantities.get(selected.itemId) ?? 0) + numberOr(selected.quantity, 1), 1, 99),
    );
  }
  character.inventarioItens = [...inventoryQuantities].map(([itemId, quantity]) => ({ itemId, quantity }));
  character.inventario ??= "";
  character.anotacoes ??= "";
  character.pericias ??= "";

  if (isMundaneCharacter(character) || character.classe === "Mundano") {
    character.patente = "Sem patente";
  } else if (!PATENTS.includes(character.patente)) {
    character.patente = "Recruta";
  }
  return character;
}

function setInitialTrainingGrades(character) {
  for (const skill of character.periciasTreinadas ?? []) {
    if (numberOr(character.grausPericia?.[skill], 0) === 0) {
      character.grausPericia[skill] = 5;
    }
  }
}

function readCharacters() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCharacters(characters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

function upsertCharacter(character) {
  const characters = readCharacters();
  const index = characters.findIndex((item) => item.id === character.id);
  const updated = {
    ...applyDerived(normalizeCharacter(character)),
    atualizadoEm: new Date().toISOString(),
  };

  if (index >= 0) characters[index] = updated;
  else characters.push(updated);

  writeCharacters(characters);
  return updated;
}

function getCharacter(id) {
  const character = readCharacters().find((item) => item.id === id);
  return character ? applyDerived(normalizeCharacter(character)) : undefined;
}

function removeCharacter(id) {
  writeCharacters(readCharacters().filter((character) => character.id !== id));
}

function duplicateCharacter(id) {
  const original = getCharacter(id);
  if (!original) return;

  const copy = structuredClone(original);
  copy.id = crypto.randomUUID();
  copy.nome = `${copy.nome || "Agente"} — cópia`;
  copy.criadoEm = new Date().toISOString();
  upsertCharacter(copy);
  showToast("Ficha duplicada.");
  renderHome();
}

function navigate(route) {
  const nextHash = `#${route}`;
  if (window.location.hash === nextHash) renderRoute();
  else window.location.hash = nextHash;
}

function currentRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return { page: "home" };
  const [page, id] = hash.split("/");
  return { page, id };
}

function renderRoute() {
  const route = currentRoute();
  headerActions.innerHTML = "";

  if (route.page === "criar") {
    if (!creatorState) creatorState = createBlankCharacter();
    renderCreator();
  } else if (route.page === "ficha" && route.id) {
    renderSheet(route.id);
  } else {
    creatorState = null;
    levelUpState = null;
    currentStep = 0;
    renderHome();
  }

  app.focus({ preventScroll: true });
}

function renderHome() {
  const characters = readCharacters();

  headerActions.innerHTML = `
    <button class="button primary compact" id="new-character-header" type="button">+ Novo agente</button>
  `;
  document.querySelector("#new-character-header").addEventListener("click", startCreator);

  app.innerHTML = `
    <section class="page-heading">
      <div>
        <p class="eyebrow">Central de operações</p>
        <h1>Arquivo de agentes</h1>
        <p class="muted">Crie fichas, acompanhe recursos durante a sessão e mantenha tudo salvo neste aparelho.</p>
      </div>
      <button class="button primary" id="new-character-main" type="button">+ Criar agente</button>
    </section>

    ${characters.length ? renderCharacterGrid(characters) : renderEmptyState()}
  `;

  document.querySelector("#new-character-main").addEventListener("click", startCreator);
  document.querySelector("#empty-create")?.addEventListener("click", startCreator);

  document.querySelectorAll("[data-open-character]").forEach((button) => {
    button.addEventListener("click", () => navigate(`ficha/${button.dataset.openCharacter}`));
  });

  document.querySelectorAll("[data-duplicate-character]").forEach((button) => {
    button.addEventListener("click", () => duplicateCharacter(button.dataset.duplicateCharacter));
  });

  document.querySelectorAll("[data-delete-character]").forEach((button) => {
    button.addEventListener("click", () => {
      const character = getCharacter(button.dataset.deleteCharacter);
      if (!character) return;
      if (!window.confirm(`Excluir a ficha de ${character.nome || "Agente sem nome"}?`)) return;
      removeCharacter(character.id);
      showToast("Ficha excluída.");
      renderHome();
    });
  });
}

function renderEmptyState() {
  return `
    <section class="empty-state">
      <div class="empty-state-inner">
        <div class="empty-sigil" aria-hidden="true">∅</div>
        <h2>Nenhum agente registrado</h2>
        <p class="muted">Seu primeiro arquivo começa pela identidade do agente. O progresso será salvo no navegador.</p>
        <button class="button primary" id="empty-create" type="button">Iniciar primeira ficha</button>
      </div>
    </section>
  `;
}

function renderCharacterGrid(characters) {
  return `
    <section class="character-grid" aria-label="Personagens salvos">
      ${characters
        .sort((a, b) => new Date(b.atualizadoEm) - new Date(a.atualizadoEm))
        .map(
          (character) => `
            <article class="character-card">
              <div class="character-card-head">
                <div class="avatar" aria-hidden="true">${escapeHtml(initials(character.nome))}</div>
                <div>
                  <h2>${escapeHtml(character.nome || "Agente sem nome")}</h2>
                  <span class="muted small">${escapeHtml(character.jogador || "Jogador não informado")}</span>
                </div>
              </div>
              <div class="character-meta">
                <span class="badge red">NEX ${numberOr(character.nex, 0)}%</span>
                <span class="badge">Nível ${characterLevel(character)}</span>
                <span class="badge">${escapeHtml(character.classe || "Classe pendente")}</span>
                <span class="badge">${escapeHtml(character.origem || "Origem pendente")}</span>
                ${character.trilha ? `<span class="badge">${escapeHtml(character.trilha)}</span>` : ""}
              </div>
              <div class="card-actions">
                <button class="button compact" type="button" data-open-character="${character.id}">Abrir ficha</button>
                <button class="button ghost compact" type="button" data-duplicate-character="${character.id}" aria-label="Duplicar ficha">Duplicar</button>
                <button class="button danger compact" type="button" data-delete-character="${character.id}" aria-label="Excluir ficha">×</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </section>
  `;
}

function startCreator() {
  creatorState = createBlankCharacter();
  currentStep = 0;
  navigate("criar");
}

function renderCreator() {
  ensureOptionalRules(creatorState);
  headerActions.innerHTML = `
    <button class="button ghost compact" id="cancel-creator" type="button">Cancelar</button>
  `;
  document.querySelector("#cancel-creator").addEventListener("click", () => navigate("home"));

  app.innerHTML = `
    <section class="wizard-shell">
      <aside class="wizard-sidebar panel">
        <p class="eyebrow">Novo arquivo</p>
        <h2>Criação de agente</h2>
        <p class="muted small">Escolha as opções. O FOP valida e calcula o restante automaticamente.</p>
        <div class="wizard-steps">
          ${STEPS.map(
            (step, index) => `
              <div class="wizard-step ${index === currentStep ? "active" : ""} ${index < currentStep ? "done" : ""}">
                <span class="wizard-step-number">${index < currentStep ? "✓" : index + 1}</span>
                <span>${step}</span>
              </div>
            `,
          ).join("")}
        </div>
      </aside>

      <section class="wizard-content panel">
        ${renderCreatorStep()}
        <nav class="wizard-nav" aria-label="Etapas da criação">
          <button class="button ghost" id="previous-step" type="button" ${currentStep === 0 ? "disabled" : ""}>Voltar</button>
          <button class="button primary" id="next-step" type="button">${currentStep === STEPS.length - 1 ? "Salvar ficha" : "Continuar"}</button>
        </nav>
      </section>
    </section>
  `;

  bindCreatorStep();
  document.querySelector("#previous-step").addEventListener("click", () => {
    saveCreatorFields();
    currentStep = Math.max(0, currentStep - 1);
    renderCreator();
  });
  document.querySelector("#next-step").addEventListener("click", advanceCreator);
}

function renderCreatorStep() {
  if (currentStep === 0) {
    return `
      <p class="eyebrow">Etapa 1 de ${STEPS.length}</p>
      <h1>Quem é o agente?</h1>
      <p class="muted">Comece com as informações usadas para identificar a ficha na mesa.</p>
      <div class="form-grid">
        ${field("Nome do agente", "nome", creatorState.nome, "Ex.: Arthur Cervero", true)}
        ${field("Nome do jogador", "jogador", creatorState.jogador, "Ex.: Pedro")}
      </div>
    `;
  }

  if (currentStep === 1) {
    const isMundane = isMundaneCharacter(creatorState);
    return `
      <p class="eyebrow">Etapa 2 de ${STEPS.length}</p>
      <h1>Formação</h1>
      <p class="muted">Cada 5% de NEX equivale a um nível. Em 0%, o personagem é Mundano.</p>
      <div class="form-grid">
        <div class="field">
          <label for="origem">Origem</label>
          <select id="origem" name="origem">
            ${renderOriginOptions(creatorState.origem)}
          </select>
        </div>
        ${renderNexPicker()}
        ${
          isMundane
            ? `<div class="field"><span class="field-label">Classe</span><div class="locked-value">Mundano <small>NEX 0%</small></div></div>`
            : `<div class="field"><label for="classe">Classe</label><select id="classe" name="classe">${selectOptions(["", "Combatente", "Especialista", "Ocultista"], creatorState.classe, "Selecione")}</select></div>`
        }
        ${isMundane ? "" : renderPatentField(creatorState.patente)}
        ${renderTrailField()}
      </div>
      ${renderOriginPreview(creatorState.origem)}
    `;
  }

  if (currentStep === 2) {
    const pointsToDistribute = attributeTarget(
      creatorState.nex,
      usesSeparateLevel(creatorState),
    ) - 5;
    return `
      <p class="eyebrow">Etapa 3 de ${STEPS.length}</p>
      <h1>Atributos</h1>
      <p class="muted">Todos começam com 1 em cada atributo. Neste NEX, você distribui ${pointsToDistribute} pontos. É possível reduzir um atributo para 0 e aproveitar esse ponto em outro.</p>
      ${renderAttributeBudget()}
      <div class="attribute-grid">
        ${Object.entries(ATTRIBUTE_LABELS)
          .map(
            ([key, label]) => `
              <div class="attribute-control">
                <strong>${label}</strong>
                <input class="attribute-number" id="attr-${key}" inputmode="numeric" type="number" min="0" max="${ATTRIBUTE_MAX_AT_CREATION}" value="${numberOr(creatorState.atributos[key], 1)}" aria-label="${label}" readonly />
                <div class="stepper">
                  <button type="button" data-attribute="${key}" data-delta="-1" aria-label="Diminuir ${label}">−</button>
                  <button type="button" data-attribute="${key}" data-delta="1" aria-label="Aumentar ${label}">+</button>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  }

  if (currentStep === 3) {
    return renderSkillStep();
  }

  if (currentStep === 4) {
    const derived = calculateDerived(creatorState);
    return `
      <p class="eyebrow">Etapa 5 de ${STEPS.length}</p>
      <h1>Recursos principais</h1>
      <p class="muted">Estes valores foram calculados usando classe, NEX e atributos. Na ficha, apenas os valores atuais mudam durante a sessão.</p>
      <div class="resource-grid">
        ${calculatedResource("PV", derived.pvMax)}
        ${
          derived.usesDetermination
            ? calculatedResource("PD", derived.pdMax)
            : `${calculatedResource("PE", derived.peMax)}${calculatedResource("SAN", derived.sanMax)}`
        }
      </div>
      <div class="calculation-box">
        ${renderCalculationBreakdown()}
      </div>
    `;
  }

  return `
    <p class="eyebrow">Etapa 6 de ${STEPS.length}</p>
    <h1>Revisar arquivo</h1>
    <p class="muted">Confira as informações principais. Depois de salvar, todos os campos de sessão continuarão editáveis.</p>
    <div class="review-list">
      ${reviewRow("Agente", creatorState.nome || "Sem nome")}
      ${reviewRow("Jogador", creatorState.jogador || "Não informado")}
      ${reviewRow("Formação", `${creatorState.origem || "Origem pendente"} · ${creatorState.classe || "Classe pendente"}${creatorState.trilha ? ` · ${creatorState.trilha}` : ""}`)}
      ${reviewRow("Progressão", `Nível ${characterLevel(creatorState)} · NEX ${numberOr(creatorState.nex, 0)}% · ${creatorState.patente || "Sem patente"}`)}
      ${reviewRow("Perícias treinadas", creatorState.periciasTreinadas?.join(", ") || "Nenhuma")}
      ${reviewRow("Recursos", resourceSummary(creatorState))}
    </div>
  `;
}

function bindCreatorStep() {
  document.querySelectorAll("[data-attribute]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(`#attr-${button.dataset.attribute}`);
      const key = button.dataset.attribute;
      const delta = Number(button.dataset.delta);
      const budget = attributeBudget(
        readAttributeInputs(),
        creatorState.nex,
        usesSeparateLevel(creatorState),
      );
      const current = numberOr(input.value, 0);
      const next = clamp(current + delta, 0, ATTRIBUTE_MAX_AT_CREATION);
      if (delta > 0 && budget.remaining <= 0) {
        showToast("Você já distribuiu todos os pontos.");
        return;
      }
      if (next === 0) {
        const anotherZero = Object.entries(readAttributeInputs()).some(
          ([attribute, value]) => attribute !== key && value === 0,
        );
        if (anotherZero) {
          showToast("Apenas um atributo pode ser reduzido para 0.");
          return;
        }
      }
      input.value = String(next);
      creatorState.atributos[key] = next;
      updateAttributeBudget();
    });
  });

  if (currentStep === 1) {
    document.querySelector("#origem")?.addEventListener("change", () => {
      saveCreatorFields();
      renderCreator();
    });
    document.querySelector("#classe")?.addEventListener("change", () => {
      saveCreatorFields();
      creatorState.trilha = "";
      renderCreator();
    });
    document.querySelectorAll("[data-nex-delta]").forEach((button) => {
      button.addEventListener("click", () => {
        const delta = Number(button.dataset.nexDelta);
        saveCreatorFields();
        setCreatorNex(clamp(numberOr(creatorState.nex, 0) + delta, 0, 100));
        renderCreator();
      });
    });
  }

  if (currentStep === 3) {
    document.querySelectorAll("[data-origin-skill]").forEach((input) => {
      input.addEventListener("change", () => {
        updateSkillArray("periciasOrigemEscolhidas", input.value, input.checked);
        renderCreator();
      });
    });
    document.querySelectorAll("[data-class-skill]").forEach((input) => {
      input.addEventListener("change", () => {
        updateSkillArray("periciasEscolhidas", input.value, input.checked);
        renderCreator();
      });
    });
    document.querySelectorAll("[data-skill-group]").forEach((input) => {
      input.addEventListener("change", () => {
        const index = Number(input.dataset.skillGroup);
        creatorState.periciasClasseObrigatorias[index] = input.value;
        skillSelectionStatus(creatorState);
        renderCreator();
      });
    });
  }
}

function setCreatorNex(nex) {
  creatorState.nex = Math.round(nex / 5) * 5;
  if (usesSeparateLevel(creatorState)) {
    creatorState.nivel = clamp(numberOr(creatorState.nivel, 1), 1, 20);
    if (creatorState.classe === "Mundano") creatorState.classe = "";
    if (!creatorState.patente || creatorState.patente === "Sem patente") {
      creatorState.patente = "Recruta";
    }
  } else if (creatorState.nex === 0) {
    creatorState.classe = "Mundano";
    creatorState.nivel = 0;
    creatorState.trilha = "";
    creatorState.patente = "Sem patente";
    creatorState.optionalRules.determination = false;
  } else {
    creatorState.nivel = levelFromNex(creatorState.nex);
    if (creatorState.classe === "Mundano") creatorState.classe = "";
    if (!creatorState.patente || creatorState.patente === "Sem patente") {
      creatorState.patente = "Recruta";
    }
    if (creatorState.nex < 10) creatorState.trilha = "";
  }
  creatorState.periciasOrigemEscolhidas = [];
  creatorState.periciasClasseObrigatorias = [];
  creatorState.periciasEscolhidas = [];
  skillSelectionStatus(creatorState);
}

function updateSkillArray(key, skill, checked) {
  const current = new Set(creatorState[key] ?? []);
  if (checked) current.add(skill);
  else current.delete(skill);
  creatorState[key] = [...current];
  skillSelectionStatus(creatorState);
}

function advanceCreator() {
  saveCreatorFields();
  if (currentStep === 0 && !creatorState.nome.trim()) {
    showToast("Informe o nome do agente para continuar.");
    document.querySelector("#nome")?.focus();
    return;
  }

  if (currentStep === 1 && (!creatorState.origem || !creatorState.classe)) {
    showToast("Escolha a origem e a classe para continuar.");
    return;
  }

  if (
    currentStep === 2 &&
    !attributeBudget(
      creatorState.atributos,
      creatorState.nex,
      usesSeparateLevel(creatorState),
    ).valid
  ) {
    showToast("Distribua todos os pontos antes de continuar.");
    return;
  }

  if (currentStep === 3 && !skillSelectionStatus(creatorState).complete) {
    showToast("Complete todas as escolhas de perícias para continuar.");
    return;
  }

  if (currentStep < STEPS.length - 1) {
    currentStep += 1;
    renderCreator();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  setInitialTrainingGrades(creatorState);
  const saved = upsertCharacter(creatorState);
  showToast("Ficha criada e salva neste dispositivo.");
  creatorState = null;
  currentStep = 0;
  navigate(`ficha/${saved.id}`);
}

function saveCreatorFields() {
  if (!creatorState) return;

  const value = (id) => document.querySelector(`#${id}`)?.value;

  if (currentStep === 0) {
    creatorState.nome = value("nome")?.trim() || creatorState.nome;
    creatorState.jogador = value("jogador")?.trim() || "";
  }

  if (currentStep === 1) {
    creatorState.origem = value("origem")?.trim() || "";
    creatorState.nex = clamp(numberOr(value("nex"), creatorState.nex), 0, 100);
    creatorState.nivel = usesSeparateLevel(creatorState)
      ? clamp(numberOr(value("nivel"), creatorState.nivel), 1, 20)
      : levelFromNex(creatorState.nex);
    if (isMundaneCharacter(creatorState)) {
      creatorState.classe = "Mundano";
      creatorState.trilha = "";
      creatorState.patente = "Sem patente";
    } else {
      creatorState.classe = value("classe") || "";
      creatorState.trilha = value("trilha") || "";
      creatorState.patente = PATENTS.includes(value("patente"))
        ? value("patente")
        : "Recruta";
    }
  }

  if (currentStep === 2) {
    Object.keys(ATTRIBUTE_LABELS).forEach((key) => {
      creatorState.atributos[key] = clamp(
        numberOr(value(`attr-${key}`), 1),
        0,
        ATTRIBUTE_MAX_AT_CREATION,
      );
    });
    applyDerived(creatorState, true);
  }

  if (currentStep === 4) {
    applyDerived(creatorState, true);
  }
}

const SHEET_TABS = [
  ["resumo", "Resumo"],
  ["pericias", "Perícias"],
  ["habilidades", "Habilidades"],
  ["rituais", "Rituais"],
  ["inventario", "Inventário"],
  ["anotacoes", "Anotações"],
];

function renderSheet(id) {
  const character = getCharacter(id);
  if (!character) {
    showToast("Ficha não encontrada.");
    navigate("home");
    return;
  }
  if (levelUpState && levelUpState.characterId !== character.id) levelUpState = null;
  const atLevelCap = characterLevel(character) >= LEVEL_CAP;

  headerActions.innerHTML = `
    <button class="button ghost compact" id="back-home" type="button">Arquivos</button>
    <button class="button compact" id="edit-core" type="button">Editar nome</button>
    <button class="button primary compact" id="start-level-up" type="button" ${atLevelCap ? "disabled" : ""}>${atLevelCap ? "Nível máximo" : "↑ Subir nível"}</button>
  `;

  app.innerHTML = `
    <section class="sheet-layout">
      <aside class="sheet-sidebar panel">
        <div class="agent-identity">
          <p class="eyebrow">Arquivo ativo</p>
          <h1>${escapeHtml(character.nome || "Agente sem nome")}</h1>
          <p class="muted">${escapeHtml(character.jogador || "Jogador não informado")}</p>
          <div class="badge-row">
            <span class="badge red">NEX ${numberOr(character.nex, 0)}%</span>
            <span class="badge">Nível ${characterLevel(character)}</span>
            <span class="badge">${escapeHtml(character.classe || "Sem classe")}</span>
            <span class="badge">${escapeHtml(character.origem || "Sem origem")}</span>
            ${character.trilha ? `<span class="badge">${escapeHtml(character.trilha)}</span>` : ""}
          </div>
        </div>

        <div class="sheet-resources">
          ${liveResource("PV", "pv", character.recursos.pvAtual, character.recursos.pvMax)}
          ${
            calculateDerived(character).usesDetermination
              ? liveResource("PD", "pd", character.recursos.pdAtual, character.recursos.pdMax)
              : `${liveResource("PE", "pe", character.recursos.peAtual, character.recursos.peMax)}${liveResource("SAN", "san", character.recursos.sanAtual, character.recursos.sanMax)}`
          }
        </div>

        <div class="status-line"><span class="status-dot"></span> Salvo neste dispositivo</div>
        <button class="sheet-supplement-button" id="optional-rules-button" type="button">
          <span class="supplement-sigil" aria-hidden="true">S</span>
          <span><strong>Sobrevivendo ao Horror</strong><small>Regras opcionais</small></span>
        </button>
      </aside>

      <section class="sheet-main panel">
        <nav class="sheet-tabs" aria-label="Seções da ficha">
          ${SHEET_TABS.map(
            ([key, label]) => `<button type="button" data-sheet-tab="${key}" class="${activeSheetTab === key ? "active" : ""}" aria-current="${activeSheetTab === key ? "page" : "false"}">${label}</button>`,
          ).join("")}
        </nav>
        <div class="sheet-tab-content">${renderSheetTab(character)}</div>
      </section>
    </section>
    ${renderOptionalRulesDialog(character)}
    ${renderAbilityDialog(character)}
    ${renderRitualDialog(character)}
    ${renderItemDialog(character)}
    ${renderLevelUpDialog(character)}
  `;

  bindSheetInteractions(character);
}

function renderSheetTab(character) {
  if (activeSheetTab === "pericias") return renderSkillsTab(character);
  if (activeSheetTab === "habilidades") return renderAbilitiesTab(character);
  if (activeSheetTab === "rituais") return renderRitualsTab(character);
  if (activeSheetTab === "inventario") return renderInventoryTab(character);
  if (activeSheetTab === "anotacoes") {
    return notesSection(
      "Anotações",
      "anotacoes",
      character.anotacoes,
      "Pistas, contatos e lembretes da sessão.",
    );
  }
  return renderSummaryTab(character);
}

function renderSummaryTab(character) {
  const isMundane = isMundaneCharacter(character) || character.classe === "Mundano";
  return `
    <div class="sheet-section">
      <div class="section-heading"><h2>Atributos</h2><span class="muted small">Valores atuais</span></div>
      <div class="sheet-attributes">
        ${Object.entries(ATTRIBUTE_LABELS)
          .map(
            ([key, label]) => `<div class="sheet-attribute"><span>${label}</span><strong>${numberOr(character.atributos[key], 1)}</strong></div>`,
          )
          .join("")}
      </div>
    </div>

    <div class="sheet-section">
      <div class="section-heading"><h2>Formação</h2><span class="muted small">Seleções da ficha</span></div>
      <div class="formation-grid">
        ${statCard("Origem", character.origem || "—")}
        ${statCard("Classe", character.classe || "—")}
        ${statCard("Trilha", character.trilha || "Ainda não escolhida")}
      </div>
      ${renderOriginDetail(character.origem)}
      <div class="patent-row">
        <label for="sheet-patent">Patente</label>
        ${
          isMundane
            ? `<div class="locked-value">Sem patente <small>Mundano</small></div>`
            : `<select id="sheet-patent" data-patent-select>${PATENTS.map((patent) => `<option value="${escapeAttribute(patent)}" ${patent === character.patente ? "selected" : ""}>${escapeHtml(patent)}</option>`).join("")}</select>`
        }
      </div>
    </div>

    ${renderAutomaticBenefits(character)}

    <div class="sheet-section">
      <div class="section-heading"><h2>Combate</h2></div>
      <div class="stat-grid">
        ${statCard("Defesa", character.defesa)}
        ${statCard("Deslocamento", `${character.deslocamento} m`)}
        ${statCard("Proteção", character.protecao || "Nenhuma")}
      </div>
    </div>
  `;
}

function renderSkillsTab(character) {
  return `
    <section class="sheet-section skills-section">
      <div class="section-heading stacked-mobile">
        <div><h2>Perícias</h2><p class="muted small">O bônus soma treino e outros modificadores. As perícias escolhidas na criação começam em +5.</p></div>
        <span class="badge">Automático</span>
      </div>
      <div class="skills-table-wrap">
        <table class="skills-table">
          <thead><tr><th>Perícia</th><th>Dados</th><th>Bônus</th><th>Treino</th><th>Outros</th></tr></thead>
          <tbody>
            ${SKILLS.map((skill) => renderSkillRow(character, skill)).join("")}
          </tbody>
        </table>
      </div>
    </section>
    ${notesSection("Observações de perícias", "pericias", character.pericias, "Especializações, condições e bônus temporários.")}
  `;
}

function renderSkillRow(character, skill) {
  const attribute = SKILL_ATTRIBUTES[skill] ?? "INT";
  const dice = skillAttributeValue(character, attribute);
  const grade = numberOr(character.grausPericia?.[skill], 0);
  const other = numberOr(character.outrosBonusPericia?.[skill], 0);
  const total = grade + other;
  return `
    <tr class="skill-rank-${grade}">
      <th scope="row"><span class="skill-die" aria-hidden="true">◇</span>${escapeHtml(skill)}</th>
      <td><span class="skill-attribute">${attribute}</span><small>${dice === 0 ? "2d20 ↓" : `${dice}d20`}</small></td>
      <td class="skill-total" data-skill-total="${escapeAttribute(skill)}">${formatSigned(total)}</td>
      <td>
        <select class="skill-grade" data-skill-grade="${escapeAttribute(skill)}" aria-label="Treino de ${escapeAttribute(skill)}">
          ${[
            [0, "0 · Destreinado"],
            [5, "5 · Treinado"],
            [10, "10 · Veterano"],
            [15, "15 · Expert"],
          ].map(([value, label]) => `<option value="${value}" ${grade === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </td>
      <td><input class="skill-other" type="number" min="-99" max="99" value="${other}" data-skill-other="${escapeAttribute(skill)}" aria-label="Outros bônus de ${escapeAttribute(skill)}" /></td>
    </tr>
  `;
}

function skillAttributeValue(character, label) {
  const key = Object.entries(ATTRIBUTE_LABELS).find(([, abbreviation]) => abbreviation === label)?.[0];
  return key ? numberOr(character.atributos?.[key], 0) : 0;
}

function formatSigned(value) {
  const number = numberOr(value, 0);
  return number > 0 ? `+${number}` : String(number);
}

function automaticAbilitiesFor(character) {
  const progressNex = usesSeparateLevel(character)
    ? characterLevel(character) * 5
    : numberOr(character.nex, 0);
  const originAbility = ALL_ABILITIES.find(
    (entry) => entry.category === "Origens" && entry.group === character.origem,
  );
  const classAbilities = CORE_CLASS_ABILITIES.filter(
    (entry) => entry.category === character.classe && entry.unlockNex <= progressNex,
  );
  const trailAbilities = TRAIL_ABILITIES.filter(
    (entry) =>
      entry.category === character.classe &&
      entry.group === character.trilha &&
      entry.unlockNex <= progressNex,
  );
  return uniqueById([originAbility, ...classAbilities, ...trailAbilities].filter(Boolean));
}

function renderAbilitiesTab(character) {
  const automatic = automaticAbilitiesFor(character);
  const automaticIds = new Set(automatic.map((entry) => entry.id));
  const selected = (character.habilidadesSelecionadas ?? [])
    .map((id) => ABILITY_BY_ID.get(id))
    .filter((entry) => entry && !automaticIds.has(entry.id));
  return `
    <section class="sheet-section">
      <div class="section-heading stacked-mobile">
        <div><h2>Habilidades</h2><p class="muted small">Poderes de origem e habilidades liberadas da trilha entram sozinhos.</p></div>
        <button class="button primary compact" id="open-ability-picker" type="button">+ Adicionar habilidade</button>
      </div>
      <div class="collection-block">
        <h3>Automáticas <span class="badge">${automatic.length}</span></h3>
        <div class="entry-list">${automatic.length ? automatic.map((entry) => renderAbilityCard(entry, { automatic: true })).join("") : emptyCollection("Nenhuma habilidade automática neste nível.")}</div>
      </div>
      <div class="collection-block">
        <h3>Adicionadas <span class="badge">${selected.length}</span></h3>
        <div class="entry-list">${selected.length ? selected.map((entry) => renderAbilityCard(entry, { removable: true })).join("") : emptyCollection("Use “Adicionar habilidade” para escolher poderes e habilidades de trilha.")}</div>
      </div>
    </section>
    ${notesSection("Notas de habilidades", "habilidadesNotas", character.habilidadesNotas, "Escolhas, alvos, afinidades e lembretes de uso.")}
  `;
}

function renderAbilityCard(entry, { automatic = false, removable = false, picker = false } = {}) {
  const action = picker
    ? renderAbilityPickerAction(entry)
    : removable
      ? `<button class="entry-remove" type="button" data-ability-toggle="${entry.id}">Remover</button>`
      : "";
  return `
    <details class="entry-card">
      <summary>
        <span><strong>${escapeHtml(entry.name)}</strong><small>${escapeHtml(entry.group)}</small></span>
        <span class="entry-summary-side">${automatic ? `<span class="badge red">Automática</span>` : entry.unlockNex ? `<span class="badge">NEX ${entry.unlockNex}%</span>` : ""}<span class="chevron" aria-hidden="true">⌄</span></span>
      </summary>
      <div class="entry-body">
        <p>${escapeHtml(entry.summary)}</p>
        ${entry.details?.length ? `<ul class="entry-details">${entry.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>` : ""}
        <dl class="entry-meta">
          <div><dt>Custo</dt><dd>${escapeHtml(entry.cost)}</dd></div>
          <div><dt>Requisito</dt><dd>${escapeHtml(entry.requirement)}</dd></div>
          <div><dt>Fonte</dt><dd>${escapeHtml(entry.source)}${entry.page ? ` · p. ${escapeHtml(entry.page)}` : ""}</dd></div>
        </dl>
        ${action}
      </div>
    </details>
  `;
}

function renderAbilityDialog(character) {
  const categoryEntries = ALL_ABILITIES.filter(
    (entry) => entry.category === activeAbilityCategory,
  );
  const groups = [...new Set(categoryEntries.map((entry) => entry.group))];
  if (!groups.includes(activeAbilityGroup)) activeAbilityGroup = groups[0] ?? "";
  return `
    <dialog class="picker-dialog" id="ability-dialog" aria-labelledby="ability-dialog-title">
      <div class="dialog-heading">
        <div><p class="eyebrow">Catálogo</p><h2 id="ability-dialog-title">Adicionar habilidade</h2></div>
        <button class="dialog-close" id="close-ability-dialog" type="button" aria-label="Fechar">×</button>
      </div>
      <div class="picker-body">
        <div class="picker-tabs" role="tablist" aria-label="Categorias de habilidades">
          ${ABILITY_CATEGORIES.map((category) => `<button type="button" data-ability-category="${escapeAttribute(category)}" class="${category === activeAbilityCategory ? "active" : ""}">${escapeHtml(category)}</button>`).join("")}
        </div>
        <div class="picker-groups">
          ${groups.map((group) => `<button type="button" data-ability-group="${escapeAttribute(group)}" class="${group === activeAbilityGroup ? "active" : ""}">${escapeHtml(group)}</button>`).join("")}
        </div>
        <label class="picker-search"><span aria-hidden="true">⌕</span><input id="ability-search" value="${escapeAttribute(abilitySearch)}" placeholder="Buscar habilidade" autocomplete="off" /></label>
        <p class="catalog-note">Resumo mecânico em redação própria. Abra a seta para conferir custo, requisito, efeito e fonte.</p>
        <div class="picker-results" id="ability-picker-results">${renderAbilityPickerResults(character)}</div>
      </div>
    </dialog>
  `;
}

function renderAbilityPickerResults(character) {
  const query = normalizeSearch(abilitySearch);
  const entries = ALL_ABILITIES.filter(
    (entry) =>
      entry.category === activeAbilityCategory &&
      (!activeAbilityGroup || entry.group === activeAbilityGroup) &&
      (!query || normalizeSearch(`${entry.name} ${entry.summary} ${entry.group}`).includes(query)),
  );
  return entries.length
    ? entries.map((entry) => renderAbilityCard(entry, { picker: true })).join("")
    : emptyCollection("Nenhuma habilidade encontrada neste filtro.");
}

function renderAbilityPickerAction(entry) {
  const route = currentRoute();
  const character = route.page === "ficha" ? getCharacter(route.id) : null;
  if (!character) return "";
  const automatic = new Set(automaticAbilitiesFor(character).map((item) => item.id));
  if (automatic.has(entry.id)) return `<button class="button compact" type="button" disabled>Já automática</button>`;
  const selected = character.habilidadesSelecionadas.includes(entry.id);
  return `<button class="button ${selected ? "ghost" : "primary"} compact" type="button" data-ability-toggle="${entry.id}">${selected ? "Remover da ficha" : "+ Adicionar"}</button>`;
}

function renderRitualsTab(character) {
  const selected = (character.rituaisSelecionados ?? [])
    .map((id) => RITUAL_BY_ID.get(id))
    .filter(Boolean)
    .sort((a, b) => a.circle - b.circle || a.element.localeCompare(b.element) || a.name.localeCompare(b.name));
  return `
    <section class="sheet-section">
      <div class="section-heading stacked-mobile">
        <div><h2>Rituais</h2><p class="muted small">Catálogo oficial do 1º ao 4º círculo, separado por elemento.</p></div>
        <button class="button primary compact" id="open-ritual-picker" type="button">+ Adicionar ritual</button>
      </div>
      <div class="entry-list ritual-selected-list">
        ${selected.length ? selected.map((entry) => renderRitualCard(entry, { removable: true })).join("") : emptyCollection("Nenhum ritual adicionado à ficha.")}
      </div>
    </section>
    ${notesSection("Notas de rituais", "rituaisNotas", character.rituaisNotas, "DT, aprimoramentos, componentes e lembretes.")}
  `;
}

function renderRitualCard(entry, { removable = false, picker = false } = {}) {
  const selectedCharacter = currentRoute().page === "ficha" ? getCharacter(currentRoute().id) : null;
  const selected = Boolean(selectedCharacter?.rituaisSelecionados?.includes(entry.id));
  const action = picker
    ? `<button class="button ${selected ? "ghost" : "primary"} compact" type="button" data-ritual-toggle="${entry.id}">${selected ? "Remover da ficha" : "+ Adicionar"}</button>`
    : removable
      ? `<button class="entry-remove" type="button" data-ritual-toggle="${entry.id}">Remover</button>`
      : "";
  return `
    <details class="entry-card ritual-card element-${normalizeSearch(entry.element)}">
      <summary>
        <span><strong>${escapeHtml(entry.name)}</strong><small>${escapeHtml(ritualElementLabel(entry))} · ${entry.circle}º círculo</small></span>
        <span class="entry-summary-side"><span class="badge">${escapeHtml(entry.cost)}</span><span class="chevron" aria-hidden="true">⌄</span></span>
      </summary>
      <div class="entry-body">
        <p>${escapeHtml(entry.summary)}</p>
        ${entry.details?.length ? `<ul class="entry-details">${entry.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>` : ""}
        <dl class="entry-meta">
          <div><dt>Círculo</dt><dd>${entry.circle}º</dd></div>
          <div><dt>Custo-base</dt><dd>${escapeHtml(entry.cost)}</dd></div>
          ${entry.execution ? `<div><dt>Execução</dt><dd>${escapeHtml(entry.execution)}</dd></div>` : ""}
          ${entry.range ? `<div><dt>Alcance</dt><dd>${escapeHtml(entry.range)}</dd></div>` : ""}
          ${entry.target ? `<div><dt>Alvo/área</dt><dd>${escapeHtml(entry.target)}</dd></div>` : ""}
          ${entry.duration ? `<div><dt>Duração</dt><dd>${escapeHtml(entry.duration)}</dd></div>` : ""}
          ${entry.resistance ? `<div><dt>Resistência</dt><dd>${escapeHtml(entry.resistance)}</dd></div>` : ""}
          ${entry.requirement ? `<div><dt>Requisito</dt><dd>${escapeHtml(entry.requirement)}</dd></div>` : ""}
          <div><dt>Fonte</dt><dd>${escapeHtml(entry.source)}${entry.page ? ` · p. ${escapeHtml(entry.page)}` : ""}</dd></div>
        </dl>
        ${entry.enhancements?.length ? `<div class="ritual-enhancements"><strong>Aprimoramentos</strong><ul>${entry.enhancements.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul></div>` : ""}
        ${action}
      </div>
    </details>
  `;
}

function renderRitualDialog(character) {
  return `
    <dialog class="picker-dialog" id="ritual-dialog" aria-labelledby="ritual-dialog-title">
      <div class="dialog-heading">
        <div><p class="eyebrow">Catálogo</p><h2 id="ritual-dialog-title">Adicionar ritual</h2></div>
        <button class="dialog-close" id="close-ritual-dialog" type="button" aria-label="Fechar">×</button>
      </div>
      <div class="picker-body">
        <div class="picker-tabs compact-tabs" role="tablist" aria-label="Círculos de ritual">
          ${RITUAL_CIRCLES.map((circle) => `<button type="button" data-ritual-circle="${circle}" class="${circle === activeRitualCircle ? "active" : ""}">${circle}º círculo</button>`).join("")}
        </div>
        <div class="picker-groups element-groups">
          ${RITUAL_ELEMENTS.map((element) => `<button type="button" data-ritual-element="${escapeAttribute(element)}" class="${element === activeRitualElement ? "active" : ""}">${escapeHtml(element)}</button>`).join("")}
        </div>
        <label class="picker-search"><span aria-hidden="true">⌕</span><input id="ritual-search" value="${escapeAttribute(ritualSearch)}" placeholder="Buscar ritual" autocomplete="off" /></label>
        <p class="catalog-note">Resumo mecânico em redação própria. O valor exibido é o custo-base do ${activeRitualCircle}º círculo; versões Discente e Verdadeiro podem alterar custo e efeito.</p>
        <div class="picker-results" id="ritual-picker-results">${renderRitualPickerResults(character)}</div>
      </div>
    </dialog>
  `;
}

function renderRitualPickerResults() {
  const query = normalizeSearch(ritualSearch);
  const entries = RITUALS.filter(
    (entry) =>
      entry.circle === activeRitualCircle &&
      (entry.elements ?? [entry.element]).includes(activeRitualElement) &&
      (!query || normalizeSearch(`${entry.name} ${entry.summary}`).includes(query)),
  );
  return entries.length
    ? entries.map((entry) => renderRitualCard(entry, { picker: true })).join("")
    : emptyCollection("Nenhum ritual encontrado neste círculo e elemento.");
}

function inventorySelections(character) {
  return (character.inventarioItens ?? [])
    .map((selected) => ({ ...selected, item: ITEM_BY_ID.get(selected.itemId) }))
    .filter((selected) => selected.item)
    .sort((a, b) =>
      a.item.group.localeCompare(b.item.group) || a.item.name.localeCompare(b.item.name),
    );
}

function formatInventoryNumber(value) {
  return Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

function renderInventoryTab(character) {
  const usage = inventoryUsage(character);
  const selected = inventorySelections(character);
  const limits = PATENT_ITEM_LIMITS[character.patente];
  const capacityState = usage.spaces > usage.capacity * 2
    ? "blocked"
    : usage.overloaded
      ? "warning"
      : "complete";
  return `
    <section class="sheet-section inventory-section">
      <div class="section-heading stacked-mobile">
        <div><h2>Inventário</h2><p class="muted small">Escolha o equipamento; espaços e categorias são somados automaticamente.</p></div>
        <button class="button primary compact" id="open-item-picker" type="button">+ Adicionar item</button>
      </div>
      <div class="inventory-overview">
        <div class="inventory-capacity ${capacityState}"><span>Espaços ocupados</span><strong>${formatInventoryNumber(usage.spaces)} / ${formatInventoryNumber(usage.capacity)}</strong><small>${usage.spaces > usage.capacity * 2 ? "Acima do limite máximo" : usage.overloaded ? "Sobrecarregado" : `${usage.quantity} item(ns)`}</small></div>
        <div class="inventory-category-summary">
          <span>Itens por categoria · ${escapeHtml(character.patente || "Sem patente")}</span>
          ${limits
            ? `<div>${["I", "II", "III", "IV"].map((category) => { const used = usage.categoryCounts[category]; const limit = limits[category]; return `<span class="category-usage ${used > limit ? "over" : ""}"><b>${category}</b> ${used}/${limit}</span>`; }).join("")}</div>`
            : `<small>Personagens Mundanos combinam o equipamento disponível com o mestre.</small>`}
        </div>
      </div>
      <div class="entry-list inventory-list">
        ${selected.length
          ? selected.map((selectedItem) => renderItemCard(selectedItem.item, { quantity: selectedItem.quantity })).join("")
          : emptyCollection("Nenhum item adicionado. Use “Adicionar item” para abrir o catálogo.")}
      </div>
    </section>
    ${notesSection("Notas do inventário", "inventario", character.inventario, "Modificações, munição restante, itens de missão e observações.")}
  `;
}

function renderItemCard(item, { picker = false, quantity = 0 } = {}) {
  const totalSpaces = item.spaces * Math.max(1, quantity || 1);
  const action = picker
    ? renderItemPickerAction(item)
    : `<div class="inventory-item-actions">
        <div class="quantity-stepper" aria-label="Quantidade de ${escapeAttribute(item.name)}">
          <button type="button" data-item-quantity="${item.id}" data-item-delta="-1" ${quantity <= 1 ? "disabled" : ""} aria-label="Diminuir quantidade">−</button>
          <output>${quantity}</output>
          <button type="button" data-item-quantity="${item.id}" data-item-delta="1" ${quantity >= 99 ? "disabled" : ""} aria-label="Aumentar quantidade">+</button>
        </div>
        <button class="entry-remove" type="button" data-item-remove="${item.id}">Remover</button>
      </div>`;
  return `
    <details class="entry-card item-card">
      <summary>
        <span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.group)} · ${escapeHtml(item.source)}</small></span>
        <span class="entry-summary-side"><span class="badge">Cat. ${escapeHtml(item.category)}</span><span class="badge">${formatInventoryNumber(item.spaces)} espaço(s)</span><span class="chevron" aria-hidden="true">⌄</span></span>
      </summary>
      <div class="entry-body">
        <p>${escapeHtml(item.summary)}</p>
        ${item.details?.length ? `<dl class="item-stat-grid">${item.details.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>` : ""}
        <dl class="entry-meta">
          <div><dt>Categoria</dt><dd>${escapeHtml(item.category)}</dd></div>
          <div><dt>Espaços</dt><dd>${formatInventoryNumber(item.spaces)}${quantity > 1 ? ` cada · ${formatInventoryNumber(totalSpaces)} no total` : ""}</dd></div>
          <div><dt>Fonte</dt><dd>${escapeHtml(item.source)}${item.page ? ` · p. ${escapeHtml(item.page)}` : ""}</dd></div>
        </dl>
        ${action}
      </div>
    </details>
  `;
}

function renderItemPickerAction(item) {
  const route = currentRoute();
  const character = route.page === "ficha" ? getCharacter(route.id) : null;
  const quantity = character?.inventarioItens?.find((selected) => selected.itemId === item.id)?.quantity ?? 0;
  return `<button class="button primary compact" type="button" data-item-add="${item.id}">${quantity ? `+1 · já possui ${quantity}` : "+ Adicionar"}</button>`;
}

function renderItemDialog(character) {
  const sources = ["Todos", ...new Set(ITEMS.map((item) => item.source))];
  return `
    <dialog class="picker-dialog" id="item-dialog" aria-labelledby="item-dialog-title">
      <div class="dialog-heading">
        <div><p class="eyebrow">Equipamentos</p><h2 id="item-dialog-title">Adicionar item</h2></div>
        <button class="dialog-close" id="close-item-dialog" type="button" aria-label="Fechar">×</button>
      </div>
      <div class="picker-body">
        <div class="picker-tabs item-group-tabs" role="tablist" aria-label="Categorias de itens">
          ${INVENTORY_GROUPS.map((group) => `<button type="button" data-item-group="${escapeAttribute(group)}" class="${group === activeItemGroup ? "active" : ""}">${escapeHtml(group)}</button>`).join("")}
        </div>
        <div class="item-filter-row">
          <label class="picker-search"><span aria-hidden="true">⌕</span><input id="item-search" value="${escapeAttribute(itemSearch)}" placeholder="Buscar item" autocomplete="off" /></label>
          <label class="item-source-filter"><span>Fonte</span><select id="item-source">${sources.map((source) => `<option value="${escapeAttribute(source)}" ${source === activeItemSource ? "selected" : ""}>${escapeHtml(source)}</option>`).join("")}</select></label>
        </div>
        <p class="catalog-note">Resumos mecânicos em redação própria. Abra a seta para ver estatísticas, efeito e referência.</p>
        <div class="picker-results" id="item-picker-results">${renderItemPickerResults(character)}</div>
      </div>
    </dialog>
  `;
}

function renderItemPickerResults() {
  const query = normalizeSearch(itemSearch);
  const entries = ITEMS.filter(
    (item) =>
      item.group === activeItemGroup &&
      (activeItemSource === "Todos" || item.source === activeItemSource) &&
      (!query || normalizeSearch(`${item.name} ${item.summary} ${item.source} ${item.details.flat().join(" ")}`).includes(query)),
  );
  return entries.length
    ? entries.map((item) => renderItemCard(item, { picker: true })).join("")
    : emptyCollection("Nenhum item encontrado neste filtro.");
}

const LEVEL_UP_STEPS = ["Progressão", "Ganhos", "Escolhas", "Revisão"];

function startLevelUp(character) {
  const plan = createLevelUpPlan(character);
  if (!plan) return showToast("Este agente já chegou ao nível 20.");
  levelUpState = {
    characterId: character.id,
    step: 0,
    targetClass: plan.firstAgentLevel ? "" : character.classe,
    targetTrail: character.trilha || "",
    attribute: "",
    intellectSkill: "",
    gradeUpgrades: [],
    classPowerId: "",
    paranormalPowerId: "",
    powerTrainingSkills: [],
    versatilityId: "",
    ritualIds: [],
    classGroupSkills: [],
    classFreeSkills: plan.firstAgentLevel ? [...(character.periciasEscolhidas ?? [])] : [],
    peritoSkills: [...(character.peritoPericias ?? [])],
  };
  reopenLevelUp(character);
}

function currentLevelUpPlan(character) {
  return createLevelUpPlan(character, levelUpState?.targetClass || character.classe);
}

function renderLevelUpDialog(character) {
  if (!levelUpState || levelUpState.characterId !== character.id) {
    return `<dialog class="picker-dialog level-up-dialog" id="level-up-dialog"></dialog>`;
  }
  const plan = currentLevelUpPlan(character);
  if (!plan) return `<dialog class="picker-dialog level-up-dialog" id="level-up-dialog"></dialog>`;
  const finalStep = levelUpState.step === LEVEL_UP_STEPS.length - 1;
  const nextLabel = finalStep
    ? "Confirmar evolução"
    : levelUpState.step === 2
      ? "Revisar e confirmar"
      : "Continuar";
  return `
    <dialog class="picker-dialog level-up-dialog" id="level-up-dialog" aria-labelledby="level-up-title">
      <div class="dialog-heading level-up-heading">
        <div><p class="eyebrow">Evolução assistida</p><h2 id="level-up-title">${escapeHtml(levelLabel(plan.fromLevel))} → Nível ${plan.toLevel}</h2><p>${usesSeparateLevel(character) ? `Nível separado · NEX permanece em ${numberOr(character.nex, 0)}%` : `NEX ${plan.fromProgressNex}% → ${plan.targetProgressNex}%`}</p></div>
        <button class="dialog-close" id="close-level-up" type="button" aria-label="Fechar">×</button>
      </div>
      <div class="level-up-stepper">
        ${LEVEL_UP_STEPS.map((label, index) => `<div class="level-up-step ${index === levelUpState.step ? "active" : ""} ${index < levelUpState.step ? "done" : ""}"><span>${index < levelUpState.step ? "✓" : index + 1}</span><strong>${label}</strong></div>`).join("")}
      </div>
      <div class="level-up-body">${renderLevelUpStep(character, plan)}</div>
      <div class="level-up-footer">
        <button class="button ghost" id="cancel-level-up" type="button">Cancelar</button><span></span>
        <button class="button ghost" id="previous-level-up" type="button" ${levelUpState.step === 0 ? "disabled" : ""}>Voltar</button>
        <button class="button primary" id="next-level-up" type="button">${nextLabel}</button>
      </div>
    </dialog>`;
}

function renderLevelUpStep(character, plan) {
  if (levelUpState.step === 0) return renderLevelUpProgress(character, plan);
  if (levelUpState.step === 1) return renderLevelUpGains(character, plan);
  if (levelUpState.step === 2) return renderLevelUpChoices(character, plan);
  return renderLevelUpReview(character, plan);
}

function renderLevelUpProgress(character, plan) {
  return `<section class="level-up-section">
    <p class="eyebrow">Etapa 1 de 4</p><h3>Como o agente vai avançar?</h3>
    <p class="muted">O FOP avança um nível por vez para não pular nenhuma escolha obrigatória.</p>
    <div class="level-up-route"><div><span>Agora</span><strong>${escapeHtml(levelLabel(plan.fromLevel))}</strong><small>${plan.fromProgressNex}% de progressão</small></div><b>→</b><div><span>Depois</span><strong>Nível ${plan.toLevel}</strong><small>${plan.targetProgressNex}% de progressão</small></div></div>
    ${plan.firstAgentLevel ? `<fieldset class="level-up-choice-block"><legend>Escolha a classe</legend><div class="class-choice-grid">${["Combatente", "Especialista", "Ocultista"].map((name) => `<label class="level-choice-card ${levelUpState.targetClass === name ? "selected" : ""}"><input type="radio" name="level-up-class" value="${name}" data-level-up-class ${levelUpState.targetClass === name ? "checked" : ""}/><strong>${name}</strong><small>${name === "Combatente" ? "Combate e resistência" : name === "Especialista" ? "Perícias e versatilidade" : "Rituais e paranormal"}</small></label>`).join("")}</div></fieldset>` : `<div class="level-up-lock"><span>Classe mantida</span><strong>${escapeHtml(character.classe)}</strong><small>A classe não muda durante a evolução.</small></div>`}
    <p class="catalog-note level-up-note">A patente é definida pela história e não muda automaticamente.</p>
  </section>`;
}

function renderLevelUpGains(character, plan) {
  if (!plan.className) return levelUpPendingClass();
  const preview = buildLevelUpPreview(character);
  const before = calculateDerived(character);
  const after = calculateDerived(preview);
  const previousAutomatic = new Set(automaticAbilitiesFor(character).map((entry) => entry.id));
  const automatic = automaticAbilitiesFor(preview).filter((entry) => !previousAutomatic.has(entry.id)).map((entry) => entry.name);
  const classGains = automaticClassGains(plan);
  const choices = levelUpChoiceLabels(plan);
  return `<section class="level-up-section">
    <p class="eyebrow">Etapa 2 de 4</p><h3>Ganhos deste nível</h3><p class="muted">Os valores máximos e benefícios entram na ficha somente ao confirmar.</p>
    <div class="level-up-resource-grid">${levelUpResourceCard("PV máximo", before.pvMax, after.pvMax)}${after.usesDetermination ? levelUpResourceCard("PD máximo", before.pdMax, after.pdMax) : `${levelUpResourceCard("PE máximo", before.peMax, after.peMax)}${levelUpResourceCard("SAN máxima", before.sanMax, after.sanMax)}`}</div>
    <div class="level-up-gain-grid"><div class="level-up-gain-card"><h4>Automático</h4><ul>${[...automatic, ...classGains].length ? [...automatic, ...classGains].map((label) => `<li>${escapeHtml(label)}</li>`).join("") : "<li>Aumento dos recursos máximos.</li>"}</ul></div><div class="level-up-gain-card"><h4>Você vai escolher</h4><ul>${choices.length ? choices.map((label) => `<li>${escapeHtml(label)}</li>`).join("") : "<li>Nenhuma escolha extra.</li>"}</ul></div></div>
  </section>`;
}

function levelUpResourceCard(label, before, after) {
  const delta = numberOr(after, 0) - numberOr(before, 0);
  return `<div class="level-up-resource"><span>${escapeHtml(label)}</span><strong>${numberOr(after, 0)}</strong><small>${delta >= 0 ? "+" : ""}${delta} neste nível</small></div>`;
}

function automaticClassGains(plan) {
  const gains = [];
  if (plan.className === "Combatente" && [5, 11, 17].includes(plan.toLevel)) gains.push("Ataque Especial aprimorado");
  if (plan.className === "Especialista" && [5, 11, 17].includes(plan.toLevel)) gains.push("Dado de Perito aprimorado");
  if (plan.className === "Especialista" && [8, 15].includes(plan.toLevel)) gains.push("Engenhosidade aprimorada");
  if (plan.className === "Ocultista" && [5, 11, 17].includes(plan.toLevel)) gains.push(`${plan.ritualCircle}º círculo de rituais liberado`);
  return gains;
}

function levelUpChoiceLabels(plan) {
  const labels = [];
  if (plan.firstAgentLevel) labels.push("Perícias iniciais da classe");
  if (plan.firstAgentLevel && plan.className === "Especialista") labels.push("Duas perícias para Perito");
  if (plan.needsTrail) labels.push("Trilha da classe");
  if (plan.needsAttribute) labels.push("Aumento de um atributo");
  if (plan.trainingRank) labels.push(`${plan.trainingCount} perícia(s) para grau +${plan.trainingRank}`);
  if (plan.needsClassPower) labels.push("Um poder da classe");
  if (plan.needsVersatility) labels.push("Versatilidade");
  if (plan.ritualPicks) labels.push(`${plan.ritualPicks} ritual(is)`);
  return labels;
}

function levelUpPendingClass() {
  return `<section class="level-up-section"><h3>Escolha a classe primeiro</h3><p class="muted">Volte à etapa anterior para o FOP calcular os ganhos e escolhas.</p></section>`;
}

function renderLevelUpChoices(character, plan) {
  if (!plan.className) return levelUpPendingClass();
  const preview = buildLevelUpPreview(character);
  const sections = [];
  if (plan.firstAgentLevel) sections.push(renderFirstAgentSkillChoices(character, plan));
  if (plan.firstAgentLevel && plan.className === "Especialista") sections.push(renderPeritoChoices(preview));
  if (plan.needsTrail) sections.push(renderTrailChoice(plan));
  if (plan.needsAttribute) sections.push(renderAttributeIncrease(character));
  if (plan.needsAttribute && levelUpState.attribute === "intelecto") sections.push(renderIntellectSkillChoice(preview));
  if (plan.trainingRank) sections.push(renderTrainingUpgradeChoices(character, plan));
  if (plan.needsClassPower) sections.push(renderClassPowerChoice(character, plan));
  if (plan.needsVersatility) sections.push(renderVersatilityChoice(character, plan));
  if (selectedGrantedPower()?.name === "Transcender") sections.push(renderParanormalPowerChoice(character, plan));
  if (selectedGrantedPower()?.name === "Treinamento em Perícia") sections.push(renderPowerTrainingChoices(preview, plan));
  if (plan.ritualPicks) sections.push(renderLevelUpRitualChoices(character, plan));
  return `<section class="level-up-section"><p class="eyebrow">Etapa 3 de 4</p><h3>Escolhas do nível</h3><p class="muted">Complete tudo que o sistema liberar neste avanço.</p><div class="level-up-choice-stack">${sections.length ? sections.join("") : `<div class="level-up-complete-box">✓ Este nível não exige escolhas adicionais.</div>`}</div></section>`;
}

function levelUpClassDraft(character, plan) {
  const draft = structuredClone(character);
  draft.classe = plan.className || "Mundano";
  draft.nex = plan.targetNex;
  draft.nivel = plan.toLevel;
  draft.periciasClasseObrigatorias = [...levelUpState.classGroupSkills];
  draft.periciasEscolhidas = [...levelUpState.classFreeSkills];
  sanitizeSkillSelections(draft);
  return draft;
}

function renderFirstAgentSkillChoices(character, plan) {
  const draft = levelUpClassDraft(character, plan);
  const config = getSkillConfiguration(draft);
  const blocked = new Set([...config.originAutomatic, ...(draft.periciasOrigemEscolhidas ?? []), ...config.classAutomatic]);
  const groupSelected = levelUpState.classGroupSkills.filter(Boolean);
  const freeBlocked = new Set([...blocked, ...groupSelected]);
  const selectedFree = levelUpState.classFreeSkills.filter((skill) => !freeBlocked.has(skill)).slice(0, config.classChoiceCount);
  return `<fieldset class="level-up-choice-block"><legend>Perícias iniciais da classe</legend>
    ${config.classAutomatic.length ? `<p class="muted small">Automáticas: <strong>${escapeHtml(config.classAutomatic.join(", "))}</strong></p>` : ""}
    ${config.classChoiceGroups.map((group, index) => `<div class="level-up-subchoice"><h4>Escolha ${index + 1}: ${escapeHtml(group.join(" ou "))}</h4><div class="skill-grid short">${group.map((skill) => { const checked = levelUpState.classGroupSkills[index] === skill; const disabled = blocked.has(skill); return `<label class="skill-option ${checked ? "selected" : ""} ${disabled ? "disabled" : ""}"><input type="radio" name="level-up-skill-group-${index}" value="${escapeAttribute(skill)}" data-level-up-skill-group="${index}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}/><span>${escapeHtml(skill)}</span></label>`; }).join("")}</div></div>`).join("")}
    <div class="level-up-subchoice"><div class="skill-choice-head"><h4>Perícias livres</h4><strong class="skill-counter ${selectedFree.length === config.classChoiceCount ? "complete" : ""}">${selectedFree.length}/${config.classChoiceCount}</strong></div><div class="skill-grid">${SKILLS.map((skill) => { const checked = selectedFree.includes(skill); const disabled = freeBlocked.has(skill) || (!checked && selectedFree.length >= config.classChoiceCount); return `<label class="skill-option ${checked ? "selected" : ""} ${disabled ? "disabled" : ""}"><input type="checkbox" value="${escapeAttribute(skill)}" data-level-up-class-free ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}/><span>${escapeHtml(skill)}</span></label>`; }).join("")}</div></div>
  </fieldset>`;
}

function renderSkillCheckboxBlock({ title, description, skills, selected, dataAttribute, required }) {
  const valid = selected.filter((skill) => skills.includes(skill));
  return `<fieldset class="level-up-choice-block"><legend>${escapeHtml(title)}</legend><div class="skill-choice-head"><p class="muted small">${escapeHtml(description)}</p><strong class="skill-counter ${valid.length === required ? "complete" : ""}">${valid.length}/${required}</strong></div><div class="skill-grid">${skills.map((skill) => { const checked = valid.includes(skill); const disabled = !checked && valid.length >= required; return `<label class="skill-option ${checked ? "selected" : ""} ${disabled ? "disabled" : ""}"><input type="checkbox" value="${escapeAttribute(skill)}" ${dataAttribute} ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}/><span>${escapeHtml(skill)}</span></label>`; }).join("") || `<p class="muted small">Nenhuma perícia elegível foi encontrada.</p>`}</div></fieldset>`;
}

function renderPeritoChoices(preview) {
  const skills = (preview.periciasTreinadas ?? []).filter((skill) => !["Luta", "Pontaria"].includes(skill));
  return renderSkillCheckboxBlock({ title: "Perito — escolha duas perícias", description: "Luta e Pontaria não podem ser escolhidas.", skills, selected: levelUpState.peritoSkills, dataAttribute: "data-level-up-perito", required: Math.min(2, skills.length) });
}

function renderTrailChoice(plan) {
  return `<fieldset class="level-up-choice-block"><legend>Escolha uma trilha</legend><p class="muted small">A habilidade de NEX 10% entra automaticamente.</p><div class="class-choice-grid">${(CLASSES[plan.className]?.trails ?? []).map((name) => { const entry = TRAIL_ABILITIES.find((item) => item.category === plan.className && item.group === name && item.unlockNex === 10); const selected = levelUpState.targetTrail === name; return `<label class="level-choice-card ${selected ? "selected" : ""}"><input type="radio" name="level-up-trail" value="${escapeAttribute(name)}" data-level-up-trail ${selected ? "checked" : ""}/><strong>${escapeHtml(name)}</strong><small>${escapeHtml(entry?.summary ?? "Habilidade inicial da trilha.")}</small></label>`; }).join("")}</div></fieldset>`;
}

function renderAttributeIncrease(character) {
  return `<fieldset class="level-up-choice-block"><legend>Aumento de atributo</legend><p class="muted small">Escolha um atributo para aumentar em +1, até o máximo 5.</p><div class="attribute-choice-grid">${Object.entries(ATTRIBUTE_LABELS).map(([key, label]) => { const current = numberOr(character.atributos?.[key], 0); const selected = levelUpState.attribute === key; const disabled = current >= 5; return `<label class="level-choice-card ${selected ? "selected" : ""} ${disabled ? "disabled" : ""}"><input type="radio" name="level-up-attribute" value="${key}" data-level-up-attribute ${selected ? "checked" : ""} ${disabled ? "disabled" : ""}/><strong>${label}</strong><small>${current} → ${disabled ? "máx. 5" : current + 1}</small></label>`; }).join("")}</div></fieldset>`;
}

function renderIntellectSkillChoice(preview) {
  const trained = new Set((preview.periciasTreinadas ?? []).filter((skill) => skill !== levelUpState.intellectSkill));
  const skills = SKILLS.filter((skill) => !trained.has(skill));
  return `<fieldset class="level-up-choice-block"><legend>Nova perícia por INT</legend><p class="muted small">O ponto adicional de Intelecto concede treinamento em uma nova perícia.</p><div class="skill-grid">${skills.map((skill) => { const selected = levelUpState.intellectSkill === skill; return `<label class="skill-option ${selected ? "selected" : ""}"><input type="radio" name="level-up-int-skill" value="${escapeAttribute(skill)}" data-level-up-int-skill ${selected ? "checked" : ""}/><span>${escapeHtml(skill)}</span></label>`; }).join("")}</div></fieldset>`;
}

function trainingEligibleSkills(character, plan) {
  return SKILLS.filter((skill) => numberOr(character.grausPericia?.[skill], 0) === plan.trainingRank - 5);
}

function trainingRequiredCount(character, plan) {
  return plan?.trainingRank ? Math.min(plan.trainingCount, trainingEligibleSkills(character, plan).length) : 0;
}

function renderTrainingUpgradeChoices(character, plan) {
  const skills = trainingEligibleSkills(character, plan);
  const required = trainingRequiredCount(character, plan);
  return renderSkillCheckboxBlock({ title: `Grau de treinamento +${plan.trainingRank}`, description: `Eleve ${required} perícia(s) de +${plan.trainingRank - 5} para +${plan.trainingRank}.`, skills, selected: levelUpState.gradeUpgrades, dataAttribute: "data-level-up-grade", required });
}

function availableClassPowers(character, plan) {
  const selected = new Set(character.habilidadesSelecionadas ?? []);
  return [...CLASS_POWERS, ...GENERAL_POWERS].filter((entry) => (entry.category === plan.className || entry.category === "Gerais") && entry.unlockNex <= plan.targetProgressNex && (!selected.has(entry.id) || ["Transcender", "Treinamento em Perícia"].includes(entry.name)));
}

function renderAbilityRadioBlock(title, description, entries, selectedId, dataAttribute) {
  return `<fieldset class="level-up-choice-block"><legend>${escapeHtml(title)}</legend><p class="muted small">${escapeHtml(description)}</p><div class="level-up-option-list">${entries.map((entry) => `<label class="ability-choice-card ${selectedId === entry.id ? "selected" : ""}"><input type="radio" name="${dataAttribute.replace("data-", "")}" value="${entry.id}" ${dataAttribute} ${selectedId === entry.id ? "checked" : ""}/><span><strong>${escapeHtml(entry.name)}</strong><small>${escapeHtml(entry.group)} · ${escapeHtml(entry.cost)}</small><em>${escapeHtml(entry.summary)}</em><small>Requisito: ${escapeHtml(entry.requirement)}</small></span></label>`).join("") || `<p class="muted small">Nenhuma opção disponível.</p>`}</div></fieldset>`;
}

function renderClassPowerChoice(character, plan) {
  return renderAbilityRadioBlock("Escolha um poder", "O NEX mínimo já foi filtrado; confira os outros requisitos.", availableClassPowers(character, plan), levelUpState.classPowerId, "data-level-up-class-power");
}

function selectedClassPower() {
  return [...CLASS_POWERS, ...GENERAL_POWERS].find((entry) => entry.id === levelUpState?.classPowerId);
}

function selectedVersatilityAbility() {
  return ABILITY_BY_ID.get(levelUpState?.versatilityId);
}

function selectedGrantedPower() {
  return selectedClassPower() ?? selectedVersatilityAbility();
}

function renderParanormalPowerChoice(character, plan) {
  const selected = new Set(character.habilidadesSelecionadas ?? []);
  return renderAbilityRadioBlock("Transcender — poder paranormal", "Confira os pré-requisitos de elemento.", PARANORMAL_POWERS.filter((entry) => entry.unlockNex <= plan.targetProgressNex && !selected.has(entry.id)), levelUpState.paranormalPowerId, "data-level-up-paranormal-power");
}

function powerTrainingEligible(character, plan) {
  const preview = buildLevelUpPreview(character, { includePowerTraining: false });
  const max = plan.targetProgressNex >= 70 ? 15 : plan.targetProgressNex >= 35 ? 10 : 5;
  return SKILLS.filter((skill) => numberOr(preview.grausPericia?.[skill], 0) < max);
}

function renderPowerTrainingChoices(_preview, plan) {
  const route = currentRoute();
  const character = route.page === "ficha" ? getCharacter(route.id) : null;
  const skills = character ? powerTrainingEligible(character, plan) : [];
  return renderSkillCheckboxBlock({ title: "Treinamento em Perícia — escolha duas", description: "Cada escolha avança um grau permitido pelo seu NEX.", skills, selected: levelUpState.powerTrainingSkills, dataAttribute: "data-level-up-power-training", required: Math.min(2, skills.length) });
}

function renderVersatilityChoice(character, plan) {
  const selected = new Set(character.habilidadesSelecionadas ?? []);
  const otherTrails = TRAIL_ABILITIES.filter((entry) => entry.category === plan.className && entry.unlockNex === 10 && entry.group !== (levelUpState.targetTrail || character.trilha) && !selected.has(entry.id));
  const powers = availableClassPowers(character, plan).filter((entry) => !selected.has(entry.id) || ["Transcender", "Treinamento em Perícia"].includes(entry.name));
  return renderAbilityRadioBlock("Versatilidade", "Escolha um poder da classe ou a primeira habilidade de outra trilha.", [...powers, ...otherTrails], levelUpState.versatilityId, "data-level-up-versatility");
}

function ritualElementLabel(entry) {
  return (entry.elements ?? [entry.element]).join(" + ");
}

function renderLevelUpRitualChoices(character, plan) {
  const selected = new Set(character.rituaisSelecionados ?? []);
  const available = RITUALS.filter((entry) => entry.circle <= plan.ritualCircle && !selected.has(entry.id));
  return `<fieldset class="level-up-choice-block"><legend>Novos rituais conhecidos</legend><div class="skill-choice-head"><p class="muted small">Escolha ${plan.ritualPicks}. Círculos liberados: 1º ao ${plan.ritualCircle}º.</p><strong class="skill-counter ${levelUpState.ritualIds.length === plan.ritualPicks ? "complete" : ""}">${levelUpState.ritualIds.length}/${plan.ritualPicks}</strong></div><div class="level-up-ritual-groups">${RITUAL_CIRCLES.filter((circle) => circle <= plan.ritualCircle).map((circle) => `<details class="level-up-catalog-group" ${circle === plan.ritualCircle ? "open" : ""}><summary>${circle}º círculo <span>${available.filter((entry) => entry.circle === circle).length} opções</span></summary><div class="level-up-option-list">${available.filter((entry) => entry.circle === circle).map((entry) => { const checked = levelUpState.ritualIds.includes(entry.id); const disabled = !checked && levelUpState.ritualIds.length >= plan.ritualPicks; return `<label class="ability-choice-card ritual-choice ${checked ? "selected" : ""} ${disabled ? "disabled" : ""}"><input type="checkbox" value="${entry.id}" data-level-up-ritual ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}/><span><strong>${escapeHtml(entry.name)}</strong><small>${escapeHtml(ritualElementLabel(entry))} · ${escapeHtml(entry.cost)}</small><em>${escapeHtml(entry.summary)}</em></span></label>`; }).join("")}</div></details>`).join("")}</div></fieldset>`;
}

function renderLevelUpReview(character, plan) {
  if (!plan.className) return levelUpPendingClass();
  const preview = buildLevelUpPreview(character);
  const before = calculateDerived(character);
  const after = calculateDerived(preview);
  const choices = [];
  if (plan.firstAgentLevel) choices.push(["Classe", plan.className]);
  if (levelUpState.targetTrail && levelUpState.targetTrail !== character.trilha) choices.push(["Trilha", levelUpState.targetTrail]);
  if (levelUpState.attribute) choices.push(["Atributo", `${ATTRIBUTE_LABELS[levelUpState.attribute]} +1`]);
  if (levelUpState.intellectSkill) choices.push(["Nova perícia", levelUpState.intellectSkill]);
  if (levelUpState.gradeUpgrades.length) choices.push([`Perícias +${plan.trainingRank}`, levelUpState.gradeUpgrades.join(", ")]);
  if (selectedClassPower()) choices.push(["Poder", selectedClassPower().name]);
  if (levelUpState.paranormalPowerId) choices.push(["Poder paranormal", ABILITY_BY_ID.get(levelUpState.paranormalPowerId)?.name ?? "—"]);
  if (levelUpState.versatilityId) choices.push(["Versatilidade", ABILITY_BY_ID.get(levelUpState.versatilityId)?.name ?? "—"]);
  if (levelUpState.ritualIds.length) choices.push(["Rituais", levelUpState.ritualIds.map((id) => RITUAL_BY_ID.get(id)?.name).filter(Boolean).join(", ")]);
  const oldAutomatic = new Set(automaticAbilitiesFor(character).map((entry) => entry.id));
  const newAutomatic = automaticAbilitiesFor(preview).filter((entry) => !oldAutomatic.has(entry.id)).map((entry) => entry.name);
  return `<section class="level-up-section"><p class="eyebrow">Etapa 4 de 4</p><h3>Revisão e confirmação</h3><p class="muted">Nada foi alterado ainda.</p><div class="review-list level-up-review">${reviewRow("Progressão", `${levelLabel(plan.fromLevel)} → Nível ${plan.toLevel}${usesSeparateLevel(character) ? "" : ` · NEX ${plan.targetProgressNex}%`}`)}${reviewRow("Recursos máximos", levelUpResourceReview(before, after))}${choices.map(([label, value]) => reviewRow(label, value)).join("")}${reviewRow("Habilidades automáticas", newAutomatic.join(", ") || "Nenhuma nova")}</div><div class="level-up-confirm-note"><strong>Pronto para aplicar</strong><p>O FOP salvará um registro desta evolução.</p></div></section>`;
}

function levelUpResourceReview(before, after) {
  return after.usesDetermination ? `PV ${before.pvMax}→${after.pvMax} · PD ${before.pdMax}→${after.pdMax}` : `PV ${before.pvMax}→${after.pvMax} · PE ${before.peMax}→${after.peMax} · SAN ${before.sanMax}→${after.sanMax}`;
}

function buildLevelUpPreview(character, { includePowerTraining = true } = {}) {
  const plan = currentLevelUpPlan(character);
  const preview = structuredClone(character);
  if (!plan) return preview;
  if (plan.className) preview.classe = plan.className;
  preview.nex = plan.targetNex;
  preview.nivel = plan.toLevel;
  if (plan.firstAgentLevel && plan.className) {
    preview.patente = "Recruta";
    preview.periciasClasseObrigatorias = [...levelUpState.classGroupSkills];
    preview.periciasEscolhidas = [...levelUpState.classFreeSkills];
  }
  if (levelUpState.targetTrail) preview.trilha = levelUpState.targetTrail;
  if (levelUpState.attribute) preview.atributos[levelUpState.attribute] = Math.min(5, numberOr(preview.atributos[levelUpState.attribute], 0) + 1);
  if (levelUpState.intellectSkill) {
    preview.periciasEscolhidas = [...new Set([...(preview.periciasEscolhidas ?? []), levelUpState.intellectSkill])];
    preview.grausPericia[levelUpState.intellectSkill] = Math.max(5, numberOr(preview.grausPericia[levelUpState.intellectSkill], 0));
  }
  for (const skill of levelUpState.gradeUpgrades) preview.grausPericia[skill] = plan.trainingRank;
  if (includePowerTraining) {
    const maxRank = plan.targetProgressNex >= 70 ? 15 : plan.targetProgressNex >= 35 ? 10 : 5;
    for (const skill of levelUpState.powerTrainingSkills) {
      preview.grausPericia[skill] = Math.min(maxRank, numberOr(preview.grausPericia[skill], 0) + 5);
      preview.periciasAdicionais = [...new Set([...(preview.periciasAdicionais ?? []), skill])];
    }
  }
  preview.peritoPericias = [...levelUpState.peritoSkills];
  preview.habilidadesSelecionadas = [...new Set([...(preview.habilidadesSelecionadas ?? []), levelUpState.classPowerId, levelUpState.paranormalPowerId, levelUpState.versatilityId].filter(Boolean))];
  preview.rituaisSelecionados = [...new Set([...(preview.rituaisSelecionados ?? []), ...levelUpState.ritualIds])];
  sanitizeSkillSelections(preview);
  setInitialTrainingGrades(preview);
  return applyDerived(preview);
}

function validateLevelUpStep(character, step) {
  const plan = currentLevelUpPlan(character);
  if (!plan) return "Não foi possível montar esta evolução.";
  if (step === 0 && !plan.className) return "Escolha uma classe.";
  if (step !== 2) return "";
  if (plan.firstAgentLevel) {
    if (!skillSelectionStatus(levelUpClassDraft(character, plan)).complete) return "Complete as perícias iniciais.";
    if (plan.className === "Especialista" && levelUpState.peritoSkills.length !== 2) return "Escolha duas perícias para Perito.";
  }
  if (plan.needsTrail && !levelUpState.targetTrail) return "Escolha uma trilha.";
  if (plan.needsAttribute && !levelUpState.attribute) return "Escolha o atributo que vai aumentar.";
  if (levelUpState.attribute === "intelecto" && !levelUpState.intellectSkill) return "Escolha a nova perícia de Intelecto.";
  if (plan.trainingRank && levelUpState.gradeUpgrades.length !== trainingRequiredCount(character, plan)) return "Complete os aumentos de treinamento.";
  if (plan.needsClassPower && !levelUpState.classPowerId) return "Escolha um poder.";
  if (selectedGrantedPower()?.name === "Transcender" && !levelUpState.paranormalPowerId) return "Escolha o poder paranormal.";
  if (selectedGrantedPower()?.name === "Treinamento em Perícia" && levelUpState.powerTrainingSkills.length !== Math.min(2, powerTrainingEligible(character, plan).length)) return "Escolha duas perícias para Treinamento em Perícia.";
  if (plan.needsVersatility && !levelUpState.versatilityId) return "Escolha o benefício de Versatilidade.";
  if (plan.ritualPicks && levelUpState.ritualIds.length !== plan.ritualPicks) return `Escolha ${plan.ritualPicks} ritual(is).`;
  return "";
}

function bindLevelUpDialog(character) {
  if (!levelUpState || levelUpState.characterId !== character.id) return;
  const cancel = () => { levelUpState = null; renderSheet(character.id); };
  document.querySelector("#close-level-up")?.addEventListener("click", cancel);
  document.querySelector("#cancel-level-up")?.addEventListener("click", cancel);
  closeDialogOnBackdrop(document.querySelector("#level-up-dialog"));
  document.querySelector("#previous-level-up")?.addEventListener("click", () => { levelUpState.step = Math.max(0, levelUpState.step - 1); reopenLevelUp(character); });
  document.querySelector("#next-level-up")?.addEventListener("click", () => {
    const error = validateLevelUpStep(character, levelUpState.step);
    if (error) return showToast(error);
    if (levelUpState.step < 3) { levelUpState.step += 1; reopenLevelUp(character); }
    else applyLevelUp(character);
  });
  bindLevelUpSingle(character, "[data-level-up-class]", "targetClass", () => { levelUpState.targetTrail = ""; levelUpState.classGroupSkills = []; levelUpState.peritoSkills = []; levelUpState.ritualIds = []; });
  bindLevelUpSingle(character, "[data-level-up-trail]", "targetTrail");
  bindLevelUpSingle(character, "[data-level-up-attribute]", "attribute", () => { if (levelUpState.attribute !== "intelecto") levelUpState.intellectSkill = ""; });
  bindLevelUpSingle(character, "[data-level-up-int-skill]", "intellectSkill");
  bindLevelUpSingle(character, "[data-level-up-class-power]", "classPowerId", () => { levelUpState.paranormalPowerId = ""; levelUpState.powerTrainingSkills = []; });
  bindLevelUpSingle(character, "[data-level-up-paranormal-power]", "paranormalPowerId");
  bindLevelUpSingle(character, "[data-level-up-versatility]", "versatilityId", () => { levelUpState.paranormalPowerId = ""; levelUpState.powerTrainingSkills = []; });
  document.querySelectorAll("[data-level-up-skill-group]").forEach((input) => input.addEventListener("change", () => { levelUpState.classGroupSkills[Number(input.dataset.levelUpSkillGroup)] = input.value; levelUpState.classFreeSkills = levelUpState.classFreeSkills.filter((skill) => skill !== input.value); reopenLevelUp(character); }));
  bindLevelUpArray(character, "[data-level-up-class-free]", "classFreeSkills", () => getSkillConfiguration(levelUpClassDraft(character, currentLevelUpPlan(character))).classChoiceCount);
  bindLevelUpArray(character, "[data-level-up-perito]", "peritoSkills", 2);
  bindLevelUpArray(character, "[data-level-up-grade]", "gradeUpgrades", () => trainingRequiredCount(character, currentLevelUpPlan(character)));
  bindLevelUpArray(character, "[data-level-up-power-training]", "powerTrainingSkills", () => Math.min(2, powerTrainingEligible(character, currentLevelUpPlan(character)).length));
  bindLevelUpArray(character, "[data-level-up-ritual]", "ritualIds", () => currentLevelUpPlan(character)?.ritualPicks ?? 0);
}

function bindLevelUpSingle(character, selector, key, after = null) {
  document.querySelectorAll(selector).forEach((input) => input.addEventListener("change", () => { levelUpState[key] = input.value; after?.(); reopenLevelUp(character); }));
}

function bindLevelUpArray(character, selector, key, maxValue) {
  document.querySelectorAll(selector).forEach((input) => input.addEventListener("change", () => {
    const values = new Set(levelUpState[key] ?? []);
    if (input.checked) values.add(input.value); else values.delete(input.value);
    const max = typeof maxValue === "function" ? maxValue() : maxValue;
    levelUpState[key] = [...values].slice(0, Math.max(0, max));
    reopenLevelUp(character);
  }));
}

function applyLevelUp(character) {
  const plan = currentLevelUpPlan(character);
  const error = validateLevelUpStep(character, 2);
  if (!plan || error) return showToast(error || "Não foi possível aplicar.");
  const preview = buildLevelUpPreview(character);
  preview.levelUpHistory = [...(preview.levelUpHistory ?? []), { fromLevel: plan.fromLevel, toLevel: plan.toLevel, nex: plan.targetNex, className: plan.className, trail: levelUpState.targetTrail || preview.trilha || "", attribute: levelUpState.attribute || "", skills: [...levelUpState.gradeUpgrades, levelUpState.intellectSkill].filter(Boolean), abilities: [levelUpState.classPowerId, levelUpState.paranormalPowerId, levelUpState.versatilityId].filter(Boolean), rituals: [...levelUpState.ritualIds], appliedAt: new Date().toISOString() }];
  const saved = upsertCharacter(preview);
  levelUpState = null;
  activeSheetTab = "resumo";
  renderSheet(saved.id);
  showToast(`Evolução para o nível ${plan.toLevel} aplicada.`);
}

function reopenLevelUp(character) {
  renderSheet(character.id);
  document.querySelector("#level-up-dialog")?.showModal();
}

function bindSheetInteractions(character) {
  document.querySelector("#back-home")?.addEventListener("click", () => navigate("home"));
  document.querySelector("#edit-core")?.addEventListener("click", () => editCharacterCore(character));
  document.querySelector("#start-level-up")?.addEventListener("click", () => startLevelUp(character));

  document.querySelectorAll("[data-sheet-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeSheetTab = button.dataset.sheetTab;
      renderSheet(character.id);
    });
  });

  document.querySelectorAll("[data-resource-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const [resource, direction] = button.dataset.resourceAction.split(":");
      const currentKey = `${resource}Atual`;
      const maxKey = `${resource}Max`;
      const delta = direction === "increase" ? 1 : -1;
      character.recursos[currentKey] = clamp(
        numberOr(character.recursos[currentKey], 0) + delta,
        0,
        numberOr(character.recursos[maxKey], 0),
      );
      upsertCharacter(character);
      renderSheet(character.id);
    });
  });

  document.querySelectorAll("[data-autosave]").forEach((fieldElement) => {
    fieldElement.addEventListener("change", () => {
      character[fieldElement.dataset.autosave] = fieldElement.value;
      upsertCharacter(character);
      showToast("Alteração salva.");
    });
  });

  document.querySelector("[data-patent-select]")?.addEventListener("change", (event) => {
    character.patente = PATENTS.includes(event.target.value) ? event.target.value : "Recruta";
    upsertCharacter(character);
    showToast("Patente atualizada.");
  });

  document.querySelectorAll("[data-skill-grade]").forEach((select) => {
    select.addEventListener("change", () => {
      const skill = select.dataset.skillGrade;
      const grade = numberOr(select.value, 0);
      character.grausPericia[skill] = [0, 5, 10, 15].includes(grade) ? grade : 0;
      upsertCharacter(character);
      renderSheet(character.id);
      showToast("Grau de treinamento salvo.");
    });
  });

  document.querySelectorAll("[data-skill-other]").forEach((input) => {
    input.addEventListener("change", () => {
      const skill = input.dataset.skillOther;
      character.outrosBonusPericia[skill] = clamp(numberOr(input.value, 0), -99, 99);
      upsertCharacter(character);
      renderSheet(character.id);
      showToast("Bônus atualizado.");
    });
  });

  bindAbilityDialog(character);
  bindRitualDialog(character);
  bindItemDialog(character);
  bindOptionalRulesDialog(character);
  bindLevelUpDialog(character);
}

function bindAbilityDialog(character) {
  const dialog = document.querySelector("#ability-dialog");
  document.querySelector("#open-ability-picker")?.addEventListener("click", () => {
    if (ABILITY_CATEGORIES.includes(character.classe)) activeAbilityCategory = character.classe;
    activeAbilityGroup = "";
    renderSheet(character.id);
    document.querySelector("#ability-dialog")?.showModal();
  });
  document.querySelector("#close-ability-dialog")?.addEventListener("click", () => dialog?.close());
  closeDialogOnBackdrop(dialog);

  document.querySelectorAll("[data-ability-category]").forEach((button) => {
    button.addEventListener("click", () => {
      activeAbilityCategory = button.dataset.abilityCategory;
      activeAbilityGroup = "";
      abilitySearch = "";
      renderSheet(character.id);
      document.querySelector("#ability-dialog")?.showModal();
    });
  });
  document.querySelectorAll("[data-ability-group]").forEach((button) => {
    button.addEventListener("click", () => {
      activeAbilityGroup = button.dataset.abilityGroup;
      renderSheet(character.id);
      document.querySelector("#ability-dialog")?.showModal();
    });
  });
  document.querySelector("#ability-search")?.addEventListener("input", (event) => {
    abilitySearch = event.target.value;
    const results = document.querySelector("#ability-picker-results");
    if (results) results.innerHTML = renderAbilityPickerResults(character);
    bindAbilityToggleButtons(character, true);
  });
  bindAbilityToggleButtons(character, false);
}

function bindAbilityToggleButtons(character, resultsOnly) {
  const selector = resultsOnly
    ? "#ability-picker-results [data-ability-toggle]"
    : "[data-ability-toggle]";
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.abilityToggle;
      if (!ABILITY_BY_ID.has(id)) return;
      const wasOpen = Boolean(document.querySelector("#ability-dialog")?.open);
      const selected = new Set(character.habilidadesSelecionadas);
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      character.habilidadesSelecionadas = [...selected];
      upsertCharacter(character);
      renderSheet(character.id);
      if (wasOpen) document.querySelector("#ability-dialog")?.showModal();
      showToast(selected.has(id) ? "Habilidade adicionada." : "Habilidade removida.");
    });
  });
}

function bindRitualDialog(character) {
  const dialog = document.querySelector("#ritual-dialog");
  document.querySelector("#open-ritual-picker")?.addEventListener("click", () => dialog?.showModal());
  document.querySelector("#close-ritual-dialog")?.addEventListener("click", () => dialog?.close());
  closeDialogOnBackdrop(dialog);
  document.querySelectorAll("[data-ritual-circle]").forEach((button) => {
    button.addEventListener("click", () => {
      activeRitualCircle = Number(button.dataset.ritualCircle);
      ritualSearch = "";
      renderSheet(character.id);
      document.querySelector("#ritual-dialog")?.showModal();
    });
  });
  document.querySelectorAll("[data-ritual-element]").forEach((button) => {
    button.addEventListener("click", () => {
      activeRitualElement = button.dataset.ritualElement;
      renderSheet(character.id);
      document.querySelector("#ritual-dialog")?.showModal();
    });
  });
  document.querySelector("#ritual-search")?.addEventListener("input", (event) => {
    ritualSearch = event.target.value;
    const results = document.querySelector("#ritual-picker-results");
    if (results) results.innerHTML = renderRitualPickerResults();
    bindRitualToggleButtons(character, true);
  });
  bindRitualToggleButtons(character, false);
}

function bindRitualToggleButtons(character, resultsOnly) {
  const selector = resultsOnly
    ? "#ritual-picker-results [data-ritual-toggle]"
    : "[data-ritual-toggle]";
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.ritualToggle;
      if (!RITUAL_BY_ID.has(id)) return;
      const wasOpen = Boolean(document.querySelector("#ritual-dialog")?.open);
      const selected = new Set(character.rituaisSelecionados);
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      character.rituaisSelecionados = [...selected];
      upsertCharacter(character);
      renderSheet(character.id);
      if (wasOpen) document.querySelector("#ritual-dialog")?.showModal();
      showToast(selected.has(id) ? "Ritual adicionado." : "Ritual removido.");
    });
  });
}

function bindItemDialog(character) {
  const dialog = document.querySelector("#item-dialog");
  document.querySelector("#open-item-picker")?.addEventListener("click", () => dialog?.showModal());
  document.querySelector("#close-item-dialog")?.addEventListener("click", () => dialog?.close());
  closeDialogOnBackdrop(dialog);

  document.querySelectorAll("[data-item-group]").forEach((button) => {
    button.addEventListener("click", () => {
      activeItemGroup = button.dataset.itemGroup;
      itemSearch = "";
      renderSheet(character.id);
      document.querySelector("#item-dialog")?.showModal();
    });
  });
  document.querySelector("#item-source")?.addEventListener("change", (event) => {
    activeItemSource = event.target.value;
    renderSheet(character.id);
    document.querySelector("#item-dialog")?.showModal();
  });
  document.querySelector("#item-search")?.addEventListener("input", (event) => {
    itemSearch = event.target.value;
    const results = document.querySelector("#item-picker-results");
    if (results) results.innerHTML = renderItemPickerResults();
    bindItemAddButtons(character, true);
  });
  bindItemAddButtons(character, false);

  document.querySelectorAll("[data-item-quantity]").forEach((button) => {
    button.addEventListener("click", () => {
      changeInventoryQuantity(character, button.dataset.itemQuantity, Number(button.dataset.itemDelta));
    });
  });
  document.querySelectorAll("[data-item-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      character.inventarioItens = (character.inventarioItens ?? []).filter(
        (selected) => selected.itemId !== button.dataset.itemRemove,
      );
      upsertCharacter(character);
      renderSheet(character.id);
      showToast("Item removido do inventário.");
    });
  });
}

function bindItemAddButtons(character, resultsOnly) {
  const selector = resultsOnly
    ? "#item-picker-results [data-item-add]"
    : "[data-item-add]";
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener("click", () => {
      const wasOpen = Boolean(document.querySelector("#item-dialog")?.open);
      changeInventoryQuantity(character, button.dataset.itemAdd, 1, false);
      if (wasOpen) document.querySelector("#item-dialog")?.showModal();
      showToast("Item adicionado ao inventário.");
    });
  });
}

function changeInventoryQuantity(character, itemId, delta, notify = true) {
  if (!ITEM_BY_ID.has(itemId) || !Number.isFinite(delta) || delta === 0) return;
  const entries = [...(character.inventarioItens ?? [])];
  const index = entries.findIndex((selected) => selected.itemId === itemId);
  if (index < 0 && delta > 0) entries.push({ itemId, quantity: Math.min(99, delta) });
  if (index >= 0) {
    entries[index] = {
      ...entries[index],
      quantity: clamp(numberOr(entries[index].quantity, 1) + delta, 1, 99),
    };
  }
  character.inventarioItens = entries;
  upsertCharacter(character);
  renderSheet(character.id);
  if (notify) showToast("Quantidade atualizada.");
}

function closeDialogOnBackdrop(dialog) {
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function emptyCollection(message) {
  return `<div class="collection-empty"><span aria-hidden="true">＋</span><p>${escapeHtml(message)}</p></div>`;
}

function uniqueById(entries) {
  return [...new Map(entries.map((entry) => [entry.id, entry])).values()];
}

function normalizeSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function editCharacterCore(character) {
  const name = window.prompt("Nome do agente", character.nome);
  if (name === null) return;
  if (!name.trim()) {
    showToast("O nome do agente não pode ficar vazio.");
    return;
  }
  character.nome = name.trim();
  upsertCharacter(character);
  renderSheet(character.id);
  showToast("Dados atualizados.");
}

function field(label, id, value, placeholder = "", required = false) {
  return `
    <div class="field">
      <label for="${id}">${label}${required ? " *" : ""}</label>
      <input id="${id}" name="${id}" value="${escapeAttribute(value)}" placeholder="${escapeAttribute(placeholder)}" ${required ? "required" : ""} />
    </div>
  `;
}

function renderPatentField(selected) {
  const safeSelected = PATENTS.includes(selected) ? selected : "Recruta";
  return `
    <div class="field">
      <label for="patente">Patente</label>
      <select id="patente" name="patente">
        ${PATENTS.map((patent) => `<option value="${escapeAttribute(patent)}" ${patent === safeSelected ? "selected" : ""}>${escapeHtml(patent)}</option>`).join("")}
      </select>
    </div>
  `;
}

function numberField(label, id, value, min, max) {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" name="${id}" type="number" inputmode="numeric" min="${min}" max="${max}" value="${numberOr(value, min)}" />
    </div>
  `;
}

function renderNexPicker() {
  const nex = numberOr(creatorState.nex, 0);
  const separated = usesSeparateLevel(creatorState);
  return `
    <div class="field nex-field">
      <label for="nex">NEX</label>
      <input id="nex" name="nex" type="hidden" value="${nex}" />
      <div class="nex-picker">
        <button type="button" data-nex-delta="-5" aria-label="Diminuir NEX em 5" ${nex === 0 ? "disabled" : ""}>−</button>
        <output for="nex"><strong>${nex}%</strong><small>${separated ? "NEX independente" : nex === 0 ? "Mundano · nível 0" : `Nível ${levelFromNex(nex)}`}</small></output>
        <button type="button" data-nex-delta="5" aria-label="Aumentar NEX em 5" ${nex === 100 ? "disabled" : ""}>+</button>
      </div>
    </div>
  `;
}

function ensureOptionalRules(character) {
  character.optionalRules ??= {};
  character.optionalRules.separateLevelNex = Boolean(
    character.optionalRules.separateLevelNex,
  );
  character.optionalRules.determination = Boolean(character.optionalRules.determination);
}

function renderOptionalRulesDialog(character) {
  ensureOptionalRules(character);
  const rules = character.optionalRules;
  return `
    <dialog class="optional-rules-dialog" id="optional-rules-dialog" aria-labelledby="optional-rules-title">
      <div class="dialog-heading">
        <div>
          <p class="eyebrow">Configuração da ficha</p>
          <h2 id="optional-rules-title">Regras opcionais — Sobrevivendo ao Horror</h2>
        </div>
        <button class="dialog-close" id="close-optional-rules" type="button" aria-label="Fechar">×</button>
      </div>
      <div class="optional-rule-list">
        ${renderOptionalRule({
          key: "separateLevelNex",
          title: "NEX e experiência",
          description: "Separa o nível do personagem de sua exposição paranormal.",
          enabled: rules.separateLevelNex,
        })}
        ${renderOptionalRule({
          key: "determination",
          title: "Jogando sem Sanidade",
          description: "Substitui PE e Sanidade por Pontos de Determinação.",
          enabled: rules.determination,
        })}
      </div>
    </dialog>
  `;
}

function renderOptionalRule({ key, title, description, enabled }) {
  return `
    <section class="optional-rule">
      <div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></div>
      <div class="binary-toggle" role="group" aria-label="${escapeAttribute(title)}">
        <button type="button" data-rule-key="${key}" data-rule-value="false" class="${!enabled ? "active" : ""}" aria-pressed="${!enabled}">Desligado</button>
        <button type="button" data-rule-key="${key}" data-rule-value="true" class="${enabled ? "active" : ""}" aria-pressed="${enabled}">Ligado</button>
      </div>
    </section>
  `;
}

function bindOptionalRulesDialog(character) {
  const dialog = document.querySelector("#optional-rules-dialog");
  document.querySelector("#optional-rules-button")?.addEventListener("click", () => {
    dialog?.showModal();
  });
  document.querySelector("#close-optional-rules")?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.querySelectorAll("[data-rule-key]").forEach((button) => {
    button.addEventListener("click", () => {
      applyOptionalRule(character, button.dataset.ruleKey, button.dataset.ruleValue === "true");
      upsertCharacter(character);
      renderSheet(character.id);
      document.querySelector("#optional-rules-dialog")?.showModal();
    });
  });
}

function applyOptionalRule(character, key, enabled) {
  ensureOptionalRules(character);
  character.optionalRules[key] = enabled;

  if (key === "separateLevelNex") {
    if (enabled) {
      character.nivel = Math.max(1, levelFromNex(character.nex));
    } else {
      character.nivel = levelFromNex(character.nex);
    }
  }
}

function renderSkillStep() {
  const status = skillSelectionStatus(creatorState);
  const config = status.config;
  const automatic = [...new Set([...config.originAutomatic, ...config.classAutomatic])];
  const originBlocked = new Set(automatic);
  const groupSelections = creatorState.periciasClasseObrigatorias ?? [];
  const classBlocked = new Set([
    ...automatic,
    ...(creatorState.periciasOrigemEscolhidas ?? []),
    ...groupSelections,
  ]);

  return `
    <p class="eyebrow">Etapa 4 de ${STEPS.length}</p>
    <h1>Perícias treinadas</h1>
    <p class="muted">As perícias da origem e as fixas da classe já entram sozinhas. Escolha apenas as que faltam.</p>

    <div class="skill-progress ${status.complete ? "complete" : ""}">
      <span>${status.complete ? "Seleção completa" : "Complete as escolhas abaixo"}</span>
      <strong>${creatorState.periciasTreinadas.length} treinadas</strong>
    </div>

    <section class="skill-choice-block">
      <div class="section-heading"><h2>Já concedidas</h2><span class="badge">Automático</span></div>
      <div class="skill-chip-row">
        ${automatic.length ? automatic.map(skillChip).join("") : `<span class="muted small">Nenhuma perícia automática.</span>`}
      </div>
    </section>

    ${
      config.originChoiceCount
        ? renderSkillChecklist({
            title: config.originChoiceLabel,
            source: "origin",
            selected: creatorState.periciasOrigemEscolhidas,
            required: config.originChoiceCount,
            blocked: originBlocked,
          })
        : ""
    }

    ${config.classChoiceGroups.map((group, index) => renderSkillGroup(group, index, groupSelections[index], originBlocked)).join("")}

    ${renderSkillChecklist({
      title: `Perícias livres de ${creatorState.classe}`,
      source: "class",
      selected: creatorState.periciasEscolhidas,
      required: config.classChoiceCount,
      blocked: classBlocked,
    })}
  `;
}

function renderSkillChecklist({ title, source, selected = [], required, blocked }) {
  if (required === 0) return "";
  const selectedSet = new Set(selected);
  const limitReached = selectedSet.size >= required;
  return `
    <fieldset class="skill-choice-block">
      <legend>${escapeHtml(title)}</legend>
      <div class="skill-choice-head">
        <span class="muted small">Escolha ${required}</span>
        <strong class="skill-counter ${selectedSet.size === required ? "complete" : ""}">${selectedSet.size}/${required}</strong>
      </div>
      <div class="skill-grid">
        ${SKILLS.map((skill) => {
          const checked = selectedSet.has(skill);
          const disabled = blocked.has(skill) || (!checked && limitReached);
          return `
            <label class="skill-option ${checked ? "selected" : ""} ${disabled && !checked ? "disabled" : ""}">
              <input type="checkbox" value="${escapeAttribute(skill)}" data-${source}-skill ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} />
              <span>${escapeHtml(skill)}</span>
            </label>
          `;
        }).join("")}
      </div>
    </fieldset>
  `;
}

function renderSkillGroup(group, index, selected, blocked) {
  return `
    <fieldset class="skill-choice-block compact-choice">
      <legend>Escolha obrigatória da classe</legend>
      <div class="skill-choice-head"><span class="muted small">Escolha 1 entre ${escapeHtml(group.join(" ou "))}</span><strong class="skill-counter ${selected ? "complete" : ""}">${selected ? "1/1" : "0/1"}</strong></div>
      <div class="skill-grid short">
        ${group.map((skill) => {
          const disabled = blocked.has(skill) && selected !== skill;
          return `
            <label class="skill-option ${selected === skill ? "selected" : ""} ${disabled ? "disabled" : ""}">
              <input type="radio" name="skill-group-${index}" value="${escapeAttribute(skill)}" data-skill-group="${index}" ${selected === skill ? "checked" : ""} ${disabled ? "disabled" : ""} />
              <span>${escapeHtml(skill)}</span>
            </label>
          `;
        }).join("")}
      </div>
    </fieldset>
  `;
}

function skillChip(skill) {
  return `<span class="skill-chip">${escapeHtml(skill)}</span>`;
}

function resourceFields(label, key, current, max) {
  return `
    <div class="resource-card">
      <header><strong>${label}</strong><span class="muted small">Atual / Máximo</span></header>
      <div class="resource-pair">
        <input id="${key}-atual" type="number" min="0" value="${numberOr(current, 0)}" aria-label="${label} atual" />
        <span>/</span>
        <input id="${key}-max" type="number" min="0" value="${numberOr(max, 0)}" aria-label="${label} máximo" />
      </div>
    </div>
  `;
}

function calculatedResource(label, value) {
  return `
    <div class="resource-card calculated">
      <header><strong>${label}</strong><span class="badge">Automático</span></header>
      <div class="calculated-value">${numberOr(value, 0)}</div>
    </div>
  `;
}

function renderOriginOptions(selected) {
  const sources = [...new Set(ORIGINS.map((origin) => origin.source))];
  return `
    <option value="">Selecione</option>
    ${sources
      .map(
        (source) => `
          <optgroup label="${escapeAttribute(source)}">
            ${ORIGINS.filter((origin) => origin.source === source)
              .map(
                (origin) => `<option value="${escapeAttribute(origin.name)}" ${origin.name === selected ? "selected" : ""}>${escapeHtml(origin.name)}</option>`,
              )
              .join("")}
          </optgroup>
        `,
      )
      .join("")}
  `;
}

function renderOriginPreview(originName) {
  return renderOriginDetail(originName, true);
}

function originPowerInfo(origin) {
  const [summary = "Habilidade concedida automaticamente por esta origem.", cost = "Passivo"] =
    ORIGIN_POWER_DETAILS[origin?.power] ?? [];
  return { summary, cost };
}

function renderOriginDetail(originName, expanded = false) {
  const origin = findOrigin(originName);
  if (!origin) return "";
  const skillSummary = originSkillSummary(origin);
  const power = originPowerInfo(origin);
  return `
    <details class="origin-detail-card" ${expanded ? "open" : ""}>
      <summary>
        <span><strong>${escapeHtml(origin.name)}</strong><small>Ver história, perícias e poder</small></span>
        <span class="entry-summary-side"><span class="badge red">${escapeHtml(origin.source)}</span><span class="chevron" aria-hidden="true">⌄</span></span>
      </summary>
      <div class="origin-detail-body">
        <p>${escapeHtml(ORIGIN_BACKGROUNDS[origin.name] ?? "Esta origem representa a vida do personagem antes de conhecer a Ordem.")}</p>
        <dl class="entry-meta origin-meta">
          <div><dt>Perícias</dt><dd>${escapeHtml(skillSummary)}</dd></div>
          <div><dt>Poder</dt><dd>${escapeHtml(origin.power)}</dd></div>
          <div><dt>Custo</dt><dd>${escapeHtml(power.cost)}</dd></div>
          <div><dt>Fonte</dt><dd>${escapeHtml(origin.source)}</dd></div>
        </dl>
        <div class="origin-power-description"><strong>${escapeHtml(origin.power)}</strong><p>${escapeHtml(power.summary)}</p></div>
      </div>
    </details>
  `;
}

function originSkillSummary(origin) {
  const skills = [...(origin.skills ?? [])];
  if (origin.skillChoices) {
    skills.push(`${origin.skillChoices} ${origin.skillChoices === 1 ? "perícia" : "perícias"} à escolha`);
  }
  return skills.join(" e ") || "Nenhuma";
}

function renderTrailField() {
  if (!creatorState.classe || characterLevel(creatorState) < 2) return "";
  const trails = CLASSES[creatorState.classe]?.trails ?? [];
  return `
    <div class="field full">
      <label for="trilha">Trilha disponível no nível atual</label>
      <select id="trilha" name="trilha">
        ${selectOptions(["", ...trails], creatorState.trilha, "Escolha uma trilha")}
      </select>
    </div>
  `;
}

function readAttributeInputs() {
  return Object.fromEntries(
    Object.keys(ATTRIBUTE_LABELS).map((key) => [
      key,
      numberOr(document.querySelector(`#attr-${key}`)?.value, creatorState.atributos[key]),
    ]),
  );
}

function renderAttributeBudget() {
  const budget = attributeBudget(
    creatorState.atributos,
    creatorState.nex,
    usesSeparateLevel(creatorState),
  );
  return `
    <div class="attribute-budget ${budget.remaining === 0 ? "complete" : ""}" id="attribute-budget">
      <span>Pontos restantes</span>
      <strong>${budget.remaining}</strong>
    </div>
  `;
}

function updateAttributeBudget() {
  const budget = attributeBudget(
    readAttributeInputs(),
    creatorState.nex,
    usesSeparateLevel(creatorState),
  );
  const element = document.querySelector("#attribute-budget");
  if (!element) return;
  element.classList.toggle("complete", budget.remaining === 0);
  element.querySelector("strong").textContent = String(budget.remaining);
}

function renderCalculationBreakdown() {
  const derived = calculateDerived(creatorState);
  const fixedSkills = [
    ...derived.fixedSkills,
    ...(creatorState.periciasClasseObrigatorias ?? []),
  ].filter(Boolean);
  return `
    <strong>Como o FOP calculou</strong>
    <div class="calculation-grid">
      <span>Defesa</span><b>10 + AGI = ${derived.defesa}</b>
      <span>Nível usado nos cálculos</span><b>${derived.level}</b>
      <span>Avanços após o nível 1</span><b>${derived.advances}</b>
      <span>Perícias fixas da classe</span><b>${escapeHtml(fixedSkills.join(", ") || "Nenhuma")}</b>
      <span>Perícias escolhidas</span><b>${escapeHtml(creatorState.periciasEscolhidas?.join(", ") || "Nenhuma")}</b>
      <span>Deslocamento</span><b>${derived.deslocamento} m</b>
    </div>
  `;
}

function renderAutomaticBenefits(character) {
  const origin = character.beneficiosOrigem ?? findOrigin(character.origem);
  const classSkills = character.periciasClasse ?? calculateDerived(character);
  if (!origin && !character.classe) return "";
  const skills = [
    ...(origin?.skills ?? []),
    ...(character.periciasOrigemEscolhidas ?? []),
  ];
  const power = origin?.power ?? "Pendente";
  const powerInfo = originPowerInfo(origin);
  const fixed = classSkills.fixed ?? classSkills.fixedSkills ?? [];
  const choices = classSkills.choices ?? classSkills.skillChoices ?? 0;
  const selected = classSkills.selected ?? character.periciasEscolhidas ?? [];

  return `
    <div class="sheet-section">
      <div class="section-heading"><h2>Benefícios automáticos</h2><span class="muted small">Aplicados pela criação</span></div>
      <div class="benefit-list">
        <div><span>Perícias da origem</span><strong>${escapeHtml(skills.join(", ") || "—")}</strong></div>
        <div><span>Poder da origem</span><strong>${escapeHtml(power)}</strong><small>${escapeHtml(powerInfo.summary)}</small></div>
        <div><span>Perícias fixas da classe</span><strong>${escapeHtml(fixed.join(", ") || "Nenhuma")}</strong></div>
        <div><span>Perícias escolhidas</span><strong>${escapeHtml(selected.join(", ") || `${numberOr(choices, 0)} escolhas pendentes`)}</strong></div>
      </div>
    </div>
  `;
}

function renderTrainedSkills(character) {
  const skills = character.periciasTreinadas ?? [];
  return `
    <div class="sheet-section">
      <div class="section-heading"><h2>Perícias treinadas</h2><span class="muted small">${skills.length} no total</span></div>
      <div class="skill-chip-row">
        ${skills.length ? skills.map(skillChip).join("") : `<span class="muted">Nenhuma perícia selecionada.</span>`}
      </div>
    </div>
  `;
}

function liveResource(label, key, current, max) {
  return `
    <div class="live-resource">
      <div class="live-resource-head">
        <strong>${label}</strong>
        <span class="muted small">máx. ${numberOr(max, 0)}</span>
      </div>
      <div class="live-resource-controls">
        <button type="button" data-resource-action="${key}:decrease" aria-label="Diminuir ${label}">−</button>
        <div class="live-resource-value"><strong>${numberOr(current, 0)}</strong> / ${numberOr(max, 0)}</div>
        <button type="button" data-resource-action="${key}:increase" aria-label="Aumentar ${label}">+</button>
      </div>
    </div>
  `;
}

function notesSection(title, key, value, placeholder) {
  return `
    <div class="sheet-section">
      <div class="section-heading"><h2>${title}</h2><span class="muted small">Salva automaticamente</span></div>
      <textarea class="autosave-field" data-autosave="${key}" placeholder="${escapeAttribute(placeholder)}">${escapeHtml(value || "")}</textarea>
    </div>
  `;
}

function statCard(label, value) {
  return `<div class="stat-card"><span>${label}</span><strong>${escapeHtml(String(value ?? "—"))}</strong></div>`;
}

function reviewRow(label, value) {
  return `<div class="review-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
}

function resourceSummary(character) {
  const derived = calculateDerived(character);
  if (derived.usesDetermination) {
    return `PV ${character.recursos.pvMax} · PD ${character.recursos.pdMax}`;
  }
  return `PV ${character.recursos.pvMax} · PE ${character.recursos.peMax} · SAN ${character.recursos.sanMax}`;
}

function selectOptions(options, selected, placeholder) {
  return options
    .map((option, index) => {
      const label = index === 0 ? placeholder : option;
      return `<option value="${escapeAttribute(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toastElement.textContent = message;
  toastElement.classList.add("show");
  toastTimer = window.setTimeout(() => toastElement.classList.remove("show"), 2400);
}

function initials(name) {
  const parts = String(name || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return `${parts[0][0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
}

function numberOr(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

if (!window.location.hash) window.location.hash = "#home";
else renderRoute();
