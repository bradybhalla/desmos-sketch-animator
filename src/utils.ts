export const PI = Math.PI;
export const TWO_PI = 2 * Math.PI;

export const cos = Math.cos;
export const sin = Math.sin;
export const sqrt = Math.sqrt;
export const atan2 = Math.atan2;

/**
 * Calculates a%n with a positive result
 */
export const mod = (a: number, n: number): number => {
  return ((a % n) + n) % n;
};

/**
 * Rounds to the nearest 1/10000
 */
export const round = (x: number): number => {
  return Math.round(x * 10000) / 10000;
};