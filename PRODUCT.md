# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Principalmente jogadores de Ordem Paranormal RPG, criando e consultando a própria ficha de agente durante a sessão — no computador ou no celular, sozinhos antes da mesa ou em tempo real durante o jogo. Mestres também usam o site, mas o foco de priorização é a experiência de quem joga um agente, não de quem narra.

## Product Purpose

FOP é uma ficha de personagem interativa para Ordem Paranormal RPG. Ela guia a criação do agente e automatiza os cálculos da ficha (PV, PE, Sanidade, atributos, dados de combate), em vez de exigir preenchimento manual como uma ficha em PDF. Sucesso é o jogador conseguir montar e usar o agente à mesa sem precisar consultar os livros para saber o que um poder, ritual ou item faz — o site já traz o número certo.

## Positioning

A combinação que nenhuma outra ficha digital de Ordem Paranormal reproduz: automação real na criação e no uso da ficha (nada de preenchimento manual), um boneco em pixel art que se personaliza visualmente conforme o equipamento vestido, e o catálogo mecânico completo do sistema (origens, trilhas, poderes, rituais, itens) com resumos originais e números conferidos contra os livros — tudo gratuito, sem cadastro obrigatório.

## Operating Context

Uso típico é à mesa, durante ou entre sessões de RPG, em computador ou celular. O jogador cria o agente pelo fluxo guiado, equipa itens e vê o boneco em pixel art refletir isso no paperdoll, e consulta poderes/rituais/itens do catálogo em busca de números mecânicos exatos (dano, dados, DT, alcance, custo em PE) em vez de flavor text. A ficha salva automaticamente no navegador; entrar com Google é opcional e sincroniza a mesma ficha entre dispositivos sem substituir o armazenamento local.

## Capabilities and Constraints

- Site estático, sem framework e sem build step (JS puro servido diretamente); publicado via GitHub Pages.
- Sem cadastro obrigatório: persistência primária é `localStorage`; login com Google/Firestore é uma sincronização opcional adicional (ver [docs/firebase-setup.md](docs/firebase-setup.md)), nunca uma exigência para usar o site.
- Todo item novo do catálogo precisa reaproveitar arte pixel art já existente (campo `icon` em `additional-items.js` aponta para o sprite de um item existente) — não há orçamento para desenhar sprite novo por item.
- Todo número mecânico exibido (dano, dados, DT, alcance, cura, custo em PE) precisa vir dos livros de referência; nunca é inventado quando o livro é vago, e nunca é copiado literalmente do texto do livro — é um resumo mecânico em redação própria.
- Catálogo de conteúdo de personagem (origens, trilhas, poderes de classe/gerais/paranormais, rituais, itens) está integrado por completo a partir do livro base, Sobrevivendo ao Horror e Arquivos Secretos #1–#7. Ficam fora de escopo deliberadamente (documentado em [docs/content-audit.md](docs/content-audit.md)): blocos de ameaças/aliados, tabelas de mestre, subsistemas que o site não modela (veículos, hackeamento, combate subaquático, batalhas de intenção, construção de base) e regras opcionais não canônicas.
- Interface precisa funcionar bem tanto em computador quanto em celular (responsivo) — não há versão "só desktop".

## Brand Commitments

Nome do produto é "FOP — Fichas Ordem Paranormal". É projeto de fã não oficial: todo material precisa deixar isso explícito e nunca reivindicar afiliação com os detentores de direitos de Ordem Paranormal. Nenhum texto integral dos livros pode ser distribuído — só resumos mecânicos em redação própria. Nenhuma outra restrição de paleta, tipografia ou identidade visual foi confirmada como vinculante.

## Evidence on Hand

Não há depoimentos, estudos de caso ou imprensa (projeto de fã, sem essa forma de prova social). A evidência de qualidade do produto é o próprio catálogo e sua auditoria contínua contra os livros, registrada em [docs/content-audit.md](docs/content-audit.md) e [docs/reference-audit.md](docs/reference-audit.md). Trabalho futuro não deve fabricar depoimentos, números de usuários ou qualquer prova social que não exista.

## Product Principles

- Automação em vez de preenchimento manual: criação guiada e cálculo automático são o motivo de existir do site, não um extra sobre uma ficha estática.
- Precisão mecânica antes de tudo: todo número na tela precisa ser verificável contra um livro; quando o livro não dá o número, o site também não dá.
- Personalização visual sem custo de produção por item: o paperdoll em pixel art escala reaproveitando sprites existentes, não desenhando um novo por item.
- Zero fricção de entrada: funciona por completo sem cadastro; sincronização é opt-in e aditiva, nunca um bloqueio de acesso.
- Fidelidade sem violar direitos autorais: resumo mecânico original sempre, cópia literal do livro nunca.

## Accessibility & Inclusion

Nenhum requisito formal de acessibilidade foi confirmado além de funcionar bem em desktop e mobile. Não presumir mais do que isso sem confirmação.
