# Ativar Google + Firestore

1. No [Firebase Console](https://console.firebase.google.com/), crie/abra um projeto e registre um aplicativo **Web**.
2. Copie o objeto `firebaseConfig` de **Configurações do projeto → Seus aplicativos** para `firebase-config.js`. São necessários `apiKey`, `authDomain`, `projectId` e `appId`. Essa configuração é pública; não use chave de conta de serviço ou segredo OAuth.
3. Em **Authentication → Sign-in method**, habilite **Google** e selecione o e-mail de suporte. Em **Settings → Authorized domains**, adicione `squareburst35.github.io` (sem `https://` ou `/FOP/`).
4. Crie o **Cloud Firestore**, banco `(default)`, em modo de produção. Em **Rules**, publique o conteúdo de [`firestore.rules`](../firestore.rules).
5. Publique a configuração no GitHub. No site, entre com Google e espere “Fichas sincronizadas”; entre com a mesma conta no outro dispositivo.

As fichas ficam em `users/{uid}/characters/{id}`. O localStorage original permanece intacto; caches e alterações pendentes são separados por conta. A migração de cada ficha local ocorre uma vez para a primeira conta que a recebe. Saindo da conta, reaparece o arquivo local original. Alterações offline aguardam conexão; versões conflitantes são preservadas em cópias separadas.

Validação local: `node --test tests/firebase-sync-regression.mjs tests/level-up-regression.mjs`. Login Google, regras publicadas e comunicação real com Firestore devem ser verificados após configurar o projeto.

Referências: [Google Authentication](https://firebase.google.com/docs/auth/web/google-signin), [regras por usuário](https://firebase.google.com/docs/firestore/security/rules-conditions), [atualizações em tempo real](https://firebase.google.com/docs/firestore/query-data/listen).
