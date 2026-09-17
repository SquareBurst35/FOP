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
`CRIATURAS DE CONHECIMENTO` (232) → `CRIATURAS DE ENERGIA` (254) →
`AMEAÇAS DA REALIDADE` (282) → `PERIGOS` (290, fora do escopo — tabela de
mestre, não uma ameaça catalogável) → capítulo 8 (294).

| Seção | Catalogadas | Situação |
|---|---|---|
| Sangue | 12 de 12 | **Completa em 17/09/2026**: Aberração de Carne (p.182), Aniquilação (p.185), Carente (p.188), Dama de Sangue (p.190), Enpap-X (p.192), Kerberos (p.194), Minotauro (p.197), Mulher Afogada (p.199), Titã de Sangue (p.201), Zumbi de Sangue (p.202), Zumbi de Sangue Bestial (p.203), O Diabo (p.205). |
| Morte | — | Não iniciado — próxima seção, começa na p.208 |
| Conhecimento | — | Não iniciado |
| Energia | — | Não iniciado |
| Realidade (mundana) | — | Não iniciado; confirmar categoria/rótulo usado pelo livro para esse grupo antes de catalogar (todos os exemplos feitos até agora são "Criatura"; ainda não vimos como o livro rotula uma ameaça mundana) |

**Lição aprendida catalogando Sangue**: o primeiro escaneamento
automático da seção (por regex de "VD") errou a contagem — a página do
Kerberos (194) tem o nome num tratamento gráfico que não extrai como
texto, então o script achou o VD mas não o nome, e eu quase concluí que
era continuação da criatura anterior (Enpap-X). Só renderizando cada
página como imagem e olhando é que apareceu. **Não confiar em scan de
texto para decidir quantas criaturas uma seção tem — sempre renderizar
e olhar página por página**, mesmo que pareça repetitivo.

Duas ameaças (Aniquilação e O Diabo) não têm limite de NEX na Presença
Perturbadora — afetam qualquer agente, independente do NEX. Isso é dado
real do livro, não uma lacuna: o schema trata `imuneDesdeNex: null`
como "nenhum NEX concede imunidade", e a UI já mostra essa frase em vez
de inventar um número.

## Ordem de continuação sugerida

1. Criaturas de Morte (p.208–231), mesmo método: renderizar cada página
   com `python scripts/pdf-read.py render`, nunca confiar só no texto
   extraído nem no scan automático de "VD".
2. Conhecimento (232–253), Energia (254–281), Realidade (282–289).
3. Sobrevivendo ao Horror, depois Arquivos Secretos #1–7 (nenhum
   inventariado ainda para ameaças; `docs/content-audit.md` já mapeou
   *onde* estão as ameaças de cada AS, mas não suas fichas mecânicas).
