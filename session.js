const HISTORY_LIMIT = 30;

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeSession(character) {
  character.controleSessao ??= {};
  const session = character.controleSessao;
  session.turno = Math.max(1, Math.trunc(numberOr(session.turno, 1)));
  session.cena = Math.max(1, Math.trunc(numberOr(session.cena, 1)));
  session.gastoTurno = Math.max(0, numberOr(session.gastoTurno, 0));
  session.usosCena = session.usosCena && typeof session.usosCena === "object"
    ? Object.fromEntries(
        Object.entries(session.usosCena)
          .filter(([key, value]) => key && numberOr(value, 0) > 0)
          .map(([key, value]) => [key, Math.max(0, Math.trunc(numberOr(value, 0)))]),
      )
    : {};
  session.usosSessao = session.usosSessao && typeof session.usosSessao === "object"
    ? Object.fromEntries(
        Object.entries(session.usosSessao)
          .filter(([key, value]) => key && numberOr(value, 0) > 0)
          .map(([key, value]) => [key, Math.max(0, Math.trunc(numberOr(value, 0)))]),
      )
    : {};
  session.historico = Array.isArray(session.historico)
    ? session.historico
        .filter((entry) => entry && entry.id && entry.name)
        .slice(-HISTORY_LIMIT)
    : [];
  return session;
}

export function effortResource(character) {
  const determination = Boolean(character.optionalRules?.determination);
  return determination
    ? { label: "PD", currentKey: "pdAtual", maxKey: "pdMax" }
    : { label: "PE", currentKey: "peAtual", maxKey: "peMax" };
}

export function progressLevel(character) {
  if (character.optionalRules?.separateLevelNex) {
    return clamp(Math.trunc(numberOr(character.nivel, 1)), 1, 20);
  }
  const nex = clamp(numberOr(character.nex, 0), 0, 100);
  return clamp(Math.round(nex / 5), 1, 20);
}

export function turnSpendLimit(character, { hasFacingDeath = false, ritual = false, hasPowerfulPresence = false } = {}) {
  if (character?.classe === "Sobrevivente") return 1;
  let limit = progressLevel(character);
  if (hasFacingDeath) limit += character.afinidadeElemental === "Morte" ? 2 : 1;
  if (ritual && hasPowerfulPresence) {
    limit += Math.max(0, Math.trunc(numberOr(character.atributos?.presenca, 0)));
  }
  return Math.max(1, limit);
}

export function parseUseCost(cost) {
  const text = String(cost ?? "").trim();
  const normalized = text.toLowerCase();
  if (!text || /^(passivo|automático|automatico|nenhum|—)$/.test(normalized)) {
    return { kind: "none", min: 0, max: 0, resource: "effort" };
  }
  if (/conforme (o poder|os rituais|o ritual)$/.test(normalized)) {
    return { kind: "none", min: 0, max: 0, resource: "effort" };
  }
  if (/1 vez por cena/.test(normalized)) {
    return { kind: "scene", min: 0, max: 0, resource: "effort", sceneLimit: 1 };
  }
  if (/1 vez por sess[aã]o/.test(normalized)) {
    return { kind: "session", min: 0, max: 0, resource: "effort", sessionLimit: 1 };
  }
  const pv = text.match(/(\d+)\s*PV/i);
  if (pv) {
    const value = Number(pv[1]);
    return { kind: "fixed", min: value, max: value, resource: "pv" };
  }
  const sanityDice = text.match(/(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?\s*SAN/i);
  if (sanityDice) {
    const diceCount = Number(sanityDice[1]);
    const diceSides = Number(sanityDice[2]);
    const modifier = Number(sanityDice[4] ?? 0) * (sanityDice[3] === "-" ? -1 : 1);
    return {
      kind: "random",
      min: Math.max(0, diceCount + modifier),
      max: Math.max(0, diceCount * diceSides + modifier),
      resource: "san",
      diceCount,
      diceSides,
      modifier,
    };
  }
  const sanity = text.match(/(\d+)\s*SAN/i);
  if (sanity) {
    const value = Number(sanity[1]);
    return { kind: "fixed", min: value, max: value, resource: "san" };
  }
  const range = text.match(/(\d+)\s*(?:a|até)\s*(\d+)\s*PE/i);
  if (range) {
    return { kind: "variable", min: Number(range[1]), max: Number(range[2]), resource: "effort" };
  }
  const scalable = text.match(/(\d+)\s*PE\s*(?:ou mais|por\b)/i);
  if (scalable) {
    return { kind: "variable", min: Number(scalable[1]), max: 20, resource: "effort" };
  }
  const fixed = text.match(/(\d+)\s*PE/i);
  if (fixed) {
    const value = Number(fixed[1]);
    return { kind: "fixed", min: value, max: value, resource: "effort" };
  }
  if (/conforme (o uso|o item)|igual ao custo/i.test(normalized)) {
    return { kind: "variable", min: 0, max: 20, resource: "effort" };
  }
  return { kind: "action", min: 0, max: 0, resource: "effort" };
}

export function rollUseCost(model, random = Math.random) {
  if (model?.kind !== "random") return Math.max(0, Math.trunc(numberOr(model?.min, 0)));
  const count = Math.max(0, Math.trunc(numberOr(model.diceCount, 0)));
  const sides = Math.max(1, Math.trunc(numberOr(model.diceSides, 1)));
  let total = Math.trunc(numberOr(model.modifier, 0));
  for (let index = 0; index < count; index += 1) {
    total += Math.floor(clamp(numberOr(random(), 0), 0, 0.999999999) * sides) + 1;
  }
  return Math.max(0, total);
}

export function useAbility(character, use) {
  const session = normalizeSession(character);
  const cost = Math.max(0, Math.trunc(numberOr(use.cost, 0)));
  const sceneKey = String(use.sceneKey ?? "");
  const sessionKey = String(use.sessionKey ?? "");
  if (use.sceneLimit && numberOr(session.usosCena[sceneKey], 0) >= use.sceneLimit) {
    return { ok: false, reason: "scene", message: "Esta habilidade já atingiu o limite nesta cena." };
  }
  if (use.sessionLimit && numberOr(session.usosSessao[sessionKey], 0) >= use.sessionLimit) {
    return { ok: false, reason: "session", message: "Esta habilidade já atingiu o limite nesta sessão." };
  }

  let currentKey = "";
  let maxKey = "";
  let resourceLabel = "";
  let countsAgainstTurn = false;
  if (use.resource === "pv") {
    currentKey = "pvAtual";
    maxKey = "pvMax";
    resourceLabel = "PV";
  } else if (use.resource === "san") {
    currentKey = "sanAtual";
    maxKey = "sanMax";
    resourceLabel = "SAN";
  } else if (cost > 0) {
    const resource = effortResource(character);
    currentKey = resource.currentKey;
    maxKey = resource.maxKey;
    resourceLabel = resource.label;
    countsAgainstTurn = true;
  }

  const survivorMinimumUse = character?.classe === "Sobrevivente" && session.gastoTurno === 0;
  if (countsAgainstTurn && !survivorMinimumUse && session.gastoTurno + cost > numberOr(use.turnLimit, 1)) {
    const remaining = Math.max(0, numberOr(use.turnLimit, 1) - session.gastoTurno);
    return {
      ok: false,
      reason: "turn",
      message: `Limite do turno excedido. Você ainda pode gastar ${remaining} ${resourceLabel}.`,
    };
  }
  if (currentKey && numberOr(character.recursos?.[currentKey], 0) < cost) {
    return { ok: false, reason: "resource", message: `${resourceLabel} insuficiente para este uso.` };
  }

  if (currentKey) character.recursos[currentKey] = Math.max(0, numberOr(character.recursos[currentKey], 0) - cost);
  if (countsAgainstTurn) session.gastoTurno += cost;
  if (sceneKey) session.usosCena[sceneKey] = numberOr(session.usosCena[sceneKey], 0) + 1;
  if (sessionKey) session.usosSessao[sessionKey] = numberOr(session.usosSessao[sessionKey], 0) + 1;

  const record = {
    id: String(use.id),
    name: String(use.name),
    type: String(use.type ?? "habilidade"),
    cost,
    resource: resourceLabel,
    currentKey,
    maxKey,
    countsAgainstTurn,
    sceneKey,
    sessionKey,
    turno: session.turno,
    cena: session.cena,
    usedAt: new Date().toISOString(),
  };
  session.historico = [...session.historico, record].slice(-HISTORY_LIMIT);
  return { ok: true, record };
}

export function undoLastUse(character) {
  const session = normalizeSession(character);
  const record = session.historico.pop();
  if (!record) return { ok: false, message: "Ainda não há uso para desfazer." };
  if (record.currentKey) {
    const maximum = Math.max(0, numberOr(character.recursos?.[record.maxKey], Number.MAX_SAFE_INTEGER));
    character.recursos[record.currentKey] = Math.min(
      maximum,
      numberOr(character.recursos?.[record.currentKey], 0) + numberOr(record.cost, 0),
    );
  }
  if (record.countsAgainstTurn && record.turno === session.turno && record.cena === session.cena) {
    session.gastoTurno = Math.max(0, session.gastoTurno - numberOr(record.cost, 0));
  }
  if (record.sceneKey && record.cena === session.cena) {
    const remaining = Math.max(0, numberOr(session.usosCena[record.sceneKey], 0) - 1);
    if (remaining) session.usosCena[record.sceneKey] = remaining;
    else delete session.usosCena[record.sceneKey];
  }
  if (record.sessionKey) {
    const remaining = Math.max(0, numberOr(session.usosSessao[record.sessionKey], 0) - 1);
    if (remaining) session.usosSessao[record.sessionKey] = remaining;
    else delete session.usosSessao[record.sessionKey];
  }
  return { ok: true, record };
}

export function startNextTurn(character) {
  const session = normalizeSession(character);
  session.turno += 1;
  session.gastoTurno = 0;
  return session;
}

export function startNextScene(character) {
  const session = normalizeSession(character);
  session.cena += 1;
  session.turno = 1;
  session.gastoTurno = 0;
  session.usosCena = {};
  return session;
}

export function startNewSession(character) {
  const session = normalizeSession(character);
  session.cena = 1;
  session.turno = 1;
  session.gastoTurno = 0;
  session.usosCena = {};
  session.usosSessao = {};
  session.historico = [];
  return session;
}
