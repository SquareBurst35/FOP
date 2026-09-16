import assert from 'node:assert/strict';
import fs from 'node:fs';
import { inflateSync } from 'node:zlib';
import { ITEMS } from '../items.js';
import { artForItem } from '../item-art.js';
import { ITEM_VARIANTS, AGENT_VARIANT_KEYS, statesForPlacements } from '../equipment-variants.js';
import { AGENT_POSES } from '../agent-poses.js';
import { VARIANT_REGIONS, variantPath, visibleAgentStates } from '../agent-variants.js';
import { equipmentPlacements, resolveEquipment } from '../equipment-visuals.js';
import { BODY_ATLAS, paperdollImagePaths } from '../paperdoll-renderer.js';
const own=name=>({...ITEMS.find(item=>item.name===name),quantity:1});
const placements=names=>equipmentPlacements(resolveEquipment(names.map(own)));
assert.equal(Object.keys(ITEM_VARIANTS).length,ITEMS.length);
assert.deepEqual(new Set(Object.keys(ITEM_VARIANTS)),new Set(ITEMS.map(i=>i.id)));
function decodePng(file) {
 const b=fs.readFileSync(file);assert.equal(b.subarray(1,4).toString(),'PNG');
 const width=b.readUInt32BE(16),height=b.readUInt32BE(20);assert.equal(b[24],8);assert.equal(b[25],6,'RGBA sprites need real alpha');
 const data=[];for(let pos=8;pos<b.length;){const size=b.readUInt32BE(pos),type=b.toString('ascii',pos+4,pos+8);if(type==='IDAT')data.push(b.subarray(pos+8,pos+8+size));pos+=size+12;}
 const raw=inflateSync(Buffer.concat(data)),stride=width*4,out=Buffer.alloc(width*height*4);
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){const pos=y*stride+x,left=x>=4?out[pos-4]:0,up=y?out[pos-stride]:0,corner=y&&x>=4?out[pos-stride-4]:0;let value=raw[y*(stride+1)+1+x];if(filter===1)value+=left;else if(filter===2)value+=up;else if(filter===3)value+=Math.floor((left+up)/2);else if(filter===4)value+=paeth(left,up,corner);else assert.equal(filter,0);out[pos]=value&255;}}
 return {width,height,data:out};
}
for(const key of AGENT_VARIANT_KEYS){
 const file=new URL('../'+variantPath(key),import.meta.url);assert.ok(fs.existsSync(file),`Missing full-agent variant ${key}`);
 const png=decodePng(file);assert.equal(png.width,420,key);assert.equal(png.height,600,key);
 let opaque=0,transparent=0,magenta=0;for(let i=0;i<png.data.length;i+=4){const [r,g,b,a]=png.data.subarray(i,i+4);if(a>128){opaque++;if(r>200&&b>200&&g<50)magenta++;}else transparent++;}
 assert.ok(opaque>15000&&transparent>10000,`${key}: complete body and transparent background`);assert.equal(magenta,0,`${key}: leftover chroma background`);
}
for(const item of ITEMS){
 const state=ITEM_VARIANTS[item.id];
 if(state.region==='pose')assert.ok(AGENT_POSES[state.key],`Hand pose missing for ${item.name}`);
 else assert.ok(['inventory','adjustment','arms'].includes(state.region)||VARIANT_REGIONS[state.region],item.name);
 const p=placements([item.name]),paths=paperdollImagePaths(p);
 assert.ok(paths.every(path=>path===BODY_ATLAS||path.startsWith('assets/agent-variants/')),item.name);
 assert.ok(!paths.includes(artForItem(item).atlas),'Original catalog artwork must never be worn as a sticker');
 if(state.visibility==='body')assert.ok(paths.includes(variantPath(state.key)),item.name);else assert.deepEqual(paths,[BODY_ATLAS],item.name);
}
for(const [name,key,region] of [
 ['Vestimenta','garment','garment'],['Proteção leve','light-armor','torso'],['Proteção pesada','heavy-armor','armor'],
 ['Traje espacial','space-suit','body'],['Traje de mergulho','diving-suit','body'],['Pé de morto','dead-boots','feet'],
 ['Manoplas do Colosso','colossus-gloves','arms'],['Elmo do Colosso','colossus-helmet','head'],
 ['Cão adestrado','dog','companion'],['Enxame Fantasmagórico','ghost-cape','cape'],['Pendrive selado','usb-drive','pose'],
 ['Rádio Chiador','radio','pose'],['Agrupador ritualístico','component-holder','pose'],
 ]){const state=ITEM_VARIANTS[own(name).id];assert.equal(state.key,key,name);assert.equal(state.region,region,name);}
const gear=['Vestimenta','Proteção leve','Manoplas do Colosso','Espada'];
const states=statesForPlacements(placements(gear));assert.equal(states.length,gear.length,'Two gauntlet parts become one body state');
assert.deepEqual(states.map(s=>s.key),['garment','light-armor','colossus-gloves','sword']);
const two=statesForPlacements(placements(['Fuzil de assalto','Lanterna','Paraquedas','Bandoleira']));
const visible=visibleAgentStates(two);assert.equal(visible.filter(s=>s.region==='pose').length,1);assert.ok(visible.some(s=>s.key==='rifle'));assert.ok(visible.some(s=>s.key==='backpack'));assert.ok(visible.some(s=>s.key==='sling'));
const one=statesForPlacements(placements(['Faca','Pistola']));assert.equal(visibleAgentStates(one).filter(s=>s.region==='pose').length,2,'One-handed props can occupy both hands');
assert.ok(paperdollImagePaths([],{backpack:true}).includes(variantPath('backpack')));
console.log(`${ITEMS.length} items and ${AGENT_VARIANT_KEYS.length} full-agent PNGs: coverage, alpha, complete frames, body replacement, hands and catalog isolation passed.`);
