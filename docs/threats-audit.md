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
| Energia | 3 de 3 | **Completa em 22/09/2026**: O Uivar (VD 100, p.137), Profundo (VD 200, secundário Sangue, p.147), Espectro Inesquecido (VD 220, exemplo NEX 55% de uma ficha de fórmula — ver nota abaixo, p.133). Fecha o capítulo 3 inteiro deste livro. |
| Realidade | 17 de 17 | **Completa em 22/09/2026**: "Novas Ameaças da Realidade" (p.158–165, logo após o capítulo 3) — mesmo template exato do livro base (Pessoa/Animal/Animal (Enxame), sem sidebar paranormal). 9 Pessoa (Bêbado Local, Burocrata, Fazendeiro Isolado, Investigador, Médico, Religioso, Predador Sofisticado, Caçador de Gente, Artista da Morte) + 7 Animal (Ariranha, Cavalo, Gorila, Leão, Lobo, Touro, Urso Pardo) + 1 Animal (Enxame) (Enxame de Tocandiras). **Fecha Sobrevivendo ao Horror por completo (96 ameaças no catálogo).** |
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

**Achados do lote de Energia — Espectro Inesquecido (fórmula VD=4×NEX,
exemplo catalogado em NEX 55%/VD 220)**: chamou atenção que o dano/DT
impresso da ação "Aterrorizar" (`2d8`/`DT 15`) é o valor da primeira
faixa da Tabela 3.1 (VD 20-40), não da faixa correta pra VD 220
(180-300 → `6d8`/`DT 35`, que é o valor usado corretamente na Presença
Perturbadora do mesmo bloco). Parece um erro de diagramação do próprio
livro (esqueceram de recalcular esse campo específico pro exemplo).
**Mantido como está impresso** (2d8/DT15), sem "corrigir" pra bater com
a tabela — não é papel do catálogo inferir a intenção do livro, só
registrar o que ele mostra; a divergência fica documentada aqui pra não
ser confundida com erro de leitura no futuro. A tabela de escala
completa (5 faixas de VD, cada uma com DT, dano mental, bônus de
Defesa/resistência, multiplicador de PV e dano extra de arma) está
preservada no relatório do subagente que gerou este lote, não
incorporada ao schema — é usada só pra essa uma ficha de exemplo.

**Campo sem equivalente no schema, não criado**: o bloco do Espectro
Inesquecido também imprime "Pontos de Esforço 66", um valor de PE que
nenhuma outra ameaça do catálogo (79 até aqui) já teve — normal, é a
única ameaça que é literalmente um PC/NPC convertido, então herda um
stat de PC. Não criei um campo `pontosDeEsforco` pra uma ocorrência
única; o número não foi perdido, só ficou de fora da ficha publicada.
Se aparecer de novo (ex.: outro "convertido" nos Arquivos Secretos),
vale promover a campo de verdade, mesmo padrão usado pra
`deslocamentosExtras`.

**Achado de UI corrigido**: O Uivar é a primeira ameaça sem nenhum
deslocamento terrestre — só voa, `deslocamentoMetros`/`Quadrados: null`
com `deslocamentosExtras: [{ tipo: "Voo", ... }]`. A caixa de
Deslocamento em `app.js` assumia esses dois campos sempre numéricos e
ia imprimir "nullm · null quadrados"; corrigido pra só mostrar a linha
principal quando `deslocamentoMetros != null`, deixando só a linha de
Voo aparecer nesse caso.

**Sobrevivendo ao Horror está catalogado por completo**: 29 ameaças
(12 paranormais do capítulo 3 + 17 mundanas de "Novas Ameaças da
Realidade"), somadas às 67 do livro base = **96 ameaças no catálogo**.
O template de "Novas Ameaças da Realidade" bateu 100% com o do livro
base — mesma categoria (Pessoa/Animal/Animal (Enxame)), mesmo formato
sem sidebar paranormal, sem surpresa de schema.

## Progresso — Arquivos Secretos #1

PDF `D:\Livros OP\Arquivos-Secretos-01-v1-2.pdf` (~32MB, 75 páginas) —
**livro nunca explorado neste projeto antes, nem para este catálogo
nem para nenhum outro** (`docs/content-audit.md` só cobre AS#3–7,
apesar do que a seção anterior deste arquivo dizia — corrigido aqui).
**Offset de página = 0** (impressa = índice do PDF, sem deslocamento —
diferente dos dois livros anteriores). Estrutura: capa/sumário (1–7),
conto "Agatha" sem fichas (8–19), capítulo **"Os Transtornados"**
(20–41, o culto de Sangue liderado por Giovanni Opspor — 8 fichas),
"Ritos & Maldições" — conteúdo majoritariamente de jogador, só 1 ficha
de ameaça (Anulado, p.53), e o bônus "A Volante e o Cangaceiro" (2
fichas, Cleo Brisa e Cristino, que o livro deixa explícito que **não**
são Transtornados). **11 ameaças catalogadas em 22/09/2026**: Assecla
(p.28), Investido — renomeado "Investido (Transtornados)" (p.29),
Apóstolo do Sangue (p.30), Giovanni Opspor (p.33), Mosto (p.35),
Tarrafa (p.37), Carrara (p.38), Nando Salles (p.39), Anulado (p.53),
Cleo Brisa (p.69), Cristino (p.71). **107 ameaças no catálogo.**

**Decisão registrada: nenhuma das 10 fichas "Pessoa" tem elemento
impresso na ficha** (diferente de toda ameaça mundana catalogada até
aqui, que também não tem elemento impresso, mas aqui existe uma
tentação real de inferir um pela afinidade de rituais/dano dos
Transtornados de Sangue). Optei por manter a convenção já estabelecida
no catálogo — **toda ficha "Pessoa"/"Animal"/"Animal (Enxame)" usa
`element: "Realidade"`, sem exceção**, mesmo quando o personagem
conjura rituais de um elemento específico (mesmo padrão já usado para
Iniciado/Investido/Líder de Culto do livro base, que também conjuram
rituais sem terem elemento próprio). Só "Anulado" (categoria
"Criatura", com a tag elemental de fato impressa na ficha) ficou com
`element: "Sangue"`, `secondaryElements: ["Conhecimento"]`.

**"Transtornado" não existe como rótulo de categoria** — toda ficha do
capítulo usa literalmente "PESSOA" no cabeçalho, igual às ameaças
mundanas já catalogadas. A expectativa de uma categoria própria não se
confirmou; o culto é só o tema narrativo do capítulo, não uma categoria
de jogo.

**Renomeação deliberada, não um dado do livro**: "Investido" já existe
no catálogo (livro base, VD 40, p.286, cultista genérico de qualquer
elemento). O Investido dos Transtornados (VD 80, só Sangue) tem nome
idêntico no livro, mas é uma ficha mecanicamente diferente — como os
dois caem na mesma aba "Realidade" e apareceriam lado a lado na lista
com o mesmo nome, renomeei esta entrada para **"Investido
(Transtornados)"** só para diferenciação na interface. Não é uma
invenção de dado do jogo, é uma etiqueta de catalogação — igual ao "O
Comunicador" do livro base (nome funcional para uma ficha cujo nome
real é ilegível).

**Achado tipográfico confirmado**: quando o ícone de d20 aparece
completamente sozinho, sem nenhum dígito antes E sem nenhum "+N" depois
(nem "+0"), o valor é `test(0, 0)` — zero dados, zero bônus. Já
tínhamos `test(0, N)` (Melancolia) e bônus/dados negativos, mas esta é
a primeira vez que os dois lados ficam zerados ao mesmo tempo. Confirma
que a leitura visual do ícone precisa checar os dois lados
independentemente, nunca assumir que "sem dígito visível" significa
"1 dado" por padrão.

**Achado de schema, resolvido sem mudar o código**: armas com dano
"base + elemento" (ex.: arpão do Tarrafa, "corte normal + 1d6 de
Sangue ao acertar") não cabem no par único `dano: {formula, tipo}` de
`ataques`. Resolvido colocando o bônus extra como uma frase na
`descricao` da própria ação — `app.js` já renderiza `acao.descricao`
logo abaixo da lista de `ataques` (não é um `if/else` excludente, os
dois aparecem juntos), então não precisou de mudança de código, só
seguir o padrão já existente.

## Progresso — Arquivos Secretos #2

PDF `D:\Livros OP\Arquivos-Secretos-02.pdf` (~80MB, 108 páginas) — tema
"Hexatombe". **Offset de página = 0** (igual ao AS#1). Estrutura: regras
de arena sem fichas (4–25), **Ameaças do Hexatombe** (26–33, 6 fichas:
3 pares animal-mundano/corrompido-de-Sangue — Arara e Felino — cada um
com uma terceira forma "infernal" mais forte), **Os Mascarados**
(34–93, 17 fichas: 5 pares assassino/"desperto" via habilidade
"Intenção Assassina" + 5 agentes avulsos da Ordo Realitas + o par
Sacrifício Juan/Juan Diabólico), resto sem fichas. **23 ameaças
catalogadas em 22/09/2026 — 130 ameaças no catálogo.**

**Achado real do livro, preservado como impresso**: a ficha da p.32
tem o título grande e todo o conteúdo do "Felino-infernal", mas a
caixinha pequena de categoria no topo diz "Arara-infernal" — erro de
diagramação do próprio livro (confirmado comparando com o PV, que
diverge do PV real da Arara-infernal na p.28). Catalogada como
"Felino-infernal" (nome real, pelo título e conteúdo), com este erro
documentado aqui em vez de silenciosamente ignorado.

**Colisão de nome dentro do próprio livro**: as duas formas de um dos
Mascarados são chamadas de "Labirinto" nas duas páginas (62 e 64) —
diferente dos outros 4 pares, que sempre trocam de nome na
transformação. A forma desperta (VD 140) foi catalogada como
"Labirinto (Desperto)" para diferenciar na interface — mesmo tipo de
etiqueta de catalogação já usado no "Investido (Transtornados)" do
AS#1, não um dado do livro.

**`machucadoEm` fora da fórmula**: Felino-infernal tem PV 230 mas
Machucado 125 impresso (não 115, a metade) — preservado como está.

**Confirma de novo a convenção de elemento**: todas as 17 fichas
"Pessoa" de Mascarados/agentes usam `element: "Realidade"`, mesmo as
que causam dano tipado (Dalmo/Colosso = Energia, Jae-Yoon/X =
Conhecimento, Kemi/Fantasma = Morte, Juan/Juan Diabólico = Sangue) —
a regra já fixada no AS#1 seguiu firme sem exceção neste lote.

## Progresso — Arquivos Secretos #3

PDF `D:\Livros OP\Arquivos-Secretos-3-v-1-0.pdf` (~63MB, 142 páginas).
**Offset de página = 0** (igual a AS#1 e AS#2). `docs/content-audit.md`
já tinha a localização de 18 fichas neste livro (de uma auditoria
anterior focada em opções de personagem, não em ameaças) — usado como
atalho, mas cada página ainda foi renderizada e lida visualmente antes
de aceitar, e o total de 18 foi reconfirmado por varredura de texto
própria (nenhuma ficha de categoria "Criatura"/"Animal" existe neste
livro — as 18 são todas "Pessoa"). **18 ameaças catalogadas em
22/09/2026 — 148 ameaças no catálogo.** Três grupos temáticos: banda
PSIKOLERA (Alê, Caio, Eloy, Franco, Cindy, mais o roadie Caíto — p.11
a 41), o culto de Escarlata (Ana, Argano, Chispa, Torvo, Escarlata,
Miasma — p.47 a 73) e um bando de caçadores com nomes de aves (Coruja,
Corvo, Papagaio, Pomba, Harpia, mais Suellen — p.81 a 105).

**Erro do próprio livro preservado, não corrigido silenciosamente**: a
habilidade "Hora do Show" da Alê (p.11) imprime bônus de Defesa/PV que
não batem com a matemática da própria ficha (+10 Defesa vira "26" em
vez do correto 28; +20 PV vira "90" em vez do correto 65) — os números
impressos batem exatamente com os totais corretos da Eloy, sugerindo
cópia-e-cola do editor entre as duas fichas da banda. Mantido o valor
impresso (26/90) com uma nota entre parênteses na própria `descricao`
da habilidade explicando a divergência, para não ser confundido com
erro de leitura no futuro. Os outros 4 membros da banda batem certinho
com a própria matemática.

**Rótulo alternativo de DT**: Coruja e Corvo (p.81, 88) imprimem o
cabeçalho de rituais como "CD 20" em vez de "DT 20" — único caso no
livro. Normalizado para "DT 20" no catálogo, com uma nota no próprio
texto da habilidade explicando a variação impressa.

**Primeiro bônus zero-dados-negativo do catálogo**: Argano (p.51) tem
Percepção e Vontade em `test(0, -2)` — zero dados de teste combinados
com um bônus negativo, confirmado visualmente.

## Progresso — Arquivos Secretos #4

PDF `D:\Livros OP\Arquivos-Secretos-04-v1.0.pdf` (~29MB, 79 páginas).
**Offset de página = 0** (igual a AS#1/#2/#3). `docs/content-audit.md`
apontou a faixa 55–61 (Assistente de Produção, Produtor, Diretor,
Simulacro) de uma auditoria anterior; confirmado por varredura própria
que não há mais nada catalogável no livro (páginas 76–78, também
achadas por aquela auditoria, são só orientação ao mestre para
reaproveitar ameaças já publicadas noutros livros, sem ficha nova). Ao
contrário do AS#1/#2, não há fichas bônus escondidas fora do capítulo
principal — o livro inteiro é estruturado como uma missão sala-a-sala.
**7 ameaças catalogadas em 22/09/2026 — 155 ameaças no catálogo.**

**Decisão de representação: "Simulacro" virou 4 entradas, não 1.** O
livro imprime uma ficha base (categoria Criatura, elemento Energia/
Conhecimento, estágio "troyan") com uma caixa "Forma Evolutiva" que dá
os números completos e explícitos de três estágios seguintes (krypto,
vvorm, botnetz) — VD, PV, Defesa, atributos, testes e a ação
"Perturbação Digital" recalculados a cada estágio, não uma fórmula de
escala como o Espectro Inesquecido de Sobrevivendo ao Horror (que só
tinha UM exemplo numérico, daí ter virado uma entrada só). Como todos
os quatro estágios têm números completos impressos, viraram 4 fichas
prontas para uso direto na mesa (`Simulacro`, `Simulacro (Krypto)`,
`Simulacro (Vvorm)`, `Simulacro (Botnetz)`) em vez de forçar o mestre a
fazer contas de uma tabela de deltas durante a sessão. Nenhum número
foi inventado — os quatro estágios já são explícitos no livro.

**Achado incomum, preservado como está**: a DT de resistência da ação
"Perturbação Digital" é impressa como um dado rolado, não um número
fixo (`Vontade DT 3d10` no troyan, subindo até `6d10` no botnetz) — já
que não existe campo estruturado para DT de ação neste catálogo (é
sempre texto dentro da `descricao`), isso não exigiu mudança de
schema, só uma nota explicando a peculiaridade dentro do próprio texto
da habilidade.

## Progresso — Arquivos Secretos #5

PDF `D:\Livros OP\Arquivos-Secretos-05-v1.0.pdf` (~26MB, 70 páginas),
tema Alheios (alienígenas). **Offset de página = 0** (igual a AS#1–#4).
`docs/content-audit.md` apontou 36–51 (ameaças) e 66–69 ("perigos
complexos") de uma auditoria anterior. **10 ameaças catalogadas em
22/09/2026 — 165 ameaças no catálogo.**

**"Perigos complexos" (p.66–69) confirmados como fora de escopo, não
catalogados** — Explosão em Contagem Regressiva, Fuga de Horda de
Criaturas, Navio Naufragando, Prédio Ocupado por Criaturas e Chuva de
Sangue não têm PV/Defesa/testes de resistência nem ações de combate;
são desafios de teste estendido (ações do jogador com DTs, tipo
"Correr"/"Desarmar Explosivo"), igual à seção "Perigos" do livro base
que também ficou fora. O "VD" impresso ali é só referência de
dificuldade para o mestre calibrar, não descreve uma ficha.

**Elemento novo do livro: "Transmissão"** — o livro define esse termo
(p.46) como a fusão de Conhecimento e Energia, "pertencem a esses dois
elementos ao mesmo tempo", para as 9 criaturas paranormais do capítulo
(todas exceto Hospedeiro Parasitado, que é "Pessoa"). **Decisão: não
criar uma aba "Transmissão" nova no site** — o jogo tem uma cosmologia
fixa de 4 elementos paranormais + Medo + Realidade, e "Transmissão" é
apresentada pelo próprio livro como uma fusão desses dois, não uma
força independente; criar uma 7ª aba para 9 fichas de um único
suplemento fragmentaria a estrutura sem necessidade. Em vez disso, as 9
usam `element: "Conhecimento"`, `secondaryElements: ["Energia"]` — a
mesma técnica de primário+secundário já usada para toda ameaça
multi-elemento do catálogo. Desempate para Conhecimento como primário:
o próprio livro nomeia "Conhecimento e Energia" nessa ordem na frase
que define Transmissão — mesmo critério de "ordem impressa importa" já
usado para decidir o primário do Amigo Imaginário (Sobrevivendo ao
Horror).

**Hospedeiro Parasitado (p.36) não virou 4 entradas.** O livro dá 4
"perfis" (Acólito, Faz-Tudo, Guerrilheiro, Socorrista) como *variações
parciais* que o mestre aplica sobre a ficha base — trocam alguns
atributos/perícias e no máximo uma ação, mas nenhum redefine VD,
Defesa, Sentidos ou os três testes de resistência (só o Guerrilheiro
redefine PV). É uma ferramenta de mestre sobre uma ficha só, não 4
criaturas com números completos e distintos — diferente do Simulacro
do AS#4. Os 4 perfis foram preservados como texto completo dentro de
uma `habilidadesPassivas` da própria entrada, para não perder a
informação.

**Doppelganger: 3 formas viraram 3 entradas (Civil/Combatente/
Cultista), mas "Monstruoso" não virou uma 4ª.** As três formas nomeadas
têm VD, Defesa, PV, testes e perícias próprios e completos — mesmo
padrão do Simulacro, três entradas. Já "Forma Monstruosa" é só um
pacote de bônus fixo (+10 PV, +2 Defesa, +5 testes, +5 dano, +2 DT) que
qualquer uma das três pode ativar quando ameaçada — sem VD/Defesa/PV
próprios, não é uma criatura à parte. Ficou como a ação "Assumir Forma
Monstruosa" dentro de cada uma das 3 fichas, com o texto do bônus
preservado.

**Achado incomum, mesmo padrão do AS#4**: a DT de "Acionar Explosão"
do Fummu também é impressa como dado rolado (`Reflexos DT 4d10`), não
número fixo — preservada como texto, sem mudança de schema.

## Progresso — Arquivos Secretos #6

PDF `D:\Livros OP\Arquivos-Secretos-06.pdf` (~23MB, 84 páginas, v1.1
com erratas de p.83–84 — nenhuma delas afeta as 11 ameaças, só poderes/
rituais de personagem). **Offset de página = 0** (igual a AS#1–#5).
**11 ameaças catalogadas em 22/09/2026 — 176 ameaças no catálogo.**

**Alice Cruzes/Ketan Arjuna/Laila Verdante/Dr. Neruda confirmadas como
ameaças catalogáveis, não só fichas de aliado.** Cada página do
"Projeto Titanomaquia" (p.28/33/37/41) tem duas colunas: a ficha de
combate completa (VD/Defesa/PV/testes/ações) numa, e uma caixa "Como
Aliado" separada (regalias de recrutamento) na outra — são NPCs que
servem aos dois papéis, não uma coisa só. Catalogadas as quatro.

**Novo local onde "DT como dado rolado" aparece**: Estímulo (p.62, VD
320) tem a própria Presença Perturbadora com `dt: "8d10"` — primeira
vez que esse fenômeno (já visto em ações do AS#4/#5) atinge o campo
estruturado `presencaPerturbadora.dt`, não só texto solto em
`descricao`. Como o campo não faz nenhuma conta em código (só é
interpolado como texto na UI), guardar a string não quebra nada;
mantido assim em vez de forçar um número.

**Confirma o padrão de elemento primário via `secondaryElements`**:
Hikikomori/Marca-Passo/Estímulo saíram Energia (primário) + Sangue
(secundário) — bate exatamente com a nota de erratas que
`docs/content-audit.md` já tinha registrado de uma auditoria anterior
("Sangue secundário"), confirmando visualmente o que aquela auditoria
só tinha lido em texto corrido.

## Progresso — Arquivos Secretos #7

PDF `D:\Livros OP\Arquivos-Secretos-07-v1-0.pdf` (~27MB, 93 páginas).
**Offset de página = 0** (igual a AS#1–#6). **12 ameaças catalogadas
em 22/09/2026 — 188 ameaças no catálogo.**

**Raziel / O Verdadeiro Raziel confirmadas como 2 fichas distintas**
(VD 120/200, Defesa/PV/testes próprios) — mesmo padrão de "forma
desperta" já visto nos Mascarados do AS#2.

**Apóstata: os "4 estágios" citados na auditoria anterior eram duas
coisas diferentes.** *Mentem Corrumpere* é uma condição progressiva
que afeta as *vítimas* infectadas (não a apóstata) — documentada como
texto de habilidade, não virou entrada. Já a apóstata em si tem 4
patamares de VD (80/160/240/320) com números completos e distintos
(Presença Perturbadora, Defesa, PV recalculados a cada rito concluído)
— **viraram 4 entradas**, mesmo padrão do Simulacro (AS#4)/Doppelganger
(AS#5). Como o livro não nomeia cada patamar, mas *nomeia os ritos*
("Primeiro/Segundo/Terceiro Rito concluído" — terminologia do próprio
livro), rotulei as três formas evoluídas como **"Apóstata (1º Rito)"**,
**"(2º Rito)"**, **"(3º Rito)"** em vez de expor o VD cru no nome
(que já aparece no badge da própria ficha) — etiqueta de catalogação,
não dado inventado. Os bônus de cada rito (+10/+15/+20 em testes/dano/
RD) **não foram recalculados** nos campos numéricos — ficaram como
texto na habilidade "Ritus", para não arriscar um erro aritmético meu
virar "dado do livro" (mesmo cuidado já tomado com os bônus do
Doppelganger/Estímulo).

**Inconsistência Incinerado/Stryzga confirmada como real, preservada
sem correção**: Incinerado lista imunidade a Fogo E vulnerabilidade a
Fogo ao mesmo tempo, além de resistência a Balístico colidindo com sua
própria vulnerabilidade a Balístico; Stryzga tem o mesmo conflito de
Balístico. Os dois arrays (`imunidadesDano`/`resistencias` e
`vulnerabilidades`) ficaram como estão impressos, sem decidir qual
prevalece — mesmo princípio já usado para todo erro do próprio livro
neste catálogo.

**Primeira contagem de dados negativa com bônus zero**: Incinerado tem
`test(-2, 0)` em Percepção e Vontade — confirmado visualmente, sem
"corrigir" para um valor mais familiar.

# Catálogo completo (22/09/2026)

**Todos os livros de Ordem Paranormal publicados até esta sessão estão
catalogados: livro base, Sobrevivendo ao Horror, e Arquivos Secretos
#1 a #7 — 188 ameaças no total.** Este documento continua sendo a
referência de metodologia (offset de página por livro, armadilhas de
extração, convenções de schema) para qualquer conteúdo novo que seja
publicado no futuro (novo Arquivo Secreto, erratas, etc.).

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
