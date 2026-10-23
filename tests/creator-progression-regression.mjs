import * as tacticalOperations from "../tactical.js";
import * as abilityRules from "../ability-rules.js";
import * as tacticalUI from "../tactical-ui.js";
import * as tacticalStateModule from "../tactical-state.js";
import * as upgrades from "../item-upgrades.js";
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
import * as threats from '../threats.js';
import { webcrypto } from 'node:crypto';

const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import[\s\S]*?from\s+"[^"]+";\r?\n/gm,'');
function boot(className,nex,trail='') {
  const store=new Map(),els=new Map();
  const element=key=>{
    if(!els.has(key))els.set(key,{innerHTML:'',textContent:'',value:'',scrollTop:0,dataset:{},classList:{add(){},remove(){}},addEventListener(){},focus(){},scrollIntoView(){},querySelector(){return null;},querySelectorAll(){return[];}});
    return els.get(key);
  };
  const document={querySelector:element,querySelectorAll:()=>[],getElementById:element};
  const window={location:{hash:''},scrollY:0,addEventListener(){},scrollTo(){},setTimeout(){},clearTimeout(){}};
  const context=vm.createContext({...abilityRules,...tacticalOperations,...tacticalUI,...tacticalStateModule,...rules,...content,...items,...progression,...choices,...session,...useOptions,...upgrades,...threats,document,window,structuredClone,crypto:webcrypto,console,URL,Date,Map,Set,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)}});
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
    const required=creatorState.trilha==='Médico de Campo'?'Medicina':creatorState.trilha==='Parapsicólogo'?'Profissão':'';
    if(required&&!taken.has(required)&&!creatorState.periciasEscolhidas.includes(required))creatorState.periciasEscolhidas[creatorState.periciasEscolhidas.length-1]=required;
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
assert.match(u.run('renderCreatorStep()'),/História do agente/);
u.run('advanceCreator()');assert.equal(u.run('currentStep'),7);
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
      if(plan.needsClassPower)levelUpState.classPowerId=plain?.id||options.find(a=>a.name==='Transcender')?.id||'';
      if(plan.needsVersatility)levelUpState.versatilityId=plain?.id||'';
    }
    if(selectedPowerNamed('Transcender')) {
      levelUpState.paranormalPowerId=PARANORMAL_POWERS.find(p=>p.name===(draft.habilidadesSelecionadas.includes(PARANORMAL_POWERS.find(p=>p.name==='Afortunado').id)?'Aprender Ritual':'Afortunado')).id;
      if(selectedParanormalPower().name==='Aprender Ritual')levelUpState.paranormalRitualId=availableTranscenderRituals(draft,plan)[0].id;
      if(needsAffinityChoice(draft,plan))levelUpState.affinityElement=affinityOptions(draft)[0];
    }
    levelUpState.ritualIds=availableLevelUpRituals(draft,plan).slice(0,plan.ritualPicks).map(r=>r.id);
    if(effectiveAttributes(buildLevelUpPreview(draft)).intelecto>effectiveAttributes(draft).intelecto)levelUpState.intellectSkill=intellectSkillOptions(buildLevelUpPreview(draft))[0]||'';
    // Fill dependent choices of automatically received trail benefits.
    for(let loop=0;loop<3;loop++)for(const {specification:s} of structuredLevelUpSpecs(draft,plan)){
      if(levelUpState.structuredChoices.some(c=>c.abilityId===s.ownerAbilityId&&c.type===s.type))continue;
      let options=ABILITY_BY_ID.get(s.ownerAbilityId)?.name==='Ele Me Ensina'?s.options.filter(o=>ABILITY_BY_ID.get(o.id)?.name!=='Transcender'):s.options;
      if(s.type==='ritual')options=options.filter(o=>!levelUpState.structuredChoices.some(c=>c.type==='ritual'&&c.abilityId!==s.ownerAbilityId&&c.valueId===o.id));
      for(const o of options.slice(0,s.count))levelUpState.structuredChoices.push({abilityId:s.ownerAbilityId,type:s.type,valueId:o.id,value:o.label});
    }
  }`);
  assert.equal(ui.run('validateLevelUpStep(creatorProgress.draft,2)'),'',ui.run('JSON.stringify(currentLevelUpPlan(creatorProgress.draft))'));
  ui.run('confirmCreatorChoices()');
}
for(const [cls,nex,trail,expected] of [['Ocultista',10,'Conduíte',4],['Ocultista',25,'Conduíte',7],['Ocultista',55,'Conduíte',13],['Ocultista',85,'Conduíte',19],['Ocultista',100,'Conduíte',23],['Especialista',5,'',0],['Combatente',15,'Guerreiro',0]]) {
 const ui=boot(cls,nex,trail);
 for(let n=0;n<nex/5;n++){
  assert.equal(ui.run('currentLevelUpPlan(creatorProgress.draft).toLevel'),n+1);
  assert.equal(ui.run('currentLevelUpPlan(creatorProgress.draft).ritualCircle'),progression.ritualCircleForLevel(n+1));
  const known=ui.run('creatorProgress.draft.rituaisSelecionados.length');
  assert.ok(ui.run('availableLevelUpRituals(creatorProgress.draft,currentLevelUpPlan(creatorProgress.draft)).every(r=>!creatorProgress.draft.rituaisSelecionados.includes(r.id))'));
  fillLevel(ui);
  if(cls==='Ocultista')assert.equal(ui.run('creatorProgress.draft.rituaisSelecionados.length'),known+(n===0?3:n===19?2:1));
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
assert.equal(nested.run("abilityChoiceResolved(CLASS_POWERS.find(p=>p.category==='Combatente'&&p.name==='Transcender'),creatorOutput())"),true,'Transcender must retain its resolved choice after creation');
// Possuído only substitutes an actual class power, across the entire creation sequence.
const possessed=boot('Ocultista',100,'Possuído');
for(let level=1;level<=20;level++) {
  const needsPower=progression.CLASS_POWER_LEVELS.includes(level);
  assert.equal(possessed.run('currentLevelUpPlan(creatorProgress.draft).needsClassPower'),needsPower);
  assert.equal(possessed.run('selectedPowerNamed("Transcender")'),false,'A previous level must not keep Transcender selected');
  if(needsPower)assert.equal(possessed.run('availableClassPowers(creatorProgress.draft,currentLevelUpPlan(creatorProgress.draft)).every(p=>p.name==="Transcender")'),true);
  fillLevel(possessed);
  assert.deepEqual(JSON.parse(possessed.run('JSON.stringify(creatorProgress.draft.transcenderNiveis)')),progression.CLASS_POWER_LEVELS.filter(n=>n<=level));
  if(level>=3)assert.equal(possessed.run('abilityChoiceResolved(CLASS_POWERS.find(p=>p.category==="Ocultista"&&p.name==="Transcender"),creatorProgress.draft)'),true);
}
assert.equal(possessed.run('creatorOutput().recursos.ppMax'),15,'Only six class-power acquisitions increase possession');
// A stale selection cannot make an ordinary advance grant/require Transcender again.
const stalePossessed=boot('Ocultista',20,'Possuído');
for(let level=1;level<=3;level++)fillLevel(stalePossessed);
stalePossessed.run(`levelUpState.classPowerId=CLASS_POWERS.find(p=>p.category==='Ocultista'&&p.name==='Transcender').id;levelUpState.paranormalPowerId=PARANORMAL_POWERS.find(p=>p.name==='Resistir a Elemento').id;`);
assert.equal(stalePossessed.run('selectedPowerNamed("Transcender")'),false);
assert.doesNotMatch(stalePossessed.run('renderCreatorChoices()'),/id="level-up-paranormal-power-choice"/);
fillLevel(stalePossessed);
assert.deepEqual(JSON.parse(stalePossessed.run('JSON.stringify(creatorOutput().transcenderNiveis)')),[3]);
assert.equal(stalePossessed.run('creatorOutput().habilidadesSelecionadas.includes(PARANORMAL_POWERS.find(p=>p.name==="Resistir a Elemento").id)'),false);
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
assert.match(aliases.run('renderRitualPickerResults()'),/Distorção Temporal/);

// AS9: paired origin training must survive the real creator and a saved sheet.
for (const pair of [['Luta', 'Fortitude'], ['Pontaria', 'Reflexos']]) {
  const ui = boot('Combatente', 5);
  ui.run(`creatorState.origem='Treinado pela Hell Hunters';creatorState.periciasOrigemEscolhidas=${JSON.stringify(pair)};creatorProgress=null;levelUpState=null;currentStep=3;`);
  assert.match(ui.run('renderSkillStep()'), /data-origin-skill-pair/);
  ui.run(`{
    const config=getSkillConfiguration(creatorState),blocked=new Set(creatorState.periciasOrigemEscolhidas);
    creatorState.periciasClasseObrigatorias=config.classChoiceGroups.map(group=>group.find(s=>!blocked.has(s))||'');
    const taken=new Set([...blocked,...creatorState.periciasClasseObrigatorias]);
    creatorState.periciasEscolhidas=SKILLS.filter(s=>!taken.has(s)).slice(0,config.classChoiceCount);
    var as9SkillComplete=skillSelectionStatus(creatorState).complete;
    currentStep=4;ensureCreatorProgress();
  }`);
  assert.equal(ui.run('as9SkillComplete'), true);
  fillLevel(ui);
  assert.equal(ui.run('creatorProgress.complete'), true);
  ui.run('currentStep=7;advanceCreator()');
  const savedHell = JSON.parse(ui.store.get('fop_personagens_v1'))[0];
  assert.deepEqual(savedHell.periciasOrigemEscolhidas, pair);
  const baseline = rules.calculateDerived({ ...savedHell, origem: '' });
  assert.equal(savedHell.recursos[pair[0] === 'Luta' ? 'pvMax' : 'peMax'] - baseline[pair[0] === 'Luta' ? 'pvMax' : 'peMax'], pair[0] === 'Luta' ? 2 : 1);
}
for (const [cls, name] of [['Combatente', 'Incursor'], ['Especialista', 'Piloto de Drone']]) {
  const ui = boot(cls, 10, name);
  while (!ui.run('creatorProgress.complete')) fillLevel(ui);
  const selected = JSON.parse(ui.run('JSON.stringify(creatorOutput().habilidadeEscolhas)'));
  assert.ok(selected.some(c=>c.type===(cls==='Combatente'?'cqb':'drone')));
}

const hellPairEvent = boot('Combatente', 5);
hellPairEvent.run(`
  creatorState.origem='Treinado pela Hell Hunters';creatorState.periciasOrigemEscolhidas=[];currentStep=3;
  var as9PairCallback=null;
  var as9PairInput={value:'1',addEventListener:(event,handler)=>{if(event==='change')as9PairCallback=handler;}};
  document.querySelectorAll=(selector)=>selector==='[data-origin-skill-pair]'?[as9PairInput]:[];
  bindCreatorStep();
`);
assert.equal(hellPairEvent.run('typeof as9PairCallback'), 'function', 'The pair choice must be wired after rendering');
hellPairEvent.run('as9PairCallback()');
assert.deepEqual(JSON.parse(hellPairEvent.run('JSON.stringify(creatorState.periciasOrigemEscolhidas)')), ['Pontaria', 'Reflexos']);

// As transações também devem continuar reversíveis depois da normalização e do salvamento reais.
const operationApp = boot('Especialista', 10, 'Piloto de Drone');
operationApp.run(`
  var opCharacter={...createBlankCharacter(),nome:'Teste de operação',classe:'Especialista',trilha:'Piloto de Drone',nex:40,nivel:8};
  opCharacter.habilidadeEscolhas=[{abilityId:TRAIL_ABILITIES.find(a=>a.name==='Companheiro Drone').id,type:'drone',valueId:'medico',value:'Drone Médico'}];
  applyDerived(opCharacter,true); upsertCharacter(opCharacter);
  var opResult=performTacticalAction(opCharacter,'droneConfig',{droneId:'companheiro-1',types:['medico','inteligente','protetor'],available:true,operated:true});
  if(!opResult.ok)throw new Error(opResult.message);
  upsertCharacter(opCharacter);
  var opLoaded=getCharacter(opCharacter.id);
`);
assert.equal(operationApp.run('opLoaded.operacoesAS9.drones[0].category'), 'IV');
assert.equal(operationApp.run('undoLastUse(opLoaded).ok'), true, 'Salvar não pode invalidar o snapshot da operação');
assert.equal(operationApp.run('opLoaded.operacoesAS9'), undefined);
operationApp.run(`
  var oldDrone=ITEMS.find(i=>i.name==='Drone de Combate Tático');
  opCharacter.inventarioItens=[{itemId:oldDrone.id,quantity:1}];
  opCharacter.habilidadeEscolhas.push({abilityId:oldDrone.id,type:'pericia',valueId:'Tecnologia',value:'Tecnologia'});
  normalizeCharacter(opCharacter);
`);
assert.equal(operationApp.run('opCharacter.habilidadeEscolhas.some(c=>c.abilityId===oldDrone.id&&c.valueId==="Tecnologia")'),true,'Perícia permanente legada do item sobrevive à normalização');

operationApp.run(`
  var opAxe={...createBlankCharacter(),nome:'Bloqueio',classe:'Combatente',nex:99,nivel:20};
  var axeItem=ITEMS.find(i=>i.name==='Machado Tático');
  var axeUpgrade=ITEM_UPGRADES.find(i=>i.name==='Certeira');
  opAxe.inventarioItens=[{itemId:axeItem.id,quantity:1}]; opAxe.inventarioModificacoes={[axeItem.id]:[axeUpgrade.id]};
  applyDerived(opAxe,true); upsertCharacter(opAxe);
  var axeResult=performTacticalAction(opAxe,'axe',{damage:30,reduction:5});
  if(!axeResult.ok)throw new Error(axeResult.message);
  upsertCharacter(opAxe);var axeReloaded=getCharacter(opAxe.id);
`);
assert.equal(operationApp.run('undoLastUse(axeReloaded).ok'),true);
assert.equal(operationApp.run('axeReloaded.inventarioModificacoes[axeItem.id][0]'),operationApp.run('axeUpgrade.id'),'Desfazer a destruição também devolve as melhorias do machado');

// Every agent trail must complete the real creation wizard, including late benefits.
let auditedTrails=0;
for(const [className,data] of Object.entries(rules.CLASSES).filter(([name])=>['Combatente','Especialista','Ocultista'].includes(name))) {
  for(const trail of data.trails) {
    const ui=boot(className,100,trail);
    for(let level=1;level<=20;level++) {
      try { fillLevel(ui); }
      catch(error) { error.message=`${className}/${trail} level ${level}: ${error.message}`; throw error; }
      assert.equal(ui.run('creatorProgress.draft.nivel'),level);
      const snapshot=JSON.parse(ui.run('JSON.stringify(creatorProgress.draft)'));
      const recalculated=rules.applyDerived(structuredClone(snapshot));
      assert.deepEqual(recalculated.recursos,snapshot.recursos,`${className}/${trail} level ${level}: reloading must not change resources`);
    }
    assert.equal(ui.run('creatorProgress.complete'),true);
    assert.equal(ui.run('Object.values(creatorOutput().outrosBonusPericia).every(value=>value===0)'),true,`${trail}: automatic bonuses must not change manual fields`);
    auditedTrails++;
  }
}
console.log(`Trail audit: ${auditedTrails} agent trails completed all 20 creation levels and reloads.`);

const initialMonstrous=boot('Combatente',10,'Monstruoso');
assert.equal(initialMonstrous.run('creatorProgress.draft.grausPericia.Ocultismo'),0,'Future trail training must not exist at level 0');
fillLevel(initialMonstrous);fillLevel(initialMonstrous);
assert.equal(initialMonstrous.run('creatorOutput().grausPericia.Ocultismo'),5);
assert.equal(initialMonstrous.run('abilitySkillBonus(creatorOutput(),"Ocultismo")'),0,'The trail cannot count its own training as pre-existing training');

// A nested paranormal choice from an origin must also finish before saving the build.
const cultist=boot('Combatente',5);
cultist.run("creatorState.origem='Cultista Arrependido';creatorProgress=null;ensureCreatorProgress();levelUpState.structuredChoices=[{abilityId:ALL_ABILITIES.find(a=>a.name==='Traços do Outro Lado').id,type:'poder',valueId:PARANORMAL_POWERS.find(p=>p.name==='Aprender Ritual').id,value:'Aprender Ritual'}];");
assert.equal(cultist.run('selectedParanormalPower()?.name'),'Aprender Ritual');
assert.notEqual(cultist.run('validateLevelUpStep(creatorProgress.draft,2)'),'');
cultist.run('levelUpState.paranormalRitualId=availableTranscenderRituals(creatorProgress.draft,currentLevelUpPlan(creatorProgress.draft))[0].id;');
fillLevel(cultist);
assert.equal(cultist.run('creatorOutput().rituaisSelecionados.length'),1);
assert.equal(cultist.run('creatorOutput().transcenderNiveis.length'),0,'An origin paranormal power does not spend a Transcender advancement');

const legacyChoice=boot('Combatente',10,'Agente Secreto');
legacyChoice.run(`
  // This case checks the saved choice effects; sheet rendering has its own event tests.
  renderSheet=()=>{};
  var legacyAgent={...createBlankCharacter(),classe:'Combatente',trilha:'Agente Secreto',nex:10,nivel:2};
  var carta=TRAIL_ABILITIES.find(a=>a.name==='Carteirada');
  legacyAgent.grausPericia.Diplomacia=5;legacyAgent.outrosBonusPericia.Diplomacia=2;
  legacyAgent.habilidadeEscolhas=[{abilityId:carta.id,type:'pericia',valueId:'Diplomacia',value:'Diplomacia'}];
  abilityChoiceState={abilityId:carta.id,replace:true,staged:[...legacyAgent.habilidadeEscolhas],pendingAdd:false};
  applyAbilityChoice(legacyAgent);
`);
assert.equal(legacyChoice.run('legacyAgent.outrosBonusPericia.Diplomacia'),2);
assert.equal(legacyChoice.run('abilitySkillBonus(legacyAgent,"Diplomacia")'),0,'Editing a legacy choice must not duplicate its old manual bonus');
