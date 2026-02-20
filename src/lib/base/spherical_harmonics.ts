// Spherical harmonics are a set of complex-valued functions defined on the surface of a sphere.
//
// They are orthonormal, meaning that for any two spherical harmonics f and g, the integral of
// \overline{f} * g over the surface of the sphere is equal to 1 if f = g, and 0 otherwise.
//
// They are parametrized by pairs of integers (l, m) where l ≥ 0 and -l ≤ m ≤ l.
// l is called the *degree* and m is called the *order*.
//
// They are eigenfunctions of the Laplace-Beltrami operator on the sphere, where
// L(Y_l^m) = -l(l+1) * Y_l^m
//
// They are represented here in spherical coordinates (θ, φ) where θ ∈ [0, π] and φ ∈ [0, 2π].

import { SphericalDrawable } from "../simulator/statesim";

export function factorial(n: number): number {
  if (n === 0 || n === 1) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}

// The Legendre polynomial P_l(x), defined by its recurrence relation.
// TODO Make this into a memoized function to improve performance.
export function legendre_polynomial(l: number, x: number): number {
  if (l === 0) {
    return 1;
  } else if (l === 1) {
    return x;
  } else {
    return (
      ((2 * l - 1) * x * legendre_polynomial(l - 1, x) -
        (l - 1) * legendre_polynomial(l - 2, x)) /
      l
    );
  }
}

// Calculates the coefficients of the Legendre polynomials P_0, P_1, ..., P_l, each as a list of numbers.
export function calculate_legendre_polynomial_coefficients(
  l: number,
): Record<number, number[]> {
  let result: Record<number, number[]> = {};
  result[0] = [1];
  result[1] = [0, 1];
  let last_coefficients: number[];
  let last_last_coefficients: number[];
  for (let i = 2; i <= l; i++) {
    last_coefficients = result[i - 1] as number[];
    last_last_coefficients = result[i - 2] as number[];
    let coefficients = [0];
    for (let j = 0; j <= i - 1; j++) {
      coefficients.push((2 * i - 1) * (last_coefficients[j] as number));
    }
    for (let j = 0; j <= i - 2; j++) {
      coefficients[j] =
        (coefficients[j] as number) -
        (i - 1) * (last_last_coefficients[j] as number);
    }
    for (let j = 0; j <= i; j++) {
      coefficients[j] = (coefficients[j] as number) / i;
    }
    result[i] = coefficients;
  }
  return result;
}

// Given a polynomial's coefficients as a list, evaluates the polynomial at a given value.
export function evaluate_polynomial(coefficients: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < coefficients.length; i++) {
    result += (coefficients[i] as number) * Math.pow(x, i);
  }
  return result;
}

// The Legendre function P_l^m(x), defined by its recurrence relation on l.
// When m = 0, it reduces to the Legendre polynomial P_l(x).
export function legendre_function(l: number, m: number, x: number): number {
  if (l > 1) {
    return (
      ((2 * l - 1) * x * legendre_function(l - 1, m, x) -
        (l + m - 1) * legendre_function(l - 2, m, x)) /
      (l - m)
    );
  } else {
    if (l == 0 && m == 0) {
      return 1;
    } else if (l == 1 && m == 1) {
      return -Math.sqrt(1 - Math.pow(x, 2));
    } else if (l == 1 && m == 0) {
      return x;
    } else if (l == 1 && m == -1) {
      return 0.5 * Math.sqrt(1 - Math.pow(x, 2));
    } else {
      return 0;
    }
  }
}

// The spherical harmonic Y_{l}^{0}(θ).
export function spherical_harmonic_0(l: number, theta: number): number {
  const sqrt = Math.sqrt;
  const cos = Math.cos;
  const factor = sqrt((2 * l + 1) / (4 * Math.PI));
  return factor * legendre_polynomial(l, cos(theta));
}

// The spherical harmonic Y_{l}^{m}(θ, φ).
// TODO
export function spherical_harmonic(
  l: number,
  m: number,
  theta: number,
  phi: number,
): number {
  const sqrt = Math.sqrt;
  const cos = Math.cos;
  const sin = Math.sin;

  const sqrtFactor = sqrt((2 * l + 1) / (4 * Math.PI));
  const legendre = legendre_function(l, m, cos(theta));
  const phase = sqrtFactor * cos(m * phi) * legendre;
  const factor = sqrt((2 * l + 1) / (4 * Math.PI)) * cos(m * phi) * legendre;

  return factor;
}

// A function on the sphere, expressible as a linear combination of spherical harmonics with order zero.
// TODO Make a method which outputs an array of size (num_theta, num_phi).
export class SphericalFunctionZeroOrder {
  // A finite list of coefficients representing the degree 0, 1, ..., n-1 parts.
  coefficients: Record<number, number> = {};
  // Pre-computed and stored Legendre polynomials up to a given degree
  legendrePolynomials: Record<number, number[]> = {};
  max_degree: number = 0;
  constructor() {}
  // Resets to zero.
  clear() {
    this.coefficients = {};
  }
  // Generates and stores the coefficients for the legendre polynomials up to a given degree.
  _precompute_legendrePolynomials(degree: number) {
    this.max_degree = degree;
    this.legendrePolynomials =
      calculate_legendre_polynomial_coefficients(degree);
  }
  _get_legendrePolynomials(degree: number): number[] {
    if (degree > this.max_degree) {
      this._precompute_legendrePolynomials(degree);
    }
    return this.legendrePolynomials[degree] as number[];
  }
  _eval_spherical_harmonic(l: number, theta: number): number {
    return (
      Math.sqrt((2 * l + 1) / (4 * Math.PI)) *
      evaluate_polynomial(this._get_legendrePolynomials(l), Math.cos(theta))
    );
  }
  // Sets/gets the coefficient for a given degree.
  set_coefficient(degree: number, coefficient: number) {
    if (degree > this.max_degree) {
      throw new Error("Degree exceeds maximum");
    }
    this.coefficients[degree] = coefficient;
  }
  get_coefficient(degree: number): number {
    return this.coefficients[degree] || 0;
  }
  // Evolves this function f under the heat equation f' = -Δf
  evolve_heat_eq(time: number): void {
    const newCoefficients: Record<number, number> = {};
    let d: number;
    Object.entries(this.coefficients).forEach(([degree, coeff]) => {
      d = Number(degree);
      newCoefficients[d] = coeff * Math.exp(-d * (d + 1) * time);
    });
    this.coefficients = newCoefficients;
  }
  // Evaluates the function at a point on the sphere efficiently, by using the precomputed legendre polynomials.
  evaluate(theta: number, phi: number): number {
    let result = 0;
    Object.entries(this.coefficients).forEach(([degree, coeff]) => {
      result += coeff * this._eval_spherical_harmonic(Number(degree), theta);
    });
    return result;
  }
  // Outputs an array of shape (m, n) containing the function values at
  // θ = π/2m, 3π/2m, 5π/2m, ..., (2m+1)π/2m and
  // φ = π/n, 3π/n, 5π/n, ..., (2n+1)π/n.
  get_drawable(num_theta: number, num_phi: number): Array<number> {
    let result = new Array(num_theta * num_phi);
    let theta = Math.PI / (2 * num_theta);
    let phi = Math.PI / num_phi;
    let ind = 0;
    for (let j = 0; j < num_phi; j++) {
      for (let i = 0; i < num_theta; i++) {
        result[ind] = this.evaluate(theta * (2 * i + 1), phi * (2 * j + 1));
        ind++;
      }
    }
    return result;
  }
}
