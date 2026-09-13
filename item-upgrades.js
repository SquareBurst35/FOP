// Reference improvements belong to equipment, never to a floating body slot.
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
const list=[];
function add(name,target,page,{source='Livro base',curse=false,spaces=0}={}){list.push({id:slug(`${source}-${target}-${name}`),name,target,page:String(page),source,curse,spaces});}
for(const name of ['Alongada','Calibre Grosso','Certeira','Compensador','Cruel','Discreta','Dum Dum','Explosiva','Ferrolho Automático','Mira Laser','Mira Telescópica','Perigosa','Silenciador','Tática','Visão de Calor'])add(name,'Armas','60–61',{spaces:name==='Discreta'?-1:0});
for(const name of ['Antibombas','Blindada','Discreta','Reforçada'])add(name,'Proteções',62,{spaces:['Blindada','Reforçada'].includes(name)?1:name==='Discreta'?-1:0});
for(const name of ['Aprimorado','Discreto','Função Adicional','Instrumental'])add(name,'Acessórios',64,{spaces:name==='Discreto'?-1:0});
add('Lente de Revelação','Câmera de aura paranormal',45,{source:'Sobrevivendo ao Horror'});
add('Acoplável','Armas',71,{source:'Arquivos Secretos #2'});
for(const [target,names]of[
 ['Armas',['Antielemento','Ritualística','Senciente','Empuxo','Energética','Vibrante','Consumidora','Erosiva','Repulsora','Lancinante','Predadora','Sanguinária']],
 ['Proteções',['Abascanta','Profética','Sombria','Cinética','Lépida','Voltaica','Letárgica','Repulsiva','Regenerativa','Sádica']],
 ['Acessórios',['Carisma','Conjuração','Escudo Mental','Reflexão','Sagacidade','Defesa','Destreza','Potência','Esforço Adicional','Disposição','Pujança','Vitalidade','Proteção Elemental']]
])for(const name of names)add(name,target,'145–147',{curse:true});
export const ITEM_UPGRADES=Object.freeze(list);
export const UPGRADE_BY_ID=new Map(list.map(u=>[u.id,u]));
export function canApplyUpgrade(item,u){
 if(!item||!u)return false;
 if(['Dum Dum','Explosiva'].includes(u.name))return item.group==='Munições'&&/Balas/.test(item.name);
 const group=item.group==='Paranormais'?(item.details?.some(([k])=>k==='Dano')?'Armas':null):item.group;
 if(u.target!==group&&u.target!==item.name)return false;
 if(u.name==='Blindada')return item.name==='Proteção pesada';
 if(u.name==='Discreta'&&u.target==='Proteções')return item.name==='Proteção leve';
 const detail=Object.fromEntries(item.details??[]),fire=String(detail.Empunhadura??'').includes('Fogo'),melee=group==='Armas'&&!/Fogo|Disparo|Arremesso/.test(detail.Empunhadura??'');
 if(u.name==='Alongada')return !melee;
 if(u.name==='Acoplável')return melee&&/Uma mão|Leve/.test(detail.Empunhadura??'');
 if(['Certeira','Cruel','Perigosa'].includes(u.name)&&u.target==='Armas')return melee;
 if(['Alongada','Calibre Grosso','Compensador','Ferrolho Automático','Mira Laser','Mira Telescópica','Silenciador','Visão de Calor'].includes(u.name))return fire;
 return true;
}
export function itemUpgrades(item,ids=[]){
 const out=[];for(const id of new Set(Array.isArray(ids)?ids:[])){
  const u=UPGRADE_BY_ID.get(id);if(!u||!canApplyUpgrade(item,u))continue;
  if(u.target==='Proteções'&&['Discreta','Reforçada'].includes(u.name)&&out.some(x=>x.target==='Proteções'&&['Discreta','Reforçada'].includes(x.name)))continue;
  out.push(u);
 }return out;
}
export function upgradedItem(item,ids=[]){const upgrades=itemUpgrades(item,ids),curses=upgrades.filter(u=>u.curse).length,base=['0','I','II','III','IV'].indexOf(item.category),increase=upgrades.filter(u=>!u.curse).length+(curses?curses+1:0),level=base+increase;return {...item,upgrades,category:increase?(['0','I','II','III','IV'][level]??'V+'):item.category,spaces:Math.max(0,item.spaces+upgrades.reduce((s,u)=>s+u.spaces,0))};}
