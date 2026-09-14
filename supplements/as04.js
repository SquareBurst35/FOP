import { power, origin, trail, ritual, item, action, modifier, limit } from './schema.js';
const p = (page, category, name, text, rules) => power(4, page, category, name, text, rules);

export const AS04_ORIGINS = [
  origin(4, 64, 'Caçador de Recompensas', ['Crime', 'Investigação'], 'Quem Não Arrisca Não Petisca', 'Receba +2 para resistir a condições mentais e de medo. Uma falha concede +1d20 ao próximo teste até o fim da cena; não acumula.', {
    modifiers: [modifier('resistanceTests', 2, 'mentalOrFearCondition')], actions: [action('falha', 'Registrar falha de resistência', 0, 'falha no teste', { handler: 'bountyFailure' })],
  }),
  origin(4, 64, 'Influencer Paranormal', ['Enganação', 'Tecnologia'], 'Registrar Paranormal', 'Uma vez por cena, ação padrão e 2 PE registram uma criatura ou ritual usado na cena. Receba +5 em testes de Presença contra criaturas registradas. Uma ação de interlúdio permite memorizar um ritual registrado até o próximo interlúdio; círculos 1/2/3/4 exigem NEX 5/25/55/85.', {
    cost: '2 PE', actions: [action('registrar', 'Registrar manifestação', 2, 'padrão', { limit: limit('scene'), handler: 'recordParanormal', fields: ['recordKind', 'target', 'ritual'] }), action('memorizar', 'Memorizar ritual registrado', 0, 'interlúdio', { handler: 'memorizeRecording', fields: ['ritual'] })],
  }),
];
export const AS04_POWERS = [
  p(65, 'Combatente', 'Chuva de Balas', 'Pacotes de munição duram o dobro de cenas. Antes do dano de uma arma de fogo, gaste pacotes extras: cada pacote acrescenta dois dados do mesmo tipo. Na contagem individual, cada pacote equivale a dez projéteis adicionais.', {
    modularGroup: 'combate', permanent: { ammoScenesMultiplier: 2 }, actions: [action('rajada', 'Gastar munição extra', 0, 'antes do dano', { handler: 'rainOfBullets', fields: ['ammoItem', 'quantity', 'damageDie'] })],
  }),
  p(65, 'Combatente', 'Combatente Esforçado', 'Receba +1 PE máximo por nível de NEX, incluindo os níveis anteriores.', {
    requirement: 'FOR 3 ou VIG 3', prerequisites: { any: [{ attribute: 'forca', minimum: 3 }, { attribute: 'vigor', minimum: 3 }] }, modularGroup: 'combate', permanent: { effortPerLevel: 1 },
  }),
  p(65, 'Combatente', 'Treinamento Militarizado', 'O bônus de exercitar-se no interlúdio torna-se 1d8 e também pode ser aplicado ao dano. Apenas um bônus por rolagem.', {
    modularGroup: 'combate', actions: [action('treino', 'Registrar treino', 0, 'interlúdio', { handler: 'militaryTraining' }), action('bonus', 'Usar bônus do treino', 0, 'teste ou dano', { handler: 'militaryTrainingUse' })],
  }),
  p(65, 'Especialista', 'Análise Conturbada', 'Ação padrão: você e os voluntários presentes fazem a análise. Role 1d6: o valor é perdido de SAN e torna-se bônus nos testes de INT e PRE até o fim da cena.', {
    modularGroup: 'utilidade', actions: [action('analisar', 'Analisar', 0, 'padrão', { handler: 'troubledAnalysis' })],
  }),
  p(65, 'Especialista', 'Profissão Perigo', 'Uma vez por missão, ação completa e 4 PE substituem um item do inventário por um operacional de categoria e espaços iguais ou menores.', {
    cost: '4 PE', modularGroup: 'utilidade', actions: [action('improvisar', 'Converter equipamento', 4, 'completa', { limit: limit('mission'), handler: 'professionDanger', fields: ['sacrificeItem', 'createdItem'] })],
  }),
  p(65, 'Especialista', 'Quase Novo', 'Na manutenção do interlúdio, o item reparado recebe +10 PV e uma modificação permitida pela patente até o próximo interlúdio.', {
    modularGroup: 'utilidade', actions: [action('manutencao', 'Fazer manutenção', 0, 'interlúdio', { handler: 'almostNew', fields: ['inventoryItem', 'upgrade'] })],
  }),
  p(66, 'Ocultista', 'Explorador da Névoa', 'Uma vez por cena, 2 PE revelam o estado da Membrana. Se danificada ou pior, perca 1 SAN e reduza os custos dos seus rituais em 1 PE.', {
    cost: '2 PE', modularGroup: 'utilidade', actions: [action('avaliar', 'Avaliar Membrana', 2, 'uso', { limit: limit('scene'), handler: 'membraneExplorer', fields: ['damagedMembrane'] })],
  }),
  p(66, 'Ocultista', 'Sinestesia Paranormal', 'Ao entrar numa área de Membrana danificada, pode perder 1d6 SAN e trocar os atributos-base entre dois pares de perícias. Não pode usar perícias que exijam treinamento sem possuí-lo. Termina ao sair da área; nova aceitação somente no dia seguinte.', {
    modularGroup: 'utilidade', actions: [action('aceitar', 'Aceitar sinestesia', 0, 'entrada na área', { limit: limit('day'), handler: 'synesthesia', fields: ['skill1', 'skill2', 'skill3', 'skill4', 'damagedMembrane'] }), action('encerrar', 'Sair da área', 0, 'saída da área', { handler: 'endSynesthesia' })],
  }),
  p(66, 'Ocultista', 'Terrores Noturnos', 'Ao dormir, role 1d100. De 1 a 50: descanso precário, perda de 1d4 SAN e escolha de um poder paranormal ou ritual cujos requisitos cumpra. Poderá usá-lo uma vez antes do próximo interlúdio, pagando seus custos normais. De 51 a 100 não há alteração.', {
    modularGroup: 'utilidade', actions: [action('dormir', 'Resolver descanso', 0, 'dormir', { limit: limit('interlude'), handler: 'nightTerrors', fields: ['temporaryOption'] })],
  }),
  p(66, 'Gerais', 'Gororoba', 'Uma vez por interlúdio, receba uma refeição sem gastar ação e sem precisar ter uma disponível.', {
    actions: [action('refeicao', 'Receber refeição', 0, 'livre no interlúdio', { handler: 'meal', limit: limit('interlude'), fields: ['meal'] })],
  }),
  p(66, 'Gerais', 'Ruído Branco', 'Em ambiente movimentado, receba +1d6 Investigação e Percepção. Com aprovação do mestre, uma vez por cena, 1 PE permite obter uma informação útil entre conversas.', {
    cost: '1 PE', modifiers: [modifier('Investigação', '1d6', 'crowded'), modifier('Percepção', '1d6', 'crowded')], actions: [action('ouvir', 'Ouvir informação útil', 1, 'uso', { limit: limit('scene'), requiresApproval: true })],
  }),
  p(67, 'Gerais', 'Uma Última Olhada', 'Na última rodada da investigação, gaste 2 PE para acrescentar uma rodada disponível ao grupo. Uma vez por cena.', {
    cost: '2 PE', actions: [action('olhada', 'Acrescentar rodada de investigação', 2, 'última rodada', { limit: limit('scene'), handler: 'investigationRound' })],
  }),
  p(67, 'Paranormais', 'Foco Gravitacional', 'Escolha um equipamento: ocupa zero espaços quando guardado. Ao empunhá-lo, role 1d100; de 1 a 25, fica em um espaço em alcance curto definido pelo mestre. Pode trocar a escolha se destruído ou consumido. Afinidade: três equipamentos.', {
    group: 'Energia', element: 'Energia', choices: [{ type: 'item', source: 'inventory', count: [1, 3] }], permanent: { stowedSpaces: 0 }, actions: [action('empunhar', 'Empunhar equipamento', 0, 'empunhar', { handler: 'gravitationalFocus', fields: ['inventoryItem'] })],
  }),
  p(67, 'Paranormais', 'Sobrepor Imprevisível', 'No início da rodada, uma vez por rodada, 2 PE permitem rolar 1d20: some o resultado à iniciativa se par, subtraia se ímpar. Afinidade: role dois dados e escolha um.', {
    group: 'Energia', element: 'Energia', cost: '2 PE', actions: [action('iniciativa', 'Alterar iniciativa', 2, 'início da rodada', { limit: limit('turn'), handler: 'unpredictableInitiative' })],
  }),
  p(67, 'Paranormais', 'Traço de Inconsistência', 'Reação de 2 PE oculta a identidade numa captura digital. Afinidade: a imagem fica permanentemente indetectável por captura digital e a voz é distorcida em gravações.', {
    group: 'Energia', element: 'Energia', cost: '2 PE', actions: [action('ocultar', 'Ocultar identidade digital', 2, 'reação', { affinityCost: 0 })],
  }),
];

export const AS04_RITUALS = [ritual(4, 68, 'Backup', 'Energia', 2,
  'Cria uma cópia em espaço vazio no alcance curto por 24 horas, com movimentos simples e uma frase. A conexão alcança 50 km. Uma reação troca sua posição com a cópia e custa 2d4 SAN. Dano à cópia ou sair da conexão encerra o ritual.', [
    { name: 'Discente', extra: 2, minCircle: 2, summary: 'Duração permanente. Uma ação padrão permite usar os sentidos da cópia, ficando cego, surdo e pasmo no corpo original até encerrar a observação.' },
    { name: 'Verdadeiro', extra: 5, minCircle: 3, summary: 'Inclui falar pela cópia e dar-lhe uma aparência conhecida. Ao trocar de lugar, pode encerrar o ritual e causar 6d6 Energia nas duas áreas de alcance curto; Reflexos reduz à metade.' },
  ], { activation: 'padrão', range: 'Curto', target: 'espaço vazio', duration: '24hours', connectionKm: 50, handler: 'backup' })];

export const AS04_TRAILS = [
  trail(4, 69, 'Especialista', 'Granadeiro Blaster', 10, 'Meus Bebês', 'Receba Profissão (químico) treinada, ou +5 se já treinado. Comece a missão com um explosivo autoral fora do limite de itens; dois/três/quatro em NEX 40/65/99. Produção adicional usa Fabricação em Campo.', {
    grantSkills: [{ skill: 'Profissão', specialization: 'Químico', existingBonus: 5 }], actions: [action('preparar', 'Preparar explosivos da missão', 0, 'início da missão', { handler: 'blasterMission', limit: limit('mission'), fields: ['explosive'] })],
  }),
  trail(4, 69, 'Especialista', 'Granadeiro Blaster', 40, 'Fogo Amigo', 'Receba Perito em Explosivos. Se já possuía ou o escolher novamente uma vez, dobre o bônus de DT e o número de alvos excluídos. A dimensão da área dos explosivos aumenta em 6 m.', { grants: ['Perito em Explosivos'], permanent: { explosiveRadiusBonus: 6, explosiveExpertRepeat: 2 } }),
  trail(4, 69, 'Especialista', 'Granadeiro Blaster', 65, 'O Calor do Momento', 'Ação completa e 4 PE criam um explosivo autoral. Ao usá-lo, resultado 1–25 em 1d100 faz o efeito ocorrer na posição do usuário, inclusive ao disparar por lançador.', { cost: '4 PE', actions: [action('criar', 'Criar explosivo autoral', 4, 'completa', { handler: 'blasterCraft', fields: ['explosive'], mishapPercent: 25 })] }),
  trail(4, 69, 'Especialista', 'Granadeiro Blaster', 99, 'Memória Muscular', 'Qualquer pessoa pode empunhar seus explosivos autorais como ação livre. Você pode usá-los com ação de movimento por 4 PE. Seus explosivos autorais têm o dobro dos dados de dano.', { cost: '4 PE', permanent: { authoredExplosiveDamageMultiplier: 2, authoredExplosiveDraw: 'livre' }, actions: [action('explosivo', 'Usar explosivo como movimento', 4, 'movimento', { handler: 'useExplosive', fields: ['explosive'] })] }),
];
export const AS04_ITEMS = [
  item(4, 70, 'Granada de Gás Lacrimogêneo', 'Explosivos', 'I', 1, 'Raio de 6 m: 4d6 químico, enjoado e dificuldade respiratória. Fortitude DT AGI reduz dano à metade e evita enjoado. Fora da área, dificuldade respiratória dura 1d4 rodadas; enjoado dura pela cena.', { explosive: { radius: 6, damage: '4d6', damageType: 'Químico', save: 'Fortitude', dcAttribute: 'agilidade', conditions: ['enjoado', 'asfixiado'], lingeringRounds: '1d4' }, consumable: true }),
  item(4, 70, 'Granada de Tinta', 'Explosivos', '0', 1, 'Raio de 6 m: vulnerável e −2d20 Furtividade pela cena; Reflexos DT AGI evita.', { explosive: { radius: 6, save: 'Reflexos', dcAttribute: 'agilidade', conditions: ['vulnerável'], modifiers: [modifier('FurtividadeDice', -2)], duration: 'scene' }, consumable: true }),
  item(4, 70, 'Granada Ctrl+C Ctrl+V', 'Explosivos', 'II', 1, 'Granada amaldiçoada de Energia: alcance médio, raio de 6 m, 8d6 Energia; Reflexos DT AGI reduz à metade. Após cada explosão, 1d4 par cria outra dentro da área anterior, até quatro explosões no total.', { element: 'Energia', explosive: { radius: 6, range: 'Médio', damage: '8d6', damageType: 'Energia', save: 'Reflexos', dcAttribute: 'agilidade', chainDie: '1d4', chainOn: 'even', maxExplosions: 4 }, consumable: true }),
  item(4, 71, 'Lançador de Granadas', 'Armas', 'II', 2, 'Arma de fogo pesada de duas mãos e alcance longo; comporta seis granadas 40 mm. Recarregar uma custa movimento. Acerto direto nega resistência apenas ao alvo atingido; disparar num ponto dispensa ataque e todos resistem. Granadas de arremesso não são compatíveis.', { weapon: { proficiency: 'Pesada', handling: 'Fogo · duas mãos', range: 'Longo', damage: 'Conforme a granada', critical: 'Conforme a granada', damageType: 'Conforme a granada' }, magazine: 6, ammoFormat: '40mm', reload: 'movimento', actions: [action('recarregar', 'Recarregar uma granada 40 mm', 0, 'movimento', { handler: 'launcherLoad', fields: ['explosive'] }), action('disparar', 'Disparar granada', 0, 'padrão', { handler: 'launcherFire', fields: ['directHit'] })] }),
];
export const AS04_UPGRADES = [
  { name: 'Adesiva', summary: 'Um acerto contra Defesa faz o alvo falhar na resistência. Um erro fixa a granada no espaço. Efeitos contínuos acompanham o alvo até ser removida com ação padrão.', mechanics: { directHitNoSave: true, followsTarget: true, removal: 'padrão' } },
  { name: 'Dupla', summary: 'Acrescente o efeito de outra granada não amaldiçoada, diferente do efeito principal.', mechanics: { choice: 'otherNonCursedExplosive' } },
  { name: 'Programada', summary: 'Escolha em quantos turnos o efeito será ativado.', mechanics: { choice: 'delayTurns' } },
].map(u => ({ ...u, id: `as4-granada-${u.name.toLowerCase()}`, target: 'Explosivos', source: 'Arquivos Secretos #4', sourcePage: 71, page: '71', curse: false, spaces: 0 }));
