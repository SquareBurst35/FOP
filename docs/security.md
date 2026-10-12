# Segurança

O FOP é um site estático (GitHub Pages) sem servidor próprio. Os dados ficam no
navegador de cada jogador e, para quem entra com Google, em uma pasta própria no
Firestore. Este arquivo diz o que protege o quê e o que só o dono do projeto
consegue conferir nos painéis do Google e do GitHub.

## Camadas que já estão no código

| Risco | Proteção | Onde |
|---|---|---|
| Ler a ficha de outra pessoa | Regras do Firestore: só o dono (`request.auth.uid == uid`) lê e grava, com formato e tamanho validados; apagar é proibido | `firestore.rules` |
| Campo da ficha virar HTML/código (XSS) | Todo texto e todo id vindo de dados passa por `escapeHtml`/`escapeAttribute`; ids de itens e efeitos são limpos ao carregar (`safeId`); seletores usam `cssString` | `app.js` |
| Código injetado mesmo assim | Política de segurança de conteúdo (CSP): scripts só do site e do Google, nada inline, sem `eval`, sem `<object>`, `base` e formulários externos barrados | meta CSP em `index.html` |
| Fichas à vista em computador alheio | "Sair" pergunta se deve limpar o navegador; "Sair e limpar este dispositivo" remove o cache da conta e as cópias locais que ela recebeu, e recusa se algo ainda não foi enviado | `account-ui.js`, `character-sync.js` |
| Foto maliciosa | Só `data:image/…` de até 300 KB, mostrada por `<img>` (scripts em SVG não executam) | `app.js` (`normalizeCharacter`) |
| Links externos | Abrem com `rel="noopener noreferrer"` | `app.js` |
| Segredos no repositório | Nenhum; a `apiKey` do Firebase é pública por desenho | `firebase-config.js` |

Testes que guardam isso: `tests/xss-regression.mjs` (carga hostil em todos os
campos), `tests/device-clear-regression.mjs`, `tests/firebase-sync-regression.mjs`.
O workflow do Pages roda todos antes de publicar.

## O que só o dono confere (painéis externos)

Nada abaixo aparece no repositório. Revise de tempos em tempos.

1. **Regras publicadas** — Firebase Console → Firestore Database → *Regras*.
   O texto deve ser idêntico a `firestore.rules`. Se estiver em "modo de teste"
   (`allow read, write: if true`), qualquer pessoa na internet lê e apaga tudo.
   Sempre que `firestore.rules` mudar, republique ali.
2. **Chave de API restrita** — Google Cloud Console → APIs e serviços →
   Credenciais → a chave "Browser key" do projeto. Em *Restrições de aplicativo*
   escolha **Referenciadores HTTP** e adicione `https://squareburst35.github.io/*`.
   Em *Restrições de API*, deixe só Identity Toolkit, Token Service e Cloud
   Firestore. Assim a chave pública não serve em outros sites.
3. **Domínios autorizados** — Firebase Console → Authentication → Settings →
   Authorized domains. Deixe só `squareburst35.github.io` (remova `localhost` se
   não for desenvolver).
4. **Orçamento** — se o projeto estiver no plano pago (Blaze), crie um alerta em
   Faturamento → Orçamentos e alertas. Qualquer conta Google pode criar fichas na
   própria pasta; o alerta avisa se alguém abusar. No plano gratuito o pior caso
   é a cota diária acabar.
5. **Conta do GitHub** — um push na `main` publica o site. Ative autenticação em
   dois fatores (de preferência com passkey) e não deixe tokens pessoais com
   escopo amplo guardados em máquinas compartilhadas.

## Ao atualizar o SDK do Firebase

A CSP lista os endereços que o SDK 12.19.0 usa: `apis.google.com` (script do
login), `<projeto>.firebaseapp.com` (iframe do login), `identitytoolkit`,
`securetoken` e `firestore` em `*.googleapis.com`. Se `firebase-client.js` passar
a importar outra versão, confira se algo novo é bloqueado (console do navegador:
"Refused to …") e teste o login com Google de verdade antes de publicar.

## Limites conhecidos

- O GitHub Pages não permite cabeçalhos HTTP. Por isso a CSP vai em `<meta>`, que
  não suporta `frame-ancestors` (proteção contra o site ser colocado em um
  `<iframe>` de terceiros) nem relatório de violações.
- As fichas ficam no `localStorage` sem criptografia. Quem usa o navegador do
  jogador consegue lê-las; é para isso que existe "Sair e limpar este dispositivo".
- Não há importação de fichas por arquivo. Se for criada, o arquivo deve passar
  por `normalizeCharacter` e ser tratado como dado hostil (o teste de XSS já
  cobre a renderização).
