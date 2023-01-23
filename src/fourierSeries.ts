import * as utils from "./utils";

/**
 * Stores Fourier Series coefficient information
 * @example
 *  {const:5, cos:[1,2], sin:[2,3]} represents:
 *    5 + cos(t) + 2cos(2t) + 2sin(t) + 3sin(2t)
 */
export type FourierSeriesCoeffs = { const: number; cos: number[]; sin: number[]; };

/**
 * Calculate a Fourier Series to approximate a set of points
 * in a 2d plane
 */
export class FourierSeries {
  // input data
  protected X: number[];
  protected Y: number[];

  // number of terms
  protected n: number;

  // time values
  protected T: number[];

  // coefficients
  protected coeffs: { x: FourierSeriesCoeffs; y: FourierSeriesCoeffs; };

  /**
   * @param X - array of x-coordinates
   * @param Y - array of y-coordinates (same length as `X`)
   * @param n - number of terms to generate
   */
  constructor(X: number[], Y: number[], n: number = 30) {

    this.X = X;
    this.Y = Y;

    this.n = n;

    // use overall distance for time domain
    this.T = [];
    let currentTotal = 0;
    for (let i = 0; i < this.X.length - 1; i++) {
      this.T.push(currentTotal);
      currentTotal += utils.sqrt((this.X[i + 1] - this.X[i]) ** 2 + (this.Y[i + 1] - this.Y[i]) ** 2);
    }
    this.T.push(currentTotal);
    currentTotal += utils.sqrt((this.X[0] - this.X[this.X.length - 1]) ** 2 + (this.Y[0] - this.Y[this.X.length - 1]) ** 2);
    for (let i = 0; i < this.T.length; i++) {
      this.T[i] *= utils.TWO_PI / currentTotal;
    }

    // calculate coefficients
    this.coeffs = {
      x: this._oneDimFS(this.T, this.X),
      y: this._oneDimFS(this.T, this.Y),
    };

  }

  /**
   * Returns coefficients of Fourier Series
   * 
   * @param terms - number of terms to return, -1 to return all
   */
  getCoeffs(terms: number = -1): { x: FourierSeriesCoeffs, y: FourierSeriesCoeffs; } {
    return {
      x: {
        const: this.coeffs.x.const,
        cos: this.coeffs.x.cos.slice(0, terms == -1 ? this.n : terms),
        sin: this.coeffs.x.sin.slice(0, terms == -1 ? this.n : terms)
      },
      y: {
        const: this.coeffs.y.const,
        cos: this.coeffs.y.cos.slice(0, terms == -1 ? this.n : terms),
        sin: this.coeffs.y.sin.slice(0, terms == -1 ? this.n : terms)
      }
    };
  }

  /**
   * Helper method for getFunc, generates a function which
   * evaluates a one dimensional Fourier Series
   */
  protected _sumTermsFunc(coeffs: FourierSeriesCoeffs, terms: number): (t: number) => number {
    return (t) => {
      let res = 0;
      res += coeffs.const;
      for (let i = 0; i < (terms == -1 ? this.n : terms); i++) {
        res += coeffs.cos[i] * utils.cos((i + 1) * t);
        res += coeffs.sin[i] * utils.sin((i + 1) * t);
      }
      return res;
    };
  }

  /**
   * Returns functions for the Fourier Series
   * 
   * @param terms - number of terms to return, -1 to return all
   */
  getFunc(terms: number = -1): { x: (t: number) => number, y: (t: number) => number; } {
    return {
      x: this._sumTermsFunc(this.coeffs.x, terms),
      y: this._sumTermsFunc(this.coeffs.y, terms)
    };
  }

  /**
   * Approximates the integral of a TWO_PI-periodic function
   * given time and value data
   * 
   * @param T - time data
   * @param F - value data
   * @returns The value of the integral
   * 
   */
  static approxInt(T: number[], F: number[]): number {
    let result: number = 0;

    for (let i = 1; i < T.length; i++) {
      const dt = utils.mod(T[i] - T[i - 1], utils.TWO_PI);
      const f = (F[i] + F[i - 1]) / 2;
      result += f * dt;
    }
    const dt = utils.mod(T[0] - T[T.length - 1], utils.TWO_PI);
    const f = (F[0] + F[T.length - 1]) / 2;
    result += f * dt;

    return result;
  }

  /**
   * One dimensional Fourier Series
   * 
   * @param T - time data
   * @param X - position data
   * @returns The coefficients of the Fourier Series
   */
  protected _oneDimFS(T: number[], X: number[]): FourierSeriesCoeffs {
    const result: FourierSeriesCoeffs = { const: 0, cos: [], sin: [] };

    result.const = FourierSeries.approxInt(T, X) / utils.TWO_PI;

    for (let n = 1; n <= this.n; n++) {
      const cosF: number[] = [];
      const sinF: number[] = [];
      T.forEach((val, ind) => {
        cosF.push(X[ind] * utils.cos(n * val));
        sinF.push(X[ind] * utils.sin(n * val));
      });
      result.cos.push(
        FourierSeries.approxInt(T, cosF) / utils.PI
      );
      result.sin.push(
        FourierSeries.approxInt(T, sinF) / utils.PI
      );
    }


    return result;
  }

}
