// Arquivos Secretos #9, pp. 44–46. Resumos mecânicos próprios.
export const DRONE_TYPES = Object.freeze([
  { id: "atirador", name: "Drone Atirador", page: "44", summary: "+1d20 em ataques. Metralhar Tudo: ao atacar, gaste 2 PE; um acerto causa +2d8 balístico." },
  { id: "espiao", name: "Drone Espião", page: "45", summary: "+1d20 em Investigação e Percepção ajudadas pelo drone e visão no escuro. Por 2 PE, até o fim da cena ganha visão térmica que ignora camuflagem e permite testes de Tecnologia para captar rádio (DT definida pelo mestre)." },
  { id: "hacker", name: "Drone Hacker", page: "45", summary: "+1d20 em Tecnologia ajudada pelo drone; pode hackear sem fio ou junto ao terminal. Por 2 PE, evita a penalidade por hackear como ação completa. Permite uma nova tentativa com a mesma informação; por 3 PE, evita rastreamento após falha por 5 ou mais." },
  { id: "inteligente", name: "Drone Inteligente", page: "45", summary: "Comandos de voz dispensam as mãos para operar. Por 2 PE, ativa braços até o fim da cena: transporta até 5 espaços de itens e realiza manipulações simples e lentas." },
  { id: "medico", name: "Drone Médico", page: "45", summary: "Concede treinamento em Medicina ou +1d20 se já treinado. Robô ao Resgate: 2 PE recuperam 2d8+2 PV de um alvo adjacente ao drone." },
  { id: "protetor", name: "Drone Protetor", page: "45", summary: "+5 na Defesa. Alerta de Ameaça: ao resistir, gaste 2 PE para somar +5 nesse teste." },
  { id: "utilitario", name: "Drone Utilitário", page: "45", summary: "Escolha uma perícia, exceto Fortitude, Luta, Pontaria, Reflexos e Vontade: +1d20 nela; a escolha é permanente. Meu Amigo Drone: após falhar nessa perícia, 3 PE permitem uma única nova tentativa." },
]);
