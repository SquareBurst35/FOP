# Automação do AS #9 na ficha

A ficha tem uma **Mesa de operações** junto aos recursos. Os botões de uso das
habilidades novas abrem os mesmos controles. As ações disponíveis acompanham
os poderes, a trilha, os equipamentos e os drones daquele personagem.

## Uso na sessão

1. Configure os drones individuais e, se existirem na operação, as regalias do
   veículo e o aliado concedido pelo mestre.
2. Escolha uma ação. Informe o contexto que a ficha não observa: alvo, Defesa,
   VD, distância, resultado de resistência ou relação com o plano.
3. Confirme. A ficha rola os dados, calcula o resultado, desconta PE/PD e
   consumíveis e salva o estado. Dados de Tática também podem usar um total
   rolado na mesa, em vez da rolagem automática.
4. Use **Próximo turno**, **Nova cena**, **Novo interlúdio** e **Nova missão**
   para avançar o contexto e expirar os efeitos e limites correspondentes.
5. **Último uso → Desfazer** devolve recursos, munição, itens, melhorias e
   efeitos alterados pela ação. Uma edição posterior desses dados impede
   sobrescrevê-los silenciosamente.

## Cobertura

| Regra | Comportamento |
| --- | --- |
| Analisar Perigo | Tática DT 15; calcula excedentes, aplica bônus em testes/Defesa e expira depois do próximo turno; uma tentativa por cena |
| Municiador Ambulante | Rola INT d6 de capacidade por ação de interlúdio; prepara pacotes já carregados; retira seus espaços sem criar munição ou alterar sua categoria |
| Tática de Abordagem | Planejamento contra ameaça específica, participantes, pool de d6, gasto acumulável em teste/dano/cura e perda no próximo interlúdio |
| Ripostar Ousado | Reserva reação e 2 PE antes do acerto; Defesa +5 só contra aquele ataque; resolve contra-ataque e bônus por erro do atacante, incluindo machado |
| Full Metal Jacket / CQB | Ignora a penalidade aplicável e calcula o custo correto no teste/ataque |
| Tiro Intuitivo / DMR | Margem de ameaça conforme mirar, treino em Pontaria e alvo; dano extra de Ataque Furtivo até médio com DMR se a habilidade e as condições existirem |
| Entrada Explosiva | +5 no teste contextual; implantação com movimento e 1 PE consome a mina/carga carregada |
| Proteger Reféns | Alcance de 3 m, transferência de efeito/dano, opção de metade por 4 PE e até três reféns distintos por rodada |
| Alvo-prioritário | Marca visível por 5 PE, +5 na margem para VD 201+, ou PV 0 quando VD ≤200 e houve dano após a RD informada |
| Capacete / escudo / machado | Chance de ignorar apenas dano adicional; RD balístico e cobertura situacional; lanterna com imunidade por alvo/cena; sacrifício de uma unidade do machado, reversível com suas melhorias |
| Serrada / taser | Metade do dano da serrada em médio ou maior; DT AGI, resistência imediata ou posterior e limite de atordoamento por alvo/cena do taser |
| Munição | Contagem opcional de dardos: pacote de 20, carregador de 10, consumo mesmo no erro e reserva parcial ainda computada na carga; granadeira portátil comporta um disparo de 40 mm |
| Drones | Instâncias separadas para cada item e os dois companheiros; tipo base/perícia permanente, modificações, disponibilidade e controle independentes; isenções de categoria da trilha nos companheiros |
| Habilidades de drone | Auxílio contextual nos testes sem acumular efeitos semelhantes, cura 2d8+2, visão térmica, braços, alerta de resistência, dano extra, hack, repetição única, evitar rastreamento, proteção, conserto e substituição |
| Movimento de drone | Uma ação por rodada, até 6 m no solo ou 12 m voando; registra perda de sinal além de 5 km informados até o controle |
| Veículo | Central com +5 Tecnologia no contexto e uso livre por rodada; estação anula a penalidade informada de tiro do veículo em movimento com arma de fogo de duas mãos; fumaça uma vez por cena |
| Aliados Hell Hunters | Dados de auxílio, redução de dano, dano extra, cura ou remoção de condição, repetição de Pilotagem, explosivo no inventário, conjuração de Nuvem de Cinzas e formações de Ryder |

Os controles de tempo da Mesa de operações governam estes efeitos do AS #9.
Os usos antigos de habilidades continuam seguindo a política existente de
limites informativos; rituais antigos continuam com seus controles de efeitos.
Os campos de treino e Outros permanecem editáveis e não recebem bônus
temporários gravados como treino permanente.

## Informações que vêm da mesa

- A ficha calcula a partir dos dados declarados. Não observa mapa, linha de
  visão, ações dos demais jogadores ou informação do mestre.
- Bônus, cura e dano destinados a outra ficha são apresentados para aplicação
  nela. Este recurso não controla personagens de outras pessoas nem resolve
  automaticamente áreas e posicionamento de um mapa.
- Efeitos narrativos dos drones, condições removidas por Roy, cobertura de
  terceiros, camuflagem e fumaça são registrados com seu contexto. Braços
  manipuladores registram a capacidade de 5 espaços; distribuição física de
  carga e manipulação de objetos continuam decisões da mesa.
- A Estação de Armas retira a cobertura do veículo do operador. Seu benefício
  aparece no resultado contextual; não altera a Defesa geral da ficha.
- Munição de 40 mm é requisitada separadamente. O AS #9 remete ao AS #4;
  cadastre nome, dano, espaços e categoria conforme a referência da mesa. O
  sistema não aceita granadas de arremesso como substitutas nem inventa suas
  estatísticas. O registro entra na carga e é consumido na recarga.
- Roy não tem custo/ação especificados no quadro de aliado. A ficha não
  inventa esse custo. Sua habilidade cura **ou** remove uma condição.
- A alternativa da mesa de retirar o limite de atordoamento do taser é uma
  escolha explícita no controle; não muda o taser operacional antigo.

## Implementação e compatibilidade

- `tactical-state.js`: perfis individuais, migração do formato compartilhado,
  bônus derivados, preparação de munição e limpeza de referências ao inventário.
- `tactical.js`: transações validadas em cópia; nenhuma alteração parcial ao
  faltar recurso; cálculos e histórico reversível.
- `tactical-ui.js` / `tactical.css`: painel e diálogos responsivos. As opções de
  ação do drone acompanham seus tipos e os patamares da trilha.
- `rules.js` e `items.js`: Defesa, bônus temporários, deslocamento de formação,
  carga, munição preparada e categoria individual.
- `session.js`: desfazer também restaura os campos específicos da transação.

O estado usa `operacoesAS9` dentro da ficha existente. O codec de sincronização
preserva esse campo e os snapshots do histórico. IDs dos catálogos e fichas
salvas não mudaram. A migração conserva os tipos e a perícia do formato legado;
novas configurações são individuais. O companheiro da trilha é distinto de um
drone requisitado no inventário; as isenções de suas modificações não se
espalham a compras adicionais.

## Validação

- `tests/as9-automation-regression.mjs`: 31 testes de mecânicas, limites,
  custos, falhas atômicas, categorias, inventário, sincronização e desfazer.
- Regressão do aplicativo: salvar/reabrir não invalida o desfazer; destruir e
  desfazer o último machado também recupera suas melhorias; a perícia legada
  de drone sobrevive à normalização.
- Suíte completa: **115 testes aprovados**, sem falhas ou testes ignorados.
- Navegador local: criação até salvar, configuração de drone, dano, cura,
  desconto de PE, desfazer, recarga da página e aplicação de bônus de Tática.
- Conferência responsiva do diálogo em viewport de 390 px, por iframe local.

Publicação no GitHub Pages e autenticação real no Firebase não fazem parte
dessa verificação local.
