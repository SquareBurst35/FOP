// Abstract RPG dice scene. This module never connects to an external system.
import { integer, finite, die, roll, transaction } from './dice.js';
export const HACKING_RULES = {
  id: 'as4-hacking', name: 'Hacking', source: 'Arquivos Secretos #4', sourcePage: 72, sourcePages: [72, 73],
  actionsPerTurn: 2, initialDiceAttribute: 'intelecto', security: 'DT de Hackear definida pelo mestre',
  actions: [
    { id: 'brecha', name: 'Procurar Brechas', rank: 5, dc: 15, dcPerPreviousAttempt: 5 },
    { id: 'codigo', name: 'Quebrar Códigos', rank: 5, cost: 'dados virtuais escolhidos', effect: 'soma dos d6 reduz PS' },
    { id: 'rastro', name: 'Cobrir Rastros', rank: 10, dc: 'PS máximos', effect: 'próxima rolagem de dados virtuais rerrola resultados 1 uma vez' },
    { id: 'backdoor', name: 'Programar Backdoor', rank: 10, cost: 'dados virtuais descartados', effect: 'um acesso posterior por dado' },
    { id: 'virus', name: 'Plantar Vírus', rank: 15, cost: 1, effect: 'notificações narrativas do mestre; cada interação rola 1d4, removido com 1' },
  ],
  incidents: ['Sem imprevisto', '−2 Tecnologia no próximo turno', 'Perde um dado virtual', 'Sistema recupera 2d6 PS', 'Sistema recupera todos os PS; progresso perdido'],
};
export function createHacking({ intellect, rank, security, deviceAvailable }) {
  if (rank < 5 || !deviceAvailable) return { ok: false, message: 'Requer Tecnologia treinada e dispositivo disponível.' };
  return transaction({}, state => {
    const max = integer(security, 1, 1000);
    Object.assign(state, { maximum: max, security: max, virtualDice: integer(intellect, 0, 100), turn: 1, actions: 0, attempts: 0, ones: 0, penalty: 0, rerollOnes: false, backdoors: [], virus: false, accessed: false });
  });
}
export function hackingAction(state, id, input = {}, random = Math.random) {
  return transaction(state, next => {
    if (id === 'access') {
      const access = next.backdoors.find(b => b.device === String(input.device) && b.uses > 0);
      if (!access) throw new Error('Nenhum acesso reservado para esse dispositivo.');
      access.uses--; next.accessed = true;
      return { message: 'Acesso disponível por uma cena.' };
    }
    if (id === 'interaction') {
      if (!next.virus) throw new Error('Nenhum efeito de monitoramento ativo.');
      const result = die(4, random); if (result === 1) next.virus = false;
      return { roll: result, message: result === 1 ? 'Efeito de monitoramento removido.' : 'O mestre informa a interação narrativa.' };
    }
    if (id === 'closeAccess') { next.accessed = false; return { message: 'Acesso encerrado; outro acesso exige nova cena ou reserva.' }; }
    if (next.security <= 0) throw new Error('A segurança já foi superada.');
    if (id === 'nextTurn') {
      const incident = Math.min(4, next.ones);
      next.penalty = incident === 1 ? -2 : 0;
      if (incident === 2) next.virtualDice = Math.max(0, next.virtualDice - 1);
      let recovery = null;
      if (incident === 3) { recovery = roll('2d6', random); next.security = Math.min(next.maximum, next.security + recovery.total); }
      if (incident === 4) next.security = next.maximum;
      next.turn++; next.actions = 0; next.ones = 0;
      return { incident, roll: recovery, message: HACKING_RULES.incidents[incident] };
    }
    const definition = HACKING_RULES.actions.find(a => a.id === id);
    if (!definition) throw new Error('Ação desconhecida.');
    if (finite(input.rank) < definition.rank) throw new Error('Grau de Tecnologia insuficiente.');
    if (next.actions >= 2) throw new Error('As duas ações deste turno já foram usadas.');
    let outcome = {};
    if (id === 'brecha') {
      const dc = 15 + next.attempts * 5;
      const total = finite(input.test) + next.penalty;
      next.attempts++; if (total >= dc) next.virtualDice++;
      outcome = { dc, total, success: total >= dc };
    } else if (id === 'rastro') {
      const total = finite(input.test) + next.penalty;
      if (total >= next.maximum) next.rerollOnes = true;
      outcome = { dc: next.maximum, total, success: total >= next.maximum };
    } else {
      const count = id === 'virus' ? 1 : integer(input.dice, 1, 100);
      if (next.virtualDice < count) throw new Error('Dados virtuais insuficientes.');
      if (id === 'backdoor' && !String(input.device ?? '').trim()) throw new Error('Identifique o dispositivo de acesso.');
      next.virtualDice -= count;
      if (id === 'codigo') {
        const results = Array.from({ length: count }, () => die(6, random));
        const initial = [...results];
        if (next.rerollOnes) { results.forEach((value, i) => { if (value === 1) results[i] = die(6, random); }); next.rerollOnes = false; }
        next.ones += results.filter(value => value === 1).length;
        const damage = results.reduce((a, b) => a + b, 0);
        next.security = Math.max(0, next.security - damage);
        if (!next.security) next.accessed = true;
        outcome = { initial, results, damage };
      } else if (id === 'backdoor') next.backdoors.push({ device: String(input.device).trim(), uses: count });
      else next.virus = true;
    }
    next.actions++;
    return { ...outcome, message: next.accessed ? 'Segurança superada: acesso por uma cena.' : 'Ação registrada.' };
  });
}
