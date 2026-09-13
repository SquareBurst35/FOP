# Conferência de referências — v24

Revisão concluída em 13/09/2026. A referência principal é o **Livro base v1.3 de 332 páginas**, enviado pelo usuário, SHA-256 `df0d0b695a02ef594142f102a0dfe056fad3a723596474232cfb7c4b2c10341c`. Ele substitui o PDF antigo de 192 páginas na conferência de rituais e equipamentos. Os PDFs não são distribuídos pelo projeto; o catálogo usa resumos próprios.

| Referência | Conferência | Resultado |
| --- | --- | --- |
| Livro base v1.3 | Equipamentos, modificações e maldições; descrições de rituais nas pp. 124–143 | 50 equipamentos adicionados; 82 títulos de rituais, com Amaldiçoar Arma desdobrado em quatro elementos, totalizando 85 escolhas atuais do livro base |
| Sobrevivendo ao Horror v1.2 | Opções de personagem e equipamento; 16 rituais | Custos e requisitos das versões conferidos; Lente de Revelação incluída como modificação da câmera |
| Arquivos Secretos #1 v1.2 | Opções de personagem, itens e dois rituais | Entradas existentes preservadas; versões dos dois rituais conferidas |
| Arquivos Secretos #2 | Recursos, equipamentos e quatro rituais | Entradas existentes preservadas; Acoplável disponível no editor do equipamento |

## Rituais e habilidades

São **110 entradas de ritual**: 107 escolhas nos quatro livros atuais e três opções legadas preservadas para não quebrar fichas antigas. `tests/fixtures/ritual-use-costs.json` contém os 104 títulos extraídos das referências, com página do PDF, círculo, elemento, custo adicional e requisitos explícitos de cada versão. Os testes comparam cada entrada e cada versão ao catálogo.

- Normal, Discente e Verdadeiro aparecem ao conjurar. Uma forma inexistente ou sem requisito cumprido fica desabilitada com a explicação.
- Custo total = custo-base + aprimoramento − descontos aplicáveis, com mínimo de 1. PE/PD seguem as regras opcionais da ficha. Recursos são descontados somente na confirmação; o histórico registra a versão e permite desfazer.
- Ataque Especial e Especialista em Matar oferecem os patamares disponíveis e distribuições do bônus. Perito, Eclético, Técnica Secreta/Sublime, Força Opressora e Estrategista também têm escolhas explícitas.
- Coincidência Forçada segue o 1º círculo da v1.3. Flagelo de Sangue, Inexistir e Invadir Mente foram adicionados.
- Aprimorar Físico, Aprimorar Mente, Dissipar Ritual, Distorção Temporal, Miasma Entrópico e Tecer Ilusão usam os nomes da v1.3 e preservam os nomes antigos como aliases. IDs existentes permanecem estáveis.
- Criar Ilusão, Ligação Telepática e Visão da Verdade permanecem identificados como opções de versão anterior. O teste da referência antiga continua verificando sua compatibilidade, com a substituição documentada de Coincidência Forçada.

## Equipamento e aparência

O catálogo tem **215 itens**, mantendo os 165 originais. Inclui a mochila militar, escudo, binóculos, máscara de gás, traje hazmat, componentes e detectores por elemento e os itens especiais das pp. 148–151. Nomes alternativos como Maça, Motosserra, Balas longas e Lanterna tática podem ser encontrados sem mudar os identificadores dos itens antigos.

Há também **60 modificações/maldições de referência**, aplicadas dentro do item. O editor soma categoria e espaços; efeitos condicionais em testes, dano, Defesa, alvos e ativações específicas continuam sob controle do jogador. Não se contam essas melhorias como objetos soltos. Várias cópias de um item compartilham as modificações escolhidas. A mochila militar acrescenta 2 espaços à capacidade uma única vez.

A criação permite escolher Masculino ou Feminino, com prévia imediata. Fichas antigas usam a aparência masculina. O compositor seleciona a base adequada e substitui regiões por versões já equipadas. As novas entradas compartilham silhuetas por tipo de equipamento; escudo, binóculos, máscara de gás e traje hazmat possuem novas versões. As 165 imagens originais do catálogo não foram alteradas. Pequenos objetos guardados e equipamento de veículo permanecem fora do corpo.

## Verificação

`node --test tests/*.mjs` executa os testes de regras, criação, level up, sessão, interface, custos e cobertura. `node scripts/render-equipment-qa.mjs /tmp/fop-review` gera a revisão visual: **430 casos individuais (215 por aparência), 20 conjuntos por aparência e poses na mão secundária**. `equipment-coverage.json` registra todos os casos, inclusive a ausência de alteração visual para objetos guardados. A revisão inclui roupas com proteções, capacete com óculos, trajes com objetos nas mãos, manoplas com arma e mochila com bandoleira e fuzil.

Esta conferência cobre presença das opções, metadados de uso e composição visual. Não automatiza integralmente todos os efeitos narrativos e condicionais dos livros, nem substitui o texto da referência durante a mesa.
