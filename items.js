const slug = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const inventoryItem = ({
  name,
  group,
  category = "0",
  spaces = 1,
  summary,
  source = "Livro base",
  page = "",
  details = [],
}) => ({
  id: slug(`${source}-${group}-${name}`),
  name,
  group,
  category: String(category),
  spaces: Number(spaces) || 0,
  summary,
  source,
  page,
  details,
});

const weapon = ({
  name,
  proficiency,
  handling,
  category,
  spaces,
  damage,
  critical,
  range = "—",
  type,
  source = "Livro base",
  page = source === "Livro base" ? "54–55" : "38",
  summary = "",
}) =>
  inventoryItem({
    name,
    group: "Armas",
    category,
    spaces,
    source,
    page,
    summary:
      summary ||
      `Arma ${proficiency.toLowerCase()} de ${handling.toLowerCase()}, com dano ${damage} e crítico ${critical}.`,
    details: [
      ["Proficiência", proficiency],
      ["Empunhadura", handling],
      ["Dano", damage],
      ["Crítico", critical],
      ["Alcance", range],
      ["Tipo", type],
    ],
  });

const ammunition = (name, category, summary, source = "Livro base", page = "54–55") =>
  inventoryItem({ name, group: "Munições", category, spaces: 1, summary, source, page });

const utility = (name, group, category, spaces, summary, source = "Livro base", page = "61–63", details = []) =>
  inventoryItem({ name, group, category, spaces, summary, source, page, details });

export const INVENTORY_GROUPS = [
  "Armas",
  "Munições",
  "Proteções",
  "Acessórios",
  "Explosivos",
  "Operacionais",
  "Medicamentos",
  "Paranormais",
];

export const PATENT_ITEM_LIMITS = {
  Recruta: { I: 2, II: 0, III: 0, IV: 0 },
  Operador: { I: 3, II: 1, III: 0, IV: 0 },
  "Agente Especial": { I: 3, II: 2, III: 1, IV: 0 },
  "Oficial de Operações": { I: 3, II: 3, III: 2, IV: 1 },
  "Agente de Elite": { I: 3, II: 3, III: 3, IV: 2 },
};

export const ITEMS = [
  // Livro base — armas simples
  weapon({ name: "Faca", proficiency: "Simples", handling: "Leve", category: "0", spaces: 1, damage: "1d4", critical: "19", range: "Curto", type: "Corte" }),
  weapon({ name: "Martelo", proficiency: "Simples", handling: "Leve", category: "0", spaces: 1, damage: "1d6", critical: "x2", type: "Impacto" }),
  weapon({ name: "Punhal", proficiency: "Simples", handling: "Leve", category: "0", spaces: 1, damage: "1d4", critical: "x3", type: "Perfuração" }),
  weapon({ name: "Bastão", proficiency: "Simples", handling: "Uma mão (versátil)", category: "0", spaces: 1, damage: "1d6/1d8", critical: "x2", type: "Impacto" }),
  weapon({ name: "Machete", proficiency: "Simples", handling: "Uma mão", category: "0", spaces: 1, damage: "1d6", critical: "19", type: "Corte" }),
  weapon({ name: "Lança", proficiency: "Simples", handling: "Uma mão", category: "0", spaces: 1, damage: "1d6", critical: "x2", range: "Curto", type: "Perfuração" }),
  weapon({ name: "Cajado", proficiency: "Simples", handling: "Duas mãos", category: "0", spaces: 2, damage: "1d6/1d6", critical: "x2", type: "Impacto" }),
  weapon({ name: "Arco", proficiency: "Simples", handling: "Disparo · duas mãos", category: "0", spaces: 2, damage: "1d6", critical: "x3", range: "Médio", type: "Perfuração" }),
  weapon({ name: "Besta", proficiency: "Simples", handling: "Disparo · duas mãos", category: "0", spaces: 2, damage: "1d8", critical: "19", range: "Médio", type: "Perfuração" }),
  weapon({ name: "Pistola", proficiency: "Simples", handling: "Fogo · leve", category: "I", spaces: 1, damage: "1d12", critical: "18", range: "Curto", type: "Balístico" }),
  weapon({ name: "Revólver", proficiency: "Simples", handling: "Fogo · leve", category: "I", spaces: 1, damage: "2d6", critical: "19/x3", range: "Curto", type: "Balístico" }),
  weapon({ name: "Fuzil de caça", proficiency: "Simples", handling: "Fogo · duas mãos", category: "I", spaces: 2, damage: "2d8", critical: "19/x3", range: "Médio", type: "Balístico" }),

  // Livro base — armas táticas e pesadas
  weapon({ name: "Machadinha", proficiency: "Tática", handling: "Leve", category: "0", spaces: 1, damage: "1d6", critical: "x3", range: "Curto", type: "Corte" }),
  weapon({ name: "Nunchaku", proficiency: "Tática", handling: "Leve", category: "0", spaces: 1, damage: "1d8", critical: "x2", type: "Impacto" }),
  weapon({ name: "Corrente", proficiency: "Tática", handling: "Uma mão", category: "0", spaces: 1, damage: "1d8", critical: "x2", type: "Impacto" }),
  weapon({ name: "Espada", proficiency: "Tática", handling: "Uma mão (versátil)", category: "I", spaces: 1, damage: "1d8/1d10", critical: "19", type: "Corte" }),
  weapon({ name: "Florete", proficiency: "Tática", handling: "Uma mão", category: "I", spaces: 1, damage: "1d6", critical: "18", type: "Corte" }),
  weapon({ name: "Machado", proficiency: "Tática", handling: "Uma mão", category: "I", spaces: 1, damage: "1d8", critical: "x3", type: "Corte" }),
  weapon({ name: "Marreta", proficiency: "Tática", handling: "Uma mão", category: "I", spaces: 1, damage: "2d4", critical: "x2", type: "Impacto" }),
  weapon({ name: "Acha", proficiency: "Tática", handling: "Duas mãos", category: "I", spaces: 2, damage: "1d12", critical: "x3", type: "Corte" }),
  weapon({ name: "Gadanho", proficiency: "Tática", handling: "Duas mãos", category: "I", spaces: 2, damage: "2d4", critical: "x4", type: "Corte" }),
  weapon({ name: "Katana", proficiency: "Tática", handling: "Duas mãos", category: "I", spaces: 2, damage: "1d10", critical: "19", type: "Corte" }),
  weapon({ name: "Montante", proficiency: "Tática", handling: "Duas mãos", category: "I", spaces: 2, damage: "2d6", critical: "19", type: "Corte" }),
  weapon({ name: "Moto-serra", proficiency: "Tática", handling: "Duas mãos", category: "I", spaces: 2, damage: "3d6", critical: "x2", type: "Corte" }),
  weapon({ name: "Arco composto", proficiency: "Tática", handling: "Disparo · duas mãos", category: "I", spaces: 2, damage: "1d10", critical: "x3", range: "Médio", type: "Perfuração" }),
  weapon({ name: "Balestra", proficiency: "Tática", handling: "Disparo · duas mãos", category: "I", spaces: 2, damage: "1d12", critical: "19", range: "Médio", type: "Perfuração" }),
  weapon({ name: "Submetralhadora", proficiency: "Tática", handling: "Fogo · uma mão", category: "I", spaces: 1, damage: "2d6", critical: "19/x3", range: "Curto", type: "Balístico" }),
  weapon({ name: "Espingarda", proficiency: "Tática", handling: "Fogo · duas mãos", category: "I", spaces: 2, damage: "4d6", critical: "x3", range: "Curto", type: "Balístico" }),
  weapon({ name: "Fuzil de assalto", proficiency: "Tática", handling: "Fogo · duas mãos", category: "II", spaces: 2, damage: "2d10", critical: "19/x3", range: "Médio", type: "Balístico" }),
  weapon({ name: "Fuzil de precisão", proficiency: "Tática", handling: "Fogo · duas mãos", category: "III", spaces: 2, damage: "2d10", critical: "19/x3", range: "Longo", type: "Balístico" }),
  weapon({ name: "Bazuca", proficiency: "Pesada", handling: "Duas mãos", category: "III", spaces: 2, damage: "10d8", critical: "x2", range: "Médio", type: "Impacto" }),
  weapon({ name: "Lança-chamas", proficiency: "Pesada", handling: "Duas mãos", category: "III", spaces: 2, damage: "6d6", critical: "x2", range: "Curto", type: "Fogo" }),
  weapon({ name: "Metralhadora", proficiency: "Pesada", handling: "Duas mãos", category: "II", spaces: 2, damage: "2d12", critical: "19/x3", range: "Médio", type: "Balístico" }),

  // Sobrevivendo ao Horror — novas armas
  weapon({ name: "Pregador pneumático", proficiency: "Simples", handling: "Disparo · uma mão", category: "0", spaces: 1, damage: "1d4", critical: "x4", range: "Curto", type: "Perfuração", source: "Sobrevivendo ao Horror" }),
  weapon({ name: "Estilingue", proficiency: "Simples", handling: "Disparo · duas mãos", category: "0", spaces: 1, damage: "1d4", critical: "x2", range: "Curto", type: "Impacto", source: "Sobrevivendo ao Horror", summary: "Arma simples de disparo que soma Força ao dano e também pode lançar granadas em alcance longo." }),
  weapon({ name: "Revólver compacto", proficiency: "Simples", handling: "Fogo · leve", category: "I", spaces: 1, damage: "2d4", critical: "19/x3", range: "Curto", type: "Perfuração", source: "Sobrevivendo ao Horror", summary: "Arma de fogo compacta; um usuário treinado em Crime pode ocultá-la sem ocupar espaço." }),
  weapon({ name: "Baioneta", proficiency: "Tática", handling: "Leve", category: "0", spaces: 1, damage: "1d4", critical: "19", type: "Perfuração", source: "Sobrevivendo ao Horror", summary: "Lâmina ágil que pode ser presa a uma arma de fogo longa, mudando sua empunhadura e dano." }),
  weapon({ name: "Faca tática", proficiency: "Tática", handling: "Leve", category: "I", spaces: 1, damage: "1d6", critical: "19", range: "Curto", type: "Corte", source: "Sobrevivendo ao Horror", summary: "Arma ágil preparada para contra-ataques e bloqueios defensivos." }),
  weapon({ name: "Gancho de carne", proficiency: "Tática", handling: "Leve", category: "0", spaces: 1, damage: "1d4", critical: "x4", type: "Perfuração", source: "Sobrevivendo ao Horror", summary: "Gancho metálico que pode receber uma corda ou corrente para alcançar alvos a 4,5 m, passando a ocupar 2 espaços." }),
  weapon({ name: "Bastão policial", proficiency: "Tática", handling: "Uma mão", category: "I", spaces: 1, damage: "1d6", critical: "x2", range: "Curto", type: "Impacto", source: "Sobrevivendo ao Horror", summary: "Arma ágil que melhora em +1 a Defesa recebida ao usá-la numa esquiva." }),
  weapon({ name: "Picareta", proficiency: "Tática", handling: "Uma mão", category: "0", spaces: 1, damage: "1d6", critical: "x4", type: "Perfuração", source: "Sobrevivendo ao Horror" }),
  weapon({ name: "Shuriken", proficiency: "Tática", handling: "Arremesso", category: "I", spaces: 0.5, damage: "1d4", critical: "x2", range: "Curto", type: "Perfuração", source: "Sobrevivendo ao Horror", summary: "Pacote de projéteis de arremesso; veteranos em Pontaria podem gastar PE para realizar um ataque adicional limitado." }),
  weapon({ name: "Pistola pesada", proficiency: "Tática", handling: "Fogo · uma mão", category: "I", spaces: 1, damage: "2d8", critical: "18", range: "Curto", type: "Balístico", source: "Sobrevivendo ao Horror", summary: "Arma de maior recuo; usar as duas mãos remove sua penalidade de ataque." }),
  weapon({ name: "Espingarda de cano duplo", proficiency: "Tática", handling: "Fogo · duas mãos", category: "II", spaces: 2, damage: "4d6", critical: "x3", range: "Curto", type: "Balístico", source: "Sobrevivendo ao Horror", summary: "Pode disparar os dois canos contra o mesmo alvo para aumentar o dano para 6d6, sofrendo a penalidade prevista." }),

  // Munições
  ammunition("Flechas", "0", "Pacote de projéteis para arcos, bestas e balestras."),
  ammunition("Balas leves", "0", "Pacote de munição para pistolas, revólveres e submetralhadoras."),
  ammunition("Balas pesadas", "I", "Pacote de munição para fuzis e metralhadoras."),
  ammunition("Cartuchos", "I", "Pacote de munição para espingardas."),
  ammunition("Foguete", "I", "Munição individual de bazuca."),
  ammunition("Combustível", "I", "Carga de munição para lança-chamas."),
  ammunition("Balas curtas", "0", "Pacote de munição para revólver compacto e pistola pesada.", "Sobrevivendo ao Horror", "38"),

  // Proteções
  utility("Proteção leve", "Proteções", "I", 2, "Traje reforçado que concede +5 na Defesa.", "Livro base", "60", [["Defesa", "+5"], ["Proficiência", "Proteções leves"]]),
  utility("Proteção pesada", "Proteções", "II", 5, "Equipamento tático que concede +10 na Defesa e resistência a dano 2, mas aplica penalidade de carga.", "Livro base", "60", [["Defesa", "+10"], ["Resistência", "2"], ["Proficiência", "Proteções pesadas"]]),

  // Livro base — acessórios
  utility("Kit de perícia", "Acessórios", "0", 1, "Conjunto necessário para certos usos de uma perícia; sem ele, o teste correspondente sofre –5."),
  utility("Utensílio", "Acessórios", "I", 1, "Objeto escolhido para conceder +2 em uma perícia apropriada, exceto Luta e Pontaria.", "Livro base", "61", [["Escolha", "Uma perícia compatível"]]),
  utility("Vestimenta", "Acessórios", "I", 1, "Roupa preparada para conceder +2 em uma perícia apropriada, exceto Luta e Pontaria.", "Livro base", "61", [["Limite", "Benefício de até duas vestimentas"]]),

  // Livro base — explosivos e itens operacionais
  utility("Granada de atordoamento", "Explosivos", "0", 1, "Consumível de área que pode atordoar; Fortitude reduz o efeito."),
  utility("Granada de fragmentação", "Explosivos", "I", 1, "Consumível de área que causa 8d6 de perfuração; Reflexos reduz o dano à metade."),
  utility("Granada de fumaça", "Explosivos", "0", 1, "Cria por duas rodadas uma área de fumaça que bloqueia a visão."),
  utility("Granada incendiária", "Explosivos", "I", 1, "Consumível de área que causa 6d6 de fogo e pode deixar alvos em chamas; Reflexos reduz o efeito."),
  utility("Mina antipessoal", "Explosivos", "I", 1, "Dispositivo remoto de área; exige Tática para instalação e causa 10d6 de perfuração em cone."),
  utility("Algemas", "Operacionais", "0", 1, "Restrição metálica para imobilizar os pulsos de uma criatura dominada ou agarrada."),
  utility("Bandoleira", "Operacionais", "0", 1, "Armazena até quatro itens pequenos e permite sacar ou guardar um deles como ação livre uma vez por rodada."),
  utility("Cicatrizante", "Operacionais", "I", 1, "Consumível de uso rápido que recupera 2d8+2 PV."),
  utility("Lanterna", "Operacionais", "0", 1, "Projeta luz clara em alcance curto e pode ser empunhada ou presa ao corpo."),
  utility("Óculos de visão térmica", "Operacionais", "I", 1, "Remove penalidades em testes causadas por camuflagem."),
  utility("Pistola de dardos", "Operacionais", "I", 1, "Dispositivo de alcance curto com duas cargas que pode incapacitar um alvo; Fortitude reduz o efeito."),
  utility("Soqueira", "Operacionais", "0", 1, "Aumenta em +1 o dano desarmado e aceita modificações próprias de armas corpo a corpo."),
  utility("Spray de pimenta", "Operacionais", "0", 1, "Item de alcance curto que pode prejudicar a visão de um alvo; Fortitude reduz o efeito."),
  utility("Taser", "Operacionais", "0", 1, "Dispositivo de duas cargas que pode incapacitar uma criatura adjacente; Fortitude reduz o efeito."),

  // Sobrevivendo ao Horror — acessórios
  utility("Amuleto sagrado", "Acessórios", "0", 1, "Item vestido que concede +2 em Religião e Vontade.", "Sobrevivendo ao Horror", "39"),
  utility("Celular", "Acessórios", "0", 1, "Registra mídia, oferece comunicação e, com internet, concede +2 em testes para obter informações; possui luz curta.", "Sobrevivendo ao Horror", "39"),
  utility("Chave de fenda universal", "Acessórios", "0", 1, "Concede +2 em testes apropriados para criar, reparar ou apoiar o uso de objetos.", "Sobrevivendo ao Horror", "39"),
  utility("Chaves", "Acessórios", "0", 1, "Pode ser usada como distração para conceder +2 em Furtividade na mesma rodada.", "Sobrevivendo ao Horror", "39"),
  utility("Documentos falsos", "Acessórios", "I", 1, "Concede +2 em Diplomacia, Enganação e Intimidação ao sustentar a identidade representada.", "Sobrevivendo ao Horror", "39"),
  utility("Manual operacional", "Acessórios", "I", 1, "Ao ser estudado num interlúdio, permite usar uma perícia escolhida como treinada até o próximo interlúdio.", "Sobrevivendo ao Horror", "39"),
  utility("Notebook", "Acessórios", "0", 2, "Com internet, concede +2 para obter informações; ao relaxar, aumenta em 1 a recuperação de Sanidade.", "Sobrevivendo ao Horror", "39"),

  // Sobrevivendo ao Horror — explosivos
  utility("Dinamite", "Explosivos", "I", 1, "Consumível de área que causa dano de impacto e fogo; Reflexos reduz o efeito.", "Sobrevivendo ao Horror", "41"),
  utility("Explosivo plástico", "Explosivos", "I", 1, "Dispositivo de detonação remota voltado a objetos e estruturas, com dano de impacto em área.", "Sobrevivendo ao Horror", "41"),
  utility("Galão vermelho", "Explosivos", "0", 2, "Recipiente inflamável que pode gerar uma área de fogo quando rompido durante a cena.", "Sobrevivendo ao Horror", "41"),
  utility("Granada de gás sonífero", "Explosivos", "I", 1, "Cria por duas rodadas uma nuvem que causa cansaço ou inconsciência; Fortitude reduz o efeito.", "Sobrevivendo ao Horror", "41"),
  utility("Granada de PEM", "Explosivos", "I", 1, "Pulso em área que desativa eletrônicos até o fim da cena e afeta criaturas de Energia.", "Sobrevivendo ao Horror", "41"),

  // Sobrevivendo ao Horror — operacionais
  utility("Alarme de movimento", "Operacionais", "0", 1, "Monitora movimento em um cone e envia um alerta discreto ou sonoro.", "Sobrevivendo ao Horror", "42"),
  utility("Alimento energético", "Operacionais", "II", 1, "Consumível que recupera 1d4 PE.", "Sobrevivendo ao Horror", "42"),
  utility("Aplicador de medicamentos", "Operacionais", "I", 1, "Armazena três doses e permite aplicar um cicatrizante ou medicamento como ação de movimento.", "Sobrevivendo ao Horror", "42"),
  utility("Braçadeira reforçada", "Operacionais", "I", 1, "Aumenta em +2 a resistência a dano recebida ao bloquear.", "Sobrevivendo ao Horror", "42"),
  utility("Cão adestrado", "Operacionais", "I", 0, "Aliado para personagens treinados em Adestramento; concede +2 em Investigação e Percepção e possui postura defensiva.", "Sobrevivendo ao Horror", "42"),
  utility("Coldre saque rápido", "Operacionais", "I", 1, "Permite sacar ou guardar uma arma de fogo leve como ação livre uma vez por rodada.", "Sobrevivendo ao Horror", "42"),
  utility("Equipamento de escuta", "Operacionais", "I", 1, "Conjunto de receptor e transmissores para captar sons a distância; exige Crime para instalação discreta.", "Sobrevivendo ao Horror", "42"),
  utility("Estrepes", "Operacionais", "0", 1, "Cobrem uma área pequena e podem reduzir o deslocamento; Reflexos evita o efeito.", "Sobrevivendo ao Horror", "42"),
  utility("Faixa de pregos", "Operacionais", "I", 2, "Versão ampla dos estrepes que cobre uma linha e também pode reduzir o deslocamento de veículos.", "Sobrevivendo ao Horror", "43"),
  utility("Isqueiro", "Operacionais", "0", 0.5, "Produz uma chama pequena e ilumina um raio de 3 m.", "Sobrevivendo ao Horror", "43"),
  utility("Óculos de visão noturna", "Operacionais", "I", 1, "Permite enxergar no escuro, mas aumenta a vulnerabilidade a luz intensa.", "Sobrevivendo ao Horror", "43"),
  utility("Óculos escuros", "Operacionais", "0", 1, "Impede que o usuário fique ofuscado.", "Sobrevivendo ao Horror", "43"),
  utility("Pá", "Operacionais", "0", 2, "Concede +5 em testes de Força para cavar ou mover detritos e pode funcionar como bastão.", "Sobrevivendo ao Horror", "43"),
  utility("Paraquedas", "Operacionais", "I", 2, "Anula dano de queda quando usado corretamente; personagens sem treinamento adequado fazem teste de Reflexos.", "Sobrevivendo ao Horror", "43"),
  utility("Traje de mergulho", "Operacionais", "I", 2, "Fornece oxigênio, +5 contra efeitos ambientais e resistência química 5.", "Sobrevivendo ao Horror", "44"),
  utility("Traje espacial", "Operacionais", "II", 5, "Fornece suprimentos temporários, +10 contra efeitos ambientais e resistência química 20.", "Sobrevivendo ao Horror", "44"),

  // Sobrevivendo ao Horror — medicamentos do jogo
  utility("Antibiótico", "Medicamentos", "I", 0.5, "Consumível do jogo que concede +5 no próximo teste de Fortitude contra doença até o fim do dia.", "Sobrevivendo ao Horror", "43"),
  utility("Antídoto", "Medicamentos", "I", 0.5, "Consumível do jogo que concede +5 no próximo teste de Fortitude contra veneno até o fim do dia.", "Sobrevivendo ao Horror", "43"),
  utility("Antiemético", "Medicamentos", "I", 0.5, "Consumível do jogo que remove enjoado e concede +5 para evitar essa condição até o fim da cena.", "Sobrevivendo ao Horror", "43"),
  utility("Antihistamínico", "Medicamentos", "I", 0.5, "Consumível do jogo que concede +5 no próximo teste contra uma alergia até o fim do dia.", "Sobrevivendo ao Horror", "43"),
  utility("Anti-inflamatório", "Medicamentos", "I", 0.5, "Consumível do jogo que concede 1d8+2 PV temporários.", "Sobrevivendo ao Horror", "43"),
  utility("Antitérmico", "Medicamentos", "I", 0.5, "Consumível do jogo que permite um novo teste contra uma condição mental, uma vez por cena.", "Sobrevivendo ao Horror", "43"),
  utility("Broncodilatador", "Medicamentos", "I", 0.5, "Consumível do jogo que concede +5 contra as condições asfixiado ou fatigado até o fim do dia.", "Sobrevivendo ao Horror", "43"),
  utility("Coagulante", "Medicamentos", "I", 0.5, "Consumível do jogo que concede +5 para estabilização e pode ajudar em um teste de Medicina.", "Sobrevivendo ao Horror", "43"),

  // Itens paranormais e selos
  utility("Selo paranormal de 1º círculo", "Paranormais", "I", 1, "Consumível que contém um ritual de 1º círculo e desaparece após a ativação.", "Livro base", "142"),
  utility("Selo paranormal de 2º círculo", "Paranormais", "II", 1, "Consumível que contém um ritual de 2º círculo e desaparece após a ativação.", "Livro base", "142"),
  utility("Selo paranormal de 3º círculo", "Paranormais", "III", 1, "Consumível que contém um ritual de 3º círculo e desaparece após a ativação.", "Livro base", "142"),
  utility("Selo paranormal de 4º círculo", "Paranormais", "IV", 1, "Consumível que contém um ritual de 4º círculo e desaparece após a ativação.", "Livro base", "142"),
  utility("Coração pulsante", "Paranormais", "Especial", 1, "Item de uso único que permite gastar reação e 2 PE para reduzir pela metade um dano recebido.", "Livro base", "142"),
  utility("Crânio espiral", "Paranormais", "Especial", 1, "Item de uso único que conjura Velocidade Mortal sem o custo-base do ritual.", "Livro base", "142"),
  utility("Frasco de lodo", "Paranormais", "Especial", 1, "Consumível paranormal que pode recuperar PV; ferimentos antigos tornam o resultado incerto.", "Livro base", "143"),
  utility("Pergaminho da pertinácia", "Paranormais", "Especial", 1, "Consumível que concede 5 PE temporários até o fim da cena.", "Livro base", "143"),
  utility("Catalisador ampliador", "Paranormais", "I", 0.5, "Consumível ritualístico que aumenta o alcance em um passo ou dobra a área do ritual.", "Sobrevivendo ao Horror", "44"),
  utility("Catalisador perturbador", "Paranormais", "I", 0.5, "Consumível ritualístico que aumenta em +2 a DT de resistência do ritual.", "Sobrevivendo ao Horror", "44"),
  utility("Catalisador potencializador", "Paranormais", "I", 0.5, "Consumível ritualístico que aumenta o dano do ritual em um dado do mesmo tipo.", "Sobrevivendo ao Horror", "44"),
  utility("Catalisador prolongador", "Paranormais", "I", 0.5, "Consumível ritualístico que dobra uma duração válida do ritual.", "Sobrevivendo ao Horror", "44"),
  utility("Ligação direta infernal", "Paranormais", "II", 1, "Aprimora paranormalmente um veículo, aumentando resistência e Pilotagem, mas amplificando consequências de falhas.", "Sobrevivendo ao Horror", "44"),
  utility("Medidor de condição vertebral", "Paranormais", "II", 1, "Vestimenta paranormal que concede +2 em Fortitude, indica a condição do usuário e dá +5 em Medicina para auxiliá-lo.", "Sobrevivendo ao Horror", "44"),
  utility("Pé de morto", "Paranormais", "II", 1, "Botas paranormais que concedem +5 em Furtividade e reduzem a visibilidade gerada por movimentos chamativos.", "Sobrevivendo ao Horror", "45"),
  utility("Pendrive selado", "Paranormais", "II", 0.5, "Dispositivo protegido contra efeitos de Energia, útil para armazenar dados e interagir com outros aparelhos.", "Sobrevivendo ao Horror", "45"),
  utility("Valete da salvação", "Paranormais", "I", 0.5, "Carta consumível que aponta uma rota de fuga e garante uma ação de cortar caminho numa perseguição.", "Sobrevivendo ao Horror", "45"),

  // Arquivos Secretos #1
  utility("Agrupador ritualístico", "Paranormais", "II", 1, "Permite prender até quatro componentes ou catalisadores, que contam como empunhados junto com o agrupador.", "Arquivos Secretos #1", "54"),
  utility("Amuleto sinalizador de <Elemento>", "Paranormais", "II", 1, "Ao ser adquirido, escolhe um elemento que não seja Medo; sinaliza criaturas desse elemento em alcance longo.", "Arquivos Secretos #1", "54"),
  utility("Rubra", "Paranormais", "II", 1, "Consumível paranormal que concede bônus físicos e PV temporários, seguido por perda temporária de atributos e um teste de Vontade crescente.", "Arquivos Secretos #1", "54", [["Bônus", "+5 em FOR, AGI e VIG; 10 PV temporários"], ["Consequência", "Perda temporária de 1d3 pontos de atributos físicos"]]),
  utility("Arpão do pescador", "Paranormais", "III", 1, "Arma simples de uma mão e arremesso que causa dano físico e de Sangue e pode deixar o alvo lento.", "Arquivos Secretos #1", "55", [["Dano", "1d8 perfuração + 1d12 Sangue"], ["Crítico", "20/x3"], ["Alcance", "Curto"]]),
  utility("Combustível de sangue", "Paranormais", "III", 1, "Munição paranormal para lança-chamas ou galões que converte o dano para Sangue e aumenta os dados em um passo.", "Arquivos Secretos #1", "55"),
  utility("Marreta transtornada", "Paranormais", "IV", 2, "Arma tática paranormal de duas mãos com dano elevado e um custo de PV para quem a empunha ou ataca.", "Arquivos Secretos #1", "55", [["Dano", "2d10 impacto + 2d12 Sangue"], ["Crítico", "20/x4"]]),

  // Arquivos Secretos #2 — recursos
  utility("Bandagem", "Medicamentos", "I", 0.5, "Consumível de cena que recupera 2d4+2 PV e remove a condição sangrando do usuário ou de um alvo adjacente.", "Arquivos Secretos #2", "21"),
  utility("Bússola", "Acessórios", "I", 1, "Utensílio que concede +2 em Sobrevivência para orientação e navegação.", "Arquivos Secretos #2", "21", [["Bônus", "+2 em Sobrevivência para orientação"]]),
  utility("Caixa de ferramentas", "Acessórios", "I", 2, "Utensílio que concede +2 em Profissão quando suas ferramentas forem adequadas ao teste.", "Arquivos Secretos #2", "21", [["Bônus", "+2 em Profissão quando aplicável"]]),
  utility("Dose de Álcool", "Medicamentos", "I", 0.5, "Recurso antisséptico do jogo: melhora testes contra certas infecções e amplia a recuperação de uma bandagem usada em conjunto.", "Arquivos Secretos #2", "21", [["Bônus", "+2 no teste indicado"], ["Com bandagem", "Recuperação passa para 2d8+2 PV"]]),
  utility("Incenso", "Acessórios", "I", 0.5, "Em uma ação de interlúdio, permite que o grupo presente recupere 1d4 PE; cada personagem recebe esse benefício uma vez por dia.", "Arquivos Secretos #2", "21"),
  utility("Kit de escalada", "Acessórios", "I", 2, "Utensílio que concede +2 em Atletismo para escalar.", "Arquivos Secretos #2", "21", [["Bônus", "+2 em Atletismo para escalar"]]),
  utility("Pedra de amolar", "Acessórios", "I", 0.5, "Após uma ação de interlúdio, uma arma corpo a corpo de corte ou perfuração recebe +1d4 de dano na primeira cena em que for usada.", "Arquivos Secretos #2", "21", [["Bônus", "+1d4 de dano na primeira cena"]]),

  // Arquivos Secretos #2 — itens únicos da campanha
  utility("Machado do Mutilador", "Paranormais", "IV", 1, "Arma tática paranormal de Sangue; ao atingir um alvo, pode gastar 1 PE para aplicar a condição sangrando, de forma cumulativa.", "Arquivos Secretos #2", "41", [["Dano", "1d8 corte + 1d8 Sangue"], ["Crítico", "20/x3"], ["Empunhadura", "Uma mão"]]),
  utility("Elmo do Colosso", "Paranormais", "III", 2, "Vestimenta paranormal de Energia que concede resistência a dano 5 e completa um traje de mergulho quando usada com o restante do equipamento.", "Arquivos Secretos #2", "47", [["Resistência", "Dano 5"]]),
  utility("Manoplas do Colosso", "Paranormais", "IV", 2, "Par de armas táticas paranormais de Energia que precisa ser usado em conjunto e interage com efeitos de ataques desarmados.", "Arquivos Secretos #2", "47", [["Dano de cada manopla", "1d6 impacto + 1d10 Energia"], ["Crítico", "20/x2"], ["Empunhadura", "Uma mão cada"]]),
  utility("Punhal X", "Paranormais", "IV", 1, "Arma ágil de Conhecimento; por 2 PE, o ataque pode pegar o alvo desprevenido e limitar sua visão por uma rodada.", "Arquivos Secretos #2", "53", [["Dano", "1d4 perfuração + 1d6 Conhecimento"], ["Crítico", "19/x2"], ["Alcance", "Curto (arremesso)"]]),
  utility("Sniper Fantasma", "Paranormais", "IV", 2, "Fuzil paranormal de Morte; um atirador veterano recebe margem de ameaça adicional ao mirar, e a arma intensifica a condição morrendo.", "Arquivos Secretos #2", "59", [["Dano", "2d10 balístico + 2d4 Morte"], ["Crítico", "19/x3"], ["Alcance", "Longo"]]),
  utility("A Antena", "Paranormais", "IV", 2, "Arma improvisada paranormal que aumenta em +3 a DT dos rituais e pode guardar um ritual para liberá-lo depois como ação padrão.", "Arquivos Secretos #2", "67", [["Dano", "1d6 impacto"], ["Crítico", "20/x2"], ["Rituais", "+3 na DT; armazena 1 ritual"]]),
  utility("Catalisador sofisticado e horrorizado", "Paranormais", "III", 1, "Vestimenta ritualística reutilizável que gera 3d6 por cena; cada dado pode ampliar dano, recuperação de PV ou DT de um ritual.", "Arquivos Secretos #2", "75", [["Reserva", "3d6 por cena"], ["Uso", "1d6 por ritual"]]),
  utility("Faca Predadora", "Paranormais", "IV", 1, "Arma ágil de Sangue; ao gastar 2 PE e acertar, recupera 2d10 PV, convertendo o excesso em PV temporários.", "Arquivos Secretos #2", "93", [["Dano", "1d4 perfuração + 2d10 Sangue"], ["Crítico", "19/x3"], ["Alcance", "Curto (arremesso)"]]),
];

export const ITEM_BY_ID = new Map(ITEMS.map((entry) => [entry.id, entry]));

export function inventoryCapacity(character) {
  const strength = Math.max(0, Number(character?.atributos?.forca) || 0);
  return strength === 0 ? 2 : strength * 5;
}

export function inventoryUsage(character) {
  const entries = Array.isArray(character?.inventarioItens) ? character.inventarioItens : [];
  const categoryCounts = { I: 0, II: 0, III: 0, IV: 0 };
  let spaces = 0;
  let quantity = 0;
  for (const selected of entries) {
    const catalogItem = ITEM_BY_ID.get(selected.itemId);
    if (!catalogItem) continue;
    const amount = Math.max(1, Math.min(99, Number(selected.quantity) || 1));
    spaces += catalogItem.spaces * amount;
    quantity += amount;
    if (categoryCounts[catalogItem.category] !== undefined) {
      categoryCounts[catalogItem.category] += amount;
    }
  }
  const capacity = inventoryCapacity(character);
  return { spaces, quantity, capacity, overloaded: spaces > capacity, categoryCounts };
}
