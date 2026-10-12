import { firebaseConfigured } from './firebase-config.js?v=25';
import { createFirebaseClient } from './firebase-client.js?v=26';
import { CharacterStore, GUEST_KEY, accountKey } from './character-sync.js?v=26';
import { SyncController } from './sync-controller.js?v=25';
import { createStatusPresenter } from './status-presenter.js?v=1';

const panel = document.querySelector('#account-controls');
const store = new CharacterStore(localStorage);
let controller = null, client = null, starting = false;
const status = document.createElement('span');
status.className = 'account-status'; status.setAttribute('role', 'status');
const name = document.createElement('span'); name.className = 'account-name';
const login = document.createElement('button');
login.className = 'button ghost compact'; login.type = 'button'; login.textContent = 'Entrar com Google';
const logout = document.createElement('button');
logout.className = 'button ghost compact'; logout.type = 'button'; logout.textContent = 'Sair'; logout.hidden = true;
const retry = document.createElement('button');
retry.className = 'button ghost compact'; retry.type = 'button'; retry.textContent = 'Tentar novamente'; retry.hidden = true;
panel.append(name, status, login, logout, retry);
// Sair pergunta se este navegador deve esquecer as fichas: em computador de
// outra pessoa elas ficariam à vista de quem usar o navegador depois.
const leave = document.createElement('dialog');
leave.className = 'account-dialog'; leave.setAttribute('aria-labelledby', 'account-dialog-title');
leave.innerHTML = `
  <h2 id="account-dialog-title">Sair da conta</h2>
  <p>Suas fichas continuam salvas na conta. Neste navegador elas ficam guardadas para você usar sem conexão.</p>
  <p class="account-dialog-hint">Está em um computador de outra pessoa? Remova as fichas daqui ao sair.</p>
  <p class="account-dialog-note" role="alert" hidden></p>
  <div class="account-dialog-actions">
    <button type="button" class="button ghost compact" data-leave="cancel">Cancelar</button>
    <button type="button" class="button ghost compact" data-leave="keep" autofocus>Só sair</button>
    <button type="button" class="button primary compact" data-leave="clear">Sair e limpar este dispositivo</button>
  </div>`;
document.body.append(leave);
const leaveNote = leave.querySelector('.account-dialog-note');
const busy = () => Boolean(window.fopSyncBusy?.());
const notify = type => window.dispatchEvent(new Event(type));
const messages = {
  local: 'Salvo neste dispositivo', loading: 'Carregando fichas da conta…',
  syncing: 'Sincronizando…',
  synced: 'Fichas sincronizadas', offline: 'Sem conexão · alterações salvas neste dispositivo',
  conflict: 'Versões diferentes foram preservadas em fichas separadas.',
};
const present = createStatusPresenter(show);
function message(state, error) {
  if (state === 'conflict') { window.fopSyncNotice?.(messages.conflict); return; }
  present(state, error);
}
function show(state, error) {
  const errors = {
    'auth/popup-blocked': 'Permita o pop-up do Google e tente novamente.',
    'auth/popup-closed-by-user': 'Login cancelado. As fichas locais continuam salvas.',
    'auth/cancelled-popup-request': 'Login cancelado.',
    'auth/unauthorized-domain': 'O domínio do site ainda precisa ser autorizado no Firebase.',
    'auth/operation-not-allowed': 'O login Google ainda precisa ser habilitado no Firebase.',
    'permission-denied': 'Acesso ao Firestore negado. Verifique a configuração das regras.',
    'unavailable': 'Sem conexão com a nuvem. A cópia local foi mantida.',
  };
  const text = state === 'error' ? (errors[error?.code] || 'Não foi possível sincronizar. As fichas locais foram mantidas.') : messages[state] || '';
  // Rewriting identical text still re-announces the live region and repaints.
  if (status.textContent !== text) status.textContent = text;
  if (panel.dataset.state !== state) panel.dataset.state = state;
  status.title = state === 'syncing' ? 'As alterações já estão salvas neste dispositivo e estão sendo enviadas para a conta.' : '';
  retry.hidden = state !== 'error';
}
window.fopPersistence = {
  read: () => store.read(),
  write: rows => {
    try { if (controller) controller.write(rows); else store.write(rows); }
    catch (error) { status.textContent = 'Não foi possível salvar neste dispositivo.'; window.fopSyncNotice?.('O salvamento local falhou. Mantenha a ficha aberta e verifique o espaço do navegador.'); throw error; }
  },
};
window.addEventListener('storage', event => {
  const key = store.uid ? accountKey(store.uid) : GUEST_KEY;
  if (event.key === key && !busy()) notify('fop-characters-updated');
});
let activeUid = null;
function accountChanged(user) {
  const changed = activeUid !== (user?.uid ?? null); activeUid = user?.uid ?? null;
  name.textContent = user?.email || user?.displayName || '';
  login.hidden = Boolean(user); logout.hidden = !user;
  if (changed) notify('fop-account-changed');
}
async function start() {
  if (!firebaseConfigured || starting || client) return;
  starting = true; login.disabled = true; message('loading');
  try {
    client = await createFirebaseClient();
    controller = new SyncController({ store, client, busy,
      online: () => navigator.onLine,
      onAccount: accountChanged,
      onChange: () => notify('fop-characters-updated'), onStatus: message,
    });
    client.observeAuth(user => {
      try { controller.setUser(user); } catch (error) { message('error', error); }
    });
  } catch (error) { client = null; message('error', error); }
  finally { starting = false; login.disabled = !client; }
}
login.addEventListener('click', async () => {
  if (!client) return;
  login.disabled = true;
  try { await client.login(); } catch (error) { message('error', error); }
  finally { login.disabled = false; }
});
logout.addEventListener('click', () => { leaveNote.hidden = true; leave.showModal(); });
leave.addEventListener('click', event => {
  const choice = event.target.closest?.('[data-leave]')?.dataset.leave;
  if (choice === 'cancel') leave.close();
  else if (choice) signOut(choice === 'clear');
});
async function signOut(clear) {
  const uid = store.uid;
  let unsent = false, unreadable = false;
  if (clear && uid) { try { unsent = Object.keys(store.state(uid).pending).length > 0; } catch { unreadable = true; } }
  if (unsent || unreadable) {
    leaveNote.textContent = unsent
      ? 'Ainda há alterações que não foram enviadas para a conta. Espere aparecer “Fichas sincronizadas” e tente de novo.'
      : 'Não foi possível conferir se há alterações por enviar neste dispositivo, então nada foi apagado.';
    leaveNote.hidden = false; return;
  }
  leave.close(); logout.disabled = true;
  try {
    await client.logout();
    if (clear && uid) {
      try {
        const result = store.clearDevice(uid);
        window.fopSyncNotice?.(result.cleared ? 'Fichas da conta removidas deste dispositivo.' : 'Você saiu, mas ainda havia alterações por enviar, então as fichas ficaram neste navegador.');
        notify('fop-characters-updated');
      } catch (error) { window.fopSyncNotice?.('Você saiu, mas não foi possível limpar este dispositivo.'); }
    }
  } catch (error) { message('error', error); }
  finally { logout.disabled = false; }
}
retry.addEventListener('click', () => client ? controller.retry() : start());
window.addEventListener('online', () => controller?.retry());
window.addEventListener('offline', () => { if (store.uid) message('offline'); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) controller?.tick(); });
setInterval(() => { if (!document.hidden) controller?.tick(); }, 2000);
if (firebaseConfigured) start();
else { login.disabled = true; login.title = 'Login disponível após a configuração do projeto.'; status.textContent = 'Salvo neste dispositivo · Google em configuração'; }
