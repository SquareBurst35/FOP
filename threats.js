// Catálogo de ameaças (mestre) — fichas de combate para o mestre consultar.
// Cada entrada é um resumo mecânico em texto próprio, nunca o parágrafo do
// livro; números conferidos visualmente contra o PDF (nunca inventados).
// Ver docs/threats-audit.md para o método de extração e o progresso por livro.

const slug = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Ordem em que as abas de elemento aparecem na tela de Ameaças. "Realidade"
// não é um elemento do jogo — é o balde do próprio livro para ameaças
// mundanas (pessoas, animais) que fecham o capítulo de ameaças.
export const THREAT_ELEMENT_ORDER = ["Conhecimento", "Energia", "Morte", "Sangue", "Medo", "Realidade"];

export const THREAT_SIZES = ["Minúsculo", "Pequeno", "Médio", "Grande", "Enorme", "Colossal"];

// d20 é sempre a mesma face nesta mecânica: cada teste/perícia da ameaça é
// "dice" dados de 20 (o grau de treinamento dela) mais um bônus fixo.
function test(dice, bonus) {
  return { dice, bonus };
}

function threat({
  name,
  element,
  secondaryElements = [],
  category = "Criatura",
  size = "Médio",
  vd,
  presencaPerturbadora = null,
  enigmaDoMedo = "",
  percepcao = null,
  iniciativa = null,
  sentidosExtras = [],
  defesa,
  fortitude = null,
  reflexos = null,
  vontade = null,
  pontosDeVida,
  machucadoEm = null,
  resistencias = [],
  vulnerabilidades = [],
  imunidadesDano = [],
  imunidadesCondicoes = [],
  atributos,
  pericias = [],
  deslocamentoMetros,
  deslocamentoQuadrados,
  habilidadesPassivas = [],
  acoes = [],
  descricao,
  source = "Livro base",
  page = "",
}) {
  return {
    id: slug(`ameaca-${source}-${name}`),
    name,
    element,
    secondaryElements,
    category,
    size,
    vd,
    presencaPerturbadora,
    enigmaDoMedo,
    percepcao,
    iniciativa,
    sentidosExtras,
    defesa,
    fortitude,
    reflexos,
    vontade,
    pontosDeVida,
    machucadoEm: machucadoEm ?? (typeof pontosDeVida === "number" ? Math.floor(pontosDeVida / 2) : null),
    resistencias,
    vulnerabilidades,
    imunidadesDano,
    imunidadesCondicoes,
    atributos,
    pericias,
    deslocamentoMetros,
    deslocamentoQuadrados,
    habilidadesPassivas,
    acoes,
    descricao,
    source,
    page,
  };
}

export const THREATS = [
  threat({
    name: "Aberração de Carne",
    element: "Sangue",
    category: "Criatura",
    size: "Grande",
    vd: 40,
    presencaPerturbadora: { dt: 15, dado: "3d6", tipo: "mental", imuneDesdeNex: 30 },
    percepcao: test(1, 5),
    iniciativa: test(1, 0),
    sentidosExtras: ["Percepção às cegas"],
    defesa: 19,
    fortitude: test(1, 10),
    reflexos: test(1, 0),
    vontade: test(1, 0),
    pontosDeVida: 70,
    resistencias: [
      { tipos: ["Balístico", "Impacto", "Perfuração"], valor: 5 },
      { tipos: ["Sangue"], valor: 10 },
    ],
    vulnerabilidades: ["Morte"],
    atributos: { agi: 1, for: 3, int: 0, pre: 1, vig: 3 },
    deslocamentoMetros: 9,
    deslocamentoQuadrados: 6,
    acoes: [
      {
        tipo: "Padrão",
        nome: "Agredir",
        ataques: [
          { nome: "Pancada", execucao: "Corpo a corpo x2", teste: test(1, 10), dano: { formula: "2d6+6", tipo: "impacto" } },
        ],
      },
      {
        tipo: "Reação",
        nome: "Agarrão",
        descricao: "Se a aberração de carne acertar um ataque de pancada, ela pode tentar agarrar o alvo (teste 1d20+12). Ela pode manter até dois personagens agarrados por vez.",
      },
      {
        tipo: "Movimento",
        nome: "Abocanhar",
        descricao: "A aberração de carne leva até dois personagens agarrados para dentro de sua boca central, que são abocanhados e continuam agarrados. Quando é abocanhado, e no início de cada turno da aberração em que continuar agarrado desta forma, o personagem sofre 3d6 pontos de dano de perfuração (Fortitude DT 15 reduz à metade). Qualquer personagem adjacente pode gastar uma ação padrão e um teste de Atletismo (DT 20) para tentar tirar outro personagem de dentro da boca.",
      },
    ],
    descricao: "Dois corpos fundidos por um experimento fracassado, mantidos conscientes até a dor virar fúria. Uma boca central abre no meio do que sobrou dos estômagos, cercada por braços e pernas em excesso.",
    source: "Livro base",
    page: "182",
  }),
  threat({
    name: "Carente",
    element: "Sangue",
    secondaryElements: ["Morte"],
    category: "Criatura",
    size: "Grande",
    vd: 300,
    presencaPerturbadora: { dt: 35, dado: "7d8", tipo: "mental", imuneDesdeNex: 90 },
    percepcao: test(3, 10),
    iniciativa: test(4, 15),
    sentidosExtras: ["Percepção às cegas"],
    defesa: 40,
    fortitude: test(4, 25),
    reflexos: test(4, 25),
    vontade: test(3, 15),
    pontosDeVida: 700,
    resistencias: [{ tipos: ["Balístico", "Impacto", "Perfuração", "Sangue"], valor: 20 }],
    vulnerabilidades: ["Morte"],
    atributos: { agi: 4, for: 4, int: 2, pre: 3, vig: 4 },
    pericias: [
      { nome: "Atletismo", teste: test(4, 20) },
      { nome: "Enganação", teste: test(3, 15) },
    ],
    deslocamentoMetros: 12,
    deslocamentoQuadrados: 8,
    habilidadesPassivas: [
      { nome: "Carência", descricao: "Qualquer ser que já esteve envolvido na gestação de outro ser recebe +1d20 em ataques contra o carente, porém o carente também recebe +1d20 em ataques contra esse ser." },
      { nome: "Regeneração de Sangue", descricao: "O carente possui Cura Acelerada 20. Se ficar inconsciente ou sofrer dano de Energia, esta habilidade deixa de funcionar até o fim da cena." },
    ],
    acoes: [
      {
        tipo: "Padrão",
        nome: "Agredir",
        ataques: [
          { nome: "Garras de Sangue", execucao: "Corpo a corpo x2", teste: test(4, 35), dano: { formula: "2d8+20", tipo: "Sangue" } },
          { nome: "Ferrão de Sangue", execucao: "Corpo a corpo", teste: test(4, 35), dano: { formula: "2d12+20", tipo: "Sangue" } },
          { nome: "Tentáculo", execucao: "Corpo a corpo", teste: test(4, 35), dano: { formula: "2d8+20", tipo: "Sangue" } },
        ],
      },
      {
        tipo: "Movimento",
        nome: "Forma Infantil",
        descricao: "O carente se contorce de volta para o corpo da pequena criança para passar em espaços pequenos, se retraindo e expandindo quando achar necessário. Não consegue abrir a primeira porta para entrar num lugar; uma vez que essa porta é aberta e ele deixa a forma infantil, pode ignorar essa restrição.",
      },
      {
        tipo: "Reação",
        nome: "Rasteira de Tentáculo",
        descricao: "Uma vez por rodada, quando fica adjacente a dois ou mais seres, o carente faz um ataque de tentáculo contra um deles. Se acertar, a vítima fica caída e é empurrada 6m para longe dele.",
      },
      {
        tipo: "Livre",
        nome: "Sugada Mortal",
        descricao: "Usando seu ferrão, o carente consegue sugar fluidos e apodrecer os órgãos internos. Um ser atingido pelo ferrão de sangue fica debilitado e enjoado até o fim da cena (Fortitude DT 35 evita).",
      },
      {
        tipo: "Movimento",
        nome: "Você É Minha Mamãe?",
        descricao: "O carente usa a parte que simula o corpo de uma criança para abraçar um ser adjacente, que fica paralisado até ser solto (Reflexos DT 25 evita). O carente pode manter o abraço indefinidamente, mas é forçado a soltar o alvo se sofrer dano de Energia.",
      },
    ],
    descricao: "Nascido da inveja de quem nunca sentiu amor, finge ser uma criança perdida batendo à porta para conseguir entrar. O que sai de dentro do rosto vazio não tem nada de infantil.",
    source: "Livro base",
    page: "188",
  }),
];

export const THREAT_BY_ID = new Map(THREATS.map((entry) => [entry.id, entry]));
