// Local persistence and sync queue, independent of Firebase and RPG rules.
export const GUEST_KEY = 'fop_personagens_v1';
const CLAIMS_KEY = 'fop_migration_owners_v1';
export const accountKey = uid => `fop_account_v1:${uid}`;
const clone = value => JSON.parse(JSON.stringify(value));
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,180}$/.test(id);
function validCharacter(value) { return value && typeof value === 'object' && !Array.isArray(value) && validId(value.id); }
function readJSON(storage, key, fallback) {
  const raw = storage.getItem(key);
  // A damaged cache must not silently become an empty account and overwrite data.
  return raw === null ? clone(fallback) : JSON.parse(raw);
}
export function decodeDocument(id, value) {
  if (!validId(id) || !value || value.schema !== 1 || typeof value.revision !== 'string' || typeof value.deleted !== 'boolean' || !Number.isSafeInteger(value.version) || value.version < 1) throw Error('Documento de ficha inválido.');
  if (value.deleted) return { id, revision: value.revision, version: value.version, data: null };
  const data = JSON.parse(value.json);
  if (!validCharacter(data) || data.id !== id) throw Error('Identificador da ficha inválido.');
  return { id, revision: value.revision, version: value.version, data };
}
export function encodeDocument(data, revision, version = 1) {
  const json = data === null ? '' : JSON.stringify(data);
  if (new TextEncoder().encode(json).length > 800000) throw Error('Esta ficha excede o tamanho de sincronização. A cópia local foi mantida.');
  return { schema: 1, json, revision, version, deleted: data === null };
}
// The server transaction calls this again if a competing device changes the doc.
export function mutationPlan(id, job, current) {
  if (current?.revision === job.token) return { writes: [], documents: [current], conflict: false };
  if (current && equal(current.data, job.data)) return { writes: [], documents: [current], conflict: false };
  if (current && current.revision !== job.base) {
    if (job.data === null) return { writes: [], documents: [current], conflict: true }; // Do not erase a newer edit.
    const copyId = `${id.slice(0,100)}--${job.token}`;
    const data = { ...job.data, id: copyId, nome: `${job.data.nome || 'Agente'} — cópia preservada` };
    const copy = { id: copyId, data, revision: job.token, version: 1 };
    return { writes: [copy], documents: [current, copy], conflict: true };
  }
  const next = { id, data: job.data, revision: job.token, version: (current?.version ?? 0) + 1 };
  return { writes: [next], documents: [next], conflict: false };
}
export class CharacterStore {
  constructor(storage, uuid = () => crypto.randomUUID()) { this.storage = storage; this.uuid = uuid; this.uid = null; }
  state(uid = this.uid) {
    const state = readJSON(this.storage, accountKey(uid), { characters: [], pending: {}, revisions: {} });
    if (!Array.isArray(state.characters) || !state.pending || !state.revisions) throw Error('Cache da conta inválido.');
    state.versions ??= {}; state.migrations ??= {};
    return state;
  }
  persist(state, uid = this.uid) { this.storage.setItem(accountKey(uid), JSON.stringify(state)); }
  read() {
    const rows = this.uid ? this.state().characters : readJSON(this.storage, GUEST_KEY, []);
    if (!Array.isArray(rows)) throw Error('As fichas locais não puderam ser lidas.');
    return clone(rows);
  }
  select(uid) { this.uid = uid || null; }
  migrate() {
    if (!this.uid) return 0;
    const locals = readJSON(this.storage, GUEST_KEY, []);
    if (!Array.isArray(locals)) throw Error('As fichas locais não puderam ser migradas.');
    const claims = readJSON(this.storage, CLAIMS_KEY, {}), state = this.state();
    let count = 0;
    for (const data of locals) {
      if (!validCharacter(data) || claims[data.id]) continue;
      if (!state.migrations[data.id]) {
        const existing = state.characters.find(c => c.id === data.id);
        if (!equal(existing, data)) {
          const collision = existing || state.revisions[data.id] || state.pending[data.id];
          const imported = collision ? { ...data, id: this.uuid(), nome: `${data.nome || 'Agente'} — cópia local` } : clone(data);
          state.characters.push(imported);
          state.pending[imported.id] = { data: clone(imported), base: null, token: this.uuid() };
          count++;
        }
        state.migrations[data.id] = true;
      }
      claims[data.id] = this.uid;
    }
    this.persist(state); // Save queue before recording ownership. Never delete GUEST_KEY.
    this.storage.setItem(CLAIMS_KEY, JSON.stringify(claims));
    return count;
  }
  write(characters) {
    if (!characters.every(validCharacter)) throw Error('Ficha inválida para salvar.');
    if (!this.uid) { this.storage.setItem(GUEST_KEY, JSON.stringify(characters)); return; }
    const state = this.state(), before = new Map(state.characters.map(c => [c.id, c])), after = new Map(characters.map(c => [c.id, c]));
    for (const id of new Set([...before.keys(), ...after.keys()])) {
      const data = after.get(id) ?? null;
      if (equal(before.get(id) ?? null, data)) continue;
      state.pending[id] = { data: clone(data), base: state.pending[id]?.base ?? state.revisions[id] ?? null, token: this.uuid() };
    }
    state.characters = clone(characters);
    this.persist(state); // Character and outbox commit in one localStorage write.
  }
  merge(documents) {
    const state = this.state(), before = JSON.stringify(state.characters);
    const rows = new Map(state.characters.map(c => [c.id, c]));
    for (const doc of documents) {
      if (state.pending[doc.id] || (state.versions[doc.id] ?? 0) > doc.version) continue;
      if (doc.data) rows.set(doc.id, clone(doc.data)); else rows.delete(doc.id);
      state.revisions[doc.id] = doc.revision; state.versions[doc.id] = doc.version;
    }
    state.characters = [...rows.values()]; this.persist(state);
    return before !== JSON.stringify(state.characters);
  }
  acknowledge(uid, id, job, documents) {
    const state = this.state(uid), latest = state.pending[id];
    if (!latest) return;
    if (latest.token !== job.token) {
      // Another local edit occurred while this request was in flight.
      const accepted = documents.find(d => d.id === id);
      if (accepted?.revision === job.token) latest.base = job.token;
      this.persist(state, uid); return;
    }
    delete state.pending[id];
    const rows = new Map(state.characters.map(c => [c.id, c]));
    for (const doc of documents) {
      if (state.pending[doc.id] || (state.versions[doc.id] ?? 0) > doc.version) continue;
      if (doc.data) rows.set(doc.id, clone(doc.data)); else rows.delete(doc.id);
      state.revisions[doc.id] = doc.revision; state.versions[doc.id] = doc.version;
    }
    state.characters = [...rows.values()]; this.persist(state, uid);
  }
}
