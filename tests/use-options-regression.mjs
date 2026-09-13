import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import { RITUALS, CLASS_POWERS } from '../content.js';
import { ritualUseOptions, abilityUseOptions, ritualCircleAccess, resolveUseOption } from '../use-options.js';
import { useAbility, undoLastUse } from '../session.js';
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const refs=JSON.parse(fs.readFileSync(new URL('./fixtures/ritual-use-costs.json',import.meta.url)));
assert.equal(refs.length,104,'104 ritual headers extracted from base v1.3 and three supplements');
for(const ref of refs){
 const entries=RITUALS.filter(r=>r.source===ref.source&&([r.name,...r.aliases].some(n=>norm(n)===norm(ref.name))||ref.name==='Amaldiçoar Arma'&&r.family===ref.name));
 assert.equal(entries.length,ref.name==='Amaldiçoar Arma'?4:1,ref.name);
 for(const r of entries){assert.equal(r.circle,ref.circle,r.name);assert.deepEqual(r.useVariants.variants,ref.variants,r.name);const options=ritualUseOptions({classe:'Ocultista',nex:99,afinidadeElemental:r.element},r);assert.equal(options.length,3);for(const v of ref.variants){const choice=options.find(o=>o.label===v.name);assert.equal(choice.cost,({1:1,2:3,3:6,4:10})[r.circle]+v.extra,`${r.name} ${v.name}`);}}
}
assert.equal(RITUALS.length,110,'107 choices in current books plus three saved legacy choices');
const curse=RITUALS.find(r=>r.name==='Amaldiçoar Arma (Sangue)');
const novice={classe:'Ocultista',nex:5};
assert.deepEqual(ritualUseOptions(novice,curse).map(o=>[o.label,o.cost,o.disabled]),[['Normal',1,false],['Discente',3,true],['Verdadeiro',6,true]]);
const advanced={classe:'Ocultista',nex:55,afinidadeElemental:'Sangue'};
assert.ok(ritualUseOptions(advanced,curse).every(o=>!o.disabled));
assert.equal(resolveUseOption(novice,curse,'ritual','verdadeiro'),null);
assert.equal(ritualCircleAccess({...novice,optionalRules:{separateLevelNex:true},nivel:17}),4);
assert.equal(ritualUseOptions({classe:'Combatente',nex:40},curse)[1].disabled,true);
assert.equal(ritualUseOptions({classe:'Combatente',nex:45},curse)[1].disabled,false);
const predileto=CLASS_POWERS.find(p=>p.name==='Ritual Predileto');
const discounted={...advanced,habilidadeEscolhas:[{abilityId:predileto.id,type:'ritual',valueId:curse.id}]};
assert.deepEqual(ritualUseOptions(discounted,curse).map(o=>o.cost),[1,2,5]);
for(const [nex,max,count]of[[5,2,2],[25,3,5],[55,4,9],[85,5,14]]){
 const options=abilityUseOptions({nex},{name:'Ataque Especial'});assert.equal(options.length,count);assert.equal(Math.max(...options.map(o=>o.cost)),max);
 assert.ok(options.some(o=>o.label===`+${(max-1)*5} ataque · +0 dano`));
}
assert.deepEqual(abilityUseOptions({nex:75},{name:'Eclético'}).map(o=>o.cost),[2,4,6]);
assert.deepEqual(abilityUseOptions({nex:85},{name:'Perito'}).map(o=>o.label),['+1d6','+1d8','+1d10','+1d12']);
assert.equal(abilityUseOptions({nex:60},{name:'Técnica Secreta'}).length,3);
assert.ok(abilityUseOptions({nex:65},{name:'Técnica Sublime'}).some(o=>o.cost===10));
for(const determination of [false,true]){
 const c={...advanced,optionalRules:{determination},recursos:{peAtual:20,peMax:20,pdAtual:20,pdMax:20}};
 const o=resolveUseOption(c,curse,'ritual','verdadeiro');const result=useAbility(c,{id:curse.id,name:curse.name,type:'ritual',variant:o.label,cost:o.cost,resource:'effort'});
 assert.equal(result.ok,true);assert.equal(result.record.variant,'Verdadeiro');assert.equal(c.recursos[determination?'pdAtual':'peAtual'],14);
 undoLastUse(c);assert.equal(c.recursos[determination?'pdAtual':'peAtual'],20);
 c.recursos[determination?'pdAtual':'peAtual']=1;assert.equal(useAbility(c,{id:curse.id,name:curse.name,cost:6,resource:'effort'}).ok,false);
}
console.log('All current ritual costs, explicit prerequisites, ability tiers, discounts, PE/PD and undo passed.');
