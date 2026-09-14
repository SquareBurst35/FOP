// Supplement records contain paraphrased game mechanics, never extracted book prose.
export const slug = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const sourceFor = book => `Arquivos Secretos #${book}`;
export function power(book, page, category, name, summary, mechanics = {}) {
  const { cost = 'Passivo', requirement = 'Nenhum', unlockNex = 0, group = `Poderes de ${category}`, ...rules } = mechanics;
  return { id: `as${book}-${slug(category)}-${slug(group)}-${slug(name)}`, name, category, group,
    summary, cost, requirement, unlockNex, unlockStage: 0, source: sourceFor(book), sourcePage: page,
    page: String(page), details: [], mechanics: rules };
}
export function origin(book, page, name, skills, powerName, summary, mechanics = {}) {
  return { name, skills, power: powerName, source: sourceFor(book), sourcePage: page, page: String(page),
    ability: power(book, page, 'Origens', powerName, summary, { ...mechanics, group: name }) };
}
export function trail(book, page, category, group, nex, name, summary, mechanics = {}) {
  return power(book, page, category, name, summary, { ...mechanics, unlockNex: nex, group, acquisition: 'trail' });
}
export function item(book, page, name, group, category, spaces, summary, mechanics = {}) {
  return { id: `as${book}-item-${slug(name)}`, name, group, category, spaces, summary,
    source: sourceFor(book), sourcePage: page, page: String(page), details: [], mechanics };
}
export function ritual(book, page, name, element, circle, summary, variants, mechanics = {}) {
  const base = [0, 1, 3, 6, 10][circle];
  return { id: `as${book}-ritual-${slug(name)}`, name, element, elements: [element], circle,
    summary, cost: `${base} PE/PD`, source: sourceFor(book), sourcePage: page, page: String(page),
    details: [], useVariants: { variants }, mechanics };
}
export const all = (...requirements) => ({ all: requirements });
export const any = (...requirements) => ({ any: requirements });
export const attribute = (key, minimum) => ({ attribute: key, minimum });
export const skill = (name, rank = 5) => ({ skill: name, rank });
export const ability = name => ({ ability: name });
export const action = (id, label, cost, activation, extra = {}) => ({ id, label, cost, activation, ...extra });
export const modifier = (stat, amount, when = 'always', extra = {}) => ({ stat, amount, when, ...extra });
export const limit = (scope, maximum = 1, perTarget = false) => ({ scope, maximum, perTarget });
