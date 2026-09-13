import test from 'node:test';
import assert from 'node:assert/strict';
import { CharacterStore, GUEST_KEY, mutationPlan, encodeDocument, decodeDocument } from '../character-sync.js';
import { SyncController } from '../sync-controller.js';
import { saveMutation } from '../firebase-client.js';
const memory = () => { const data = new Map(); return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))}; };
let sequence = 0;
const make = storage => new CharacterStore(storage ?? memory(), () => `operation-${++sequence}`);
const char = (id='agent-1',nome='Agente') => ({id,nome,recursos:{peAtual:10},inventarioItens:[],rituaisSelecionados:['ritual-existente']});
function backend() {
 const docs = new Map(), auth = {currentUser:{uid:'A'}};
 const dbSDK = {
  doc:(_db,...segments)=>segments.join('/'), serverTimestamp:()=>123,
  runTransaction:async (_db,fn)=> { const writes=[]; const result=await fn({get:async path=>({exists:()=>docs.has(path),data:()=>docs.get(path)}),set:(path,data)=>writes.push([path,data])});for(const[p,d]of writes)docs.set(p,d);return result; },
 };
 return {docs,auth,save:(uid,id,job)=>saveMutation({auth,db:{},dbSDK},uid,id,job),read:uid=>[...docs].filter(([p])=>p.startsWith(`users/${uid}/characters/`)).map(([p,d])=>decodeDocument(p.split('/').at(-1),d))};
}
async function drain(store,server) { for(const [id,job]of Object.entries(store.state().pending)){const p=await server.save(store.uid,id,job);store.acknowledge(store.uid,id,job,p.documents);} }

test('guest data is preserved and migrated once into only the first account', async()=>{
 const storage=memory(),store=make(storage);store.write([char()]);const original=storage.getItem(GUEST_KEY);
 store.select('A');assert.equal(store.migrate(),1);assert.equal(store.migrate(),0);
 const server=backend();await drain(store,server);assert.equal(server.read('A').length,1);
 store.select('B');assert.equal(store.migrate(),0);assert.deepEqual(store.read(),[]);
 store.write([char('agent-b')]);assert.equal(store.read()[0].id,'agent-b');store.select('A');assert.equal(store.read()[0].id,'agent-1');
 store.select(null);assert.equal(storage.getItem(GUEST_KEY),original);assert.equal(store.read()[0].id,'agent-1');
});
test('migration collision keeps both versions without overwriting cloud character',async()=>{
 const server=backend(),old=char('agent-1','Nuvem');server.docs.set('users/A/characters/agent-1',encodeDocument(old,'remote-rev',4));
 const store=make();store.write([char('agent-1','Local')]);store.select('A');store.migrate();
 const [id,job]=Object.entries(store.state().pending)[0];await drain(store,server);
 assert.equal(server.read('A').length,2);assert.equal(server.read('A').find(c=>c.id===id).data.nome,'Nuvem');
 const copy=server.read('A').find(c=>c.id!==id);assert.match(copy.data.nome,/Local/);
 server.docs.set(`users/A/characters/${copy.id}`,encodeDocument({...copy.data,nome:'Cópia já editada'},'edited-copy',2));
 await server.save('A',id,job);assert.equal(server.read('A').find(c=>c.id===copy.id).data.nome,'Cópia já editada');
});
test('second device downloads edits; offline queue survives restart and deletes propagate',async()=>{
 const server=backend(),a=make(),disk=memory(),b=make(disk);a.select('A');a.write([char()]);await drain(a,server);
 b.select('A');b.merge(server.read('A'));assert.deepEqual(b.read(),a.read());
 const edited=b.read();edited[0].recursos.peAtual=4;b.write(edited);
 const restored=make(disk);restored.select('A');assert.equal(restored.read()[0].recursos.peAtual,4);assert.equal(Object.keys(restored.state().pending).length,1);
 await drain(restored,server);a.merge(server.read('A'));assert.equal(a.read()[0].recursos.peAtual,4);
 a.write([]);await drain(a,server);restored.merge(server.read('A'));assert.deepEqual(restored.read(),[]);assert.equal(server.read('A')[0].data,null);
});
test('simultaneous edits keep a separate copy; stale snapshots cannot roll back newer data',async()=>{
 const server=backend(),a=make(),b=make();a.select('A');b.select('A');a.write([char()]);await drain(a,server);const old=server.read('A');b.merge(old);
 a.write([char('agent-1','Dispositivo A')]);b.write([char('agent-1','Dispositivo B')]);await drain(a,server);await drain(b,server);
 assert.equal(server.read('A').length,2);a.merge(server.read('A'));a.merge(old);assert.equal(a.read().find(c=>c.id==='agent-1').nome,'Dispositivo A');
 const deletion={data:null,base:old[0].revision,token:'stale-delete'};const plan=mutationPlan('agent-1',deletion,server.read('A').find(c=>c.id==='agent-1'));assert.equal(plan.writes.length,0);
});
test('editing during an upload does not clear the newer queued change',async()=>{
 const store=make(),server=backend();store.select('A');store.write([char()]);const [id,job]=Object.entries(store.state().pending)[0];
 const plan=await server.save('A',id,job);store.write([char('agent-1','Nova edição')]);store.acknowledge('A',id,job,plan.documents);
 assert.equal(store.read()[0].nome,'Nova edição');assert.equal(store.state().pending[id].base,job.token);
 await drain(store,server);assert.equal(server.read('A')[0].data.nome,'Nova edição');
});
test('realtime controller defers incoming data while a field or draft is being edited',async()=>{
 const store=make();let busy=true,receive,changes=0;
 const client={subscribe:(_uid,cb)=>{receive=cb;return()=>{};},save:async()=>{throw Error('Unexpected upload');}};
 const sync=new SyncController({store,client,busy:()=>busy,onChange:()=>changes++});sync.setUser({uid:'A'});
 receive([{id:'agent-1',data:char(),revision:'r',version:1}]);await sync.tick();assert.equal(store.read().length,0);
 busy=false;await sync.tick();assert.equal(store.read().length,1);assert.equal(changes,1);
 sync.setUser({uid:'B'});receive([{id:'agent-b',data:char('agent-b'),revision:'b',version:1}]);await sync.tick();assert.equal(store.read()[0].id,'agent-b');
});
test('an in-flight save cannot apply data to a newly selected account',async()=>{
 const store=make();store.select('A');store.write([char()]);store.select(null);
 let finish;
 const client={subscribe:()=>()=>{},save:()=>new Promise(resolve=>finish=resolve)};
 const sync=new SyncController({store,client});sync.setUser({uid:'A'});
 const job=store.state().pending['agent-1'];sync.setUser({uid:'B'});finish(mutationPlan('agent-1',job,null));
 await new Promise(resolve=>setImmediate(resolve));assert.deepEqual(store.read(),[]);assert.equal(Object.keys(store.state('A').pending).length,1);
});
test('failed cloud writes keep local data and account-specific outbox',async()=>{
 const store=make();let state='';const client={subscribe:()=>()=>{},save:async()=>{throw Error('network');}};
 const sync=new SyncController({store,client,onStatus:s=>state=s});sync.setUser({uid:'A'});sync.write([char()]);
 await new Promise(resolve=>setImmediate(resolve));assert.equal(state,'error');assert.equal(store.read().length,1);assert.equal(Object.keys(store.state().pending).length,1);
 const server=backend();await assert.rejects(server.save('B','agent-1',store.state().pending['agent-1']),/conta mudou/);assert.equal(server.docs.size,0);
});
test('corrupt or oversized documents are rejected without silently replacing local saves',()=>{
 const disk=memory();disk.setItem(GUEST_KEY,'not json');const store=make(disk);assert.throws(()=>store.read());assert.equal(disk.getItem(GUEST_KEY),'not json');
 assert.throws(()=>decodeDocument('agent-1',{schema:1,revision:'r',version:1,deleted:false,json:'{}'}));
 assert.throws(()=>encodeDocument({...char(),notas:'x'.repeat(800001)},'r'),/tamanho/);
});
test('listener permissions errors stay visible and retry restarts subscription',async()=>{
 const store=make();let subscriptions=0,fail,state;
 const client={subscribe:(_uid,_next,error)=>{subscriptions++;fail=error;return()=>{};}};
 const sync=new SyncController({store,client,onStatus:s=>state=s});sync.setUser({uid:'A'});
 fail({code:'permission-denied'});await sync.tick();assert.equal(state,'error');
 sync.retry();assert.equal(subscriptions,2);
});
