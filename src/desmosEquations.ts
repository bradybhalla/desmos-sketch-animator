import * as utils from "./utils";
import { FourierSeries, FourierSeriesCoeffs } from "./fourierSeries";

// DEMSOS_LIST_EQUATION
// D_{raw}\left(F_{S}\right)=\left(F_{S}\left[1\right]+\operatorname{total}\left(F_{S}\left[2...\frac{\operatorname{length}\left(F_{S}\right)+2}{4}\right]\cos\left(\left[1...\frac{\operatorname{length}\left(F_{S}\right)-2}{4}\right]t+F_{S}\left[\frac{\operatorname{length}\left(F_{S}\right)-2}{4}+2...\frac{\operatorname{length}\left(F_{S}\right)}{2}\right]\right)\right),F_{S}\left[\frac{\operatorname{length}\left(F_{S}\right)+2}{2}\right]+\operatorname{total}\left(F_{S}\left[\frac{\operatorname{length}\left(F_{S}\right)+4}{2}...\frac{3\operatorname{length}\left(F_{S}\right)+2}{4}\right]\cos\left(\left[1...\frac{\operatorname{length}\left(F_{S}\right)-2}{4}\right]t+F_{S}\left[\frac{3\operatorname{length}\left(F_{S}\right)+6}{4}...\operatorname{length}\left(F_{S}\right)\right]\right)\right)\right)

/**
 * Subclass of {@link FourierSeries} which has added functionality for
 * generating desmos graphs
 */
export class DesmosFourierSeries extends FourierSeries {
  constructor(X: number[], Y: number[], n: number = 30) {
    super(X, Y, n);

  }

  /**
   * Helper method to do something separately for x,y components of the FS and then combine
   * 
   * @template T - output type of function to apply separately
   * @template U - overall output type
   * 
   * @param separate - function which takes FourierSeriesCoeffs and number of terms and does the desired operation
   * @param combiner - function which combines the two halves
   * @param terms - the number of terms
   */
  protected combiner<T, U>(separate: (coeffs: FourierSeriesCoeffs, terms: number) => T, combiner: (x: T, y: T) => U, terms: number): U {
    return combiner(separate(this.coeffs.x, terms), separate(this.coeffs.y, terms));
  }

  /**
   * Returns desmos equation
   * 
   * @param terms - number of terms to return, -1 to return all
   */
  getDesmosExpanded(terms: number = - 1): string {
    const separate = (coeffs: FourierSeriesCoeffs, terms: number) => {
      let result: string[] = [];
      result.push("" + utils.round(coeffs.const));
      for (let i = 0; i < (terms == -1 ? this.n : terms); i++) {
        const a: number = coeffs.cos[i];
        const b: number = coeffs.sin[i];
        result.push(`${utils.round(utils.sqrt(a * a + b * b))}\\cos\\left(2\\pi\\cdot${i + 1}t+${-utils.round(utils.atan2(b, a))}\\right)`);
      }
      return result.join("+");
    };
    const combiner = (x: string, y: string) => `\\left(${x},${y}\\right)`;
    return this.combiner<string, string>(separate, combiner, terms);
  }

  /**
   * Returns Fourier Series data in string form, see DEMSOS_LIST_EQUATION for displaying
   * 
   * 
   * @returns list numbers [constx, ...ax, ...bx, consty, ...ay, ...by] where the equation is (constx + ax*cos(n*t+bx), consty + ay*cos(n*t+by))
   */
  getDesmosList(terms: number = -1): string {
    const separate = (coeffs: FourierSeriesCoeffs, terms: number) => {
      let A: number[] = [];
      let B: number[] = [];
      for (let i = 0; i < (terms == -1 ? this.n : terms); i++) {
        const a: number = coeffs.cos[i];
        const b: number = coeffs.sin[i];
        A.push(utils.round(utils.sqrt(a * a + b * b)));
        B.push(-utils.round(utils.atan2(b, a)));
      }
      return [utils.round(coeffs.const), ...A, ...B];
    };
    const combiner = (x: number[], y: number[]) => `\\left[${[...x, ...y]}\\right]`;
    return this.combiner<number[], string>(separate, combiner, terms);
  }
}