# Auditoria de Ameaças (fichas de mestre)

Pedido do usuário: uma aba "Ameaças" no site, separada da criação/ficha de
personagem, catalogando as ameaças de todos os livros com ficha de combate
completa (atributos, defesas, perícias, ações) para o mestre consultar na
mesa. Trabalho intencionalmente fatiado por livro e por seção — não sai
numa passada só. Cada fatia é um commit isolado, testado antes do próximo,
igual à integração dos Arquivos Secretos.

**Decisão de design registrada em 17/09/2026**: sem foto do livro nem
pesquisa de imagem na internet (risco de direitos autorais que o usuário
inicialmente aceitaria assumindo o repositório privado, mas descartou ao
saber que "privado" no GitHub Pages exige convidar cada colega como
colaborador, não só compartilhar um link). Pixel art original também foi
descartada por decisão do usuário — mais simples: cada ameaça mostra
apenas **o glifo do elemento** (o mesmo símbolo reaproveitado do resto do
site), sem retrato próprio.

## Método de extração (para continuar em sessões futuras)

Os PDFs em `D:\Livros OP\` excedem os 100 MB do limite de extração de
texto da ferramenta Read, mesmo pedindo uma página só. `pymupdf` (import
`fitz`) já está instalado no ambiente e não tem esse limite — use
`scripts/pdf-read.py` (commitado no repo, não deixa arquivo temporário):

```
python scripts/pdf-read.py find "D:\Livros OP\ordem-paranormal-rpg-v1-3-lyfxjj.pdf" "NOME DA AMEAÇA"
python scripts/pdf-read.py render "D:\Livros OP\ordem-paranormal-rpg-v1-3-lyfxjj.pdf" <pagina> "<scratchpad>/pagina.png" 2.5
```

Depois **leia o PNG com a ferramenta Read** — não confie só no texto
extraído para os números da barra lateral. Duas armadilhas encontradas:

1. **Numeração de página do PDF ≠ número impresso.** Para o livro base
   v1.3, página impressa = página do PDF − 9. Confirme de novo se abrir
   um arquivo diferente (renderize uma página, compare com o rodapé).
2. **O bônus de teste usa um ícone de d20, não um "d20" escrito.** Quando
   o bônus é +0, o livro não escreve "+0" — mostra só o ícone sozinho.
   Isso engana a extração de texto (parece que o número "sumiu"), mas na
   verdade é um `+0` legítimo. Só percebi isso comparando a extração de
   texto com o render visual da mesma página lado a lado.

Todo número vai para `threats.js` como `{ dice, bonus }` via o helper
`test(dice, bonus)` — nunca um valor solto, para não confundir com um
texto/decoração.

## Estrutura no código

- `threats.js` — catálogo (`THREATS`, helper `threat({...})`).
- `app.js` — `renderThreats()` (lista com abas de elemento + busca) e
  `renderThreatSheet(id)` (ficha com abas Status/Combate/Descrição),
  ligados às rotas `#ameacas` e `#ameacas/<id>`.
- Nenhum texto do livro é reproduzido: `descricao` é sempre um resumo em
  redação própria; as ações usam o resumo mecânico, nunca o parágrafo
  original.

## Progresso — Livro base

Capítulo 7 (fichas de ameaças), páginas do PDF 186–303 (impressas
177–294): `CONSTRUINDO COMBATES` (177) → `FICHAS DE AMEAÇAS` (178) →
`CRIATURAS DE SANGUE` (182) → `CRIATURAS DE MORTE` (208) →
`CRIATURAS DE CONHECIMENTO` (232) → `CRIATURAS DE ENERGIA` (256) →
`AMEAÇAS DA REALIDADE` (283, a confirmar) → `PERIGOS` (290, fora do
escopo — tabela de mestre, não uma ameaça catalogável) → capítulo 8
(294).

| Seção | Catalogadas | Situação |
|---|---|---|
| Sangue | 12 de 12 | **Completa em 17/09/2026**: Aberração de Carne (p.182), Aniquilação (p.185), Carente (p.188), Dama de Sangue (p.190), Enpap-X (p.192), Kerberos (p.194), Minotauro (p.197), Mulher Afogada (p.199), Titã de Sangue (p.201), Zumbi de Sangue (p.202), Zumbi de Sangue Bestial (p.203), O Diabo (p.205). |
| Morte | 12 de 12 | **Completa em 17/09/2026**: Esqueleto de Lodo (p.208), Aracnasita (p.208), Carniçal Preto da Morte (p.210), Ceifador Espiral (p.212), Enraizado (p.214), Escutado (p.215), Marionete (p.218), Múmia Xipófaga (p.220), Nidere (p.222), Sempiternal (p.225), Succ (p.227), O Deus da Morte (p.230). |
| Conhecimento | 12 de 12 | **Completa em 17/09/2026**: Existido (p.232), Anjo (p.233), Bicho-Papão (p.236), Espreitador (p.238), O Comunicador (p.239 — nome real é uma sequência de símbolos impronunciável no livro; batizei funcionalmente), Lembrado (p.243), Ocioso (p.244), Parasita de Culpa (p.245), Rastejador Sombrio (p.248), Silhueta (p.250), Vulto (p.251), Máscara do Desespero (p.253, Enigma de Medo na p.255). |
| Energia | 12 de 12 | **Completa em 22/09/2026**: Anárquico (p.257), Anárquico Descontrolado (p.259), Ciborgue (p.265), Perturbado de Energia (p.268), Sukkalgir (p.269), Viajante (p.274), Anomiático (p.262), Infecticídio (p.266), Telopsia (p.270), Anomalia (p.261), Tempestuoso (p.272), O Anfitrião (p.276, VD 413 — quebra o padrão de múltiplos de 20 de propósito, é tema visual de glitch da própria ficha). |
| Medo | 1 (fora de seção própria) | **Degolificada** (p.282) — a única ameaça de Medo *primário* encontrada até agora nos capítulos catalogados; as demais têm Medo só como elemento secundário. Fecha o capítulo de criaturas paranormais antes de "Ameaças da Realidade" começar, e tem os quatro outros elementos (Sangue/Morte/Conhecimento/Energia) como secundários — parece ser um "resumo" proposital do capítulo inteiro. |
| Realidade (mundana) | 18 de 18 | **Completa em 22/09/2026**: Bandido (p.284), Capanga (p.284), Soldado de Aluguel (p.284), Assassino (p.285), Comandante Mercenário (p.285), Iniciado (p.286), Investido (p.286), Líder de Culto (p.286), Policial (p.287), Policial de Elite (p.287), Chefe de Polícia (p.287), Cão de Guarda (p.288), Enxame de Abelhas (p.288), Enxame de Ratos (p.288), Jacaré (p.288–289), Javaporco (p.289), Onça-Pintada (p.289), Sucuri (p.289). Fecha o capítulo 7 do livro base — próxima entrada é "PERIGOS" (p.290, tabela de mestre, fora do escopo). |

**Lição aprendida catalogando Sangue**: o primeiro escaneamento
automático da seção (por regex de "VD") errou a contagem — a página do
Kerberos (194) tem o nome num tratamento gráfico que não extrai como
texto, então o script achou o VD mas não o nome, e eu quase concluí que
era continuação da criatura anterior (Enpap-X). Só renderizando cada
página como imagem e olhando é que apareceu. **Não confiar em scan de
texto para decidir quantas criaturas uma seção tem — sempre renderizar
e olhar página por página**, mesmo que pareça repetitivo.

**Lição aprendida catalogando O Diabo (Sangue)**: uma ameaça de VD alto
pode ter a ficha de ações e o Enigma de Medo **numa página seguinte**,
separada da página com a barra lateral de atributos — só percebi porque
fui conferir o índice de "CRIATURAS DE" antes de começar Morte e vi uma
entrada "ENIGMA DE MEDO" numa página que eu não tinha renderizado. O
Diabo original ficou faltando 3 ações (Senhor do Sangue, Pacto, Desejos
de Sangue) e um Enigma de Medo bem mais rico do que o que eu tinha
registrado — corrigido depois de reler a p.207. **Para ameaças fortes
(VD 300+) ou com caixa "ENIGMA DE MEDO" faltando, sempre renderizar
também a página seguinte antes de considerar a ficha completa.**

Quatro ameaças (Aniquilação, O Diabo, Ceifador Espiral, Sempiternal,
O Deus da Morte) não têm limite de NEX na Presença Perturbadora —
afetam qualquer agente, independente do NEX. Isso é dado real do
livro, não uma lacuna: o schema trata `imuneDesdeNex: null` como
"nenhum NEX concede imunidade", e a UI já mostra essa frase em vez de
inventar um número.

**A cadeia de Enigmas de Medo entre os "chefes" de cada elemento se
confirmou por completo catalogando Energia — é um ciclo fechado de
4 pontas, de propósito:** O Diabo (Sangue) só cai pra uma manifestação
de Morte equivalente; o Deus da Morte (Morte) confirma isso e só cai
pro caos do Anfitrião; o Anfitrião (Energia) só pode ser enfrentado
sob a proteção do Equilíbrio, que só a Máscara do Desespero oferece; e
a Máscara (Conhecimento) cai pra brutalidade do próprio Diabo — fechando
o ciclo Sangue → Morte → Energia → Conhecimento → Sangue. Não é preciso
mais tratar essas referências cruzadas como estranhas ou como possível
erro de leitura.

**Achado extra em Energia: "O Anfitrião" tem VD 413 e PV 1413** — os
únicos números desta sessão inteira que não são múltiplos de 20 (todo
o resto do catálogo é). Não é erro de leitura: o design gráfico da
ficha inteira do Anfitrião é temático de "glitch" (nome estilizado
"4NFITRIÃO", texto corrompido tipo "HA4HA4HA4"), e os números glitchados
combinam com isso. Também é a primeira ameaça catalogada com mecânica
de fases (Ato 1: 5 "facetas" nomeadas — Amphitruo, Aeneas, Liber,
Silenus, Plautus — cada uma só podendo usar habilidades com seu próprio
nome; Ato 2: forma única com 3 ações padrão por rodada).

**Achado extra: "Degolificada" é a primeira ameaça de Medo *primário*
do catálogo.** Até agora Medo só aparecia como elemento secundário
(Aracnasita, Ceifador Espiral, Anjo etc.). A Degolificada tem Medo como
elemento principal e os quatro outros elementos do jogo como
secundários — está posicionada no fim do capítulo de criaturas
paranormais, antes de "Ameaças da Realidade" começar, funcionando como
um fechamento simbólico do capítulo inteiro.

**Achado de schema: a "Anomalia" (Energia) não tem Defesa nem
Percepção/Iniciativa nem os atributos AGI/FOR/VIG** — o livro marca
esses campos com "—" porque ela "não faz testes e não age da mesma
maneira que outras criaturas". O `threat()` helper já aceita `null`
para `defesa`/`percepcao`/`iniciativa` (a UI mostra "—") e aceita a
string `"—"` como valor de atributo quando o livro não define um
número — nunca inventar um 0 ou qualquer valor só para preencher o
campo.

Sempiternal é a única ameaça catalogada até agora cujo "machucado" não
é simplesmente metade dos PV (990 PV, mas 445 machucado, não 495) — o
`threat()` helper computa a metade por padrão, mas aceita
`machucadoEm` explícito pra sobrescrever quando o livro diz outro
valor. Sempre conferir esse número, não assumir a fórmula.

O Deus da Morte confirma, por referência cruzada, minha leitura do
Enigma de Medo do Diabo desta sessão: sua habilidade "Destruir o
Diabo" diz que ele é "a única coisa capaz de causar a solução do
Enigma de Medo do Diabo" — bate exatamente com a pista de que a
resposta para derrotar o Diabo está numa "manifestação de Morte com
força equivalente" a ele.

**Achado catalogando Conhecimento — a cadeia de Enigmas de Medo entre os
"chefes" de cada elemento é real e intencional no livro, não coincidência:**
O Diabo (Sangue) só é derrotado por uma manifestação de Morte equivalente
a ele; o Deus da Morte (Morte) confirma isso com a habilidade "Destruir o
Diabo"; a Máscara do Desespero (Conhecimento) pode ser derrotada pela
brutalidade do próprio Diabo *ou* abalando o Equilíbrio pelo Medo; e a
Máscara, por sua vez, é a única capaz de resolver o Enigma de Medo de
"O Anfitrião" — uma ameaça ainda não catalogada, quase certamente o
"chefe" da seção de Energia (a próxima). Vale conferir essa referência
cruzada ao catalogar Energia, e não tratá-la como um erro se aparecer.

Repete-se o padrão já visto no Diabo: **Máscara do Desespero também
tinha o Enigma de Medo de verdade numa página seguinte** (p.255) — a
p.254 só tinha uma habilidade passiva mencionando o enigma de raspão
("Destronar o Anfitrião"), sem detalhar o dela própria. Sempre checar a
página seguinte de um "chefe" (VD 350+) antes de fechar a ficha.

Também nesta leva: "O Comunicador" é o nome que dei a uma ameaça cujo
nome verdadeiro, no livro, é escrito inteiramente numa fonte de símbolos
alienígenas impronunciáveis (decisão de design do próprio livro, não
falha de extração) — não é um nome inventado, é só um rótulo funcional
pra caber no catálogo.

**Ameaças da Realidade usam um template totalmente diferente das criaturas
paranormais** — bloco de texto compacto, sem sidebar, sem Presença
Perturbadora nem Enigma do Medo (faz sentido: não são paranormais). Três
rótulos de categoria confirmados visualmente (nenhum é "Criatura"):
`"Pessoa"` (humanos — Bandido, Capanga, Soldado de Aluguel, Assassino,
Comandante Mercenário, Iniciado, Investido, Líder de Culto, Policial,
Policial de Elite, Chefe de Polícia), `"Animal"` (Cão de Guarda, Jacaré,
Javaporco, Onça-Pintada, Sucuri) e `"Animal (Enxame)"` (Enxame de Abelhas,
Enxame de Ratos — categoria nova, sem precedente). `element: "Realidade"`
é o balde do jogo para todas — confirma o que `THREAT_ELEMENT_ORDER` já
sugeria. Adicionado o glifo próprio de "Realidade" em `app.js`
(`ELEMENT_GLYPHS.realidade`, um contorno de globo) — antes disso as
fichas mundanas caíam no círculo genérico de fallback.

**Achado de schema, resolvido em 22/09/2026**: o padrão de deslocamento
extra (nadar/voar/escalar) recorreu tanto — 5 das 18 ameaças de
Realidade e depois as 3 de Sangue de Sobrevivendo ao Horror inteiras —
que virou um campo de verdade: `deslocamentosExtras: [{ tipo, metros,
quadrados }]` no `threat()` (`threats.js`) e uma linha extra por entrada
na caixa "Deslocamento" da aba Status (`app.js`). As 5 entradas de
Realidade que usavam o workaround em `habilidadesPassivas` foram
migradas para o campo novo. Cada tipo de deslocamento (Escalada,
Natação, Voo) vira uma entrada própria mesmo quando o livro escreve os
dois juntos ("escala e nada a Xm"), porque a Mescla (Sobrevivendo ao
Horror) provou que os dois podem ter valores diferentes entre si
(Escalada 12m, Voo 9m) — uma string combinada não bastaria.

**Duas ameaças sem nenhuma ação com teste**: Enxame de Abelhas e Enxame
de Ratos causam dano 100% automático pela habilidade passiva "Enxame"
(sem rolagem de ataque) — primeira vez que `acoes: []` aparece no
catálogo. Não é uma lacuna, é fiel ao livro.

**Achado tipográfico**: esta seção confirmou visualmente o primeiro
bônus negativo do catálogo (`test(1, -2)`, Fortitude do Enxame de
Abelhas) — o livro coloca o sinal de menos antes do ícone de dado nesse
template, diferente do "+0" sem sinal visto nas criaturas paranormais.
`formatTest()` já suporta bônus negativo sem mudança de código.

## Progresso — Sobrevivendo ao Horror

PDF `D:\Livros OP\sobrevivendo-ao-horror-v1.2.pdf` (~84MB). **Offset de
página diferente do livro base**: aqui página impressa = página do PDF
− 1 (no livro base era −9 — confirmar sempre de novo por livro, nunca
assumir). Capítulo 3 "AMEAÇAS PARANORMAIS" começa no PDF 126 / impressa
125, com exatamente **12 criaturas seguidas, sem divisão visual por
elemento** (diferente do livro base) — o elemento primário de cada uma
só aparece na cor da barra do cabeçalho da própria ficha, então é
preciso renderizar e ler cada uma individualmente para saber a qual
elemento pertence. Categoria confirmada: `"Criatura"` (igual ao livro
base). O usuário pediu para catalogar este livro na mesma ordem do
livro base: Sangue → Morte → Conhecimento → Energia → Realidade, um
lote/commit por elemento.

| Elemento | Catalogadas | Situação |
|---|---|---|
| Sangue | 3 de 3 | **Completa em 22/09/2026**: Mescla (VD 60, p.129), Derretido (VD 80, secundário Energia, p.135), Quibungo (VD 160, p.143). |
| Morte | 3 de 3 | **Completa em 22/09/2026**: Sepultado (VD 20, p.127), Memento Mori (VD 260, secundários Conhecimento/Medo, p.149), Amigo Imaginário (VD 360, p.156 — ver decisão de elemento abaixo). |
| Conhecimento | 3 de 3 | **Completa em 22/09/2026**: Melancolia (VD 140, Minúsculo, secundários Sangue/Morte/Medo, p.140), Rascunho (VD 300, secundário Energia, p.151), Medusa (VD 320, secundário Morte, p.153). |
| Energia | — | Não iniciado. |
| Realidade | — | Não iniciado; este livro tem uma seção própria "Novas Ameaças da Realidade" começando por volta da p.158 (depois de Amigo Imaginário), fora do capítulo 3 — confirmar estrutura ao chegar lá. |

**Decisão registrada: Amigo Imaginário (VD 360, p.156–157) catalogado
como `element: "Morte"`, `secondaryElements: ["Sangue", "Medo"]`.** A
ficha não tem a barra colorida de elemento primário que toda outra
criatura do capítulo tem — Morte e Sangue aparecem como tags do mesmo
peso visual, e o texto de abertura (p.154) diz que ela foi "gerada
conjuntamente pelas entidades de Sangue e Morte" (duas origens
nomeadas, sem uma se sobrepor à outra); imunidades, tags e o dano da
ação "Derreter" são 50/50 entre os dois. Medo não entra como candidato
a primário: a própria ficha o trata como *sustento* ("alimentado pelo
medo"), não origem, e nenhuma habilidade ou dano é tipado como Medo.
Motivo do desempate escolhido a favor de Morte: a ordem impressa das
tags no livro é sempre "MORTE ◆ SANGUE ◆ MEDO" (Morte primeiro — mesmo
padrão de ordem intencional já visto na Degolificada do livro base), e
narrativamente ela fecha o capítulo logo após o Memento Mori (também
Morte, VD 260 → 360), como uma escalada dentro do mesmo elemento. É uma
decisão de categorização, não uma invenção de número — o livro não dá
um primário explícito, e Sangue seguiria sendo uma escolha igualmente
defensável se algum dia precisar reabrir isso.

**Espectro Inesquecido (Energia, p.130–133) não é uma ficha fixa** — o
livro dá uma fórmula (VD = 4×NEX) para transformar um PC/NPC "Marcado"
morto numa ameaça, com uma tabela de escala e só um exemplo construído
(NEX 55%, VD 220) pra ilustrar. `threat()` não tem hoje como
representar "gerador de ficha" em vez de uma ficha fixa — decidir a
abordagem ao catalogar Energia.

**Achados do lote de Conhecimento**: Melancolia é a primeira ameaça
catalogada sem `acoes` alguma (`[]`) — é um parasita puro, sem ataque
listado, só a infecção progressiva de "Parasitose Melancólica". Também
é a primeira com um teste de **0 dados** (`test(0, 5)`, Fortitude) —
confirmado visualmente em crop de alta resolução, não é um dígito
cortado. O Enigma de Medo dela fica isolado numa página ilustrada
separada, sem o cabeçalho de ficha — fácil de pular ao escanear só a
página com a barra lateral. Rascunho (VD 300) e Medusa (VD 320), apesar
do VD alto, **não têm** Enigma de Medo no livro — nem toda ameaça forte
ganha um, confirmar sempre pela página em vez de assumir pelo VD.

## Ordem de continuação sugerida

1. **Sobrevivendo ao Horror — Morte**, depois Conhecimento, Energia e
   Realidade, nessa ordem (pedido explícito do usuário). Mesmo método
   de sempre.
2. Arquivos Secretos #1–7 (nenhum inventariado ainda para ameaças;
   `docs/content-audit.md` já mapeou *onde* estão as ameaças de cada AS,
   mas não suas fichas mecânicas).

## Novo fluxo de trabalho (a partir de 22/09/2026)

A extração e transcrição de cada seção passou a ser delegada a um
subagente (`Agent` tool, `general-purpose`) com um prompt autocontido
(schema exato, exemplo real do `threats.js`, as armadilhas de extração
já documentadas acima, regras de direitos autorais). O subagente só
pesquisa e devolve os blocos `threat({...})` prontos no relatório final
— não edita arquivos. A thread principal revisa o retorno, confere
contra as convenções já existentes no arquivo (grep por campos como
`pericias:`/`resistencias:` para confirmar o formato antes de aceitar),
integra, roda os testes e publica. Motivo: manter as imagens renderizadas
do PDF (o maior custo de tokens da extração) fora do contexto principal,
para não estourar o limite de uma sessão no meio de um lote — não muda o
resultado final nem a precisão, só onde o trabalho pesado acontece.
