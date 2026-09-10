// Optional offline visual review. Requires @napi-rs/canvas in the local environment.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { ITEMS } from '../items.js';
import { ITEM_ART, artForItem } from '../item-art.js';
import { resolveEquipment, equipmentPlacements } from '../equipment-visuals.js';
import { BODY_ATLAS, paintPaperdoll, paperdollImagePaths } from '../paperdoll-renderer.js';
import { variantFor } from '../equipment-variants.js';
import assert from 'node:assert/strict';
import { compositionFor } from '../equipment-composition.js';
const require=createRequire(import.meta.url);
let canvas;try{canvas=require('@napi-rs/canvas');}catch{canvas=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules','@napi-rs/canvas'));}
const {createCanvas,loadImage}=canvas;
const output=path.resolve(process.argv[2]??'/tmp/fop-equipment-qa');fs.mkdirSync(output,{recursive:true});
const images=new Map(await Promise.all([...new Set([BODY_ATLAS,...ITEMS.flatMap(item=>paperdollImagePaths(equipmentPlacements(resolveEquipment([{...item,quantity:1}])))), 'assets/agent-variants/backpack.png'])].map(async p=>[p,await loadImage(new URL('../'+p,import.meta.url).pathname)])));
const own=name=>{const item=ITEMS.find(i=>i.name===name);if(!item)throw Error('Unknown QA item: '+name);return {...item,quantity:1};};
const sets=[
 ['Vestimenta'],['Proteção leve'],['Proteção pesada'],['Vestimenta','Proteção leve','Bastão'],
 ['Elmo do Colosso','Óculos de visão térmica','Proteção pesada'],['Traje espacial','Lanterna'],
 ['Pé de morto','Proteção pesada'],['Manoplas do Colosso','Espada'],
 ['Paraquedas','Bandoleira','Fuzil de assalto'],['Enxame Fantasmagórico','Amuleto sagrado','Retalho Tenebroso','Braçadeira reforçada'],
 ['Traje de mergulho','Pé de morto','Crânio espiral'],['Vestimenta','Bandoleira','Óculos escuros','Kit de perícia'],
 ['Traje espacial','Manoplas do Colosso','Lanterna'],['Arreio Neural','Catalisador sofisticado e horrorizado','Medidor de condição vertebral'],
 ['Cão adestrado','Proteção leve','Carregador rápido','Fuzil de assalto'],
];
function render(entries,preferences={},options={}) {
 const c=createCanvas(420,600),ctx=c.getContext('2d');
 const equipped=resolveEquipment(entries,preferences),placements=equipmentPlacements(equipped);
 paintPaperdoll(ctx,images,placements,options);return {c,placements};
}
function sheet(cases,file,columns=5) {
 const s=createCanvas(columns*250,Math.ceil(cases.length/columns)*365),ctx=s.getContext('2d');
 ctx.fillStyle='#222a32';ctx.fillRect(0,0,s.width,s.height);ctx.imageSmoothingEnabled=false;
 for(let j=0;j<cases.length;j++) {
  const {canvas,label,note}=cases[j],x=j%columns*250,y=Math.floor(j/columns)*365;
  ctx.drawImage(canvas,x+10,y,231,330);ctx.fillStyle='#fff';ctx.font='12px sans-serif';ctx.fillText(label,x+7,y+340,238);
  ctx.fillStyle='#b8c5cf';ctx.font='11px sans-serif';ctx.fillText(note??'',x+7,y+356,238);
 }
 fs.writeFileSync(path.join(output,file+'.png'),s.toBuffer('image/png'));
}
const report=[];
const bare=render([]).c.getContext('2d').getImageData(0,0,420,600).data;
for(let start=0;start<ITEMS.length;start+=15) {
 const cases=ITEMS.slice(start,start+15).map((item,i)=>{
  const {c,placements}=render([{...item,quantity:1}]);
  const art=artForItem(item),recipe=compositionFor(art);
  fs.writeFileSync(path.join(output,`${String(start+i).padStart(3,'0')}.png`),c.toBuffer('image/png'));
  const pixels=c.getContext('2d').getImageData(0,0,420,600).data;
  let changedPixels=0;for(let j=0;j<pixels.length;j+=4)if(pixels[j]!==bare[j]||pixels[j+1]!==bare[j+1]||pixels[j+2]!==bare[j+2]||pixels[j+3]!==bare[j+3])changedPixels++;
  if(recipe.visibility==='body')assert.ok(changedPixels>30,`No visible body change: ${item.name}`);else assert.equal(changedPixels,0,`Stored item must not float: ${item.name}`);
  report.push({index:start+i,id:item.id,name:item.name,kind:recipe.kind,variant:variantFor(art).key,visibility:recipe.visibility,placements:placements.length,changedPixels});
  return {canvas:c,label:`${start+i}. ${item.name}`,note:recipe.visibility==='inventory'?'Guardado no inventário':recipe.visibility==='parent'?'Precisa de equipamento compatível':recipe.kind};
 });sheet(cases,'items-'+String(start/15).padStart(2,'0'));
}
const combined=sets.map((names,i)=>{const {c}=render(names.map(own));fs.writeFileSync(path.join(output,`set-${i}.png`),c.toBuffer('image/png'));return {canvas:c,label:`${i}. ${names.join(' + ')}`};});
sheet(combined,'combinations');
const secondary=ITEM_ART.filter(a=>a.attachment==='hand').map(a=>{
 const item=own(a.name),{c}=render([item],{weapon:'',secondary:item.id});return {canvas:c,label:a.name};
});
for(let i=0;i<secondary.length;i+=15)sheet(secondary.slice(i,i+15),'left-'+Math.floor(i/15));
const custom=render([{id:'custom-pack',name:'Mochila',group:'Operacionais',quantity:1},...['Bandoleira','Fuzil de assalto'].map(own)],{},{backpack:true});
fs.writeFileSync(path.join(output,'custom-backpack.png'),custom.c.toBuffer('image/png'));
fs.writeFileSync(path.join(output,'coverage.json'),JSON.stringify(report,null,2));
console.log(`Rendered ${report.length} individual items, ${sets.length} sets, ${secondary.length} left-hand checks and custom backpack into ${output}`);
