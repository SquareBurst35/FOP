import * as useOptions from "../use-options.js";
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as rules from '../rules.js';
import * as content from '../content.js';
import * as items from '../items.js';
import * as progression from '../progression.js';
import * as choices from '../choices.js';
import * as session from '../session.js';
import { webcrypto } from 'node:crypto';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import[\s\S]*?from\s+"[^"]+";\n/gm,'');
function boot(className,nex,trail='') {
  const store=new Map(),els=new Map();
  const element=key=>{
    if(!els.has(key))els.set(key,{innerHTML:'',textContent:'',value:'',scrollTop:0,dataset:{},classList:{add(){},remove(){}},addEventListener(){},focus(){},scrollIntoView(){},querySelector(){return null;},querySelectorAll(){return[];}});
    return els.get(key);
  };
  const document={querySelector:element,querySelectorAll:()=>[],getElementById:element};
  const window={location:{hash:''},scrollY:0,addEventListener(){},scrollTo(){},setTimeout(){},clearTimeout(){}};
  const context=vm.createContext({...rules,...content,...items,...progression,...choices,...session,...useOptions,document,window,structuredClone,crypto:webcrypto,console,URL,Date,Map,Set,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)}});
  vm.runInContext(source,context);
  const run=code=>vm.runInContext(code,context);
  const data={classe:className,nex,nivel:nex/5,origem:'Acadêmico',trilha:trail,nome:'Agente de teste',atributos:{agilidade:1,forca:1,intelecto:3,presenca:2,vigor:2}};
  run(`creatorState={...createBlankCharacter(),...${JSON.stringify(data)}};`);
  // Valid initial skill selections are chosen before the new abilities step.
  run(`{
    const config=getSkillConfiguration(creatorState);
    creatorState.periciasClasseObrigatorias=config.classChoiceGroups.map(group=>group.find(s=>![...config.originAutomatic,...config.classAutomatic].includes(s))||group[0]);
    const taken=new Set([...config.originAutomatic,...config.classAutomatic,...creatorState.periciasClasseObrigatorias]);
    creatorState.periciasEscolhidas=SKILLS.filter(s=>!taken.has(s)).slice(0,config.classChoiceCount);
    skillSelectionStatus(creatorState);setInitialTrainingGrades(creatorState);currentStep=4;ensureCreatorProgress();
  }`);
  return {run,store,els,element};
}
const u=boot('Ocultista',5);
assert.match(u.run('renderCreatorChoices()'),/Habilidades e rituais/);
assert.equal(u.run('currentLevelUpPlan(creatorProgress.draft).ritualPicks'),3);
assert.ok(u.run('availableLevelUpRituals(creatorProgress.draft,currentLevelUpPlan(creatorProgress.draft)).every(r=>r.circle===1)'));
u.run('advanceCreator()');assert.equal(u.run('currentStep'),4);assert.equal(u.store.size,0,'Cannot save incomplete choices');
u.run('levelUpState.ritualIds=RITUALS.filter(r=>r.circle===1).slice(0,2).map(r=>r.id); advanceCreator()');assert.equal(u.run('creatorProgress.complete'),false);
u.run('levelUpState.ritualIds=RITUALS.filter(r=>r.circle===1).slice(0,3).map(r=>r.id); advanceCreator()');
assert.equal(u.run('creatorProgress.complete'),true);assert.equal(u.run('creatorOutput().rituaisSelecionados.length'),3);
assert.equal(u.store.size,0,'Confirming the draft must not create a saved sheet');
u.run('advanceCreator()');assert.equal(u.run('currentStep'),5);
u.run('advanceCreator()');assert.equal(u.run('currentStep'),6);
assert.match(u.run('renderCreatorStep()'),/Compreensão Paranormal/);
u.run('advanceCreator()');
const saved=JSON.parse(u.store.get('fop_personagens_v1'))[0];
assert.equal(saved.rituaisSelecionados.length,3);assert.equal(saved.nex,5);assert.equal(saved.recursos.peAtual,saved.recursos.peMax);

function fillLevel(ui) {
  ui.run(`{
    const draft=creatorProgress.draft,plan=currentLevelUpPlan(draft);
    if(plan.firstAgentLevel&&plan.className==='Especialista') levelUpState.peritoSkills=draft.periciasTreinadas.filter(s=>!['Luta','Pontaria'].includes(s)).slice(0,2);
    if(plan.needsAttribute) levelUpState.attribute=attributeIncreaseOptions(draft).find(([k])=>k!=='intelecto')[0];
    if(plan.trainingRank) levelUpState.gradeUpgrades=trainingEligibleSkills(draft,plan).slice(0,trainingRequiredCount(draft,plan));
    if(plan.needsClassPower||plan.needsVersatility) {
      const options=plan.needsVersatility?availableVersatilityAbilities(draft,plan):availableClassPowers(draft,plan);
      const plain=options.find(a=>!['Transcender','Treinamento em Perícia'].includes(a.name)&&!choiceSpecsForAbility(a,draft,[],choiceContext(draft)).length);
      if(plan.needsClassPower)levelUpState.classPowerId=plain?.id||'';
      if(plan.needsVersatility)levelUpState.versatilityId=plain?.id||'';
    }
    levelUpState.ritualIds=availableLevelUpRituals(draft,plan).slice(0,plan.ritualPicks).map(r=>r.id);
    // Fill dependent choices of automatically received trail benefits.
    for(let loop=0;loop<3;loop++)for(const {specification:s} of structuredLevelUpSpecs(draft,plan)){
      if(levelUpState.structuredChoices.some(c=>c.abilityId===s.ownerAbilityId&&c.type===s.type))continue;
      for(const o of s.options.slice(0,s.count))levelUpState.structuredChoices.push({abilityId:s.ownerAbilityId,type:s.type,valueId:o.id,value:o.label});
    }
  }`);
  assert.equal(ui.run('validateLevelUpStep(creatorProgress.draft,2)'),'',ui.run('JSON.stringify(currentLevelUpPlan(creatorProgress.draft))'));
  ui.run('confirmCreatorChoices()');
}
for(const [cls,nex,trail,expected] of [['Ocultista',10,'Conduíte',4],['Ocultista',25,'Conduíte',7],['Ocultista',55,'Conduíte',13],['Ocultista',85,'Conduíte',19],['Ocultista',100,'Conduíte',22],['Especialista',5,'',0],['Combatente',15,'Guerreiro',0]]) {
 const ui=boot(cls,nex,trail);
 for(let n=0;n<nex/5;n++){
  assert.equal(ui.run('currentLevelUpPlan(creatorProgress.draft).toLevel'),n+1);
  assert.equal(ui.run('currentLevelUpPlan(creatorProgress.draft).ritualCircle'),progression.ritualCircleForLevel(n+1));
  const known=ui.run('creatorProgress.draft.rituaisSelecionados.length');
  assert.ok(ui.run('availableLevelUpRituals(creatorProgress.draft,currentLevelUpPlan(creatorProgress.draft)).every(r=>!creatorProgress.draft.rituaisSelecionados.includes(r.id))'));
  fillLevel(ui);
  if(cls==='Ocultista')assert.equal(ui.run('creatorProgress.draft.rituaisSelecionados.length'),known+(n===0?3:1));
 }
 assert.equal(ui.run('creatorProgress.complete'),true);
 assert.equal(ui.run('creatorOutput().rituaisSelecionados.length'),expected);
 assert.equal(ui.run('creatorOutput().nex'),nex);
 if(cls==='Especialista')assert.equal(ui.run('creatorOutput().peritoPericias.length'),2);
 assert.equal(ui.store.size,0);
}
const reset=boot('Ocultista',5);fillLevel(reset);
reset.run("creatorState.nex=0;creatorState.nivel=0;creatorState.classe='Mundano';ensureCreatorProgress()");
assert.equal(reset.run('creatorProgress.complete'),true);assert.equal(reset.run('creatorOutput().rituaisSelecionados.length'),0,'Class/NEX changes clear old choices');
for(const cls of ['Mundano','Sobrevivente'])assert.equal(boot(cls,0).run('creatorProgress.complete'),true);
const cancel=boot('Ocultista',5);fillLevel(cancel);cancel.run("window.location.hash='#home';renderRoute()");assert.equal(cancel.store.size,0);
// A tampered/revisited review cannot bypass choices after changing formation.
const guard=boot('Ocultista',5);fillLevel(guard);guard.run('creatorState.nex=10;creatorState.nivel=2;currentStep=6;advanceCreator()');
assert.equal(guard.run('currentStep'),4);assert.equal(guard.store.size,0);

const illegal=boot('Ocultista',5);
illegal.run('levelUpState.ritualIds=RITUALS.filter(r=>r.circle===2).slice(0,3).map(r=>r.id)');
assert.notEqual(illegal.run('validateLevelUpStep(creatorProgress.draft,2)'),'', 'Higher circles are blocked at NEX 5');
illegal.run('levelUpState.ritualIds=Array(3).fill(RITUALS[0].id)');
assert.notEqual(illegal.run('validateLevelUpStep(creatorProgress.draft,2)'),'', 'Repeated rituals do not fill the quota');
const rewind=boot('Ocultista',10,'Conduíte');fillLevel(rewind);fillLevel(rewind);
rewind.run('rewindCreatorChoices()');
assert.equal(rewind.run('creatorProgress.draft.rituaisSelecionados.length'),3);
assert.equal(rewind.run('levelUpState.ritualIds.length'),1);
rewind.run('confirmCreatorChoices()');assert.equal(rewind.run('creatorOutput().rituaisSelecionados.length'),4,'Reviewing a choice does not duplicate it');
const nested=boot('Combatente',15,'Guerreiro');fillLevel(nested);fillLevel(nested);
nested.run("levelUpState.classPowerId=CLASS_POWERS.find(p=>p.category==='Combatente'&&p.name==='Transcender').id;levelUpState.paranormalPowerId=PARANORMAL_POWERS.find(p=>p.name==='Aprender Ritual').id");
assert.notEqual(nested.run('validateLevelUpStep(creatorProgress.draft,2)'),'');
nested.run('levelUpState.paranormalRitualId=availableTranscenderRituals(creatorProgress.draft,currentLevelUpPlan(creatorProgress.draft))[0].id;confirmCreatorChoices()');
assert.equal(nested.run('creatorOutput().rituaisSelecionados.length'),1);
assert.equal(nested.run('creatorOutput().transcenderNiveis[0]'),3);
const training=boot('Combatente',15,'Guerreiro');fillLevel(training);fillLevel(training);
training.run("levelUpState.classPowerId=CLASS_POWERS.find(p=>p.category==='Combatente'&&p.name==='Treinamento em Perícia').id");
assert.match(training.run('renderCreatorChoices()'),/data-level-up-power-training/,'Training options exist inside the creator, without a saved sheet');
console.log('Creation: initial ritual quotas, NEX 0–100, specialist, combatant, draft-only saves, class reset, cancel and review gate passed.');
for(const ritual of content.RITUALS.filter(r=>r.family==='Amaldiçoar Arma')) {
 const creation=boot('Ocultista',5);
 assert.ok(creation.run('renderCreatorChoices()').includes(ritual.name),`Missing initial choice: ${ritual.name}`);
 creation.run(`levelUpState.ritualIds=[${JSON.stringify(ritual.id)},...RITUALS.filter(r=>r.circle===1&&!r.family).slice(0,2).map(r=>r.id)];confirmCreatorChoices()`);
 assert.equal(creation.run('creatorProgress.complete'),true);
 assert.ok(creation.run('creatorOutput().rituaisSelecionados').includes(ritual.id));
 assert.equal(creation.run('creatorOutput().rituaisSelecionados.length'),3,'The selected element consumes exactly one initial ritual choice');
}
const aliases=boot('Ocultista',5);
aliases.run("ritualSearch='distorcao temporal';activeRitualCircle=4;activeRitualElement='Morte'");
assert.match(aliases.run('renderRitualPickerResults()'),/Distorcer o Tempo/);
