import { firebaseConfig } from './firebase-config.js?v=25';
import { decodeDocument, encodeDocument, mutationPlan } from './character-sync.js?v=25';
// Pinned official ESM distribution; no bundler or backend on GitHub Pages.
export async function createFirebaseClient() {
  const [appSDK, authSDK, dbSDK] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js'),
  ]);
  const app = appSDK.initializeApp(firebaseConfig), auth = authSDK.getAuth(app), db = dbSDK.getFirestore(app);
  await authSDK.setPersistence(auth, authSDK.browserLocalPersistence);
  const provider = new authSDK.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return {
    login: () => authSDK.signInWithPopup(auth, provider),
    logout: () => authSDK.signOut(auth),
    observeAuth: callback => authSDK.onAuthStateChanged(auth, callback),
    subscribe(uid, callback, error) {
      return dbSDK.onSnapshot(dbSDK.collection(db, 'users', uid, 'characters'), { includeMetadataChanges: true }, snapshot => {
        if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
        try { callback(snapshot.docs.map(doc => decodeDocument(doc.id, doc.data()))); } catch (e) { error(e); }
      }, error);
    },
    save: (uid, id, job) => saveMutation({auth, db, dbSDK}, uid, id, job),
  };
}

export async function saveMutation({auth, db, dbSDK}, uid, id, job) {
  const reference = id => dbSDK.doc(db, 'users', uid, 'characters', id);
  if (auth.currentUser?.uid !== uid) throw Error('A conta mudou antes do envio.');
  return dbSDK.runTransaction(db, async transaction => {
    if (auth.currentUser?.uid !== uid) throw Error('A conta mudou antes do envio.');
    const snapshot = await transaction.get(reference(id));
    const current = snapshot.exists() ? decodeDocument(id, snapshot.data()) : null;
    const plan = mutationPlan(id, job, current);
    if (plan.conflict && plan.writes.length) {
      const copy = plan.writes[0], existing = await transaction.get(reference(copy.id));
      // A retried request must not overwrite a conflict copy that was already edited.
      if (existing.exists()) return { ...plan, writes: [], documents: [current, decodeDocument(copy.id, existing.data())] };
    }
    for (const next of plan.writes) transaction.set(reference(next.id), { ...encodeDocument(next.data, next.revision, next.version), updatedAt: dbSDK.serverTimestamp() });
    return plan;
  });

}
