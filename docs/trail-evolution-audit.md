# Auditoria de trilhas, evolução e cálculos

Data: 22/10/2026. Base da revisão: `553b8b5`.

## Cobertura

Foram percorridas as **34 trilhas de agente** cadastradas nas três classes,
do primeiro ao vigésimo nível, no assistente real de criação executado pelos
testes. Cada avanço é validado e sua ficha é recalculada para verificar se
reabrir a ficha altera recursos indevidamente. As três trilhas de Sobrevivente
também percorrem os estágios 1–5 pelo fluxo de evolução com eventos da interface.

A matriz de cálculos executa 2.720 estados de agente: 34 trilhas × 20 níveis ×
duas configurações de NEX/nível × duas configurações de Determinação. Ela verifica
liberação por patamar, números finitos, ausência de mutação ao consultar valores
e estabilidade de um segundo recálculo. Os testes dirigidos abaixo verificam os
valores e comportamentos específicos; a matriz sozinha não comprova todas as
interações possíveis dos livros.

## Problemas corrigidos

| Área | Problema observado | Comportamento corrigido |
| --- | --- | --- |
| Reconhecimento de habilidades | Cálculos procuravam habilidades apenas na lista manual; habilidades automáticas da trilha eram ignoradas | Uma rotina comum reconhece habilidades automáticas, escolhidas e recebidas por outra habilidade, sem somar a mesma habilidade duas vezes |
| Criação em NEX elevado | Graus de treinamento de uma trilha futura vazavam para o começo da criação | O percurso começa apenas com os treinamentos iniciais e concede os demais no patamar correto |
| Tropa de Choque | Casca Grossa não acrescentava PV | Soma retroativa por nível, inclusive quando recebida por Versatilidade |
| Tropa de Choque | Inquebrável não entrava na Defesa/RD quando automático | Benefício reconhecido quando machucado, sem duplicar se o ID também estiver salvo manualmente |
| Intuitivo | Inabalável não aparecia entre as resistências automáticas | Resistência reconhecida a partir de NEX 65% |
| Operações Especiais | Iniciativa Aprimorada não somava o bônus fixo | +5 de Iniciativa calculado sem modificar Outros |
| Infiltrador | Gatuno não somava os bônus fixos | Atletismo e Crime recebem o bônus a partir de NEX 40% |
| Agente Secreto | O Sorriso e escolhas de Carteirada não tinham cálculo consistente | Bônus passivos calculados separadamente dos campos manuais; registro da situação ao adquirir Carteirada |
| Técnico | Inventário Otimizado não ampliava carga | Intelecto passa a compor a capacidade; também funciona quando a habilidade é recebida por outra via |
| Técnico | Remendão não reduzia categoria e não tinha custo de uso configurado | Categoria de equipamento geral ajustada e uso de reparo configurado com custo |
| Aniquilador | A Favorita não alterava a categoria; Máquina de Matar não alterava o cartão da arma | Reduções por patamar, dado adicional de dano e margem de ameaça, preservando modificações |
| Mochila de Utilidades | Escolha do item não alterava espaços/categoria | Reduções aplicadas tanto no cartão quanto na soma do inventário |
| Graduado | Saber Ampliado não concedia rituais extras | Escolha inicial e novas escolhas do círculo liberado, adicionais ao ritual normal da classe |
| Graduado | Grimório não solicitava seus rituais nem ocupava carga | Cota inicial por Intelecto, rituais adicionais nos novos círculos e um espaço de carga; não duplica um grimório já registrado como item personalizado |
| Graduado | A cota do grimório podia diminuir durante a seleção | A cota considera o estado anterior à evolução e permanece fixa ao marcar cada ritual |
| Graduado | Rituais Eficientes não alterava a DT | Bônus de DT aplicado a partir de NEX 65% |
| Lâmina Paranormal | Lâmina Maldita não concedia sua escolha de Amaldiçoar Arma | Elemento escolhido e ritual salvo quando ainda não conhecido |
| Trilhas de Ocultista | Rituais finais concedidos pela trilha não eram adicionados | Rituais nomeados pelas habilidades finais entram automaticamente |
| Bibliotecário | Conhecimento Prático exigia uma escolha permanente indevida | Uso configurado por teste; não exige escolha permanente de perícia |
| Bibliotecário | A Força do Saber não concedia seus benefícios completos | Intelecto efetivo, PE adicionais, nova perícia por INT e atributo da perícia escolhida aplicados sem alterar os valores base |
| Exorcista / Caçador / Monstruoso / Granadeiro | “Treinado ou bônus” não registrava o treinamento anterior | A situação ao adquirir a habilidade fica registrada; bônus e graus não são reaplicados a cada recálculo |
| Exorcista | Poder da Fé não elevava Religião a veterano | Grau mínimo aplicado; o dado adicional depende do registro de treinamento anterior |
| Muambeiro | Laboratório de Campo escrevia bônus diretamente em Outros | Bônus calculado a partir do registro de aquisição, preservando os campos manuais |
| Criptologista / Granadeiro | Poderes concedidos por Método Intuitivo e Fogo Amigo não eram reconhecidos | Criar Selo e Perito em Explosivos entram nas habilidades reconhecidas e na ficha |
| Possuído | Ele Me Ensina salvava a habilidade escolhida sem concluir escolhas dependentes | Transcender e habilidades de outras trilhas abrem e salvam suas escolhas dependentes; uma transcendência extra afeta SAN/possessão uma única vez |
| Possuído com nível separado | O filtro podia deixar a escolha de poder vazia | A substituição obrigatória por Transcender solicitada pelo usuário permanece disponível; a regra opcional não desconta SAN e os rituais de Transcender respeitam o NEX de exposição |
| Escolhas encadeadas | Especialista Diletante e Dominar Habilidade Ritualística podiam omitir escolhas da habilidade recebida | Escolhas dependentes acompanhadas e salvas; a aquisição de habilidades encadeadas de trilha exige a anterior |
| Requisitos de trilha | Médico de Campo e Parapsicólogo podiam ser escolhidos sem o treinamento exigido | Treinamento conferido na entrada da trilha e nas listas de habilidades recebidas; Ele Me Ensina também evita repetir uma habilidade inicial já conhecida |
| Treinamento em Perícia | Os graus eram elevados, mas a escolha podia continuar pendente | As perícias escolhidas também ficam vinculadas ao poder e ao histórico |
| Cultista Arrependido | O poder paranormal inicial podia ficar sem sua escolha dependente | Escolhas adicionais são exigidas sem tratar o poder de origem como Transcender nem retirar ganho de SAN de evolução |
| Afinidade | A lista ficava restrita aos elementos dos poderes conhecidos | Os quatro elementos ficam disponíveis; Monstruoso mantém o elemento da trilha |
| Monstruoso | Benefícios diários eram tratados como sempre ativos e habilidades automáticas eram ignoradas | Registro explícito da etapa do dia; atributos de PE, Defesa, PV e RD condicionais acompanham a ativação e os patamares |
| Monstruoso | Alterações de atributo e penalidades não acompanhavam a evolução | Valores efetivos e penalidades de perícia/dados aplicados sem reescrever os atributos base; benefícios permanentes de Combatente em NEX 99% permanecem ativos |
| Médico de Campo | Reanimação descontava 5 PE; Equipe de Trauma não tinha custo; Resgate cobrava 2 PE | Custos corrigidos para 10 PE, 2 PE e passivo, respectivamente |
| Médico / Negociador | Opções de uso não acompanhavam os aprimoramentos | Paramédico e Discurso Motivador oferecem os patamares já liberados |
| Sobrevivente | Esperto e Iniciado podiam continuar com escolha pendente após avançar | Escolha de perícia e ritual vinculada à habilidade no avanço de estágio |
| Rituais adicionais | Um mesmo ritual podia preencher duas concessões | Seleções distintas entre ritual da classe, grimório, Saber Ampliado e Aprender Ritual |

## Referências conferidas

- Livro base v1.3: seções de classes/trilhas e afinidade, no PDF local
  `D:/Livros OP/ordem-paranormal-rpg-v1-3-lyfxjj.pdf`.
- Sobrevivendo ao Horror v1.2: trilhas, Sobrevivente e separação de NEX/nível,
  no PDF local `D:/Livros OP/sobrevivendo-ao-horror-v1.2.pdf`.
- Arquivos Secretos #7: variantes de Monstruoso, no PDF local
  `D:/Livros OP/Arquivos-Secretos-07-v1-0.pdf`.
- Catálogos integrados de AS #1–7 e AS #9 e auditorias já existentes no projeto.

Os PDFs e as extrações permanecem fora do repositório. Regras são resumidas no
catálogo; textos integrais e imagens das referências não são distribuídos.

## Limites e fichas existentes

- Rolagens, dano em alvos, componentes consumidos, gatilhos narrativos, efeitos
  de interlúdio, condições e bônus dependentes do alvo continuam exigindo decisão
  do jogador/mestre onde o FOP não possui um fluxo específico. Por exemplo:
  executar a etapa de Monstruoso registra os benefícios calculáveis, mas não
  rola a cura diária nem consome componentes automaticamente.
- A presença de uma trilha no teste de progressão não certifica a automação de
  cada efeito narrativo ou combinação de poderes dela. O que foi efetivamente
  corrigido e conferido está discriminado acima.
- Não é possível distinguir um atributo/bônus manual que o jogador já somou de
  outro ajuste legítimo. Esses valores são preservados. A edição de atributos
  identifica os valores como base e informa que os bônus de trilha entram à parte.
- Escolhas antigas sem informação suficiente não são inventadas. Rituais finais
  fixos e graus mínimos determinísticos podem ser recuperados; escolhas de
  elemento, ritual, habilidade e situação de treinamento exigem os registros
  correspondentes ou revisão pelo jogador.
- O sistema registra Profissão como uma única perícia; a especialidade de
  psicólogo exigida por Parapsicólogo continua sendo conferida pelo jogador/mestre.
- Bônus antigos de Carteirada/Laboratório registrados em Outros são preservados,
  inclusive ao reabrir a escolha, sem adicionar novamente o mesmo bônus calculado.

## Verificação reproduzível

Resultado local: sintaxe validada em 70 arquivos e **168 testes aprovados**.
A versão publicada usa `app.js?v=148` e um módulo comum de habilidades `v=1`.

- `npm run check`
- `npm test`
- `tests/trail-calculations-regression.mjs`: matriz de cálculos e casos de valores
  esperados, habilidades recebidas por outra via, equipamento e sincronização.
- `tests/creator-progression-regression.mjs`: 34 percursos completos de criação,
  releitura a cada avanço, prevenção de treinamento antecipado e escolhas de origem.
- `tests/level-up-regression.mjs`: eventos de interface, escolhas encadeadas,
  cota do grimório, Possuído com regras opcionais e os três percursos de Sobrevivente.
- Navegador local: criação completa de um Combatente Monstruoso, treinamento em
  Ocultismo sem bônus indevido, ativação diária e alteração de PV/RD; console sem erros.
