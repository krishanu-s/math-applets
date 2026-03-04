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
export function factorial(n) {
    if (n === 0 || n === 1) {
        return 1;
    }
    else {
        return n * factorial(n - 1);
    }
}
// The Legendre polynomial P_l(x), defined by its recurrence relation.
// TODO Make this into a memoized function to improve performance.
export function legendre_polynomial(l, x) {
    if (l === 0) {
        return 1;
    }
    else if (l === 1) {
        return x;
    }
    else {
        return (((2 * l - 1) * x * legendre_polynomial(l - 1, x) -
            (l - 1) * legendre_polynomial(l - 2, x)) /
            l);
    }
}
// Calculates the coefficients of the Legendre polynomials P_0, P_1, ..., P_l, each as a list of numbers.
export function calculate_legendre_polynomial_coefficients(l) {
    let result = {};
    result[0] = [1];
    result[1] = [0, 1];
    let last_coefficients;
    let last_last_coefficients;
    for (let i = 2; i <= l; i++) {
        last_coefficients = result[i - 1];
        last_last_coefficients = result[i - 2];
        let coefficients = [0];
        for (let j = 0; j <= i - 1; j++) {
            coefficients.push((2 * i - 1) * last_coefficients[j]);
        }
        for (let j = 0; j <= i - 2; j++) {
            coefficients[j] =
                coefficients[j] -
                    (i - 1) * last_last_coefficients[j];
        }
        for (let j = 0; j <= i; j++) {
            coefficients[j] = coefficients[j] / i;
        }
        result[i] = coefficients;
    }
    return result;
}
// Given a polynomial's coefficients as a list, evaluates the polynomial at a given value.
export function evaluate_polynomial(coefficients, x) {
    let result = 0;
    for (let i = 0; i < coefficients.length; i++) {
        result += coefficients[i] * Math.pow(x, i);
    }
    return result;
}
// The Legendre function P_l^m(x), defined by its recurrence relation on l.
// When m = 0, it reduces to the Legendre polynomial P_l(x).
export function legendre_function(l, m, x) {
    if (l > 1) {
        return (((2 * l - 1) * x * legendre_function(l - 1, m, x) -
            (l + m - 1) * legendre_function(l - 2, m, x)) /
            (l - m));
    }
    else {
        if (l == 0 && m == 0) {
            return 1;
        }
        else if (l == 1 && m == 1) {
            return -Math.sqrt(1 - Math.pow(x, 2));
        }
        else if (l == 1 && m == 0) {
            return x;
        }
        else if (l == 1 && m == -1) {
            return 0.5 * Math.sqrt(1 - Math.pow(x, 2));
        }
        else {
            return 0;
        }
    }
}
// The spherical harmonic Y_{l}^{0}(θ).
export function spherical_harmonic_0(l, theta) {
    const sqrt = Math.sqrt;
    const cos = Math.cos;
    const factor = sqrt((2 * l + 1) / (4 * Math.PI));
    return factor * legendre_polynomial(l, cos(theta));
}
// The spherical harmonic Y_{l}^{m}(θ, φ).
// TODO
export function spherical_harmonic(l, m, theta, phi) {
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
    constructor() {
        // A finite list of coefficients representing the degree 0, 1, ..., n-1 parts.
        this.coefficients = {};
        // Pre-computed and stored Legendre polynomials up to a given degree
        this.legendrePolynomials = {};
        this.max_degree = 0;
    }
    // Resets to zero.
    clear() {
        this.coefficients = {};
    }
    // Generates and stores the coefficients for the legendre polynomials up to a given degree.
    _precompute_legendrePolynomials(degree) {
        this.max_degree = degree;
        this.legendrePolynomials =
            calculate_legendre_polynomial_coefficients(degree);
    }
    _get_legendrePolynomials(degree) {
        if (degree > this.max_degree) {
            this._precompute_legendrePolynomials(degree);
        }
        return this.legendrePolynomials[degree];
    }
    _eval_spherical_harmonic(l, theta) {
        return (Math.sqrt((2 * l + 1) / (4 * Math.PI)) *
            evaluate_polynomial(this._get_legendrePolynomials(l), Math.cos(theta)));
    }
    // Sets/gets the coefficient for a given degree.
    set_coefficient(degree, coefficient) {
        if (degree > this.max_degree) {
            throw new Error("Degree exceeds maximum");
        }
        this.coefficients[degree] = coefficient;
    }
    get_coefficient(degree) {
        return this.coefficients[degree] || 0;
    }
    // Evolves this function f under the heat equation f' = -Δf
    evolve_heat_eq(time) {
        const newCoefficients = {};
        let d;
        Object.entries(this.coefficients).forEach(([degree, coeff]) => {
            d = Number(degree);
            newCoefficients[d] = coeff * Math.exp(-d * (d + 1) * time);
        });
        this.coefficients = newCoefficients;
    }
    // Evaluates the function at a point on the sphere efficiently, by using the precomputed legendre polynomials.
    evaluate(theta, phi) {
        let result = 0;
        Object.entries(this.coefficients).forEach(([degree, coeff]) => {
            result += coeff * this._eval_spherical_harmonic(Number(degree), theta);
        });
        return result;
    }
    // Outputs an array of shape (m, n) containing the function values at
    // θ = π/2m, 3π/2m, 5π/2m, ..., (2m+1)π/2m and
    // φ = π/n, 3π/n, 5π/n, ..., (2n+1)π/n.
    get_drawable(num_theta, num_phi) {
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
//# sourceMappingURL=spherical_harmonics.js.map