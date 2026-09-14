import { power, trail, item, all, any, attribute, skill, ability, action, modifier, limit } from './schema.js';
const p = (page, category, name, text, rules) => power(3, page, category, name, text, rules);

export const AS03_POWERS = [
  p(108, 'Combatente', 'Guardião da Tropa', 'Intercepte um efeito de alvo único dirigido a um aliado adjacente. Se o ataque errar ou o efeito não o afetar plenamente, recupere 1 SAN. A segunda aquisição amplia o alcance para curto.', {
    cost: '2 PE', requirement: 'Ataque Especial e Casca Grossa', prerequisites: all(ability('Ataque Especial'), ability('Casca Grossa')), repeat: 2, modularGroup: 'combate',
    actions: [action('interceptar', 'Interceder pelo aliado', 2, 'reação', { handler: 'guardian', fields: ['resisted'] })],
  }),
  p(108, 'Combatente', 'Vitalidade Sofrida', 'Substitui os PV iniciais por 24 + VIG e o ganho por nível por 6 + VIG, inclusive nos níveis anteriores.', {
    requirement: 'Ataque Especial', prerequisites: ability('Ataque Especial'), modularGroup: 'combate', permanent: { hpInitial: 24, hpPerLevel: 6 },
  }),
  p(108, 'Ocultista', 'Flagelo Bem Aproveitado', 'Poder do Flagelo passa a converter 1 PV para cada PE do custo.', {
    requirement: 'Escolhido pelo Outro Lado e Poder do Flagelo', prerequisites: all(ability('Escolhido pelo Outro Lado'), ability('Poder do Flagelo')), modularGroup: 'combate', permanent: { flageloRatio: 1 },
  }),
  p(108, 'Ocultista', 'Recuperação Flagelante', 'Uma recuperação fora do descanso pode recuperar PV gastos com Poder do Flagelo entre interlúdios. Cada aquisição permite um uso; máximo de três aquisições.', {
    requirement: 'Escolhido pelo Outro Lado e Poder do Flagelo', prerequisites: all(ability('Escolhido pelo Outro Lado'), ability('Poder do Flagelo')), repeat: 3, modularGroup: 'combate',
    actions: [action('recuperar', 'Registrar recuperação recebida', 0, 'conforme a fonte de cura', { handler: 'flageloRecovery', limit: limit('interlude', 'copies'), fields: ['healing'] })],
  }),
  p(108, 'Gerais', 'Ambidestria', 'Ao agredir com duas armas, sendo uma leve, faça um ataque com cada e sofra −1d20 nos ataques até o próximo turno. Com Combater com Duas Armas, elimine a penalidade e use duas armas de uma mão.', {
    requirement: '(FOR 2 ou AGI 2) e Luta treinada', prerequisites: all(any(attribute('forca', 2), attribute('agilidade', 2)), skill('Luta')),
    actions: [action('duplo', 'Ataque com duas armas', 0, 'agredir', { handler: 'ambidexterity' })],
  }),
  p(109, 'Gerais', 'Entrada Triunfal', 'Uma vez por sessão, sua entrada concede +1d20 ao primeiro teste, exceto Furtividade. Uma reação pode transferir o benefício ao primeiro teste de um aliado em alcance longo.', {
    requirement: 'PRE 2', prerequisites: attribute('presenca', 2), cost: '1 vez por sessão',
    actions: [action('entrada', 'Fazer entrada', 0, 'entrada no ambiente', { limit: limit('session'), handler: 'triumphantEntry', fields: ['recipient'] })],
  }),
  p(109, 'Gerais', 'Papinho Sedutor', 'Receba +5 em um teste baseado em Presença numa interação de interesse romântico. Um sucesso pode aplicar a condição de paixão, conforme o mestre.', {
    requirement: 'PRE 2', prerequisites: attribute('presenca', 2), cost: '1 PE',
    actions: [action('conversa', 'Aplicar bônus ao teste social', 1, 'teste', { modifiers: [modifier('presenceTests', 5)], duration: 'nextTest' })],
  }),
  p(109, 'Paranormais', 'Conhecimento de Direção Precognitiva', 'Receba +5 em Percepção e Sobrevivência para localizar lugares ou orientar-se, mesmo sem conhecê-los. Afinidade: +10.', {
    group: 'Conhecimento', element: 'Conhecimento', modifiers: [modifier('Percepção', [5, 10], 'navigation'), modifier('Sobrevivência', [5, 10], 'navigation')],
  }),
  p(109, 'Paranormais', 'Instrumento Elétrico de Combate', 'Escolha um instrumento que saiba tocar antes da missão ou no interlúdio. Ele funciona como arma tática de Energia: duas mãos, alcance curto, Artes para atacar, 2d8 + PRE de dano, crítico 20/x2, categoria II e 2 espaços. Apenas o criador é proficiente. Afinidade: afeta os alvos escolhidos no alcance.', {
    group: 'Energia', element: 'Energia', choices: [{ type: 'instrument', label: 'Instrumento conhecido' }],
    actions: [action('instrumento', 'Preparar instrumento', 0, 'interlúdio ou início da missão', { handler: 'createInstrument' })],
    generatedWeapon: { proficiency: 'Tática', handling: 'Duas mãos', range: 'Curto', skill: 'Artes', damage: '2d8', attribute: 'presenca', damageType: 'Energia', critical: '20/x2', category: 'II', spaces: 2 },
    replacement: 'Pode escolher outro se o instrumento quebrar; a arma deixa de funcionar com a morte do criador.',
  }),
];

export const AS03_SACRIFICES = [
  ['Causar Culpa', 'Culpa', 110, 'padrão', 'Um alvo em alcance curto fica indefeso pela cena; Vontade DT PRE + 5 evita. Repete o teste no início dos turnos.', { range: 'Curto', target: '1 pessoa', save: 'Vontade', dcAttribute: 'presenca', dcBonus: 5, conditions: ['indefeso'], duration: 'scene', repeatSave: 'turnStart' }],
  ['Despertar Obsessão', 'Obsessão', 110, 'padrão', 'Um alvo em alcance curto escolhe evitar o olhar e ficar desprevenido contra o grupo por 1 rodada, ou resistir com Vontade DT PRE + 5. Uma falha restringe suas ações por 1 rodada, conforme o mestre.', { range: 'Curto', target: '1 pessoa', save: 'Vontade', dcAttribute: 'presenca', dcBonus: 5, duration: 'round', options: ['desprevenido', 'compulsão'] }],
  ['Arrogância Diabólica', 'Orgulho', 110, 'padrão', 'Um alvo em alcance médio faz Vontade DT PRE + 5. Uma falha causa uma ação imprudente no turno seguinte; um sucesso causa 2d6 de dano mental que não pode ser reduzido.', { range: 'Médio', target: '1 pessoa', save: 'Vontade', dcAttribute: 'presenca', dcBonus: 5, successDamage: '2d6', damageType: 'mental', ignoresReduction: true }],
  ['Estimular Hedonismo', 'Prazer', 110, 'padrão', 'Um alvo em alcance curto fica indefeso por 1 rodada; Vontade DT PRE + 5 evita.', { range: 'Curto', target: '1 pessoa', save: 'Vontade', dcAttribute: 'presenca', dcBonus: 5, conditions: ['indefeso'], duration: 'round' }],
  ['Fruto da Ambição', 'Desejo', 111, 'conforme a opção', 'Escolha um poder ou ritual conhecido. Seu uso também ativa a transformação de As Máscaras, conforme Arquivos Secretos 2, p. 97.', { handler: 'ambition', reference: { source: 'Arquivos Secretos #2', sourcePage: 97 }, choices: ['knownAbilityOrRitual'] }],
  ['Ódio Suprimido', 'Rancor', 111, 'completa', 'Afeta todos os seres em alcance curto. Fortitude DT PRE + 5: falha causa dano da arma corpo a corpo e caído. Reflexos com a mesma DT: falha causa dano da arma à distância ou 1d4 de impacto. Ao fim, o usuário fica exausto pela cena.', { range: 'Curto', target: 'todos os seres', saves: ['Fortitude', 'Reflexos'], dcAttribute: 'presenca', dcBonus: 5, handler: 'suppressedWrath', selfConditions: ['exausto'] }],
].map(([name, stigma, page, activation, text, effect]) => p(page, 'Sacrifícios', name, text, {
  group: 'Hexatombe', acquisition: 'story', stigma, requirement: `Sacrifício de ${stigma} e elegibilidade de Hexatombe confirmados pelo mestre`,
  prerequisites: { story: `sacrifice:${stigma}` }, cost: name === 'Fruto da Ambição' ? 'Conforme a opção' : '3 PE',
  actions: [action('ativar', 'Usar poder', name === 'Fruto da Ambição' ? 0 : 3, activation, effect)],
}));

const performance = [
  [10, 'Ensaio', 'Uma ação de interlúdio, uma vez por cena, concede margem de ameaça +1 até o próximo interlúdio; +2/+3/+4 em NEX 40/65/99. Aliados participantes gastam sua própria ação.', { actions: [action('ensaio', 'Ensaiar', 0, 'interlúdio', { limit: limit('scene'), handler: 'rehearsal' })] }],
  [40, 'Frase de Efeito', 'Ao ocorrer um crítico seu ou de aliado em alcance curto, gaste 2 PE: use PRE como multiplicador crítico se superar o atual; caso contrário, aumente o multiplicador em 1.', { cost: '2 PE', actions: [action('critico', 'Aprimorar crítico', 2, 'crítico', { handler: 'criticalPhrase', fields: ['criticalMultiplier'] })] }],
  [65, 'Mosh Pit', 'Ao flanquear, você e os aliados envolvidos recebem +1d6 de dano por participante adjacente ao alvo, limitado a 5d6.', { modifiers: [modifier('damageDice', 'min(participants,5)d6', 'flanking')] }],
  [99, 'Rítmo Contagiante', 'No início do combate, você e aliados em alcance médio recebem +5 Defesa pela cena. Cada crítico seu aumenta o bônus em 1.', { aliases: ['Ritmo Contagiante'], actions: [action('ritmo', 'Iniciar ritmo', 0, 'início do combate', { handler: 'rhythmStart', limit: limit('scene') }), action('critico', 'Registrar crítico', 0, 'crítico', { handler: 'rhythmCritical' })] }],
];
export const AS03_TRAILS = ['Combatente', 'Especialista', 'Ocultista'].flatMap(category => performance.map(([nex, name, text, rules]) => trail(3, 119, category, 'Performático', nex, name, text, rules)));

export const AS03_ITEMS = [
  item(3, 112, 'Garra do Harpia', 'Armas', 'I', 2, 'Arma tática ágil de duas mãos; 2d8 de corte, crítico 19/x2, arremesso curto. Em ataques com duas armas conta como uma de uma mão e uma leve. Exemplar único, para um agente.', {
    unique: true, weapon: { proficiency: 'Tática', handling: 'Duas mãos', agile: true, damage: '2d8', damageType: 'Corte', critical: '19/x2', range: 'Curto', double: true },
    actions: [action('agarrar', 'Agarrar após causar dano', 2, 'livre', { handler: 'maneuver', maneuver: 'agarrar' })],
  }),
  item(3, 112, 'Paçoca', 'Operacionais', '0', 0.5, 'Refeição rápida excepcional, disponível com autorização do mestre. Uma vez por dia, recupera 1d8+1 PV, PE e SAN.', {
    requiresApproval: true, actions: [action('usar', 'Usar refeição', 0, 'refeição', { consume: 1, limit: limit('day'), handler: 'pacoca' })],
  }),
  item(3, 112, 'Bloody Mary Batizada', 'Operacionais', 'II', 1, 'Consumível de jogo: remove condições mentais e de medo e causa 2d4 de dano mental.', {
    actions: [action('usar', 'Aplicar efeito do item', 0, 'consumo', { consume: 1, handler: 'mentalCleanse', damage: '2d4' })],
  }),
  item(3, 113, 'Crânio Dominador', 'Paranormais', 'III', 1, 'Empunhado: ação padrão e 2 PE para paralisar até dois alvos em alcance curto; Reflexos DT PRE evita. Correntes com Defesa 10, RD 10 e PV 20 precisam ser rompidas. Novo uso após 24 horas encerra as correntes anteriores.', {
    actions: [action('correntes', 'Criar correntes', 2, 'padrão', { limit: limit('24hours'), target: 'até 2 seres', range: 'Curto', save: 'Reflexos', dcAttribute: 'presenca', conditions: ['paralisado'], object: { defense: 10, resistance: 10, hp: 20 } })],
  }),
  item(3, 113, 'Gaiola do Corvo', 'Paranormais', 'IV', 2, 'Abra com ação padrão: área de 18 m com terreno difícil e 3d10 de Morte por rodada; Fortitude DT VIG reduz à metade. Fecha se alguém entrar em morrendo na área ou com outra ação padrão.', {
    actions: [action('abrir', 'Abrir gaiola', 0, 'padrão', { handler: 'toggleItemArea', radius: 18, damage: '3d10', damageType: 'Morte', save: 'Fortitude', dcAttribute: 'vigor' })],
  }),
  item(3, 114, 'Camiseta Psikolera', 'Paranormais', 'II', 1, 'Vestimenta de Sangue: enquanto machucado, acrescente 2d8 de Sangue a todas as rolagens de dano.', { element: 'Sangue', wearable: true, modifiers: [modifier('damageDice', '2d8', 'machucado', { damageType: 'Sangue' })] }),
  item(3, 114, 'Dupla Obsessiva', 'Paranormais', 'III', 2, 'Conjunto de Sangue com maça e florete. Empunhar ambos permite os dois ataques numa ação padrão. Pode interceptar o ataque contra um aliado em alcance curto e contra-atacar se o agressor estiver em corpo a corpo.', {
    element: 'Sangue', weapon: { proficiency: 'Tática', handling: 'Duas armas de uma mão', damage: '2d4+1d6', damageType: 'Perfuração + Sangue', critical: '20/x3', range: 'Corpo a corpo' },
    components: [{ name: 'Maça', damage: [{ dice: '2d4', type: 'Perfuração' }, { dice: '1d6', type: 'Sangue' }], critical: '20/x3' }, { name: 'Florete', agile: true, damage: [{ dice: '1d6', type: 'Perfuração' }, { dice: '2d4', type: 'Sangue' }], critical: '18/x2' }],
    actions: [action('proteger', 'Proteger aliado', 2, 'reação'), action('proteger-atacar', 'Proteger e atacar com a maça', 4, 'reação', { requiresMelee: true })],
  }),
  item(3, 115, 'Armaduras de Guevara', 'Paranormais', 'III', 0, 'Proteção pesada de Sangue sem requisito de proficiência. Defesa +10, aumentando 1 por semana até +20; RD 5 balístico/impacto/perfuração e 10 Sangue, vulnerável a Morte. Vontade DT 6d6 ao tocar e Fortitude DT 6d6 ao vestir controlam suas compulsões. Refaça os testes após uma semana ou nova missão, o que ocorrer primeiro. Remoção depende de uma condição especial confirmada pelo mestre.', {
    aliases: ['Armaduras dos Couraças', 'Armadura de Guevara'], element: 'Sangue', armor: 'heavy', noProficiency: true, wearable: true,
    modifiers: [modifier('defense', 'min(10+weeks,20)'), modifier('resistance', 5, 'always', { types: ['Balístico', 'Impacto', 'Perfuração'] }), modifier('resistance', 10, 'always', { types: ['Sangue'] })], vulnerabilities: ['Morte'], binding: true,
    actions: [action('semana', 'Avançar semana da armadura', 0, 'semana', { handler: 'armorWeek' }), action('teste', 'Registrar teste de controle', 0, 'toque ou início do período', { handler: 'armorControl', saveDice: '6d6', fields: ['willResult', 'fortitudeResult'] })],
  }),
];
