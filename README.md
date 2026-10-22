# FOP — Fichas Ordem Paranormal

Aplicativo web para criar e usar fichas interativas em mesas de Ordem Paranormal RPG.

## O que já está disponível

- Criação guiada, progressão de NEX/nível e escolhas de poderes e habilidades.
- Ficha interativa com PV, PE, Sanidade, perícias, Defesa e resistências.
- Rituais com versões, custos, efeitos ativos e histórico de uso com desfazer.
- Inventário com modificações, maldições e ícones em pixel art.
- Mesa de operações do AS #9: cálculos de combate, munição, tática, drones
  individuais, aliados e veículos, com recursos e ações reversíveis.
- Catálogo de ameaças com busca e fichas de consulta para o mestre.
- Salvamento automático no navegador e sincronização opcional com Google/Firestore.
- Interface para computador e celular, com efeitos visuais e opção de movimento reduzido.

Os catálogos incluem conteúdo do livro base, Sobrevivendo ao Horror e Arquivos
Secretos #1–#7 e #9, com resumos mecânicos próprios. A apuração do pacote de
setembro está em [docs/as09-audit.md](docs/as09-audit.md). Veja os controles
automáticos e o contexto informado pela mesa em
[docs/as09-automation.md](docs/as09-automation.md). Veja o [ponto de retomada](docs/estado-atual.md)
para entender a organização do código e as auditorias existentes.

## Abrir localmente

Use Node.js 22 ou superior. Não é necessário instalar dependências nem compilar.

```sh
npm run dev
```

Abra <http://127.0.0.1:4173>. O servidor atende somente nesta máquina; recarregue
a página depois de editar. Encerre com `Ctrl+C`. A porta pode ser configurada
pela variável de ambiente `PORT`.

Também é possível servir esta pasta com qualquer servidor HTTP estático.
As fichas ficam vinculadas à origem do navegador: a prévia local tem seu próprio
armazenamento, separado do site publicado. Login local depende de o domínio
estar autorizado no Firebase; a ficha funciona sem login.

## Validar alterações

```sh
npm run check
npm test
```

O primeiro comando verifica a sintaxe dos módulos, scripts e testes. O segundo
executa a suíte de regressão. Confira também o fluxo alterado no navegador,
incluindo celular quando houver mudança de interface.

## Publicação

O [site publicado](https://squareburst35.github.io/FOP/) usa GitHub Pages.
O workflow em `.github/workflows/` valida o projeto antes de publicar os pushes
na `main`. O site continua estático, em HTML, CSS e JavaScript puro.

## Segurança

Como os dados são protegidos e o que o dono do projeto precisa conferir nos
painéis do Firebase e do GitHub: [docs/security.md](docs/security.md).

## Aviso

Projeto de fã não oficial. Ordem Paranormal pertence aos seus respectivos
criadores e detentores de direitos. Nenhum texto integral dos livros é
distribuído neste repositório.
