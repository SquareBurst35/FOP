// Reference improvements belong to equipment, never to a floating body slot.
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
const list=[];
function add(name,target,page,summary,{source='Livro base',curse=false,spaces=0}={}){list.push({id:slug(`${source}-${target}-${name}`),name,target,page:String(page),source,curse,spaces,summary});}
for(const [name,summary] of [
 ['Alongada','+2 em testes de ataque; só para armas de fogo.'],
 ['Calibre Grosso','Aumenta o dano em mais um dado do mesmo tipo; só para armas de fogo.'],
 ['Certeira','+2 em testes de ataque; só para armas corpo a corpo.'],
 ['Compensador','Anula a penalidade por disparos em rajada; só para armas de fogo.'],
 ['Cruel','+2 em rolagens de dano; só para armas corpo a corpo.'],
 ['Discreta','+5 em testes para ocultar a arma e reduz o espaço em -1.'],
 ['Dum Dum','+1 no multiplicador de crítico; só para munições.'],
 ['Explosiva','Aumenta o dano em +2d6; só para munições.'],
 ['Ferrolho Automático','A arma se torna automática; só para armas de fogo.'],
 ['Mira Laser','+2 na margem de ameaça; só para armas de fogo.'],
 ['Mira Telescópica','Aumenta o alcance da arma e o alcance da habilidade Ataque Furtivo; só para armas de fogo.'],
 ['Perigosa','+2 na margem de ameaça; só para armas corpo a corpo.'],
 ['Silenciador','Reduz em -2d20 a penalidade em Furtividade para se esconder após atacar; só para armas de fogo.'],
 ['Tática','Permite sacar a arma como ação livre.'],
 ['Visão de Calor','Ignora camuflagem; só para armas de fogo.'],
])add(name,'Armas','60–61',summary,{spaces:name==='Discreta'?-1:0});
for(const [name,summary] of [
 ['Antibombas','+5 em testes de resistência contra efeitos de área; só em proteções pesadas.'],
 ['Blindada','Aumenta a resistência a dano para 5 e o espaço em +1; só em proteções pesadas.'],
 ['Discreta','Reduz o espaço em -1, +5 em Crime para ocultar (mesmo sem treino); só em proteções leves.'],
 ['Reforçada','Aumenta a Defesa em +2 e o espaço em +1.'],
])add(name,'Proteções',62,summary,{spaces:['Blindada','Reforçada'].includes(name)?1:name==='Discreta'?-1:0});
for(const [name,summary] of [
 ['Aprimorado','O bônus em perícia do acessório sobe para +5 (pode ser escolhida de novo se o item também tiver Função Adicional).'],
 ['Discreto','Reduz o espaço em -1, +5 em Crime para ocultar (mesmo sem treino).'],
 ['Função Adicional','Concede +2 em uma perícia adicional, à escolha e sujeita à aprovação do mestre.'],
 ['Instrumental','O acessório passa a funcionar como um kit de perícia específico, escolhido ao aplicar a modificação.'],
])add(name,'Acessórios',64,summary,{spaces:name==='Discreto'?-1:0});
add('Lente de Revelação','Câmera de aura paranormal',45,'Aumenta em +10 a DT do efeito e pode causar 6d6 de dano de frio a criaturas com invisibilidade, incorporeidade ou camuflagem.',{source:'Sobrevivendo ao Horror'});
add('Acoplável','Armas',71,'Permite que a arma seja acoplada a outra compatível, combinando seus efeitos conforme a referência da modificação.',{source:'Arquivos Secretos #2'});
for(const [name,summary] of [
 ['Adesiva','Um acerto contra a Defesa faz o alvo falhar automaticamente na resistência; um erro fixa a granada no espaço. Efeitos contínuos acompanham o alvo até ser removida com ação padrão.'],
 ['Dupla','Acrescenta o efeito de outra granada não amaldiçoada, diferente do efeito principal.'],
 ['Programada','Permite escolher em quantos turnos o efeito da granada será ativado.'],
])add(name,'Explosivos',71,summary,{source:'Arquivos Secretos #4'});
for(const [target,entries]of[
 ['Armas',[
   ['Antielemento','Contra uma criatura de um elemento sorteado ao criar a maldição (1d4: Conhecimento/Energia/Morte/Sangue), gaste 2 PE ao acertar para causar +4d8 de dano.'],
   ['Ritualística','Pode armazenar um ritual com alvo/área conjurado normalmente; ao acertar um ataque, descarrega-o como ação livre no alvo atingido.'],
   ['Senciente','Ação de movimento e 2 PE fazem a arma flutuar e atacar sozinha um ser em alcance curto (mesmas estatísticas de quando empunhada); sustentar custa 1 PE por turno, senão ela cai.'],
   ['Empuxo','Ganha alcance curto de arremesso (ou +1 categoria se já tinha) e +1 dado de dano ao ser arremessada; volta voando para a mão no mesmo turno.'],
   ['Energética','2 PE por ataque: +5 em testes de ataque, ignora resistência a dano e converte todo o dano para Energia.'],
   ['Vibrante','Concede a habilidade Ataque Extra (trilha Operações Especiais); se já a possui, o custo dela cai em -1 PE.'],
   ['Consumidora','2 PE ao acertar: o alvo fica imóvel por 1 rodada.'],
   ['Erosiva','+1d8 de dano de Morte; 2 PE ao acertar também causam 2d4 de dano de Morte no início dos dois turnos seguintes do alvo.'],
   ['Repulsora','+2 na Defesa enquanto empunhada; ao bloquear, 2 PE concedem +5 adicional na Defesa.'],
   ['Lancinante','+1d8 de dano de Sangue, multiplicado em acertos críticos junto com os demais dados.'],
   ['Predadora','Anula penalidades por camuflagem/cobertura leves, dobra a margem de ameaça e aumenta uma categoria de alcance se for arma de disparo.'],
   ['Sanguinária','O alvo atingido fica sangrando (cumulativo); um acerto crítico drena sangue, deixando o alvo fraco e concedendo 2d10 PV temporários.'],
 ]],
 ['Proteções',[
   ['Abascanta','+5 em testes de resistência contra rituais; uma vez por cena, ao ser alvo de um ritual, reação e PE iguais ao custo dele refletem o ritual de volta ao conjurador.'],
   ['Profética','Resistência a Conhecimento 10; ao fazer um teste de resistência, 2 PE permitem rolar de novo.'],
   ['Sombria','+5 em Furtividade (ignora penalidade de carga); ação de movimento e 1 PE fazem o item parecer uma roupa comum sem perder suas propriedades.'],
   ['Cinética','+2 na Defesa e resistência a dano 2 (leve/escudo) ou 5 (pesada).'],
   ['Lépida','+10 em Atletismo e +3 m de deslocamento; 2 PE até o fim do turno ignoram terreno difícil, concedem deslocamento de escalada igual ao terrestre e imunidade a dano de queda de até 9 m.'],
   ['Voltaica','Resistência a Energia 10; ação de movimento e 2 PE fazem a proteção emitir arcos até o fim da cena, causando 2d6 de dano de Energia a seres adjacentes no fim de cada turno seu.'],
   ['Letárgica','+2 na Defesa; 25% (leve/escudo) ou 50% (pesada) de chance de ignorar dano extra de críticos e ataques furtivos.'],
   ['Repulsiva','Resistência a Morte 10; ação de movimento e 2 PE cobrem você de Lodo até o fim da cena, causando 2d8 de dano de Morte a quem o atacar corpo a corpo.'],
   ['Regenerativa','Resistência a Sangue 10; ação de movimento e 1 PE recuperam 1d12 PV.'],
   ['Sádica','No início do seu turno, +1 em testes de ataque e rolagens de dano para cada 10 pontos de dano sofridos desde o fim do seu último turno.'],
 ]],
 ['Acessórios',[
   ['Carisma','+1 em Presença (sem PE adicionais).'],
   ['Conjuração','Concede um ritual de 1º círculo (conjurável como se conhecido) enquanto empunhado; se já o conhece, o custo cai em -1 PE.'],
   ['Escudo Mental','Resistência mental 10.'],
   ['Reflexão','Uma vez por rodada, ao ser alvo de um ritual, gaste PE igual ao custo dele para refleti-lo de volta ao conjurador (as decisões do ritual passam a ser suas).'],
   ['Sagacidade','+1 em Intelecto (sem perícias/graus de treinamento adicionais).'],
   ['Defesa','+5 na Defesa.'],
   ['Destreza','+1 em Agilidade.'],
   ['Potência','+1 na DT das suas habilidades, poderes e rituais.'],
   ['Esforço Adicional','+5 PE máximos; só passa a funcionar após um dia de uso.'],
   ['Disposição','+1 em Vigor.'],
   ['Pujança','+1 em Força.'],
   ['Vitalidade','+15 PV máximos; só passa a funcionar após um dia de uso.'],
   ['Proteção Elemental','Resistência 10 contra um elemento escolhido; o acessório passa a contar como um item desse elemento.'],
 ]],
])for(const [name,summary] of entries)add(name,target,'145–147',summary,{curse:true});
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
