// Rendering recipes only. Catalog pixels and game data are deliberately independent.
import { ITEM_ART } from './item-art.js?v=20';

const groups = {
  held: ['Faca','Martelo','Punhal','Bastão','Machete','Lança','Cajado','Arco','Besta','Pistola','Revólver','Fuzil de caça','Machadinha','Nunchaku','Corrente','Espada','Florete','Machado','Marreta','Acha','Gadanho','Katana','Montante','Moto-serra','Arco composto','Balestra','Submetralhadora','Espingarda','Fuzil de assalto','Fuzil de precisão','Bazuca','Lança-chamas','Metralhadora','Pregador pneumático','Estilingue','Revólver compacto','Baioneta','Faca tática','Gancho de carne','Bastão policial','Picareta','Shuriken','Pistola pesada','Espingarda de cano duplo','Utensílio','Lanterna','Pistola de dardos','Taser','Celular','Chave de fenda universal','Notebook','Galão vermelho','Pá','Bússola','Caixa de ferramentas','Selo paranormal de 1º círculo','Selo paranormal de 2º círculo','Selo paranormal de 3º círculo','Selo paranormal de 4º círculo','Crânio espiral','Frasco de lodo','Pergaminho da pertinácia','Catalisador ampliador','Catalisador perturbador','Catalisador potencializador','Pendrive selado','Valete da salvação','Ampulheta do Tempo Sofrido','Câmera Obscura','Centrifugador Existencial','Dose d’A Praga','Espelho Refletor','Fuzil Alheio','Injeção de Lodo','Instantâneo Mortal','A Primeira Adaga','Rádio Chiador','Tábula do Saber Custoso','Agrupador ritualístico','Rubra','Arpão do pescador','Marreta transtornada','Machado do Mutilador','Punhal X','Sniper Fantasma','A Antena','Faca Predadora'],
  belt: ['Kit de perícia','Granada de atordoamento','Granada de fragmentação','Granada de fumaça','Granada incendiária','Algemas','Chaves','Granada de gás sonífero','Granada de PEM','Coldre saque rápido','Kit de escalada','Repositório do Fracasso'],
  pocket: ['Balas leves','Balas pesadas','Cartuchos','Balas curtas','Cicatrizante','Spray de pimenta','Documentos falsos','Manual operacional','Alarme de movimento','Alimento energético','Isqueiro','Antibiótico','Antídoto','Antiemético','Antihistamínico','Anti-inflamatório','Antitérmico','Broncodilatador','Coagulante','Bandagem','Dose de Álcool','Pedra de amolar','Projétil de Lodo, curto','Projétil de Lodo, longo'],
  stored: ['Foguete','Combustível','Mina antipessoal','Dinamite','Explosivo plástico','Equipamento de escuta','Estrepes','Faixa de pregos','Incenso','Combustível de sangue'],
  quiver: ['Flechas'],
  vest: ['Proteção leve'], heavyVest: ['Proteção pesada'], garment: ['Vestimenta'],
  sling: ['Bandoleira'], harness: ['Medidor de condição vertebral'],
  glasses: ['Óculos de visão térmica','Óculos de visão noturna','Óculos escuros'],
  knuckles: ['Soqueira'],
  necklace: ['Amuleto sagrado','Coração pulsante','Catalisador prolongador','Amuleto sinalizador de <Elemento>','Mandíbula Agonizante'],
  collar: ['Catalisador sofisticado e horrorizado'],
  wrist: ['Aplicador de medicamentos','Braçadeira reforçada','Conector de Membros'],
  companion: ['Cão adestrado'], backpack: ['Paraquedas'],
  suit: ['Traje de mergulho','Traje espacial'],
  adjustment: ['Carregador rápido','Bateria potente'],
  vehicle: ['Ligação direta infernal'], boots: ['Pé de morto'],
  headband: ['Arreio Neural'], cape: ['Enxame Fantasmagórico'], mask: ['Retalho Tenebroso'],
  helmet: ['Elmo do Colosso'], gauntlets: ['Manoplas do Colosso'],
};
const slotForKind = { glasses:'eyes', mask:'face', sling:'sling', harness:'harness', necklace:'neck' };
const byName = new Map();
for (const [kind, names] of Object.entries(groups)) for (const name of names) {
  if (byName.has(name)) throw new Error(`Composição duplicada: ${name}`);
  byName.set(name, kind);
}
export const ITEM_COMPOSITION = Object.freeze(Object.fromEntries(ITEM_ART.map(art => {
  const kind = byName.get(art.name);
  if (!kind) throw new Error(`Composição ausente: ${art.name}`);
  return [art.id, Object.freeze({ kind, slot: slotForKind[kind] ?? art.slot,
    visibility: ['stored','vehicle'].includes(kind) ? 'inventory' : kind === 'adjustment' ? 'parent' : 'body' })];
})));
export function compositionFor(art) { return art ? ITEM_COMPOSITION[art.id] ?? null : null; }

// Angles describe a relaxed carry, with the long object beside the body.
const longGuns = new Set(['Besta','Balestra','Fuzil de caça','Submetralhadora','Espingarda','Fuzil de assalto','Fuzil de precisão','Bazuca','Lança-chamas','Metralhadora','Espingarda de cano duplo','Fuzil Alheio','Sniper Fantasma']);
export function fittedArt(art, slot) {
  const recipe = compositionFor(art);
  const a = { ...art, composition: recipe?.kind ?? 'held' };
  if (longGuns.has(art.name)) { a.angle = 105; a.widthOnDoll = Math.min(art.widthOnDoll, 290); }
  if (recipe?.kind === 'held' && !longGuns.has(art.name) && art.angle===0 && art.widthOnDoll>40) a.angle=12;
  if (art.name==='Gadanho') { a.flip=true; a.angle=0; }
  if (recipe?.kind === 'held' && slot === 'secondary') { a.flip = !a.flip; a.angle = -(a.angle ?? 0); }
  if (recipe?.kind === 'necklace') {
    a.attachment = 'neck'; a.widthOnDoll = Math.min(art.widthOnDoll, 72);
    a.anchor = art.name === 'Mandíbula Agonizante' ? [.5,.05] : art.anchor;
  }
  if (recipe?.kind === 'glasses') { a.widthOnDoll=100; a.target=[222,157]; a.angle=3; }
  if (recipe?.kind === 'mask') { a.widthOnDoll=94; a.target=[221,172]; }
  if (recipe?.kind === 'helmet') { a.widthOnDoll=185; a.target=[210,135]; }
  if (recipe?.kind === 'headband') { a.widthOnDoll=172; a.target=[206,112]; }
  if (recipe?.kind === 'cape') { a.widthOnDoll=330; a.heightOnDoll=330; a.anchor=[.5,.12]; a.target=[200,180]; }
  if (recipe?.kind === 'backpack') { a.widthOnDoll=155; a.heightOnDoll=206; a.anchor=[.5,.1]; a.target=[133,196]; }
  if (recipe?.kind === 'companion') { a.target=[346,542]; a.anchor=[.5,1]; }
  if (recipe?.kind === 'pocket' || recipe?.kind === 'belt') { a.anchor=[.5,.13]; a.widthOnDoll=Math.min(a.widthOnDoll,recipe.kind==='pocket'?44:62); }
  if (recipe?.kind === 'quiver') { a.target=[112,252]; a.anchor=[.5,.6]; a.angle=-85; a.widthOnDoll=93; }
  return a;
}
