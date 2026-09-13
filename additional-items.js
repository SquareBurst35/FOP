// Added from the supplied Livro base v1.3. Short, original rules summaries.
// Visuals select equipped-agent silhouettes; the 165 original catalog images stay intact.
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const rows=[];
function add(name,group,category,spaces,summary,page,icon,kind,variant,slot,details=[]){rows.push({id:slug(`Livro base-${group}-${name}`),name,group,category,spaces,summary,source:'Livro base',page:String(page),details,visual:{icon,kind,variant,slot}});}
add('Escudo','Proteções','I',2,'Ocupa uma mão e concede +2 na Defesa.',62,'Proteção pesada','held','shield','weapon', [['Defesa','+2'],['Empunhadura','Uma mão']]);
const op=(n,c,s,d,p,i,k,v,l)=>add(n,'Operacionais',c,s,d,p,i,k,v,l);
op('Arpéu','0',1,'Acessório de exploração que acompanha uma corda.',65,'Kit de escalada','belt','belt-pouch','utility');
op('Binóculos','0',1,'Concede +5 em Percepção para observar a grandes distâncias.',65,'Óculos de visão térmica','held','binoculars','weapon');
op('Bloqueador de sinal','I',1,'Interfere na comunicação de dispositivos eletrônicos na área indicada.',65,'Alarme de movimento','pocket','belt-pouch','utility');
op('Corda','0',1,'Recurso de exploração para os testes previstos na cena.',65,'Kit de escalada','belt','belt-pouch','utility');
op('Equipamento de sobrevivência','0',2,'Reúne os recursos necessários para usos de Sobrevivência.',65,'Kit de perícia','belt','belt-pouch','utility');
op('Máscara de gás','0',1,'Concede +10 em Fortitude contra efeitos que dependem de respiração.',65,'Retalho Tenebroso','mask','gas-mask','face');
op('Mochila militar','I',0,'Aumenta a capacidade de carga em 2 espaços. O benefício de várias mochilas não se acumula.',65,'Paraquedas','backpack','backpack','back');
op('Pé de cabra','0',1,'Ferramenta de exploração: +5 nos testes de Força indicados pelo item.',65,'Bastão policial','held','baton','weapon');
op('Pistola sinalizadora','0',1,'Recurso de sinalização com uma carga, conforme as regras da cena.',65,'Pistola de dardos','held','pistol','weapon');
op('Traje hazmat','I',2,'Traje de proteção ambiental: +5 nos testes contra efeitos ambientais e resistência a químico 10.',66,'Traje espacial','suit','hazmat-suit','outfit');
for(const e of ['Conhecimento','Energia','Morte','Sangue']){
 add(`Amarras de ${e}`,'Paranormais','II',1,`Restrição paranormal associada a ${e}; consulte os testes e limites do item.`,66,'Algemas','belt','belt-cuffs','utility');
 add(`Componentes ritualísticos de ${e}`,'Paranormais','0',1,`Conjunto de componentes para conjurar rituais de ${e}.`,66,'Agrupador ritualístico','held','component-holder','weapon');
 add(`Scanner de manifestação paranormal de ${e}`,'Paranormais','II',1,`Dispositivo de investigação que detecta manifestações de ${e}.`,67,'Catalisador perturbador','held','arcane-device','weapon');
}
add('Câmera de aura paranormal','Paranormais','II',1,'Registra sinais da aura paranormal para investigação.',66,'Câmera Obscura','held','camera','weapon');
add('Emissor de pulsos paranormais','Paranormais','II',1,'Emite pulsos que auxiliam a localizar manifestações paranormais.',66,'Catalisador ampliador','held','arcane-device','weapon');
add('Escuta de ruídos paranormais','Paranormais','II',1,'Capta ruídos relacionados a manifestações paranormais.',66,'Rádio Chiador','held','radio','weapon');
add('Medidor de estabilidade da membrana','Paranormais','II',1,'Auxilia a avaliar o estado da Membrana.',67,'Catalisador perturbador','held','arcane-device','weapon');
const special=(n,d,p,i,k,v,l,c='II')=>add(n,'Paranormais',c,1,d,p,i,k,v,l);
special('Coroa de Espinhos','Adorno paranormal de Sangue com uma ativação própria.',148,'Arreio Neural','headband','neural-headband','head');
special('Frasco de Vitalidade','Recipiente paranormal de Sangue que armazena vitalidade.',148,'Frasco de lodo','held','bottle','weapon');
special('Pérola de Sangue','Relíquia de Sangue que oferece benefícios temporários conforme sua ativação.',148,'Amuleto sagrado','necklace','element-pendant','neck');
special('Punhos Enraivecidos','Equipamento paranormal que modifica ataques desarmados.',148,'Soqueira','gauntlets','colossus-gloves','arms');
special('Seringa de Transfiguração','Consumível paranormal com uma transformação temporária prevista nas regras.',148,'Injeção de Lodo','held','injector','weapon');
special('Amarras Mortais','Braceletes de Morte que interferem no deslocamento do alvo.',148,'Braçadeira reforçada','wrist','bracer','arms');
special('Casaco de Lodo','Casaco paranormal de Morte com benefícios defensivos.',149,'Vestimenta','garment','garment','outfit');
special('Coletora','Adaga paranormal de Morte com um efeito próprio de acúmulo.',149,'A Primeira Adaga','held','knife','weapon');
special('Vislumbre do Fim','Óculos de Morte que alteram a percepção de eventos futuros.',149,'Óculos escuros','glasses','sunglasses','eyes');
special('Anéis do Elo Mental','Par de anéis de Conhecimento que estabelece um elo entre seus usuários.',149,'Amuleto sagrado','wrist','knuckles','arms');
special('Lanterna Reveladora','Lanterna paranormal de Conhecimento que revela presenças ocultas.',149,'Lanterna','held','flashlight','weapon');
special('Máscara das Pessoas nas Sombras','Máscara de Conhecimento que permite uma transformação de aparência.',149,'Retalho Tenebroso','mask','cloth-mask','face');
special('Munição Jurada','Munição paranormal de Conhecimento com um alvo designado.',150,'Balas pesadas','pocket','belt-pouch','ammo');
special('Arcabuz dos Moretti','Arma paranormal de Energia com resultados definidos por sua tabela de uso.',150,'Fuzil Alheio','held','rifle','weapon');
special('Bateria Reversa','Dispositivo de Energia que armazena e libera energia conforme sua ativação.',150,'Bateria potente','pocket','belt-pouch','utility');
special('Peitoral da Segunda Chance','Proteção paranormal de Energia com uma ativação defensiva própria.',150,'Proteção leve','vest','light-armor','armor');
special('Relógio de Arnaldo','Relógio paranormal de Energia que interfere na ordem de iniciativa.',150,'Aplicador de medicamentos','wrist','wrist-device','arms');
special('Talismã da Sorte','Talismã de Energia que interfere no resultado de testes.',150,'Amuleto sagrado','necklace','amulet','neck');
special('Teclado de Conexão Neural','Dispositivo de Energia para interação paranormal com computadores.',150,'Notebook','held','laptop','weapon');
special('Tela do Pesadelo','Dispositivo paranormal de Energia com uma ativação própria.',151,'Celular','held','phone','weapon');
special('Veículo Energizado','Melhoria paranormal aplicada a um veículo; permanece fora do corpo do agente.',151,'Ligação direta infernal','vehicle','inventory','vehicle');
special('Jaqueta de Veríssimo','Jaqueta única de categoria IV com benefícios defensivos para o grupo.',151,'Vestimenta','garment','garment','outfit','IV');
special('Dedo Decepado','Relíquia que concede um poder paranormal conforme a escolha e os limites da referência.',151,'Amuleto sagrado','necklace','amulet','neck');
export const ADDITIONAL_ITEMS=Object.freeze(rows);
export const ITEM_NAME_ALIASES=Object.freeze({'Marreta':['Maça'],'Moto-serra':['Motosserra'],'Balas pesadas':['Balas longas'],'Lanterna':['Lanterna tática']});
