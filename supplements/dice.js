export const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
export const bounded = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, finite(value, minimum)));
export function integer(value, minimum = 0, maximum = 100000) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < minimum || n > maximum) throw new Error(`Informe um número inteiro entre ${minimum} e ${maximum}.`);
  return n;
}
export function die(sides, random = Math.random) {
  integer(sides, 2, 1000);
  return 1 + Math.floor(bounded(random(), 0, 0.999999999999) * sides);
}
export function roll(expression, random = Math.random) {
  if (typeof expression === 'number') return { total: finite(expression), dice: [], expression: String(expression) };
  const match = String(expression).replace(/\s/g, '').match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) throw new Error('Fórmula de dados inválida.');
  const count = integer(match[1], 1, 100), sides = integer(match[2], 2, 1000);
  const dice = Array.from({ length: count }, () => die(sides, random));
  return { total: dice.reduce((sum, n) => sum + n, Number(match[3] || 0)), dice, sides, expression: String(expression) };
}
export function check(dice, bonus, random = Math.random) {
  const count = integer(dice, 0, 100), values = Array.from({ length: count || 2 }, () => die(20, random));
  return { dice: values, bonus: finite(bonus), total: (count ? Math.max(...values) : Math.min(...values)) + finite(bonus) };
}
export function transaction(value, operation) {
  try {
    const next = structuredClone(value), outcome = operation(next) || {};
    return { ok: true, next, ...outcome };
  } catch (error) { return { ok: false, message: error.message }; }
}
