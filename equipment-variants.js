// Each entry selects a complete, already-equipped version of the agent.
// Shared silhouettes describe physical item types; catalog illustrations stay separate.
import { ITEM_ART } from './item-art.js?v=20';
import { compositionFor } from './equipment-composition.js?v=21';
const groups = {
  knife: ['Faca','Punhal','Baioneta','Faca tática','A Primeira Adaga','Punhal X','Faca Predadora'],
  hammer: ['Martelo','Marreta','Marreta transtornada'],
  baton: ['Bastão','Bastão policial'],
  sword: ['Machete','Espada','Katana','Montante'],
  spear: ['Lança','Arpão do pescador'],
  staff: ['Cajado','A Antena'],
  bow: ['Arco','Arco composto'], crossbow: ['Besta','Balestra'],
  pistol: ['Pistola','Pistola pesada','Pistola de dardos','Taser','Pregador pneumático'],
  revolver: ['Revólver','Revólver compacto'],
  rifle: ['Fuzil de caça','Submetralhadora','Fuzil de assalto','Metralhadora','Fuzil Alheio'],
  axe: ['Machadinha','Machado','Acha','Machado do Mutilador'],
  nunchaku: ['Nunchaku'], chain: ['Corrente'], rapier: ['Florete'],
  scythe: ['Gadanho'], chainsaw: ['Moto-serra'], shotgun: ['Espingarda','Espingarda de cano duplo'],
  sniper: ['Fuzil de precisão','Sniper Fantasma'], launcher: ['Bazuca'], flamethrower: ['Lança-chamas'],
  slingshot: ['Estilingue'], hook: ['Gancho de carne'], pickaxe: ['Picareta'], shuriken: ['Shuriken'],
  'hand-case': ['Utensílio','Caixa de ferramentas','Centrifugador Existencial'],
  flashlight: ['Lanterna'], phone: ['Celular'], 'usb-drive': ['Pendrive selado'], screwdriver: ['Chave de fenda universal'],
  laptop: ['Notebook'], 'red-can': ['Galão vermelho'], shovel: ['Pá'], compass: ['Bússola'],
  scroll: ['Selo paranormal de 1º círculo','Selo paranormal de 2º círculo','Selo paranormal de 3º círculo','Selo paranormal de 4º círculo','Pergaminho da pertinácia'],
  'skull-charm': ['Crânio espiral'], bottle: ['Frasco de lodo','Dose d’A Praga','Rubra'], 'component-holder': ['Agrupador ritualístico'],
  'arcane-device': ['Catalisador ampliador','Catalisador perturbador','Catalisador potencializador'],
  card: ['Valete da salvação','Instantâneo Mortal'], hourglass: ['Ampulheta do Tempo Sofrido'],
  camera: ['Câmera Obscura'], mirror: ['Espelho Refletor'], injector: ['Injeção de Lodo'],
  radio: ['Rádio Chiador'], book: ['Tábula do Saber Custoso'],
  'belt-pouch': ['Kit de perícia','Kit de escalada','Coldre saque rápido','Repositório do Fracasso','Balas leves','Balas pesadas','Cartuchos','Balas curtas','Cicatrizante','Spray de pimenta','Documentos falsos','Manual operacional','Alarme de movimento','Alimento energético','Isqueiro','Antibiótico','Antídoto','Antiemético','Antihistamínico','Anti-inflamatório','Antitérmico','Broncodilatador','Coagulante','Bandagem','Dose de Álcool','Pedra de amolar','Projétil de Lodo, curto','Projétil de Lodo, longo'],
  'belt-grenade': ['Granada de atordoamento','Granada de fragmentação','Granada de fumaça','Granada incendiária','Granada de gás sonífero','Granada de PEM'],
  'belt-cuffs': ['Algemas'], 'belt-keys': ['Chaves'],
  inventory: ['Foguete','Combustível','Mina antipessoal','Dinamite','Explosivo plástico','Equipamento de escuta','Estrepes','Faixa de pregos','Incenso','Combustível de sangue','Ligação direta infernal'],
  quiver: ['Flechas'], 'light-armor': ['Proteção leve'], 'heavy-armor': ['Proteção pesada'], garment: ['Vestimenta'],
  sling: ['Bandoleira'], harness: ['Medidor de condição vertebral'],
  'night-goggles': ['Óculos de visão térmica','Óculos de visão noturna'], sunglasses: ['Óculos escuros'],
  knuckles: ['Soqueira'], amulet: ['Amuleto sagrado'], 'heart-pendant': ['Coração pulsante'],
  'crystal-pendant': ['Catalisador prolongador'], 'element-pendant': ['Amuleto sinalizador de <Elemento>'],
  'jaw-pendant': ['Mandíbula Agonizante'], 'neck-collar': ['Catalisador sofisticado e horrorizado'],
  'wrist-device': ['Aplicador de medicamentos'], bracer: ['Braçadeira reforçada'], 'link-bracer': ['Conector de Membros'],
  dog: ['Cão adestrado'], backpack: ['Paraquedas'], 'diving-suit': ['Traje de mergulho'], 'space-suit': ['Traje espacial'],
  adjustment: ['Carregador rápido','Bateria potente'], 'dead-boots': ['Pé de morto'],
  'neural-headband': ['Arreio Neural'], 'ghost-cape': ['Enxame Fantasmagórico'], 'cloth-mask': ['Retalho Tenebroso'],
  'colossus-helmet': ['Elmo do Colosso'], 'colossus-gloves': ['Manoplas do Colosso'],
};
const byName=new Map();
for(const [key,names] of Object.entries(groups))for(const name of names) {
  if(byName.has(name))throw Error(`Versão do agente duplicada: ${name}`);
  byName.set(name,key);
}
const regionFor={vest:'torso',heavyVest:'armor',garment:'garment',suit:'body',boots:'feet',helmet:'head',headband:'brow',glasses:'eyes',mask:'face',necklace:'neck',collar:'neck',wrist:'leftArm',gauntlets:'arms',knuckles:'leftArm',backpack:'backpack',cape:'cape',companion:'companion',quiver:'quiver',sling:'sling',harness:'harness',belt:'belt',pocket:'belt',held:'pose',adjustment:'adjustment',stored:'inventory',vehicle:'inventory'};
const orderFor={body:0,cape:1,backpack:2,quiver:3,garment:10,armor:20,torso:20,neck:25,belt:30,sling:35,harness:36,head:40,brow:41,eyes:42,face:43,feet:50,leftArm:55,rightArm:55,arms:55,pose:60,adjustment:65,companion:70};
export const ITEM_VARIANTS=Object.freeze(Object.fromEntries(ITEM_ART.map(art=>{
  const key=byName.get(art.name),composition=compositionFor(art),region=['wrist-device','link-bracer','knuckles'].includes(key)?'rightArm':regionFor[composition.kind];
  if(!key||!region)throw Error(`Versão do agente ausente: ${art.name}`);
  return [art.id,Object.freeze({key,region,order:orderFor[region]??0,visibility:composition.visibility})];
})));
if(byName.size!==ITEM_ART.length)throw Error('O mapeamento de versões contém nomes fora do catálogo.');
export const AGENT_VARIANT_KEYS=Object.freeze(Object.keys(groups).filter(key=>!['inventory','adjustment'].includes(key)));
export function variantFor(art) {return art?ITEM_VARIANTS[art.id]??null:null;}
export function statesForPlacements(placements) {
  const seen=new Set();
  return placements.flatMap(p=>{
    const state=variantFor(p.art),id=`${p.slot}:${p.art.id}`;
    if(!state||state.visibility==='inventory'||seen.has(id))return [];
    seen.add(id);return [{...state,slot:p.slot,id:p.art.id,name:p.art.name}];
  }).sort((a,b)=>a.order-b.order||a.slot.localeCompare(b.slot)||a.id.localeCompare(b.id));
}
