# Auditoria de Arquivos Secretos #9 — Hell Hunters

## Fonte e método

- Arquivo recebido: `Arquivos-Secretos Setembro 1.0.pdf`.
- Expediente conferido visualmente na p.2: **Pacote #9, Setembro/2026, v1.0**.
- 66 páginas. SHA-256: `cc5f8e5c385ae88c1a0396a230fccd9996e7d248f4d762cf01d8b6a80179a353`.
- Texto completo das páginas 1–66 extraído; conteúdo textual lido. Capa e
  divisórias sem texto extraível não contam como opções de jogo.
- Conferência visual das páginas 2, 21, 23, 25, 27, 29, 31, 33–35 e 38–48.
  Nelas, a página do PDF corresponde à página impressa (offset 0).
- Novos registros usam `source: "Arquivos Secretos #9"` e a página impressa.
  Textos são resumos mecânicos próprios; PDF, imagens e extrações ficam fora do
  repositório. Nomes, IDs e conteúdo dos livros anteriores foram preservados.

O projeto recebido cobria os pacotes #1–#7. A numeração #9 está explícita neste
PDF; **o pacote #8 não foi fornecido nesta apuração**, e não é tratado como
conferido ou integrado.

## Cobertura do documento

| Páginas | Conteúdo | Tratamento |
| --- | --- | --- |
| 1–4 | Capa, expediente e sumário | Fonte/versão identificadas |
| 5–17 | Organização, história, estrutura, gerador de mercenários, ganchos de missão, medalhas e animais | Contexto e material de mesa; não viraram poderes ou itens livres |
| 18–35 | Membros dos Hell Hunters, fichas e benefícios como aliados | 8 fichas integradas em Ameaças/Realidade; quadros de aliado resumidos na própria ficha |
| 36–41 | Regras Mercenárias: origens, poderes e trilhas | Integradas aos catálogos principais e à criação/evolução |
| 42 | Regalias veiculares e Aríete Portátil | Item e 3 regalias integrados à Mesa de operações |
| 43–48 | Equipamentos, drones, modificações e munição | 11 itens e 7 tipos de drone integrados |
| 48–49 | Dicas de condução de operações táticas | Orientação de mestre; não é bônus automático da ficha |
| 50–51 | Mural de fãs | Sem conteúdo mecânico selecionável |
| 52–65 | Inquérito Mensal: ensaio sobre o playtest de Ordem Paranormal RPG 2 | Sistema diferente; não altera classes, dados, atributos ou recursos do FOP atual |
| 66 | Encerramento | Sem conteúdo mecânico novo |

## Personagens

| Categoria | Entradas | Página | Integração |
| --- | --- | --- | --- |
| Origens | Treinado pela Hell Hunters; Veterano de Conflito Armado | 38 | `rules.js`, `content.js` |
| Poderes de Combatente | Municiador Ambulante; Ripostar Ousado; Tática de Abordagem; Tiro Intuitivo | 39 | Catálogo de poderes e uso de PE |
| Trilha de Combatente: Incursor | CQB; Entrada Explosiva; Proteger Reféns; Alvo-prioritário | 40 | Patamares 10/40/65/99 e evolução |
| Trilha de Especialista: Piloto de Drone | Companheiro Drone; Protetor dos Drones; Ás dos Drones; Mestre dos Drones | 41 | Patamares 10/40/65/99, escolhas e custos |
| Rituais | Nenhuma entrada nova | — | Nuvem de Cinzas é citado pela Chloe, sem duplicar o ritual existente |
| Novo uso de Tática | Analisar Perigo | 38 | Ação da Mesa de operações para personagens treinados em Tática |

### Cálculos e escolhas

- Treinado pela Hell Hunters exige um **par completo** na criação: Luta e
  Fortitude ou Pontaria e Reflexos. Combinações cruzadas são recusadas.
- Primeiro par: +2 PV em NEX 5%, mais 1 PV a cada 10% de NEX. Segundo par:
  +1 PE em NEX 5%, mais 1 PE a cada 10% de NEX. NEX 0 não recebe o bônus;
  na regra de nível/NEX separados, esta origem segue o **NEX**, como impresso.
- CQB registra o benefício ao adquirir: treinamento em Pontaria, treinamento
  em Luta ou +2 em ambas. Recalcular/reabrir a ficha não transforma o treinamento
  concedido pelo próprio CQB no bônus de +2. Bônus manuais de perícia são mantidos.
- Proteger Reféns oferece custos distintos: 2 PE para assumir o efeito, 4 PE
  para assumir e reduzir o dano à metade. Não oferece um custo intermediário
  de 3 PE que a fonte não prevê.
- Protetor dos Drones custa 3 PE; com Mestre dos Drones da trilha, custa 1 PE.
- Companheiro Drone registra um dos sete tipos. Utilitário exige a perícia
  permanente permitida. Mestre dos Drones registra a alternativa de evolução.

As regras condicionais agora têm controles na **Mesa de operações**. A ficha
recebe o contexto do jogador, rola os dados, calcula, gasta recursos e registra
o resultado. A implementação, o uso e os limites de contexto estão em
[Automação do AS #9](as09-automation.md).

## Equipamentos

| Item | Categoria | Espaços | Página |
| --- | --- | --- | --- |
| Aríete Portátil | I | 2 | 42 |
| Boroscópio Articulado | I | 1 | 43 |
| Capacete Tático | II | 1 | 43 |
| Designated Marksman Rifle (DMR) | III | 3 | 43 |
| Drone de Combate Tático | III | 2 | 44 |
| Escudo Balístico LED | II | 2 | 46 |
| Espingarda Serrada | I | 1 | 46 |
| Lançador de Granadas Portátil | II | 1 | 47 |
| Machado Tático | II | 1 | 47 |
| Pistola Taser | II | 1 | 48 |
| Dardos Condutores | I | 1 | 48 |

Todos reaproveitam sprites existentes. O escudo acrescenta +2 na Defesa e
RD balístico 10, uma vez, seguindo o tratamento existente de proteções no
inventário. O capacete informa a chance de 25% contra dano adicional de crítico
ou furtivo; não recebe um bônus numérico de Defesa inventado.

### Drones

`drone-types.js` centraliza os sete perfis: Atirador (p.44), Espião, Hacker,
Inteligente, Médico, Protetor e Utilitário (p.45). Os resumos aparecem nas
escolhas do companheiro e nas melhorias do equipamento.

- Cada companheiro e cada exemplar comprado tem configuração individual na
  Mesa de operações: tipo base, modificações, perícia, disponibilidade e controle.
- A primeira escolha define o tipo incluído na categoria III; modificações
  diferentes elevam a categoria até IV. A trilha isenta 1/3/6 modificações nos
  companheiros em NEX 40/65/99; com segundo drone, três para cada companheiro.
  Drones requisitados separadamente seguem as categorias normais.
- Protetor acrescenta +5 Defesa uma única vez enquanto um drone desse tipo
  estiver disponível. Drones indisponíveis não fornecem o bônus.
- O Utilitário exige perícia permanente permitida. Tipos e perícia do formato
  compartilhado anterior são migrados para as instâncias individuais.
- Testes, cura, ativações, proteção, repetição única, rastreamento e manutenção
  têm ações com custos e resultados. Não há simulação de mapa; confira os
  contextos que vêm da mesa em [as09-automation.md](as09-automation.md).

## Hell Hunters: fichas de mestre

| Nome | Página | VD | Defesa | PV |
| --- | --- | --- | --- | --- |
| Jason Bloom | 21 | 140 | 30 | 200 |
| Karen Brown | 23 | 160 | 33 | 240 |
| Troy Walker | 25 | 140 | 29 | 180 |
| Roy Stevens | 27 | 160 | 32 | 250 |
| Stella Green | 29 | 140 | 29 | 190 |
| Arnold Strolley | 31 | 140 | 30 | 200 |
| Chloe Grey | 33 | 140 | 29 | 170 |
| Ryder Staten | 34–35 | 200 | 34 | 320 |

Incluem atributos, sentidos, resistências, perícias, ataques, habilidades,
ações e resumos dos quadros de aliado. São pessoas de tamanho Médio na aba
Realidade. O catálogo passa de 188 para **196 fichas**.

### Divergências e cuidados da fonte

- O +5 de Treinamento Tático já está nas estatísticas. Não somar de novo.
  Ryder permite **três** ações agredir por ação padrão; os demais, duas.
- Percepção de Jason e Troy e Iniciativa de Arnold têm bônus **zero**; o glifo
  d20 sem `+n` foi conferido visualmente.
- A p.25 sobrepõe os limites 90 e 45 PV nas faixas de Adrenalina de Pancadaria.
  As faixas foram preservadas como descrição, sem escolher uma precedência.
- O quadro de Roy como aliado (p.27) não fornece custo/ação para Medicina do Roy.
  Não foi inventado um custo. Sua ação de ficha, Prestar Socorro, é Padrão.
- Chloe usa DT 21 e gratuidade até 6 PE por conjuração para Nuvem de Cinzas.
  Essa regra particular não altera o ritual dos personagens.
- A descrição da trilha cita aliados na p.170 do livro base; o item drone cita
  p.171. A divergência de referência foi mantida nesta auditoria.
- Pistola Taser é uma arma própria, distinta do taser operacional já existente;
  o limite de atordoar uma vez por alvo/cena não foi aplicado retroativamente
  ao item antigo. A alternativa sugerida pelo texto continua decisão da mesa.
- O capítulo de OP RPG 2 se declara ensaio de playtest (p.52). Seus perfis,
  atributos, dados e progressão não são errata do sistema atual.

## Outros contextos mecânicos

- Analisar Perigo (p.38): uso treinado de Tática, movimento, DT 15; +2 em testes
  e Defesa até o fim do próximo turno, +1 por 5 excedentes, uma vez por cena.
- Regalias de veículo (p.42): Central de Drones (+5 em Tecnologia para operar e
  guardar/pegar um drone como livre uma vez por rodada), Estação de Armas
  (suporte para arma de fogo de duas mãos, sem penalidade por veículo em
  movimento e sem cobertura para o operador) e Lançadores de Fumaça (movimento,
  uma vez por cena, efeito de granada de fumaça). São configuradas como regalias do veículo na Mesa de operações, sem virarem itens soltos.
- Material de história, missões, tabelas de personalidade/aparência, medalhas,
  dicas para mestre e mural não viraram opções mecânicas de personagem.
- Evolução Modular continua fora da progressão padrão. O classificador legado
  não recebe classificações adivinhadas para os poderes novos.

## Validação

`tests/as9-regression.mjs` verifica os dados de referência, patamares de NEX,
escolhas, recálculo idempotente de CQB, custos, uso/desfazer, categorias de drone,
Defesa/resistências e persistência pelo codec existente. A regressão da criação
foi ampliada para os dois pares da origem e as duas trilhas.

- `npm run check`: 63 arquivos JavaScript aprovados.
- `npm test`: 84 testes aprovados, nenhuma falha, nenhum teste ignorado.
- `git diff --check`: sem erros de whitespace.
- Navegador local: origem e trilha Incursor presentes no seletor; os dois pares
  de treinamento aplicam a seleção e bloqueiam perícias repetidas na classe.
  Uma falha de ligação do evento, encontrada na conferência visual, foi
  corrigida e recebeu regressão de clique/alteração.
- Ameaças: 196 fichas exibidas; busca por Ryder e ficha de Status conferidas
  contra os valores do PDF.
- Ícones: cobertura de todos os 252 itens passou no teste de arte, com os 165
  sprites originais preservados. Melhorias/modificações: 74 registros ao todo.
- Parâmetros de versão propagados pelos importadores para atualizar o cache.

Esta seção registra o checkpoint da integração dos catálogos. A validação
atual das ações automatizadas está em [as09-automation.md](as09-automation.md).
