# Composição do equipamento no agente

O catálogo e as imagens originais ficam em `item-art.js` e `assets/item-art/`.
As receitas de uso no corpo ficam separadas em `equipment-composition.js`: cada um dos 165 IDs possui um tratamento explícito.

O renderer usa cinco fases:

1. Costas: mochila, paraquedas, capa e flechas, atrás da silhueta.
2. Substituição: a região do casaco recebe material opaco e recortes independentes de tronco e mangas; botas, luvas e capacetes substituem suas regiões.
3. Integração: quadriláteros triangulados adaptam as texturas existentes aos ombros, tronco e antebraços. Trajes completos usam seus próprios pontos de encaixe.
4. Oclusão: lenço, cabelo, borda do bolso, correias e dedos voltam à frente. As manoplas têm sua própria camada de dedos; o elmo conserva a barra do visor à frente dos óculos.
5. Detalhes externos: ajustes acompanham um equipamento compatível; o companheiro toca o chão ao lado do agente.

Itens guardados têm tratamento explícito e não geram imagens soltas. Os controles informam quantos itens estão no visual e quantos estão guardados. Selecionar equipamento aqui não modifica inventário, recursos ou regras.

Óculos, máscara, bandoleira e arnês possuem posições independentes, permitindo combinações com cabeça, traje e proteção. Preferências antigas das posições subdivididas são reconhecidas.

## Verificação

- `node --test tests/*.mjs`: os testes existentes e a cobertura nova dos 165 itens, uso nas duas mãos, combinações, migração de preferências, ajuste dependente e falha de carregamento de textura.
- `node scripts/render-equipment-qa.mjs /tmp/fop-equipment-qa`: gera uma imagem individual de cada item, folhas de contato, 15 conjuntos, variações na mão esquerda, mochila personalizada e `coverage.json`. Requer `@napi-rs/canvas` no ambiente local; não é dependência do site.

A revisão desta alteração foi feita nas imagens geradas pelo mesmo renderer utilizado pelo site. Não foi possível executar o navegador local porque o binário não estava disponível e seu download falhou.

## Aparências e catálogo v24

`characterBodyPath()` escolhe a base masculina ou feminina. Roupas usam as mesmas regiões de encaixe; cabelo e rosto da base selecionada são restaurados onde precisam ficar visíveis. Capacetes e trajes substituem as partes cobertas. `additional-items.js` declara explicitamente os tipos e as versões usadas pelos 50 itens novos, sem alterar as 165 ilustrações originais. O relatório de cobertura inclui as duas aparências e deve acompanhar mudanças de catálogo.
