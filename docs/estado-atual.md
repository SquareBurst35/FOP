# Ponto de retomada — 20/10/2026

Base sincronizada com `origin/main`, commit `84981d4`. A branch
`claude/tender-hawking-97i2oy` estava no mesmo commit na conferência de retomada.
Esse registro descreve a base recebida; alterações posteriores devem ser
conferidas no histórico do Git.

Atualização desta retomada: o Arquivos Secretos de setembro foi identificado como
**#9 (v1.0)** e integrado. Veja [as09-audit.md](as09-audit.md) para fonte, cobertura
e limites: duas origens, quatro poderes, duas trilhas, onze itens, sete tipos de
drone e oito fichas dos Hell Hunters. O catálogo de ameaças tem agora 196 fichas;
a validação após essa integração passou com 84 testes e 63 arquivos de sintaxe.
Os números da seção de verificação abaixo descrevem a base anterior ao #9.

## Situação da base

- Os efeitos de abertura do dossiê, conjuração por elemento, fundo do Outro Lado,
  constelação de atributos e opção de efeitos reduzidos já estão integrados.
- A ficha preserva cards abertos, rolagem e foco ao atualizar sua interface.
- Resistências passivas e efeitos ativos aparecem no Resumo; poderes com escolhas
  fixas usam os seletores registrados na ficha.
- O catálogo de ameaças tem interface própria, com lista, busca e fichas.
- As últimas alterações recebidas acrescentam proteção de atributos/ids contra
  XSS, CSP e a opção de sair limpando os dados locais da conta.
- A persistência primária é local; login e sincronização são opcionais.

## Onde trabalhar

| Área | Arquivos principais |
| --- | --- |
| Rotas, criação, ficha e diálogos | `app.js`, `index.html` |
| Regras e valores derivados | `rules.js` |
| Catálogos e escolhas | `content.js`, `choices.js` |
| Progressão | `progression.js` |
| Custos, usos e histórico de sessão | `use-options.js`, `session.js`, `ritual-variants.js` |
| Inventário, melhorias e arte | `items.js`, `additional-items.js`, `item-upgrades.js`, `inventory-ui.js`, `item-art.js`, `item-icons.js` |
| Mesa de operações do AS #9 | `tactical.js`, `tactical-state.js`, `tactical-ui.js`, `tactical.css` |
| Ameaças | `threats.js` e funções de ameaças em `app.js` |
| Conta e sincronização | `account-ui.js`, `character-sync.js`, `sync-controller.js`, `firebase-client.js`, `status-presenter.js` |
| Visual e efeitos | `styles.css`, `home.css`, `otherside.css`, `effects.css`, `effects.js`, `account.css` |
| Estado visual da ficha | `sheet-ui-state.js` |
| Regressões | `tests/*.mjs` |

## Referências para continuar

- [Produto](../PRODUCT.md): público, objetivos, escopo e princípios.
- [Design](../DESIGN.md): identidade visual e componentes existentes.
- [Auditoria de conteúdo](content-audit.md): integração dos suplementos e
  decisões editoriais. Contém checkpoints históricos superados; compare-os com
  o código e as seções mais recentes antes de tratar algo como pendente.
- [Auditoria de ameaças](threats-audit.md): catálogo, fontes e metodologia de
  conferência. Registra 188 ameaças na conclusão de 22/09/2026.
- [Conferência de referências](reference-audit.md): histórico da revisão de
  rituais e itens. Contagens e comandos antigos podem ter sido superados.
- [Firebase](firebase-setup.md) e [segurança](security.md): configuração e
  responsabilidades de conferência nos serviços externos.

Os módulos em `supplements/` incluem rascunhos e subsistemas sem interface.
A presença de dados e testes nesses módulos não significa que o recurso está
disponível na ficha. As opções de personagem integradas vivem nos catálogos
principais.

## Rotina de desenvolvimento

1. Abra a prévia com `npm run dev` e use fichas de teste locais.
2. Preserve os IDs dos catálogos para manter a compatibilidade das fichas salvas.
3. Confira números novos nas referências e escreva resumos próprios.
4. Ao mudar módulos do navegador, atualize os parâmetros `?v=` nos importadores
   afetados e no `index.html`, seguindo o padrão atual de atualização de cache.
5. Execute `npm run check`, `npm test` e confira o fluxo alterado no navegador.

O servidor local e os scripts de validação não exigem dependências externas.
Os arquivos locais de ferramentas em `.claude/` e `.impeccable/critique/` foram
preservados durante a sincronização.

## Verificação da retomada

- `npm run check`: sintaxe aprovada em 61 arquivos JavaScript.
- `npm test`: 76 testes aprovados, sem falhas.
- Prévia local: início, abertura da criação de agente, catálogo com 188 ameaças
  e abertura de uma ficha de ameaça conferidos no navegador.
- Servidor local: HTML, JavaScript com parâmetro de versão e CSS responderam
  corretamente; arquivos inexistentes, pasta `.git` e métodos de escrita foram
  recusados.

Essa conferência não inclui autenticação real no Firebase nem revisão completa
de todas as telas e tamanhos de dispositivo.

## Automação do AS #9

A integração e seus controles de sessão estão descritos em
[as09-automation.md](as09-automation.md). A Mesa de operações recebe o contexto,
calcula os resultados e desconta recursos/consumíveis, com desfazer persistente.
O checkpoint acima é histórico: a suíte atual tem 115 testes aprovados.
