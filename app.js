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
  isMundaneCharacter,
  levelFromNex,
  skillSelectionStatus,
  usesSeparateLevel,
} from "./rules.js?v=5";
import {
  ABILITY_CATEGORIES,
  CORE_CLASS_ABILITIES,
  PATENTS,
  RITUAL_CIRCLES,
  RITUAL_ELEMENTS,
  RITUALS,
  SKILL_ATTRIBUTES,
  TRAIL_ABILITIES,
  allSelectableAbilities,
} from "./content.js?v=5";

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
    periciasTreinadas: [],
    grausPericia: {},
    outrosBonusPericia: {},
    skillRanksVersion: 1,
    pericias: "",
    inventario: "",
    habilidades: "",
    habilidadesNotas: "",
    habilidadesSelecionadas: [],
    rituaisSelecionados: [],
    rituaisNotas: "",
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

  headerActions.innerHTML = `
    <button class="button ghost compact" id="back-home" type="button">Arquivos</button>
    <button class="button compact" id="edit-core" type="button">Editar nome</button>
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
  `;

  bindSheetInteractions(character);
}

function renderSheetTab(character) {
  if (activeSheetTab === "pericias") return renderSkillsTab(character);
  if (activeSheetTab === "habilidades") return renderAbilitiesTab(character);
  if (activeSheetTab === "rituais") return renderRitualsTab(character);
  if (activeSheetTab === "inventario") {
    return notesSection(
      "Inventário",
      "inventario",
      character.inventario,
      "Equipamentos, armas, proteções e itens de investigação.",
    );
  }
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
        <dl class="entry-meta">
          <div><dt>Custo</dt><dd>${escapeHtml(entry.cost)}</dd></div>
          <div><dt>Requisito</dt><dd>${escapeHtml(entry.requirement)}</dd></div>
          <div><dt>Fonte</dt><dd>${escapeHtml(entry.source)}</dd></div>
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
        <span><strong>${escapeHtml(entry.name)}</strong><small>${escapeHtml(entry.element)} · ${entry.circle}º círculo</small></span>
        <span class="entry-summary-side"><span class="badge">${escapeHtml(entry.cost)}</span><span class="chevron" aria-hidden="true">⌄</span></span>
      </summary>
      <div class="entry-body">
        <p>${escapeHtml(entry.summary)}</p>
        <dl class="entry-meta">
          <div><dt>Círculo</dt><dd>${entry.circle}º</dd></div>
          <div><dt>Custo-base</dt><dd>${escapeHtml(entry.cost)}</dd></div>
          <div><dt>Fonte</dt><dd>${escapeHtml(entry.source)}</dd></div>
        </dl>
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
        <p class="catalog-note">Custo-base do ${activeRitualCircle}º círculo. Versões Discente e Verdadeiro podem alterar custo e efeito.</p>
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
      entry.element === activeRitualElement &&
      (!query || normalizeSearch(`${entry.name} ${entry.summary}`).includes(query)),
  );
  return entries.length
    ? entries.map((entry) => renderRitualCard(entry, { picker: true })).join("")
    : emptyCollection("Nenhum ritual encontrado neste círculo e elemento.");
}

function bindSheetInteractions(character) {
  document.querySelector("#back-home")?.addEventListener("click", () => navigate("home"));
  document.querySelector("#edit-core")?.addEventListener("click", () => editCharacterCore(character));

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
  bindOptionalRulesDialog(character);
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
  const origin = findOrigin(originName);
  if (!origin) return "";
  const skillSummary = originSkillSummary(origin);
  return `
    <div class="calculation-box origin-preview">
      <span class="badge red">${escapeHtml(origin.source)}</span>
      <div><strong>Perícias concedidas:</strong> ${escapeHtml(skillSummary)}</div>
      <div><strong>Poder de origem:</strong> ${escapeHtml(origin.power)}</div>
    </div>
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
  const fixed = classSkills.fixed ?? classSkills.fixedSkills ?? [];
  const choices = classSkills.choices ?? classSkills.skillChoices ?? 0;
  const selected = classSkills.selected ?? character.periciasEscolhidas ?? [];

  return `
    <div class="sheet-section">
      <div class="section-heading"><h2>Benefícios automáticos</h2><span class="muted small">Aplicados pela criação</span></div>
      <div class="benefit-list">
        <div><span>Perícias da origem</span><strong>${escapeHtml(skills.join(", ") || "—")}</strong></div>
        <div><span>Poder da origem</span><strong>${escapeHtml(power)}</strong></div>
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
