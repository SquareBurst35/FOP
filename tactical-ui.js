import { tacticalActions, tacticalState, performTacticalAction, ownedItems, utilitySkills } from "./tactical.js?v=2";
import { trailPower } from "./tactical-state.js?v=1";
import { DRONE_TYPES } from "./drone-types.js?v=1";
import { SKILLS } from "./rules.js?v=72";
import { ITEMS } from "./items.js?v=60";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
const options = (values, value) => values.map((v) => { const [id, name] = Array.isArray(v) ? v : [v, v]; return `<option value="${esc(id)}" ${id === value ? "selected" : ""}>${esc(name)}</option>`; }).join("");
const select = (key, text, values, value = "") => `<label class="field" for="op-${key}">${esc(text)}<select id="op-${key}" name="${esc(key)}">${options(values, value)}</select></label>`;
const input = (key, text, value = "", type = "text", attrs = "") => `<label class="field" for="op-${key}">${esc(text)}<input id="op-${key}" name="${esc(key)}" type="${type}" value="${esc(value)}" ${attrs}/></label>`;
const num = (key, text, value = "", min = 0, max = 99999) => input(key, text, value, "number", `min="${min}" max="${max}" step="1"`);
const check = (key, text, value = false) => `<label class="skill-option"><input type="checkbox" name="${esc(key)}" ${value ? "checked" : ""}/><span>${esc(text)}</span></label>`;
const note = (text) => `<p class="muted small">${esc(text)}</p>`;
const group = (title, body) => `<fieldset class="operation-group"><legend>${esc(title)}</legend>${body}</fieldset>`;
const itemOptions = (c, predicate) => ownedItems(c).filter(predicate).map((v) => [v.id, `${v.name} (${v.quantity})`]);
const droneSelect = (s, optional = false) => select("droneId", "Drone", [...(optional ? [["", "Sem ajuda de drone"]] : []), ...s.drones.map((d) => [d.id, `${d.name}${d.available ? "" : " · indisponível"}`])]);

export function renderTacticalPanel(c) {
  const s = tacticalState(c), actions = tacticalActions(c);
  return `<details class="operation-panel"><summary><span><strong>Mesa de operações</strong><small>AS #9 · cena ${s.scene} · turno ${s.turn}</small></span><span class="badge">${s.pool || 0}d6 de tática</span></summary><div class="entry-body">
    ${s.lastResult ? `<div class="operation-result" role="status"><strong>${esc(s.lastResult.name)}</strong><p>${esc(s.lastResult.message)}</p></div>` : note("Escolha uma ação. A ficha calcula os dados, registra o resultado e desconta os recursos ao confirmar.")}
    ${s.dazzled?.some((v) => v.active) ? note(`Ofuscados pela lanterna: ${s.dazzled.filter((v) => v.active).map((v) => v.target).join(", ")}.`) : ""}
    ${s.taserEffects?.length ? note(`Atordoados pela pistola taser: ${s.taserEffects.map((v) => v.target).join(", ")}.`) : ""}
    ${s.priority ? note(`Alvo-prioritário: ${s.priority.target} · VD ${s.priority.vd}`) : ""}
    ${s.cover ? note("Cobertura leve do escudo ativa: +5 Defesa contra ataques à distância. Registre o deslocamento para encerrá-la.") : ""}
    ${s.effects.length ? `<ul class="operation-effects">${s.effects.map((e) => `<li>${esc(e.name)}${e.tests ? ` · +${e.tests} testes e Defesa` : ""}${e.untilTurn != null ? ` · até o fim do turno ${e.untilTurn}` : " · até o fim da cena"}</li>`).join("")}</ul>` : ""}
    ${s.drones.length ? `<ul class="operation-effects">${s.drones.map((d) => `<li><strong>${esc(d.name)}</strong> · ${d.available ? "disponível" : "indisponível"} · ${d.types.map((id) => esc(DRONE_TYPES.find((v) => v.id === id)?.name)).join(" / ") || "defina o tipo"}${d.companion ? " · companheiro" : ` · categoria ${d.category}`}${d.skill ? ` · ${esc(d.skill)}` : ""}</li>`).join("")}</ul>` : ""}
    <div class="operation-actions">${actions.map(([id, name, help]) => `<button type="button" class="button ghost compact" data-operation="${esc(id)}" title="${esc(help)}">${esc(name)}</button>`).join("")}</div>
    ${s.preparationCapacity ? note(`Municiar: ainda pode preparar ${s.preparationCapacity} pacote(s).`) : ""}
    ${s.looseDarts ? note(`Dardos de reserva fora de pacotes: ${s.looseDarts}.`) : ""}
    ${s.rounds40mm?.length ? note(`Munição de 40 mm: ${s.rounds40mm.map((v) => `${v.name}: ${v.quantity}`).join("; ")}.`) : ""}
    ${s.plan ? note(`Plano: ${s.plan.target}. Participantes: ${s.plan.participants.join(", ")}.`) : ""}
    ${s.lastResult ? note("O botão Desfazer em Último uso restaura também os recursos, itens e efeitos desta ação.") : ""}
  </div></details>`;
}

export function tacticalForm(c, action) {
  const s = tacticalState(c);
  if (["turn", "scene", "interlude", "mission", "move", "cover", "smoke"].includes(action)) return note({ turn: "Avançar para seu próximo turno encerra reações pendentes e efeitos vencidos, libera a reação especial e zera os reféns distintos desta rodada.", scene: "Encerrar esta cena remove os efeitos de cena, imunidades de lanterna/taser e limites de cena. Dados de tática permanecem até o próximo interlúdio.", mission: "Iniciar uma nova missão encerra a cena, descarta os dados de tática, remove o aliado atual e a marca de alvo-prioritário e libera novas escolhas de perícia para Ryder.", interlude: "Iniciar outro interlúdio descarta os dados de tática restantes e permite um novo planejamento.", move: "Ao se deslocar, a cobertura fornecida pelo escudo termina.", cover: "Movimento: cobertura leve para você e seres Médios ou menores atrás de você. O bônus situacional de +5 só vale contra ataques à distância.", smoke: "Movimento: uma nuvem ao redor do veículo, com os efeitos da granada de fumaça. Uma ativação por cena." }[action]);
  if (["analyze", "plan"].includes(action)) return num("roll", "Resultado total de Tática (vazio: rolar automaticamente)", "", -99, 999) + (action === "plan" ? input("target", "Ameaça futura específica") + input("participants", "Aliados que participam (nomes separados por vírgulas)") + note("Uma ação de interlúdio. Seus dados só podem ajudar os participantes a enfrentar essa ameaça; não precisam estar próximos.") : note("Uma ação de movimento. O bônus dura até o fim do próximo turno; esta ação só pode ser feita uma vez por cena."));
  if (action === "prepare") return select("mode", "Etapa", [["roll", "Rolar capacidade de uma ação de interlúdio"], ["prepare", "Preparar pacotes com a capacidade já rolada"]], s.preparationCapacity ? "prepare" : "roll") + select("itemId", "Pacotes carregados", itemOptions(c, (v) => v.group === "Munições")) + num("count", "Pacotes a preparar", 1, 1, 99) + note(`Capacidade restante: ${s.preparationCapacity || 0}. Preparar não cria munição; só retira seu peso do inventário.`);
  if (action === "tactic") return select("target", "Participante beneficiado", s.plan?.participants ?? []) + select("kind", "Aplicar o resultado a", ["teste", "dano", "cura"]) + num("count", "Quantidade de d6 a gastar", 1, 1, s.pool) + num("baseTotal", "Resultado-base antes do bônus de tática", 0, -9999, 99999) + check("self", "Em cura, aplicar o total nos meus PV (escolha seu nome como participante)") + check("related", `O uso faz parte do plano contra: ${s.plan?.target}`) + note("O resultado é registrado aqui. Ao beneficiar outro personagem, aplique o número informado na rolagem dele.");
  if (action === "riposte") return check("before", "O ataque é corpo a corpo e ainda não foi resolvido") + note("Consome sua reação especial de defesa e 2 PE. A ficha reserva +5 Defesa apenas contra este ataque; depois use Resolver Ripostar Ousado.");
  if (action === "resolveRiposte") return num("incoming", "Resultado total do ataque recebido", 0) + check("incomingNatural20", "O atacante obteve 20 natural") + select("itemId", "Arma usada no contra-ataque", itemOptions(c, (v) => v.group === "Armas")) + num("dt", "Defesa do alvo do contra-ataque", 10) + input("target", "Identificação do alvo") + num("targetPv", "PV atuais do alvo (opcional)", "") + num("incomingDamage", "Dano recebido já resolvido pela mesa (se o ataque acertar)", 0) + check("applyIncoming", "Descontar o dano recebido dos meus PV", true) + note("A ficha verifica o acerto contra a Defesa da reação e rola Luta, somando +5 se o atacante errou.");
  if (action === "hostage") return input("target", "Identificação do refém (use sempre o mesmo nome)") + num("distance", "Distância em metros", 3, 0, 3) + check("damageEffect", "O efeito é dano") + num("damage", "Dano que será transferido para você", 0) + check("half", "Gastar +2 PE para sofrer metade do dano (total 4 PE)") + input("effect", "Outro efeito negativo (quando não for dano)") + note(`Reféns distintos nesta rodada: ${s.hostages.join(", ") || "nenhum"}. Use Próximo turno para iniciar outra rodada. Informe o dano já resolvido pela mesa antes desta redução.`);
  if (action === "mark") return input("target", "Identificação do inimigo") + num("vd", "VD informado pelo mestre", "") + check("visible", "O inimigo está na minha linha de visão") + note("5 PE. A marca dura até eliminar o inimigo ou escolher outro; use a mesma identificação no ataque para aplicar o benefício.");
  if (action === "deploy") return select("itemId", "Explosivo carregado", itemOptions(c, (v) => /mina antipessoal|carga de arrombamento/i.test(v.name))) + note("1 PE, ação de movimento. A unidade implantada sai do inventário; em um teste para posicioná-la, marque Explosivos para incluir +5.");
  if (action === "taserSave") return note(`${s.taserPending?.target}: Fortitude DT ${s.taserPending?.dt} evita atordoamento por 1 rodada.`) + num("fortitude", "Resultado total de Fortitude do alvo", "", -99, 999) + check("fortitudeNatural20", "O alvo obteve 20 natural na resistência") + check("waiveStun", "A mesa retirou o limite por alvo/cena");
  if (action === "incoming" || action === "axe") return num("damage", "Dano total recebido antes das reduções", 0) + num("reduction", "RD aplicável ao dano (bloqueio incluso)", 0) + check("ballistic", "Dano balístico (considera RD 10 do escudo, se carregado)") + check("helmet", "Usar capacete tático contra dano adicional de crítico/furtivo") + num("extraDamage", "Parte do dano total que é adicional de crítico/furtivo", 0) + note(action === "axe" ? "2 PE e reação especial de defesa. Um machado é destruído; +20 RD no bloqueio e desconto do dano restante nos PV." : "O capacete rola 1d4: com 1, ignora só a parte adicional. O resultado final é descontado dos PV.");
  if (action === "flash") return input("target", "Identificação do alvo") + num("distance", "Distância em metros (cone de 9 m)", 3, 0, 9) + check("shortRange", "O alvo está em alcance curto") + note("Movimento: ofuscado por 1 rodada; depois fica imune a esta lanterna até outra cena.");
  if (action === "test" || action === "attack") return group(action === "attack" ? "Ataque" : "Teste", (action === "attack" ? select("itemId", "Arma carregada", itemOptions(c, (v) => v.group === "Armas")) + input("target", "Identificação do alvo") + num("dt", "Defesa do alvo", 10) + num("targetPv", "PV atuais do alvo (opcional)", "") + select("range", "Alcance do ataque", [["curto", "Curto"], ["medio", "Médio"], ["longo", "Longo"], ["extremo", "Extremo"]]) + num("damageBonus", "Outros bônus de dano (Força é automática em corpo a corpo/arremesso)", 0, -999, 999) + num("targetReduction", "RD do alvo aplicável a este dano", 0) + check("agile", "Usar Agilidade em Luta com uma arma ágil") + check("counterAttack", "Ação especial contra-ataque (machado: +2 no teste)") + check("aim", "Fiz a ação mirar") + check("thrown", "Arremessei a arma") + check("engaged", "Alvo engajado em corpo a corpo (−5 Pontaria)") + check("cqb", "Usar CQB para anular essa penalidade (1 PE)") + check("intuitive", "Usar Tiro Intuitivo sem mirar (2 PE)") + check("sneak", "Usar Ataque Furtivo (1 PE se acertar); DMR permite alcance médio") + check("vulnerable", "Alvo desprevenido ou flanqueado para Ataque Furtivo") : select("skill", "Perícia", SKILLS) + num("dt", "DT (opcional; necessária para refazer falhas)", "")) + num("bonus", "Outros bônus neste teste", 0, -999, 999) + num("penalty", "Outras penalidades numéricas", 0, -99, 0) + num("penaltyDice", "Penalidade em dados (ex.: −1d20)", 0, -10, 0) + check("fmj", "Usar Full Metal Jacket para ignorar penalidades (2 PE)") + check("explosives", "Teste para implantar/utilizar explosivo") + check("ram", "Teste de arrombamento com aríete portátil (+10)") + check("borescope", "Investigar/perceber usando o boroscópio (visão no escuro)") + num("scopeDistance", "Distância do cabo do boroscópio em metros", 3, 0, 3) + check("twoHands", "Empunhando o boroscópio com duas mãos")) + group("Ajuda de drone", droneSelect(s, true) + note("Escolher um drone confirma que ele ajuda neste teste. Bônus semelhantes não se acumulam.") + check("alert", "Alerta de Ameaça: +5 em resistência (2 PE, protetor)") + check("hackFast", "Acelerar hack como ação completa (2 PE, hacker); indique apenas sua penalidade em dados") + check("vehicleDrone", "Operar o drone dentro da Central de Drones (+5 Tecnologia)") + (action === "attack" ? check("machineGun", "Metralhar Tudo: +2d8 se acertar (2 PE, atirador)") : "")) + (action === "attack" ? group("Equipamento e veículo", check("ammoTracking", "Contar dardos da pistola taser (recarregue antes)") + num("fortitude", "Resultado de Fortitude do alvo da pistola taser (opcional)", "", -99, 999) + check("fortitudeNatural20", "O alvo obteve 20 natural na resistência ao taser") + check("waiveStun", "A mesa retirou o limite de atordoar o mesmo alvo por cena") + check("area", "Granadeira: disparo em um ponto, com resistência para todos") + input("damageFormula", "Dano-base alternativo da arma (opcional; ex.: 1d8)") + check("movingVehicle", "Disparo de veículo em movimento") + num("vehiclePenalty", "Penalidade numérica do veículo em movimento", 0, -99, 0) + check("mounted", "Arma instalada na Estação de Armas (perde a cobertura do veículo)")) : "");
  if (action === "ammo40mm") return input("name", "Nome da granada de 40 mm") + input("damageFormula", "Dano segundo a referência da mesa (ex.: 6d6)") + num("count", "Unidades requisitadas", 1, 1, 99) + select("category", "Categoria da munição", ["0", "I", "II", "III", "IV"]) + input("spaces", "Espaços por unidade", "", "number", 'min="0" max="99" step="0.25"') + check("confirm40mm", "É munição própria de 40 mm, requisitada separadamente (não é granada de arremesso)") + note("O AS #9 remete ao lançador do AS #4. Informe os dados da munição usada pela mesa; nenhuma estatística de granada é presumida. Ela será incluída na carga e consumida na recarga.");
  if (action === "reload") return select("itemId", "Arma a recarregar", itemOptions(c, (v) => ["Pistola Taser", "Lançador de Granadas Portátil"].includes(v.name))) + select("ammoId", "Munição de 40 mm requisitada (apenas para o lançador)", (s.rounds40mm ?? []).map((v, i) => [String(i), `${v.name} (${v.quantity})`])) + note("O lançador comporta uma granada e recarrega com movimento. Na contagem opcional, a pistola taser recebe 10 dardos; um pacote fornece 20, e a reserva restante é preservada.");
  if (action === "droneConfig") return droneSelect(s) + `<div data-drone-config-fields>${droneConfigFields(s.drones[0])}</div>` + note("O tipo base e a perícia utilitária são permanentes. A trilha isenta modificações de categoria para os companheiros. Modificações que excedem a isenção elevam a categoria a IV; os sete tipos nunca se repetem.");
  if (action === "drone") return droneSelect(s) + `<div data-drone-action-body>${droneActionBody(c, s.drones[0])}</div>`;

  if (action === "central") return droneSelect(s) + note("Guardar ou pegar um drone como ação livre. Compartilha o limite de uma vez por rodada da central.");
  if (action === "vehicle") return check("central", "Central de Drones", s.vehicle?.central) + check("station", "Estação de Armas", s.vehicle?.station) + check("smoke", "Lançadores de Fumaça", s.vehicle?.smoke) + note("Marque as regalias que o veículo da mesa possui. Armas e munições são requisitadas separadamente.");
  if (action === "ally") return select("ally", "Aliado concedido pela mesa", [["", "Nenhum"], ["jason", "Jason Bloom"], ["karen", "Karen Brown"], ["troy", "Troy Walker"], ["roy", "Roy Stevens"], ["stella", "Stella Green"], ["arnold", "Arnold Strolley"], ["chloe", "Chloe Grey"], ["ryder", "Ryder Staten"]], s.ally) + select("skill", "Ryder: primeira perícia (fixa na missão)", SKILLS, s.allySkills?.[0]) + select("skill2", "Ryder: segunda perícia", SKILLS, s.allySkills?.[1]);
  if (action === "allyUse" && s.ally === "chloe") return select("variant", "Forma de Nuvem de Cinzas", [["normal", "Normal"], ["discente", "Discente"], ["verdadeiro", "Verdadeiro"]]) + note("Chloe permite conjurar o ritual. Se ele já faz parte dos seus rituais conhecidos, aplica −1 PE ao custo. Exigências de círculo e afinidade continuam valendo.");
  if (action === "allyUse") {
    if (s.ally === "jason") return num("damage", "Dano recebido antes da redução de 10", 0) + note("Reação e 2 PE: reduza 10 do dano e desconte o restante dos seus PV.");
    if (s.ally === "karen") return num("baseTotal", "Dano-base do ataque que já causou dano", 0) + note("2 PE: role 3d6 extras e some ao dano-base. O resultado fica registrado para aplicar ao alvo.");
    if (s.ally === "troy") return note("Ao atacar, uma reação e 5 PE concedem um ataque adicional. Depois de confirmar, use Atacar com equipamento para resolvê-lo.");
    if (s.ally === "roy") return check("self", "Aplicar a habilidade em mim", true) + input("target", "Outro alvo") + check("adjacent", "O outro alvo está adjacente ao Roy") + check("removeCondition", "Remover uma condição em vez de curar") + note("Recupera 3d10 PV ou remove uma condição negativa, exceto morrendo. O quadro de aliado não fornece custo/ação; use o que a mesa decidir.");
    if (s.ally === "stella") return note("2 PE: refaça o último teste falho de Pilotagem registrado na Mesa de operações, uma única vez.");
    if (s.ally === "arnold") return select("itemId", "Explosivo recebido", ITEMS.filter((v) => /granada|explosivo|mina antipessoal|carga de arrombamento/i.test(v.name)).map((v) => [v.id, v.name])) + note("2 PE, uma vez por cena: uma unidade é adicionada ao inventário.");
    if (s.ally === "ryder") return select("formation", "Formação", [["cunha", "Cunha · +5 ataque e Defesa"], ["coluna", "Coluna · +3 m e +5 Furtividade"], ["linha", "Linha · +5 ataque e dano"]]) + note("Movimento e 2 PE: até o início do próximo turno. Os bônus afetam você e os aliados em alcance médio capazes de ouvi-lo; aplique os benefícios também nas fichas deles.");
  }
  return "";
}
function droneActionOptions(c, d) {
  const types = d?.types ?? [];
  const out = d?.available ? [["move", "Deslocar drone · 6 m no solo / 12 m voando"]] : [];
  if (d?.available) {
    if (types.includes("medico")) out.push(["heal", "Robô ao Resgate · 2 PE"]);
    if (types.includes("espiao")) out.push(["thermal", "Visão térmica e interceptação · 2 PE"]);
    if (types.includes("inteligente")) out.push(["arms", "Braços manipuladores · 2 PE"]);
    if (types.includes("utilitario")) out.push(["utilityRetry", "Meu Amigo Drone · refazer falha · 3 PE"]);
    if (types.includes("hacker")) out.push(["hackRetry", "Refazer hack com a mesma informação"], ["avoidTrace", "Evitar rastreamento · 3 PE"]);
    if (trailPower(c, "Piloto de Drone", 40, "protetor-dos-drones")) out.push(["protect", `Evitar efeito negativo · ${trailPower(c, "Piloto de Drone", 99, "mestre-dos-drones") ? 1 : 3} PE`]);
    if (trailPower(c, "Piloto de Drone", 65, "as-dos-drones")) out.push(["retry", "Ás dos Drones · refazer falha · 3 PE"]);
  }
  if (d?.companion) out.push(["repair", "Consertar companheiro · 1 ação de interlúdio"], ["replace", "Substituir companheiro · 2 ações de interlúdio"]);
  return out;
}
function droneActionFields(kind) {
  if (kind === "heal") return check("self", "Cura em mim (aplica nos meus PV)", true) + input("target", "Outro alvo da cura") + check("adjacent", "O alvo está adjacente ao drone") + note("Role 2d8+2 PV por 2 PE. A cura respeita o máximo dos seus PV quando aplicada em você.");
  if (kind === "move") return num("moveDistance", "Deslocamento em metros", 6, 1, 12) + check("fly", "Voando (até 12 m em vez de 6 m)") + input("controllerDistanceKm", "Distância final até o controle, em km", 0, "number", 'min="0" max="999" step="0.001"') + note("Uma ação de movimento do drone por rodada. Além de 5 km do controle, o drone perde o sinal e seus bônus ficam indisponíveis.");
  if (kind === "repair") return check("pieces", "Tenho as peças quebradas para consertar o companheiro") + note("Conserto usa 1 ação de interlúdio; o drone volta a ficar disponível.");
  if (kind === "replace") return note("Adquirir outro companheiro usa 2 ações de interlúdio; o drone volta a ficar disponível.");
  if (kind === "hackRetry") return check("sameInfo", "A nova tentativa usa a mesma informação do hack que falhou") + note("Use o último teste de Tecnologia falho registrado com este drone. Não é possível encadear novas tentativas.");
  if (["retry", "utilityRetry", "avoidTrace"].includes(kind)) return note("Usa o último teste falho com este drone e sua DT. Uma nova tentativa não pode ser refeita outra vez. Evitar rastreamento exige falha por pelo menos 5.");
  if (kind === "protect") return note("Evita o efeito negativo que o drone receberia. O custo já considera Mestre dos Drones e não exige manter o controle nas mãos.");
  return note(kind === "arms" ? "Braços ativos até o fim da cena: carrega até 5 espaços e faz manipulações simples e lentas." : "Até o fim da cena, visão térmica ignora camuflagem e permite captar rádio por Tecnologia; a DT é definida pelo mestre.");
}
function droneActionBody(c, d) {
  const choices = droneActionOptions(c, d);
  if (!choices.length) return note("Drone indisponível. Ajuste sua disponibilidade em Configurar drone quando a mesa resolver o impedimento.");
  return select("kind", "Ação do drone", choices) + `<div data-drone-action-fields>${droneActionFields(choices[0][0])}</div>` + note("Habilidades ativas são ações livres e exigem controle com duas mãos ou tipo Inteligente. Deslocamento e ações de interlúdio usam suas próprias ações.");
}
function droneConfigFields(d) {
  if (!d) return note("Nenhum drone disponível.");
  return input("name", "Nome do drone", d.name) + select("baseType", "Tipo base permanente", DRONE_TYPES.filter((v) => !d.types[0] || v.id === d.types[0]).map((v) => [v.id, v.name]), d.types[0]) + group("Modificações (outros tipos)", DRONE_TYPES.filter((v) => v.id !== d.types[0]).map((v) => check(`type-${v.id}`, v.name, d.types.slice(1).includes(v.id))).join("")) + select("skill", "Perícia permanente (somente tipo Utilitário)", [["", "Selecione"], ...utilitySkills.filter((v) => !d.skill || v === d.skill)], d.skill) + check("available", "Drone disponível (sem dano impeditivo e com sinal)", d.available) + check("operated", "Operando o controle com duas mãos", d.operated);
}

export function openTacticalDialog(c, action, onSave) {
  const available = tacticalActions(c).find(([id]) => id === action);
  if (!available) return;
  document.getElementById("operation-dialog")?.remove();
  const dialog = document.createElement("dialog");
  dialog.id = "operation-dialog"; dialog.setAttribute("aria-labelledby", "operation-dialog-title"); dialog.className = "choice-dialog operation-dialog";
  dialog.innerHTML = `<form><div class="dialog-heading"><h2 id="operation-dialog-title">${esc(available[1])}</h2><button type="button" class="button ghost compact" data-operation-close aria-label="Fechar">×</button></div><p class="muted small">${esc(available[2])}</p><div class="operation-fields">${tacticalForm(c, action)}</div><p data-operation-error role="alert" class="operation-error"></p><div class="dialog-actions"><button type="button" class="button ghost" data-operation-close>Cancelar</button><button type="submit" class="button primary">Confirmar ação</button></div></form>`;
  document.body.append(dialog);
  dialog.querySelectorAll("[data-operation-close]").forEach((b) => b.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("close", () => dialog.remove());
  if (action === "droneConfig") dialog.querySelector('[name="droneId"]').addEventListener("change", (e) => {
    const d = tacticalState(c).drones.find((v) => v.id === e.target.value);
    dialog.querySelector("[data-drone-config-fields]").innerHTML = droneConfigFields(d);
  });
  if (action === "drone") {
    const bindAction = () => dialog.querySelector('[name="kind"]')?.addEventListener("change", (e) => {
      dialog.querySelector("[data-drone-action-fields]").innerHTML = droneActionFields(e.target.value);
    });
    dialog.querySelector('[name="droneId"]').addEventListener("change", (e) => {
      const d = tacticalState(c).drones.find((v) => v.id === e.target.value);
      dialog.querySelector("[data-drone-action-body]").innerHTML = droneActionBody(c, d); bindAction();
    });
    bindAction();
  }
  dialog.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget, params = Object.fromEntries(new FormData(form));
    form.querySelectorAll('input[type="checkbox"]').forEach((el) => { params[el.name] = el.checked; });
    if (action === "droneConfig") params.types = [params.baseType, ...DRONE_TYPES.map((v) => v.id).filter((id) => id !== params.baseType && params[`type-${id}`])];
    const result = performTacticalAction(c, action, params);
    if (!result.ok) { dialog.querySelector("[data-operation-error]").textContent = result.message; return; }
    dialog.close(); onSave(result);
  });
  dialog.showModal();
}
export function bindTacticalPanel(c, onSave) {
  document.querySelectorAll("[data-operation]").forEach((b) => b.addEventListener("click", () => openTacticalDialog(c, b.dataset.operation, onSave)));
}
