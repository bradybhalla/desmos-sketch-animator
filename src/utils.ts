export const PI = Math.PI;
export const TWO_PI = 2 * Math.PI;

export const cos = Math.cos;
export const sin = Math.sin;
export const sqrt = Math.sqrt;
export const atan2 = Math.atan2;

export const abs = Math.abs;
export const floor = Math.floor;
export const pow = Math.pow;
export const log = Math.log;
export const min = Math.min;
export const max = Math.max;


/**
 * Calculates a%n with a positive result
 */
export const mod = (a: number, n: number): number => {
  return ((a % n) + n) % n;
};

/**
 * Rounds to the nearest 1/10000
 */
export const round = (x: number, places: number = 4): number => {
  return Math.round(x * Math.pow(10, places)) / Math.pow(10, places);
};