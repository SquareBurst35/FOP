# Versões do agente

78 PNGs transparentes de 420 × 600, preparados a partir de edições do personagem completo em pixel art. A referência é o agente fornecido pelo proprietário do projeto. As versões compartilham tipos físicos de roupa, proteção, acessórios e objetos; não representam 165 ilustrações exclusivas novas.

`equipment-variants.js` contém o mapeamento explícito dos 165 itens atuais. `agent-poses.js` contém os recortes das poses, incluindo as mãos e os dedos. `agent-variants.js` substitui regiões do personagem e compõe o primeiro plano sobre as costas, capas e mochilas. O mesmo renderer é usado no site e na revisão visual.

As imagens de `assets/item-art/` e o arquivo `item-art.js` continuam sendo usados somente para os ícones do catálogo e os metadados já existentes. Nenhuma dessas imagens foi refeita nesta atualização.

## Verificação

- `node --test tests/*.mjs`: testes existentes, referências de rituais, cobertura dos 165 itens e dos 78 PNGs, transparência e escolha de poses.
- `node scripts/render-equipment-qa.mjs /tmp/fop-equipment-qa`: usa `@napi-rs/canvas` para gerar os 165 casos individuais, 89 casos na outra mão, 15 conjuntos e a mochila personalizada. Confere que cada item visível muda pixels e que os itens guardados não aparecem sobre o corpo.
- `docs/equipment-coverage.json`: relatório da renderização por item.
- `docs/agent-variants-preview.png`: conjuntos revisados.

O importador opcional `scripts/prepare-agent-variants.mjs` recebe um JSON com caminhos das edições completas, recortes de folhas e transformações. Ele faz apenas o preparo para o jogo: recorte das células, chroma key, registro no quadro comum e escala sem suavização. Os arquivos finais já estão incluídos; esse processo não é necessário para abrir ou publicar o site.

As preferências visuais não modificam regras nem a posse de itens. Uma pose que ocupa as duas mãos mostra apenas um objeto empunhado; a interface informa quando a outra escolha fica guardada no visual.
