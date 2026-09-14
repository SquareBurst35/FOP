import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import * as rules from '../rules.js';
import * as content from '../content.js';
import * as session from '../session.js';
import * as items from '../items.js';
import * as progression from '../progression.js';
import * as choices from '../choices.js';
import * as useOptions from '../use-options.js';
import * as upgrades from '../item-upgrades.js';
import { CharacterStore, encodeDocument, decodeDocument } from '../character-sync.js';

function agent(determination=false) {
  const c={id:'revoltado-test',nome:'Agente',origem:'Revoltado',classe:'Combatente',nivel:6,nex:30,trilha:'',
    atributos:{agilidade:2,forca:2,intelecto:2,presenca:1,vigor:2},
    optionalRules:{determination},habilidadesSelecionadas:[],habilidadeEscolhas:[],
    grausPericia:{},recursos:{}};
  rules.applyDerived(c,true); session.normalizeSession(c); return c;
}
const use=(c,cost)=>session.useAbility(c,{id:'test',name:'Uso de teste',cost,resource:'effort'});
const storage=()=>{const data=new Map();return{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))};};

test('Revoltado has a single origin and ability, correct skills and source attribution',()=>{
  assert.equal(rules.ORIGINS.filter(o=>o.name==='Revoltado').length,1);
  const origin=rules.findOrigin('Revoltado');
  assert.deepEqual(origin.skills,['Furtividade','Vontade']);
  assert.match(origin.source,/Marca-páginas/);
  const abilities=content.allSelectableAbilities(rules.ORIGINS).filter(a=>a.group==='Revoltado');
  assert.equal(abilities.length,1); assert.equal(abilities[0].id,'origens-revoltado-antes-so');
  assert.equal(abilities[0].cost,'Passivo'); assert.match(abilities[0].summary,/alcance curto/);
  const c=agent(); assert.ok(c.periciasTreinadas.includes('Furtividade')); assert.ok(c.periciasTreinadas.includes('Vontade'));
});

test('Antes Só needs the ability and explicit distance state, including legitimate Flashback',()=>{
  const c=agent(); assert.equal(session.beforeSoBonus(c),0);
  c.antesSoSemAliados=true; assert.equal(session.beforeSoBonus(c),1);
  c.origem='Acadêmico'; assert.equal(session.beforeSoBonus(c),0);
  const flashback='especialista-poderes-de-especialista-flashback';
  c.habilidadeEscolhas=[{abilityId:flashback,type:'origem',valueId:'Revoltado'}];
  assert.equal(session.beforeSoBonus(c),0);
  c.habilidadesSelecionadas=[flashback]; assert.equal(session.beforeSoBonus(c),1);
  c.antesSoSemAliados='true'; assert.equal(session.beforeSoBonus(c),0);
});

test('conditional Defense is idempotent; resource maxima and manual skill bonuses are untouched',()=>{
  const c=agent(), initial=structuredClone(c.recursos), defense=c.defesa;
  c.outrosBonusPericia={Luta:3}; c.antesSoSemAliados=true;
  for(let i=0;i<5;i++)rules.applyDerived(c);
  assert.equal(c.defesa,defense+1); assert.deepEqual(c.recursos,initial);
  assert.deepEqual(c.outrosBonusPericia,{Luta:3});
  c.antesSoSemAliados=false; rules.applyDerived(c); assert.equal(c.defesa,defense);
});

test('Antes Só adds exactly one to every level budget, for PE and PD; blocked uses are atomic',()=>{
  for(const determination of [false,true]) {
    const c=agent(determination); c.recursos.peAtual=c.recursos.peMax=100;c.recursos.pdAtual=c.recursos.pdMax=100;
    c.antesSoSemAliados=true;
    for(let level=0;level<=20;level++){c.nivel=level;assert.equal(session.turnSpendLimit(c),level+1);}
    c.nivel=6; assert.equal(use(c,7).ok,true);
    const key=determination?'pdAtual':'peAtual';assert.equal(c.recursos[key],93);
    const before=structuredClone(c); assert.equal(use(c,1).reason,'turn');assert.deepEqual(c,before);
    c.antesSoSemAliados=false; assert.equal(session.turnSpendLimit(c),6);assert.equal(use(c,1).reason,'turn');
    assert.equal(c.controleSessao.gastoTurno,7);
    session.startNextTurn(c);assert.equal(c.recursos[key],93);assert.equal(c.controleSessao.gastoTurno,0);
    c.antesSoSemAliados=true;session.startNextTurn(c);assert.equal(session.beforeSoBonus(c),1);
    session.startNextScene(c);assert.equal(session.beforeSoBonus(c),0);assert.equal(c.recursos[key],93);
  }
});

test('the origin and conditional budget survive local reload and existing Firestore sync',()=>{
  const c=agent(true);c.antesSoSemAliados=true;use(c,3);
  const local=storage();new CharacterStore(local).write([c]);
  const reloaded=new CharacterStore(local).read()[0];
  const remote=new CharacterStore(storage());remote.select('same-account');
  remote.merge([decodeDocument(c.id,encodeDocument(reloaded,'test-revision',1))]);
  const incoming=remote.read()[0];assert.equal(incoming.origem,'Revoltado');
  assert.equal(session.beforeSoBonus(incoming),1);assert.equal(session.turnSpendLimit(incoming),7);
  assert.equal(incoming.controleSessao.gastoTurno,3);assert.equal(incoming.recursos.pdAtual,c.recursos.pdAtual);
});

test('creation choices, panel, skill totals and distance toggle are connected to the existing app',()=>{
  const elements=new Map();
  const element=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',value:'',scrollTop:0,dataset:{},listeners:{},classList:{add(){},remove(){}},addEventListener(type,fn){this.listeners[type]=fn;},focus(){},scrollIntoView(){},querySelector(){return null;},querySelectorAll(){return[];}});return elements.get(key);};
  const document={querySelector:element,querySelectorAll:()=>[],getElementById:element};
  const window={location:{hash:''},scrollY:0,addEventListener(){},scrollTo(){},setTimeout(){},clearTimeout(){}};
  const context=vm.createContext({...rules,...content,...session,...items,...progression,...choices,...useOptions,...upgrades,document,window,structuredClone,crypto:webcrypto,console,URL,Date,Map,Set,setTimeout:()=>0,clearTimeout(){},localStorage:storage()});
  const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import[\s\S]*?from\s+"[^"]+";\n/gm,'');
  vm.runInContext(app,context);
  context.c=agent(true);context.c.antesSoSemAliados=true;context.c.grausPericia.Luta=5;context.c.outrosBonusPericia={Luta:3};
  const run=code=>vm.runInContext(code,context);
  assert.match(run('renderOriginOptions("Revoltado")'),/value="Revoltado" selected/);
  assert.match(run('renderSessionControl(c)'),/data-before-so checked/);
  assert.match(run('renderSessionControl(c)'),/limite de PD/);
  assert.match(run('renderSkillRow(c,"Luta")'),/data-skill-total="Luta">\+9</);
  context.c.antesSoSemAliados=false;assert.match(run('renderSkillRow(c,"Luta")'),/data-skill-total="Luta">\+8</);
  assert.equal(context.c.outrosBonusPericia.Luta,3);
  assert.match(app,/character\.antesSoSemAliados = event\.target\.checked === true;\s+upsertCharacter\(character\);\s+renderSheet\(character\.id\);/);
  context.c.origem='Acadêmico';assert.doesNotMatch(run('renderSessionControl(c)'),/data-before-so/);
});
