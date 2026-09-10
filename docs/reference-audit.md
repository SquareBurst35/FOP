# Conferência das referências — 9 de setembro de 2026

A conferência usa os quatro PDFs fornecidos pelo proprietário do projeto. Os PDFs não são distribuídos com o site. Foram extraídos o texto de todas as páginas, os títulos das opções de personagem e os cabeçalhos das descrições de rituais. Nomes quebrados entre linhas foram conferidos com as respectivas seções. Uma ausência no índice não foi tratada como ausência no livro.

## Rituais corrigidos

| Entrada | Resultado |
| --- | --- |
| Amaldiçoar Arma | Quatro escolhas de 1º círculo, uma para cada elemento: Conhecimento, Energia, Morte e Sangue. Cada escolha ocupa uma vaga de ritual; escolher uma não concede as outras. |
| Criar Ilusão | Incluído a partir da descrição de Energia, 1º círculo, na página 121 do PDF base. |
| Proteção contra Rituais | Incluído a partir da descrição de Medo, 2º círculo, na página 132 do PDF base. |
| Distorção Temporal | Nome alternativo pesquisável para Distorcer o Tempo. O identificador já salvo nas fichas foi preservado. |

A lista independente em `tests/fixtures/ritual-reference-catalog.json` contém 102 cabeçalhos de descrições: 80 do livro base, 16 de Sobrevivendo ao Horror, dois dos Arquivos Secretos #1 e quatro dos Arquivos Secretos #2. O teste confere presença, elemento e círculo de cada um, além das quatro escolhas de Amaldiçoar Arma. Há 107 escolhas de ritual no catálogo após as inclusões.

Amaldiçoar Arma não está no índice nem entre as descrições da cópia antiga do livro base recebida; a própria trilha Lâmina Paranormal o menciona. A entrada solicitada foi conferida também em referências públicas de jogo, incluindo https://ordem-sanctum.webnode.page/rituais-de-sangue/ . Isso não equivale a uma conferência de uma edição atual completa do livro. As descrições adicionadas ao site são resumos próprios.

## Conferência dos quatro documentos

| Documento | Seções conferidas | Resultado e limites |
| --- | --- | --- |
| Livro base enviado, 192 páginas | Origens, classes e trilhas, poderes, equipamentos, poderes paranormais e rituais | As ausências de rituais e o nome alternativo acima foram corrigidos. As origens listadas estão presentes. Existem divergências internas entre tabelas e descrições, indicadas abaixo. As listas de modificações não estão integralmente cadastradas como itens. |
| Sobrevivendo ao Horror v1.2, 226 páginas | Opções de personagem do capítulo 1: origens, poderes, trilhas, equipamentos e rituais | Os títulos de opções foram comparados ao catálogo. Os 16 rituais descritos estão cobertos. Não foi encontrada outra ausência nominal nas opções de personagem conferidas. Regras de ameaças, missões e ferramentas do mestre não são opções de ficha. |
| Arquivos Secretos #1 v1.2, 75 páginas | Origem e poderes das pp. 43–47; rituais das pp. 48 e 50; itens apresentados no suplemento | Os títulos das opções estão presentes, incluindo os títulos divididos entre linhas. Os dois rituais de Passagem de Conhecimento são entradas separadas. Fichas de criaturas e conteúdo narrativo foram identificados como conteúdo do mestre. |
| Arquivos Secretos #2, 108 páginas | Recursos da p. 21; poderes, rituais e equipamentos das fichas e das seções “na sua mesa” | Os quatro rituais estão cobertos. Poderes com títulos quebrados, como Sintonização Mental com Proteção e Liturgia de Fortalecimento Ritualístico, já estavam presentes. Acoplável é uma habilidade de arma sem editor estruturado no site; pode ser anotada nas notas de inventário. |

## Divergências e funções ainda não automatizadas

- **Forma Monstruosa:** o índice do PDF base indica 3º círculo; a descrição indica 2º. Foi conservado o 3º círculo já usado no site. O teste registra explicitamente a divergência.
- **Origens do livro base:** tabelas e descrições usam nomes e, em alguns casos, perícias diferentes. Exemplos: Treinamento Militar/Para Bellum, Exorcismo/Acalentar, Computação Avançada/Motor de Busca e Trilhas e Rumos/Desbravador. A descrição de Lutador também difere da tabela. Essas diferenças não foram silenciosamente aplicadas às fichas.
- **Munição:** a descrição usa “Balas Longas”, enquanto o catálogo existente usa “Balas pesadas”. Não foi criado outro pacote idêntico nem alterado o inventário salvo.
- **Modificações:** o livro base possui listas para armas, proteções e acessórios (pp. 60–65 do PDF). Essas listas e Acoplável (Arquivos Secretos #2, p. 71) não têm aplicação estruturada completa. O site continua oferecendo notas de inventário; esta revisão visual não inventa cálculos para essas funções.
- **Escopo da conferência:** presença nominal de opções e metadados de rituais. Não é uma certificação de todas as descrições, regras, erratas ou edições publicadas. As divergências exigem uma referência editorial consistente antes de mudar cálculos já utilizados.

## Criação e compatibilidade

O fluxo de criação exige resolver as escolhas relativas à classe e ao NEX selecionados antes de concluir a ficha. Ocultista em NEX 5% escolhe três rituais de 1º círculo, incluindo qualquer uma das quatro variantes de Amaldiçoar Arma. Testes exercitam cada variante nessa criação, a busca pelo nome alternativo e a preservação dos identificadores existentes.

A troca do personagem usa somente preferências de apresentação. Recursos, dano, defesa, carga, progressão e itens possuídos não são alterados pela composição visual.
