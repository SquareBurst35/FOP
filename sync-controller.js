// Coordinates account changes, realtime snapshots and durable offline writes.
export class SyncController {
  constructor({store, client, busy = () => false, online = () => true, onChange = () => {}, onAccount = () => {}, onStatus = () => {}}) {
    Object.assign(this, {store, client, busy, online, onChange, onAccount, onStatus});
    this.generation = 0; this.running = false; this.remote = null; this.acks = []; this.ready = false; this.retryAt = 0; this.failures = 0;
  }
  setUser(user) {
    this.generation++; this.unsubscribe?.(); this.remote = null; this.acks = []; this.ready = false;
    this.retryAt = 0; this.failures = 0; this.subscriptionError = null;
    this.user = user; this.store.select(user?.uid);
    try { if (user) this.store.migrate(); } finally { this.onAccount(user); }
    if (!user) return this.onStatus('local');
    const generation = this.generation;
    this.onStatus('loading');
    this.unsubscribe = this.client.subscribe(user.uid, docs => {
      if (this.generation !== generation) return;
      this.remote = docs; this.ready = true; this.tick();
    }, error => { if (generation === this.generation) { this.subscriptionError = error; this.onStatus('error', error); } });
    this.tick();
  }
  write(rows) { this.store.write(rows); this.onStatus(this.user ? 'pending' : 'local'); void this.tick(); }
  async tick() {
    if (!this.user || this.running || this.busy() || Date.now() < this.retryAt) return;
    if (this.subscriptionError) { this.onStatus('error', this.subscriptionError); return; }
    const uid = this.user.uid, generation = this.generation;
    this.running = true;
    try {
      let changed = false;
      for (const ack of this.acks.splice(0)) {
        this.store.acknowledge(uid, ack.id, ack.job, ack.plan.documents); changed = true;
        if (ack.plan.conflict) this.onStatus('conflict');
      }
      if (this.remote) { changed = this.store.merge(this.remote) || changed; this.remote = null; }
      if (changed) this.onChange();
      if (!this.online()) { this.onStatus('offline'); return; }
      while (this.user?.uid === uid && generation === this.generation && !this.busy()) {
        const entry = Object.entries(this.store.state().pending)[0];
        if (!entry) { this.onStatus(this.ready ? 'synced' : 'loading'); break; }
        const [id, job] = entry;
        this.onStatus('syncing');
        const plan = await this.client.save(uid, id, job);
        if (generation !== this.generation) return; // Old-account queue is replayed idempotently next time.
        this.failures = 0; this.retryAt = 0;
        this.acks.push({ id, job, plan });
        break; // Apply acknowledgements between editing gestures, on the next tick.
      }
    } catch (error) { if (generation === this.generation) { this.retryAt = Date.now() + Math.min(60000, 2000 * 2 ** this.failures++); this.onStatus('error', error); } }
    finally { this.running = false; }
  }
  retry() { this.retryAt = 0; if (this.subscriptionError) return this.setUser(this.user); return this.tick(); }
  stop() { this.generation++; this.unsubscribe?.(); }
}
