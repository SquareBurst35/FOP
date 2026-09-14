import { action, modifier, limit } from './schema.js';
import { finite, integer, roll, transaction } from './dice.js';
export const SUPPLEMENT_SKILL_ACTIONS = [
  { id: 'as4-obter-informacoes', name: 'Obter Informações', source: 'Arquivos Secretos #4', sourcePage: 64, skill: 'Tecnologia', rank: 0, activation: 'completa', dc: 5, requirements: ['acesso à internet', 'pessoa ou local identificado'], effect: 'Uma informação útil e mais uma a cada 5 pontos acima da DT.', action: action('informacoes', 'Obter informações', 0, 'completa', { handler: 'onlineInformation', fields: ['testResult', 'internetAvailable', 'target'] }) },
  { id: 'as5-rastrear-digital', name: 'Rastrear Trilha Digital', source: 'Arquivos Secretos #5', sourcePage: 54, skill: 'Tecnologia', rank: 10, activation: '1d4+1 ações completas', difficulties: { simples: 20, sinuosa: 25, enigmática: 30 }, action: action('rastrear', 'Rastrear trilha digital', 0, '1d4+1 ações completas', { handler: 'digitalTrail', fields: ['testResult', 'digitalDifficulty', 'target'] }) },
  { id: 'as7-resguardar-espirito', name: 'Resguardar Espírito', source: 'Arquivos Secretos #7', sourcePage: 80, skill: 'Religião', rank: 5, activation: 'completa', dc: 20, target: 'Você ou uma pessoa adjacente', effect: '+2 Vontade pela cena. Falha impede nova tentativa no alvo nesta cena.', action: action('resguardar', 'Resguardar espírito', 0, 'completa', { handler: 'guardSpirit', fields: ['testResult', 'recipient', 'target'] }) },
];
export const SUPPLEMENT_CONDITIONS = [
  { id: 'tremulo', name: 'Trêmulo', source: 'Arquivos Secretos #3', sourcePage: 124, summary: '−1d20 nos testes de Força e Vigor por três rodadas.', modifiers: [modifier('forcaDice', -1), modifier('vigorDice', -1)], rounds: 3 },
  { id: 'paixao', name: 'Paixão', source: 'Arquivos Secretos #3', sourcePage: 124, summary: 'A penalidade nos testes contra a pessoa vinculada é a soma dos dois dados registrados para o vínculo.', modifiers: [modifier('testBonus', '-bondRollSum', 'againstBondPartner')] },
];
export const SUPPLEMENT_OPTIONAL_RULES = [
  { id: 'as3-intencoes', name: 'Batalhas de Intenções', source: 'Arquivos Secretos #3', sourcePage: 120, optional: true, summary: 'Dois participantes em duelo recebem +1d10 de dano entre si; recebem metade do dano de outras fontes.', actions: [action('duelo', 'Registrar duelo', 0, 'início do duelo', { handler: 'duelStart', fields: ['target'] }), action('fim', 'Encerrar duelo', 0, 'fim do duelo', { handler: 'duelEnd' })] },
  { id: 'as3-recursos', name: 'Troca de Recursos', source: 'Arquivos Secretos #3', sourcePage: 121, optional: true, summary: 'Um recurso pode ser trocado por uma informação; uma informação secreta exige três recursos.', actions: [action('trocar', 'Registrar troca', 0, 'troca narrativa', { handler: 'tradeResources', fields: ['secretInformation'] })] },
  { id: 'as3-base', name: 'Construção de Base', source: 'Arquivos Secretos #3', sourcePage: 121, optional: true, summary: 'Exige sete dias de trabalho individual, reduzidos em um por participante adicional, mínimo de três dias. Consome todas as ações de trabalho do período.', actions: [action('calcular', 'Calcular duração', 0, 'planejamento', { handler: 'baseBuilding', fields: ['workers'] })] },
  { id: 'as3-dardos', name: 'Máquina de Dardos', source: 'Arquivos Secretos #3', sourcePage: 122, optional: true, summary: 'Três testes de Pontaria. DT 10/15/20/25/30 rende 5/10/15/25/50 pontos; empate é decidido pelo mestre.', actions: [action('jogar', 'Registrar três testes', 0, 'jogo narrativo', { handler: 'darts', fields: ['test1', 'test2', 'test3'] })] },
  { id: 'as3-forca', name: 'Máquina de Força', source: 'Arquivos Secretos #3', sourcePage: 122, optional: true, summary: 'Pontuação igual ao dano desarmado ×100. Antes do teste, cada 2 PV ou 2 PE gastos dão +2 no dano, respeitando o limite de PE por turno. Dano 18 ou mais quebra a máquina na narrativa.', actions: [action('jogar', 'Registrar teste de força', 0, 'antes da rolagem', { handler: 'punchMachine', fields: ['resourceChoice', 'resourceAmount', 'unarmedDamage'] })] },
  { id: 'as3-recordacoes', name: 'Boas Recordações', source: 'Arquivos Secretos #3', sourcePage: 123, optional: true, summary: 'Um evento registrado em foto recupera 1d4 de PV, PE ou SAN. Uma vez por missão, usar a foto com ação padrão concede +1d6 ao próximo teste, válido até o fim do dia.', actions: [action('foto', 'Registrar recordação', 0, 'evento da história', { handler: 'goodMemory', fields: ['recoveryResource', 'memory'] }), action('relembrar', 'Relembrar foto', 0, 'padrão', { handler: 'rememberPhoto', limit: limit('mission') })] },
  { id: 'as3-vinculo', name: 'Vínculo Afetivo', source: 'Arquivos Secretos #3', sourcePage: 124, optional: true, summary: 'Um vínculo mútuo concede uma única vez 1d8 PV e 1d8 PE atuais e máximos enquanto durar. Os dois resultados definem a penalidade de Paixão. O benefício termina com a morte da pessoa vinculada.', actions: [action('vincular', 'Registrar vínculo acordado', 0, 'acordo de personagens', { handler: 'bondStart', fields: ['target', 'mutualAgreement'] }), action('encerrar', 'Encerrar benefício do vínculo', 0, 'fim do vínculo', { handler: 'bondEnd' })] },
  { id: 'as3-animais', name: 'Animais Aliados', source: 'Arquivos Secretos #3', sourcePage: 132, sourcePages: [132, 133, 134], optional: true, summary: 'Treinamento usa folga de relacionamento, sem teste. Animal como aliado já conta como treinado. Como ameaça, é imune a Presença Perturbadora; VD progride pelo NEX do agente e não recebe uma segunda redução de duas categorias.', actions: [action('animal', 'Registrar treinamento do animal', 0, 'folga de relacionamento', { handler: 'trainAnimal', fields: ['target', 'animalAlly'] })] },
  { id: 'as6-categoria-veneno', name: 'Categoria de Veneno por DT', source: 'Arquivos Secretos #6', sourcePage: 76, optional: true, summary: 'No catálogo abstrato do jogo: DT até 10 = categoria 0; 11–15 = I; 16–20 = II; 21–25 = III; 26 ou mais = IV.', actions: [action('categoria', 'Calcular categoria', 0, 'consulta de regra', { handler: 'poisonCategory', fields: ['difficulty'] })] },
  { id: 'as6-evolucao-modular', name: 'Evolução Modular', source: 'Arquivos Secretos #6', sourcePage: 80, sourcePages: [80, 81], optional: true, canonical: false, summary: 'Regra opcional de fã publicada no suplemento: níveis pares a partir do 2 concedem poder de utilidade; ímpares a partir do 3, poder de combate. Pode substituir por poder geral. Versatilidade concede somente a primeira habilidade de outra trilha da mesma classe.' },
  { id: 'as7-submersao', name: 'Regras Debaixo d’Água', source: 'Arquivos Secretos #7', sourcePage: 92, sourcePages: [92, 93], optional: true, canonical: false, summary: 'Percepção visual e auditiva −10; pistas visuais −5 em água turva/escura, cumulativo. Ataques −5 sem deslocamento de natação; armas de fogo alcance 3 m; demais ataques à distância apenas redes, bestas e arremesso perfurante. Armas não naturais de corte/impacto causam metade do dano. Contra fontes externas há cobertura e camuflagem leves. Ritual precisa dispensar fala e gestos. Proteção pesada permite andar 3 m no fundo, ainda exigindo fôlego.', actions: [action('pressao', 'Resolver pressão da rodada', 0, 'início da rodada', { handler: 'underwaterPressure', fields: ['depth', 'fortitudeResult'] })] },
];
export function animalChallenge(nex) {
  const value = Math.max(0, Math.min(99, finite(nex)));
  if (value < 15) return 10;
  if (value >= 99) return 360;
  return Math.min(360, Math.floor(value / 5 - 2) * 20);
}
export const poisonCategory = dc => finite(dc) <= 10 ? '0' : finite(dc) <= 15 ? 'I' : finite(dc) <= 20 ? 'II' : finite(dc) <= 25 ? 'III' : 'IV';
export function dartsScore(tests) {
  if (tests.length !== 3) throw new Error('Informe os três testes.');
  return tests.reduce((sum, result) => sum + (result >= 30 ? 50 : result >= 25 ? 25 : result >= 20 ? 15 : result >= 15 ? 10 : result >= 10 ? 5 : 0), 0);
}
export function underwaterModifiers(context = {}) {
  if (!context.submerged) return { modifiers: [], canCast: true, rangedAllowed: true, damageMultiplier: 1 };
  const modifiers = [modifier('visualPerception', -10), modifier('auditoryPerception', -10)];
  if (context.obscuredWater && !context.underwaterLight && !context.infrared && !context.sonar) modifiers.push(modifier('visualClues', -5));
  if (!context.swimMovement) modifiers.push(modifier('attack', -5));
  const rangedAllowed = !context.ranged || ['firearm', 'piercingThrown', 'crossbow', 'net'].includes(context.weaponKind);
  return { modifiers, canCast: Boolean(context.noRitualSpeech && context.noRitualGestures), rangedAllowed, range: context.weaponKind === 'firearm' ? 3 : null, damageMultiplier: !context.naturalWeapon && ['Corte', 'Impacto'].includes(context.damageType) ? 0.5 : 1, coverAgainstOutside: 'light', concealmentAgainstOutside: 'light', bottomMovement: context.heavyArmor ? 3 : null, breathRequired: true };
}
export function pressureRound(state, { depth, fortitude }, random = Math.random) {
  return transaction(state, next => {
    const meters = finite(depth); if (meters < 0) throw new Error('Profundidade inválida.');
    const band = meters < 50 ? 0 : meters < 100 ? 1 : meters < 300 ? 2 : 3;
    if (next.band !== band) { next.band = band; next.previousChecks = 0; }
    if (!band) return { dc: null, conditions: [], hpLoss: 0 };
    const dc = band === 1 ? 20 : 25 + finite(next.previousChecks) * (band === 3 ? 5 : 1);
    next.previousChecks = finite(next.previousChecks) + 1;
    const success = finite(fortitude) >= dc;
    if (band === 1) return { dc, success, conditions: success ? [] : ['fatigado'], hpLoss: 0 };
    const damage = roll('1d6', random);
    return { dc, success, roll: damage, conditions: success ? [] : [band === 2 ? 'exausto' : 'inconsciente'], hpLoss: band === 2 ? (success ? Math.floor(damage.total / 2) : damage.total) : (success ? 0 : damage.total) };
  });
}
export function modularPowerKind(level) { return level < 2 ? null : level % 2 === 0 ? 'utilidade' : 'combate'; }
export function buildingDays(workers) { return Math.max(3, 8 - integer(workers, 1, 1000)); }
