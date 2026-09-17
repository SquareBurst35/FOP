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
| Sangue | Aberração de Carne (p.182), Carente (p.188) | 2 feitas; **Aniquilação (p.185–187) já foi lida e transcrita nesta sessão mas ainda não está em `threats.js`** — é a próxima a entrar. Restam mais criaturas até a p.207. |
| Morte | — | Não iniciado |
| Conhecimento | — | Não iniciado |
| Energia | — | Não iniciado |
| Realidade (mundana) | — | Não iniciado; confirmar categoria/rótulo usado pelo livro para esse grupo antes de catalogar (os dois exemplos feitos são "Criatura", ainda não vimos como o livro rotula uma ameaça mundana) |

### Dados já extraídos e prontos para virar entrada (não perder)

**Aniquilação** — Sangue, Criatura Colossal, VD 380, p.185–187.
- Presença Perturbadora: DT 45, 9d8 mental (NEX de imunidade não anotado — conferir de novo)
- Percepção 5d20+20, Iniciativa 4d20+20
- Defesa 58, Fortitude 4d20+25, Reflexos 5d20+30, Vontade 4d20+20 *(conferir visualmente — veio da extração de texto da v1, antes do método de render; os campos de Reflexos/Vontade/Iniciativa são justamente os que o ícone de d20 pode esconder um "+0")*
- PV 1200 (600 machucado), Resistências Dano 50, Vulnerabilidades Morte
- Atributos AGI 5, FOR 5, INT 3, PRE 4, VIG 5; Perícias Atletismo 5d20+20
- Deslocamento 15m | 10 quadrados
- Ações: Garras (corpo a corpo x2, teste 5d20+40, dano 4d10+30 Sangue), Tentáculos Espinhentos (corpo a corpo x2, teste 5d20+40, dano 2d12+30 Sangue), Disparo de Espinhos (distância x3, médio, teste 4d20+40, dano 2d10+20 Sangue), Reação Instinto Aniquilador, Reação Agarrão (teste +50, até 4 agarrados), Movimento Apertar e Destruir, Movimento Bater as Asas (8d6 mental, empurra 6m, atordoa 1 rodada, Fortitude DT 40 reduz/evita), Movimento Estrangulamento Final (Reflexos DT 30 evita), Completa Tempestade de Espinhos (20d6+20 Sangue, Reflexos DT 40 reduz à metade, 1x/cena)
- Enigma de Medo: desconhecido; ao resolver, perde resistência a dano e Tempestade de Espinhos

**Antes de adicionar**: reler p.185–187 com `pdf-read.py render` (não
apenas texto) para confirmar Reflexos/Vontade/Iniciativa e o NEX de
imunidade da Presença Perturbadora, do mesmo jeito que foi necessário
para Aberração de Carne e Carente.

## Ordem de continuação sugerida

1. Confirmar e adicionar Aniquilação.
2. Terminar Criaturas de Sangue (até p.207).
3. Morte, Conhecimento, Energia, Realidade — mesma mecânica.
4. Sobrevivendo ao Horror, depois Arquivos Secretos #1–7 (nenhum
   inventariado ainda para ameaças; `docs/content-audit.md` já mapeou
   *onde* estão as ameaças de cada AS, mas não suas fichas mecânicas).
