---
name: FOP — Fichas Ordem Paranormal
description: Ficha de agente interativa para Ordem Paranormal RPG, desenhada como o dossiê confidencial de um arquivo amaldiçoado
colors:
  background: "#060708"
  surface: "#0d0f11"
  surface-raised: "#15181b"
  surface-soft: "#1c2024"
  border: "#292e33"
  border-strong: "#535b63"
  text: "#f3f1eb"
  muted: "#a6a9aa"
  faint: "#73797d"
  red: "#d92332"
  red-bright: "#ff3c4b"
  red-dark: "#8f101d"
  red-soft: "rgba(217, 35, 50, 0.13)"
  cyan: "#6dd7e3"
  green: "#52c77c"
  warning: "#f3b84b"
  blood: "#df2938"
  death: "#aeb4b7"
  knowledge: "#d5aa55"
  energy: "#a453ff"
  fear: "#d9f7ff"
  parchment-gold: "#b8a970"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.7rem)"
    fontWeight: 900
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.78rem"
    fontWeight: 800
    letterSpacing: "0.13em"
    textTransform: uppercase
  numeral:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontWeight: 900
    fontFeature: "tabular-nums"
rounded:
  pill: "999px"
  circle: "50%"
  md: "12px"
  sm: "7px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "22px"
  xl: "34px"
components:
  button-primary:
    backgroundColor: "linear-gradient(180deg, #e93440, #b91828)"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "linear-gradient(180deg, #f1424e, #c61d2d)"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  badge:
    backgroundColor: "rgba(255, 255, 255, 0.03)"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
  badge-red:
    backgroundColor: "{colors.red-soft}"
    textColor: "#ff9ca4"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "18px"
---

# Design System: FOP — Fichas Ordem Paranormal

## Overview

**Creative North Star: "O Arquivo Amaldiçoado"**

Cada ficha do FOP se comporta como um dossiê confidencial que a Ordo Realitas mantém sobre um agente: fundo quase preto, nevoeiro lento e composto ao redor da tela inicial, um selo oculto desenhado à mão (`assets/archive-seal.svg`, círculos quebrados e glifos originais) ecoado no próprio brand-mark do topo. O vermelho-sangue não decora — é o carimbo de alerta do arquivo: ações primárias, avisos e o indicador de foco em campos de formulário usam a mesma cor de "isto importa agora". Fora isso, o sistema é deliberadamente contido: superfícies escuras quase planas, uma paleta neutra de cinzas frios, e o vermelho reaparecendo com rara disciplina.

O tom é investigativo e tenso, nunca festivo. Isto é explicitamente **não** uma ficha de fantasia colorida e whimsical (o oposto do estilo D&D Beyond) e **não** um dashboard SaaS genérico — não há cartões pastel, ícones fofos ou gradientes multicoloridos decorativos. A tensão é sugerida, não gritada: nevoeiro que se move devagar, brilho vermelho pontual em vez de alarme piscando, glifos ocultos quebrados em vez de completos.

Dentro desse mundo escuro vive uma exceção deliberada: o painel do boneco de equipamento (paperdoll) muda de paleta para um dourado-pergaminho envelhecido com títulos em serifada, como se fosse a página de um livro-razão físico dentro do dossiê digital — o "arquivo dentro do arquivo".

**Key Characteristics:**
- Fundo quase preto (`#060708`) com nevoeiro/textura sutil, nunca uma superfície limpa e clara.
- Vermelho-sangue como único sinal de urgência/ação primária; todo o resto é neutro.
- As cinco cores dos elementos paranormais do próprio jogo (Sangue, Morte, Conhecimento, Energia, Medo) codificam os recursos da ficha (PV, PE, Sanidade, PD, PP) e os rituais — nunca são usadas como decoração arbitrária.
- Superfícies quase planas; profundidade é sugerida por brilho colorido (glow), não por sombra empilhada.
- Um selo oculto original e quebrado é o motivo geométrico recorrente (círculos incompletos, quadrados sobrepostos, glifos radiais).
- Rótulos secundários gritam em versalete rastreado (uppercase, letter-spacing largo); títulos principais sussurram com tracking negativo e peso pesado.

## Colors

A paleta é quase monocromática (preto, cinza-carvão, branco-osso) com vermelho-sangue como único acento decisivo e ciano como contraponto frio de foco/dados — mais as cinco cores canônicas dos elementos paranormais do próprio sistema de jogo, reservadas exclusivamente ao seu significado mecânico.

### Primary
- **Vermelho-Sangue** (`#d92332`, brilho em `#ff3c4b`, sombra em `#8f101d`): cor de ação e alerta — botões primários, foco de campo, o eyebrow que abre cada seção, a barra ativa das abas da ficha. É a única cor que "chama".

### Secondary
- **Ciano Espectral** (`#6dd7e3`): contraponto frio, usado com moderação — anel de foco padrão em elementos interativos, cor-base do medidor de PE antes de ele ser sobrescrito pela cor do recurso.

### Tertiary — Paleta dos Elementos Paranormais
Estas cinco cores pertencem ao próprio sistema de Ordem Paranormal (Sangue, Morte, Conhecimento, Energia, Medo) e no site codificam ao mesmo tempo os rituais por elemento e os recursos da ficha que compartilham esse nome:
- **Sangue** (`#df2938`): PV (pontos de vida) e rituais do elemento Sangue.
- **Morte** (`#aeb4b7`, cinza-osso): rituais do elemento Morte.
- **Conhecimento** (`#d5aa55`, dourado): Sanidade e rituais do elemento Conhecimento — também é a base do dourado-pergaminho do paperdoll.
- **Energia** (`#a453ff`, roxo): PD (pontos de deslocamento/dano, conforme a mecânica) e rituais do elemento Energia.
- **Medo** (`#d9f7ff`, ciano-pálido quase branco): rituais do elemento Medo.
- **PP** (`#ff7690`, rosa): sexto recurso da ficha, fora da paleta de elementos — cor própria por não ter um elemento paranormal correspondente.

### Neutral
- **Fundo** (`#060708`): base de toda a aplicação.
- **Superfície** (`#0d0f11`) / **Superfície Elevada** (`#15181b`) / **Superfície Suave** (`#1c2024`): camadas de cartão e painel, cada vez um pouco mais clara, sem nunca se aproximar de cinza-médio.
- **Borda** (`#292e33`) / **Borda Forte** (`#535b63`): divisores e contornos de campo; a borda forte aparece só em hover/estado ativo.
- **Texto** (`#f3f1eb`, branco-osso, nunca branco puro) / **Neutro Médio** (`#a6a9aa`) / **Neutro Fraco** (`#73797d`): hierarquia de texto por opacidade percebida, não por variar a cor.

### Named Rules
**A Regra do Selo Único.** O vermelho-sangue é reservado para ação/alerta/foco. Nenhum outro elemento de UI genérico (navegação, texto de corpo, ícones neutros) pode usar essa cor — sua raridade é o que faz o olhar ir direto a ela.

**A Regra da Paleta Élemental.** Sangue, Morte, Conhecimento, Energia e Medo só podem colorir algo que seja, de fato, aquele elemento paranormal ou o recurso da ficha com o mesmo nome. Nunca usar essas cores como acento decorativo genérico fora desse contexto.

## Typography

**Display/Body/Label Font:** Inter (com fallback `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`) — uma única família cobre praticamente toda a interface; não há um par de fontes de exibição/corpo.

**Character:** A hierarquia vem do contraste de voz, não de uma segunda fonte: títulos ficam quietos (peso pesado, tracking levemente negativo, sem uppercase) enquanto rótulos secundários gritam (uppercase, tracking largo, peso 700–900). Números de recurso usam o mesmo peso 900 com `tabular-nums`, para que PV/PE/Sanidade não "dancem" ao mudar de valor.

### Hierarchy
- **Display/H1** (900, `clamp(1.75rem, 3vw, 2.7rem)`, 1.08, tracking −0.025em): título de página/seção principal.
- **Title/H2-H3** (600–800, 1–1.18rem): cabeçalhos de cartão e subseção; pouca diferenciação de tamanho entre H2 e H3, a diferença é de contexto.
- **Body** (400, 1rem, 1.5): parágrafos de descrição de habilidades, rituais e itens.
- **Label** (700–900, 0.75–0.86rem, tracking 0.04–0.2em, uppercase): eyebrows, rótulos de campo, badges, cabeçalhos de cartão de recurso — a voz "arquivística" do sistema.
- **Numeral** (900, tamanho variável 1rem–2.2rem, `tabular-nums`): valores de PV/PE/Sanidade e resultados calculados (ex.: DT, dano).

### Named Rules
**A Regra do Sussurro e do Grito.** Um título nunca usa uppercase nem tracking largo; um rótulo secundário nunca deixa de usar. A hierarquia é sempre essa oposição de voz, não apenas tamanho.

**A Exceção do Livro-Razão.** Só o cabeçalho do painel de equipamento (`.paperdoll-panel h3`) troca para serifada (`Georgia, "Times New Roman", serif`). É a única quebra da regra de fonte única no sistema inteiro, e existe só ali para marcar aquele painel como um objeto físico dentro do arquivo digital.

## Layout

Container principal centralizado em `min(1120px, calc(100% - 32px))`, com respiro lateral mínimo de 16px. O ritmo de espaçamento observado gira em torno de uma escala curta e prática — 8px, 12px, 14px, 18px, 22px, 34px — sem uma variável CSS formal para isso; cartões e painéis usam 18–22px de padding interno, grades de cartão (`character-grid`, `resource-grid`) usam 10–18px de gap.

Dois breakpoints de responsividade: **820px** (colunas de wizard/ficha colapsam para pilha única) e **600px** (compactação final de cabeçalho, grades e paperdoll). Não há um terceiro breakpoint de "desktop largo" — o layout satura em 1120px e centraliza o excedente.

### Named Rules
**A Regra do Container Único.** Nenhuma tela foge do container de 1120px centralizado; telas mais densas (ficha, wizard) usam colunas internas (sidebar + conteúdo) em vez de alargar o container.

## Elevation & Depth

O sistema é quase plano por escolha, não por limitação: cartões e painéis usam uma sombra ambiente única e suave (preta, nunca colorida) para se destacar do fundo, e a profundidade real é comunicada por **brilho**, não por empilhamento de sombra. Cor "vaza" para fora do elemento em estados de interesse — foco de campo, hover do brand-mark, barra de recurso preenchida — sempre como um `box-shadow` colorido e difuso na cor do próprio elemento (vermelho, ciano ou a cor do recurso).

### Shadow Vocabulary
- **Ambiente de painel** (`box-shadow: 0 22px 65px rgba(0,0,0,0.48)`, var `--shadow`): sombra padrão de cartões e painéis, sempre preta.
- **Ambiente de cartão de agente** (`box-shadow: 0 10px 30px rgba(0,0,0,0.22)`): variante mais leve para os cartões da lista de personagens.
- **Brilho de foco** (`box-shadow: 0 0 0 3px rgba(217,35,50,0.1), 0 0 24px rgba(217,35,50,0.08)`): campo de formulário focado — o único caso em que o brilho é colorido em vez de preto.
- **Brilho de recurso** (`box-shadow: 0 0 9px var(--resource-color)`): a barra de PV/PE/Sanidade/PD/PP preenchida brilha na cor do próprio recurso.

### Named Rules
**A Regra do Brilho, Não da Sombra.** Uma superfície nunca ganha profundidade empilhando sombras escuras entre camadas. Se algo precisa parecer "ativo" ou "em foco", a resposta é um glow colorido, não mais elevação.

## Shapes

O vocabulário de forma tem três registros claros: **círculo** para tudo que representa uma pessoa ou um selo (avatar, brand-mark, marcador de passo do wizard, `border-radius: 50%`); **cantos levemente arredondados** (`--radius: 12px` para cartões/painéis, `--radius-small: 7px` para botões e campos) para praticamente todo o resto; e **pílula** (`border-radius: 999px`) só para badges/etiquetas. O selo oculto (`archive-seal.svg`) e o brand-mark reforçam o motivo circular com anéis quebrados e quadrados sobrepostos rotacionados — geometria "ritual", nunca um ícone genérico.

### Named Rules
**A Regra do Pixel Intacto.** Toda arte do boneco de equipamento e dos ícones de item usa `image-rendering: pixelated`. Nunca suavizar, redimensionar com antialiasing ou tratar esses sprites como se fossem ilustração vetorial — o serrilhado é o material, não um defeito.

## Components

### Buttons
- **Shape:** cantos levemente arredondados (`border-radius: 7px`), altura mínima de 44px (compacto: 38px).
- **Primary:** gradiente vermelho vertical (`linear-gradient(180deg, #e93440, #b91828)`), borda `#ef4954`, sombra ambiente vermelha suave (`0 8px 24px rgba(185,24,40,0.25)`); hover clareia o gradiente.
- **Ghost:** fundo transparente, borda neutra (`--border`); usado para ações secundárias.
- **Danger:** fundo `--red-soft`, texto rosa-claro (`#ff9ca4`), borda vermelha translúcida — reservado a exclusão/irreversibilidade.
- **Hover/Focus:** todo botão sobe 1px (`translateY(-1px)`) e escurece/clareia a borda; nunca muda de forma.

### Badges
- **Style:** pílula (`border-radius: 999px`), fundo quase transparente (`rgba(255,255,255,0.03)`), texto neutro; variante `.red` para estados de alerta/urgência (fundo `--red-soft`, texto `#ff9ca4`).

### Cards / Containers (Entry Card — componente assinatura)
O `<details>` accordion é o componente mais repetido do site: toda entrada de ritual, poder ou item do catálogo é um `entry-card`. Cabeçalho sempre visível (`summary`, 58px de altura mínima) com título + subtítulo à esquerda e badges/chevron à direita; corpo (`entry-body`) revela mecânica completa (execução, alcance, alvo, duração, resistência) só quando aberto. Chevron vermelho gira 180° ao abrir; o cartão aberto ganha borda mais forte e fundo levemente mais claro, nunca sombra adicional.
- **Corner Style:** `10px`.
- **Background:** `#0d0f12` fechado → `#111419` aberto.
- **Border:** `--border` fechado → `--border-strong` aberto.

### Inputs / Fields
- **Style:** fundo quase preto (`rgba(5,7,9,0.82)`), borda `--border`, cantos `6px`, altura mínima 46px.
- **Hover:** borda clareia para `--border-strong`.
- **Focus:** borda vermelha translúcida + glow vermelho duplo (anel de 3px + halo difuso de 24px) — ver Elevation.
- **Rótulo:** sempre um label uppercase rastreado acima do campo, nunca placeholder-only.

### Navigation (Sheet Tabs)
- **Style:** linha de abas horizontal roláveis, sem fundo próprio, separadas por uma borda inferior neutra.
- **Default/Hover/Active:** texto neutro → texto branco no hover → sublinhado vermelho brilhante (`box-shadow` com glow) que desliza entre abas com `cubic-bezier(0.22, 1, 0.36, 1)`, a curva de movimento padrão do sistema (`--motion`).

### Resource Meter (componente assinatura)
Cada recurso da ficha (PV, PE, Sanidade, PD, PP) é um `live-resource` cujo `--resource-color` muda conforme o elemento paranormal correspondente (Sangue/Ciano/Conhecimento/Energia/rosa). Uma barra fina de 3px, cantos em pílula, preenche proporcionalmente e brilha na própria cor (`box-shadow: 0 0 9px var(--resource-color)`), com transição de largura em 420ms na curva `--motion`. É a aplicação mais literal da Regra do Brilho.

### Paperdoll Panel (componente assinatura)
O único painel do sistema com paleta própria: dourado-pergaminho (`#b8a970` / `rgba(176,164,111,…)`) sobre fundo verde-oliva quase preto (`#17170f`), com textura de linhas horizontais finas simulando papel riscado e uma sombra interna profunda (`inset 0 0 44px rgba(0,0,0,0.48)`) que aproxima o painel de uma página de livro-razão física. Título em serifada (ver Typography). O boneco em pixel art fica ao centro (`image-rendering: pixelated`, sombra projetada suave), ladeado por slots de equipamento em grade; cada slot preenchido ganha uma borda/realce dourados.

## Do's and Don'ts

### Do:
- **Do** reservar vermelho-sangue exclusivamente para ação primária, alerta e foco — nunca decoração.
- **Do** usar as cinco cores de elemento paranormal (Sangue, Morte, Conhecimento, Energia, Medo) só quando o conteúdo é literalmente daquele elemento ou daquele recurso da ficha.
- **Do** manter superfícies quase planas e expressar estado/interatividade como brilho colorido, não como sombra empilhada.
- **Do** opor título quieto (peso pesado, tracking negativo, sem uppercase) a rótulo gritado (uppercase, tracking largo) para toda nova hierarquia de texto.
- **Do** renderizar toda arte pixel (paperdoll, ícones de item) com `image-rendering: pixelated`, nunca suavizada.
- **Do** respeitar `prefers-reduced-motion` desligando nevoeiro/transformações de hover, como `home.css` já faz.

### Don't:
- **Don't** introduzir uma segunda fonte de exibição — Inter cobre a interface inteira, com a única exceção documentada do cabeçalho do paperdoll.
- **Don't** adicionar cores saturadas/pastel fora da paleta estabelecida (vermelho, ciano, os cinco elementos, neutros) — isso quebra o tom investigativo e tenso confirmado para o produto.
- **Don't** empilhar sombras escuras entre camadas para simular profundidade; a resposta certa é glow, não elevação.
- **Don't** tratar o painel de equipamento como só mais um cartão escuro — sua paleta dourado-pergaminho e a serifada no título são intencionais e não devem vazar para o resto da interface, nem o resto da interface deve emprestar essa paleta.
