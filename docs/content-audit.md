# Auditoria de Arquivos Secretos 3–7

Status: **em andamento**. Este arquivo não declara cobertura completa enquanto houver páginas ou integrações pendentes.

Base de comparação: commit `22f7c8ba445aae08ab9dc4e024c989cad145cda3`. Os identificadores existentes devem ser preservados. Descrições novas serão resumos mecânicos, sem reproduzir narrativas ou ilustrações dos PDFs.

## Fontes recebidas

| Fonte | Arquivo | Páginas PDF | Leitura integral |
|---|---|---:|---|
| Arquivos Secretos #3 | Arquivos-Secretos-3-v-1-0.pdf | 142 | Texto completo; conferência visual de tabelas e fichas em andamento |
| Arquivos Secretos #4 | Arquivos-Secretos-04-v1.0.pdf | 79 | Texto completo; conferência visual de fichas pendente |
| Arquivos Secretos #5 | Arquivos-Secretos-05-v1.0.pdf | 70 | Texto completo; conferência visual de fichas pendente |
| Arquivos Secretos #6 | Arquivos-Secretos-06.pdf | 84 | Texto completo, incluindo erratas v1.1 |
| Arquivos Secretos #7 | Arquivos-Secretos-07-v1-0.pdf | 93 | Texto completo; conferência visual de fichas/tabelas pendente |

Total: 468 páginas. Extração preparada página a página; extração não significa leitura/revisão concluída. Metadados usam `source`, `sourcePage` (numeração impressa) e `pdfPage` quando necessário.

## Registro de leitura e comparação

- Sumários dos cinco arquivos conferidos.
- AS #3: páginas PDF 1–142 lidas integralmente em texto. Conferidas visualmente as páginas 11, 88 e 141. Catalogadas 18 fichas de ameaças nas páginas 11, 17, 23, 29, 37, 41, 47, 51, 57, 63, 69, 73, 81, 88, 92, 95, 101 e 105.
- AS #4: páginas PDF 1–79 lidas integralmente em texto. Fichas nas páginas 55–57 e 61; opções de personagem nas páginas 64–71; hacking nas páginas 72–73; exemplos narrativos de adaptação de ameaças nas páginas 76–78, sem novos itens livremente selecionáveis.
- Nenhuma opção das páginas 108–119 de AS #3 consta com o mesmo nome nos catálogos atuais de poderes, rituais, trilhas ou itens.
- Comparação dos novos nomes, aliases e referências a poderes existentes concluída nos cinco suplementos: nenhum conflito de identidade encontrado nos catálogos de personagem. Comparação de funcionamento segue junto da integração.

## AS #3 — inventário de diferenças identificado

| Categoria | Conteúdo | Página | Situação |
|---|---|---:|---|
| Poderes de Combatente | Guardião da Tropa; Vitalidade Sofrida | 108 | Adição pendente; requisitos, repetição e PV retroativos |
| Poderes de Ocultista | Flagelo Bem Aproveitado; Recuperação Flagelante | 108 | Adição pendente; alteração da conversão de PV e controle entre interlúdios |
| Poderes gerais | Ambidestria; Entrada Triunfal; Papinho Sedutor | 108–109 | Adição pendente; requisitos alternativos e limite por sessão |
| Poderes paranormais | Instrumento Elétrico de Combate; Conhecimento de Direção Precognitiva | 109 | Adição pendente; afinidade e instrumento gerado |
| Poderes de sacrifício | Causar Culpa; Despertar Obsessão; Arrogância Diabólica; Estimular Hedonismo; Fruto da Ambição; Ódio Suprimido | 110–111 | Adição pendente; aquisição condicionada ao estigma, não poderes gerais livres |
| Arma | Garra do Harpia | 112 | Adição pendente; item único e ativação de 2 PE |
| Equipamentos | Paçoca; Bloody Mary Batizada | 112 | Adição pendente; consumo, recuperação e condições |
| Itens paranormais | Crânio Dominador; Gaiola do Corvo | 113 | Adição pendente; ativações, alvos e intervalo de 24 h |
| Itens amaldiçoados | Camiseta Psikolera; Dupla Obsessiva; Armaduras de Guevara | 114–115 | Adição pendente; arma composta, reações e armadura progressiva |
| Aliados | Ana; Argano; Chispa; Escarlata; Torvo; Coruja; Harpia; Corvo; Papagaio; Pomba; Alê; Caio; Cindy; Eloy; Franco | 116–118 | Adição pendente; bônus e ações com limites próprios |
| Trilha geral | Performático: Ensaio; Frase de Efeito; Mosh Pit; Rítmo Contagiante | 119 | Adição pendente; Combatente, Especialista e Ocultista; NEX 10/40/65/99 |
| Regras opcionais | Batalhas de intenções; trocas de recursos; construção de base; minijogos; boas recordações; vínculos e condições | 120–124 | Adição pendente; distinguir regras de mesa e controles da ficha |
| Veículos | Categorias II/III/IV; 9 regalias; direção; combustível; danos; reparos; motocicleta dos Gaudérios | 125–131 | Adição pendente; sem criar campanhas |
| Animais | Treinamento; aliados Serpente, Corvo e Gato; progressão de animal como ameaça | 132–134 | Adição pendente |
| Criação de ameaças | Tabela de valores médios e adaptação para ameaças da realidade | 140–141 | Estruturação pendente; não é lista de criaturas prontas |

## Integração e testes

Dados de personagem preparados nos módulos `supplements/as03.js` a `as07.js`; 9 testes de regras suplementares passaram. A interface e os catálogos principais ainda não importam esses módulos. Login, Firebase e sincronização permanecem fora do escopo de alteração. Dados de ameaças serão separados das opções selecionáveis dos personagens, sem página visual nova.

## Ponto de retomada

Leitura textual integral concluída nos cinco PDFs. Conferir tabelas e integrações no código antes de fechar a cobertura. Dados estruturados dos cinco PDFs, avaliação de requisitos, controles de veículos/hacking e regras auxiliares escritos. Falta integrar aos fluxos da ficha, implementar todas as ativações e concluir as ameaças. Não marcar como adicionada uma opção apenas catalogada neste documento.

## Divergências das fontes

- AS #3 p. 11, Alê: Hora do Show declara +10 Defesa e +20 PV, mas apresenta totais 26/90 incompatíveis com a base 18/45. Registrar o conflito no dado, sem alterar silenciosamente os números.
- AS #3 p. 88, Corvo: o resumo de Tecer Ilusão Discente inclui e depois exclui tato, temperatura e cheiro. Os valores particulares de círculo/DT dessa ficha não devem sobrescrever os rituais dos personagens.
- AS #3 p. 69, Escarlata: preservar as DTs específicas impressas dos rituais e registrar a diferença da DT geral 23.

## AS #4 — inventário de diferenças identificado

| Categoria | Conteúdo | Página | Situação |
|---|---|---:|---|
| Origens | Caçador de Recompensas; Influencer Paranormal | 64 | Comparação/implementação pendente |
| Perícia | Tecnologia: Obter Informações | 64 | Pendente; ação completa, DT 5, informação adicional a cada 5 |
| Combatente | Chuva de Balas; Combatente Esforçado; Treinamento Militarizado | 65 | Pendente |
| Especialista | Análise Conturbada; Profissão Perigo; Quase Novo | 65 | Pendente |
| Ocultista | Explorador da Névoa; Sinestesia Paranormal; Terrores Noturnos | 66 | Pendente |
| Geral | Gororoba; Ruído Branco; Uma Última Olhada | 66–67 | Pendente |
| Paranormais | Foco Gravitacional; Sobrepor Imprevisível; Traço de Inconsistência | 67 | Pendente, incluindo afinidades |
| Ritual | Backup, normal/discente/verdadeiro | 68 | Pendente |
| Trilha de Especialista | Granadeiro Blaster: Meus Bebês; Fogo Amigo; O Calor do Momento; Memória Muscular | 69 | Pendente |
| Itens | Granada de Gás Lacrimogêneo; Granada de Tinta; Granada Ctrl+C Ctrl+V; Lançador de Granadas; variantes 40 mm | 70–71 | Pendente |
| Modificações | Adesiva; Dupla; Programada (granadas) | 71 | Pendente; categoria +I, sem acúmulo de iguais |
| Regra opcional | Hacking: PS, dados virtuais, cinco ações e quatro imprevistos | 72–73 | Pendente |
| Ameaças | Assistente de Produção; Produtor; Diretor; Simulacro (Troyan, Krypto, Vvorm, Botnetz) | 55–61 | Estruturação pendente |

## AS #5 — inventário de diferenças identificado

Texto integral das páginas 1–70 lido. **Opções de personagem integradas de verdade em rules.js/content.js/items.js em 15/09/2026** (commit `60da8b5`), fora do schema abandonado em `supplements/`. Ameaças, perigos complexos e regalias de veículo continuam fora do catálogo (ver notas de escopo abaixo).

| Categoria | Conteúdo | Página | Situação |
|---|---|---:|---|
| Origens | Ufólogo; Funcionário de Beira de Estrada | 54 | Integrado |
| Perícia | Tecnologia: Rastrear Trilha Digital (veterano) | 54 | Fora do escopo — não há catálogo de "novos usos de perícia" no site |
| Combatente | Aura de Confiança; Fôlego de Emergência; Parede de Carne | 55 | Integrado |
| Especialista | Adepto do Escuro; Saudosista Hi-Tech; Treinado nas Telas | 55 | Integrado |
| Ocultista | Catálogo de Criaturas Ambulante; Meditação Ocultista; Ruído de Comunicação | 56 | Integrado |
| Geral | Apaixonado por Veículos; Desafiar o Ego; Direção Defensiva | 56 | Integrado |
| Paranormais | Ácido Corrosivo; Dead Man Switch; Paralinguística Ampliada | 57 | Integrado |
| Trilha de Ocultista | Criptologista do Oculto: Método Intuitivo; Caligrafia Eficiente; Decifrar à Distância; Selo Supremo | 58 | Integrado |
| Regalias de veículos | Conversão de Combustível para Alto Rendimento; Gaiola de Proteção; Indução Forçada; Pneus Run-Flat ou com Gel Selante; Sistema de Óxido Nitroso; Sistema Multicombustível Avançado; Sistema de Snorkel Selado; Tanques de Lastro Hidrodinâmicos; Vedação Hermética | 59 | Fora do escopo — depende da regra opcional de Veículos Operacionais (AS #3), que ainda não existe no site |
| Itens | Câmera Filmadora; Faixas da Vidência; Joias da Mente; Larva da Fúria; Skate Caótico; Tênis Lépidos | 60–61 | Integrado, com pixel art (sprites reaproveitados) |
| Elemento e poderes | Transmissão (Conhecimento e Energia simultâneos); Conexão Comunicativa; Sincronia Conectiva; Transmissão de Perícia; Transmissão de Poder; Transmissão de Ritual | 46, 62–63 | Integrado como Poderes Paranormais, grupo "Transmissão"; pré-requisito do Sino de Transmissão e a exigência de dois ou mais seres registrados no campo de requisito |
| Ameaças | Hospedeiro Parasitado e quatro perfis; Hospedeiro Aflorado; Interflorado; Fummu; Doppelganger Civil/Combatente/Cultista e forma monstruosa; Bilu; Rastropoda; Memoflígico | 36–51 | Fora do escopo — site não tem interface de Ameaças |
| Perigos complexos | Explosão em Contagem Regressiva; Fuga de Horda de Criaturas; Navio Naufragando; Prédio Ocupado por Criaturas; Chuva de Sangue | 66–69 | Fora do escopo — site não tem interface de Ameaças |

Divergências: p. 39 remete Trêmulo a AS #05 p. 124, página inexistente; a regra encontra-se em AS #3 p. 124. Rituais de NPCs têm círculo/DT próprios (p. 45, Tela de Ruído Energia 1); não substituir automaticamente os dados canônicos do catálogo.

## AS #6 — inventário de diferenças identificado

Texto integral das páginas 1–84 lido. O arquivo fornecido é a **versão 1.1**, conforme expediente e erratas das páginas 83–84. Todos os registros abaixo ainda aguardam comparação e implementação.

| Categoria | Conteúdo | Página |
|---|---|---:|
| Origens | Cientista Ex-Panacea; Cobaia Sobrevivente; Segurança Ex-Panacea | 66 |
| Combatente | Análise Combativa; Especialista em Proteção Leve | 67 |
| Especialista | Doutor em Emergências; Farmacêutico de Campo; Médico da Salvação; Resgatar da Morte; Veterano da Equipe de Trauma | 68 |
| Ocultista | Barreira do Oculto; Grão-Mestre em Elemento | 69 |
| Geral | Adaptação Climática; Especialista em Armas Improvisadas; Muito Sorrateiro | 70 |
| Paranormais | Escudo Espiral Temporal; Grilhões de Lodo; Salto de Dados | 71 |
| Ritual | Hesitação Forçada (Conhecimento), três versões | 72 |
| Itens | Anel Invertido; Aplicador de Adrenalina; Lança-nitrogênio | 73 |
| Maldições de medicamentos | Aceleração Espiral; Esforço Espiral | 74 |
| Modificações de medicamentos | Emulsificante Químico; Potencializador Químico | 74 |
| Doenças | Crise Alérgica; Crise Hipertensiva; Crise Hipocondríaca; Infecção Cerebral; Infecção Generalizada | 75 |
| Venenos (dados abstratos de jogo) | Batracotoxina; Cianeto de Potássio; Gás Neurotóxico; Ricina; Toxina Cardiotóxica | 76 |
| Regra opcional | Categoria de veneno por DT | 76 |
| Regra opcional não canônica publicada | Evolução Modular: poderes de utilidade/combate alternados; Versatilidade restrita à primeira habilidade de outra trilha | 80–81 |
| Aliados | Alice Cruzes; Ketan Arjuna; Laila Verdante; Dr. Neruda | 28, 33, 37, 41 |
| Ameaças | Alice Cruzes; Ketan Arjuna; Laila Verdante; Dr. Neruda; Cientista da Panacea; Manda-chuva da Panacea; Segurança da Panacea; Hikikomori; Marca-Passo; Estímulo; Experimento Ssabáka | 28, 33, 37, 41, 56–63 |

Erratas aplicáveis: não adicionar Dominador de Elemento (substituído por Barreira do Oculto); não atribuir Sangue ao ritual Hesitação Forçada; Hikikomori, Marca-Passo e Estímulo têm Sangue secundário. O texto remete venenos à p. 77, mas a tabela está na p. 76. A Crise Hipocondríaca não fornece perícia/DT própria; não inventar esse valor. Salto de Dados necessita restauração mecânica limitada à ficha, preservando identidade, conta e dados de sincronização.

## AS #7 — inventário de diferenças identificado

Texto integral das páginas 1–93 lido. Narrativas e ilustrações não serão reproduzidas; registros de regras usam números e descrições neutras resumidas. Todos os registros abaixo aguardam implementação.

| Categoria | Conteúdo | Página |
|---|---|---:|
| Origens | Exorcizado; Sensitivo Rebelde | 80 |
| Perícia | Religião: Resguardar Espírito | 80 |
| Ritual | Vampirismo: três versões e cinco efeitos sensoriais | 76–77 |
| Itens | Carranca Caçadora; Cajado da Cruz de Sangue; Pé de Coelho; Sal Dourado; Terço Maculado | 78–79 |
| Trilha de Especialista | Monstruoso: Ser Experimentado; Ser Testado; Ser Expurgado; Ser Apavorante, com quatro elementos | 81–84 |
| Trilha de Ocultista | Monstruoso: Ser Escarificado; Ser Perfurado; Ser Rasgado; Ser Mutilado, com quatro elementos | 85–88 |
| Ameaças | Raziel; O Verdadeiro Raziel; Alvira; Sabara; Velisar; Zéfero; Incinerado; Stryzga; Apóstata (quatro estágios) | 40–45, 65, 67, 70–73 |
| Condição progressiva | Mentem Corrumpere, vinculada à Apóstata | 70–71 |
| Regra opcional não canônica publicada | Regras debaixo d’água; combate submerso; pressão | 92–93 |

Divergências: Alvira p. 42 referencia Vampirismo como página `@@`; a regra está nas pp. 76–77. Incinerado p. 65 lista imunidade e vulnerabilidade a fogo simultaneamente e resistência/vulnerabilidade balística; Stryzga p. 67 também lista resistência/vulnerabilidade balística. Preservar o conflito e não decidir silenciosamente uma errata não fornecida. As grafias Stryzga/Strzyga e Zéfero/Zéfiro aparecem alternadas; usar uma identidade com aliases. As trilhas Monstruoso são variantes por classe, não duplicatas do Combatente.

## Checkpoint técnico — catálogos preparados, ainda não publicados

- Dados novos sem coincidência de nomes/aliases com a base: 9 origens; 31 poderes de classe; 12 gerais; 11 paranormais; 11 poderes de história; 28 habilidades de trilha (incluindo 3 aplicações da trilha geral Performático); 3 rituais; 26 itens; 5 modificações e 2 maldições; 22 aliados; 18 regalias e 4 perfis de veículo; 5 doenças e 5 venenos abstratos de jogo.
- Pré-requisitos estruturados: alternativas de atributos, graus de perícia, poderes anteriores, NEX e elegibilidade de história. As referências a poderes anteriores foram encontradas no catálogo atual. Afinidades de novos poderes exigem segunda aquisição, além do elemento correspondente.
- Controles independentes implementados: cena de hacking, veículos, tabelas de animais/categoria de veneno/construção/dardos e pressão submersa. Ainda sem interface.
- Testes: `node --test tests/supplement-rules-regression.mjs`: 9/9. A suíte original passou 38/38 antes das alterações; ainda deve ser executada após a integração. Um erro no limite de VD animal em NEX 99 foi detectado e corrigido pelo teste.
- Classificação de Evolução Modular: mapeamento editorial conforme os critérios da p.80; poderes dependentes de escolhas permanecem condicionados à escolha ou ao registro do mestre, sem categoria adivinhada. Padrão permanece desligado.
- AS4 p.73: o imprevisto de quatro resultados 1 restaura PS; não concede novos dados virtuais. No caso de rerrolagem por Cobrir Rastros, são contados os resultados finais.
- AS3 p.127 não especifica velocidade de manobra para resultado inferior a 5: o controle apresenta 0 até novo teste/decisão do mestre, sem inventar faixa adicional.
- Não publicados: nenhum catálogo principal, fluxo de criação, login, inventário visual ou pixel art foi alterado neste checkpoint.

Próximas etapas: efeitos/ativações, integração de escolhas e progressão, condições/inventário, dados completos de ameaças/perigos, cobertura de todos os registros, testes de criação/level up/PE/PD e regressões; depois publicação.

## Retomada em 14/09/2026 — interrupção do ambiente local

A auditoria completa permanece **inacabada e sem publicação**. O checkpoint remoto anterior é `76a86a0fa1b4a57c8a2e3e0c3cdec7a7e08547ed`, na branch `content-audit-as3-as7`; contém os catálogos e controles descritos acima, além dos 9 testes específicos que passaram naquele checkpoint. O site principal não recebeu esses catálogos.

Adição independente solicitada pelo usuário: **Revoltado / Antes Só**, publicada em `72cd602e466c801d01630fabb195d4188477032a`. Origem única, Furtividade e Vontade, bônus condicionais de Defesa/perícias/limite de PE ou PD; metadados remetem ao marca-páginas de César, não ao livro básico. Detalhes em `docs/revoltado-audit.md`. Suíte principal: **44 testes aprovados**, nenhum erro. Actions #56: https://github.com/SquareBurst35/FOP/actions/runs/34867069856 . Esta branch incorpora a adição para evitar sua perda quando a auditoria for integrada.

### Ponto de leitura

Não há PDF parado no meio da leitura textual: AS3 até p.142, AS4 até p.79, AS5 até p.70, AS6 até p.84 e AS7 até p.93. O bloqueio ocorreu durante implementação de efeitos/ativações após essa leitura. Continuam pendentes conferências visuais e a transcrição estruturada das ameaças a partir das páginas indicadas nas tabelas. A ferramenta de navegação também não conseguiu abrir o Pages nesta sessão; a publicação está confirmada pelo Actions, sem teste visual no navegador.

### Rascunhos locais posteriores ao checkpoint

Antes de o ambiente ficar indisponível, foram criados rascunhos em `supplements/state.js`, `engine.js`, `handlers-general.js`, `handlers-powers.js` e `ritual-support.js`, no checkout scratch `/workspace/scratch/f92e9837d004/FOP`. Esses cinco arquivos **não estão neste commit nem tiveram testes concluídos**. Não foi possível ler ou preservar seus conteúdos pelo conector do GitHub após a interrupção. Ao recuperar o ambiente, inspecionar o estado local antes de qualquer reset; se não existirem mais, reconstruí-los a partir dos dados já versionados. Não considerá-los implementação validada.

### Ordem de continuação

1. Recuperar os PDFs e o checkout local. Preservar alterações locais e a pasta de QA existente antes de reconciliar com esta branch.
2. Completar os handlers de itens, trilhas e rituais, sua ligação ao motor de efeitos e cobertura de todas as ativações. Não ligar rascunhos incompletos ao app.
3. Conferir referências de regras existentes: Criar Selo não foi encontrado no catálogo; os custos de Paramédico/Médico da Salvação, DTs, recuperação em interlúdio e conversões de SAN no modo PD precisam de verificação. Não preencher lacunas por suposição.
4. Corrigir riscos identificados nos rascunhos: normalização de recursos ausentes, histórico limitado a 30 registros, atomicidade de ações com múltiplos custos, efeitos passivos sem acumulação e restauração de Salto de Dados sem alterar identidade/conta/inventário externo.
5. Integrar catálogos, criação, evolução, escolhas/pré-requisitos/afinidade, habilidades, PE/PD, rituais, condições, inventário e modificações. Manter IDs antigos e valores manuais.
6. Estruturar integralmente ameaças, variantes, estágios, perigos complexos e tabela de criação, com fonte/página e divergências explícitas; não criar interface de Ameaças.
7. Completar testes mecânicos e regressões, conferir a aplicação e somente então publicar a auditoria completa.

Nenhuma alteração de login, estrutura do Firebase, sincronização ou visual foi feita para Revoltado. Os testes de persistência reutilizam o armazenamento e o codec existentes.
