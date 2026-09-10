import assert from 'node:assert/strict';
import fs from 'node:fs';
import { RITUALS } from '../content.js';
const expected=JSON.parse(fs.readFileSync(new URL('./fixtures/ritual-reference-catalog.json',import.meta.url),'utf8'));
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
assert.equal(expected.length,102,'Independent list extracted from the four reference PDFs');
for(const ref of expected) {
  const found=RITUALS.find(entry=>entry.source===ref.source&&[entry.name,...entry.aliases??[]].some(name=>normalize(name)===normalize(ref.name)));
  assert.ok(found,`${ref.source}, p. ${ref.page}: missing ${ref.name}`);
  assert.equal(found.circle,ref.catalogCircle??ref.circle,`${ref.name}: circle differs from reference`);
  assert.deepEqual([...found.elements].sort(),ref.element.split(' + ').sort(),`${ref.name}: element differs from reference`);
  if(ref.catalogCircle)assert.ok(ref.note,'Source inconsistencies need an explicit documented decision');
}
const curse=RITUALS.filter(r=>r.family==='Amaldiçoar Arma');
assert.equal(curse.length,4);
assert.deepEqual(curse.map(r=>r.element).sort(),['Conhecimento','Energia','Morte','Sangue']);
assert.equal(new Set(curse.map(r=>r.id)).size,4);
assert.ok(curse.every(r=>r.circle===1&&r.cost==='1 PE/PD'&&r.elements.length===1));
assert.ok(curse.every(r=>r.enhancements.some(e=>e.includes('+2 PE'))&&r.enhancements.some(e=>e.includes('+5 PE'))));
console.log('102 PDF ritual entries, source conflicts and four Amaldiçoar Arma choices covered.');
