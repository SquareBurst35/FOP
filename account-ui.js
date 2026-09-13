import { firebaseConfigured } from './firebase-config.js?v=25';
import { createFirebaseClient } from './firebase-client.js?v=25';
import { CharacterStore, GUEST_KEY, accountKey } from './character-sync.js?v=25';
import { SyncController } from './sync-controller.js?v=25';

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
const busy = () => Boolean(window.fopSyncBusy?.());
const notify = type => window.dispatchEvent(new Event(type));
function message(state, error) {
  const messages = {
    local: 'Salvo neste dispositivo', loading: 'Carregando fichas da conta…',
    syncing: 'Sincronizando…', pending: 'Alterações salvas neste dispositivo · aguardando envio',
    synced: 'Fichas sincronizadas', offline: 'Sem conexão · alterações salvas neste dispositivo',
    conflict: 'Versões diferentes foram preservadas em fichas separadas.',
  };
  if (state === 'conflict') { window.fopSyncNotice?.(messages.conflict); return; }
  const errors = {
    'auth/popup-blocked': 'Permita o pop-up do Google e tente novamente.',
    'auth/popup-closed-by-user': 'Login cancelado. As fichas locais continuam salvas.',
    'auth/cancelled-popup-request': 'Login cancelado.',
    'auth/unauthorized-domain': 'O domínio do site ainda precisa ser autorizado no Firebase.',
    'auth/operation-not-allowed': 'O login Google ainda precisa ser habilitado no Firebase.',
    'permission-denied': 'Acesso ao Firestore negado. Verifique a configuração das regras.',
    'unavailable': 'Sem conexão com a nuvem. A cópia local foi mantida.',
  };
  status.textContent = state === 'error' ? (errors[error?.code] || 'Não foi possível sincronizar. As fichas locais foram mantidas.') : messages[state] || '';
  panel.dataset.state = state;
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
logout.addEventListener('click', async () => {
  logout.disabled = true;
  try { await client.logout(); } catch (error) { message('error', error); }
  finally { logout.disabled = false; }
});
retry.addEventListener('click', () => client ? controller.retry() : start());
window.addEventListener('online', () => controller?.retry());
window.addEventListener('offline', () => { if (store.uid) message('offline'); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) controller?.tick(); });
setInterval(() => { if (!document.hidden) controller?.tick(); }, 2000);
if (firebaseConfigured) start();
else { login.disabled = true; login.title = 'Login disponível após a configuração do projeto.'; status.textContent = 'Salvo neste dispositivo · Google em configuração'; }
