import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASSES, calculateDerived, applyDerived, characterResistances, abilitySkillBonus, abilitySkillDiceModifier, ritualDifficulty } from '../rules.js';
import { CLASS_POWERS, TRAIL_ABILITIES, RITUALS } from '../content.js';
import { automaticTrailAbilities, ownedAbilities, effectiveAttributes, canReceiveTrailAbility } from '../ability-rules.js';
import { inventoryCapacity, inventoryUsage, ITEMS } from '../items.js';
import { ITEM_UPGRADES, upgradedItem } from '../item-upgrades.js';
import { choiceSpecsForAbility } from '../choices.js';
import { abilityUseOptions } from '../use-options.js';
import { encodeDocument, decodeDocument } from '../character-sync.js';

const agent=(classe,trilha,level=2,extra={})=>({id:'trail-test',classe,trilha,nivel:level,nex:level*5,atributos:{forca:1,agilidade:2,intelecto:3,presenca:2,vigor:2},habilidadesSelecionadas:[],habilidadeEscolhas:[],grausPericia:{},periciasTreinadas:[],rituaisSelecionados:[],...extra});
const ability=(name,category)=>TRAIL_ABILITIES.find(a=>a.name===name&&(!category||a.category===category));
const ritual=RITUALS.find(r=>r.name==='Amaldiçoar Arma (Sangue)');

for(const [classe,data] of Object.entries(CLASSES).filter(([name])=>['Combatente','Especialista','Ocultista'].includes(name))) {
  for(const trilha of data.trails) test(`${classe}/${trilha}: 20 níveis, NEX separado, PD e recálculo estável`,()=>{
    for(let level=1;level<=20;level++) for(const separateLevelNex of [false,true]) for(const determination of [false,true]) {
      const c=agent(classe,trilha,level,{optionalRules:{separateLevelNex,determination}});
      if(separateLevelNex)c.nex=10;
      const snapshot=JSON.stringify(c);
      const derived=calculateDerived(c);
      for(const key of ['pvMax','peMax','sanMax','pdMax','ppMax','defesa','deslocamento'])assert.ok(Number.isFinite(derived[key])&&derived[key]>=0,`${trilha} ${level}: ${key}`);
      assert.equal(JSON.stringify(c),snapshot,'Calculating never mutates the source');
      assert.ok(automaticTrailAbilities(c).every(a=>a.unlockNex<=level*5));
      if(level===1)assert.equal(automaticTrailAbilities(c).length,0);
      const applied=applyDerived(structuredClone(c));
      const once=JSON.stringify(applied);
      applyDerived(applied);
      assert.equal(JSON.stringify(applied),once,'Recalculating cannot grant a benefit twice');
    }
  });
}
test('Casca Grossa soma PV retroativos na trilha e por Versatilidade',()=>{
  for(let level=2;level<=20;level++) {
    const c=agent('Combatente','Tropa de Choque',level);
    const baseline=calculateDerived({...c,trilha:''});
    assert.equal(calculateDerived(c).pvMax-baseline.pvMax,level);
    assert.equal(calculateDerived({...c,trilha:'Guerreiro',habilidadesSelecionadas:[ability('Casca Grossa').id]}).pvMax,calculateDerived(c).pvMax);
  }
});
test('Técnico e Muambeiro ampliam carga também como habilidades recebidas',()=>{
  assert.equal(inventoryCapacity(agent('Especialista','Técnico')),20);
  assert.equal(inventoryCapacity(agent('Especialista','Muambeiro')),10);
  assert.equal(inventoryCapacity(agent('Combatente','Guerreiro',10,{habilidadesSelecionadas:[ability('Inventário Otimizado').id]})),20);
});
test('Inabalável e Inquebrável reconhecem a habilidade automática sem duplicar',()=>{
  const intuitive=agent('Ocultista','Intuitivo',13);
  assert.ok(characterResistances(intuitive).some(r=>r.source==='Inabalável'&&r.value===10));
  assert.equal(characterResistances({...intuitive,nex:60,nivel:12}).some(r=>r.source==='Inabalável'),false);
  const tank=agent('Combatente','Tropa de Choque',20,{recursos:{pvMax:100,pvAtual:50}});
  assert.equal(calculateDerived(tank).defesa,17);
  assert.equal(calculateDerived({...tank,habilidadesSelecionadas:[ability('Inquebrável').id]}).defesa,17);
});
test('Graduado aumenta a DT em cinco somente ao receber Rituais Eficientes',()=>{
  for(const level of [12,13,20]) {
    const c=agent('Ocultista','Graduado',level);
    assert.equal(ritualDifficulty(c,ritual)-ritualDifficulty({...c,trilha:''},ritual),level>=13?5:0);
  }
  const specialist=CLASS_POWERS.find(p=>p.name==='Especialista em Elemento');
  const c=agent('Ocultista','Graduado',13,{habilidadesSelecionadas:[specialist.id],habilidadeEscolhas:[{abilityId:specialist.id,type:'elemento',valueId:'Sangue'}]});
  assert.equal(ritualDifficulty(c,ritual)-ritualDifficulty({...c,habilidadeEscolhas:[]},ritual),2);
});
test('Bibliotecário: INT e PE extras são calculados uma vez, com base preservada',()=>{
  const c=agent('Especialista','Bibliotecário',20);
  assert.equal(effectiveAttributes(c).intelecto,4);
  assert.equal(calculateDerived(c).peMax-calculateDerived({...c,trilha:''}).peMax,4);
  assert.equal(c.atributos.intelecto,3);
  assert.equal(calculateDerived({...c,nex:95,nivel:19}).peMax-calculateDerived({...c,trilha:'',nex:95,nivel:19}).peMax,0);
});
test('Gatuno, O Sorriso e Iniciativa Aprimorada não escrevem nos bônus manuais',()=>{
  assert.equal(abilitySkillBonus(agent('Especialista','Infiltrador',8),'Crime'),5);
  assert.equal(abilitySkillBonus(agent('Especialista','Infiltrador',7),'Crime'),0);
  assert.equal(abilitySkillBonus(agent('Combatente','Agente Secreto',8),'Enganação'),2);
  assert.equal(abilitySkillBonus(agent('Combatente','Operações Especiais',2),'Iniciativa'),5);
});
test('Monstruoso: penalidade permanente, ritual diário e atributo de PE respeitam o patamar',()=>{
  for(const [classe,first] of [['Combatente','Ser Amaldiçoado'],['Especialista','Ser Experimentado'],['Ocultista','Ser Escarificado']]) {
    const entry=ability(first,classe);
    const c=agent(classe,'Monstruoso',13,{habilidadeEscolhas:[{abilityId:entry.id,type:'elemento',valueId:'Conhecimento'}]});
    assert.equal(effectiveAttributes(c).presenca,1);
    assert.equal(effectiveAttributes(c).intelecto,3);
    const active={...c,efeitosAtivos:[{id:'etapa',name:'Etapa de Monstruoso',variant:'Até o fim do dia'}]};
    assert.ok(calculateDerived(active).peMax>calculateDerived(c).peMax);
    if(classe==='Combatente') {
      assert.equal(effectiveAttributes(active).intelecto,4);
      assert.equal(characterResistances(c).some(r=>r.source==='Trilha Monstruoso'),false);
      assert.ok(characterResistances(active).some(r=>r.value===15));
    }
    const encoded=encodeDocument(active,'test-revision');
    assert.equal(calculateDerived(decodeDocument(active.id,encoded).data).peMax,calculateDerived(active).peMax);
  }
});
test('Bibliotecário não exige uma escolha permanente para Conhecimento Prático',()=>{
  const c=agent('Especialista','Bibliotecário');
  assert.deepEqual(choiceSpecsForAbility(ability('Conhecimento Prático'),c),[]);
  assert.equal(abilityUseOptions(c,ability('Conhecimento Prático'))[0].cost,2);
});
test('Médico e Negociador oferecem apenas os custos liberados em cada patamar',()=>{
  for(const [level,expected] of [[2,[2]],[8,[2,3]],[13,[2,3,4]],[20,[2,3,4,5]]])assert.deepEqual(abilityUseOptions(agent('Especialista','Médico de Campo',level),ability('Paramédico')).map(o=>o.cost),expected);
  assert.equal(ability('Reanimação').cost,'10 PE e ação completa · 1/cena');
  assert.equal(ability('Equipe de Trauma').cost,'2 PE e ação padrão');
  assert.equal(ability('Resgate').cost,'Passivo');
  assert.deepEqual(abilityUseOptions(agent('Especialista','Negociador',13),ability('Discurso Motivador')).map(o=>o.cost),[4,8]);
});
test('Criptologista e Granadeiro recebem o poder concedido pela habilidade de trilha',()=>{
  assert.ok(ownedAbilities(agent('Ocultista','Criptologista do Oculto')).some(a=>a.name==='Criar Selo'));
  assert.ok(ownedAbilities(agent('Especialista','Granadeiro Blaster',8)).some(a=>a.name==='Perito em Explosivos'));
});
test('A Favorita muda a categoria nos três patamares, sem perder modificações',()=>{
  const weapon=ITEMS.find(item=>item.name==='Fuzil de assalto');
  const favorite=ability('A Favorita');
  const upgrade=ITEM_UPGRADES.find(item=>item.name==='Calibre Grosso'&&item.target==='Armas');
  for(const [level,category]of[[2,'II'],[8,'I'],[20,'0']]) {
    const c=agent('Combatente','Aniquilador',level,{habilidadeEscolhas:[{abilityId:favorite.id,type:'item',valueId:weapon.id}]});
    const upgraded=upgradedItem(weapon,[upgrade.id],c);
    assert.equal(upgraded.category,category);
    assert.equal(upgraded.upgrades.length,1);
    if(level===20)assert.equal(upgraded.details.find(([key])=>key==='Dano')[1],'4d10');
  }
});
test('Remendão e Mochila de Utilidades ajustam categorias e espaços no inventário',()=>{
  const item=ITEMS.find(item=>item.name==='Cicatrizante');
  assert.equal(upgradedItem(item,[],agent('Especialista','Técnico',8)).category,'0');
  const pouch=CLASS_POWERS.find(power=>power.name==='Mochila de Utilidades');
  const c=agent('Especialista','Infiltrador',3,{habilidadesSelecionadas:[pouch.id],habilidadeEscolhas:[{abilityId:pouch.id,type:'item',valueId:item.id}],inventarioItens:[{itemId:item.id,quantity:2}]});
  assert.equal(inventoryUsage(c).spaces,0);
  assert.equal(inventoryUsage(c).categoryCounts.I,0);
});
test('Grimório conta um espaço e não duplica um grimório já registrado como item',()=>{
  const c=agent('Ocultista','Graduado',8);
  assert.equal(inventoryUsage(c).spaces,1);
  assert.equal(inventoryUsage({...c,itensPersonalizados:[{id:'grimorio',name:'Grimório Ritualístico',spaces:1,category:'0',quantity:1}]}).spaces,1);
});
test('Penalidades sociais e dados de Monstruoso mudam nos patamares previstos',()=>{
  for(const [level,flat,dice]of[[2,-2,0],[8,-5,0],[13,0,-1],[20,0,-2]]) {
    const c=agent('Especialista','Monstruoso',level);
    assert.equal(abilitySkillBonus(c,'Diplomacia'),flat);
    assert.equal(abilitySkillDiceModifier(c,'Diplomacia'),dice);
  }
});
test('Médico de Campo e Parapsicólogo exigem o treinamento de entrada',()=>{
  for(const [name,skill]of[['Paramédico','Medicina'],['Terapia','Profissão']]) {
    const entry=ability(name);
    const c=agent(entry.category,'',2);
    assert.equal(canReceiveTrailAbility(c,entry),false);
    assert.equal(canReceiveTrailAbility({...c,grausPericia:{[skill]:5}},entry),true);
  }
});
test('Ele Me Ensina não oferece novamente uma habilidade inicial já conhecida',()=>{
  const first=ability('Ampliar Ritual');
  const c=agent('Ocultista','Possuído',13,{habilidadesSelecionadas:[first.id]});
  const entry=ability('Ele Me Ensina');
  const context={abilityById:new Map(TRAIL_ABILITIES.map(a=>[a.id,a])),automaticAbilities:automaticTrailAbilities(c)};
  assert.equal(choiceSpecsForAbility(entry,c,[],context)[0].options.some(option=>option.id===first.id),false);
});
