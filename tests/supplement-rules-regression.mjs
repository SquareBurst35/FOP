import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASS_POWERS, GENERAL_POWERS, PARANORMAL_POWERS, TRAIL_ABILITIES, CORE_CLASS_ABILITIES, allSelectableAbilities, RITUALS } from '../content.js';
import { ORIGINS } from '../rules.js';
import { ITEMS } from '../items.js';
import { SUPPLEMENT_ABILITIES, SUPPLEMENT_ORIGINS, SUPPLEMENT_CLASS_POWERS, SUPPLEMENT_GENERAL_POWERS, SUPPLEMENT_PARANORMAL_POWERS, SUPPLEMENT_TRAILS, SUPPLEMENT_RITUALS, SUPPLEMENT_ITEMS, SUPPLEMENT_UPGRADES, SUPPLEMENT_ALLIES } from '../supplements/catalog.js';
import { prerequisiteResult, supplementEligibility, supplementRecords, hasSupplementAffinity } from '../supplements/prerequisites.js';
import { createHacking, hackingAction } from '../supplements/hacking.js';
import { createVehicle, vehicleAction, vehicleStats, VEHICLE_PERKS } from '../supplements/vehicles.js';
import { poisonCategory, animalChallenge, pressureRound, underwaterModifiers, modularPowerKind, buildingDays, dartsScore } from '../supplements/optional-rules.js';
import { modularClassification, modularPowerAllowed } from '../supplements/modular.js';
import { encodeDocument, decodeDocument } from '../character-sync.js';

const byName = name => SUPPLEMENT_ABILITIES.find(e => e.name === name);
const baseline = [...allSelectableAbilities(ORIGINS), ...CORE_CLASS_ABILITIES];
const context = { abilityById: new Map([...baseline, ...SUPPLEMENT_ABILITIES].map(e => [e.id, e])) };
const char = () => ({ id: 'supplement-test', classe: 'Combatente', trilha: '', origem: '', nex: 30, nivel: 6, atributos: { forca: 2, agilidade: 1, vigor: 1, intelecto: 1, presenca: 1 }, periciasTreinadas: [], grausPericia: {}, habilidadesSelecionadas: [], habilidadeEscolhas: [], rituaisSelecionados: [] });
const high = () => 0.999;
const low = () => 0;
const perk = name => VEHICLE_PERKS.find(p => p.name === name).id;

test('AS3–7 records have unique source identities and coexist with the old catalogs', () => {
  assert.equal(SUPPLEMENT_ORIGINS.length, 9);
  assert.equal(SUPPLEMENT_CLASS_POWERS.length, 31);
  assert.equal(SUPPLEMENT_GENERAL_POWERS.length, 12);
  assert.equal(SUPPLEMENT_PARANORMAL_POWERS.length, 11);
  assert.equal(SUPPLEMENT_TRAILS.length, 28);
  assert.equal(SUPPLEMENT_RITUALS.length, 3);
  assert.equal(SUPPLEMENT_ITEMS.length, 26);
  assert.equal(SUPPLEMENT_UPGRADES.length, 7);
  assert.equal(SUPPLEMENT_ALLIES.length, 22);
  const records = [...SUPPLEMENT_ABILITIES, ...SUPPLEMENT_RITUALS, ...SUPPLEMENT_ITEMS, ...SUPPLEMENT_UPGRADES, ...SUPPLEMENT_ALLIES];
  assert.equal(new Set(records.map(e => e.id)).size, records.length);
  for (const entry of records) { assert.match(entry.source, /^Arquivos Secretos #[3-7]$/); assert.ok(Number.isInteger(entry.sourcePage) && entry.sourcePage > 0); }
  const norm = name => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // AS4 has been ported for real into rules.js/content.js/items.js (see tests/as3-7-catalog-regression.mjs);
  // this staging module is intentionally superseded book by book until it is retired.
  for (const [added, old] of [[SUPPLEMENT_ORIGINS,ORIGINS], [SUPPLEMENT_CLASS_POWERS,CLASS_POWERS], [SUPPLEMENT_GENERAL_POWERS,GENERAL_POWERS], [SUPPLEMENT_PARANORMAL_POWERS,PARANORMAL_POWERS], [SUPPLEMENT_TRAILS,TRAIL_ABILITIES], [SUPPLEMENT_RITUALS,RITUALS], [SUPPLEMENT_ITEMS,ITEMS]]) {
    for (const entry of added) {
      if (entry.source === 'Arquivos Secretos #4' || entry.source === 'Arquivos Secretos #5' || entry.source === 'Arquivos Secretos #7') continue;
      assert.equal(old.some(e => !e.id?.startsWith('as') && norm(e.name) === norm(entry.name)), false, `Duplicata: ${entry.name}`);
    }
  }
  const backups = SUPPLEMENT_RITUALS.find(e => e.name === 'Backup');
  assert.deepEqual(backups.useVariants.variants.map(v => [v.extra, v.minCircle]), [[2,2],[5,3]]);
  const hesitation = SUPPLEMENT_RITUALS.find(e => e.name === 'Hesitação Forçada');
  assert.deepEqual(hesitation.elements, ['Conhecimento']);
  assert.deepEqual(hesitation.useVariants.variants.map(v => [v.extra, v.minCircle, !!v.affinity]), [[2,2,false],[5,3,true]]);
  assert.equal(SUPPLEMENT_ABILITIES.some(e => e.name === 'Dominador de Elemento'), false);
});

test('new prerequisites handle alternatives, training ranks, source powers and progression', () => {
  const c = char(), ambi = byName('Ambidestria');
  assert.equal(supplementEligibility(ambi,c,context).ok,false);
  c.periciasTreinadas=['Luta']; assert.equal(supplementEligibility(ambi,c,context).ok,true);
  c.atributos.forca=1; c.atributos.agilidade=2; assert.equal(supplementEligibility(ambi,c,context).ok,true);
  c.atributos.agilidade=1; assert.equal(supplementEligibility(ambi,c,context).ok,false);
  c.grausPericia.Medicina=5; assert.equal(supplementEligibility(byName('Resgatar da Morte'),c,context).ok,false);
  c.grausPericia.Medicina=10; assert.equal(supplementEligibility(byName('Resgatar da Morte'),c,context).ok,true);
  const shield=byName('Escudo Espiral Temporal');
  c.habilidadesSelecionadas=[shield.id]; assert.equal(supplementEligibility(shield,c,context).ok,false,'Cannot count itself as a prerequisite');
  c.habilidadesSelecionadas.push(...PARANORMAL_POWERS.filter(e=>e.group==='Morte').slice(0,2).map(e=>e.id));
  assert.equal(supplementEligibility(shield,c,context).ok,true);
  c.habilidadesSelecionadas.push(CLASS_POWERS.find(e=>e.name==='Especialista em Elemento').id);
  assert.equal(supplementEligibility(byName('Barreira do Oculto'),c,context).ok,true);
  c.nex=25; assert.equal(supplementEligibility(byName('Barreira do Oculto'),c,context).ok,false);
  c.optionalRules={separateLevelNex:true}; assert.equal(supplementEligibility(byName('Barreira do Oculto'),c,context).ok,true);
});

test('history powers and class variants do not leak through fabricated choices or mere affinity', () => {
  const c=char(), shield=byName('Escudo Espiral Temporal');
  assert.equal(prerequisiteResult({story:'transmissionBell'},c,context).ok,false);
  c.supplementState={story:{transmissionBell:true}};
  assert.equal(prerequisiteResult({story:'transmissionBell'},c,context).ok,true);
  c.habilidadeEscolhas.push({abilityId:'not-owned',type:'poder',valueId:shield.id});
  assert.equal(supplementRecords(c).some(e=>e.id===shield.id),false);
  c.afinidadeElemental='Morte'; c.habilidadesSelecionadas=[shield.id];
  assert.equal(hasSupplementAffinity(c,shield),false);
  c.supplementState.acquisitions={[shield.id]:[{level:3},{level:6}]};
  assert.equal(hasSupplementAffinity(c,shield),true);
  c.classe='Ocultista'; c.trilha='Monstruoso'; c.nex=10; c.nivel=20; c.optionalRules={separateLevelNex:true};
  assert.deepEqual(supplementRecords(c).filter(e=>e.group==='Monstruoso').map(e=>e.name),['Ser Escarificado']);
  c.nex=65;
  assert.deepEqual(supplementRecords(c).filter(e=>e.group==='Monstruoso').map(e=>e.name),['Ser Escarificado','Ser Perfurado','Ser Rasgado']);
  assert.ok(supplementRecords(c).every(e=>e.name!=='Ser Experimentado'));
});

test('hacking enforces training, two actions, virtual dice, failures and security recovery atomically', () => {
  assert.equal(createHacking({intellect:3,rank:0,security:25,deviceAvailable:true}).ok,false);
  let state=createHacking({intellect:3,rank:5,security:25,deviceAvailable:true}).next;
  const saved=structuredClone(state);
  assert.equal(hackingAction(state,'rastro',{rank:5,test:30}).ok,false); assert.deepEqual(state,saved);
  state=hackingAction(state,'brecha',{rank:5,test:15}).next; assert.equal(state.virtualDice,4);
  let second=hackingAction(state,'brecha',{rank:5,test:19}); assert.equal(second.dc,20); assert.equal(second.success,false); state=second.next;
  assert.equal(hackingAction(state,'codigo',{rank:5,dice:1}).ok,false);
  state=hackingAction(state,'nextTurn').next;
  assert.equal(hackingAction(state,'codigo',{rank:5,dice:5}).ok,false);
  const attack=hackingAction(state,'codigo',{rank:5,dice:4},low); state=attack.next;
  assert.equal(state.security,21); assert.equal(state.virtualDice,0);
  const reset=hackingAction(state,'nextTurn'); assert.equal(reset.incident,4); assert.equal(reset.next.security,25);
  assert.equal(reset.next.virtualDice,0,'Security reset does not invent new virtual dice');
});

test('hacking rerolls once, backdoor reserves persist, success opens access for one scene', () => {
  let s=createHacking({intellect:4,rank:15,security:10,deviceAvailable:true}).next;
  s=hackingAction(s,'backdoor',{rank:10,dice:1,device:'terminal'}).next;
  s=hackingAction(s,'rastro',{rank:10,test:10}).next;
  s=hackingAction(s,'nextTurn').next;
  const dice=[0,0.99,0.99]; let i=0;
  const action=hackingAction(s,'codigo',{rank:5,dice:2},()=>dice[i++]);
  assert.deepEqual(action.results,[6,6]); assert.equal(action.next.security,0); assert.equal(action.next.accessed,true);
  s=hackingAction(action.next,'closeAccess').next;
  s=hackingAction(s,'access',{device:'terminal'}).next;
  assert.equal(s.backdoors[0].uses,0); assert.equal(s.accessed,true);
  assert.equal(hackingAction(s,'access',{device:'terminal'}).ok,false);
});

test('vehicles respect profiles, perk caps, maneuver tables, fuel and repairs', () => {
  assert.equal(createVehicle('as3-veiculo-ii',[perk('Lataria Reforçada'),perk('Lataria Reforçada')]).ok,false);
  let s=createVehicle('as3-veiculo-iii',[perk('Lataria Reforçada'),perk('Lataria Reforçada')]).next;
  assert.equal(vehicleStats(s,{agility:2}).defense,22);
  for(const [test,movement]of[[5,15],[10,18],[15,21],[20,24],[25,27],[30,30],[50,30]]) assert.equal(vehicleAction(s,'maneuver',{test}).movement,movement);
  s=vehicleAction(s,'maneuver',{test:20}).next;
  s=vehicleAction(s,'damage',{damage:100,ignoreResistance:true},low).next;
  assert.equal(s.hp,50); assert.ok(s.damage.includes('stopped'));
  const repaired=vehicleAction(s,'repair',{test:15}); assert.equal(repaired.next.hp,125); assert.equal(repaired.next.damage.length,0);
  assert.equal(vehicleStats(repaired.next).movement,24);
  const fuel=vehicleAction(repaired.next,'fuel',{},low); assert.equal(fuel.next.fuel,0); assert.equal(vehicleStats(fuel.next).movement,0);
  assert.equal(vehicleAction(fuel.next,'refuel',{canister:true}).next.fuel,2);
  assert.equal(vehicleAction(fuel.next,'refuel').next.fuel,5);
});

test('AS5 vehicle perks extend existing profiles without changing ordinary vehicles', () => {
  let s=createVehicle('as3-veiculo-iv',[perk('Indução Forçada'),perk('Sistema de Óxido Nitroso'),perk('Conversão de Combustível para Alto Rendimento')]).next;
  assert.equal(s.fuel,10);
  s=vehicleAction(s,'maneuver',{test:35}).next; assert.equal(vehicleStats(s).movement,36);
  s=vehicleAction(s,'nitro').next; assert.equal(vehicleStats(s).movement,72);
  assert.equal(vehicleAction(s,'nitro').ok,false);
  s=vehicleAction(s,'nextTurn').next; assert.equal(vehicleStats(s).movement,36);
  assert.equal(vehicleAction(s,'nitro').ok,false);
  s=vehicleAction(s,'nextScene').next; assert.equal(vehicleAction(s,'nitro').ok,true);
  assert.equal(vehicleAction(s,'refuel',{canister:true}).next.fuel,10);
});

test('optional tables retain source thresholds and do not change defaults', () => {
  assert.deepEqual([0,10,15,20,95,99].map(animalChallenge),[10,10,20,40,340,360]);
  assert.deepEqual([10,11,15,16,20,21,25,26].map(poisonCategory),['0','I','I','II','II','III','III','IV']);
  assert.equal(buildingDays(1),7); assert.equal(buildingDays(5),3); assert.equal(buildingDays(20),3);
  assert.equal(dartsScore([10,25,30]),80);
  assert.deepEqual([1,2,3,20].map(modularPowerKind),[null,'utilidade','combate','utilidade']);
  assert.equal(modularPowerAllowed(CLASS_POWERS.find(p=>p.name==='Transcender'),'utilidade'),false);
  // AS4/AS5 powers are real CLASS_POWERS entries now; the staged modular.js classifier only knows the
  // as03-06 schema shape, so it is checked only against powers still staged elsewhere.
  assert.ok(CLASS_POWERS.filter(p=>p.source!=='Arquivos Secretos #4'&&p.source!=='Arquivos Secretos #5').every(p=>modularClassification(p)!=='unclassified'));
  assert.deepEqual(underwaterModifiers({}),{modifiers:[],canCast:true,rangedAllowed:true,damageMultiplier:1});
  const submerged=underwaterModifiers({submerged:true,ranged:true,weaponKind:'bow',damageType:'Corte',noRitualSpeech:true});
  assert.equal(submerged.rangedAllowed,false); assert.equal(submerged.canCast,false); assert.equal(submerged.damageMultiplier,0.5);
  const safe=pressureRound({}, {depth:100,fortitude:25},high); assert.equal(safe.hpLoss,3); assert.deepEqual(safe.conditions,[]);
  const next=pressureRound(safe.next,{depth:100,fortitude:25},high); assert.equal(next.dc,26); assert.equal(next.hpLoss,6); assert.deepEqual(next.conditions,['exausto']);
});

test('new control state and prerequisite decisions survive the existing document codec', () => {
  const c=char(); c.supplementState={story:{transmissionBell:true},vehicle:createVehicle('as3-veiculo-ii',[]).next,hacking:createHacking({intellect:2,rank:5,security:25,deviceAvailable:true}).next};
  const decoded=decodeDocument(c.id,encodeDocument(c,'test-device',1));
  // decodeDocument returns the existing sync envelope.
  const restored=decoded.character || decoded.data || decoded;
  assert.deepEqual(restored.supplementState,c.supplementState);
  assert.equal(prerequisiteResult({story:'transmissionBell'},restored,context).ok,true);
});
