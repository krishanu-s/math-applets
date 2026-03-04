export declare function factorial(n: number): number;
export declare function legendre_polynomial(l: number, x: number): number;
export declare function calculate_legendre_polynomial_coefficients(l: number): Record<number, number[]>;
export declare function evaluate_polynomial(coefficients: number[], x: number): number;
export declare function legendre_function(l: number, m: number, x: number): number;
export declare function spherical_harmonic_0(l: number, theta: number): number;
export declare function spherical_harmonic(l: number, m: number, theta: number, phi: number): number;
export declare class SphericalFunctionZeroOrder {
    coefficients: Record<number, number>;
    legendrePolynomials: Record<number, number[]>;
    max_degree: number;
    constructor();
    clear(): void;
    _precompute_legendrePolynomials(degree: number): void;
    _get_legendrePolynomials(degree: number): number[];
    _eval_spherical_harmonic(l: number, theta: number): number;
    set_coefficient(degree: number, coefficient: number): void;
    get_coefficient(degree: number): number;
    evolve_heat_eq(time: number): void;
    evaluate(theta: number, phi: number): number;
    get_drawable(num_theta: number, num_phi: number): Array<number>;
}
//# sourceMappingURL=spherical_harmonics.d.ts.map