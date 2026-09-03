const STORAGE_KEY = "fop_personagens_v1";

const ATTRIBUTE_LABELS = {
  agilidade: "AGI",
  forca: "FOR",
  intelecto: "INT",
  presenca: "PRE",
  vigor: "VIG",
};

const STEPS = ["Identidade", "Formação", "Atributos", "Recursos", "Revisão"];

const app = document.querySelector("#app");
const headerActions = document.querySelector("#header-actions");
const homeButton = document.querySelector("#home-button");
const toastElement = document.querySelector("#toast");

let toastTimer;
let creatorState = null;
let currentStep = 0;

homeButton.addEventListener("click", () => navigate("home"));
window.addEventListener("hashchange", renderRoute);

function createBlankCharacter() {
  return {
    id: crypto.randomUUID(),
    nome: "",
    jogador: "",
    origem: "",
    classe: "",
    nex: 5,
    patente: "Recruta",
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
    },
    defesa: 10,
    deslocamento: 9,
    protecao: "Nenhuma",
    pericias: "",
    inventario: "",
    habilidades: "",
    anotacoes: "",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
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
  const updated = { ...character, atualizadoEm: new Date().toISOString() };

  if (index >= 0) characters[index] = updated;
  else characters.push(updated);

  writeCharacters(characters);
  return updated;
}

function getCharacter(id) {
  return readCharacters().find((character) => character.id === id);
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
                <span class="badge red">NEX ${numberOr(character.nex, 5)}%</span>
                <span class="badge">${escapeHtml(character.classe || "Classe pendente")}</span>
                <span class="badge">${escapeHtml(character.origem || "Origem pendente")}</span>
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
  headerActions.innerHTML = `
    <button class="button ghost compact" id="cancel-creator" type="button">Cancelar</button>
  `;
  document.querySelector("#cancel-creator").addEventListener("click", () => navigate("home"));

  app.innerHTML = `
    <section class="wizard-shell">
      <aside class="wizard-sidebar panel">
        <p class="eyebrow">Novo arquivo</p>
        <h2>Criação de agente</h2>
        <p class="muted small">A base está pronta. As validações completas entrarão com os livros de referência.</p>
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
      <p class="eyebrow">Etapa 1 de 5</p>
      <h1>Quem é o agente?</h1>
      <p class="muted">Comece com as informações usadas para identificar a ficha na mesa.</p>
      <div class="form-grid">
        ${field("Nome do agente", "nome", creatorState.nome, "Ex.: Arthur Cervero", true)}
        ${field("Nome do jogador", "jogador", creatorState.jogador, "Ex.: Pedro")}
      </div>
    `;
  }

  if (currentStep === 1) {
    return `
      <p class="eyebrow">Etapa 2 de 5</p>
      <h1>Formação</h1>
      <p class="muted">O catálogo completo será adicionado a partir dos seus materiais. Por enquanto, a seleção básica já funciona.</p>
      <div class="form-grid">
        <div class="field">
          <label for="origem">Origem</label>
          <input id="origem" name="origem" value="${escapeAttribute(creatorState.origem)}" placeholder="Digite a origem" />
        </div>
        <div class="field">
          <label for="classe">Classe</label>
          <select id="classe" name="classe">
            ${selectOptions(["", "Combatente", "Especialista", "Ocultista"], creatorState.classe, "Selecione")}
          </select>
        </div>
        ${numberField("NEX (%)", "nex", creatorState.nex, 0, 100)}
        ${field("Patente", "patente", creatorState.patente, "Ex.: Recruta")}
      </div>
    `;
  }

  if (currentStep === 2) {
    return `
      <p class="eyebrow">Etapa 3 de 5</p>
      <h1>Atributos</h1>
      <p class="muted">Use os controles para registrar os valores. A distribuição automática será ligada após mapearmos todas as regras.</p>
      <div class="attribute-grid">
        ${Object.entries(ATTRIBUTE_LABELS)
          .map(
            ([key, label]) => `
              <div class="attribute-control">
                <strong>${label}</strong>
                <input class="attribute-number" id="attr-${key}" inputmode="numeric" type="number" min="0" max="9" value="${numberOr(creatorState.atributos[key], 1)}" aria-label="${label}" />
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
    return `
      <p class="eyebrow">Etapa 4 de 5</p>
      <h1>Recursos principais</h1>
      <p class="muted">Defina os valores iniciais. Eles poderão ser alterados durante a sessão pela ficha.</p>
      <div class="resource-grid">
        ${resourceFields("PV", "pv", creatorState.recursos.pvAtual, creatorState.recursos.pvMax)}
        ${resourceFields("PE", "pe", creatorState.recursos.peAtual, creatorState.recursos.peMax)}
        ${resourceFields("SAN", "san", creatorState.recursos.sanAtual, creatorState.recursos.sanMax)}
      </div>
      <div class="form-grid">
        ${numberField("Defesa", "defesa", creatorState.defesa, 0, 99)}
        ${numberField("Deslocamento (m)", "deslocamento", creatorState.deslocamento, 0, 99)}
        ${field("Proteção", "protecao", creatorState.protecao, "Ex.: Leve")}
      </div>
    `;
  }

  return `
    <p class="eyebrow">Etapa 5 de 5</p>
    <h1>Revisar arquivo</h1>
    <p class="muted">Confira as informações principais. Depois de salvar, todos os campos de sessão continuarão editáveis.</p>
    <div class="review-list">
      ${reviewRow("Agente", creatorState.nome || "Sem nome")}
      ${reviewRow("Jogador", creatorState.jogador || "Não informado")}
      ${reviewRow("Formação", `${creatorState.origem || "Origem pendente"} · ${creatorState.classe || "Classe pendente"}`)}
      ${reviewRow("Progressão", `NEX ${numberOr(creatorState.nex, 5)}% · ${creatorState.patente || "Sem patente"}`)}
      ${reviewRow("Recursos", `PV ${creatorState.recursos.pvMax} · PE ${creatorState.recursos.peMax} · SAN ${creatorState.recursos.sanMax}`)}
    </div>
  `;
}

function bindCreatorStep() {
  document.querySelectorAll("[data-attribute]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(`#attr-${button.dataset.attribute}`);
      const next = clamp(numberOr(input.value, 0) + Number(button.dataset.delta), 0, 9);
      input.value = String(next);
    });
  });
}

function advanceCreator() {
  saveCreatorFields();
  if (currentStep === 0 && !creatorState.nome.trim()) {
    showToast("Informe o nome do agente para continuar.");
    document.querySelector("#nome")?.focus();
    return;
  }

  if (currentStep < STEPS.length - 1) {
    currentStep += 1;
    renderCreator();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

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
    creatorState.classe = value("classe") || "";
    creatorState.nex = clamp(numberOr(value("nex"), 5), 0, 100);
    creatorState.patente = value("patente")?.trim() || "";
  }

  if (currentStep === 2) {
    Object.keys(ATTRIBUTE_LABELS).forEach((key) => {
      creatorState.atributos[key] = clamp(numberOr(value(`attr-${key}`), 1), 0, 9);
    });
  }

  if (currentStep === 3) {
    ["pv", "pe", "san"].forEach((resource) => {
      const max = Math.max(0, numberOr(value(`${resource}-max`), 0));
      const current = clamp(numberOr(value(`${resource}-atual`), max), 0, max);
      creatorState.recursos[`${resource}Max`] = max;
      creatorState.recursos[`${resource}Atual`] = current;
    });
    creatorState.defesa = Math.max(0, numberOr(value("defesa"), 10));
    creatorState.deslocamento = Math.max(0, numberOr(value("deslocamento"), 9));
    creatorState.protecao = value("protecao")?.trim() || "Nenhuma";
  }
}

function renderSheet(id) {
  const character = getCharacter(id);
  if (!character) {
    showToast("Ficha não encontrada.");
    navigate("home");
    return;
  }

  headerActions.innerHTML = `
    <button class="button ghost compact" id="back-home" type="button">Arquivos</button>
    <button class="button compact" id="edit-core" type="button">Editar dados</button>
  `;

  app.innerHTML = `
    <section class="sheet-layout">
      <aside class="sheet-sidebar panel">
        <div class="agent-identity">
          <p class="eyebrow">Arquivo ativo</p>
          <h1>${escapeHtml(character.nome || "Agente sem nome")}</h1>
          <p class="muted">${escapeHtml(character.jogador || "Jogador não informado")}</p>
          <div class="badge-row">
            <span class="badge red">NEX ${numberOr(character.nex, 5)}%</span>
            <span class="badge">${escapeHtml(character.classe || "Sem classe")}</span>
            <span class="badge">${escapeHtml(character.origem || "Sem origem")}</span>
          </div>
        </div>

        <div class="sheet-resources">
          ${liveResource("PV", "pv", character.recursos.pvAtual, character.recursos.pvMax)}
          ${liveResource("PE", "pe", character.recursos.peAtual, character.recursos.peMax)}
          ${liveResource("SAN", "san", character.recursos.sanAtual, character.recursos.sanMax)}
        </div>

        <div class="status-line"><span class="status-dot"></span> Salvo neste dispositivo</div>
      </aside>

      <section class="sheet-main panel">
        <div class="sheet-section">
          <div class="section-heading">
            <h2>Atributos</h2>
            <span class="muted small">Valores atuais</span>
          </div>
          <div class="sheet-attributes">
            ${Object.entries(ATTRIBUTE_LABELS)
              .map(
                ([key, label]) => `
                  <div class="sheet-attribute">
                    <span>${label}</span>
                    <strong>${numberOr(character.atributos[key], 1)}</strong>
                  </div>
                `,
              )
              .join("")}
          </div>
        </div>

        <div class="sheet-section">
          <div class="section-heading"><h2>Combate</h2></div>
          <div class="stat-grid">
            ${statCard("Defesa", character.defesa)}
            ${statCard("Deslocamento", `${character.deslocamento} m`)}
            ${statCard("Proteção", character.protecao || "Nenhuma")}
          </div>
        </div>

        ${notesSection("Perícias", "pericias", character.pericias, "Anote treinamentos, bônus e observações de perícias.")}
        ${notesSection("Inventário", "inventario", character.inventario, "Equipamentos, armas, proteções e itens de investigação.")}
        ${notesSection("Habilidades e rituais", "habilidades", character.habilidades, "Poderes, habilidades, rituais e custos.")}
        ${notesSection("Anotações", "anotacoes", character.anotacoes, "Pistas, contatos e lembretes da sessão.")}
      </section>
    </section>
  `;

  document.querySelector("#back-home").addEventListener("click", () => navigate("home"));
  document.querySelector("#edit-core").addEventListener("click", () => editCharacterCore(character));

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

function numberField(label, id, value, min, max) {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" name="${id}" type="number" inputmode="numeric" min="${min}" max="${max}" value="${numberOr(value, min)}" />
    </div>
  `;
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
