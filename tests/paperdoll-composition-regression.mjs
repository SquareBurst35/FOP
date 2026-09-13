import assert from 'node:assert/strict';
import { ITEMS } from '../items.js';
import { ITEM_ART, artForItem } from '../item-art.js';
import { variantFor, AGENT_VARIANT_KEYS } from '../equipment-variants.js';
import { variantPath } from '../agent-variants.js';
import { ITEM_COMPOSITION, compositionFor } from '../equipment-composition.js';
import { resolveEquipment, equipmentPlacements, EQUIPMENT_SLOTS } from '../equipment-visuals.js';
import { BODY_ATLAS, paintPaperdoll, placementFor, paperdollImagePaths } from '../paperdoll-renderer.js';

const own=name=>({...ITEMS.find(i=>i.name===name),quantity:1});
assert.equal(ITEMS.length,ITEMS.length);
assert.equal(Object.keys(ITEM_COMPOSITION).length,ITEMS.length);
assert.deepEqual(new Set(Object.keys(ITEM_COMPOSITION)),new Set(ITEMS.map(i=>i.id)));
const pristine=JSON.stringify({ITEMS,ITEM_ART});
const dispatch=new Set(['held','belt','pocket','stored','quiver','vest','heavyVest','garment','sling','harness','glasses','knuckles','necklace','collar','wrist','companion','backpack','suit','adjustment','vehicle','boots','headband','cape','mask','helmet','gauntlets']);

// Execute the real renderer through every recipe, with a strict canvas contract.
// Raster review is separately reproducible with scripts/render-equipment-qa.mjs.
const contexts=[];
class Canvas {
  constructor(width=420,height=600) {
    this.width=width;this.height=height;this.log=[];this.depth=0;contexts.push(this);
    this.context=new Proxy({canvas:this}, {get:(target,key)=>{
      if(key in target)return target[key];
      return (...args)=>{
        for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg),`Invalid canvas coordinate: ${key}`);
        if(key==='save')this.depth++;
        if(key==='restore')assert.ok(--this.depth>=0,'Unbalanced restore');
        if(key==='drawImage') {
          assert.ok(args[0],'Missing image');
          if(args.length===9)assert.ok(args[3]>0&&args[4]>0&&args[7]>0&&args[8]>0,'Invalid image rectangle');
        }
        this.log.push([key,...args.map(a=>typeof a==='object'?(a?.path??'surface'):a)]);
      };
    }});
  }
  getContext(){return this.context;}
}
const images=new Map([...new Set([BODY_ATLAS,...AGENT_VARIANT_KEYS.map(variantPath)])].map(path=>[path,{path}]));
const render=(placements,imgs=images)=>{
  contexts.length=0;const c=new Canvas();paintPaperdoll(c.getContext('2d'),imgs,placements);
  for(const ctx of contexts)assert.equal(ctx.depth,0,'Canvas state leaked');
  return contexts.map(c=>c.log);
};
const bare=render([]);
for(const item of ITEMS) {
  const art=artForItem(item),recipe=compositionFor(art);
  assert.ok(recipe&&dispatch.has(recipe.kind),item.name);
  assert.ok(EQUIPMENT_SLOTS.some(s=>s.id===recipe.slot),item.name);
  const entry={...item,quantity:1},equipped=resolveEquipment([entry]);
  assert.equal(equipped[recipe.slot]?.id,item.id,item.name);
  const placements=equipmentPlacements(equipped);
  if(recipe.visibility==='inventory'||recipe.visibility==='parent')assert.equal(placements.length,0,item.name);
  else assert.equal(placements.length,art.parts?.length??1,item.name);
  for(const p of placements)assert.equal(p.art.composition,recipe.kind,item.name);
  render(placements);
  assert.ok(paperdollImagePaths(placements).every(path=>path===BODY_ATLAS||path.startsWith('assets/agent-variants/')), 'Catalog art cannot be sampled on the body');
  for(const p of placements) {
    const missing=new Map(images);missing.delete(variantPath(variantFor(p.art).key));
    assert.deepEqual(render([p],missing),bare,`Missing texture must preserve body: ${item.name}`);
  }
  if(recipe.kind==='held') {
    const right=placements[0];
    const left=equipmentPlacements(resolveEquipment([entry],{weapon:'',secondary:entry.id}))[0];
    assert.equal(left.slot,'secondary');assert.notEqual(left.target[0],right.target[0]);
    assert.equal(left.scaleX,-right.scaleX);assert.equal(left.angle,-right.angle);
    render([left]);
  }
}
const sets=[
 ['Vestimenta','Proteção leve','Bastão'],
 ['Elmo do Colosso','Óculos de visão térmica','Proteção pesada'],
 ['Traje espacial','Lanterna'],['Pé de morto','Proteção pesada'],
 ['Manoplas do Colosso','Espada'],['Paraquedas','Bandoleira','Fuzil de assalto'],
 ['Enxame Fantasmagórico','Amuleto sagrado','Retalho Tenebroso','Braçadeira reforçada'],
 ['Traje de mergulho','Pé de morto','Crânio espiral'],
 ['Traje espacial','Manoplas do Colosso','Lanterna'],
 ['Arreio Neural','Catalisador sofisticado e horrorizado','Medidor de condição vertebral'],
];
for(const names of sets) {
 const entries=names.map(own),equipped=resolveEquipment(entries),p=equipmentPlacements(equipped);
 assert.equal(Object.values(equipped).filter(Boolean).length,names.length,`Slots collide: ${names}`);
 assert.equal(new Set(p.map(p=>p.art.id)).size,names.length,`Combination lost an item: ${names}`);
 render(p);
}
const names=['Vestimenta','Proteção pesada','Bandoleira'];
const ordered=equipmentPlacements(resolveEquipment(names.map(own)));
assert.deepEqual(render(ordered),render([...ordered].reverse()),'Cloth/armor/sling layering must not depend on input order');
for(const [oldSlot,name,newSlot] of [['head','Óculos escuros','eyes'],['outfit','Bandoleira','sling'],['weapon','Mandíbula Agonizante','neck']]) {
 const item=own(name),resolved=resolveEquipment([item],{[oldSlot]:item.id});assert.equal(resolved[newSlot].id,item.id,'Migrate legacy visual selection');
}
for(const name of ['Carregador rápido','Bateria potente']) {
 assert.equal(equipmentPlacements(resolveEquipment([own(name)])).length,0);
 const owner=name==='Carregador rápido'?'Fuzil de assalto':'Lanterna';
 const p=equipmentPlacements(resolveEquipment([own(name),own(owner)]));
 assert.ok(p.some(p=>p.art.composition==='adjustment'));
}
assert.equal(JSON.stringify({ITEMS,ITEM_ART}),pristine,'Rendering cannot mutate rules or catalog');
assert.ok(placementFor(artForItem(own('Traje espacial')),'outfit').height>0);
console.log(`${ITEMS.length} composition recipes: renderer dispatch, clipping, both hands, slot migration, missing textures and complete sets passed.`);
