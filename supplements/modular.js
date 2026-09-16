// Editorial classification under AS06 p.80, not a change to the standard progression.
// Ambiguous powers require a table ruling instead of a guessed default category.
const combat = new Set([
  'Acuidade com Arma', 'Armamento Pesado', 'Ataque de Oportunidade', 'Combater com Duas Armas', 'Combate Defensivo', 'Golpe Demolidor', 'Golpe Pesado', 'Proteção Pesada', 'Reflexos Defensivos', 'Saque Rápido', 'Segurar o Gatilho', 'Sentido Tático', 'Tanque de Guerra', 'Tiro Certeiro', 'Tiro de Cobertura', 'Apego Angustiado', 'Correria Desesperada', 'Paranoia Defensiva', 'Valentão', 'Predador Perfeito', 'Golpes de Arena', 'Marteladas',
  'Balística Avançada', 'Movimento Tático', 'Ninja Urbano', 'Perito em Explosivos', 'Assassinato Furtivo', 'Especialista em Matar',
  'Especialista em Elemento', 'Fluxo de Poder', 'Mestre em Elemento', 'Ritual Potente', 'Ritual Predileto', 'Tatuagem Ritualística', 'Domínio Esotérico', 'Traçado Conjuratório', 'Reter Ritual de Combate', 'Ritual Intenso', 'Saúde Sobrenatural', 'Liturgia de Fortalecimento Ritualístico',
]);
const utility = new Set([
  'Incansável', 'Presteza Atlética', 'Instinto de Fuga', 'Caminho para Forca', 'Ciente das Cicatrizes', 'Engolir o Choro', 'Sacrificar os Joelhos', 'Sem Tempo, Irmão', 'Mochileiro',
  'Conhecimento Aplicado', 'Hacker', 'Mãos Rápidas', 'Mochila de Utilidades', 'Na Trilha Certa', 'Nerd', 'Pensamento Ágil', 'Primeira Impressão', 'Acolher o Terror', 'Flashback', 'Contatos Oportunos', 'Mãos Firmes', 'Disfarce Sutil', 'Esconderijo Desesperado', 'Leitura Fria', 'Plano de Fuga', 'Remoer Memórias', 'Resistir à Pressão',
  'Camuflar Ocultismo', 'Criar Selo', 'Envolto em Mistério', 'Guiado pelo Paranormal', 'Identificação Paranormal', 'Intuição Paranormal', 'Nos Olhos do Monstro', 'Olhar Sinistro', 'Deixe os Sussurros Guiarem', 'Estalos Macabros', 'Minha Dor me Impulsiona', 'Sentido Premonitório', 'Sincronia Paranormal', 'Acostumado à Maldição de <Elemento>',
]);
const variable = new Set(['Transcender', 'Treinamento em Perícia', 'Especialista Diletante', 'Dominar Habilidade Ritualística', 'Ferramentas Paranormais']);
export function modularClassification(entry, character = {}) {
  if (entry.category === 'Gerais') return 'geral';
  if (entry.category === 'Poderes Paranormais' || entry.category === 'Paranormais') return 'paranormal';
  const override = character.supplementState?.modularClassifications?.[entry.id];
  if (['combate', 'utilidade'].includes(override)) return override;
  if (entry.mechanics?.modularGroup) return entry.mechanics.modularGroup;
  if (combat.has(entry.name)) return 'combate';
  if (utility.has(entry.name)) return 'utilidade';
  if (variable.has(entry.name)) return 'choice';
  return 'unclassified';
}
export function modularPowerAllowed(entry, kind, character = {}, chosenEntry = null) {
  const classification = modularClassification(entry, character);
  if (classification === 'geral') return true;
  if (classification === 'choice') {
    if (entry.name === 'Transcender') return kind === 'combate';
    return Boolean(chosenEntry && modularClassification(chosenEntry, character) === kind);
  }
  return classification === kind;
}
