// Items from Arquivos Secretos #3-7. Catalog-only entries: no paperdoll art,
// rendered generically like any equipment without a matching item-art.js record.
const slug = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const inventoryItem = ({ name, group, category = "0", spaces = 1, summary, source, page = "", details = [] }) => ({
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

const weapon = ({ name, proficiency, handling, category, spaces, damage, critical, range = "—", type, source, page, summary }) =>
  inventoryItem({
    name,
    group: "Armas",
    category,
    spaces,
    source,
    page,
    summary,
    details: [
      ["Proficiência", proficiency],
      ["Empunhadura", handling],
      ["Dano", damage],
      ["Crítico", critical],
      ["Alcance", range],
      ["Tipo", type],
    ],
  });

const utility = (name, group, category, spaces, summary, source, page, details = []) =>
  inventoryItem({ name, group, category, spaces, summary, source, page, details });

export const AS04_ITEMS = [
  utility("Granada de Gás Lacrimogêneo", "Explosivos", "I", 1, "Consumível de raio de 6 m: 4d6 de dano químico, enjoado e dificuldade respiratória. Fortitude reduz o dano à metade e evita enjoado. Fora da área, a dificuldade respiratória dura 1d4 rodadas.", "Arquivos Secretos #4", "70"),
  utility("Granada de Tinta", "Explosivos", "0", 1, "Consumível de raio de 6 m: deixa os alvos vulneráveis e aplica −2d20 em Furtividade pela cena; Reflexos evita.", "Arquivos Secretos #4", "70"),
  utility("Granada Ctrl+C Ctrl+V", "Explosivos", "II", 1, "Granada amaldiçoada de Energia: alcance médio, raio de 6 m, 8d6 de dano de Energia; Reflexos reduz à metade. Após cada explosão, 1d4 par cria outra granada dentro da área anterior, até quatro explosões no total.", "Arquivos Secretos #4", "70", [["Elemento", "Energia"]]),
  weapon({ name: "Lançador de Granadas", proficiency: "Pesada", handling: "Fogo · duas mãos", category: "II", spaces: 2, damage: "Conforme a granada", critical: "Conforme a granada", range: "Longo", type: "Conforme a granada", source: "Arquivos Secretos #4", page: "71", summary: "Arma pesada de duas mãos que comporta seis granadas 40 mm; recarregar uma custa ação de movimento. Um acerto direto nega a resistência apenas do alvo atingido; disparar num ponto dispensa o ataque e todos os alvos resistem. Granadas de arremesso não são compatíveis." }),
];

export const SUPPLEMENT_ITEMS = [...AS04_ITEMS];
